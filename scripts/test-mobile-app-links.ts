import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { incomingSuqpagePath, marketLinkState } from '../apps/mobile/src/incoming-link';
import { redirectSystemPath } from '../apps/mobile/app/+native-intent';
const require=createRequire(import.meta.url);
const { androidAppLinks }=require('../apps/mobile/link-config.cjs');

test('FE-053 canonical store/product/public links map identically on cold and warm opens',()=>{
 const cases:Record<string,string>={
  'https://suqpage.com/@demo-aloe-field-care':'/shop/demo-aloe-field-care',
  'https://suqpage.com/%40demo-aloe-field-care?product=123&ref=discovery':'/product?handle=demo-aloe-field-care&id=123',
  'suqpage://shop/demo-aloe-field-care':'/shop/demo-aloe-field-care',
  'suqpage:///product?handle=demo-aloe-field-care&id=123':'/product?handle=demo-aloe-field-care&id=123',
  'https://suqpage.com/@demo-aloe-field-care?product=0':'/shop/demo-aloe-field-care',
  'https://suqpage.com/@demo-aloe-field-care?product=9007199254740992':'/shop/demo-aloe-field-care',
  'https://suqpage.com/featured':'/featured',
  'https://suqpage.com/about/':'/about',
  'https://suqpage.com/login?next=/dashboard/admin':'/account',
  'https://suqpage.com/account':'/account',
 };
 for(const [path,expected]of Object.entries(cases))for(const initial of [true,false])for(const candidate of [path,path.replaceAll('suqpage.com','mirtpage.com').replace(/^suqpage:/,'mirtpage:')])assert.equal(redirectSystemPath({path:candidate,initial}),expected,candidate);
});
test('FE-053 untrusted domains, schemes, malformed handles and private paths never become app authority',()=>{
 for(const path of ['https://suqpage.com.evil.test/@valid-shop','https://evil.test/@valid-shop','https://user:pass@suqpage.com/@valid-shop','http://suqpage.com/@valid-shop','https://suqpage.com:8443/@valid-shop','javascript:alert(1)','file:///private/secret','//evil.test/@valid-shop','https://suqpage.com/@ab','https://suqpage.com/@shop%2Fother','https://suqpage.com/@%ZZ','https://suqpage.com/\n@shop','https://suqpage.com/dashboard/admin','https://suqpage.com/api/mobile/v1/owner','https://suqpage.com/auth/callback?code=secret','/owner/security','/product?handle=valid-shop&id=script','/product?handle=<script>&id=1'])assert.equal(incomingSuqpagePath(path),path==='/product?handle=valid-shop&id=script'?'/shop/valid-shop':'/',path);
 for(const path of ['https://mirtpage.com.evil.test/@valid-shop','https://user:pass@mirtpage.com/@valid-shop','http://mirtpage.com/@valid-shop','https://mirtpage.com:8443/@valid-shop','https://mirtpage.com/dashboard/admin','https://mirtpage.com/api/mobile/v1/owner','https://mirtpage.com/auth/callback?code=secret','mirtpage://shop:8443/valid-shop','suqpage://shop:8443/valid-shop','https://www.mirtpage.com/@valid-shop'])assert.equal(incomingSuqpagePath(path),'/',path);
});
test('FE-053 incoming Market scopes are canonical, bounded and consistent with interactive filters',()=>{
 const raw='https://suqpage.com/market?q=aloe&industry=beauty-wellness&industry=fashion-textiles&industry=unsafe&place=city:Addis&place=region:Amhara&page=2';
 const path=incomingSuqpagePath(raw),url=new URL(path,'https://suqpage.com');
 assert.equal(url.searchParams.get('q'),'aloe');assert.deepEqual(url.searchParams.getAll('category'),['beauty-wellness','fashion-textiles']);assert.equal(url.searchParams.get('place'),'city:Addis|region:Amhara');assert.equal(url.searchParams.get('page'),'2');assert.equal(url.searchParams.get('view'),'search');
 const state=marketLinkState({q:' aloe ',category:['beauty-wellness','fashion-textiles','unsafe'],place:['region:Amhara','city:Addis'],page:'2'});
 assert.deepEqual(state,{query:'aloe',categories:['beauty-wellness','fashion-textiles'],place:'city:Addis|region:Amhara',page:2,open:true});
 assert.equal(marketLinkState({q:'aloe',view:'map'}).open,false);
 assert.equal(marketLinkState({page:'-2'}).page,1);assert.equal(marketLinkState({page:'99999999999'}).page,10000);
 assert.equal(marketLinkState({q:'x'.repeat(500)}).query.length,200);
});
test('FE-053 repeated Market intents still restore the requested state after manual edits',()=>{
 const first=redirectSystemPath({path:'https://suqpage.com/?q=aloe',initial:true});
 const second=redirectSystemPath({path:'https://suqpage.com/?q=aloe',initial:false});
 assert.notEqual(first,second);
 for(const path of [first,second]){const url=new URL(path,'https://suqpage.com');assert.equal(url.searchParams.get('q'),'aloe');assert.match(url.searchParams.get('_intent')!,/^\d+$/);}
});
test('DEP-042 Android claims only registered signing identities and exact public HTTPS routes',()=>{
 const registry=JSON.parse(fs.readFileSync('public/.well-known/assetlinks.json','utf8'));
 assert.equal(registry.length,3);assert.deepEqual(registry[0].relation,['delegate_permission/common.handle_all_urls']);
 assert.equal(registry[0].target.package_name,'com.suqpage.app.preview');
 assert.deepEqual(registry[0].target.sha256_cert_fingerprints,['06:30:C5:6F:88:DF:87:4F:D2:72:96:D1:AA:08:48:A6:8F:C8:34:5F:70:2F:E6:80:2E:DD:82:55:B7:21:11:83']);
 const policy=JSON.parse(fs.readFileSync('apps/mobile/release-policy.json','utf8'));
 assert.equal(registry[1].target.package_name,'com.suqpage.app','Published old association is not rewritten into a new identity');
 assert.equal(policy.packageName,'com.mirtpage.app');
 assert.equal(registry[2].target.package_name,policy.packageName);assert.equal(registry[2].target.sha256_cert_fingerprints[0].replaceAll(':',''),policy.certificateSha256);
 assert.deepEqual(registry[1].relation,['delegate_permission/common.handle_all_urls']);
 assert.deepEqual(registry[1].target.sha256_cert_fingerprints,registry[0].target.sha256_cert_fingerprints);
 assert.equal(policy.certificateSha256,registry[1].target.sha256_cert_fingerprints[0].replaceAll(':',''));
 for(const packageName of ['com.suqpage.app.preview','com.suqpage.app','com.mirtpage.app'])assert.deepEqual(androidAppLinks(packageName),[],'No old-host claim or unqualified new target is generated');
 const qualified={relation:['delegate_permission/common.handle_all_urls'],target:{namespace:'android_app',package_name:'com.mirtpage.app',sha256_cert_fingerprints:registry[0].target.sha256_cert_fingerprints}};
 const qualifiedPolicy={...policy,dataTargets:{'mirtpage-production':{apiOrigin:'https://mirtpage.com',authOrigin:'https://sjeiiqxgscuqajpgddcc.supabase.co'}}};
 const fixture=(entries:unknown[],selectedPolicy=qualifiedPolicy)=>{const module={exports:{} as {androidAppLinks:(packageName:string)=>Array<{autoVerify:boolean;data:Array<{scheme:string;host:string;path?:string;pathPrefix?:string}>}>}};vm.runInNewContext(fs.readFileSync('apps/mobile/link-config.cjs','utf8'),{module,exports:module.exports,require:(id:string)=>id==='./release-policy.json'?selectedPolicy:entries});return module.exports;};
 assert.equal(fixture([]).androidAppLinks('com.mirtpage.app').length,0,'A qualified target without the registered association is insufficient');
 assert.equal(fixture([qualified],{...qualifiedPolicy,dataTargets:{'mirtpage-production':{apiOrigin:'https://suqpage.com',authOrigin:'https://sjeiiqxgscuqajpgddcc.supabase.co'}}}).androidAppLinks('com.mirtpage.app').length,0,'Old API target cannot enable new-host claims');
 const [filter]=fixture([qualified]).androidAppLinks('com.mirtpage.app');assert.equal(filter.autoVerify,true);
 for(const item of filter.data){assert.equal(item.scheme,'https');assert.equal(item.host,'mirtpage.com');assert.ok(['/@','/tracking/'].includes(item.pathPrefix||'')||['/','/market','/featured','/about','/login','/account','/transport-plan','/tracking'].includes(item.path||''));}
 for(const fingerprints of [['invalid'],['AB:'.repeat(31)+'AB'],[...registry[0].target.sha256_cert_fingerprints,...registry[0].target.sha256_cert_fingerprints]])assert.throws(()=>fixture([{...qualified,target:{...qualified.target,sha256_cert_fingerprints:fingerprints}}]).androidAppLinks('com.mirtpage.app'));
 assert.deepEqual(androidAppLinks('evil.package'),[]);
 assert.doesNotMatch(JSON.stringify(registry),/password|privateKey|access_token|secret/i);
});

test('FE-069 tracking AppLinks are locators only; legacy capabilities are dropped on cold/warm opens',()=>{
 const cap='a'.repeat(64),reference='SHP-'+'A'.repeat(20);
 for(const initial of [true,false]){
  assert.equal(redirectSystemPath({path:'https://suqpage.com/tracking',initial}),'/tracking');
  assert.equal(redirectSystemPath({path:'https://suqpage.com/tracking/'+reference,initial}),'/tracking?reference='+reference);
  assert.equal(redirectSystemPath({path:'https://suqpage.com/transport-plan#'+cap,initial}),'/tracking');
  assert.equal(redirectSystemPath({path:'https://mirtpage.com/tracking',initial}),'/tracking');
  assert.equal(redirectSystemPath({path:'https://mirtpage.com/tracking/'+reference,initial}),'/tracking?reference='+reference);
  assert.equal(redirectSystemPath({path:'https://mirtpage.com/transport-plan#'+cap,initial}),'/tracking');
 }
 assert.equal(incomingSuqpagePath('/tracking/'+reference),'/tracking?reference='+reference);
 for(const fragment of ['', '#'+cap, '#malformed&session=secret'])assert.equal(incomingSuqpagePath('https://suqpage.com/transport-plan'+fragment),'/tracking');
 for(const path of [
  'suqpage://tracking','suqpage:///tracking/'+reference,
  'https://evil.test/tracking/'+reference,'https://suqpage.com.evil.test/tracking',
  'http://suqpage.com/tracking','https://suqpage.com:8443/tracking',
  'https://user@suqpage.com/tracking','https://suqpage.com/tracking?email=private',
  'https://suqpage.com/tracking#'+cap,'https://suqpage.com/tracking/',
  'https://suqpage.com/%74racking','https://suqpage.com/tracking/'+reference.toLowerCase(),
  'https://suqpage.com/tracking/'+reference+'/extra','https://suqpage.com/tracking/'+reference+'?token='+cap,
  'https://suqpage.com/transport-plan?key='+cap,
 ])assert.equal(incomingSuqpagePath(path),'/',path);
 for(const path of ['mirtpage://tracking','mirtpage:///tracking/'+reference,'https://mirtpage.com/tracking?email=private','https://mirtpage.com/tracking#'+cap,'https://mirtpage.com/tracking/','https://mirtpage.com/%74racking','https://mirtpage.com/tracking/'+reference+'?token='+cap,'https://mirtpage.com/transport-plan?key='+cap])assert.equal(incomingSuqpagePath(path),'/',path);
});

test('FE-065 independent country/city searches survive incoming app links',()=>{
 const input='https://suqpage.com/?view=search&b.q=Studio&b.country=ET&b.city=ET%3Aplace-553e667e63bb8da0&p.q=Grass&p.country=KE&p.offeringType=products&p.madeToOrder=true&p.page=2';
 const path=incomingSuqpagePath(input),p=new URL(path,'https://suqpage.com').searchParams;
 assert.equal(p.get('b.q'),'Studio');assert.equal(p.get('p.q'),'Grass');assert.equal(p.get('b.country'),'ET');assert.equal(p.get('p.country'),'KE');assert.equal(p.get('b.city'),'ET:place-553e667e63bb8da0');assert.equal(p.has('p.offeringType'),false);assert.equal(p.get('p.madeToOrder'),'true');assert.equal(p.get('p.page'),'2');assert.equal(p.get('view'),'search');
});
