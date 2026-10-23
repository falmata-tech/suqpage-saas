import assert from 'node:assert/strict';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { LATEST_POSTGRES_MIGRATION_VERSION } from '../lib/postgres-schema-version';
import type { SessionUser } from '../lib/types';

async function main() {
  const db = await getDb();
  // This persistence test must never contact the optional external notifier.
  for (const prefix of ['SUQPAGE', 'MIRTPAGE']) {
    delete process.env[`${prefix}_TELEGRAM_BOT_TOKEN`];
    delete process.env[`${prefix}_TELEGRAM_SUPPORT_CHAT_ID`];
  }
  try {
    const schema = String((await db.prepare('SELECT current_schema() name').get()).name);
    assert.match(schema, /^suqpage_test_[a-f0-9]{32}$/);
    assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version, LATEST_POSTGRES_MIGRATION_VERSION);
    // Replay migration 73 against the complete current ledger, including the
    // inquiry and provider-interest tables added in migrations 78–79.
    assert.equal(LATEST_POSTGRES_MIGRATION_VERSION, 79, 'Update this migration-specific regression deliberately when appending migrations.');
    const businessId = (await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('default-history','Suqpage tenant-authored name','composition','active')").run()).insertedId;
    const otherBusinessId = (await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('default-other','Other business','composition','active')").run()).insertedId;
    const ownerId = (await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES('default-owner@example.test','unused','Owner','owner',?,0)").run(businessId)).insertedId;
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(ownerId);
    await db.prepare("INSERT INTO business_subscriptions(business_id,plan_name,amount_minor,currency,starts_at,current_period_start,current_period_end,grace_ends_at,updated_at) VALUES(?,'Retained negotiated history',12345,'ETB',1,1,2,3,1)").run(businessId);
    const insert = db.prepare(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,subject,status,created_at,updated_at,last_message_at)
      VALUES(?,'client',?,?,'Retained support','waiting',1,1,1)`);
    await db.exec("ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'Suqpage client'; DELETE FROM schema_migrations WHERE version=73");
    const oldConversation = (await insert.run('SUP-DEFAULT-LEGACY', businessId, ownerId)).insertedId;
    await db.prepare("INSERT INTO support_messages(conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,sender_side) VALUES(?,?,'user',?,'Retained private message','default_legacy_message',1,'participant')").run(oldConversation, ownerId, `user:${ownerId}`);
    await db.prepare("INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,'created','Retained audit history',1)").run(oldConversation, ownerId);
    const recipient = (await db.prepare("INSERT INTO tracking_recipients(email,email_hash,verified_at) VALUES('retained-job@example.test',?,NULL)").run('a'.repeat(64))).insertedId;
    const legs = [{ id: 'retained-leg', providerName: 'Retained provider', origin: 'Origin', destination: 'Destination', method: 'truck' }];
    const shipment = (await db.prepare("INSERT INTO tracking_shipments(reference,recipient_id,label,legs,idempotency_key,created_at,updated_at) VALUES('SHP-00000000000000000073',?,'Retained shipment',?::jsonb,'retained_job_migration73',1,1)").run(recipient, JSON.stringify(legs))).insertedId;
    await db.prepare("INSERT INTO tracking_email_deliveries(kind,shipment_id,state,attempts,created_at,next_attempt_at,expires_at,lease_until) VALUES('initial',?,'sending',2,1,2,3000000,2000000)").run(shipment);
    const tables = (await db.prepare("SELECT tablename FROM pg_tables WHERE schemaname=current_schema() AND tablename<>'schema_migrations' ORDER BY tablename").all()).map(row => String(row.tablename));
    const snapshot = async () => {
      const hashes: Record<string, unknown> = {};
      for (const table of tables) {
        assert.match(table, /^[a-z_]+$/);
        hashes[table] = await db.prepare(`SELECT COUNT(*)::int total,md5(COALESCE(string_agg(h,'' ORDER BY h),'')) digest FROM(SELECT md5(to_jsonb(t)::text) h FROM ${table} t) rows`).get();
      }
      return hashes;
    };
    const columns = () => db.prepare('SELECT table_name,column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema=current_schema() ORDER BY table_name,ordinal_position').all();
    const permissions = () => db.prepare('SELECT c.relname,c.relrowsecurity,c.relacl::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=current_schema() ORDER BY c.relname').all();
    const defaultLabel = async () => String((await db.prepare("SELECT column_default value FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='support_conversations' AND column_name='requester_label'").get()).value);
    const before = await snapshot(), beforeColumns = await columns(), beforePermissions = await permissions(), beforeDefault = await defaultLabel();
    await db.exec("ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'Custom operator label'");
    await assert.rejects(() => migratePostgresDatabase(db.runner, schema), /requires the reviewed support requester-label metadata and default/);
    assert.match(await defaultLabel(), /Custom operator label/);
    assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=73').get(), undefined);
    assert.deepEqual(await snapshot(), before, 'A custom metadata default fails closed without rewriting any row or job.');
    await db.exec('ALTER TABLE support_conversations ALTER COLUMN requester_label DROP DEFAULT');
    await assert.rejects(() => migratePostgresDatabase(db.runner, schema), /requires the reviewed support requester-label metadata and default/);
    assert.equal((await db.prepare("SELECT column_default value FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='support_conversations' AND column_name='requester_label'").get()).value, null);
    assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=73').get(), undefined);
    assert.deepEqual(await snapshot(), before, 'An absent default in an already-versioned schema is never mistaken for a fresh baseline.');
    await db.exec("ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'Suqpage client'");
    const sentinel = Error('Rollback migration73 fixture');
    await assert.rejects(() => db.runner.transaction(async () => {
      assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [73]);
      assert.match(await defaultLabel(), /MirtPage client/);
      throw sentinel;
    }), error => error === sentinel);
    assert.equal(await defaultLabel(), beforeDefault);
    assert.equal(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=73').get(), undefined);
    assert.deepEqual(await snapshot(), before);
    assert.deepEqual(await permissions(), beforePermissions);
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [73]);
    assert.match(await defaultLabel(), /MirtPage client/);
    assert.deepEqual(await snapshot(), before, 'Every existing row, including jobs and billing history, is unchanged.');
    assert.deepEqual(await permissions(), beforePermissions, 'No RLS or table/sequence privilege changes.');
    assert.deepEqual(await columns(), beforeColumns.map(column => column.table_name === 'support_conversations' && column.column_name === 'requester_label'
      ? { ...column, column_default: "'MirtPage client'::text" } : column), 'Only the allowlisted column default changes.');
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    assert.deepEqual(await snapshot(), before);
    assert.match(String((await db.prepare("SELECT column_default value FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='business_subscriptions' AND column_name='plan_name'").get()).value), /Suqpage monthly/);
    assert.equal(await db.prepare("SELECT 1 FROM pg_trigger WHERE tgrelid='businesses'::regclass AND tgname='business_subscription_after_insert'").get(), undefined);
    assert.equal((await db.prepare("SELECT to_regprocedure(current_schema()||'.create_business_subscription()') value").get()).value, null);
    const freshBusiness = (await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('default-future','Future business','composition')").run()).insertedId;
    assert.equal(await db.prepare('SELECT 1 FROM business_subscriptions WHERE business_id=?').get(freshBusiness), undefined, 'No retired subscription is created.');
    const defaultConversation = (await insert.run('SUP-DEFAULT-FUTURE', businessId, ownerId)).insertedId;
    assert.equal((await db.prepare('SELECT requester_label FROM support_conversations WHERE id=?').get(defaultConversation)).requester_label, 'MirtPage client');

    const { createSupportConversation, SupportError } = await import('../lib/support');
    const owner: SessionUser = { id: ownerId, email: 'default-owner@example.test', name: 'Owner', role: 'owner', access_role: 'client', business_id: businessId, must_change_password: 0 };
    const input = { subject: 'Actual current writer', message: 'A real isolated support request', idempotencyKey: 'mirtpage_default_writer_01' };
    const created = await createSupportConversation(owner, input, 1_800_000_000_000);
    assert.equal((await db.prepare('SELECT requester_label FROM support_conversations WHERE id=?').get(created.id)).requester_label, 'MirtPage client');
    await db.prepare("UPDATE support_conversations SET requester_label='Retained previous label' WHERE id=?").run(created.id);
    const afterCreate = await snapshot();
    assert.deepEqual(await createSupportConversation(owner, input, 1_800_000_000_001), { ...created, duplicate: true });
    await assert.rejects(() => createSupportConversation({ ...owner, business_id: otherBusinessId }, { ...input, idempotencyKey: 'mirtpage_foreign_writer_01' }), error => error instanceof SupportError && error.code === 'forbidden');
    await assert.rejects(() => createSupportConversation(owner, { ...input, message: 'Changed duplicate' }), error => error instanceof SupportError && error.code === 'idempotency_conflict');
    assert.deepEqual(await snapshot(), afterCreate, 'Duplicates and forged cross-tenant commands cannot relabel or add records.');
    assert.equal((await db.prepare('SELECT requester_label FROM support_conversations WHERE id=?').get(oldConversation)).requester_label, 'Suqpage client');
    assert.equal((await db.prepare('SELECT name FROM businesses WHERE id=?').get(businessId)).name, 'Suqpage tenant-authored name');
    console.log('PASS BE-059 migration73: exact default-only metadata change, every-row fingerprints, RLS/ACL preservation, rollback/replay, retired billing unchanged, actual support writer and duplicate/tenant denial.');
  } finally { await closeDbForTests(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
