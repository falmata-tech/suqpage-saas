import crypto from "node:crypto";
import { getDb, inTransaction } from "./db";
import { cleanText } from "./security";

export class DeliveryError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export type DeliveryInput = {
  businessId: number; inquiryId?: number | null; customerName: unknown; phone: unknown;
  pickupAddress: unknown; deliveryAddress: unknown; packageCount: unknown; note?: unknown;
  companyIds: unknown[]; idempotencyKey?: unknown;
};

export function createDeliveryRequest(input: DeliveryInput, actorBusinessId: number | null, isAdmin: boolean) {
  const businessId = Number(input.businessId);
  if (!Number.isInteger(businessId) || (!isAdmin && actorBusinessId !== businessId)) throw new DeliveryError("Not authorized.", 403);
  const business = getDb().prepare("SELECT id FROM businesses WHERE id=?").get(businessId);
  if (!business) throw new DeliveryError("Business not found.", 404);
  const inquiryId = input.inquiryId ? Number(input.inquiryId) : null;
  if (inquiryId && !getDb().prepare("SELECT id FROM inquiries WHERE id=? AND business_id=?").get(inquiryId, businessId)) throw new DeliveryError("Inquiry does not belong to this business.");
  const customerName = cleanText(input.customerName, 80);
  const phone = cleanText(input.phone, 40);
  const pickupAddress = cleanText(input.pickupAddress, 300);
  const deliveryAddress = cleanText(input.deliveryAddress, 300);
  const note = cleanText(input.note, 1000);
  const packageCount = Number(input.packageCount);
  if (!customerName || phone.length < 5 || !pickupAddress || !deliveryAddress) throw new DeliveryError("Customer, phone, pickup, and delivery address are required.");
  if (!Number.isInteger(packageCount) || packageCount < 1 || packageCount > 100) throw new DeliveryError("Package count must be between 1 and 100.");
  const companyIds = [...new Set(input.companyIds.map(Number).filter(Number.isInteger))];
  if (!companyIds.length || companyIds.length > 10) throw new DeliveryError("Choose at least one supported delivery company.");
  const placeholders = companyIds.map(() => "?").join(",");
  const activeCompanies = getDb().prepare(`SELECT id FROM delivery_companies WHERE active=1 AND id IN (${placeholders})`).all(...companyIds) as Array<{id:number}>;
  if (activeCompanies.length !== companyIds.length) throw new DeliveryError("One or more delivery companies are invalid.");
  const idempotencyKey = cleanText(input.idempotencyKey, 100) || crypto.randomUUID();
  const existing = getDb().prepare("SELECT id,external_request_id FROM delivery_requests WHERE business_id=? AND idempotency_key=?").get(businessId, idempotencyKey) as any;
  if (existing) return { requestId:Number(existing.id), externalRequestId:String(existing.external_request_id), duplicate:true };
  return inTransaction(() => {
    const externalRequestId = `MB-${new Date().getFullYear()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const result = getDb().prepare("INSERT INTO delivery_requests(business_id,inquiry_id,customer_name,phone,pickup_address,delivery_address,package_count,note,status,external_request_id,idempotency_key) VALUES(?,?,?,?,?,?,?,?,'submitted',?,?)").run(
      businessId, inquiryId, customerName, phone, pickupAddress, deliveryAddress, packageCount, note, externalRequestId, idempotencyKey,
    );
    const requestId = Number(result.lastInsertRowid);
    const link = getDb().prepare("INSERT INTO delivery_request_companies(delivery_request_id,company_id,status) VALUES(?,?,'sent')");
    companyIds.forEach((companyId) => link.run(requestId, companyId));
    if (inquiryId) getDb().prepare("UPDATE inquiries SET status='confirmed',updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?").run(inquiryId, businessId);
    return { requestId, externalRequestId, duplicate:false };
  });
}
