import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseAuth } from "./lib/supabase-auth-proxy";

export async function proxy(request: NextRequest) {
  if (["/bazaar", "/expo"].includes(request.nextUrl.pathname)) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (process.env.MIRTPAGE_AUTH_DRIVER !== "supabase") return NextResponse.next({ request });
  return refreshSupabaseAuth(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|geojson|webmanifest)$).*)"],
};
