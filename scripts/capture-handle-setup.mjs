import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import pg from 'pg';
import {chromium,expect as baseExpect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
for(const url of [base,process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUQPAGE_POSTGRES_URL])assert.ok(['127.0.0.1','localhost'].includes(new URL(url).hostname),'Local-only review');
const out='.local/starter-handle-review';fs.mkdirSync(out,{recursive:true,mode:0o700});
const pool=new pg.Pool({connectionString:process.env.SUQPAGE_POSTGRES_URL});
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const browser=await chromium.launch();let userId,businessId;
const email=`starter-review-${crypto.randomUUID()}@example.test`;
const expect=baseExpect.configure({timeout:15000});
const errors=[];
async function signIn(email){
 const link=await admin.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error);
 const cookies=[];const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:values=>cookies.push(...values)}});
 assert.ok(!(await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'})).error);
 const context=await browser.newContext();await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));return context;
}
async function capture(page,name){for(const width of [1440,390,320]){await page.setViewportSize({width,height:width===1440?1000:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} overflow at ${width}`);await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true,style:'nextjs-portal{visibility:hidden}'});}}
try {
 const anonymous=await browser.newContext();const brandPage=await anonymous.newPage();let brandStyle;
 for(const locale of ['en','am','om','so','ti']){
  await anonymous.addCookies([{name:'suqpage-language',value:locale,url:base}]);await brandPage.goto(base+'/login');await brandPage.setViewportSize({width:1440,height:1000});await brandPage.evaluate(()=>document.fonts.ready);
  const brand=brandPage.locator('.suqpage-wordmark').first();await expect(brand).toBeVisible();
  const style=await brand.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {font:s.fontFamily,weight:s.fontWeight,spacing:s.letterSpacing,width:r.width,height:r.height,text:el.textContent}});
  if(!brandStyle)brandStyle=style;else assert.deepEqual(style,brandStyle,`Stable ${locale} wordmark`);
  await brand.screenshot({path:`${out}/logo-${locale}.png`});assert.ok(fs.readFileSync(`${out}/logo-${locale}.png`).equals(fs.readFileSync(`${out}/logo-en.png`)),`Identical ${locale} logo pixels`);
 }
 await anonymous.addCookies([{name:'suqpage-language',value:'en',url:base}]);assert.equal((await anonymous.request.get(base+'/api/signup/handle?handle=anything')).status(),401);
 const created=await admin.auth.admin.createUser({email,email_confirm:true});assert.ok(!created.error);userId=created.data.user.id;
 const context=await signIn(email);const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'/request');await expect(page.locator('#signup-handle')).toHaveCount(0);
 await page.locator('#signup-name').fill('Demo Owner');await page.locator('#signup-business').fill('Example Studio');await page.getByLabel('Category',{exact:true}).selectOption('home-living');await page.getByLabel('Account phone (private)',{exact:true}).fill('+447700900999');await page.getByRole('checkbox').check();const signupResponse=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/signup');await page.getByRole('button',{name:'Finish setup',exact:true}).click();assert.equal((await signupResponse).status(),201);await expect(page).toHaveURL(/\/dashboard\/page-editor\?view=preview$/,{timeout:60000});
 const record=(await pool.query('SELECT b.id,b.handle FROM businesses b JOIN users u ON u.business_id=b.id WHERE u.email=$1',[email])).rows[0];assert.ok(record);businessId=record.id;
 await expect(page.getByLabel('Page preview',{exact:true})).toBeVisible();await capture(page,'first-page-preview');await page.getByRole('button',{name:'Edit',exact:true}).click();await expect(page.getByLabel('About the business',{exact:true})).not.toHaveValue('');await capture(page,'automatic-page-editor');await page.getByRole('button',{name:'Preview',exact:true}).click();await expect(page.getByLabel('Page preview',{exact:true})).toBeVisible();await capture(page,'automatic-page-preview');
 const products=(await pool.query('SELECT id,media_json FROM products WHERE business_id=$1 ORDER BY id',[businessId])).rows;assert.equal(products.length,3);for(const product of products)assert.equal(JSON.parse(product.media_json).length,4);
 await page.goto(base+'/dashboard/business');const field=page.locator('#signup-handle');const status=page.locator('#signup-handle-status');const save=page.getByRole('button',{name:'Save handle',exact:true});await expect(field).toHaveValue(record.handle);
 await field.fill('a/b');await expect(status).toContainText('Use 3–60');await expect(save).toBeDisabled();
 const available=`review-${crypto.randomUUID().slice(0,8)}`;
 await field.fill('DEMO-NILE-SENSOR-STUDIO');await expect(status).toContainText('already taken');await expect(save).toBeDisabled();
 await field.fill(available);await expect(status).toHaveText('Available');await expect(save).toBeEnabled();await capture(page,'handle-available');
 const pattern='**/api/signup/handle?*';let release;const held=new Promise(resolve=>{release=resolve;});
 await page.route(pattern,async route=>{const h=new URL(route.request().url()).searchParams.get('handle');if(h==='delayed-check'){await held;try{await route.fulfill({json:{handle:h,available:true}});}catch{}}else await route.continue();});
 const requested=page.waitForRequest(request=>request.url().includes('handle=delayed-check'));await field.fill('delayed-check');await requested;await field.fill('demo-nile-sensor-studio');await expect(status).toContainText('already taken');release();await expect(save).toBeDisabled();await page.unroute(pattern);
 await page.route(pattern,route=>route.fulfill({status:503,json:{error:'Unavailable'}}));await field.fill(available);await expect(status).toContainText('Could not check');await expect(save).toBeDisabled();await page.unroute(pattern);await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(status).toHaveText('Available');
 await save.click();await expect(page.getByRole('link',{name:'Contact support',exact:true})).toBeVisible();await expect(field).toHaveCount(0);await capture(page,'handle-cooldown');
 assert.equal((await pool.query('SELECT handle FROM businesses WHERE id=$1',[businessId])).rows[0].handle,available);
 const privatePage=await anonymous.newPage();await privatePage.goto(`${base}/@${record.handle}`);await expect(privatePage.getByRole('heading',{name:'404',exact:true})).toBeVisible();
 await page.goto(base+'/dashboard/page-editor');await page.getByRole('button',{name:'Publish',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Publish page',exact:true}).click();await expect(page.getByText('Your page is live',{exact:true})).toBeVisible();
 await privatePage.goto(`${base}/@${record.handle}?product=${products[0].id}&ref=discovery`);await expect(privatePage).toHaveURL(`${base}/@${available}?product=${products[0].id}&ref=discovery`);await expect(privatePage.getByRole('region',{name:'Photos and videos',exact:true})).toBeVisible();await capture(privatePage,'starter-gallery');
 const adminEmail=(await pool.query("SELECT u.email FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1")).rows[0].email;
 const staff=await signIn(adminEmail);const adminPage=await staff.newPage();await adminPage.goto(`${base}/dashboard/settings?business=${businessId}`);await adminPage.locator('#signup-handle').fill(available+'-fixed');await expect(adminPage.locator('#signup-handle-status')).toHaveText('Available');await adminPage.getByLabel('Support reason',{exact:true}).fill('Owner requested a spelling correction');await adminPage.getByRole('button',{name:'Save handle',exact:true}).click();await expect(adminPage).toHaveURL(new RegExp('saved=handle'));await expect.poll(async()=>(await pool.query('SELECT handle FROM businesses WHERE id=$1',[businessId])).rows[0].handle).toBe(available+'-fixed');
 await privatePage.goto(`${base}/@${record.handle}?product=${products[0].id}`);await expect(privatePage).toHaveURL(`${base}/@${available}-fixed?product=${products[0].id}`);
 const response=await context.request.get(base+'/api/signup/handle?handle='+record.handle);assert.equal(response.status(),200);assert.match(response.headers()['cache-control'],/no-store/);assert.deepEqual(await response.json(),{handle:record.handle,available:false});
 assert.equal((await context.request.get(base+'/api/signup/handle?handle=bad/name')).status(),400);let limited=false;for(let n=0;n<61;n++){const r=await context.request.get(base+'/api/signup/handle?handle='+available);if(r.status()===429){assert.equal(r.headers()['retry-after'],'60');limited=true;break;}}assert.ok(limited);
 assert.deepEqual(errors,[]);console.log('PASS automatic signup/editor/starter galleries, owner handle checks/save/cooldown/support, audited admin override, retained product redirects/privacy, rate/failure/stale checks, identical five-language wordmark and 1440/390/320 captures. Local disposable fixtures; no external messages.');
}finally{
 if(!businessId)businessId=(await pool.query('SELECT business_id FROM users WHERE email=$1',[email])).rows[0]?.business_id;
 if(businessId){const db=await pool.connect();try{await db.query('BEGIN');for(const table of ['owner_page_reviews','owner_page_publications','owner_page_events','owner_page_drafts','product_upkeep_commands','published_catalog_versions','audit_logs'])await db.query(`DELETE FROM ${table} WHERE business_id=$1`,[businessId]);await db.query('DELETE FROM businesses WHERE id=$1',[businessId]);await db.query('COMMIT');}catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}}
 await browser.close();if(userId)await admin.auth.admin.deleteUser(userId);await pool.end();
}
