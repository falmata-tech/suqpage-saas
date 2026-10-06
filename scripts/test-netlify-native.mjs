import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// Test the archive that will be uploaded, not the build host's node_modules.
const archive=path.resolve(process.argv[2]||'.netlify/functions/___netlify-server-handler.zip');
assert.ok(fs.statSync(archive).isFile(),'A generated Netlify function archive is required');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-netlify-native-'));
fs.chmodSync(root,0o700);
try {
  execFileSync('python3',['-c',`import pathlib,sys,zipfile
root=pathlib.Path(sys.argv[2]).resolve()
with zipfile.ZipFile(sys.argv[1]) as z:
 for name in z.namelist():
  target=(root/name).resolve()
  if not target.is_relative_to(root): raise ValueError('Unsafe archive path')
 z.extractall(root)
`,archive,root]);
  execFileSync('docker',['run','--rm','--platform','linux/amd64','--network','none','--read-only','--tmpfs','/tmp','--mount',`type=bind,source=${root},target=/artifact,readonly`,'--workdir','/artifact','node:24.18.1-bookworm-slim','node','--input-type=module','-e',`
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const entry='/artifact/___netlify-entry-point.mjs';
let anchor='/artifact/package.json';
if(fs.existsSync(entry)) {
  const target=fs.readFileSync(entry,'utf8').match(/getLambdaHandler\\(['"]([^'"]+)['"]\\)/)?.[1];
  assert.ok(target,'Expected an explicit packaged handler entry');
  anchor=path.resolve('/artifact',target);
  assert.ok(anchor.startsWith('/artifact/') && fs.existsSync(anchor),'Packaged handler must exist inside the archive');
}
const require=createRequire(anchor);
const sharp=require('sharp');
const image=await sharp({create:{width:4,height:4,channels:3,background:'#fff'}}).resize(2,2).png().toBuffer();
const info=await sharp(image).metadata();
assert.equal(info.width,2);assert.equal(info.height,2);assert.equal(info.format,'png');
console.log('PASS exact Netlify archive Sharp image transform on Linux x64/glibc.');
`],{stdio:'inherit'});
  console.log('Archive SHA-256:',crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'));
} finally {fs.rmSync(root,{recursive:true,force:true});}
