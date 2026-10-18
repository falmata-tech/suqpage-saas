import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
async function main(){
 const db=await getDb();
 try{
  const schema=(await db.prepare('SELECT current_schema() value').get()).value as string;assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
  const tables=['tracking_email_deliveries','tracking_events','tracking_shipments','tracking_sessions','tracking_challenges','tracking_recipients'];
  for(const table of tables)assert.equal((await db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()).n,0);for(const table of tables)await db.exec(`DROP TABLE ${table}`);await db.exec('DELETE FROM schema_migrations WHERE version IN (71,72)');
  const user=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('legacy-tracking@example.test','unused','Legacy test','admin',0)").run()).insertedId;
  const cid=(await db.prepare("INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,requester_label,visitor_phone,subject,status,created_at,updated_at,last_message_at) VALUES('SUP-S138-LEGACY','visitor',?,1800000000000,'shipment_observation','Private legacy requester','+447700900999','Private legacy goods','closed',1,2,3)").run(crypto.randomUUID())).insertedId;
  const legs=[{id:crypto.randomUUID(),providerName:'Retained provider',origin:'Retained origin',destination:'Retained destination',method:'truck'}];
  await db.prepare('INSERT INTO support_transport_plans(conversation_id,version,legs,share_nonce,share_token_hash,updated_by_user_id,updated_at) VALUES(?,7,?::jsonb,?,?,?,4)').run(cid,JSON.stringify(legs),'a'.repeat(64),'b'.repeat(64),user);
  await db.prepare("INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,'transport_plan_updated',?,4)").run(cid,user,JSON.stringify({version:7,legs}));
  const oldTables=(await db.prepare("SELECT tablename FROM pg_tables WHERE schemaname=current_schema() AND tablename<>'schema_migrations' ORDER BY tablename").all()).map(r=>String(r.tablename));
  const snapshot=async()=>{const result:Record<string,unknown>={};for(const table of oldTables){assert.match(table,/^[a-z_]+$/);result[table]=await db.prepare(`SELECT COUNT(*)::int count,md5(COALESCE(string_agg(h,'' ORDER BY h),'')) digest FROM(SELECT md5(to_jsonb(t)::text) h FROM ${table} t) rows`).get();}return result;};
  const before=await snapshot(),sentinel=Error('Rollback71');
  await assert.rejects(()=>db.runner.transaction(async()=>{assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[71,72]);throw sentinel;}),e=>e===sentinel);
  assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version,70);assert.equal((await db.prepare("SELECT to_regclass('tracking_shipments') value").get()).value,null);assert.deepEqual(await snapshot(),before);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[71,72]);assert.deepEqual(await snapshot(),before);assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
  for(const table of tables){
   assert.equal((await db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()).n,0,'No inferred recipients, import, identity or mail backfill');
   assert.equal((await db.prepare('SELECT relrowsecurity value FROM pg_class WHERE oid=?::regclass').get(table)).value,true);
   for(const role of['anon','authenticated','service_role'])if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role))for(const permission of['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'])assert.equal((await db.prepare("SELECT has_table_privilege(?,current_schema()||'.'||?,?) value").get(role,table,permission)).value,false,role+' '+table+' '+permission);
   for(const role of['suqpage_runtime','mirtpage_runtime'])if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role))assert.equal((await db.prepare("SELECT has_table_privilege(?,current_schema()||'.'||?,'SELECT,INSERT,UPDATE,DELETE') value").get(role,table)).value,true);
  }
  for(const name of['tracking_recipients_id_seq','tracking_shipments_id_seq','tracking_events_id_seq','tracking_email_deliveries_id_seq'])for(const role of['anon','authenticated','service_role'])if(await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role))for(const permission of['SELECT','USAGE','UPDATE'])assert.equal((await db.prepare("SELECT has_sequence_privilege(?,current_schema()||'.'||?,?) value").get(role,name,permission)).value,false);
  const recipient=(await db.prepare("INSERT INTO tracking_recipients(email,email_hash,verified_at) VALUES('recipient@example.test',?,1)").run('c'.repeat(64))).insertedId;
  await db.prepare('INSERT INTO tracking_sessions(token_hash,recipient_id,created_at,expires_at) VALUES(?,?,1,2)').run('d'.repeat(64),recipient);
  await assert.rejects(()=>db.prepare('INSERT INTO tracking_sessions(token_hash,recipient_id,created_at,expires_at) VALUES(?,?,2,1)').run('e'.repeat(64),recipient),/check constraint/);
  await db.prepare("INSERT INTO tracking_challenges(id,email,email_hash,nonce,code_hash,locale,created_at,expires_at) VALUES(?,'recipient@example.test',?,?,?,'en',1,2)").run('a'.repeat(32),'c'.repeat(64),'e'.repeat(64),'f'.repeat(64));
  await assert.rejects(()=>db.prepare('UPDATE tracking_challenges SET attempts=6').run(),/check constraint/);
  await assert.rejects(()=>db.prepare("INSERT INTO tracking_email_deliveries(kind,created_at,next_attempt_at,expires_at) VALUES('initial',1,1,2)").run(),/check constraint/);
  assert.deepEqual(await snapshot(),before,'All schema70 and earlier data remain byte-equivalent after new-table writes');
  console.log('PASS S138 isolated70→71: six empty independent tables, no backfill, all legacy content preserved, strict constraints/FKs, RLS and runtime-only table/sequence ACLs, rollback and no-op replay.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
