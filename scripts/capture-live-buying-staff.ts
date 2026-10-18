import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {chromium,expect,type BrowserContext} from '@playwright/test';
import {createRequire} from 'node:module';
import {createClient} from '@supabase/supabase-js';
import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {createPostgresPool,postgresRuntimeConfig} from '../lib/postgres-runtime';
import * as support from '../lib/support';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';
import type {SessionUser} from '../lib/types';

type MapTileFixture={fixtureId:string;servedCount():number;externalCount():number;assertNoExternalRequests():void};
const {installMapTileFixture}=createRequire(path.resolve('package.json'))('./scripts/testing/map-tile-fixture.mjs') as {
 installMapTileFixture(context:BrowserContext):Promise<MapTileFixture>;
};

async function main(){
 const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102', provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
 const target=new URL(process.env.SUQPAGE_POSTGRES_URL!);
 assert.equal(provider.hostname,'127.0.0.1');assert.ok(['54321','56321'].includes(provider.port));assert.equal(new URL(base).hostname,'127.0.0.1');
 assert.equal(target.hostname,'127.0.0.1');assert.ok(['54322','56322'].includes(target.port));
 process.env.SUQPAGE_TELEGRAM_BOT_TOKEN='';process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID='';
 const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:target.href})!);
 const auth=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const browser=await chromium.launch();const tileFixtures:MapTileFixture[]=[];let providerId:string|undefined,userId:number|undefined,caseId:number|undefined;
 const dir=process.env.SUQPAGE_TEST_SCREENSHOT_DIR||'.local/live-buying-review';fs.mkdirSync(dir,{recursive:true});
 try{
  const email=`buying-staff-${crypto.randomUUID()}@example.test`;
  const created=await auth.auth.admin.createUser({email,email_confirm:true});assert.ok(!created.error&&created.data.user);providerId=created.data.user.id;
  userId=Number((await pool.query("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES($1,'unused','Transport review staff','admin',0) RETURNING id",[email])).rows[0].id);
  await pool.query("INSERT INTO user_access_profiles(user_id,access_role) VALUES($1,'operations_manager')",[userId]);
  await pool.query("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES($1,'supabase',$2,$3,$4)",[userId,providerId,email,Date.now()]);
  const staff:SessionUser={id:userId,email,name:'Transport review staff',role:'admin',access_role:'operations_manager',business_id:null,must_change_password:0};
  await support.updateSupportAgentSetting(staff,{userId,enabled:true,maxOpenConversations:1,queueScope:'transport'});
  const visitorContext=await browser.newContext({viewport:{width:390,height:900},serviceWorkers:'block'});
  tileFixtures.push(await installMapTileFixture(visitorContext));
  const visitor=await visitorContext.newPage();
  await visitor.goto(base);await visitor.locator('button[data-channel=buying]').click();
  await visitor.locator('#transport-origin').fill('Addis Ababa');
  await visitor.locator('#transport-destination').fill('Adama');
  await visitor.locator('#public-buying-message').fill('Two cartons to deliver.');
  await visitor.locator('#public-buying-name').fill('Review visitor');await visitor.locator('#public-buying-phone').fill('+447700900999');
  const started=visitor.waitForResponse(response=>response.request().method()==='POST'&&new URL(response.url()).pathname==='/api/public-support');
  await visitor.getByRole('button',{name:'Start chat',exact:true}).click();assert.ok((await started).ok());
  const token=(await visitor.context().cookies()).find(cookie=>cookie.name==='suqpage_public_transport')?.value;assert.ok(token);
  const publicCase=await support.getPublicSupportConversation(token);
  assert.equal(publicCase.agentJoined,false,'Assignment does not claim the agent joined');
  assert.equal(publicCase.assignedUserName,null,'Unjoined assignment identity stays private');
  await expect(visitor.getByText('Waiting for our team',{exact:true})).toBeVisible();
  caseId=Number((await pool.query('SELECT id FROM support_conversations WHERE public_ref=$1',[publicCase.publicRef])).rows[0].id);
  const request={id:caseId,token};
  await support.reassignSupportConversation(staff,caseId,userId);
  const link=await auth.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error&&link.data.properties.email_otp);
  const cookies:Array<{name:string;value:string;options:CookieOptions}>=[];
  const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll:()=>[],setAll:values=>{cookies.push(...values);}}});
  const verified=await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'});assert.ok(!verified.error);
  const context=await browser.newContext({serviceWorkers:'block'});tileFixtures.push(await installMapTileFixture(context));await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax' as const})));
  const page=await context.newPage();await page.goto(`${base}/dashboard/support/${caseId}`);
  const showDetails=async()=>{if((page.viewportSize()?.width??1440)<=720){const details=page.getByRole('link',{name:'Details',exact:true});await expect(details).toBeVisible();await details.click();await expect(page.getByRole('link',{name:'Back to conversation',exact:true})).toBeVisible();}};
  const showConversation=async()=>{const back=page.getByRole('link',{name:'Back to conversation',exact:true});if(await back.isVisible()){await back.click();await expect(page.locator('.support-thread')).toBeVisible();}};
  const joinChat=async()=>{
   const assigned=(await support.getSupportConversation(staff,request.id)).conversation;
   assert.equal(assigned.assignedUserId,userId,'Only the current assignee performs Join');
   assert.equal(assigned.agentJoined,false,'Opening or reading never joins the assignee');
   await expect(page.getByRole('button',{name:'Join chat',exact:true})).toBeVisible({timeout:20000});
   await expect(page.locator('select[name=audience]')).toHaveCount(0);
   await page.getByRole('button',{name:'Join chat',exact:true}).click();
   await expect(page.locator('select[name=audience]')).toBeVisible({timeout:20000});
   const joined=(await support.getSupportConversation(staff,request.id)).conversation;
   assert.equal(joined.assignedUserId,userId);assert.equal(joined.agentJoined,true,'The real Join action saves acceptance for the current assignee');
  };
  await expect(page.getByRole('button',{name:'Join chat',exact:true})).toBeVisible({timeout:20000});
  await expect(page.locator('select[name=audience]')).toHaveCount(0);
  await expect(page.locator('.support-reply input[name=audience]')).toHaveValue('note');
  await page.getByLabel('Internal note',{exact:true}).fill('Private staff-only review note');await page.locator('.support-reply button').click();
  await expect(page.getByText('Note saved',{exact:true})).toBeVisible();
  assert.ok(!(await support.getPublicSupportConversation(request.token)).messages.some(row=>row.body.includes('staff-only')));
  await joinChat();
  await page.locator('select[name=audience]').selectOption('reply');await page.locator('#support-reply').fill('We can help. Please send the pickup details.');await page.locator('.support-reply button').click();
  await expect(page.getByText('Reply sent.',{exact:true})).toBeVisible();
  assert.equal((await support.getSupportConversation(staff,request.id)).messages.find(row=>row.body==='We can help. Please send the pickup details.')?.visitorVisible,true,'The saved reply has public audience');
  assert.ok((await support.getPublicSupportConversation(request.token)).messages.some(row=>row.body.includes('pickup details')));
  await visitor.bringToFront();
  await expect(visitor.getByRole('log')).toContainText('We can help. Please send the pickup details.',{timeout:15000});
  await expect(visitor.getByRole('log')).not.toContainText('Private staff-only review note');
  const measureComposer=()=>page.evaluate(()=>{
   const button=document.querySelector<HTMLButtonElement>('.support-reply button');
   const navigation=document.querySelector<HTMLElement>('.workspace-mobile-tabs');
   const send=button?.getBoundingClientRect(),nav=navigation?.getBoundingClientRect();
   const hit=send?document.elementFromPoint(send.x+send.width/2,send.y+send.height/2):null;
   return {
    send:send?{x:send.x,y:send.y,width:send.width,height:send.height,bottom:send.bottom}:null,
    nav:nav?{x:nav.x,y:nav.y,width:nav.width,height:nav.height,bottom:nav.bottom}:null,
    centerHit:!!button&&!!hit&&(hit===button||button.contains(hit)),
    hit:hit?{tag:hit.tagName,id:hit.id,className:hit.getAttribute('class')}:null,
    scrollY,scrollHeight:document.documentElement.scrollHeight,viewportHeight:innerHeight,
    visibilityState:document.visibilityState,
   };
  });
  const waitForStableComposer=async()=>{
   let previous='',stableFrames=0;
   await expect.poll(async()=>{
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
    const geometry=await measureComposer();
    const current=JSON.stringify([geometry.send,geometry.nav,geometry.scrollY]);
    stableFrames=current===previous?stableFrames+1:1;previous=current;
    return stableFrames>=3;
   },{timeout:5000,intervals:[50],message:'Staff composer geometry settles across three animation frames'}).toBe(true);
  };
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   if(width<600)await page.bringToFront();
   await page.locator('.support-reply button').scrollIntoViewIfNeeded();
   if(width<600){
    await waitForStableComposer();
    const beforeScroll=await measureComposer();
    // scrollIntoView does not account for the fixed phone navigation overlay.
    const pageDown=!!beforeScroll.send&&!!beforeScroll.nav&&beforeScroll.send.bottom>beforeScroll.nav.y;
    if(pageDown){await page.keyboard.press('PageDown');await waitForStableComposer();}
    const final=await measureComposer();
    fs.writeFileSync(`${dir}/staff-${width}-geometry.json`,JSON.stringify({width,beforeScroll,pageDown,final},null,2),{mode:0o600});
    await page.screenshot({caret:'initial',style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-${width}.png`});
    const {send,nav}=final;
    assert.ok(send&&nav&&send.y+send.height<=nav.y,'Send is reachable above mobile navigation');
    assert.equal(final.centerHit,true,'The Send button center receives pointer input');
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width>=600)await page.screenshot({caret:'initial',style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-${width}.png`});
  }
  await visitor.getByRole('button',{name:'End chat',exact:true}).click();
  await expect(visitor.getByRole('button',{name:'Send another request',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByText('Chat ended',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Back to inbox',exact:true})).toHaveAttribute('href','/dashboard/support?queue=transport&status=active');
  await showDetails();
  await expect(page.locator('a[href="tel:+447700900999"]')).toBeVisible();
  await expect(page.locator('.support-visitor-contact')).toContainText('Two cartons to deliver.');
  await showConversation();
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
    await expect(page.locator(`.support-row[href^="/dashboard/support/${caseId}?"]`)).toContainText('Two cartons to deliver.');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-history-${width}.png`});
  }
  await page.locator(`.support-row[href^="/dashboard/support/${caseId}?"]`).click();
  await showDetails();
  await page.getByRole('button',{name:'Mark resolved',exact:true}).click();
  await expect(page.locator('[data-assignment-state]')).toHaveText('Resolved');
  assert.ok((await support.getSupportConversation(staff,caseId)).conversation.resolvedAt,'Resolution is saved separately from participant ending');
  await page.goto(`${base}/dashboard/support?queue=transport&status=resolved&q=${reference}`);
  await expect(page.locator(`.support-row[href^="/dashboard/support/${caseId}?"]`)).toBeVisible();
  await page.screenshot({style:"nextjs-portal {visibility:hidden}",path:`${dir}/staff-resolved-390.png`});
  await page.goto(`${base}/dashboard/support?queue=transport&status=history&q=${reference}`);
  await expect(page.locator('.support-row')).toHaveCount(0);
  await page.goto(`${base}/dashboard/support/${caseId}`);
  await showDetails();
  await page.getByRole('button',{name:'Reopen',exact:true}).click();
  await expect.poll(async()=>(await support.getSupportConversation(staff,request.id)).conversation.resolvedAt).toBe(null);
  assert.equal((await support.getSupportConversation(staff,request.id)).conversation.agentJoined,false,'Reopening does not bypass explicit acceptance');
  await support.reassignSupportConversation(staff,caseId,userId);
  await page.goto(`${base}/dashboard/support/${caseId}`);await joinChat();
  console.log('PASS public browser intake/live reply/privacy/End chat, authenticated staff reply/private follow-up notes, retained contact/intake, history/resolved filters, resolution/reopen actions and desktop/phone controls. Local fixtures removed.');
 }finally{
  if(caseId)await pool.query('DELETE FROM support_conversations WHERE id=$1',[caseId]);
  if(userId){await pool.query('DELETE FROM audit_logs WHERE user_id=$1',[userId]);await pool.query('DELETE FROM users WHERE id=$1',[userId]);}
  if(providerId){const result=await auth.auth.admin.deleteUser(providerId);assert.ok(!result.error);}
  await browser.close();await pool.end();await closePostgresRuntimeForTests();
  fs.writeFileSync(`${dir}/synthetic-map-tiles.json`,JSON.stringify({fixtures:tileFixtures.map(tiles=>({fixtureId:tiles.fixtureId,fulfilled:tiles.servedCount(),uncontrolledRequests:tiles.externalCount()})),providerAvailabilityTested:false},null,2)+'\n',{mode:0o600});
  for(const tiles of tileFixtures)tiles.assertNoExternalRequests();
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});
