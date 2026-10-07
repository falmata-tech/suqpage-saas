import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import pg from 'pg';
import { chromium, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
process.loadEnvFile('.local/supabase-runtime.env');
const provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL), dbUrl=new URL(process.env.SUQPAGE_POSTGRES_URL);
assert.equal(provider.hostname,'127.0.0.1');assert.equal(provider.port,'54321');assert.equal(dbUrl.hostname,'127.0.0.1');assert.equal(dbUrl.port,'54322');
const base='http://127.0.0.1:3102', mobile='http://localhost:8082', out='.local/storefront-color-refinement';fs.mkdirSync(out,{recursive:true});
const pool=new pg.Pool({connectionString:dbUrl.href});
const admin=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const email=`accent-review-${crypto.randomUUID()}@example.test`;
const created=await admin.auth.admin.createUser({email,email_confirm:true});assert.equal(created.error,null);
const link=await admin.auth.admin.generateLink({type:'magiclink',email});assert.equal(link.error,null);
const cookies=[];
const auth=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{getAll:()=>[],setAll:values=>cookies.push(...values)}});
const verified=await auth.auth.verifyOtp({type:'email',email,token:link.data.properties.email_otp});assert.equal(verified.error,null);
const token=verified.data.session.access_token;
async function call(path,body){const r=await fetch(base+'/api/mobile/v1/'+path,{method:body?'POST':'GET',headers:{authorization:`Bearer ${token}`,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));return data;}
const browser=await chromium.launch();let home;const errors=[];const shots=[];
async function shot(page,name){await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.public-workspace-loading')).toHaveCount(0);await page.waitForFunction(()=>[...document.images].filter(i=>i.loading!=='lazy').every(i=>i.complete));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');await page.screenshot({path:out+'/'+name+'.png'});shots.push(name);}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/request');
 await page.getByLabel('Your name',{exact:true}).fill('Accent Review Owner');
 await page.getByLabel('Name buyers will see',{exact:true}).fill('Accent Review Studio');
 await page.getByLabel('Page handle',{exact:true}).fill('accent-'+crypto.randomUUID().slice(0,8));
 await expect(page.locator('#signup-handle-status')).toHaveText('Available');
 await page.locator('[name="businessCategory"]').selectOption('home-living');
 await page.getByLabel('Account phone (private)',{exact:true}).fill('+251911000123');
 await expect(page.getByText('Page color',{exact:true})).toHaveCount(0);
 await expect(page.locator('input[type=color]')).toHaveCount(0);
 await shot(page,'web-setup-1440');
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Finish setup',exact:true}).click();
 await expect(page).toHaveURL(/page-editor/, {timeout:30000});
 home=await call('owner/home');assert.ok(!home.draft.content.accentColor);
 await page.getByRole('button',{name:'Page color',exact:true}).click();
 await page.getByLabel('Custom color',{exact:true}).fill('#fa7319');
 await expect(page.locator('[data-business-profile]')).toHaveAttribute('data-store-accent','#FA7319');
 await expect(page.locator('[data-business-profile]')).toBeVisible();
 await page.getByRole('button',{name:'Choose color #B6FF00',exact:true}).click();
 await page.getByRole('button',{name:'Save',exact:true}).click();
 await expect(page.getByText('Private draft saved',{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Page color',exact:true}).click();
 await expect(page.getByRole('button',{name:'Choose color #B6FF00',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Choose color #B6FF00',exact:true}).scrollIntoViewIfNeeded();await shot(page,'web-editor-1440');
 for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.getByRole('button',{name:'Choose color #B6FF00',exact:true}).scrollIntoViewIfNeeded();await shot(page,'web-editor-'+width);}
 home=await call('owner/home');
 // Complete only this disposable fixture for a genuine public route, without bypassing publication checks.
 await pool.query("UPDATE products SET name='Handwoven piece ' || id,description='Handwoven cotton textile' WHERE business_id=$1",[home.shop.id]);
 await pool.query('UPDATE owner_location_proposals SET version=version+1 WHERE business_id=$1',[home.shop.id]);
 const saved=await call('owner/page',{action:'save',version:home.draft.version,content:{...home.draft.content,about:'Handwoven textiles for everyday living.',contacts:{phone:'+251911000123'}}});
 await call('owner/publish',{version:saved.version,revision:0});
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(base+'/@'+home.shop.handle);await expect(page.locator('[data-business-profile]')).toHaveAttribute('data-store-accent','#B6FF00');await expect(page.locator('[data-business-profile]')).toBeVisible();await shot(page,'web-storefront-'+width);}
 const photo=page.locator('[data-business-profile] a[class*="productImage"] img').first();assert.equal(await photo.evaluate(el=>getComputedStyle(el).filter),'none');
 await page.locator('[data-business-profile] a[class*="productImage"]').first().click();await expect(page.locator('[data-product-page]')).toBeVisible();await shot(page,'web-product-320');
 const mobilePage=await context.newPage();mobilePage.on('pageerror',e=>errors.push(e.message));await mobilePage.setViewportSize({width:390,height:844});
 await mobilePage.goto(mobile+'/account');await mobilePage.getByLabel('Email',{exact:true}).fill(email);await mobilePage.getByRole('button',{name:'Send code',exact:true}).click();await expect(mobilePage.getByLabel('Verification code',{exact:true})).toBeVisible({timeout:30000});
 const login=await admin.auth.admin.generateLink({type:'magiclink',email});assert.equal(login.error,null);await mobilePage.getByLabel('Verification code',{exact:true}).fill(login.data.properties.email_otp);await mobilePage.getByRole('button',{name:'Verify code',exact:true}).click();
 await mobilePage.getByRole('button',{name:'Your page',exact:true}).click();
 await mobilePage.getByRole('button',{name:'Page color',exact:true}).click();
 await mobilePage.getByRole('button',{name:'Choose color #7900FF',exact:true}).click();
 await mobilePage.getByRole('button',{name:'Color +',exact:true}).click();
 await shot(mobilePage,'native-picker-390');
 await mobilePage.setViewportSize({width:320,height:700});await shot(mobilePage,'native-picker-320');
 await mobilePage.getByRole('button',{name:'Choose color #7900FF',exact:true}).click();
 await mobilePage.getByRole('button',{name:'Done',exact:true}).click();
 await mobilePage.setViewportSize({width:390,height:844});
 await mobilePage.getByRole('button',{name:'Save changes',exact:true}).click();await expect(mobilePage.getByText('Saved',{exact:true})).toBeVisible();
 assert.equal((await call('owner/home')).draft.content.accentColor,'#7900FF');
 await expect(mobilePage.getByText('Handwoven textiles for everyday living.',{exact:true})).toBeVisible();await shot(mobilePage,'native-preview-390');
 for(const width of [390,320]){await mobilePage.setViewportSize({width,height:844});await mobilePage.goto(mobile+'/shop/'+home.shop.handle);await expect(mobilePage.getByText(home.shop.name,{exact:true}).last()).toBeVisible();await shot(mobilePage,'native-storefront-'+width);}
 await page.goto(base+'/@'+home.shop.handle);await expect(page.locator('[data-business-profile]')).toHaveAttribute('data-store-accent','#7900FF');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/verification.json',JSON.stringify({checks:['signup has no color controls','visual custom picker updates whole page','web save/reload','public publication','native edit save and web refresh','private preview','desktop/390/320 overflow','original product photos','no browser errors'],shots,native:'Expo browser; not physical device',fixture:'disposable local business, hidden after capture'},null,2));
 console.log('PASS: '+shots.length+' implementation captures; actual signup, web/native save, reload and publication.');
}finally{
 if(!home){try{home=await call('owner/home');}catch{}}
 if(home)await pool.query("UPDATE businesses SET status='draft' WHERE id=$1 AND handle=$2",[home.shop.id,home.shop.handle]);
 await browser.close();await pool.end();
}
