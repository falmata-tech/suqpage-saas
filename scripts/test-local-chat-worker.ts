import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const local={SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:'postgresql://fixture:unused@127.0.0.1:54322/postgres',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321'};
async function compileWorker(){
  return build({entryPoints:['scripts/local-chat-worker.ts'],bundle:true,write:false,format:'cjs',platform:'node',define:{'import.meta.url':JSON.stringify('file:///fixture/scripts/local-chat-worker.ts')},plugins:[{name:'local-worker-ports',setup(b){
    b.onResolve({filter:/lib\/(platform-environment\.mjs|postgres-runtime-services|support|support-escalation-email-delivery|tracking|tracking-email-delivery|transport-partner-email-delivery|transport-partner-interest)$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({contents:a.path.endsWith('platform-environment.mjs')?'export const platformEnvironment=()=>fixture.env;':a.path.endsWith('postgres-runtime-services')?`export const postgresRuntimeServices=()=>{fixture.calls.push('pool');return{runner:{query:async()=>{fixture.calls.push('verify');return{rows:[{schema:fixture.schema,ready:fixture.ready}]};}},pool:{end:async()=>fixture.calls.push('end')}}};`:`
      export async function partnerInterestSchemaReady(){return Boolean(fixture.partnerReady);}
      export async function dispatchPartnerInterestEmails(options){fixture.calls.push('partner-email');if(options.limit!==2||options.mode!=='local-mailpit')throw Error('unexpected partner fanout');if(fixture.failure==='partner-email')throw Error('private token and customer body');return{processed:0,accepted:0,ignored:0,failed:0,pending:0,configured:true};}
      export async function cleanupPartnerInterests(){fixture.calls.push('partner-cleanup');return{deleted:0};}
      export const sweepWaitingSupportAssignments=async()=>{fixture.calls.push('routing');if(fixture.routingGate)await fixture.routingGate;if(['routing','both'].includes(fixture.failure))throw Error('private token and customer body');return{routed:fixture.busy?0:2,skippedBusy:fixture.busy,privateBody:'private token and customer body'};};
      export const dispatchSupportEscalationEmails=async(options)=>{fixture.calls.push('email');if(options.mode!=='local-mailpit'||options.limit!==2)throw Error('unsafe email mode');if(['email','both'].includes(fixture.failure))throw Error('private token and customer body');return{processed:0,accepted:0,ignored:0,failed:0,pending:0,configured:true,privateBody:'private token and customer body'};};
      export const sweepSupportReplyOverdue=async()=>{fixture.calls.push('overdue');if(['overdue','both'].includes(fixture.failure))throw Error('private token and customer body');return{notified:0,skippedBusy:fixture.busy};};
      export const sweepSupportInactivity=async()=>{fixture.calls.push('maintenance');if(['maintenance','both'].includes(fixture.failure))throw Error('private token and customer body');return{ended:0,skippedBusy:fixture.busy};};
      export const isTrackingSchemaReady=async()=>Boolean(fixture.trackingReady);
      export const dispatchTrackingEmails=async(options)=>{fixture.calls.push('tracking-email');if(options.mode!=='local-mailpit'||options.limit!==2)throw Error('unsafe tracking mode');if(fixture.failure==='tracking-email')throw Error('private token and customer body');return{processed:0,accepted:0,ignored:0,failed:0,pending:0,configured:true,privateBody:'private token and customer body'};};
      export const cleanupTrackingIdentity=async()=>{fixture.calls.push('tracking-cleanup');if(fixture.failure==='tracking-cleanup')throw Error('private token and customer body');return{sessions:0,challenges:0,privateBody:'private token and customer body'};};
    `}));
  }}]});
}

test('DEP-043 local worker rejects unsafe targets and independently attempts automatic routing and inactivity',async()=>{
  const fixture={env:{...local} as Record<string,string|undefined>,schema:'public',ready:true,calls:[] as string[],logs:[] as unknown[],failure:'',busy:false};
  const result=await compileWorker();
  const module={exports:{} as {runLocalChatWorker:(once:boolean)=>Promise<void>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url),fixture,process:{argv:[],on:()=>{},off:()=>{}},URL,setTimeout,clearTimeout,console:{log:(...v:unknown[])=>fixture.logs.push(v),error:(...v:unknown[])=>fixture.logs.push(v)}});
  assert.deepEqual(fixture.calls,[],'Importing the script never starts a worker');
  for(const extra of [{NODE_ENV:'production'},{NETLIFY:'true'},{SUQPAGE_DATABASE_DRIVER:'sqlite'},{SUQPAGE_POSTGRES_URL:'postgresql://fixture:unused@remote.invalid:54322/postgres'},{SUQPAGE_POSTGRES_URL:'postgresql://fixture:unused@127.0.0.1:5432/postgres'},
    ...['host=remote.invalid','port=5432','%68ost=remote.invalid','connectionString=postgresql%3A%2F%2Fremote.invalid%2Fpostgres'].map(query=>({SUQPAGE_POSTGRES_URL:local.SUQPAGE_POSTGRES_URL+'?'+query})),
    {NEXT_PUBLIC_SUPABASE_URL:'https://remote.invalid'}]){
    fixture.env={...local,...extra};fixture.calls=[];await assert.rejects(module.exports.runLocalChatWorker(true));assert.deepEqual(fixture.calls,[],'Invalid target never opens PostgreSQL');
  }
  for(const [schema,ready] of [['private_fixture',true],['public',false]] as const){
    fixture.env={...local};fixture.schema=schema;fixture.ready=ready;fixture.calls=[];
    await assert.rejects(module.exports.runLocalChatWorker(true));assert.deepEqual(fixture.calls,['pool','verify','end']);
  }
  fixture.schema='public';fixture.ready=true;
  for(const failure of ['','routing','maintenance','overdue','email','both']){
    fixture.failure=failure;fixture.calls=[];fixture.logs=[];await module.exports.runLocalChatWorker(true);assert.deepEqual(fixture.calls,['pool','verify','routing','maintenance','overdue','email','end']);
    assert.doesNotMatch(JSON.stringify(fixture.logs),/private token|customer body/,'Logs admit only counts and sanitized failure categories');
    if(['routing','both'].includes(failure))assert.match(JSON.stringify(fixture.logs),/routing_failure/);
    if(['maintenance','both'].includes(failure))assert.match(JSON.stringify(fixture.logs),/maintenance_failure/);
    if(['overdue','both'].includes(failure))assert.match(JSON.stringify(fixture.logs),/reply_escalation_failure/);
    if(['email','both'].includes(failure))assert.match(JSON.stringify(fixture.logs),/email_escalation_failure/);
  }
  fixture.failure='';fixture.busy=true;fixture.calls=[];fixture.logs=[];
  await module.exports.runLocalChatWorker(true);assert.deepEqual(fixture.calls,['pool','verify','routing','maintenance','overdue','email','end']);
  assert.match(JSON.stringify(fixture.logs),/"routed":0,"skippedBusy":true/,'Busy routing remains observable and never suppresses inactivity');
  fixture.busy=false;fixture.calls=[];
  const directModule={exports:{}};
  vm.runInNewContext(result.outputFiles[0].text,{module:directModule,exports:directModule.exports,require:createRequire(import.meta.url),fixture,process:{argv:['node','/fixture/scripts/local-chat-worker.ts','--once'],on:()=>{},off:()=>{}},URL,setTimeout,clearTimeout,console:{log:(...v:unknown[])=>fixture.logs.push(v),error:(...v:unknown[])=>fixture.logs.push(v)}});
  await new Promise<void>(resolve=>setImmediate(resolve));
  assert.deepEqual(fixture.calls,['pool','verify','routing','maintenance','overdue','email','end'],'The exact direct --once entry still runs both guarded tasks');
});

test('DEP-048 tracking retries are schema-gated and independently bounded in the guarded local worker',async()=>{
 const fixture={env:{...local},schema:'public',ready:true,trackingReady:false,calls:[]as string[],logs:[]as unknown[],failure:'',busy:false};
 const compiled=await compileWorker(),module={exports:{}as{runLocalChatWorker:(once:boolean)=>Promise<void>}};
 vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url),fixture,process:{argv:[],on:()=>{},off:()=>{}},URL,setTimeout,clearTimeout,console:{log:(...v:unknown[])=>fixture.logs.push(v),error:(...v:unknown[])=>fixture.logs.push(v)}});
 await module.exports.runLocalChatWorker(true);assert.ok(!fixture.calls.includes('tracking-email'),'Existing69/70 worker does not query missing tracking tables');
 fixture.trackingReady=true;
 for(const failure of['','tracking-email','tracking-cleanup']){fixture.calls=[];fixture.logs=[];fixture.failure=failure;await module.exports.runLocalChatWorker(true);assert.deepEqual(fixture.calls,['pool','verify','routing','maintenance','overdue','email','tracking-email','tracking-cleanup','end']);assert.doesNotMatch(JSON.stringify(fixture.logs),/private token|customer body/);if(failure)assert.match(JSON.stringify(fixture.logs),/tracking_.*_failure/);}
});

test('DEP-043 S121 local routing starts immediately, completes before inactivity and repeats only after the sixty-second wait',async()=>{
  let releaseRouting:()=>void=()=>{};
  const fixture={env:{...local},schema:'public',ready:true,calls:[] as string[],logs:[] as unknown[],failure:'',busy:false,routingGate:new Promise<void>(resolve=>{releaseRouting=resolve;}) as Promise<void>|undefined};
  const timers:{callback:()=>void;delay:number;cancelled:boolean}[]=[];
  const handlers=new Map<string,()=>void>();
  const result=await compileWorker();const module={exports:{} as {runLocalChatWorker:(once:boolean)=>Promise<void>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url),fixture,process:{argv:[],on:(signal:string,handler:()=>void)=>handlers.set(signal,handler),off:(signal:string)=>handlers.delete(signal)},URL,setTimeout:(callback:()=>void,delay:number)=>{const timer={callback,delay,cancelled:false};timers.push(timer);return timer;},clearTimeout:(timer:{cancelled:boolean})=>{timer.cancelled=true;},console:{log:(...v:unknown[])=>fixture.logs.push(v),error:(...v:unknown[])=>fixture.logs.push(v)}});
  const running=module.exports.runLocalChatWorker(false);
  await new Promise<void>(resolve=>setImmediate(resolve));
  assert.deepEqual(fixture.calls,['pool','verify','routing'],'The first routing pass does not wait a minute');assert.equal(timers.length,0,'No next timer or overlapping inactivity starts while routing is in flight');
  releaseRouting();await new Promise<void>(resolve=>setImmediate(resolve));
  assert.deepEqual(fixture.calls,['pool','verify','routing','maintenance','overdue','email']);assert.equal(timers.length,1);assert.equal(timers[0].delay,60_000);
  fixture.routingGate=undefined;timers[0].callback();await new Promise<void>(resolve=>setImmediate(resolve));
  assert.deepEqual(fixture.calls,['pool','verify','routing','maintenance','overdue','email','routing','maintenance','overdue','email']);assert.equal(timers.length,2);assert.equal(timers[1].delay,60_000);
  handlers.get('SIGTERM')!();await running;
  assert.equal(timers[1].cancelled,true);assert.equal(handlers.size,0);assert.equal(fixture.calls.at(-1),'end','Shutdown closes the existing worker pool without a third pass');
  fixture.calls=[];fixture.routingGate=new Promise<void>(resolve=>{releaseRouting=resolve;});
  const stopping=module.exports.runLocalChatWorker(false);await new Promise<void>(resolve=>setImmediate(resolve));
  handlers.get('SIGINT')!();releaseRouting();await stopping;
  assert.deepEqual(fixture.calls,['pool','verify','routing','end'],'Shutdown while routing is in flight does not start a new inactivity command');assert.equal(handlers.size,0);
});
