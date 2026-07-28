import {
  parseShowroomComponentBank,
  type ShowroomBindingDefinition,
  type ShowroomCapability,
  type ShowroomComponentDefinition,
  type ShowroomPropertyDefinition,
  type ShowroomMediaSlotDefinition,
  type ShowroomSlot,
} from "./showroom-composition";
import {
  componentBankV2AsV1,
  parseShowroomComponentBankV2,
  type ShowroomComponentDefinitionV2,
  type ShowroomContentMediaSlotDefinition,
} from "./showroom-composition-v2";
import {
  SHOWROOM_DECORATIVE_DEPTHS,
  SHOWROOM_MOTION_INTENSITIES,
} from "./showroom-experience";

type ComponentSeed = {
  id: string;
  name: string;
  description: string;
};

const codeReference = "components/showroom/bank/sections.tsx";

const densityProperty: ShowroomPropertyDefinition = {
  key: "density",
  label: "Layout density",
  type: "enum",
  required: false,
  values: ["compact", "comfortable", "spacious"],
};

const showTaglineProperty: ShowroomPropertyDefinition = {
  key: "show_tagline",
  label: "Show business tagline",
  type: "boolean",
  required: false,
};

const alignmentProperty: ShowroomPropertyDefinition = {
  key: "alignment",
  label: "Text alignment",
  type: "enum",
  required: false,
  values: ["start", "center"],
};

const heroHeightProperty: ShowroomPropertyDefinition = {
  key: "height",
  label: "Hero height",
  type: "integer",
  required: false,
  min: 320,
  max: 760,
};

const columnsProperty: ShowroomPropertyDefinition = {
  key: "columns",
  label: "Desktop columns",
  type: "integer",
  required: false,
  min: 2,
  max: 5,
};

const showSearchProperty: ShowroomPropertyDefinition = {
  key: "show_search",
  label: "Show catalog search",
  type: "boolean",
  required: false,
};

const showFiltersProperty: ShowroomPropertyDefinition = {
  key: "show_filters",
  label: "Show category filters",
  type: "boolean",
  required: false,
};

const motionIntensityProperty: ShowroomPropertyDefinition = {
  key: "motion_intensity",
  label: "Motion intensity",
  type: "enum",
  required: true,
  values: [...SHOWROOM_MOTION_INTENSITIES],
};

const decorativeDepthProperty: ShowroomPropertyDefinition = {
  key: "decorative_depth",
  label: "Decorative depth",
  type: "enum",
  required: true,
  values: [...SHOWROOM_DECORATIVE_DEPTHS],
};

const revealStyleProperty: ShowroomPropertyDefinition = {
  key: "reveal_style",
  label: "Entrance treatment",
  type: "enum",
  required: true,
  values: ["fade-rise", "soft-clip", "staggered"],
};

const interactionStyleProperty: ShowroomPropertyDefinition = {
  key: "interaction_style",
  label: "Touch and pointer treatment",
  type: "enum",
  required: true,
  values: ["quiet-lift", "edge-trace", "tactile-press"],
};

const brandBindings: ShowroomBindingDefinition[] = [
  {
    key: "brand",
    label: "Business name",
    required: true,
    allowedSources: ["business.name"],
  },
  {
    key: "logo",
    label: "Business logo",
    required: false,
    allowedSources: ["business.logo"],
  },
  {
    key: "tagline",
    label: "Business tagline",
    required: false,
    allowedSources: ["business.tagline"],
  },
];

const heroBindings: ShowroomBindingDefinition[] = [
  {
    key: "title",
    label: "Hero title",
    required: true,
    allowedSources: ["business.hero_title"],
  },
  {
    key: "subtitle",
    label: "Hero subtitle",
    required: false,
    allowedSources: ["business.hero_subtitle", "business.tagline"],
  },
  {
    key: "image",
    label: "Hero image",
    required: false,
    allowedSources: ["business.hero_image"],
  },
  {
    key: "products",
    label: "Featured products",
    required: false,
    allowedSources: ["catalog.featured_products", "catalog.products"],
  },
];

const navigationBindings: ShowroomBindingDefinition[] = [
  {
    key: "categories",
    label: "Catalog categories",
    required: true,
    allowedSources: ["catalog.categories"],
  },
  {
    key: "collections",
    label: "Catalog collections",
    required: false,
    allowedSources: ["catalog.collections"],
  },
];

const storyBindings: ShowroomBindingDefinition[] = [
  {
    key: "title",
    label: "Business name or hero title",
    required: true,
    allowedSources: ["business.name", "business.hero_title"],
  },
  {
    key: "body",
    label: "Business description",
    required: true,
    allowedSources: ["business.description"],
  },
  {
    key: "image",
    label: "Business or hero image",
    required: false,
    allowedSources: ["business.hero_image", "business.logo"],
  },
];

const catalogBindings: ShowroomBindingDefinition[] = [
  {
    key: "products",
    label: "Catalog products",
    required: true,
    allowedSources: ["catalog.products", "catalog.featured_products"],
  },
  {
    key: "categories",
    label: "Catalog categories",
    required: true,
    allowedSources: ["catalog.categories"],
  },
  {
    key: "collections",
    label: "Catalog collections",
    required: false,
    allowedSources: ["catalog.collections"],
  },
];

const contactBindings: ShowroomBindingDefinition[] = [
  {
    key: "brand",
    label: "Business name",
    required: true,
    allowedSources: ["business.name"],
  },
  {
    key: "body",
    label: "Business description or tagline",
    required: false,
    allowedSources: ["business.description", "business.tagline"],
  },
  {
    key: "contacts",
    label: "Business contact methods",
    required: true,
    allowedSources: ["business.contact_methods"],
  },
];

function definitions(
  slot: ShowroomSlot,
  seeds: readonly ComponentSeed[],
  properties: ShowroomPropertyDefinition[],
  bindings: ShowroomBindingDefinition[],
  providesCapabilities: ShowroomCapability[] = [],
): ShowroomComponentDefinition[] {
  const mediaSlots = (seed: ComponentSeed): ShowroomMediaSlotDefinition[] => {
    if (slot === "header") {
      return [{
        key: "logo",
        label: "Brand logo",
        source: "business.logo",
        required: false,
        acceptedKinds: ["image"],
        minItems: 0,
        maxItems: 1,
        aspectRatio: "any",
      }];
    }
    if (slot === "hero") {
      return [{
        key: "hero_image",
        label: "Hero image",
        source: "business.hero_image",
        required: [
          "hero.editorial-collage@1",
          "hero.material-detail@1",
          "hero.collection-mosaic@1",
          "hero.provenance@1",
        ].includes(seed.id),
        acceptedKinds: ["image"],
        minItems: 0,
        maxItems: 1,
        aspectRatio: "landscape",
      }];
    }
    if (slot === "content" || slot === "trust") {
      return [{
        key: "story_image",
        label: "Story image",
        source: "business.hero_image",
        required: false,
        acceptedKinds: ["image"],
        minItems: 0,
        maxItems: 1,
        aspectRatio: "landscape",
      }];
    }
    return [];
  };
  return seeds.map((seed) => ({
    ...seed,
    slot,
    codeReference,
    repeatable: slot === "content" || slot === "trust",
    providesCapabilities: [...providesCapabilities],
    incompatibleWith: [],
    properties: [
      motionIntensityProperty,
      decorativeDepthProperty,
      ...properties,
    ].map((entry) => ({
      ...entry,
      ...(entry.type === "enum" ? { values: [...entry.values] } : {}),
    })),
    bindings: bindings.map((entry) => ({
      ...entry,
      allowedSources: [...entry.allowedSources],
    })),
    mediaSlots: mediaSlots(seed),
  }));
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}

export const SHOWROOM_BANK_COMPONENT_SEEDS = {
  header: [
    {
      id: "header.compact-utility@1",
      name: "Compact utility header",
      description: "A space-efficient brand row for broad or specification-led catalogs.",
    },
    {
      id: "header.editorial-wordmark@1",
      name: "Editorial wordmark header",
      description: "A generous wordmark treatment with prominent identity and restrained navigation.",
    },
    {
      id: "header.catalog-command@1",
      name: "Catalog command header",
      description: "A product-forward header that emphasizes discovery and inquiry access.",
    },
    {
      id: "header.transparent-overlay@1",
      name: "Transparent overlay header",
      description: "A lightweight brand bar that overlays a controlled high-contrast opening.",
    },
    {
      id: "header.producer-badge@1",
      name: "Identity badge header",
      description: "A grounded identity header with a compact badge-like brand treatment.",
    },
  ],
  hero: [
    {
      id: "hero.split-story@1",
      name: "Split story hero",
      description: "Balanced side-by-side narrative and image areas that stack on narrow screens.",
    },
    {
      id: "hero.centered-statement@1",
      name: "Centered statement hero",
      description: "A bold central message for a focused collection or memorable brand promise.",
    },
    {
      id: "hero.product-spotlight@1",
      name: "Product spotlight hero",
      description: "A product-led opening with one dominant visual subject and secondary copy.",
    },
    {
      id: "hero.editorial-collage@1",
      name: "Editorial collage hero",
      description: "An asymmetrical opening with layered visual planes and compact editorial copy.",
    },
    {
      id: "hero.material-detail@1",
      name: "Material detail hero",
      description: "A close-detail composition where texture-rich media bleeds into concise copy.",
    },
    {
      id: "hero.provenance@1",
      name: "Provenance hero",
      description: "A source-led opening that balances approved origin context with one factual image.",
    },
    {
      id: "hero.industrial-spec@1",
      name: "Structured specification hero",
      description: "A precise indexed opening where supplied facts carry more weight than decoration.",
    },
    {
      id: "hero.collection-mosaic@1",
      name: "Collection mosaic hero",
      description: "A bounded multi-product opening that gives several visual groups equal emphasis.",
    },
  ],
  navigation: [
    {
      id: "navigation.category-pills@1",
      name: "Category pills",
      description: "A rounded single-line category control for two to eight concise labels.",
    },
    {
      id: "navigation.collection-rail@1",
      name: "Collection rail",
      description: "A horizontally flowing collection index for visual browsing.",
    },
    {
      id: "navigation.catalog-index@1",
      name: "Catalog index",
      description: "A structured numbered index for scanning many categories or collections.",
    },
    {
      id: "navigation.minimal-tabs@1",
      name: "Minimal tabs",
      description: "A quiet navigation treatment for editorial and premium showrooms.",
    },
  ],
  content: [
    {
      id: "content.origin-story@1",
      name: "Origin story",
      description: "A narrative section for business history, place, craft, or sourcing.",
    },
    {
      id: "content.process-steps@1",
      name: "Process steps",
      description: "A structured sequence for production, preparation, finishing, or quality workflow.",
    },
    {
      id: "content.material-focus@1",
      name: "Material focus",
      description: "A tactile editorial section for ingredients, materials, finishes, or construction.",
    },
    {
      id: "content.founder-note@1",
      name: "Founder note",
      description: "A personal but restrained first-person narrative block.",
    },
    {
      id: "content.production-metrics@1",
      name: "Production overview",
      description: "A structured facts layout that displays only supplied business information.",
    },
    {
      id: "content.editorial-quote@1",
      name: "Editorial statement",
      description: "A high-impact excerpt treatment using supplied business description text.",
    },
  ],
  catalog: [
    {
      id: "catalog.editorial-grid@1",
      name: "Editorial grid",
      description: "Spacious equal-weight product cards with consistent media ratios.",
    },
    {
      id: "catalog.dense-wholesale@1",
      name: "Dense comparison grid",
      description: "Compact product scanning that prioritizes names and supplied details over large imagery.",
    },
    {
      id: "catalog.feature-tiles@1",
      name: "Feature tiles",
      description: "Alternating product emphasis that gives selected items more visual space.",
    },
    {
      id: "catalog.horizontal-shelf@1",
      name: "Horizontal shelf",
      description: "A browseable product shelf for focused catalogs and mobile-first discovery.",
    },
    {
      id: "catalog.collection-led@1",
      name: "Collection-led catalog",
      description: "A collection-first treatment that exposes meaningful groups before individual products.",
    },
    {
      id: "catalog.minimal-list@1",
      name: "Minimal specification list",
      description: "A clean information-dense list with compact optional media and room for long names.",
    },
  ],
  trust: [
    {
      id: "trust.product-details@1",
      name: "Product details panel",
      description: "A neutral facts panel that relies only on supplied business and catalog content.",
    },
    {
      id: "trust.provenance-panel@1",
      name: "Provenance panel",
      description: "An origin-focused treatment without inventing location or certification claims.",
    },
    {
      id: "trust.business-principles@1",
      name: "Business principles",
      description: "A restrained value presentation using only approved business description text.",
    },
    {
      id: "trust.wholesale-readiness@1",
      name: "Trade information",
      description: "A business-facing panel for supplied trade and production information.",
    },
    {
      id: "trust.care-guide@1",
      name: "Product guidance",
      description: "A calm guidance layout for supplied care, storage, handling, or usage information.",
    },
  ],
  call_to_action: [
    {
      id: "call-to-action.inquiry@1",
      name: "General inquiry invitation",
      description: "A direct invitation to build a product inquiry.",
    },
    {
      id: "call-to-action.wholesale@1",
      name: "Wholesale conversation",
      description: "An invitation to discuss quantities and requirements without promising trade terms.",
    },
    {
      id: "call-to-action.sample-question@1",
      name: "Sample availability question",
      description: "An invitation to ask whether samples or references are available.",
    },
    {
      id: "call-to-action.consultation@1",
      name: "Product consultation",
      description: "An invitation to discuss selection, specifications, or project needs.",
    },
  ],
  footer: [
    {
      id: "footer.compact@1",
      name: "Compact footer",
      description: "A concise closing identity and contact treatment.",
    },
    {
      id: "footer.editorial@1",
      name: "Editorial footer",
      description: "A generous brand-led close for premium and story-rich showrooms.",
    },
    {
      id: "footer.catalog-directory@1",
      name: "Catalog directory footer",
      description: "A structured close for broad collection and category navigation.",
    },
    {
      id: "footer.contact-panel@1",
      name: "Contact panel footer",
      description: "A contact-forward close that keeps inquiry handoff prominent.",
    },
  ],
} as const satisfies Record<ShowroomSlot, readonly ComponentSeed[]>;

export const SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS = {
  header: [
    { id: "header.floating-capsule@1", name: "Floating capsule header", description: "A polished floating command bar with prominent identity and compact actions." },
    { id: "header.technical-marquee@1", name: "Indexed marquee header", description: "A crisp indexed identity bar with dense labels and straight dividers." },
  ],
  hero: [
    { id: "hero.beauty-orbit@1", name: "Soft orbit hero", description: "A sculptural product stage with soft orbital layers and a calm single-subject rhythm." },
    { id: "hero.textile-swatch@1", name: "Layered swatch hero", description: "A tactile layered opening that emphasizes color, texture, and close-detail media." },
    { id: "hero.technology-cinematic@1", name: "High-contrast cinematic hero", description: "A dramatic high-contrast stage for one precise visual subject and concise launch copy." },
    { id: "hero.room-scene@1", name: "Spatial scene hero", description: "An immersive scene-inspired opening that layers several related visual planes." },
    { id: "hero.ingredient-monograph@1", name: "Source monograph hero", description: "An editorial source study that pairs approved context with one detailed factual image." },
  ],
  navigation: [
    { id: "navigation.visual-chapters@1", name: "Visual chapter navigation", description: "A magazine-like horizontal chapter rail for visual group discovery." },
    { id: "navigation.material-index@1", name: "Attribute index navigation", description: "A precise indexed control for named materials, attributes, categories, or collections." },
  ],
  content: [
    { id: "content.lookbook-chapter@1", name: "Lookbook chapter", description: "An expressive editorial chapter with generous media and a paced narrative." },
    { id: "content.exploded-feature@1", name: "Exploded feature", description: "A layered feature breakdown for supplied construction, parts, or functional details." },
    { id: "content.ritual-steps@1", name: "Guided-use steps", description: "A refined sequence for preparation, use, care, handling, or customer education." },
    { id: "content.swatch-story@1", name: "Swatch story", description: "A tactile color, texture, finish, or material narrative with optional supporting media." },
    { id: "content.controlled-film@1", name: "Controlled film chapter", description: "A reviewed widescreen video chapter for process or product demonstration." },
  ],
  catalog: [
    { id: "catalog.beauty-swatch@1", name: "Sculptural swatch catalog", description: "Soft sculptural product cards that emphasize color variation and compact imagery." },
    { id: "catalog.technology-spec@1", name: "Technical comparison catalog", description: "Crisp information-forward cards for comparison-oriented product ranges." },
    { id: "catalog.textile-stack@1", name: "Layered stack catalog", description: "Layered cards that emphasize texture, finish, variation, and horizontal browsing." },
    { id: "catalog.room-set@1", name: "Scene-grouped catalog", description: "Scene-inspired product groupings that make collection relationships visible." },
  ],
  trust: [
    { id: "trust.material-passport@1", name: "Material passport", description: "A structured panel for approved material, finish, construction, or composition facts." },
    { id: "trust.ingredient-ledger@1", name: "Composition ledger", description: "A careful ledger for approved ingredients, contents, source facts, or handling details." },
    { id: "trust.specification-matrix@1", name: "Specification matrix", description: "A high-clarity aligned matrix for supplied values that benefit from comparison." },
  ],
  call_to_action: [
    { id: "call-to-action.magazine-close@1", name: "Magazine close", description: "A spacious editorial inquiry invitation with one visually dominant action." },
    { id: "call-to-action.technical-brief@1", name: "Requirements brief invitation", description: "A focused close for requirement-led project or product inquiries." },
  ],
  footer: [
    { id: "footer.magazine-masthead@1", name: "Magazine masthead footer", description: "A memorable editorial close with generous identity and bounded directory groups." },
    { id: "footer.technical-directory@1", name: "Indexed directory footer", description: "A disciplined indexed close for contact details and compact directory links." },
  ],
} as const satisfies Record<ShowroomSlot, readonly ComponentSeed[]>;

const components = [
  ...definitions(
    "header",
    SHOWROOM_BANK_COMPONENT_SEEDS.header,
    [densityProperty, showTaglineProperty],
    brandBindings,
    ["inquiry_cart_trigger"],
  ),
  ...definitions(
    "hero",
    SHOWROOM_BANK_COMPONENT_SEEDS.hero,
    [alignmentProperty, heroHeightProperty],
    heroBindings,
  ),
  ...definitions(
    "navigation",
    SHOWROOM_BANK_COMPONENT_SEEDS.navigation,
    [densityProperty],
    navigationBindings,
    ["category_filter"],
  ),
  ...definitions(
    "content",
    SHOWROOM_BANK_COMPONENT_SEEDS.content,
    [alignmentProperty],
    storyBindings,
  ),
  ...definitions(
    "catalog",
    SHOWROOM_BANK_COMPONENT_SEEDS.catalog,
    [columnsProperty, showSearchProperty, showFiltersProperty],
    catalogBindings,
    ["catalog_search", "category_filter", "product_detail", "add_to_inquiry"],
  ),
  ...definitions(
    "trust",
    SHOWROOM_BANK_COMPONENT_SEEDS.trust,
    [columnsProperty],
    storyBindings,
  ),
  ...definitions(
    "call_to_action",
    SHOWROOM_BANK_COMPONENT_SEEDS.call_to_action,
    [alignmentProperty],
    contactBindings,
  ),
  ...definitions(
    "footer",
    SHOWROOM_BANK_COMPONENT_SEEDS.footer,
    [columnsProperty, showTaglineProperty],
    [...contactBindings, ...navigationBindings],
  ),
];

const tokenPacks = [
  ["linen-luxury", "Warm eucalyptus", "Warm light neutrals with walnut and cool eucalyptus contrast."],
  ["harvest-earth", "Field and clay", "Muted light neutrals with field green and clay contrast."],
  ["honey-amber", "Amber and teal", "Soft parchment with amber and deep teal contrast."],
  ["coffee-roast", "Copper and sage dark", "Dark roasted neutrals with warm copper and soft sage contrast."],
  ["artisan-clay", "Terracotta and mineral", "Clay neutrals with terracotta and mineral-blue contrast."],
  ["forest-botanical", "Leaf and ochre dark", "Deep green surfaces with leaf and ochre contrast."],
  ["furniture-walnut", "Walnut and blue-green", "Warm architectural neutrals with walnut and blue-green contrast."],
  ["industrial-steel", "Steel signal", "Cool steel neutrals with safety orange and technical blue contrast."],
  ["maker-indigo", "Indigo and berry", "Cool light neutrals with indigo and muted-berry contrast."],
  ["ocean-trade", "Ocean and brick", "Cool pale neutrals with ocean and brick contrast."],
  ["beauty-editorial", "Blush and evergreen", "Blush neutrals with berry and evergreen contrast."],
  ["technology-mono", "Signal monochrome", "High-clarity monochrome with signal blue and red contrast."],
  ["vibrant-market", "Coral and teal", "Warm bright canvas with lively coral and teal contrast."],
].map(([id, name, description]) => ({ id, name, description }));

export const SHOWROOM_COMPONENT_BANK_1_1 = deepFreeze(
  parseShowroomComponentBank({
    schemaVersion: 1,
    release: "showroom-bank@1.1.0",
    components,
    tokenPacks,
    requiredSlots: ["header", "hero", "catalog", "footer"],
    requiredCapabilities: [
      "catalog_search",
      "category_filter",
      "product_detail",
      "add_to_inquiry",
      "inquiry_cart_trigger",
    ],
  }),
);

const creativeProperties = (properties: ShowroomPropertyDefinition[]) => [
  ...properties,
  revealStyleProperty,
  interactionStyleProperty,
];

const candidateComponents = [
  ...SHOWROOM_COMPONENT_BANK_1_1.components,
  ...definitions("header", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.header, creativeProperties([densityProperty, showTaglineProperty]), brandBindings, ["inquiry_cart_trigger"]),
  ...definitions("hero", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.hero, creativeProperties([alignmentProperty, heroHeightProperty]), heroBindings),
  ...definitions("navigation", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.navigation, creativeProperties([densityProperty]), navigationBindings, ["category_filter"]),
  ...definitions("content", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.content, creativeProperties([alignmentProperty]), storyBindings),
  ...definitions("catalog", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.catalog, creativeProperties([columnsProperty, showSearchProperty, showFiltersProperty]), catalogBindings, ["catalog_search", "category_filter", "product_detail", "add_to_inquiry"]),
  ...definitions("trust", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.trust, creativeProperties([columnsProperty]), storyBindings),
  ...definitions("call_to_action", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.call_to_action, creativeProperties([alignmentProperty]), contactBindings),
  ...definitions("footer", SHOWROOM_BANK_1_2_ADDITIONAL_SEEDS.footer, creativeProperties([columnsProperty, showTaglineProperty]), [...contactBindings, ...navigationBindings]),
];

function acceptedContentTypes(
  component: ShowroomComponentDefinition,
): ShowroomComponentDefinitionV2["acceptedContentTypes"] {
  if (component.id === "content.controlled-film@1") return ["video"];
  if (component.slot === "hero") return ["hero"];
  if (component.slot === "content") return ["story", "highlights", "information"];
  if (component.slot === "trust") return ["information", "highlights"];
  if (component.slot === "call_to_action") return ["call_to_action"];
  return [];
}

function contentMediaSlots(
  component: ShowroomComponentDefinition,
): ShowroomContentMediaSlotDefinition[] {
  if (component.id === "content.controlled-film@1") {
    return [{ key: "video", label: "Controlled video", required: true, acceptedKinds: ["video"], minItems: 1, maxItems: 1, aspectRatio: "landscape" }];
  }
  if (component.slot === "hero") {
    return [{ key: "hero_image", label: "Hero image", required: false, acceptedKinds: ["image"], minItems: 0, maxItems: 1, aspectRatio: "landscape" }];
  }
  if (component.slot === "content" || component.slot === "trust") {
    return [{ key: "story_image", label: "Story image", required: false, acceptedKinds: ["image"], minItems: 0, maxItems: 1, aspectRatio: "any" }];
  }
  return [];
}

const candidateTokenPacks = [
  ...SHOWROOM_COMPONENT_BANK_1_1.tokenPacks,
  { id: "silk-atelier", name: "Magenta and deep green", description: "Soft warm neutrals with saturated magenta and deep-green contrast." },
  { id: "cosmetic-laboratory", name: "Rose and green clean", description: "Clean pale neutrals with rose and green contrast." },
  { id: "chrome-future", name: "Graphite electric", description: "Deep graphite surfaces with electric cyan and amber contrast." },
  { id: "paper-gallery", name: "Paper and vermilion", description: "Warm paper neutrals with vermilion and blue-green contrast." },
  { id: "mineral-spa", name: "Mineral teal", description: "Mineral neutrals with muted teal and clay contrast." },
];

export const SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE = deepFreeze(
  parseShowroomComponentBankV2({
    schemaVersion: 2,
    release: "showroom-bank@1.2.0",
    components: candidateComponents.map((component) => ({
      ...component,
      acceptedContentTypes: acceptedContentTypes(component),
      contentMediaSlots: contentMediaSlots(component),
    })),
    tokenPacks: candidateTokenPacks,
    requiredSlots: ["header", "hero", "catalog", "footer"],
    requiredCapabilities: ["catalog_search", "category_filter", "product_detail", "add_to_inquiry", "inquiry_cart_trigger"],
  }),
);

export const SHOWROOM_BANK_1_2_COMBINATION_FLOOR =
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.requiredSlots.reduce(
    (total, slot) =>
      total *
      SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.filter(
        (component) => component.slot === slot,
      ).length,
    SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.tokenPacks.length,
  );

export const SHOWROOM_COMPONENT_BANK = SHOWROOM_COMPONENT_BANK_1_1;
export const SHOWROOM_COMPONENT_BANK_LATEST =
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE;

const SHOWROOM_BANK_RELEASES = Object.freeze({
  [SHOWROOM_COMPONENT_BANK_1_1.release]: SHOWROOM_COMPONENT_BANK_1_1,
  [SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.release]: componentBankV2AsV1(
    SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
  ),
});

const SHOWROOM_BANK_RELEASES_V2 = Object.freeze({
  [SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.release]:
    SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
});

export type SupportedShowroomBankRelease = keyof typeof SHOWROOM_BANK_RELEASES;

export function resolveShowroomComponentBank(release: unknown) {
  if (typeof release !== "string" || !(release in SHOWROOM_BANK_RELEASES)) {
    throw new Error("The showroom component-bank release is not supported.");
  }
  return SHOWROOM_BANK_RELEASES[release as SupportedShowroomBankRelease];
}

export function resolveShowroomComponentBankV2(release: unknown) {
  if (typeof release !== "string" || !(release in SHOWROOM_BANK_RELEASES_V2)) {
    throw new Error("The showroom component-bank release is not supported.");
  }
  return SHOWROOM_BANK_RELEASES_V2[
    release as keyof typeof SHOWROOM_BANK_RELEASES_V2
  ];
}

export function listShowroomComponentBanks() {
  return Object.freeze(Object.values(SHOWROOM_BANK_RELEASES));
}

export const SHOWROOM_BANK_BASE_COMBINATION_FLOOR =
  SHOWROOM_COMPONENT_BANK.requiredSlots.reduce(
    (total, slot) =>
      total *
      SHOWROOM_COMPONENT_BANK.components.filter(
        (component) => component.slot === slot,
      ).length,
    SHOWROOM_COMPONENT_BANK.tokenPacks.length,
  );
