import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getMediaObjectStore } from "@/lib/media-storage";
import { OwnerPageError } from "@/lib/owner-page-domain";
import { readOwnerPageImage } from "@/lib/owner-page-media";
import { ownerPageEditorEnabled, ownerPagePort } from "@/lib/owner-page-runtime";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Vary": "Cookie" };
const fail = (status: number) => new NextResponse(null, { status, headers });

export async function GET(_request: Request, { params }: { params: Promise<{ businessId: string; filename: string }> }) {
  if (!ownerPageEditorEnabled()) return fail(404);
  const actor = await apiUser();
  if (!actor) return fail(401);
  try {
    const { businessId, filename } = await params;
    const ref=`/api/page-drafts/${businessId}/media/${filename}`;
    const image=await readOwnerPageImage(ownerPagePort,getMediaObjectStore(),actor,Number(businessId),ref);
    if(!image)return fail(404);
    return new NextResponse(new Uint8Array(image.bytes), { headers: { ...headers, "Content-Type": image.contentType, "Content-Length": String(image.contentLength) } });
  } catch (error) { return fail(error instanceof OwnerPageError ? error.status : 503); }
}
