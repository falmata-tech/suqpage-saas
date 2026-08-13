import type { DatabaseSync } from "node:sqlite";
import { PRODUCTION_SCALES, type ProductionScale } from "./discovery-contract";
import { featuredBoothWalkthroughs, type FeaturedProgramPolicy } from "./featured-program";
import { getFeaturedProgramDaySelection, getFeaturedProgramPolicy, type FeaturedProgramDayMode } from "./featured-program-settings";
import { validateLiveSettings, type LivePlatform } from "./live-showroom";
import { runtimeAll, runtimeGet } from "./runtime-sql";

export { PRODUCTION_SCALES, type ProductionScale } from "./discovery-contract";

export const DISCOVERY_INDUSTRIES = [
  { key: "electronics", label: "Electronics, electrical & appliances", shortLabel: "Electronics", icon: "circuit", code: "ELC" },
  { key: "beauty-wellness", label: "Beauty, hygiene & household care", shortLabel: "Beauty & home care", icon: "leaf", code: "BEA" },
  { key: "agriculture-growers", label: "Agriculture, livestock & primary produce", shortLabel: "Agriculture & growers", icon: "sprout", code: "AGR" },
  { key: "food-farming", label: "Food & beverage production", shortLabel: "Food & beverages", icon: "bowl", code: "FOD" },
  { key: "machinery-tools", label: "Machinery, metalwork & industrial inputs", shortLabel: "Machinery & industrial", icon: "tool", code: "MCH" },
  { key: "home-living", label: "Furniture, home goods & building materials", shortLabel: "Furniture & home", icon: "home", code: "HOM" },
  { key: "fashion-textiles", label: "Textiles, garments, leather & paper", shortLabel: "Textiles & apparel", icon: "thread", code: "FSH" },
] as const;

export type DiscoveryIndustry = (typeof DISCOVERY_INDUSTRIES)[number];
export const ALL_DISCOVERY_INDUSTRIES = { key: "all", label: "All industries", shortLabel: "All industries", icon: "grid", code: "ALL" } as const;
export type DiscoveryIndustryFilter = DiscoveryIndustry | typeof ALL_DISCOVERY_INDUSTRIES;
const DISCOVERY_INDUSTRY_FILTERS: readonly DiscoveryIndustryFilter[] = [ALL_DISCOVERY_INDUSTRIES, ...DISCOVERY_INDUSTRIES];
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

const LIST_PAGE_SIZE = 5;
const ETHIOPIA_TIME_ZONE = "Africa/Addis_Ababa";

type DiscoveryRow = {
  id: number;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  hero_image_path: string;
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

export type DiscoveryShowroom = {
  id: number;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  imagePath: string;
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

export type DiscoveryCityGroup = {
  key: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  count: number;
  showrooms: DiscoveryShowroom[];
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
  industry: DiscoveryIndustryFilter;
  industries: readonly DiscoveryIndustryFilter[];
  query: string;
  suggestions: DiscoverySearchSuggestion[];
  place: string;
  places: DiscoveryPlaceOption[];
  productionScale: ProductionScale | "";
  view: "map" | "list";
  total: number;
  sponsoredCount: number;
  locationCount: number;
  showrooms: DiscoveryShowroom[];
  sponsoredShowrooms: DiscoveryShowroom[];
  featuredNowBusinessId: number | null;
  cityGroups: DiscoveryCityGroup[];
  list: {
    items: DiscoveryShowroom[];
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
  featured: WeeklyFeaturedProgram;
};

export type MarketplaceDiscoveryView = Omit<DiscoveryView, "sponsoredShowrooms" | "featured">;
export type FeaturedShowroomsView = Pick<DiscoveryView, "featured" | "featuredNowBusinessId">;

function normalizeIndustry(key: string | undefined) {
  return DISCOVERY_INDUSTRIES.find((industry) => industry.key === key) || DISCOVERY_INDUSTRIES[0];
}

function normalizeIndustryFilter(key: string | undefined): DiscoveryIndustryFilter {
  if (!key || key === ALL_DISCOVERY_INDUSTRIES.key) return ALL_DISCOVERY_INDUSTRIES;
  return DISCOVERY_INDUSTRIES.find((industry) => industry.key === key) || ALL_DISCOVERY_INDUSTRIES;
}

function normalizeProductionScale(value: string | undefined): ProductionScale | "" {
  return PRODUCTION_SCALES.some((scale) => scale.key === value) ? value as ProductionScale : "";
}

function normalizePositiveInteger(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeWeekday(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : fallback;
}

function toShowroom(row: DiscoveryRow): DiscoveryShowroom {
  let live: { isLive: boolean; platform: LivePlatform | ""; url: string } = { isLive: false, platform: "", url: "" };
  if (row.is_live) {
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
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    imagePath: row.booth_image_path || row.hero_image_path,
    city: row.city,
    zone: row.zone,
    region: row.region,
    latitude: row.latitude,
    longitude: row.longitude,
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

function selectSql(extraWhere: string, suffix = "") {
  return `
    SELECT
      b.id,b.handle,b.name,b.tagline,b.description,b.hero_image_path,
      p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
      p.fallback_style,COALESCE(s.active,0) AS is_sponsored,
      COALESCE(s.position,999) AS sponsor_position,p.production_scale,
      b.is_live,b.live_platform,b.live_url,
      ${PRIMARY_INDUSTRY_SQL} AS primary_industry_key
    FROM businesses b
    JOIN business_discovery_profiles p ON p.business_id=b.id
    LEFT JOIN discovery_sponsorships s ON s.business_id=b.id AND s.active=1
    WHERE (?='all' OR EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=?
      ))
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
      ${extraWhere}
    ORDER BY is_sponsored DESC,sponsor_position,lower(b.name),b.id
    ${suffix}
  `;
}

function selectSponsoredSql() {
  return `
    SELECT
      b.id,b.handle,b.name,b.tagline,b.description,b.hero_image_path,
      p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
      p.fallback_style,1 AS is_sponsored,s.position AS sponsor_position,
      p.production_scale,b.is_live,b.live_platform,b.live_url,
      ${PRIMARY_INDUSTRY_SQL} AS primary_industry_key
    FROM discovery_sponsorships s
    JOIN businesses b ON b.id=s.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    WHERE s.active=1
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
    ORDER BY s.position,lower(b.name),b.id
    LIMIT 5
  `;
}

const SEARCH_WHERE = `AND (
  ?='' OR b.name LIKE ? ESCAPE '\\' OR b.tagline LIKE ? ESCAPE '\\'
  OR b.description LIKE ? ESCAPE '\\' OR p.city LIKE ? ESCAPE '\\'
  OR p.zone LIKE ? ESCAPE '\\' OR p.region LIKE ? ESCAPE '\\'
  OR EXISTS(
    SELECT 1 FROM products product
    WHERE product.business_id=b.id AND product.is_published=1
      AND (product.name LIKE ? ESCAPE '\\' OR product.description LIKE ? ESCAPE '\\')
  )
)`;

function searchParameters(industryKey: string, query: string) {
  const search = `%${escapeSearchPattern(query)}%`;
  return [industryKey, industryKey, query, search, search, search, search, search, search, search, search];
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
    WHERE (?='all' OR EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=?
      ))
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND product.is_published=1
      AND (product.name LIKE ? ESCAPE '\\' OR product.description LIKE ? ESCAPE '\\')
      ${placeWhere}
    GROUP BY product.name
    ORDER BY
      CASE
        WHEN lower(product.name)=lower(?) THEN 0
        WHEN lower(product.name) LIKE lower(?) ESCAPE '\\' THEN 1
        ELSE 2
      END,
      lower(product.name)
    LIMIT 8
  `;
}

function buildSearchSuggestions(
  query: string,
  rows: DiscoveryRow[],
  places: DiscoveryPlaceOption[],
  productRows: Array<{ label: string; detail: string }>,
): DiscoverySearchSuggestion[] {
  const normalizedQuery = query.toLocaleLowerCase();
  if (normalizedQuery.length < 2) return [];
  const candidates: Array<DiscoverySearchSuggestion & { score: number }> = [];
  const score = (value: string) => {
    const normalized = value.toLocaleLowerCase();
    if (normalized === normalizedQuery) return 0;
    if (normalized.startsWith(normalizedQuery)) return 1;
    return normalized.includes(normalizedQuery) ? 2 : 3;
  };
  for (const product of productRows) {
    candidates.push({ kind: "offering", label: product.label, detail: `Offering from ${product.detail}`, query: product.label, score: score(product.label) });
  }
  for (const row of rows) {
    candidates.push({ kind: "showroom", label: row.name, detail: `Showroom in ${row.city}`, query: row.name, score: score(row.name) });
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

function groupCities(showrooms: DiscoveryShowroom[], groupByIndustry: boolean): DiscoveryCityGroup[] {
  const groups = new Map<string, DiscoveryCityGroup>();
  for (const showroom of showrooms) {
    const key = `${showroom.city.trim().toLocaleLowerCase()}\u0000${showroom.region.trim().toLocaleLowerCase()}`;
    const group = groups.get(key) || {
      key,
      city: showroom.city,
      region: showroom.region,
      latitude: 0,
      longitude: 0,
      count: 0,
      showrooms: [],
    };
    group.latitude += showroom.latitude;
    group.longitude += showroom.longitude;
    group.count += 1;
    group.showrooms.push(showroom);
    groups.set(key, group);
  }
  return [...groups.values()]
    .filter((group) => group.count > 1)
    .map((group) => {
      const groupedShowrooms = groupByIndustry
        ? [...group.showrooms].sort((left, right) =>
          (INDUSTRY_POSITION.get(left.primaryIndustryKey) ?? 999) - (INDUSTRY_POSITION.get(right.primaryIndustryKey) ?? 999)
          || left.name.localeCompare(right.name)
          || left.id - right.id)
        : group.showrooms;
      return {
        ...group,
        latitude: group.latitude / group.count,
        longitude: group.longitude / group.count,
        showrooms: groupedShowrooms,
      };
    })
    .sort((left, right) => right.count - left.count || left.city.localeCompare(right.city));
}

type DiscoveryOptions = {
  industry?: string;
  q?: string;
  place?: string;
  page?: string | number;
  view?: string;
  featuredDay?: string | number;
  scale?: string;
  now?: Date;
  db?: DatabaseSync;
};

type DiscoveryReadPort = {
  get: <T>(sql: string, values?: Array<string | number>) => Promise<T | undefined>;
  all: <T>(sql: string, values?: Array<string | number>) => Promise<T[]>;
};

function discoveryReadPort(db?: DatabaseSync): DiscoveryReadPort {
  return {
    get: async <T>(sql: string, values: Array<string | number> = []) => db
      ? db.prepare(sql).get(...values) as T | undefined
      : runtimeGet<T>(sql, values),
    all: async <T>(sql: string, values: Array<string | number> = []) => db
      ? db.prepare(sql).all(...values) as T[]
      : runtimeAll<T>(sql, values),
  };
}

type MarketplaceBase = Omit<MarketplaceDiscoveryView, "featuredNowBusinessId">;

async function buildMarketplaceBase(options: DiscoveryOptions, port: DiscoveryReadPort): Promise<MarketplaceBase> {
  const { get, all } = port;
  const industry = normalizeIndustryFilter(options.industry);
  const query = (options.q || "").trim().slice(0, 80);
  const productionScale = normalizeProductionScale(options.scale);
  const where = discoveryWhere(productionScale);
  const params = discoveryParameters(industry.key, query, productionScale);
  const locationRows = await all<DiscoveryRow>(selectSql(where), params);
  const places = placeOptions(locationRows);
  const requestedPlace = (options.place || "").trim().slice(0, 180);
  const selectedPlace = places.find((place) => place.key === requestedPlace);
  const placeWhere = selectedPlace?.kind === "city"
    ? " AND lower(p.city)=lower(?) AND lower(p.region)=lower(?)"
    : selectedPlace?.kind === "region"
      ? " AND lower(p.region)=lower(?)"
      : "";
  const placeParams = selectedPlace?.kind === "city"
    ? [selectedPlace.city, selectedPlace.region]
    : selectedPlace?.kind === "region"
      ? [selectedPlace.region]
      : [];
  const filteredWhere = `${where}${placeWhere}`;
  const filteredParams = [...params, ...placeParams];
  const countRow = (await get<{ total: number }>(`
    SELECT COUNT(DISTINCT b.id) AS total
    FROM businesses b
    JOIN business_discovery_profiles p ON p.business_id=b.id
    WHERE (?='all' OR EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=?
      ))
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
      ${filteredWhere}
  `, filteredParams))!;
  const total = Number(countRow.total);
  const pageCount = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
  const page = Math.min(normalizePositiveInteger(options.page, 1), pageCount);
  const rows = await all<DiscoveryRow>(selectSql(filteredWhere), filteredParams);
  const listRows = await all<DiscoveryRow>(selectSql(filteredWhere, "LIMIT ? OFFSET ?"),
    [...filteredParams, LIST_PAGE_SIZE, (page - 1) * LIST_PAGE_SIZE]);
  const escapedQuery = escapeSearchPattern(query);
  const productSuggestionRows = query.length >= 2
    ? await all<{ label: string; detail: string }>(productSuggestionSql(placeWhere), [
      industry.key,
      industry.key,
      `%${escapedQuery}%`,
      `%${escapedQuery}%`,
      ...placeParams,
      query,
      `${escapedQuery}%`,
    ])
    : [];
  const showrooms = rows.map(toShowroom);
  const cityGroups = groupCities(showrooms, industry.key === ALL_DISCOVERY_INDUSTRIES.key);
  const suggestions = buildSearchSuggestions(query, rows, places, productSuggestionRows);

  return {
    industry,
    industries: DISCOVERY_INDUSTRY_FILTERS,
    query,
    suggestions,
    place: selectedPlace?.key || "",
    places,
    productionScale,
    view: options.view === "list" ? "list" : "map",
    total,
    sponsoredCount: showrooms.filter((showroom) => showroom.sponsored).length,
    locationCount: new Set(showrooms.map((showroom) => `${showroom.city}\u0000${showroom.region}`)).size,
    showrooms,
    cityGroups,
    list: {
      items: listRows.map(toShowroom),
      page,
      pageCount,
      pageSize: LIST_PAGE_SIZE,
      total,
    },
  };
}

async function buildFeaturedProjection(options: DiscoveryOptions, port: DiscoveryReadPort): Promise<FeaturedShowroomsView> {
  const { get, all } = port;
  const currentTime = options.now || new Date();
  const schedule = weeklySchedule(currentTime);
  const selectedWeekday = normalizeWeekday(options.featuredDay, schedule.todayWeekday);
  const selectedDay = schedule.days.find((entry) => entry.weekday === selectedWeekday) || schedule.days[0];
  const featuredIndustry = normalizeIndustry(selectedDay.industryKey);
  const programPolicy = await getFeaturedProgramPolicy(port);
  const featuredRowsForDay = async (day: WeeklyFeaturedDay) => {
    const eligibleRows = await all<DiscoveryRow>(selectSql("AND p.booth_image_path LIKE '/%' "), [day.industryKey, day.industryKey]);
    eligibleRows.sort((left, right) => left.name.localeCompare(right.name) || left.id - right.id);
    const selection = await getFeaturedProgramDaySelection(day.dateIso, port);
    if (selection.mode !== "manual") return { rows: eligibleRows, mode: "automatic" as const };
    const byId = new Map(eligibleRows.map((row) => [row.id, row]));
    const manualRows = selection.businessIds.map((businessId) => byId.get(businessId)).filter((row): row is DiscoveryRow => Boolean(row));
    return manualRows.length
      ? { rows: manualRows, mode: "manual" as const }
      : { rows: eligibleRows, mode: "automatic" as const };
  };
  const selectedProgram = await featuredRowsForDay(selectedDay);
  const revealFeatured = selectedDay.isToday;
  const featuredRows = selectedProgram.rows;
  const featuredShowrooms = featuredRows.map((row) => ({ ...toShowroom(row), imagePath: row.booth_image_path }));
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
      title: "Daily Featured Showrooms",
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
  const port = discoveryReadPort(options.db);
  const [marketplace, featured] = await Promise.all([
    buildMarketplaceBase(options, port),
    buildFeaturedProjection({ now: options.now }, port),
  ]);
  return { ...marketplace, featuredNowBusinessId: featured.featuredNowBusinessId };
}

export async function getFeaturedShowroomsView(options: Pick<DiscoveryOptions, "featuredDay" | "now" | "db"> = {}): Promise<FeaturedShowroomsView> {
  return buildFeaturedProjection(options, discoveryReadPort(options.db));
}

export async function getSponsoredShowrooms(options: Pick<DiscoveryOptions, "db"> = {}): Promise<DiscoveryShowroom[]> {
  return (await discoveryReadPort(options.db).all<DiscoveryRow>(selectSponsoredSql())).map(toShowroom);
}

export async function getDiscoveryView(options: DiscoveryOptions = {}): Promise<DiscoveryView> {
  const port = discoveryReadPort(options.db);
  const [marketplace, featured, sponsoredShowrooms] = await Promise.all([
    buildMarketplaceBase(options, port),
    buildFeaturedProjection(options, port),
    port.all<DiscoveryRow>(selectSponsoredSql()).then((rows) => rows.map(toShowroom)),
  ]);
  return { ...marketplace, ...featured, sponsoredShowrooms };
}
