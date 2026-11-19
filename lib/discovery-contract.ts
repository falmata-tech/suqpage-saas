export const PRODUCTION_SCALES = [
  { key: "workshop", label: "Workshop / supplier" },
  { key: "growing_factory", label: "Growing factory" },
] as const;

export type ProductionScale = (typeof PRODUCTION_SCALES)[number]["key"];

export const DISCOVERY_INDUSTRIES = [
  { key: "electronics", label: "Technology & energy", shortLabel: "Technology & energy", icon: "circuit", code: "ELC" },
  { key: "beauty-wellness", label: "Health, beauty & household care", shortLabel: "Health, beauty & household care", icon: "leaf", code: "BEA" },
  { key: "agriculture-growers", label: "Agriculture & natural resources", shortLabel: "Agriculture & natural resources", icon: "sprout", code: "AGR" },
  { key: "food-farming", label: "Food, drink & fresh produce", shortLabel: "Food, drink & fresh produce", icon: "bowl", code: "FOD" },
  { key: "machinery-tools", label: "Industry, tools & transport", shortLabel: "Industry, tools & transport", icon: "tool", code: "MCH" },
  { key: "home-living", label: "Home, construction & leisure", shortLabel: "Home, construction & leisure", icon: "frame", code: "HOM" },
  { key: "fashion-textiles", label: "Fashion, textiles & accessories", shortLabel: "Fashion, textiles & accessories", icon: "thread", code: "FSH" },
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

/** Presentation only: retain literal geography and the caller's field priority. */
export function discoveryLocationLabel(parts: readonly string[]): string {
  const seen = new Set<string>();
  return parts.map(part => part.trim()).filter(part => {
    const key = part.normalize('NFC').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join(' · ');
}
