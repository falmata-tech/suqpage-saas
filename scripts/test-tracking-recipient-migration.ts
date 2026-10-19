import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {migratePostgresDatabase} from '../lib/postgres-migrations';

async function main(){
 const db=await getDb();
 try{
  const schema=String((await db.prepare('SELECT current_schema() value').get()).value);assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
  assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version,77);
  const tracking=['tracking_recipients','tracking_challenges','tracking_sessions','tracking_shipments','tracking_events','tracking_email_deliveries'];
  for(const table of tracking)assert.equal((await db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()).n,0,'Only an empty disposable fixture may reconstruct schema71');
  await db.exec('ALTER TABLE tracking_recipients ALTER COLUMN verified_at SET NOT NULL');await db.exec('DELETE FROM schema_migrations WHERE version IN (72,73,74,75)');
  // Reconstruct physical71, including the JSON bounds that75 has not installed.
  await db.exec("ALTER TABLE tracking_shipments DROP CONSTRAINT tracking_shipments_legs_check, ADD CONSTRAINT tracking_shipments_legs_check CHECK(jsonb_typeof(legs)='array' AND jsonb_array_length(legs) BETWEEN 1 AND 12 AND octet_length(legs::text)<=24000); ALTER TABLE tracking_events DROP CONSTRAINT tracking_events_detail_check, ADD CONSTRAINT tracking_events_detail_check CHECK(octet_length(detail::text)<=25000)");
  const recipient=(await db.prepare("INSERT INTO tracking_recipients(email,email_hash,locale,verified_at) VALUES('already-verified@example.test',?,'om',123)").run('a'.repeat(64))).insertedId;
  const legs=[{id:crypto.randomUUID(),providerName:'Existing provider',origin:'Existing origin',destination:'Existing destination',method:'truck'}];
  const shipment=(await db.prepare("INSERT INTO tracking_shipments(reference,recipient_id,label,legs,idempotency_key,created_at,updated_at) VALUES('SHP-00000000000000000072',?,'Existing plan',?::jsonb,'existing_s141_migration',123,123)").run(recipient,JSON.stringify(legs))).insertedId;
  await db.prepare('INSERT INTO tracking_sessions(token_hash,recipient_id,created_at,expires_at) VALUES(?,?,123,456)').run('b'.repeat(64),recipient);
  await db.prepare("INSERT INTO tracking_challenges(id,email,email_hash,nonce,code_hash,locale,created_at,expires_at) VALUES(?,'already-verified@example.test',?,?,?,'om',123,456)").run('c'.repeat(32),'a'.repeat(64),'d'.repeat(64),'e'.repeat(64));
  await db.prepare("INSERT INTO tracking_events(shipment_id,event_type,detail,created_at) VALUES(?,'submitted',?::jsonb,123)").run(shipment,JSON.stringify({reference:'SHP-00000000000000000072',label:'Existing plan',version:1,legs,recipientId:recipient,recipientLocale:'om'}));
  await db.prepare("INSERT INTO tracking_email_deliveries(kind,shipment_id,created_at,next_attempt_at,expires_at) VALUES('initial',?,123,123,456)").run(shipment);
  const tables=(await db.prepare("SELECT tablename FROM pg_tables WHERE schemaname=current_schema() AND tablename<>'schema_migrations' ORDER BY tablename").all()).map(row=>String(row.tablename));
  const snapshot=async()=>{const out:Record<string,unknown>={};for(const table of tables){assert.match(table,/^[a-z_]+$/);out[table]=await db.prepare(`SELECT COUNT(*)::int n,md5(COALESCE(string_agg(h,'' ORDER BY h),'')) hash FROM(SELECT md5(to_jsonb(t)::text) h FROM ${table} t) rows`).get();}return out;};
  const columns=()=>db.prepare("SELECT table_name,column_name,is_nullable,column_default,data_type FROM information_schema.columns WHERE table_schema=current_schema() ORDER BY table_name,ordinal_position").all();
  const permissions=()=>db.prepare("SELECT c.relname,c.relrowsecurity,c.relacl::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=current_schema() ORDER BY c.relname").all();
  const nullable=async()=>String((await db.prepare("SELECT is_nullable value FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='tracking_recipients' AND column_name='verified_at'").get()).value);
  const before=await snapshot(),beforeColumns=await columns(),beforePermissions=await permissions(),sentinel=Error('Rollback72');
  await assert.rejects(()=>db.runner.transaction(async()=>{assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[72,73,74,75]);assert.equal(await nullable(),'YES');throw sentinel;}),error=>error===sentinel);
  assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations WHERE version<=75').get()).version,71);assert.equal(await nullable(),'NO');assert.deepEqual(await snapshot(),before);assert.deepEqual(await permissions(),beforePermissions);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[72,73,74,75]);assert.equal(await nullable(),'YES');assert.deepEqual(await snapshot(),before);assert.deepEqual(await permissions(),beforePermissions);
  assert.deepEqual(await columns(),beforeColumns.map(column=>column.table_name==='tracking_recipients'&&column.column_name==='verified_at'?{...column,is_nullable:'YES'}:column),'No other column metadata changes');
  const pending=(await db.prepare("INSERT INTO tracking_recipients(email,email_hash,verified_at) VALUES('pending@example.test',?,NULL)").run('f'.repeat(64))).insertedId;assert.equal((await db.prepare('SELECT verified_at FROM tracking_recipients WHERE id=?').get(pending)).verified_at,null);
  await assert.rejects(()=>db.prepare("INSERT INTO tracking_recipients(email,email_hash,verified_at) VALUES('negative@example.test',?,-1)").run('1'.repeat(64)),/check constraint/);
  await assert.rejects(()=>db.prepare("INSERT INTO tracking_recipients(email,email_hash,verified_at) VALUES('pending@example.test',?,NULL)").run('2'.repeat(64)),/unique constraint/);
  await assert.rejects(()=>db.prepare('INSERT INTO tracking_sessions(token_hash,recipient_id,created_at,expires_at) VALUES(?,999999,123,456)').run('3'.repeat(64)),/foreign key constraint/);
  const afterPending=await snapshot();assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);assert.deepEqual(await snapshot(),afterPending);
  await assert.rejects(()=>db.exec('ALTER TABLE tracking_recipients ALTER COLUMN verified_at SET NOT NULL'),/contains null values/);assert.deepEqual(await snapshot(),afterPending,'A rollback must never invent verification or destroy pending recipients');
  console.log('PASS S141 isolated71→72: only verified_at nullability changes; existing data/locale/identity/FKs/RLS/ACLs preserved, rollback/replay safe, pending NULL valid and negative timestamps rejected.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
