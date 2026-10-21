import {findPlaceSuggestions} from '../lib/place-catalog';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { chromium, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { postgresRuntimeServices } from '../lib/postgres-runtime-services';
import { createPublicClientWorkspace } from '../lib/signup';
import { publicContactFields } from '../lib/business-profile-contacts';
import { STARTER_ABOUT } from '../lib/business-starter';

async function main() {
 const serve=process.argv.includes('--serve');
 const base='http://127.0.0.1:3104',out=path.resolve('.local/business-starter-review');
 fs.mkdirSync(out,{recursive:true,mode:0o700});
 const configName='.acceptance-tsconfig-suqpage-acceptance-business-starters.json';
 const media=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-starter-review-'));
 const db=await getDb();let app:ChildProcess|undefined;
 const browser=await chromium.launch({headless:!serve});
 try {
  const workspace=await createPublicClientWorkspace({name:'Review owner',phone:'+251911234567',businessName:'Your business',businessCategory:'electronics', placeId:findPlaceSuggestions("Addis Ababa")[0].id,idempotencyKey:'starter-browser-0001',consent:true},{providerUserId:'33333333-3333-4333-8333-333333333339',email:'starter-review@example.test'});
  const business=await db.prepare('SELECT handle FROM businesses WHERE id=?').get(workspace.businessId);
  const products=await db.prepare('SELECT id FROM products WHERE business_id=? ORDER BY sort_order').all(workspace.businessId);
  const token=crypto.randomBytes(32).toString('base64url');
  await postgresRuntimeServices().sessions.create({tokenHash:crypto.createHash('sha256').update(token).digest('hex'),userId:workspace.userId,now:Date.now(),expiresAt:Date.now()+86_400_000,ipHash:'fixture',userAgent:'local starter review'});
  const context=await browser.newContext();
  await context.addCookies([{name:'suqpage_session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);
  const config=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));config.include=['next-env.d.ts','**/*.ts','**/*.tsx'];fs.writeFileSync(configName,JSON.stringify(config));
  const env:NodeJS.ProcessEnv={NODE_ENV:'development'};for(const key of ['PATH','HOME','TMPDIR','SHELL'])if(process.env[key])env[key]=process.env[key];
  for(const [key,value] of Object.entries(process.env))if(key.startsWith('SUQPAGE_')||key.startsWith('NEXT_PUBLIC_'))env[key]=value;
  Object.assign(env,{SUQPAGE_POSTGRES_URL:process.env.SUQPAGE_POSTGRES_URL,SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem',SUQPAGE_MEDIA_ROOT:media,SUQPAGE_NEXT_DIST_DIR:'.next-acceptance/suqpage-acceptance-business-starters',SUQPAGE_NEXT_TSCONFIG:configName,SUQPAGE_CANONICAL_URL:base,NEXT_PUBLIC_APP_URL:base,PRIVACY_SALT:'local-business-starters-review-privacy-salt',NEXT_TELEMETRY_DISABLED:'1'});
  const fd=fs.openSync(path.join(out,'server.log'),'w',0o600);
  app=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3104'],{env,stdio:['ignore',fd,fd]});
  const deadline=Date.now()+120_000;let ready=false;
  while(Date.now()<deadline){if(app.exitCode!==null)throw Error('Preview server exited; inspect protected server log.');try{const r=await fetch(base+'/api/places?q=Addis',{signal:AbortSignal.timeout(1500)});if(r.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
  assert.ok(ready,'Preview server started');
  const owner=await context.newPage();const errors:string[]=[];owner.on('pageerror',error=>errors.push(error.message));
  const anonymous=await browser.newContext();const visitor=await anonymous.newPage();
  await visitor.goto(`${base}/@${business.handle}`);
  // Next streams notFound() with status 200 after headers are sent; assert the denial UI and no private content.
  await expect(visitor.getByRole('heading',{name:'404',exact:true})).toBeVisible();
  await expect(visitor.getByText('Sample everyday product',{exact:true})).toHaveCount(0);
  const captures:string[]=[];
  async function capture(page:Page,name:string,width:number){
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>{window.scrollTo({top:0,behavior:'instant'});document.querySelector('[aria-label="Page preview"]')?.scrollTo({top:0,behavior:'instant'});});
   await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: no horizontal overflow`);
   const file=path.join(out,`${name}-${width}.png`);await page.screenshot({path:file,fullPage:true});captures.push(file);
  }
  async function filled(selector:string){
   const values=await owner.locator(selector).evaluateAll(elements=>elements.map(element=>({id:element.id,value:(element as HTMLInputElement).value})));
   assert.ok(values.length>0);for(const field of values)assert.ok(field.value.trim(),`Filled ${field.id}`);
  }
  for(const width of [1440,390,320]){
   await owner.setViewportSize({width,height:900});
   await owner.goto(base+'/dashboard/page-editor');
   await expect(owner.getByText('Make this example page your own before publishing.',{exact:false})).toBeVisible();
   await owner.locator('summary').filter({hasText:'Public contact details'}).click();
   await filled('#shop-about, #shop-video');for(const {key} of publicContactFields)await filled(`#public-${key}`);
   await capture(owner,'page-editor',width);
   await owner.getByRole('button',{name:'Preview',exact:true}).click();
   const preview=owner.getByLabel('Page preview',{exact:true});
   await expect(preview.getByRole('region',{name:'Products & services',exact:true})).toBeVisible();
   for(const img of await preview.locator('img').all())await expect.poll(()=>img.evaluate((element:HTMLImageElement)=>element.complete&&element.naturalWidth>0)).toBeTruthy();
   assert.equal(await preview.locator('a[href^="mailto:"],a[href^="tel:"],a[href*="wa.me"],a[href*="t.me/"],a[href*="tiktok.com"],a[href*="instagram.com"],a[href*="facebook.com"],a[href="https://example.com/"]').count(),0);
   assert.equal(await preview.locator('iframe').count(),0);
   await capture(owner,'page-preview',width);
   await owner.getByRole('button',{name:'Edit',exact:true}).click();
   await owner.getByLabel('About the business',{exact:true}).fill(`Our saved example at ${width} pixels.`);
   await owner.getByRole('button',{name:'Save',exact:true}).click();
   await expect(owner.getByText('Private draft saved',{exact:true})).toBeVisible();await owner.reload();
   await expect(owner.getByLabel('About the business',{exact:true})).toHaveValue(`Our saved example at ${width} pixels.`);
   await owner.getByLabel('About the business',{exact:true}).fill(STARTER_ABOUT);
   await owner.getByRole('button',{name:'Save',exact:true}).click();
   await expect(owner.getByText('Private draft saved',{exact:true})).toBeVisible();
   await owner.goto(base+'/dashboard/business');
   await filled('#owner-business-name, #owner-city, #owner-region, #owner-category, #owner-location-mode');
   await capture(owner,'business-editor',width);
   for(const [index,product] of products.entries()){
    await owner.goto(`${base}/dashboard/products/${product.id}`);
    await filled('.product-upkeep-form input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]), .product-upkeep-form textarea, .product-upkeep-form select');
    assert.deepEqual(await owner.locator('.product-upkeep-form input:not([type="hidden"]):not([type="checkbox"]), .product-upkeep-form textarea, .product-upkeep-form select').evaluateAll(elements=>elements.map(el=>el.getAttribute('name')).filter(Boolean).sort()),['description','name','offeringKind','priceEtb']);
    await capture(owner,`offering-${index}`,width);
   }
   const scan=await new AxeBuilder({page:owner}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations,[]);
  }
  const metadataBefore=await db.prepare('SELECT offering_kind,category_id,quantity_unit,highlights_json,availability,is_published FROM products WHERE id=?').get(products[2].id);
  await owner.getByLabel('Name',{exact:true}).fill('My own custom work');
  await owner.getByRole('button',{name:'Save changes',exact:true}).click();await expect(owner.getByText('Item saved.',{exact:true})).toBeVisible();
  assert.equal((await db.prepare('SELECT name FROM products WHERE id=?').get(products[2].id)).name,'My own custom work');
  assert.deepEqual(await db.prepare('SELECT offering_kind,category_id,quantity_unit,highlights_json,availability,is_published FROM products WHERE id=?').get(products[2].id),metadataBefore);
  await owner.goto(base+'/dashboard/products/new');
  await owner.getByLabel('Name',{exact:true}).fill('A new local service');
  await owner.getByLabel('Description',{exact:true}).fill('Home visits and repairs in your neighborhood.');
  await capture(owner,'new-offering',320);
  await owner.getByRole('button',{name:'Add item',exact:true}).click();
  await expect(owner.getByText('Item saved.',{exact:true})).toBeVisible();
  assert.equal((await db.prepare('SELECT COUNT(*) AS total FROM products WHERE business_id=? AND name=?').get(workspace.businessId,'A new local service')).total,1);
  // Owner setup to public page has no staff review step.
  await owner.goto(base+'/dashboard/business');
  await owner.getByRole('button',{name:'Save business details',exact:true}).click();
  await expect(owner.getByText('Business details saved.',{exact:true})).toBeVisible();
  assert.ok((await db.prepare('SELECT approved_at FROM business_discovery_profiles WHERE business_id=?').get(workspace.businessId)).approved_at>0);
  await owner.goto(base+'/dashboard/page-editor');
  await owner.getByRole('button',{name:'Publish',exact:true}).click();
  await owner.getByRole('button',{name:'Publish page',exact:true}).click();
  await expect(owner.getByText('Your page is live',{exact:true})).toBeVisible();
  await owner.getByLabel('About the business',{exact:true}).fill('Saved directly by the business owner.');
  await owner.getByRole('button',{name:'Save',exact:true}).click();
  await expect(owner.getByText('Changes saved to your live page',{exact:true})).toBeVisible();
  await visitor.goto(`${base}/@${business.handle}`);
  await expect(visitor.getByText('Saved directly by the business owner.',{exact:true})).toBeVisible();
  for(const width of [1440,390,320]){
   await owner.setViewportSize({width,height:900});await owner.goto(base+'/dashboard');
   await expect(owner.getByRole('link',{name:'Review page',exact:true})).toHaveCount(0);
   await capture(owner,'owner-dashboard',width);
  }
  const adminId=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('admin-simple-review@example.test','unused','Review administrator','admin')").run()).insertedId);
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(adminId);
  const adminToken=crypto.randomBytes(32).toString('base64url');
  await postgresRuntimeServices().sessions.create({tokenHash:crypto.createHash('sha256').update(adminToken).digest('hex'),userId:adminId,now:Date.now(),expiresAt:Date.now()+86_400_000,ipHash:'fixture',userAgent:'local workflow review'});
  const adminContext=await browser.newContext();await adminContext.addCookies([{name:'suqpage_session',value:adminToken,url:base,httpOnly:true,sameSite:'Lax'}]);const admin=await adminContext.newPage();
  for(const width of [1440,390,320]){
   await admin.setViewportSize({width,height:900});await admin.goto(base+'/dashboard/admin');
   await expect(admin.getByRole('link',{name:/Page reviews|Location reviews/})).toHaveCount(0);
   await capture(admin,'admin-overview',width);
   await admin.goto(base+'/dashboard/admin/businesses');await capture(admin,'admin-businesses',width);
   const scan=await new AxeBuilder({page:admin}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations,[]);
  }
  await owner.goto(base+'/dashboard/page-editor');await capture(owner,'live-page-editor',320);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify({passed:true,captures,localFixtureSessions:true,productionProviderTested:false},null,2));
  console.log(`PASS complete new signup page, ${captures.length} desktop/phone captures, filled fields, images, save/reload, private public denial and preview contact safety.`);
  if(serve){
   await owner.setViewportSize({width:1440,height:1000});await owner.goto(base+'/dashboard/page-editor');await owner.getByRole('button',{name:'Preview',exact:true}).click();
   console.log(`READY ${base}/dashboard/page-editor — signed-in review browser is open; private fictional starter workspace.`);
   await new Promise<void>(resolve=>{process.once('SIGTERM',()=>resolve());process.once('SIGINT',()=>resolve());});
  }
 } finally {if(app){app.kill('SIGTERM');await new Promise(resolve=>app!.once('exit',resolve));}await browser.close();await closeDbForTests();fs.rmSync(configName,{force:true});fs.rmSync(media,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
