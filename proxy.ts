import { platformEnvironment } from "./lib/platform-environment.mjs";
import { runtimeGet } from "./lib/runtime-sql";
import { localeCookie, parseLocale } from "./lib/i18n/core";
import { showroomNotFoundHtml } from "./lib/showroom-not-found";
import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseAuth } from "./lib/supabase-auth-proxy";

export async function proxy(request: NextRequest) {
  if (["/bazaar", "/expo"].includes(request.nextUrl.pathname) || ["/dashboard/requests", "/dashboard/design-bank", "/dashboard/design-sdk", "/api/requests", "/api/client/requests", "/api/operations/requests"].some(path => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`))) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  const showroomPath = /^\/(?:@|%40)([^/]+)\/?$/i.exec(request.nextUrl.pathname);
  const initialDocument = !request.headers.has("rsc") && !request.headers.has("next-router-prefetch")
    && !request.headers.has("next-router-state-tree");
  if (showroomPath && initialDocument) {
    let handle: string;
    try {
      handle = decodeURIComponent(showroomPath[1]).replace(/^@/, "");
    } catch {
      handle = "";
    }
    // The indexed handle lookup reads one status, never a merchant/private row.
    // Do not cache this decision: publication and suspension must take effect now.
    const business = handle && handle.length <= 128 ? await runtimeGet<{ status: string }>(`
      SELECT b.status FROM business_handles h JOIN businesses b ON b.id=h.business_id
      WHERE h.handle=lower(?) LIMIT 1
    `, [handle]) : undefined;
    if (!business || (business.status !== "active" && business.status !== "suspended")) {
      return new Response(await showroomNotFoundHtml(parseLocale(request.cookies.get(localeCookie)?.value)), {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/html; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }
  }
  if (platformEnvironment().SUQPAGE_AUTH_DRIVER !== "supabase") return NextResponse.next({ request });
  return refreshSupabaseAuth(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|geojson|webmanifest)$).*)"],
};
