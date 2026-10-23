import assert from 'node:assert/strict';
import {test} from 'node:test';
import {handlePartnerInterest,type PartnerInterestHttpPort} from '../lib/transport-partner-http';
import {PartnerInterestError} from '../lib/transport-partner-interest';
let calls=0;const port:PartnerInterestHttpPort={submit:async()=>{calls++;return{reference:'PI-0123456789AB'};}};
const request=(body:string,headers:Record<string,string>={})=>new Request('http://127.0.0.1:3102/api/transport-partners',{method:'POST',headers:{'Content-Type':'application/json',...headers},body});
test('bounded public partner HTTP rejects malformed, declared and streamed oversize before persistence',async()=>{
 for(const [req,status]of [[request('{'),400],[request('{}',{'Content-Length':'24577'}),413],[request('x'.repeat(24577)),413],[request('{}',{'Content-Type':'text/plain'}),415],[new Request('http://fixture.test'),405]]as const)assert.equal((await handlePartnerInterest(req,'ip',port)).status,status);
 assert.equal(calls,0);
});
test('durable receipt does not claim approval, email delivery or operating-account creation',async()=>{
 const result=await handlePartnerInterest(request('{}'),'ip',port);assert.equal(result.status,202);assert.equal(result.headers.get('Cache-Control'),'private, no-store');assert.deepEqual(await result.json(),{reference:'PI-0123456789AB',status:'received'});
});
test('conflict/rate/unavailable map to explicit safe failures and never leak thrown private content',async()=>{
 for(const[error,status]of [[new PartnerInterestError('conflict'),409],[new PartnerInterestError('rate_limited',60),429],[new PartnerInterestError('invalid'),400],[new PartnerInterestError('unavailable'),503],[Error('private-token-secret'),503]]as const){
  const result=await handlePartnerInterest(request('{}'),'ip',{submit:async()=>{throw error;}});assert.equal(result.status,status);assert.ok(!(await result.text()).includes('private-token-secret'));if(status===429)assert.equal(result.headers.get('Retry-After'),'60');
 }
});

test('web and native request adapters deny foreign origins before application persistence',async()=>{
 const {POST}=await import('../app/api/transport-partners/route');
 const {handleMobileRequest}=await import('../lib/mobile/router');
 const foreign=request('{}',{Origin:'https://foreign.example.test'});
 assert.equal((await POST(foreign)).status,403);
 const mobile=new Request('http://127.0.0.1:3102/api/mobile/v1/transport-partners',{method:'POST',headers:{Origin:'https://foreign.example.test','Content-Type':'application/json'},body:'{}'});
 let submitted=false;const result=await handleMobileRequest(mobile,['transport-partners'],{partnerInterest:{submit:async()=>{submitted=true;return{reference:'PI-0123456789AB'};}}});
 assert.equal(result.status,403);assert.equal(submitted,false);
});
