import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {signingFingerprint,type AndroidArtifactMetadata} from '../../lib/android-release-domain';

export type AndroidToolRunner=(executable:string,args:readonly string[])=>string;
export type AndroidInspectionTools={apkanalyzer:string;apksigner:string};

export function androidInspectionTools():AndroidInspectionTools{
  const sdk=process.env.ANDROID_SDK_ROOT||process.env.ANDROID_HOME||path.join(os.homedir(),'Library/Android/sdk');
  const directory=path.join(sdk,'build-tools');
  if(!fs.existsSync(directory))throw Error('Android SDK build tools are required to inspect an APK.');
  const versions=fs.readdirSync(directory).filter(v=>/^\d+\.\d+\.\d+$/.test(v)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
  const apksigner=versions.map(v=>path.join(directory,v,'apksigner')).find(file=>fs.existsSync(file));
  const apkanalyzer=path.join(sdk,'cmdline-tools/latest/bin/apkanalyzer');
  if(!apksigner||!fs.existsSync(apkanalyzer))throw Error('Install Android apksigner and apkanalyzer before APK verification.');
  return {apksigner,apkanalyzer};
}
export const runAndroidTool:AndroidToolRunner=(executable,args)=>{
  const env={...process.env};
  if(process.platform==='darwin'&&!env.JAVA_HOME)env.JAVA_HOME=execFileSync('/usr/libexec/java_home',['-v','17'],{encoding:'utf8',timeout:5000}).trim();
  try{return execFileSync(executable,[...args],{encoding:'utf8',env,timeout:30000,maxBuffer:262144,stdio:['ignore','pipe','pipe']});}
  catch{throw Error('Android artifact inspection failed; no release was admitted.');}
};

export function inspectAndroidApk(file:string,tools:AndroidInspectionTools,run:AndroidToolRunner=runAndroidTool):AndroidArtifactMetadata{
  const apk=path.resolve(file);
  if(path.extname(apk).toLowerCase()!=='.apk'||!fs.existsSync(apk)||!fs.statSync(apk).isFile())throw Error('Select an existing APK file; AAB files are not installable APKs.');
  // Absolute paths and argument arrays prevent shell/option interpolation.
  const signed=run(tools.apksigner,['verify','--print-certs',apk]);
  const certificates=[...signed.matchAll(/Signer #\d+ certificate SHA-256 digest:\s*([A-Fa-f0-9]{64})/g)].map(m=>signingFingerprint(m[1]));
  if(!certificates.length)throw Error('APK has no verified signing certificate.');
  const packageName=run(tools.apkanalyzer,['manifest','application-id',apk]).trim();
  const version=run(tools.apkanalyzer,['manifest','version-code',apk]).trim();
  const debug=run(tools.apkanalyzer,['manifest','debuggable',apk]).trim();
  if(!/^[a-zA-Z0-9_.]+$/.test(packageName)||!/^\d+$/.test(version)||!['true','false'].includes(debug))throw Error('Android SDK returned invalid artifact metadata.');
  return {packageName,versionCode:Number(version),debuggable:debug==='true',certificateSha256:certificates};
}
