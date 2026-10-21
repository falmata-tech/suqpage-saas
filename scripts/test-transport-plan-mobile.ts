import assert from 'node:assert/strict';
import {test} from 'node:test';
import {handleMobileRequest} from '../lib/mobile/router';
import {TransportPlanError,type TransportPlan,type SharedTransportPlan} from '../lib/transport-plan-contract';
import type {NativeIdentityPort} from '../lib/mobile/http';
// The Next environment augmentation marks NODE_ENV readonly for application code;
// this test deliberately restores its process-local CORS mode after each case.
const env:Record<string,string|undefined>=process.env;
const token='a'.repeat(64),etag='"transport-plan-1"';
const plan:TransportPlan={version:1,legs:[{id:'e05646d4-2707-4a21-90ab-476f4605ffca',providerName:'Literal provider',origin:'Origin',destination:'Destination',method:'air'}]};
const fixture=()=>{
 const calls:Array<{token:unknown;etag:unknown}>=[];let identityCalls=0,allowed=true,mode:'plan'|'missing'|'failure'='plan';
 const identity:NativeIdentityPort={verify:async()=>{identityCalls++;throw Error('Identity must never receive a plan capability');},linked:async()=>null,user:async()=>null};
 const deps={identity,transportPlan:{read:async(value:unknown,condition?:unknown):Promise<SharedTransportPlan>=>{calls.push({token:value,etag:condition});if(mode==='missing')throw new TransportPlanError('Transport plan was not found.','not_found');if(mode==='failure')throw Error('PRIVATE fixture failure');return condition===etag?{kind:'not_modified',etag}:{kind:'plan',etag,plan};},allow:async()=>allowed}};
 const request=(method='GET',headers:Record<string,string>={},suffix='',origin='http://localhost:8082',path=['transport-plan'])=>handleMobileRequest(new Request('http://127.0.0.1:3102/api/mobile/v1/'+path.join('/')+suffix,{method,headers:{origin,authorization:'Bearer '+token,...headers}}),path,deps);
 return{calls,get identityCalls(){return identityCalls;},setAllowed(value:boolean){allowed=value;},setMode(value:typeof mode){mode=value;},request};
};
test('BE-057 mobile shared plan bypasses JWT identity with exact conditional capability reads and private CORS',async()=>{
 const previous=env.NODE_ENV;env.NODE_ENV='development';
 try{
  const f=fixture();let response=await f.request();assert.equal(response.status,200);assert.deepEqual(await response.json(),plan);assert.equal(response.headers.get('etag'),etag);
  assert.equal(response.headers.get('access-control-allow-origin'),'http://localhost:8082');assert.equal(response.headers.get('access-control-allow-methods'),'GET, HEAD, OPTIONS');assert.match(response.headers.get('access-control-allow-headers')||'',/If-None-Match/);assert.equal(response.headers.get('access-control-expose-headers'),'ETag');assert.match(response.headers.get('vary')||'',/Authorization/);assert.match(response.headers.get('vary')||'',/Origin/);assert.match(response.headers.get('cache-control')||'',/private.*no-store/);assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.match(response.headers.get('x-robots-tag')||'',/noindex/);
  response=await f.request('GET',{'if-none-match':etag});assert.equal(response.status,304);assert.equal(await response.text(),'');assert.deepEqual(f.calls.at(-1),{token,etag});
  response=await f.request('HEAD');assert.equal(response.status,200);assert.equal(await response.text(),'');response=await f.request('HEAD',{'if-none-match':etag});assert.equal(response.status,304);assert.equal(await response.text(),'');
  assert.equal(f.identityCalls,0);assert.equal(response.headers.has('set-cookie'),false);
 }finally{if(previous===undefined)delete env.NODE_ENV;else env.NODE_ENV=previous;}
});
test('BE-057 mobile shared plan rejects guest/JWT/query fallback, revoked links and public writes without side effects',async()=>{
 const previous=env.NODE_ENV;env.NODE_ENV='development';
 try{
  const f=fixture();const invalidHeaders:Array<Record<string,string>>=[{authorization:''},{authorization:'Bearer jwt.payload.signature'},{authorization:'',cookie:'suqpage_public_transport='+token,'X-Suqpage-Buying-Session':token}];for(const headers of invalidHeaders)assert.equal((await f.request('GET',headers)).status,404);
  assert.equal((await f.request('GET',{},'?token='+token)).status,404);assert.equal(f.calls.length,0);
  for(const method of['POST','PATCH','PUT','DELETE']){const response=await f.request(method);assert.equal(response.status,405);assert.equal(response.headers.get('allow'),'GET, HEAD');}assert.equal(f.calls.length,0);
  f.setMode('missing');let response=await f.request('GET',{'if-none-match':etag});assert.equal(response.status,404);assert.match(await response.text(),/not_found/);
  response=await f.request('HEAD');assert.equal(response.status,404);assert.equal(await response.text(),'');
  f.setMode('failure');response=await f.request();assert.equal(response.status,503);assert.ok(!(await response.text()).includes('PRIVATE'));
  f.setAllowed(false);response=await f.request();assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'60');assert.equal(f.identityCalls,0);
 }finally{if(previous===undefined)delete env.NODE_ENV;else env.NODE_ENV=previous;}
});
test('BE-044 mobile conditional CORS is limited to the exact plan route and existing development origins',async()=>{
 const previous=env.NODE_ENV;env.NODE_ENV='development';
 try{
  const f=fixture();let response=await f.request('OPTIONS');assert.equal(response.status,204);assert.equal(response.headers.get('access-control-expose-headers'),'ETag');assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  response=await f.request('OPTIONS',{},'','http://localhost:8082',['health']);assert.equal(response.status,204);assert.equal(response.headers.has('access-control-expose-headers'),false);assert.ok(!(response.headers.get('access-control-allow-headers')||'').includes('If-None-Match'));assert.equal(response.headers.get('access-control-allow-methods'),'GET, POST, OPTIONS');
  for(const origin of['https://foreign.example','http://localhost:8083']){response=await f.request('GET',{},'',origin);assert.equal(response.status,403);assert.equal(response.headers.has('access-control-allow-origin'),false);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');}
  response=await f.request('HEAD',{},'','https://foreign.example');assert.equal(response.status,403);assert.equal(await response.text(),'');assert.equal(response.headers.get('cache-control'),'private, no-store');
  env.NODE_ENV='production';response=await f.request('GET');assert.equal(response.status,403);assert.equal(response.headers.has('access-control-allow-origin'),false);assert.equal(f.calls.length,0);assert.equal(f.identityCalls,0);
 }finally{if(previous===undefined)delete env.NODE_ENV;else env.NODE_ENV=previous;}
});
