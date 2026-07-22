import fs from "node:fs";
import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { resolveRequestAttachment } from "@/lib/request-media";
import { getRequestAttachment } from "@/lib/request-sqlite";

export const runtime = "nodejs";
const hidden = () => NextResponse.json({ error: "Not found." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  const user = await apiUser();
  if (!user || user.role !== "admin") return hidden();
  const values = await params;
  const requestId = Number.parseInt(values.id, 10);
  const attachmentId = Number.parseInt(values.attachmentId, 10);
  if (!Number.isInteger(requestId) || !Number.isInteger(attachmentId)) return hidden();
  const attachment = getRequestAttachment(requestId, attachmentId);
  const fullPath = attachment ? resolveRequestAttachment(attachment.storage_key) : null;
  if (!attachment || !fullPath || !fs.existsSync(fullPath)) return hidden();
  return new NextResponse(new Uint8Array(fs.readFileSync(fullPath)), { headers: { "Content-Type": attachment.mime_type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
}
