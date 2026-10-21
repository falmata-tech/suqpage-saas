import { platformEnvironment } from "./lib/platform-environment.mjs";
import { showroomStatusLookupUrl } from "./lib/showroom-status-origin";
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
    let status = 404;
    if (handle && handle.length <= 128) {
      try {
        const url = showroomStatusLookupUrl(request.url, platformEnvironment());
        url.searchParams.set("handle", handle);
        const response = await fetch(url, {
          cache: "no-store", credentials: "omit", redirect: "error", signal: AbortSignal.timeout(5000),
        });
        status = response.status;
      } catch {
        status = 503;
      }
    }
    if (status !== 204) {
      if (status !== 404) return new Response("Showroom temporarily unavailable", {
        status: 503,
        headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8", "Retry-After": "30", "X-Robots-Tag": "noindex, nofollow" },
      });
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
