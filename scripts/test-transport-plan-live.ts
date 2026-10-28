import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createTransportPlanLive,createTransportPlanReader,type TransportPlanClock,type TransportPlanReadResult,type TransportPlanLiveState} from '../lib/transport-plan-live';
import type {TransportPlan} from '@africmade/contracts';

const a='a'.repeat(64),b='b'.repeat(64);
const plan=(version=1,name='Literal carrier'):TransportPlan=>({version,legs:[{id:'00000000-0000-4000-8000-000000000001',providerName:name,origin:'Addis Ababa',destination:'Adama',method:'truck'}]});
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(error:Error)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
const settle=()=>new Promise<void>(resolve=>setImmediate(resolve));
function setup(){
 let now=0,id=0;const tasks=new Map<number,{at:number;work:()=>void}>(),changes:TransportPlanLiveState[]=[],calls:Array<{capability:string;etag:string|null;signal:AbortSignal;reply:ReturnType<typeof deferred<TransportPlanReadResult>>}>=[];
 const clock:TransportPlanClock={after(ms,work){const key=++id;tasks.set(key,{at:now+ms,work});return()=>{tasks.delete(key);};}};
 const live=createTransportPlanLive({clock,onChange:value=>changes.push(value),read:(capability,etag,signal)=>{const reply=deferred<TransportPlanReadResult>();calls.push({capability,etag,signal,reply});return reply.promise;}});
 return{live,calls,changes,tasks,nextDelay:()=>Math.min(...[...tasks.values()].map(task=>task.at-now)),advance:async(ms:number)=>{const target=now+ms;while(true){const next=[...tasks].filter(([,task])=>task.at<=target).sort((x,y)=>x[1].at-y[1].at)[0];if(!next)break;now=next[1].at;tasks.delete(next[0]);next[1].work();await settle();}now=target;await settle();}};
}

test('FE-068 public plan HTTP reader uses header-only capability and handles200/304/404 without parsing empty bodies',async()=>{
 const calls:Array<{url:string;init:RequestInit}>=[],responses=[new Response(JSON.stringify(plan()),{status:200,headers:{etag:'"plan-1"'}}),new Response(null,{status:304,headers:{etag:'"plan-1"'}}),new Response(null,{status:404})];
 const send:typeof fetch=async(input,init)=>{calls.push({url:String(input),init:init||{}});return responses.shift()!;};
 const read=createTransportPlanReader('http://127.0.0.1:3102/api/transport-plan',{send}),controller=new AbortController();
 const first=await read(a,null,controller.signal);assert.equal(first.kind,'plan');if(first.kind==='plan')assert.deepEqual(first.plan,plan());
 assert.deepEqual(await read(a,'"plan-1"',controller.signal),{kind:'not_modified',etag:'"plan-1"'});assert.deepEqual(await read(a,'"plan-1"',controller.signal),{kind:'missing'});
 assert.deepEqual(await read('guest-session-token',null,controller.signal),{kind:'missing'});assert.equal(calls.length,3);
 for(const call of calls){assert.equal(call.url,'http://127.0.0.1:3102/api/transport-plan');assert.ok(!call.url.includes(a));assert.equal(call.init.method,'GET');assert.equal(call.init.credentials,'omit');assert.equal(call.init.referrerPolicy,'no-referrer');assert.equal(call.init.redirect,'error');assert.equal(call.init.cache,'no-store');assert.equal(call.init.signal,controller.signal);assert.equal(new Headers(call.init.headers).get('authorization'),'Bearer '+a);assert.ok(!('body'in call.init));}
 assert.equal(new Headers(calls[0].init.headers).get('if-none-match'),null);assert.equal(new Headers(calls[1].init.headers).get('if-none-match'),'"plan-1"');
});

test('FE-068 public plan reader rejects private/invalid payloads instead of rendering them',async()=>{
 for(const value of[{...plan(),phone:'+12025550199'},{...plan(),messages:['private']},{...plan(),legs:[{...plan().legs[0],contact:'private'}]},plan(0),{version:1,legs:[]},{...plan(),legs:[{...plan().legs[0],method:'ship'}]}]){
  const read=createTransportPlanReader('/api/transport-plan',{send:async()=>new Response(JSON.stringify(value),{headers:{etag:'"plan-1"'}})});await assert.rejects(read(a,null,new AbortController().signal));
 }
 const noTag=createTransportPlanReader('/api/transport-plan',{send:async()=>new Response(JSON.stringify(plan()))});await assert.rejects(noTag(a,null,new AbortController().signal));
});

test('FE-068 visible reader is single-flight;304 retains body and hidden/stop aborts all work',async()=>{
 const f=setup();f.live.setCapability(a);assert.equal(f.calls.length,0);f.live.setActive(true);assert.equal(f.calls.length,1);assert.equal(f.live.snapshot().loading,true);void f.live.refresh();void f.live.refresh();assert.equal(f.calls.length,1);
 f.calls[0].reply.resolve({kind:'plan',plan:plan(),etag:'"1"'});await settle();const saved=f.live.snapshot().plan;assert.equal(f.nextDelay(),5000);
 await f.advance(5000);assert.equal(f.calls.length,2);assert.equal(f.calls[1].etag,'"1"');f.calls[1].reply.resolve({kind:'not_modified',etag:'"1"'});await settle();assert.equal(f.live.snapshot().plan,saved);assert.equal(f.live.snapshot().error,null);
 await f.advance(5000);assert.equal(f.calls.length,3);f.live.setActive(false);assert.equal(f.calls[2].signal.aborted,true);const before=f.changes.length;f.calls[2].reply.resolve({kind:'plan',plan:plan(99,'Late hidden data'),etag:'"99"'});await f.advance(60000);assert.equal(f.calls.length,3);assert.equal(f.changes.length,before);assert.equal(f.live.snapshot().plan,saved);
 f.live.setActive(true);assert.equal(f.calls.length,4,'Foreground immediately revalidates');const resumed=f.changes.length;f.live.stop();assert.equal(f.calls[3].signal.aborted,true);await settle();assert.equal(f.tasks.size,0);f.calls[3].reply.resolve({kind:'plan',plan:plan(100),etag:'"100"'});await settle();assert.equal(f.live.snapshot().plan,saved);assert.equal(f.changes.length,resumed,'A stopped reader never publishes late results');
});

test('FE-068 timeout includes stalled work, retains data and backs off without overlapping requests',async()=>{
 const f=setup();f.live.setCapability(a);f.live.setActive(true);await f.advance(10000);assert.equal(f.calls[0].signal.aborted,true);assert.equal(f.live.snapshot().loading,false);assert.equal(f.live.snapshot().error,'Unable to connect. Please try again.');assert.equal(f.nextDelay(),10000);
 await f.advance(10000);assert.equal(f.calls.length,2);f.calls[1].reply.resolve({kind:'plan',plan:plan(),etag:'"1"'});await settle();const saved=f.live.snapshot().plan;assert.equal(f.nextDelay(),5000);
 for(const delay of[10000,20000,30000,30000]){void f.live.refresh();f.calls.at(-1)!.reply.reject(Error('private connection detail'));await settle();assert.equal(f.live.snapshot().plan,saved);assert.equal(f.live.snapshot().error,'Unable to connect. Please try again.');assert.equal(f.nextDelay(),delay);}
 assert.ok(!JSON.stringify(f.changes).includes('private connection detail'));f.live.stop();await settle();assert.equal(f.tasks.size,0);
});

test('FE-068 capability switches fence delayed responses, revisions never regress and revoked links clear saved data',async()=>{
 const f=setup();f.live.setCapability(a);f.live.setActive(true);f.live.setCapability(b);assert.equal(f.calls[0].signal.aborted,true);assert.equal(f.calls.length,2);assert.equal(f.live.snapshot().plan,null);
 f.calls[0].reply.resolve({kind:'plan',plan:plan(99,'Wrong token data'),etag:'"99"'});await settle();assert.equal(f.live.snapshot().plan,null);f.calls[1].reply.resolve({kind:'plan',plan:plan(2,'Current token data'),etag:'"2"'});await settle();const saved=f.live.snapshot().plan;
 void f.live.refresh();f.calls.at(-1)!.reply.resolve({kind:'plan',plan:plan(1,'Stale revision'),etag:'"1"'});await settle();assert.equal(f.live.snapshot().plan,saved);void f.live.refresh();assert.equal(f.calls.at(-1)!.etag,'"2"');f.calls.at(-1)!.reply.resolve({kind:'plan',plan:plan(2,'Impossible same-version change'),etag:'"different"'});await settle();assert.equal(f.live.snapshot().plan,saved);assert.ok(f.live.snapshot().error);
 void f.live.refresh();f.calls.at(-1)!.reply.resolve({kind:'missing'});await settle();assert.equal(f.live.snapshot().plan,null);assert.equal(f.live.snapshot().missing,true);const count=f.calls.length;await f.advance(60000);assert.equal(f.calls.length,count,'Revoked links do not poll forever');f.live.setCapability(a);assert.equal(f.calls.length,count+1);assert.equal(f.calls.at(-1)!.etag,null);f.live.stop();await settle();assert.ok(!JSON.stringify(f.changes).includes(a));assert.ok(!JSON.stringify(f.changes).includes(b));
 const missing=setup();missing.live.setCapability('');missing.live.setActive(true);assert.equal(missing.live.snapshot().missing,true);assert.equal(missing.calls.length,0);missing.live.stop();
});
