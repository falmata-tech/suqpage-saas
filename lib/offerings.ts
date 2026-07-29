export const offeringKinds = [
  "standard_product",
  "made_to_order",
  "manufacturing_capability",
  "production_supply",
] as const;

export const quantityModes = ["required", "optional"] as const;

export type OfferingKind = (typeof offeringKinds)[number];
export type QuantityMode = (typeof quantityModes)[number];

export const offeringKindLabels: Record<OfferingKind, string> = {
  standard_product: "Standard product",
  made_to_order: "Made to order",
  manufacturing_capability: "Manufacturing capability",
  production_supply: "Production supply",
};

export const offeringKindDescriptions: Record<OfferingKind, string> = {
  standard_product: "A defined item a customer can request in a desired quantity.",
  made_to_order: "A defined product made after specifications and quantity are agreed.",
  manufacturing_capability: "Something this business can repeatedly manufacture or fabricate.",
  production_supply: "A crop, material, ingredient, or production output supplied by cycle or batch.",
};

export function availabilityLabel(
  kind: OfferingKind,
  availability: "available" | "limited" | "unavailable" | "coming_soon",
) {
  if (kind === "standard_product") {
    return {
      available: "Available",
      limited: "Limited availability",
      unavailable: "Unavailable",
      coming_soon: "Coming soon",
    }[availability];
  }
  if (kind === "production_supply") {
    return {
      available: "Available for inquiry",
      limited: "Seasonal or limited",
      unavailable: "Not currently available",
      coming_soon: "Upcoming supply",
    }[availability];
  }
  return {
    available: "Accepting inquiries",
    limited: "Limited capacity",
    unavailable: "Not accepting inquiries",
    coming_soon: "Planned capability",
  }[availability];
}

export function normalizeOfferingKind(value: unknown): OfferingKind {
  return offeringKinds.includes(value as OfferingKind)
    ? (value as OfferingKind)
    : "standard_product";
}

export function normalizeQuantityMode(value: unknown): QuantityMode {
  return quantityModes.includes(value as QuantityMode)
    ? (value as QuantityMode)
    : "required";
}
