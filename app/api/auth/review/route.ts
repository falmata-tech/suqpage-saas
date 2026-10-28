import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/security';
import { jsonBody, MobileError } from '@/lib/mobile/http';
import { reviewPassword } from '@/lib/reviewer-access-http';
import { ReviewerAccessError } from '@/lib/reviewer-access';
import { createAfricMadeSupabaseServerClient } from '@/lib/supabase-auth';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    try { assertSameOrigin(request); } catch { throw new ReviewerAccessError('Invalid request origin.',403); }
    const session = await reviewPassword(request, await jsonBody(request));
    const client = await createAfricMadeSupabaseServerClient();
    const {error} = await client.auth.setSession({access_token: session.accessToken, refresh_token: session.refreshToken});
    if (error) throw new ReviewerAccessError('Sign-in is temporarily unavailable.', 503);
    return NextResponse.json({destination: '/dashboard'}, {headers: {'Cache-Control':'private, no-store'}});
  } catch (error) {
    const known = error instanceof ReviewerAccessError || error instanceof MobileError;
    return NextResponse.json({error: known ? error.message : 'Sign-in is temporarily unavailable.'},
      {status: known ? error.status : 503, headers: {'Cache-Control':'private, no-store'}});
  }
}
