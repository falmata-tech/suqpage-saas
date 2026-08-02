import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./db";
import { PRODUCTION_SCALES, type ProductionScale } from "./discovery-contract";

export { PRODUCTION_SCALES, type ProductionScale } from "./discovery-contract";

export const DISCOVERY_INDUSTRIES = [
  { key: "electronics", label: "Electronics, electrical & appliances", icon: "circuit", code: "ELC" },
  { key: "beauty-wellness", label: "Beauty, hygiene & household care", icon: "leaf", code: "BEA" },
  { key: "food-farming", label: "Food, farms & beverages", icon: "sprout", code: "FOD" },
  { key: "machinery-tools", label: "Machinery, metalwork & industrial inputs", icon: "tool", code: "MCH" },
  { key: "home-living", label: "Furniture, home goods & building materials", icon: "home", code: "HOM" },
  { key: "fashion-textiles", label: "Textiles, garments, leather & paper", icon: "thread", code: "FSH" },
] as const;

export type DiscoveryIndustry = (typeof DISCOVERY_INDUSTRIES)[number];
export const EXPO_WEEK = [
  { weekday: 1, dayLabel: "Monday", industryKey: "electronics" },
  { weekday: 2, dayLabel: "Tuesday", industryKey: "beauty-wellness" },
  { weekday: 3, dayLabel: "Wednesday", industryKey: "food-farming" },
  { weekday: 4, dayLabel: "Thursday", industryKey: "machinery-tools" },
  { weekday: 5, dayLabel: "Friday", industryKey: "home-living" },
  { weekday: 6, dayLabel: "Saturday", industryKey: "fashion-textiles" },
  { weekday: 0, dayLabel: "Sunday", industryKey: null },
] as const;

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
};

export type ExpoBooth = {
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

export type WeeklyExpoDay = {
  weekday: number;
  dayLabel: string;
  dateIso: string;
  dateLabel: string;
  mode: "expo" | "livestream";
  industryKey: string | null;
  industryLabel: string;
  industryIcon: string;
  isToday: boolean;
};

export type WeeklyIndustryExpo = {
  mode: "expo" | "livestream";
  title: string;
  industryCode: string;
  industryIcon: string;
  selectedWeekday: number;
  isToday: boolean;
  dayLabel: string;
  dateLabel: string;
  boothCount: number;
  booths: ExpoBooth[];
  schedule: WeeklyExpoDay[];
};

export type DiscoveryView = {
  industry: DiscoveryIndustry;
  industries: readonly DiscoveryIndustry[];
  query: string;
  productionScale: ProductionScale | "";
  view: "map" | "list";
  total: number;
  sponsoredCount: number;
  locationCount: number;
  showrooms: DiscoveryShowroom[];
  cityGroups: DiscoveryCityGroup[];
  list: {
    items: DiscoveryShowroom[];
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
  expo: WeeklyIndustryExpo;
};

function normalizeIndustry(key: string | undefined) {
  return DISCOVERY_INDUSTRIES.find((industry) => industry.key === key) || DISCOVERY_INDUSTRIES[0];
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
  };
}

function selectSql(extraWhere: string, suffix = "") {
  return `
    SELECT
      b.id,b.handle,b.name,b.tagline,b.description,b.hero_image_path,
      p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
      p.fallback_style,COALESCE(s.active,0) AS is_sponsored,
      COALESCE(s.position,999) AS sponsor_position,p.production_scale
    FROM business_industries i
    JOIN businesses b ON b.id=i.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    LEFT JOIN discovery_sponsorships s ON s.business_id=b.id AND s.active=1
    WHERE i.industry_key=?
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
      ${extraWhere}
    ORDER BY is_sponsored DESC,sponsor_position,b.name COLLATE NOCASE,b.id
    ${suffix}
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
  const search = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  return [industryKey, query, search, search, search, search, search, search, search, search];
}

function discoveryWhere(productionScale: ProductionScale | "") {
  return `${SEARCH_WHERE} AND (?='' OR p.production_scale=?)`;
}

function discoveryParameters(industryKey: string, query: string, productionScale: ProductionScale | "") {
  return [...searchParameters(industryKey, query), productionScale, productionScale];
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

function rotatingSundayIndustry(date: Date) {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  const weekIndex = Math.floor((dayNumber - daysSinceMonday) / 7);
  const industryIndex = ((weekIndex % DISCOVERY_INDUSTRIES.length) + DISCOVERY_INDUSTRIES.length)
    % DISCOVERY_INDUSTRIES.length;
  return DISCOVERY_INDUSTRIES[industryIndex];
}

function weeklySchedule(now: Date): { todayWeekday: number; days: WeeklyExpoDay[] } {
  const { year, month, day } = ethiopiaDateParts(now);
  const today = new Date(Date.UTC(year, month - 1, day));
  const todayWeekday = today.getUTCDay();
  const labelFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  const days = Array.from({ length: 7 }, (_, index): WeeklyExpoDay => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + index);
    const entry = EXPO_WEEK.find((candidate) => candidate.weekday === date.getUTCDay()) || EXPO_WEEK[0];
    const isSunday = entry.weekday === 0;
    const industry = isSunday ? rotatingSundayIndustry(date) : normalizeIndustry(entry.industryKey || undefined);
    return {
      weekday: entry.weekday,
      dayLabel: entry.dayLabel,
      dateIso: date.toISOString().slice(0, 10),
      dateLabel: labelFormatter.format(date),
      mode: isSunday ? "livestream" : "expo",
      industryKey: industry.key,
      industryLabel: industry.label,
      industryIcon: industry.icon,
      isToday: index === 0,
    };
  });
  return { todayWeekday, days };
}

function groupCities(showrooms: DiscoveryShowroom[]): DiscoveryCityGroup[] {
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
    .map((group) => ({
      ...group,
      latitude: group.latitude / group.count,
      longitude: group.longitude / group.count,
    }))
    .sort((left, right) => right.count - left.count || left.city.localeCompare(right.city));
}

function expoEligibleCount(db: DatabaseSync, industryKey: string, mode: WeeklyExpoDay["mode"]) {
  if (mode === "expo") {
    return (db.prepare(`
      SELECT COUNT(DISTINCT b.id) AS total
      FROM business_industries i
      JOIN businesses b ON b.id=i.business_id
      JOIN business_discovery_profiles p ON p.business_id=b.id
      WHERE i.industry_key=?
        AND b.status='active'
        AND p.is_excluded=0
        AND p.approved_at > 0
        AND p.booth_image_path LIKE '/%'
        AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
    `).get(industryKey) as { total: number }).total;
  }
  return (db.prepare(`
    SELECT COUNT(*) AS total
    FROM sunday_showcase_selections selection
    JOIN businesses b ON b.id=selection.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    WHERE selection.industry_key=?
      AND selection.active=1
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND p.booth_image_path LIKE '/%'
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
  `).get(industryKey) as { total: number }).total;
}

export function getDiscoveryView(
  options: {
    industry?: string;
    q?: string;
    page?: string | number;
    view?: string;
    expoDay?: string | number;
    scale?: string;
    now?: Date;
    db?: DatabaseSync;
  } = {},
): DiscoveryView {
  const db = options.db || getDb();
  const industry = normalizeIndustry(options.industry);
  const query = (options.q || "").trim().slice(0, 80);
  const productionScale = normalizeProductionScale(options.scale);
  const where = discoveryWhere(productionScale);
  const params = discoveryParameters(industry.key, query, productionScale);
  const countRow = db.prepare(`
    SELECT COUNT(DISTINCT b.id) AS total
    FROM business_industries i
    JOIN businesses b ON b.id=i.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    WHERE i.industry_key=?
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
      ${where}
  `).get(...params) as { total: number };
  const total = countRow.total;
  const pageCount = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
  const page = Math.min(normalizePositiveInteger(options.page, 1), pageCount);
  const rows = db.prepare(selectSql(where)).all(...params) as DiscoveryRow[];
  const listRows = db.prepare(selectSql(where, "LIMIT ? OFFSET ?"))
    .all(...params, LIST_PAGE_SIZE, (page - 1) * LIST_PAGE_SIZE) as DiscoveryRow[];
  const showrooms = rows.map(toShowroom);
  const cityGroups = groupCities(showrooms);

  const schedule = weeklySchedule(options.now || new Date());
  const selectedWeekday = normalizeWeekday(options.expoDay, schedule.todayWeekday);
  const selectedDay = schedule.days.find((entry) => entry.weekday === selectedWeekday) || schedule.days[0];
  const expoIndustry = normalizeIndustry(selectedDay.industryKey || undefined);
  const revealExpo = selectedDay.isToday;
  const expoRows = revealExpo
    ? selectedDay.mode === "expo"
      ? db.prepare(selectSql("AND p.booth_image_path LIKE '/%' ")).all(expoIndustry.key) as DiscoveryRow[]
      : db.prepare(`
        SELECT
          b.id,b.handle,b.name,b.tagline,b.description,b.hero_image_path,
          p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
          p.fallback_style,COALESCE(s.active,0) AS is_sponsored,
          COALESCE(s.position,999) AS sponsor_position,p.production_scale
        FROM sunday_showcase_selections selection
        JOIN businesses b ON b.id=selection.business_id
        JOIN business_discovery_profiles p ON p.business_id=b.id
        LEFT JOIN discovery_sponsorships s ON s.business_id=b.id AND s.active=1
        WHERE selection.industry_key=?
          AND selection.active=1
          AND b.status='active'
          AND p.is_excluded=0
          AND p.approved_at > 0
          AND p.booth_image_path LIKE '/%'
          AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
        ORDER BY selection.position,b.name COLLATE NOCASE,b.id
      `).all(expoIndustry.key) as DiscoveryRow[]
    : [];
  const expoShowrooms = expoRows.map((row) => ({ ...toShowroom(row), imagePath: row.booth_image_path }));
  const boothCount = revealExpo
    ? expoShowrooms.length
    : expoEligibleCount(db, expoIndustry.key, selectedDay.mode);
  const booths = Array.from({ length: boothCount }, (_, index): ExpoBooth => {
    const slot = index + 1;
    const reference = selectedDay.mode === "livestream"
      ? `LIVE-${String(slot).padStart(2, "0")}`
      : `${expoIndustry?.code}-B${String(slot).padStart(2, "0")}`;
    return revealExpo
      ? { revealed: true, showroom: expoShowrooms[index], slot, reference }
      : { revealed: false, showroom: null, slot, reference };
  });

  return {
    industry,
    industries: DISCOVERY_INDUSTRIES,
    query,
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
    expo: {
      mode: selectedDay.mode,
      title: selectedDay.mode === "livestream" ? `Featured Enterprises: ${expoIndustry.label}` : `${expoIndustry.label} Expo`,
      industryCode: selectedDay.mode === "livestream" ? "LIVE" : expoIndustry.code,
      industryIcon: selectedDay.industryIcon,
      selectedWeekday,
      isToday: selectedDay.isToday,
      dayLabel: selectedDay.dayLabel,
      dateLabel: selectedDay.dateLabel,
      boothCount,
      booths,
      schedule: schedule.days,
    },
  };
}
