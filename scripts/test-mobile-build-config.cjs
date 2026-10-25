const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),vm=require('node:vm');
const actualBuild=require('../apps/mobile/build-config.cjs');
const policy=require('../apps/mobile/release-policy.json');
assert.deepEqual(policy.dataTargets,{'mirtpage-production':{apiOrigin:'https://mirtpage.com',authOrigin:'https://sjeiiqxgscuqajpgddcc.supabase.co'}},'Only the verified MirtPage production runtime is admitted');
assert.equal(policy.appName,'AfricMade');assert.equal(policy.packageName,'com.africmade.app');
assert.ok(policy.firebaseAndroidAppId===null||/^1:588262779708:android:[a-f0-9]+$/.test(policy.firebaseAndroidAppId),'Firebase app ID must be absent or bound to the reviewed project');
assert.ok(policy.firebaseClientSha256===null||/^[a-f0-9]{64}$/.test(policy.firebaseClientSha256),'Firebase client digest must be absent or a reviewed SHA-256');
const{mobileBuildSettings}=actualBuild;
const env={SUQPAGE_MOBILE_BUILD_PROFILE:'preview',SUQPAGE_MOBILE_DATA_TARGET:'mirtpage-production',EXPO_PUBLIC_API_ORIGIN:policy.dataTargets['mirtpage-production'].apiOrigin,EXPO_PUBLIC_SUPABASE_URL:policy.dataTargets['mirtpage-production'].authOrigin,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',EXPO_PUBLIC_EAS_PROJECT_ID:policy.expoProjectId};
for(const profile of ['development','preview','production']){assert.equal(mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).packageName,'com.africmade.app');assert.equal(mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).appName,'AfricMade');}
for(const profile of ['preview','production'])assert.equal(mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).dataTarget,'mirtpage-production');
const profiles=require('../apps/mobile/eas.json');assert.equal(profiles.cli.appVersionSource,'remote');
assert.equal(profiles.build.preview.autoIncrement,true);assert.equal(profiles.build.production.autoIncrement,true);
assert.equal(profiles.build.preview.android.buildType,'apk');assert.equal(profiles.build.production.android.buildType,'app-bundle');
assert.equal(profiles.build.preview.distribution,'internal');
const ts=require('typescript'),source=require('node:fs').readFileSync('apps/mobile/app.config.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
for(const profile of ['development','preview','production']){
 const configEnv={SUQPAGE_MOBILE_BUILD_PROFILE:profile};const scope={module:{exports:{}},process:{env:configEnv},require:id=>id==='./build-config.cjs'?require('../apps/mobile/build-config.cjs'):require('../apps/mobile/link-config.cjs')};scope.exports=scope.module.exports;
 vm.runInNewContext(compiled,scope);const input=require('../apps/mobile/app.json').expo;const config=scope.module.exports.default({config:{...input,scheme:'suqpage',android:{...input.android,googleServicesFile:'OLD_STATIC_FILE'}}});assert.equal(config.name,'AfricMade');assert.equal(config.android.package,'com.africmade.app');assert.equal(config.ios.bundleIdentifier,'com.suqpage.app');assert.equal(config.slug,'suqpage');assert.equal(config.extra.eas.projectId,policy.expoProjectId);assert.equal(config.scheme,undefined);assert.equal(config.android.scheme,'africmade');assert.equal(config.ios.scheme,'suqpage');assert.equal(config.android.googleServicesFile,undefined,'Never fall back to old static source');
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
assert.throws(()=>mobileBuildSettings({EXPO_PUBLIC_EAS_PROJECT_ID:'foreign-project'},{validateHosted:false}),/reviewed AfricMade Expo project/,'Even credential/config inspection cannot target a foreign project');
assert.equal(mobileBuildSettings({ANDROID_PACKAGE:'com.suqpage.app'},{validateHosted:false}).packageName,'com.africmade.app');
for(const profile of ['development','preview','production','mirtpage-preview','legacy','__proto__']){
 if(['development','preview','production'].includes(profile))assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,EAS_BUILD_PLATFORM:'ios'}),/iOS/);
 else assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}),/Unknown/);
}
const missing=spawnSync(process.execPath,['scripts/validate-mobile-build.cjs'],{env:{PATH:process.env.PATH,SUQPAGE_MOBILE_BUILD_PROFILE:'preview'},encoding:'utf8'});
assert.notEqual(missing.status,0);assert.match(missing.stderr,/approved mobile data target/);
for(const profile of ['preview','production']){
 for(const extra of [{SUQPAGE_MOBILE_DATA_TARGET:''},{SUQPAGE_MOBILE_DATA_TARGET:'staging'},{SUQPAGE_MOBILE_DATA_TARGET:'__proto__'},{EXPO_PUBLIC_API_ORIGIN:'https://wrong.example'},{EXPO_PUBLIC_SUPABASE_URL:'https://wrong.supabase.co'},{EXPO_PUBLIC_EAS_PROJECT_ID:'foreign-project'},{EAS_BUILD_PROFILE:profile==='preview'?'production':'preview'}])assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,...extra}));
}
for(const profile of ['preview','production']){assert.equal(profiles.build[profile].env.SUQPAGE_MOBILE_DATA_TARGET,'mirtpage-production');assert.equal(profiles.build[profile].env.EXPO_PUBLIC_API_ORIGIN,'https://mirtpage.com');assert.equal(profiles.build[profile].env.EXPO_PUBLIC_SUPABASE_URL,'https://sjeiiqxgscuqajpgddcc.supabase.co');assert.equal(profiles.build[profile].environment,profile);}
assert.equal(profiles.cli.requireCommit,true);assert.equal(profiles.submit.production.android.track,'internal');assert.equal(profiles.submit.production.android.releaseStatus,'draft');
assert.equal(profiles.submit.production.android.serviceAccountKeyPath,'../../.local/africmade-play-submit/credentials.json','New app cannot borrow the old app-scoped submission source');
console.log('Mobile build config checks passed: AfricMade package, exact qualified production target, wrong-target denial, public keys and EAS/file/scheme boundaries.');

const ignore=require('ignore')().add(fs.readFileSync('.easignore','utf8'));
for(const filename of ['.git','.git/objects/example','.local/review.json','.env.local','apps/mobile/.env.local','credentials.json','keys/private.keystore','suqpage-firebase-adminsdk-fixture.json','apps/mobile/push-service-account.json'])assert.equal(ignore.ignores(filename),true,`Private upload path: ${filename}`);
for(const filename of ['package.json','package-lock.json','apps/mobile/app.config.ts'])assert.equal(ignore.ignores(filename),false,`Required build path: ${filename}`);
console.log('Expo upload excludes the literal .git path and private runtime/signing files.');
