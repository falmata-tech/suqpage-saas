export const PRODUCT_DETAIL_PATTERNS = [
  "editorial",
  "technical",
  "product_stage",
  "compact",
] as const;

export type ProductDetailPattern = (typeof PRODUCT_DETAIL_PATTERNS)[number];

export type ProductDetailPatternDefinition = {
  id: ProductDetailPattern;
  name: string;
  description: string;
  layout: string;
  density: "compact" | "balanced" | "spacious";
  mediaBehavior: string;
  contentFit: string;
};

export const PRODUCT_DETAIL_PATTERN_DEFINITIONS: readonly ProductDetailPatternDefinition[] = Object.freeze([
  {
    id: "editorial",
    name: "Editorial detail",
    description: "Calm asymmetric reading layout with generous product story space.",
    layout: "Wide split composition with narrative copy and a restrained fact rail.",
    density: "spacious",
    mediaBehavior: "Borderless portrait-or-landscape media fades into the token surface.",
    contentFit: "Best when material, provenance, or craft explanation matters.",
  },
  {
    id: "technical",
    name: "Technical detail",
    description: "Specification-forward layout with compact facts and clear scanning order.",
    layout: "Structured two-column sheet with grouped operating and production facts.",
    density: "compact",
    mediaBehavior: "Contained technical media stage with stable aspect ratio.",
    contentFit: "Best for equipment, capabilities, configurable builds, and detailed requirements.",
  },
  {
    id: "product_stage",
    name: "Product stage",
    description: "Media-led presentation with concise copy and prominent highlights.",
    layout: "Large visual plane beside a focused purchase-inquiry column.",
    density: "balanced",
    mediaBehavior: "Image or video receives the strongest visual weight without a picture-frame border.",
    contentFit: "Best when the offering is visually distinctive and facts are concise.",
  },
  {
    id: "compact",
    name: "Compact detail",
    description: "Efficient low-height presentation for dense catalogs and smaller screens.",
    layout: "Compact responsive sheet with facts and actions kept close to the title.",
    density: "compact",
    mediaBehavior: "Small stable media pane collapses cleanly when media is absent.",
    contentFit: "Best for broad catalogs, repeat products, and short descriptions.",
  },
]);

export function normalizeProductDetailPattern(value: unknown): ProductDetailPattern {
  return PRODUCT_DETAIL_PATTERNS.includes(value as ProductDetailPattern)
    ? (value as ProductDetailPattern)
    : "editorial";
}
