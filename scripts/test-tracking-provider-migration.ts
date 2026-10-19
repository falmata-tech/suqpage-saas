import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
import {parseTrackingShipment} from '../lib/tracking-contract';

const oldLegCheck="jsonb_typeof(legs)='array' AND jsonb_array_length(legs) BETWEEN 1 AND 12 AND octet_length(legs::text)<=24000";
async function main(){
 const db=await getDb();try{
  const schema=String((await db.prepare('SELECT current_schema() name').get()).name);assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
  const metadata=()=>db.prepare("SELECT c.conname,c.convalidated,pg_get_constraintdef(c.oid) definition FROM pg_constraint c WHERE c.conrelid IN ('tracking_shipments'::regclass,'tracking_events'::regclass) AND c.conname IN ('tracking_shipments_legs_check','tracking_events_detail_check') ORDER BY c.conname").all();
  const permissions=()=>db.prepare('SELECT c.relname,c.relrowsecurity,c.relacl::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=current_schema() ORDER BY c.relname').all();
  const tables=(await db.prepare("SELECT tablename FROM pg_tables WHERE schemaname=current_schema() AND tablename<>'schema_migrations' ORDER BY tablename").all()).map(r=>String(r.tablename));
  const snapshot=async()=>{const out:Record<string,unknown>={};for(const table of tables){assert.match(table,/^[a-z_]+$/);out[table]=await db.prepare(`SELECT COUNT(*)::integer total,md5(COALESCE(string_agg(h,'' ORDER BY h),'')) digest FROM(SELECT md5(to_jsonb(t)::text) h FROM ${table} t) rows`).get();}return out;};
  const fresh=await metadata();assert.match(String(fresh[0].definition),/65000/);assert.match(String(fresh[1].definition),/64000/);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
  const recipient=(await db.prepare("INSERT INTO tracking_recipients(email,email_hash,locale,verified_at) VALUES('migration75@example.test',?,'en',1)").run('a'.repeat(64))).insertedId;
  const legs=[{id:crypto.randomUUID(),providerName:'Legacy provider',origin:'Addis Ababa',destination:'Nairobi',method:'truck'}];
  for(const[index,state]of ['pending','sending'].entries()){
   const reference='SHP-'+crypto.randomBytes(10).toString('hex').toUpperCase();
   const shipment=(await db.prepare('INSERT INTO tracking_shipments(reference,recipient_id,label,legs,idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?,1,1)').run(reference,recipient,'Retained shipment',JSON.stringify(legs),'retained_legacy_key_'+index)).insertedId;
   await db.prepare("INSERT INTO tracking_events(shipment_id,event_type,detail,created_at) VALUES(?,'submitted',?::jsonb,1)").run(shipment,JSON.stringify({reference,label:'Retained shipment',version:1,legs,recipientId:recipient,recipientLocale:'en'}));
   await db.prepare("INSERT INTO tracking_email_deliveries(kind,shipment_id,state,attempts,created_at,next_attempt_at,expires_at,lease_until) VALUES('initial',?,?,?,1,1,1800086400000,?)").run(shipment,state,index,index?1800000030000:null);
  }
  await db.exec(`DELETE FROM schema_migrations WHERE version=75; ALTER TABLE tracking_shipments DROP CONSTRAINT tracking_shipments_legs_check, ADD CONSTRAINT tracking_shipments_legs_check CHECK(${oldLegCheck}); ALTER TABLE tracking_events DROP CONSTRAINT tracking_events_detail_check, ADD CONSTRAINT tracking_events_detail_check CHECK(octet_length(detail::text)<=25000)`);
  const before=await snapshot(),beforeMetadata=await metadata(),beforePermissions=await permissions();
  const prefix='https://carrier.example.com/';
  const rich=Array.from({length:12},()=>({id:crypto.randomUUID(),providerName:'😀'.repeat(120),origin:'አ'.repeat(120),destination:'😀'.repeat(120),method:'truck',trackingUrl:prefix+'x'.repeat(2048-prefix.length),trackingCode:'😀'.repeat(120)}));
  const richJson=JSON.stringify(rich);assert.ok(Buffer.byteLength(richJson)>24000);
  const shipmentId=(await db.prepare('SELECT id FROM tracking_shipments ORDER BY id LIMIT 1').get()).id;
  await assert.rejects(()=>db.runner.transaction(async()=>{await db.prepare('UPDATE tracking_shipments SET legs=?::jsonb WHERE id=?').run(richJson,shipmentId);}),/tracking_shipments_legs_check/);
  assert.deepEqual(await snapshot(),before);
  const sentinel=Error('Rollback migration75 fixture');
  await assert.rejects(()=>db.runner.transaction(async()=>{
   assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[75]);
   assert.deepEqual(await snapshot(),before);assert.deepEqual(await permissions(),beforePermissions);assert.deepEqual(await metadata(),fresh);throw sentinel;
  }),error=>error===sentinel);
  assert.deepEqual(await snapshot(),before);assert.deepEqual(await metadata(),beforeMetadata);assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=75').get(),undefined);
  for(const mutation of[
   'ALTER TABLE tracking_events ALTER COLUMN detail DROP NOT NULL',
   "ALTER TABLE tracking_events ALTER COLUMN detail SET DEFAULT '{}'::jsonb",
   'ALTER TABLE tracking_shipments DROP CONSTRAINT tracking_shipments_legs_check',
   'ALTER TABLE tracking_shipments RENAME CONSTRAINT tracking_shipments_legs_check TO custom_legs_check',
   "ALTER TABLE tracking_shipments ADD CONSTRAINT custom_legs_check CHECK(jsonb_typeof(legs)='array')",
   'ALTER TABLE tracking_events DROP CONSTRAINT tracking_events_detail_check, ADD CONSTRAINT tracking_events_detail_check CHECK(octet_length(detail::text)<=25001)',
   'ALTER TABLE tracking_events DROP CONSTRAINT tracking_events_detail_check, ADD CONSTRAINT tracking_events_detail_check CHECK(octet_length(detail::text)<=25000) NOT VALID',
  ]){
   await assert.rejects(()=>db.runner.transaction(async()=>{
    await db.exec(mutation);await assert.rejects(()=>migratePostgresDatabase(db.runner,schema),/requires the reviewed shipment tracking JSON bounds/);
    assert.deepEqual(await snapshot(),before);assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=75').get(),undefined);throw sentinel;
   }),error=>error===sentinel);
   assert.deepEqual(await metadata(),beforeMetadata);assert.deepEqual(await snapshot(),before);
  }
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[75]);
  assert.deepEqual(await snapshot(),before,'Migration75 changes no row, including pending/leased initial snapshots.');assert.deepEqual(await permissions(),beforePermissions);assert.deepEqual(await metadata(),fresh);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);assert.deepEqual(await snapshot(),before);
  await db.prepare('UPDATE tracking_shipments SET legs=?::jsonb WHERE id=?').run(richJson,shipmentId);
  const stored=await db.prepare('SELECT reference,label,version,legs FROM tracking_shipments WHERE id=?').get(shipmentId);assert.equal(parseTrackingShipment(stored).legs.length,12);
  const state=await snapshot();
  for(const invalid of[{},Array.from({length:13},()=>legs[0]),[{...legs[0],padding:'x'.repeat(64000)}]]){
   await assert.rejects(()=>db.runner.transaction(async()=>{await db.prepare('UPDATE tracking_shipments SET legs=?::jsonb WHERE id=?').run(JSON.stringify(invalid),shipmentId);}));assert.deepEqual(await snapshot(),state);
  }
  await assert.rejects(()=>db.runner.transaction(async()=>{await db.prepare('UPDATE tracking_events SET detail=?::jsonb').run(JSON.stringify({padding:'x'.repeat(65000)}));}),/tracking_events_detail_check/);
  assert.deepEqual(await snapshot(),state);assert.deepEqual(await metadata(),fresh);
  console.log('PASS DEP-04875: two bounds only; old pending/leased snapshots, all rows/ACLs preserved; exact metadata refusal, atomic rollback/replay, rich12-leg storage and retained array/count/byte checks.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
