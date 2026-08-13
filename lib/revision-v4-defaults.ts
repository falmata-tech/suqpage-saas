import type {
  RevisionBusiness,
  RevisionCategory,
  RevisionCollection,
  RevisionProduct,
} from "./revision-domain";
import {
  requireRevisionSnapshotV4,
  type RevisionSnapshotV4,
} from "./revision-v4-domain";
import {
  SHOWROOM_COMPONENT_BANK_LATEST,
} from "./showroom-bank-release";
import type {
  SectionSurfaceRole,
  ShowroomComponentDefinitionV2,
  ShowroomDesignProposalV2,
} from "./showroom-composition-v2";
import {
  defaultMediaIntegrationForSection,
  parseShowroomDesignProposalV2,
} from "./showroom-composition-v2";
import type {
  ShowroomBlockMedia,
  ShowroomContentBlock,
  ShowroomContentBlocksDocument,
} from "./showroom-content-blocks";
import type { ShowroomPrimitive } from "./showroom-composition";
import type {
  ShowroomDecorativeDepth,
  ShowroomMotionIntensity,
} from "./showroom-experience";
import {
  denseDemoBusiness,
  type DenseDemoDesignVariant,
} from "./dense-demo-seed";
import { scaleDemoBusiness } from "./scale-demo-seed";
import type {
  SectionMediaIntegration,
  ShowroomColorPalette,
} from "./showroom-design-systems";
import { SHOWROOM_DESIGN_SYSTEMS } from "./showroom-design-systems";
import type { Catalog } from "./types";
import type { ProductDetailPattern } from "./product-detail-patterns";
import {
  ADDITIONAL_SEED_SHOWROOM_BRIEFS,
  type SeedShowroomBrief,
} from "./showroom-seed-briefs";

type DefaultProfile = {
  tokenPack: string;
  motion: ShowroomMotionIntensity;
  decoration: ShowroomDecorativeDepth;
  header: string;
  hero: string;
  story: string;
  highlights: string;
  catalog: string;
  cta: string;
  footer: string;
  ctaVariant: "magazine-close" | "technical-brief";
  heroMediaIntegration: SectionMediaIntegration;
  storyMediaIntegration: SectionMediaIntegration;
  productDetailPattern?: ProductDetailPattern;
  customPalette?: ShowroomColorPalette;
  catalogSearch?: boolean;
};

const DEFAULT_PROFILES: Record<string, DefaultProfile> = {
  alhayabrand: {
    tokenPack: "silk-atelier",
    motion: "quiet",
    decoration: "signature",
    header: "header.editorial-wordmark@1",
    hero: "hero.textile-swatch@1",
    story: "content.swatch-story@1",
    highlights: "content.process-steps@1",
    catalog: "catalog.textile-stack@1",
    cta: "call-to-action.magazine-close@1",
    footer: "footer.editorial@1",
    ctaVariant: "magazine-close",
    heroMediaIntegration: "editorial_overlap",
    storyMediaIntegration: "natural",
  },
  usashopet: {
    tokenPack: "cosmetic-laboratory",
    motion: "expressive",
    decoration: "signature",
    header: "header.floating-capsule@1",
    hero: "hero.beauty-orbit@1",
    story: "content.founder-note@1",
    highlights: "content.ritual-steps@1",
    catalog: "catalog.beauty-swatch@1",
    cta: "call-to-action.magazine-close@1",
    footer: "footer.editorial@1",
    ctaVariant: "magazine-close",
    heroMediaIntegration: "product_stage",
    storyMediaIntegration: "natural",
  },
  novatech: {
    tokenPack: "chrome-future",
    motion: "balanced",
    decoration: "clean",
    header: "header.technical-marquee@1",
    hero: "hero.technology-cinematic@1",
    story: "content.editorial-quote@1",
    highlights: "content.production-metrics@1",
    catalog: "catalog.technology-spec@1",
    cta: "call-to-action.technical-brief@1",
    footer: "footer.technical-directory@1",
    ctaVariant: "technical-brief",
    heroMediaIntegration: "surface_blend",
    storyMediaIntegration: "natural",
  },
  homevibe: {
    tokenPack: "paper-gallery",
    motion: "balanced",
    decoration: "subtle",
    header: "header.catalog-command@1",
    hero: "hero.room-scene@1",
    story: "content.swatch-story@1",
    highlights: "content.process-steps@1",
    catalog: "catalog.room-set@1",
    cta: "call-to-action.magazine-close@1",
    footer: "footer.catalog-directory@1",
    ctaVariant: "magazine-close",
    heroMediaIntegration: "surface_blend",
    storyMediaIntegration: "natural",
  },
};

DEFAULT_PROFILES["selam-weave"] = { ...DEFAULT_PROFILES.alhayabrand };
DEFAULT_PROFILES["afia-botanics"] = { ...DEFAULT_PROFILES.usashopet };
DEFAULT_PROFILES["warka-furniture"] = { ...DEFAULT_PROFILES.homevibe };
DEFAULT_PROFILES["nova-assembly"] = { ...DEFAULT_PROFILES.novatech };
DEFAULT_PROFILES["addis-metalworks"] = {
  ...DEFAULT_PROFILES.novatech,
  tokenPack: "industrial-steel",
  header: "header.compact-utility@1",
  hero: "hero.industrial-spec@1",
  story: "content.origin-story@1",
  highlights: "content.production-metrics@1",
  catalog: "catalog.minimal-list@1",
  footer: "footer.contact-panel@1",
  heroMediaIntegration: "split_bleed",
  storyMediaIntegration: "natural",
};
DEFAULT_PROFILES["green-terrace-farm"] = {
  ...DEFAULT_PROFILES.homevibe,
  tokenPack: "harvest-earth",
  header: "header.producer-badge@1",
  hero: "hero.provenance@1",
  story: "content.origin-story@1",
  highlights: "content.process-steps@1",
  catalog: "catalog.horizontal-shelf@1",
  cta: "call-to-action.wholesale@1",
  footer: "footer.magazine-masthead@1",
  heroMediaIntegration: "edge_fade",
  storyMediaIntegration: "natural",
};
DEFAULT_PROFILES["blue-nile-apiary"] = {
  ...DEFAULT_PROFILES.homevibe,
  tokenPack: "honey-amber",
  header: "header.transparent-overlay@1",
  hero: "hero.ingredient-monograph@1",
  story: "content.origin-story@1",
  highlights: "content.process-steps@1",
  catalog: "catalog.collection-led@1",
  cta: "call-to-action.wholesale@1",
  footer: "footer.compact@1",
  heroMediaIntegration: "surface_blend",
  storyMediaIntegration: "natural",
};
DEFAULT_PROFILES["rift-valley-mill"] = {
  ...DEFAULT_PROFILES.homevibe,
  tokenPack: "coffee-roast",
  header: "header.producer-badge@1",
  hero: "hero.ingredient-monograph@1",
  story: "content.origin-story@1",
  highlights: "content.production-metrics@1",
  catalog: "catalog.collection-led@1",
  cta: "call-to-action.wholesale@1",
  footer: "footer.catalog-directory@1",
  heroMediaIntegration: "natural",
  storyMediaIntegration: "natural",
};
DEFAULT_PROFILES["entoto-ceramics"] = {
  ...DEFAULT_PROFILES.homevibe,
  tokenPack: "artisan-clay",
  header: "header.editorial-wordmark@1",
  hero: "hero.material-detail@1",
  story: "content.material-focus@1",
  catalog: "catalog.editorial-grid@1",
  footer: "footer.editorial@1",
  heroMediaIntegration: "editorial_overlap",
  storyMediaIntegration: "natural",
};
DEFAULT_PROFILES["koba-leather"] = {
  ...DEFAULT_PROFILES.homevibe,
  tokenPack: "maker-indigo",
  header: "header.compact-utility@1",
  hero: "hero.material-detail@1",
  story: "content.material-focus@1",
  highlights: "content.process-steps@1",
  catalog: "catalog.editorial-grid@1",
  footer: "footer.compact@1",
  heroMediaIntegration: "edge_fade",
  storyMediaIntegration: "natural",
};

const FALLBACK_PROFILE: DefaultProfile = {
  tokenPack: "paper-gallery",
  motion: "balanced",
  decoration: "subtle",
  header: "header.floating-capsule@1",
  hero: "hero.ingredient-monograph@1",
  story: "content.lookbook-chapter@1",
  highlights: "content.ritual-steps@1",
  catalog: "catalog.beauty-swatch@1",
  cta: "call-to-action.magazine-close@1",
  footer: "footer.magazine-masthead@1",
  ctaVariant: "magazine-close",
  heroMediaIntegration: "natural",
  storyMediaIntegration: "natural",
};

const DENSE_DEMO_PROFILES: Record<DenseDemoDesignVariant, DefaultProfile> = {
  technical: {
    tokenPack: "industrial-steel",
    motion: "quiet",
    decoration: "clean",
    header: "header.compact-utility@1",
    hero: "hero.industrial-spec@1",
    story: "content.origin-story@1",
    highlights: "content.production-metrics@1",
    catalog: "catalog.minimal-list@1",
    cta: "call-to-action.technical-brief@1",
    footer: "footer.technical-directory@1",
    ctaVariant: "technical-brief",
    heroMediaIntegration: "split_bleed",
    storyMediaIntegration: "natural",
  },
  producer: {
    tokenPack: "forest-botanical",
    motion: "quiet",
    decoration: "subtle",
    header: "header.producer-badge@1",
    hero: "hero.provenance@1",
    story: "content.origin-story@1",
    highlights: "content.process-steps@1",
    catalog: "catalog.horizontal-shelf@1",
    cta: "call-to-action.wholesale@1",
    footer: "footer.catalog-directory@1",
    ctaVariant: "magazine-close",
    heroMediaIntegration: "edge_fade",
    storyMediaIntegration: "natural",
  },
  catalog: {
    tokenPack: "ocean-trade",
    motion: "balanced",
    decoration: "clean",
    header: "header.catalog-command@1",
    hero: "hero.split-story@1",
    story: "content.material-focus@1",
    highlights: "content.process-steps@1",
    catalog: "catalog.editorial-grid@1",
    cta: "call-to-action.inquiry@1",
    footer: "footer.compact@1",
    ctaVariant: "magazine-close",
    heroMediaIntegration: "split_bleed",
    storyMediaIntegration: "natural",
  },
  editorial: {
    tokenPack: "maker-indigo",
    motion: "quiet",
    decoration: "subtle",
    header: "header.editorial-wordmark@1",
    hero: "hero.material-detail@1",
    story: "content.lookbook-chapter@1",
    highlights: "content.process-steps@1",
    catalog: "catalog.feature-tiles@1",
    cta: "call-to-action.consultation@1",
    footer: "footer.editorial@1",
    ctaVariant: "magazine-close",
    heroMediaIntegration: "edge_fade",
    storyMediaIntegration: "natural",
  },
};

function profileFor(catalog: Catalog) {
  const authored = ADDITIONAL_SEED_SHOWROOM_BRIEFS[catalog.business.handle];
  if (authored) return completePalette(authored.profile);
  const denseDemo = denseDemoBusiness(catalog.business.handle);
  if (denseDemo) return completePalette(DENSE_DEMO_PROFILES[denseDemo.designVariant]);
  const scaleDemo = scaleDemoBusiness(catalog.business.handle);
  if (scaleDemo) return completePalette(scaleDemo.brief.profile);
  return completePalette(DEFAULT_PROFILES[catalog.business.handle] || FALLBACK_PROFILE);
}

function completePalette(profile: DefaultProfile): DefaultProfile {
  if (profile.customPalette) return profile;
  const system = SHOWROOM_DESIGN_SYSTEMS[profile.tokenPack];
  if (!system) throw new Error(`Showroom token pack ${profile.tokenPack} is missing.`);
  return { ...profile, customPalette: system.colors };
}

function briefFor(catalog: Catalog): SeedShowroomBrief | null {
  return ADDITIONAL_SEED_SHOWROOM_BRIEFS[catalog.business.handle] ||
    scaleDemoBusiness(catalog.business.handle)?.brief ||
    null;
}

function componentById(id: string) {
  const definition = SHOWROOM_COMPONENT_BANK_LATEST.components.find(
    (component) => component.id === id,
  );
  if (!definition) throw new Error(`Showroom component ${id} is missing.`);
  return definition;
}

function requiredProperties(
  definition: ShowroomComponentDefinitionV2,
  profile: DefaultProfile,
) {
  return Object.fromEntries(
    definition.properties
      .filter((property) => property.required)
      .map((property) => [
        property.key,
        property.key === "motion_intensity"
          ? profile.motion
          : property.key === "decorative_depth"
            ? profile.decoration
            : property.key === "reveal_style"
              ? "fade-rise"
              : property.key === "interaction_style"
                ? "quiet-lift"
                : property.type === "enum"
                  ? property.values[0]
                  : property.type === "boolean"
                    ? false
                    : property.min,
      ]),
  ) as Record<string, ShowroomPrimitive>;
}

function requiredBindings(definition: ShowroomComponentDefinitionV2) {
  return Object.fromEntries(
    definition.bindings
      .filter((binding) => binding.required)
      .map((binding) => [binding.key, binding.allowedSources[0]]),
  );
}

function section(
  key: string,
  componentId: string,
  profile: DefaultProfile,
  contentBlockKey: string | null,
  properties: Record<string, ShowroomPrimitive> = {},
  presentation: {
    mediaIntegration?: SectionMediaIntegration;
    surfaceRole?: SectionSurfaceRole;
  } = {},
) {
  const definition = componentById(componentId);
  return {
    key,
    component: componentId,
    contentBlockKey,
    mediaIntegration:
      presentation.mediaIntegration ??
      defaultMediaIntegrationForSection(definition.slot, definition.id),
    surfaceRole: presentation.surfaceRole,
    properties: {
      ...requiredProperties(definition, profile),
      ...properties,
    },
    bindings: requiredBindings(definition),
  };
}

function firstText(values: Array<string | undefined>, fallback: string) {
  return values.map((value) => value?.trim()).find(Boolean) || fallback;
}

function imageMedia(
  slotKey: "hero_image" | "story_image",
  assetKey: string,
  altText: string,
): ShowroomBlockMedia[] {
  return assetKey
    ? [{ slotKey, assetKeys: [assetKey], altText, caption: "" }]
    : [];
}

function buildContentBlocks(
  catalog: Catalog,
): ShowroomContentBlocksDocument {
  const business = catalog.business;
  const profile = profileFor(catalog);
  const brief = briefFor(catalog);
  const blocks: ShowroomContentBlock[] = [
    {
      key: "hero-main",
      type: "hero",
      kicker: business.tagline,
      title: firstText([business.hero_title, business.name], business.name),
      body: firstText(
        [business.hero_subtitle, business.description],
        "Explore the catalog and send one clear inquiry.",
      ),
      media: imageMedia("hero_image", business.hero_image_path, business.name),
    },
    {
      key: "story-process",
      type: "highlights",
      kicker: brief?.story.kicker || "Story and process",
      title: brief?.story.title || brief?.process.title || `How ${business.name} approaches the work`,
      body: [
        firstText(
          [business.description],
          "A focused product showroom with a direct inquiry path.",
        ),
        brief?.process.body,
      ].filter(Boolean).join("\n\n"),
      media: [],
      items: brief ? brief.process.items.map((title) => ({
        title,
        body: `This stage is used to ${title.toLowerCase()} before production or supply is quoted.`,
      })) : [
        {
          title: "Explore the range",
          body: "Review available products, options, and supplied details.",
        },
        {
          title: "Share the requirement",
          body: "Add products and note quantity, size, finish, or other needs.",
        },
        {
          title: "Confirm the next step",
          body: "The business confirms availability, options, and follow-up after inquiry.",
        },
      ],
    },
    {
      key: "inquiry-next",
      type: "call_to_action",
      kicker: "Next step",
      title: brief?.cta.title || (profile.cta.includes("technical-brief")
        ? "Send the products and requirements your project needs."
        : profile.cta.includes("wholesale")
          ? "Start one clear conversation about products and quantities."
          : "Turn the products that caught your eye into one clear inquiry."),
      body: brief?.cta.body || (profile.cta.includes("technical-brief")
        ? "Add relevant products, then include dimensions, quantities, finish, or operating requirements in the inquiry."
        : "Add selected items to the inquiry cart so the business can confirm availability, options, and next steps."),
      media: [],
      action: "inquiry",
      actionLabel: "Start an inquiry",
    },
  ];
  return { schemaVersion: 1, blocks };
}

function buildDesignManifest(
  catalog: Catalog,
  contentBlocks: ShowroomContentBlocksDocument,
): ShowroomDesignProposalV2 {
  const profile = profileFor(catalog);
  const brief = briefFor(catalog);
  return parseShowroomDesignProposalV2(
    {
      schemaVersion: 2,
      bankRelease: SHOWROOM_COMPONENT_BANK_LATEST.release,
      tokenPack: profile.tokenPack,
      ...(profile.customPalette ? { customPalette: profile.customPalette } : {}),
      rationale: brief
        ? `${brief.objective} Composition direction: ${brief.template}`
        : "Reset-only development cutover to the typed-content showroom bank 1.2 composition.",
      questions: [],
      warnings: [],
      productDetailPattern: profile.productDetailPattern ||
        (profile.ctaVariant === "technical-brief" ? "technical" : "editorial"),
      sections: [
        section("header-1", profile.header, profile, null, {
          density: "comfortable",
          show_tagline: true,
        }, {
          surfaceRole: "surface",
        }),
        section("hero-1", profile.hero, profile, "hero-main", {
          alignment: "start",
        }, {
          mediaIntegration: profile.heroMediaIntegration,
          surfaceRole: "accent-soft",
        }),
        section("content-story-process", profile.highlights, profile, "story-process", {
          alignment: "start",
        }, {
          mediaIntegration: profile.storyMediaIntegration,
          surfaceRole: "secondary-soft",
        }),
        section("catalog-1", profile.catalog, profile, null, {
          show_search: profile.catalogSearch ?? catalog.products.length > 6,
          show_filters: catalog.categories.length > 1,
        }, {
          surfaceRole: "canvas",
        }),
        section("call-to-action-1", profile.cta, profile, "inquiry-next", {
          alignment: profile.ctaVariant === "technical-brief" ? "start" : "center",
        }, {
          surfaceRole: "strong",
        }),
        section("footer-1", profile.footer, profile, null, {
          columns: 3,
          show_tagline: true,
        }, {
          surfaceRole: "inverse",
        }),
      ],
    },
    SHOWROOM_COMPONENT_BANK_LATEST,
    contentBlocks,
    "managed",
  );
}

function catalogToRevisionBase(catalog: Catalog): {
  business: RevisionBusiness;
  collections: RevisionCollection[];
  categories: RevisionCategory[];
  products: RevisionProduct[];
} {
  const collectionKey = (id: number) => `collection-${id}`;
  const categoryKey = (id: number) => `category-${id}`;
  return {
    business: {
      name: catalog.business.name,
      designKey: "composition",
      tagline: catalog.business.tagline,
      description: catalog.business.description,
      logoRef: catalog.business.logo_path,
      heroTitle: catalog.business.hero_title,
      heroSubtitle: catalog.business.hero_subtitle,
      heroImageRef: catalog.business.hero_image_path,
      contactEmail: catalog.business.contact_email,
      whatsapp: catalog.business.whatsapp,
      telegram: catalog.business.telegram,
      tiktok: catalog.business.tiktok,
      processVideoRef: catalog.business.process_video_ref || "",
      isLive: Boolean(catalog.business.is_live),
      livePlatform: catalog.business.live_platform || "",
      liveUrl: catalog.business.live_url || "",
      siteTitle: catalog.business.site_title,
      siteDescription: catalog.business.site_description,
      faviconRef: catalog.business.favicon_path,
    },
    collections: catalog.collections.map((item) => ({
      key: collectionKey(item.id),
      name: item.name,
      slug: item.slug,
      description: item.description,
      sortOrder: item.sort_order,
      active: Boolean(item.is_active),
    })),
    categories: catalog.categories.map((item) => ({
      key: categoryKey(item.id),
      collectionKey: item.collection_id
        ? collectionKey(item.collection_id)
        : null,
      name: item.name,
      slug: item.slug,
      sortOrder: item.sort_order,
      active: Boolean(item.is_active),
    })),
    products: catalog.products.map((item) => ({
      key: `product-${item.id}`,
      collectionKey: item.collection_id
        ? collectionKey(item.collection_id)
        : null,
      categoryKey: item.category_id ? categoryKey(item.category_id) : null,
      name: item.name,
      slug: item.slug,
      eyebrow: item.eyebrow,
      description: item.description,
      imageRef: item.image_path,
      videoRef: item.video_ref || "",
      priceMinor: item.price_minor ?? null,
      currency: "ETB",
      quantityUnit: item.quantity_unit || "",
      highlights: item.highlights || [],
      availability: item.availability,
      offeringKind: item.offering_kind || "standard_product",
      quantityMode: "optional",
      capacitySummary: item.capacity_summary || "",
      minimumOrderSummary: item.minimum_order_summary || "",
      leadTimeSummary: item.lead_time_summary || "",
      published: Boolean(item.is_published),
      sortOrder: item.sort_order,
      optionGroups: (item.option_groups || []).map((group) => ({
        name: group.name,
        values: group.values.map((entry) => entry.value),
      })),
    })),
  };
}

export function catalogToRevisionSnapshotV4(
  catalog: Catalog,
): RevisionSnapshotV4 {
  const content = catalogToRevisionBase(catalog);
  const contentBlocks = buildContentBlocks(catalog);
  const designManifest = buildDesignManifest(catalog, contentBlocks);
  return requireRevisionSnapshotV4(
    {
      schemaVersion: 4,
      ...content,
      contentBlocks,
      designManifest,
    },
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
}
