import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import Module from 'node:module';
import path from 'node:path';
import {test} from 'node:test';
import {build} from 'esbuild';

test('DEP-043 scheduled worker starts without Next request modules',async()=>{
  const result=await build({
    entryPoints:['netlify/functions/attention-worker.mts'],
    bundle:true,write:false,platform:'node',format:'cjs',packages:'external',logLevel:'silent',
  });
  const source=result.outputFiles[0].text;
  assert.doesNotMatch(source,/next\/(?:headers|server)/);
  const filename=path.resolve('netlify/functions/attention-worker.mjs');
  const worker=new Module(filename);
  worker.filename=filename;
  worker.paths=Module._nodeModulePaths(process.cwd());
  worker._compile(source,filename);
  assert.equal(worker.exports.config.schedule,'* * * * *');
  assert.equal(typeof worker.exports.default,'function');
});

test('DEP-043 worker-safe security rules match the request adapter',async()=>{
  const previous=process.env.PRIVACY_SALT;
  try{
    process.env.PRIVACY_SALT='test-privacy-salt-that-is-long-enough';
    const core=await import('../lib/security-core.ts');
    const request=await import('../lib/security.ts');
    const value='tracking-email:v1:customer@example.test';
    const expected=crypto.createHmac('sha256',process.env.PRIVACY_SALT).update(value).digest('hex');
    assert.equal(core.hashPrivateValue(value),expected);
    assert.equal(request.hashPrivateValue(value),expected);
    assert.equal(core.cleanText('  a\u0000b\n  ',2),'ab');
    assert.equal(request.cleanText('  a\u0000b\n  ',2),'ab');
  }finally{
    if(previous===undefined)delete process.env.PRIVACY_SALT;
    else process.env.PRIVACY_SALT=previous;
  }
});
