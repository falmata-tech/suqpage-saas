import { NextResponse } from "next/server";
import { supabaseAuthConfig, supabaseAuthEnabled } from "@/lib/config";
import { consumeRuntimeRateLimit } from "@/lib/rate-limit-runtime";
import { assertSameOrigin, audit, hashPrivateValue, requestIpFromHeaders } from "@/lib/security";
import { requestSupabaseEmailOtp } from "@/lib/supabase-auth";
import { reviewMode } from '@/lib/reviewer-access-http';
import { ReviewerAccessError } from '@/lib/reviewer-access';
import { boundedBody, MobileError } from '@/lib/mobile/http';

export const runtime = "nodejs";
const MAX_BODY_BYTES = 2 * 1024;

function emailFrom(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();
  return email.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export async function POST(request: Request) {
  const ipHash = hashPrivateValue(requestIpFromHeaders(request.headers));
  try {
    try { assertSameOrigin(request); } catch { throw new ReviewerAccessError('Invalid request origin.',403); }
    if (!supabaseAuthEnabled() || !supabaseAuthConfig().emailOtpEnabled) throw new Error("unavailable");
    if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new ReviewerAccessError('Send JSON.',415);
    const body: unknown = JSON.parse((await boundedBody(request, MAX_BODY_BYTES)).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ReviewerAccessError('Invalid request.', 400);
    const input = body as Record<string, unknown>;
    const email = emailFrom(input.email);
    if (!email) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (Object.keys(body).some(key => key !== 'email')) return NextResponse.json({error:'Invalid request.'}, {status:400});
    if (await reviewMode(request, email) === 'password') return NextResponse.json({accepted:true, mode:'password'}, {headers:{'Cache-Control':'private, no-store'}});
    const emailHash = hashPrivateValue(email);
    const [ipRate, emailRate] = await Promise.all([
      consumeRuntimeRateLimit(`otp:start:ip:${ipHash}`, 8, 60 * 60 * 1000, 60 * 60 * 1000),
      consumeRuntimeRateLimit(`otp:start:email:${emailHash}`, 4, 60 * 60 * 1000, 60 * 60 * 1000),
    ]);
    if (!ipRate.allowed || !emailRate.allowed) return NextResponse.json({ error: "Too many code requests. Try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
    await requestSupabaseEmailOtp(email);
    await audit("auth.otp_requested", { detail: { outcome: "accepted" }, ipHash }).catch(() => undefined);
    return NextResponse.json({ accepted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ReviewerAccessError || error instanceof MobileError) return NextResponse.json({error: error.message}, {status:error.status, headers:{'Cache-Control':'private, no-store'}});
    if (error instanceof SyntaxError) return NextResponse.json({error:'Invalid request.'}, {status:400, headers:{'Cache-Control':'private, no-store'}});
    await audit("auth.otp_request_failed", { detail: { outcome: "unavailable" }, ipHash }).catch(() => undefined);
    return NextResponse.json({ error: "Email sign-in is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
