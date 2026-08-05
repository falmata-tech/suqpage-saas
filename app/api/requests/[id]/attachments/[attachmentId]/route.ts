import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { readRequestAttachment } from "@/lib/request-media";
import { canAccessRequest, runtimeRequestAttachment, runtimeRequestDetail } from "@/lib/request-runtime";

export const runtime = "nodejs";
const hidden = () => NextResponse.json({ error: "Not found." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  const user = await apiUser();
  if (!user) return hidden();
  const values = await params;
  const requestId = Number.parseInt(values.id, 10);
  const attachmentId = Number.parseInt(values.attachmentId, 10);
  if (!Number.isInteger(requestId) || !Number.isInteger(attachmentId)) return hidden();
  const requestRecord = await runtimeRequestDetail(requestId);
  if (!requestRecord || !canAccessRequest(user, requestRecord)) return hidden();
  const attachment = await runtimeRequestAttachment(requestId, attachmentId);
  if (!attachment) return hidden();
  const media = await readRequestAttachment(attachment.storage_key, attachment.mime_type);
  if (!media) return hidden();
  return new NextResponse(new Uint8Array(media.bytes), { headers: { "Content-Type": media.contentType, "Content-Length": String(media.contentLength), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
}
