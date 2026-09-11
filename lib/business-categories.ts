export const BUSINESS_CATEGORY_OPTIONS = [
  { key: "electronics", label: "Electronics & electrical" },
  { key: "beauty-wellness", label: "Personal care & household" },
  { key: "agriculture-growers", label: "Farms, livestock & feed" },
  { key: "food-farming", label: "Food & drink" },
  { key: "machinery-tools", label: "Tools, machinery & metalwork" },
  { key: "home-living", label: "Furniture, art & building" },
  { key: "fashion-textiles", label: "Clothing, textiles & leather" },
  { key: "other-manufacturing", label: "Other locally made goods" },
] as const;

export type BusinessCategoryKey = (typeof BUSINESS_CATEGORY_OPTIONS)[number]["key"];

const categoryKeys = new Set<string>(BUSINESS_CATEGORY_OPTIONS.map((option) => option.key));

export function isBusinessCategoryKey(value: string): value is BusinessCategoryKey {
  return categoryKeys.has(value);
}
