export const offeringKinds = [
  "standard_product",
  "service",
  "made_to_order",
  "manufacturing_capability",
  "production_supply",
] as const;

export const quantityModes = ["required", "optional"] as const;

export type OfferingKind = (typeof offeringKinds)[number];
export type QuantityMode = (typeof quantityModes)[number];

export const offeringKindLabels: Record<OfferingKind, string> = {
  standard_product: "Standard product",
  service: "Service",
  made_to_order: "Made to order",
  manufacturing_capability: "Manufacturing capability",
  production_supply: "Production supply",
};

export const offeringKindDescriptions: Record<OfferingKind, string> = {
  standard_product: "A defined item a customer can request in a desired quantity.",
  service: "Work, expertise or assistance a customer can inquire about.",
  made_to_order: "A defined product made after specifications and quantity are agreed.",
  manufacturing_capability: "Something this business can repeatedly manufacture or fabricate.",
  production_supply: "A crop, material, ingredient, or production output supplied by cycle or batch.",
};

export function availabilityLabel(
  kind: OfferingKind,
  availability: "available" | "limited" | "unavailable" | "coming_soon",
) {
  if (kind === "service") {
    return { available: "Accepting inquiries", limited: "Limited availability", unavailable: "Not currently available", coming_soon: "Coming soon" }[availability];
  }
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

export function offeringNoun(kind: OfferingKind): "service" | "product" {
  return kind === "service" ? "service" : "product";
}

export function catalogOfferingLabel(items: readonly { offering_kind: OfferingKind }[]): string {
  const services = items.some(item => item.offering_kind === "service");
  return services ? items.some(item => item.offering_kind !== "service") ? "Products & services" : "Services" : "Products";
}

export function normalizeOfferingKind(value: unknown): OfferingKind {
  return offeringKinds.includes(value as OfferingKind)
    ? (value as OfferingKind)
    : "standard_product";
}

export function normalizeQuantityMode(_value: unknown): QuantityMode {
  // Retained "required" values remain readable but current behavior is optional.
  return "optional";
}
