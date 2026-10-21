import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getDb, seedFixture, closeDbForTests } from './testing/postgres-fixture';
import { postgresRuntimeServices } from '../lib/postgres-runtime-services';
import { getFeaturedShowroomsView, getMarketplaceDiscoveryView } from '../lib/discovery';
async function main(){
 const db=await getDb();let app:ChildProcess|undefined;const out='.local/demo-capability-review';fs.mkdirSync(out,{recursive:true,mode:0o700});
 const configName='.acceptance-tsconfig-suqpage-acceptance-demo-capabilities.json',base='http://127.0.0.1:3104';
 const browser=await chromium.launch();
 try{
  await seedFixture();
  for(let day=0;day<7;day++){const view=await getFeaturedShowroomsView({featuredDay:day});assert.ok(view.featured.boothCount>0,'Every Featured day has examples');}
  const all=await getMarketplaceDiscoveryView({industry:'all'});assert.equal(all.total,66);assert.equal(all.resultCounts.products,264);
  const shops=await db.prepare('SELECT id,handle FROM businesses ORDER BY id').all();
  const shop=shops[0];const products=await db.prepare('SELECT id FROM products WHERE business_id=? ORDER BY id LIMIT 2').all(shop.id);
  const config=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));config.include=['next-env.d.ts','**/*.ts','**/*.tsx'];fs.writeFileSync(configName,JSON.stringify(config));
  const env:NodeJS.ProcessEnv={NODE_ENV:'development'};for(const key of ['PATH','HOME','TMPDIR','SHELL'])if(process.env[key])env[key]=process.env[key];
  for(const [key,value] of Object.entries(process.env))if(key.startsWith('SUQPAGE_')||key.startsWith('NEXT_PUBLIC_'))env[key]=value;
  Object.assign(env,{SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem',SUQPAGE_NEXT_DIST_DIR:'.next-acceptance/suqpage-acceptance-demo-capabilities',SUQPAGE_NEXT_TSCONFIG:configName,SUQPAGE_CANONICAL_URL:base,NEXT_PUBLIC_APP_URL:base,PRIVACY_SALT:'demo-capability-review-private-test-salt',NEXT_TELEMETRY_DISABLED:'1'});
  const fd=fs.openSync(out+'/server.log','w',0o600);app=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3104'],{env,stdio:['ignore',fd,fd]});fs.closeSync(fd);
  let ready=false;for(let n=0;n<120;n++){try{if((await fetch(base+'/api/health',{signal:AbortSignal.timeout(1000)})).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}assert.ok(ready);
  const captures:string[]=[];
  for(const width of [1440,390,320]){
   const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();
   await page.goto(`${base}/@${shop.handle}`);
   const contacts=page.getByRole('region',{name:'Connect with this business'});await expect(contacts.locator('a')).toHaveCount(8);
   for(const href of ['https://t.me/alhayabrand','https://www.tiktok.com/@alhayabrand','https://www.instagram.com/alhayabrand/','https://www.facebook.com/alhayabrand'])await expect(contacts.locator(`a[href="${href}"]`)).toHaveCount(1);
   await contacts.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/contacts-${width}.png`});captures.push(`contacts-${width}`);
   await page.goto(`${base}/@${shop.handle}?product=${products[0].id}`);
   await page.getByRole('button',{name:/^Inquire about this (product|service) only$/}).click();
   const dialog=page.getByRole('dialog',{name:'Business inquiry'});
   await expect(dialog.getByRole('link',{name:/^Telegram/})).toHaveAttribute('href',/t\.me\/alhayabrand\?text=/);
   await expect(dialog.getByRole('link',{name:/^WhatsApp/})).toHaveAttribute('href',/wa\.me\/447700900/);
   await expect(dialog.getByRole('link',{name:'SMS',exact:true})).toHaveAttribute('href',/^sms:/);
   await expect(dialog.getByRole('textbox',{name:'Reply phone number'})).toHaveCount(0);
   await page.screenshot({path:`${out}/inquiry-${width}.png`});captures.push(`inquiry-${width}`);
   await dialog.getByRole('button',{name:'Send inquiry on Suqpage',exact:true}).click();await expect(dialog.getByRole('textbox',{name:'Reply phone number'})).toBeVisible();
   await dialog.getByRole('button',{name:'Close inquiry'}).click();
   for(const product of products){await page.goto(`${base}/@${shop.handle}?product=${product.id}`);await page.getByRole('button',{name:'Add to inquiry list',exact:true}).click();}
   await page.getByRole('button',{name:'Inquire about selected items',exact:true}).click();
   await expect(dialog.getByRole('list',{name:'Inquiry items'}).locator('li')).toHaveCount(2);
   await expect(dialog.getByRole('link',{name:/^Telegram/})).toHaveAttribute('href',new RegExp(`product%3D${products[1].id}`));
   await dialog.getByRole('button',{name:'Close inquiry'}).click();
   await page.goto(base+'/featured');await expect(page.locator('main')).toBeVisible();await page.screenshot({path:`${out}/featured-${width}.png`,fullPage:true});captures.push(`featured-${width}`);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await context.close();
  }
  for(const role of ['client','platform_admin']){
   const user=await db.prepare('SELECT u.id FROM users u JOIN user_access_profiles a ON a.user_id=u.id WHERE a.access_role=? ORDER BY u.id LIMIT 1').get(role);
   await db.prepare('UPDATE users SET must_change_password=0 WHERE id=?').run(user.id);
   const token=crypto.randomBytes(32).toString('base64url');await postgresRuntimeServices().sessions.create({tokenHash:crypto.createHash('sha256').update(token).digest('hex'),userId:user.id,now:Date.now(),expiresAt:Date.now()+3600000,ipHash:'fixture',userAgent:'local demo review'});
   const context=await browser.newContext({viewport:{width:390,height:900}});await context.addCookies([{name:'suqpage_session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);const page=await context.newPage();
   for(const route of role==='client'?['/dashboard','/dashboard/inquiries','/dashboard/support']:['/dashboard/admin','/dashboard/admin/businesses']){
    await page.goto(base+route);await expect(page).not.toHaveURL(/login|change-password/);await expect(page.getByRole('heading',{name:'404',exact:true})).toHaveCount(0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const name=role+route.replaceAll('/','-');await page.screenshot({path:`${out}/${name}.png`,fullPage:true});captures.push(name);
   }
   const scan=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations,[]);await context.close();
  }
  fs.writeFileSync(out+'/evidence.json',JSON.stringify({passed:true,captures,featuredDays:7,businesses:66,products:264,externalMessagesSent:0},null,2));console.log(`PASS ${captures.length} demo capability captures, contact links, single/group handoffs, phone disclosure, all Featured days and owner/admin screens.`);
 }finally{await browser.close();if(app&&app.exitCode===null){app.kill('SIGTERM');await new Promise(resolve=>app!.once('exit',resolve));}fs.rmSync(configName,{force:true});await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
