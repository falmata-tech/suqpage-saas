import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { runtimeUserById } from '../lib/catalog-runtime';
import type { SessionUser } from '../lib/types';
import * as support from '../lib/support';
import { SUPPORT_STAFF_REPLY_TARGET_MS as target,SUPPORT_UNASSIGNED_QUEUE_TARGET_MS as unassignedTarget } from '../lib/support-response-contract';
import { userAttentionFeed } from '../lib/attention-postgres';
import { dispatchAttention } from '../lib/attention-delivery';
import { createPostgresPool, postgresRuntimeConfig } from '../lib/postgres-runtime';

async function main() {
  const db=await getDb(),t=Date.now()-2*target;
  delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
  try {
    const business=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('response-owner','Response owner','composition','active')").run()).insertedId;
    const foreignBusiness=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('response-foreign','Foreign owner','composition','active')").run()).insertedId;
    async function user(name:string,role:SessionUser['access_role'],businessId:number|null=null,scope?:'support') {
      const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused',?,'admin',?,0)").run(`${name}@example.test`,name,businessId)).insertedId;
      await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);
      if(scope)await db.prepare('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,?,0)').run(id,scope);
      return (await runtimeUserById(id))!;
    }
    const admin=await user('response-admin','platform_admin'),manager=await user('response-manager','operations_manager'),owner=await user('response-owner','client',business),foreign=await user('response-foreign','client',foreignBusiness);
    const agent=await user('response-transport','team_member',null,'support'),helper=await user('response-support','team_member',null,'support'),other=await user('response-other','team_member',null,'support');
    const key=()=>crypto.randomUUID();
    const open=(at=t)=>support.createSupportConversation(owner,{subject:'Help with my AfricMade account',message:'Fixture support question',idempotencyKey:key()},at);
    const ownerView=async(id:number)=>(await support.getSupportConversation(owner,id)).conversation;
    const state=(id:number)=>db.prepare('SELECT status,resolved_at,assigned_user_id,awaiting_staff_since,awaiting_staff_message_id,overdue_notified_message_id,overdue_notified_assignment_id,awaiting_participant_since,staff_joined_assignment_id FROM support_conversations WHERE id=?').get(id);
    const inspect=(id:number)=>support.getSupportConversation(admin,id);
    async function assignee(id:number) { return (await runtimeUserById((await inspect(id)).conversation.assignedUserId!))!; }
    async function join(id:number,at=t) { const c=(await inspect(id)).conversation,a=await assignee(id);await support.joinSupportConversation(a,id,{publicRef:c.publicRef,assignmentEpoch:c.readEpoch},at);return a; }
    async function reply(id:number,at=t,k=key()) { const a=await join(id,at);return support.postSupportMessage(a,id,{audience:'reply',message:'Public fixture reply',idempotencyKey:k},at); }
    const alerts=(id:number)=>db.prepare("SELECT * FROM attention_notifications WHERE conversation_id=? AND kind='reply_overdue' ORDER BY user_id").all(id);
    const rejected=(run:()=>Promise<unknown>,code:string)=>assert.rejects(run,error=>error instanceof support.SupportError&&error.code===code);

    const c=await open(),initial=(await inspect(c.id)).messages[0].id,a=await assignee(c.id),cView=(await inspect(c.id)).conversation;
    assert.equal((await userAttentionFeed(owner)).items.length,0,'Internal assignment is not a customer alert');
    assert.equal((await ownerView(c.id)).agentJoined,false);
    assert.equal((await ownerView(c.id)).assignedUserName,null,'Older customer clients cannot announce an internal assignee');
    assert.equal((await ownerView(c.id)).staffReplyDueAt,null,'Internal target is not exposed as a customer promise');
    assert.equal((await state(c.id)).awaiting_staff_since,t);
    assert.equal((await ownerView(c.id)).replyState,'overdue');
    await support.acknowledgeSupportRead(a,c.id,{messageId:initial,publicRef:c.publicRef},t+1);
    assert.equal((await ownerView(c.id)).agentJoined,false,'Visible read never implicitly joins');
    const beforeDenied=await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(c.id);
    await rejected(()=>support.postSupportMessage(a,c.id,{audience:'reply',message:'Denied before Join',idempotencyKey:key()},t+2),'join_required');
    await rejected(()=>support.postSupportMessage(admin,c.id,{audience:'reply',message:'Manager cannot speak for assignee',idempotencyKey:key()},t+2),'join_required');
    assert.deepEqual(await db.prepare('SELECT COUNT(*) n FROM support_messages WHERE conversation_id=?').get(c.id),beforeDenied);
    await rejected(()=>support.joinSupportConversation(admin,c.id,{publicRef:c.publicRef,assignmentEpoch:cView.readEpoch},t),'unassigned');
    await rejected(()=>support.joinSupportConversation(owner,c.id,{publicRef:c.publicRef,assignmentEpoch:cView.readEpoch},t),'forbidden');
    await rejected(()=>support.joinSupportConversation(a,c.id,{publicRef:'SUP-WRONG',assignmentEpoch:cView.readEpoch},t),'conversation_changed');
    await rejected(()=>support.joinSupportConversation(a,c.id,{publicRef:c.publicRef,assignmentEpoch:'0'},t),'conversation_changed');
    await rejected(()=>support.postSupportMessage(admin,c.id,{audience:'note',message:'Private note is unavailable',idempotencyKey:key()},t+3),'invalid_audience');
    assert.equal((await state(c.id)).awaiting_staff_since,t);
    const joins=await Promise.all([support.joinSupportConversation(a,c.id,{publicRef:c.publicRef,assignmentEpoch:cView.readEpoch},t+4),support.joinSupportConversation(a,c.id,{publicRef:c.publicRef,assignmentEpoch:cView.readEpoch},t+4)]);
    assert.equal(joins.filter(x=>!x.duplicate).length,1);
    assert.equal((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND event_type='joined'").get(c.id)).n,1);
    assert.equal((await userAttentionFeed(owner)).items.filter(x=>x.kind==='joined').length,1);
    assert.equal((await ownerView(c.id)).agentJoined,true);
    assert.equal((await ownerView(c.id)).assignedUserName,a.name);
    assert.equal((await state(c.id)).awaiting_staff_since,t,'Join does not reset unanswered work');
    await support.postSupportMessage(owner,c.id,{message:'More detail does not restart target',idempotencyKey:key()},t+5);
    assert.equal((await state(c.id)).awaiting_staff_message_id,initial);
    assert.equal((await support.sweepSupportReplyOverdue(t+target-1)).notified,0);
    assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,1);
    assert.deepEqual((await alerts(c.id)).map(x=>x.user_id).sort((x,y)=>x-y),[admin.id,manager.id,a.id].sort((x,y)=>x-y));
    assert.equal((await userAttentionFeed(owner)).items.some(x=>x.kind==='reply_overdue'),false);
    assert.equal((await userAttentionFeed(owner)).items.some(x=>x.kind==='reply_overdue'),false);
    assert.equal((await support.sweepSupportReplyOverdue(t+target)).notified,0);
    const replyKey=key();await reply(c.id,t+target+1,replyKey);
    assert.equal((await state(c.id)).awaiting_staff_since,null);assert.equal((await state(c.id)).awaiting_staff_message_id,null);
    assert.equal((await state(c.id)).awaiting_participant_since,t+target+1);
    assert.equal((await inspect(c.id)).conversation.replyState,'waiting_customer');
    assert.equal((await userAttentionFeed(a)).items.some(x=>x.kind==='reply_overdue'),false,'Answered cycle disappears from feed');
    const next=await support.postSupportMessage(owner,c.id,{message:'A new unanswered cycle',idempotencyKey:key()},t+target+2);
    const nextBefore=await state(c.id);await reply(c.id,t+target+3,replyKey);
    assert.deepEqual(await state(c.id),nextBefore,'Idempotent staff retry never clears a later participant cycle');
    await support.postSupportMessage(owner,c.id,{message:'Another detail',idempotencyKey:key()},t+target+4);
    assert.equal((await state(c.id)).awaiting_staff_message_id,next.id);
    assert.equal((await support.sweepSupportReplyOverdue(t+2*target+2)).notified,1);
    assert.equal((await alerts(c.id)).length,6,'Future cycles escalate normally after the previous marker');

    const oldEpoch=(await inspect(c.id)).conversation.readEpoch;
    const replacement=a.id===agent.id?other:agent;
    await support.reassignSupportConversation(admin,c.id,replacement.id,t+2*target+3);
    assert.equal((await state(c.id)).awaiting_staff_message_id,next.id,'Assignment preserves staff deadline');
    assert.equal((await inspect(c.id)).conversation.agentJoined,false);
    await rejected(()=>support.joinSupportConversation(replacement,c.id,{publicRef:c.publicRef,assignmentEpoch:oldEpoch},t),'conversation_changed');
    assert.equal((await userAttentionFeed(owner)).items.some(x=>x.kind==='joined'&&x.destination.id===c.id),false,'Old assignment Join is not replayed');
    assert.equal((await userAttentionFeed(a)).items.some(x=>x.kind==='reply_overdue'),false,'Previous assignee loses overdue access');
    await join(c.id,t+2*target+4);await db.prepare('UPDATE support_agent_settings SET enabled=0 WHERE user_id=?').run(replacement.id);
    await reply(c.id,t+2*target+5); // Pausing new work never blocks the existing assignee.
    const afterLateReply=await support.getSupportConversation(owner,c.id);
    assert.ok(afterLateReply.messages.length>0,'The active transcript remains visible after a later reply');
    const pausedMsg=await support.postSupportMessage(owner,c.id,{message:'Current paused agent still owns this request',idempotencyKey:key()},t+2*target+6);
    assert.equal((await support.sweepSupportReplyOverdue(t+3*target+6)).notified,1);
    assert.ok((await alerts(c.id)).some(x=>x.user_id===replacement.id&&x.source_key.startsWith(`support-reply-overdue:${c.id}:${pausedMsg.id}:`)));
    await support.reassignSupportConversation(admin,c.id,null,t+3*target+7);
    await support.postSupportMessage(owner,c.id,{message:'Unassigned cycle still needs a reply',idempotencyKey:key()},t+3*target+8);
    assert.equal((await state(c.id)).awaiting_staff_message_id,pausedMsg.id);
    await support.closeSupportConversation(owner,c.id,t+3*target+9);
    assert.equal((await state(c.id)).resolved_at,null);assert.equal((await state(c.id)).awaiting_staff_since,null);
    await rejected(async()=>support.joinSupportConversation(admin,c.id,{publicRef:c.publicRef,assignmentEpoch:(await inspect(c.id)).conversation.readEpoch},t),'closed');
    await support.closeSupportConversation(admin,c.id,t+3*target+10);
    assert.equal((await state(c.id)).resolved_at,t+3*target+10);

    const own=await support.createSupportConversation(owner,{subject:'Technical request',message:'Initial owner message',idempotencyKey:key()},t);
    assert.equal((await support.getSupportConversation(owner,own.id)).conversation.assignedUserName,null);
    assert.equal((await support.getSupportConversation(owner,own.id)).conversation.staffReplyDueAt,null);
    const ownAgent=await reply(own.id,t+1);
    assert.ok(ownAgent.id);
    const ownNew=await support.postSupportMessage(owner,own.id,{message:'Owner needs another reply',idempotencyKey:key()},t+2);
    assert.equal((await state(own.id)).awaiting_staff_message_id,ownNew.id);
    await rejected(()=>support.postSupportMessage(foreign,own.id,{message:'Foreign tenant',idempotencyKey:key()},t),'not_found');
    await support.closeSupportConversation(await assignee(own.id),own.id,t+3);assert.equal((await state(own.id)).resolved_at,t+3,'The assigned agent can resolve business support');
    await support.reopenSupportConversation(owner,own.id,t+4);assert.equal((await state(own.id)).awaiting_staff_since,null,'Reopen alone does not invent an unanswered message');
    assert.equal((await inspect(own.id)).conversation.agentJoined,false);
    await support.closeSupportConversation(owner,own.id,t+5);assert.equal((await state(own.id)).resolved_at,null,'Owner End remains unresolved');

    const claimed=await open();await support.reassignSupportConversation(admin,claimed.id,null,t+1);
    await support.claimSupportConversation(agent,claimed.id,t+2);
    assert.equal((await inspect(claimed.id)).conversation.agentJoined,false,'Claim does not join');
    assert.equal((await ownerView(claimed.id)).assignedUserName,null);
    await support.closeSupportConversation(admin,claimed.id,t+3);

    // An unassigned request escalates only to managers, without assigning or joining.
    const waitingStartedAt=Date.now()-unassignedTarget-1_000;
    const waiting=await open(waitingStartedAt);await support.reassignSupportConversation(admin,waiting.id,null,waitingStartedAt+1);
    const waitingBefore=await state(waiting.id);assert.equal((await support.sweepSupportReplyOverdue(waitingStartedAt+target)).notified,0,'Unassigned work is not overdue at the assigned-staff target');
    assert.equal((await support.sweepSupportReplyOverdue(waitingStartedAt+unassignedTarget)).notified,1);
    assert.deepEqual((await alerts(waiting.id)).map(x=>x.user_id),[admin.id,manager.id]);
    assert.equal((await state(waiting.id)).assigned_user_id,null);assert.equal((await state(waiting.id)).awaiting_staff_since,waitingBefore.awaiting_staff_since);
    const needs=(await support.listSupportConversations(admin,{status:'overdue',queue:'support'})).items;assert.ok(needs.some(x=>x.id===waiting.id));
    assert.equal((await support.listSupportConversations(foreign,{status:'overdue',queue:'support'})).items.some(x=>x.id===waiting.id),false);

    // Keep notification authorization tied to the active business case and assignee.
    const stale=await open(),staleAgent=await assignee(stale.id);
    const pair=crypto.createECDH('prime256v1');pair.generateKeys();
    const subscription={kind:'web',subscription:{endpoint:'https://fcm.googleapis.com/fcm/send/response-fixture',keys:{p256dh:pair.getPublicKey().toString('base64url'),auth:crypto.randomBytes(16).toString('base64url')}}};
    let sent=0;
    const countSend=async()=>{sent++;return {state:'accepted' as const};};
    const current=await support.createSupportConversation(owner,{subject:'Current owner request',message:'Support join notification',idempotencyKey:key()},t);
    await db.prepare("INSERT INTO attention_subscriptions(recipient_key,kind,endpoint_hash,subscription_json,created_at) VALUES(?,'web',?,?,?)")
      .run(`user:${owner.id}`,key(),JSON.stringify(subscription),t);
    await join(current.id,t+1);
    await dispatchAttention({send:countSend});
    assert.equal(sent,1,'An explicit current Join dispatches for an eligible owner');
    const cycle=(await state(stale.id)).awaiting_staff_message_id;
    const staffSub=(await db.prepare("INSERT INTO attention_subscriptions(recipient_key,kind,endpoint_hash,subscription_json,created_at) VALUES(?,'web',?,?,?)").run(`user:${staleAgent.id}`,key(),JSON.stringify(subscription),t)).insertedId;
    void staffSub;await support.sweepSupportReplyOverdue(t+target);
    assert.ok((await alerts(stale.id)).some(x=>x.source_key.startsWith(`support-reply-overdue:${stale.id}:${cycle}:`)));
    await reply(stale.id,t+target+1);
    let overdueSends=0;
    const dispatched=await dispatchAttention({send:async(_subscription,payload)=>{if(payload.body==='A chat is overdue for a reply.')overdueSends++;return {state:'accepted'};}});
    assert.ok(dispatched.ignored>=1);
    assert.equal(overdueSends,0,'Answered overdue must not dispatch; a normal public reply may still notify');

    // Fresh-role fences do not trust an already issued staff identity.
    await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(staleAgent.id);
    await rejected(async()=>support.joinSupportConversation(staleAgent,stale.id,{publicRef:stale.publicRef,assignmentEpoch:(await inspect(stale.id)).conversation.readEpoch},t),'forbidden');
    await rejected(()=>support.closeSupportConversation(staleAgent,stale.id,t),'not_found');
    await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(staleAgent.id);
    await support.closeSupportConversation(admin,stale.id,t+target+2);
    await support.closeSupportConversation(admin,waiting.id,t+target+2);

    // No authorized recipient means durable pending work, recovered when a manager returns.
    const noRecipient=await open();await support.reassignSupportConversation(admin,noRecipient.id,null,t+1);
    await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id IN (?,?)").run(admin.id,manager.id);
    assert.equal((await support.sweepSupportReplyOverdue(t+unassignedTarget)).notified,0);assert.equal((await state(noRecipient.id)).overdue_notified_message_id,null);
    await db.prepare("UPDATE user_access_profiles SET access_role='platform_admin' WHERE user_id=?").run(admin.id);
    await db.prepare("UPDATE user_access_profiles SET access_role='operations_manager' WHERE user_id=?").run(manager.id);
    const parallel=await Promise.all([support.sweepSupportReplyOverdue(t+unassignedTarget),support.sweepSupportReplyOverdue(t+unassignedTarget)]);
    assert.equal(parallel.reduce((sum,result)=>sum+result.notified,0),1);assert.equal((await alerts(noRecipient.id)).length,2);
    await support.closeSupportConversation(admin,noRecipient.id,t+target+1);

    const settings=()=>db.prepare("SELECT pg_backend_pid() pid,current_setting('statement_timeout') statement,current_setting('idle_in_transaction_session_timeout') idle,current_setting('lock_timeout') lock").get();
    const beforeSettings=await settings();await db.runner.transaction(async()=>{await support.sweepSupportReplyOverdue(t);const current=await settings();assert.equal(current.idle,'5s');assert.equal(current.lock,'50ms');});assert.deepEqual(await settings(),beforeSettings);
    const rollback=await open(),rollbackBefore=await state(rollback.id);
    await db.exec(`CREATE FUNCTION fail_response_alert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.kind='reply_overdue' THEN RAISE EXCEPTION 'fixture overdue alert unavailable'; END IF; RETURN NEW; END $$;CREATE TRIGGER fail_response_alert BEFORE INSERT ON attention_notifications FOR EACH ROW EXECUTE FUNCTION fail_response_alert()`);
    await assert.rejects(()=>support.sweepSupportReplyOverdue(t+target),/fixture overdue alert unavailable/);
    assert.deepEqual(await state(rollback.id),rollbackBefore);assert.equal((await alerts(rollback.id)).length,0);assert.deepEqual(await settings(),beforeSettings);
    await db.exec('DROP TRIGGER fail_response_alert ON attention_notifications;DROP FUNCTION fail_response_alert()');
    const pool=createPostgresPool({...postgresRuntimeConfig(process.env)!,poolMax:1}),blocker=await pool.connect();
    try{await blocker.query('BEGIN');await blocker.query("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");assert.deepEqual(await support.sweepSupportReplyOverdue(t+target),{notified:0,skippedBusy:true});await blocker.query('ROLLBACK');}finally{blocker.release();await pool.end();}
    await support.sweepSupportReplyOverdue(t+target);await support.closeSupportConversation(admin,rollback.id,t+target+1);
    for(let i=0;i<28;i++)await open();
    assert.equal((await support.sweepSupportReplyOverdue(t+target,()=>0)).notified,25);assert.equal((await support.sweepSupportReplyOverdue(t+target,()=>0)).notified,3);
    for(let i=0;i<3;i++)await open();let ticks=-1000;assert.equal((await support.sweepSupportReplyOverdue(t+target,()=>ticks+=1000)).notified,1);
    assert.deepEqual(await settings(),beforeSettings);
    const plan=await db.prepare(`EXPLAIN ${support.SUPPORT_REPLY_OVERDUE_QUERY}`).all(t+target-target);assert.ok(JSON.stringify(plan).length>0);
    console.log('PASS S162 real PostgreSQL response/join contract: 2-minute assigned and10-minute unassigned boundaries, first/next oldest anchor, Join-before-public-reply, read/Claim/assignment non-join, notes/joins preserve clock, current epoch/role/tenant fences, all-queue staff resolution, owner End/reopen semantics, recipient/stale feed+delivery privacy, legacy suppression, exact-once/concurrency, no-recipient recovery, batch/budget/trylock/rollback and LOCAL timeout restoration.');
  } finally {await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
