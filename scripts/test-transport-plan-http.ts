import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {createTransportPlanHttpHandler} from '../lib/transport-plan-http';
import {TransportPlanError,type SharedTransportPlan,type TransportPlan} from '../lib/transport-plan-contract';

const token='a'.repeat(64),revoked='b'.repeat(64),etag='"transport-plan-3"';
const plan:TransportPlan={version:3,legs:[{id:'00000000-0000-4000-8000-000000000001',providerName:'Literal provider',method:'truck',origin:'Place A',destination:'Place B'}]};
function request(method='GET',authorization:string|null='Bearer '+token,suffix='',headers:Record<string,string>={}){
 return new Request('https://suqpage.test/api/transport-plan'+suffix,{method,headers:{...(authorization===null?{}:{Authorization:authorization}),...headers}});
}
function privateResponse(response:Response){
 assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow, noarchive');assert.equal(response.headers.get('vary'),'Authorization');assert.equal(response.headers.get('set-cookie'),null);
}

test('BE-057 shared HTTP reads require exact header-only capability; missing/malformed/revoked requests share404 without session fallback',async()=>{
 const reads:Array<{capability:unknown;conditional:unknown}>=[],allows:string[]=[];
 const handler=createTransportPlanHttpHandler({allow:async req=>{allows.push(req.method);return true;},read:async(capability,conditional)=>{
  reads.push({capability,conditional});if(capability===revoked)throw new TransportPlanError('An internal lookup detail must not differ.','not_found');return{kind:'plan',etag,plan};
 }});
 let expected='';
 const invalid:[string|null,string,Record<string,string>?][]=[
  [null,''],['',''],['bearer '+token,''],['Bearer '+token.toUpperCase(),''],['Bearer '+token+' suffix',''],['Bearer '+token.slice(1),''],['Bearer guest-chat-token',''],['Bearer '+token+', Bearer '+token,''],
  ['Bearer '+token,'?capability='+token],['Bearer '+token,'?anything=1'],[null,'',{Cookie:'signedIn=irrelevant; guest=irrelevant'}],['Bearer '+revoked,'',{'If-None-Match':etag}],
 ];
 for(const[authorization,suffix,headers]of invalid){const response=await handler(request('GET',authorization,suffix,headers));privateResponse(response);assert.equal(response.status,404);const text=await response.text();expected||=text;assert.equal(text,expected);assert.ok(!text.includes(token)&&!text.includes(revoked));}
 assert.equal(allows.length,invalid.length,'Invalid attempts are included in the private caller limit');assert.equal(reads.length,1,'Malformed/headerless/query requests never reach capability lookup');assert.equal(reads[0].capability,revoked);assert.equal(reads[0].conditional,etag);
});

test('BE-057 GET/HEAD return only the public DTO; conditional304 goes through authorized read and revoked conditional requests remain404',async()=>{
 let valid=true;const calls:Array<{capability:unknown;conditional:unknown}>=[];
 const handler=createTransportPlanHttpHandler({read:async(capability,conditional)=>{
  calls.push({capability,conditional});if(!valid)throw new TransportPlanError('Transport plan was not found.','not_found');
  return conditional===etag?{kind:'not_modified',etag}:{kind:'plan',etag,plan:{...plan,privateContact:'must not serialize'} as TransportPlan};
 }});
 const full=await handler(request());privateResponse(full);assert.equal(full.status,200);assert.equal(full.headers.get('etag'),etag);assert.deepEqual(await full.json(),plan);
 const head=await handler(request('HEAD'));privateResponse(head);assert.equal(head.status,200);assert.equal(head.headers.get('etag'),etag);assert.equal(await head.text(),'');
 for(const method of['GET','HEAD']){const unchanged=await handler(request(method,'Bearer '+token,'',{'If-None-Match':etag}));privateResponse(unchanged);assert.equal(unchanged.status,304);assert.equal(unchanged.headers.get('etag'),etag);assert.equal(await unchanged.text(),'');}
 valid=false;for(const conditional of[etag,'*']){const missing=await handler(request('GET','Bearer '+token,'',{'If-None-Match':conditional}));assert.equal(missing.status,404);privateResponse(missing);assert.equal(missing.headers.get('etag'),null);}
 const missingHead=await handler(request('HEAD'));assert.equal(missingHead.status,404);assert.equal(await missingHead.text(),'');
 assert.equal(calls.length,7,'Every conditional/HEAD request still calls the capability authority');
});

test('BE-057 public HTTP rejects mutation methods, isolates rate failures and redacts unknown provider/database errors on every response',async()=>{
 let reads=0,allows=0,allowed=true,fail:Error|null=null;
 const handler=createTransportPlanHttpHandler({allow:async()=>{allows++;if(fail)throw fail;return allowed;},read:async()=>{reads++;return{kind:'plan',etag,plan};}});
 for(const method of['POST','PUT','PATCH','DELETE','OPTIONS']){const response=await handler(request(method));assert.equal(response.status,405);assert.equal(response.headers.get('allow'),'GET, HEAD');privateResponse(response);}
 assert.equal(allows,0);assert.equal(reads,0);
 allowed=false;for(const method of['GET','HEAD']){const response=await handler(request(method));assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'60');privateResponse(response);if(method==='HEAD')assert.equal(await response.text(),'');}assert.equal(reads,0);
 fail=Error('private database connection and credentials');for(const method of['GET','HEAD']){const response=await handler(request(method));assert.equal(response.status,503);privateResponse(response);const text=await response.text();assert.ok(!text.includes('private')&&!text.includes('credentials'));if(method==='HEAD')assert.equal(text,'');}
 const failing=createTransportPlanHttpHandler({read:async()=>{throw Error('private token '+token);}});const failure=await failing(request());assert.equal(failure.status,503);privateResponse(failure);assert.deepEqual(await failure.json(),{error:'Unable to connect. Please try again.',code:'unavailable'});
 for(const[code,status]of[['forbidden',403],['conflict',409],['invalid_request',400]]as const){const response=await createTransportPlanHttpHandler({read:async()=>{throw new TransportPlanError('Check the transport plan.',code);}})(request());assert.equal(response.status,status);privateResponse(response);assert.equal((await response.json()).error,'Check the transport plan.');}
 // Intentionally violate the typed application port to verify runtime allowlisting.
 const extraField=createTransportPlanHttpHandler({read:async()=>({kind:'plan',etag,plan:{...plan,legs:[{...plan.legs[0],privateContact:'never share'}]}}as unknown as SharedTransportPlan)});const rejected=await extraField(request());assert.equal(rejected.status,400);assert.ok(!(await rejected.text()).includes('never share'),'Private leg additions fail closed');
});

test('BE-058 S144 retired case-plan route returns private404 without reading legacy data, retains600/min private-IP limit and denies mutations',async()=>{
 const state={allows:[] as Array<unknown[]>,hashes:[] as string[],reads:[] as Array<unknown[]>,allowed:true};
 const require=createRequire(import.meta.url);
 const output=await build({entryPoints:['app/api/transport-plan/route.ts'],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',plugins:[{name:'plan-http-route-ports',setup(b){
  b.onResolve({filter:/^@\/lib\/(?:transport-plan|rate-limit-runtime|security)$/},a=>({path:a.path,external:true}));
 }}]});
 const ports:Record<string,unknown>={
  '@/lib/transport-plan':{readSharedTransportPlan:async(...input:unknown[])=>{state.reads.push(input);return{kind:'plan',etag,plan};}},
  '@/lib/rate-limit-runtime':{consumeRuntimeRateLimit:async(...input:unknown[])=>{state.allows.push(input);return{allowed:state.allowed};}},
  '@/lib/security':{requestIpFromHeaders:(headers:Headers)=>headers.get('x-test-client')||'unknown',hashPrivateValue:(input:string)=>{state.hashes.push(input);return'private-ip-hash';}},
 };
 type Handler=(request:Request)=>Promise<Response>;
 const module={exports:{}as Record<'GET'|'HEAD'|'POST'|'PUT'|'PATCH'|'DELETE'|'OPTIONS',Handler>};
 vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,require:(name:string)=>ports[name]||require(name),Request,Response,Headers,URL,JSON,Number,Set});
 for(const method of['GET','HEAD']as const){const response=await module.exports[method](request(method,'Bearer '+token,'',{'X-Test-Client':'203.0.113.42'}));assert.equal(response.status,404);privateResponse(response);assert.equal(response.headers.get('etag'),null);if(method==='HEAD')assert.equal(await response.text(),'');}
 assert.deepEqual(JSON.parse(JSON.stringify(state.allows)),[['transport-plan:private-ip-hash',600,60000],['transport-plan:private-ip-hash',600,60000]]);assert.deepEqual(state.hashes,['203.0.113.42','203.0.113.42']);assert.equal(state.reads.length,0);assert.ok(!JSON.stringify(state.allows).includes(token)&&!JSON.stringify(state.allows).includes('203.0.113.42'));
 state.allowed=false;const denied=await module.exports.GET(request());assert.equal(denied.status,429);assert.equal(state.reads.length,0);
 for(const method of['POST','PUT','PATCH','DELETE','OPTIONS']as const){const response=await module.exports[method](request(method));assert.equal(response.status,405);privateResponse(response);}assert.equal(state.allows.length,3);
});

test('DEP-047 configured page and both plan APIs override global privacy headers before the installed Next response adapter can shadow route headers',async()=>{
 const require=createRequire(import.meta.url);
 type HeaderRule={source:string;headers:Array<{key:string;value:string}>};
 const output=await build({entryPoints:['next.config.ts'],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',plugins:[{name:'plan-next-config-ports',setup(b){
  b.onResolve({filter:/^(?:next-intl\/plugin|\.\/lib\/(?:platform-assets|platform-environment\.mjs|trusted-origins))$/},a=>({path:a.path,external:true}));
 }}]});
 const ports:Record<string,unknown>={
  'next-intl/plugin':()=>((config:unknown)=>config),
  './lib/platform-assets':{platformAssetRewrites:[]},
  './lib/platform-environment.mjs':{platformEnvironment:()=>({})},
  './lib/trusted-origins':{trustedOriginPolicy:()=>({serverActionHosts:['localhost:3102']})},
 };
 const module={exports:{} as{default:{headers:()=>Promise<HeaderRule[]>}}};
 vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,require:(name:string)=>ports[name]||require(name),process:{env:{NODE_ENV:'production'}}});
 const rules=await module.exports.default.headers();
 const{getPathMatch}=require('next/dist/shared/lib/router/utils/path-match')as{getPathMatch:(source:string)=>(pathname:string)=>false|Record<string,unknown>};
 const configured=(pathname:string)=>{
  const headers=new Headers();for(const rule of rules)if(getPathMatch(rule.source)(pathname))for(const{key,value}of rule.headers)headers.set(key,value);return headers;
 };
 type Outbound={statusCode:number;statusMessage:string;getHeader:(name:string)=>string|undefined;appendHeader:(name:string,value:string)=>void;originalResponse:{end:()=>void}};
 const{sendResponse}=require('next/dist/server/send-response')as{sendResponse:(request:{method:'HEAD'},response:Outbound,body:Response)=>Promise<void>};
 const send=async(headers:Headers)=>{
  let ended=false;
  await sendResponse({method:'HEAD'},{statusCode:200,statusMessage:'OK',getHeader:name=>headers.get(name)||undefined,appendHeader:(name,value)=>headers.append(name,value),originalResponse:{end:()=>{ended=true;}}},new Response(null,{headers:{'Referrer-Policy':'no-referrer'}}));
  assert.equal(ended,true);return headers;
 };
 // This executes the installed adapter's actual pre-existing-header behavior.
 // Handler-only assertions would pass even though this preset wins at runtime.
 const shadowed=await send(new Headers({'Referrer-Policy':'strict-origin-when-cross-origin'}));assert.equal(shadowed.get('referrer-policy'),'strict-origin-when-cross-origin');
 const globalIndex=rules.findIndex(rule=>rule.source==='/(.*)');assert.ok(globalIndex>=0);
 for(const pathname of['/transport-plan','/api/transport-plan','/api/mobile/v1/transport-plan']){
  const exact=rules.findIndex(rule=>rule.source===pathname);assert.ok(exact>globalIndex,`${pathname} must override the global rule after it`);
  const headers=await send(configured(pathname));assert.equal(headers.get('referrer-policy'),'no-referrer',pathname);assert.equal(headers.get('cache-control'),'private, no-store',pathname);assert.equal(headers.get('x-robots-tag'),'noindex, nofollow, noarchive',pathname);
 }
 for(const pathname of['/about','/api/transport-plan/other','/api/mobile/v1/transport-plan/other'])assert.equal(configured(pathname).get('referrer-policy'),'strict-origin-when-cross-origin','Privacy exception stays limited to the exact plan surfaces');
 // Configuration + installed adapter only: this is not a production HTTP claim.
});
