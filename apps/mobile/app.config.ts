import type {ConfigContext,ExpoConfig} from 'expo/config';
const {mobileBuildSettings}=require('./build-config.cjs') as {mobileBuildSettings:(env:NodeJS.ProcessEnv,options?:{validateHosted:boolean})=>{profile:string;hosted:boolean;api:string;auth:string;projectId:string;packageName:string;appName:string;firebaseFileVariable:string}};
const {androidAppLinks}=require('./link-config.cjs') as {androidAppLinks:(packageName:string)=>NonNullable<ExpoConfig['android']>['intentFilters']};
export default ({config}:ConfigContext):ExpoConfig=>{
 // Credential setup needs the package identity before hosted runtime configuration.
 // EAS workers and the post-install build hook enforce all hosted prerequisites.
 const build=mobileBuildSettings({...process.env,EXPO_PUBLIC_EAS_PROJECT_ID:process.env.EXPO_PUBLIC_EAS_PROJECT_ID||config.extra?.eas?.projectId},{validateHosted:process.env.EAS_BUILD==='true'});
 const {scheme:_oldScheme,...base}=config;
 const plugins=(config.plugins||[]).map(plugin=>(typeof plugin==='string'?plugin:plugin[0])==='expo-notifications'?['expo-notifications',{icon:'./assets/africmade-notification.png',color:'#ff4b00'}] as [string,Record<string,string>]:plugin);
 return {...base,name:build.appName,slug:'suqpage',plugins,android:{...config.android,package:build.packageName,scheme:'africmade',googleServicesFile:process.env[build.firebaseFileVariable],versionCode:3,intentFilters:androidAppLinks(build.packageName),blockedPermissions:['android.permission.ACCESS_COARSE_LOCATION','android.permission.ACCESS_FINE_LOCATION','android.permission.RECORD_AUDIO','android.permission.READ_MEDIA_AUDIO','android.permission.READ_MEDIA_VIDEO','android.permission.READ_MEDIA_IMAGES']},ios:{...config.ios,scheme:'suqpage'},extra:{...config.extra,...(build.projectId?{eas:{projectId:build.projectId}}:{})}};
};
