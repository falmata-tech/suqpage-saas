import { NextResponse } from "next/server";
import { RETIRED_BUSINESS_INQUIRY } from "@/lib/business-inquiry-policy";

export const runtime = "nodejs";
/** Compatibility response for installed apps and saved pages; never persist. */
export async function POST() {
  return NextResponse.json(RETIRED_BUSINESS_INQUIRY, {
    status: 410, headers: { "Cache-Control": "private, no-store" },
  });
}
