import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertMatchingEmailChange, assertOwnerEmailActor, decideEmailReconciliation,
  normalizedSignInEmail, sessionIssuedAfterEmailChange, sixDigitEmailCode,
  verifiedJwtIssueTime, type OwnerEmailChange,
} from '../lib/owner-email-change';
import type { SessionUser } from '../lib/types';
import { mobileOwnerEmailChange } from '../lib/mobile/owner-email';
import type { NativeIdentityPort } from '../lib/mobile/http';

const owner: SessionUser = { id: 101, email: 'old@example.test', name: 'Owner', role: 'owner', access_role: 'client', business_id: 71, must_change_password: 0 };
const identity = { providerUserId: '8d9e66f4-6931-4c90-9ec5-376836dd9431', userId: owner.id, email: owner.email };
const change: OwnerEmailChange = {
  user_id: owner.id, provider_user_id: identity.providerUserId, old_email: owner.email, new_email: 'new@example.test',
  state: 'pending', requested_at: 100, expires_at: 3_600_100, last_sent_at: 100,
  old_verified_at: null, new_verified_at: null, reconciled_at: null,
};

test('FE-073 normalizes an address and requires a six-digit code', () => {
  assert.equal(normalizedSignInEmail(' New@Example.Test '), 'new@example.test');
  for (const value of ['bad', 'a @example.test', '', 'x'.repeat(255)]) assert.throws(() => normalizedSignInEmail(value));
  assert.equal(sixDigitEmailCode('012345'), '012345');
  for (const value of ['12345', '1234567', '123 456', 'abcdef', null]) assert.throws(() => sixDigitEmailCode(value));
});

test('FE-073 staff authority cannot become private owner identity authority', () => {
  assert.doesNotThrow(() => assertOwnerEmailActor(owner, identity));
  for (const actor of [
    { ...owner, access_role: 'team_member' as const },
    { ...owner, access_role: 'operations_manager' as const },
    { ...owner, access_role: 'platform_admin' as const },
    { ...owner, id: 102 }, { ...owner, business_id: null },
  ]) assert.throws(() => assertOwnerEmailActor(actor, identity));
  assert.throws(() => assertOwnerEmailActor(owner, { ...identity, providerUserId: 'other', email: 'other@example.test' }));
  assert.throws(() => assertMatchingEmailChange(change, owner, { ...identity, providerUserId: 'other' }, 200));
  assert.throws(() => assertMatchingEmailChange(change, owner, identity, change.expires_at));
});

test('FE-073 native account API denies staff even with business access', async () => {
  const beforeDriver = process.env.SUQPAGE_AUTH_DRIVER;
  const beforeFlag = process.env.SUQPAGE_OWNER_EMAIL_CHANGE_ENABLED;
  process.env.SUQPAGE_AUTH_DRIVER = 'supabase';
  process.env.SUQPAGE_OWNER_EMAIL_CHANGE_ENABLED = '1';
  try {
    const port: NativeIdentityPort = {
      verify: async () => ({ id: identity.providerUserId, email: owner.email }),
      linked: async () => owner.id,
      user: async () => ({ ...owner, access_role: 'team_member' }),
    };
    const request = new Request('http://127.0.0.1/api/mobile/v1/owner/email-change/prepare', {
      method: 'POST', headers: { Authorization: `Bearer ${'a'.repeat(40)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: 'attacker@example.test' }),
    });
    await assert.rejects(() => mobileOwnerEmailChange(request, ['owner', 'email-change', 'prepare'], port),
      (error: unknown) => Boolean(error && typeof error === 'object' && 'status' in error && error.status === 403));
  } finally {
    if (beforeDriver === undefined) delete process.env.SUQPAGE_AUTH_DRIVER;
    else process.env.SUQPAGE_AUTH_DRIVER = beforeDriver;
    if (beforeFlag === undefined) delete process.env.SUQPAGE_OWNER_EMAIL_CHANGE_ENABLED;
    else process.env.SUQPAGE_OWNER_EMAIL_CHANGE_ENABLED = beforeFlag;
  }
});

test('BE-061 reconciles only the exact confirmed UUID and proposed email', () => {
  const provider = { providerUserId: identity.providerUserId, email: change.new_email, newEmail: '', confirmed: true };
  const proven = { ...change, old_verified_at: 200, new_verified_at: 300 };
  assert.equal(decideEmailReconciliation(change, provider, change.old_email), 'deny', 'provider misconfiguration cannot bypass either app-verified mailbox code');
  assert.equal(decideEmailReconciliation({ ...proven, new_verified_at: null }, provider, change.old_email), 'deny');
  assert.equal(decideEmailReconciliation({ ...proven, old_verified_at: null }, provider, change.old_email), 'deny');
  assert.equal(decideEmailReconciliation(proven, provider, change.old_email), 'reconcile');
  assert.equal(decideEmailReconciliation(change, { ...provider, email: change.old_email }, change.old_email), 'unchanged');
  for (const forged of [
    { ...provider, providerUserId: 'other' }, { ...provider, email: 'third@example.test' },
    { ...provider, confirmed: false }, { ...provider, newEmail: 'another@example.test' },
  ]) assert.equal(decideEmailReconciliation(proven, forged, change.old_email), 'deny');
  assert.equal(decideEmailReconciliation(null, provider, change.old_email), 'deny');
  assert.equal(decideEmailReconciliation({ ...change, state: 'reconciled' }, provider, change.old_email), 'deny');
});

test('BE-061 rejects pre-change access JWT even if provider still accepts it', () => {
  const jwt = (sub: string, iat: number) => `x.${Buffer.from(JSON.stringify({ sub, iat })).toString('base64url')}.x`;
  const fence = 1_800_000_000;
  assert.equal(verifiedJwtIssueTime(jwt(identity.providerUserId, fence - 1), identity.providerUserId), fence - 1);
  assert.equal(verifiedJwtIssueTime(jwt('other', fence + 1), identity.providerUserId), null);
  assert.equal(verifiedJwtIssueTime('invalid', identity.providerUserId), null);
  assert.equal(sessionIssuedAfterEmailChange(fence - 1, fence), false);
  assert.equal(sessionIssuedAfterEmailChange(fence, fence), false);
  assert.equal(sessionIssuedAfterEmailChange(fence + 1, fence), true);
  assert.equal(sessionIssuedAfterEmailChange(null, fence), false);
});
