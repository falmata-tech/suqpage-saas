const hostedProfiles=new Set(['preview','production']);
const policy=require('./release-policy.json');
function mobileBuildSettings(env, { validateHosted = true } = {}){
 const profile=env.SUQPAGE_MOBILE_BUILD_PROFILE||env.EAS_BUILD_PROFILE||'development';
 if(!['development','preview','production'].includes(profile))throw Error('Unknown mobile build profile.');
 const hosted=hostedProfiles.has(profile);
 if(env.SUQPAGE_MOBILE_BUILD_PROFILE&&env.EAS_BUILD_PROFILE&&env.SUQPAGE_MOBILE_BUILD_PROFILE!==env.EAS_BUILD_PROFILE)throw Error('Requested and EAS build profiles must match.');
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
  if(env.EXPO_PUBLIC_EAS_PROJECT_ID!==policy.expoProjectId)throw Error('Mobile build must use the reviewed Suqpage Expo project.');
 }
 return {profile,hosted,api,auth,dataTarget,projectId:env.EXPO_PUBLIC_EAS_PROJECT_ID||'',packageName:policy.packageName};
}
function privateMaterial(value,depth=0){
 if(depth>32)return true;
 if(typeof value==='string')return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(value);
 if(!value||typeof value!=='object')return false;
 return Object.entries(value).some(([key,nested])=>/private_key|client_secret|session_secret|service_role|keystore_password/i.test(key)||privateMaterial(nested,depth+1));
}
function validateFirebaseClient(input,env){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Select a Firebase Android client configuration object.');
 if(privateMaterial(input))throw Error('Private credentials must never be used as Firebase Android client configuration.');
 if(env.SUQPAGE_FIREBASE_PROJECT_ID!==policy.firebaseProjectId||input.project_info?.project_id!==policy.firebaseProjectId||String(input.project_info?.project_number)!==policy.firebaseProjectNumber)throw Error('Firebase client must match the reviewed Suqpage project and number.');
 if(!Array.isArray(input.client)||!input.client.some(c=>c?.client_info?.android_client_info?.package_name===policy.packageName&&typeof c.client_info?.mobilesdk_app_id==='string'&&c.client_info.mobilesdk_app_id.startsWith(`1:${policy.firebaseProjectNumber}:android:`)))throw Error('Firebase Android configuration does not match the canonical Suqpage app.');
}
module.exports={mobileBuildSettings,validateFirebaseClient};
