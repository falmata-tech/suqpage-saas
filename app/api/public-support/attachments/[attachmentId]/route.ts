import { NextResponse } from "next/server";

// Public buying requests have no attachments. Historical guest files remain
// available only through the authenticated, conversation-scoped support route.
export async function GET() {
  return NextResponse.json({ error: "Not found." }, {
    status: 404, headers: { "Cache-Control": "private, no-store" },
  });
}
