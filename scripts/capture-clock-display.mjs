import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect as baseExpect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { createPostgresPool, postgresRuntimeConfig } from '../lib/postgres-runtime.ts';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
const target=new URL(process.env.SUQPAGE_POSTGRES_URL);
const provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
for(const url of [new URL(base),target,provider]) assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Local-only clock review');
assert.ok(['54322','56322'].includes(target.port));
const out='.local/demo-review/clock';fs.mkdirSync(out,{recursive:true,mode:0o700});
const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:target.href}));
const auth=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const browser=await chromium.launch();const errors=[];
const expect=baseExpect.configure({timeout:15000});
function watch(page){page.on('pageerror',error=>errors.push(error.message));}
async function snapshot(page,name,width){await page.setViewportSize({width,height:width===1440?1000:844});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${name} ${width}`);await page.screenshot({path:`${out}/${name}-${width}.png`,style:'nextjs-portal {visibility:hidden}'});}
async function contextFor(email){const context=await browser.newContext();const link=await auth.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error&&link.data.properties?.email_otp,'Local test-issued session');const cookies=[];const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:values=>cookies.push(...values)}});const verified=await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'});assert.ok(!verified.error);await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));return context;}
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();watch(page);
 await page.goto(base+'/featured');await expect(page.locator('.public-app-purpose')).toHaveCount(0);
 const status=page.locator('.featured-program');await expect(status).toBeVisible();
 await expect(status).not.toContainText('TikTok Live');await expect(status).not.toContainText('Livestream ended');
 await expect(page.locator('.featured-agenda summary')).toContainText(/\d{1,2}:\d{2} [AP]M/);
 await page.locator('.featured-agenda summary').click();
 for(const width of [1440,390,320])await snapshot(page,'featured-clock',width);
 const admin=(await pool.query("SELECT u.email FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1")).rows[0];
 const adminContext=await contextFor(admin.email);const adminPage=await adminContext.newPage();watch(adminPage);
 await adminPage.goto(base+'/dashboard/admin/featured-schedule');
 const details=adminPage.locator('details').filter({hasText:'Program times and breaks'});await details.locator('summary').click();
 const clock=adminPage.getByRole('group',{name:'Morning starts',exact:true});
 for(const width of [1440,390,320])await snapshot(adminPage,'admin-clock',width);
 await clock.getByLabel('Morning starts: Hour',{exact:true}).selectOption('12');await clock.getByLabel('Morning starts: Minute',{exact:true}).selectOption('00');await clock.getByLabel('Morning starts: AM/PM',{exact:true}).selectOption('AM');
 await expect(clock.locator('input[name=morningStart]')).toHaveValue('00:00');
 await clock.getByLabel('Morning starts: AM/PM',{exact:true}).selectOption('PM');await expect(clock.locator('input[name=morningStart]')).toHaveValue('12:00');
 await clock.getByLabel('Morning starts: Hour',{exact:true}).selectOption('5');await expect(clock.locator('input[name=morningStart]')).toHaveValue('17:00');
 assert.deepEqual(errors,[]);console.log('PASS no redundant header, AM/PM public/admin clocks at desktop/390/320, no unconfigured broadcast claims, correct unsaved admin machine values.');
}finally{await browser.close();await pool.end();}
