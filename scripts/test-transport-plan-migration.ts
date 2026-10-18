import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
import {removeEmptyTrackingSchema} from './testing/tracking-migration-compat';

async function main(){
 const db=await getDb();
 try{
  const schema=(await db.prepare('SELECT current_schema() value').get()).value as string;assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
  await removeEmptyTrackingSchema(db);
  await db.exec(`DROP TABLE support_transport_plans;DROP INDEX support_transport_plan_events_latest;
   ALTER TABLE support_events DROP CONSTRAINT ck_support_events_1;
   ALTER TABLE support_events ADD CONSTRAINT ck_support_events_1 CHECK(event_type IN ('created','assigned','reassigned','message','closed','reopened','transport_handoff','joined','idle_ended'));
   DELETE FROM schema_migrations WHERE version=70`);
  const user=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('migration-plan@example.test','unused','Migration fixture','admin',0)").run()).insertedId;
  const request=async(ref:string)=>(await db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,requester_label,visitor_phone,subject,status,created_at,updated_at,last_message_at)
   VALUES(?,'visitor',?,1800000000000,'shipment_observation','Retained private requester','+447700900999','Retained private goods','closed',1,2,3)`).run(ref,crypto.randomUUID())).insertedId;
  const conversation=await request('SUP-S137-MIGRATION'),other=await request('SUP-S137-OTHER');
  await db.prepare("INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,'transport_handoff',?,4)").run(conversation,user,JSON.stringify({company:'Retained private company',contact:'Retained private contact'}));
  await db.prepare("INSERT INTO support_messages(conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,sender_side) VALUES(?,?,'user',?,'Retained private note',?,3,'staff')").run(conversation,user,'user:'+user,crypto.randomUUID());
  const snapshot=async()=>({cases:await db.prepare('SELECT * FROM support_conversations ORDER BY id').all(),messages:await db.prepare('SELECT * FROM support_messages ORDER BY id').all(),assignments:await db.prepare('SELECT * FROM support_assignments ORDER BY id').all(),events:await db.prepare('SELECT * FROM support_events ORDER BY id').all(),attention:await db.prepare('SELECT * FROM attention_notifications ORDER BY id').all(),users:await db.prepare('SELECT * FROM users ORDER BY id').all()});
  const before=await snapshot(),sentinel=Error('Fixture transport migration rollback');
  await assert.rejects(()=>db.runner.transaction(async()=>{assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[70,71,72]);throw sentinel;}),error=>error===sentinel);
  assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version,69);assert.equal((await db.prepare("SELECT to_regclass('support_transport_plans') value").get()).value,null);assert.deepEqual(await snapshot(),before);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[70,71,72]);assert.deepEqual(await snapshot(),before);assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_transport_plans').get()).n,0,'No private legacy plan is backfilled from private handoff/intake');
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);assert.deepEqual(await snapshot(),before);
  const legs=[{id:crypto.randomUUID(),providerName:'Explicit public provider',origin:'Origin',destination:'Destination',method:'truck'}],nonce='a'.repeat(64),hash='b'.repeat(64);
  await db.prepare('INSERT INTO support_transport_plans(conversation_id,version,legs,share_nonce,share_token_hash,updated_by_user_id,updated_at) VALUES(?,1,?::jsonb,?,?,?,4)').run(conversation,JSON.stringify(legs),nonce,hash,user);
  for(const bad of[0,-1])await assert.rejects(()=>db.prepare('UPDATE support_transport_plans SET version=? WHERE conversation_id=?').run(bad,conversation),/check constraint/);
  for(const bad of[[],{},Array.from({length:13},()=>legs[0]),[{...legs[0],providerName:'x'.repeat(25000)}]])await assert.rejects(()=>db.prepare('UPDATE support_transport_plans SET legs=?::jsonb WHERE conversation_id=?').run(JSON.stringify(bad),conversation),/check constraint|cannot get array length/);
  await assert.rejects(()=>db.prepare("UPDATE support_transport_plans SET share_nonce='bad' WHERE conversation_id=?").run(conversation),/check constraint/);
  await assert.rejects(()=>db.prepare("UPDATE support_transport_plans SET share_token_hash='bad' WHERE conversation_id=?").run(conversation),/check constraint/);
  await assert.rejects(()=>db.prepare('INSERT INTO support_transport_plans(conversation_id,version,legs,share_nonce,share_token_hash,updated_at) VALUES(?,1,?::jsonb,?,?,5)').run(other,JSON.stringify(legs),nonce,hash),/unique constraint/);
  await assert.rejects(()=>db.prepare('INSERT INTO support_transport_plans(conversation_id,version,legs,share_nonce,share_token_hash,updated_at) VALUES(999999999,1,?::jsonb,?,?,5)').run(JSON.stringify(legs),nonce,'c'.repeat(64)),/foreign key constraint/);
  assert.equal((await db.prepare("SELECT relrowsecurity value FROM pg_class WHERE oid='support_transport_plans'::regclass").get()).value,true);
  const columns=await db.prepare("SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='support_transport_plans'").all();
  assert.deepEqual(columns.map(row=>row.column_name).sort(),['conversation_id','version','legs','share_nonce','share_token_hash','updated_by_user_id','updated_at'].sort());
  for(const role of['anon','authenticated','service_role'])if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role))for(const permission of['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'])assert.equal((await db.prepare("SELECT has_table_privilege(?,current_schema()||'.support_transport_plans',?) value").get(role,permission)).value,false);
  for(const role of['suqpage_runtime','mirtpage_runtime'])if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role)){
   assert.equal((await db.prepare("SELECT has_table_privilege(?,current_schema()||'.support_transport_plans','SELECT,INSERT,UPDATE,DELETE') value").get(role)).value,true);
   assert.ok(await db.prepare("SELECT 1 FROM pg_policies WHERE schemaname=current_schema() AND tablename='support_transport_plans' AND ?::name=ANY(roles)").get(role));
  }
  assert.ok((await db.prepare("SELECT indexdef FROM pg_indexes WHERE schemaname=current_schema() AND indexname='support_transport_plan_events_latest'").get()).indexdef.includes('conversation_id, id DESC'));
  for(const event of['transport_plan_updated','transport_plan_link_replaced'])await db.prepare('INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,?,\'{}\',5)').run(conversation,user,event);
  await assert.rejects(()=>db.prepare("INSERT INTO support_events(conversation_id,event_type,detail,created_at) VALUES(?,'unsupported_plan_event','{}',5)").run(conversation),/check constraint/);
  await db.prepare('DELETE FROM support_conversations WHERE id=?').run(conversation);assert.equal((await db.prepare('SELECT COUNT(*) n FROM support_transport_plans').get()).n,0,'Deletion follows the original request lifecycle without orphaned capabilities');
  console.log('PASS S137 isolated69→70: private JSON aggregate, stable lookup uniqueness/FKs/bounds, runtime-only RLS/grants, additive audited-event enum/index, no backfill, exact legacy preservation, rollback and no-op replay.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
