import { NextResponse } from "next/server";
import { runtimeGet } from "@/lib/runtime-sql";
export const runtime="nodejs";
export async function GET(){try{await runtimeGet("SELECT 1 ok");return NextResponse.json({status:"ok"},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({status:"unhealthy"},{status:503})}}
