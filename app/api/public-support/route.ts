import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin, hashPrivateValue, requestIpFromHeaders } from "@/lib/security";
import {
  closePublicSupportConversation,
  createPublicSupportConversation,
  getPublicSupportConversation,
  postPublicSupportMessage,
  PUBLIC_SUPPORT_COOKIE,
  PUBLIC_SUPPORT_SESSION_MS,
  SupportError,
} from "@/lib/support";
import { MAX_SUPPORT_ATTACHMENT_BYTES, stageSupportAttachment, SupportAttachmentError, type StagedSupportAttachment } from "@/lib/support-media";

const MAX_BODY_BYTES = MAX_SUPPORT_ATTACHMENT_BYTES + 32_000;

function errorResponse(error: unknown) {
  const known = error instanceof SupportError
    ? error
    : error instanceof SupportAttachmentError
      ? new SupportError(error.message, "invalid_attachment")
      : new SupportError("Support is temporarily unavailable.", "internal");
  const status = known.code === "rate_limited" ? 429
    : known.code === "not_found" ? 404
      : known.code === "internal" ? 500
        : 400;
  return NextResponse.json({ error: known.message, code: known.code }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(PUBLIC_SUPPORT_COOKIE)?.value;
    if (!token) return NextResponse.json({ conversation: null });
    return NextResponse.json({ conversation: await getPublicSupportConversation(token) });
  } catch (error) {
    if (error instanceof SupportError && error.code === "not_found") {
      const response = NextResponse.json({ conversation: null });
      response.cookies.delete(PUBLIC_SUPPORT_COOKIE);
      return response;
    }
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  let staged: StagedSupportAttachment | null = null;
  try {
    assertSameOrigin(request);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) return NextResponse.json({ error: "Message is too large." }, { status: 413 });
    const contentType = request.headers.get("content-type") || "";
    const body: Record<string, unknown> = contentType.startsWith("multipart/form-data")
      ? Object.fromEntries(await request.formData())
      : contentType.split(";")[0]?.trim().toLowerCase() === "application/json"
        ? await request.json() as Record<string, unknown>
        : (() => { throw new SupportError("Send a form or JSON request.", "invalid_request"); })();
    if (String(body.website || "").trim()) return NextResponse.json({ error: "Request could not be accepted." }, { status: 400 });
    const ipHash = hashPrivateValue(requestIpFromHeaders(request.headers));
    const token = request.cookies.get(PUBLIC_SUPPORT_COOKIE)?.value || "";

    if (body.action === "close") {
      await closePublicSupportConversation(token);
      return NextResponse.json({ conversation: await getPublicSupportConversation(token) });
    }

    if (body.action === "message" && token) {
      staged = await stageSupportAttachment(body.attachment as FormDataEntryValue | null);
      const result = await postPublicSupportMessage(token, {
        message: body.message,
        idempotencyKey: body.idempotencyKey,
        attachment: staged,
      }, ipHash);
      if (result.duplicate) await staged?.discard();
      staged = null;
      return NextResponse.json({ conversation: await getPublicSupportConversation(token) });
    }

    staged = await stageSupportAttachment(body.attachment as FormDataEntryValue | null);
    const created = await createPublicSupportConversation({
      category: body.category,
      email: body.email,
      phone: body.phone,
      message: body.message,
      idempotencyKey: body.idempotencyKey,
      attachment: staged,
    }, ipHash);
    staged = null;
    const response = NextResponse.json({ conversation: await getPublicSupportConversation(created.token) }, { status: 201 });
    response.cookies.set(PUBLIC_SUPPORT_COOKIE, created.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(PUBLIC_SUPPORT_SESSION_MS / 1000),
    });
    return response;
  } catch (error) {
    await staged?.discard().catch(() => undefined);
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ conversation: null });
    response.cookies.delete(PUBLIC_SUPPORT_COOKIE);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
