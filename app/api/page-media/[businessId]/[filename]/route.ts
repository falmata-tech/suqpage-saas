import { runtimePublishedPageImage } from "@/lib/owner-page-publication-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(_request: Request, { params }: { params: Promise<{ businessId: string; filename: string }> }) {
  try {
    const { businessId, filename } = await params;
    const image = await runtimePublishedPageImage(Number(businessId), filename);
    if (!image) return new Response(null, { status: 404, headers });
    return new Response(new Uint8Array(image.bytes), { headers: { ...headers,
      "Content-Type": image.contentType, "Content-Length": String(image.contentLength) } });
  } catch {
    return new Response(null, { status: 503, headers });
  }
}
