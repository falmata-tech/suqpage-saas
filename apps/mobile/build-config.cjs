const hostedProfiles=new Set(['preview','production']);
const policy=require('./release-policy.json');
const crypto=require('node:crypto');
function mobileBuildSettings(env, { validateHosted = true } = {}){
 const profile=env.SUQPAGE_MOBILE_BUILD_PROFILE||env.EAS_BUILD_PROFILE||'development';
 if(!['development','preview','production'].includes(profile))throw Error('Unknown mobile build profile.');
 const hosted=hostedProfiles.has(profile);
 if(env.SUQPAGE_MOBILE_BUILD_PROFILE&&env.EAS_BUILD_PROFILE&&env.SUQPAGE_MOBILE_BUILD_PROFILE!==env.EAS_BUILD_PROFILE)throw Error('Requested and EAS build profiles must match.');
 if(env.EAS_BUILD_PLATFORM==='ios')throw Error('The AfricMade iOS application is not qualified for builds.');
 if(env.EXPO_PUBLIC_EAS_PROJECT_ID&&env.EXPO_PUBLIC_EAS_PROJECT_ID!==policy.expoProjectId)throw Error('Mobile configuration must use the reviewed AfricMade Expo project.');
 const api=env.EXPO_PUBLIC_API_ORIGIN||'';
 const auth=env.EXPO_PUBLIC_SUPABASE_URL||'';
 const dataTarget=env.SUQPAGE_MOBILE_DATA_TARGET||'';
 if(hosted && validateHosted){
  const target=Object.hasOwn(policy.dataTargets,dataTarget)?policy.dataTargets[dataTarget]:null;
  if(!target)throw Error('Choose an explicitly approved mobile data target.');
  for(const [name,value] of [['API origin',api],['Supabase URL',auth]]){let u;try{u=new URL(value);}catch{throw Error(`${name} is required for an installable hosted build.`);}if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||['localhost','127.0.0.1','0.0.0.0'].includes(u.hostname)||/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname))throw Error(`${name} must be an explicit hosted HTTPS origin.`);}
  if(api!==target.apiOrigin||auth!==target.authOrigin)throw Error('Mobile API and Auth origins must match the reviewed data target.');
  const key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
  if(!key)throw Error('Public Supabase key is required.');
  if(key.startsWith('sb_secret_'))throw Error('A secret Supabase key must never enter an app build.');
  if(key.startsWith('eyJ')){try{const payload=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());if(payload.role!=='anon')throw Error();}catch{throw Error('Use an anon or publishable Supabase key, never a service-role key.');}}
  else if(!key.startsWith('sb_publishable_'))throw Error('Use a Supabase publishable key.');
  if(!env.EXPO_PUBLIC_EAS_PROJECT_ID)throw Error('Link the owner’s EAS project before building.');
  if(env.EXPO_PUBLIC_EAS_PROJECT_ID!==policy.expoProjectId)throw Error('Mobile build must use the reviewed AfricMade Expo project.');
 }
 return {profile,hosted,api,auth,dataTarget,projectId:policy.expoProjectId,packageName:policy.packageName,appName:policy.appName,firebaseFileVariable:'AFRICMADE_GOOGLE_SERVICES_FILE'};
}
function privateMaterial(value,depth=0){
 if(depth>32)return true;
 if(typeof value==='string')return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(value);
 if(!value||typeof value!=='object')return false;
 return Object.entries(value).some(([key,nested])=>/private_key|client_secret|session_secret|service_role|keystore_password/i.test(key)||privateMaterial(nested,depth+1));
}
function validateFirebaseClient(input,env){
 if(!/^1:\d+:android:[a-f0-9]+$/.test(policy.firebaseAndroidAppId||''))throw Error('Register and verify the AfricMade Firebase Android app before building.');
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Select a Firebase Android client configuration object.');
 if(privateMaterial(input))throw Error('Private credentials must never be used as Firebase Android client configuration.');
 if(env.SUQPAGE_FIREBASE_PROJECT_ID!==policy.firebaseProjectId||input.project_info?.project_id!==policy.firebaseProjectId||String(input.project_info?.project_number)!==policy.firebaseProjectNumber)throw Error('Firebase client must match the reviewed AfricMade project and number.');
 if(!Array.isArray(input.client))throw Error('Firebase Android configuration does not match the registered AfricMade app.');
 const matchingClients=input.client.filter(c=>c?.client_info?.android_client_info?.package_name===policy.packageName);
 if(matchingClients.length!==1||matchingClients[0].client_info.mobilesdk_app_id!==policy.firebaseAndroidAppId)throw Error('Firebase Android configuration does not match the registered AfricMade app.');
}
function validateFirebaseClientSource(bytes,env){
 if(!/^[a-f0-9]{64}$/.test(policy.firebaseClientSha256||''))throw Error('Verify the downloaded AfricMade Firebase client before building.');
 if(!Buffer.isBuffer(bytes)||bytes.length>65536)throw Error('Firebase client configuration is invalid or too large.');
 let client;try{client=JSON.parse(bytes.toString('utf8'));}catch{throw Error('Firebase client configuration must be valid JSON.');}
 validateFirebaseClient(client,env);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==policy.firebaseClientSha256)throw Error('Firebase client bytes do not match the reviewed provider download.');
}
module.exports={mobileBuildSettings,validateFirebaseClient,validateFirebaseClientSource};
