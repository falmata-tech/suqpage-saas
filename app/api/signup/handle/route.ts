import { NextResponse } from 'next/server';
import { currentSupabaseProviderIdentity } from '@/lib/supabase-auth';
import { consumeRuntimeRateLimit } from '@/lib/rate-limit-runtime';
import { hashPrivateValue } from '@/lib/security';
import { parseBusinessHandle } from '@/lib/business-handle';
import { getHandleAvailability } from '@/lib/handle-availability';

export const runtime = 'nodejs';
const reply = (body: object, status = 200) => NextResponse.json(body, {
  status, headers: {'Cache-Control': 'no-store', ...(status === 429 ? {'Retry-After': '60'} : {})},
});
export async function GET(request: Request) {
  try {
    const identity = await currentSupabaseProviderIdentity();
    if (!identity) return reply({error: 'Sign in before setting up your business.'}, 401);
    const rate = await consumeRuntimeRateLimit(`handle-check:${hashPrivateValue(identity.providerUserId)}`, 60, 60_000, 60_000);
    if (!rate.allowed) return reply({error: 'Please wait a moment and try again.'}, 429);
    let handle: string;
    try { handle = parseBusinessHandle(new URL(request.url).searchParams.get('handle')); }
    catch (error) { return reply({error: error instanceof Error ? error.message : 'Enter a page handle.'}, 400); }
    return reply(await getHandleAvailability(handle));
  } catch {
    return reply({error: 'Could not check this handle. Try again.'}, 503);
  }
}
