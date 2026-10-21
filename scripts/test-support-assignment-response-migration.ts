import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
import {removeEmptyTrackingSchema} from './testing/tracking-migration-compat';
import {supportAssignmentReplyDueAt,supportReplyOverdueSource,SUPPORT_STAFF_REPLY_TARGET_MS} from '../lib/support-assignment-response';

function policy(){
 const t=1_800_000_000_000,target=10*60_000;
 assert.equal(SUPPORT_STAFF_REPLY_TARGET_MS,target);
 assert.equal(supportAssignmentReplyDueAt(t,null),t+target);
 assert.equal(supportAssignmentReplyDueAt(t,t-1),t+target);
 assert.equal(supportAssignmentReplyDueAt(t,t+100),t+100+target);
 assert.equal(supportAssignmentReplyDueAt(t+100,t),t+100+target);
 assert.equal(supportAssignmentReplyDueAt(null,t),null);
 assert.equal(supportAssignmentReplyDueAt(t,NaN),null);
 assert.equal(supportAssignmentReplyDueAt(8_640_000_000_000_000,null),null);
 assert.equal(supportReplyOverdueSource(1,2,3),'support-reply-overdue:1:2:3');
 assert.equal(supportReplyOverdueSource(1,2,0),'support-reply-overdue:1:2:0');
 for(const invalid of [NaN,-1,1.2])assert.throws(()=>supportReplyOverdueSource(1,2,invalid));
 console.log('PASS S126 pure assignment-aware10-minute deadline and epoch-scoped escalation identity.');
}
async function main(){
 policy();if(process.argv.includes('--pure'))return;
 const db=await getDb(),t=1_800_000_000_000;
 try{
  const schema=(await db.prepare('SELECT current_schema() name').get()).name as string;
  await removeEmptyTrackingSchema(db);
  await db.exec(`DROP TABLE support_transport_plans;DROP INDEX support_transport_plan_events_latest;
   ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
   ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(event_type IN
    ('created','assigned','reassigned','message','closed','reopened','transport_handoff','joined','idle_ended'));
   DROP TABLE attention_email_deliveries;ALTER TABLE support_conversations DROP COLUMN overdue_notified_assignment_id;DELETE FROM schema_migrations WHERE version IN (69,70)`);
  const user=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('assignment-migration@example.test','unused','Assignment migration','admin',0)").run()).insertedId;
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'operations_manager')").run(user);
  async function conversation(status:'open'|'waiting',marked:boolean,hasAssignment=true){
   const id=(await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,
    requester_label,visitor_phone,subject,status,assigned_user_id,created_at,updated_at,last_message_at)
    VALUES(?,'visitor',?,?,'shipment_observation','Migration fixture','+447700900999','Retained request',?,?,?,?,?)`).run('SUP-'+crypto.randomBytes(6).toString('hex'),crypto.randomUUID(),t+1_000_000,status,status==='open'?user:null,t,t,t)).insertedId;
   const message=(await db.prepare(`INSERT INTO support_messages(conversation_id,sender_kind,sender_key,body,idempotency_key,created_at,sender_side)
    VALUES(?,'visitor',?,'Retained customer text',?,?,'participant')`).run(id,'visitor:'+id,crypto.randomUUID(),t)).insertedId;
   await db.prepare('UPDATE support_conversations SET awaiting_staff_since=?,awaiting_staff_message_id=?,overdue_notified_message_id=? WHERE id=?').run(t,message,marked?message:null,id);
   let assignment=0;
   if(status==='open'&&hasAssignment)assignment=(await db.prepare("INSERT INTO support_assignments(conversation_id,assigned_user_id,reason,assigned_at) VALUES(?,?,'automatic',?)").run(id,user,t+100)).insertedId;
   return {id,message,assignment,marked};
  }
  const cases=[await conversation('open',true),await conversation('waiting',true),await conversation('open',false),await conversation('open',true,false)];
  const oldAlert=(await db.prepare("INSERT INTO attention_notifications(source_key,recipient_key,user_id,conversation_id,kind,created_at) VALUES(?,?,?,?,'reply_overdue',?)").run(`support-reply-overdue:${cases[0].id}:${cases[0].message}`,`user:${user}`,user,cases[0].id,t)).insertedId;
  const snapshot=async()=>({cases:await db.prepare("SELECT to_jsonb(c)-'overdue_notified_assignment_id' value FROM support_conversations c ORDER BY id").all(),messages:await db.prepare('SELECT * FROM support_messages ORDER BY id').all(),assignments:await db.prepare('SELECT * FROM support_assignments ORDER BY id').all(),events:await db.prepare('SELECT * FROM support_events ORDER BY id').all(),attention:await db.prepare('SELECT * FROM attention_notifications ORDER BY id').all()});
  const before=await snapshot(),sentinel=Error('Fixture69 rollback');
  await assert.rejects(()=>db.runner.transaction(async()=>{assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[69,70,71,72,73,74,75]);throw sentinel;}),error=>error===sentinel);
  assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations WHERE version<=75').get()).version,68);
  assert.equal((await db.prepare("SELECT to_regclass('attention_email_deliveries') value").get()).value,null);assert.deepEqual(await snapshot(),before);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[69,70,71,72,73,74,75]);assert.deepEqual(await snapshot(),before);
  for(const c of cases)assert.equal((await db.prepare('SELECT overdue_notified_assignment_id value FROM support_conversations WHERE id=?').get(c.id)).value,c.marked?c.assignment:null);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM attention_email_deliveries').get()).n,0,'Legacy notifications create no catch-up email jobs');
  const after=await db.prepare('SELECT * FROM support_conversations ORDER BY id').all();assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);assert.deepEqual(await db.prepare('SELECT * FROM support_conversations ORDER BY id').all(),after);
  await db.prepare('INSERT INTO attention_email_deliveries(notification_id,created_at,next_attempt_at,expires_at) VALUES(?,?,?,?)').run(oldAlert,t,t,t+24*60*60_000);
  await assert.rejects(()=>db.prepare('INSERT INTO attention_email_deliveries(notification_id,created_at,next_attempt_at,expires_at) VALUES(?,?,?,?)').run(oldAlert,t,t,t+1),/unique constraint/);
  await assert.rejects(()=>db.prepare('UPDATE attention_email_deliveries SET attempts=7').run(),/check constraint/);
  await assert.rejects(()=>db.prepare("UPDATE attention_email_deliveries SET state='invalid'").run(),/check constraint/);
  await assert.rejects(()=>db.prepare('UPDATE support_conversations SET overdue_notified_assignment_id=-1 WHERE id=?').run(cases[0].id),/check constraint/);
  const columns=await db.prepare("SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='attention_email_deliveries'").all();
  assert.deepEqual(columns.map(row=>row.column_name).sort(),['id','notification_id','state','attempts','created_at','next_attempt_at','lease_until','expires_at','accepted_at','error_category'].sort());
  assert.equal((await db.prepare("SELECT relrowsecurity value FROM pg_class WHERE oid='attention_email_deliveries'::regclass").get()).value,true);
  for(const role of ['anon','authenticated'])if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role)){
   assert.equal((await db.prepare("SELECT has_table_privilege(?,current_schema()||'.attention_email_deliveries','SELECT') value").get(role)).value,false);
   assert.equal((await db.prepare("SELECT has_sequence_privilege(?,current_schema()||'.attention_email_deliveries_id_seq','USAGE') value").get(role)).value,false);
  }
  assert.ok((await db.prepare("SELECT indexdef FROM pg_indexes WHERE schemaname=current_schema() AND indexname='attention_email_delivery_due'").get()).indexdef.includes('next_attempt_at, id'));
  await db.prepare('DELETE FROM attention_notifications WHERE id=?').run(oldAlert);assert.equal((await db.prepare('SELECT COUNT(*) n FROM attention_email_deliveries').get()).n,0);
  console.log('PASS S126 isolated68→69 assignment marker/outbox migration: already-notified active epoch/queue backfill without mail, preserved original anchors/history/notifications, private RLS/role grants, unique FK/cascade, bounded enum/attempts, rollback/no-op and due index.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
