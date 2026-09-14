import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getMediaObjectStore } from "@/lib/media-storage";
import { OwnerPageError } from "@/lib/owner-page-domain";
import { readCoverUpload, uploadOwnerPageImage } from "@/lib/owner-page-media";
import { ownerPageEditorEnabled, ownerPagePort } from "@/lib/owner-page-runtime";
import { readOwnerPage } from "@/lib/owner-page-service";
import { consumeRuntimeRateLimit } from "@/lib/rate-limit-runtime";
import { assertSameOrigin, audit } from "@/lib/security";

export const runtime = "nodejs";
const json = (value: unknown, status: number, headers: Record<string, string> = {}) => NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store", ...headers } });

export async function POST(request: Request, { params }: { params: Promise<{ businessId: string }> }) {
  if (!ownerPageEditorEnabled()) return json({ error: "Not found." }, 404);
  const actor = await apiUser();
  if (!actor) return json({ error: "Sign in to upload an image." }, 401);
  try {
    try { assertSameOrigin(request); } catch { throw new OwnerPageError("Invalid request origin.", 403); }
    const businessId = Number((await params).businessId);
    await readOwnerPage(ownerPagePort, actor, businessId);
    const limit = await consumeRuntimeRateLimit(`page-cover:${businessId}`, 12, 60 * 60 * 1000);
    if (!limit.allowed) return json({ error: "Too many image uploads. Please try again later." }, 429, { "Retry-After": String(limit.retryAfterSeconds) });
    const file = await readCoverUpload(request);
    const ref = await uploadOwnerPageImage(ownerPagePort, getMediaObjectStore(), actor, businessId, { bytes: Buffer.from(await file.arrayBuffer()), claimedType: file.type });
    await audit("page.cover_uploaded", { userId: actor.id, businessId }).catch(() => undefined);
    return json({ ref }, 201);
  } catch (error) {
    if (error instanceof OwnerPageError) return json({ error: error.message }, error.status);
    await audit("page.cover_upload_failed", { userId: actor.id }).catch(() => undefined);
    return json({ error: "The image could not be uploaded. Your current cover is unchanged. Please try again." }, 503);
  }
}
