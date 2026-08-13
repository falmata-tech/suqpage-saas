import type { NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  return new Response("Not found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const config = {
  matcher: ["/bazaar", "/expo"],
};
