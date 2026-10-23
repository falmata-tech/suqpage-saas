import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';

test('DEP-043 S121 scheduled worker independently attempts automatic routing and inactivity within the existing budget',async()=>{
  const fixture={calls:[] as string[],logs:[] as unknown[],failure:'',time:0,busy:false,trackingReady:false};
  const compiled=await build({entryPoints:['netlify/functions/attention-worker.mts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'worker-ports',setup(b){
    b.onResolve({filter:/lib\/(attention-delivery|support|support-escalation-email-delivery|tracking|tracking-email-delivery|transport-partner-email-delivery|transport-partner-interest)\.ts$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({contents:a.path.includes('attention-delivery')?`
      export async function dispatchAttention(options){fixture.calls.push('dispatch');if(options.limit!==12)throw Error('unexpected fan-out');if(fixture.failure==='dispatch')throw Error('private token and customer body');if(fixture.failure==='late')fixture.time=20000;if(['near-budget','routing-budget','routing-budget-failure'].includes(fixture.failure))fixture.time=19999;return {processed:0,accepted:0};}
      export async function checkExpoAttentionReceipts(){fixture.calls.push('receipts');if(fixture.failure==='receipts')throw Error('private token and customer body');return {checked:0};}
    `:`
      export async function partnerInterestSchemaReady(){return Boolean(fixture.partnerReady);}
      export async function dispatchPartnerInterestEmails(options){fixture.calls.push('partner-email');if(options.limit!==2||options.mode!==undefined)throw Error('unexpected partner fanout');if(fixture.failure==='partner-email')throw Error('private token and customer body');return{processed:0,accepted:0,ignored:0,failed:0,pending:0,configured:true};}
      export async function cleanupPartnerInterests(){fixture.calls.push('partner-cleanup');return{deleted:0};}
      export async function sweepWaitingSupportAssignments(){fixture.calls.push('routing');if(['routing-budget','routing-budget-failure'].includes(fixture.failure))fixture.time=20000;if(['routing','both','routing-budget-failure'].includes(fixture.failure))throw Error('private token and customer body');return {routed:fixture.busy?0:2,skippedBusy:fixture.busy,privateBody:'private token and customer body'};}
      export async function dispatchSupportEscalationEmails(options){fixture.calls.push('email');if(options.limit!==2||options.mode!==undefined)throw Error('unexpected email fan-out');if(fixture.failure==='email-budget')fixture.time=20000;if(['email','both'].includes(fixture.failure))throw Error('private token and customer body');return{processed:0,accepted:0,ignored:0,failed:0,pending:0,configured:true,privateBody:'private token and customer body'};}
      export async function sweepSupportReplyOverdue(){fixture.calls.push('overdue');if(fixture.failure==='overdue-budget')fixture.time=20000;if(['overdue','both'].includes(fixture.failure))throw Error('private token and customer body');return {notified:fixture.busy?0:1,skippedBusy:fixture.busy};}
      export async function sweepSupportInactivity(){fixture.calls.push('maintenance');if(['maintenance-budget','maintenance-budget-failure'].includes(fixture.failure))fixture.time=20000;if(['maintenance','both','maintenance-budget-failure'].includes(fixture.failure))throw Error('private token and customer body');return {ended:2,skippedBusy:fixture.busy};}
      export async function isTrackingSchemaReady(){if(fixture.failure==='tracking-readiness')throw Error('private token and customer body');return Boolean(fixture.trackingReady);}
      export async function dispatchTrackingEmails(options){fixture.calls.push('tracking-email');if(options.limit!==1||options.mode!==undefined)throw Error('unexpected tracking fanout');if(fixture.failure==='tracking-budget')fixture.time=20000;if(fixture.failure==='tracking-email')throw Error('private token and customer body');return{processed:0,accepted:0,ignored:0,failed:0,pending:0,configured:true};}
      export async function cleanupTrackingIdentity(){fixture.calls.push('tracking-cleanup');if(fixture.failure==='tracking-cleanup')throw Error('private token and customer body');return{sessions:0,challenges:0,privateBody:'private token and customer body'};}
    `}));
  }}]});
  const module={exports:{} as {default:()=>Promise<void>;config:{schedule:string}}};
  class Clock extends Date{static now(){return fixture.time;}}
  vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,fixture,Date:Clock,console:{log:(...items:unknown[])=>fixture.logs.push(items),error:(...items:unknown[])=>fixture.logs.push(items)}});
  assert.equal(module.exports.config.schedule,'* * * * *');
  for(const failure of ['', 'dispatch','receipts','routing','maintenance','both','late','near-budget','routing-budget','routing-budget-failure','overdue','maintenance-budget','maintenance-budget-failure','overdue-budget','email']){
    fixture.calls=[];fixture.logs=[];fixture.time=0;fixture.failure=failure;
    await module.exports.default();
    assert.deepEqual(fixture.calls,failure==='late'?['dispatch','receipts']:['routing-budget','routing-budget-failure'].includes(failure)?['dispatch','receipts','routing']:['maintenance-budget','maintenance-budget-failure'].includes(failure)?['dispatch','receipts','routing','maintenance']:failure==='overdue-budget'?['dispatch','receipts','routing','maintenance','overdue']:['dispatch','receipts','routing','maintenance','overdue','email']);
    assert.doesNotMatch(JSON.stringify(fixture.logs),/private token|customer body/,'Provider/database exceptions are never printed');
    if(['late','routing-budget','routing-budget-failure','maintenance-budget','maintenance-budget-failure','overdue-budget'].includes(failure))assert.match(JSON.stringify(fixture.logs),/worker_time_budget/);
    if(['dispatch','receipts','routing','maintenance','both','routing-budget-failure'].includes(failure))assert.match(JSON.stringify(fixture.logs),/failure/);
    if(['routing','both','routing-budget-failure'].includes(failure))assert.match(JSON.stringify(fixture.logs),/routing_failure/);
    if(['maintenance','both','maintenance-budget-failure'].includes(failure))assert.match(JSON.stringify(fixture.logs),/maintenance_failure/);
    if(['overdue','both'].includes(failure))assert.match(JSON.stringify(fixture.logs),/reply_escalation_failure/);
    if(['email','both'].includes(failure))assert.match(JSON.stringify(fixture.logs),/email_escalation_failure/);
  }
  fixture.calls=[];fixture.logs=[];fixture.time=0;fixture.failure='';fixture.busy=true;await module.exports.default();
  assert.deepEqual(fixture.calls,['dispatch','receipts','routing','maintenance','overdue','email']);assert.match(JSON.stringify(fixture.logs),/"routed":0,"skippedBusy":true/,'A busy routing lock is observable without skipping other maintenance');
  fixture.trackingReady=true;
  for(const failure of['','tracking-email','tracking-cleanup','tracking-readiness','email-budget','tracking-budget']){
    fixture.calls=[];fixture.logs=[];fixture.time=0;fixture.failure=failure;await module.exports.default();
    const base=['dispatch','receipts','routing','maintenance','overdue','email'];
    assert.deepEqual(fixture.calls,['email-budget','tracking-readiness'].includes(failure)?base:failure==='tracking-budget'?[...base,'tracking-email']:[...base,'tracking-email','tracking-cleanup']);
    assert.doesNotMatch(JSON.stringify(fixture.logs),/private token|customer body/);if(failure.startsWith('tracking-')&&failure!=='tracking-budget')assert.match(JSON.stringify(fixture.logs),/tracking_.*_failure/);if(failure.endsWith('budget'))assert.match(JSON.stringify(fixture.logs),/worker_time_budget/);
  }
});
