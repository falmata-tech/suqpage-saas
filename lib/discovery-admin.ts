import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./db";
import { DISCOVERY_INDUSTRIES } from "./discovery";
import { likePattern, normalizePageRequest, pageResult, pageWindow } from "./pagination";
import { cleanText } from "./security";

export class DiscoveryAdminError extends Error {}

export type DiscoveryProfileAdminView = {
  businessId: number;
  businessName: string;
  handle: string;
  status: string;
  industryKeys: string[];
  boothImagePath: string;
  city: string;
  zone: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  fallbackStyle: string;
  featured: boolean;
  excluded: boolean;
  approved: boolean;
};

type ProfileRow = {
  business_id: number;
  business_name: string;
  handle: string;
  status: string;
  industry_keys: string | null;
  booth_image_path: string | null;
  city: string | null;
  zone: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  fallback_style: string | null;
  is_featured: number | null;
  is_excluded: number | null;
  approved_at: number | null;
};

function mapProfile(row: ProfileRow): DiscoveryProfileAdminView {
  return {
    businessId: row.business_id,
    businessName: row.business_name,
    handle: row.handle,
    status: row.status,
    industryKeys: row.industry_keys?.split(",").filter(Boolean) || [],
    boothImagePath: row.booth_image_path || "",
    city: row.city || "",
    zone: row.zone || "",
    region: row.region || "",
    latitude: row.latitude,
    longitude: row.longitude,
    fallbackStyle: row.fallback_style || "workshop",
    featured: Boolean(row.is_featured),
    excluded: Boolean(row.is_excluded),
    approved: Boolean(row.approved_at),
  };
}

const selectProfile = `
  SELECT b.id business_id,b.name business_name,b.handle,b.status,
    p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
    p.fallback_style,p.is_featured,p.is_excluded,p.approved_at,
    (SELECT group_concat(i.industry_key,',') FROM business_industries i WHERE i.business_id=b.id) industry_keys
  FROM businesses b
  LEFT JOIN business_discovery_profiles p ON p.business_id=b.id`;

export function listDiscoveryProfilesPage(input: { page?: unknown; q?: unknown; status?: unknown }) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const status = ["active", "draft", "suspended"].includes(String(input.status)) ? String(input.status) : "";
  const params: Array<string | number> = [];
  let where = " WHERE 1=1";
  if (status) { where += " AND b.status=?"; params.push(status); }
  if (request.search) {
    const pattern = likePattern(request.search);
    where += " AND (lower(b.name) LIKE ? ESCAPE '\\' OR lower(b.handle) LIKE ? ESCAPE '\\' OR lower(COALESCE(p.city,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(p.zone,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(p.region,'')) LIKE ? ESCAPE '\\')";
    params.push(pattern, pattern, pattern, pattern, pattern);
  }
  const total = Number((getDb().prepare(`SELECT COUNT(*) total FROM businesses b LEFT JOIN business_discovery_profiles p ON p.business_id=b.id${where}`).get(...params) as { total: number }).total);
  const window = pageWindow(total, request);
  const rows = getDb().prepare(`${selectProfile}${where} ORDER BY p.is_excluded,lower(b.name),b.id LIMIT ? OFFSET ?`).all(...params, window.limit, window.offset) as ProfileRow[];
  return pageResult(rows.map(mapProfile), total, request);
}

export function getDiscoveryProfileAdminView(businessId: number) {
  const row = getDb().prepare(`${selectProfile} WHERE b.id=?`).get(businessId) as ProfileRow | undefined;
  return row ? mapProfile(row) : undefined;
}

export function updateDiscoveryProfile(input: {
  businessId: unknown;
  industryKeys: unknown[];
  boothImagePath: unknown;
  city: unknown;
  zone: unknown;
  region: unknown;
  latitude: unknown;
  longitude: unknown;
  fallbackStyle: unknown;
  featured: boolean;
  excluded: boolean;
}, db: DatabaseSync = getDb()) {
  const businessId = Number.parseInt(String(input.businessId), 10);
  const allowedIndustries = new Set(DISCOVERY_INDUSTRIES.map((industry) => industry.key));
  const industryKeys = [...new Set(input.industryKeys.map((value) => cleanText(value, 40)).filter((value) => allowedIndustries.has(value as never)))];
  const boothImagePath = cleanText(input.boothImagePath, 300);
  const city = cleanText(input.city, 100);
  const zone = cleanText(input.zone, 100);
  const region = cleanText(input.region, 100);
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const fallbackStyle = cleanText(input.fallbackStyle, 30);
  const allowedFallbacks = new Set(["workshop", "botanical", "textile", "food", "home", "technical"]);
  if (!Number.isInteger(businessId) || !db.prepare("SELECT 1 FROM businesses WHERE id=?").get(businessId)) throw new DiscoveryAdminError("Business not found.");
  if (!industryKeys.length) throw new DiscoveryAdminError("Choose at least one industry.");
  if (!boothImagePath.startsWith("/")) throw new DiscoveryAdminError("Use an approved local booth image path.");
  if (!city || !zone || !region) throw new DiscoveryAdminError("City, zone, and region are required.");
  if (!Number.isFinite(latitude) || latitude < 3 || latitude > 15 || !Number.isFinite(longitude) || longitude < 32 || longitude > 49) throw new DiscoveryAdminError("Coordinates must be inside the supported Ethiopia bounds.");
  if (!allowedFallbacks.has(fallbackStyle)) throw new DiscoveryAdminError("Choose an approved fallback style.");
  const now = Date.now();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`
      INSERT INTO business_discovery_profiles(
        business_id,booth_image_path,city,zone,region,latitude,longitude,
        fallback_style,is_featured,is_excluded,approved_at,updated_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(business_id) DO UPDATE SET
        booth_image_path=excluded.booth_image_path,city=excluded.city,zone=excluded.zone,
        region=excluded.region,latitude=excluded.latitude,longitude=excluded.longitude,
        fallback_style=excluded.fallback_style,is_featured=excluded.is_featured,
        is_excluded=excluded.is_excluded,approved_at=excluded.approved_at,updated_at=excluded.updated_at
    `).run(businessId, boothImagePath, city, zone, region, latitude, longitude, fallbackStyle, input.featured ? 1 : 0, input.excluded ? 1 : 0, now, now);
    db.prepare("DELETE FROM business_industries WHERE business_id=?").run(businessId);
    const add = db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)");
    industryKeys.forEach((key) => add.run(businessId, key));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { businessId };
}
