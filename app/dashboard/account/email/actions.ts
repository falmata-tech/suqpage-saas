'use server';

import { requireUser } from '@/lib/auth';
import { currentSupabaseProviderIdentity } from '@/lib/supabase-auth';
import { OwnerEmailChangeError } from '@/lib/owner-email-change';
import { ownerEmailChangeStatus, requestOwnerEmailChange, verifyOwnerEmailChangeCode } from '@/lib/owner-email-runtime';

type EmailTaskResult =
  | { state: 'idle' }
  | { state: 'pending'; newEmail?: string; oldVerified?: boolean; newVerified?: boolean; expired?: boolean }
  | { state: 'complete' }
  | { state: 'error'; error: OwnerEmailChangeError['code'] };

function safeError(error: unknown): EmailTaskResult {
  return { state: 'error', error: error instanceof OwnerEmailChangeError ? error.code : 'try_again' };
}

export async function requestSignInEmailChange(form: FormData): Promise<EmailTaskResult> {
  const actor = await requireUser();
  const identity = await currentSupabaseProviderIdentity();
  if (!identity) return { state: 'error', error: 'owner_only' };
  if ([...form.keys()].some(key => key !== 'newEmail' && !key.startsWith('$ACTION_'))) return { state: 'error', error: 'invalid_email' };
  try {
    await requestOwnerEmailChange(actor, identity, form.get('newEmail'));
    return await ownerEmailChangeStatus(actor, identity);
  } catch (error) { return safeError(error); }
}

export async function verifySignInEmailCode(form: FormData): Promise<EmailTaskResult> {
  const actor = await requireUser();
  const identity = await currentSupabaseProviderIdentity();
  if (!identity) return { state: 'error', error: 'owner_only' };
  if ([...form.keys()].some(key => !['mailbox', 'code'].includes(key) && !key.startsWith('$ACTION_'))) return { state: 'error', error: 'invalid_code' };
  const mailbox = form.get('mailbox');
  if (mailbox !== 'current' && mailbox !== 'new') return { state: 'error', error: 'invalid_code' };
  try {
    const result = await verifyOwnerEmailChangeCode(actor, identity, mailbox, form.get('code'));
    if (result.state === 'complete') return result;
    return await ownerEmailChangeStatus(actor, identity);
  } catch (error) { return safeError(error); }
}
