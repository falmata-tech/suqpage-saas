import test from 'node:test';
import assert from 'node:assert/strict';
import {startForegroundPoll} from '../lib/foreground-poll';
const flush=()=>new Promise<void>(resolve=>setImmediate(resolve));
test('FE-079 foreground cadence never overlaps, aborts on hide, resumes and stops cleanly',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 let active=true,changed=()=>{},unsubscribed=false;const jobs:Array<{signal:AbortSignal;resolve:()=>void}>=[];
 const stop=startForegroundPoll({active:()=>active,subscribe:fn=>{changed=fn;return()=>{unsubscribed=true;};},read:signal=>new Promise<void>(resolve=>jobs.push({signal,resolve}))});
 t.mock.timers.tick(14999);await flush();assert.equal(jobs.length,0);
 t.mock.timers.tick(1);await flush();assert.equal(jobs.length,1);
 t.mock.timers.tick(60000);await flush();assert.equal(jobs.length,1,'A slow response cannot create overlapping reads.');
 active=false;changed();assert.equal(jobs[0].signal.aborted,true);jobs[0].resolve();await flush();
 t.mock.timers.tick(60000);await flush();assert.equal(jobs.length,1);
 active=true;changed();await flush();assert.equal(jobs.length,2);
 jobs[1].resolve();await flush();t.mock.timers.tick(15000);await flush();assert.equal(jobs.length,3);
 stop();assert.equal(jobs[2].signal.aborted,true);assert.equal(unsubscribed,true);jobs[2].resolve();await flush();
 t.mock.timers.tick(120000);changed();await flush();assert.equal(jobs.length,3,'Departure leaves no recurring work.');
});
test('FE-079 failures back off to a bounded minute and success restores normal cadence',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let attempts=0,errors=0;
 const stop=startForegroundPoll({active:()=>true,subscribe:()=>()=>{},read:async()=>{attempts++;if(attempts<=3)throw Error('controlled failure');},onError:()=>{errors++;}});
 t.mock.timers.tick(15000);await flush();assert.equal(attempts,1);
 t.mock.timers.tick(29999);await flush();assert.equal(attempts,1);
 t.mock.timers.tick(1);await flush();assert.equal(attempts,2);
 t.mock.timers.tick(60000);await flush();assert.equal(attempts,3);
 t.mock.timers.tick(60000);await flush();assert.equal(attempts,4);assert.equal(errors,3);
 t.mock.timers.tick(15000);await flush();assert.equal(attempts,5);stop();
});
test('FE-079 initially hidden screens wait for foreground and cancelled failures are contained',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let active=false,changed=()=>{},count=0,errors=0,reject:((error:Error)=>void)|undefined;
 const stop=startForegroundPoll({active:()=>active,subscribe:fn=>{changed=fn;return()=>{};},read:()=>{count++;return new Promise<void>((_,no)=>{reject=no;});},onError:()=>{errors++;}});
 t.mock.timers.tick(120000);await flush();assert.equal(count,0);
 active=true;changed();await flush();assert.equal(count,1);active=false;changed();reject!(Error('cancelled'));await flush();assert.equal(errors,0);stop();
});
