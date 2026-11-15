import assert from 'node:assert/strict';
import Module from 'node:module';
import path from 'node:path';
import test from 'node:test';
import {build} from 'esbuild';

test('DEP-054 actual scheduled demo worker loads without Next request context',async()=>{
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
 assert.equal(inside(Date.UTC(2026,10,15,18,14,59,999)),false);
 assert.equal(inside(Date.UTC(2026,10,15,18,15)),true);
 assert.equal(inside(Date.UTC(2026,10,15,20,15)),true);
 assert.equal(inside(Date.UTC(2026,10,15,22,14,59,999)),true);
 assert.equal(inside(Date.UTC(2026,10,15,22,15)),false);
 assert.equal(inside(Date.UTC(2026,10,16,18,15)),false);
 // A delayed or manual invocation outside the exact window must return
 // without opening a database or invoking the mutation runtime.
 const dateNow=Date.now,log=console.log,error=console.error,logs:unknown[][]=[],errors:unknown[][]=[];
 try{
  Date.now=()=>Date.UTC(2026,10,15,22,15);
  console.log=(...args:unknown[])=>{logs.push(args);};
  console.error=(...args:unknown[])=>{errors.push(args);};
  await worker.exports.default();
 }finally{Date.now=dateNow;console.log=log;console.error=error;}
 assert.deepEqual(logs,[['Demo simulator',{status:'outside_window',elapsedMs:0}]]);
 assert.deepEqual(errors,[]);
});
