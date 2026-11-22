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
test('FE-078 retired mobile plan returns 410 without consulting auth or loading a plan',async()=>{
 const previous=env.NODE_ENV;env.NODE_ENV='development';
 try{
  const f=fixture();
  for(const method of ['GET','HEAD','POST','PUT','PATCH','DELETE']){
   const response=await f.request(method,{'if-none-match':etag},'?token='+token);
   assert.equal(response.status,410,method);
   assert.equal(response.headers.get('cache-control'),'private, no-store');
   assert.equal(response.headers.get('referrer-policy'),'no-referrer');
   assert.equal(response.headers.get('access-control-allow-origin'),'http://localhost:8082');
   assert.equal(response.headers.has('set-cookie'),false);
   assert.equal(response.headers.has('etag'),false);
   if(method==='HEAD')assert.equal(await response.text(),'');
   else assert.equal((await response.json()).code,'transport_retired');
  }
  assert.equal(f.identityCalls,0);
  assert.deepEqual(f.calls,[]);
 }finally{if(previous===undefined)delete env.NODE_ENV;else env.NODE_ENV=previous;}
});
test('BE-044 mobile conditional CORS admits only the selected exact development origin',async()=>{
 const previous=env.NODE_ENV,previousPort=env.SUQPAGE_LOCAL_EXPO_PORT;env.NODE_ENV='development';delete env.SUQPAGE_LOCAL_EXPO_PORT;
 try{
  const f=fixture();let response=await f.request('OPTIONS');assert.equal(response.status,204);assert.equal(response.headers.get('access-control-expose-headers'),'ETag');assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  response=await f.request('OPTIONS',{},'','http://localhost:8082',['health']);assert.equal(response.status,204);assert.equal(response.headers.has('access-control-expose-headers'),false);assert.ok(!(response.headers.get('access-control-allow-headers')||'').includes('If-None-Match'));assert.equal(response.headers.get('access-control-allow-methods'),'GET, POST, OPTIONS');
  for(const origin of['https://foreign.example','http://localhost:8083']){response=await f.request('GET',{},'',origin);assert.equal(response.status,403);assert.equal(response.headers.has('access-control-allow-origin'),false);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');}
  response=await f.request('HEAD',{},'','https://foreign.example');assert.equal(response.status,403);assert.equal(await response.text(),'');assert.equal(response.headers.get('cache-control'),'private, no-store');
  env.SUQPAGE_LOCAL_EXPO_PORT='8083';response=await f.request('GET',{},'','http://localhost:8083');assert.equal(response.status,410);assert.equal(response.headers.get('access-control-allow-origin'),'http://localhost:8083');
  response=await f.request('OPTIONS',{},'','http://127.0.0.1:8083');assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-origin'),'http://127.0.0.1:8083');
  for(const origin of['http://localhost:8082','http://foreign.example:8083','https://localhost:8083','http://localhost:80830','http://localhost:8083.evil.test']){response=await f.request('GET',{},'',origin);assert.equal(response.status,403,origin);assert.equal(response.headers.has('access-control-allow-origin'),false,origin);}
  for(const invalidPort of['','8083/evil']){env.SUQPAGE_LOCAL_EXPO_PORT=invalidPort;for(const origin of['http://localhost:8082','http://localhost:8083']){response=await f.request('GET',{},'',origin);assert.equal(response.status,403);assert.equal(response.headers.has('access-control-allow-origin'),false);}}
  env.SUQPAGE_LOCAL_EXPO_PORT='8083';env.NODE_ENV='production';for(const origin of['http://localhost:8082','http://localhost:8083']){response=await f.request('GET',{},'',origin);assert.equal(response.status,403);assert.equal(response.headers.has('access-control-allow-origin'),false);}assert.equal(f.identityCalls,0);
 }finally{if(previous===undefined)delete env.NODE_ENV;else env.NODE_ENV=previous;if(previousPort===undefined)delete env.SUQPAGE_LOCAL_EXPO_PORT;else env.SUQPAGE_LOCAL_EXPO_PORT=previousPort;}
});
