import assert from 'node:assert/strict';
import {supportIdleDeadlines,SUPPORT_IDLE_WINDOWS,SUPPORT_IDLE_SWEEP_LIMIT} from '../lib/support-idle-contract';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
import {createPostgresPool,postgresRuntimeConfig} from '../lib/postgres-runtime';
import type {SessionUser} from '../lib/types';
import * as support from '../lib/support';
import {postAssignedSupportReply} from './testing/support-join';
import {NextRequest} from 'next/server';
import {GET,POST} from '../app/api/public-support/route';
import {handleMobileRequest} from '../lib/mobile/router';

function contractCases(){
 const start=1_800_000_000_000;
 assert.deepEqual(supportIdleDeadlines(start,'guest'),{idleWarningAt:start+25*60_000,idleEndsAt:start+30*60_000});
 assert.deepEqual(supportIdleDeadlines(start,'owner'),{idleWarningAt:start+23*60*60_000,idleEndsAt:start+24*60*60_000});
 assert.deepEqual(supportIdleDeadlines(0,'guest'),{idleWarningAt:25*60_000,idleEndsAt:30*60_000});
 for(const invalid of [null,-1,NaN,Infinity,Number.MAX_SAFE_INTEGER])assert.deepEqual(supportIdleDeadlines(invalid,'guest'),{idleWarningAt:null,idleEndsAt:null});
 assert.equal(SUPPORT_IDLE_WINDOWS.guest.warningMs<SUPPORT_IDLE_WINDOWS.guest.endMs,true);
 assert.equal(SUPPORT_IDLE_WINDOWS.owner.warningMs<SUPPORT_IDLE_WINDOWS.owner.endMs,true);
 assert.equal(SUPPORT_IDLE_SWEEP_LIMIT,25);
}

async function main(){
 contractCases();const db=await getDb();
 delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
 process.env.NEXT_PUBLIC_APP_URL='http://127.0.0.1:3102';
 const t=Date.now()-2*24*60*60_000,guestWindow=SUPPORT_IDLE_WINDOWS.guest.endMs,ownerWindow=SUPPORT_IDLE_WINDOWS.owner.endMs;
 try{
  // Reconstruct an isolated schema64 row, then apply the actual additive65.
  await db.exec('DROP INDEX support_open_participant_idle; ALTER TABLE support_conversations DROP COLUMN awaiting_participant_since,DROP COLUMN idle_ended_at; DELETE FROM schema_migrations WHERE version=65');
  const legacy=(await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,requester_label,visitor_phone,transport_origin,transport_destination,subject,status,created_at,updated_at,last_message_at)
   VALUES('SUP-LEGACY-IDLE','visitor','legacy-idle-fixture',?,'shipment_observation','Legacy fixture','+447700900999','Town A','Town B','Legacy request','waiting',?,?,?)`).run(t+support.PUBLIC_SUPPORT_SESSION_MS,t,t,t)).insertedId;
  const legacyBefore=await db.prepare('SELECT public_ref,status,subject,visitor_phone FROM support_conversations WHERE id=?').get(legacy);
  const schema=(await db.prepare('SELECT current_schema() name').get()).name;
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[65]);assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
  assert.deepEqual(await db.prepare('SELECT public_ref,status,subject,visitor_phone FROM support_conversations WHERE id=?').get(legacy),legacyBefore);
  assert.deepEqual(await db.prepare('SELECT awaiting_participant_since,idle_ended_at FROM support_conversations WHERE id=?').get(legacy),{awaiting_participant_since:null,idle_ended_at:null});
  const businessId=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('idle-owner','Idle owner','composition','active')").run()).insertedId;
  const foreignBusinessId=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('idle-other','Idle other','composition','active')").run()).insertedId;
  async function user(name:string,role:SessionUser['access_role'],business:number|null=null,scope?:'support'|'transport'){
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'admin',?,0)").run(name+'@example.test',name,business)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
   if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,?,0)').run(id,scope);
   return (await runtimeUserById(id))!;
  }
  const admin=await user('idle-admin','platform_admin'),owner=await user('idle-owner','client',businessId),foreign=await user('idle-foreign','client',foreignBusinessId);
  const dispatcher=await user('idle-dispatcher','team_member',null,'transport'),otherDispatcher=await user('idle-other-dispatcher','team_member',null,'transport'),helper=await user('idle-helper','team_member',null,'support');
  let ordinal=0;
  const guest=(at=t)=>support.createPublicSupportConversation({category:'shipment_observation',name:'Idle visitor',phone:'+447700900999',origin:'Town A',destination:'Town B',message:'Disposable fixture goods',idempotencyKey:crypto.randomUUID()},'idle-ip-'+(++ordinal),at);
  const own=()=>support.createSupportConversation(owner,{subject:'Idle owner request',message:'Disposable owner support request',idempotencyKey:crypto.randomUUID()},t);
  const state=(id:number)=>db.prepare('SELECT status,assigned_user_id,visitor_phone,closed_at,resolved_at,awaiting_participant_since,idle_ended_at,staff_joined_at FROM support_conversations WHERE id=?').get(id);
  const reply=(id:number,at=t,key=crypto.randomUUID())=>postAssignedSupportReply(admin,id,{audience:'reply',message:'A public reply for the participant',idempotencyKey:key},at);
  const closeCounts=async(id:number)=>({events:Number((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='closed' AND detail=?").get(id,support.SUPPORT_IDLE_END_DETAIL)).n),alerts:Number((await db.prepare("SELECT COUNT(*) n FROM attention_notifications WHERE conversation_id=? AND kind='closed' AND source_key LIKE 'support-idle-ended:%'").get(id)).n)});

  const timeoutSettings=()=>db.prepare("SELECT pg_backend_pid() pid,current_setting('idle_in_transaction_session_timeout') idle_timeout").get();
  const timeoutBefore=await timeoutSettings();
  await db.runner.transaction(async()=>{
   assert.equal((await support.sweepSupportInactivity(t)).ended,0);
   const local=await timeoutSettings();assert.equal(local.pid,timeoutBefore.pid,'The scope check uses the same PostgreSQL session');assert.equal(local.idle_timeout,'5s','A worker interruption cannot indefinitely retain an idle support-work transaction');
  });
  assert.deepEqual(await timeoutSettings(),timeoutBefore,'SET LOCAL restores the same pooled session default after commit');
  const timeoutRollback=Error('Fixture timeout-scope rollback');
  await assert.rejects(()=>db.runner.transaction(async()=>{
   await support.sweepSupportInactivity(t);assert.equal((await timeoutSettings()).idle_timeout,'5s');throw timeoutRollback;
  }),error=>error===timeoutRollback);
  assert.deepEqual(await timeoutSettings(),timeoutBefore,'SET LOCAL restores the same pooled session default after rollback');
  const noReply=await guest();assert.equal((await state(noReply.id)).awaiting_participant_since,null);assert.equal((await support.sweepSupportInactivity(t+ownerWindow)).ended,0);
  const edge=await guest(),key=crypto.randomUUID();const firstReply=await reply(edge.id,t,key);
  assert.deepEqual(await closeCounts(edge.id),{events:0,alerts:0});
  let view=await support.getPublicSupportConversation(edge.token,t);assert.equal(view.idleWarningAt,t+25*60_000);assert.equal(view.idleEndsAt,t+guestWindow);assert.equal(view.idleEndedAt,null);
  await support.postSupportMessage(admin,edge.id,{audience:'note',message:'Private operational note',idempotencyKey:crypto.randomUUID()},t+10*60_000);
  await support.acknowledgePublicRead(edge.token,{messageId:firstReply.id,publicRef:edge.publicRef},t+15*60_000);
  const assigned=(await state(edge.id)).assigned_user_id;const assignedAgent=assigned===dispatcher.id?dispatcher:otherDispatcher;
  const intake=(await support.getSupportConversation(admin,edge.id)).messages[0].id;
  await support.acknowledgeSupportRead(assignedAgent,edge.id,{messageId:intake,publicRef:edge.publicRef},t+20*60_000);
  assert.equal((await state(edge.id)).awaiting_participant_since,t,'Notes, visible read and join events do not reset the reply clock');
  await reply(edge.id,t+28*60_000,key);assert.equal((await state(edge.id)).awaiting_participant_since,t,'An idempotent reply retry never advances its clock');
  assert.equal((await support.sweepSupportInactivity(t+25*60_000)).ended,0);assert.equal((await support.sweepSupportInactivity(t+guestWindow-1)).ended,0);
  const historyBefore=(await support.getPublicSupportConversation(edge.token,t)).messages;
  assert.equal((await support.sweepSupportInactivity(t+guestWindow)).ended,1);
  const ended=await state(edge.id);assert.equal(ended.status,'closed');assert.equal(ended.resolved_at,null);assert.equal(ended.assigned_user_id,assigned);assert.equal(ended.visitor_phone,'+447700900999');assert.equal(ended.idle_ended_at,t+guestWindow);assert.equal(ended.awaiting_participant_since,null);assert.equal(ended.staff_joined_at,null);
  assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM support_assignments WHERE conversation_id=? AND released_at IS NULL').get(edge.id)).n),0);
  assert.deepEqual((await support.getPublicSupportConversation(edge.token,t+guestWindow)).messages,historyBefore,'Auto-end retains the visible transcript/read state');
  assert.deepEqual(await closeCounts(edge.id),{events:1,alerts:1});assert.equal((await support.sweepSupportInactivity(t+guestWindow+1)).ended,0);
  await support.postSupportMessage(admin,edge.id,{audience:'note',message:'Call later using retained contact',idempotencyKey:crypto.randomUUID()},t+guestWindow+2);assert.equal((await state(edge.id)).idle_ended_at,t+guestWindow);

  await assert.rejects(()=>support.resumePublicSupportConversation(edge.token,'SUP-WRONG',t+guestWindow),error=>(error as support.SupportError).code==='conversation_changed');
  await assert.rejects(()=>support.resumePublicSupportConversation(crypto.randomBytes(32).toString('base64url'),edge.publicRef,t+guestWindow),/not found/);
  await assert.rejects(()=>support.resumePublicSupportConversation(edge.token,edge.publicRef,t+support.PUBLIC_SUPPORT_SESSION_MS+1),/not found/);
  const expiry=(await db.prepare('SELECT visitor_session_expires_at FROM support_conversations WHERE id=?').get(edge.id)).visitor_session_expires_at;
  const resumes=await Promise.all([support.resumePublicSupportConversation(edge.token,edge.publicRef,t+guestWindow+10),support.resumePublicSupportConversation(edge.token,edge.publicRef,t+guestWindow+10)]);
  assert.equal(resumes.filter(x=>!x.duplicate).length,1);assert.equal(resumes.filter(x=>x.duplicate).length,1);
  assert.equal((await state(edge.id)).status,'open');assert.equal((await state(edge.id)).idle_ended_at,null);assert.equal((await state(edge.id)).awaiting_participant_since,null);
  assert.equal((await db.prepare('SELECT visitor_session_expires_at FROM support_conversations WHERE id=?').get(edge.id)).visitor_session_expires_at,expiry,'Resume does not extend guest authorization');
  assert.equal(Number((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='reopened'").get(edge.id)).n),1);
  await reply(edge.id,t+guestWindow+20);const resumedClock=(await state(edge.id)).awaiting_participant_since;await support.resumePublicSupportConversation(edge.token,edge.publicRef,t+guestWindow+30);assert.equal((await state(edge.id)).awaiting_participant_since,resumedClock,'Late duplicate resume does not erase a new staff reply clock');
  await support.closePublicSupportConversation(edge.token,t+guestWindow+40);assert.equal((await state(edge.id)).idle_ended_at,null);await assert.rejects(()=>support.resumePublicSupportConversation(edge.token,edge.publicRef,t+guestWindow+50),/cannot be resumed/);
  await assert.rejects(()=>support.resumePublicSupportConversation(noReply.token,noReply.publicRef,t),/cannot be resumed/);

  const cleared=await guest();await reply(cleared.id);await support.postPublicSupportMessage(cleared.token,{message:'I am here',idempotencyKey:crypto.randomUUID()},'idle-participant',t+10*60_000);assert.equal((await state(cleared.id)).awaiting_participant_since,null);
  await reply(cleared.id,t+15*60_000);await support.reassignSupportConversation(admin,cleared.id,null,t+16*60_000);assert.equal((await state(cleared.id)).awaiting_participant_since,null);
  const waitingMessages=Number((await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(cleared.id)).n);
  await assert.rejects(()=>support.postSupportMessage(admin,cleared.id,{audience:'reply',message:'A waiting-case reply',idempotencyKey:crypto.randomUUID()},t+17*60_000),error=>(error as support.SupportError).code==='join_required');
  assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(cleared.id)).n),waitingMessages);
  assert.equal((await state(cleared.id)).awaiting_participant_since,null,'Unassigned waiting requests cannot publish or start an idle clock');
  await support.reassignSupportConversation(admin,cleared.id,dispatcher.id,t+18*60_000);assert.equal((await state(cleared.id)).awaiting_participant_since,null);
  await reply(cleared.id,t+19*60_000);await support.reassignSupportConversation(admin,cleared.id,otherDispatcher.id,t+20*60_000);assert.equal((await state(cleared.id)).awaiting_participant_since,null);

  const ownerCase=await own();await reply(ownerCase.id);
  assert.equal((await support.getSupportConversation(owner,ownerCase.id)).conversation.idleWarningAt,t+23*60*60_000);
  const ownerBefore=await state(ownerCase.id),messageCount=Number((await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(ownerCase.id)).n),alertCount=Number((await db.prepare('SELECT COUNT(*) n FROM attention_notifications WHERE conversation_id=?').get(ownerCase.id)).n);
  await assert.rejects(()=>support.postSupportMessage(admin,ownerCase.id,{audience:'note',message:'Must never become a public owner reply',idempotencyKey:crypto.randomUUID()},t+1000),error=>(error as support.SupportError).code==='invalid_audience');
  assert.deepEqual(await state(ownerCase.id),ownerBefore);assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(ownerCase.id)).n),messageCount);assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM attention_notifications WHERE conversation_id=?').get(ownerCase.id)).n),alertCount);
  await assert.rejects(()=>support.postSupportMessage(foreign,ownerCase.id,{message:'Foreign owner',idempotencyKey:crypto.randomUUID()},t+1),/not found/);
  await assert.rejects(()=>support.postSupportMessage(owner,noReply.id,{message:'Owner cannot post as a visitor',idempotencyKey:crypto.randomUUID()},t+1),/not found/);
  assert.equal((await support.sweepSupportInactivity(t+23*60*60_000)).ended,0);assert.equal((await support.sweepSupportInactivity(t+ownerWindow-1)).ended,0);assert.equal((await support.sweepSupportInactivity(t+ownerWindow)).ended,1);
  assert.deepEqual(await closeCounts(ownerCase.id),{events:1,alerts:1});assert.equal((await state(ownerCase.id)).resolved_at,null);
  await support.reopenSupportConversation(owner,ownerCase.id,t+ownerWindow+1);assert.equal((await state(ownerCase.id)).idle_ended_at,null);assert.equal((await state(ownerCase.id)).awaiting_participant_since,null);
  await reply(ownerCase.id,t+ownerWindow+2);await support.postSupportMessage(owner,ownerCase.id,{message:'Owner returned',idempotencyKey:crypto.randomUUID()},t+ownerWindow+3);assert.equal((await state(ownerCase.id)).awaiting_participant_since,null);

  const resolved=await guest();await reply(resolved.id);await support.sweepSupportInactivity(t+guestWindow);assert.notEqual((await state(resolved.id)).idle_ended_at,null);await support.closeSupportConversation(admin,resolved.id,t+guestWindow+1);assert.notEqual((await state(resolved.id)).resolved_at,null);assert.equal((await state(resolved.id)).idle_ended_at,null);await assert.rejects(()=>support.resumePublicSupportConversation(resolved.token,resolved.publicRef,t+guestWindow+2),/cannot be resumed/);
  const manualAfterAuto=await guest();await reply(manualAfterAuto.id);await support.sweepSupportInactivity(t+guestWindow);await support.closePublicSupportConversation(manualAfterAuto.token,t+guestWindow+1);assert.equal((await state(manualAfterAuto.id)).idle_ended_at,null);await assert.rejects(()=>support.resumePublicSupportConversation(manualAfterAuto.token,manualAfterAuto.publicRef,t+guestWindow+2),/cannot be resumed/);

  const raced=await guest();await reply(raced.id);
  const race=await Promise.allSettled([support.sweepSupportInactivity(t+guestWindow),support.postPublicSupportMessage(raced.token,{message:'Concurrent participant reply',idempotencyKey:crypto.randomUUID()},'idle-race',t+guestWindow)]);
  const raceState=await state(raced.id);assert.ok(raceState.status==='open'||raceState.status==='closed');if(raceState.status==='open'){assert.equal(race[1].status,'fulfilled');assert.equal(raceState.awaiting_participant_since,null);}else{assert.equal(race[1].status,'rejected');assert.deepEqual(await closeCounts(raced.id),{events:1,alerts:1});}
  const parallel=await guest();await reply(parallel.id);const sweeps=await Promise.all([support.sweepSupportInactivity(t+guestWindow),support.sweepSupportInactivity(t+guestWindow)]);
  assert.equal(sweeps.reduce((count,result)=>count+result.ended,0),1);assert.deepEqual(await closeCounts(parallel.id),{events:1,alerts:1},'Parallel sweeps commit the ending and participant alert once');

  const waitingResume=await guest();await reply(waitingResume.id);await support.sweepSupportInactivity(t+guestWindow);
  await db.prepare("UPDATE support_agent_settings SET enabled=0 WHERE queue_scope='transport'").run();await support.resumePublicSupportConversation(waitingResume.token,waitingResume.publicRef,t+guestWindow+1);assert.equal((await state(waitingResume.id)).status,'waiting');assert.equal((await state(waitingResume.id)).assigned_user_id,null);assert.equal((await state(waitingResume.id)).idle_ended_at,null);assert.equal((await support.resumePublicSupportConversation(waitingResume.token,waitingResume.publicRef,t+guestWindow+2)).duplicate,true);
  await db.prepare("UPDATE support_agent_settings SET enabled=1 WHERE queue_scope='transport'").run();

  const config=postgresRuntimeConfig(process.env)!;const pool=createPostgresPool({...config,poolMax:1});const blocker=await pool.connect();
  try{await blocker.query('BEGIN');await blocker.query("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");const before=performance.now();assert.deepEqual(await support.sweepSupportInactivity(t+ownerWindow),{ended:0,skippedBusy:true});assert.ok(performance.now()-before<1500,'Busy maintenance skips rather than waiting for a chat transaction');await blocker.query('ROLLBACK');}finally{blocker.release();await pool.end();}

  const rollback=await guest();await reply(rollback.id);const rollbackBefore=await state(rollback.id);
  await db.exec(`CREATE FUNCTION fail_idle_alert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.source_key LIKE 'support-idle-ended:%' THEN RAISE EXCEPTION 'fixture idle alert unavailable'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_idle_alert BEFORE INSERT ON attention_notifications FOR EACH ROW EXECUTE FUNCTION fail_idle_alert()`);
  await assert.rejects(()=>support.sweepSupportInactivity(t+guestWindow),/fixture idle alert unavailable/);assert.equal((await timeoutSettings()).idle_timeout,timeoutBefore.idle_timeout,'A failed maintenance transaction also restores the ordinary idle timeout');assert.deepEqual(await state(rollback.id),rollbackBefore);assert.deepEqual(await closeCounts(rollback.id),{events:0,alerts:0});await db.exec('DROP TRIGGER fail_idle_alert ON attention_notifications; DROP FUNCTION fail_idle_alert()');
  await db.exec(`CREATE FUNCTION delay_idle_close() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.idle_ended_at IS NOT NULL AND OLD.idle_ended_at IS NULL THEN PERFORM pg_sleep(2); END IF; RETURN NEW; END $$; CREATE TRIGGER delay_idle_close BEFORE UPDATE ON support_conversations FOR EACH ROW EXECUTE FUNCTION delay_idle_close()`);
  await assert.rejects(()=>support.sweepSupportInactivity(t+guestWindow),/statement timeout/);assert.deepEqual(await state(rollback.id),rollbackBefore);assert.deepEqual(await closeCounts(rollback.id),{events:0,alerts:0});await db.exec('DROP TRIGGER delay_idle_close ON support_conversations; DROP FUNCTION delay_idle_close()');await support.sweepSupportInactivity(t+guestWindow);

  const batch=[];for(let i=0;i<28;i++){const c=await guest();await reply(c.id);batch.push(c);}
  assert.equal((await support.sweepSupportInactivity(t+guestWindow,()=>0)).ended,25);assert.equal((await support.sweepSupportInactivity(t+guestWindow,()=>0)).ended,3);assert.equal((await support.sweepSupportInactivity(t+guestWindow,()=>0)).ended,0);
  for(let i=0;i<3;i++){const c=await guest();await reply(c.id);}let ticks=-1000;const budget=await support.sweepSupportInactivity(t+guestWindow,()=>ticks+=1000);assert.equal(budget.ended,1,'A monotonic per-command budget stops cleanly before another case');await support.sweepSupportInactivity(t+guestWindow,()=>0);

  const adapter=await guest();await reply(adapter.id);await support.sweepSupportInactivity(t+guestWindow);
  async function web(action:string,ref=adapter.publicRef,token=adapter.token){const request=new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport',{method:'POST',headers:{origin:'http://127.0.0.1:3102','content-type':'application/json',cookie:'suqpage_public_transport='+token},body:JSON.stringify({action,publicRef:ref})});return POST(request);}
  assert.equal((await web('resume','SUP-WRONG')).status,400);assert.equal((await web('resume')).status,200);assert.equal((await web('resume')).status,200);
  await reply(adapter.id);await support.sweepSupportInactivity(t+guestWindow);
  const mobileRequest=new Request('http://localhost/api/mobile/v1/transport',{method:'POST',headers:{'content-type':'application/json','X-Suqpage-Buying-Session':adapter.token},body:JSON.stringify({action:'resume',publicRef:adapter.publicRef})});const mobile=await handleMobileRequest(mobileRequest,['transport'],{invalidate(){}});assert.equal(mobile.status,200);assert.equal((await mobile.json()).conversation.publicRef,adapter.publicRef);
  const readBefore=await state(adapter.id);await GET(new NextRequest('http://127.0.0.1:3102/api/public-support?channel=transport',{headers:{cookie:'suqpage_public_transport='+adapter.token}}));assert.deepEqual(await state(adapter.id),readBefore,'A chat GET has no maintenance side effects');

  const plan=await db.prepare('SELECT indexdef FROM pg_indexes WHERE schemaname=current_schema() AND indexname=?').get('support_open_participant_idle');assert.match(plan.indexdef,/awaiting_participant_since/);assert.match(plan.indexdef,/status.*open/);
  await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,requester_label,visitor_phone,transport_origin,transport_destination,subject,status,created_at,updated_at,last_message_at)
   SELECT 'SUP-IDLE-PLAN-'||g,'visitor','fixture-plan-'||g,?,'shipment_observation','Plan fixture','+447700900999','Town A','Town B','Plan fixture','closed',?,?,? FROM generate_series(1,1500) g`).run(t+support.PUBLIC_SUPPORT_SESSION_MS,t,t,t);
  const indexed=await guest();await reply(indexed.id);const indexedOwner=await own();await reply(indexedOwner.id);
  const mixedGuest=await guest();await reply(mixedGuest.id,t+ownerWindow-guestWindow-10*60_000);
  const mixedOwner=await support.createSupportConversation(owner,{subject:'Mixed overdue owner',message:'Fixture deadline-order case',idempotencyKey:crypto.randomUUID()},t-10*60_000);await reply(mixedOwner.id,t-5*60_000);
  await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,subject,status,assigned_user_id,created_at,updated_at,last_message_at,awaiting_participant_since)
   SELECT 'SUP-IDLE-OWNER-BACKLOG-'||g,'client',?,?,'general','Owner backlog fixture','Not yet due owner request','open',?,?,?,?,? FROM generate_series(1,1500) g`).run(businessId,owner.id,helper.id,t,t,t,t+60*60_000);
  await db.exec('ANALYZE support_conversations');
  const workerNow=t+ownerWindow,cutoffs=[workerNow-guestWindow,workerNow-ownerWindow];
  const explanation=JSON.stringify(await db.prepare('EXPLAIN '+support.SUPPORT_IDLE_DUE_QUERY).all(...cutoffs));
  assert.ok((explanation.match(/support_open_participant_idle/g)||[]).length>=2,'Both bounded participant branches use the partial clock index');
  assert.match(explanation,/Index Cond.*participant_kind.*visitor/);assert.match(explanation,/Index Cond.*participant_kind.*client/);
  const candidates=await db.prepare(support.SUPPORT_IDLE_DUE_QUERY).all(...cutoffs);
  assert.ok(candidates.some(row=>row.id===indexed.id));assert.ok(candidates.some(row=>row.id===indexedOwner.id));
  assert.ok(candidates.every(row=>row.participant_kind==='visitor'||row.awaiting_participant_since<=t),'A large recent-owner backlog cannot enter the due arms');
  assert.ok(candidates.findIndex(row=>row.id===mixedGuest.id)>=0);assert.ok(candidates.findIndex(row=>row.id===mixedOwner.id)>=0);
  assert.ok(candidates.findIndex(row=>row.id===mixedGuest.id)<candidates.findIndex(row=>row.id===mixedOwner.id),'The guest whose ending is more overdue precedes the older owner reply clock across different windows');
  assert.deepEqual(await db.prepare('SELECT public_ref,status,subject,visitor_phone FROM support_conversations WHERE id=?').get(legacy),legacyBefore,'Legacy unanswered work remains intact through every sweep');
  console.log('PASS isolated PostgreSQL migration65/no backfill, guest/owner deadlines, notes/read/join/idempotency, participant/reset/reassign/reopen, exact-once ending/resume/history/alerts, token/ref/role denial, manual-resolution marker clearing, races, busy lock/budget/25-limit, rollback/statement timeout, transaction-local idle timeout and restoration, web/native adapters, GET purity and indexed due query.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
