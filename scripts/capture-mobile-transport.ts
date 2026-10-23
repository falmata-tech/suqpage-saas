import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium,expect} from '@playwright/test';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {handleMobileRequest} from '../lib/mobile/router';
import * as support from '../lib/support';
import type {SessionUser} from '../lib/types';
async function main(){
 const db=await getDb();delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('mobile-dispatch@example.test','unused','Dispatcher','admin',0)").run()).insertedId;
 await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'operations_manager')").run(id);
 const staff:SessionUser={id,email:'mobile-dispatch@example.test',name:'Dispatcher',role:'admin',access_role:'operations_manager',business_id:null,must_change_password:0};
 const dir='.local/live-transport-review';fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch();
 try{for(const width of [390,320]){
  const p=await browser.newPage({viewport:{width,height:844}});let failure:unknown;
  await p.route('**/api/mobile/v1/transport',async r=>{try{const req=r.request();const headers=await req.allHeaders();delete headers.origin;const response=await handleMobileRequest(new Request(req.url(),{method:req.method(),headers,...(req.postData()?{body:req.postData()!}:{})}),['transport']);await r.fulfill({status:response.status,headers:{...Object.fromEntries(response.headers),'access-control-allow-origin':'*'},body:await response.text()});}catch(e){failure=e;await r.fulfill({status:500,json:{error:'Fixture failure'}});}});
  await p.goto('http://localhost:8082/buying',{waitUntil:'domcontentloaded'});
  const field=(name:string)=>p.getByRole('textbox',{name,exact:true});const button=(name:string)=>p.getByRole('button',{name,exact:true});
  await field('From').fill('Addis Ababa');await field('To').fill('Adama');await field('Name').fill('Mobile visitor');await field('Phone').fill('+447700900999');await field('Goods or transport details (optional)').fill('Two chairs');
  await button('Start chat').scrollIntoViewIfNeeded();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:`${dir}/mobile-intake-${width}.png`});
  await button('Start chat').click();await expect(p.getByText('Waiting for a SharedTrucks live agent',{exact:true})).toBeVisible();
  const row=await db.prepare('SELECT max(id) id FROM support_conversations').get();await support.postSupportMessage(staff,row.id,{audience:'reply',message:'We can arrange collection.',idempotencyKey:crypto.randomUUID()});
  await expect(p.getByText('We can arrange collection.',{exact:true})).toBeVisible({timeout:15000});
  await field('Message').fill('Tomorrow please');await button('Send reply').click();await expect(p.getByText('Tomorrow please',{exact:true})).toBeVisible();await p.screenshot({path:`${dir}/mobile-chat-${width}.png`});
  await button('End chat').click();await expect(button('Start another chat')).toBeVisible();assert.equal((await support.getSupportConversation(staff,row.id)).conversation.status,'closed');assert.equal(failure,undefined);await p.close();
 }console.log('PASS mobile transport intake, real API persistence, live staff replies, visitor reply/end and 390/320 layout. Isolated PostgreSQL; browser only.');}
 finally{await browser.close();await closeDbForTests();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
