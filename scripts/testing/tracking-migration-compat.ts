import assert from 'node:assert/strict';
import { migrateHistoricalFixture } from '../../lib/postgres-migrations';
import type { FixtureDatabase } from './postgres-fixture';

export async function installHistoricalSupportFixture(db: FixtureDatabase, schema: string, version: 66 | 67 | 68 | 69) {
  assert.match(schema, /^suqpage_test_[a-f0-9]{32}$/);
  assert.equal((await db.prepare("SELECT to_regclass('schema_migrations') AS ledger").get()).ledger, null);
  await migrateHistoricalFixture(db.runner, schema, version);
  // The fresh baseline omits the legacy default that a retained pre-73 installation had.
  await db.exec("ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'Suqpage client'");
}
