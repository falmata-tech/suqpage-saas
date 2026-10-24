import assert from 'node:assert/strict';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { migratePostgresDatabase } from '../lib/postgres-migrations';

async function main() {
  const db = await getDb();
  try {
    const schema = String((await db.prepare('SELECT current_schema() name').get()).name);
    assert.match(schema, /^suqpage_test_[a-f0-9]{32}$/);
    assert.equal((await db.prepare('SELECT version FROM schema_migrations WHERE version=77').get())?.version, 77);
    const names = ['owner_auth_session_fences', 'owner_email_change_requests'];
    const metadata = async () => db.prepare(`SELECT c.relname,c.relrowsecurity,c.relacl::text acl
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname=current_schema() AND c.relname IN ('owner_auth_session_fences','owner_email_change_requests') ORDER BY c.relname`).all();
    const initial = await metadata();
    assert.deepEqual(initial.map(row => row.relname), names);
    assert.ok(initial.every(row => row.relrowsecurity));
    for (const table of names) {
      for (const role of ['anon', 'authenticated', 'service_role']) {
        const found = await db.prepare('SELECT has_table_privilege(?, ?, ? ) allowed').get(role, `${schema}.${table}`, 'SELECT');
        assert.equal(found.allowed, false, `${role} must not see private email-change state`);
      }
      for (const role of ['suqpage_runtime', 'mirtpage_runtime']) {
        const exists = await db.prepare('SELECT 1 FROM pg_roles WHERE rolname=?').get(role);
        if (exists) assert.equal((await db.prepare('SELECT has_table_privilege(?, ?, ?) allowed').get(role, `${schema}.${table}`, 'SELECT')).allowed, true);
      }
    }
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    const user = (await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('email-change-77@example.test','fixture','Email Change','owner')").run()).insertedId;
    await db.prepare("INSERT INTO owner_email_change_requests(user_id,provider_user_id,old_email,new_email,state,requested_at,expires_at) VALUES(?,?,?,?,'prepared',1,3600001)").run(user, '00000000-0000-4000-8000-000000000001', 'email-change-77@example.test', 'new-email-change-77@example.test');
    await db.prepare('INSERT INTO owner_auth_session_fences(user_id,valid_after_epoch_seconds) VALUES(?,?)').run(user, 123456);
    await assert.rejects(() => db.prepare("UPDATE owner_email_change_requests SET state='unverified' WHERE user_id=?").run(user));
    await db.prepare('DELETE FROM users WHERE id=?').run(user);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM owner_email_change_requests').get()).n, 0);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM owner_auth_session_fences').get()).n, 0);
    const rollback = Error('isolated rollback');
    await assert.rejects(() => db.runner.transaction(async () => {
      await db.exec('DELETE FROM schema_migrations WHERE version=77; DROP TABLE owner_email_change_requests,owner_auth_session_fences');
      assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, [77]);
      assert.deepEqual(await metadata(), initial);
      throw rollback;
    }), error => error === rollback);
    assert.deepEqual(await metadata(), initial);
    assert.deepEqual((await migratePostgresDatabase(db.runner, schema)).applied, []);
    console.log('PASS BE-061/DEP-050 migration77 private schema, runtime-only ACL, cascade, bounds and isolated rollback/replay.');
  } finally { await closeDbForTests(); }
}

main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
