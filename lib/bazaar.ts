import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./db";

const DEFAULT_TIMEZONE = process.env.SUQPAGE_BAZAAR_TIMEZONE || "Africa/Addis_Ababa";
const FLOOR_WIDTH = 1280;
const FLOOR_HEIGHT = 860;
const BOOTH_WIDTH = 170;
const BOOTH_HEIGHT = 112;

const INDUSTRY_LABELS: Record<string, string> = {
  electronics: "Electronics & Appliances",
  "beauty-wellness": "Beauty, Wellness & Natural Medicine",
  "food-farming": "Produce, Farming & Food",
  "machinery-tools": "Machinery, Tools & Manufacturing",
  "home-living": "Home, Furniture & Living",
  "fashion-textiles": "Fashion, Textiles & Accessories",
  community: "Community Market",
};

const DEFAULT_THEMES = [
  { weekday: 1, name: "Electronics & Appliances", slug: "electronics-appliances", icon: "monitor", industryKeys: ["electronics"] },
  { weekday: 2, name: "Beauty, Wellness & Natural Medicine", slug: "beauty-wellness-natural-medicine", icon: "sparkle", industryKeys: ["beauty-wellness"] },
  { weekday: 3, name: "Produce, Farming & Food", slug: "produce-farming-food", icon: "leaf", industryKeys: ["food-farming"] },
  { weekday: 4, name: "Machinery, Tools & Manufacturing", slug: "machinery-tools-manufacturing", icon: "gear", industryKeys: ["machinery-tools"] },
  { weekday: 5, name: "Home, Furniture & Living", slug: "home-furniture-living", icon: "home", industryKeys: ["home-living"] },
  { weekday: 6, name: "Fashion, Textiles & Accessories", slug: "fashion-textiles-accessories", icon: "shirt", industryKeys: ["fashion-textiles"] },
  {
    weekday: 0,
    name: "Community Market & Special Event",
    slug: "community-market-special-event",
    icon: "star",
    industryKeys: ["electronics", "beauty-wellness", "food-farming", "machinery-tools", "home-living", "fashion-textiles", "community"],
  },
] as const;

type BazaarThemeRow = {
  id: number;
  name: string;
  slug: string;
  weekday: number;
  industry_keys_json: string;
  icon: string;
  timezone: string;
  starts_at_time: string;
};

type EligibleBusinessRow = {
  id: number;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_path: string;
  logo_path: string;
  industry_keys_json: string | null;
  booth_image_path: string | null;
  fallback_style: string | null;
  is_featured: number | null;
  is_excluded: number | null;
};

type BazaarBoothRow = EligibleBusinessRow & {
  booth_id: number;
  occurrence_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  floor_section: string;
  featured: number;
  booth_status: "active" | "excluded";
};

export type BazaarBoothView = {
  id: number;
  businessId: number;
  handle: string;
  name: string;
  title: string;
  description: string;
  industryLabel: string;
  imageUrl: string;
  fallbackToken: string;
  x: number;
  y: number;
  width: number;
  height: number;
  featured: boolean;
  status: "active" | "excluded";
};

export type CurrentBazaarView = {
  occurrenceId: number | null;
  themeName: string;
  themeSlug: string;
  status: "live" | "empty" | "unavailable";
  startsAt: string;
  endsAt: string;
  timezone: string;
  floor: { width: number; height: number };
  booths: BazaarBoothView[];
};

type BazaarOptions = {
  db?: DatabaseSync;
  now?: Date;
};

function jsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function localDateParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour") || "0"),
  };
}

function addDays(localDate: string, days: number) {
  const [year, month, day] = localDate.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return next.toISOString().slice(0, 10);
}

function weekday(localDate: string) {
  const [year, month, day] = localDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

function currentBazaarDate(now: Date, timezone: string) {
  const parts = localDateParts(now, timezone);
  return parts.hour < 4 ? addDays(parts.date, -1) : parts.date;
}

function occurrenceWindow(localDate: string, timezone: string, startsAtTime: string) {
  const startTime = startsAtTime || "04:00";
  return {
    startsAt: `${localDate} ${startTime} ${timezone}`,
    endsAt: `${addDays(localDate, 1)} ${startTime} ${timezone}`,
  };
}

function defaultIndustryKeysForBusiness(handle: string) {
  const keys: Record<string, string[]> = {
    alhayabrand: ["fashion-textiles"],
    usashopet: ["beauty-wellness"],
    novatech: ["electronics", "machinery-tools"],
    homevibe: ["home-living"],
  };
  return keys[handle] || ["community"];
}

function fallbackStyleForIndustry(keys: string[]) {
  const first = keys[0] || "community";
  return first === "fashion-textiles" ? "textile"
    : first === "beauty-wellness" ? "botanical"
    : first === "electronics" ? "signal"
    : first === "machinery-tools" ? "industrial"
    : first === "home-living" ? "interior"
    : "market";
}

export function seedDefaultBazaarConfig(db: DatabaseSync = getDb()) {
  const insertTheme = db.prepare(`
    INSERT OR IGNORE INTO bazaar_themes(
      name,slug,weekday,industry_keys_json,icon,timezone,active,starts_at_time
    ) VALUES(?,?,?,?,?,?,1,'04:00')
  `);
  for (const theme of DEFAULT_THEMES) {
    insertTheme.run(
      theme.name,
      theme.slug,
      theme.weekday,
      JSON.stringify(theme.industryKeys),
      theme.icon,
      DEFAULT_TIMEZONE,
    );
  }

  const businesses = db
    .prepare("SELECT id,handle,hero_image_path FROM businesses ORDER BY id")
    .all() as Array<{ id: number; handle: string; hero_image_path: string }>;
  const insertProfile = db.prepare(`
    INSERT OR IGNORE INTO bazaar_booth_profiles(
      business_id,industry_keys_json,booth_image_path,fallback_style,is_featured,is_excluded,approved_at
    ) VALUES(?,?,?,?,0,0,CURRENT_TIMESTAMP)
  `);
  for (const business of businesses) {
    const industryKeys = defaultIndustryKeysForBusiness(business.handle);
    insertProfile.run(
      business.id,
      JSON.stringify(industryKeys),
      business.hero_image_path || "",
      fallbackStyleForIndustry(industryKeys),
    );
  }
}

function currentTheme(db: DatabaseSync, now: Date) {
  const date = currentBazaarDate(now, DEFAULT_TIMEZONE);
  return {
    date,
    theme: db
      .prepare("SELECT * FROM bazaar_themes WHERE active=1 AND weekday=? ORDER BY id LIMIT 1")
      .get(weekday(date)) as BazaarThemeRow | undefined,
  };
}

function intersects(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.some((value) => rightSet.has(value));
}

function coordinatesFor(index: number) {
  const columns = 5;
  const col = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: 70 + col * 230,
    y: 76 + row * 168,
    width: BOOTH_WIDTH,
    height: BOOTH_HEIGHT,
  };
}

function eligibleBusinesses(db: DatabaseSync, theme: BazaarThemeRow) {
  const themeKeys = jsonArray(theme.industry_keys_json);
  const rows = db.prepare(`
    SELECT b.id,b.handle,b.name,b.tagline,b.description,b.hero_title,b.hero_subtitle,
      b.hero_image_path,b.logo_path,p.industry_keys_json,p.booth_image_path,
      p.fallback_style,p.is_featured,p.is_excluded
    FROM businesses b
    LEFT JOIN bazaar_booth_profiles p ON p.business_id=b.id
    WHERE b.status='active'
    ORDER BY COALESCE(p.is_featured,0) DESC,b.name,b.id
  `).all() as EligibleBusinessRow[];
  return rows.filter((business) => {
    if (business.is_excluded) return false;
    const profileKeys = jsonArray(business.industry_keys_json);
    return intersects(themeKeys, profileKeys.length ? profileKeys : ["community"]);
  });
}

function ensureOccurrence(db: DatabaseSync, theme: BazaarThemeRow, bazaarDate: string) {
  const window = occurrenceWindow(bazaarDate, theme.timezone || DEFAULT_TIMEZONE, theme.starts_at_time);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE bazaar_occurrences SET status='ended',updated_at=CURRENT_TIMESTAMP WHERE status='live' AND bazaar_date<>?")
      .run(bazaarDate);
    db.prepare(`
      INSERT OR IGNORE INTO bazaar_occurrences(theme_id,bazaar_date,starts_at,ends_at,timezone,status)
      VALUES(?,?,?,?,?,'live')
    `).run(theme.id, bazaarDate, window.startsAt, window.endsAt, theme.timezone || DEFAULT_TIMEZONE);
    db.prepare(`
      UPDATE bazaar_occurrences
      SET starts_at=?,ends_at=?,timezone=?,status='live',updated_at=CURRENT_TIMESTAMP
      WHERE theme_id=? AND bazaar_date=?
    `).run(window.startsAt, window.endsAt, theme.timezone || DEFAULT_TIMEZONE, theme.id, bazaarDate);
    const occurrence = db
      .prepare("SELECT id FROM bazaar_occurrences WHERE theme_id=? AND bazaar_date=?")
      .get(theme.id, bazaarDate) as { id: number };
    db.prepare("UPDATE bazaar_booths SET status='excluded',updated_at=CURRENT_TIMESTAMP WHERE occurrence_id=?")
      .run(occurrence.id);
    const insertBooth = db.prepare(`
      INSERT OR IGNORE INTO bazaar_booths(
        occurrence_id,business_id,x,y,width,height,floor_section,featured,status
      ) VALUES(?,?,?,?,?,?,?,?,'active')
    `);
    const reactivateBooth = db.prepare(`
      UPDATE bazaar_booths
      SET featured=?,status='active',updated_at=CURRENT_TIMESTAMP
      WHERE occurrence_id=? AND business_id=?
    `);
    eligibleBusinesses(db, theme).forEach((business, index) => {
      const coords = coordinatesFor(index);
      insertBooth.run(
        occurrence.id,
        business.id,
        coords.x,
        coords.y,
        coords.width,
        coords.height,
        index < 5 ? "front-walk" : "market-lane",
        business.is_featured ? 1 : 0,
      );
      reactivateBooth.run(business.is_featured ? 1 : 0, occurrence.id, business.id);
    });
    db.exec("COMMIT");
    return { id: occurrence.id, ...window };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function boothRows(db: DatabaseSync, occurrenceId: number) {
  return db.prepare(`
    SELECT bb.id booth_id,bb.occurrence_id,bb.x,bb.y,bb.width,bb.height,
      bb.floor_section,bb.featured,bb.status booth_status,b.id,b.handle,b.name,
      b.tagline,b.description,b.hero_title,b.hero_subtitle,b.hero_image_path,
      b.logo_path,p.industry_keys_json,p.booth_image_path,p.fallback_style,
      p.is_featured,p.is_excluded
    FROM bazaar_booths bb
    JOIN businesses b ON b.id=bb.business_id
    LEFT JOIN bazaar_booth_profiles p ON p.business_id=b.id
    WHERE bb.occurrence_id=? AND bb.status='active' AND b.status='active'
    ORDER BY bb.featured DESC,bb.y,bb.x,b.name
  `).all(occurrenceId) as BazaarBoothRow[];
}

function toBoothView(row: BazaarBoothRow): BazaarBoothView {
  const keys = jsonArray(row.industry_keys_json);
  const primaryKey = keys[0] || "community";
  return {
    id: row.booth_id,
    businessId: row.id,
    handle: row.handle,
    name: row.name,
    title: row.hero_title || row.tagline || row.name,
    description: row.hero_subtitle || row.tagline || row.description || "Explore this showroom and send a structured inquiry.",
    industryLabel: INDUSTRY_LABELS[primaryKey] || "Community Market",
    imageUrl: row.booth_image_path || row.hero_image_path || row.logo_path || "",
    fallbackToken: row.fallback_style || fallbackStyleForIndustry(keys),
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    featured: Boolean(row.featured || row.is_featured),
    status: row.booth_status,
  };
}

export function getCurrentBazaar(options: BazaarOptions = {}): CurrentBazaarView {
  const db = options.db || getDb();
  const now = options.now || (process.env.SUQPAGE_BAZAAR_NOW ? new Date(process.env.SUQPAGE_BAZAAR_NOW) : new Date());
  seedDefaultBazaarConfig(db);
  const { date, theme } = currentTheme(db, now);
  if (!theme) {
    return {
      occurrenceId: null,
      themeName: "Daily Bazaar",
      themeSlug: "unavailable",
      status: "unavailable",
      startsAt: "",
      endsAt: "",
      timezone: DEFAULT_TIMEZONE,
      floor: { width: FLOOR_WIDTH, height: FLOOR_HEIGHT },
      booths: [],
    };
  }
  const occurrence = ensureOccurrence(db, theme, date);
  const booths = boothRows(db, occurrence.id).map(toBoothView);
  return {
    occurrenceId: occurrence.id,
    themeName: theme.name,
    themeSlug: theme.slug,
    status: booths.length ? "live" : "empty",
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
    timezone: theme.timezone || DEFAULT_TIMEZONE,
    floor: { width: FLOOR_WIDTH, height: FLOOR_HEIGHT },
    booths,
  };
}
