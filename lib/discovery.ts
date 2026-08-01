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

export type DailyIndustryExpo = {
  title: string;
  industryCode: string;
  hallCount: number;
  booths: ExpoBooth[];
};

export type DiscoveryView = {
  industry: DiscoveryIndustry;
  industries: readonly DiscoveryIndustry[];
  query: string;
  total: number;
  featuredCount: number;
  locationCount: number;
  suqs: DiscoverySuq[];
  expo: DailyIndustryExpo;
};

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
    WHERE i.industry_key=?
      AND b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
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
    industry.key, query,
    search, search, search, search, search, search, search, search,
  ) as DiscoveryRow[];

  const suqs = rows.map((row): DiscoverySuq => ({
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
  }));
  const booths = suqs.map((suq, index): ExpoBooth => {
    const hall = Math.floor(index / 12) + 1;
    const booth = index % 12 + 1;
    return {
      ...suq,
      hall,
      booth,
      reference: `${industry.code}-H${hall}-B${String(booth).padStart(2, "0")}`,
    };
  });

  return {
    industry,
    industries: DISCOVERY_INDUSTRIES,
    query,
    total: suqs.length,
    featuredCount: suqs.filter((suq) => suq.featured).length,
    locationCount: new Set(suqs.map((suq) => `${suq.city}\u0000${suq.region}`)).size,
    suqs,
    expo: {
      title: `${industry.label} Expo`,
      industryCode: industry.code,
      hallCount: Math.max(1, Math.ceil(booths.length / 12)),
      booths,
    },
  };
}
