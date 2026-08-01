import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./db";
import { DISCOVERY_HOSTS, type DiscoveryHost } from "./discovery-hosts";

export const DISCOVERY_INDUSTRIES = [
  { key: "electronics", label: "Electronics & devices", icon: "circuit" },
  { key: "beauty-wellness", label: "Beauty & body care", icon: "leaf" },
  { key: "food-farming", label: "Food, farms & ingredients", icon: "sprout" },
  { key: "machinery-tools", label: "Metalwork, tools & equipment", icon: "tool" },
  { key: "home-living", label: "Furniture, home & craft", icon: "home" },
  { key: "fashion-textiles", label: "Clothing, textiles & leather", icon: "thread" },
] as const;

export type DiscoveryIndustry = (typeof DISCOVERY_INDUSTRIES)[number];

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

export type DiscoveryBooth = {
  id: number;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  imagePath: string;
  originCity: string;
  originZone: string;
  originRegion: string;
  fallbackStyle: string;
  featured: boolean;
  hostKey: string;
  hall: number;
  booth: number;
  reference: string;
};

export type CitySuq = DiscoveryHost & {
  localCount: number;
  boothCount: number;
  hallCount: number;
};

export type DiscoveryView = {
  industry: DiscoveryIndustry;
  industries: readonly DiscoveryIndustry[];
  query: string;
  total: number;
  featuredCount: number;
  hosts: CitySuq[];
  booths: DiscoveryBooth[];
};

function distanceKm(a: { latitude: number; longitude: number }, b: DiscoveryHost) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const chord = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

function nearestHost(row: DiscoveryRow, candidates = DISCOVERY_HOSTS) {
  return [...candidates].sort((left, right) => distanceKm(row, left) - distanceKm(row, right))[0];
}

function allocateHosts(rows: DiscoveryRow[]) {
  const local = new Map<string, DiscoveryRow[]>();
  for (const row of rows) {
    const host = nearestHost(row);
    local.set(host.key, [...(local.get(host.key) || []), row]);
  }
  let qualified = DISCOVERY_HOSTS.filter((host) => (local.get(host.key)?.length || 0) >= 3);
  if (!qualified.length && rows.length) {
    const largest = [...DISCOVERY_HOSTS].sort(
      (left, right) => (local.get(right.key)?.length || 0) - (local.get(left.key)?.length || 0),
    )[0];
    qualified = [largest];
  }
  const assigned = new Map<string, DiscoveryRow[]>();
  for (const row of rows) {
    const host = nearestHost(row, qualified);
    assigned.set(host.key, [...(assigned.get(host.key) || []), row]);
  }
  return { local, assigned, qualified };
}

function normalizeIndustry(key: string | undefined) {
  return DISCOVERY_INDUSTRIES.find((industry) => industry.key === key) || DISCOVERY_INDUSTRIES[0];
}

export function getDiscoveryView(
  options: { industry?: string; q?: string; db?: DatabaseSync } = {},
): DiscoveryView {
  const db = options.db || getDb();
  const industry = normalizeIndustry(options.industry);
  const query = (options.q || "").trim().slice(0, 80);
  const search = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const rows = db.prepare(`
    SELECT
      b.id,b.handle,b.name,b.tagline,b.description,b.hero_image_path,
      p.booth_image_path,p.city,p.zone,p.region,p.latitude,p.longitude,
      p.fallback_style,p.is_featured
    FROM business_industries i
    JOIN businesses b ON b.id=i.business_id
    JOIN business_discovery_profiles p ON p.business_id=b.id
    JOIN business_subscriptions s ON s.business_id=b.id
    WHERE i.industry_key=?
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND s.grace_ends_at > ?
      AND EXISTS(SELECT 1 FROM products product WHERE product.business_id=b.id AND product.is_published=1)
      AND (
        ?='' OR b.name LIKE ? ESCAPE '\\' OR b.tagline LIKE ? ESCAPE '\\'
        OR b.description LIKE ? ESCAPE '\\' OR p.city LIKE ? ESCAPE '\\'
        OR p.zone LIKE ? ESCAPE '\\' OR p.region LIKE ? ESCAPE '\\'
        OR EXISTS(
          SELECT 1 FROM products product
          WHERE product.business_id=b.id AND product.is_published=1
            AND (product.name LIKE ? ESCAPE '\\' OR product.description LIKE ? ESCAPE '\\')
        )
      )
    ORDER BY p.is_featured DESC,b.name COLLATE NOCASE,b.id
  `).all(
    industry.key, Date.now(), query,
    search, search, search, search, search, search, search, search,
  ) as DiscoveryRow[];
  const { local, assigned, qualified } = allocateHosts(rows);
  const booths: DiscoveryBooth[] = [];
  const hosts = qualified.map((host) => {
    const members = assigned.get(host.key) || [];
    members.forEach((row, index) => {
      const hall = Math.floor(index / 12) + 1;
      const booth = index % 12 + 1;
      booths.push({
        id: row.id,
        handle: row.handle,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        imagePath: row.booth_image_path || row.hero_image_path,
        originCity: row.city,
        originZone: row.zone,
        originRegion: row.region,
        fallbackStyle: row.fallback_style,
        featured: Boolean(row.is_featured),
        hostKey: host.key,
        hall,
        booth,
        reference: `${host.code}-${hall}-B${String(booth).padStart(2, "0")}`,
      });
    });
    return {
      ...host,
      localCount: local.get(host.key)?.length || 0,
      boothCount: members.length,
      hallCount: Math.ceil(members.length / 12),
    };
  }).sort((left, right) => right.boothCount - left.boothCount || left.city.localeCompare(right.city));
  return {
    industry,
    industries: DISCOVERY_INDUSTRIES,
    query,
    total: booths.length,
    featuredCount: booths.filter((booth) => booth.featured).length,
    hosts,
    booths,
  };
}
