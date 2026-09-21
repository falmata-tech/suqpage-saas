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
