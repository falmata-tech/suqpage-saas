const {mobileBuildSettings,validateFirebaseClient}=require('../apps/mobile/build-config.cjs');
const fs=require('node:fs');
const config=require('../apps/mobile/app.json').expo;
const env={...process.env,EXPO_PUBLIC_EAS_PROJECT_ID:process.env.EXPO_PUBLIC_EAS_PROJECT_ID||config.extra?.eas?.projectId};
if(!['preview','production'].includes(env.SUQPAGE_MOBILE_BUILD_PROFILE||env.EAS_BUILD_PROFILE))throw Error('Choose the preview or production build profile.');
const build=mobileBuildSettings(env);
const file=env.SUQPAGE_GOOGLE_SERVICES_FILE;
if(env.SUQPAGE_MOBILE_NOTIFICATIONS_ENABLED==='1'&&!file)throw Error('The notification build requires the reviewed Firebase Android configuration.');
if(file){
 if(fs.statSync(file).size>65536)throw Error('Firebase client configuration is too large.');
 let client;try{client=JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw Error('Firebase client configuration must be valid JSON.');}
 validateFirebaseClient(client,env);
}
console.log(`Validated ${build.profile} build for ${build.packageName}, data target ${build.dataTarget}.`);
