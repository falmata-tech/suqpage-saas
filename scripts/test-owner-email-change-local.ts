import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { createPublicClientWorkspace } from '../lib/signup';
import { findPlaceSuggestions } from '../lib/place-catalog';
import { handleMobileRequest } from '../lib/mobile/router';
import { supabaseAuthConfig } from '../lib/config';

type OwnerCase = { userId: number; providerId: string; oldEmail: string; newEmail: string; token: string };
let proofStage = 'startup';

async function localCode(email: string) {
  proofStage = 'retrieve local email code';
  const response = await fetch('http://127.0.0.1:54324/api/v1/messages', { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200);
  const list = await response.json() as { messages?: Array<{ ID: string; To?: Array<{ Address: string }> }> };
  const matches = (list.messages || []).filter(message => message.To?.some(to => to.Address === email));
  assert.equal(matches.length, 1, 'one local code message must reach the intended mailbox');
  const detail = await fetch(`http://127.0.0.1:54324/api/v1/message/${encodeURIComponent(matches[0].ID)}`, { signal: AbortSignal.timeout(10000) });
  assert.equal(detail.status, 200);
  const body = await detail.json() as { HTML?: string };
  const code = /letter-spacing:0\.18em">(\d{6})</.exec(body.HTML || '')?.[1];
  assert.ok(code, 'OTP template must render a six-digit code');
  return code;
}

async function mobile(owner: OwnerCase, step: string, body?: Record<string, unknown>) {
  const path = ['owner', 'email-change', step];
  const request = new Request(`http://127.0.0.1/api/mobile/v1/${path.join('/')}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${owner.token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const response = await handleMobileRequest(request, path);
  return { status: response.status, body: await response.json() as Record<string, unknown> };
}

async function main() {
  const db = await getDb();
  const config = supabaseAuthConfig();
  assert.equal(new URL(config.url).origin, 'http://127.0.0.1:54321');
  process.env.SUQPAGE_AUTH_DRIVER = 'supabase';
  process.env.SUQPAGE_OWNER_EMAIL_CHANGE_ENABLED = '1';
  const admin = createClient(config.url, config.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const createdIds: string[] = [];
  async function makeOwner() {
    const suffix = crypto.randomUUID();
    const oldEmail = `qa-change-old-${suffix}@example.test`, newEmail = `qa-change-new-${suffix}@example.test`;
    const password = crypto.randomBytes(32).toString('base64url');
    const made = await admin.auth.admin.createUser({ email: oldEmail, password, email_confirm: true });
    assert.ifError(made.error); assert.ok(made.data.user);
    createdIds.push(made.data.user.id);
    const workspace = await createPublicClientWorkspace({ name: 'LOCAL QA Owner', businessName: 'LOCAL QA Email', businessCategory: 'home-living',
      placeId: findPlaceSuggestions('Addis Ababa')[0].id, phone: '+447700900125', consent: true, idempotencyKey: crypto.randomUUID() },
    { providerUserId: made.data.user.id, email: oldEmail });
    const client = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const signed = await client.auth.signInWithPassword({ email: oldEmail, password });
    assert.ifError(signed.error); assert.ok(signed.data.session);
    return { userId: workspace.userId, providerId: made.data.user.id, oldEmail, newEmail, token: signed.data.session.access_token, client };
  }
  try {
    proofStage = 'provision first owner';
    const owner = await makeOwner();
    proofStage = 'initial owner status';
    assert.equal((await mobile(owner, 'status')).body.state, 'idle');
    proofStage = 'prepare first request';
    assert.equal((await mobile(owner, 'prepare', { newEmail: owner.newEmail })).body.state, 'prepared');
    proofStage = 'duplicate request denial';
    assert.equal((await mobile(owner, 'prepare', { newEmail: owner.newEmail })).status, 503, 'duplicate send is rate-limited');
    proofStage = 'provider request';
    const requested = await owner.client.auth.updateUser({ email: owner.newEmail });
    if (requested.error) throw new Error(`local provider request failed: ${requested.error.code || requested.error.name} (${requested.error.status || 0})`);
    proofStage = 'acknowledge first provider request';
    assert.equal((await mobile(owner, 'sent', {})).body.state, 'pending');
    const oldCode = await localCode(owner.oldEmail), newCode = await localCode(owner.newEmail);
    assert.notEqual(oldCode, newCode);
    proofStage = 'verify current code API';
    const currentCodeResult = await mobile(owner, 'code', { mailbox: 'current', code: oldCode });
    if (currentCodeResult.body.state !== 'pending') throw new Error(`local code response: ${currentCodeResult.status}:${String(currentCodeResult.body.code || currentCodeResult.body.error || 'unknown')}`);
    proofStage = 'deny current code replay';
    assert.equal((await mobile(owner, 'code', { mailbox: 'current', code: oldCode })).status, 400, 'replay is denied');
    proofStage = 'provider unchanged after current code';
    assert.equal((await admin.auth.admin.getUserById(owner.providerId)).data.user?.email, owner.oldEmail);
    proofStage = 'application email unchanged after current code';
    assert.equal((await db.prepare('SELECT email FROM users WHERE id=?').get(owner.userId)).email, owner.oldEmail);
    proofStage = 'verify new address and reconcile';
    const finished = await mobile(owner, 'code', { mailbox: 'new', code: newCode });
    assert.equal(finished.status, 200);
    assert.equal(finished.body.state, 'complete');
    assert.equal((await admin.auth.admin.getUserById(owner.providerId)).data.user?.email, owner.newEmail);
    assert.equal((await db.prepare('SELECT email FROM users WHERE id=?').get(owner.userId)).email, owner.newEmail);
    assert.equal((await db.prepare('SELECT email_at_link FROM auth_identity_links WHERE user_id=?').get(owner.userId)).email_at_link, owner.oldEmail);
    assert.equal((await mobile(owner, 'status')).status, 401, 'old mobile JWT is fenced');
    proofStage = 'verify refresh revocation';
    const refreshed = await owner.client.auth.refreshSession();
    assert.ok(refreshed.error, 'old refresh session is revoked globally');

    const incomplete = await makeOwner();
    proofStage = 'prepare incomplete request';
    assert.equal((await mobile(incomplete, 'prepare', { newEmail: incomplete.newEmail })).status, 200);
    assert.ifError((await incomplete.client.auth.updateUser({ email: incomplete.newEmail })).error);
    assert.equal((await mobile(incomplete, 'sent', {})).status, 200);
    proofStage = 'expire incomplete request';
    const incompleteOldCode = await localCode(incomplete.oldEmail);
    assert.equal((await mobile(incomplete, 'code', { mailbox: 'current', code: incompleteOldCode })).body.state, 'pending');
    await db.prepare('UPDATE owner_email_change_requests SET expires_at=? WHERE user_id=?').run(Date.now() - 1, incomplete.userId);
    assert.equal((await mobile(incomplete, 'code', { mailbox: 'new', code: await localCode(incomplete.newEmail) })).status, 400);
    assert.equal((await admin.auth.admin.getUserById(incomplete.providerId)).data.user?.email, incomplete.oldEmail);
    assert.equal((await db.prepare('SELECT email FROM users WHERE id=?').get(incomplete.userId)).email, incomplete.oldEmail);
    console.log('PASS FE-073/BE-061/DEP-050 local Auth+Mailpit: owner-only prepared request, distinct old/new codes, first-code no change, replay and expiry denial, exact UUID reconciliation, historical link preserved, old JWT fenced and refresh globally revoked.');
  } finally {
    for (const id of createdIds) {
      const existing = await admin.auth.admin.getUserById(id);
      if (existing.data.user) assert.ifError((await admin.auth.admin.deleteUser(id)).error);
    }
    delete process.env.SUQPAGE_OWNER_EMAIL_CHANGE_ENABLED;
    await closeDbForTests();
  }
}

main().catch(error => { console.error(`Local owner email regression failed at ${proofStage} (${error instanceof Error ? /^(local provider request failed:|local code response:)/.test(error.message) ? error.message : error.name : 'unknown error'}).`); process.exitCode = 1; });
