import { PostgresCatalogRepository } from "./postgres-catalog-repository";
import { InquiryError, type InquiryInput } from "./inquiries";
import { notifyNewInquiry } from "./notifications";
import { normalizeOfferingKind, normalizeQuantityMode } from "./offerings";
import type { PostgresTransactionRunner } from "./postgres-runtime";
import { consumePostgresRateLimit } from "./rate-limit-postgres";
import { cleanText } from "./security";
import type { Business } from "./types";

type RawItem = { productId?: unknown; quantity?: unknown; options?: unknown };
type InquiryNotifier = (business: Business, inquiryId: number, customerName: string) => Promise<unknown>;

function normalizePhone(value: unknown) {
  const raw = cleanText(value, 40);
  if (!/^\+?[\d\s().-]+$/.test(raw)) throw new InquiryError("Enter a valid phone number.");
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) throw new InquiryError("Enter a phone number with 7 to 15 digits.");
  return `${raw.startsWith("+") ? "+" : ""}${digits}`;
}

export async function createPostgresPublicInquiry(
  runner: PostgresTransactionRunner,
  input: InquiryInput,
  ipHash: string,
  notify: InquiryNotifier = notifyNewInquiry,
) {
  if (cleanText(input.website, 100)) return { inquiryId: null, duplicate: false, trapped: true };
  const businessId = Number(input.businessId);
  const catalog = new PostgresCatalogRepository(runner);
  const business = Number.isInteger(businessId) ? await catalog.getBusinessById(businessId) : undefined;
  if (!business || business.status !== "active") throw new InquiryError("Business not found.", 404);

  const rate = await consumePostgresRateLimit(runner, `inquiry:${businessId}:${ipHash}`, 10, 10 * 60 * 1000, 30 * 60 * 1000);
  if (!rate.allowed) throw new InquiryError("Too many inquiry attempts. Please try again later.", 429, rate.retryAfterSeconds);

  const customerName = cleanText(input.customerName, 80);
  const note = cleanText(input.note, 1000);
  const contactMethod = cleanText(input.contactMethod, 20).toLowerCase() || "phone";
  const idempotencyKey = cleanText(input.idempotencyKey, 100);
  const rawItems = Array.isArray(input.items) ? input.items as RawItem[] : [];
  if (!customerName) throw new InquiryError("A visitor label is required.");
  if (contactMethod !== "phone") throw new InquiryError("A phone number is required to send an inquiry.");
  const contact = normalizePhone(input.contact);
  if (rawItems.length < 1 || rawItems.length > 20) throw new InquiryError("An inquiry must contain between 1 and 20 items.");
  if (!/^[a-zA-Z0-9_-]{10,100}$/.test(idempotencyKey)) throw new InquiryError("A valid inquiry key is required.");

  const validated = [] as Array<{ productId: number; quantityIntent: string; name: string; offeringKind: string; quantityMode: string; options: Record<string, string> }>;
  for (const raw of rawItems) {
    const productId = Number(raw.productId);
    if (!Number.isInteger(productId)) throw new InquiryError("Invalid offering.");
    const product = (await runner.query<{ name: string; availability: string; offering_kind: string; quantity_mode: string }>(
      "SELECT name,availability,offering_kind,quantity_mode FROM products WHERE id=? AND business_id=? AND is_published=1",
      [productId, businessId],
    )).rows[0];
    if (!product || !["available", "limited"].includes(product.availability)) throw new InquiryError("A selected offering is not available.");
    if (raw.quantity !== null && raw.quantity !== undefined && typeof raw.quantity !== "string" && typeof raw.quantity !== "number") throw new InquiryError("Enter desired quantity as text.");
    const quantityIntent = raw.quantity === null || raw.quantity === undefined ? "" : cleanText(raw.quantity, 81).replace(/\s+/g, " ");
    if (quantityIntent.length > 80) throw new InquiryError("Desired quantity must be 80 characters or fewer.");
    const options = raw.options && typeof raw.options === "object" && !Array.isArray(raw.options) ? raw.options as Record<string, unknown> : {};
    const groups = (await runner.query<{ id: number; name: string }>("SELECT id,name FROM option_groups WHERE product_id=? ORDER BY position,id", [productId])).rows;
    const allowedNames = new Set(groups.map((group) => group.name));
    for (const key of Object.keys(options)) if (!allowedNames.has(key)) throw new InquiryError(`Invalid option for ${product.name}.`);
    const normalized: Record<string, string> = {};
    for (const group of groups) {
      const selected = cleanText(options[group.name], 100);
      const values = new Set((await runner.query<{ value: string }>("SELECT value FROM option_values WHERE option_group_id=?", [group.id])).rows.map((value) => value.value));
      if (!selected || !values.has(selected)) throw new InquiryError(`Choose a valid ${group.name} for ${product.name}.`);
      normalized[group.name] = selected;
    }
    validated.push({ productId, quantityIntent, name: product.name, offeringKind: normalizeOfferingKind(product.offering_kind), quantityMode: normalizeQuantityMode(product.quantity_mode), options: normalized });
  }

  const created = await runner.transaction(async () => {
    const existing = await runner.query<{ id: number }>("SELECT id FROM inquiries WHERE business_id=? AND idempotency_key=? FOR UPDATE", [businessId, idempotencyKey]);
    if (existing.rows[0]) return { inquiryId: existing.rows[0].id, duplicate: true };
    let inquiryId: number;
    try {
      const inserted = await runner.query<{ id: number }>(
        "INSERT INTO inquiries(business_id,customer_name,contact,contact_method,note,status,source,idempotency_key,ip_hash,updated_at) VALUES(?,?,?,?,?,'new','showroom',?,?,CURRENT_TIMESTAMP) RETURNING id",
        [businessId, customerName, contact, contactMethod, note, idempotencyKey, ipHash],
      );
      inquiryId = inserted.rows[0]?.id || 0;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "23505") throw error;
      const raced = await runner.query<{ id: number }>("SELECT id FROM inquiries WHERE business_id=? AND idempotency_key=?", [businessId, idempotencyKey]);
      if (!raced.rows[0]) throw error;
      return { inquiryId: raced.rows[0].id, duplicate: true };
    }
    if (!inquiryId) throw new Error("PostgreSQL did not return the created inquiry identifier.");
    for (const item of validated) await runner.query(
      "INSERT INTO inquiry_items(inquiry_id,product_id,product_name_snapshot,quantity,quantity_intent,offering_kind_snapshot,quantity_mode_snapshot,options_json) VALUES(?,?,?,?,?,?,?,?)",
      [inquiryId, item.productId, item.name, null, item.quantityIntent, item.offeringKind, item.quantityMode, JSON.stringify(item.options)],
    );
    return { inquiryId, duplicate: false };
  });
  if (!created.duplicate) await notify(business, created.inquiryId, customerName);
  return { ...created, trapped: false };
}
