import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// Cross-platform local packaging: add only the Linux optional packages already
// present in the lockfile. Never substitute the Mac binary in a Linux artifact.
const root=fs.realpathSync(process.cwd());
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-native-packages-'));
try {
  for(const name of ['@img/sharp-linux-x64','@img/sharp-libvips-linux-x64']) {
    const entry=lock.packages[`node_modules/${name}`];
    assert.ok(entry?.optional && entry.os.includes('linux') && entry.cpu.includes('x64'));
    const url=new URL(entry.resolved);
    assert.equal(url.origin,'https://registry.npmjs.org');
    assert.ok(url.pathname.startsWith(`/${name}/-/`));
    assert.match(entry.integrity,/^sha512-[A-Za-z0-9+/]+=*$/);
    const response=await fetch(url,{signal:AbortSignal.timeout(60000),redirect:'error'});
    assert.ok(response.ok,'Locked native package download failed');
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal('sha512-'+crypto.createHash('sha512').update(bytes).digest('base64'),entry.integrity,'Native package integrity differs from lockfile');
    const archive=path.join(temporary,name.split('/').pop()+'.tgz');fs.writeFileSync(archive,bytes);
    const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).split('\n').filter(Boolean);
    assert.ok(names.every(file=>file.startsWith('package/')&&!file.split('/').includes('..')),'Unsafe native archive entry');
    const output=path.join(root,'node_modules',name);fs.mkdirSync(output,{recursive:true});
    execFileSync('tar',['-xzf',archive,'--strip-components=1','-C',output]);
    assert.equal(JSON.parse(fs.readFileSync(path.join(output,'package.json'),'utf8')).version,entry.version);
    console.log(`Verified locked Linux package ${name}@${entry.version}.`);
  }
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
