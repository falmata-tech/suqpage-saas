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
 const worker=new Module(filename) as Module&{paths:string[];_compile:(source:string,filename:string)=>void;exports:{config:{schedule:string};default:unknown}};
 worker.filename=filename;
 worker.paths=[path.resolve('node_modules')];
 worker._compile(source,filename);
 assert.equal(worker.exports.config.schedule,'* * * * *');assert.equal(typeof worker.exports.default,'function');
});
