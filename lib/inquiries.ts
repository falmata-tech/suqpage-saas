import { getBusinessById, getDb, inTransaction } from "./db";
import { notifyNewInquiry } from "./notifications";
import { consumeRateLimit } from "./rate-limit";
import { cleanText } from "./security";
import {
  normalizeOfferingKind,
  normalizeQuantityMode,
} from "./offerings";

type RawItem = { productId?: unknown; quantity?: unknown; options?: unknown };
export type InquiryInput = { businessId?: unknown; customerName?: unknown; contact?: unknown; contactMethod?: unknown; note?: unknown; items?: unknown; idempotencyKey?: unknown; website?: unknown };

export class InquiryError extends Error {
  constructor(message: string, public status = 400, public retryAfter = 0) { super(message); }
}

function normalizePhone(value: unknown) {
  const raw = cleanText(value, 40);
  if (!/^\+?[\d\s().-]+$/.test(raw)) {
    throw new InquiryError("Enter a valid phone number.");
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    throw new InquiryError("Enter a phone number with 7 to 15 digits.");
  }
  return `${raw.startsWith("+") ? "+" : ""}${digits}`;
}

export async function createPublicInquiry(input: InquiryInput, ipHash: string) {
  const { postgresRuntimeEnabled, postgresRuntimeServices } = await import("./postgres-runtime-services");
  if (postgresRuntimeEnabled()) {
    const { createPostgresPublicInquiry } = await import("./inquiries-postgres");
    return createPostgresPublicInquiry(postgresRuntimeServices().runner, input, ipHash);
  }
  if (cleanText(input.website, 100)) return { inquiryId: null, duplicate: false, trapped: true };
  const businessId = Number(input.businessId);
  const business = Number.isInteger(businessId) ? getBusinessById(businessId) : undefined;
  if (!business || business.status !== "active") throw new InquiryError("Business not found.", 404);

  const rate = consumeRateLimit(`inquiry:${businessId}:${ipHash}`, 10, 10 * 60 * 1000, 30 * 60 * 1000);
  if (!rate.allowed) throw new InquiryError("Too many inquiry attempts. Please try again later.", 429, rate.retryAfterSeconds);

  const customerName = cleanText(input.customerName, 80);
  const note = cleanText(input.note, 1000);
  const contactMethod = cleanText(input.contactMethod, 20).toLowerCase() || "phone";
  const idempotencyKey = cleanText(input.idempotencyKey, 100);
  const rawItems = Array.isArray(input.items) ? input.items as RawItem[] : [];
  if (customerName.length < 1) throw new InquiryError("A visitor label is required.");
  if (contactMethod !== "phone") throw new InquiryError("A phone number is required to send an inquiry.");
  const contact = normalizePhone(input.contact);
  if (rawItems.length < 1 || rawItems.length > 20) throw new InquiryError("An inquiry must contain between 1 and 20 items.");
  if (!/^[a-zA-Z0-9_-]{10,100}$/.test(idempotencyKey)) throw new InquiryError("A valid inquiry key is required.");

  const existing = getDb().prepare("SELECT id FROM inquiries WHERE business_id=? AND idempotency_key=?").get(businessId, idempotencyKey) as any;
  if (existing) return { inquiryId: Number(existing.id), duplicate: true, trapped: false };

  const productStmt = getDb().prepare("SELECT * FROM products WHERE id=? AND business_id=? AND is_published=1");
  const groupStmt = getDb().prepare("SELECT id,name FROM option_groups WHERE product_id=? ORDER BY position,id");
  const valueStmt = getDb().prepare("SELECT value FROM option_values WHERE option_group_id=?");
  const validated = rawItems.map((raw) => {
    const productId = Number(raw.productId);
    if (!Number.isInteger(productId)) throw new InquiryError("Invalid offering.");
    const product = productStmt.get(productId, businessId) as any;
    if (!product || !["available","limited"].includes(product.availability)) throw new InquiryError("A selected offering is not available.");
    const quantityMode = normalizeQuantityMode(product.quantity_mode);
    if (
      raw.quantity !== null &&
      raw.quantity !== undefined &&
      typeof raw.quantity !== "string" &&
      typeof raw.quantity !== "number"
    ) {
      throw new InquiryError("Enter desired quantity as text.");
    }
    const quantityIntent =
      raw.quantity === null || raw.quantity === undefined
        ? ""
        : cleanText(raw.quantity, 81).replace(/\s+/g, " ");
    if (quantityIntent.length > 80) {
      throw new InquiryError("Desired quantity must be 80 characters or fewer.");
    }
    const options = raw.options && typeof raw.options === "object" && !Array.isArray(raw.options) ? raw.options as Record<string, unknown> : {};
    const groups = groupStmt.all(productId) as Array<{ id:number; name:string }>;
    const normalized: Record<string,string> = {};
    const allowedNames = new Set(groups.map((group) => group.name));
    for (const key of Object.keys(options)) if (!allowedNames.has(key)) throw new InquiryError(`Invalid option for ${product.name}.`);
    for (const group of groups) {
      const selected = cleanText(options[group.name], 100);
      const values = new Set((valueStmt.all(group.id) as Array<{value:string}>).map((item) => item.value));
      if (!selected || !values.has(selected)) throw new InquiryError(`Choose a valid ${group.name} for ${product.name}.`);
      normalized[group.name] = selected;
    }
    return {
      productId,
      quantityIntent,
      name: String(product.name),
      offeringKind: normalizeOfferingKind(product.offering_kind),
      quantityMode,
      options: normalized,
    };
  });

  const inquiryId = inTransaction(() => {
    const db = getDb();
    const result = db.prepare("INSERT INTO inquiries(business_id,customer_name,contact,contact_method,note,status,source,idempotency_key,ip_hash,updated_at) VALUES(?,?,?,?,?,'new','showroom',?,?,CURRENT_TIMESTAMP)").run(
      businessId, customerName, contact, contactMethod, note, idempotencyKey, ipHash,
    );
    const id = Number(result.lastInsertRowid);
    const insertItem = db.prepare(
      `INSERT INTO inquiry_items(
        inquiry_id,product_id,product_name_snapshot,quantity,quantity_intent,
        offering_kind_snapshot,quantity_mode_snapshot,options_json
      ) VALUES(?,?,?,?,?,?,?,?)`,
    );
    for (const item of validated) {
      insertItem.run(
        id,
        item.productId,
        item.name,
        null,
        item.quantityIntent,
        item.offeringKind,
        item.quantityMode,
        JSON.stringify(item.options),
      );
    }
    return id;
  });

  await notifyNewInquiry(business, inquiryId, customerName);
  return { inquiryId, duplicate: false, trapped: false };
}
