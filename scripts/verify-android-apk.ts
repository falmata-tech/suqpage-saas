import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateAndroidRelease} from '../lib/android-release-domain';
import {androidInspectionTools,inspectAndroidApk} from './operations/android-apk-inspection';

async function main(){
  const args=process.argv.slice(2),options:Record<string,string|boolean>={};
  for(let i=0;i<args.length;i++){
    const flag=args[i];
    if(!['--apk','--previous-apk','--first-canonical-release','--inspect'].includes(flag)||options[flag]!==undefined)throw Error('Use --apk, with --previous-apk or --first-canonical-release. --inspect is read-only metadata, not admission.');
    if(flag==='--inspect'||flag==='--first-canonical-release')options[flag]=true;
    else{const value=args[++i];if(!value||value.startsWith('--'))throw Error('APK file path is required.');options[flag]=value;}
  }
  if(typeof options['--apk']!=='string')throw Error('Select the downloaded APK with --apk.');
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const policy=JSON.parse(fs.readFileSync(path.join(root,'apps/mobile/release-policy.json'),'utf8'));
  const tools=androidInspectionTools(),candidate=inspectAndroidApk(options['--apk'],tools);
  if(options['--inspect']){if(options['--previous-apk']||options['--first-canonical-release'])throw Error('Inspection mode cannot admit a release.');console.log(JSON.stringify({inspectionOnly:true,releaseAdmitted:false,...candidate}));return;}
  const previous=typeof options['--previous-apk']==='string'?inspectAndroidApk(options['--previous-apk'],tools):null;
  const admitted=validateAndroidRelease(candidate,policy,previous,options['--first-canonical-release']===true);
  const hash=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(options['--apk']))hash.update(chunk);
  const sha256=hash.digest('hex'),directory=path.join(root,'.local/android-release-verification');fs.mkdirSync(directory,{recursive:true,mode:0o700});
  const receipt=path.join(directory,sha256+'.json');fs.writeFileSync(receipt,JSON.stringify({artifactVerified:true,...admitted,apkSha256:sha256,verifiedAt:new Date().toISOString(),firstCanonicalRelease:!previous,previousVersionCode:previous?.versionCode||null,limits:'Signature/version/package/debug admission only; target/build/device/API/store workflow gates still apply.'},null,2)+'\n',{mode:0o600});
  console.log(`PASS APK package/signature/version/debug checks. Protected receipt: ${receipt}`);
}
main().catch(error=>{console.error(error instanceof Error?error.message:'APK verification failed.');process.exitCode=1;});
