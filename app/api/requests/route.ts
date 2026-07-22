import { NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";
import { FileRequestAttachmentStore } from "@/lib/request-media";
import { PublicRequestRateLimiter } from "@/lib/request-rate-limit";
import { createPublicOnboardingRequest } from "@/lib/request-service";
import { RequestError, type RequestImageInput } from "@/lib/request-domain";
import { SqliteRequestRepository } from "@/lib/request-sqlite";
import { hashPrivateValue, requestIpFromHeaders } from "@/lib/security";

export const runtime = "nodejs";
const MAX_MULTIPART_BYTES = 51 * 1024 * 1024;

async function readBoundedBody(request: Request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_MULTIPART_BYTES) throw new RequestError("The request is too large.", 413);
  if (!request.body) return Buffer.alloc(0);
  const chunks: Buffer[] = [];
  let size = 0;
  const reader = request.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_MULTIPART_BYTES) {
      await reader.cancel();
      throw new RequestError("The request is too large.", 413);
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks, size);
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
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data;")) throw new RequestError("Use a multipart form request.");
    const bytes = await readBoundedBody(request);
    let parsed: FormData;
    try { parsed = await new Response(bytes, { headers: { "content-type": contentType } }).formData(); }
    catch { throw new RequestError("The multipart form is invalid."); }
    if (String(parsed.get("website") || "").trim()) {
      return NextResponse.json({ reference: "REQ-RECEIVED" }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
    const images: RequestImageInput[] = [];
    for (const entry of parsed.getAll("images")) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      images.push({ originalName: entry.name, claimedType: entry.type, bytes: Buffer.from(await entry.arrayBuffer()) });
    }
    const result = await createPublicOnboardingRequest(
      {
        contactName: parsed.get("contactName"), contactValue: parsed.get("contactValue"),
        businessName: parsed.get("businessName"), requestText: parsed.get("requestText"),
        idempotencyKey: parsed.get("idempotencyKey"), consent: parsed.get("consent"),
      },
      images,
      hashPrivateValue(requestIpFromHeaders(request.headers)),
      { repository: new SqliteRequestRepository(), attachments: new FileRequestAttachmentStore(), rateLimiter: new PublicRequestRateLimiter() },
    );
    return NextResponse.json({ reference: result.publicRef, duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store", ...(error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) } });
    }
    console.error("Public request intake failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: "The request could not be saved." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
