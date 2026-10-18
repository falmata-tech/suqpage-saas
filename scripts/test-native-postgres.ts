import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suqpage-native-'));
  const db = await getDb();
  try {
    const schema = (await db.prepare('SELECT current_schema() name').get()).name as string;
    assert.match(schema, /^suqpage_test_[a-f0-9]{32}$/);
    assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version, 72);
    const routines = await db.prepare('SELECT prosrc FROM pg_proc WHERE pronamespace=current_schema()::regnamespace').all();
    assert.ok(routines.length >= 11);
    for (const routine of routines) assert.doesNotMatch(routine.prosrc, /(?:"public"|public)\./, 'Fixture triggers never resolve into developer data.');
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    const unversioned = `${schema}_unversioned`;
    await db.runner.query(`CREATE SCHEMA "${unversioned}"`);
    try {
      await db.runner.query(`CREATE TABLE "${unversioned}".sentinel(value text); INSERT INTO "${unversioned}".sentinel VALUES('preserve')`);
      await assert.rejects(() => migratePostgresDatabase(db.runner, unversioned), /unversioned populated schema/);
      assert.equal((await db.runner.query<{ value: string }>(`SELECT value FROM "${unversioned}".sentinel`)).rows[0].value, 'preserve');
    } finally { await db.runner.query(`DROP SCHEMA "${unversioned}" CASCADE`); }

    const settings = await db.prepare("SELECT COUNT(*) total FROM information_schema.columns WHERE table_schema=current_schema() AND table_name IN ('products','option_values') AND column_name='stock_count'").get();
    assert.equal(settings.total, 0);
    const env = { ...process.env, SUQPAGE_POSTGRES_DIRECT_URL: process.env.SUQPAGE_POSTGRES_URL, SUQPAGE_POSTGRES_MIGRATION_SCHEMA: schema, SUQPAGE_MEDIA_ROOT: path.join(root,'media'), SUQPAGE_CREDENTIAL_PATH: path.join(root,'credentials.txt'), SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT: '1' };
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, ['--import','tsx','scripts/setup.ts'], { env, stdio: ['ignore','pipe','pipe'] });
      let log = '';
      child.stdout.on('data', value => { log += String(value); });
      child.stderr.on('data', value => { log += String(value); });
      child.on('error', reject);
      child.on('close', code => code === 0 ? resolve() : reject(new Error(`Native demo setup failed: ${log.slice(-2500)}`)));
    });
    const count = Number((await db.prepare('SELECT COUNT(*) total FROM businesses').get()).total);
    assert.ok(count >= 60, 'Full current demo portfolio installs without an intermediate database.');
    assert.equal(Number((await db.prepare("SELECT COUNT(*) total FROM businesses WHERE public_email='' OR public_phone=''").get()).total), 0, 'Every seeded demo has distinct public contacts.');
    assert.equal(Number((await db.prepare("SELECT COUNT(*) total FROM users WHERE account_phone='' AND (email LIKE '%@mirtpage.local' OR email LIKE '%@demo.mirtpage.local')").get()).total), 0, 'Demo account phones are filled independently of public contacts.');

    const before = crypto.createHash('sha256').update(JSON.stringify(await db.prepare('SELECT * FROM businesses ORDER BY id').all())).digest('hex');
    await migratePostgresDatabase(db.runner, schema);
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(await db.prepare('SELECT * FROM businesses ORDER BY id').all())).digest('hex'), before, 'Reapplying native migrations preserves existing tenant data.');
    assert.equal((await db.prepare('SELECT COUNT(*) total FROM pg_constraint WHERE connamespace=current_schema()::regnamespace AND NOT convalidated').get()).total, 0);
    console.log(`PASS native PostgreSQL install, ${count} demo businesses, isolated triggers, constraints, stockless schema and idempotent data preservation.`);
  } finally { await closeDbForTests(); fs.rmSync(root,{ recursive:true,force:true }); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
