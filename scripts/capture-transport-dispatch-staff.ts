import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {createPostgresPool,postgresRuntimeConfig} from '../lib/postgres-runtime';
import * as support from '../lib/support';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';
import type {SessionUser} from '../lib/types';

async function main(){
 const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102', provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
 const target=new URL(process.env.SUQPAGE_POSTGRES_URL!);
 assert.equal(provider.hostname,'127.0.0.1');assert.ok(['54321','56321'].includes(provider.port));assert.equal(new URL(base).hostname,'127.0.0.1');
 assert.equal(target.hostname,'127.0.0.1');assert.ok(['54322','56322'].includes(target.port));
 process.env.SUQPAGE_TELEGRAM_BOT_TOKEN='';process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID='';
 const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:target.href})!);
 const auth=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const browser=await chromium.launch({channel:'chrome'});let providerId:string|undefined,userId:number|undefined,caseId:number|undefined;
 const dir=process.env.SUQPAGE_TEST_SCREENSHOT_DIR||'.local/live-transport-review';fs.mkdirSync(dir,{recursive:true});
 try{
  const email=`buying-staff-${crypto.randomUUID()}@example.test`;
  const created=await auth.auth.admin.createUser({email,email_confirm:true});assert.ok(!created.error&&created.data.user);providerId=created.data.user.id;
  userId=Number((await pool.query("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES($1,'unused','Transport dispatcher','admin',0) RETURNING id",[email])).rows[0].id);
  await pool.query("INSERT INTO user_access_profiles(user_id,access_role) VALUES($1,'operations_manager')",[userId]);
  await pool.query("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES($1,'supabase',$2,$3,$4)",[userId,providerId,email,Date.now()]);
  const staff:SessionUser={id:userId,email,name:'Transport dispatcher',role:'admin',access_role:'operations_manager',business_id:null,must_change_password:0};
  await support.updateSupportAgentSetting(staff,{userId,enabled:true,maxOpenConversations:1,queueScope:'transport'});
  const visitor=await browser.newPage({viewport:{width:390,height:900}});
  await visitor.goto(`${base}/about`);await visitor.locator('button[data-channel=buying]').click();
  await visitor.getByTestId('transport-provider-toggle').click();await visitor.getByTestId('transport-provider-option').click();
  await visitor.locator('#transport-origin').fill('Addis Ababa');await visitor.locator('#transport-destination').fill('Adama');
  await visitor.locator('#public-buying-message').fill('Please deliver two chairs.');
  await visitor.locator('#public-buying-name').fill('Review visitor');await visitor.locator('#public-buying-phone').fill('+447700900999');
  await visitor.getByRole('button',{name:'Start chat',exact:true}).click();
  await expect(visitor.getByText('Waiting for a live agent at SharedTrucks Logistics',{exact:true})).toBeVisible();
  const token=(await visitor.context().cookies()).find(cookie=>cookie.name==='suqpage_public_transport')?.value;assert.ok(token);
  const publicCase=await support.getPublicSupportConversation(token);
  caseId=Number((await pool.query('SELECT id FROM support_conversations WHERE public_ref=$1',[publicCase.publicRef])).rows[0].id);
  const reviewCaseId=caseId;
  const request={id:reviewCaseId,token};
  await support.reassignSupportConversation(staff,caseId,userId);
  const link=await auth.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error&&link.data.properties.email_otp);
  const cookies:Array<{name:string;value:string;options:CookieOptions}>=[];
  const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll:()=>[],setAll:values=>{cookies.push(...values);}}});
  const verified=await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'});assert.ok(!verified.error);
  const context=await browser.newContext();await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax' as const})));
  const page=await context.newPage();await page.goto(`${base}/dashboard/support/${caseId}`);
  await expect(page.getByRole('button',{name:'Join chat',exact:true})).toBeVisible({timeout:20000});
  await page.getByRole('button',{name:'Join chat',exact:true}).click();
  await expect(page.locator('select[name=audience]')).toBeVisible({timeout:20000});
  assert.equal((await support.getSupportConversation(staff,caseId)).conversation.agentJoined,true);
  await page.locator('select[name=audience]').selectOption('note');await page.locator('#support-reply').fill('Private staff-only review note');await page.locator('.support-reply button').click();
  await expect(page.getByText('Note saved',{exact:true})).toBeVisible();
  assert.ok(!(await support.getPublicSupportConversation(request.token)).messages.some(row=>row.body.includes('staff-only')));
  await page.locator('select[name=audience]').selectOption('reply');await page.locator('#support-reply').fill('We can help. Please send the product link.');await page.locator('.support-reply button').click();
  await expect(page.getByText('Reply sent.',{exact:true})).toBeVisible();
  assert.ok((await support.getPublicSupportConversation(request.token)).messages.some(row=>row.body.includes('product link')));
  await visitor.bringToFront();
  await expect(visitor.getByRole('log')).toContainText('We can help. Please send the product link.',{timeout:15000});
  await expect(visitor.getByRole('log')).not.toContainText('Private staff-only review note');
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.locator('.support-reply button').scrollIntoViewIfNeeded();if(width<600){const send=await page.locator('.support-reply button').boundingBox();const nav=await page.locator('.workspace-mobile-tabs').boundingBox();assert.ok(send&&nav&&send.y+send.height<=nav.y,'Send is reachable above mobile navigation');}assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-${width}.png`});}
  await visitor.getByRole('button',{name:'End chat',exact:true}).click();
  await expect(visitor.getByRole('button',{name:'Send another request',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByText('Chat ended',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Back to inbox'})).toHaveAttribute('href','/dashboard/support?queue=transport&status=active');
  await page.getByRole('link',{name:'Details',exact:true}).click();
  await expect(page.locator('a[href="tel:+447700900999"]')).toBeVisible();
  await expect(page.locator('.support-visitor-contact')).toContainText('Please deliver two chairs.');
  await page.getByRole('link',{name:'Back to conversation',exact:true}).click();
  await expect(page.locator('select[name=audience]')).toHaveCount(0);
  await page.locator('#support-reply').fill('Called customer. No longer interested.');
  await page.locator('.support-reply button').click();
  await expect(page.getByText('Note saved',{exact:true})).toBeVisible();
  assert.equal((await support.getSupportConversation(staff,caseId)).conversation.status,'closed');
  assert.ok(!(await support.getPublicSupportConversation(request.token)).messages.some(row=>row.body.includes('No longer interested')));
  const reference=(await support.getSupportConversation(staff,caseId)).conversation.publicRef;
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    await page.goto(`${base}/dashboard/support/${caseId}`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-ended-${width}.png`});
    await page.goto(`${base}/dashboard/support?queue=transport&status=history&q=${reference}`);
    await expect(page.locator(`.support-row[href^="/dashboard/support/${caseId}?"]`)).toContainText('Please deliver two chairs.');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-history-${width}.png`});
  }
  await page.locator(`.support-row[href^="/dashboard/support/${caseId}?"]`).click();
  await page.getByRole('link',{name:'Details',exact:true}).click();
  await page.getByRole('button',{name:'Mark resolved',exact:true}).click();
  await expect.poll(async()=>(await support.getSupportConversation(staff,reviewCaseId)).conversation.resolvedAt!==null).toBe(true);
  await page.goto(`${base}/dashboard/support?queue=transport&status=resolved&q=${reference}`);
  await expect(page.locator(`.support-row[href^="/dashboard/support/${caseId}?"]`)).toBeVisible();
  await page.screenshot({style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-resolved-390.png`});
  await page.goto(`${base}/dashboard/support?queue=transport&status=history&q=${reference}`);
  await expect(page.locator('.support-row')).toHaveCount(0);
  await page.goto(`${base}/dashboard/support/${caseId}`);
  await page.getByRole('link',{name:'Details',exact:true}).click();
  await page.getByRole('button',{name:'Reopen',exact:true}).click();
  await expect.poll(async()=>(await support.getSupportConversation(staff,reviewCaseId)).conversation.resolvedAt).toBe(null);
  await page.getByRole('link',{name:'Back to conversation',exact:true}).click();
  await page.getByRole('button',{name:'Join chat',exact:true}).click();
  await expect(page.locator('select[name=audience]')).toBeVisible();
  console.log('PASS public browser intake/live reply/privacy/End chat, authenticated staff reply/private follow-up notes, retained contact/intake, history/resolved filters, resolution/reopen actions and desktop/phone controls. Local fixtures removed.');
 }finally{
  if(caseId)await pool.query('DELETE FROM support_conversations WHERE id=$1',[caseId]);
  if(userId){await pool.query('DELETE FROM audit_logs WHERE user_id=$1',[userId]);await pool.query('DELETE FROM users WHERE id=$1',[userId]);}
  if(providerId){const result=await auth.auth.admin.deleteUser(providerId);assert.ok(!result.error);}
  await browser.close();await pool.end();await closePostgresRuntimeForTests();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});
