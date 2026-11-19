import { DISCOVERY_INDUSTRIES } from './discovery-contract';

export const BUSINESS_CATEGORY_OPTIONS = [
  ...DISCOVERY_INDUSTRIES,
  { key: "other-manufacturing", label: "Other products" },
] as const;

export type BusinessCategoryKey = (typeof BUSINESS_CATEGORY_OPTIONS)[number]["key"];

const categoryKeys = new Set<string>(BUSINESS_CATEGORY_OPTIONS.map((option) => option.key));

export function isBusinessCategoryKey(value: string): value is BusinessCategoryKey {
  return categoryKeys.has(value);
}
