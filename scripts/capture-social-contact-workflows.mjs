import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {createPostgresPublicClientWorkspace} from '../lib/signup-postgres.ts';
import {PostgresTransactionRunner,createPostgresPool,postgresRuntimeConfig} from '../lib/postgres-runtime.ts';
import {runtimeCatalogByBusinessId} from '../lib/catalog-runtime.ts';
import {initialBusinessProfile} from '../lib/business-profile.ts';
import {createUiText,languageNames} from '../lib/i18n/core.ts';
import {findPlaceSuggestions} from '../lib/place-catalog.ts';
import {MARKET_STOREFRONT_COPY,ABOUT_STOREFRONT_SECTIONS} from '../lib/storefront-copy.ts';
import {normalizeDemoInquiryPhone,approvedDemoContactMethods} from '../lib/demo-inquiry-policy.ts';
import {publicContactFields} from '../lib/business-profile-contacts.ts';
process.loadEnvFile('.local/supabase-runtime.env');
// Explicit fixture approval must match the local server's nonsecret operator setting.
// Never enable a demo merely because its number looks real or was supplied by a client.
const approvedDemoPhone=normalizeDemoInquiryPhone(process.env.SUQPAGE_DEMO_INQUIRY_PHONE);
assert.ok(approvedDemoPhone,'Provide the same SUQPAGE_DEMO_INQUIRY_PHONE used by the local servers.');
const base='http://127.0.0.1:3102',mobile='http://localhost:8082',out=process.env.SUQPAGE_CONTACT_CAPTURE_DIR || '.local/social-contact-s105/screens';
assert.equal(new URL(process.env.SUQPAGE_POSTGRES_URL).hostname,'127.0.0.1');
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin,'http://127.0.0.1:54321');
fs.mkdirSync(out,{recursive:true,mode:0o700});
const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:process.env.SUQPAGE_POSTGRES_URL}));
const auth=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const browser=await chromium.launch();const records=[],errors=[],suffix=crypto.randomUUID().slice(0,8);
let providerId,businessId;const email=`social-qa-${suffix}@example.test`,handle=`social-qa-${suffix}`;
const blank=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=','base64');
async function context(){const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});await c.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:blank}));await c.route(/^https:\/\/(www\.)?(wa\.me|t\.me|tiktok\.com|instagram\.com|facebook\.com)\//,r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>External destination isolated</title>'}));return c;}
async function page(c){const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));return p;}
async function shot(p,name){await p.evaluate(()=>document.fonts.ready);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');await p.screenshot({path:`${out}/${name}.png`,fullPage:true,caret:'initial',style:'nextjs-portal{visibility:hidden}'});records.push(name);}
try{
 const created=await auth.auth.admin.createUser({email,email_confirm:true});assert.equal(created.error,null);providerId=created.data.user.id;
 const fixture=await createPostgresPublicClientWorkspace(new PostgresTransactionRunner(pool),{name:'Social QA Owner',businessName:'Social Contact QA',handle,businessCategory:'home-living',placeId:findPlaceSuggestions('Addis Ababa')[0].id,phone:'+447700900999',consent:true,idempotencyKey:crypto.randomUUID()},{providerUserId:providerId,email});businessId=fixture.businessId;
 const catalog=await runtimeCatalogByBusinessId(businessId,true);const product=catalog.products.find(p=>p.is_published);assert.ok(product);
 const profile={...initialBusinessProfile(catalog),about:'Fictional local workflow fixture.',videoUrl:'',contacts:{phone:'+447700900001',email:'fixture@example.invalid',website:'https://example.invalid',whatsapp:'+447700900001',telegram:'fixture_shop',instagram:'fixture_shop',tiktok:'fixture_shop',facebook:'fixture_shop'},accentColor:'#008A7A'};
 assert.deepEqual(Object.keys(profile.contacts).sort(),publicContactFields.map(field=>field.key).sort(),'All eight public contact fields remain in the fixture.');
 await pool.query("UPDATE businesses SET status='active',is_demo=0 WHERE id=$1",[businessId]);
 await pool.query("UPDATE owner_page_drafts SET content_json=$2 WHERE business_id=$1",[businessId,JSON.stringify(profile)]);
 await pool.query("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES($1,1,1,$2,'publish',$3,$4)",[businessId,JSON.stringify(profile),fixture.userId,Date.now()]);
 const counts=async()=> (await pool.query('SELECT (SELECT COUNT(*)::int FROM inquiries WHERE business_id=$1) inquiries,(SELECT COUNT(*)::int FROM attention_notifications WHERE inquiry_id IN (SELECT id FROM inquiries WHERE business_id=$1)) notifications',[businessId])).rows[0];
 const before=await counts();
 for(const path of ['/api/inquiries','/api/mobile/v1/inquiries'])for(const body of ['{broken',JSON.stringify({businessId,customerName:'Visitor',contact:'+447700900001',items:[{productId:product.id,options:{}}]})]){
  const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body});assert.equal(r.status,410);assert.equal((await r.json()).code,'inquiry_retired');assert.match(r.headers.get('cache-control'),/no-store/);
 }
 const auditLocales=(process.env.SUQPAGE_CONTACT_LOCALES || 'en,am,om,so,ti').split(',');
 for(const locale of auditLocales){
  const t=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync('lib/i18n/messages/'+locale+'.json','utf8'))),c=await context();await c.addCookies([{name:'suqpage-language',value:locale,url:base}]);const p=await page(c);
  await p.goto(base+`/@${handle}?product=${product.id}`);await p.getByRole('button',{name:t('Inquire about this {value1} only',{value1:t('product')}),exact:true}).click();const dialog=p.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('heading',{name:t('Message the business'),exact:true})).toBeVisible();await expect(dialog.getByRole('link')).toHaveCount(3);for(const label of ['TikTok','Instagram','Facebook'])await expect(dialog.getByRole('link',{name:new RegExp(label)})).toHaveCount(0);await expect(dialog.getByRole('button',{name:t('Send inquiry on Suqpage'),exact:true})).toHaveCount(0);await expect(dialog.locator('input[type=tel]')).toHaveCount(0);
  const draft=await dialog.locator('textarea').inputValue();assert.ok(draft.includes(product.name)&&draft.includes(`${base}/@${handle}?product=${product.id}`));assert.ok(draft.includes(t("I'm interested in:")));await p.evaluate(()=>navigator.clipboard.writeText('old clipboard'));
  const popupWait=c.waitForEvent('page');await dialog.getByRole('link',{name:/WhatsApp/}).click();const popup=await popupWait;await popup.waitForURL(/wa\.me/);assert.equal(new URL(popup.url()).searchParams.get('text'),draft);assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),draft);await popup.close();await shot(p,`web-contact-${locale}-390`);
  await dialog.getByRole('button',{name:t('Copied'),exact:true}).click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),draft);
  if(locale==='en'){
   await p.keyboard.press('Escape');await p.getByRole('button',{name:'Add to inquiry list',exact:true}).click();
   await p.evaluate(()=>navigator.clipboard.writeText('old footer clipboard'));
   const fw=c.waitForEvent('page');await p.getByRole('region',{name:'Connect with this business',exact:true}).getByRole('link',{name:/WhatsApp/}).click();const fp=await fw;await fp.waitForURL(/wa\.me/);const footerDraft=new URL(fp.url()).searchParams.get('text');assert.ok(footerDraft.includes(product.name)&&footerDraft.includes('?product='+product.id));assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),footerDraft);await fp.close();await shot(p,'web-selected-footer-auto-copy-390');
   await p.evaluate(()=>navigator.clipboard.writeText('unchanged profile clipboard'));const profileWait=c.waitForEvent('page');await p.getByRole('region',{name:'Connect with this business',exact:true}).getByRole('link',{name:/^TikTok/}).click();const profilePage=await profileWait;await profilePage.waitForURL(/tiktok\.com/);assert.equal(new URL(profilePage.url()).search,'');assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'unchanged profile clipboard');await profilePage.close();
   await p.getByRole('button',{name:'Inquire about this product only',exact:true}).click();
   await p.setViewportSize({width:1440,height:960});await shot(p,'web-contact-en-1440');await p.setViewportSize({width:320,height:740});await shot(p,'web-contact-en-320');
   await p.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});document.execCommand=()=>false;window.open=()=>null;});
   await dialog.getByRole('link',{name:/WhatsApp/}).click();await expect(dialog.getByText(t('Select and copy your message'),{exact:true})).toBeVisible();await expect(dialog.getByRole('alert')).toBeVisible();await expect(dialog.getByRole('textbox',{name:t('Inquiry message'),exact:true})).toHaveValue(draft);await shot(p,'web-contact-copy-popup-failure-320');
  }
  await p.setViewportSize({width:390,height:844});await p.goto(base+'/about');await expect(p.getByRole('heading',{name:t(ABOUT_STOREFRONT_SECTIONS[1].title),exact:true})).toBeVisible();await shot(p,`web-about-${locale}-390`);await c.close();
  const mc=await context(),mp=await page(mc);await mp.goto(mobile+`/inquiry?handle=${handle}&id=${product.id}`);await expect(mp.getByRole('button',{name:'Language',exact:true})).toBeVisible({timeout:30000});
  if(locale!=='en'){await mp.getByRole('button',{name:'Language',exact:true}).click();await mp.getByRole('radio',{name:languageNames[locale],exact:true}).click();if(await mp.getByRole('button',{name:t('Close'),exact:true}).last().isVisible()) await mp.getByRole('button',{name:t('Close'),exact:true}).last().click();}
  await expect(mp.getByText(t('Message the business'),{exact:true})).toBeVisible({timeout:30000});for(const label of ['TikTok','Instagram','Facebook'])await expect(mp.getByRole('button',{name:label,exact:true})).toHaveCount(0);await expect(mp.getByRole('button',{name:t('Send inquiry on Suqpage'),exact:true})).toHaveCount(0);await mp.evaluate(()=>navigator.clipboard.writeText('old clipboard'));
  const mw=mc.waitForEvent('page');await mp.getByRole('button',{name:'Telegram',exact:true}).click();const external=await mw;await external.waitForURL(/t\.me/);const text=new URL(external.url()).searchParams.get('text');assert.ok(text.includes(product.name)&&text.includes(t("I'm interested in:")));assert.equal(await mp.evaluate(()=>navigator.clipboard.readText()),text);await external.close();await shot(mp,`mobile-contact-${locale}-390`);
  await mp.getByRole('button',{name:t('Copy message'),exact:true}).click();assert.equal(await mp.evaluate(()=>navigator.clipboard.readText()),text);
  if(locale==='en'){
   await mp.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});document.execCommand=()=>false;window.open=()=>null;});
   await mp.getByRole('button',{name:'WhatsApp',exact:true}).click();await expect(mp.getByText('Select and copy your message',{exact:true})).toBeVisible();await expect(mp.getByRole('button',{name:'WhatsApp ↗',exact:true})).toBeVisible();await shot(mp,'mobile-contact-copy-popup-failure-390');
  }
  await mp.getByRole('tab',{name:t('About'),exact:true}).click();await expect(mp.getByText(t(ABOUT_STOREFRONT_SECTIONS[0].title),{exact:true})).toBeVisible();await shot(mp,`mobile-about-${locale}-390`);await mc.close();
 }
 // Owner still has support, without the retired inbox task/metric.
 const c=await context(),cookies=[],l=await auth.auth.admin.generateLink({type:'magiclink',email});assert.equal(l.error,null);
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:v=>cookies.push(...v)}});assert.equal((await client.auth.verifyOtp({email,token:l.data.properties.email_otp,type:'email'})).error,null);await c.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));const p=await page(c);await p.goto(base+'/dashboard/profile');await expect(p.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();await expect(p.getByRole('link',{name:'Inquiries',exact:true})).toHaveCount(0);await expect(p.getByText('New inquiries',{exact:true})).toHaveCount(0);await expect(p.locator('a[href="/dashboard/support"]').filter({visible:true}).first()).toBeVisible();for(const width of [390,1440]){await p.setViewportSize({width,height:960});await shot(p,`owner-dashboard-en-${width}`);}
 await p.goto(base+'/dashboard/page-editor?view=edit&returnTo=profile');
 await p.locator('summary').filter({hasText:'Public contact details'}).click();
 await expect(p.getByRole('textbox',{name:'Public phone',exact:true})).toHaveCount(1);
 await expect(p.getByRole('textbox',{name:'Public email',exact:true})).toHaveCount(1);
 await expect(p.getByRole('textbox',{name:'Website',exact:true})).toHaveCount(1);
 await expect(p.getByRole('textbox',{name:'Instagram username',exact:true})).toHaveValue('fixture_shop');
 await p.getByRole('textbox',{name:'Instagram username',exact:true}).scrollIntoViewIfNeeded();await shot(p,'owner-social-editor-en-1440');
 await p.setViewportSize({width:390,height:844});await p.getByRole('textbox',{name:'Instagram username',exact:true}).scrollIntoViewIfNeeded();await shot(p,'owner-social-editor-en-390');await c.close();
 const nc=await context(),np=await page(nc);await np.goto(mobile+'/account');await np.getByRole('textbox',{name:'Email',exact:true}).fill(email);await np.getByRole('button',{name:'Continue with email',exact:true}).click();await expect(np.getByRole('textbox',{name:'Verification code',exact:true})).toBeVisible();const nl=await auth.auth.admin.generateLink({type:'magiclink',email});assert.equal(nl.error,null);await np.getByRole('textbox',{name:'Verification code',exact:true}).fill(nl.data.properties.email_otp);await np.getByRole('button',{name:'Verify code',exact:true}).click();await expect(np.getByRole('heading',{name:'Dashboard',exact:true})).toBeVisible();await np.getByRole('button',{name:'Your page',exact:true}).click();await np.getByRole('button',{name:'Edit',exact:true}).click();for(const label of ['Phone','Email','WhatsApp','Telegram','TikTok','Instagram','Facebook','Website'])await expect(np.getByRole('textbox',{name:label,exact:true})).toHaveCount(1);await np.getByRole('textbox',{name:'WhatsApp',exact:true}).scrollIntoViewIfNeeded();await shot(np,'native-owner-contact-setup-390');await nc.close();
 const approvedContacts={...profile.contacts,phone:approvedDemoPhone,whatsapp:approvedDemoPhone,telegram:approvedDemoPhone};
 assert.deepEqual(approvedDemoContactMethods(true,profile.contacts,approvedDemoPhone),[],'The residual demo fixture must not match the approved operator phone.');
 for(const [kind,revision,isDemo,contacts] of [['no-account',2,0,{}],['demo-unapproved',3,1,profile.contacts],['demo-approved',4,1,approvedContacts]]){
  const approved=approvedDemoContactMethods(isDemo,contacts,approvedDemoPhone);
  const approvedInboxes=approved.filter(method=>['phone','whatsapp','telegram'].includes(method));
  await pool.query('UPDATE businesses SET is_demo=$2 WHERE id=$1',[businessId,isDemo]);
  await pool.query("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES($1,$2,1,$3,'publish',$4,$5)",[businessId,revision,JSON.stringify({...profile,contacts}),fixture.userId,Date.now()]);
  const projection=await(await fetch(base+'/api/mobile/v1/shops/'+encodeURIComponent(handle))).json();assert.deepEqual(projection.approvedDemoContactMethods,approved,'Server approval must agree with effective current published contacts.');
  const c=await context(),p=await page(c);await p.goto(base+`/@${handle}?product=${product.id}`);await p.getByRole('button',{name:'Inquire about this product only',exact:true}).click();const dialog=p.getByRole('dialog');await expect(dialog.getByRole('link')).toHaveCount(approvedInboxes.length);if(approvedInboxes.length){for(const name of ['WhatsApp','Telegram','SMS'])await expect(dialog.getByRole('link',{name:new RegExp('^'+name)})).toBeVisible();const popupWait=c.waitForEvent('page');await dialog.getByRole('link',{name:/^WhatsApp/}).click();const popup=await popupWait;await popup.waitForURL(/wa\.me/);assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),new URL(popup.url()).searchParams.get('text'));await popup.close();}else if(isDemo)await expect(dialog.getByRole('button',{name:'WhatsApp',exact:true})).toBeDisabled();await dialog.getByRole('button',{name:approvedInboxes.length?'Copied':'Copy message',exact:true}).click();if(!isDemo)await expect(dialog.getByText('No social contact is available here. You can still copy the message.',{exact:true})).toBeVisible();await shot(p,`web-contact-${kind}-390`);await c.close();
  const mc=await context(),mp=await page(mc);await mp.goto(mobile+`/inquiry?handle=${handle}&id=${product.id}`);if(approvedInboxes.length){for(const name of ['WhatsApp','Telegram','SMS'])await expect(mp.getByRole('button',{name,exact:true})).toBeEnabled();}else if(isDemo)await expect(mp.getByRole('button',{name:'WhatsApp',exact:true})).toBeDisabled();else await expect(mp.getByRole('button',{name:'WhatsApp',exact:true})).toHaveCount(0);await mp.getByRole('button',{name:'Copy message',exact:true}).click();if(!isDemo)await expect(mp.getByText('No social contact is available here. You can still copy the message.',{exact:true})).toBeVisible();await shot(mp,`mobile-contact-${kind}-390`);await mc.close();
 }
 assert.deepEqual(await counts(),before);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/evidence.json',JSON.stringify({locales:auditLocales,records,checks:['410 on both real HTTP adapters; unchanged inquiry/notification counts','five-language web/native-browser inbox handoffs automatically overwrite clipboard without prior manual copy','only WhatsApp/Telegram/SMS inbox choices; ordinary public social profiles never copy inquiries','approved demo methods derive from the local operator setting; residual fake demos fail closed','no inbox submission or phone capture','all eight owner contact fields preserved','manual copy/popup fallback','owner dashboard retains support without inbox task or new-inquiry metric'],externalSocialDestinations:'isolated by Playwright; no messages sent',mapTiles:'stubbed to avoid OSM automated traffic',native:'Expo browser preview; not installed-device evidence',productionWrites:0,errors},null,2));console.log(`PASS ${records.length} local social-contact captures and workflows`);
}catch(error){console.error("Social workflow failure:",error);throw error;}finally{
 if(businessId){for(const table of ['owner_page_reviews','owner_page_publications','owner_page_events','owner_page_drafts','product_upkeep_commands','published_catalog_versions','audit_logs'])await pool.query(`DELETE FROM ${table} WHERE business_id=$1`,[businessId]);await pool.query('DELETE FROM businesses WHERE id=$1',[businessId]);}
 if(providerId)assert.equal((await auth.auth.admin.deleteUser(providerId)).error,null);
 await browser.close();await pool.end();const {closePostgresRuntimeForTests}=await import('../lib/postgres-runtime-services.ts');await closePostgresRuntimeForTests();
}
