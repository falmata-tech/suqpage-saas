const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),vm=require('node:vm');
const actualBuild=require('../apps/mobile/build-config.cjs');
const policy=require('../apps/mobile/release-policy.json');
assert.deepEqual(policy.dataTargets,{'africmade-production':{apiOrigin:'https://africmade.com',authOrigin:'https://sjeiiqxgscuqajpgddcc.supabase.co'}},'Only the verified AfricMade production runtime is admitted');
assert.equal(policy.appName,'AfricMade');assert.equal(policy.packageName,'com.africmade.app');
assert.equal(policy.publicOrigin,'https://africmade.com');
assert.equal(policy.expoProjectId,'1908b4c4-bdf6-4744-b373-8dc6979e54b0','Only the independently verified standalone AfricMade Expo project is admitted');
const expoConfig=require('../apps/mobile/app.json').expo;
assert.equal(expoConfig.owner,'falmatad');assert.equal(expoConfig.slug,'africmade');
assert.equal(expoConfig.extra.eas.projectId,policy.expoProjectId,'The app config and reviewed build policy must identify the same Expo project');
assert.match(policy.firebaseProjectNumber,/^\d+$/,'Reviewed Firebase project number must be numeric');
assert.ok(policy.firebaseAndroidAppId===null||new RegExp(`^1:${policy.firebaseProjectNumber}:android:[a-f0-9]+$`).test(policy.firebaseAndroidAppId),'Firebase app ID must be absent or bound to the reviewed project');
assert.ok(policy.firebaseClientSha256===null||/^[a-f0-9]{64}$/.test(policy.firebaseClientSha256),'Firebase client digest must be absent or a reviewed SHA-256');
const{mobileBuildSettings}=actualBuild;
const env={SUQPAGE_MOBILE_BUILD_PROFILE:'preview',SUQPAGE_MOBILE_DATA_TARGET:'africmade-production',EXPO_PUBLIC_API_ORIGIN:policy.dataTargets['africmade-production'].apiOrigin,EXPO_PUBLIC_SUPABASE_URL:policy.dataTargets['africmade-production'].authOrigin,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',EXPO_PUBLIC_EAS_PROJECT_ID:policy.expoProjectId};
assert.throws(()=>mobileBuildSettings({...env,EXPO_PUBLIC_EAS_PROJECT_ID:'bfc289fb-238e-44a3-9e0f-fec6a7c857d1'}),/reviewed AfricMade Expo project/,'The former EAS project must be rejected before a build');
for(const profile of ['development','preview','production']){assert.equal(mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).packageName,'com.africmade.app');assert.equal(mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).appName,'AfricMade');}
for(const profile of ['preview','production'])assert.equal(mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).dataTarget,'africmade-production');
for(const profile of ['preview','production']){
 assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,SUQPAGE_MOBILE_DATA_TARGET:'mirtpage-production'}),/approved mobile data target/,'The former production target cannot enter a new build');
 assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,EXPO_PUBLIC_API_ORIGIN:'https://mirtpage.com'}),/must match the reviewed data target/,'The former API origin cannot enter a new build');
 assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,SUQPAGE_MOBILE_DATA_TARGET:'mirtpage-production'},{validateHosted:false}),/approved mobile data target/,'Config inspection must also reject the former target');
 assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,EXPO_PUBLIC_API_ORIGIN:'https://mirtpage.com'},{validateHosted:false}),/must match the reviewed data target/,'Config inspection must also reject the former API origin');
}
for(const profile of ['development','preview','production']){
 const modern={...env,AFRICMADE_MOBILE_BUILD_PROFILE:profile,AFRICMADE_MOBILE_DATA_TARGET:'africmade-production'};
 delete modern.SUQPAGE_MOBILE_BUILD_PROFILE;delete modern.SUQPAGE_MOBILE_DATA_TARGET;
 assert.equal(mobileBuildSettings(modern).profile,profile);
 assert.equal(mobileBuildSettings(modern).dataTarget,'africmade-production');
 assert.throws(()=>mobileBuildSettings({...modern,SUQPAGE_MOBILE_BUILD_PROFILE:profile==='production'?'preview':'production'}),/must agree/);
 assert.throws(()=>mobileBuildSettings({...modern,SUQPAGE_MOBILE_DATA_TARGET:'wrong-target'}),/must agree/);
}
const profiles=require('../apps/mobile/eas.json');assert.equal(profiles.cli.appVersionSource,'remote');
assert.equal(profiles.build.preview.autoIncrement,true);assert.equal(profiles.build.production.autoIncrement,true);
assert.equal(profiles.build.preview.android.buildType,'apk');assert.equal(profiles.build.production.android.buildType,'app-bundle');
assert.equal(profiles.build.preview.distribution,'internal');
const ts=require('typescript'),source=require('node:fs').readFileSync('apps/mobile/app.config.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
for(const profile of ['development','preview','production']){
 const configEnv={SUQPAGE_MOBILE_BUILD_PROFILE:profile};const scope={module:{exports:{}},process:{env:configEnv},require:id=>id==='./build-config.cjs'?require('../apps/mobile/build-config.cjs'):require('../apps/mobile/link-config.cjs')};scope.exports=scope.module.exports;
 vm.runInNewContext(compiled,scope);const input=require('../apps/mobile/app.json').expo;const config=scope.module.exports.default({config:{...input,scheme:'suqpage',ios:{...input.ios,bundleIdentifier:'com.suqpage.app',scheme:'suqpage'},android:{...input.android,versionCode:1,googleServicesFile:'OLD_STATIC_FILE'}}});assert.equal(config.name,'AfricMade');assert.equal(config.android.package,'com.africmade.app');assert.equal(config.android.versionCode,4,'Every admitted profile advances the previous canonical v3 even with a stale base code');assert.equal(scope.module.exports.default({config:{...input,android:{...input.android,versionCode:3}}}).android.versionCode,4,'The canonical v3 base must advance to v4');assert.equal(config.ios.bundleIdentifier,'com.africmade.app');assert.equal(config.slug,'africmade');assert.equal(config.extra.eas.projectId,policy.expoProjectId);assert.equal(config.scheme,undefined);assert.equal(config.android.scheme,'africmade');assert.equal(config.ios.scheme,'africmade');assert.equal(config.android.googleServicesFile,undefined,'Never fall back to old static source');
 configEnv.SUQPAGE_GOOGLE_SERVICES_FILE='OLD_FILE';assert.equal(scope.module.exports.default({config:input}).android.googleServicesFile,undefined);
 configEnv.MIRTPAGE_GOOGLE_SERVICES_FILE='OLD_PACKAGE_FILE';assert.equal(scope.module.exports.default({config:input}).android.googleServicesFile,undefined);
 configEnv.AFRICMADE_GOOGLE_SERVICES_FILE='NEW_FILE';assert.equal(scope.module.exports.default({config:input}).android.googleServicesFile,'NEW_FILE');
 assert.ok(!JSON.stringify(config.extra).includes('FILE'));assert.equal(config.plugins.filter(p=>(Array.isArray(p)?p[0]:p)==='expo-notifications').length,1);
 const plugin=config.plugins.find(p=>Array.isArray(p)&&p[0]==='expo-notifications');assert.equal(plugin[1].icon,'./assets/africmade-notification.png');assert.equal(plugin[1].color,'#ff4b00');
}
for(const profile of ['preview','production'])for(const key of ['EXPO_PUBLIC_API_ORIGIN','EXPO_PUBLIC_SUPABASE_URL','EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY','EXPO_PUBLIC_EAS_PROJECT_ID'])assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,[key]:''}));
for(const value of ['http://127.0.0.1:3102','https://192.168.1.20','https://user:pass@suqpage.com','https://suqpage.com/path','https://suqpage.com?token=x'])assert.throws(()=>mobileBuildSettings({...env,EXPO_PUBLIC_API_ORIGIN:value}));
for(const role of ['service_role','authenticated'])assert.throws(()=>mobileBuildSettings({...env,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'eyJ.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.sig'}));
assert.throws(()=>mobileBuildSettings({...env,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_private'}));
assert.equal(mobileBuildSettings({}).hosted,false);
assert.equal(mobileBuildSettings({SUQPAGE_MOBILE_BUILD_PROFILE:'preview'},{validateHosted:false}).packageName,'com.africmade.app');
assert.equal(mobileBuildSettings({AFRICMADE_MOBILE_BUILD_PROFILE:'preview'},{validateHosted:false}).packageName,'com.africmade.app');
assert.throws(()=>mobileBuildSettings({EXPO_PUBLIC_EAS_PROJECT_ID:'foreign-project'},{validateHosted:false}),/reviewed AfricMade Expo project/,'Even credential/config inspection cannot target a foreign project');
assert.equal(mobileBuildSettings({ANDROID_PACKAGE:'com.suqpage.app'},{validateHosted:false}).packageName,'com.africmade.app');
for(const profile of ['development','preview','production','mirtpage-preview','legacy','__proto__']){
 if(['development','preview','production'].includes(profile))assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,EAS_BUILD_PLATFORM:'ios'}),/iOS/);
 else assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}),/Unknown/);
}
const missing=spawnSync(process.execPath,['scripts/validate-mobile-build.cjs'],{env:{PATH:process.env.PATH,SUQPAGE_MOBILE_BUILD_PROFILE:'preview'},encoding:'utf8'});
assert.notEqual(missing.status,0);assert.match(missing.stderr,/approved mobile data target/);
const modernMissing=spawnSync(process.execPath,['scripts/validate-mobile-build.cjs'],{env:{PATH:process.env.PATH,AFRICMADE_MOBILE_BUILD_PROFILE:'preview'},encoding:'utf8'});
assert.notEqual(modernMissing.status,0);assert.match(modernMissing.stderr,/approved mobile data target/);
for(const profile of ['preview','production']){
 for(const extra of [{SUQPAGE_MOBILE_DATA_TARGET:''},{SUQPAGE_MOBILE_DATA_TARGET:'staging'},{SUQPAGE_MOBILE_DATA_TARGET:'__proto__'},{EXPO_PUBLIC_API_ORIGIN:'https://wrong.example'},{EXPO_PUBLIC_SUPABASE_URL:'https://wrong.supabase.co'},{EXPO_PUBLIC_EAS_PROJECT_ID:'foreign-project'},{EAS_BUILD_PROFILE:profile==='preview'?'production':'preview'}])assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,...extra}));
}
for(const profile of ['preview','production']){assert.equal(profiles.build[profile].env.AFRICMADE_FIREBASE_PROJECT_ID,policy.firebaseProjectId,'Build-profile env must pin the reviewed standalone Firebase project over stale hosted values');assert.equal(profiles.build[profile].env.AFRICMADE_MOBILE_DATA_TARGET,'africmade-production');assert.equal(profiles.build[profile].env.AFRICMADE_MOBILE_BUILD_PROFILE,profile);assert.equal(profiles.build[profile].env.EXPO_PUBLIC_API_ORIGIN,'https://africmade.com');assert.equal(profiles.build[profile].env.EXPO_PUBLIC_SUPABASE_URL,'https://sjeiiqxgscuqajpgddcc.supabase.co');assert.equal(profiles.build[profile].environment,profile);assert.equal(mobileBuildSettings({...profiles.build[profile].env,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',EXPO_PUBLIC_EAS_PROJECT_ID:policy.expoProjectId}).api,'https://africmade.com','The actual EAS profile must resolve the AfricMade API');}
assert.equal(profiles.cli.requireCommit,true);assert.equal(profiles.submit.production.android.track,'internal');assert.equal(profiles.submit.production.android.releaseStatus,'draft');
assert.equal(profiles.submit.production.android.serviceAccountKeyPath,'../../.local/africmade-play-submit/credentials.json','New app cannot borrow the old app-scoped submission source');
console.log('Mobile build config checks passed: AfricMade package, exact qualified production target, wrong-target denial, public keys and EAS/file/scheme boundaries.');

const ignore=require('ignore')().add(fs.readFileSync('.easignore','utf8'));
for(const filename of ['.git','.git/objects/example','.local/review.json','.env.local','apps/mobile/.env.local','credentials.json','keys/private.keystore','suqpage-firebase-adminsdk-fixture.json','apps/mobile/push-service-account.json'])assert.equal(ignore.ignores(filename),true,`Private upload path: ${filename}`);
for(const filename of ['package.json','package-lock.json','apps/mobile/app.config.ts'])assert.equal(ignore.ignores(filename),false,`Required build path: ${filename}`);
console.log('Expo upload excludes the literal .git path and private runtime/signing files.');
