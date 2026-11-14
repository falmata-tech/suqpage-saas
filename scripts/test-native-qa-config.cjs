const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const {spawnSync}=require('node:child_process');
const {nativeQaConfig} = require('../apps/mobile/native-qa-config.cjs');
const good = {AFRICMADE_NATIVE_QA:'1', AFRICMADE_MOBILE_BUILD_PROFILE:'development',
  EXPO_PUBLIC_API_ORIGIN:'http://10.0.2.2:3000', EXPO_PUBLIC_NATIVE_MAP_FIXTURE:'1'};
const base = JSON.parse(fs.readFileSync('apps/mobile/app.json','utf8')).expo;
const qa = nativeQaConfig(base, good);
assert.equal(qa.name,'AfricMade QA'); assert.equal(qa.android.package,'com.africmade.qa');
assert.equal(qa.android.googleServicesFile,undefined); assert.deepEqual(qa.android.intentFilters,[]);
assert.equal(qa.extra.eas,undefined); assert.equal(base.android.package,'com.africmade.app');
for (const flag of ['', '0', 'true']) assert.throws(()=>nativeQaConfig(base,{...good,AFRICMADE_NATIVE_QA:flag}));
for (const api of ['', 'https://africmade.com', 'http://10.0.2.2:3000/path', 'http://localhost:3000'])
  assert.throws(()=>nativeQaConfig(base,{...good,EXPO_PUBLIC_API_ORIGIN:api}));
for (const profile of ['preview','production']) assert.throws(()=>nativeQaConfig(base,{...good,AFRICMADE_MOBILE_BUILD_PROFILE:profile}));
for (const key of ['EAS_BUILD','EAS_BUILD_PROFILE','EAS_BUILD_PLATFORM','EXPO_TOKEN','EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY','AFRICMADE_MOBILE_DATA_TARGET','SUQPAGE_MOBILE_DATA_TARGET',
  'AFRICMADE_GOOGLE_SERVICES_FILE','SUQPAGE_GOOGLE_SERVICES_FILE','MIRTPAGE_GOOGLE_SERVICES_FILE'])
  assert.throws(()=>nativeQaConfig(base,{...good,[key]:'forbidden-fixture'}));
assert.throws(()=>nativeQaConfig(base,{...good,EXPO_PUBLIC_NATIVE_MAP_FIXTURE:undefined}));
const compiled = ts.transpileModule(fs.readFileSync('apps/mobile/app.config.ts','utf8'),
  {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const scope = {module:{exports:{}},process:{env:good},require:id=>require('../apps/mobile/'+id.slice(2))};
scope.exports=scope.module.exports; vm.runInNewContext(compiled,scope);
const actual=scope.module.exports.default({config:base});
assert.equal(actual.android.package,'com.africmade.qa'); assert.equal(actual.name,'AfricMade QA');
assert.equal(actual.extra.eas,undefined); assert.equal(actual.slug,'africmade-qa');
const {nativeQaDatabaseUrl,nativeQaSchema,verifyNativeQaArtifact}=require('./native-qa-target.ts');
const local={CI:'true',SUQPAGE_TEST_POSTGRES_URL:'postgresql://qa:fixture@127.0.0.1:5432/suqpage_native_qa'};
assert.equal(nativeQaDatabaseUrl(local).pathname,'/suqpage_native_qa');
for(const value of ['postgresql://qa@db.example.test/suqpage_native_qa','postgresql://qa@127.0.0.1/production',
 'postgresql://qa@127.0.0.1/suqpage_native_qa?options=bad','https://127.0.0.1/suqpage_native_qa'])
 assert.throws(()=>nativeQaDatabaseUrl({...local,SUQPAGE_TEST_POSTGRES_URL:value}));
assert.throws(()=>nativeQaDatabaseUrl({...local,CI:'false'}));
assert.equal(nativeQaSchema('suqpage_test_'+'a'.repeat(32)),'suqpage_test_'+'a'.repeat(32));
for(const value of ['public','suqpage_test_bad','public;DROP SCHEMA public',null])assert.throws(()=>nativeQaSchema(value));
const key='native-qa-apk-v2-Linux-X64-'+'a'.repeat(64),digest='b'.repeat(64),artifact={source:'c'.repeat(40),key,sha256:digest};
assert.equal(verifyNativeQaArtifact(artifact,key,digest).source,artifact.source);
for(const changed of [{...artifact,key:'foreign'},{...artifact,sha256:'0'.repeat(64)},{...artifact,source:'unknown'},null])
 assert.throws(()=>verifyNativeQaArtifact(changed,key,digest));
const {assertNativeDemoTarget}=require('./native-qa-target.ts');
assert.equal(assertNativeDemoTarget({...local,...good}).pathname,'/suqpage_native_qa');
assert.throws(()=>assertNativeDemoTarget({...local,...good,EXPO_PUBLIC_API_ORIGIN:'https://africmade.com'}));
assert.throws(()=>assertNativeDemoTarget({...local,...good,CI:'false'}));
console.log('PASS native QA configuration: distinct identity, local-only target, no hosted/Auth/Firebase inputs.');
assert.equal(spawnSync('python3',['scripts/test-native-qa-ui.py'],{stdio:'inherit'}).status,0);
