import {findPlaceSuggestions} from '../lib/place-catalog.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { createPostgresPool, postgresRuntimeConfig, PostgresTransactionRunner } from '../lib/postgres-runtime.ts';
import { createPostgresPublicClientWorkspace } from '../lib/signup-postgres.ts';

const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
const provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const database=new URL(process.env.SUQPAGE_POSTGRES_URL);
for(const url of [new URL(base),provider,database]) assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Local audit only');
const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:database.href}));
const auth=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const browser=await chromium.launch();
const out='.local/workflow-wiring-audit';fs.mkdirSync(out,{recursive:true});
const email=`wiring-${randomUUID()}@example.test`;let providerId,businessId;
const contexts=[];const extraBusinesses=[];const extraUsers=[];const extraProviders=[];
async function session(email){
  const link=await auth.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error&&link.data.properties?.email_otp);
  const cookies=[];
  const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:values=>cookies.push(...values)}});
  const verified=await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'});assert.ok(!verified.error);
  const context=await browser.newContext();contexts.push(context);
  await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));
  return context;
}
async function capture(page,name){
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: no overflow at ${width}`);
    await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true,style:'nextjs-portal {visibility:hidden}'});
  }
}
try {
  const created=await auth.auth.admin.createUser({email,email_confirm:true});assert.ok(!created.error);providerId=created.data.user.id;
  const workspace=await createPostgresPublicClientWorkspace(new PostgresTransactionRunner(pool),{name:'Wiring audit owner',businessName:'Wiring audit shop',businessCategory:'electronics', placeId:findPlaceSuggestions("Addis Ababa")[0].id,phone:'+447700900999',consent:true,idempotencyKey:randomUUID()},{providerUserId:providerId,email});
  businessId=(await pool.query('SELECT business_id FROM users WHERE id=$1',[workspace.userId])).rows[0].business_id;
  const owner=await (await session(email)).newPage();
  const adminEmail=(await pool.query("SELECT u.email FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1")).rows[0].email;
  const admin=await (await session(adminEmail)).newPage();
  const contacts=async()=> (await pool.query('SELECT whatsapp,telegram,tiktok,public_email,public_phone FROM businesses WHERE id=$1',[businessId])).rows[0];
  const before=await contacts();
  await pool.query('UPDATE users SET must_change_password=1 WHERE id=$1',[workspace.userId]);
  await admin.goto(`${base}/dashboard/settings?business=${businessId}`);
  await expect(admin.getByRole('heading',{name:'Owner sign-in',exact:true})).toBeVisible();
  await expect(admin.locator('input[type=password],input[name=whatsapp],input[name=telegram],input[name=tiktok]')).toHaveCount(0);
  await expect(admin.getByText('password change required',{exact:true})).toHaveCount(0);
  await expect(admin.getByRole('link',{name:'Edit page contacts',exact:true})).toHaveCount(0);
  await expect(admin.getByText(/The owner manages public contacts/)).toBeVisible();
  await admin.getByLabel('Notification email',{exact:true}).fill('notifications@example.test');
  await admin.getByRole('button',{name:'Save business details',exact:true}).click();
  await expect(admin.getByText('Business details saved.',{exact:true})).toBeVisible();
  assert.deepEqual(await contacts(),before,'Operational Save preserves public contacts');
  assert.equal((await pool.query('SELECT contact_email FROM businesses WHERE id=$1',[businessId])).rows[0].contact_email,'notifications@example.test');
  await capture(admin,'admin-settings');
  await owner.goto(`${base}/dashboard/page-editor`);
  const assistance=owner.getByRole('checkbox');await expect(assistance).toHaveCount(1);await assistance.click();
  await expect.poll(async()=>(await pool.query('SELECT assistance_enabled FROM owner_page_drafts WHERE business_id=$1',[businessId])).rows[0].assistance_enabled).toBe(1);
  await admin.goto(`${base}/dashboard/settings?business=${businessId}`);
  await admin.getByRole('link',{name:'Edit page contacts',exact:true}).click();
  await admin.locator('summary').filter({hasText:'Public contact details'}).click();
  await expect(admin.getByLabel('WhatsApp number',{exact:true})).toBeVisible();
  const publicSocial=await admin.getByLabel('WhatsApp number',{exact:true}).inputValue();assert.ok(publicSocial);
  await owner.goto(`${base}/dashboard/account`);await expect(owner.locator('input[type=password]')).toHaveCount(0);await capture(owner,'owner-account');
  const inquiry=(await pool.query("INSERT INTO inquiries(business_id,customer_name,contact,contact_method,status,idempotency_key) VALUES($1,'Wiring audit buyer','buyer@example.test','email','new',$2) RETURNING id",[businessId,randomUUID()])).rows[0];
  await admin.goto(`${base}/dashboard/inquiries?business=${businessId}`);
  await admin.getByRole('combobox',{name:'Inquiry status',exact:true}).selectOption('contacted');
  await admin.getByRole('button',{name:'Update',exact:true}).click();
  await expect(admin.getByText('Inquiry status updated.',{exact:true})).toBeVisible();
  assert.equal((await pool.query('SELECT status FROM inquiries WHERE id=$1',[inquiry.id])).rows[0].status,'contacted');
  await owner.goto(`${base}/dashboard/inquiries`);await expect(owner.getByRole('heading',{name:'Wiring audit buyer',exact:true})).toBeVisible();await expect(owner.getByRole('button',{name:'Update',exact:true})).toHaveCount(0);
  // Submit the stale form after its record is deleted: no success state or event.
  await pool.query('DELETE FROM inquiries WHERE id=$1',[inquiry.id]);
  await admin.getByRole('button',{name:'Update',exact:true}).click();
  await expect(admin.locator('main').getByRole('alert')).toHaveText('The inquiry could not be updated. Refresh and try again.');
  await expect(admin.getByText('Inquiry status updated.',{exact:true})).toHaveCount(0);await capture(admin,'stale-inquiry');
  await pool.query("UPDATE businesses SET status='active' WHERE id=$1",[businessId]);
  await admin.goto(`${base}/dashboard?business=${businessId}`);await expect(admin.getByText('The owner publishes page changes.',{exact:true})).toBeVisible();await capture(admin,'staff-dashboard');
  await owner.goto(`${base}/dashboard`);await expect(owner.getByText('Save updates your live page',{exact:true})).toBeVisible();
  await pool.query("UPDATE businesses SET status='suspended' WHERE id=$1",[businessId]);
  await owner.reload();await expect(owner.getByText('Contact support to restore access.',{exact:true})).toBeVisible();await expect(owner.getByText('Save updates your live page',{exact:true})).toHaveCount(0);await capture(owner,'suspended-dashboard');
  for(const path of ['/dashboard/admin','/dashboard/admin/businesses','/dashboard/admin/discovery','/dashboard/admin/staff','/dashboard/admin/featured-schedule','/dashboard/admin/sponsors','/dashboard/support','/dashboard/support/agents','/dashboard/account-health']){
    const response=await admin.goto(base+path);assert.equal(response.status(),200,path);await expect(admin.locator('main')).toBeVisible();await expect(admin.getByRole('heading',{name:'404',exact:true})).toHaveCount(0);
  }
  const staffEmail=`wiring-staff-${randomUUID()}@example.test`;
  await admin.goto(`${base}/dashboard/admin/staff`);
  await admin.getByText('Create staff account',{exact:true}).first().click();
  await expect(admin.locator('input[type=password]')).toHaveCount(0);
  await expect(admin.getByRole('columnheader',{name:'Pending pages',exact:true})).toHaveCount(0);
  await admin.getByLabel('Name',{exact:true}).fill('Wiring email staff');
  await admin.getByLabel('Email',{exact:true}).fill(staffEmail);
  await admin.getByRole('button',{name:'Create staff account',exact:true}).click();
  await expect(admin.getByText('Staff account created.',{exact:true})).toBeVisible();
  const staffRecord=(await pool.query('SELECT u.id,u.must_change_password,l.provider_user_id FROM users u JOIN auth_identity_links l ON l.user_id=u.id WHERE u.email=$1',[staffEmail])).rows[0];
  assert.ok(staffRecord);extraUsers.push(staffRecord.id);extraProviders.push(staffRecord.provider_user_id);assert.equal(staffRecord.must_change_password,0);
  await capture(admin,'email-staff');
  const staffPage=await (await session(staffEmail)).newPage();await staffPage.goto(`${base}/dashboard`);await expect(staffPage.getByRole('heading',{name:'Assigned businesses',exact:true})).toBeVisible();
  const {createClientInvitation}=await import('../lib/invitations.ts');
  const inviteEmail=`wiring-invite-${randomUUID()}@example.test`;
  const adminId=(await pool.query('SELECT id FROM users WHERE email=$1',[adminEmail])).rows[0].id;
  const invitation=await createClientInvitation({requestId:null,clientName:'Invited audit owner',email:inviteEmail,businessName:'Invited audit shop',handle:`audit-${randomUUID().slice(0,8)}`,designKey:'novatech',actorUserId:adminId});
  extraBusinesses.push(invitation.businessId);
  const visitor=await browser.newContext();const invitePage=await visitor.newPage();
  await invitePage.goto(`${base}/invite/${invitation.token}`);await expect(invitePage.locator('input[type=password]')).toHaveCount(0);await capture(invitePage,'email-invitation');
  await invitePage.getByLabel('Your name',{exact:true}).fill('Invited audit owner');
  await invitePage.getByRole('button',{name:'Accept invitation and sign in',exact:true}).click();await expect(invitePage).toHaveURL(`${base}/login`);
  const invitedRecord=(await pool.query('SELECT u.id,u.business_id,l.provider_user_id FROM users u JOIN auth_identity_links l ON l.user_id=u.id WHERE u.email=$1',[inviteEmail])).rows[0];
  assert.ok(invitedRecord);extraProviders.push(invitedRecord.provider_user_id);assert.equal(invitedRecord.business_id,invitation.businessId);
  await invitePage.goto(`${base}/dashboard`);await expect(invitePage).toHaveURL(/\/login$/);
  const invitedPage=await (await session(inviteEmail)).newPage();await invitedPage.goto(`${base}/dashboard`);await expect(invitedPage.getByRole('heading',{name:'Invited audit shop',exact:true})).toBeVisible();
  console.log('PASS actual admin settings save/contact preservation, consented editor access, email-only owner/admin controls, inquiry status persistence/stale failure, owner inbox, accurate status guidance, nine admin routes, real email-only staff creation/invitation redemption and desktop/390/320 captures. No emails sent.');
} finally {
  await browser.close();
  for(const fixtureId of [...(businessId?[businessId]:[]),...extraBusinesses]){
    const client=await pool.connect();try{await client.query('BEGIN');for(const table of ['owner_page_reviews','owner_page_publications','owner_page_events','owner_page_drafts','product_upkeep_commands','published_catalog_versions','audit_logs'])await client.query(`DELETE FROM ${table} WHERE business_id=$1`,[fixtureId]);await client.query('DELETE FROM businesses WHERE id=$1',[fixtureId]);await client.query('COMMIT');}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  }
  for(const id of extraUsers){await pool.query('DELETE FROM audit_logs WHERE user_id=$1',[id]);await pool.query('DELETE FROM users WHERE id=$1',[id]);}
  for(const id of [...(providerId?[providerId]:[]),...extraProviders]){const deleted=await auth.auth.admin.deleteUser(id);assert.ok(!deleted.error);}
  const {closePostgresRuntimeForTests}=await import('../lib/postgres-runtime-services.ts');await closePostgresRuntimeForTests();
  await pool.end();
}
