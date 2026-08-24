import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getSupportAttachment } from "@/lib/support";
import { readSupportAttachment } from "@/lib/support-media";

export const runtime = "nodejs";

const hidden = () => NextResponse.json(
  { error: "Not found." },
  { status: 404, headers: { "Cache-Control": "private, no-store" } },
);

export async function GET(_request: Request, { params }: { params: Promise<{ conversationId: string; attachmentId: string }> }) {
  try {
    const user = await apiUser();
    if (!user) return hidden();
    const values = await params;
    const conversationId = Number.parseInt(values.conversationId, 10);
    const attachmentId = Number.parseInt(values.attachmentId, 10);
    if (!Number.isSafeInteger(conversationId) || !Number.isSafeInteger(attachmentId)) return hidden();
    const attachment = await getSupportAttachment(user, conversationId, attachmentId);
    const media = await readSupportAttachment(attachment.storage_key, attachment.mime_type);
    if (!media) return hidden();
    const disposition = attachment.mime_type.startsWith("image/") ? "inline" : "attachment";
    return new NextResponse(new Uint8Array(media.bytes), { headers: {
      "Content-Type": attachment.mime_type,
      "Content-Length": String(media.contentLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(attachment.original_name)}`,
    } });
  } catch {
    return hidden();
  }
}
