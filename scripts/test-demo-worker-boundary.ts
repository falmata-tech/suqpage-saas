import assert from 'node:assert/strict';
import Module from 'node:module';
import path from 'node:path';
import test from 'node:test';
import {build} from 'esbuild';
import {copyMaintenanceBody,signCopyMaintenanceBody,verifyCopyMaintenanceRequest} from '../lib/demo-copy-background';
import {canStartBackgroundCopy} from '../lib/demo-simulator-runtime';

test('DEP-054 background copy reserves the last request and commit before its transaction deadline',()=>{
 const deadline=180000;
 assert.equal(canStartBackgroundCopy(0,deadline,null),true);
 assert.equal(canStartBackgroundCopy(131000,deadline,30000),false);
 assert.equal(canStartBackgroundCopy(118000,deadline,30000),true);
 assert.equal(canStartBackgroundCopy(136000,deadline,1000),false);
 assert.equal(canStartBackgroundCopy(135000,deadline,1000),false);
 assert.equal(canStartBackgroundCopy(149000,deadline,50000),false);
});

test('DEP-054 finite S200 copy worker loads without Next request context',async()=>{
 const result=await build({entryPoints:['netlify/functions/demo-simulator.mts'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',logLevel:'silent'});
 const source=result.outputFiles[0].text;
 assert.doesNotMatch(source,/next\/(?:headers|server)/);
 const filename=path.resolve('netlify/functions/demo-simulator.cjs');
 // Match Node's existing CommonJS worker admission used by DEP-043. Loading is
 // inert: do not invoke the scheduled mutation adapter or open a database.
 const worker=new Module(filename) as Module&{paths:string[];_compile:(source:string,filename:string)=>void;exports:{config:{schedule:string};isDemoSimulatorWindow:(now:number)=>boolean;default:()=>Promise<void>}};
 worker.filename=filename;
 worker.paths=[path.resolve('node_modules')];
 worker._compile(source,filename);
 assert.equal(worker.exports.config.schedule,'* * * * *');assert.equal(typeof worker.exports.default,'function');
 const inside=worker.exports.isDemoSimulatorWindow;
 assert.equal(inside(Date.UTC(2026,10,15,22,29,59)),false);
 assert.equal(inside(Date.UTC(2026,10,15,22,30)),true);
 assert.equal(inside(Date.UTC(2026,10,15,23,59,59)),true);
 assert.equal(inside(Date.UTC(2026,10,16,0,29,59)),true);
 assert.equal(inside(Date.UTC(2026,10,16,0,30)),true);
 assert.equal(inside(Date.UTC(2026,10,16,1,29,59)),true);
 assert.equal(inside(Date.UTC(2026,10,16,1,30)),false);
 assert.equal(inside(Date.UTC(2026,10,16,6,0)),false);
 assert.equal(inside(Number.NaN),false);
 // Even an operator's manual Run now outside the window must return without
 // opening the database or invoking the scheduled mutation runtime.
 const dateNow=Date.now,log=console.log,error=console.error,logs:unknown[][]=[],errors:unknown[][]=[];
 try{
  Date.now=()=>Date.UTC(2026,10,16,1,30);
  console.log=(...args:unknown[])=>{logs.push(args);};
  console.error=(...args:unknown[])=>{errors.push(args);};
  await worker.exports.default();
 }finally{Date.now=dateNow;console.log=log;console.error=error;}
 assert.deepEqual(logs,[['Demo simulator',{status:'outside_window',elapsedMs:0}]]);
 assert.deepEqual(errors,[]);
});

test('DEP-054 signed background admission and finite replay window',async()=>{
 const now=Date.UTC(2026,10,15,23,20),slot=Math.floor(now/60000),secret='fixture-postgres-secret';
 const body=copyMaintenanceBody(slot),signature=signCopyMaintenanceBody(body,secret);
 assert.equal(verifyCopyMaintenanceRequest(body,signature,secret,now),slot);
 assert.equal(verifyCopyMaintenanceRequest(body,signature,secret,now+11*60000),null);
 assert.equal(verifyCopyMaintenanceRequest(body,signature,secret,Date.UTC(2026,10,16,1,30)),null);
 assert.equal(verifyCopyMaintenanceRequest(body,null,secret,now),null);
 assert.equal(verifyCopyMaintenanceRequest(body,'0'.repeat(64),secret,now),null);
 assert.equal(verifyCopyMaintenanceRequest(body+' ',signature,secret,now),null);
 const realNow=Date.now,realFetch=globalThis.fetch,realSecret=process.env.SUQPAGE_POSTGRES_URL;
 const scheduledBuild=await build({entryPoints:['netlify/functions/demo-simulator.mts'],bundle:true,
  write:false,platform:'node',format:'cjs',packages:'external',logLevel:'silent'});
 const scheduledFile=path.resolve('netlify/functions/demo-simulator.cjs');
 const scheduled=new Module(scheduledFile) as Module&{paths:string[];_compile:(source:string,filename:string)=>void;
  exports:{default:()=>Promise<void>}};
 scheduled.filename=scheduledFile;scheduled.paths=[path.resolve('node_modules')];
 scheduled._compile(scheduledBuild.outputFiles[0].text,scheduledFile);
 const backgroundBuild=await build({entryPoints:['netlify/functions/demo-copy-background.mts'],bundle:true,
  write:false,platform:'node',format:'cjs',packages:'external',logLevel:'silent',plugins:[{
   name:'reject-db-call',setup(plugin){
    plugin.onResolve({filter:/demo-simulator-runtime\.ts$/},()=>({path:'runtime-stub',namespace:'test'}));
    plugin.onLoad({filter:/.*/,namespace:'test'},()=>({contents:
     'export async function runDemoSimulatorTick(){throw new Error("DB must stay closed")}',loader:'ts'}));
   },
  }]});
 const backgroundFile=path.resolve('netlify/functions/demo-copy-background.cjs');
 const background=new Module(backgroundFile) as Module&{paths:string[];_compile:(source:string,filename:string)=>void;
  exports:{config:{background:boolean;method:string};default:(request:Request)=>Promise<Response>}};
 background.filename=backgroundFile;background.paths=[path.resolve('node_modules')];
 background._compile(backgroundBuild.outputFiles[0].text,backgroundFile);
 assert.equal(background.exports.config.background,true);
 assert.equal(background.exports.config.method,'POST');
 try{
  Date.now=()=>now;
  process.env.SUQPAGE_POSTGRES_URL=secret;
  globalThis.fetch=async(input,init)=>{
   assert.equal(input,'https://mirtpage.com/.netlify/functions/demo-copy-background');
   assert.equal(init?.method,'POST');
   assert.equal(verifyCopyMaintenanceRequest(String(init?.body),
    new Headers(init?.headers).get('x-s200-copy-signature'),secret,now),slot);
   return new Response(null,{status:202});
  };
  await scheduled.exports.default();
  assert.equal((await background.exports.default(new Request('https://mirtpage.com/.netlify/functions/demo-copy-background',{
   method:'POST',headers:{'content-type':'application/json'},body}))).status,403,
   'Unsigned input must return before the database runtime.');
  await assert.rejects(()=>background.exports.default(new Request('https://mirtpage.com/.netlify/functions/demo-copy-background',{
   method:'POST',headers:{'content-type':'application/json','x-s200-copy-signature':signature},body})),
   /demo_copy_tick_failed/,
   'The test stub confirms a valid signed request reaches the runtime and fails for Netlify retry.');
  Date.now=()=>Date.UTC(2026,10,16,1,30);
  assert.equal((await background.exports.default(new Request('https://mirtpage.com/.netlify/functions/demo-copy-background',{
   method:'POST',headers:{'content-type':'application/json','x-s200-copy-signature':signature},body}))).status,403);
 }finally{
  Date.now=realNow;globalThis.fetch=realFetch;
  if(realSecret===undefined)delete process.env.SUQPAGE_POSTGRES_URL;
  else process.env.SUQPAGE_POSTGRES_URL=realSecret;
 }
});
