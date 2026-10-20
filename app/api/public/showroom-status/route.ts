import { runtimeGet } from "@/lib/runtime-sql";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

/** Public status only; no merchant fields, visitor cookies, or private previews. */
export async function GET(request: Request): Promise<Response> {
  const handle = new URL(request.url).searchParams.get("handle");
  if (!handle || handle.length > 128) return new Response(null, { status: 404, headers });
  try {
    const business = await runtimeGet<{ status: string }>(`
      SELECT b.status FROM business_handles h JOIN businesses b ON b.id=h.business_id
      WHERE h.handle=lower(?) LIMIT 1
    `, [handle]);
    return new Response(null, {
      status: business?.status === "active" || business?.status === "suspended" ? 204 : 404,
      headers,
    });
  } catch {
    return new Response(null, { status: 503, headers: { ...headers, "Retry-After": "30" } });
  }
}
