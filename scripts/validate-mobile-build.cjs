const {mobileBuildSettings,validateFirebaseClientSource}=require('../apps/mobile/build-config.cjs');
const fs=require('node:fs');
const config=require('../apps/mobile/app.json').expo;
const env={...process.env,EXPO_PUBLIC_EAS_PROJECT_ID:process.env.EXPO_PUBLIC_EAS_PROJECT_ID||config.extra?.eas?.projectId};
if(!['preview','production'].includes(env.SUQPAGE_MOBILE_BUILD_PROFILE||env.EAS_BUILD_PROFILE))throw Error('Choose the preview or production build profile.');
const build=mobileBuildSettings(env);
const file=env[build.firebaseFileVariable];
if(!file)throw Error('AfricMade requires its reviewed Firebase Android configuration.');
const descriptor=fs.openSync(file,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
try{
 const stat=fs.fstatSync(descriptor);
 if(!stat.isFile()||stat.size>65536)throw Error('Firebase client configuration must be a bounded regular file.');
 validateFirebaseClientSource(fs.readFileSync(descriptor),env);
}finally{fs.closeSync(descriptor);}
console.log(`Validated ${build.profile} build for ${build.packageName}, data target ${build.dataTarget}.`);
