import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./db";
import { SEEDED_EXPO_PROFILES, seededExpoBoothPath } from "./expo-seed";

const DEFAULT_TIMEZONE = process.env.SUQPAGE_BAZAAR_TIMEZONE || "Africa/Addis_Ababa";
const MIN_FLOOR_WIDTH = 720;
const FLOOR_PADDING = 70;
const MAX_FLOOR_COLUMNS = 8;
const MAX_FLOOR_BOOTHS = 48;
const BOOTH_WIDTH = 200;
const BOOTH_HEIGHT = 150;
const BOOTH_GAP = 44;
const CORRIDOR_HEIGHT = 132;
const ROW_GAP = 42;

const INDUSTRY_LABELS: Record<string, string> = {
  electronics: "Electronics & Appliances",
  "beauty-wellness": "Beauty, Wellness & Natural Medicine",
  "food-farming": "Produce, Farming & Food",
  "machinery-tools": "Manufacturing, Tools & Production Inputs",
  "home-living": "Home, Furniture & Living",
  "fashion-textiles": "Fashion, Textiles & Accessories",
  community: "Community Market",
};

const DEFAULT_THEMES = [
  { weekday: 1, name: "Electronics & Appliances", slug: "electronics-appliances", icon: "monitor", industryKeys: ["electronics"] },
  { weekday: 2, name: "Beauty, Wellness & Natural Medicine", slug: "beauty-wellness-natural-medicine", icon: "sparkle", industryKeys: ["beauty-wellness"] },
  { weekday: 3, name: "Produce, Farming & Food", slug: "produce-farming-food", icon: "leaf", industryKeys: ["food-farming"] },
  { weekday: 4, name: "Manufacturing, Tools & Production Inputs", slug: "machinery-tools-manufacturing", icon: "gear", industryKeys: ["machinery-tools"] },
  { weekday: 5, name: "Home, Furniture & Living", slug: "home-furniture-living", icon: "home", industryKeys: ["home-living"] },
  { weekday: 6, name: "Fashion, Textiles & Accessories", slug: "fashion-textiles-accessories", icon: "shirt", industryKeys: ["fashion-textiles"] },
  {
    weekday: 0,
    name: "Enterprise & Export Showcase",
    slug: "enterprise-export-showcase",
    icon: "star",
    industryKeys: ["community"],
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
  floorRow: number | null;
  boothReference: string | null;
  onFloor: boolean;
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
  floor: {
    width: number;
    height: number;
    columns: number;
    rows: number;
    visibleBoothCount: number;
    totalBoothCount: number;
    maxBooths: number;
    corridors: Array<{ row: number; y: number; height: number }>;
  };
  booths: BazaarBoothView[];
};

export type BazaarThemeAdminView = {
  id: number;
  name: string;
  slug: string;
  weekday: number;
  industryKeys: string[];
  icon: string;
  timezone: string;
  startsAtTime: string;
  active: boolean;
};

export type BazaarProfileAdminView = {
  businessId: number;
  businessName: string;
  handle: string;
  status: string;
  industryKeys: string[];
  industryLabel: string;
  boothImagePath: string;
  city: string;
  zone: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  fallbackStyle: string;
  featured: boolean;
  excluded: boolean;
  eligible: boolean;
  eligibilityIssues: string[];
  booth: BazaarBoothView | null;
};

export type BazaarAdminState = {
  current: CurrentBazaarView;
  themes: BazaarThemeAdminView[];
  profiles: BazaarProfileAdminView[];
};

export class BazaarAdminError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

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

function normalizeIndustryKeys(value: string | string[]) {
  const entries = Array.isArray(value) ? value : value.split(",");
  const keys = entries
    .map((entry) => entry.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean);
  return [...new Set(keys)];
}

function requireInteger(value: unknown, label: string) {
  const number = typeof value === "number" ? value : Number.parseInt(String(value || ""), 10);
  if (!Number.isInteger(number)) throw new BazaarAdminError(`${label} is invalid.`, "invalid_number");
  return number;
}

function requireCoordinate(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
) {
  const number = typeof value === "number"
    ? value
    : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw new BazaarAdminError(
      `${label} must be between ${minimum} and ${maximum}.`,
      "invalid_coordinate",
    );
  }
  return number;
}

function requireBoundedText(value: unknown, label: string, max: number, required = true) {
  const text = String(value || "").trim();
  if (required && !text) throw new BazaarAdminError(`${label} is required.`, "required");
  if (text.length > max) throw new BazaarAdminError(`${label} is too long.`, "too_long");
  return text;
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
  const seeded = SEEDED_EXPO_PROFILES[handle];
  if (seeded) return seeded.industryKeys;
  const keys: Record<string, string[]> = {
    alhayabrand: ["fashion-textiles"],
    usashopet: ["beauty-wellness"],
    novatech: ["electronics", "machinery-tools"],
    homevibe: ["home-living"],
    "selam-weave": ["fashion-textiles"],
    "afia-botanics": ["beauty-wellness"],
    "warka-furniture": ["home-living"],
    "addis-metalworks": ["machinery-tools"],
    "green-terrace-farm": ["food-farming"],
    "blue-nile-apiary": ["food-farming"],
    "rift-valley-mill": ["food-farming"],
    "entoto-ceramics": ["home-living"],
    "koba-leather": ["fashion-textiles"],
    "nova-assembly": ["electronics"],
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

function floorGeometry(totalBoothCount: number): CurrentBazaarView["floor"] {
  const visibleBoothCount = Math.min(totalBoothCount, MAX_FLOOR_BOOTHS);
  const columns = Math.min(MAX_FLOOR_COLUMNS, Math.max(1, Math.ceil(Math.sqrt(visibleBoothCount || 1))));
  const rows = Math.max(1, Math.ceil(visibleBoothCount / columns));
  const contentWidth = columns * BOOTH_WIDTH + (columns - 1) * BOOTH_GAP;
  const width = Math.max(MIN_FLOOR_WIDTH, FLOOR_PADDING * 2 + contentWidth);
  const rowPitch = BOOTH_HEIGHT + CORRIDOR_HEIGHT + ROW_GAP;
  const height = FLOOR_PADDING * 2 + rows * (BOOTH_HEIGHT + CORRIDOR_HEIGHT) + (rows - 1) * ROW_GAP;
  return {
    width,
    height,
    columns,
    rows,
    visibleBoothCount,
    totalBoothCount,
    maxBooths: MAX_FLOOR_BOOTHS,
    corridors: Array.from({ length: rows }, (_, index) => ({
      row: index + 1,
      y: FLOOR_PADDING + index * rowPitch + BOOTH_HEIGHT,
      height: CORRIDOR_HEIGHT,
    })),
  };
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
      business_id,industry_keys_json,booth_image_path,fallback_style,is_featured,
      is_excluded,approved_at,city,zone,region,latitude,longitude
    ) VALUES(?,?,?,?,1,0,CURRENT_TIMESTAMP,?,?,?,?,?)
  `);
  for (const business of businesses) {
    const industryKeys = defaultIndustryKeysForBusiness(business.handle);
    const seededProfile = SEEDED_EXPO_PROFILES[business.handle];
    const boothImagePath = seededProfile ? seededExpoBoothPath(business.handle) : "";
    insertProfile.run(
      business.id,
      JSON.stringify(industryKeys),
      boothImagePath,
      fallbackStyleForIndustry(industryKeys),
      seededProfile?.city || "",
      seededProfile?.zone || "",
      seededProfile?.region || "",
      seededProfile?.latitude ?? null,
      seededProfile?.longitude ?? null,
    );
    if (seededProfile) {
      db.prepare(`
        UPDATE bazaar_booth_profiles
        SET industry_keys_json=?,booth_image_path=?,city=?,zone=?,region=?,latitude=?,
          longitude=?,approved_at=COALESCE(approved_at,CURRENT_TIMESTAMP),
          updated_at=CURRENT_TIMESTAMP
        WHERE business_id=?
      `).run(
        JSON.stringify(industryKeys),
        boothImagePath,
        seededProfile.city,
        seededProfile.zone,
        seededProfile.region,
        seededProfile.latitude,
        seededProfile.longitude,
        business.id,
      );
    }
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

function coordinatesFor(index: number, floor: CurrentBazaarView["floor"]) {
  if (index >= floor.visibleBoothCount) {
    return { x: 0, y: 0, width: BOOTH_WIDTH, height: BOOTH_HEIGHT, floorSection: "list-only" };
  }
  const col = index % floor.columns;
  const row = Math.floor(index / floor.columns);
  const rowStartIndex = row * floor.columns;
  const rowBoothCount = Math.min(floor.columns, floor.visibleBoothCount - rowStartIndex);
  const rowContentWidth = rowBoothCount * BOOTH_WIDTH + (rowBoothCount - 1) * BOOTH_GAP;
  const left = Math.round((floor.width - rowContentWidth) / 2);
  return {
    x: left + col * (BOOTH_WIDTH + BOOTH_GAP),
    y: FLOOR_PADDING + row * (BOOTH_HEIGHT + CORRIDOR_HEIGHT + ROW_GAP),
    width: BOOTH_WIDTH,
    height: BOOTH_HEIGHT,
    floorSection: `row-${row + 1}`,
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
      SET featured=?,status='active',
        x=CASE WHEN floor_section='manual' THEN x ELSE ? END,
        y=CASE WHEN floor_section='manual' THEN y ELSE ? END,
        width=CASE WHEN floor_section='manual' THEN width ELSE ? END,
        height=CASE WHEN floor_section='manual' THEN height ELSE ? END,
        floor_section=CASE WHEN floor_section='manual' THEN floor_section ELSE ? END,
        updated_at=CURRENT_TIMESTAMP
      WHERE occurrence_id=? AND business_id=?
    `);
    const eligible = eligibleBusinesses(db, theme);
    const floor = floorGeometry(eligible.length);
    eligible.forEach((business, index) => {
      const coords = coordinatesFor(index, floor);
      insertBooth.run(
        occurrence.id,
        business.id,
        coords.x,
        coords.y,
        coords.width,
        coords.height,
        coords.floorSection,
        business.is_featured ? 1 : 0,
      );
      reactivateBooth.run(
        business.is_featured ? 1 : 0,
        coords.x,
        coords.y,
        coords.width,
        coords.height,
        coords.floorSection,
        occurrence.id,
        business.id,
      );
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
    ORDER BY CASE WHEN bb.floor_section='list-only' THEN 1 ELSE 0 END,
      bb.featured DESC,bb.y,bb.x,b.name
  `).all(occurrenceId) as BazaarBoothRow[];
}

function toBoothView(row: BazaarBoothRow, onFloor: boolean, floor: CurrentBazaarView["floor"]): BazaarBoothView {
  const keys = jsonArray(row.industry_keys_json);
  const primaryKey = keys[0] || "community";
  const floorRowMatch = /^row-(\d+)$/.exec(row.floor_section);
  const corridorRow = floor.corridors.find((corridor) => row.y + row.height === corridor.y)?.row;
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
    floorRow: onFloor ? Number(floorRowMatch?.[1] || corridorRow || 1) : null,
    boothReference: null,
    onFloor,
    featured: Boolean(row.featured || row.is_featured),
    status: row.booth_status,
  };
}

function assignBoothReferences(booths: BazaarBoothView[]) {
  const references = new Map<number, string>();
  const floorRows = [...new Set(booths.flatMap((booth) => booth.floorRow === null ? [] : [booth.floorRow]))].sort((a, b) => a - b);
  for (const floorRow of floorRows) {
    booths
      .filter((booth) => booth.floorRow === floorRow)
      .sort((left, right) => left.x - right.x || left.name.localeCompare(right.name))
      .forEach((booth, index) => references.set(booth.id, `R${floorRow}-${String(index + 1).padStart(2, "0")}`));
  }
  return booths.map((booth) => ({ ...booth, boothReference: references.get(booth.id) || null }));
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
      floor: floorGeometry(0),
      booths: [],
    };
  }
  const occurrence = ensureOccurrence(db, theme, date);
  const rows = boothRows(db, occurrence.id);
  const floor = floorGeometry(rows.length);
  const booths = assignBoothReferences(rows.map((row, index) => toBoothView(row, index < floor.visibleBoothCount, floor)));
  return {
    occurrenceId: occurrence.id,
    themeName: theme.name,
    themeSlug: theme.slug,
    status: booths.length ? "live" : "empty",
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
    timezone: theme.timezone || DEFAULT_TIMEZONE,
    floor,
    booths,
  };
}

function themeAdmin(row: BazaarThemeRow & { active: number }): BazaarThemeAdminView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    weekday: row.weekday,
    industryKeys: jsonArray(row.industry_keys_json),
    icon: row.icon,
    timezone: row.timezone,
    startsAtTime: row.starts_at_time,
    active: Boolean(row.active),
  };
}

export function listBazaarAdminState(options: BazaarOptions = {}): BazaarAdminState {
  const db = options.db || getDb();
  seedDefaultBazaarConfig(db);
  const current = getCurrentBazaar({ db, now: options.now });
  const themes = (db.prepare("SELECT * FROM bazaar_themes ORDER BY weekday,id").all() as Array<BazaarThemeRow & { active: number }>)
    .map(themeAdmin);
  const boothByBusinessId = new Map(current.booths.map((booth) => [booth.businessId, booth]));
  const profiles = db.prepare(`
    SELECT b.id business_id,b.name,b.handle,b.status,p.industry_keys_json,
      p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
      p.fallback_style,p.is_featured,p.is_excluded
    FROM businesses b
    LEFT JOIN bazaar_booth_profiles p ON p.business_id=b.id
    ORDER BY b.status='active' DESC,b.name,b.id
  `).all() as Array<{
    business_id: number;
    name: string;
    handle: string;
    status: string;
    industry_keys_json: string | null;
    booth_image_path: string | null;
    city: string | null;
    zone: string | null;
    region: string | null;
    latitude: number | null;
    longitude: number | null;
    fallback_style: string | null;
    is_featured: number | null;
    is_excluded: number | null;
  }>;
  return {
    current,
    themes,
    profiles: profiles.map((profile) => {
      const eligibilityIssues = [
        ...(!profile.booth_image_path?.startsWith("/") ? ["booth image"] : []),
        ...(!profile.city?.trim() ? ["city"] : []),
        ...(!profile.zone?.trim() ? ["zone"] : []),
        ...(!profile.region?.trim() ? ["region"] : []),
        ...(typeof profile.latitude !== "number" || profile.latitude < -90 || profile.latitude > 90 ? ["latitude"] : []),
        ...(typeof profile.longitude !== "number" || profile.longitude < -180 || profile.longitude > 180 ? ["longitude"] : []),
      ];
      return {
        businessId: profile.business_id,
        businessName: profile.name,
        handle: profile.handle,
        status: profile.status,
        industryKeys: jsonArray(profile.industry_keys_json),
        industryLabel: INDUSTRY_LABELS[jsonArray(profile.industry_keys_json)[0] || "community"] || "Enterprise & Export Showcase",
        boothImagePath: profile.booth_image_path || "",
        city: profile.city || "",
        zone: profile.zone || "",
        region: profile.region || "",
        latitude: profile.latitude,
        longitude: profile.longitude,
        fallbackStyle: profile.fallback_style || "market",
        featured: Boolean(profile.is_featured),
        excluded: Boolean(profile.is_excluded),
        eligible: profile.status === "active" && !profile.is_excluded && eligibilityIssues.length === 0,
        eligibilityIssues,
        booth: boothByBusinessId.get(profile.business_id) || null,
      };
    }),
  };
}

export function updateBazaarTheme(input: {
  themeId: unknown;
  name: unknown;
  industryKeys: unknown;
  timezone: unknown;
  startsAtTime: unknown;
  active: unknown;
}, db: DatabaseSync = getDb()) {
  const themeId = requireInteger(input.themeId, "Theme");
  const name = requireBoundedText(input.name, "Theme name", 100);
  const timezone = requireBoundedText(input.timezone, "Timezone", 80);
  const startsAtTime = requireBoundedText(input.startsAtTime, "Start time", 5);
  if (!/^\d{2}:\d{2}$/.test(startsAtTime)) throw new BazaarAdminError("Start time must use HH:MM.", "invalid_time");
  const industryKeys = normalizeIndustryKeys(String(input.industryKeys || ""));
  if (!industryKeys.length) throw new BazaarAdminError("At least one industry key is required.", "missing_industry");
  const result = db.prepare(`
    UPDATE bazaar_themes
    SET name=?,industry_keys_json=?,timezone=?,starts_at_time=?,active=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(name, JSON.stringify(industryKeys), timezone, startsAtTime, input.active ? 1 : 0, themeId);
  if (!result.changes) throw new BazaarAdminError("Theme not found.", "not_found");
  return { themeId, changed: result.changes };
}

export function updateBazaarBoothProfile(input: {
  businessId: unknown;
  industryKeys: unknown;
  boothImagePath: unknown;
  city?: unknown;
  zone?: unknown;
  region?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  fallbackStyle: unknown;
  featured: unknown;
  excluded: unknown;
}, db: DatabaseSync = getDb()) {
  const businessId = requireInteger(input.businessId, "Business");
  const industryKeys = normalizeIndustryKeys(String(input.industryKeys || ""));
  if (!industryKeys.length) throw new BazaarAdminError("At least one industry key is required.", "missing_industry");
  const boothImagePath = requireBoundedText(input.boothImagePath, "Booth image path", 240, false);
  if (boothImagePath && !boothImagePath.startsWith("/")) throw new BazaarAdminError("Booth image path must be a public app path.", "invalid_media_path");
  const city = requireBoundedText(input.city, "City", 100);
  const zone = requireBoundedText(input.zone, "Zone", 100);
  const region = requireBoundedText(input.region, "Region", 100);
  const latitude = requireCoordinate(input.latitude, "Latitude", -90, 90);
  const longitude = requireCoordinate(input.longitude, "Longitude", -180, 180);
  const fallbackStyle = requireBoundedText(input.fallbackStyle, "Fallback style", 40, false) || fallbackStyleForIndustry(industryKeys);
  const result = db.prepare(`
    INSERT INTO bazaar_booth_profiles(
      business_id,industry_keys_json,booth_image_path,city,zone,region,latitude,
      longitude,fallback_style,is_featured,is_excluded,approved_at,updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT(business_id) DO UPDATE SET
      industry_keys_json=excluded.industry_keys_json,
      booth_image_path=excluded.booth_image_path,
      city=excluded.city,
      zone=excluded.zone,
      region=excluded.region,
      latitude=excluded.latitude,
      longitude=excluded.longitude,
      fallback_style=excluded.fallback_style,
      is_featured=excluded.is_featured,
      is_excluded=excluded.is_excluded,
      updated_at=CURRENT_TIMESTAMP
  `).run(
    businessId,
    JSON.stringify(industryKeys),
    boothImagePath,
    city,
    zone,
    region,
    latitude,
    longitude,
    fallbackStyle,
    input.featured ? 1 : 0,
    input.excluded ? 1 : 0,
  );
  return { businessId, changed: result.changes };
}

export function updateBazaarBoothPlacement(input: {
  boothId: unknown;
  x: unknown;
  y: unknown;
  width: unknown;
  height: unknown;
}, db: DatabaseSync = getDb()) {
  const boothId = requireInteger(input.boothId, "Booth");
  const x = requireInteger(input.x, "X coordinate");
  const y = requireInteger(input.y, "Y coordinate");
  const width = requireInteger(input.width, "Width");
  const height = requireInteger(input.height, "Height");
  const booth = db.prepare("SELECT occurrence_id FROM bazaar_booths WHERE id=?").get(boothId) as { occurrence_id: number } | undefined;
  if (!booth) throw new BazaarAdminError("Booth not found.", "not_found");
  const count = (db.prepare("SELECT COUNT(*) count FROM bazaar_booths WHERE occurrence_id=? AND status='active'").get(booth.occurrence_id) as { count: number }).count;
  const floor = floorGeometry(count);
  const meetsCorridor = floor.corridors.some((corridor) => y + height === corridor.y);
  if (x < 0 || y < 0 || width < 80 || height < 60 || width > 360 || height > 240 || x + width > floor.width || y + height > floor.height || !meetsCorridor) {
    throw new BazaarAdminError("Booth coordinates must stay inside the Bazaar floor and meet a corridor edge.", "out_of_bounds");
  }
  const result = db.prepare(`
    UPDATE bazaar_booths
    SET x=?,y=?,width=?,height=?,floor_section='manual',updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(x, y, width, height, boothId);
  if (!result.changes) throw new BazaarAdminError("Booth not found.", "not_found");
  return { boothId, changed: result.changes };
}
