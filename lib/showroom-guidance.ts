import type { RevisionSnapshotV4 } from "./revision-v4-domain";
import type { ShowroomComponentDefinitionV2 } from "./showroom-composition-v2";
import type { HeroMediaIntegration } from "./showroom-design-systems";
import type { SectionMediaIntegration } from "./showroom-design-systems";
import { defaultMediaIntegrationForSection } from "./showroom-composition-v2";

export type ShowroomCommerceMode = "inquiry" | "retail" | "wholesale" | "rfq";
export type ShowroomContentNeed =
  | "brand_identity"
  | "category_browsing"
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
  | "category_grouped"
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
export type ShowroomSurfaceRole =
  | "canvas"
  | "surface"
  | "soft"
  | "accent-soft"
  | "secondary-soft"
  | "strong"
  | "inverse";

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
  compatibleMediaIntegrations: SectionMediaIntegration[];
  renderedAnatomy: {
    regions: string[];
    mediaPlanes: { min: number; max: number };
    interaction: string;
  };
  fallbackComponent: string | null;
};

export type MediaTreatmentGuidance = {
  id: SectionMediaIntegration;
  label: string;
  status: "current" | "legacy";
  visualResult: string;
  visualWeight: "neutral" | "supporting" | "signature";
  requiresImage: boolean;
  allowedSlots: Array<"hero" | "content">;
  idealWhen: string[];
  avoidWhen: string[];
  desktopBehavior: string;
  mobileBehavior: string;
};

export type ShowroomTemplateSection = {
  role: string;
  slot: "header" | "hero" | "content" | "catalog" | "trust" | "call_to_action" | "footer";
  required: boolean;
  visualWeight: "quiet" | "supporting" | "prominent" | "signature";
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
  sectionPlan: ShowroomTemplateSection[];
  surfaceSequence: ShowroomSurfaceRole[];
  signatureBudget: 1 | 2;
  pacingRules: string[];
  avoidWhen: string[];
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

export const SHOWROOM_DESIGN_PROCESS = Object.freeze({
  decisionOrder: [
    "source_facts_and_content_needs",
    "commerce_mode_and_catalog_shape",
    "page_template",
    "semantic_design_system",
    "section_anatomy",
    "media_treatment",
    "component_variant_and_properties",
    "composition_fitness",
    "desktop_and_mobile_review",
  ],
  rules: [
    "Choose one page template before individual component variants.",
    "Preserve the canonical hero, about, process, products, and inquiry order.",
    "Choose semantic design roles by purpose, never by industry words in an ID.",
    "Spend the signature budget on the most important one or two sections.",
    "Treat media layout and media blending as separate decisions.",
    "Use supplied facts and admitted media only; presentation freedom is not factual authority.",
    "Revise any section identified by composition fitness before review.",
  ],
});

export const SHOWROOM_MEDIA_TREATMENTS: Readonly<
  Record<SectionMediaIntegration, MediaTreatmentGuidance>
> = Object.freeze({
  natural: {
    id: "natural",
    label: "Natural media",
    status: "current",
    visualResult: "The image follows the selected section anatomy without an imposed fade, overlay, or cutout.",
    visualWeight: "neutral",
    requiresImage: false,
    allowedSlots: ["hero", "content"],
    idealWhen: ["the section layout already gives the image a clear role", "the image must remain easy to inspect"],
    avoidWhen: ["copy is placed directly over a busy image"],
    desktopBehavior: "Uses the component's native split, inline, or staged media region.",
    mobileBehavior: "Stacks media at its bounded ratio without adding a synthetic fade.",
  },
  surface_blend: {
    id: "surface_blend",
    label: "Full-section surface blend",
    status: "current",
    visualResult: "One image fills the section while a broad semantic surface gradient protects copy and dissolves into the image.",
    visualWeight: "signature",
    requiresImage: true,
    allowedSlots: ["hero", "content"],
    idealWhen: ["one strong landscape image can carry the section", "copy is concise and needs an immersive backdrop"],
    avoidWhen: ["the image subject sits beneath the copy", "the image is low resolution or informationally dense"],
    desktopBehavior: "Uses a full-section image with a wide inline surface-to-transparent gradient.",
    mobileBehavior: "Changes to a vertical surface-to-transparent gradient so copy remains readable above the image.",
  },
  ambient_overlay: {
    id: "ambient_overlay",
    label: "Legacy ambient overlay",
    status: "legacy",
    visualResult: "Retained full-section image overlay behavior for previously stored designs.",
    visualWeight: "signature",
    requiresImage: true,
    allowedSlots: ["hero", "content"],
    idealWhen: ["rendering a retained design that already selected this treatment"],
    avoidWhen: ["creating a new recipe; use surface_blend instead"],
    desktopBehavior: "Renders through the reviewed surface-blend implementation.",
    mobileBehavior: "Uses the same protected vertical blend as surface_blend.",
  },
  edge_fade: {
    id: "edge_fade",
    label: "Directional edge fade",
    status: "current",
    visualResult: "The image pixels gradually become transparent where media meets adjacent copy.",
    visualWeight: "supporting",
    requiresImage: true,
    allowedSlots: ["hero", "content"],
    idealWhen: ["split copy and media need a softer transition", "the subject remains away from the faded edge"],
    avoidWhen: ["the image contains important detail at the faded edge"],
    desktopBehavior: "Applies a directional alpha mask at the copy-facing image edge.",
    mobileBehavior: "Rotates the mask vertically at the stacked copy/media boundary.",
  },
  split_bleed: {
    id: "split_bleed",
    label: "Split bleed",
    status: "current",
    visualResult: "Copy and media occupy distinct regions while media reaches the section edge.",
    visualWeight: "supporting",
    requiresImage: true,
    allowedSlots: ["hero", "content"],
    idealWhen: ["copy and image need equal responsibility", "the image crops well in a landscape region"],
    avoidWhen: ["the available image needs its complete uncropped frame"],
    desktopBehavior: "Uses a stable split with an edge-connected media plane.",
    mobileBehavior: "Stacks into a bounded full-width media plane.",
  },
  editorial_overlap: {
    id: "editorial_overlap",
    label: "Editorial overlap",
    status: "current",
    visualResult: "Media slightly crosses the copy boundary with a restrained directional mask.",
    visualWeight: "signature",
    requiresImage: true,
    allowedSlots: ["hero", "content"],
    idealWhen: ["the page needs one editorial focal section", "the subject remains readable in an asymmetric crop"],
    avoidWhen: ["copy is long", "another nearby section already uses signature media"],
    desktopBehavior: "Offsets media toward copy and masks its leading edge.",
    mobileBehavior: "Removes the offset and uses a short vertical transition.",
  },
  product_stage: {
    id: "product_stage",
    label: "Product stage",
    status: "current",
    visualResult: "One isolated subject is contained and softened with a radial mask rather than cropped as a scene.",
    visualWeight: "signature",
    requiresImage: true,
    allowedSlots: ["hero", "content"],
    idealWhen: ["one product or object has a clean isolated subject", "the full object should remain visible"],
    avoidWhen: ["the image is a room, workshop, landscape, or busy group scene"],
    desktopBehavior: "Contains the image subject inside a soft radial stage.",
    mobileBehavior: "Keeps the object contained at a stable landscape ratio.",
  },
  hidden: {
    id: "hidden",
    label: "Intentional no-media",
    status: "current",
    visualResult: "The media region is removed and the section becomes deliberately text-led.",
    visualWeight: "neutral",
    requiresImage: false,
    allowedSlots: ["hero", "content"],
    idealWhen: ["the message is stronger than available imagery", "no authorized image exists"],
    avoidWhen: ["visual product recognition is essential in the opening"],
    desktopBehavior: "Removes the media region and lets copy own the composition.",
    mobileBehavior: "Preserves the text-led composition without an empty placeholder.",
  },
});

const STANDARD_SECTION_PLAN: ShowroomTemplateSection[] = [
  { role: "identity and primary actions", slot: "header", required: true, visualWeight: "quiet" },
  { role: "opening proposition", slot: "hero", required: true, visualWeight: "signature" },
  { role: "about or story", slot: "content", required: true, visualWeight: "supporting" },
  { role: "process", slot: "content", required: true, visualWeight: "supporting" },
  { role: "product discovery", slot: "catalog", required: true, visualWeight: "prominent" },
  { role: "inquiry conversion", slot: "call_to_action", required: true, visualWeight: "prominent" },
  { role: "identity and contact close", slot: "footer", required: true, visualWeight: "quiet" },
];

export const SHOWROOM_CANONICAL_SURFACE_SEQUENCE: readonly ShowroomSurfaceRole[] =
  Object.freeze([
    "surface",
    "accent-soft",
    "surface",
    "secondary-soft",
    "canvas",
    "strong",
    "inverse",
  ]);

function pageTemplate(
  input: Omit<
    ShowroomTemplate,
    "sectionPlan" | "signatureBudget" | "surfaceSequence"
  > & {
    sectionPlan?: ShowroomTemplateSection[];
    signatureBudget?: 1 | 2;
  },
): ShowroomTemplate {
  return {
    ...input,
    sectionPlan: input.sectionPlan || STANDARD_SECTION_PLAN,
    surfaceSequence: [...SHOWROOM_CANONICAL_SURFACE_SEQUENCE],
    signatureBudget: input.signatureBudget || 2,
  };
}

export const SHOWROOM_TEMPLATES: readonly ShowroomTemplate[] = Object.freeze([
  pageTemplate({
    id: "process-led-editorial",
    name: "Process-led editorial",
    description: "A spacious narrative sequence that connects process, material facts, products, and consultation.",
    contentNeeds: ["editorial_story", "process_explanation", "material_details", "product_discovery"],
    catalogShape: "focused",
    commerceModes: ["inquiry", "retail"],
    mediaCondition: "optional",
    visualTones: ["editorial", "quiet"],
    pacingRules: [
      "Keep the opening concise, then move through about and process before products.",
      "Use no more than one image-dominant narrative section after the hero.",
    ],
    avoidWhen: ["the catalog is primarily specification comparison", "there is no useful process or material story"],
  }),
  pageTemplate({
    id: "source-led-shelf",
    name: "Source-led shelf",
    description: "An origin-first sequence with a horizontally browsable catalog and prominent contact handoff.",
    contentNeeds: ["source_context", "process_explanation", "product_discovery", "contact_handoff"],
    catalogShape: "focused",
    commerceModes: ["inquiry", "wholesale"],
    mediaCondition: "optional",
    visualTones: ["organic", "quiet"],
    pacingRules: [
      "Use the about section for supplied source context and the process section for how work or inquiries move.",
      "Keep both sections concise before the compact product shelf.",
    ],
    avoidWhen: ["source or provenance facts are unavailable", "side-by-side specification comparison is essential"],
  }),
  pageTemplate({
    id: "guided-use-catalog",
    name: "Guided-use catalog",
    description: "A polished product sequence organized around use steps, visual chapters, and supplied detail facts.",
    contentNeeds: ["editorial_story", "usage_guidance", "category_browsing", "product_discovery"],
    catalogShape: "category_grouped",
    commerceModes: ["inquiry", "retail", "wholesale"],
    mediaCondition: "image_rich",
    visualTones: ["quiet", "playful"],
    pacingRules: [
      "Explain a bounded use sequence before asking visitors to compare products.",
      "Keep steps short enough to scan without hiding essential information.",
    ],
    avoidWhen: ["products require dense technical comparison", "no supplied use or care guidance exists"],
  }),
  pageTemplate({
    id: "spatial-gallery",
    name: "Spatial gallery",
    description: "A scene-led composition with generous media, material context, and grouped product discovery.",
    contentNeeds: ["product_focus", "material_details", "category_browsing", "usage_guidance"],
    catalogShape: "category_grouped",
    commerceModes: ["inquiry", "retail"],
    mediaCondition: "image_rich",
    visualTones: ["editorial", "quiet"],
    pacingRules: [
      "Spend the primary signature on a scene-led opening.",
      "Group products only when supplied relationships are meaningful.",
    ],
    avoidWhen: ["media is sparse or inconsistent", "products are best compared by specification"],
  }),
  pageTemplate({
    id: "dense-rfq",
    name: "Dense RFQ",
    description: "A compact, indexed composition for comparison, supplied specifications, and requirement-led inquiries.",
    contentNeeds: ["editorial_story", "process_explanation", "comparison", "product_discovery"],
    catalogShape: "comparison_led",
    commerceModes: ["rfq", "wholesale", "inquiry"],
    mediaCondition: "optional",
    visualTones: ["technical", "precise"],
    signatureBudget: 1,
    pacingRules: [
      "Prioritize supplied specifications, product names, and inquiry requirements over decorative media.",
      "Use compact density and reserve the only signature treatment for the opening.",
    ],
    avoidWhen: ["fewer than five products exist", "the purchase decision is primarily emotional or lifestyle-led"],
  }),
  pageTemplate({
    id: "provenance-catalog",
    name: "Provenance catalog",
    description: "A source-and-story sequence followed by grouped products, factual proof, and a quantity conversation.",
    contentNeeds: ["source_context", "process_explanation", "category_browsing", "product_discovery"],
    catalogShape: "category_grouped",
    commerceModes: ["inquiry", "retail", "wholesale"],
    mediaCondition: "optional",
    visualTones: ["organic", "editorial"],
    pacingRules: [
      "Connect approved source context to meaningful product categories.",
      "Do not repeat the same source paragraph in the hero and about section.",
    ],
    avoidWhen: ["categories are arbitrary or missing", "source claims would need to be inferred"],
  }),
  pageTemplate({
    id: "material-editorial",
    name: "Material editorial",
    description: "A layered visual narrative centered on color, texture, material variation, and stacked product browsing.",
    contentNeeds: ["material_details", "editorial_story", "category_browsing", "product_discovery"],
    catalogShape: "category_grouped",
    commerceModes: ["inquiry", "retail", "wholesale"],
    mediaCondition: "image_rich",
    visualTones: ["editorial", "expressive"],
    pacingRules: [
      "Use image and surface contrast to create two deliberate editorial peaks.",
      "Keep catalog cards bounded even when imagery is strong.",
    ],
    avoidWhen: ["authorized photography is sparse", "long technical descriptions require dense comparison"],
  }),
  pageTemplate({
    id: "compact-service-catalog",
    name: "Compact service and catalog",
    description: "A restrained, information-forward sequence connecting process, a compact catalog, principles, and consultation.",
    contentNeeds: ["editorial_story", "process_explanation", "product_discovery", "inquiry_conversion"],
    catalogShape: "sparse",
    commerceModes: ["inquiry", "rfq"],
    mediaCondition: "optional",
    visualTones: ["precise", "utilitarian"],
    signatureBudget: 1,
    pacingRules: [
      "Keep the page short and information-forward.",
      "Use a compact catalog and direct inquiry close instead of decorative chapters.",
    ],
    avoidWhen: ["a broad image-rich catalog needs visual grouping", "several editorial stories are essential"],
  }),
]);

type SelectionProfile = Omit<
  ComponentGuidance,
  | "supportsNoMedia"
  | "requiresMedia"
  | "noMediaFallbacks"
  | "recommendedProductCount"
  | "recommendedCategoryCount"
  | "heroMediaIntegration"
  | "compatibleMediaIntegrations"
  | "renderedAnatomy"
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
    "A restrained single-row header with business identity and an optional concise descriptor.",
    "inline_identity_bar", "linear", "none", "quiet", "rectilinear", "none",
    "preserve", ["brand_identity"], ["precise", "utilitarian"],
    ["the page needs a low-profile opening", "the identity should remain direct"],
    ["the header must become the visual signature"],
  ),
  editorial_header: selectionProfile(
    "A centered masthead that gives the business name generous space above a quiet descriptor.",
    "editorial_masthead", "linear", "none", "prominent", "rectilinear", "none",
    "stack", ["brand_identity"], ["editorial", "quiet"],
    ["the name should lead", "the identity benefits from deliberate whitespace"],
    ["the opening needs the lowest possible header height"],
  ),
  catalog_header: selectionProfile(
    "A structured two-zone identity header that separates the business mark from supporting context.",
    "structured_identity_bar", "split", "none", "supporting", "rectilinear", "subtle",
    "stack", ["brand_identity"], ["precise", "utilitarian"],
    ["identity and descriptor should scan as separate zones"],
    ["the page needs a soft editorial masthead"],
  ),
  overlay_header: selectionProfile(
    "A translucent surface bar that visually connects to the opening while preserving its own contrast.",
    "translucent_surface_bar", "linear", "none", "supporting", "rectilinear", "subtle",
    "collapse_to_menu", ["brand_identity"], ["editorial", "quiet"],
    ["the header should feel connected to the hero without sitting directly on media"],
    ["the opening requires a hard, technical separation"],
  ),
  producer_header: selectionProfile(
    "An identity-led header with a compact emblem and a clearly separated supporting descriptor.",
    "emblem_identity_bar", "split", "none", "supporting", "mixed", "subtle",
    "stack", ["brand_identity"], ["organic", "precise"],
    ["a short descriptor helps explain the business immediately"],
    ["the business has no concise descriptor"],
  ),
  floating_header: selectionProfile(
    "A contained floating identity bar with a bounded mark and optional descriptor over the page canvas.",
    "floating_identity_bar", "linear", "none", "prominent", "soft", "subtle",
    "preserve", ["brand_identity"], ["expressive", "quiet"],
    ["the opening benefits from a compact elevated layer"],
    ["the desired presentation is flat or information-dense"],
  ),
  technical_header: selectionProfile(
    "A compact indexed identity header with a concise descriptor and one strong accent block.",
    "indexed_identity_bar", "indexed", "none", "supporting", "rectilinear", "subtle",
    "stack", ["brand_identity"], ["technical", "precise"],
    ["users need fast identity scanning"],
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
    "stack", ["editorial_story", "category_browsing"], ["editorial", "expressive"],
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
    "A multi-item opening that presents several products or categories as a bounded visual mosaic.",
    "collection_mosaic", "grid", "dominant", "signature", "mixed", "expressive",
    "stack", ["category_browsing", "product_discovery"], ["playful", "editorial"],
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
    "horizontal_scroll", ["category_browsing"], ["editorial", "expressive"],
    ["groups benefit from sequential visual browsing"],
    ["there is only one group or another category control already exists"],
  ),
  nav_index: selectionProfile(
    "A structured numbered index optimized for scanning many product categories.",
    "indexed_navigation", "indexed", "none", "supporting", "rectilinear", "none",
    "compact_list", ["category_browsing"], ["technical", "precise"],
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
    "A grouped catalog that makes product-category structure visible before individual products.",
    "category_groups", "grid", "balanced", "prominent", "mixed", "subtle",
    "stack", ["category_browsing", "product_discovery"], ["editorial", "organic"],
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
    "A concise final row containing business identity and essential inquiry information.",
    "compact_footer", "linear", "none", "quiet", "rectilinear", "none",
    "stack", ["contact_handoff"], ["quiet", "utilitarian"],
    ["the closing action already appears above"],
    ["several information columns are required"],
  ),
  footer_editorial: selectionProfile(
    "A spacious three-part close with brand narrative, permanent showroom handle, and contact details aligned at the baseline.",
    "editorial_footer", "grid", "none", "prominent", "rectilinear", "none",
    "stack", ["contact_handoff"], ["editorial", "quiet"],
    ["the close needs room for identity and a concise descriptor"],
    ["the footer must remain extremely compact"],
  ),
  footer_directory: selectionProfile(
    "A scan-first information close with a bounded showroom-identity column between brand and contact.",
    "structured_information_footer", "indexed", "none", "supporting", "rectilinear", "subtle",
    "stack", ["brand_identity", "contact_handoff"], ["precise", "editorial"],
    ["the permanent handle and contact destination should scan separately"],
    ["content is too sparse to justify multiple columns"],
  ),
  footer_contact: selectionProfile(
    "A contact-led close with business identity kept secondary to one prominent reply destination.",
    "contact_panel_footer", "split", "none", "prominent", "mixed", "subtle",
    "stack", ["contact_handoff"], ["precise", "quiet"],
    ["the reply destination is the most useful final information"],
    ["contact information is incomplete"],
  ),
  footer_masthead: selectionProfile(
    "A generous brand-led close with an oversized wordmark, permanent handle, and compact contact handoff.",
    "masthead_footer", "layered", "none", "signature", "mixed", "expressive",
    "stack", ["brand_identity", "contact_handoff"], ["editorial", "expressive"],
    ["the page needs a memorable identity-led final beat"],
    ["the preceding call to action is already visually dominant"],
  ),
  footer_technical: selectionProfile(
    "An indexed close with compact uppercase identity labels, clear contact information, and a bounded accent plane.",
    "indexed_information_footer", "indexed", "none", "supporting", "rectilinear", "subtle",
    "compact_list", ["brand_identity", "contact_handoff"], ["technical", "precise"],
    ["users benefit from a fast-scanning structured close"],
    ["the desired ending is soft or spacious"],
  ),
} as const;

const PROFILE_BY_COMPONENT_ID: Readonly<Record<string, keyof typeof PROFILES>> = {
  "header.compact-utility@1": "compact_header",
  "header.editorial-wordmark@1": "editorial_header",
  "header.catalog-command@1": "catalog_header",
  "header.transparent-overlay@1": "overlay_header",
  "header.producer-badge@1": "producer_header",
  "header.floating-capsule@1": "floating_header",
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
  "footer.editorial@1": "footer_editorial",
  "footer.catalog-directory@1": "footer_directory",
  "footer.contact-panel@1": "footer_contact",
  "footer.magazine-masthead@1": "footer_masthead",
  "footer.technical-directory@1": "footer_technical",
};

export function heroMediaIntegrationForComponent(
  componentId: string,
): HeroMediaIntegration | null {
  if (!componentId.startsWith("hero.")) return null;
  return defaultMediaIntegrationForSection("hero", componentId);
}

function compatibleMediaIntegrations(
  slot: ShowroomComponentDefinitionV2["slot"],
  profileKey: keyof typeof PROFILES,
): SectionMediaIntegration[] {
  if (slot !== "hero" && slot !== "content") return [];
  if (profileKey === "centered_hero") return ["natural", "hidden"];
  if (profileKey === "product_hero") {
    return ["natural", "surface_blend", "edge_fade", "split_bleed", "product_stage", "hidden"];
  }
  if (profileKey === "collage_hero" || profileKey === "mosaic_hero") {
    return ["natural", "surface_blend", "edge_fade", "split_bleed", "editorial_overlap", "hidden"];
  }
  if (profileKey === "video") return ["natural", "hidden"];
  if (slot === "content") {
    return ["natural", "surface_blend", "edge_fade", "split_bleed", "editorial_overlap", "hidden"];
  }
  return ["natural", "surface_blend", "edge_fade", "split_bleed", "editorial_overlap", "hidden"];
}

function renderedAnatomy(
  component: ShowroomComponentDefinitionV2,
  profileKey: keyof typeof PROFILES,
): ComponentGuidance["renderedAnatomy"] {
  if (component.slot === "header") {
    const anatomyByProfile = {
      compact_header: {
        regions: ["inline brand identity", "optional concise descriptor"],
        interaction: "One low-profile identity row without duplicate catalog or inquiry commands.",
      },
      editorial_header: {
        regions: ["centered brand masthead", "optional descriptor"],
        interaction: "Centered desktop identity collapses to a compact mobile header.",
      },
      catalog_header: {
        regions: ["brand zone", "supporting context zone"],
        interaction: "Two-zone identity bar stacks cleanly without duplicating workflow controls.",
      },
      overlay_header: {
        regions: ["brand identity", "optional descriptor", "translucent surface"],
        interaction: "Contained contrast-safe surface visually connects with the opening section.",
      },
      producer_header: {
        regions: ["emblem identity", "short descriptor"],
        interaction: "Emblem and descriptor stack cleanly at narrow widths.",
      },
      floating_header: {
        regions: ["floating identity capsule", "optional descriptor"],
        interaction: "Elevated bounded bar preserves outer page margins at every viewport.",
      },
      technical_header: {
        regions: ["indexed identity", "compact descriptor", "bounded accent plane"],
        interaction: "Dense identity bar uses one bounded accent plane and compact mobile text.",
      },
    } as const;
    const anatomy = anatomyByProfile[
      profileKey as keyof typeof anatomyByProfile
    ];
    return {
      regions: [...anatomy.regions],
      mediaPlanes: { min: 0, max: 1 },
      interaction: anatomy.interaction,
    };
  }
  if (component.slot === "hero") {
    const multiple = profileKey === "collage_hero" || profileKey === "mosaic_hero";
    return {
      regions: ["kicker and opening copy", "primary catalog action", multiple ? "one-to-three factual media planes" : "one optional factual media plane"],
      mediaPlanes: { min: 0, max: multiple ? 3 : 1 },
      interaction: "One catalog destination; hero media contains no product-link overlay.",
    };
  }
  if (component.slot === "navigation") {
    return {
      regions: ["navigation label", "product-category controls"],
      mediaPlanes: { min: 0, max: 0 },
      interaction: "One keyboard and touch-accessible browsing control surface.",
    };
  }
  if (component.slot === "catalog") {
    return {
      regions: ["catalog heading", "optional search and category controls", "bounded product cards"],
      mediaPlanes: { min: 0, max: 6 },
      interaction: "Every visible product supports detail and add-to-inquiry actions.",
    };
  }
  if (component.slot === "content") {
    return {
      regions: ["section heading", "typed narrative or facts", "optional supporting media"],
      mediaPlanes: { min: 0, max: 1 },
      interaction: profileKey === "video" ? "One controlled provider video with no autoplay." : "No hidden or hover-only information.",
    };
  }
  if (component.slot === "trust") {
    return {
      regions: ["factual heading", "one-to-several supplied fact items"],
      mediaPlanes: { min: 0, max: 0 },
      interaction: "Read-only supplied decision-support facts.",
    };
  }
  if (component.slot === "call_to_action") {
    return {
      regions: ["closing invitation", "one inquiry action"],
      mediaPlanes: { min: 0, max: 0 },
      interaction: "One direct inquiry-cart action.",
    };
  }
  const footerAnatomy = {
    footer_compact: ["inline brand close", "contact handoff"],
    footer_editorial: ["brand narrative", "permanent showroom handle", "baseline contact handoff"],
    footer_directory: ["brand close", "structured showroom identity", "contact handoff"],
    footer_contact: ["supporting identity", "permanent showroom handle", "prominent contact panel"],
    footer_masthead: ["oversized brand masthead", "permanent showroom handle", "contact handoff"],
    footer_technical: ["indexed identity", "structured showroom handle", "compact contact handoff"],
  } as const;
  return {
    regions: [...footerAnatomy[profileKey as keyof typeof footerAnatomy]],
    mediaPlanes: { min: 0, max: 1 },
    interaction: "Responsive footer preserves identity and contact information without category navigation or header duplication.",
  };
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
    compatibleMediaIntegrations: compatibleMediaIntegrations(component.slot, profileKey),
    renderedAnatomy: renderedAnatomy(component, profileKey),
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
  const contentTypeByKey = new Map(
    snapshot.contentBlocks.blocks.map((block) => [block.key, block.type]),
  );
  const canonicalSections = [
    { prefix: "header.", contentType: null },
    { prefix: "hero.", contentType: "hero" },
    { prefix: "content.", contentType: "story" },
    { prefix: "content.", contentType: "highlights" },
    { prefix: "catalog.", contentType: null },
    { prefix: "call-to-action.", contentType: "call_to_action" },
    { prefix: "footer.", contentType: null },
  ] as const;
  if (sections.length !== canonicalSections.length) {
    issues.push({
      severity: "error",
      code: "noncanonical_section_count",
      message:
        "Normal showrooms use exactly seven sections: header, hero, about, process, products, inquiry CTA, and footer.",
    });
  } else {
    canonicalSections.forEach((expected, index) => {
      const section = sections[index];
      const actualType = section.contentBlockKey
        ? contentTypeByKey.get(section.contentBlockKey)
        : null;
      if (
        !section.component.startsWith(expected.prefix) ||
        actualType !== expected.contentType
      ) {
        issues.push({
          severity: "error",
          code: "noncanonical_section_order",
          sectionKey: section.key,
          message:
            "Use this exact order and assignment: header, hero, about/story, process/highlights, products, inquiry CTA, footer.",
        });
      }
      if (section.surfaceRole !== SHOWROOM_CANONICAL_SURFACE_SEQUENCE[index]) {
        issues.push({
          severity: "error",
          code: "noncanonical_surface_sequence",
          sectionKey: section.key,
          message: `Section ${section.key} must use ${SHOWROOM_CANONICAL_SURFACE_SEQUENCE[index]} so both palette families appear before the strong close while story and catalog return to neutral layers.`,
        });
      }
    });
  }
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

  const surfaceRoles = sections
    .map((section) => section.surfaceRole)
    .filter((value): value is ShowroomSurfaceRole => typeof value === "string");
  if (surfaceRoles.length >= 4 && new Set(surfaceRoles).size < 3) {
    issues.push({
      severity: "warning",
      code: "surface_monotony",
      message: "Use at least three semantic surface roles to create deliberate page pacing.",
    });
  }
  for (let index = 2; index < surfaceRoles.length; index += 1) {
    if (
      surfaceRoles[index] === surfaceRoles[index - 1] &&
      surfaceRoles[index] === surfaceRoles[index - 2]
    ) {
      issues.push({
        severity: "warning",
        code: "repeated_surface_run",
        message: `Three consecutive sections use ${surfaceRoles[index]}; vary the semantic surface rhythm.`,
      });
      break;
    }
  }

  const layoutFamilies = sections.map((section) => {
    const profileKey = PROFILE_BY_COMPONENT_ID[section.component];
    return profileKey ? PROFILES[profileKey].layoutFamily : "";
  });
  for (let index = 1; index < layoutFamilies.length; index += 1) {
    if (
      layoutFamilies[index] &&
      layoutFamilies[index] === layoutFamilies[index - 1]
    ) {
      issues.push({
        severity: "warning",
        code: "adjacent_layout_repetition",
        sectionKey: sections[index].key,
        message: `This section repeats the ${layoutFamilies[index]} anatomy used immediately above it.`,
      });
    }
  }

  const signatureSections = new Set<string>();
  for (const section of sections) {
    const profileKey = PROFILE_BY_COMPONENT_ID[section.component];
    if (profileKey && PROFILES[profileKey].visualWeight === "signature") {
      signatureSections.add(section.key);
    }
    if (section.component.startsWith("hero.") || section.component.startsWith("content.")) {
      const treatment = section.mediaIntegration || "natural";
      const treatmentGuidance = SHOWROOM_MEDIA_TREATMENTS[treatment];
      const slot = section.component.startsWith("hero.") ? "hero" : "content";
      const compatible = profileKey
        ? compatibleMediaIntegrations(slot, profileKey)
        : [];
      if (compatible.length && !compatible.includes(treatment)) {
        issues.push({
          severity: "error",
          code: "incompatible_media_treatment",
          sectionKey: section.key,
          message: `${section.component} does not support ${treatment}; choose one of ${compatible.join(", ")}.`,
        });
      }
      const block = section.contentBlockKey
        ? snapshot.contentBlocks.blocks.find((entry) => entry.key === section.contentBlockKey)
        : undefined;
      const hasImage =
        (section.component.startsWith("hero.") && Boolean(snapshot.business.heroImageRef)) ||
        Boolean(block?.media.some((media) => media.assetKeys.length > 0));
      if (treatmentGuidance.requiresImage && !hasImage) {
        issues.push({
          severity: "error",
          code: "media_treatment_requires_image",
          sectionKey: section.key,
          message: `${treatment} needs one admitted image; choose natural or hidden until that media destination is fulfilled.`,
        });
      }
      if (treatmentGuidance.visualWeight === "signature") {
        signatureSections.add(section.key);
      }
      if (treatmentGuidance.status === "legacy") {
        issues.push({
          severity: "warning",
          code: "legacy_media_treatment",
          sectionKey: section.key,
          message: "ambient_overlay remains readable for retained designs; use surface_blend in a new recipe.",
        });
      }
    }
  }
  const signatureCount = signatureSections.size;
  if (signatureCount > 2) {
    issues.push({
      severity: "error",
      code: "too_many_signatures",
      message: `This composition has ${signatureCount} signature sections; keep the strongest one or two and make the rest supporting.`,
    });
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
