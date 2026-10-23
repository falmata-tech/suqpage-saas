import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {DELETE,GET,POST} from '../app/api/public-support/route';
import {runtimeUserById} from '../lib/catalog-runtime';
import {TRANSPORT_COORDINATOR} from '../lib/transport-coordinator';
import {commandOwnerTransport} from '../lib/owner-transport';
import * as support from '../lib/support';
import type {SessionUser} from '../lib/types';

const key=()=>crypto.randomUUID();
async function main(){
 const db=await getDb(),realNow=Date.now;
 process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3102';
 delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 let clock=realNow();
 Date.now=()=>clock;
 try{
  async function actor(name:string,role:SessionUser['access_role'],businessId:number|null=null,scope?:'support'|'transport'){
   const email='s162-'+name+'-'+crypto.randomBytes(4).toString('hex')+'@example.test';
   const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,account_phone) VALUES(?,'unused',?,'admin',?,0,'+251911223344')").run(email,name,businessId)).insertedId);
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,?,?)').run(id,scope,clock);
   return (await runtimeUserById(id))!;
  }
  const admin=await actor('admin','platform_admin'),agent=await actor('agent','team_member',null,'transport');
  await support.updateSupportAgentSetting(admin,{userId:agent.id,enabled:true,maxOpenConversations:5,queueScope:'transport'});
  const start=realNow()-300_000,token=crypto.randomBytes(32).toString('base64url');
  clock=start;
  const created=await support.createPublicSupportConversation({category:'shipment_observation',coordinatorId:TRANSPORT_COORDINATOR.id,
   name:'Callback visitor',phone:'+251911111111',origin:'Addis Ababa',destination:'Adama',message:'Two sample cartons',idempotencyKey:key()},
   's162-callback-ip',start,token);
  const id=created.id,publicRef=created.publicRef,due=start+210_000;
  assert.equal((await db.prepare('SELECT assigned_user_id,status FROM support_conversations WHERE id=?').get(id)).assigned_user_id,agent.id);
  const before=await support.getPublicSupportConversation(token,due-1);
  assert.equal(before.transportCallback?.submitted,false);assert.equal(before.messages.length,1,'The live transcript remains available until 3:30.');
  await assert.rejects(()=>support.submitPublicTransportCallback(token,{phone:'+251911111111',email:'buyer@example.test',idempotencyKey:key()},'s162-callback-ip',due-1),
   error=>error instanceof support.SupportError&&error.code==='callback_not_ready');
  const initialMessage=before.messages[0].id,callbackKey=key();
  clock=due;
  const request=(body:Record<string,unknown>)=>POST(new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport',{
   method:'POST',headers:{origin:'http://127.0.0.1:3102','content-type':'application/json',cookie:'suqpage_public_transport='+token},body:JSON.stringify({publicRef,...body}),
  }));
  const payload={action:'callback',phone:'+251 911 111 222',email:'buyer@example.test',idempotencyKey:callbackKey};
  const first=await request(payload),firstBody=await first.json() as {conversation:{publicRef:string;messages:unknown[];transportCallback:{phone:string|null;email:string|null;submitted:boolean}}};
  assert.equal(first.status,200);assert.equal(firstBody.conversation.publicRef,publicRef);assert.deepEqual(firstBody.conversation.messages,[]);
  assert.deepEqual(firstBody.conversation.transportCallback,{phone:'+251911111222',email:'buyer@example.test',submitted:true});
  const retry=await request(payload);assert.equal(retry.status,200,'A lost-response retry returns the same static receipt.');
  const changed=await request({...payload,phone:'+251911111333',idempotencyKey:key()});assert.equal(changed.status,400,'The same case accepts one callback request only.');
  const staleReply=await request({action:'message',message:'Can anyone hear me?',idempotencyKey:key()});assert.equal(staleReply.status,400);
  assert.equal((await support.getPublicSupportConversation(token,due+1)).messages.length,0,'A refresh after handoff has no public transcript.');
  const row=await db.prepare('SELECT status,resolved_at,visitor_phone,visitor_email,awaiting_staff_since,awaiting_staff_message_id FROM support_conversations WHERE id=?').get(id);
  assert.equal(row.status,'open');assert.equal(row.resolved_at,null);assert.equal(row.visitor_phone,'+251911111222');assert.equal(row.visitor_email,'buyer@example.test');
  assert.equal(row.awaiting_staff_since,due);assert.ok(row.awaiting_staff_message_id);
  assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='message' AND detail='transport callback submitted'").get(id)).n,1);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(id)).n,2,'One callback note is stored for staff.');
  const staff=await support.getSupportConversation(agent,id);
  assert.equal(staff.conversation.visitorPhone,'+251911111222');assert.equal(staff.conversation.visitorEmail,'buyer@example.test');
  assert.ok(staff.messages.some(message=>message.body==='Please contact me about this transport request using the contact details on this case.'));
  assert.ok((await db.prepare("SELECT COUNT(*) n FROM attention_notifications WHERE conversation_id=? AND source_key LIKE 'support-message:%'").get(id)).n>0);
  await assert.rejects(()=>support.acknowledgePublicRead(token,{messageId:initialMessage,publicRef},due+1),error=>error instanceof support.SupportError&&error.code==='callback_required');
  await assert.rejects(()=>support.postPublicSupportMessage(token,{message:'late',idempotencyKey:key()},'s162-callback-ip',due+1),error=>error instanceof support.SupportError&&error.code==='callback_required');
  console.log('PASS S162 visitor callback boundary, same-case staff follow-up, contact privacy, static receipt, idempotent retry, stale live read/reply denial and one queued staff alert.');

  const reset=await DELETE(new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport',{
   method:'DELETE',headers:{origin:'http://127.0.0.1:3102',cookie:'suqpage_public_transport='+token},
  }));
  assert.equal(reset.status,200,'The submitted receipt can release this browser session.');
  assert.equal((await db.prepare('SELECT status FROM support_conversations WHERE id=?').get(id)).status,'open','The earlier callback remains available to staff.');
  const prepared=await GET(new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport'));
  assert.equal(prepared.status,200);
  const newToken=prepared.cookies.get('suqpage_public_transport')?.value;
  assert.ok(newToken&&newToken!==token,'A new request uses a fresh session token.');
  clock=due+1000;
  const newRequest=await POST(new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport',{
   method:'POST',headers:{origin:'http://127.0.0.1:3102','content-type':'application/json',cookie:'suqpage_public_transport='+newToken},
   body:JSON.stringify({action:'start',category:'shipment_observation',coordinatorId:TRANSPORT_COORDINATOR.id,name:'Another request',phone:'+251911111111',origin:'Addis Ababa',destination:'Bishoftu',message:'Fresh goods',idempotencyKey:key()}),
  }));
  assert.equal(newRequest.status,201,'A new intake starts after the prior receipt.');
  const newBody=await newRequest.json() as {conversation:{id:number;publicRef:string}};
  assert.notEqual(newBody.conversation.id,id);
  assert.notEqual(newBody.conversation.publicRef,publicRef);
  console.log('PASS S163 submitted callback remains in staff inbox while a fresh transport request starts.');

  const cancelStart=clock+1000,cancelToken=crypto.randomBytes(32).toString('base64url');
  clock=cancelStart;
  const cancellable=await support.createPublicSupportConversation({category:'shipment_observation',coordinatorId:TRANSPORT_COORDINATOR.id,
   name:'Cancel visitor',phone:'+251911111111',origin:'Adama',destination:'Addis Ababa',message:'A separate request',idempotencyKey:key()},
   's163-cancel-ip',cancelStart,cancelToken);
  const cancelDue=cancelStart+210_000;
  clock=cancelDue;
  await assert.rejects(()=>support.closePublicSupportConversation(crypto.randomBytes(32).toString('base64url'),cancelDue),
   error=>error instanceof support.SupportError&&error.code==='not_found');
  const close=(cookieToken:string)=>POST(new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport',{
   method:'POST',headers:{origin:'http://127.0.0.1:3102','content-type':'application/json',cookie:'suqpage_public_transport='+cookieToken},
   body:JSON.stringify({action:'close',publicRef:cancellable.publicRef}),
  }));
  const ended=await close(cancelToken),endedBody=await ended.json() as {conversation:{status:string;publicRef:string}};
  assert.equal(ended.status,200,'End chat succeeds at the exact 3:30 handoff.');
  assert.equal(endedBody.conversation.status,'closed');
  assert.equal(endedBody.conversation.publicRef,cancellable.publicRef);
  assert.equal((await close(cancelToken)).status,200,'Repeated close is idempotent.');
  const cancelledRow=await db.prepare('SELECT status FROM support_conversations WHERE id=?').get(cancellable.id);
  assert.equal(cancelledRow.status,'closed');
  assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND detail='transport callback submitted'").get(cancellable.id)).n,0,'Cancel did not submit callback details.');
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_assignments WHERE conversation_id=? AND released_at IS NULL').get(cancellable.id)).n,0);
  assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='closed'").get(cancellable.id)).n,1);
  console.log('PASS S163 deadline close, duplicate close, foreign-token denial, no callback write, assignment release and closed receipt.');

  const business=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status,public_phone) VALUES(?,?,'composition','active','+251911444555')").run('s162-owner-'+crypto.randomBytes(3).toString('hex'),'S162 callback owner')).insertedId);
  const otherBusiness=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition','active')").run('s162-other-'+crypto.randomBytes(3).toString('hex'),'S162 other owner')).insertedId);
  const owner=await actor('owner','client',business),foreign=await actor('foreign-owner','client',otherBusiness);
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,0,?,?)').run(business,JSON.stringify({contacts:{phone:'+251911444666'}}),owner.id,clock);
  const ownerStart=start+10;
  const ownerCreated=await support.createOwnerTransportConversation(owner,{name:'Owner contact',phone:'+251911222333',origin:'Hawassa',destination:'Addis Ababa',message:'Incoming stock',idempotencyKey:key(),coordinatorId:TRANSPORT_COORDINATOR.id},ownerStart);
  const ownerDue=ownerStart+210_000;clock=ownerDue;
  const ownerResult=await commandOwnerTransport(owner,{action:'callback',conversationId:ownerCreated.id,publicRef:ownerCreated.publicRef,phone:'+251911222444',email:'owner@example.test',idempotencyKey:key()});
  assert.equal(ownerResult.conversation?.transportCallback?.submitted,true);
  assert.equal(ownerResult.conversation?.messages.length,0);
  await assert.rejects(()=>commandOwnerTransport(foreign,{action:'callback',conversationId:ownerCreated.id,publicRef:ownerCreated.publicRef,phone:'+251911222555',email:'foreign@example.test',idempotencyKey:key()}),error=>error instanceof support.SupportError&&error.code==='not_found');
  const ownerRow=await db.prepare('SELECT visitor_phone,visitor_email,status,resolved_at FROM support_conversations WHERE id=?').get(ownerCreated.id);
  assert.deepEqual(ownerRow,{visitor_phone:'+251911222444',visitor_email:'owner@example.test',status:'open',resolved_at:null});
  console.log("PASS S162 owner callback uses the owner's same case and denies cross-business callback access.");
 }finally{Date.now=realNow;await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
