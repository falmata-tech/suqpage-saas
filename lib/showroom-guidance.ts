import type { RevisionSnapshotV4 } from "./revision-v4-domain";
import type { ShowroomComponentDefinitionV2 } from "./showroom-composition-v2";
import type { HeroMediaIntegration } from "./showroom-design-systems";
import { defaultMediaIntegrationForSection } from "./showroom-composition-v2";

export type ShowroomCommerceMode = "inquiry" | "retail" | "wholesale" | "rfq";
export type ShowroomContentNeed =
  | "brand_identity"
  | "category_browsing"
  | "collection_browsing"
  | "comparison"
  | "contact_handoff"
  | "editorial_story"
  | "inquiry_conversion"
  | "material_details"
  | "process_explanation"
  | "product_discovery"
  | "product_focus"
  | "source_context"
  | "trust_facts"
  | "usage_guidance"
  | "video_story";
export type ShowroomVisualTone =
  | "editorial"
  | "organic"
  | "precise"
  | "technical"
  | "playful"
  | "quiet"
  | "expressive"
  | "utilitarian";
export type ShowroomCatalogShape =
  | "none"
  | "sparse"
  | "focused"
  | "broad"
  | "collection_led"
  | "comparison_led";
export type ShowroomMediaCondition =
  | "none"
  | "optional"
  | "image_rich"
  | "single_feature"
  | "video_required";
export type NoMediaFallback =
  | "hide"
  | "category_icon"
  | "abstract_texture"
  | "silhouette"
  | "compact_text";

export type ComponentGuidance = {
  visualDescription: string;
  layoutFamily: string;
  contentFlow: "linear" | "split" | "layered" | "grid" | "rail" | "indexed";
  mediaRole: "none" | "supporting" | "balanced" | "dominant" | "required";
  visualWeight: "quiet" | "supporting" | "prominent" | "signature";
  geometry: "rectilinear" | "soft" | "layered" | "mixed";
  decorationLevel: "none" | "subtle" | "expressive";
  supportsNoMedia: boolean;
  requiresMedia: boolean;
  noMediaFallbacks: NoMediaFallback[];
  recommendedProductCount: { min: number; max: number } | null;
  recommendedCategoryCount: { min: number; max: number } | null;
  commerceModes: ShowroomCommerceMode[];
  contentNeeds: ShowroomContentNeed[];
  visualTones: ShowroomVisualTone[];
  supportsRtl: boolean;
  supportsLongTitles: boolean;
  responsiveBehavior:
    | "collapse_to_menu"
    | "stack"
    | "horizontal_scroll"
    | "compact_list"
    | "preserve";
  idealWhen: string[];
  avoidWhen: string[];
  heroMediaIntegration: HeroMediaIntegration | null;
  fallbackComponent: string | null;
};

export type ShowroomTemplate = {
  id: string;
  name: string;
  description: string;
  contentNeeds: ShowroomContentNeed[];
  catalogShape: ShowroomCatalogShape;
  commerceModes: ShowroomCommerceMode[];
  mediaCondition: ShowroomMediaCondition;
  visualTones: ShowroomVisualTone[];
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
    id: "process-led-editorial",
    name: "Process-led editorial",
    description: "A spacious narrative sequence that connects process, material facts, products, and consultation.",
    contentNeeds: ["editorial_story", "process_explanation", "material_details", "product_discovery"],
    catalogShape: "focused",
    commerceModes: ["inquiry", "retail"],
    mediaCondition: "optional",
    visualTones: ["editorial", "quiet"],
    tokenPack: "paper-gallery",
    components: [
      "header.editorial-wordmark@1", "hero.material-detail@1",
      "navigation.collection-rail@1", "content.process-steps@1",
      "catalog.editorial-grid@1", "trust.material-passport@1",
      "call-to-action.consultation@1", "footer.editorial@1",
    ],
  },
  {
    id: "source-led-shelf",
    name: "Source-led shelf",
    description: "An origin-first sequence with a horizontally browsable catalog and prominent contact handoff.",
    contentNeeds: ["source_context", "product_discovery", "trust_facts", "contact_handoff"],
    catalogShape: "focused",
    commerceModes: ["inquiry", "wholesale"],
    mediaCondition: "optional",
    visualTones: ["organic", "quiet"],
    tokenPack: "harvest-earth",
    components: [
      "header.producer-badge@1", "hero.provenance@1",
      "navigation.collection-rail@1", "content.origin-story@1",
      "catalog.horizontal-shelf@1", "trust.provenance-panel@1",
      "call-to-action.wholesale@1", "footer.contact-panel@1",
    ],
  },
  {
    id: "guided-use-catalog",
    name: "Guided-use catalog",
    description: "A polished product sequence organized around use steps, visual chapters, and supplied detail facts.",
    contentNeeds: ["usage_guidance", "category_browsing", "product_discovery", "trust_facts"],
    catalogShape: "collection_led",
    commerceModes: ["inquiry", "retail", "wholesale"],
    mediaCondition: "image_rich",
    visualTones: ["quiet", "playful"],
    tokenPack: "cosmetic-laboratory",
    components: [
      "header.floating-capsule@1", "hero.ingredient-monograph@1",
      "navigation.visual-chapters@1", "content.ritual-steps@1",
      "catalog.beauty-swatch@1", "trust.ingredient-ledger@1",
      "call-to-action.sample-question@1", "footer.magazine-masthead@1",
    ],
  },
  {
    id: "spatial-gallery",
    name: "Spatial gallery",
    description: "A scene-led composition with generous media, material context, and grouped product discovery.",
    contentNeeds: ["product_focus", "material_details", "collection_browsing", "usage_guidance"],
    catalogShape: "collection_led",
    commerceModes: ["inquiry", "retail"],
    mediaCondition: "image_rich",
    visualTones: ["editorial", "quiet"],
    tokenPack: "paper-gallery",
    components: [
      "header.editorial-wordmark@1", "hero.room-scene@1",
      "navigation.visual-chapters@1", "content.material-focus@1",
      "catalog.room-set@1", "trust.care-guide@1",
      "call-to-action.consultation@1", "footer.editorial@1",
    ],
  },
  {
    id: "dense-rfq",
    name: "Dense RFQ",
    description: "A compact, indexed composition for comparison, supplied specifications, and requirement-led inquiries.",
    contentNeeds: ["comparison", "trust_facts", "product_discovery", "inquiry_conversion"],
    catalogShape: "comparison_led",
    commerceModes: ["rfq", "wholesale", "inquiry"],
    mediaCondition: "optional",
    visualTones: ["technical", "precise"],
    tokenPack: "industrial-steel",
    components: [
      "header.technical-marquee@1", "hero.industrial-spec@1",
      "navigation.catalog-index@1", "content.production-metrics@1",
      "catalog.dense-wholesale@1", "trust.specification-matrix@1",
      "call-to-action.technical-brief@1", "footer.technical-directory@1",
    ],
  },
  {
    id: "provenance-collection",
    name: "Provenance collection",
    description: "A source-and-story sequence followed by grouped products, factual proof, and a quantity conversation.",
    contentNeeds: ["source_context", "editorial_story", "collection_browsing", "trust_facts"],
    catalogShape: "collection_led",
    commerceModes: ["inquiry", "retail", "wholesale"],
    mediaCondition: "optional",
    visualTones: ["organic", "editorial"],
    tokenPack: "artisan-clay",
    components: [
      "header.producer-badge@1", "hero.ingredient-monograph@1",
      "navigation.material-index@1", "content.origin-story@1",
      "catalog.collection-led@1", "trust.provenance-panel@1",
      "call-to-action.wholesale@1", "footer.contact-panel@1",
    ],
  },
  {
    id: "material-editorial",
    name: "Material editorial",
    description: "A layered visual narrative centered on color, texture, material variation, and stacked product browsing.",
    contentNeeds: ["material_details", "editorial_story", "category_browsing", "product_discovery"],
    catalogShape: "collection_led",
    commerceModes: ["inquiry", "retail", "wholesale"],
    mediaCondition: "image_rich",
    visualTones: ["editorial", "expressive"],
    tokenPack: "silk-atelier",
    components: [
      "header.transparent-overlay@1", "hero.textile-swatch@1",
      "navigation.material-index@1", "content.swatch-story@1",
      "catalog.textile-stack@1", "trust.material-passport@1",
      "call-to-action.magazine-close@1", "footer.magazine-masthead@1",
    ],
  },
  {
    id: "compact-service-catalog",
    name: "Compact service and catalog",
    description: "A restrained, information-forward sequence connecting process, a compact catalog, principles, and consultation.",
    contentNeeds: ["process_explanation", "product_discovery", "trust_facts", "inquiry_conversion"],
    catalogShape: "sparse",
    commerceModes: ["inquiry", "rfq"],
    mediaCondition: "optional",
    visualTones: ["precise", "utilitarian"],
    tokenPack: "technology-mono",
    components: [
      "header.compact-utility@1", "hero.split-story@1",
      "navigation.minimal-tabs@1", "content.process-steps@1",
      "catalog.minimal-list@1", "trust.business-principles@1",
      "call-to-action.consultation@1", "footer.compact@1",
    ],
  },
]);

type SelectionProfile = Omit<
  ComponentGuidance,
  | "supportsNoMedia"
  | "requiresMedia"
  | "noMediaFallbacks"
  | "recommendedProductCount"
  | "recommendedCategoryCount"
  | "heroMediaIntegration"
  | "fallbackComponent"
>;

const selectionProfile = (
  visualDescription: string,
  layoutFamily: string,
  contentFlow: SelectionProfile["contentFlow"],
  mediaRole: SelectionProfile["mediaRole"],
  visualWeight: SelectionProfile["visualWeight"],
  geometry: SelectionProfile["geometry"],
  decorationLevel: SelectionProfile["decorationLevel"],
  responsiveBehavior: SelectionProfile["responsiveBehavior"],
  contentNeeds: ShowroomContentNeed[],
  visualTones: ShowroomVisualTone[],
  idealWhen: string[],
  avoidWhen: string[],
  commerceModes: ShowroomCommerceMode[] = ["inquiry", "retail", "wholesale"],
  supportsLongTitles = true,
): SelectionProfile => ({
  visualDescription,
  layoutFamily,
  contentFlow,
  mediaRole,
  visualWeight,
  geometry,
  decorationLevel,
  commerceModes,
  contentNeeds,
  visualTones,
  supportsRtl: true,
  supportsLongTitles,
  responsiveBehavior,
  idealWhen,
  avoidWhen,
});

const PROFILES = {
  compact_header: selectionProfile(
    "A restrained single-row header with identity at the start and compact actions at the end.",
    "inline_utility_bar", "linear", "supporting", "quiet", "rectilinear", "none",
    "collapse_to_menu", ["brand_identity"], ["precise", "utilitarian"],
    ["navigation labels are short", "the page needs a low-profile opening"],
    ["the header must become the visual signature"],
  ),
  expressive_header: selectionProfile(
    "A prominent brand header with generous identity space and navigation treated as part of the composition.",
    "brand_led_header", "linear", "supporting", "prominent", "mixed", "subtle",
    "collapse_to_menu", ["brand_identity"], ["editorial", "expressive"],
    ["brand identity should remain visible before scrolling"],
    ["navigation is long or utility-heavy"],
  ),
  overlay_header: selectionProfile(
    "A transparent header positioned over the opening section, relying on controlled contrast against its background.",
    "hero_overlay_header", "linear", "supporting", "prominent", "rectilinear", "subtle",
    "collapse_to_menu", ["brand_identity"], ["editorial", "quiet"],
    ["the hero supplies a stable high-contrast surface"],
    ["hero contrast varies or media is unavailable"],
  ),
  technical_header: selectionProfile(
    "A compact indexed header with crisp dividers, dense labels, and a command-bar rhythm.",
    "indexed_command_bar", "indexed", "none", "supporting", "rectilinear", "subtle",
    "collapse_to_menu", ["brand_identity", "category_browsing"], ["technical", "precise"],
    ["users need fast scanning and direct section access"],
    ["the desired tone is soft or highly editorial"],
    ["inquiry", "wholesale", "rfq"],
  ),
  split_hero: selectionProfile(
    "A two-part opening with a text column and edge-connected media sharing equal visual responsibility.",
    "split_hero", "split", "balanced", "signature", "rectilinear", "subtle",
    "stack", ["brand_identity", "product_focus"], ["precise", "editorial"],
    ["one strong image and concise opening copy are available"],
    ["media is weak or the title is unusually long"],
  ),
  centered_hero: selectionProfile(
    "A text-led centered opening with restrained optional decoration and no dependence on photography.",
    "centered_statement", "linear", "supporting", "prominent", "soft", "subtle",
    "stack", ["brand_identity"], ["quiet", "editorial"],
    ["the message is stronger than the available media"],
    ["multiple products must be understood immediately"],
  ),
  product_hero: selectionProfile(
    "A product-led stage with one dominant media subject and supporting text kept secondary.",
    "product_stage", "layered", "dominant", "signature", "mixed", "expressive",
    "stack", ["product_focus"], ["expressive", "precise"],
    ["one authorized image can carry the opening"],
    ["there is no clear feature subject or only generic imagery exists"],
  ),
  collage_hero: selectionProfile(
    "An asymmetrical layered opening that combines several visual planes with a compact editorial text area.",
    "editorial_collage", "layered", "dominant", "signature", "layered", "expressive",
    "stack", ["editorial_story", "collection_browsing"], ["editorial", "expressive"],
    ["multiple coherent images or product groups are available"],
    ["media is sparse, inconsistent, or text is long"],
  ),
  detail_hero: selectionProfile(
    "A close-detail opening where texture or product detail bleeds into the section beside concise copy.",
    "detail_bleed", "split", "dominant", "signature", "layered", "subtle",
    "stack", ["material_details", "product_focus"], ["editorial", "organic"],
    ["a detailed or tactile image is available"],
    ["only wide group photography exists"],
  ),
  source_hero: selectionProfile(
    "A narrative opening that gives origin or supplied context equal weight with one atmospheric factual image.",
    "source_story_hero", "split", "balanced", "prominent", "soft", "subtle",
    "stack", ["source_context", "editorial_story"], ["organic", "quiet"],
    ["approved source context and a relevant image are available"],
    ["origin is unknown or would need to be inferred"],
  ),
  technical_hero: selectionProfile(
    "A structured opening with indexed copy, straight geometry, and media treated as evidence rather than decoration.",
    "technical_spec_hero", "split", "supporting", "prominent", "rectilinear", "subtle",
    "stack", ["comparison", "trust_facts"], ["technical", "precise"],
    ["supplied specifications or process facts lead the story"],
    ["the available content is primarily emotional or lifestyle-oriented"],
    ["inquiry", "wholesale", "rfq"],
  ),
  mosaic_hero: selectionProfile(
    "A multi-item opening that presents several products or collections as a bounded visual mosaic.",
    "collection_mosaic", "grid", "dominant", "signature", "mixed", "expressive",
    "stack", ["collection_browsing", "product_discovery"], ["playful", "editorial"],
    ["several coherent images deserve equal emphasis"],
    ["fewer than three useful images are available"],
  ),
  nav_compact: selectionProfile(
    "A compact single-line category control with touch targets arranged as tabs or pills.",
    "compact_category_control", "rail", "none", "supporting", "soft", "none",
    "horizontal_scroll", ["category_browsing"], ["quiet", "utilitarian"],
    ["there are two to eight short category labels"],
    ["labels are long or another category control already exists"],
    ["inquiry", "retail", "wholesale"], false,
  ),
  nav_rail: selectionProfile(
    "A horizontally scrolling chapter rail that exposes several groups without expanding page height.",
    "chapter_rail", "rail", "supporting", "prominent", "rectilinear", "subtle",
    "horizontal_scroll", ["collection_browsing", "category_browsing"], ["editorial", "expressive"],
    ["groups benefit from sequential visual browsing"],
    ["there is only one group or another category control already exists"],
  ),
  nav_index: selectionProfile(
    "A structured numbered index optimized for scanning many categories or collections.",
    "indexed_navigation", "indexed", "none", "supporting", "rectilinear", "none",
    "compact_list", ["category_browsing", "collection_browsing"], ["technical", "precise"],
    ["there are many meaningful groups with concise labels"],
    ["the catalog is tiny or another category control already exists"],
    ["inquiry", "wholesale", "rfq"],
  ),
  story: selectionProfile(
    "A paced narrative section with one clear heading, readable body copy, and optional supporting media.",
    "narrative_band", "split", "supporting", "supporting", "rectilinear", "subtle",
    "stack", ["editorial_story", "source_context"], ["editorial", "quiet"],
    ["approved narrative copy adds context beyond the hero"],
    ["the section repeats the hero or business description"],
  ),
  steps: selectionProfile(
    "A numbered or sequenced explanation with short repeatable steps arranged for quick scanning.",
    "step_sequence", "grid", "none", "supporting", "rectilinear", "subtle",
    "stack", ["process_explanation", "usage_guidance"], ["precise", "utilitarian"],
    ["content naturally forms three to six distinct steps"],
    ["the source material is one continuous narrative"],
  ),
  facts: selectionProfile(
    "A compact structured facts section using aligned labels, values, or bounded metric groups.",
    "facts_grid", "grid", "none", "supporting", "rectilinear", "none",
    "stack", ["trust_facts", "comparison"], ["technical", "precise"],
    ["several approved factual values need comparison"],
    ["facts are missing or would need to be invented"],
  ),
  quote: selectionProfile(
    "A high-emphasis typographic statement with minimal surrounding content and no required media.",
    "editorial_quote", "linear", "none", "prominent", "mixed", "subtle",
    "stack", ["editorial_story"], ["editorial", "expressive"],
    ["one approved sentence deserves deliberate emphasis"],
    ["the quotation is long or unsupported"],
  ),
  video: selectionProfile(
    "A controlled widescreen media chapter with a short title and supporting context.",
    "video_chapter", "linear", "required", "prominent", "rectilinear", "subtle",
    "stack", ["video_story", "process_explanation"], ["editorial", "precise"],
    ["an admitted controlled video materially explains the offering"],
    ["no authorized video exists or text alone communicates the point"],
  ),
  catalog_grid: selectionProfile(
    "A bounded product-card grid with consistent media ratios and equal visual weight across items.",
    "product_grid", "grid", "balanced", "prominent", "rectilinear", "subtle",
    "stack", ["product_discovery"], ["editorial", "quiet"],
    ["three to eighteen products need balanced browsing"],
    ["only one or two products exist"],
  ),
  catalog_dense: selectionProfile(
    "A compact comparison-oriented grid or list that prioritizes names and supplied details over large imagery.",
    "dense_catalog", "grid", "supporting", "prominent", "rectilinear", "none",
    "compact_list", ["product_discovery", "comparison"], ["technical", "utilitarian"],
    ["at least eight products need rapid comparison"],
    ["the catalog is sparse or imagery is the main selling material"],
    ["inquiry", "wholesale", "rfq"],
  ),
  catalog_feature: selectionProfile(
    "An alternating product layout that gives selected items more space while retaining a clear browsing sequence.",
    "feature_tiles", "layered", "dominant", "prominent", "mixed", "expressive",
    "stack", ["product_focus", "product_discovery"], ["editorial", "expressive"],
    ["three to twelve products have strong, coherent imagery"],
    ["all products require equal comparison weight"],
  ),
  catalog_rail: selectionProfile(
    "A horizontally browsable product shelf with stable card sizes and a visible continuation cue.",
    "horizontal_shelf", "rail", "balanced", "prominent", "rectilinear", "subtle",
    "horizontal_scroll", ["product_discovery"], ["quiet", "playful"],
    ["four to sixteen products should remain compact on mobile"],
    ["side-by-side specification comparison is essential"],
  ),
  catalog_collection: selectionProfile(
    "A grouped catalog that makes collection or category structure visible before individual products.",
    "collection_groups", "grid", "balanced", "prominent", "mixed", "subtle",
    "stack", ["collection_browsing", "product_discovery"], ["editorial", "organic"],
    ["products form at least two meaningful groups"],
    ["groups are missing, arbitrary, or redundant"],
  ),
  catalog_list: selectionProfile(
    "A restrained information-first list with compact optional media and generous room for long names.",
    "specification_list", "indexed", "supporting", "supporting", "rectilinear", "none",
    "compact_list", ["product_discovery", "comparison"], ["precise", "utilitarian"],
    ["the catalog is sparse, text-heavy, or has limited photography"],
    ["large visual storytelling is the primary goal"],
    ["inquiry", "wholesale", "rfq"],
  ),
  trust_panel: selectionProfile(
    "A contained facts panel that separates approved evidence from promotional narrative.",
    "trust_panel", "grid", "supporting", "supporting", "rectilinear", "subtle",
    "stack", ["trust_facts", "material_details", "usage_guidance"], ["precise", "quiet"],
    ["approved details answer likely customer questions"],
    ["the same facts already appear immediately above"],
  ),
  cta_direct: selectionProfile(
    "A focused closing band with one primary inquiry action and short supporting copy.",
    "direct_close", "linear", "none", "prominent", "rectilinear", "subtle",
    "stack", ["inquiry_conversion"], ["precise", "quiet"],
    ["one clear next action should end the page"],
    ["several competing actions are required"],
  ),
  cta_editorial: selectionProfile(
    "A spacious typographic close that gives the final invitation strong editorial emphasis.",
    "editorial_close", "linear", "supporting", "signature", "mixed", "expressive",
    "stack", ["inquiry_conversion"], ["editorial", "expressive"],
    ["the page needs a memorable, unhurried final beat"],
    ["the workflow demands dense instructions or multiple actions"],
  ),
  footer_compact: selectionProfile(
    "A concise final row containing identity, essential contact information, and minimal navigation.",
    "compact_footer", "linear", "none", "quiet", "rectilinear", "none",
    "stack", ["contact_handoff"], ["quiet", "utilitarian"],
    ["the closing action already appears above"],
    ["many directory links must remain visible"],
  ),
  footer_directory: selectionProfile(
    "A structured multi-column close for identity, contact, and bounded directory links.",
    "directory_footer", "grid", "none", "supporting", "rectilinear", "subtle",
    "stack", ["contact_handoff", "category_browsing"], ["precise", "editorial"],
    ["several useful link groups or contact methods exist"],
    ["content is too sparse to justify multiple columns"],
  ),
} as const;

const PROFILE_BY_COMPONENT_ID: Readonly<Record<string, keyof typeof PROFILES>> = {
  "header.compact-utility@1": "compact_header",
  "header.editorial-wordmark@1": "expressive_header",
  "header.catalog-command@1": "technical_header",
  "header.transparent-overlay@1": "overlay_header",
  "header.producer-badge@1": "expressive_header",
  "header.floating-capsule@1": "expressive_header",
  "header.technical-marquee@1": "technical_header",
  "hero.split-story@1": "split_hero",
  "hero.centered-statement@1": "centered_hero",
  "hero.product-spotlight@1": "product_hero",
  "hero.editorial-collage@1": "collage_hero",
  "hero.material-detail@1": "detail_hero",
  "hero.provenance@1": "source_hero",
  "hero.industrial-spec@1": "technical_hero",
  "hero.collection-mosaic@1": "mosaic_hero",
  "hero.beauty-orbit@1": "product_hero",
  "hero.textile-swatch@1": "detail_hero",
  "hero.technology-cinematic@1": "product_hero",
  "hero.room-scene@1": "collage_hero",
  "hero.ingredient-monograph@1": "source_hero",
  "navigation.category-pills@1": "nav_compact",
  "navigation.collection-rail@1": "nav_rail",
  "navigation.catalog-index@1": "nav_index",
  "navigation.minimal-tabs@1": "nav_compact",
  "navigation.visual-chapters@1": "nav_rail",
  "navigation.material-index@1": "nav_index",
  "content.origin-story@1": "story",
  "content.process-steps@1": "steps",
  "content.material-focus@1": "story",
  "content.founder-note@1": "story",
  "content.production-metrics@1": "facts",
  "content.editorial-quote@1": "quote",
  "content.lookbook-chapter@1": "story",
  "content.exploded-feature@1": "facts",
  "content.ritual-steps@1": "steps",
  "content.swatch-story@1": "story",
  "content.controlled-film@1": "video",
  "catalog.editorial-grid@1": "catalog_grid",
  "catalog.dense-wholesale@1": "catalog_dense",
  "catalog.feature-tiles@1": "catalog_feature",
  "catalog.horizontal-shelf@1": "catalog_rail",
  "catalog.collection-led@1": "catalog_collection",
  "catalog.minimal-list@1": "catalog_list",
  "catalog.beauty-swatch@1": "catalog_feature",
  "catalog.technology-spec@1": "catalog_dense",
  "catalog.textile-stack@1": "catalog_rail",
  "catalog.room-set@1": "catalog_collection",
  "trust.product-details@1": "trust_panel",
  "trust.provenance-panel@1": "trust_panel",
  "trust.business-principles@1": "trust_panel",
  "trust.wholesale-readiness@1": "trust_panel",
  "trust.care-guide@1": "trust_panel",
  "trust.material-passport@1": "trust_panel",
  "trust.ingredient-ledger@1": "trust_panel",
  "trust.specification-matrix@1": "trust_panel",
  "call-to-action.inquiry@1": "cta_direct",
  "call-to-action.wholesale@1": "cta_direct",
  "call-to-action.sample-question@1": "cta_direct",
  "call-to-action.consultation@1": "cta_direct",
  "call-to-action.magazine-close@1": "cta_editorial",
  "call-to-action.technical-brief@1": "cta_direct",
  "footer.compact@1": "footer_compact",
  "footer.editorial@1": "footer_directory",
  "footer.catalog-directory@1": "footer_directory",
  "footer.contact-panel@1": "footer_directory",
  "footer.magazine-masthead@1": "footer_directory",
  "footer.technical-directory@1": "footer_directory",
};

export function heroMediaIntegrationForComponent(
  componentId: string,
): HeroMediaIntegration | null {
  if (!componentId.startsWith("hero.")) return null;
  return defaultMediaIntegrationForSection("hero", componentId);
}

export function guidanceForComponent(
  component: ShowroomComponentDefinitionV2,
): ComponentGuidance {
  const profileKey = PROFILE_BY_COMPONENT_ID[component.id];
  if (!profileKey) {
    throw new Error(`Component ${component.id} has no explicit selection profile.`);
  }
  const profile = PROFILES[profileKey];
  const isCatalog = component.slot === "catalog";
  const mediaRequired = component.contentMediaSlots.some((slot) => slot.required);
  const dense = profileKey === "catalog_dense";
  const rail = profileKey === "catalog_rail" || profileKey === "catalog_collection";
  return {
    ...profile,
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
      ? { min: 2, max: profileKey === "nav_index" ? 12 : 8 }
      : null,
    heroMediaIntegration: heroMediaIntegrationForComponent(component.id),
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
    const profileKey = PROFILE_BY_COMPONENT_ID[id];
    const hardMinimum = profileKey === "catalog_dense"
      ? id === "catalog.technology-spec@1" ? 5 : 8
      : null;
    if (hardMinimum !== null && snapshot.products.length < hardMinimum) {
      issues.push({
        severity: "error",
        code: "catalog_too_sparse",
        sectionKey: catalog.key,
        message: `${id} needs at least ${hardMinimum} products; use catalog.minimal-list@1 for this catalog.`,
      });
    } else if (
      snapshot.products.length < 3 &&
      profileKey !== "catalog_list"
    ) {
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
