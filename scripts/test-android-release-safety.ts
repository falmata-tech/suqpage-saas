import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {validateAndroidRelease,signingFingerprint,type AndroidArtifactMetadata} from '../lib/android-release-domain';
import {inspectAndroidApk,type AndroidToolRunner} from './operations/android-apk-inspection';
const fingerprint='AB'.repeat(32),policy={packageName:'com.africmade.app',certificateSha256:fingerprint};
const candidate:AndroidArtifactMetadata={packageName:policy.packageName,versionCode:3,debuggable:false,certificateSha256:[fingerprint.toLowerCase()]};
test('reviewed signer, canonical identity and newer version admit updates/explicit first release',()=>{
 assert.equal(validateAndroidRelease(candidate,policy,{...candidate,versionCode:2}).versionCode,3);
 assert.equal(validateAndroidRelease(candidate,policy,null,true).certificateSha256[0],fingerprint);
 assert.equal(signingFingerprint(fingerprint.match(/.{2}/g)!.join(':')),fingerprint);
});
test('missing signer, private/legacy identity, debug artifacts, rollback and ambiguous initialization fail closed',()=>{
 assert.throws(()=>validateAndroidRelease(candidate,{...policy,certificateSha256:null},null,true));
 assert.throws(()=>validateAndroidRelease(candidate,{...policy,packageName:'foreign.app'},null,true));
 assert.throws(()=>validateAndroidRelease(candidate,{...policy,packageName:'com.suqpage.app'},null,true));
 assert.throws(()=>validateAndroidRelease({...candidate,packageName:'com.suqpage.app'},policy,null,true));
 assert.throws(()=>validateAndroidRelease(candidate,policy,{...candidate,packageName:'com.suqpage.app',versionCode:2}));
 for(const mutation of [{packageName:'com.suqpage.app.preview'},{debuggable:true},{versionCode:0},{versionCode:1.5},{versionCode:Infinity},{certificateSha256:[]},{certificateSha256:['CD'.repeat(32)]},{certificateSha256:[fingerprint,fingerprint]}])assert.throws(()=>validateAndroidRelease({...candidate,...mutation},policy,null,true));
 for(const versionCode of [3,4])assert.throws(()=>validateAndroidRelease(candidate,policy,{...candidate,versionCode}));
 assert.throws(()=>validateAndroidRelease(candidate,policy,null));assert.throws(()=>validateAndroidRelease(candidate,policy,candidate,true));
 assert.throws(()=>validateAndroidRelease(candidate,policy,{...candidate,certificateSha256:['CD'.repeat(32)],versionCode:2}));
});
test('SDK port verifies signatures first; filenames are isolated arguments, malformed/unverified SDK output rejects',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-apk-guard-'));
 try{
  const apk=path.join(directory,'test $(do-not-run) `literal`.apk');fs.writeFileSync(apk,'labelled fixture, not a signed APK');
  const calls:Array<{tool:string;args:readonly string[]}>=[],tools={apksigner:'fixture-signer',apkanalyzer:'fixture-analyzer'};
  const run:AndroidToolRunner=(tool,args)=>{calls.push({tool,args});if(tool===tools.apksigner)return 'Signer #1 certificate SHA-256 digest: '+fingerprint.toLowerCase();return args[1]==='application-id'?policy.packageName:args[1]==='version-code'?'3':'false';};
  assert.deepEqual(inspectAndroidApk(apk,tools,run),{...candidate,certificateSha256:[fingerprint]});
  assert.equal(calls[0].tool,tools.apksigner);assert.ok(calls.every(c=>c.args.at(-1)===apk));
  assert.throws(()=>inspectAndroidApk(apk,tools,()=>{throw Error('Signature failure');}));
  assert.throws(()=>inspectAndroidApk(apk,tools,()=>''));
  assert.throws(()=>inspectAndroidApk(apk,tools,(tool,args)=>tool===tools.apksigner?run(tool,args):'malformed'));
  assert.throws(()=>inspectAndroidApk(apk.replace('.apk','.aab'),tools,run));
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
