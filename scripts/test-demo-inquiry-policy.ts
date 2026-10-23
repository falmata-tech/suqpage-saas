import assert from 'node:assert/strict';
import {test} from 'node:test';
import {approvedDemoContactMethods,canOpenPublicContact,normalizeDemoInquiryPhone,DEMO_PROFILE_CONTACT_EXAMPLES} from '../lib/demo-inquiry-policy';
import {publicBusinessCatalog} from '../lib/business-profile';
import {shopDto} from '../lib/mobile/projections';
import type {Catalog} from '../lib/types';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {build} from 'esbuild';

const phone='+447700900123';
const contacts={phone,whatsapp:phone,telegram:phone,email:'hello@example.invalid',website:'https://example.invalid'};
const catalog:Catalog={business:{id:1,is_demo:1,handle:'demo-fixture',name:'Fixture',design_key:'novatech',design_manifest_json:'{}',content_blocks_json:'{}',tagline:'',description:'',logo_path:'',hero_title:'',hero_subtitle:'',hero_image_path:'',public_phone:phone,contact_email:'private@example.test',whatsapp:phone,telegram:phone,tiktok:'',process_video_ref:'',is_live:0,live_platform:'',live_url:'',status:'active',site_title:'',site_description:'',favicon_path:'',content_version:1},collections:[],categories:[],products:[]};

test('FE-066 explicit operator approval is bounded, per-method and fails closed for residual demo contacts',()=>{
  assert.equal(normalizeDemoInquiryPhone(' +44 (7700) 900-123 '),phone);
  for(const invalid of [undefined,'','447700900123','+0123456789','+123','+447700900123\n','https://t.me/+447700900123'])assert.equal(normalizeDemoInquiryPhone(invalid),null);
  assert.deepEqual(approvedDemoContactMethods(true,contacts,phone),['phone','whatsapp','telegram']);
  for(const config of [undefined,'bad','+447700900999'])assert.deepEqual(approvedDemoContactMethods(true,contacts,config),[]);
  assert.deepEqual(approvedDemoContactMethods(false,contacts,phone),[]);
  assert.deepEqual(approvedDemoContactMethods(true,{phone,whatsapp:'+447700900999',telegram:'fixture_shop'},phone),['phone']);
  assert.deepEqual(approvedDemoContactMethods(true,{phone:'invalid',whatsapp:phone},phone),['whatsapp']);
  for(const kind of ['phone','whatsapp','telegram'] as const)assert.equal(canOpenPublicContact(true,['phone','whatsapp','telegram'],kind),true);
  for(const kind of ['email','website','tiktok','instagram','facebook'] as const)assert.equal(canOpenPublicContact(true,['phone','whatsapp','telegram'],kind),false);
  assert.equal(canOpenPublicContact(true,undefined,'whatsapp'),false);
  assert.equal(canOpenPublicContact(false,undefined,'tiktok'),true,'Real business contacts do not depend on demo configuration');
});

test('FE-066 server projections derive approval from current effective public contacts and erase stale approval',()=>{
  const untrusted={...catalog,business:{...catalog.business,approvedDemoContactMethods:['phone','whatsapp','telegram'] as const}};
  const trustedInput={...untrusted,business:{...untrusted.business,approvedDemoContactMethods:[...untrusted.business.approvedDemoContactMethods]}};
  assert.deepEqual(publicBusinessCatalog(trustedInput,{},phone).business.approvedDemoContactMethods,[],'An explicitly empty published profile never falls back to legacy contacts');
  assert.deepEqual(publicBusinessCatalog(trustedInput,contacts).business.approvedDemoContactMethods,[]);
  const projected=publicBusinessCatalog(trustedInput,contacts,phone);
  assert.deepEqual(projected.business.approvedDemoContactMethods,['phone','whatsapp','telegram']);
  assert.equal(projected.business.contact_email,'');assert.equal(trustedInput.business.contact_email,'private@example.test');
  const previous=process.env.SUQPAGE_DEMO_INQUIRY_PHONE;
  try{
    process.env.SUQPAGE_DEMO_INQUIRY_PHONE=phone;
    const profile={template:'profile-v1' as const,coverStyle:'blended' as const,introduction:'',about:'',heroImage:'',videoUrl:'',contacts};
    assert.deepEqual(shopDto(trustedInput,profile).approvedDemoContactMethods,['phone','whatsapp','telegram']);
    assert.deepEqual(shopDto(trustedInput,{...profile,contacts:{telegram:'fixture_shop'}}).approvedDemoContactMethods,[]);
    delete process.env.SUQPAGE_DEMO_INQUIRY_PHONE;
    assert.deepEqual(shopDto(trustedInput,profile).approvedDemoContactMethods,[]);
  }finally{if(previous===undefined)delete process.env.SUQPAGE_DEMO_INQUIRY_PHONE;else process.env.SUQPAGE_DEMO_INQUIRY_PHONE=previous;}
});

test('FE-066 official profile examples are selective public links and never confer inbox or email approval',()=>{
  const examples={...DEMO_PROFILE_CONTACT_EXAMPLES,email:'fixture@example.invalid'};
  assert.deepEqual(approvedDemoContactMethods(true,examples,undefined),['website','tiktok','instagram','facebook']);
  assert.deepEqual(approvedDemoContactMethods(true,{...contacts,...examples},phone),['phone','whatsapp','telegram','website','tiktok','instagram','facebook']);
  for(const website of ['https://example.com/forged','https://example.com/?redirect=elsewhere','https://example.com.evil.test/','https://user@example.com/','http://example.com/'])assert.deepEqual(approvedDemoContactMethods(true,{website},undefined),[],website);
  for(const method of ['tiktok','instagram','facebook'] as const)assert.deepEqual(approvedDemoContactMethods(true,{[method]:'unverified_shop'},undefined),[]);
  const forged={...catalog,business:{...catalog.business,approvedDemoContactMethods:['email' as never,'website' as const,'facebook' as const]}};
  assert.deepEqual(publicBusinessCatalog(forged,{email:'fixture@example.invalid',website:'https://example.invalid',facebook:'unverified_shop'},phone).business.approvedDemoContactMethods,[]);
});

test('FE-066 web footer keeps messaging in the inquiry chooser and fake demo contacts inert',async()=>{
  const result=await build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import Profile from './components/showroom/BusinessProfile';export function render(catalog,contacts,previewMode=false){return renderToStaticMarkup(<Profile catalog={catalog} products={[]} categories={[]} filter='all' setFilter={()=>{}} query='' setQuery={()=>{}} cartCount={0} openCart={()=>{}} openProduct={()=>{}} addProduct={()=>{}} profile={{template:'profile-v1',coverStyle:'blended',about:'Fixture description',introduction:'',heroImage:'',videoUrl:'',contacts}} previewMode={previewMode}/>);}`},bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-dom/server','lucide-react'],plugins:[{name:'footer-presentation-ports',setup(b){
    b.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'ports'}));
    b.onResolve({filter:/^(?:@\/lib\/i18n\/ui|\.\.\/SocialVideoFrame)$/},args=>({path:args.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:args.path.endsWith('.css')?`export default new Proxy({}, {get:(_,key)=>String(key)});`:args.path==='@/lib/i18n/ui'?`export const useUiText=()=>source=>source;`:`export default()=>null;`}));
  }}]});
  const mod={exports:{} as {render:(catalog:Catalog,contacts:Record<string,string>,preview?:boolean)=>string}};
  vm.runInNewContext(result.outputFiles[0].text,{module:mod,exports:mod.exports,require:createRequire(import.meta.url),URL,URLSearchParams,process});
  const allContacts={...contacts,tiktok:'fixture_shop',instagram:'fixture_shop',facebook:'fixture_shop'};
  const approved=publicBusinessCatalog(catalog,allContacts,phone),html=mod.exports.render(approved,allContacts);
  assert.ok(html.includes('Contact this business'));
  for(const href of ['https://wa.me/447700900123','https://t.me/+447700900123','tel:+447700900123'])assert.ok(!html.includes(`href="${href}"`),`Messaging belongs in the inquiry chooser: ${href}`);
  for(const fragment of ['href="mailto:','href="https://example.invalid','href="https://www.tiktok.com','href="https://www.instagram.com','href="https://www.facebook.com'])assert.ok(!html.includes(fragment),fragment);
  const unapproved=mod.exports.render(publicBusinessCatalog(catalog,allContacts),allContacts);
  assert.ok(!unapproved.includes('href="https://wa.me/')&&!unapproved.includes('href="https://t.me/'));
  const real=mod.exports.render({...catalog,business:{...catalog.business,is_demo:0}},allContacts);
  for(const fragment of ['href="https://www.tiktok.com/@fixture_shop"','href="https://www.instagram.com/fixture_shop/"','href="https://www.facebook.com/fixture_shop"'])assert.ok(real.includes(fragment),fragment);
  assert.ok(!real.includes('?text='),'Ordinary footer profiles never receive invented draft parameters');
  const officialContacts={...contacts,...DEMO_PROFILE_CONTACT_EXAMPLES};
  const examples=mod.exports.render(publicBusinessCatalog(catalog,officialContacts,phone),officialContacts);
  for(const href of ['https://www.tiktok.com/@tiktok','https://www.instagram.com/instagram/','https://www.facebook.com/facebookapp','https://example.com/'])assert.ok(examples.includes(`href="${href}"`),href);
  assert.ok(!examples.includes('href="mailto:'));
  assert.ok(!mod.exports.render(approved,allContacts,true).includes('href="https://wa.me/'),'Private preview cannot launch contacts');
});
