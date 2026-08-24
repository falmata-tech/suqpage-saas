import { NextRequest, NextResponse } from "next/server";
import { getPublicSupportAttachment, PUBLIC_SUPPORT_COOKIE } from "@/lib/support";
import { readSupportAttachment } from "@/lib/support-media";

export const runtime = "nodejs";

const hidden = () => NextResponse.json(
  { error: "Not found." },
  { status: 404, headers: { "Cache-Control": "private, no-store" } },
);

export async function GET(request: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  try {
    const token = request.cookies.get(PUBLIC_SUPPORT_COOKIE)?.value;
    const attachmentId = Number.parseInt((await params).attachmentId, 10);
    if (!token || !Number.isSafeInteger(attachmentId)) return hidden();
    const attachment = await getPublicSupportAttachment(token, attachmentId);
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
