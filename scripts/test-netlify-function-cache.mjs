import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import assert from'node:assert/strict';import{spawnSync}from'node:child_process';
const script=path.resolve('scripts/verify-netlify-function-cache.mjs'),root=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-function-cache-'));const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
try{
 const dir=path.join(fs.realpathSync(root),'.netlify/functions');fs.mkdirSync(dir,{recursive:true});const archive=path.join(dir,'___netlify-server-handler.zip'),bytes=Buffer.from('immutable archive fixture');fs.writeFileSync(archive,bytes);
 const manifest={version:1,timestamp:1,functions:[{name:'___netlify-server-handler',bundler:'none',runtimeVersion:'nodejs24.x',path:archive}]};const file=path.join(dir,'manifest.json');const write=v=>fs.writeFileSync(file,JSON.stringify(v));const run=()=>spawnSync(process.execPath,[script,root,hash(bytes)],{encoding:'utf8'});
 write(manifest);assert.equal(run().status,0);assert.ok(JSON.parse(fs.readFileSync(file)).timestamp>1);assert.deepEqual(fs.readFileSync(archive),bytes);
 for(const patch of [{bundler:'esbuild'},{name:'other'},{path:archive+'.outside'},{runtimeVersion:'nodejs20.x'}]){write({...manifest,functions:[{...manifest.functions[0],...patch}]});assert.notEqual(run().status,0);assert.equal(JSON.parse(fs.readFileSync(file)).timestamp,1);}
 write(manifest);fs.appendFileSync(archive,'drift');assert.notEqual(run().status,0);assert.equal(JSON.parse(fs.readFileSync(file)).timestamp,1);
 console.log('Function cache receipt preserves ZIP bytes and rejects digest, identity, bundler, runtime and path drift.');
}finally{fs.rmSync(root,{recursive:true,force:true});}
