import { DISCOVERY_INDUSTRIES } from "./discovery";
import type { ProductionScale } from "./discovery";
import { likePattern, normalizePageRequest, pageResult, pageWindow } from "./pagination";
import { cleanText } from "./security";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import { findKnownPlace } from "./place-catalog";
import { isCountryCode } from "./countries";

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
  countryCode: string;
  cityId: string;
  latitude: number | null;
  longitude: number | null;
  fallbackStyle: string;
  sponsored: boolean;
  sponsorPosition: number;
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
  country_code: string | null;
  city_id: string | null;
  latitude: number | null;
  longitude: number | null;
  fallback_style: string | null;
  is_sponsored: number | null;
  sponsor_position: number | null;
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
    countryCode: row.country_code || "",
    cityId: row.city_id || "",
    latitude: row.latitude,
    longitude: row.longitude,
    fallbackStyle: row.fallback_style || "workshop",
    sponsored: Boolean(row.is_sponsored),
    sponsorPosition: row.sponsor_position || 100,
    excluded: Boolean(row.is_excluded),
    approved: Boolean(row.approved_at),
    productionScale: row.production_scale || "workshop",
  };
}

const selectProfile = () => {
  const aggregate = "string_agg";
  return `
  SELECT b.id business_id,b.name business_name,b.handle,b.status,
    p.booth_image_path,p.city,p.zone,p.region,p.country_code,p.city_id,p.latitude,p.longitude,
    p.fallback_style,p.is_excluded,p.approved_at,p.production_scale,
    COALESCE((SELECT active FROM discovery_sponsorships s WHERE s.business_id=b.id),0) is_sponsored,
    (SELECT position FROM discovery_sponsorships s WHERE s.business_id=b.id) sponsor_position,
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
  proposalVersion?: unknown;
  industryKeys?: unknown[];
  boothImagePath?: unknown;
  city?: unknown;
  zone?: unknown;
  region?: unknown;
  countryCode?: unknown;
  placeId?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  fallbackStyle?: unknown;
  productionScale?: unknown;
  sponsored?: boolean;
  sponsorPosition?: unknown;
  excluded?: boolean;
}) {
  const businessId = Number(input.businessId);
  if (!Number.isSafeInteger(businessId) || businessId < 1) throw new DiscoveryAdminError("Business not found.");
  const coordinate = (value: unknown) => typeof value === "number" ? value
    : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
  const now = Date.now();
  await runtimeTransaction(async () => {
    const locked = await runtimeRun('UPDATE businesses SET content_version=content_version WHERE id=?', [businessId]);
    if (!locked.changes) throw new DiscoveryAdminError("Business not found.");
    // Omitted controls come from the current canonical row, never a posted snapshot.
    const current = (await getDiscoveryProfileAdminView(businessId))!;
    const savedProfile = await runtimeGet<{approved_at:number}>('SELECT approved_at FROM business_discovery_profiles WHERE business_id=?', [businessId]);
    const proposal = await runtimeGet<{version:number;location_mode:string}>('SELECT version,location_mode FROM owner_location_proposals WHERE business_id=?', [businessId]);
    if (proposal && Number(input.proposalVersion) !== proposal.version) throw new DiscoveryAdminError('The owner changed the location. Reload before approving.');
    const allowedIndustries = new Set(DISCOVERY_INDUSTRIES.map((industry) => industry.key));
    const industryKeys = input.industryKeys === undefined ? current.industryKeys : [...new Set(input.industryKeys.map((value) => cleanText(value, 40)).filter((value) => allowedIndustries.has(value as never)))];
    if (input.industryKeys !== undefined && !industryKeys.length) throw new DiscoveryAdminError("Choose at least one industry.");
    const boothImagePath = input.boothImagePath === undefined ? current.boothImagePath : cleanText(input.boothImagePath, 300);
    if (boothImagePath && !boothImagePath.startsWith("/")) throw new DiscoveryAdminError("Use an approved local booth image path.");
    let city = input.city === undefined ? current.city : cleanText(input.city, 100);
    let zone = input.zone === undefined ? current.zone : cleanText(input.zone, 100);
    let region = input.region === undefined ? current.region : cleanText(input.region, 100);
    let countryCode = current.countryCode, cityId = current.cityId;
    if (input.placeId !== undefined) {
      const place = typeof input.placeId === 'string' && input.placeId.length <= 100 ? findKnownPlace(input.placeId) : null;
      if (!place) throw new DiscoveryAdminError('Choose your business city from the results.');
      if (!isCountryCode(input.countryCode) || input.countryCode !== place.countryCode) throw new DiscoveryAdminError('Choose a city in the selected country.');
      city = place.name; region = place.region; countryCode = input.countryCode; cityId = place.id;
      // Administrative zone is legacy metadata, not public city authority.
      zone = current.zone;
    } else if ((current.cityId && (city !== current.city || region !== current.region)) ||
      (input.countryCode !== undefined && input.countryCode !== current.countryCode)) {
      throw new DiscoveryAdminError('Choose your business city from the results.');
    }
    // Unknown legacy geography may be retained by unrelated edits without inventing a city.
    const hasLatitude = Object.hasOwn(input, 'latitude'), hasLongitude = Object.hasOwn(input, 'longitude');
    let latitude = hasLatitude ? coordinate(input.latitude) : current.latitude;
    let longitude = hasLongitude ? coordinate(input.longitude) : current.longitude;
    if (hasLatitude || hasLongitude) {
      if (latitude === null || longitude === null || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new DiscoveryAdminError("Enter valid public storefront coordinates.");
    }
    if (proposal?.location_mode === 'area') {
      if (latitude !== null) latitude = Math.round(latitude * 10) / 10;
      if (longitude !== null) longitude = Math.round(longitude * 10) / 10;
    }
    const hasLocationInput = input.placeId !== undefined || input.city !== undefined || input.region !== undefined || hasLatitude || hasLongitude;
    const validLocation = Boolean(city) && latitude !== null && longitude !== null && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
    if ((!savedProfile || hasLocationInput) && !validLocation) throw new DiscoveryAdminError('Choose your business city from the results.');
    const reviewsLocation = hasLocationInput && validLocation;
    const approvedAt = reviewsLocation ? now : savedProfile?.approved_at || 0;
    const fallbackStyle = input.fallbackStyle === undefined ? current.fallbackStyle : cleanText(input.fallbackStyle, 30);
    const productionScale = input.productionScale === undefined ? current.productionScale : cleanText(input.productionScale, 30);
    if (!new Set(["workshop", "botanical", "textile", "food", "home", "technical"]).has(fallbackStyle)) throw new DiscoveryAdminError("Choose an approved fallback style.");
    if (productionScale !== "workshop" && productionScale !== "growing_factory") throw new DiscoveryAdminError("Choose an approved production scale.");
    const excluded = input.excluded === undefined ? current.excluded : input.excluded;
    await runtimeRun(`
      INSERT INTO business_discovery_profiles(
        business_id,booth_image_path,city,zone,region,country_code,city_id,latitude,longitude,
        fallback_style,production_scale,is_featured,is_excluded,approved_at,updated_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(business_id) DO UPDATE SET
        booth_image_path=excluded.booth_image_path,city=excluded.city,zone=excluded.zone,
        region=excluded.region,country_code=excluded.country_code,city_id=excluded.city_id,
        latitude=excluded.latitude,longitude=excluded.longitude,
        fallback_style=excluded.fallback_style,production_scale=excluded.production_scale,
        is_excluded=excluded.is_excluded,approved_at=excluded.approved_at,updated_at=excluded.updated_at
    `, [businessId, boothImagePath, city, zone, region, countryCode, cityId, latitude, longitude, fallbackStyle, productionScale, input.sponsored ? 1 : 0, excluded ? 1 : 0, approvedAt, now]);
    if (input.industryKeys !== undefined) {
      await runtimeRun("DELETE FROM business_industries WHERE business_id=?", [businessId]);
      for (const key of industryKeys) await runtimeRun("INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)", [businessId, key]);
    }
    // The location editor has no sponsorship controls; do not replay a stale pre-read.
    if (input.sponsored !== undefined || input.sponsorPosition !== undefined) {
      const savedSponsor = await runtimeGet<{active:number;position:number}>('SELECT active,position FROM discovery_sponsorships WHERE business_id=? FOR UPDATE', [businessId]);
      const sponsored = input.sponsored === undefined ? Boolean(savedSponsor?.active) : input.sponsored;
      const sponsorPosition = input.sponsorPosition === undefined ? savedSponsor?.position || 100 : Number.parseInt(String(input.sponsorPosition), 10);
      if (!Number.isInteger(sponsorPosition) || sponsorPosition < 1 || sponsorPosition > 999) throw new DiscoveryAdminError("Sponsored position must be between 1 and 999.");
      await runtimeRun(`INSERT INTO discovery_sponsorships(business_id,position,active,updated_at)
        VALUES(?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET
        position=excluded.position,active=excluded.active,updated_at=excluded.updated_at`, [businessId, sponsorPosition, sponsored ? 1 : 0, now]);
      if (input.sponsored !== undefined) await runtimeRun('UPDATE business_discovery_profiles SET is_featured=? WHERE business_id=?', [sponsored ? 1 : 0, businessId]);
    }
    if (reviewsLocation) {
      await runtimeRun('UPDATE owner_location_proposals SET reviewed_version=version WHERE business_id=?', [businessId]);
      // Older owner editors must not replay a location predating this correction.
      await runtimeRun('UPDATE businesses SET content_version=content_version+1 WHERE id=?', [businessId]);
    }
  });
  return { businessId };
}
