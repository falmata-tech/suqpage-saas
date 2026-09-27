import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServerClient,type CookieOptions} from '@supabase/ssr';
import {createPostgresPool,postgresRuntimeConfig} from '../lib/postgres-runtime';
import {curatedManifestForLegacyDesign} from '../lib/showroom-manifests';
import {STARTER_VIDEO_REF,starterPage} from '../lib/business-starter';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';
import {updateSupportAgentSetting,reassignSupportConversation} from '../lib/support';
import type {SessionUser} from '../lib/types';
async function main(){
 const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102',provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!),target=new URL(process.env.SUQPAGE_POSTGRES_URL!);
 assert.equal(new URL(base).hostname,'127.0.0.1');assert.equal(provider.hostname,'127.0.0.1');assert.ok(['54321','56321'].includes(provider.port));assert.equal(target.hostname,'127.0.0.1');assert.ok(['54322','56322'].includes(target.port));
 const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:target.href})!);
 const auth=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const browser=await chromium.launch(),ids:number[]=[],providerIds:string[]=[],dir=process.env.SUQPAGE_TEST_SCREENSHOT_DIR||'.local/video-request-review';fs.mkdirSync(dir,{recursive:true});let businessId:number|undefined;
 const handle=`video-review-${crypto.randomBytes(5).toString('hex')}`;
 let phase='fixture';
 const mark=(value:string)=>{phase=value;fs.writeFileSync(`${dir}/phase.json`,JSON.stringify({phase,at:new Date().toISOString()}),{mode:0o600});};
 async function login(role:'client'|'operations_manager'){
  const email=`video-${role}-${crypto.randomUUID()}@example.test`,made=await auth.auth.admin.createUser({email,email_confirm:true});assert.ok(!made.error&&made.data.user);providerIds.push(made.data.user.id);
  const id=Number((await pool.query("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES($1,'unused',$2,$3,$4,0) RETURNING id",[email,role==='client'?'Video review owner':'Video review staff',role==='client'?'owner':'admin',role==='client'?businessId:null])).rows[0].id);ids.push(id);
  await pool.query('INSERT INTO user_access_profiles(user_id,access_role) VALUES($1,$2)',[id,role]);await pool.query("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES($1,'supabase',$2,$3,$4)",[id,made.data.user.id,email,Date.now()]);
  const link=await auth.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error&&link.data.properties.email_otp);
  const cookies:Array<{name:string;value:string;options:CookieOptions}>=[];
  const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll:()=>[],setAll:v=>{cookies.push(...v);}}});assert.ok(!(await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'})).error);
  const context=await browser.newContext();context.setDefaultNavigationTimeout(30000);context.setDefaultTimeout(15000);await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax' as const})));return {page:await context.newPage(),id};
 }
 try{
  businessId=Number((await pool.query("INSERT INTO businesses(handle,name,design_key,design_manifest_json,status,hero_image_path,process_video_ref) VALUES($1,'Video review business','composition',$2,'active',$3,$4) RETURNING id",[handle,JSON.stringify(curatedManifestForLegacyDesign('novatech')),starterPage.heroImage,STARTER_VIDEO_REF])).rows[0].id);
  const productId=Number((await pool.query("INSERT INTO products(business_id,name,slug,description,image_path,video_ref) VALUES($1,'Example product','example-product','Product video request review',$2,$3) RETURNING id",[businessId,starterPage.heroImage,STARTER_VIDEO_REF])).rows[0].id);
  mark('owner authentication');const owner=await login('client');mark('staff authentication');const staff=await login('operations_manager');
  const staffUser:SessionUser={id:staff.id,email:'video-review@example.test',name:'Video review staff',role:'admin',access_role:'operations_manager',business_id:null,must_change_password:0};
  mark('agent setup');await updateSupportAgentSetting(staffUser,{userId:staff.id,enabled:true,maxOpenConversations:1,queueScope:'support'});
  for(const width of [1440,390]){
   mark(`owner editor ${width}`);await owner.page.setViewportSize({width,height:900});await owner.page.goto(`${base}/dashboard/products/${productId}`);
   await expect(owner.page.locator('.product-media-video input')).toHaveAttribute('readonly','');
   await expect(owner.page.getByRole('link',{name:'Request a video',exact:true})).toHaveAttribute('href',`/dashboard/support?video=product&product=${productId}`);
   await owner.page.locator('.product-media-editor').scrollIntoViewIfNeeded();await owner.page.screenshot({path:`${dir}/product-${width}.png`,style:'nextjs-portal {visibility:hidden}'});
   await owner.page.goto(`${base}/dashboard/support?video=product&product=${productId}`);
   await expect(owner.page.getByLabel('Video link',{exact:true})).toBeVisible();await owner.page.getByLabel('Video link',{exact:true}).fill('https://example.com/our-product-video');
   assert.ok(await owner.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await owner.page.screenshot({path:`${dir}/request-${width}.png`,style:'nextjs-portal {visibility:hidden}'});
  }
  mark('owner submission');await owner.page.getByLabel('Video link',{exact:true}).fill('http://example.com/video');
  await owner.page.getByRole('button',{name:'Send video request',exact:true}).click();
  await expect(owner.page.locator('.error')).toHaveText('Add a valid HTTPS video link.');
  assert.equal(new URL(owner.page.url()).searchParams.get('product'),String(productId));
  await owner.page.getByLabel('Video link',{exact:true}).fill('https://example.com/our-product-video');
  await owner.page.getByRole('button',{name:'Send video request',exact:true}).click();await owner.page.waitForURL(/\/dashboard\/support\/\d+/);
  const id=Number(new URL(owner.page.url()).pathname.split('/').at(-1));
  await reassignSupportConversation(staffUser,id,staff.id);
  for(const width of [1440,390]){
   mark(`staff review ${width}`);await staff.page.setViewportSize({width,height:900});await staff.page.goto(`${base}/dashboard/support/${id}`);
   await expect(staff.page.getByRole('button',{name:'Approve video',exact:true})).toBeEnabled();
   await expect(staff.page.locator('input[name=confirmed]')).toHaveCount(0);
   await staff.page.getByLabel('YouTube link',{exact:true}).fill('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
   await staff.page.getByLabel('Reply to owner').scrollIntoViewIfNeeded();assert.ok(await staff.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await staff.page.screenshot({path:`${dir}/staff-${width}.png`,style:'nextjs-portal {visibility:hidden}'});
   await staff.page.getByRole('button',{name:'Decline',exact:true}).scrollIntoViewIfNeeded();
   await staff.page.screenshot({path:`${dir}/staff-actions-${width}.png`,style:'nextjs-portal {visibility:hidden}'});
  }
  mark('approval');await staff.page.getByLabel('Reply to owner').fill('Your product video is ready.');
  await staff.page.getByRole('button',{name:'Approve video',exact:true}).click();
  await expect(staff.page.getByLabel('YouTube link',{exact:true})).toHaveCount(0);
  await owner.page.reload();await expect(owner.page.getByText(/Your product video is ready\./)).toBeVisible();
  assert.equal((await pool.query('SELECT video_ref FROM products WHERE id=$1',[productId])).rows[0].video_ref,'youtube:aqz-KE-bpKQ');
  mark('public gallery');const visitor=await browser.newPage({viewport:{width:390,height:900}});
  // Verify Suqpage selects the approved embed; do not depend on external playback.
  visitor.setDefaultNavigationTimeout(30000);visitor.setDefaultTimeout(15000);
  await visitor.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({status:200,body:''}));
  await visitor.goto(`${base}/@${handle}?product=${productId}`);
  const gallery=visitor.getByRole('region',{name:'Photos and videos',exact:true});
  await gallery.getByRole('button',{name:'Video 2',exact:true}).click();
  await gallery.getByRole('button',{name:'Play video 2',exact:true}).click();
  await expect(gallery.locator('iframe')).toHaveAttribute('src',/youtube-nocookie\.com\/embed\/aqz-KE-bpKQ/);
  await gallery.scrollIntoViewIfNeeded();await visitor.screenshot({path:`${dir}/approved-public-390.png`,style:'nextjs-portal {visibility:hidden}'});
  await owner.page.goto(`${base}/dashboard/support?video=product&product=${productId}`);
  await owner.page.getByLabel('Video link',{exact:true}).fill('https://example.com/another-video');
  await owner.page.getByRole('button',{name:'Send video request',exact:true}).click();await owner.page.waitForURL(/\/dashboard\/support\/\d+/);
  const declineId=Number(new URL(owner.page.url()).pathname.split('/').at(-1));
  await updateSupportAgentSetting(staffUser,{userId:staff.id,enabled:true,maxOpenConversations:2,queueScope:'support'});
  await reassignSupportConversation(staffUser,declineId,staff.id);
  await staff.page.goto(`${base}/dashboard/support/${declineId}`);
  mark('decline');await staff.page.getByLabel('Reply to owner').fill('Please share a downloadable copy of the video.');await staff.page.getByRole('button',{name:'Decline',exact:true}).click();
  await expect(staff.page.getByLabel('Reply to owner')).toHaveCount(0);
  await expect(staff.page.getByText('Please share a downloadable copy of the video.',{exact:true})).toBeVisible();
  await owner.page.reload();await expect(owner.page.getByText('Please share a downloadable copy of the video.',{exact:true})).toBeVisible();
  assert.equal((await pool.query('SELECT video_ref FROM products WHERE id=$1',[productId])).rows[0].video_ref,'youtube:aqz-KE-bpKQ');
  await owner.page.goto(`${base}/dashboard/page-editor`);await expect(owner.page.locator('#shop-video')).toHaveAttribute('readonly','');await expect(owner.page.getByRole('link',{name:'Request a video',exact:true})).toHaveAttribute('href','/dashboard/support?video=header');
  console.log('PASS owner video request submission, readonly media controls, staff approval without channel setup, public approved embed, reply/decline, retained media and 390/1440 layouts. Local fixtures removed.');
 }catch(error){console.error('Video workflow failed at',phase,error instanceof Error?error.message:'Unknown failure');throw error;}finally{
  mark('cleanup');
  if(businessId){await pool.query('DELETE FROM audit_logs WHERE business_id=$1',[businessId]);await pool.query('DELETE FROM support_conversations WHERE business_id=$1',[businessId]);await pool.query('DELETE FROM businesses WHERE id=$1',[businessId]);}
  for(const id of ids){await pool.query('DELETE FROM audit_logs WHERE user_id=$1',[id]);await pool.query('DELETE FROM users WHERE id=$1',[id]);}
  for(const id of providerIds)assert.ok(!(await auth.auth.admin.deleteUser(id)).error);
  await browser.close();await pool.end();await closePostgresRuntimeForTests();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});
