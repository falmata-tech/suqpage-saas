import { authenticateReviewer, reviewerEmail, reviewerSignInMode, ReviewerAccessError } from './reviewer-access';
import { configuredReviewer, reviewerAccounts, reviewerProvider } from './reviewer-access-runtime';
import { consumeRuntimeRateLimit, resetRuntimeRateLimit } from './rate-limit-runtime';
import { hashPrivateValue, requestIpFromHeaders } from './security';

export async function reviewMode(request: Request, email: unknown) {
  const rate = await consumeRuntimeRateLimit('review:mode:' + hashPrivateValue(requestIpFromHeaders(request.headers)), 120, 60 * 60000);
  if (!rate.allowed) throw new ReviewerAccessError('Too many attempts. Try again later.', 429);
  return reviewerSignInMode(configuredReviewer(), reviewerAccounts, reviewerEmail(email));
}
export async function reviewPassword(request: Request, body: Record<string, unknown>) {
  if (Object.keys(body).some(key => !['email','password'].includes(key)))
    throw new ReviewerAccessError('Invalid request.', 400);
  const email = reviewerEmail(body.email);
  const key = 'review:password:' + hashPrivateValue(requestIpFromHeaders(request.headers)) + ':' + hashPrivateValue(email);
  const rate = await consumeRuntimeRateLimit(key, 8, 15 * 60000, 30 * 60000);
  if (!rate.allowed) throw new ReviewerAccessError('Too many attempts. Try again later.', 429);
  const session = await authenticateReviewer(configuredReviewer(), reviewerAccounts, reviewerProvider(), {email, password: body.password});
  await resetRuntimeRateLimit(key);
  return session;
}
