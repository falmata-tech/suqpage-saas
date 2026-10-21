import assert from 'node:assert/strict';import {test} from 'node:test';
import {browserJson} from '../lib/browser-json';
test('FE-056 cover HTTP acknowledges responses and never retries writes implicitly',async()=>{
 let calls=0;
 const send:typeof fetch=async()=>{calls++;return Response.json({error:'Reload before saving.'},{status:409});};
 assert.deepEqual(await browserJson('/owned-cover',{method:'POST'},{send}),{ok:false,body:{error:'Reload before saving.'}});assert.equal(calls,1);
 for(const value of [null,[],false,'bad'])await assert.rejects(browserJson('/owned-cover',{},{send:async()=>Response.json(value)}),/^Error: Unable to connect/);
});
test('FE-056 a stalled cover request is aborted and reported safely',async()=>{
 let calls=0,aborted=false;
 const send:typeof fetch=async(_url,init)=>{calls++;return new Promise((_resolve,reject)=>init!.signal!.addEventListener('abort',()=>{aborted=true;reject(Error('private transport details'));}));};
 await assert.rejects(browserJson('/owned-cover',{method:'POST'},{send,timeoutMs:5}),/^Error: Unable to connect\. Please try again\.$/);assert.equal(calls,1);assert.equal(aborted,true);
});
test('FE-056 timeout also bounds response body decoding',async()=>{
 const send:typeof fetch=async(_url,init)=>new Response(new ReadableStream({start(stream){init!.signal!.addEventListener('abort',()=>stream.error(Error('private body failure')));}}));
 await assert.rejects(browserJson('/owned-cover',{method:'POST'},{send,timeoutMs:5}),/^Error: Unable to connect\. Please try again\.$/);
});
