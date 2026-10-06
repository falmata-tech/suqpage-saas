export const PRODUCTION_SCALES = [
  { key: "workshop", label: "Workshop / producer" },
  { key: "growing_factory", label: "Growing factory" },
] as const;

export type ProductionScale = (typeof PRODUCTION_SCALES)[number]["key"];

export const DISCOVERY_INDUSTRIES = [
  { key: "electronics", label: "Electronics & electrical", shortLabel: "Electronics & electrical", icon: "circuit", code: "ELC" },
  { key: "beauty-wellness", label: "Personal care & household", shortLabel: "Personal & home care", icon: "leaf", code: "BEA" },
  { key: "agriculture-growers", label: "Farms, livestock & feed", shortLabel: "Farms, livestock & feed", icon: "sprout", code: "AGR" },
  { key: "food-farming", label: "Food & drink", shortLabel: "Food & drink", icon: "bowl", code: "FOD" },
  { key: "machinery-tools", label: "Tools, machines & metalwork", shortLabel: "Tools & metalwork", icon: "tool", code: "MCH" },
  { key: "home-living", label: "Furniture, art & building", shortLabel: "Furniture, art & building", icon: "frame", code: "HOM" },
  { key: "fashion-textiles", label: "Clothes, fabrics & leather", shortLabel: "Clothes & fabrics", icon: "thread", code: "FSH" },
] as const;

/** Public category scope: bounded, allowlisted, stable and safe for cache/SQL parameters. */
export function normalizeDiscoveryCategories(value?: string | readonly string[]): string[] {
  const parts = (typeof value === "string" ? [value] : value || []).slice(0, 32)
    .flatMap(item => item.slice(0, 1024).split(",").map(key => key.trim()));
  const requested = new Set(parts);
  return DISCOVERY_INDUSTRIES.filter(category => requested.has(category.key)).map(category => category.key);
}

export function discoveryCategoryKey(value?: string | readonly string[]): string {
  return normalizeDiscoveryCategories(value).join(",") || "all";
}

/** Canonical URL/cache scope; selected options are resolved against public geography. */
export function normalizeDiscoveryPlaces(value?: string | readonly string[]): string[] {
  return [...new Set((typeof value === "string" ? [value] : value || []).slice(0, 32)
    .flatMap(item => item.slice(0, 3000).split("|"))
    .map(key => key.trim()).filter(key => /^(city|region):/.test(key) && key.length <= 180))]
    .sort().slice(0, 16);
}
export function discoveryPlaceKey(value?: string | readonly string[]): string {
  return normalizeDiscoveryPlaces(value).join("|");
}
