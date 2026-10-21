import { createClient } from '@supabase/supabase-js';
import { supabaseAuthConfig } from '../config';
import { OwnerEmailChangeError } from '../owner-email-change';
import {
  acceptOwnerEmailChangeRequest, ownerEmailChangeEnabled, ownerEmailChangeStatus,
  prepareOwnerEmailChange, verifyOwnerEmailChangeCode,
} from '../owner-email-runtime';
import { jsonBody, MobileError, nativeIdentity, type NativeIdentityPort } from './http';

function boundedBodyFields(body: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(body).some(key => !allowed.includes(key))) throw new MobileError('Invalid request.', 400);
}

export async function mobileOwnerEmailChange(request: Request, path: string[], identityPort?: NativeIdentityPort) {
  if (!ownerEmailChangeEnabled()) throw new MobileError('Email change is temporarily unavailable.', 503, 'unavailable');
  const { user, identity } = await nativeIdentity(request, identityPort);
  if (!user || user.access_role !== 'client' || !user.business_id) throw new MobileError('Sign in as the account owner to continue.', 403, 'owner_only');
  const linked = { providerUserId: identity.id, email: identity.email, userId: user.id };
  const step = path[2] || '';
  try {
    if (request.method === 'GET' && step === 'status') return await ownerEmailChangeStatus(user, linked);
    if (request.method !== 'POST') throw new MobileError('Method not allowed.', 405);
    if (step === 'prepare') {
      const body = await jsonBody(request);
      boundedBodyFields(body, ['newEmail']);
      return { state: 'prepared' as const, newEmail: await prepareOwnerEmailChange(user, linked, body.newEmail) };
    }
    if (step === 'sent') {
      const body = await jsonBody(request);
      boundedBodyFields(body, []);
      return await acceptOwnerEmailChangeRequest(user, linked);
    }
    if (step === 'code') {
      const body = await jsonBody(request);
      boundedBodyFields(body, ['mailbox', 'code']);
      if (body.mailbox !== 'current' && body.mailbox !== 'new') throw new MobileError('The code is invalid or expired.', 400, 'invalid_code');
      const settings = supabaseAuthConfig();
      const token = request.headers.get('authorization')!.slice(7);
      const client = createClient(settings.url, settings.publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(settings.requestTimeoutMs) }) },
      });
      return await verifyOwnerEmailChangeCode(user, linked, body.mailbox, body.code, { client, accessToken: token });
    }
    throw new MobileError('Not found.', 404);
  } catch (error) {
    if (!(error instanceof OwnerEmailChangeError)) throw error;
    const status = error.code === 'owner_only' ? 403 : error.code === 'unavailable' ? 503 : error.code === 'try_again' ? 503 : 400;
    const copy = error.code === 'invalid_code' || error.code === 'expired' ? 'The code is invalid or expired.'
      : error.code === 'invalid_email' ? 'Enter a different, valid email address.'
      : error.code === 'owner_only' ? 'Sign in as the account owner to continue.'
      : error.code === 'pending' ? 'A change is already pending.'
      : 'We could not finish the change. Try again.';
    throw new MobileError(copy, status, error.code);
  }
}
