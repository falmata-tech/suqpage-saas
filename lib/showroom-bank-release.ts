import {
  parseShowroomComponentBank,
  type ShowroomBindingDefinition,
  type ShowroomCapability,
  type ShowroomComponentDefinition,
  type ShowroomPropertyDefinition,
  type ShowroomSlot,
} from "./showroom-composition";

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
  return seeds.map((seed) => ({
    ...seed,
    slot,
    codeReference,
    repeatable: slot === "content" || slot === "trust",
    providesCapabilities: [...providesCapabilities],
    incompatibleWith: [],
    properties: properties.map((entry) => ({ ...entry })),
    bindings: bindings.map((entry) => ({
      ...entry,
      allowedSources: [...entry.allowedSources],
    })),
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

export const SHOWROOM_COMPONENT_BANK = deepFreeze(
  parseShowroomComponentBank({
    schemaVersion: 1,
    release: "showroom-bank@1.0.0",
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

export const SHOWROOM_BANK_BASE_COMBINATION_FLOOR =
  SHOWROOM_COMPONENT_BANK.requiredSlots.reduce(
    (total, slot) =>
      total *
      SHOWROOM_COMPONENT_BANK.components.filter(
        (component) => component.slot === slot,
      ).length,
    SHOWROOM_COMPONENT_BANK.tokenPacks.length,
  );
