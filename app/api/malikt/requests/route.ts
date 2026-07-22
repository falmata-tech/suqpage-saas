import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { canManageBusiness, canViewBusiness, hasCapability } from "@/lib/capabilities";
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
  const businessId = hasCapability(user, "operations:manage") ? requested : user.business_id;
  if (!businessId) return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  const assigned = user.access_role === "team_member" && Boolean(getDb().prepare("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1").get(user.id,businessId));
  if (!canViewBusiness(user, businessId, assigned)) return NextResponse.json({ error:"Not found." }, { status:404 });
  const requests = getDb().prepare("SELECT * FROM delivery_requests WHERE business_id=? ORDER BY created_at DESC LIMIT 100").all(businessId);
  return NextResponse.json({ requests }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await apiUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await readBoundedJson(request);
    const businessId = Number(body.businessId);
    const assigned = user.access_role === "team_member" && Boolean(getDb().prepare("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1").get(user.id,businessId));
    if (!canManageBusiness(user, businessId, assigned)) return NextResponse.json({ error:"Not authorized." }, { status:403 });
    const result = createDeliveryRequest({
      businessId, inquiryId: body.inquiryId ? Number(body.inquiryId) : null,
      customerName: body.customerName, phone: body.phone, pickupAddress: body.pickupAddress,
      deliveryAddress: body.deliveryAddress, packageCount: body.packageCount, note: body.note,
      companyIds: Array.isArray(body.companyIds) ? body.companyIds : [], idempotencyKey: body.idempotencyKey,
    }, user.business_id, hasCapability(user, "operations:manage"));
    const identity = await currentRequestIdentity();
    audit("api.delivery.created", { userId:user.id, businessId, detail:result, ipHash:identity.ipHash });
    return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error:error.message }, { status:error.status });
    if (error instanceof DeliveryError) return NextResponse.json({ error:error.message }, { status:error.status });
    console.error("Delivery API request failed", { category:"unexpected_failure" });
    return NextResponse.json({ error:"Request failed." }, { status:400 });
  }
}
