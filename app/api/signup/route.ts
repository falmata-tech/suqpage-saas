import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { consumeRuntimeRateLimit } from "@/lib/rate-limit-runtime";
import { assertSameOrigin, audit, hashPrivateValue, requestIpFromHeaders } from "@/lib/security";
import { createPublicClientWorkspace, SignupError } from "@/lib/signup";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 24 * 1024;

async function readBody(request: Request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) throw new SignupError("The signup request is too large.", 413, "body_too_large");
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) throw new SignupError("The signup request is too large.", 413, "body_too_large");
  try { return JSON.parse(raw) as Record<string, unknown>; }
  catch { throw new SignupError("The signup request is invalid."); }
}

export async function POST(request: Request) {
  const ipHash = hashPrivateValue(requestIpFromHeaders(request.headers));
  try {
    try { assertSameOrigin(request); }
    catch { throw new SignupError("Invalid request origin.", 403, "origin"); }
    if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
      throw new SignupError("Signup accepts contact details only, not files.", 415, "content_type");
    }
    const body = await readBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new SignupError("The signup request is invalid.");
    const emailHash = hashPrivateValue(String(body.email || "").trim().toLowerCase());
    const ipRate = await consumeRuntimeRateLimit(`signup:ip:${ipHash}`, 5, 60 * 60 * 1000, 60 * 60 * 1000);
    const emailRate = await consumeRuntimeRateLimit(`signup:email:${emailHash}`, 3, 60 * 60 * 1000, 60 * 60 * 1000);
    if (!ipRate.allowed || !emailRate.allowed) throw new SignupError("Too many signup attempts. Try again later.", 429, "rate_limited");
    const created = await createPublicClientWorkspace(body);
    await setSession(created.userId);
    await audit("client.self_signup_created", { userId: created.userId, businessId: created.businessId, detail: { requestId: created.requestId }, ipHash });
    return NextResponse.json({ destination: `/dashboard/requests/${created.requestId}`, reference: created.publicRef }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const known = error instanceof SignupError ? error : new SignupError("Your private workspace could not be created.", 500, "unexpected");
    await audit("client.self_signup_failed", { detail: { code: known.code }, ipHash });
    return NextResponse.json({ error: known.message }, { status: known.status, headers: { "Cache-Control": "no-store", ...(known.status === 429 ? { "Retry-After": "3600" } : {}) } });
  }
}
