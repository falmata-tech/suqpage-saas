export const PRODUCTION_SCALES = [
  { key: "workshop", label: "Workshop / producer" },
  { key: "growing_factory", label: "Growing factory" },
] as const;

export type ProductionScale = (typeof PRODUCTION_SCALES)[number]["key"];
