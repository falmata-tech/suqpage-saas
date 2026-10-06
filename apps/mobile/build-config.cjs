const hostedProfiles=new Set(['preview','production']);
function mobileBuildSettings(env, { validateHosted = true } = {}){
 const profile=env.SUQPAGE_MOBILE_BUILD_PROFILE||env.EAS_BUILD_PROFILE||'development';
 if(!['development','preview','production'].includes(profile))throw Error('Unknown mobile build profile.');
 const hosted=hostedProfiles.has(profile);
 const api=env.EXPO_PUBLIC_API_ORIGIN||'';
 const auth=env.EXPO_PUBLIC_SUPABASE_URL||'';
 if(hosted && validateHosted){
  for(const [name,value] of [['API origin',api],['Supabase URL',auth]]){let u;try{u=new URL(value);}catch{throw Error(`${name} is required for an installable hosted build.`);}if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||['localhost','127.0.0.1','0.0.0.0'].includes(u.hostname)||/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname))throw Error(`${name} must be an explicit hosted HTTPS origin.`);}
  const key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
  if(!key)throw Error('Public Supabase key is required.');
  if(key.startsWith('sb_secret_'))throw Error('A secret Supabase key must never enter an app build.');
  if(key.startsWith('eyJ')){try{const payload=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());if(payload.role!=='anon')throw Error();}catch{throw Error('Use an anon or publishable Supabase key, never a service-role key.');}}
  else if(!key.startsWith('sb_publishable_'))throw Error('Use a Supabase publishable key.');
  if(!env.EXPO_PUBLIC_EAS_PROJECT_ID)throw Error('Link the owner’s EAS project before building.');
 }
 return {profile,hosted,api,auth,projectId:env.EXPO_PUBLIC_EAS_PROJECT_ID||'',packageName:profile==='preview'?'com.suqpage.app.preview':'com.suqpage.app'};
}
module.exports={mobileBuildSettings};
