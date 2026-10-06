import type {ConfigContext,ExpoConfig} from 'expo/config';
const {mobileBuildSettings}=require('./build-config.cjs') as {mobileBuildSettings:(env:NodeJS.ProcessEnv,options?:{validateHosted:boolean})=>{profile:string;hosted:boolean;api:string;auth:string;projectId:string;packageName:string}};
const {androidAppLinks}=require('./link-config.cjs') as {androidAppLinks:(packageName:string)=>NonNullable<ExpoConfig['android']>['intentFilters']};
export default ({config}:ConfigContext):ExpoConfig=>{
 // Credential setup needs the package identity before hosted runtime configuration.
 // EAS workers and the post-install build hook enforce all hosted prerequisites.
 const build=mobileBuildSettings({...process.env,EXPO_PUBLIC_EAS_PROJECT_ID:process.env.EXPO_PUBLIC_EAS_PROJECT_ID||config.extra?.eas?.projectId},{validateHosted:process.env.EAS_BUILD==='true'});
 return {...config,name:build.profile==='preview'?'Suqpage Preview':'Suqpage',slug:'suqpage',android:{...config.android,package:build.packageName,versionCode:1,intentFilters:androidAppLinks(build.packageName),blockedPermissions:['android.permission.ACCESS_COARSE_LOCATION','android.permission.ACCESS_FINE_LOCATION','android.permission.RECORD_AUDIO','android.permission.READ_MEDIA_AUDIO','android.permission.READ_MEDIA_VIDEO','android.permission.READ_MEDIA_IMAGES']},ios:{...config.ios,bundleIdentifier:build.packageName},extra:{...config.extra,...(build.projectId?{eas:{projectId:build.projectId}}:{})}};
};
