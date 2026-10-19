import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getDb, getEmptyDb, closeDbForTests } from './testing/postgres-fixture';
import { runtimeAll, runtimeGet } from '../lib/runtime-sql';
import { migratePostgresDatabase } from '../lib/postgres-migrations';
import { isSupportedPostgresMigrationLedger, LATEST_POSTGRES_MIGRATION_VERSION } from '../lib/postgres-schema-version';

const full = Array.from({ length: LATEST_POSTGRES_MIGRATION_VERSION }, (_, index) => index + 1);
const legacy = full.filter(version => version < 27 || version > 30);
const missing = new RegExp(`complete reviewed ledger through ${LATEST_POSTGRES_MIGRATION_VERSION}`);

function policy() {
  assert.equal(isSupportedPostgresMigrationLedger(full), true);
  assert.equal(isSupportedPostgresMigrationLedger(legacy), true);
  for (const invalid of [
    [], full.slice(0, -1), [...full, LATEST_POSTGRES_MIGRATION_VERSION + 1], [0, ...legacy], [...legacy, -1],
    full.filter(version => version !== 64), [...full.slice(0, -1), 72],
    ...[1.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1', null, undefined].map(value => [value, ...full.slice(1)]),
    [...full].reverse(),
  ]) assert.equal(isSupportedPostgresMigrationLedger(invalid), false, 'Only exact ordered integer histories are admitted.');
  for (let mask = 1; mask < 15; mask++) {
    const partial = full.filter(version => version < 27 || version > 30 || Boolean(mask & (1 << (version - 27))));
    assert.equal(isSupportedPostgresMigrationLedger(partial), false, 'Every partial27–30 representation is denied.');
  }
}

async function main() {
  policy();
  process.env.SUQPAGE_PREFLIGHT_IMPORT_ONLY = '1';
  const { preflight } = await import('./preflight');
  const db = await getDb();
  try {
    assert.match(String((await db.prepare('SELECT current_schema() name').get()).name), /^suqpage_test_[a-f0-9]{32}$/);
    const ledger = async () => (await db.prepare('SELECT version FROM schema_migrations ORDER BY version').all()).map(row => Number(row.version));
    assert.deepEqual(await ledger(), full, 'The actual fresh migration endpoint and full-ledger contract agree.');
    const reads: string[] = [];
    const read: Parameters<typeof preflight>[0] = {
      get: async (sql, values) => { reads.push(sql); return runtimeGet(sql, values); },
      all: async (sql, values) => { reads.push(sql); return runtimeAll(sql, values); },
    };
    const sentinel = Error('Restore fixture ledger');
    const mutations = [
      'DELETE FROM schema_migrations WHERE version>63',
      'DELETE FROM schema_migrations WHERE version>63 OR version BETWEEN 27 AND 30',
      'DELETE FROM schema_migrations WHERE version=64',
      'DELETE FROM schema_migrations WHERE version=1',
      `INSERT INTO schema_migrations(version) VALUES(${LATEST_POSTGRES_MIGRATION_VERSION + 1})`,
      'INSERT INTO schema_migrations(version) VALUES(0)',
      'ALTER TABLE schema_migrations ALTER COLUMN version TYPE NUMERIC; UPDATE schema_migrations SET version=1.5 WHERE version=1',
      ...Array.from({ length: 14 }, (_, index) => {
        const present = [27, 28, 29, 30].filter((_, bit) => (index + 1) & (1 << bit));
        return `DELETE FROM schema_migrations WHERE version BETWEEN 27 AND 30 AND version NOT IN (${present.join(',')})`;
      }),
    ];
    for (const mutation of mutations) {
      reads.length = 0;
      await assert.rejects(() => db.runner.transaction(async () => {
        await db.exec(mutation);
        if (mutation.includes('version=64')) assert.ok(await db.prepare('SELECT 1 FROM schema_migrations WHERE version=?').get(LATEST_POSTGRES_MIGRATION_VERSION));
        await assert.rejects(() => preflight(read), missing);
        assert.equal(reads.length, 1, 'Invalid history fails before administrator/Auth/account reads.');
        assert.equal(reads[0], 'SELECT version FROM schema_migrations ORDER BY version LIMIT ?');
        throw sentinel;
      }), error => error === sentinel);
      assert.deepEqual(await ledger(), full);
    }
    await assert.rejects(() => db.runner.transaction(async () => {
      await db.exec('DELETE FROM schema_migrations WHERE version=64');
      await assert.rejects(() => preflight(), missing);
      throw sentinel;
    }), error => error === sentinel);
    await assert.rejects(() => preflight(), /At least one administrator account is required/);
    const admin = (await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('preflight@example.test','unused','Readiness fixture','admin',0)").run()).insertedId;
    await preflight();
    await assert.rejects(() => db.runner.transaction(async () => {
      await db.exec('DELETE FROM schema_migrations WHERE version BETWEEN 27 AND 30');
      const before = await ledger();
      await preflight();
      assert.deepEqual(await ledger(), before, 'Accepting a retained legacy ledger never synthesizes markers.');
      throw sentinel;
    }), error => error === sentinel);
    process.env.SUQPAGE_AUTH_DRIVER = 'supabase';
    await assert.rejects(() => preflight(), /one reconciled Supabase identity/);
    await db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase','00000000-0000-4000-8000-000000000001','preflight@example.test',1)").run(admin);
    await preflight();
    process.env.SUQPAGE_AUTH_DRIVER = 'local';
    await db.prepare('UPDATE users SET must_change_password=1 WHERE id=?').run(admin);
    const warnings: string[] = [], originalWarn = console.warn;
    try { console.warn = value => warnings.push(String(value)); await preflight(); }
    finally { console.warn = originalWarn; }
    assert.deepEqual(warnings, ['Warning: 1 account(s) still use a temporary password.']);
    const beforeNodeEnv = process.env.NODE_ENV;
    try {
      Reflect.set(process.env, 'NODE_ENV', 'production'); reads.length = 0;
      await assert.rejects(() => preflight(read), /SUQPAGE_AUTH_DRIVER must be supabase/);
      assert.equal(reads.length, 0, 'Production configuration still precedes all database access.');
    } finally { if (beforeNodeEnv === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV'); else Reflect.set(process.env, 'NODE_ENV', beforeNodeEnv); }
    const netlify = fs.readFileSync('netlify.toml', 'utf8');
    assert.match(netlify, /command = "node scripts\/check-web-install\.cjs && npm run build"/);
    assert.doesNotMatch(netlify, /preflight|postgres-readiness|SUQPAGE_POSTGRES_URL|MIRTPAGE_POSTGRES_URL/);
  } finally { await closeDbForTests(); }

  // Construct the physical63 prefix in an empty owned fixture. Only fixture
  // setup substitutes forward existence probes; it writes no future markers.
  // The actual63→77 migration and readiness assertion use the unmodified reader.
  const retained = await getEmptyDb();
  try {
    const schema = String((await retained.prepare('SELECT current_schema() name').get()).name);
    assert.match(schema, /^suqpage_test_[a-f0-9]{32}$/);
    const query = retained.runner.query.bind(retained.runner);
    try {
      retained.runner.query = async function<T extends Record<string, unknown>>(sql: string, values: readonly unknown[] = []) {
        const probe = /^SELECT version FROM schema_migrations WHERE version=(\d+)$/.exec(sql);
        if (probe && Number(probe[1]) >= 64) return query<T>('SELECT ?::bigint version', [Number(probe[1])]);
        return query<T>(sql, values);
      };
      assert.deepEqual((await migratePostgresDatabase(retained.runner, schema)).applied, full.filter(version => version <= 63));
    } finally { retained.runner.query = query; }
    await retained.exec("DELETE FROM schema_migrations WHERE version BETWEEN 27 AND 30; ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'Suqpage client'; DELETE FROM discovery_industries WHERE key='agriculture-growers'; UPDATE discovery_industries SET position=position-1 WHERE position>2");
    assert.equal((await retained.prepare('SELECT COUNT(*)::integer total FROM discovery_industries').get()).total, 6, 'Reconstructed63 reference data matches the observed six-key legacy target.');
    const versions = async () => (await retained.prepare('SELECT version FROM schema_migrations ORDER BY version').all()).map(row => Number(row.version));
    assert.deepEqual(await versions(), legacy.filter(version => version <= 63), 'The exact observed59-entry production representation is reconstructed.');
    assert.equal((await retained.prepare("SELECT to_regclass('tracking_shipments') value").get()).value, null);
    assert.equal((await retained.prepare("SELECT COUNT(*)::integer total FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='business_discovery_profiles' AND column_name='country_code'").get()).total, 0, 'Physical64 schema has not been fabricated.');
    const admin = (await retained.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('retained-preflight@example.test','unused','Preserved pre-upgrade account','admin',0)").run()).insertedId;
    const beforeUser = await retained.prepare('SELECT * FROM users WHERE id=?').get(admin);
    await assert.rejects(() => preflight(), missing);
    assert.deepEqual((await migratePostgresDatabase(retained.runner, schema)).applied, full.filter(version => version >= 64));
    assert.deepEqual(await versions(), legacy, 'Only64–77 are appended; no27–30 backfill or old data-patch replay.');
    assert.deepEqual(await retained.prepare('SELECT * FROM users WHERE id=?').get(admin), beforeUser);
    assert.ok((await retained.prepare("SELECT to_regclass('tracking_shipments') value").get()).value);
    await preflight();
    assert.deepEqual((await migratePostgresDatabase(retained.runner, schema)).applied, []);
    assert.deepEqual(await versions(), legacy);
  } finally { await closeDbForTests(); }
  console.log('PASS DEP-049 exact two-ledger readiness: full/retained histories, actual59-entry six-key63→77 upgrade without fake markers, all14partial groups, stale/hole64/future/noninteger rejection, read order and Auth/admin/configuration guards.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
