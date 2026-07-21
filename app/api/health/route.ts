import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export const runtime="nodejs";
export function GET(){try{getDb().prepare("SELECT 1 ok").get();return NextResponse.json({status:"ok"},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({status:"unhealthy"},{status:503})}}
