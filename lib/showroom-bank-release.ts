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
      description: "A generous wordmark treatment for fashion, beauty, furniture, and artisan brands.",
    },
    {
      id: "header.catalog-command@1",
      name: "Catalog command header",
      description: "A product-forward header that emphasizes discovery and inquiry access.",
    },
    {
      id: "header.transparent-overlay@1",
      name: "Transparent overlay header",
      description: "A lightweight brand bar suited to image-led and provenance-led openings.",
    },
    {
      id: "header.producer-badge@1",
      name: "Producer badge header",
      description: "A grounded identity header for makers, growers, manufacturers, and cooperatives.",
    },
  ],
  hero: [
    {
      id: "hero.split-story@1",
      name: "Split story hero",
      description: "Balanced narrative and image areas for almost any product business.",
    },
    {
      id: "hero.centered-statement@1",
      name: "Centered statement hero",
      description: "A bold central message for a focused collection or memorable brand promise.",
    },
    {
      id: "hero.product-spotlight@1",
      name: "Product spotlight hero",
      description: "A product-led opening for technology, beauty, food, and flagship goods.",
    },
    {
      id: "hero.editorial-collage@1",
      name: "Editorial collage hero",
      description: "Layered visual rhythm for fashion, artisan, decor, and lifestyle catalogs.",
    },
    {
      id: "hero.material-detail@1",
      name: "Material detail hero",
      description: "A tactile composition for furniture, textiles, craft, ingredients, and finishes.",
    },
    {
      id: "hero.provenance@1",
      name: "Provenance hero",
      description: "An origin-led opening for coffee, honey, agriculture, food, and handmade goods.",
    },
    {
      id: "hero.industrial-spec@1",
      name: "Industrial specification hero",
      description: "A precise structured opening for manufacturers, equipment, and trade suppliers.",
    },
    {
      id: "hero.collection-mosaic@1",
      name: "Collection mosaic hero",
      description: "A multi-product opening for broad catalogs, importers, and seasonal collections.",
    },
  ],
  navigation: [
    {
      id: "navigation.category-pills@1",
      name: "Category pills",
      description: "Friendly rounded category navigation for compact consumer catalogs.",
    },
    {
      id: "navigation.collection-rail@1",
      name: "Collection rail",
      description: "A horizontally flowing collection index for visual browsing.",
    },
    {
      id: "navigation.catalog-index@1",
      name: "Catalog index",
      description: "A structured numbered index for manufacturing, wholesale, and larger catalogs.",
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
      description: "A personal but restrained narrative block for independent businesses.",
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
      description: "Spacious product cards for premium consumer and image-led catalogs.",
    },
    {
      id: "catalog.dense-wholesale@1",
      name: "Dense wholesale grid",
      description: "Compact scanning for manufacturers, importers, distributors, and broad inventories.",
    },
    {
      id: "catalog.feature-tiles@1",
      name: "Feature tiles",
      description: "Alternating product emphasis for launches, collections, and artisan work.",
    },
    {
      id: "catalog.horizontal-shelf@1",
      name: "Horizontal shelf",
      description: "A browseable product shelf for focused catalogs and mobile-first discovery.",
    },
    {
      id: "catalog.collection-led@1",
      name: "Collection-led catalog",
      description: "A collection-first treatment for furniture, fashion, food ranges, and seasonal goods.",
    },
    {
      id: "catalog.minimal-list@1",
      name: "Minimal specification list",
      description: "A clean information-dense list for equipment, parts, materials, and technical products.",
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
    { id: "header.floating-capsule@1", name: "Floating capsule header", description: "A polished floating command bar for beauty, textile, furniture, and design-led product showrooms." },
    { id: "header.technical-marquee@1", name: "Technical marquee header", description: "A crisp indexed identity bar for technology, manufacturing, wholesale, and specification-led catalogs." },
  ],
  hero: [
    { id: "hero.beauty-orbit@1", name: "Beauty orbit hero", description: "A sculptural cosmetic composition with soft orbital layers and a calm product-first beauty rhythm." },
    { id: "hero.textile-swatch@1", name: "Textile swatch hero", description: "A tactile layered opening for textiles, fashion, upholstery, rugs, and material-rich artisan work." },
    { id: "hero.technology-cinematic@1", name: "Technology cinematic hero", description: "A high-contrast cinematic stage for technology, instruments, equipment, and precise product launches." },
    { id: "hero.room-scene@1", name: "Room scene hero", description: "An immersive room-inspired opening for furniture, lighting, interiors, decor, and architectural products." },
    { id: "hero.ingredient-monograph@1", name: "Ingredient monograph hero", description: "An editorial ingredient study for coffee, honey, food, botanical beauty, agriculture, and provenance-led goods." },
  ],
  navigation: [
    { id: "navigation.visual-chapters@1", name: "Visual chapter navigation", description: "A magazine-like chapter rail for fashion, beauty, furniture, food, and collection-led discovery." },
    { id: "navigation.material-index@1", name: "Material index navigation", description: "A precise material and category index for textiles, furniture, ingredients, manufacturing, and wholesale." },
  ],
  content: [
    { id: "content.lookbook-chapter@1", name: "Lookbook chapter", description: "An expressive editorial chapter for textile, fashion, beauty, artisan, and lifestyle storytelling." },
    { id: "content.exploded-feature@1", name: "Exploded feature", description: "A layered feature breakdown for technology, furniture construction, equipment, and engineered products." },
    { id: "content.ritual-steps@1", name: "Ritual steps", description: "A refined sequence for beauty routines, coffee preparation, food use, care, and customer education." },
    { id: "content.swatch-story@1", name: "Swatch story", description: "A tactile color and material narrative for textiles, finishes, cosmetics, ceramics, and interior products." },
    { id: "content.controlled-film@1", name: "Controlled film chapter", description: "A reviewed video chapter for process, product demonstrations, craft, technology, and manufacturing stories." },
  ],
  catalog: [
    { id: "catalog.beauty-swatch@1", name: "Beauty swatch catalog", description: "Soft sculptural product cards for cosmetics, fragrance, wellness, personal care, and colorful small goods." },
    { id: "catalog.technology-spec@1", name: "Technology specification catalog", description: "Crisp technical cards for devices, equipment, parts, manufacturing, and comparison-oriented product ranges." },
    { id: "catalog.textile-stack@1", name: "Textile stack catalog", description: "Layered material cards for textiles, apparel, rugs, upholstery, artisan work, and finish-rich products." },
    { id: "catalog.room-set@1", name: "Room set catalog", description: "Scene-inspired product groupings for furniture, lighting, homeware, decor, and interior collections." },
  ],
  trust: [
    { id: "trust.material-passport@1", name: "Material passport", description: "A structured material facts panel for textiles, furniture, construction, artisan, and industrial products." },
    { id: "trust.ingredient-ledger@1", name: "Ingredient ledger", description: "A careful supplied-facts ledger for food, coffee, honey, agriculture, botanical beauty, and wellness." },
    { id: "trust.specification-matrix@1", name: "Specification matrix", description: "A high-clarity facts matrix for technology, manufacturing, wholesale, equipment, and trade catalogs." },
  ],
  call_to_action: [
    { id: "call-to-action.magazine-close@1", name: "Magazine close", description: "An editorial inquiry invitation for fashion, beauty, furniture, artisan, food, and lifestyle brands." },
    { id: "call-to-action.technical-brief@1", name: "Technical brief invitation", description: "A focused project and product inquiry close for technology, manufacturing, wholesale, and trade." },
  ],
  footer: [
    { id: "footer.magazine-masthead@1", name: "Magazine masthead footer", description: "A memorable editorial close for textile, beauty, furniture, artisan, food, and collection-rich showrooms." },
    { id: "footer.technical-directory@1", name: "Technical directory footer", description: "A disciplined indexed close for technology, manufacturing, distribution, import, and wholesale catalogs." },
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
  ["linen-luxury", "Linen luxury", "Restrained warmth for fashion, furniture, and premium artisan goods."],
  ["harvest-earth", "Harvest earth", "Natural greens and grain tones for agriculture, food, and producer brands."],
  ["honey-amber", "Honey amber", "Golden warmth for honey, food, ingredients, and welcoming retail."],
  ["coffee-roast", "Coffee roast", "Deep roasted neutrals for coffee, cacao, hospitality goods, and craft."],
  ["artisan-clay", "Artisan clay", "Tactile clay and blush tones for handmade goods, ceramics, and textiles."],
  ["forest-botanical", "Forest botanical", "Rich botanical contrast for natural products, plants, and wellness goods."],
  ["furniture-walnut", "Furniture walnut", "Quiet wood-inspired neutrals for furniture, interiors, and material catalogs."],
  ["industrial-steel", "Industrial steel", "Precise steel and safety accents for manufacturing and equipment."],
  ["maker-indigo", "Maker indigo", "Confident workshop color for makers, tools, textiles, and modern trade."],
  ["ocean-trade", "Ocean trade", "Clear maritime blues for importers, distributors, and regional trade."],
  ["beauty-editorial", "Beauty editorial", "Polished editorial color for beauty, fragrance, and personal care."],
  ["technology-mono", "Technology mono", "High-clarity monochrome with an electric accent for technology."],
  ["vibrant-market", "Vibrant market", "Energetic retail color for broad catalogs and social-first product brands."],
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
  { id: "silk-atelier", name: "Silk atelier", description: "Luminous textile neutrals and saturated thread accents for fashion, fabric, artisan, and upholstery showrooms." },
  { id: "cosmetic-laboratory", name: "Cosmetic laboratory", description: "Clean cosmetic whites with botanical and chromatic accents for beauty, wellness, fragrance, and personal care." },
  { id: "chrome-future", name: "Chrome future", description: "Deep graphite, cool metal, and electric signal color for technology, equipment, and engineered product showrooms." },
  { id: "paper-gallery", name: "Paper gallery", description: "Warm editorial paper and ink tones for furniture, artisan, collection, food, and design-led product stories." },
  { id: "mineral-spa", name: "Mineral spa", description: "Stone, water, and mineral hues for wellness, botanical beauty, ceramics, interiors, and calm premium goods." },
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
