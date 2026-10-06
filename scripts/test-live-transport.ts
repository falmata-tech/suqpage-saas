import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { GET, POST } from '../app/api/public-support/route';
import { handleMobileRequest } from '../lib/mobile/router';
import * as support from '../lib/support';
import type { SessionUser } from '../lib/types';
async function main() {
 const db=await getDb();process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3102';
 delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 try {
  async function user(name:string,role:SessionUser['access_role']):Promise<SessionUser> {
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES(?,'unused',?,'admin',0)").run(`${name}@example.test`,name)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   return {id,email:`${name}@example.test`,name,role:'admin',access_role:role,business_id:null,must_change_password:0};
  }
  const admin=await user('manager','operations_manager'),dispatcher=await user('dispatch','team_member'),ownerHelp=await user('help','team_member');
  await support.updateSupportAgentSetting(admin,{userId:dispatcher.id,enabled:true,maxOpenConversations:1,queueScope:'transport'});
  await support.updateSupportAgentSetting(admin,{userId:ownerHelp.id,enabled:true,maxOpenConversations:5,queueScope:'support'});
  const prepared=await GET(new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport'));
  const token=prepared.cookies.get('suqpage_public_transport')!.value;
  async function request(body?:Record<string,unknown>,channel='transport',ownToken=token) {
   const req=new NextRequest('http://127.0.0.1:3102/api/public-support?channel='+channel,{method:body?'POST':'GET',headers:{origin:'http://127.0.0.1:3102','content-type':'application/json',cookie:`suqpage_public_${channel}=${ownToken}`},...(body?{body:JSON.stringify(body)}:{})});
   const response=await(body?POST(req):GET(req));assert.match(response.headers.get('cache-control')||'',/no-store/);return {status:response.status,data:await response.json()};
  }
  const draft={action:'start',category:'shipment_observation',origin:'Addis Ababa',destination:'Adama',name:'Delivery customer',phone:'+251911223344',message:'Two chairs',idempotencyKey:crypto.randomUUID()};
  assert.equal((await request({...draft,message:"x".repeat(4000)})).status,400,"Bound composed route plus goods before the database constraint");
  const first=await request(draft);assert.equal(first.status,201,JSON.stringify(first.data));
  const id=first.data.conversation.id,publicRef=first.data.conversation.publicRef;
  assert.equal((await request(draft)).data.conversation.id,id);
  assert.equal((await request({...draft,destination:'Jimma'})).status,400);
  assert.equal((await support.getSupportConversation(admin,id)).conversation.assignedUserId,dispatcher.id);
  await assert.rejects(()=>support.getSupportConversation(ownerHelp,id));
  await support.saveTransportHandoff(dispatcher,id,{company:'Private Carrier',contact:'private carrier contact',previousId:0});
  await support.postSupportMessage(dispatcher,id,{audience:'note',message:'Private commission agreement',idempotencyKey:crypto.randomUUID()});
  await support.postSupportMessage(dispatcher,id,{audience:'reply',message:'When should we collect?',idempotencyKey:crypto.randomUUID()});
  const publicView=await request();assert.equal(publicView.data.conversation.messages.length,2);assert.ok(!JSON.stringify(publicView).includes('Private'));
  const followup={action:'message',publicRef,message:'Tomorrow morning',idempotencyKey:crypto.randomUUID()};
  assert.equal((await request(followup)).status,200);assert.equal((await request(followup)).data.conversation.messages.length,3);
  assert.equal((await request({...followup,publicRef:'wrong'})).status,400);
  assert.equal((await request(followup,'buying')).status,404);
  assert.equal((await request(followup,'transport',crypto.randomBytes(32).toString('base64url'))).status,404);
  assert.equal((await request({...followup,attachment:'file'})).status,400);
  assert.equal((await request({action:'close',publicRef})).status,200);
  assert.equal((await support.listSupportConversations(dispatcher,{queue:'transport',status:'history'})).totalItems,1);
  await support.postSupportMessage(dispatcher,id,{audience:'note',message:'Phone follow-up completed',idempotencyKey:crypto.randomUUID()});
  await support.closeSupportConversation(dispatcher,id);
  assert.equal((await support.listSupportConversations(dispatcher,{queue:'transport',status:'resolved'})).totalItems,1);
  await assert.rejects(()=>db.prepare("UPDATE support_conversations SET status='open' WHERE id=?").run(id));
  await support.reopenSupportConversation(dispatcher,id);assert.equal((await request()).data.conversation.status,'open');
  const native=await handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/transport',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...draft,category:undefined,idempotencyKey:crypto.randomUUID()})}),['transport']);
  assert.equal(native.status,200);const n=await native.json();assert.equal(n.conversation.category,'shipment_observation');assert.equal(n.conversation.status,'waiting','dispatcher capacity enforced');
  const nget=await handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/transport',{headers:{'X-Suqpage-Buying-Session':n.token}}),['transport']);assert.equal(nget.status,200);
  const wrong=await handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/buying',{headers:{'X-Suqpage-Buying-Session':n.token}}),['buying']);assert.equal(wrong.status,404);
  console.log('PASS live transport web/native APIs, retry, route persistence, scoped dispatcher assignment/capacity, private carrier/commission notes, replies, token isolation, ending, history/resolution and reopening.');
 } finally {await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
