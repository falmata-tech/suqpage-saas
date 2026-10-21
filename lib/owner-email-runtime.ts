import { authDriver } from './config';
import type { SupabaseClient } from '@supabase/supabase-js';
import { runtimeGet, runtimeRun, runtimeTransaction } from './runtime-sql';
import { createSuqpageSupabaseAdminClient, createSuqpageSupabaseServerClient } from './supabase-auth';
import {
  assertMatchingEmailChange, assertOwnerEmailActor, decideEmailReconciliation,
  normalizedSignInEmail, sixDigitEmailCode, sessionIssuedAfterEmailChange,
  verifiedJwtIssueTime,
  type AuthoritativeEmail, type OwnerEmailChange, type VerifiedOwnerIdentity,
  OwnerEmailChangeError,
} from './owner-email-change';
import type { SessionUser } from './types';

const REQUEST_LIFETIME_MS = 60 * 60 * 1000;
const RESEND_WAIT_MS = 60 * 1000;

export function ownerEmailChangeEnabled() {
  return authDriver() === 'supabase' && process.env.SUQPAGE_OWNER_EMAIL_CHANGE_ENABLED === '1';
}

function assertEnabled() {
  if (!ownerEmailChangeEnabled()) throw new OwnerEmailChangeError('unavailable');
}

async function readChange(userId: number) {
  return await runtimeGet<OwnerEmailChange>('SELECT * FROM owner_email_change_requests WHERE user_id=?', [userId]) || null;
}

async function readProvider(providerUserId: string): Promise<AuthoritativeEmail> {
  const { data, error } = await createSuqpageSupabaseAdminClient().auth.admin.getUserById(providerUserId);
  const user = data.user;
  if (error || !user || user.id !== providerUserId || !user.email) throw new OwnerEmailChangeError('try_again');
  return {
    providerUserId: user.id,
    email: normalizedSignInEmail(user.email),
    newEmail: user.new_email ? normalizedSignInEmail(user.new_email) : '',
    confirmed: Boolean(user.email_confirmed_at),
  };
}

async function assertCurrentLinkedOwner(actor: SessionUser, identity: VerifiedOwnerIdentity) {
  assertOwnerEmailActor(actor, identity);
  const row = await runtimeGet<{ email: string; access_role: string; business_id: number | null; provider_user_id: string }>(
    `SELECT u.email,p.access_role,u.business_id,l.provider_user_id FROM users u
      JOIN user_access_profiles p ON p.user_id=u.id
      JOIN auth_identity_links l ON l.user_id=u.id AND l.provider='supabase'
      WHERE u.id=?`, [actor.id],
  );
  if (!row || row.access_role !== 'client' || !row.business_id || row.email !== actor.email || row.provider_user_id !== identity.providerUserId) {
    throw new OwnerEmailChangeError('owner_only');
  }
}

export async function ownerEmailChangeStatus(actor: SessionUser, identity: VerifiedOwnerIdentity) {
  assertEnabled();
  await assertCurrentLinkedOwner(actor, identity);
  const change = await readChange(actor.id);
  if (!change || change.state === 'reconciled') return { state: 'idle' as const };
  const provider = await readProvider(identity.providerUserId);
  if (provider.email === change.new_email) {
    await reconcileOwnerEmailIdentity(actor, identity.providerUserId);
    return { state: 'complete' as const };
  }
  if (provider.email !== change.old_email || provider.newEmail !== change.new_email) {
    throw new OwnerEmailChangeError('identity_mismatch');
  }
  if (change.state === 'prepared' && provider.newEmail === change.new_email) {
    await runtimeRun("UPDATE owner_email_change_requests SET state='pending',last_sent_at=COALESCE(last_sent_at,?) WHERE user_id=? AND state='prepared'", [Date.now(), actor.id]);
  }
  return {
    state: 'pending' as const,
    newEmail: change.new_email,
    oldVerified: Boolean(change.old_verified_at),
    newVerified: Boolean(change.new_verified_at),
    expired: change.expires_at <= Date.now(),
  };
}

export async function prepareOwnerEmailChange(actor: SessionUser, identity: VerifiedOwnerIdentity, proposed: unknown) {
  assertEnabled();
  await assertCurrentLinkedOwner(actor, identity);
  const email = normalizedSignInEmail(proposed);
  if (email === actor.email) throw new OwnerEmailChangeError('invalid_email');
  const now = Date.now();
  return runtimeTransaction(async () => {
    const row = await runtimeGet<OwnerEmailChange>('SELECT * FROM owner_email_change_requests WHERE user_id=? FOR UPDATE', [actor.id]);
    if (row && row.state !== 'reconciled' && row.new_email !== email) throw new OwnerEmailChangeError('pending');
    if (row?.state === 'pending') throw new OwnerEmailChangeError('pending');
    if (row?.state === 'prepared' && row.last_sent_at && now - row.last_sent_at < RESEND_WAIT_MS) throw new OwnerEmailChangeError('try_again');
    const conflict = await runtimeGet<{ id: number }>('SELECT id FROM users WHERE email=? AND id<>?', [email, actor.id]);
    if (conflict) throw new OwnerEmailChangeError('invalid_email');
    if (!row || row.state === 'reconciled') {
      await runtimeRun(`INSERT INTO owner_email_change_requests
        (user_id,provider_user_id,old_email,new_email,state,requested_at,expires_at,last_sent_at)
        VALUES(?,?,?,?,'prepared',?,?,?)
        ON CONFLICT(user_id) DO UPDATE SET provider_user_id=excluded.provider_user_id,old_email=excluded.old_email,
        new_email=excluded.new_email,state='prepared',requested_at=excluded.requested_at,expires_at=excluded.expires_at,
        last_sent_at=excluded.last_sent_at,old_verified_at=NULL,new_verified_at=NULL,reconciled_at=NULL`,
      [actor.id, identity.providerUserId, actor.email, email, now, now + REQUEST_LIFETIME_MS, now]);
    } else {
      await runtimeRun("UPDATE owner_email_change_requests SET last_sent_at=? WHERE user_id=? AND state='prepared'", [now, actor.id]);
    }
    return email;
  });
}

export async function acceptOwnerEmailChangeRequest(actor: SessionUser, identity: VerifiedOwnerIdentity) {
  assertEnabled();
  await assertCurrentLinkedOwner(actor, identity);
  const change = await readChange(actor.id);
  if (!change || change.provider_user_id !== identity.providerUserId || change.old_email !== actor.email || change.state !== 'prepared') {
    throw new OwnerEmailChangeError('pending');
  }
  const provider = await readProvider(identity.providerUserId);
  if (provider.email !== actor.email || provider.newEmail !== change.new_email) {
    throw new OwnerEmailChangeError('identity_mismatch');
  }
  await runtimeRun("UPDATE owner_email_change_requests SET state='pending',last_sent_at=? WHERE user_id=? AND provider_user_id=? AND new_email=? AND state='prepared'", [Date.now(), actor.id, identity.providerUserId, change.new_email]);
  return { state: 'pending' as const };
}

export async function requestOwnerEmailChange(actor: SessionUser, identity: VerifiedOwnerIdentity, proposed: unknown) {
  const prepared = await prepareOwnerEmailChange(actor, identity, proposed);
  const currentProvider = await readProvider(identity.providerUserId);
  if (currentProvider.email !== actor.email || currentProvider.newEmail && currentProvider.newEmail !== prepared) {
    throw new OwnerEmailChangeError('identity_mismatch');
  }
  if (currentProvider.newEmail !== prepared) {
    const client = await createSuqpageSupabaseServerClient();
    const { error, data } = await client.auth.updateUser({ email: prepared });
    if (error || data.user?.id !== identity.providerUserId) {
      const after = await readProvider(identity.providerUserId);
      if (after.email !== actor.email || after.newEmail !== prepared) throw new OwnerEmailChangeError('try_again');
    }
  }
  // A provider that changes immediately is not in the required dual-proof mode.
  return acceptOwnerEmailChangeRequest(actor, identity);
}

export async function verifyOwnerEmailChangeCode(actor: SessionUser, identity: VerifiedOwnerIdentity, mailbox: 'current' | 'new', inputCode: unknown, native?: { client: SupabaseClient; accessToken: string }) {
  assertEnabled();
  await assertCurrentLinkedOwner(actor, identity);
  const code = sixDigitEmailCode(inputCode);
  const change = await readChange(actor.id);
  if (!change) throw new OwnerEmailChangeError('pending');
  assertMatchingEmailChange(change, actor, identity, Date.now());
  if (mailbox === 'current' ? change.old_verified_at : change.new_verified_at) throw new OwnerEmailChangeError('invalid_code');
  const email = mailbox === 'current' ? change.old_email : change.new_email;
  const client = native?.client || await createSuqpageSupabaseServerClient();
  const presentedToken = native?.accessToken || (await client.auth.getSession()).data.session?.access_token;
  if (!presentedToken || verifiedJwtIssueTime(presentedToken, identity.providerUserId) === null) throw new OwnerEmailChangeError('owner_only');
  const { data, error } = await client.auth.verifyOtp({ email, token: code, type: 'email_change' });
  // GoTrue can confirm the current-address code without returning a user or
  // session. Re-read the exact linked provider UUID and its pending email below.
  if (error || (data.user && data.user.id !== identity.providerUserId)) throw new OwnerEmailChangeError('invalid_code');
  const provider = await readProvider(identity.providerUserId);
  const stamp = Date.now();
  const column = mailbox === 'current' ? 'old_verified_at' : 'new_verified_at';
  if (provider.email === change.new_email) {
    // Revoke every refresh session before recording the final proof. Otherwise
    // an old session could refresh into a post-fence JWT after reconciliation.
    const revoked = await createSuqpageSupabaseAdminClient().auth.admin.signOut(presentedToken, 'global');
    if (revoked.error) throw new OwnerEmailChangeError('try_again');
  }
  await runtimeRun(`UPDATE owner_email_change_requests SET ${column}=COALESCE(${column},?) WHERE user_id=? AND provider_user_id=? AND state='pending'`, [stamp, actor.id, identity.providerUserId]);
  if (provider.email === change.new_email) {
    await reconcileOwnerEmailIdentity(actor, identity.providerUserId);
    if (!native) await client.auth.signOut({ scope: 'local' });
    return { state: 'complete' as const };
  }
  if (provider.email !== change.old_email || provider.newEmail !== change.new_email) throw new OwnerEmailChangeError('identity_mismatch');
  return { state: 'pending' as const };
}

/** Reconcile only an already confirmed provider email on the same immutable UUID. */
export async function reconcileOwnerEmailIdentity(actor: SessionUser, providerUserId: string) {
  const provider = await readProvider(providerUserId);
  if (actor.email === provider.email) return actor;
  const change = await readChange(actor.id);
  if (decideEmailReconciliation(change, provider, actor.email) !== 'reconcile') throw new OwnerEmailChangeError('identity_mismatch');
  return runtimeTransaction(async () => {
    const row = await runtimeGet<OwnerEmailChange>('SELECT * FROM owner_email_change_requests WHERE user_id=? FOR UPDATE', [actor.id]);
    const linked = await runtimeGet<{ email: string; access_role: string; business_id: number | null; provider_user_id: string }>(
      `SELECT u.email,p.access_role,u.business_id,l.provider_user_id FROM users u
       JOIN user_access_profiles p ON p.user_id=u.id JOIN auth_identity_links l ON l.user_id=u.id AND l.provider='supabase'
       WHERE u.id=? FOR UPDATE OF u,p,l`, [actor.id]);
    if (!row || !linked || linked.email !== actor.email || linked.access_role !== 'client' || !linked.business_id || linked.provider_user_id !== providerUserId ||
        decideEmailReconciliation(row, provider, linked.email) !== 'reconcile') throw new OwnerEmailChangeError('identity_mismatch');
    const now = Date.now(), fence = Math.floor(now / 1000);
    const updated = await runtimeRun('UPDATE users SET email=? WHERE id=? AND email=?', [provider.email, actor.id, actor.email]);
    if (Number(updated.changes) !== 1) throw new OwnerEmailChangeError('identity_mismatch');
    await runtimeRun("UPDATE owner_email_change_requests SET state='reconciled',reconciled_at=? WHERE user_id=? AND state<>'reconciled'", [now, actor.id]);
    await runtimeRun(`INSERT INTO owner_auth_session_fences(user_id,valid_after_epoch_seconds) VALUES(?,?)
      ON CONFLICT(user_id) DO UPDATE SET valid_after_epoch_seconds=GREATEST(owner_auth_session_fences.valid_after_epoch_seconds,excluded.valid_after_epoch_seconds)`, [actor.id, fence]);
    return { ...actor, email: provider.email };
  });
}

export async function ownerSessionAllowed(userId: number, issuedAtSeconds: number | null) {
  const schema = await runtimeGet<{ migration_installed: boolean; fence_table: string | null }>(
    "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version=77) migration_installed,to_regclass('owner_auth_session_fences')::text fence_table",
  );
  if (!schema?.fence_table) {
    if (schema?.migration_installed) throw new OwnerEmailChangeError('identity_mismatch');
    return true;
  }
  const row = await runtimeGet<{ valid_after_epoch_seconds: number }>('SELECT valid_after_epoch_seconds FROM owner_auth_session_fences WHERE user_id=?', [userId]);
  return sessionIssuedAfterEmailChange(issuedAtSeconds, Number(row?.valid_after_epoch_seconds || 0));
}
