import type { SessionUser } from './types';

export type OwnerEmailChangeState = 'prepared' | 'pending' | 'reconciled';
export type OwnerEmailChange = {
  user_id: number;
  provider_user_id: string;
  old_email: string;
  new_email: string;
  state: OwnerEmailChangeState;
  requested_at: number;
  expires_at: number;
  last_sent_at: number | null;
  old_verified_at: number | null;
  new_verified_at: number | null;
  reconciled_at: number | null;
};
export type VerifiedOwnerIdentity = { providerUserId: string; email: string; userId: number | null };
export type AuthoritativeEmail = { providerUserId: string; email: string; newEmail: string; confirmed: boolean };

export class OwnerEmailChangeError extends Error {
  constructor(readonly code: 'unavailable' | 'owner_only' | 'invalid_email' | 'invalid_code' | 'pending' | 'expired' | 'identity_mismatch' | 'try_again') {
    super(code);
  }
}

export function normalizedSignInEmail(input: unknown): string {
  if (typeof input !== 'string') throw new OwnerEmailChangeError('invalid_email');
  const email = input.trim().toLowerCase();
  if (email.length < 3 || email.length > 254 || /[\u0000-\u0020\u007f]/.test(email) || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    throw new OwnerEmailChangeError('invalid_email');
  }
  return email;
}

export function sixDigitEmailCode(input: unknown): string {
  if (typeof input !== 'string' || !/^\d{6}$/.test(input)) throw new OwnerEmailChangeError('invalid_code');
  return input;
}

export function assertOwnerEmailActor(actor: SessionUser | null, identity: VerifiedOwnerIdentity | null): asserts actor is SessionUser {
  if (!actor || actor.access_role !== 'client' || !actor.business_id || !identity || identity.userId !== actor.id || identity.email !== actor.email) {
    throw new OwnerEmailChangeError('owner_only');
  }
}

export function assertMatchingEmailChange(change: OwnerEmailChange, actor: SessionUser, identity: VerifiedOwnerIdentity, now: number) {
  if (actor.id !== change.user_id || identity.providerUserId !== change.provider_user_id || identity.userId !== change.user_id || identity.email !== change.old_email) {
    throw new OwnerEmailChangeError('identity_mismatch');
  }
  if (change.state !== 'pending') throw new OwnerEmailChangeError('pending');
  if (change.expires_at <= now) throw new OwnerEmailChangeError('expired');
}

export function decideEmailReconciliation(change: OwnerEmailChange | null, provider: AuthoritativeEmail, localEmail: string): 'unchanged' | 'reconcile' | 'deny' {
  if (localEmail === provider.email) return 'unchanged';
  if (!change || change.provider_user_id !== provider.providerUserId || change.state === 'reconciled' ||
      change.old_email !== localEmail || change.new_email !== provider.email || !provider.confirmed || provider.newEmail ||
      !change.old_verified_at || !change.new_verified_at) return 'deny';
  return 'reconcile';
}

export function sessionIssuedAfterEmailChange(issuedAtSeconds: number | null, validAfterSeconds: number): boolean {
  return validAfterSeconds <= 0 || issuedAtSeconds !== null && Number.isSafeInteger(issuedAtSeconds) && issuedAtSeconds > validAfterSeconds;
}

export function verifiedJwtIssueTime(accessToken: string, expectedProviderUserId: string): number | null {
  try {
    const [, payload] = accessToken.split('.');
    if (!payload) return null;
    const claims: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!claims || typeof claims !== 'object' || Array.isArray(claims)) return null;
    const record = claims as Record<string, unknown>;
    return record.sub === expectedProviderUserId && Number.isSafeInteger(record.iat) && Number(record.iat) > 0 ? Number(record.iat) : null;
  } catch { return null; }
}
