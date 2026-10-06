const {mobileBuildSettings}=require('../apps/mobile/build-config.cjs');
const config=require('../apps/mobile/app.json').expo;
const env={...process.env,EXPO_PUBLIC_EAS_PROJECT_ID:process.env.EXPO_PUBLIC_EAS_PROJECT_ID||config.extra?.eas?.projectId};
if(!['preview','production'].includes(env.SUQPAGE_MOBILE_BUILD_PROFILE||env.EAS_BUILD_PROFILE))throw Error('Choose the preview or production build profile.');
const build=mobileBuildSettings(env);
console.log(`Validated ${build.profile} build configuration for ${build.packageName}.`);
