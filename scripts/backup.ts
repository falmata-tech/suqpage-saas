import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { backupRoot } from '../lib/config';
import { archiveTarget, archiveCommand, inspectArchive } from './postgres-archive';
const target = archiveTarget();
const destination = path.join(backupRoot(), new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
const archive = path.join(destination, 'postgres.dump');
const descriptor = fs.openSync(archive, 'wx', 0o600);
try {
  const command = archiveCommand('pg_dump', ['--format=custom', '--schema=public', '--no-owner', '--no-privileges', `--dbname=${decodeURIComponent(target.pathname.slice(1))}`], target);
  const result = spawnSync(command.binary, command.args, { env: command.env, stdio: ['ignore', descriptor, 'pipe'] });
  if (result.error || result.status !== 0) throw new Error('PostgreSQL backup failed; check client availability and database access.');
} finally { fs.closeSync(descriptor); }
const bytes = fs.readFileSync(archive);
inspectArchive(bytes);
fs.writeFileSync(path.join(destination, 'backup.json'), JSON.stringify({ provider: 'postgres', createdAt: new Date().toISOString(), schema: 'public', databaseBytes: bytes.length, databaseSha256: crypto.createHash('sha256').update(bytes).digest('hex'), storageIncluded: false }, null, 2), { mode: 0o600 });
console.log(`Verified PostgreSQL archive: ${destination}. Private object storage requires its separate backup.`);
