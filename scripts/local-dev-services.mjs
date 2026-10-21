import { execFile } from 'node:child_process';
import pg from 'pg';

// Captured output is deliberately never logged: Supabase prints local credentials.
const command = (file, args, timeout = 15_000) => new Promise(resolve => {
  execFile(file, args, { timeout, maxBuffer: 2 * 1024 * 1024 }, error => resolve(!error));
});

async function ready() {
  const client = new pg.Client({ connectionString: process.env.SUQPAGE_POSTGRES_URL, connectionTimeoutMillis: 1500, query_timeout: 1500 });
  try {
    await client.connect();
    await client.query('SELECT 1');
    const response = await fetch(`${process.env.SUQPAGE_SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '' },
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch { return false; }
  finally { await client.end().catch(() => {}); }
}

/** Narrow process/readiness port lets tests exercise startup without changing Docker. */
export async function ensureLocalServices(port = {
  command, ready, platform: process.platform, now: Date.now,
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)), log: console.log,
}) {
  if (await port.ready()) return;
  if (!await port.command('docker', ['--version'])) throw Error('Install Docker Desktop, then run npm run dev again.');
  if (!await port.command('docker', ['info', '--format', '{{.ServerVersion}}'])) {
    if (port.platform !== 'darwin') throw Error('Start your Docker engine, then run npm run dev again.');
    port.log('Starting Docker Desktop for local Suqpage…');
    if (!await port.command('open', ['-a', 'Docker'])) throw Error('Could not open Docker Desktop. Open it manually, then retry npm run dev.');
    const deadline = port.now() + 120_000;
    let running = false;
    while (port.now() < deadline) {
      if (await port.command('docker', ['info', '--format', '{{.ServerVersion}}'], 3000)) { running = true; break; }
      await port.sleep(2000);
    }
    if (!running) throw Error('Docker Desktop did not become ready within two minutes. Open Docker Desktop and retry.');
  }
  // Desktop may have already resumed the existing local containers.
  if (await port.ready()) return;
  if (!await port.command('supabase', ['--version'])) throw Error('Install the Supabase CLI, then run npm run dev again.');
  port.log('Starting this project’s local Supabase services (existing data is preserved)…');
  if (!await port.command('supabase', ['start'], 180_000)) {
    throw Error('Local Supabase could not start. Run npm run local:supabase:start to inspect the error, then retry.');
  }
  const deadline = port.now() + 180_000;
  while (port.now() < deadline) {
    if (await port.ready()) { port.log('Local PostgreSQL and Auth are ready.'); return; }
    await port.sleep(2000);
  }
  throw Error('Local PostgreSQL/Auth are still unavailable. Run npm run local:supabase:start and npm run local:supabase:configure, then retry.');
}
