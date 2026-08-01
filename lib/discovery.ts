import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./db";

export const DISCOVERY_INDUSTRIES = [
  { key: "electronics", label: "Electronics & devices", icon: "circuit", code: "ELC" },
  { key: "beauty-wellness", label: "Beauty & body care", icon: "leaf", code: "BEA" },
  { key: "food-farming", label: "Food, farms & ingredients", icon: "sprout", code: "FOD" },
  { key: "machinery-tools", label: "Metalwork, tools & equipment", icon: "tool", code: "MCH" },
  { key: "home-living", label: "Furniture, home & craft", icon: "home", code: "HOM" },
  { key: "fashion-textiles", label: "Clothing, textiles & leather", icon: "thread", code: "FSH" },
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
const EXPO_HALL_SIZE = 12;
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
  is_featured: number;
};

export type DiscoverySuq = {
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
  featured: boolean;
};

export type ExpoBooth = DiscoverySuq & {
  hall: number;
  booth: number;
  reference: string;
};

export type DiscoveryCityGroup = {
  key: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  count: number;
  suqs: DiscoverySuq[];
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
  dayLabel: string;
  dateLabel: string;
  hallCount: number;
  booths: ExpoBooth[];
  schedule: WeeklyExpoDay[];
};

export type DiscoveryView = {
  industry: DiscoveryIndustry;
  industries: readonly DiscoveryIndustry[];
  query: string;
  view: "map" | "list";
  total: number;
  featuredCount: number;
  locationCount: number;
  suqs: DiscoverySuq[];
  cityGroups: DiscoveryCityGroup[];
  list: {
    items: DiscoverySuq[];
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

function normalizePositiveInteger(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeWeekday(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : fallback;
}

function toSuq(row: DiscoveryRow): DiscoverySuq {
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
    featured: Boolean(row.is_featured),
  };
}

function selectSql(extraWhere: string, suffix = "") {
  return `
    SELECT
      b.id,b.handle,b.name,b.tagline,b.description,b.hero_image_path,
      p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
      p.fallback_style,p.is_featured
    FROM business_industries i
    JOIN businesses b ON b.id=i.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    WHERE i.industry_key=?
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
      ${extraWhere}
    ORDER BY p.is_featured DESC,b.name COLLATE NOCASE,b.id
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

function weeklySchedule(now: Date): { todayWeekday: number; days: WeeklyExpoDay[] } {
  const { year, month, day } = ethiopiaDateParts(now);
  const today = new Date(Date.UTC(year, month - 1, day));
  const todayWeekday = today.getUTCDay();
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((todayWeekday + 6) % 7));
  const labelFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  const days = EXPO_WEEK.map((entry, index): WeeklyExpoDay => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    const industry = entry.industryKey ? normalizeIndustry(entry.industryKey) : null;
    return {
      weekday: entry.weekday,
      dayLabel: entry.dayLabel,
      dateIso: date.toISOString().slice(0, 10),
      dateLabel: labelFormatter.format(date),
      mode: industry ? "expo" : "livestream",
      industryKey: industry?.key || null,
      industryLabel: industry?.label || "SuqPage TikTok Live",
      industryIcon: industry?.icon || "live",
      isToday: entry.weekday === todayWeekday,
    };
  });
  return { todayWeekday, days };
}

function groupCities(suqs: DiscoverySuq[]): DiscoveryCityGroup[] {
  const groups = new Map<string, DiscoveryCityGroup>();
  for (const suq of suqs) {
    const key = `${suq.city.trim().toLocaleLowerCase()}\u0000${suq.region.trim().toLocaleLowerCase()}`;
    const group = groups.get(key) || {
      key,
      city: suq.city,
      region: suq.region,
      latitude: 0,
      longitude: 0,
      count: 0,
      suqs: [],
    };
    group.latitude += suq.latitude;
    group.longitude += suq.longitude;
    group.count += 1;
    group.suqs.push(suq);
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

export function getDiscoveryView(
  options: {
    industry?: string;
    q?: string;
    page?: string | number;
    view?: string;
    expoDay?: string | number;
    now?: Date;
    db?: DatabaseSync;
  } = {},
): DiscoveryView {
  const db = options.db || getDb();
  const industry = normalizeIndustry(options.industry);
  const query = (options.q || "").trim().slice(0, 80);
  const params = searchParameters(industry.key, query);
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
      ${SEARCH_WHERE}
  `).get(...params) as { total: number };
  const total = countRow.total;
  const pageCount = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
  const page = Math.min(normalizePositiveInteger(options.page, 1), pageCount);
  const rows = db.prepare(selectSql(SEARCH_WHERE)).all(...params) as DiscoveryRow[];
  const listRows = db.prepare(selectSql(SEARCH_WHERE, "LIMIT ? OFFSET ?"))
    .all(...params, LIST_PAGE_SIZE, (page - 1) * LIST_PAGE_SIZE) as DiscoveryRow[];
  const suqs = rows.map(toSuq);
  const cityGroups = groupCities(suqs);

  const schedule = weeklySchedule(options.now || new Date());
  const selectedWeekday = normalizeWeekday(options.expoDay, schedule.todayWeekday);
  const selectedDay = schedule.days.find((entry) => entry.weekday === selectedWeekday) || schedule.days[0];
  const expoIndustry = selectedDay.industryKey ? normalizeIndustry(selectedDay.industryKey) : null;
  const expoRows = expoIndustry
    ? db.prepare(selectSql("")).all(expoIndustry.key) as DiscoveryRow[]
    : db.prepare(`
        SELECT
          b.id,b.handle,b.name,b.tagline,b.description,b.hero_image_path,
          p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
          p.fallback_style,p.is_featured
        FROM businesses b
        JOIN business_discovery_profiles p ON p.business_id=b.id
        WHERE b.status='active'
          AND p.is_excluded=0
          AND p.approved_at > 0
          AND p.is_featured=1
          AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
        ORDER BY b.name COLLATE NOCASE,b.id
      `).all() as DiscoveryRow[];
  const expoSuqs = expoRows.map(toSuq);
  const booths = expoSuqs.map((suq, index): ExpoBooth => {
    const hall = Math.floor(index / EXPO_HALL_SIZE) + 1;
    const booth = index % EXPO_HALL_SIZE + 1;
    return {
      ...suq,
      hall,
      booth,
      reference: selectedDay.mode === "livestream"
        ? `LIVE-${String(index + 1).padStart(2, "0")}`
        : `${expoIndustry?.code}-H${hall}-B${String(booth).padStart(2, "0")}`,
    };
  });

  return {
    industry,
    industries: DISCOVERY_INDUSTRIES,
    query,
    view: options.view === "list" ? "list" : "map",
    total,
    featuredCount: suqs.filter((suq) => suq.featured).length,
    locationCount: new Set(suqs.map((suq) => `${suq.city}\u0000${suq.region}`)).size,
    suqs,
    cityGroups,
    list: {
      items: listRows.map(toSuq),
      page,
      pageCount,
      pageSize: LIST_PAGE_SIZE,
      total,
    },
    expo: {
      mode: selectedDay.mode,
      title: selectedDay.mode === "livestream" ? "Sunday Suq Live" : `${expoIndustry?.label} Expo`,
      industryCode: selectedDay.mode === "livestream" ? "LIVE" : expoIndustry?.code || "SUQ",
      industryIcon: selectedDay.industryIcon,
      selectedWeekday,
      dayLabel: selectedDay.dayLabel,
      dateLabel: selectedDay.dateLabel,
      hallCount: Math.max(1, Math.ceil(booths.length / EXPO_HALL_SIZE)),
      booths,
      schedule: schedule.days,
    },
  };
}
