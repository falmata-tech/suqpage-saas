import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { archiveTarget, archiveCommand, inspectArchive } from './postgres-archive';
import { createPostgresPool, postgresRuntimeConfig } from '../lib/postgres-runtime';
async function main() {
  const source = process.argv.find(arg => arg.startsWith('--from='))?.slice(7);
  if (!source || !path.isAbsolute(source)) throw new Error('Use --from=/absolute/path/to/backup.');
  const bytes = fs.readFileSync(path.join(source, 'postgres.dump'));
  const manifest = JSON.parse(fs.readFileSync(path.join(source, 'backup.json'), 'utf8'));
  if (manifest.provider !== 'postgres' || manifest.databaseBytes !== bytes.length || manifest.databaseSha256 !== crypto.createHash('sha256').update(bytes).digest('hex')) throw new Error('Backup integrity validation failed.');
  inspectArchive(bytes);
  const target = archiveTarget();
  const targetDigest = crypto.createHash('sha256').update(`${target.hostname}:${target.port || '5432'}${target.pathname}`).digest('hex');
  if (!process.argv.includes('--execute')) { console.log(`Restore plan: public schema, empty target required. Target digest: ${targetDigest}`); return; }
  if (process.env.SUQPAGE_APPROVE_POSTGRES_RESTORE !== targetDigest) throw new Error('Review the target digest and explicitly approve the restore before execution.');
  const config = postgresRuntimeConfig({ SUQPAGE_POSTGRES_URL: target.toString() });
  if (!config) throw new Error('Invalid PostgreSQL restore target.');
  const pool = createPostgresPool(config);
  try {
    const result = await pool.query("SELECT (SELECT COUNT(*) FROM pg_class WHERE relnamespace='public'::regnamespace) + (SELECT COUNT(*) FROM pg_proc WHERE pronamespace='public'::regnamespace) total");
    if (Number(result.rows[0].total)) throw new Error('Restore requires an empty target. Existing data will not be replaced.');
  } finally { await pool.end(); }
  const command = archiveCommand('pg_restore', ['--single-transaction', '--exit-on-error', '--clean', '--if-exists', '--no-owner', '--no-privileges', `--dbname=${decodeURIComponent(target.pathname.slice(1))}`], target);
  const result = spawnSync(command.binary, command.args, { env: command.env, input: bytes, maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error('PostgreSQL restore failed; no further writes attempted.');
  console.log('PostgreSQL archive restored to the approved empty target. Object storage is restored separately.');
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Restore failed.'); process.exitCode = 1; });
