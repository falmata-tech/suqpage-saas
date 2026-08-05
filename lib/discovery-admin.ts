import type { DatabaseSync } from "node:sqlite";
import { DISCOVERY_INDUSTRIES } from "./discovery";
import type { ProductionScale } from "./discovery";
import { likePattern, normalizePageRequest, pageResult, pageWindow } from "./pagination";
import { cleanText } from "./security";
import { postgresRuntimePreviewEnabled } from "./postgres-runtime-services";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";

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
  sponsored: boolean;
  sponsorPosition: number;
  sundayIndustryKeys: string[];
  sundayPosition: number;
  excluded: boolean;
  approved: boolean;
  productionScale: ProductionScale;
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
  is_sponsored: number | null;
  sponsor_position: number | null;
  sunday_industry_keys: string | null;
  sunday_position: number | null;
  is_excluded: number | null;
  approved_at: number | null;
  production_scale: ProductionScale | null;
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
    sponsored: Boolean(row.is_sponsored),
    sponsorPosition: row.sponsor_position || 100,
    sundayIndustryKeys: row.sunday_industry_keys?.split(",").filter(Boolean) || [],
    sundayPosition: row.sunday_position || 100,
    excluded: Boolean(row.is_excluded),
    approved: Boolean(row.approved_at),
    productionScale: row.production_scale || "workshop",
  };
}

const selectProfile = () => {
  const aggregate = postgresRuntimePreviewEnabled() ? "string_agg" : "group_concat";
  return `
  SELECT b.id business_id,b.name business_name,b.handle,b.status,
    p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
    p.fallback_style,p.is_excluded,p.approved_at,p.production_scale,
    COALESCE((SELECT active FROM discovery_sponsorships s WHERE s.business_id=b.id),0) is_sponsored,
    (SELECT position FROM discovery_sponsorships s WHERE s.business_id=b.id) sponsor_position,
    (SELECT ${aggregate}(selection.industry_key,',') FROM sunday_showcase_selections selection WHERE selection.business_id=b.id AND selection.active=1) sunday_industry_keys,
    (SELECT MIN(selection.position) FROM sunday_showcase_selections selection WHERE selection.business_id=b.id AND selection.active=1) sunday_position,
    (SELECT ${aggregate}(i.industry_key,',') FROM business_industries i WHERE i.business_id=b.id) industry_keys
  FROM businesses b
  LEFT JOIN business_discovery_profiles p ON p.business_id=b.id`;
};

export async function listDiscoveryProfilesPage(input: { page?: unknown; q?: unknown; status?: unknown }) {
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
  const total = Number((await runtimeGet<{ total: number }>(`SELECT COUNT(*) total FROM businesses b LEFT JOIN business_discovery_profiles p ON p.business_id=b.id${where}`, params))?.total || 0);
  const window = pageWindow(total, request);
  const rows = await runtimeAll<ProfileRow>(`${selectProfile()}${where} ORDER BY p.is_excluded,lower(b.name),b.id LIMIT ? OFFSET ?`, [...params, window.limit, window.offset]);
  return pageResult(rows.map(mapProfile), total, request);
}

export async function getDiscoveryProfileAdminView(businessId: number) {
  const row = await runtimeGet<ProfileRow>(`${selectProfile()} WHERE b.id=?`, [businessId]);
  return row ? mapProfile(row) : undefined;
}

export async function updateDiscoveryProfile(input: {
  businessId: unknown;
  industryKeys: unknown[];
  boothImagePath: unknown;
  city: unknown;
  zone: unknown;
  region: unknown;
  latitude: unknown;
  longitude: unknown;
  fallbackStyle: unknown;
  productionScale: unknown;
  sponsored: boolean;
  sponsorPosition: unknown;
  sundayIndustryKeys: unknown[];
  sundayPosition: unknown;
  excluded: boolean;
}, db?: DatabaseSync) {
  const businessId = Number.parseInt(String(input.businessId), 10);
  const allowedIndustries = new Set(DISCOVERY_INDUSTRIES.map((industry) => industry.key));
  const industryKeys = [...new Set(input.industryKeys.map((value) => cleanText(value, 40)).filter((value) => allowedIndustries.has(value as never)))];
  const sundayIndustryKeys = [...new Set(input.sundayIndustryKeys.map((value) => cleanText(value, 40)).filter((value) => allowedIndustries.has(value as never)))];
  const boothImagePath = cleanText(input.boothImagePath, 300);
  const city = cleanText(input.city, 100);
  const zone = cleanText(input.zone, 100);
  const region = cleanText(input.region, 100);
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const fallbackStyle = cleanText(input.fallbackStyle, 30);
  const productionScale = cleanText(input.productionScale, 30);
  const sponsorPosition = Number.parseInt(String(input.sponsorPosition), 10);
  const sundayPosition = Number.parseInt(String(input.sundayPosition), 10);
  const allowedFallbacks = new Set(["workshop", "botanical", "textile", "food", "home", "technical"]);
  const businessExists = db
    ? db.prepare("SELECT 1 FROM businesses WHERE id=?").get(businessId)
    : await runtimeGet("SELECT 1 FROM businesses WHERE id=?", [businessId]);
  if (!Number.isInteger(businessId) || !businessExists) throw new DiscoveryAdminError("Business not found.");
  if (!industryKeys.length) throw new DiscoveryAdminError("Choose at least one industry.");
  if (!boothImagePath.startsWith("/")) throw new DiscoveryAdminError("Use an approved local booth image path.");
  if (!city || !zone || !region) throw new DiscoveryAdminError("City, zone, and region are required.");
  if (!Number.isFinite(latitude) || latitude < 3 || latitude > 15 || !Number.isFinite(longitude) || longitude < 32 || longitude > 49) throw new DiscoveryAdminError("Coordinates must be inside the supported Ethiopia bounds.");
  if (!allowedFallbacks.has(fallbackStyle)) throw new DiscoveryAdminError("Choose an approved fallback style.");
  if (productionScale !== "workshop" && productionScale !== "growing_factory") throw new DiscoveryAdminError("Choose an approved production scale.");
  if (!Number.isInteger(sponsorPosition) || sponsorPosition < 1 || sponsorPosition > 999) throw new DiscoveryAdminError("Sponsored position must be between 1 and 999.");
  if (!Number.isInteger(sundayPosition) || sundayPosition < 1 || sundayPosition > 999) throw new DiscoveryAdminError("Sunday position must be between 1 and 999.");
  if (sundayIndustryKeys.some((key) => !industryKeys.includes(key))) throw new DiscoveryAdminError("Sunday selections must match an assigned business industry.");
  const now = Date.now();
  if (db) {
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`
      INSERT INTO business_discovery_profiles(
        business_id,booth_image_path,city,zone,region,latitude,longitude,
        fallback_style,production_scale,is_featured,is_excluded,approved_at,updated_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(business_id) DO UPDATE SET
        booth_image_path=excluded.booth_image_path,city=excluded.city,zone=excluded.zone,
        region=excluded.region,latitude=excluded.latitude,longitude=excluded.longitude,
        fallback_style=excluded.fallback_style,production_scale=excluded.production_scale,is_featured=excluded.is_featured,
        is_excluded=excluded.is_excluded,approved_at=excluded.approved_at,updated_at=excluded.updated_at
    `).run(businessId, boothImagePath, city, zone, region, latitude, longitude, fallbackStyle, productionScale, input.sponsored ? 1 : 0, input.excluded ? 1 : 0, now, now);
    db.prepare("DELETE FROM business_industries WHERE business_id=?").run(businessId);
    const add = db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)");
    industryKeys.forEach((key) => add.run(businessId, key));
    db.prepare(`
      INSERT INTO discovery_sponsorships(business_id,position,active,updated_at)
      VALUES(?,?,?,?)
      ON CONFLICT(business_id) DO UPDATE SET
        position=excluded.position,active=excluded.active,updated_at=excluded.updated_at
    `).run(businessId, sponsorPosition, input.sponsored ? 1 : 0, now);
    db.prepare("DELETE FROM sunday_showcase_selections WHERE business_id=?").run(businessId);
    const addSundaySelection = db.prepare(`
      INSERT INTO sunday_showcase_selections(industry_key,business_id,position,active,updated_at)
      VALUES(?,?,?,1,?)
    `);
    sundayIndustryKeys.forEach((key) => addSundaySelection.run(key, businessId, sundayPosition, now));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { businessId };
  }

  await runtimeTransaction(async () => {
    await runtimeRun(`
      INSERT INTO business_discovery_profiles(
        business_id,booth_image_path,city,zone,region,latitude,longitude,
        fallback_style,production_scale,is_featured,is_excluded,approved_at,updated_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(business_id) DO UPDATE SET
        booth_image_path=excluded.booth_image_path,city=excluded.city,zone=excluded.zone,
        region=excluded.region,latitude=excluded.latitude,longitude=excluded.longitude,
        fallback_style=excluded.fallback_style,production_scale=excluded.production_scale,is_featured=excluded.is_featured,
        is_excluded=excluded.is_excluded,approved_at=excluded.approved_at,updated_at=excluded.updated_at
    `, [businessId, boothImagePath, city, zone, region, latitude, longitude, fallbackStyle, productionScale, input.sponsored ? 1 : 0, input.excluded ? 1 : 0, now, now]);
    await runtimeRun("DELETE FROM business_industries WHERE business_id=?", [businessId]);
    for (const key of industryKeys) await runtimeRun("INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)", [businessId, key]);
    await runtimeRun(`
      INSERT INTO discovery_sponsorships(business_id,position,active,updated_at)
      VALUES(?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET
        position=excluded.position,active=excluded.active,updated_at=excluded.updated_at
    `, [businessId, sponsorPosition, input.sponsored ? 1 : 0, now]);
    await runtimeRun("DELETE FROM sunday_showcase_selections WHERE business_id=?", [businessId]);
    for (const key of sundayIndustryKeys) {
      await runtimeRun("INSERT INTO sunday_showcase_selections(industry_key,business_id,position,active,updated_at) VALUES(?,?,?,1,?)", [key, businessId, sundayPosition, now]);
    }
  });
  return { businessId };
}
