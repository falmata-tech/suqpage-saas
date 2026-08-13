import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { recordShowroomVisit } from "@/lib/account-health";
import { assertSameOrigin } from "@/lib/security";

export const runtime = "nodejs";
const COOKIE = "mirtpage_visitor";
const MAX_BODY = 2048;

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }
    const body = JSON.parse(raw) as Record<string, unknown>;
    const visitorToken = request.cookies.get(COOKIE)?.value || crypto.randomUUID();
    const result = await recordShowroomVisit({
      handle: body.handle,
      source: body.source,
      occurrenceId: body.occurrenceId,
      hubKey: body.hubKey,
      visitorToken,
    });
    const response = NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
    if (!request.cookies.has(COOKIE)) {
      response.cookies.set(COOKIE, visitorToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("Showroom visit recording failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Visit was not recorded." }, { status: 400 });
  }
}
