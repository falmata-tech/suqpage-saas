import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import {readOwnerTransport,commandOwnerTransport} from '../lib/owner-transport';
import type {OwnerTransportRead,OwnerTransportState} from '../lib/owner-transport-contract';
import * as support from '../lib/support';
import {joinAssignedSupportConversation} from './testing/support-join';
import {handleMobileRequest} from '../lib/mobile/router';
import type {NativeIdentityPort} from '../lib/mobile/http';
import {userAttentionFeed} from '../lib/attention-postgres';
import {getDashboardAttention} from '../lib/dashboard-attention';
import {assertSameOrigin} from '../lib/security';
import type {SessionUser} from '../lib/types';

function state(value:OwnerTransportRead):OwnerTransportState{assert.ok('conversation' in value);return value;}
const key=()=>crypto.randomUUID();
const rejects=(run:()=>Promise<unknown>,code:string)=>assert.rejects(run,error=>error instanceof support.SupportError&&error.code===code);

async function main(){
 console.log('S114 installing isolated local fixture');
 const db=await getDb();delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3102';
 try{
  const schema=(await db.prepare('SELECT current_schema() name').get()).name;assert.match(schema,/^suqpage_test_[a-f0-9]+$/);
  console.log('S114 isolated fixture ready');
  const business=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status,public_phone) VALUES('owner-transport-a','Transport A','composition','active','+447700900111')").run()).insertedId;
  const otherBusiness=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('owner-transport-b','Transport B','composition','active')").run()).insertedId;
  async function actor(name:string,role:SessionUser['access_role'],businessId:number|null=null,scope?:'support'|'transport'){
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,account_phone) VALUES(?,'unused',?,'admin',?,0,'+447700900222')").run(name+'@example.test',name,businessId)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,?,0)').run(id,scope);
   return (await runtimeUserById(id))!;
  }
  const owner=await actor('Owner A','client',business),foreign=await actor('Owner B','client',otherBusiness),admin=await actor('Owner transport admin','platform_admin'),dispatcher=await actor('Owner dispatcher','team_member',null,'transport'),helper=await actor('Owner helper','team_member',null,'support');
  await db.prepare('INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at) VALUES(?,1,?,0,?,0)').run(business,JSON.stringify({contacts:{phone:'+447700900333'}}),owner.id);
  const initial=state(await readOwnerTransport(owner));assert.deepEqual(initial,{conversation:null,defaults:{name:owner.name,phone:'+447700900111'}});assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_conversations').get()).n,0,'GET never creates a chat');
  const technicalKey=key(),technical=await support.createSupportConversation(owner,{subject:'Technical question',message:'A technical-only message',idempotencyKey:technicalKey});
  const start={action:'start',name:'Shipment contact',phone:'+44 7700 900444',origin:'Town A',destination:'Town B',message:'Two chairs',idempotencyKey:key()};
  await rejects(()=>commandOwnerTransport(owner,{...start,idempotencyKey:technicalKey}),'idempotency_conflict');
  const parallel=await Promise.all([commandOwnerTransport(owner,start),commandOwnerTransport(owner,start),commandOwnerTransport(owner,start)]),conversation=parallel[0].conversation!;
  assert.ok(parallel.every(value=>value.conversation?.id===conversation.id));const id=conversation.id,publicRef=conversation.publicRef;
  const canonical=await db.prepare('SELECT * FROM support_conversations WHERE id=?').get(id);assert.equal(canonical.business_id,business);assert.equal(canonical.opened_by_user_id,owner.id);assert.equal(canonical.participant_kind,'client');assert.equal(canonical.assistance_category,'shipment_observation');assert.equal(canonical.assigned_user_id,dispatcher.id);assert.equal(canonical.visitor_token_hash,null);assert.equal(canonical.visitor_session_expires_at,null);assert.equal(canonical.visitor_phone,'+447700900444');
  console.log('S114 owner creation/routing/replay verified');
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(id)).n,1);assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_assignments WHERE conversation_id=?').get(id)).n,1);
  assert.equal(state(await readOwnerTransport(owner)).conversation?.id,id);assert.equal(state(await readOwnerTransport(owner,{new:'1'})).conversation,null);assert.equal((await support.listSupportConversations(owner,{})).items[0].id,technical.id);assert.equal((await support.listSupportConversations(owner,{})).totalItems,1);
  const history=await readOwnerTransport(owner,{history:'1'});assert.ok('items' in history);assert.equal(history.total,1);assert.equal(history.items[0].id,id);assert.deepEqual([history.firstItem,history.lastItem,history.pageSize],[1,1,10]);assert.ok(!JSON.stringify(history).includes('phone'));
  await rejects(()=>commandOwnerTransport(owner,{...start,destination:'Changed destination'}),'idempotency_conflict');await rejects(()=>support.createSupportConversation(owner,{subject:'Technical question',message:'Changed message',idempotencyKey:technicalKey}),'idempotency_conflict');await rejects(()=>support.createSupportConversation(owner,{subject:'Transport replay as support',message:'Two chairs',idempotencyKey:start.idempotencyKey}),'idempotency_conflict');
  await rejects(()=>readOwnerTransport(foreign,{conversation:id}),'not_found');await rejects(()=>readOwnerTransport(helper,{conversation:id}),'forbidden');await rejects(()=>support.getSupportConversation(helper,id),'not_found');await rejects(()=>commandOwnerTransport(owner,{...start,businessId:otherBusiness}),'invalid_request');await rejects(()=>commandOwnerTransport(owner,{...start,token:'guest-token'}),'invalid_request');await rejects(()=>readOwnerTransport(owner,{conversation:id,new:'1'}),'invalid_request');await rejects(()=>commandOwnerTransport(owner,{action:'close',conversationId:id,publicRef:'SUP-WRONG'}),'conversation_changed');
  const staffView=await support.getSupportConversation(dispatcher,id),first=staffView.messages[0];await support.acknowledgeSupportRead(dispatcher,id,{messageId:first.id,publicRef});assert.equal(state(await readOwnerTransport(owner,{conversation:id})).conversation?.agentJoined,false);assert.equal(state(await readOwnerTransport(owner,{conversation:id})).conversation?.messages[0].read,true);
  await joinAssignedSupportConversation(admin,id);assert.equal(state(await readOwnerTransport(owner,{conversation:id})).conversation?.agentJoined,true);
  const note=await support.postSupportMessage(dispatcher,id,{audience:'note',message:'Private carrier commission',idempotencyKey:key()});
  const attachment=(await db.prepare("INSERT INTO support_attachments(message_id,storage_key,original_name,mime_type,byte_size,created_at) VALUES(?,?,'private.pdf','application/pdf',8,0)").run(note.id,`support-${key()}.pdf`)).insertedId;
  await support.saveTransportHandoff(dispatcher,id,{company:'Private logistics company',contact:'Private carrier contact',previousId:0});
  assert.equal((await support.listSupportConversations(owner,{queue:'transport'})).items.find(item=>item.id===id)?.transportCompany,null,'Direct owner domain lists omit private carrier handoffs');assert.equal((await support.listSupportConversations(dispatcher,{queue:'transport'})).items.find(item=>item.id===id)?.transportCompany,'Private logistics company','Scoped transport staff retain their operational handoff projection');
  assert.equal((await getDashboardAttention(owner,business)).supportReplies,0,'Transport/private notes do not become technical-support unread counts');assert.equal((await support.getSupportConversation(owner,id)).messages.length,1);await rejects(()=>support.getSupportAttachment(owner,id,attachment),'not_found');await rejects(()=>support.acknowledgeSupportRead(owner,id,{messageId:note.id,publicRef}),'invalid_read');
  const beforeNote=(await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(id)).n;await rejects(()=>support.postSupportMessage(owner,id,{audience:'note',message:'Owner private intent',idempotencyKey:key()}),'invalid_audience');assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(id)).n,beforeNote);
  await rejects(()=>support.postSupportMessage(owner,id,{message:'File not allowed',idempotencyKey:key(),attachment:{storageKey:`support-${key()}.pdf`,originalName:'file.pdf',mimeType:'application/pdf',byteSize:8}}),'invalid_attachment');
  const at=Date.now()-25*60*60_000,reply=await support.postSupportMessage(dispatcher,id,{audience:'reply',message:'When should we collect?',idempotencyKey:key()},at);
  let ownerView=state(await readOwnerTransport(owner,{conversation:id})).conversation!;assert.equal(ownerView.messages.length,2);assert.ok(!JSON.stringify(ownerView).includes('Private'));assert.equal(ownerView.idleWarningAt,at+23*60*60_000);assert.equal(ownerView.idleEndsAt,at+24*60*60_000);
  await commandOwnerTransport(owner,{action:'read',conversationId:id,publicRef,messageId:reply.id});assert.equal((await support.getSupportConversation(dispatcher,id)).messages.find(m=>m.id===reply.id)?.read,true);
  const follow={action:'message',conversationId:id,publicRef,message:'Tomorrow morning',idempotencyKey:key()};await commandOwnerTransport(owner,follow);await commandOwnerTransport(owner,follow);assert.equal((await db.prepare('SELECT awaiting_participant_since FROM support_conversations WHERE id=?').get(id)).awaiting_participant_since,null);assert.equal((await db.prepare('SELECT visitor_visible FROM support_messages WHERE idempotency_key=?').get(follow.idempotencyKey)).visitor_visible,true);
  const ownerFeed=await userAttentionFeed(owner);assert.ok(ownerFeed.items.some(item=>item.channel==='transport'&&item.destination.screen==='owner-chat'&&item.destination.id===id));assert.ok(!(await userAttentionFeed(foreign)).items.some(item=>item.destination.id===id));assert.equal((await db.prepare("SELECT COUNT(*) n FROM attention_notifications WHERE source_key=? AND user_id=?").get('support-message:'+note.id,owner.id)).n,0);
  console.log('S114 privacy/read/attention verified');
  await commandOwnerTransport(owner,{action:'close',conversationId:id,publicRef});const ended=await db.prepare('SELECT status,resolved_at,closed_at FROM support_conversations WHERE id=?').get(id);assert.equal(ended.status,'closed');assert.equal(ended.resolved_at,null);assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_assignments WHERE conversation_id=? AND released_at IS NULL').get(id)).n,0);await commandOwnerTransport(owner,{action:'close',conversationId:id,publicRef});assert.deepEqual(await db.prepare('SELECT status,resolved_at,closed_at FROM support_conversations WHERE id=?').get(id),ended);await rejects(()=>commandOwnerTransport(owner,{action:'resume',conversationId:id,publicRef}),'not_resumable');
  await support.reopenSupportConversation(admin,id);await joinAssignedSupportConversation(admin,id);await support.postSupportMessage(dispatcher,id,{audience:'reply',message:'Awaiting your response',idempotencyKey:key()},at);assert.equal((await support.sweepSupportInactivity(at+24*60*60_000)).ended,1);
  await Promise.all([commandOwnerTransport(owner,{action:'resume',conversationId:id,publicRef}),commandOwnerTransport(owner,{action:'resume',conversationId:id,publicRef})]);assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='reopened' AND detail='owner resumed automatically ended conversation'").get(id)).n,1);
  await support.closeSupportConversation(dispatcher,id);assert.ok((await db.prepare('SELECT resolved_at FROM support_conversations WHERE id=?').get(id)).resolved_at);await commandOwnerTransport(owner,{action:'close',conversationId:id,publicRef});assert.ok((await db.prepare('SELECT resolved_at FROM support_conversations WHERE id=?').get(id)).resolved_at,'Owner retry cannot erase a staff resolution');await rejects(()=>commandOwnerTransport(owner,{action:'resume',conversationId:id,publicRef}),'not_resumable');
  console.log('S114 end/resolve/idle/resume verified');

  // Actual web adapter with only its identity/after ports controlled; services hit isolated PostgreSQL.
  let webActor:SessionUser|null=owner;const nativeRequire=createRequire(import.meta.url);
  const built=await build({entryPoints:['app/api/owner-transport/route.ts'],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',plugins:[{name:'identity-port',setup(b){b.onResolve({filter:/^@\//},a=>({path:a.path,external:true}));}}]});
  const module={exports:{} as {GET:(request:NextRequest)=>Promise<Response>;POST:(request:NextRequest)=>Promise<Response>}};
  const ports:Record<string,unknown>={'@/lib/auth':{apiUser:async()=>webActor},'@/lib/security':{assertSameOrigin},'@/lib/owner-transport':{readOwnerTransport,commandOwnerTransport},'@/lib/support':{SupportError:support.SupportError},'@/lib/attention-after':{scheduleAttentionDelivery(){}}};
  vm.runInNewContext(built.outputFiles[0].text,{module,exports:module.exports,require:(name:string)=>ports[name]||nativeRequire(name),Buffer,Uint8Array,console});
  const web=(method='GET',query='',body?:unknown,origin='http://127.0.0.1:3102')=>module.exports[method as 'GET'|'POST'](new NextRequest('http://127.0.0.1:3102/api/owner-transport'+query,{method,headers:{origin,'content-type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})}));
  let response=await web('GET','?conversation='+id);assert.equal(response.status,200);assert.match(response.headers.get('cache-control')||'',/private.*no-store/);assert.ok(!JSON.stringify(await response.json()).includes('Private'));assert.equal(response.headers.has('set-cookie'),false);
  assert.equal((await web('GET','?new=1&new=1')).status,400);assert.equal((await web('POST','',{...start,idempotencyKey:key()},'https://other.example.test')).status,403);assert.equal((await web('POST','',[])).status,400);webActor=foreign;assert.equal((await web('GET','?conversation='+id)).status,404);webActor=null;assert.equal((await web()).status,401);webActor=owner;
  const apiStart={...start,idempotencyKey:key()};response=await web('POST','',apiStart);assert.equal(response.status,200);const apiCase=(await response.json() as OwnerTransportState).conversation!;
  let nativeActor=owner;const identity:NativeIdentityPort={verify:async()=>({id:'fixture-owner',email:nativeActor.email}),linked:async()=>nativeActor.id,user:runtimeUserById};
  const mobile=(route:string,method='GET',body?:unknown)=>handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/'+route,{method,headers:{authorization:'Bearer '+'t'.repeat(24),'content-type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})}),route.split('?')[0].split('/'),{identity});
  response=await mobile('owner/transport?conversation='+apiCase.id);assert.equal(response.status,200);assert.equal((await response.json() as OwnerTransportState).conversation?.id,apiCase.id);response=await mobile('owner/support/'+apiCase.id);assert.equal(response.status,200);const old=await response.json();assert.equal(old.conversation.assistanceCategory,'shipment_observation');assert.ok(!JSON.stringify(old).includes('Private'));
  response=await mobile('owner/support');assert.equal(response.status,200);assert.equal((await response.json()).items.length,1,'Old technical inbox excludes transport');response=await mobile('owner/transport','POST',{action:'message',conversationId:apiCase.id,publicRef:apiCase.publicRef,message:'Native owner reply',idempotencyKey:key()});assert.equal(response.status,200);response=await mobile('owner/support/'+apiCase.id,'POST',{action:'message',message:'Old build owner reply',idempotencyKey:key()});assert.equal(response.status,200);assert.equal((await db.prepare("SELECT visitor_visible FROM support_messages WHERE conversation_id=? ORDER BY id DESC LIMIT 1").get(apiCase.id)).visitor_visible,true);
  response=await mobile('owner/transport','POST',{action:'close',conversationId:apiCase.id,publicRef:'SUP-WRONG'});assert.equal(response.status,400);nativeActor=foreign;assert.equal((await mobile('owner/transport?conversation='+apiCase.id)).status,404);nativeActor=dispatcher;assert.equal((await mobile('owner/transport')).status,403);nativeActor=owner;
  const colleague=await actor('Same-business client','client',business);await commandOwnerTransport(colleague,{action:'message',conversationId:apiCase.id,publicRef:apiCase.publicRef,message:'Same-business client reply',idempotencyKey:key()});const colleagueMessage=state(await readOwnerTransport(owner,{conversation:apiCase.id})).conversation!.messages.find(message=>message.body==='Same-business client reply');assert.equal(colleagueMessage?.sender,'visitor','Another authorized client at the same business is displayed as a participant, not staff');assert.equal(colleagueMessage?.senderName,colleague.name);
  await support.acknowledgeSupportRead(dispatcher,apiCase.id,{messageId:colleagueMessage!.id,publicRef:apiCase.publicRef});
  assert.equal(state(await readOwnerTransport(colleague,{conversation:apiCase.id})).conversation!.messages.find(message=>message.id===colleagueMessage!.id)?.read,true,'Colleague receives the canonical staff read receipt');
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(colleague.id);
  assert.equal(state(await readOwnerTransport(owner,{conversation:apiCase.id})).conversation!.messages.find(message=>message.id===colleagueMessage!.id)?.sender,'visitor','Historical participant-side transport remains participant after a role change');
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(colleague.id);
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(dispatcher.id);await db.prepare('UPDATE users SET business_id=? WHERE id=?').run(business,dispatcher.id);
  const formerStaff=(await runtimeUserById(dispatcher.id))!;
  const historicalStaff=state(await readOwnerTransport(formerStaff,{conversation:id})).conversation!.messages.find(message=>message.id===reply.id)!;
  assert.equal(historicalStaff.sender,'staff','A current owner who previously replied as staff cannot reinterpret that staff message as their participant reply');assert.notEqual(historicalStaff.senderName,'You');
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(dispatcher.id);await db.prepare('UPDATE users SET business_id=NULL WHERE id=?').run(dispatcher.id);
  await db.prepare("UPDATE businesses SET public_phone='' WHERE id=?").run(business);assert.equal(state(await readOwnerTransport(owner,{new:'1'})).defaults.phone,'+447700900222','Private account phone is the explicit fallback when the canonical business phone is empty');
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(owner.id);await rejects(()=>commandOwnerTransport(owner,{...start,idempotencyKey:key()}),'forbidden');await rejects(()=>readOwnerTransport(owner),'forbidden');await rejects(()=>support.postSupportMessage(owner,apiCase.id,{message:'Stale owner attempt',idempotencyKey:key()}),'not_found');assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version,79,'Later additive schema preserves existing owner transport');
  console.log('PASS S114 isolated PostgreSQL + actual web/native adapters: tenant/current-role scope, defaults, no guest capability, replay/concurrency, transport routing/history, private notes/attachments, visible receipts/attention, unresolved end/staff resolution/auto-resume, old-build compatibility and guarded HTTP.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
