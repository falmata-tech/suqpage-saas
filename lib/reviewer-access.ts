export type ReviewerBinding = { email: string; providerId: string };
export type ReviewerAccount = {
  providerId: string;
  email: string;
  linkedEmail: string;
  userId: number;
  businessId: number;
  role: string;
  demo: boolean;
  businessStatus: string;
};
export type ReviewerSession = {
  providerId: string;
  email: string;
  verifiedEmail: boolean;
  accessToken: string;
  refreshToken: string;
};
export interface ReviewerAccountPort {
  read(providerId: string): Promise<ReviewerAccount | null>;
}
export interface ReviewerIdentityPort {
  authenticate(email: string, password: string): Promise<ReviewerSession | null>;
  revoke(session: ReviewerSession): Promise<void>;
}
export class ReviewerAccessError extends Error {
  constructor(message: string, readonly status = 401) { super(message); }
}
export function reviewerEmail(value: unknown): string {
  if (typeof value !== 'string') throw new ReviewerAccessError('Enter a valid email address.', 400);
  const email = value.trim().toLowerCase();
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ReviewerAccessError('Enter a valid email address.', 400);
  return email;
}
export function reviewerBinding(email: string | undefined, providerId: string | undefined): ReviewerBinding | null {
  if (!email && !providerId) return null;
  if (!email || !providerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(providerId))
    throw new ReviewerAccessError('Sign-in is temporarily unavailable.', 503);
  try { return { email: reviewerEmail(email), providerId: providerId.toLowerCase() }; }
  catch { throw new ReviewerAccessError('Sign-in is temporarily unavailable.', 503); }
}
function eligible(binding: ReviewerBinding, account: ReviewerAccount | null): account is ReviewerAccount {
  return Boolean(account && account.providerId === binding.providerId && account.email.toLowerCase() === binding.email
    && account.linkedEmail.toLowerCase() === binding.email && account.role === 'client' && account.demo
    && Number.isSafeInteger(account.userId) && account.userId > 0
    && Number.isSafeInteger(account.businessId) && account.businessId > 0
    && ['active', 'draft'].includes(account.businessStatus));
}
export async function reviewerSignInMode(binding: ReviewerBinding | null, accounts: ReviewerAccountPort, email: string): Promise<'otp' | 'password'> {
  if (!binding || email !== binding.email) return 'otp';
  if (!eligible(binding, await accounts.read(binding.providerId)))
    throw new ReviewerAccessError('Sign-in is temporarily unavailable.', 503);
  return 'password';
}
export async function authenticateReviewer(binding: ReviewerBinding | null, accounts: ReviewerAccountPort,
  identity: ReviewerIdentityPort, input: { email: string; password: unknown }): Promise<ReviewerSession> {
  const fail = () => new ReviewerAccessError('Email or password is incorrect.');
  if (!binding || input.email !== binding.email || typeof input.password !== 'string'
    || input.password.length < 12 || input.password.length > 128) throw fail();
  const before = await accounts.read(binding.providerId);
  if (!eligible(binding, before)) throw fail();
  let session: ReviewerSession | null;
  try { session = await identity.authenticate(binding.email, input.password); }
  catch { throw new ReviewerAccessError('Sign-in is temporarily unavailable.', 503); }
  if (!session) throw fail();
  let valid = false;
  try {
    const after = await accounts.read(binding.providerId);
    valid = session.providerId === binding.providerId && session.email.toLowerCase() === binding.email
      && session.verifiedEmail && Boolean(session.accessToken) && Boolean(session.refreshToken)
      && eligible(binding, after) && after.userId === before.userId && after.businessId === before.businessId;
  } finally {
    if (!valid) await identity.revoke(session);
  }
  if (!valid) throw fail();
  return session;
}
