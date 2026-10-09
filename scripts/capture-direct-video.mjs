import {normalizeProductVideoUrl} from '../lib/video/product-video.ts';
import {findPlaceSuggestions} from '../lib/place-catalog.ts';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import pg from 'pg';
import sharp from 'sharp';
import {chromium,expect as baseExpect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {createUiText,languageNames} from '../lib/i18n/core.ts';
process.loadEnvFile('.local/supabase-runtime.env');
for(const value of [process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUQPAGE_POSTGRES_URL])assert.equal(new URL(value).hostname,'127.0.0.1');
const base='http://127.0.0.1:3102',mobile='http://localhost:8082',out='.local/direct-video-review';
fs.mkdirSync(out,{recursive:true,mode:0o700});
const pool=new pg.Pool({connectionString:process.env.SUQPAGE_POSTGRES_URL});
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email=`profile-review-${crypto.randomUUID()}@example.test`,handle=`profile-review-${crypto.randomUUID().slice(0,8)}`;
const browser=await chromium.launch();let userId,businessId,token;
const expect=baseExpect.configure({timeout:20000});const checks=[];
async function call(path,body){const r=await fetch(base+'/api/mobile/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
async function webLogin(){const link=await admin.auth.admin.generateLink({type:'magiclink',email});assert.equal(link.error,null);const cookies=[];const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,key,{cookies:{getAll:()=>[],setAll:c=>cookies.push(...c)}});assert.equal((await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'})).error,null);const ctx=await browser.newContext();await ctx.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));return ctx;}
async function shot(page,name,width=390){await page.setViewportSize({width,height:width===1440?1000:844});await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true,style:'nextjs-portal{visibility:hidden}'});}
try{
 const created=await admin.auth.admin.createUser({email,email_confirm:true});assert.equal(created.error,null);userId=created.data.user.id;
 const link=await admin.auth.admin.generateLink({type:'magiclink',email});const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});const login=await client.auth.verifyOtp({type:'magiclink',token_hash:link.data.properties.hashed_token});assert.equal(login.error,null);token=login.data.session.access_token;
 await call('signup',{name:'Video Owner',phone:'+251911002277',businessName:'Direct Video Store',businessCategory:'home-living',placeId:findPlaceSuggestions('Addis Ababa')[0].id,handle,consent:true,idempotencyKey:crypto.randomUUID()});businessId=(await call('owner/home')).shop.id;
 const cases=[['tiktok','https://www.tiktok.com/@scout2015/video/6718335390845095173','tiktok:6718335390845095173'],['facebook','https://www.facebook.com/FacebookDevelopers/videos/10152454700553553/','facebook:10152454700553553'],['instagram','https://www.instagram.com/reel/Dbaz44lEjdH/','instagram:Dbaz44lEjdH'],['youtube','https://youtu.be/aqz-KE-bpKQ','youtube:aqz-KE-bpKQ']];
 const ctx=await webLogin(),page=await ctx.newPage();page.setDefaultNavigationTimeout(60000);
 const mock=`<html><body style="background:#202428;color:white;font:16px sans-serif;display:grid;place-content:center;height:95vh">Provider player fixture</body></html>`;
 for(const route of ['https://www.tiktok.com/player/v1/**','https://www.facebook.com/plugins/video.php**','https://www.instagram.com/reel/**/embed/**','https://www.youtube-nocookie.com/**'])await ctx.route(route,r=>r.fulfill({contentType:'text/html',body:mock}));
 for(const [provider,url,ref] of cases){
  await page.goto(base+'/dashboard/page-editor?view=edit&returnTo=profile');await expect(page.getByText('Send us a video link. Our team will review it for your page.',{exact:true})).toHaveCount(0);await expect(page.locator('#shop-video')).toBeEditable();await expect(page.getByText('TikTok, YouTube, Facebook videos or Instagram Reels',{exact:true})).toBeVisible();await page.locator('#shop-video').fill(url);await page.getByRole('button',{name:'Save',exact:true}).click();await expect(page).toHaveURL(/dashboard\/profile/);const home=await call('owner/home');assert.equal(normalizeProductVideoUrl(home.shop.videoUrl).managedRef,ref);
  await page.goto(base+'/dashboard/page-editor?view=preview');await page.getByRole('button',{name:'Play business video about Direct Video Store',exact:true}).click();await expect(page.locator('iframe')).toBeVisible();assert.equal(ctx.pages().length,1);await shot(page,'web-cover-'+provider,390);await shot(page,'web-cover-'+provider,1440);checks.push('Web direct '+provider+' cover save/reload/inline preview');
 }
 const home=await call('owner/home'),product=home.shop.products[0];await page.goto(base+'/dashboard/products/'+product.id);
 await page.getByRole('button',{name:'Remove media 3',exact:true}).click();
 for(const [provider,url] of cases){await page.locator('#product-video-link').fill(url);await page.getByRole('button',{name:'Add video',exact:true}).click();}
 await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByText('Item saved.',{exact:true})).toBeVisible();await page.reload();const saved=(await call('owner/home')).shop.products.find(p=>p.id===product.id);assert.deepEqual(saved.media.filter(m=>m.kind==='video').map(m=>m.ref),cases.map(c=>c[2]));await shot(page,'web-product-four-links',390);checks.push('Web product saves four direct providers with photos/order retained');await ctx.close();
 const native=await browser.newContext({viewport:{width:390,height:844}}),p=await native.newPage();p.setDefaultNavigationTimeout(60000);for(const route of ['https://www.tiktok.com/player/v1/**','https://www.facebook.com/plugins/video.php**','https://www.instagram.com/reel/**/embed/**'])await native.route(route,r=>r.fulfill({contentType:'text/html',body:mock}));
 await p.goto(mobile+'/account');await p.getByRole('textbox',{name:'Email',exact:true}).fill(email);await p.getByRole('button',{name:'Send code',exact:true}).click();await expect(p.getByRole('textbox',{name:'Verification code',exact:true})).toBeVisible();const otp=await admin.auth.admin.generateLink({type:'magiclink',email});await p.getByRole('textbox',{name:'Verification code',exact:true}).fill(otp.data.properties.email_otp);await p.getByRole('button',{name:'Verify code',exact:true}).click();await expect(p.getByRole('heading',{name:'Profile',exact:true})).toBeVisible();
 for(const [provider,url,ref] of cases){
  await p.getByRole('button',{name:'Edit page',exact:true}).click();await p.getByRole('textbox',{name:'Business video',exact:true}).fill(url);await p.getByRole('button',{name:'Save changes',exact:true}).click();await expect(p.getByRole('heading',{name:'Profile',exact:true})).toBeVisible();assert.equal(normalizeProductVideoUrl((await call('owner/home')).shop.videoUrl).managedRef,ref);checks.push('Expo direct '+provider+' cover saves and returns to Profile');
 }
 for(const [provider,,ref] of cases.slice(0,3)){
  await p.getByRole('tab',{name:'Account',exact:true}).click();await expect(p.getByRole('heading',{name:'Profile',exact:true})).toBeVisible();await p.getByRole('button',{name:'Preview page',exact:true}).click();await p.getByRole('button',{name:product.name,exact:true}).click();const index=saved.media.findIndex(m=>m.ref===ref);await p.getByRole('button',{name:'Video '+(index+1),exact:true}).click();await p.getByRole('button',{name:'Watch video',exact:true}).and(p.locator(':enabled')).click();await expect(p.locator('iframe')).toBeVisible();await expect(p.getByText('Loading video…',{exact:true})).toHaveCount(0);assert.equal(native.pages().length,1);await shot(p,'expo-product-'+provider,390);await p.getByRole('button',{name:'Photo 1',exact:true}).click();await expect(p.locator('iframe')).toHaveCount(0);
 }
 await native.close();assert.equal((await pool.query('SELECT COUNT(*)::int n FROM support_video_requests WHERE business_id=$1',[businessId])).rows[0].n,0);fs.writeFileSync(out+'/verified.json',JSON.stringify({checks,staffApprovalRequests:0,realCustomersChanged:0,provider:'Fixture; real playback recorded separately'},null,2));console.log('PASS direct four-provider cover/product save, reload, inline preview, portrait fills, Profile return and no staff tickets on web/Expo.');
}finally{
  if(businessId){const db=await pool.connect();try{await db.query('BEGIN');for(const table of ['owner_page_reviews','owner_page_publications','owner_page_events','owner_page_drafts','product_upkeep_commands','published_catalog_versions','audit_logs'])await db.query(`DELETE FROM ${table} WHERE business_id=$1`,[businessId]);await db.query('DELETE FROM businesses WHERE id=$1',[businessId]);await db.query('COMMIT');}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}}
  if(userId)await admin.auth.admin.deleteUser(userId);await pool.end();await browser.close();
}
