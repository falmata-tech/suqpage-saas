import crypto from 'node:crypto';
import fs from 'node:fs';
import { createPostgresPool, PostgresTransactionRunner, postgresRuntimeConfig } from '../../lib/postgres-runtime';
import { migratePostgresDatabase } from '../../lib/postgres-migrations';
import { closePostgresRuntimeForTests, postgresRuntimeServices } from '../../lib/postgres-runtime-services';

// Explicit async fixture API. Queries execute against real, isolated PostgreSQL.
export class FixtureDatabase {
  constructor(readonly runner: PostgresTransactionRunner, private readonly cleanup: () => Promise<void>) {}
  prepare(sql: string) {
    const query = async (args: unknown[], returning = false) => {
      let statement = sql;
      let values = args;
      if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
        const record = args[0] as Record<string, unknown>;
        values = [];
        statement = statement.replace(/@([A-Za-z_][A-Za-z0-9_]*)/g, (_, name: string) => { values.push(record[name]); return '?'; });
      }
      if (returning && /^\s*INSERT\s/i.test(statement) && !/\bRETURNING\b/i.test(statement)) statement += ' RETURNING *';
      return this.runner.query(statement, values);
    };
    return {
      // Test rows intentionally have arbitrary fixture schemas; production ports stay typed.
      get: async (...args: unknown[]): Promise<any> => (await query(args)).rows[0],
      all: async (...args: unknown[]): Promise<any[]> => (await query(args)).rows,
      run: async (...args: unknown[]) => { const result = await query(args, true); return { changes: result.rowCount, insertedId: Number(result.rows[0]?.id || 0) }; },
    };
  }
  async exec(sql: string) { await this.runner.query(sql); }
  async close() { await this.cleanup(); }
}

let active: Promise<FixtureDatabase> | undefined;
export function getDb() { return active ||= createFixture(); }
export function getEmptyDb() { return active ||= createFixture(false); }
export async function closeDbForTests() { if (!active) return; const db = await active; active = undefined; await db.close(); }

async function createFixture(installSchema = true) {
  if (!process.env.SUQPAGE_TEST_POSTGRES_URL && !process.env.SUQPAGE_POSTGRES_URL && fs.existsSync('.local/supabase-runtime.env')) process.loadEnvFile('.local/supabase-runtime.env');
  const connection = process.env.SUQPAGE_TEST_POSTGRES_URL || process.env.SUQPAGE_POSTGRES_URL || '';
  const target = new URL(connection);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname);
  if (!local && !(process.env.CI === 'true' && process.env.SUQPAGE_TEST_POSTGRES_URL && ['postgres', 'db'].includes(target.hostname))) throw new Error('Persistence fixtures require an isolated local or CI PostgreSQL service.');
  // Fixture setup replays the entire migration history before any assertion.
  // Give only that setup pool room when a full suite has loaded local Postgres;
  // the application runtime created below retains its normal query timeout.
  const config = postgresRuntimeConfig({
    SUQPAGE_POSTGRES_URL: connection,
    SUQPAGE_POSTGRES_POOL_MAX: '1',
    SUQPAGE_POSTGRES_STATEMENT_TIMEOUT_MS: '30000',
  });
  if (!config) throw new Error('A local PostgreSQL test connection is required.');
  const pool = createPostgresPool(config);
  const runner = new PostgresTransactionRunner(pool);
  const schema = `suqpage_test_${crypto.randomUUID().replaceAll('-', '')}`;
  await runner.query(`CREATE SCHEMA "${schema}"`);
  const previous = process.env.SUQPAGE_POSTGRES_URL;
  try {
    if (installSchema) await migratePostgresDatabase(runner, schema);
    target.searchParams.set('options', `-csearch_path=${schema}`);
    await closePostgresRuntimeForTests();
    process.env.SUQPAGE_DATABASE_DRIVER = 'postgres';
    process.env.SUQPAGE_POSTGRES_URL = target.toString();
    process.env.SUQPAGE_AUTH_DRIVER = 'local';
    process.env.SUQPAGE_MEDIA_DRIVER = 'filesystem';
    const database = new FixtureDatabase(postgresRuntimeServices().runner, async () => {
      await closePostgresRuntimeForTests();
      await runner.query(`DROP SCHEMA "${schema}" CASCADE`);
      await pool.end();
      if (previous === undefined) delete process.env.SUQPAGE_POSTGRES_URL; else process.env.SUQPAGE_POSTGRES_URL = previous;
    });
    return database;
  } catch (error) {
    await runner.query(`DROP SCHEMA "${schema}" CASCADE`);
    await pool.end();
    throw error;
  }
}
export { runtimeBusinessByHandle as getBusinessByHandle, runtimeBusinessByHandleAny as getBusinessByHandleAny, runtimeBusinessById as getBusinessById, runtimeCatalogByHandle as getCatalogByHandle, runtimeCatalogByBusinessId as getCatalogByBusinessId, runtimeUserByEmail as getUserByEmail, runtimeUserById as getUserById, runtimeHasRetainedPublication as hasRetainedPublication } from '../../lib/catalog-runtime';
export async function getAllBusinesses() { return postgresRuntimeServices().catalog.getAllBusinesses(); }
export { runtimeTransaction as inTransaction } from '../../lib/runtime-sql';

export async function seedFixture() {
  const db = await getDb();
  if (Number((await db.prepare('SELECT COUNT(*) total FROM businesses').get()).total)) return;
  const { spawn } = await import('node:child_process');
  const { default: os } = await import('node:os');
  const { default: path } = await import('node:path');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suqpage-seed-'));
  const schema = (await db.prepare('SELECT current_schema() name').get()).name as string;
  if (!/^suqpage_test_[a-f0-9]{32}$/.test(schema)) throw new Error('Demo test seed requires an isolated fixture schema.');
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, ['--import','tsx','scripts/setup.ts'], { env: { ...process.env, SUQPAGE_POSTGRES_DIRECT_URL: process.env.SUQPAGE_POSTGRES_URL, SUQPAGE_POSTGRES_MIGRATION_SCHEMA: schema, SUQPAGE_CREDENTIAL_PATH: path.join(root,'credentials.txt'), SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT: '1' }, stdio: ['ignore','pipe','pipe'] });
      let log = '';
      const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('Native demo fixture setup timed out.')); }, 180_000);
      child.stdout.on('data', value => { log += String(value); });
      child.stderr.on('data', value => { log += String(value); });
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`Native demo fixture failed: ${log.slice(-2500)}`)); });
    });
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
}
export async function getSeededBusinesses() { await seedFixture(); return getAllBusinesses(); }
