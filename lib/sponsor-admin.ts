import { likePattern, normalizePageRequest, pageResult, pageWindow } from "./pagination";
import { cleanText } from "./security";
import { runtimeAll, runtimeGet, runtimeRun, type RuntimeSqlValue } from "./runtime-sql";

export class SponsorAdminError extends Error {}

type SponsorTestDatabase = {
  prepare(sql: string): {
    all(...values: readonly RuntimeSqlValue[]): unknown[];
    get(...values: readonly RuntimeSqlValue[]): unknown;
    run(...values: readonly RuntimeSqlValue[]): { lastInsertRowid: number | bigint };
  };
};

export type ExternalSponsorAd = {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  websiteUrl: string;
  phone: string;
  position: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type ExternalSponsorRow = {
  id: number;
  name: string;
  description: string;
  image_path: string;
  website_url: string | null;
  phone: string | null;
  position: number;
  active: number;
  created_at: number;
  updated_at: number;
};

function mapExternalSponsor(row: ExternalSponsorRow): ExternalSponsorAd {
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    imagePath: row.image_path,
    websiteUrl: row.website_url || "",
    phone: row.phone || "",
    position: Number(row.position),
    active: Boolean(row.active),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function positionValue(value: unknown) {
  const position = Number.parseInt(String(value), 10);
  if (!Number.isInteger(position) || position < 1 || position > 999) {
    throw new SponsorAdminError("Sponsor position must be between 1 and 999.");
  }
  return position;
}

function websiteValue(value: unknown) {
  const raw = cleanText(value, 500);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname) throw new Error();
    return url.toString();
  } catch {
    throw new SponsorAdminError("Sponsor website must be a public HTTPS URL.");
  }
}

function phoneValue(value: unknown) {
  const raw = cleanText(value, 40);
  if (!raw) return "";
  const phone = raw.replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(phone)) throw new SponsorAdminError("Sponsor phone must contain 7 to 15 digits.");
  return phone;
}

function externalSponsorInput(input: {
  name: unknown;
  description: unknown;
  imagePath: unknown;
  websiteUrl: unknown;
  phone: unknown;
  position: unknown;
  active: boolean;
}) {
  const name = cleanText(input.name, 100);
  const description = cleanText(input.description, 180);
  const imagePath = cleanText(input.imagePath, 300);
  const websiteUrl = websiteValue(input.websiteUrl);
  const phone = phoneValue(input.phone);
  if (name.length < 2) throw new SponsorAdminError("Sponsor name must contain at least 2 characters.");
  if (description.length < 2) throw new SponsorAdminError("Sponsor details must contain at least 2 characters.");
  if (!imagePath.startsWith("/media/")) throw new SponsorAdminError("Upload an approved sponsor image.");
  if (!websiteUrl && !phone) throw new SponsorAdminError("Add a sponsor website or phone number.");
  return { name, description, imagePath, websiteUrl: websiteUrl || null, phone: phone || null, position: positionValue(input.position), active: input.active ? 1 : 0 };
}

async function all<T>(db: SponsorTestDatabase | undefined, sql: string, values: readonly RuntimeSqlValue[] = []) {
  return db ? db.prepare(sql).all(...values) as T[] : runtimeAll<T>(sql, values);
}

async function get<T>(db: SponsorTestDatabase | undefined, sql: string, values: readonly RuntimeSqlValue[] = []) {
  return db ? db.prepare(sql).get(...values) as T | undefined : runtimeGet<T>(sql, values);
}

export async function listExternalSponsorAdsPage(input: { page?: unknown; q?: unknown }, db?: SponsorTestDatabase) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const params: RuntimeSqlValue[] = [];
  let where = "";
  if (request.search) {
    where = " WHERE lower(name) LIKE ? ESCAPE '\\' OR lower(description) LIKE ? ESCAPE '\\'";
    const pattern = likePattern(request.search);
    params.push(pattern, pattern);
  }
  const total = Number((await get<{ total: number }>(db, `SELECT COUNT(*) total FROM external_sponsor_ads${where}`, params))?.total || 0);
  const window = pageWindow(total, request);
  const rows = await all<ExternalSponsorRow>(db, `SELECT * FROM external_sponsor_ads${where} ORDER BY active DESC,position,name,id LIMIT ? OFFSET ?`, [...params, window.limit, window.offset]);
  return pageResult(rows.map(mapExternalSponsor), total, request);
}

export async function getExternalSponsorAd(id: number, db?: SponsorTestDatabase) {
  const row = await get<ExternalSponsorRow>(db, "SELECT * FROM external_sponsor_ads WHERE id=?", [id]);
  return row ? mapExternalSponsor(row) : undefined;
}

export async function createExternalSponsorAd(input: Parameters<typeof externalSponsorInput>[0], db?: SponsorTestDatabase) {
  const value = externalSponsorInput(input);
  const now = Date.now();
  const params = [value.name, value.description, value.imagePath, value.websiteUrl, value.phone, value.position, value.active, now, now] as const;
  const id = db
    ? Number(db.prepare(`INSERT INTO external_sponsor_ads(name,description,image_path,website_url,phone,position,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`).run(...params).lastInsertRowid)
    : Number((await runtimeGet<{ id: number }>(`INSERT INTO external_sponsor_ads(name,description,image_path,website_url,phone,position,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) RETURNING id`, params))!.id);
  return { id };
}

export async function updateExternalSponsorAd(input: Parameters<typeof externalSponsorInput>[0] & { id: unknown }, db?: SponsorTestDatabase) {
  const id = Number.parseInt(String(input.id), 10);
  if (!Number.isInteger(id) || !(await get(db, "SELECT 1 FROM external_sponsor_ads WHERE id=?", [id]))) throw new SponsorAdminError("Sponsor ad not found.");
  const value = externalSponsorInput(input);
  const params = [value.name, value.description, value.imagePath, value.websiteUrl, value.phone, value.position, value.active, Date.now(), id] as const;
  if (db) db.prepare(`UPDATE external_sponsor_ads SET name=?,description=?,image_path=?,website_url=?,phone=?,position=?,active=?,updated_at=? WHERE id=?`).run(...params);
  else await runtimeRun(`UPDATE external_sponsor_ads SET name=?,description=?,image_path=?,website_url=?,phone=?,position=?,active=?,updated_at=? WHERE id=?`, params);
  return { id };
}

export async function setBusinessSponsorship(input: { businessId: unknown; position: unknown; active: boolean }, db?: SponsorTestDatabase) {
  const businessId = Number.parseInt(String(input.businessId), 10);
  if (!Number.isInteger(businessId) || !(await get(db, "SELECT 1 FROM businesses WHERE id=?", [businessId]))) throw new SponsorAdminError("Business not found.");
  const position = positionValue(input.position);
  const values = [businessId, position, input.active ? 1 : 0, Date.now()] as const;
  const sql = `INSERT INTO discovery_sponsorships(business_id,position,active,updated_at) VALUES(?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET position=excluded.position,active=excluded.active,updated_at=excluded.updated_at`;
  if (db) db.prepare(sql).run(...values);
  else await runtimeRun(sql, values);
  return { businessId };
}
