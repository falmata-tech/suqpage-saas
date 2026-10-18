import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {test} from 'node:test';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {dispatchSupportEscalationEmails} from '../lib/support-escalation-email-delivery';
import type {SupportEscalationEmail,SupportEscalationEmailPort} from '../lib/support-escalation-email';
import {supportReplyOverdueSource} from '../lib/support-assignment-response';

test('BE-050/DEP-043 S126 private escalation outbox uses isolated PostgreSQL leases and fresh authorization',{timeout:90000},async t=>{
 const db=await getDb(),now=Date.now(),anchor=now-20*60_000,previousApiKey=process.env.RESEND_API_KEY;
 delete process.env.RESEND_API_KEY; // No real provider can be selected by this suite.
 try{
  const addUser=async(name:string,role:string)=>{
   const id=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES(?,'unused',?,'admin',0)").run(`${name}@example.test`,name)).insertedId;
   await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);return id;
  };
  const admin=await addUser('email-admin','platform_admin'),ops=await addUser('email-ops','operations_manager'),agent=await addUser('email-agent','team_member');
  await db.prepare("INSERT INTO support_agent_settings(user_id,enabled,queue_scope,updated_at) VALUES(?,1,'transport',?)").run(agent,now);
  await db.prepare("INSERT INTO attention_preferences(recipient_key,language,updated_at) VALUES(?,'so',?)").run(`user:${admin}`,now);
  let ordinal=0;
  const seed=async(recipient=admin)=>{
   const id=(await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,
    requester_label,subject,status,assigned_user_id,visitor_phone,transport_origin,transport_destination,created_at,updated_at,last_message_at)
    VALUES(?,'visitor',?,?,'shipment_observation','PRIVATE REQUESTER CANARY','PRIVATE SUBJECT CANARY','open',?,'+447700900119','PRIVATE ORIGIN CANARY','PRIVATE DESTINATION CANARY',?,?,?)`).run(`SUP-MAIL${++ordinal}`,crypto.randomUUID(),now+7*24*60*60_000,agent,anchor,anchor,anchor)).insertedId;
   const message=(await db.prepare(`INSERT INTO support_messages(conversation_id,sender_kind,sender_key,body,idempotency_key,created_at,sender_side)
    VALUES(?,'visitor',?,'PRIVATE MESSAGE CANARY',?,?,'participant')`).run(id,`visitor:${id}`,crypto.randomUUID(),anchor)).insertedId;
   await db.prepare('UPDATE support_conversations SET awaiting_staff_since=?,awaiting_staff_message_id=? WHERE id=?').run(anchor,message,id);
   const assignment=(await db.prepare("INSERT INTO support_assignments(conversation_id,assigned_user_id,reason,assigned_at) VALUES(?,?,'automatic',?)").run(id,agent,anchor)).insertedId;
   const notification=(await db.prepare(`INSERT INTO attention_notifications(source_key,recipient_key,user_id,conversation_id,kind,created_at)
    VALUES(?,?,?,?,'reply_overdue',?)`).run(supportReplyOverdueSource(id,message,assignment),`user:${recipient}`,recipient,id,now)).insertedId;
   const delivery=(await db.prepare('INSERT INTO attention_email_deliveries(notification_id,created_at,next_attempt_at,expires_at) VALUES(?,?,?,?)').run(notification,now,now,now+24*60*60_000)).insertedId;
   return {id,message,assignment,notification,delivery};
  };
  const reset=async()=>{
   await db.prepare('DELETE FROM support_conversations').run();
   await db.prepare("UPDATE user_access_profiles SET access_role='platform_admin' WHERE user_id=?").run(admin);
   await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(agent);
   await db.prepare("UPDATE support_agent_settings SET queue_scope='transport',enabled=1 WHERE user_id=?").run(agent);
  };
  const state=(id:number)=>db.prepare('SELECT state,attempts,lease_until,accepted_at,error_category,next_attempt_at FROM attention_email_deliveries WHERE id=?').get(id);
  const run=(send:SupportEscalationEmailPort,at=now,limit=2)=>dispatchSupportEscalationEmails({send,now:at,limit,context:{origin:'https://suqpage.example'}});

  await t.test('missing configuration is observable and does not consume a durable attempt',async()=>{
   const item=await seed(),before=await state(item.delivery);const result=await dispatchSupportEscalationEmails({now,mode:'resend'});
   assert.equal(result.configured,false);assert.equal(result.processed,0);assert.deepEqual(await state(item.delivery),before);await reset();
  });
  await t.test('bounded batch reads canonical recipient language and staff facts without customer data',async()=>{
   const first=await seed(),second=await seed(ops),third=await seed();
   await db.prepare("UPDATE users SET email='updated-email-admin@example.test' WHERE id=?").run(admin);
   await db.prepare('UPDATE attention_notifications SET read_at=? WHERE id=?').run(now,first.notification);
   await db.prepare('UPDATE support_agent_settings SET enabled=0 WHERE user_id=?').run(agent);
   const sent:SupportEscalationEmail[]=[];const result=await run(async email=>{sent.push(email);return {state:'accepted'};},now,999);
   assert.equal(result.accepted,2);assert.equal(sent.length,2);assert.equal(sent[0].recipientEmail,'updated-email-admin@example.test');assert.equal(sent[0].language,'en','Inactive stored preference renders English');assert.equal((await db.prepare('SELECT language FROM attention_preferences WHERE recipient_key=?').get(`user:${admin}`))?.language,'so','No stored preference rewrite');assert.equal(sent[1].language,'en');
   assert.equal((await state(first.delivery)).state,'accepted');assert.equal((await state(second.delivery)).state,'accepted');assert.equal((await state(third.delivery)).state,'pending');
   assert.doesNotMatch(JSON.stringify(sent),/PRIVATE|447700900119|sender|token|origin|destination/,'The provider payload must contain no customer content');
   assert.equal((await state(first.delivery)).attempts,1);assert.ok((await state(first.delivery)).accepted_at>=now);await reset();
  });
  await t.test('answered, ended, resolved, reassigned and unauthorized work never sends a stale email',async()=>{
   const cases:Array<(item:Awaited<ReturnType<typeof seed>>)=>Promise<unknown>>=[
    item=>db.prepare('UPDATE support_conversations SET awaiting_staff_since=NULL,awaiting_staff_message_id=NULL WHERE id=?').run(item.id),
    item=>db.prepare("UPDATE support_conversations SET status='closed' WHERE id=?").run(item.id),
    item=>db.prepare("UPDATE support_conversations SET status='closed',resolved_at=? WHERE id=?").run(now,item.id),
    async item=>{await db.prepare('UPDATE support_assignments SET released_at=? WHERE id=?').run(now,item.assignment);await db.prepare("INSERT INTO support_assignments(conversation_id,assigned_user_id,reason,assigned_at) VALUES(?,?,'reassigned',?)").run(item.id,agent,now);},
    ()=>db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(admin),
    ()=>db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(agent),
    ()=>db.prepare("UPDATE support_agent_settings SET queue_scope='support' WHERE user_id=?").run(agent),
   ];
   for(const change of cases){const item=await seed();await change(item);let sends=0;const result=await run(async()=>{sends++;return {state:'accepted'};});assert.equal(sends,0);assert.equal(result.ignored,1);assert.equal((await state(item.delivery)).error_category,'no_longer_actionable');await reset();}
   const scoped=await seed(agent);const result=await run(async()=>{throw Error('A scoped agent must not receive escalation email');});assert.equal(result.ignored,1);assert.equal((await state(scoped.delivery)).state,'ignored');await reset();
  });
  await t.test('current assignment gets its own ten-minute reply window',async()=>{
   const item=await seed();await db.prepare('UPDATE support_assignments SET assigned_at=? WHERE id=?').run(now-60_000,item.assignment);
   let sends=0;const result=await run(async()=>{sends++;return {state:'accepted'};});assert.equal(sends,0);assert.equal(result.ignored,1);await reset();
  });
  await t.test('latest active matching assignment is authoritative even with later released legacy history',async()=>{
   const item=await seed();await db.prepare("INSERT INTO support_assignments(conversation_id,assigned_user_id,reason,assigned_at,released_at) VALUES(?,?,'reassigned',?,?)").run(item.id,agent,anchor+1000,anchor+2000);
   let sends=0;const result=await run(async()=>{sends++;return {state:'accepted'};});assert.equal(sends,1);assert.equal(result.accepted,1);assert.equal((await state(item.delivery)).state,'accepted');await reset();
  });
  await t.test('transient retry preserves the notification identity and missing config does not spend an attempt',async()=>{
   const item=await seed(),identities:number[]=[];let result=await run(async email=>{identities.push(email.notificationId);return {state:'failed',category:'provider_failure',retryable:true};});
   assert.equal(result.pending,1);const first=await state(item.delivery);assert.equal(first.attempts,1);assert.equal(first.error_category,'provider_failure');assert.equal(first.lease_until,null);
   result=await run(async email=>{identities.push(email.notificationId);return {state:'accepted'};},Number(first.next_attempt_at));assert.equal(result.accepted,1);assert.deepEqual(identities,[item.notification,item.notification]);assert.equal((await state(item.delivery)).attempts,2);await reset();
   const deferred=await seed();result=await run(async()=>({state:'deferred',category:'missing_configuration'}));assert.equal(result.pending,1);const pending=await state(deferred.delivery);assert.equal(pending.attempts,0);assert.equal(pending.state,'pending');assert.equal(pending.error_category,'missing_configuration');await reset();
  });
  await t.test('six attempts, expired jobs and interrupted final leases terminate without replay',async()=>{
   let item=await seed();await db.prepare('UPDATE attention_email_deliveries SET attempts=5 WHERE id=?').run(item.delivery);
   let result=await run(async()=>({state:'failed',category:'provider_failure',retryable:true}));assert.equal(result.failed,1);assert.equal((await state(item.delivery)).attempts,6);assert.equal((await state(item.delivery)).state,'failed');await reset();
   item=await seed();await db.prepare('UPDATE attention_email_deliveries SET expires_at=? WHERE id=?').run(now,item.delivery);
   let sends=0;result=await run(async()=>{sends++;return {state:'accepted'};});assert.equal(sends,0);assert.equal(result.ignored,1);assert.equal((await state(item.delivery)).error_category,'expired');await reset();
   item=await seed();await db.prepare("UPDATE attention_email_deliveries SET state='sending',attempts=6,lease_until=? WHERE id=?").run(now-1,item.delivery);
   result=await run(async()=>{throw Error('No seventh send');});assert.equal(result.failed,1);assert.equal((await state(item.delivery)).error_category,'retry_limit');await reset();
  });
  await t.test('concurrent workers own one lease and hold no DB transaction during provider work',async()=>{
   const item=await seed();let release!:()=>void,started!:()=>void;
   const ready=new Promise<void>(resolve=>{started=resolve;}),hold=new Promise<void>(resolve=>{release=resolve;});let sends=0;
   const first=run(async()=>{sends++;started();await hold;return {state:'accepted'};},now,1);await ready;
   try{const second=await run(async()=>{sends++;return {state:'accepted'};},now,1);assert.equal(second.processed,0);assert.equal(sends,1);
    assert.equal((await state(item.delivery)).state,'sending','A second DB operation is free while HTTP is pending');}
   finally{release();assert.equal((await first).accepted,1);}await reset();
  });
  await t.test('late completion cannot overwrite a newer lease or its accepted outcome',async()=>{
   const item=await seed();let release!:()=>void,started!:()=>void;const ready=new Promise<void>(resolve=>{started=resolve;}),hold=new Promise<void>(resolve=>{release=resolve;});
   const first=run(async()=>{started();await hold;return {state:'accepted'};},now,1);await ready;
   try{const second=await run(async()=>({state:'accepted'}),now+31_000,1);assert.equal(second.accepted,1);const accepted=await state(item.delivery);release();const late=await first;assert.equal(late.accepted,0);assert.equal(late.superseded,1);assert.deepEqual(await state(item.delivery),accepted);assert.equal(accepted.attempts,2);}
   finally{release();await first;}await reset();
  });
  await t.test('transaction-local query limits are restored and outbox records contain no address or body columns',async()=>{
   const before=await db.prepare("SELECT current_setting('statement_timeout') statement,current_setting('idle_in_transaction_session_timeout') idle,current_setting('lock_timeout') lock").get();
   await seed();await run(async()=>({state:'accepted'}));assert.deepEqual(await db.prepare("SELECT current_setting('statement_timeout') statement,current_setting('idle_in_transaction_session_timeout') idle,current_setting('lock_timeout') lock").get(),before);
   const columns=(await db.prepare("SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='attention_email_deliveries'").all()).map(row=>row.column_name);
   assert.doesNotMatch(columns.join(','),/address|email|body|secret|recipient/);await reset();
  });
 }finally{if(previousApiKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=previousApiKey;await closeDbForTests();}
});
