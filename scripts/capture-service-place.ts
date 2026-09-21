import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { postgresRuntimeServices } from '../lib/postgres-runtime-services';

async function main() {
 const base='http://127.0.0.1:3102', out=path.resolve('.local/service-place-review'); fs.mkdirSync(out,{recursive:true,mode:0o700});
 const configName='.acceptance-tsconfig-suqpage-acceptance-service-place.json';
 const media=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-service-review-'));
 const db=await getDb();let app:ChildProcess|undefined;
 const browser=await chromium.launch();
 const created:number[]=[];
 try {
  for(const [index,kinds] of [['standard_product'],['service'],['standard_product','service']].entries()){
   const names=['Cedar Goods','Cedar Services','Cedar Studio'];
   const businessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status,description,hero_image_path,logo_path,public_email,public_phone) VALUES(?,?,'composition','active',?,?,?,?,?)").run(`review-${index}`,names[index],'Explore our work, find the right option and get in touch to discuss what you need.','/uploads/seed/benchmarks/nova-assembly/hero.jpg','/uploads/seed/suqpage/icon.png','hello@example.test','+447700900123')).insertedId);created.push(businessId);
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'electronics')").run(businessId);
   await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,fallback_style,production_scale,approved_at,updated_at) VALUES(?,'Addis Ababa','Addis Ababa','Addis Ababa',9.03581,38.75243,'technical','workshop',?,?)").run(businessId,Date.now(),Date.now());
   for(const [n,kind] of kinds.entries())await db.prepare("INSERT INTO products(business_id,name,slug,description,image_path,offering_kind,quantity_unit,highlights_json,is_published,availability,sort_order) VALUES(?,?,?,?,?,?,?,?,1,'available',?)").run(businessId,kind==='service'?'Equipment inspection':'Portable power unit',`offering-${n}`,kind==='service'?'A practical inspection with clear findings and next steps. Tell us about the equipment you need help with.':'Portable power for everyday equipment. Ask about the options available.',kind==='service'?'/uploads/seed/benchmarks/nova-assembly/hero.jpg':'/uploads/seed/benchmarks/nova-assembly/product-2.jpg',kind,kind==='service'?'session':'piece',JSON.stringify(kind==='service'?['Written findings','Flexible scope','Clear next steps']:['Compact design','Easy to carry']),n);
  }
  async function session(role:'client'|'platform_admin',businessId:number|null){
   const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused','Review fixture',?,?)").run(`${role}@example.test`,role==='client'?'owner':'admin',businessId)).insertedId);
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   const token=crypto.randomBytes(32).toString('base64url');
   await postgresRuntimeServices().sessions.create({tokenHash:crypto.createHash('sha256').update(token).digest('hex'),userId:id,now:Date.now(),expiresAt:Date.now()+3_600_000,ipHash:'fixture',userAgent:'local visual regression'});
   const context=await browser.newContext();await context.addCookies([{name:'suqpage_session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);return context;
  }
  const ownerContext=await session('client',created[2]);const adminContext=await session('platform_admin',null);
  const config=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));config.include=['next-env.d.ts','**/*.ts','**/*.tsx'];fs.writeFileSync(configName,JSON.stringify(config));
  const env:NodeJS.ProcessEnv={NODE_ENV:'development'};for(const key of ['PATH','HOME','TMPDIR','SHELL'])if(process.env[key])env[key]=process.env[key];
  for(const [key,value] of Object.entries(process.env))if(key.startsWith('SUQPAGE_')||key.startsWith('NEXT_PUBLIC_'))env[key]=value;
  Object.assign(env,{SUQPAGE_POSTGRES_URL:process.env.SUQPAGE_POSTGRES_URL,SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem',SUQPAGE_MEDIA_ROOT:media,SUQPAGE_NEXT_DIST_DIR:'.next-acceptance/suqpage-acceptance-service-place',SUQPAGE_NEXT_TSCONFIG:configName,SUQPAGE_CANONICAL_URL:base,NEXT_PUBLIC_APP_URL:base,PRIVACY_SALT:'local-service-place-review-privacy-salt',NEXT_TELEMETRY_DISABLED:'1'});
  const fd=fs.openSync(path.join(out,'server.log'),'w',0o600);
  app=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3102'],{env,stdio:['ignore',fd,fd]});
  const deadline=Date.now()+120_000;let ready=false;
  while(Date.now()<deadline){if(app.exitCode!==null)throw Error('Preview server exited; inspect protected server log.');try{const r=await fetch(base+'/api/places?q=Addis',{signal:AbortSignal.timeout(1500)});if(r.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
  assert.ok(ready,'Preview server started');
  const publicContext=await browser.newContext();const page=await publicContext.newPage();const owner=await ownerContext.newPage();const admin=await adminContext.newPage();
  const errors:string[]=[];for(const p of [page,owner,admin])p.on('pageerror',e=>errors.push(e.message));
  const captures:string[]=[];
  async function capture(p:typeof page,name:string,width:number){await p.evaluate(()=>document.fonts.ready);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} at ${width} has no overflow`);if(name==='place-search'){await p.locator('#owner-city').evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));const box=await p.locator('#owner-city').boundingBox();assert.ok(box&&box.y>0&&box.y<650,'Search is visible above phone navigation');}const file=path.join(out,`${name}-${width}.png`);await p.screenshot({path:file,fullPage:name!=='place-search',caret:'initial'});captures.push(file);}
  await owner.goto(base+'/dashboard/products/new');
  await owner.getByLabel('Name',{exact:true}).fill('Equipment support session');
  await owner.getByLabel('Description',{exact:true}).fill('Help choosing practical next steps for your equipment.');
  await owner.getByLabel('Offering type',{exact:true}).selectOption('service');
  await owner.getByLabel('Offered by',{exact:false}).fill('hour');
  for(const width of [1440,390]){await owner.setViewportSize({width,height:900});await capture(owner,'service-editor',width);}
  await owner.getByRole('button',{name:'Add item',exact:true}).click();await expect(owner.getByText('Offering saved.',{exact:true})).toBeVisible();
  const authored=await db.prepare("SELECT offering_kind,quantity_unit FROM products WHERE business_id=? AND name='Equipment support session'").get(created[2]);assert.equal(authored.offering_kind,'service');assert.equal(authored.quantity_unit,'hour');
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});await owner.setViewportSize({width,height:900});
   for(const [i,label] of ['Products','Services','Products & services'].entries()){
    await page.goto(`${base}/@review-${i}`);await expect(page.getByRole('region',{name:label,exact:true})).toBeVisible();await capture(page,`catalog-${i}`,width);
   }
   await page.goto(base+'/@review-1');await page.locator('a[href*="?product="]').first().click();
   await expect(page.getByRole('button',{name:'Inquire about this service only',exact:true})).toBeVisible();await expect(page.getByText('Per session',{exact:true})).toBeVisible();await capture(page,'service-detail',width);
   await page.getByRole('button',{name:'Inquire about this service only',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await capture(page,'service-inquiry',width);await page.keyboard.press('Escape');
   await owner.goto(base+'/dashboard/business');await owner.getByLabel('Business category',{exact:true}).selectOption('electronics');
   const input=owner.getByRole('combobox',{name:'City or town'});await input.fill('Addis');await expect(owner.getByRole('listbox')).toBeVisible();await input.press('ArrowDown');await capture(owner,'place-search',width);await input.press('Enter');await expect(owner.getByLabel('Region',{exact:true})).toHaveValue('Addis Ababa');
   await owner.getByRole('button',{name:'Save business details',exact:true}).click();await expect(owner.getByText('Business details saved.',{exact:true})).toBeVisible();await owner.reload();await expect(input).toHaveValue('Addis Ababa');await expect(owner.getByText(/Selected: Addis Ababa/)).toBeVisible();await capture(owner,'place-saved',width);
   const stored=await db.prepare('SELECT * FROM owner_location_proposals WHERE business_id=?').get(created[2]);assert.equal(stored.latitude,null);assert.equal(stored.longitude,null);assert.equal(stored.place_latitude,9.03581);
   await page.goto(base+'/about');await expect(page.getByRole('heading',{name:'Your business deserves to be found.'})).toBeVisible();await capture(page,'about',width);
   for(const p of [owner,page]){const scan=await new AxeBuilder({page:p}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations,[]);}
  }
  await admin.goto(`${base}/dashboard/admin/discovery/${created[2]}`);await admin.getByText('Advanced visibility',{exact:false}).click();await expect(admin.getByLabel('Latitude',{exact:true})).toHaveValue('9.03581');await expect(admin.getByLabel('Longitude',{exact:true})).toHaveValue('38.75243');await capture(admin,'admin-place-anchor',1440);
  await page.goto(base+'/?industry=all&q=inspection&type=products&view=search');await expect(page.getByRole('heading',{name:'Results for “inspection”'})).toBeVisible();await expect(page.locator('.discovery-search-workspace').getByText('Equipment inspection',{exact:true})).toBeVisible();await capture(page,'market-services',320);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify({captures,localFixtureSessions:true,productionProviderTested:false,passed:true},null,2));
  console.log(`PASS isolated service/product/mixed pages, service inquiry, keyboard place selection/save/reload, area privacy, admin anchors and six accessibility scans; ${captures.length} screenshots in ${out}.`);
 } finally {if(app){app.kill('SIGTERM');await new Promise(resolve=>app!.once('exit',resolve));}await browser.close();await closeDbForTests();fs.rmSync(configName,{force:true});fs.rmSync(media,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
