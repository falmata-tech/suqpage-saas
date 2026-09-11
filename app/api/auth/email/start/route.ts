import { NextResponse } from "next/server";
import { supabaseAuthConfig, supabaseAuthEnabled } from "@/lib/config";
import { consumeRuntimeRateLimit } from "@/lib/rate-limit-runtime";
import { assertSameOrigin, audit, hashPrivateValue, requestIpFromHeaders } from "@/lib/security";
import { requestSupabaseEmailOtp } from "@/lib/supabase-auth";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 2 * 1024;

function emailFrom(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();
  return email.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export async function POST(request: Request) {
  const ipHash = hashPrivateValue(requestIpFromHeaders(request.headers));
  try {
    assertSameOrigin(request);
    if (!supabaseAuthEnabled() || !supabaseAuthConfig().emailOtpEnabled) throw new Error("unavailable");
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
    const body = JSON.parse(raw) as { email?: unknown };
    const email = emailFrom(body.email);
    if (!email) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    const emailHash = hashPrivateValue(email);
    const [ipRate, emailRate] = await Promise.all([
      consumeRuntimeRateLimit(`otp:start:ip:${ipHash}`, 8, 60 * 60 * 1000, 60 * 60 * 1000),
      consumeRuntimeRateLimit(`otp:start:email:${emailHash}`, 4, 60 * 60 * 1000, 60 * 60 * 1000),
    ]);
    if (!ipRate.allowed || !emailRate.allowed) return NextResponse.json({ error: "Too many code requests. Try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
    await requestSupabaseEmailOtp(email);
    await audit("auth.otp_requested", { detail: { outcome: "accepted" }, ipHash }).catch(() => undefined);
    return NextResponse.json({ accepted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    await audit("auth.otp_request_failed", { detail: { outcome: "unavailable" }, ipHash }).catch(() => undefined);
    return NextResponse.json({ error: "Email sign-in is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
