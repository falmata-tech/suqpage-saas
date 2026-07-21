import { NextResponse } from "next/server";
import { createPublicInquiry, InquiryError } from "@/lib/inquiries";
import { requestIpFromHeaders, hashPrivateValue } from "@/lib/security";

export const runtime = "nodejs";
const MAX_BODY = 32 * 1024;

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY) return NextResponse.json({ error: "Inquiry is too large." }, { status: 413 });
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY) return NextResponse.json({ error: "Inquiry is too large." }, { status: 413 });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const ipHash = hashPrivateValue(requestIpFromHeaders(request.headers));
    const result = await createPublicInquiry(body, ipHash);
    return NextResponse.json(result, { status: result.duplicate ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof InquiryError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined });
    }
    console.error(error);
    return NextResponse.json({ error: "The inquiry could not be saved." }, { status: 500 });
  }
}
