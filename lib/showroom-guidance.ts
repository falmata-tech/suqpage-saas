import type { RevisionSnapshotV4 } from "./revision-v4-domain";
import type { ShowroomComponentDefinitionV2 } from "./showroom-composition-v2";
import type { HeroMediaIntegration } from "./showroom-design-systems";
import { defaultMediaIntegrationForSection } from "./showroom-composition-v2";

export type ShowroomArchetype =
  | "artisan"
  | "farm"
  | "natural_beauty"
  | "furniture"
  | "manufacturer"
  | "food_producer"
  | "textile_atelier"
  | "service_product_hybrid";

export type ShowroomCatalogMode = "inquiry" | "retail" | "wholesale" | "rfq";
export type NoMediaFallback =
  | "hide"
  | "category_icon"
  | "abstract_texture"
  | "silhouette"
  | "compact_text";

export type ComponentGuidance = {
  supportsNoMedia: boolean;
  requiresMedia: boolean;
  noMediaFallbacks: NoMediaFallback[];
  recommendedProductCount: { min: number; max: number } | null;
  recommendedCategoryCount: { min: number; max: number } | null;
  catalogModes: ShowroomCatalogMode[];
  businessArchetypes: ShowroomArchetype[];
  styleFamilies: string[];
  supportsRtl: boolean;
  supportsLongTitles: boolean;
  mobileBehavior: "stack" | "horizontal_scroll" | "compact_list" | "fixed";
  heroMediaIntegration: HeroMediaIntegration | null;
  fallbackComponent: string | null;
};

export type ShowroomTemplate = {
  id: string;
  name: string;
  archetypes: ShowroomArchetype[];
  catalogModes: ShowroomCatalogMode[];
  tokenPack: string;
  components: string[];
};

export type FitnessIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  sectionKey?: string;
};

export type CompositionFitness = {
  score: number;
  allowed: boolean;
  issues: FitnessIssue[];
};

export const SHOWROOM_TEMPLATES: readonly ShowroomTemplate[] = Object.freeze([
  {
    id: "maker-workshop",
    name: "Maker workshop",
    archetypes: ["artisan", "service_product_hybrid"],
    catalogModes: ["inquiry", "retail"],
    tokenPack: "paper-gallery",
    components: [
      "header.editorial-wordmark@1", "hero.material-detail@1",
      "navigation.collection-rail@1", "content.process-steps@1",
      "catalog.editorial-grid@1", "trust.material-passport@1",
      "call-to-action.consultation@1", "footer.editorial@1",
    ],
  },
  {
    id: "seasonal-farm",
    name: "Seasonal farm",
    archetypes: ["farm", "food_producer"],
    catalogModes: ["inquiry", "wholesale"],
    tokenPack: "harvest-earth",
    components: [
      "header.producer-badge@1", "hero.provenance@1",
      "navigation.collection-rail@1", "content.origin-story@1",
      "catalog.horizontal-shelf@1", "trust.provenance-panel@1",
      "call-to-action.wholesale@1", "footer.contact-panel@1",
    ],
  },
  {
    id: "botanical-ritual",
    name: "Botanical ritual",
    archetypes: ["natural_beauty"],
    catalogModes: ["inquiry", "retail", "wholesale"],
    tokenPack: "cosmetic-laboratory",
    components: [
      "header.floating-capsule@1", "hero.ingredient-monograph@1",
      "navigation.visual-chapters@1", "content.ritual-steps@1",
      "catalog.beauty-swatch@1", "trust.ingredient-ledger@1",
      "call-to-action.sample-question@1", "footer.magazine-masthead@1",
    ],
  },
  {
    id: "furniture-studio",
    name: "Furniture studio",
    archetypes: ["furniture", "artisan"],
    catalogModes: ["inquiry", "retail"],
    tokenPack: "paper-gallery",
    components: [
      "header.editorial-wordmark@1", "hero.room-scene@1",
      "navigation.visual-chapters@1", "content.material-focus@1",
      "catalog.room-set@1", "trust.care-guide@1",
      "call-to-action.consultation@1", "footer.editorial@1",
    ],
  },
  {
    id: "industrial-rfq",
    name: "Industrial RFQ",
    archetypes: ["manufacturer"],
    catalogModes: ["rfq", "wholesale", "inquiry"],
    tokenPack: "industrial-steel",
    components: [
      "header.technical-marquee@1", "hero.industrial-spec@1",
      "navigation.catalog-index@1", "content.production-metrics@1",
      "catalog.dense-wholesale@1", "trust.specification-matrix@1",
      "call-to-action.technical-brief@1", "footer.technical-directory@1",
    ],
  },
  {
    id: "food-provenance",
    name: "Food provenance",
    archetypes: ["food_producer", "farm"],
    catalogModes: ["inquiry", "retail", "wholesale"],
    tokenPack: "artisan-clay",
    components: [
      "header.producer-badge@1", "hero.ingredient-monograph@1",
      "navigation.material-index@1", "content.origin-story@1",
      "catalog.collection-led@1", "trust.provenance-panel@1",
      "call-to-action.wholesale@1", "footer.contact-panel@1",
    ],
  },
  {
    id: "textile-atelier",
    name: "Textile atelier",
    archetypes: ["textile_atelier", "artisan"],
    catalogModes: ["inquiry", "retail", "wholesale"],
    tokenPack: "silk-atelier",
    components: [
      "header.transparent-overlay@1", "hero.textile-swatch@1",
      "navigation.material-index@1", "content.swatch-story@1",
      "catalog.textile-stack@1", "trust.material-passport@1",
      "call-to-action.magazine-close@1", "footer.magazine-masthead@1",
    ],
  },
  {
    id: "service-product",
    name: "Service and product",
    archetypes: ["service_product_hybrid", "manufacturer"],
    catalogModes: ["inquiry", "rfq"],
    tokenPack: "technology-mono",
    components: [
      "header.compact-utility@1", "hero.split-story@1",
      "navigation.minimal-tabs@1", "content.process-steps@1",
      "catalog.minimal-list@1", "trust.business-principles@1",
      "call-to-action.consultation@1", "footer.compact@1",
    ],
  },
]);

const ALL_ARCHETYPES: ShowroomArchetype[] = [
  "artisan", "farm", "natural_beauty", "furniture", "manufacturer",
  "food_producer", "textile_atelier", "service_product_hybrid",
];

export function heroMediaIntegrationForComponent(
  componentId: string,
): HeroMediaIntegration | null {
  if (!componentId.startsWith("hero.")) return null;
  return defaultMediaIntegrationForSection("hero", componentId);
}

export function guidanceForComponent(
  component: ShowroomComponentDefinitionV2,
): ComponentGuidance {
  const id = component.id;
  const isCatalog = component.slot === "catalog";
  const dense = /dense-wholesale|technology-spec/.test(id);
  const rail = /horizontal|collection-led|room-set|textile-stack/.test(id);
  const mediaRequired = component.contentMediaSlots.some((slot) => slot.required);
  const heroMediaIntegration = heroMediaIntegrationForComponent(id);
  return {
    supportsNoMedia: !mediaRequired,
    requiresMedia: mediaRequired,
    noMediaFallbacks: isCatalog
      ? ["compact_text", "category_icon", "abstract_texture"]
      : component.slot === "hero"
        ? ["hide", "abstract_texture"]
        : ["hide", "compact_text"],
    recommendedProductCount: isCatalog
      ? dense
        ? { min: 8, max: 40 }
        : rail
          ? { min: 4, max: 16 }
          : { min: 3, max: 18 }
      : null,
    recommendedCategoryCount: component.slot === "navigation"
      ? { min: 2, max: /catalog-index/.test(id) ? 12 : 8 }
      : null,
    catalogModes: /wholesale|technical|industrial|specification/.test(id)
      ? ["inquiry", "wholesale", "rfq"]
      : ["inquiry", "retail", "wholesale"],
    businessArchetypes: /beauty|ingredient|ritual/.test(id)
      ? ["natural_beauty", "food_producer"]
      : /industrial|technical|technology|specification/.test(id)
        ? ["manufacturer", "service_product_hybrid"]
        : /textile|swatch/.test(id)
          ? ["textile_atelier", "artisan"]
          : /room|furniture/.test(id)
            ? ["furniture", "artisan"]
            : ALL_ARCHETYPES,
    styleFamilies: /technical|technology|industrial|specification/.test(id)
      ? ["technical", "precise"]
      : /editorial|magazine|monograph/.test(id)
        ? ["editorial", "expressive"]
        : ["organic", "utilitarian"],
    supportsRtl: true,
    supportsLongTitles: !/floating-capsule|category-pills/.test(id),
    mobileBehavior: isCatalog && rail
      ? "horizontal_scroll"
      : isCatalog && dense
        ? "compact_list"
        : "stack",
    heroMediaIntegration,
    fallbackComponent: component.slot === "catalog"
      ? "catalog.minimal-list@1"
      : component.slot === "hero"
        ? "hero.centered-statement@1"
        : null,
  };
}

export function evaluateCompositionFitness(
  snapshot: RevisionSnapshotV4,
): CompositionFitness {
  const issues: FitnessIssue[] = [];
  const sections = snapshot.designManifest.sections;
  if (sections.filter((section) => section.component.startsWith("navigation.")).length > 1) {
    issues.push({ severity: "error", code: "duplicate_navigation", message: "Use one category-navigation system." });
  }
  const catalog = sections.find((section) => section.component.startsWith("catalog."));
  const standaloneNavigation = sections.find((section) =>
    section.component.startsWith("navigation."),
  );
  if (catalog) {
    const id = catalog.component;
    const hardMinimum = /dense-wholesale/.test(id)
      ? 8
      : /technology-spec/.test(id)
        ? 5
        : null;
    if (hardMinimum !== null && snapshot.products.length < hardMinimum) {
      issues.push({
        severity: "error",
        code: "catalog_too_sparse",
        sectionKey: catalog.key,
        message: `${id} needs at least ${hardMinimum} products; use catalog.minimal-list@1 for this catalog.`,
      });
    } else if (snapshot.products.length < 3 && !/minimal-list/.test(id)) {
      issues.push({
        severity: "warning",
        code: "sparse_catalog",
        sectionKey: catalog.key,
        message: "A one- or two-product catalog may read more clearly with catalog.minimal-list@1.",
      });
    }
    if (snapshot.products.length <= 6 && catalog.properties.show_search === true) {
      issues.push({ severity: "warning", code: "unnecessary_search", sectionKey: catalog.key, message: "Search adds little value for six or fewer products." });
    }
    if (snapshot.categories.length <= 1 && catalog.properties.show_filters === true) {
      issues.push({ severity: "warning", code: "unnecessary_filters", sectionKey: catalog.key, message: "Filters need at least two meaningful categories." });
    }
    if (standaloneNavigation && catalog.properties.show_filters === true) {
      issues.push({
        severity: "error",
        code: "duplicate_category_controls",
        sectionKey: catalog.key,
        message: "Use either standalone category navigation or catalog filters, not both.",
      });
    }
  }
  const imageRefs = [
    snapshot.business.heroImageRef,
    ...snapshot.products.map((product) => product.imageRef),
    ...snapshot.contentBlocks.blocks.flatMap((block) =>
      block.media.flatMap((media) => media.assetKeys),
    ),
  ].filter(Boolean);
  const repeated = imageRefs.find((ref, index) => imageRefs.indexOf(ref) !== index);
  if (repeated) {
    issues.push({ severity: "warning", code: "repeated_media", message: "One factual image is reused in multiple prominent destinations." });
  }
  const missingProducts = snapshot.products.filter((product) => !product.imageRef).length;
  if (missingProducts) {
    issues.push({
      severity: "warning",
      code: "product_media_fallback",
      message: `${missingProducts} product${missingProducts === 1 ? "" : "s"} use an intentional no-media treatment.`,
    });
  }
  const signatureCount = sections.filter((section) =>
    ["expressive", "signature"].includes(String(section.properties.reveal_style)) ||
    ["expressive", "signature"].includes(String(section.properties.interaction_style)),
  ).length;
  if (signatureCount > 2) {
    issues.push({ severity: "error", code: "too_many_signatures", message: "Use no more than two signature sections in one composition." });
  }
  const penalty = issues.reduce(
    (total, issue) => total + (issue.severity === "error" ? 25 : 8),
    0,
  );
  return {
    score: Math.max(0, 100 - penalty),
    allowed: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}
