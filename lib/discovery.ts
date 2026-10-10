import { findSpellingMatches, type SpellingMatch } from './spelling-search';
import {excludedBusinessIds} from './catalog-safety';
import { platformEnvironment } from "./platform-environment.mjs";
import { normalizePageRequest, pageWindow, pageResult, PUBLIC_PAGE_SIZE, type PageResult } from "./pagination";
import { DISCOVERY_INDUSTRIES, PRODUCTION_SCALES, discoveryCategoryKey, normalizeDiscoveryPlaces, type ProductionScale } from "./discovery-contract";
import { automaticFeaturedLineup, featuredBoothWalkthroughs, MAX_FEATURED_SHOWROOMS, type FeaturedProgramPolicy } from "./featured-program";
import { getFeaturedProgramDaySelection, getFeaturedProgramPolicy, type FeaturedProgramDayMode } from "./featured-program-settings";
import { validateLiveSettings, type LivePlatform } from "./live-showroom";
import { runtimeAll, runtimeGet } from "./runtime-sql";
import { parseShopPageContent } from "./owner-page-domain";
import { publicPageContent } from "./business-profile";
import { SEARCH_SEPARATORS, normalizeSearchText, searchTermGroups } from "./search-terms";

export { PRODUCTION_SCALES, type ProductionScale } from "./discovery-contract";

export { DISCOVERY_INDUSTRIES } from "./discovery-contract";

export type DiscoveryIndustry = (typeof DISCOVERY_INDUSTRIES)[number];
export const ALL_DISCOVERY_INDUSTRIES = { key: "all", label: "All categories", shortLabel: "All categories", icon: "grid", code: "ALL" } as const;
export const UNSELECTED_DISCOVERY_INDUSTRY = { key: "", label: "Choose a category", shortLabel: "Choose a category", icon: "grid", code: "" } as const;
export const DISCOVERY_INDUSTRY_OPTIONS = [...DISCOVERY_INDUSTRIES, ALL_DISCOVERY_INDUSTRIES] as const;
export type DiscoveryIndustryOption = DiscoveryIndustry | typeof ALL_DISCOVERY_INDUSTRIES;
export type DiscoveryIndustrySelection = { key: string; label: string; shortLabel: string; icon: string; code: string };
export const FEATURED_WEEK = [
  { weekday: 1, dayLabel: "Monday", industryKey: "electronics" },
  { weekday: 2, dayLabel: "Tuesday", industryKey: "beauty-wellness" },
  { weekday: 3, dayLabel: "Wednesday", industryKey: "food-farming" },
  { weekday: 4, dayLabel: "Thursday", industryKey: "machinery-tools" },
  { weekday: 5, dayLabel: "Friday", industryKey: "home-living" },
  { weekday: 6, dayLabel: "Saturday", industryKey: "fashion-textiles" },
  { weekday: 0, dayLabel: "Sunday", industryKey: "agriculture-growers" },
] as const;

export function featuredProgramAssignment(dateIso: string) {
  const date = new Date(`${dateIso}T12:00:00+03:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || Number.isNaN(date.getTime())) return null;
  const weekday = date.getUTCDay();
  const assignment = FEATURED_WEEK.find((entry) => entry.weekday === weekday);
  if (!assignment) return null;
  const industry = DISCOVERY_INDUSTRIES.find((entry) => entry.key === assignment.industryKey);
  return industry ? { ...assignment, industry } : null;
}

const ETHIOPIA_TIME_ZONE = "Africa/Addis_Ababa";

type DiscoveryRow = {
  is_demo?: number;
  id: number;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  logo_path: string;
  hero_image_path: string;
  published_profile_json?: string | null;
  location_mode?: "area" | "storefront" | "legacy";
  booth_image_path: string;
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
  fallback_style: string;
  is_sponsored: number;
  sponsor_position: number;
  production_scale: ProductionScale;
  is_live: number;
  live_platform: string;
  live_url: string;
  primary_industry_key: string;
};

type DiscoveryProductResultRow = {
  is_demo?: number;
  id: number;
  name: string;
  description: string;
  image_path: string;
  category_name: string;
  business_id: number;
  business_handle: string;
  business_name: string;
  city: string;
  region: string;
  primary_industry_key: string;
};

type SponsorPlacementRow = {
  kind: "showroom" | "external";
  source_id: number;
  handle: string;
  name: string;
  details: string;
  image_path: string;
  website_url: string | null;
  phone: string | null;
  sponsor_position: number;
};

export type DiscoveryShowroom = {
  isDemo?: boolean;
  locationMode?: "area" | "storefront" | "legacy";
  id: number;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  logoPath: string;
  heroImagePath: string;
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
  fallbackStyle: string;
  sponsored: boolean;
  productionScale: ProductionScale;
  isLive: boolean;
  livePlatform: LivePlatform | "";
  liveUrl: string;
  primaryIndustryKey: string;
  primaryIndustryLabel: string;
  primaryIndustryShortLabel: string;
};

export type SponsorPlacement = {
  id: string;
  kind: "showroom" | "external";
  handle: string;
  name: string;
  details: string;
  imagePath: string;
  href: string;
  actionLabel: string;
  position: number;
};

export type FeaturedBooth = {
  slot: number;
  reference: string;
} & ({
  revealed: true;
  showroom: DiscoveryShowroom;
} | {
  revealed: false;
  showroom: null;
});

export type DiscoveryNearbyGroup = {
  key: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  count: number;
  showroomIds: number[];
};

export type DiscoveryPlaceOption = {
  key: string;
  label: string;
  kind: "region" | "city";
  region: string;
  city: string;
  count: number;
};

export type DiscoverySearchSuggestion = {
  kind: "showroom" | "offering" | "place";
  label: string;
  detail: string;
  query: string;
};

export type DiscoveryProductResult = {
  isDemo?: boolean;
  id: number;
  name: string;
  description: string;
  imagePath: string;
  categoryName: string;
  businessId: number;
  businessHandle: string;
  businessName: string;
  city: string;
  region: string;
  primaryIndustryKey: string;
  primaryIndustryLabel: string;
};

export type WeeklyFeaturedDay = {
  weekday: number;
  dayLabel: string;
  dateIso: string;
  dateLabel: string;
  mode: "featured";
  industryKey: string;
  industryLabel: string;
  industryIcon: string;
  isToday: boolean;
};

export type WeeklyFeaturedProgram = {
  mode: "featured";
  title: string;
  industryCode: string;
  industryLabel: string;
  industryIcon: string;
  selectedWeekday: number;
  isToday: boolean;
  dayLabel: string;
  dateLabel: string;
  boothCount: number;
  booths: FeaturedBooth[];
  schedule: WeeklyFeaturedDay[];
  programPolicy: FeaturedProgramPolicy;
  scheduleMode: FeaturedProgramDayMode;
};

export type DiscoveryView = {
  industry: DiscoveryIndustrySelection;
  industries: readonly DiscoveryIndustryOption[];
  query: string;
  suggestions: DiscoverySearchSuggestion[];
  searchProducts: DiscoveryProductResult[];
  searchBusinesses: DiscoveryShowroom[];
  searchOrder?: Array<Pick<SpellingMatch, 'kind' | 'id'>>;
  resultCounts: { products: number; businesses: number };
  resultPage: Omit<PageResult<never>, "items">;
  place: string;
  places: DiscoveryPlaceOption[];
  productionScale: ProductionScale | "";
  total: number;
  sponsoredCount: number;
  locationCount: number;
  showrooms: DiscoveryShowroom[];
  sponsoredShowrooms: SponsorPlacement[];
  featuredNowBusinessId: number | null;
  nearbyGroups: DiscoveryNearbyGroup[];
  featured: WeeklyFeaturedProgram;
};

export type MarketplaceDiscoveryView = Omit<DiscoveryView, "sponsoredShowrooms" | "featured">;
export type FeaturedShowroomsView = Pick<DiscoveryView, "featured" | "featuredNowBusinessId">;

function normalizeIndustry(key: string | undefined) {
  return DISCOVERY_INDUSTRIES.find((industry) => industry.key === key) || DISCOVERY_INDUSTRIES[0];
}

function normalizeIndustrySelection(value: string | readonly string[] | undefined): DiscoveryIndustrySelection {
  const key = discoveryCategoryKey(value);
  if (key === "all") return ALL_DISCOVERY_INDUSTRIES;
  return DISCOVERY_INDUSTRIES.find(industry => industry.key === key)
    || { key, label: "Categories", shortLabel: "Categories", icon: "grid", code: "" };
}

function normalizeProductionScale(value: string | undefined): ProductionScale | "" {
  return PRODUCTION_SCALES.some((scale) => scale.key === value) ? value as ProductionScale : "";
}

function normalizeWeekday(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : fallback;
}

function toShowroom(row: DiscoveryRow): DiscoveryShowroom {
  let live: { isLive: boolean; platform: LivePlatform | ""; url: string } = { isLive: false, platform: "", url: "" };
  if (row.is_live && !row.is_demo) {
    try {
      live = validateLiveSettings({ isLive: true, platform: row.live_platform, url: row.live_url });
    } catch {
      // Retained provider data fails closed at the public projection boundary.
    }
  }
  const primaryIndustry = DISCOVERY_INDUSTRIES.find((industry) => industry.key === row.primary_industry_key)
    || ALL_DISCOVERY_INDUSTRIES;
  return {
    id: row.id,
    handle: row.handle,
    isDemo: Boolean(row.is_demo),
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    logoPath: row.logo_path,
    heroImagePath: row.published_profile_json
      ? publicPageContent(row.id, parseShopPageContent(JSON.parse(row.published_profile_json))).heroImage
      : row.hero_image_path,
    city: row.city,
    zone: row.zone,
    region: row.region,
    latitude: row.latitude,
    longitude: row.longitude,
    locationMode: row.location_mode || "legacy",
    fallbackStyle: row.fallback_style,
    sponsored: Boolean(row.is_sponsored),
    productionScale: row.production_scale,
    isLive: live.isLive,
    livePlatform: live.platform,
    liveUrl: live.url,
    primaryIndustryKey: primaryIndustry.key,
    primaryIndustryLabel: primaryIndustry.label,
    primaryIndustryShortLabel: primaryIndustry.shortLabel,
  };
}

function toSponsorPlacement(row: SponsorPlacementRow): SponsorPlacement {
  const externalWebsite = row.website_url || "";
  const href = row.kind === "showroom"
    ? `/@${row.handle}?ref=sponsor`
    : externalWebsite || `tel:${row.phone}`;
  return {
    id: `${row.kind}-${row.source_id}`,
    kind: row.kind,
    handle: row.handle,
    name: row.name,
    details: row.details,
    imagePath: row.image_path,
    href,
    actionLabel: row.kind === "showroom" ? "Open page" : externalWebsite ? "Visit website" : "Call sponsor",
    position: Number(row.sponsor_position),
  };
}

function toProductResult(row: DiscoveryProductResultRow): DiscoveryProductResult {
  const primaryIndustry = DISCOVERY_INDUSTRIES.find((industry) => industry.key === row.primary_industry_key)
    || ALL_DISCOVERY_INDUSTRIES;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imagePath: row.image_path,
    categoryName: row.category_name,
    businessId: row.business_id,
    businessHandle: row.business_handle,
    isDemo: Boolean(row.is_demo),
    businessName: row.business_name,
    city: row.city,
    region: row.region,
    primaryIndustryKey: primaryIndustry.key,
    primaryIndustryLabel: primaryIndustry.shortLabel,
  };
}

const PRIMARY_INDUSTRY_SQL = `COALESCE((
  SELECT i.industry_key
  FROM business_industries i
  WHERE i.business_id=b.id
  ORDER BY CASE i.industry_key
    WHEN 'electronics' THEN 0
    WHEN 'beauty-wellness' THEN 1
    WHEN 'agriculture-growers' THEN 2
    WHEN 'food-farming' THEN 3
    WHEN 'machinery-tools' THEN 4
    WHEN 'home-living' THEN 5
    WHEN 'fashion-textiles' THEN 6
    ELSE 999
  END,i.industry_key
  LIMIT 1
),'all')`;

function selectSql(extraWhere: string, suffix = "", order = "is_sponsored DESC,sponsor_position,lower(b.name),b.id") {
  // Latest public snapshot only; no draft join or per-card database requests.
  const profile = platformEnvironment().SUQPAGE_OWNER_EDITOR_ENABLED !== "0";
  return `
    SELECT
      b.id,b.is_demo,b.handle,b.name,b.tagline,b.description,b.logo_path,b.hero_image_path,
      ${profile ? "publication.content_json" : "NULL"} AS published_profile_json,
      p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
      COALESCE(location.location_mode,'legacy') AS location_mode,
      p.fallback_style,COALESCE(s.active,0) AS is_sponsored,
      COALESCE(s.position,999) AS sponsor_position,p.production_scale,
      b.is_live,b.live_platform,b.live_url,
      ${PRIMARY_INDUSTRY_SQL} AS primary_industry_key
    FROM businesses b
    JOIN business_discovery_profiles p ON p.business_id=b.id
    LEFT JOIN owner_location_proposals location ON location.business_id=b.id
    LEFT JOIN discovery_sponsorships s ON s.business_id=b.id AND s.active=1
    LEFT JOIN owner_page_publications publication ON publication.business_id=b.id
      AND publication.revision=(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=b.id)
    WHERE (?='all' OR EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=ANY(string_to_array(?,','))
      ))
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
      ${extraWhere}
    ORDER BY ${order}
    ${suffix}
  `;
}

function selectSponsoredSql() {
  return `
    SELECT * FROM (
    SELECT
      'showroom' AS kind,b.id AS source_id,b.handle,b.name,
      COALESCE(NULLIF(b.tagline,''),NULLIF(b.description,''),'Suqpage page') AS details,
      COALESCE(NULLIF(p.booth_image_path,''),NULLIF(b.hero_image_path,''),NULLIF(b.logo_path,''),'') AS image_path,
      NULL AS website_url,NULL AS phone,s.position AS sponsor_position
    FROM discovery_sponsorships s
    JOIN businesses b ON b.id=s.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    WHERE s.active=1
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
    UNION ALL
    SELECT
      'external' AS kind,a.id AS source_id,'' AS handle,a.name,a.description AS details,
      a.image_path,NULLIF(a.website_url,'') AS website_url,NULLIF(a.phone,'') AS phone,
      a.position AS sponsor_position
    FROM external_sponsor_ads a
    WHERE a.active=1
    ) sponsor_placements
    ORDER BY sponsor_position,lower(name),kind,source_id
    LIMIT 5
  `;
}

// Every term must match one offering plus its business, never different products.
const BUSINESS_SEARCH_TEXT = "concat_ws(' ',b.name,b.handle,b.tagline,COALESCE(publication.content_json::jsonb->>'about',b.description),p.city,p.zone,p.region)";
const OFFERING_SEARCH_TEXT = `concat_ws(' ',product.name,product.description,${BUSINESS_SEARCH_TEXT})`;
function wordMatch(document: string, terms = "?") {
  const plain = `normalize(${document}, NFKC)`;
  const folded = `translate(regexp_replace(normalize(${document}, NFKD), '[\u0300-\u036f]', '', 'g'), '${SEARCH_SEPARATORS}', '${' '.repeat(SEARCH_SEPARATORS.length)}')`;
  const matches = (text: string) => `(${text} ILIKE ALL (ARRAY(SELECT jsonb_array_elements_text(m.terms->'all')))
    AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(m.terms->'any') a(patterns)
      WHERE NOT (${text} ILIKE ANY (ARRAY(SELECT jsonb_array_elements_text(a.patterns))))))`;
  // Most searches use the existing literal path. Accent folding is evaluated only
  // after that fails and the document contains characters that can need folding.
  return `(SELECT NOT (m.terms->>'none')::boolean AND (${matches(plain)} OR
    (${plain} ~ '[^ -~]' AND ${matches(folded)}))
    FROM (SELECT ${terms}::jsonb AS terms) m)`;
}

const SEARCH_WHERE = `AND (
  SELECT ${wordMatch(BUSINESS_SEARCH_TEXT, 'search.terms')} OR EXISTS (
    SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1
      AND ${wordMatch(OFFERING_SEARCH_TEXT, 'search.terms')}
  ) FROM (SELECT ?::jsonb AS terms) search
)`;
function searchTerms(query: string, originalsOnly = false) {
  const groups = searchTermGroups(query).map(group => (originalsOnly ? group.slice(0, 1) : group).map(term => `%${escapeSearchPattern(term)}%`));
  return JSON.stringify({ none: Boolean(query.trim()) && !normalizeSearchText(query), all: groups.filter(group => group.length === 1).map(group => group[0]), any: groups.filter(group => group.length > 1) });
}
function searchParameters(industryKey: string, query: string) {
  return [industryKey, industryKey, searchTerms(query)];
}

function escapeSearchPattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function productSuggestionSql(placeWhere: string) {
  return `
    SELECT product.name AS label,MIN(b.name) AS detail
    FROM products product
    JOIN businesses b ON b.id=product.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    LEFT JOIN owner_page_publications publication ON publication.business_id=b.id
      AND publication.revision=(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=b.id)
    WHERE (?='all' OR EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=ANY(string_to_array(?,','))
      ))
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND product.is_published=1
      AND ${wordMatch(OFFERING_SEARCH_TEXT)}
      ${placeWhere}
    GROUP BY product.name
    ORDER BY
      CASE
        WHEN lower(product.name)=lower(?) THEN 0
        WHEN lower(product.name) LIKE lower(?) ESCAPE '\\' THEN 1
        WHEN ${wordMatch('product.name')} THEN 2
        ELSE 3
      END,
      lower(product.name)
    LIMIT 8
  `;
}

function productSearchResultSql(placeWhere: string, suffix = "", countOnly = false, byId = false) {
  return `
    SELECT ${countOnly ? "COUNT(*) AS total" : `      product.id,product.name,product.description,product.image_path,
      COALESCE(category.name,'Product') AS category_name,
      b.id AS business_id,b.is_demo,b.handle AS business_handle,b.name AS business_name,
      p.city,p.region,${PRIMARY_INDUSTRY_SQL} AS primary_industry_key`}
    FROM products product
    JOIN businesses b ON b.id=product.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    LEFT JOIN owner_page_publications publication ON publication.business_id=b.id
      AND publication.revision=(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=b.id)
    LEFT JOIN categories category ON category.id=product.category_id AND category.business_id=b.id
    WHERE (?='all' OR EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=ANY(string_to_array(?,','))
      ))
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND product.is_published=1
      AND ${byId ? "product.id IN(SELECT jsonb_array_elements_text(?::jsonb)::bigint)" : wordMatch(OFFERING_SEARCH_TEXT)}
      ${placeWhere}
    ${countOnly ? "" : `ORDER BY
      CASE
        WHEN lower(product.name)=lower(?) THEN 0
        WHEN lower(product.name) LIKE lower(?) ESCAPE '\\' THEN 1
        WHEN ${wordMatch('product.name')} THEN 2
        WHEN lower(b.name)=lower(?) THEN 3
        WHEN ${wordMatch(OFFERING_SEARCH_TEXT)} THEN 4
        ELSE 5
      END,
      lower(product.name),lower(b.name),product.id`}
    ${suffix}
  `;
}

function buildSearchSuggestions(
  query: string,
  rows: DiscoveryRow[],
  places: DiscoveryPlaceOption[],
  productRows: Array<{ label: string; detail: string }>,
): DiscoverySearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];
  const originalWords = searchTermGroups(query).map(group => group[0]);
  const candidates: Array<DiscoverySearchSuggestion & { score: number }> = [];
  const score = (value: string) => {
    const normalized = normalizeSearchText(value);
    if (normalized === normalizedQuery) return 0;
    if (normalized.startsWith(normalizedQuery)) return 1;
    return originalWords.every(word => normalized.includes(word)) ? 2 : 3;
  };
  for (const product of productRows) {
    candidates.push({ kind: "offering", label: product.label, detail: `Offering from ${product.detail}`, query: product.label, score: score(product.label) });
  }
  for (const row of rows) {
    candidates.push({ kind: "showroom", label: row.name, detail: `Page in ${row.city}`, query: row.name, score: score(row.name) });
  }
  for (const place of places) {
    if (!place.label.toLocaleLowerCase().includes(normalizedQuery)) continue;
    const placeQuery = place.kind === "city" ? place.city : place.region;
    candidates.push({ kind: "place", label: place.label, detail: place.kind === "city" ? "Reviewed city" : "Reviewed region", query: placeQuery, score: score(place.label) });
  }
  const seen = new Set<string>();
  return candidates
    .sort((left, right) => left.score - right.score || left.label.localeCompare(right.label) || left.kind.localeCompare(right.kind))
    .filter((candidate) => {
      const key = candidate.query.trim().toLocaleLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6)
    .map(({ score: _score, ...suggestion }) => suggestion);
}

function discoveryWhere(productionScale: ProductionScale | "") {
  return `${SEARCH_WHERE} AND (?='' OR p.production_scale=?)`;
}

function discoveryParameters(industryKey: string, query: string, productionScale: ProductionScale | "") {
  return [...searchParameters(industryKey, query), productionScale, productionScale];
}

function placeOptions(rows: DiscoveryRow[]): DiscoveryPlaceOption[] {
  const regions = new Map<string, DiscoveryPlaceOption>();
  const cities = new Map<string, DiscoveryPlaceOption>();
  for (const row of rows) {
    const regionKey = `region:${row.region}`;
    const region = regions.get(regionKey) || { key: regionKey, label: row.region, kind: "region" as const, region: row.region, city: "", count: 0 };
    region.count += 1;
    regions.set(regionKey, region);
    const cityKey = `city:${row.city}:${row.region}`;
    const city = cities.get(cityKey) || { key: cityKey, label: `${row.city}, ${row.region}`, kind: "city" as const, region: row.region, city: row.city, count: 0 };
    city.count += 1;
    cities.set(cityKey, city);
  }
  return [
    ...[...regions.values()].sort((left, right) => left.label.localeCompare(right.label)),
    ...[...cities.values()].sort((left, right) => left.label.localeCompare(right.label)),
  ];
}

function ethiopiaDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ETHIOPIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function weeklySchedule(now: Date): { todayWeekday: number; days: WeeklyFeaturedDay[] } {
  const { year, month, day } = ethiopiaDateParts(now);
  const today = new Date(Date.UTC(year, month - 1, day));
  const todayWeekday = today.getUTCDay();
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((todayWeekday + 6) % 7));
  const labelFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  const days = FEATURED_WEEK.map((entry, index): WeeklyFeaturedDay => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    const industry = normalizeIndustry(entry.industryKey);
    return {
      weekday: entry.weekday,
      dayLabel: entry.dayLabel,
      dateIso: date.toISOString().slice(0, 10),
      dateLabel: labelFormatter.format(date),
      mode: "featured",
      industryKey: industry.key,
      industryLabel: industry.label,
      industryIcon: industry.icon,
      isToday: entry.weekday === todayWeekday,
    };
  });
  return { todayWeekday, days };
}

const INDUSTRY_POSITION = new Map<string, number>(DISCOVERY_INDUSTRIES.map((industry, index) => [industry.key, index]));

const NEARBY_GROUP_RADIUS_KM = 0.8;
const NEARBY_GROUP_MAX = 6;

function distanceKm(left: DiscoveryShowroom, right: DiscoveryShowroom) {
  const radians = (value: number) => value * Math.PI / 180;
  const latitudeDelta = radians(right.latitude - left.latitude);
  const longitudeDelta = radians(right.longitude - left.longitude);
  const latitudeA = radians(left.latitude);
  const latitudeB = radians(right.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function groupNearbyShowrooms(showrooms: DiscoveryShowroom[]): DiscoveryNearbyGroup[] {
  const ordered = showrooms.filter(showroom => showroom.locationMode !== "area").sort((left, right) =>
    left.city.localeCompare(right.city)
    || left.latitude - right.latitude
    || left.longitude - right.longitude
    || left.id - right.id);
  const remaining = new Set(ordered.map((showroom) => showroom.id));
  const groups: DiscoveryNearbyGroup[] = [];
  const locationBuckets = new Map<string, DiscoveryShowroom[]>();

  for (const showroom of ordered) {
    const key = `${showroom.region.toLowerCase()}\u0000${showroom.city.toLowerCase()}`;
    const bucket = locationBuckets.get(key);
    if (bucket) bucket.push(showroom);
    else locationBuckets.set(key, [showroom]);
  }

  const spatialIndexes = new Map<string, { cells: Map<string, DiscoveryShowroom[]>; referenceLatitude: number }>();
  for (const [locationKey, bucket] of locationBuckets) {
    const referenceLatitude = bucket.reduce((sum, showroom) => sum + showroom.latitude, 0) / bucket.length;
    const longitudeKm = 111.32 * Math.cos(referenceLatitude * Math.PI / 180);
    const cells = new Map<string, DiscoveryShowroom[]>();
    for (const showroom of bucket) {
      const x = Math.floor((showroom.longitude * longitudeKm) / NEARBY_GROUP_RADIUS_KM);
      const y = Math.floor((showroom.latitude * 110.574) / NEARBY_GROUP_RADIUS_KM);
      const cellKey = `${x}:${y}`;
      const cell = cells.get(cellKey);
      if (cell) cell.push(showroom);
      else cells.set(cellKey, [showroom]);
    }
    spatialIndexes.set(locationKey, { cells, referenceLatitude });
  }

  for (const anchor of ordered) {
    if (!remaining.has(anchor.id)) continue;
    const locationKey = `${anchor.region.toLowerCase()}\u0000${anchor.city.toLowerCase()}`;
    const spatialIndex = spatialIndexes.get(locationKey);
    if (!spatialIndex) {
      remaining.delete(anchor.id);
      continue;
    }
    const longitudeKm = 111.32 * Math.cos(spatialIndex.referenceLatitude * Math.PI / 180);
    const anchorX = Math.floor((anchor.longitude * longitudeKm) / NEARBY_GROUP_RADIUS_KM);
    const anchorY = Math.floor((anchor.latitude * 110.574) / NEARBY_GROUP_RADIUS_KM);
    const candidates: DiscoveryShowroom[] = [];
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
        candidates.push(...(spatialIndex.cells.get(`${anchorX + xOffset}:${anchorY + yOffset}`) || []));
      }
    }
    const cohort = candidates
      .filter((candidate) => remaining.has(candidate.id) && distanceKm(anchor, candidate) <= NEARBY_GROUP_RADIUS_KM)
      .sort((left, right) => distanceKm(anchor, left) - distanceKm(anchor, right) || left.id - right.id);
    if (cohort.length < 2) {
      remaining.delete(anchor.id);
      continue;
    }
    cohort.forEach((showroom) => remaining.delete(showroom.id));
    const groupCount = Math.ceil(cohort.length / NEARBY_GROUP_MAX);
    const baseSize = Math.floor(cohort.length / groupCount);
    let remainder = cohort.length % groupCount;
    let offset = 0;
    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      const size = baseSize + (remainder-- > 0 ? 1 : 0);
      const members = cohort.slice(offset, offset + size).sort((left, right) =>
        (INDUSTRY_POSITION.get(left.primaryIndustryKey) ?? 999) - (INDUSTRY_POSITION.get(right.primaryIndustryKey) ?? 999)
        || left.name.localeCompare(right.name)
        || left.id - right.id);
      offset += size;
      const markerOffset = groupCount > 1 ? 0.0012 : 0;
      const markerAngle = groupIndex * (Math.PI * 2 / groupCount);
      groups.push({
        key: `nearby:${anchor.city}:${members.map((showroom) => showroom.id).join("-")}`,
        city: anchor.city,
        region: anchor.region,
        latitude: members.reduce((sum, showroom) => sum + showroom.latitude, 0) / members.length + Math.sin(markerAngle) * markerOffset,
        longitude: members.reduce((sum, showroom) => sum + showroom.longitude, 0) / members.length + Math.cos(markerAngle) * markerOffset,
        count: members.length,
        showroomIds: members.map((showroom) => showroom.id),
      });
    }
  }
  return groups.sort((left, right) => left.city.localeCompare(right.city) || left.key.localeCompare(right.key));
}

type DiscoveryOptions = {
  excludedBusinessIds?:readonly number[];
  page?: string | number;
  type?: string;
  industry?: string | readonly string[];
  q?: string;
  place?: string | readonly string[];
  featuredDay?: string | number;
  scale?: string;
  now?: Date;
  readPort?: DiscoveryReadPort;
};

type DiscoveryReadPort = {
  get: <T>(sql: string, values?: Array<string | number>) => Promise<T | undefined>;
  all: <T>(sql: string, values?: Array<string | number>) => Promise<T[]>;
};

function discoveryReadPort(port?: DiscoveryReadPort): DiscoveryReadPort {
  return port || { all: runtimeAll, get: runtimeGet };
}

type MarketplaceBase = Omit<MarketplaceDiscoveryView, "featuredNowBusinessId">;

async function buildMarketplaceBase(options: DiscoveryOptions, port: DiscoveryReadPort): Promise<MarketplaceBase> {
  const { all, get } = port;
  const rawQuery = (options.q || "").normalize("NFKC").trim().slice(0, 80);
  const query = rawQuery;
  const industry = normalizeIndustrySelection(options.industry || (query ? "all" : ""));
  const productionScale = normalizeProductionScale(options.scale);
  const projectionIndustryKey = industry.key || ALL_DISCOVERY_INDUSTRIES.key;
  const excluded=excludedBusinessIds(options.excludedBusinessIds);
  const excludeWhere=excluded.length?' AND NOT b.id=ANY(ARRAY(SELECT jsonb_array_elements_text(?::jsonb)::bigint))':'';
  const excludeParams=excluded.length?[JSON.stringify(excluded)]:[];
  const where = discoveryWhere(productionScale)+excludeWhere;
  const params = [...discoveryParameters(projectionIndustryKey, query, productionScale),...excludeParams];
  const locationRows = await all<DiscoveryRow>(selectSql(where), params);
  const requestedPlaces = normalizeDiscoveryPlaces(options.place);
  // Keep the selected geography available even when query/category has no matches.
  let places = placeOptions(locationRows);
  if (requestedPlaces.some(key => !places.some(place => place.key === key))) {
    places = placeOptions(await all<DiscoveryRow>(selectSql(where), [...discoveryParameters("all", "", productionScale),...excludeParams]));
  }
  const selectedPlaces = places.filter(place => requestedPlaces.includes(place.key));
  const locationScope = selectedPlaces.map(place => ({ city: place.kind === "city" ? place.city : "", region: place.region }));
  const placeWhere = selectedPlaces.length ? ` AND EXISTS (
    SELECT 1 FROM jsonb_to_recordset(?::jsonb) AS location(city text,region text)
    WHERE lower(p.region)=lower(location.region)
      AND (location.city='' OR lower(p.city)=lower(location.city)))` : "";
  const placeParams = selectedPlaces.length ? [JSON.stringify(locationScope)] : [];
  const filteredWhere = `${where}${placeWhere}`;
  const filteredParams = [...params, ...placeParams];
  const rows = selectedPlaces.length
    ? await all<DiscoveryRow>(selectSql(filteredWhere), filteredParams)
    : locationRows;
  const escapedQuery = escapeSearchPattern(query);
  // Rank what was actually typed before plural alternatives (e.g. gras -> gra).
  // Title words need not occur at the beginning of a multiword product name.
  const originalTerms = searchTerms(query, true);
  const productRankParams = [query, `${escapedQuery}%`, originalTerms, query, originalTerms];
  const productScopeWhere=placeWhere+excludeWhere;
  const productScopeParams=[...placeParams,...excludeParams];
  const productParams = [projectionIndustryKey, projectionIndustryKey,
    searchTerms(query), ...productScopeParams];
  const businessOrder = "CASE WHEN lower(b.name)=lower(?) THEN 0 WHEN lower(b.name) LIKE lower(?) ESCAPE '\\' THEN 1 ELSE 2 END,lower(b.name),b.id";
  const businessResultParams = [...filteredParams, query, `${escapedQuery}%`];
  const productCountRow = rows.length ? await get<{ total: number }>(productSearchResultSql(productScopeWhere, "", true), productParams) : undefined;
  const productCount = Number(productCountRow?.total || 0);
  // The map already loaded every eligible business using the same predicate.
  // Reuse that server-side count instead of sorting/hydrating it a second time.
  const businessCount = rows.length;
  const spelling = await findSpellingMatches({query,industry:projectionIndustryKey,
    city:"", region:"", locations:locationScope,scale:productionScale || "",exactBusinessIds:rows.map(row=>row.id),excludedBusinessIds:excluded},port);
  const type = options.type === "products" || options.type === "businesses" ? options.type : "all";
  const approximate = spelling.filter(match=>type === "all" || (type === "products" ? match.kind === "product" : match.kind === "business"));
  const normalTotal = type === "products" ? productCount : type === "businesses" ? businessCount : productCount + businessCount;
  const total = normalTotal + approximate.length;
  const request = normalizePageRequest({ page: options.page }, PUBLIC_PAGE_SIZE);
  const window = pageWindow(total, request);
  const productLimit = type === "businesses" ? 0 : Math.max(0, Math.min(window.limit, productCount - window.offset));
  const businessOffset = type === "businesses" ? window.offset : Math.max(0, window.offset - productCount);
  const businessLimit = type === "products" ? 0 : Math.max(0,Math.min(window.limit - productLimit,businessCount-businessOffset));
  // Only the bounded ranked references are sliced on the server; catalog rows
  // remain in PostgreSQL and are hydrated for this five-item page only.
  const approximatePage = approximate.slice(Math.max(0,window.offset-normalTotal),Math.max(0,window.offset+window.limit-normalTotal));
  const approximateProducts = approximatePage.filter(match=>match.kind === "product").map(match=>match.id);
  const normalBusinessIds = new Set(rows.map(row=>row.id));
  const mapIds = [...new Set(spelling.map(match=>match.businessId))].filter(id=>!normalBusinessIds.has(id));
  const [productSuggestionRows, productResultRows, businessResultRows, approximateProductRows, approximateMapRows] = await Promise.all([
    query.length >= 2 && productCount > 0 ? all<{ label: string; detail: string }>(productSuggestionSql(productScopeWhere), [
      projectionIndustryKey, projectionIndustryKey, searchTerms(query),
      ...productScopeParams, query, `${escapedQuery}%`, originalTerms,
    ]) : Promise.resolve([]),
    productLimit ? all<DiscoveryProductResultRow>(productSearchResultSql(productScopeWhere, "LIMIT ? OFFSET ?"),
      [...productParams, ...productRankParams, productLimit, window.offset]) : Promise.resolve([]),
    businessLimit ? all<DiscoveryRow>(selectSql(filteredWhere, "LIMIT ? OFFSET ?", businessOrder),
      [...businessResultParams, businessLimit, businessOffset]) : Promise.resolve([]),
    approximateProducts.length ? all<DiscoveryProductResultRow>(productSearchResultSql(productScopeWhere,"",false,true),
      [projectionIndustryKey,projectionIndustryKey,JSON.stringify(approximateProducts),...productScopeParams,...productRankParams]) : Promise.resolve([]),
    mapIds.length ? all<DiscoveryRow>(selectSql("AND b.id IN(SELECT jsonb_array_elements_text(?::jsonb)::bigint)"),
      [projectionIndustryKey,projectionIndustryKey,JSON.stringify(mapIds)]) : Promise.resolve([]),
  ]);
  const searchOrder = [
    ...productResultRows.map(row=>({kind:"product" as const,id:row.id})),
    ...businessResultRows.map(row=>({kind:"business" as const,id:row.id})),
    ...approximatePage.map(({kind,id})=>({kind,id})),
  ];
  const approximateBusinessIds = new Set(approximatePage.filter(match=>match.kind === "business").map(match=>match.id));
  productResultRows.push(...approximateProductRows);
  businessResultRows.push(...approximateMapRows.filter(row=>approximateBusinessIds.has(row.id)));
  rows.push(...approximateMapRows);
  if (!selectedPlaces.length) places=placeOptions(rows);
  const { items: _items, ...resultPage } = pageResult(Array.from({ length: searchOrder.length }), total, request);
  const showrooms = rows.map(toShowroom);
  const nearbyGroups = groupNearbyShowrooms(showrooms);
  const suggestions = buildSearchSuggestions(query, rows, places, productSuggestionRows);

  return {
    industry,
    industries: DISCOVERY_INDUSTRY_OPTIONS,
    query,
    suggestions,
    searchProducts: productResultRows.map(toProductResult),
    searchBusinesses: businessResultRows.map(toShowroom),
    searchOrder,
    resultCounts: { products: productCount + spelling.filter(match=>match.kind === "product").length, businesses: businessCount + spelling.filter(match=>match.kind === "business").length },
    resultPage,
    place: selectedPlaces.map(place => place.key).sort().join("|"),
    places,
    productionScale,
    total: showrooms.length,
    sponsoredCount: showrooms.filter((showroom) => showroom.sponsored).length,
    locationCount: new Set(showrooms.map((showroom) => `${showroom.city}\u0000${showroom.region}`)).size,
    showrooms,
    nearbyGroups,
  };
}

async function buildFeaturedProjection(options: DiscoveryOptions, port: DiscoveryReadPort): Promise<FeaturedShowroomsView> {
  const { get, all } = port;
  const currentTime = options.now || new Date();
  const schedule = weeklySchedule(currentTime);
  const selectedWeekday = normalizeWeekday(options.featuredDay, schedule.todayWeekday);
  const selectedDay = schedule.days.find((entry) => entry.weekday === selectedWeekday) || schedule.days[0];
  const featuredIndustry = normalizeIndustry(selectedDay.industryKey);
  const programPolicy = await getFeaturedProgramPolicy();
  const featuredRowsForDay = async (day: WeeklyFeaturedDay) => {
    const excluded=excludedBusinessIds(options.excludedBusinessIds);
    const extra=excluded.length?' AND NOT b.id=ANY(ARRAY(SELECT jsonb_array_elements_text(?::jsonb)::bigint))':'';
    const eligibleRows = await all<DiscoveryRow>(selectSql("AND b.hero_image_path LIKE '/%' "+extra), [day.industryKey, day.industryKey,...(excluded.length?[JSON.stringify(excluded)]:[])]);
    eligibleRows.sort((left, right) => left.name.localeCompare(right.name) || left.id - right.id);
    const selection = await getFeaturedProgramDaySelection(day.dateIso, port);
    if (selection.mode !== "manual") return { rows: automaticFeaturedLineup(day.dateIso, eligibleRows), mode: "automatic" as const };
    const byId = new Map(eligibleRows.map((row) => [row.id, row]));
    const manualRows = selection.businessIds.map((businessId) => byId.get(businessId)).filter((row): row is DiscoveryRow => Boolean(row)).slice(0, MAX_FEATURED_SHOWROOMS);
    return manualRows.length
      ? { rows: manualRows, mode: "manual" as const }
      : { rows: automaticFeaturedLineup(day.dateIso, eligibleRows), mode: "automatic" as const };
  };
  const selectedProgram = await featuredRowsForDay(selectedDay);
  const revealFeatured = selectedDay.isToday;
  const featuredRows = selectedProgram.rows;
  const featuredShowrooms = featuredRows.map(toShowroom);
  const boothCount = featuredShowrooms.length;
  const booths = Array.from({ length: boothCount }, (_, index): FeaturedBooth => {
    const slot = index + 1;
    const reference = `${featuredIndustry.code}-B${String(slot).padStart(2, "0")}`;
    return revealFeatured
      ? { revealed: true, showroom: featuredShowrooms[index], slot, reference }
      : { revealed: false, showroom: null, slot, reference };
  });
  const todayDay = schedule.days.find((day) => day.isToday);
  const todayFeaturedRows = todayDay
    ? selectedDay.isToday
      ? featuredRows
      : (await featuredRowsForDay(todayDay)).rows
    : [];
  const currentWalkthrough = todayDay
    ? featuredBoothWalkthroughs(todayDay.dateIso, todayFeaturedRows.length, currentTime, programPolicy).find((walkthrough) => walkthrough.current)
    : undefined;
  const featuredNowBusinessId = currentWalkthrough
    ? todayFeaturedRows[currentWalkthrough.slot - 1]?.id ?? null
    : null;

  return {
    featuredNowBusinessId,
    featured: {
      mode: selectedDay.mode,
      title: "Daily Featured",
      industryCode: featuredIndustry.code,
      industryLabel: featuredIndustry.label,
      industryIcon: selectedDay.industryIcon,
      selectedWeekday,
      isToday: selectedDay.isToday,
      dayLabel: selectedDay.dayLabel,
      dateLabel: selectedDay.dateLabel,
      boothCount,
      booths,
      schedule: schedule.days,
      programPolicy,
      scheduleMode: selectedProgram.mode,
    },
  };
}

export async function getMarketplaceDiscoveryView(options: DiscoveryOptions = {}): Promise<MarketplaceDiscoveryView> {
  const port = discoveryReadPort(options.readPort);
  const [marketplace, featured] = await Promise.all([
    buildMarketplaceBase(options, port),
    buildFeaturedProjection({ now: options.now }, port),
  ]);
  return { ...marketplace, featuredNowBusinessId: featured.featuredNowBusinessId };
}

export async function getFeaturedShowroomsView(options: Pick<DiscoveryOptions, "featuredDay" | "now" | "readPort" | "excludedBusinessIds"> = {}): Promise<FeaturedShowroomsView> {
  return buildFeaturedProjection(options, discoveryReadPort(options.readPort));
}

export async function getSponsoredShowrooms(options: Pick<DiscoveryOptions, "readPort" | "excludedBusinessIds"> = {}): Promise<SponsorPlacement[]> {
  const excluded=excludedBusinessIds(options.excludedBusinessIds);
  const sql=excluded.length?selectSponsoredSql().replace('WHERE s.active=1','WHERE s.active=1 AND NOT b.id=ANY(ARRAY(SELECT jsonb_array_elements_text(?::jsonb)::bigint))'):selectSponsoredSql();
  return (await discoveryReadPort(options.readPort).all<SponsorPlacementRow>(sql,excluded.length?[JSON.stringify(excluded)]:[])).map(toSponsorPlacement);
}

export async function getDiscoveryView(options: DiscoveryOptions = {}): Promise<DiscoveryView> {
  const port = discoveryReadPort(options.readPort);
  const [marketplace, featured, sponsoredShowrooms] = await Promise.all([
    buildMarketplaceBase(options, port),
    buildFeaturedProjection(options, port),
    port.all<SponsorPlacementRow>(selectSponsoredSql()).then((rows) => rows.map(toSponsorPlacement)),
  ]);
  return { ...marketplace, ...featured, sponsoredShowrooms };
}
