import type { DatabaseSync } from "node:sqlite";
import { getCurrentBazaar } from "./bazaar";
import { getDb } from "./db";
import { EXPO_HOST_CITIES, type ExpoHostCity } from "./expo-hosts";

const MIN_HUB_BUSINESSES = 2;
const MAX_BOOTHS_PER_HALL = 12;

type ExpoOptions = {
  db?: DatabaseSync;
  now?: Date;
};

export type ExpoCandidate = {
  businessId: number;
  name: string;
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
  featured: boolean;
};

export type ExpoHubAssignment = {
  businessId: number;
  originZone: string;
  originRegion: string;
  hubKey: string;
  hubName: string;
  hubCity: string;
  hubZone: string;
  hubRegion: string;
  hubLatitude: number;
  hubLongitude: number;
  hallNumber: number;
  boothNumber: number;
};

export type ExpoHubView = {
  key: string;
  name: string;
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
  boothCount: number;
  hallCount: number;
  representedZones: string[];
  representedRegions: string[];
};

export type ExpoBoothView = {
  id: number;
  businessId: number;
  handle: string;
  name: string;
  title: string;
  description: string;
  industryLabel: string;
  imageUrl: string;
  fallbackToken: string;
  city: string;
  zone: string;
  region: string;
  latitude: number;
  longitude: number;
  hubCity: string;
  hubKey: string;
  hubName: string;
  hallNumber: number;
  boothNumber: number;
  boothReference: string;
  featured: boolean;
};

export type CurrentExpoView = {
  occurrenceId: number | null;
  themeName: string;
  themeSlug: string;
  status: "live" | "empty" | "unavailable";
  startsAt: string;
  endsAt: string;
  timezone: string;
  map: {
    countryCode: "ETH";
    hubs: ExpoHubView[];
    totalBoothCount: number;
  };
  booths: ExpoBoothView[];
};

type ExpoRow = {
  booth_id: number;
  business_id: number;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  hero_title: string;
  hero_subtitle: string;
  booth_image_path: string | null;
  fallback_style: string | null;
  industry_keys_json: string | null;
  city: string | null;
  zone: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  featured: number;
  is_featured: number | null;
  is_excluded: number | null;
  approved_at: string | null;
};

const industryLabels: Record<string, string> = {
  electronics: "Electronics & Appliances",
  "beauty-wellness": "Beauty, Wellness & Natural Medicine",
  "food-farming": "Produce, Farming & Food",
  "machinery-tools": "Manufacturing, Tools & Production Inputs",
  "home-living": "Home, Furniture & Living",
  "fashion-textiles": "Fashion, Textiles & Accessories",
  community: "Enterprise & Export Showcase",
};

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseKeys(value: string | null) {
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

function isCoordinate(value: number | null, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function radians(value: number) {
  return (value * Math.PI) / 180;
}

export function geographicDistanceKm(
  left: Pick<ExpoCandidate, "latitude" | "longitude">,
  right: Pick<ExpoCandidate, "latitude" | "longitude">,
) {
  const latitudeDelta = radians(right.latitude - left.latitude);
  const longitudeDelta = radians(right.longitude - left.longitude);
  const leftLatitude = radians(left.latitude);
  const rightLatitude = radians(right.latitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(leftLatitude) *
      Math.cos(rightLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestHost(
  candidate: Pick<ExpoCandidate, "zone" | "latitude" | "longitude">,
  hosts = EXPO_HOST_CITIES,
) {
  const sameZone = hosts.filter(
    (host) => normalizeKey(host.zone) === normalizeKey(candidate.zone),
  );
  return [...(sameZone.length ? sameZone : hosts)].sort(
    (left, right) =>
      geographicDistanceKm(candidate, left) -
        geographicDistanceKm(candidate, right) ||
      left.key.localeCompare(right.key),
  )[0];
}

function groupCandidatesByHost(candidates: ExpoCandidate[]) {
  const groups = new Map<string, { host: ExpoHostCity; businesses: ExpoCandidate[] }>();
  for (const candidate of candidates) {
    const host = nearestHost(candidate);
    const group = groups.get(host.key) || { host, businesses: [] };
    group.businesses.push(candidate);
    groups.set(host.key, group);
  }
  return [...groups.values()]
    .map(({ host, businesses }) => {
      const ordered = businesses.sort(
        (left, right) => left.name.localeCompare(right.name) || left.businessId - right.businessId,
      );
      return { ...host, businesses: ordered };
    })
    .sort((left, right) => left.key.localeCompare(right.key));
}

export function assignExpoHubs(candidates: ExpoCandidate[]): ExpoHubAssignment[] {
  const groups = groupCandidatesByHost(candidates);
  if (!groups.length) return [];

  let hostGroups = groups.filter((group) => group.businesses.length >= MIN_HUB_BUSINESSES);
  if (!hostGroups.length) {
    hostGroups = [
      [...groups].sort(
        (left, right) =>
          right.businesses.length - left.businesses.length ||
          left.key.localeCompare(right.key),
      )[0],
    ];
  }

  const assignmentsByHub = new Map<string, ExpoCandidate[]>(
    hostGroups.map((group) => [group.key, []]),
  );
  for (const group of groups) {
    const host = hostGroups.find((candidate) => candidate.key === group.key) ||
      [...hostGroups].sort((left, right) => {
        const leftDistance = geographicDistanceKm(group, left);
        const rightDistance = geographicDistanceKm(group, right);
        return leftDistance - rightDistance || left.key.localeCompare(right.key);
      })[0];
    assignmentsByHub.get(host.key)?.push(...group.businesses);
  }

  return [...hostGroups]
    .sort((left, right) => left.key.localeCompare(right.key))
    .flatMap((host) =>
      [...(assignmentsByHub.get(host.key) || [])]
        .sort(
          (left, right) =>
            Number(right.featured) - Number(left.featured) ||
            left.name.localeCompare(right.name) ||
            left.businessId - right.businessId,
        )
        .map((business, index) => ({
          businessId: business.businessId,
          originZone: business.zone,
          originRegion: business.region,
          hubKey: host.key,
          hubName: `${host.city} Expo`,
          hubCity: host.city,
          hubZone: host.zone,
          hubRegion: host.region,
          hubLatitude: host.latitude,
          hubLongitude: host.longitude,
          hallNumber: Math.floor(index / MAX_BOOTHS_PER_HALL) + 1,
          boothNumber: (index % MAX_BOOTHS_PER_HALL) + 1,
        })),
    );
}

function eligibleRows(db: DatabaseSync, occurrenceId: number) {
  const rows = db.prepare(`
    SELECT bb.id booth_id,bb.business_id,bb.featured,b.handle,b.name,b.tagline,
      b.description,b.hero_title,b.hero_subtitle,p.booth_image_path,
      p.fallback_style,p.industry_keys_json,p.city,p.zone,p.region,p.latitude,p.longitude,
      p.is_featured,p.is_excluded,p.approved_at
    FROM bazaar_booths bb
    JOIN businesses b ON b.id=bb.business_id
    JOIN bazaar_booth_profiles p ON p.business_id=b.id
    WHERE bb.occurrence_id=? AND bb.status='active' AND b.status='active'
    ORDER BY bb.featured DESC,b.name,b.id
  `).all(occurrenceId) as ExpoRow[];

  return rows.filter(
    (row) =>
      !row.is_excluded &&
      Boolean(row.approved_at) &&
      Boolean(row.booth_image_path?.startsWith("/")) &&
      Boolean(row.city?.trim()) &&
      Boolean(row.zone?.trim()) &&
      Boolean(row.region?.trim()) &&
      isCoordinate(row.latitude, -90, 90) &&
      isCoordinate(row.longitude, -180, 180),
  );
}

function ensureHubAssignments(
  db: DatabaseSync,
  occurrenceId: number,
  rows: ExpoRow[],
) {
  const candidates: ExpoCandidate[] = rows.map((row) => ({
    businessId: row.business_id,
    name: row.name,
    city: row.city!.trim(),
    zone: row.zone!.trim(),
    region: row.region!.trim(),
    latitude: row.latitude!,
    longitude: row.longitude!,
    featured: Boolean(row.featured || row.is_featured),
  }));
  const computed = assignExpoHubs(candidates);
  const insert = db.prepare(`
    INSERT INTO expo_hub_assignments(
      occurrence_id,business_id,origin_zone,origin_region,hub_key,hub_name,
      hub_city,hub_zone,hub_region,hub_latitude,hub_longitude,hall_number,
      booth_number
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(occurrence_id,business_id) DO UPDATE SET
      origin_zone=excluded.origin_zone,
      origin_region=excluded.origin_region,
      hub_key=excluded.hub_key,
      hub_name=excluded.hub_name,
      hub_city=excluded.hub_city,
      hub_zone=excluded.hub_zone,
      hub_region=excluded.hub_region,
      hub_latitude=excluded.hub_latitude,
      hub_longitude=excluded.hub_longitude,
      hall_number=excluded.hall_number,
      booth_number=excluded.booth_number
    WHERE expo_hub_assignments.origin_zone=''
      OR expo_hub_assignments.hub_zone=''
      OR expo_hub_assignments.hub_region=''
  `);
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const assignment of computed) {
      insert.run(
        occurrenceId,
        assignment.businessId,
        assignment.originZone,
        assignment.originRegion,
        assignment.hubKey,
        assignment.hubName,
        assignment.hubCity,
        assignment.hubZone,
        assignment.hubRegion,
        assignment.hubLatitude,
        assignment.hubLongitude,
        assignment.hallNumber,
        assignment.boothNumber,
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getCurrentExpo(options: ExpoOptions = {}): CurrentExpoView {
  const db = options.db || getDb();
  const base = getCurrentBazaar({ db, now: options.now });
  if (!base.occurrenceId) {
    return {
      occurrenceId: null,
      themeName: "Daily Expo",
      themeSlug: "unavailable",
      status: "unavailable",
      startsAt: "",
      endsAt: "",
      timezone: base.timezone,
      map: { countryCode: "ETH", hubs: [], totalBoothCount: 0 },
      booths: [],
    };
  }

  const rows = eligibleRows(db, base.occurrenceId);
  ensureHubAssignments(db, base.occurrenceId, rows);
  const rowByBusiness = new Map(rows.map((row) => [row.business_id, row]));
  const assignmentRows = db.prepare(`
    SELECT * FROM expo_hub_assignments
    WHERE occurrence_id=?
    ORDER BY hub_key,hall_number,booth_number,business_id
  `).all(base.occurrenceId) as Array<{
    business_id: number;
    hub_key: string;
    hub_name: string;
    hub_city: string;
    hub_zone: string;
    hub_region: string;
    hub_latitude: number;
    hub_longitude: number;
    hall_number: number;
    booth_number: number;
  }>;
  const hubOrdinals = new Map(
    [...new Set(assignmentRows.map((row) => row.hub_key))]
      .map((hubKey, index) => [hubKey, index + 1]),
  );

  const booths = assignmentRows.flatMap((assignment): ExpoBoothView[] => {
    const row = rowByBusiness.get(assignment.business_id);
    if (!row) return [];
    const keys = parseKeys(row.industry_keys_json);
    const primaryKey = keys[0] || "community";
    return [{
      id: row.booth_id,
      businessId: row.business_id,
      handle: row.handle,
      name: row.name,
      title: row.hero_title || row.tagline || row.name,
      description:
        row.hero_subtitle ||
        row.tagline ||
        row.description ||
        "Explore this showroom and send a structured inquiry.",
      industryLabel: industryLabels[primaryKey] || "Enterprise & Export Showcase",
      imageUrl: row.booth_image_path || "",
      fallbackToken: row.fallback_style || "expo",
      city: row.city!.trim(),
      zone: row.zone!.trim(),
      region: row.region!.trim(),
      latitude: row.latitude!,
      longitude: row.longitude!,
      hubCity: assignment.hub_city,
      hubKey: assignment.hub_key,
      hubName: assignment.hub_name,
      hallNumber: assignment.hall_number,
      boothNumber: assignment.booth_number,
      boothReference: `H${hubOrdinals.get(assignment.hub_key)}.${assignment.hall_number}-B${String(assignment.booth_number).padStart(2, "0")}`,
      featured: Boolean(row.featured || row.is_featured),
    }];
  });

  const hubs = [...new Set(booths.map((booth) => booth.hubKey))].map((hubKey) => {
    const assigned = booths.filter((booth) => booth.hubKey === hubKey);
    const assignment = assignmentRows.find((row) => row.hub_key === hubKey)!;
    return {
      key: hubKey,
      name: assignment.hub_name,
      city: assignment.hub_city,
      zone: assignment.hub_zone,
      region: assignment.hub_region,
      latitude: assignment.hub_latitude,
      longitude: assignment.hub_longitude,
      boothCount: assigned.length,
      hallCount: Math.max(...assigned.map((booth) => booth.hallNumber)),
      representedZones: [...new Set(assigned.map((booth) => booth.zone))].sort(),
      representedRegions: [...new Set(assigned.map((booth) => booth.region))].sort(),
    };
  });

  return {
    occurrenceId: base.occurrenceId,
    themeName: base.themeName.replace(/Market/g, "Expo"),
    themeSlug: base.themeSlug,
    status: booths.length ? "live" : "empty",
    startsAt: base.startsAt,
    endsAt: base.endsAt,
    timezone: base.timezone,
    map: {
      countryCode: "ETH",
      hubs,
      totalBoothCount: booths.length,
    },
    booths,
  };
}

export function regenerateCurrentExpo(options: ExpoOptions = {}) {
  const db = options.db || getDb();
  const base = getCurrentBazaar({ db, now: options.now });
  if (base.occurrenceId) {
    db.prepare("DELETE FROM expo_hub_assignments WHERE occurrence_id=?")
      .run(base.occurrenceId);
  }
  return getCurrentExpo({ db, now: options.now });
}
