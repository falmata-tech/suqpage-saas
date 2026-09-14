import { platformEnvironment } from "../lib/platform-environment.mjs";
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export function archiveTarget() {
  const raw = platformEnvironment().SUQPAGE_POSTGRES_DIRECT_URL;
  if (!raw) throw new Error('SUQPAGE_POSTGRES_DIRECT_URL is required for database archives.');
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.password) throw new Error('Invalid PostgreSQL archive target.');
  return url;
}
export function archiveCommand(command: 'pg_dump' | 'pg_restore', args: string[], target?: URL) {
  const container = platformEnvironment().SUQPAGE_LOCAL_PG_CONTAINER;
  const env = { ...process.env };
  const binaryDirectory = platformEnvironment().SUQPAGE_PG_BIN_DIR;
  let binary = binaryDirectory ? path.join(binaryDirectory, command) : command;
  let commandArgs = args;
  if (container) {
    if (!/^supabase_db_[a-z0-9_-]+$/i.test(container)) throw new Error('Invalid local PostgreSQL container.');
    if (target) {
      if (!['127.0.0.1', 'localhost'].includes(target.hostname) || decodeURIComponent(target.username) !== 'postgres' || !/^\/[a-z][a-z0-9_]*$/.test(target.pathname)) throw new Error('Container archive commands require a local PostgreSQL database.');
      const mapping = spawnSync('docker', ['port', container, '5432/tcp'], { encoding: 'utf8' });
      if (mapping.status !== 0 || !mapping.stdout.split('\n').some(line => line.trim() === `127.0.0.1:${target.port}`)) throw new Error('The archive target does not match the selected local container.');
    }
    binary = 'docker';
    // The container's local trusted socket is used. Never send a provider password through argv.
    commandArgs = ['exec', '-i', container, command, ...(target ? ['--username=postgres'] : []), ...args];
  } else if (target) {
    Object.assign(env, { PGHOST: target.hostname, PGPORT: target.port || '5432', PGUSER: decodeURIComponent(target.username), PGPASSWORD: decodeURIComponent(target.password), PGDATABASE: decodeURIComponent(target.pathname.slice(1)), PGSSLMODE: target.searchParams.get('sslmode') || (['127.0.0.1','localhost'].includes(target.hostname) ? 'prefer' : 'require') });
  }
  return { binary, args: commandArgs, env };
}
export function inspectArchive(bytes: Buffer) {
  if (bytes.subarray(0, 5).toString() !== 'PGDMP') throw new Error('Expected a PostgreSQL custom-format archive.');
  const command = archiveCommand('pg_restore', ['--list']);
  const result = spawnSync(command.binary, command.args, { env: command.env, input: bytes, maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error('PostgreSQL archive validation failed.');
}
