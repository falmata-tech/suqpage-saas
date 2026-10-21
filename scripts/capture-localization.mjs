import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect as baseExpect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { createPostgresPool, postgresRuntimeConfig } from '../lib/postgres-runtime.ts';
import { createUiText } from '../lib/i18n/core.ts';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
const target=new URL(process.env.SUQPAGE_POSTGRES_URL);
const provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
for(const url of [new URL(base),target,provider]) assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Local-only language review');
assert.ok(['54322','56322'].includes(target.port));
const out='.local/localization/review';fs.mkdirSync(out,{recursive:true,mode:0o700});fs.chmodSync(out,0o700);
const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:target.href}));
const auth=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const browser=await chromium.launch();const errors=[],evidence=[];
const texts=Object.fromEntries(['en','am','om','so','ti'].map(locale=>[locale,createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')))]));
const expect=baseExpect.configure({timeout:15000});
function watch(page){page.on('pageerror',error=>errors.push(error.message));}
async function select(page,locale){const select=page.locator('.language-selector select:visible').first();await select.selectOption(locale);await expect(page.locator('html')).toHaveAttribute('lang',locale);await expect(select).toBeEnabled();}
async function snapshot(page,name,width){await page.setViewportSize({width,height:width===1440?1000:844});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${name} ${width}`);await page.screenshot({path:`${out}/${name}-${width}.png`,style:'nextjs-portal {visibility:hidden}'});}
async function contextFor(email){const context=await browser.newContext();const link=await auth.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error&&link.data.properties?.email_otp,'Local test-issued session');const cookies=[];const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:values=>cookies.push(...values)}});const verified=await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'});assert.ok(!verified.error);await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));return context;}
try{
 const shop=(await pool.query("SELECT b.id,b.name,b.handle FROM businesses b WHERE b.status='active' AND b.handle='demo-nile-sensor-studio' LIMIT 1")).rows[0];assert.ok(shop,'Admitted local demo');
 const products=(await pool.query('SELECT id,name,description FROM products WHERE business_id=$1 AND is_published=1 ORDER BY id LIMIT 2',[shop.id])).rows;assert.equal(products.length,2);
 const context=await browser.newContext();const page=await context.newPage();watch(page);
 for(const locale of ['en','am','om','so','ti']){
  await context.addCookies([{name:'suqpage-language',value:locale,url:base,sameSite:'Lax'}]);
  for(const [route,name] of [['/?view=search','market'],['/about','about'],['/featured','featured'],[`/@${shop.handle}?product=${products[0].id}`,'product'],['/login','login'],['/privacy','privacy'],['/terms','terms']]){
   const response=await page.goto(base+route);assert.equal(response.status(),200,route);await expect(page.locator('html')).toHaveAttribute('lang',locale);
   if(name==='product'){await expect(page.locator('h2').filter({hasText:products[0].name}).first()).toHaveText(products[0].name);await expect(page.getByRole('button',{name:texts[locale]('Add to inquiry list'),exact:true}).first()).toBeVisible();}
   for(const width of [1440,390,320])await snapshot(page,`${locale}-${name}`,width);
   evidence.push({locale,page:name,widths:[1440,390,320]});
  }
 }
 // Refresh must retain controlled input, current URL and cart; no message is sent.
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/login');await page.locator('#login-email').fill('unchanged@example.test');const loginUrl=page.url();await select(page,'am');await expect(page.locator('#login-email')).toHaveValue('unchanged@example.test');assert.equal(page.url(),loginUrl);await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','am');
 await page.goto(`${base}/@${shop.handle}?product=${products[0].id}`);await page.getByRole('button',{name:texts.am('Add to inquiry list'),exact:true}).first().click();await expect(page.getByRole('button',{name:texts.am('Added to inquiry list'),exact:true}).first()).toBeVisible();await select(page,'om');await expect(page.getByRole('button',{name:texts.om('Added to inquiry list'),exact:true}).first()).toBeVisible();await page.reload();await expect(page.getByRole('button',{name:texts.om('Added to inquiry list'),exact:true}).first()).toBeVisible();
 evidence.push({check:'login field, URL, selected item and cookie persist across language change/reload'});
 const owner=(await pool.query('SELECT email FROM users WHERE business_id=$1 ORDER BY id LIMIT 1',[shop.id])).rows[0];assert.ok(owner);
 const ownerContext=await contextFor(owner.email);const ownerPage=await ownerContext.newPage();watch(ownerPage);
 for(const locale of ['am','om','so','ti']){
  await ownerContext.addCookies([{name:'suqpage-language',value:locale,url:base,sameSite:'Lax'}]);
  for(const [route,name] of [['/dashboard','owner'],['/dashboard/business','location'],['/dashboard/page-editor','editor'],['/dashboard/products/new','new-item'],['/dashboard/account','account'],['/dashboard/inquiries','inquiries'],['/dashboard/support','support']]){
   const response=await ownerPage.goto(base+route);assert.equal(response.status(),200,route);await expect(ownerPage.locator('html')).toHaveAttribute('lang',locale);assert.ok(!ownerPage.url().includes('/login'));
   for(const width of [1440,390,320])await snapshot(ownerPage,`${locale}-${name}`,width);
   evidence.push({locale,page:name,widths:[1440,390,320]});
  }
 }
 await ownerPage.setViewportSize({width:1440,height:1000});await ownerPage.goto(base+'/dashboard/page-editor');const about=ownerPage.locator('#shop-about');await about.fill('Unsaved wording: Save, Market, አበበ {value1}');await select(ownerPage,'am');await expect(about).toHaveValue('Unsaved wording: Save, Market, አበበ {value1}');
 await ownerPage.setViewportSize({width:320,height:844});await ownerPage.locator('.workspace-menu-button').click();await select(ownerPage,'so');await expect(ownerPage.getByRole('dialog')).toBeVisible();await snapshot(ownerPage,'so-mobile-language-menu',320);
 evidence.push({check:'unsaved page content and mobile workspace language selector'});
 const admin=(await pool.query("SELECT u.email FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1")).rows[0];const adminContext=await contextFor(admin.email);const adminPage=await adminContext.newPage();watch(adminPage);
 for(const locale of ['am','om','so','ti']){await adminContext.addCookies([{name:'suqpage-language',value:locale,url:base,sameSite:'Lax'}]);for(const [route,name] of [['/dashboard/admin','admin'],['/dashboard/admin/businesses','businesses'],['/dashboard/admin/staff','staff'],['/dashboard/admin/featured-schedule','schedule'],['/dashboard/admin/sponsors','sponsors']]){assert.equal((await adminPage.goto(base+route)).status(),200);for(const width of [1440,390,320])await snapshot(adminPage,`${locale}-${name}`,width);evidence.push({locale,page:name,widths:[1440,390,320]});}}
 assert.deepEqual(errors,[],'No browser runtime/hydration errors');fs.writeFileSync(`${out}/evidence.json`,JSON.stringify(evidence,null,2));console.log(`PASS ${evidence.length} localization checks; local test-issued sessions; no form saves or messages sent.`);
}finally{await browser.close();await pool.end();}
