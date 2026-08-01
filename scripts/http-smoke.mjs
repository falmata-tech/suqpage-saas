import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suqpage-http-'));
const port = await new Promise((resolve, reject) => {
  const server = net.createServer();
  server.unref();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    const selected = typeof address === 'object' && address ? address.port : 0;
    server.close((error) => (error ? reject(error) : resolve(selected)));
  });
});
const baseUrl = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  SUQPAGE_DB_PATH: path.join(root, 'app.db'),
  SUQPAGE_MEDIA_ROOT: path.join(root, 'media'),
  SUQPAGE_CREDENTIAL_PATH: path.join(root, 'seed-credentials.txt'),
  SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT: '1',
  PRIVACY_SALT: 'http-test-privacy-salt-long-enough',
  NEXT_PUBLIC_APP_URL: baseUrl,
  PORT: String(port),
};

const setup = spawnSync(
  process.execPath,
  ['node_modules/tsx/dist/cli.mjs', 'scripts/setup.ts', '--reset'],
  { cwd: process.cwd(), env, stdio: 'inherit' },
);
if (setup.status !== 0) process.exit(setup.status || 1);

const db = new DatabaseSync(env.SUQPAGE_DB_PATH);
db.prepare("UPDATE businesses SET status='draft' WHERE handle='koba-leather'").run();
fs.mkdirSync(env.SUQPAGE_MEDIA_ROOT, { recursive: true });
const mediaName = 'product-11111111-1111-4111-8111-111111111111.png';
fs.writeFileSync(
  path.join(env.SUQPAGE_MEDIA_ROOT, mediaName),
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=',
    'base64',
  ),
);
const product = db
  .prepare(
    "SELECT p.id,p.business_id FROM products p JOIN businesses b ON b.id=p.business_id WHERE b.handle='selam-weave' ORDER BY p.id LIMIT 1",
  )
  .get();
const other = db
  .prepare(
    "SELECT p.id FROM products p JOIN businesses b ON b.id=p.business_id WHERE b.handle='nova-assembly' ORDER BY p.id LIMIT 1",
  )
  .get();
const groups = db
  .prepare('SELECT id,name FROM option_groups WHERE product_id=?')
  .all(product.id);
const options = Object.fromEntries(
  groups.map((group) => [
    group.name,
    db
      .prepare('SELECT value FROM option_values WHERE option_group_id=? LIMIT 1')
      .get(group.id).value,
  ]),
);
db.close();

const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
  {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  },
);
child.stdout.on('data', (data) => process.stdout.write(data));
child.stderr.on('data', (data) => process.stderr.write(data));

async function stopServer() {
  if (child.exitCode !== null) return;

  const closed = new Promise((resolve) => child.once('close', resolve));
  try {
    if (process.platform === 'win32') child.kill('SIGTERM');
    else process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }

  const stopped = await Promise.race([
    closed.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 4_000)),
  ]);

  if (!stopped && child.exitCode === null) {
    try {
      if (process.platform === 'win32') child.kill('SIGKILL');
      else process.kill(-child.pid, 'SIGKILL');
    } catch {
      child.kill('SIGKILL');
    }
    await Promise.race([
      closed,
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);
  }
}

try {
  let ready = false;
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Server did not start');

  const home = await fetch(`${baseUrl}/`);
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('x-frame-options'), 'DENY');
  assert.match(
    home.headers.get('content-security-policy') || '',
    /frame-ancestors 'none'/,
  );
  assert.equal((await fetch(`${baseUrl}/@selam-weave`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/@koba-leather`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/media/${mediaName}`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/malikt/requests`)).status, 401);
  assert.equal(
    (
      await fetch(`${baseUrl}/api/malikt/requests`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
    ).status,
    401,
  );

  const requestPayload = {
    contactName: 'HTTP Prospect', contactValue: 'http-prospect@example.test', businessName: 'HTTP Market',
    requestText: 'I am interested in a managed SuqPage showroom.', idempotencyKey: 'http-request-key-0001', consent: true,
  };
  const requestCreated = await fetch(`${baseUrl}/api/requests`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(requestPayload) });
  assert.equal(requestCreated.status, 201);
  assert.match((await requestCreated.json()).reference, /^REQ-[A-F0-9]{12}$/);
  const requestDuplicate = await fetch(`${baseUrl}/api/requests`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(requestPayload) });
  assert.equal(requestDuplicate.status, 200);
  assert.equal((await requestDuplicate.json()).duplicate, true);
  const publicUpload = new FormData();
  publicUpload.set('contactName', 'Upload Attempt');
  publicUpload.set('images', new File([fs.readFileSync(path.join(process.cwd(), 'public/uploads/seed/suqpage/icon.png'))], 'blocked.png', { type: 'image/png' }));
  assert.equal((await fetch(`${baseUrl}/api/requests`, { method: 'POST', body: publicUpload })).status, 415);
  const requestDb = new DatabaseSync(env.SUQPAGE_DB_PATH, { readOnly: true });
  assert.equal(requestDb.prepare("SELECT COUNT(*) count FROM request_attachments a JOIN service_requests r ON r.id=a.request_id WHERE r.submitter_kind='public'").get().count, 0);
  requestDb.close();
  const crossOrigin = await fetch(`${baseUrl}/api/requests`, { method: 'POST', headers: { origin: 'https://attacker.example', 'x-forwarded-host': 'attacker.example', 'content-type': 'application/json' }, body: JSON.stringify(requestPayload) });
  assert.equal(crossOrigin.status, 403);

  const forged = await fetch(`${baseUrl}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      businessId: product.business_id,
      customerName: 'Test',
      contact: '251900000000',
      contactMethod: 'phone',
      idempotencyKey: 'http-forged-001',
      items: [{ productId: other.id, quantity: 1, options: {} }],
    }),
  });
  assert.equal(forged.status, 400);

  const missingPhone = await fetch(`${baseUrl}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      businessId: product.business_id,
      customerName: 'Test',
      contact: 'test@example.test',
      contactMethod: 'email',
      idempotencyKey: 'http-contact-001',
      items: [{ productId: product.id, quantity: '1 pallet', options }],
    }),
  });
  assert.equal(missingPhone.status, 400);
  assert.match((await missingPhone.json()).error, /phone number is required/i);

  const invalidPhone = await fetch(`${baseUrl}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      businessId: product.business_id,
      customerName: 'Test',
      contact: '123',
      contactMethod: 'phone',
      idempotencyKey: 'http-contact-002',
      items: [{ productId: product.id, quantity: '1 pallet', options }],
    }),
  });
  assert.equal(invalidPhone.status, 400);
  assert.match((await invalidPhone.json()).error, /7 to 15 digits/i);

  const payload = {
    businessId: product.business_id,
    customerName: 'Test',
    contact: '251900000000',
    contactMethod: 'phone',
    idempotencyKey: 'http-valid-001',
    items: [{ productId: product.id, quantity: 1, options }],
  };
  const valid = await fetch(`${baseUrl}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal(valid.status, 201);

  const duplicate = await fetch(`${baseUrl}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);

  let limited = false;
  for (let i = 0; i < 15; i += 1) {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        idempotencyKey: `http-rate-${String(i).padStart(3, '0')}`,
      }),
    });
    if (response.status === 429) {
      limited = true;
      break;
    }
  }
  assert.equal(limited, true);
  console.log('Production HTTP smoke tests passed.');
} finally {
  await stopServer();
  fs.rmSync(root, { recursive: true, force: true });
}

process.exit(0);
