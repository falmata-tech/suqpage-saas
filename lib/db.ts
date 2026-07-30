import fs from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { databasePath, ensureRuntimeDirectories } from "./config";
import { normalizeQuantityMode } from "./offerings";
import { migrateDatabase } from "./schema";
import type { Business, Catalog, Category, Collection, OptionGroup, OptionValue, Product, SessionUser } from "./types";

let dbInstance: DatabaseSync | null = null;

export function getDb() {
  if (!dbInstance) {
    ensureRuntimeDirectories();
    const sqlite = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");
    dbInstance = new sqlite.DatabaseSync(databasePath());
    try { fs.chmodSync(databasePath(), 0o600); } catch {}
    migrateDatabase(dbInstance);
  }
  return dbInstance;
}

export function closeDbForTests() {
  dbInstance?.close();
  dbInstance = null;
}

const row = <T,>(value: unknown): T => ({ ...(value as Record<string, unknown>) } as T);
const rows = <T,>(values: unknown[]): T[] => values.map((value) => row<T>(value));

export function inTransaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getBusinessByHandle(handle: string): Business | undefined {
  const found = getDb().prepare(`
    SELECT b.* FROM businesses b
    JOIN business_subscriptions s ON s.business_id=b.id
    WHERE lower(b.handle)=lower(?) AND b.status='active'
      AND s.grace_ends_at>=?
  `).get(handle.replace(/^@/, ""), Date.now());
  return found ? row<Business>(found) : undefined;
}

export function getBusinessByHandleAny(handle: string): Business | undefined {
  const found = getDb().prepare("SELECT * FROM businesses WHERE lower(handle)=lower(?)").get(handle.replace(/^@/, ""));
  return found ? row<Business>(found) : undefined;
}

export function getBusinessById(id: number): Business | undefined {
  const found = getDb().prepare("SELECT * FROM businesses WHERE id=?").get(id);
  return found ? row<Business>(found) : undefined;
}

export function hasRetainedPublication(businessId: number) {
  return Boolean(
    getDb()
      .prepare(
        "SELECT 1 FROM published_catalog_versions WHERE business_id=? LIMIT 1",
      )
      .get(businessId),
  );
}

export function getAllBusinesses(): Business[] {
  return rows<Business>(getDb().prepare("SELECT * FROM businesses ORDER BY name").all());
}

export function getCatalogByBusinessId(businessId: number, includeDrafts = false): Catalog | undefined {
  const business = getBusinessById(businessId);
  if (!business) return undefined;
  const activeClause = includeDrafts ? "" : "AND is_active=1";
  const collections = rows<Collection>(getDb().prepare(`SELECT * FROM collections WHERE business_id=? ${activeClause} ORDER BY sort_order,name`).all(businessId));
  const categories = rows<Category>(getDb().prepare(`SELECT * FROM categories WHERE business_id=? ${activeClause} ORDER BY sort_order,name`).all(businessId));
  const publishedClause = includeDrafts ? "" : "AND p.is_published=1";
  const products = rows<Product>(getDb().prepare(`
    SELECT p.*, c.name collection_name, cat.name category_name
    FROM products p
    LEFT JOIN collections c ON c.id=p.collection_id
    LEFT JOIN categories cat ON cat.id=p.category_id
    WHERE p.business_id=? ${publishedClause}
    ORDER BY p.sort_order,p.name
  `).all(businessId));
  const groupStmt = getDb().prepare("SELECT * FROM option_groups WHERE product_id=? ORDER BY position,id");
  const valueStmt = getDb().prepare("SELECT * FROM option_values WHERE option_group_id=? ORDER BY id");
  for (const product of products) {
    product.quantity_mode = normalizeQuantityMode(product.quantity_mode);
    product.option_groups = rows<OptionGroup>(groupStmt.all(product.id)).map((group) => ({
      ...group,
      values: rows<OptionValue>(valueStmt.all(group.id)),
    }));
  }
  return { business, collections, categories, products };
}

export function getCatalogByHandle(handle: string): Catalog | undefined {
  const business = getBusinessByHandle(handle);
  return business ? getCatalogByBusinessId(business.id, false) : undefined;
}

export function getUserByEmail(email: string): (SessionUser & { password_hash: string }) | undefined {
  const found = getDb().prepare(`
    SELECT u.id,u.email,u.name,u.role,u.business_id,u.password_hash,u.must_change_password,
      COALESCE(p.access_role,CASE WHEN u.role='admin' THEN 'platform_admin' ELSE 'client' END) access_role
    FROM users u LEFT JOIN user_access_profiles p ON p.user_id=u.id
    WHERE lower(u.email)=lower(?)
  `).get(email);
  return found ? row<SessionUser & { password_hash: string }>(found) : undefined;
}

export function getUserById(id: number): SessionUser | undefined {
  const found = getDb().prepare(`
    SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,
      COALESCE(p.access_role,CASE WHEN u.role='admin' THEN 'platform_admin' ELSE 'client' END) access_role
    FROM users u LEFT JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=?
  `).get(id);
  return found ? row<SessionUser>(found) : undefined;
}

export function listInquiries(businessId: number) {
  return getDb().prepare(`SELECT i.*,COUNT(ii.id) item_count FROM inquiries i LEFT JOIN inquiry_items ii ON ii.inquiry_id=i.id WHERE i.business_id=? GROUP BY i.id ORDER BY i.created_at DESC`).all(businessId) as any[];
}

export function getInquiry(id: number, businessId: number) {
  const inquiry = getDb().prepare("SELECT * FROM inquiries WHERE id=? AND business_id=?").get(id, businessId) as any;
  if (!inquiry) return undefined;
  inquiry.items = getDb().prepare("SELECT * FROM inquiry_items WHERE inquiry_id=? ORDER BY id").all(id) as any[];
  return inquiry;
}

export function listDeliveryRequests(businessId: number) {
  return getDb().prepare(`SELECT d.*,i.customer_name inquiry_customer FROM delivery_requests d LEFT JOIN inquiries i ON i.id=d.inquiry_id WHERE d.business_id=? ORDER BY d.created_at DESC`).all(businessId) as any[];
}

export function listDeliveryCompanies() {
  return getDb().prepare("SELECT * FROM delivery_companies WHERE active=1 ORDER BY name").all() as any[];
}
