import { NextResponse } from "next/server";
import { supabaseAuthEnabled } from "@/lib/config";
import { completeSupabaseCodeExchange } from "@/lib/supabase-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  if (!supabaseAuthEnabled() || !/^[A-Za-z0-9._~-]{20,500}$/.test(code)) {
    return NextResponse.redirect(new URL("/login?error=Sign-in%20could%20not%20be%20completed.", url.origin));
  }
  const identity = await completeSupabaseCodeExchange(code);
  return NextResponse.redirect(new URL(identity ? "/dashboard" : "/login?error=This%20Google%20account%20is%20not%20linked%20to%20MirtPage.", url.origin));
}
