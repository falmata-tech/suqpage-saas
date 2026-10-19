import assert from 'node:assert/strict';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
import {removeEmptyTrackingSchema} from './testing/tracking-migration-compat';
import {supportIdleEndEvidence,type SupportIdleEndEvidence} from '../lib/support-idle-evidence';

async function main(){
 const db=await getDb();
 try{
  const schema=(await db.prepare('SELECT current_schema() name').get()).name as string;
  await removeEmptyTrackingSchema(db);
  await db.exec(`DROP TABLE support_transport_plans;DROP INDEX support_transport_plan_events_latest;
   DROP TABLE attention_email_deliveries;
   ALTER TABLE support_conversations DROP COLUMN overdue_notified_assignment_id;
   DROP INDEX support_idle_end_evidence_latest;
   ALTER TABLE support_conversations DROP CONSTRAINT support_resolution_check;
   ALTER TABLE support_conversations ADD CONSTRAINT support_resolution_check CHECK(resolved_at IS NULL OR
    (status='closed' AND assistance_category IN ('buying_assistance','shipment_observation')));
   ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
   ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(event_type IN
    ('created','assigned','reassigned','message','closed','reopened','transport_handoff','joined'));
   DELETE FROM schema_migrations WHERE version IN (68,69,70)`);
  const id=(await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,
   requester_label,visitor_email,visitor_phone,subject,status,created_at,updated_at,last_message_at)
   VALUES('SUP-S125-MIGRATION68','visitor','migration68-token',1800000000000,'general','Retained fixture','fixture@example.test','+447700900999','Technical case','closed',1,2,3)`).run()).insertedId;
  await db.prepare("INSERT INTO support_events(conversation_id,event_type,detail,created_at) VALUES(?,'closed','Retained old end',4)").run(id);
  const snapshot=async()=>({cases:await db.prepare("SELECT to_jsonb(c)-'overdue_notified_assignment_id' value FROM support_conversations c ORDER BY id").all(),events:await db.prepare('SELECT * FROM support_events ORDER BY id').all()});
  const before=await snapshot(),sentinel=Error('Fixture migration68 rollback');
  await assert.rejects(()=>db.runner.transaction(async()=>{assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[68,69,70,71,72,73,74,75]);throw sentinel;}),error=>error===sentinel);
  assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations WHERE version<=75').get()).version,67);assert.deepEqual(await snapshot(),before);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[68,69,70,71,72,73,74,75]);assert.deepEqual(await snapshot(),before);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
  await db.prepare('UPDATE support_conversations SET resolved_at=5 WHERE id=?').run(id);
  await assert.rejects(()=>db.prepare("UPDATE support_conversations SET status='open' WHERE id=?").run(id),/support_resolution_check/);
  const record:SupportIdleEndEvidence={version:1,reason:'participant_no_reply',endedAt:2_000_000,waitingSince:0,windowMs:30*60_000,
   lastPublicStaffReply:{id:2,sentAt:0},latestParticipantMessage:{id:1,sentAt:0},lastReplyConfirmedReadAtEnding:false};
  assert.deepEqual(supportIdleEndEvidence(JSON.stringify(record)),record);
  for(const bad of ['{broken',{},null,{...record,version:2},{...record,reason:'unproved-blame'},{...record,lastPublicStaffReply:null},
   {...record,lastReplyConfirmedReadAtEnding:'yes'},{...record,endedAt:1},{...record,windowMs:10},{...record,privateContact:'secret'},
   {...record,lastPublicStaffReply:{id:2,sentAt:1}},{...record,latestParticipantMessage:{id:3,sentAt:0}},
   {...record,latestParticipantMessage:{id:1,sentAt:1}},{...record,endedAt:9_000_000_000_000_000}])assert.equal(supportIdleEndEvidence(bad),null);
  await db.prepare("INSERT INTO support_events(conversation_id,event_type,detail,created_at) VALUES(?,'idle_ended',?,?)").run(id,JSON.stringify(record),record.endedAt);
  await assert.rejects(()=>db.prepare("INSERT INTO support_events(conversation_id,event_type,detail,created_at) VALUES(?,'unrecognized_event','invalid',5)").run(id),/check constraint/);
  const index=(await db.prepare("SELECT indexdef FROM pg_indexes WHERE schemaname=current_schema() AND indexname='support_idle_end_evidence_latest'").get()).indexdef as string;
  assert.ok(index.includes('conversation_id, id DESC'));assert.ok(index.includes("event_type = 'idle_ended'"));
  console.log('PASS S125 isolated schema67→68: closed-only resolution in either queue, additive idle_ended enum/index, preservation, rollback/no-op and strict versioned evidence decoding.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
