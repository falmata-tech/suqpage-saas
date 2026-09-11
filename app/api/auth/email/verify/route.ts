import { NextResponse } from "next/server";
import { supabaseAuthConfig, supabaseAuthEnabled } from "@/lib/config";
import { consumeRuntimeRateLimit, resetRuntimeRateLimit } from "@/lib/rate-limit-runtime";
import { assertSameOrigin, audit, hashPrivateValue, requestIpFromHeaders } from "@/lib/security";
import { verifySupabaseEmailOtp } from "@/lib/supabase-auth";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 2 * 1024;

export async function POST(request: Request) {
  const ipHash = hashPrivateValue(requestIpFromHeaders(request.headers));
  try {
    assertSameOrigin(request);
    if (!supabaseAuthEnabled() || !supabaseAuthConfig().emailOtpEnabled) throw new Error("unavailable");
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
    const body = JSON.parse(raw) as { email?: unknown; code?: unknown };
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();
    if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the six-digit code from your email." }, { status: 400 });
    }
    const emailHash = hashPrivateValue(email);
    const rateKey = `otp:verify:${ipHash}:${emailHash}`;
    const rate = await consumeRuntimeRateLimit(rateKey, 8, 15 * 60 * 1000, 30 * 60 * 1000);
    if (!rate.allowed) return NextResponse.json({ error: "Too many attempts. Request a new code later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
    const identity = await verifySupabaseEmailOtp(email, code);
    if (!identity) {
      await audit("auth.otp_verify_failed", { detail: { outcome: "invalid" }, ipHash }).catch(() => undefined);
      return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    await resetRuntimeRateLimit(rateKey);
    await audit("auth.otp_verified", { userId: identity.userId, detail: { outcome: identity.userId ? "linked" : "onboarding" }, ipHash }).catch(() => undefined);
    return NextResponse.json({ destination: identity.userId ? "/dashboard" : "/request" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Email sign-in is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
