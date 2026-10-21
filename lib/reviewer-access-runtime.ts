import { createClient } from '@supabase/supabase-js';
import { supabaseAuthConfig, supabaseAuthEnabled } from './config';
import { runtimeGet } from './runtime-sql';
import { reviewerBinding, ReviewerAccessError, type ReviewerAccountPort, type ReviewerIdentityPort } from './reviewer-access';

export function configuredReviewer() {
  return reviewerBinding(process.env.SUQPAGE_REVIEW_EMAIL, process.env.SUQPAGE_REVIEW_PROVIDER_ID);
}
export const reviewerAccounts: ReviewerAccountPort = {
  async read(providerId) {
    const row = await runtimeGet<{ provider_id: string; email: string; linked_email: string; user_id: number; business_id: number; access_role: string; is_demo: number; status: string }>(
      `SELECT l.provider_user_id provider_id,u.email,l.email_at_link linked_email,u.id user_id,b.id business_id,
       p.access_role,b.is_demo,b.status FROM auth_identity_links l JOIN users u ON u.id=l.user_id
       JOIN user_access_profiles p ON p.user_id=u.id JOIN businesses b ON b.id=u.business_id
       WHERE l.provider='supabase' AND l.provider_user_id=?`, [providerId]);
    return row ? {providerId: row.provider_id, email: row.email, linkedEmail: row.linked_email,
      userId: Number(row.user_id), businessId: Number(row.business_id), role: row.access_role,
      demo: Number(row.is_demo) === 1, businessStatus: row.status} : null;
  },
};
export function reviewerProvider(): ReviewerIdentityPort {
  const config = supabaseAuthConfig();
  if (!supabaseAuthEnabled() || !config.url || !config.publishableKey)
    throw new ReviewerAccessError('Sign-in is temporarily unavailable.', 503);
  const client = createClient(config.url, config.publishableKey, {
    auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
    global: {fetch: (input, init) => fetch(input, {...init, signal: AbortSignal.timeout(config.requestTimeoutMs)})},
  });
  return {
    async authenticate(email, password) {
      const {data, error} = await client.auth.signInWithPassword({email, password});
      if (error) {
        if ([400,401,422].includes(error.status || 0) || error.code === 'invalid_credentials') return null;
        throw new ReviewerAccessError('Sign-in is temporarily unavailable.',503);
      }
      if (!data.user?.email || !data.session) return null;
      return {providerId: data.user.id, email: data.user.email, verifiedEmail: Boolean(data.user.email_confirmed_at),
        accessToken: data.session.access_token, refreshToken: data.session.refresh_token};
    },
    async revoke() {
      const {error} = await client.auth.signOut({scope: 'local'});
      if (error) throw new ReviewerAccessError('Sign-in is temporarily unavailable.', 503);
    },
  };
}
