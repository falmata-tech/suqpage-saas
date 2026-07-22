import { NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";
import { PublicRequestRateLimiter } from "@/lib/request-rate-limit";
import { createPublicInterest } from "@/lib/request-service";
import { RequestError } from "@/lib/request-domain";
import { SqliteRequestRepository } from "@/lib/request-sqlite";
import { hashPrivateValue, requestIpFromHeaders } from "@/lib/security";

export const runtime = "nodejs";
const MAX_PUBLIC_BODY_BYTES = 16 * 1024;

async function readBoundedBody(request: Request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_PUBLIC_BODY_BYTES) throw new RequestError("The interest request is too large.", 413);
  if (!request.body) return "";
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  const reader = request.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_PUBLIC_BODY_BYTES) {
      await reader.cancel();
      throw new RequestError("The interest request is too large.", 413);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

function assertRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  try { new URL(origin); } catch { throw new RequestError("Invalid request origin.", 403); }
  const allowed = new Set([new URL(request.url).origin, new URL(appUrl()).origin]);
  for (const configured of (process.env.SUQPAGE_SERVER_ACTION_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean)) {
    if (/^https?:\/\//i.test(configured)) allowed.add(new URL(configured).origin);
    else allowed.add(`${process.env.NODE_ENV === "production" ? "https" : "http"}://${configured.replace(/\/$/, "")}`);
  }
  if (process.env.NODE_ENV !== "production" && process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    for (const port of [3000, 3001]) allowed.add(`https://${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`);
  }
  if (!allowed.has(origin)) throw new RequestError("Invalid request origin.", 403);
}

export async function POST(request: Request) {
  try {
    assertRequestOrigin(request);
    const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (contentType !== "application/json") {
      throw new RequestError("Public interest requests do not accept files. Send JSON contact details only.", 415);
    }
    const raw = await readBoundedBody(request);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { throw new RequestError("Invalid JSON."); }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new RequestError("Invalid request.");
    const values = body as Record<string, unknown>;
    if (String(values.website || "").trim()) {
      return NextResponse.json({ reference: "REQ-RECEIVED" }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
    const result = await createPublicInterest(values, hashPrivateValue(requestIpFromHeaders(request.headers)), {
      repository: new SqliteRequestRepository(), rateLimiter: new PublicRequestRateLimiter(),
    });
    return NextResponse.json({ reference: result.publicRef, duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store", ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) } });
    }
    console.error("Public interest intake failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: "The interest request could not be saved." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
