import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { createDeliveryRequest, DeliveryError } from "@/lib/deliveries";
import { getDb } from "@/lib/db";
import { assertSameOrigin, audit, currentRequestIdentity } from "@/lib/security";

export const runtime = "nodejs";
const MAX_REQUEST_BYTES = 64 * 1024;

class RequestBodyError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function readBoundedJson(request: Request): Promise<Record<string, unknown>> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new RequestBodyError("Request body is too large.", 413);
  }
  if (!request.body) throw new RequestBodyError("A JSON request body is required.", 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new RequestBodyError("Request body is too large.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not_an_object");
    return parsed as Record<string, unknown>;
  } catch {
    throw new RequestBodyError("Request body must be a JSON object.", 400);
  }
}

export async function GET(request: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const requested = Number(url.searchParams.get("businessId") || 0);
  const businessId = user.role === "owner" ? user.business_id : requested;
  if (!businessId) return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  const requests = getDb().prepare("SELECT * FROM delivery_requests WHERE business_id=? ORDER BY created_at DESC LIMIT 100").all(businessId);
  return NextResponse.json({ requests }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await readBoundedJson(request);
    const result = createDeliveryRequest({
      businessId: Number(body.businessId), inquiryId: body.inquiryId ? Number(body.inquiryId) : null,
      customerName: body.customerName, phone: body.phone, pickupAddress: body.pickupAddress,
      deliveryAddress: body.deliveryAddress, packageCount: body.packageCount, note: body.note,
      companyIds: Array.isArray(body.companyIds) ? body.companyIds : [], idempotencyKey: body.idempotencyKey,
    }, user.business_id, user.role === "admin");
    const identity = await currentRequestIdentity();
    audit("api.delivery.created", { userId:user.id, businessId:Number(body.businessId), detail:result, ipHash:identity.ipHash });
    return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error:error.message }, { status:error.status });
    if (error instanceof DeliveryError) return NextResponse.json({ error:error.message }, { status:error.status });
    console.error("Delivery API request failed", { category:"unexpected_failure" });
    return NextResponse.json({ error:"Request failed." }, { status:400 });
  }
}
