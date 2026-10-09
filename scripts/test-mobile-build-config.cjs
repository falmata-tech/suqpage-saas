const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const{mobileBuildSettings}=require('../apps/mobile/build-config.cjs');
const policy=require('../apps/mobile/release-policy.json');
const env={SUQPAGE_MOBILE_BUILD_PROFILE:'preview',SUQPAGE_MOBILE_DATA_TARGET:'production',EXPO_PUBLIC_API_ORIGIN:policy.dataTargets.production.apiOrigin,EXPO_PUBLIC_SUPABASE_URL:policy.dataTargets.production.authOrigin,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',EXPO_PUBLIC_EAS_PROJECT_ID:policy.expoProjectId};
for(const profile of ['development','preview','production'])assert.equal(mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).packageName,'com.suqpage.app');
const profiles=require('../apps/mobile/eas.json');assert.equal(profiles.cli.appVersionSource,'remote');
assert.equal(profiles.build.preview.autoIncrement,true);assert.equal(profiles.build.production.autoIncrement,true);
assert.equal(profiles.build.preview.android.buildType,'apk');assert.equal(profiles.build.production.android.buildType,'app-bundle');
assert.equal(profiles.build.preview.distribution,'internal');
const ts=require('typescript'),source=require('node:fs').readFileSync('apps/mobile/app.config.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
for(const profile of ['development','preview','production']){
 const configEnv={SUQPAGE_MOBILE_BUILD_PROFILE:profile};const scope={module:{exports:{}},process:{env:configEnv},require:id=>id==='./build-config.cjs'?require('../apps/mobile/build-config.cjs'):require('../apps/mobile/link-config.cjs')};scope.exports=scope.module.exports;
 require('node:vm').runInNewContext(compiled,scope);const config=scope.module.exports.default({config:require('../apps/mobile/app.json').expo});assert.equal(config.name,'Suqpage');assert.equal(config.android.package,'com.suqpage.app');assert.equal(config.ios.bundleIdentifier,'com.suqpage.app');
}
for(const profile of ['preview','production'])for(const key of ['EXPO_PUBLIC_API_ORIGIN','EXPO_PUBLIC_SUPABASE_URL','EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY','EXPO_PUBLIC_EAS_PROJECT_ID'])assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,[key]:''}));
for(const value of ['http://127.0.0.1:3102','https://192.168.1.20','https://user:pass@suqpage.com','https://suqpage.com/path','https://suqpage.com?token=x'])assert.throws(()=>mobileBuildSettings({...env,EXPO_PUBLIC_API_ORIGIN:value}));
for(const role of ['service_role','authenticated'])assert.throws(()=>mobileBuildSettings({...env,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'eyJ.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.sig'}));
assert.throws(()=>mobileBuildSettings({...env,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_private'}));
assert.equal(mobileBuildSettings({}).hosted,false);
assert.equal(mobileBuildSettings({SUQPAGE_MOBILE_BUILD_PROFILE:'preview'},{validateHosted:false}).packageName,'com.suqpage.app');
const missing=spawnSync(process.execPath,['scripts/validate-mobile-build.cjs'],{env:{PATH:process.env.PATH,SUQPAGE_MOBILE_BUILD_PROFILE:'preview'},encoding:'utf8'});
assert.notEqual(missing.status,0);assert.match(missing.stderr,/approved mobile data target/);
for(const profile of ['preview','production']){
 for(const extra of [{SUQPAGE_MOBILE_DATA_TARGET:''},{SUQPAGE_MOBILE_DATA_TARGET:'staging'},{SUQPAGE_MOBILE_DATA_TARGET:'__proto__'},{EXPO_PUBLIC_API_ORIGIN:'https://wrong.example'},{EXPO_PUBLIC_SUPABASE_URL:'https://wrong.supabase.co'},{EXPO_PUBLIC_EAS_PROJECT_ID:'foreign-project'},{EAS_BUILD_PROFILE:profile==='preview'?'production':'preview'}])assert.throws(()=>mobileBuildSettings({...env,SUQPAGE_MOBILE_BUILD_PROFILE:profile,...extra}));
}
for(const profile of ['preview','production']){assert.equal(profiles.build[profile].env.SUQPAGE_MOBILE_DATA_TARGET,'production');assert.equal(profiles.build[profile].environment,profile);}
assert.equal(profiles.cli.requireCommit,true);assert.equal(profiles.submit.production.android.track,'internal');assert.equal(profiles.submit.production.android.releaseStatus,'draft');
console.log('Mobile build config checks passed: explicit hosted targets, public keys, EAS prerequisites and one permanent Suqpage identity.');

const fs=require('node:fs');
const ignore=require('ignore')().add(fs.readFileSync('.easignore','utf8'));
for(const filename of ['.git','.git/objects/example','.local/review.json','.env.local','apps/mobile/.env.local','credentials.json','keys/private.keystore','suqpage-firebase-adminsdk-fixture.json','apps/mobile/push-service-account.json'])assert.equal(ignore.ignores(filename),true,`Private upload path: ${filename}`);
for(const filename of ['package.json','package-lock.json','apps/mobile/app.config.ts'])assert.equal(ignore.ignores(filename),false,`Required build path: ${filename}`);
console.log('Expo upload excludes the literal .git path and private runtime/signing files.');
