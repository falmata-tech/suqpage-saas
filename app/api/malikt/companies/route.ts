import { NextResponse } from "next/server";
import { listDeliveryCompanies } from "@/lib/db";
export const runtime="nodejs";
export async function GET(){return NextResponse.json({companies:listDeliveryCompanies()},{headers:{"Cache-Control":"public, max-age=300"}})}
