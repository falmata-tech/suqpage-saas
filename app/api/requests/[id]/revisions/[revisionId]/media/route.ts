import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { assertSameOrigin, audit } from "@/lib/security";
import { ShowroomRecipeError } from "@/lib/showroom-recipe-domain";
import { admitRecipeImage, admitRecipeYouTube } from "@/lib/showroom-recipe-service";

export const runtime = "nodejs";
const MAX_MULTIPART_BYTES = 7 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string; revisionId: string }> }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    try {
      assertSameOrigin(request);
    } catch {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) {
      return NextResponse.json({ error: "Send a multipart media request." }, { status: 415 });
    }
    const length = Number(request.headers.get("content-length") || 0);
    if (!Number.isFinite(length) || length <= 0) return NextResponse.json({ error: "A bounded content length is required." }, { status: 411 });
    if (length > MAX_MULTIPART_BYTES) return NextResponse.json({ error: "The media request is too large." }, { status: 413 });
    const values = await params;
    const requestId = Number.parseInt(values.id, 10);
    const revisionId = Number.parseInt(values.revisionId, 10);
    if (!Number.isInteger(requestId) || !Number.isInteger(revisionId)) throw new ShowroomRecipeError([], 404);
    const form = await request.formData();
    const kind = String(form.get("kind") || "");
    const label = String(form.get("label") || "Showroom media");
    if (kind === "image") {
      const admitted = await admitRecipeImage(user, revisionId, form.get("file"), label, true);
      if (admitted.requestId !== requestId) throw new ShowroomRecipeError([], 404);
      await audit("revision.inline_image_admitted", { userId: user.id, businessId: user.business_id, detail: { requestId, revisionId, attachmentId: admitted.attachmentId } });
      return NextResponse.json({
        ref: `request-attachment:${admitted.attachmentId}`,
        previewUrl: `/api/requests/${requestId}/attachments/${admitted.attachmentId}`,
        label,
        kind,
      }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
    if (kind === "youtube") {
      const admitted = await admitRecipeYouTube(user, revisionId, form.get("url"), label, true);
      if (admitted.requestId !== requestId) throw new ShowroomRecipeError([], 404);
      await audit("revision.inline_youtube_admitted", { userId: user.id, businessId: user.business_id, detail: { requestId, revisionId, duplicate: admitted.duplicate } });
      return NextResponse.json({ ref: admitted.managedRef, label, kind }, { status: admitted.duplicate ? 200 : 201, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "Choose an image or YouTube video." }, { status: 400 });
  } catch (error) {
    if (error instanceof ShowroomRecipeError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "The media could not be added." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
