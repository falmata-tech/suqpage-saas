import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import * as support from '../lib/support';
import {GET,POST,DELETE} from '../app/api/public-support/route';
import {GET as attentionGET,POST as attentionPOST} from '../app/api/attention/route';
import {handleMobileRequest} from '../lib/mobile/router';
import {visitorAttentionFeed,subscribeVisitorAttention,enqueueChatAttention} from '../lib/attention-postgres';
import {dispatchAttention} from '../lib/attention-delivery';
import type {SessionUser} from '../lib/types';

const key=()=>crypto.randomUUID(),base='http://127.0.0.1:3102';
async function main(){
 const db=await getDb();process.env.NEXT_PUBLIC_APP_URL=base;
 delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 try{
  const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('retired-transport-admin@example.test','unused','Transport history admin','admin',0)").run()).insertedId;
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(id);
  const admin:SessionUser={id,email:'retired-transport-admin@example.test',name:'Transport history admin',role:'admin',access_role:'platform_admin',business_id:null,must_change_password:0};
  // Construct a historical visitor transport case only inside the isolated SQL fixture.
  const old=await support.createPublicSupportConversation({category:'buying_assistance',name:'Historical visitor',email:'history@example.test',phone:'+251911223344',message:'Retained historical initial message',idempotencyKey:key()},'history-fixture');
  await db.prepare("UPDATE support_conversations SET assistance_category='shipment_observation',requester_label='Historical visitor',transport_origin='Town A',transport_destination='Town B' WHERE id=?").run(old.id);
  const snapshot=async()=>JSON.stringify({case:await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(old.id),messages:await db.prepare('SELECT * FROM support_messages WHERE conversation_id=? ORDER BY id').all(old.id),events:await db.prepare('SELECT * FROM support_events WHERE conversation_id=? ORDER BY id').all(old.id),counts:await db.prepare('SELECT (SELECT COUNT(*) FROM support_conversations) cases,(SELECT COUNT(*) FROM support_messages) messages,(SELECT COUNT(*) FROM attention_notifications) alerts,(SELECT COUNT(*) FROM attention_subscriptions) subscriptions').get()});
  const before=await snapshot();
  const retired=(error:unknown)=>error instanceof support.SupportError&&error.code==='public_chat_retired';
  await assert.rejects(()=>support.createPublicSupportConversation({category:'shipment_observation',name:'Visitor',phone:'+251911223344',origin:'A',destination:'B',idempotencyKey:key()},'denied'),retired);
  for(const action of [
   ()=>support.getPublicSupportConversation(old.token),
   ()=>support.postPublicSupportMessage(old.token,{message:'Bypass',idempotencyKey:key()},'denied'),
   ()=>support.closePublicSupportConversation(old.token),
   ()=>support.resumePublicSupportConversation(old.token,old.publicRef),
   ()=>support.acknowledgePublicRead(old.token,{messageId:1,publicRef:old.publicRef}),
   ()=>support.getPublicSupportAttachment(old.token,1),
   ()=>support.submitPublicTransportCallback(old.token,{phone:'+251911223344',email:'bypass@example.test',idempotencyKey:key()},'denied'),
  ])await assert.rejects(action,retired);
  for(const method of ['GET','POST','DELETE'])for(const token of ['',old.token]){
   const request=new NextRequest(base+'/api/public-support?channel=transport',{method,headers:{cookie:'suqpage_public_transport='+token},...(method==='POST'?{body:'invalid JSON'}:{})});
   const response=await(method==='GET'?GET(request):method==='POST'?POST(request):DELETE(request));
   assert.equal(response.status,410);assert.equal((await response.json()).code,'public_chat_retired');assert.equal(response.headers.get('set-cookie'),null);assert.match(response.headers.get('cache-control')||'',/no-store/);
  }
  for(const handler of [attentionGET,attentionPOST]){
   const response=await handler(new NextRequest(base+'/api/attention?channel=transport',{method:handler===attentionGET?'GET':'POST'}));
   assert.equal(response.status,410);assert.equal((await response.json()).code,'public_chat_retired');
  }
  // A buying alias cannot recover a retained transport token either.
  const alias=await GET(new NextRequest(base+'/api/public-support?channel=buying',{headers:{cookie:'suqpage_public_buying='+old.token}}));assert.equal(alias.status,410);
  const noIdentity={verify:async()=>{throw Error('Public retirement must precede identity lookup');},linked:async()=>null,user:async()=>null};
  for(const path of ['transport','transport/attention'])for(const method of ['GET','POST','DELETE']){
   const response=await handleMobileRequest(new Request(base+'/api/mobile/'+path,{method,headers:{'X-Suqpage-Buying-Session':old.token},...(method==='POST'?{body:'invalid JSON'}:{})}),path.split('/'),{identity:noIdentity});
   assert.equal(response.status,410,path+' '+method);assert.equal((await response.json()).code,'public_chat_retired');
  }
  await assert.rejects(()=>visitorAttentionFeed(old.token));
  await assert.rejects(()=>subscribeVisitorAttention(old.token,{kind:'expo',token:'ExponentPushToken[abcdefghijklmnopqrstuv]',deviceId:'legacy-fixture'}));
  await enqueueChatAttention({conversationId:old.id,source:'retired-participant-notification',kind:'message',direction:'participant',now:Date.now()});
  assert.equal(await snapshot(),before,'Retired access changes no case, message, event, alert or subscription');
  assert.equal((await support.getSupportConversation(admin,old.id)).messages[0].body,'Retained historical initial message','Authorized staff retain historical records');
  // Retained queued deliveries must not reach the former visitor after retirement.
  const subscription=(await db.prepare("INSERT INTO attention_subscriptions(recipient_key,kind,endpoint_hash,subscription_json,created_at) VALUES(?,'expo','historical-device',?,0)").run('visitor:'+old.id,JSON.stringify({token:'ExponentPushToken[abcdefghijklmnopqrstuv]'}))).insertedId;
  const notification=(await db.prepare("INSERT INTO attention_notifications(source_key,recipient_key,visitor_conversation_id,conversation_id,kind,created_at) VALUES('historical-message',?,?,?,'message',?)").run('visitor:'+old.id,old.id,old.id,Date.now())).insertedId;
  await db.prepare('INSERT INTO attention_deliveries(notification_id,subscription_id,next_attempt_at) VALUES(?,?,0)').run(notification,subscription);
  let sent=0;const delivery=await dispatchAttention({send:async()=>{sent++;return {state:'accepted'};}});assert.equal(delivery.ignored,1);assert.equal(sent,0,'Queued visitor transport push is suppressed');
  console.log('PASS BE-066 public web/native410, malformed-body early denial, old-token domain/alias/attention denial, unchanged history and suppressed queued delivery. Business and tenant flows: test-owner-transport.ts.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
