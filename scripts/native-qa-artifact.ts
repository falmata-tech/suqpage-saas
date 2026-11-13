import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {nativeQaDatabaseUrl,verifyNativeQaArtifact} from './native-qa-target';
nativeQaDatabaseUrl();
const file='.local/native-qa/native-build.json';
const apk='apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk';
const toolsRoot=path.join(process.env.ANDROID_HOME||'', 'build-tools');
const tools=fs.readdirSync(toolsRoot).sort().map(version=>path.join(toolsRoot,version,'aapt')).filter(file=>fs.existsSync(file));
if(!tools.length)throw Error('Android aapt is required before admitting a QA cache artifact.');
const badging=execFileSync(tools.at(-1)!,['dump','badging',apk],{encoding:'utf8',maxBuffer:2*1024*1024});
if(!badging.includes("package: name='com.africmade.qa'")||!badging.includes('application-debuggable'))throw Error('Only the separate debuggable QA package can be cached.');
const sha256=crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex');
const key=process.env.NATIVE_QA_CACHE_KEY||'';
if(process.argv.includes('--record')){
 const record={source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),key,sha256};
 verifyNativeQaArtifact(record,key,sha256);
 fs.writeFileSync(file,JSON.stringify(record)+'\n',{mode:0o600});
}else{
 verifyNativeQaArtifact(JSON.parse(fs.readFileSync(file,'utf8')),key,sha256);
 console.log('PASS native QA APK digest and exact native-input cache identity.');
}
