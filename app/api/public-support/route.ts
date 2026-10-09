import crypto from "node:crypto";
import { revokeVisitorAttention,AttentionError } from '@/lib/attention-postgres';
import {scheduleAttentionDelivery} from '@/lib/attention-after';
import { channelConversation, publicSupportSession } from "@/lib/public-support-channel";
import { platformCookie, platformCookies } from "@/lib/platform-state";
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin, hashPrivateValue, requestIpFromHeaders } from "@/lib/security";
import {
  createPublicSupportConversation,
  postPublicSupportMessage,
  closePublicSupportConversation,
  getPublicSupportConversation,
  publicSupportSessionIsUsable,
  PUBLIC_SUPPORT_COOKIE,
  PUBLIC_SUPPORT_SESSION_MS,
  SupportError,
  acknowledgePublicRead,
} from "@/lib/support";
// Buying conversations are text-only; private attachments remain in authenticated support.
const MAX_BODY_BYTES = 32_000;
function privateJson(body: unknown, init: ResponseInit = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
function retiredEntry(request: NextRequest) {
  return ["buying", "transport"].includes(request.nextUrl.searchParams.get("channel") || "") ? null : privateJson(
    {error:"Live support is available from your business dashboard.",code:"public_chat_retired"},
    {status:410,headers:{"Cache-Control":"private, no-store"}},
  );
}

function errorResponse(error: unknown) {
  const known = error instanceof SupportError
    ? error
    : new SupportError("Support is temporarily unavailable.", "internal");
  const status = known.code === "rate_limited" ? 429
    : known.code === "not_found" ? 404
      : known.code === "internal" ? 500
        : 400;
  return privateJson({ error: known.message, code: known.code }, { status });
}

function emptySupportSession(cookieName: string) {
  const response = privateJson({ conversation: null });
  response.cookies.set(cookieName, crypto.randomBytes(32).toString("base64url"), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: Math.floor(PUBLIC_SUPPORT_SESSION_MS / 1000),
  });
  return response;
}

export async function GET(request: NextRequest) {
  const retired = retiredEntry(request); if (retired) return retired;
  try {
    const { token, cookieName, channel } = await publicSupportSession(request.cookies, request.nextUrl.searchParams.get("channel"));
    if (!token) return emptySupportSession(cookieName);
    try { return privateJson({ conversation: await channelConversation(token, channel) }); }
    catch (error) {
      if (!(error instanceof SupportError && error.code === "not_found")) throw error;
      if (await publicSupportSessionIsUsable(token)) {
        // Only an unused token can return an empty prepared session; an existing
        // wrong-channel conversation must remain denied.
        try { await getPublicSupportConversation(token); }
        catch (missing) { if (missing instanceof SupportError && missing.code === "not_found") return privateJson({conversation:null}); throw missing; }
        throw error;
      }
      return emptySupportSession(cookieName);
    }
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  const retired = retiredEntry(request); if (retired) return retired;
  try {
    assertSameOrigin(request);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) return privateJson({ error: "Message is too large." }, { status: 413 });
    if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
      throw new SupportError("Send a form or JSON request.", "invalid_request");
    }
    const reader = request.body?.getReader();
    let size = 0;
    const chunks: Uint8Array[] = [];
    if (reader) try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > MAX_BODY_BYTES) { await reader.cancel(); return privateJson({ error: "Message is too large." }, { status: 413 }); }
        chunks.push(part.value);
      }
    } finally { reader.releaseLock(); }
    let parsed: unknown;
    try { parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { throw new SupportError("Request could not be accepted.", "invalid_request"); }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new SupportError("Request could not be accepted.", "invalid_request");
    const body = parsed as Record<string, unknown>;
    if (String(body.website || "").trim()) return privateJson({ error: "Request could not be accepted." }, { status: 400 });
    const ipHash = hashPrivateValue(requestIpFromHeaders(request.headers));
    const { token, cookieName, channel } = await publicSupportSession(request.cookies, request.nextUrl.searchParams.get("channel"));
    if (body.attachment) throw new SupportError("These requests do not accept attachments.", "invalid_attachment");
    if (body.action === "message" || body.action === "close" || body.action === 'read') {
      const current = await channelConversation(token, channel);
      if (body.publicRef !== current.publicRef) throw new SupportError("Request could not be accepted.", "conversation_changed");
      if (body.action === 'read') await acknowledgePublicRead(token, { messageId: body.messageId, publicRef: body.publicRef });
      else if (body.action === "close") await closePublicSupportConversation(token);
      else await postPublicSupportMessage(token, { message: body.message, idempotencyKey: body.idempotencyKey }, ipHash);
      if(body.action!=='read')scheduleAttentionDelivery();
      return privateJson({ conversation: await channelConversation(token, channel) });
    }
    if (body.action !== "start" || body.category !== (channel === "transport" ? "shipment_observation" : "buying_assistance")) throw new SupportError("Choose how Suqpage can help.", "invalid_channel");
    const created = await createPublicSupportConversation({
      category: body.category,
      name: body.name,
      service: body.service,
      origin: body.origin,
      destination: body.destination,
      email: body.email,
      phone: body.phone,
      message: body.message,
      idempotencyKey: body.idempotencyKey,
    }, ipHash, Date.now(), token || undefined);
    const response = privateJson({ conversation: await getPublicSupportConversation(created.token) }, { status: 201 });
    scheduleAttentionDelivery();
    response.cookies.set(cookieName, created.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(PUBLIC_SUPPORT_SESSION_MS / 1000),
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  const retired = retiredEntry(request); if (retired) return retired;
  try {
    assertSameOrigin(request);
    const response = privateJson({ conversation: null });
    const {cookieName, token, channel} = await publicSupportSession(request.cookies, request.nextUrl.searchParams.get("channel"));
    if(token)try{await channelConversation(token,channel);await revokeVisitorAttention(token);}catch(error){if(!((error instanceof SupportError||error instanceof AttentionError)&&error.code==='not_found'))throw error;}
    response.cookies.delete(cookieName);
    // Consume a matching legacy token on reset; the other channel is untouched.
    if (!channel || (token && token === platformCookie(request.cookies, "support"))) {
      response.cookies.delete(PUBLIC_SUPPORT_COOKIE);
      response.cookies.delete(platformCookies.support.legacy);
    }
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
