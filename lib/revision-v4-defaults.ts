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
  ShowroomComponentDefinitionV2,
  ShowroomDesignProposalV2,
} from "./showroom-composition-v2";
import { parseShowroomDesignProposalV2 } from "./showroom-composition-v2";
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
import type { Catalog } from "./types";

type DefaultProfile = {
  tokenPack: string;
  motion: ShowroomMotionIntensity;
  decoration: ShowroomDecorativeDepth;
  header: string;
  hero: string;
  navigation: string;
  story: string;
  highlights: string;
  catalog: string;
  trust: string;
  cta: string;
  footer: string;
  ctaVariant: "magazine-close" | "technical-brief";
};

const DEFAULT_PROFILES: Record<string, DefaultProfile> = {
  alhayabrand: {
    tokenPack: "silk-atelier",
    motion: "quiet",
    decoration: "signature",
    header: "header.floating-capsule@1",
    hero: "hero.textile-swatch@1",
    navigation: "navigation.material-index@1",
    story: "content.swatch-story@1",
    highlights: "content.lookbook-chapter@1",
    catalog: "catalog.textile-stack@1",
    trust: "trust.material-passport@1",
    cta: "call-to-action.magazine-close@1",
    footer: "footer.magazine-masthead@1",
    ctaVariant: "magazine-close",
  },
  usashopet: {
    tokenPack: "cosmetic-laboratory",
    motion: "expressive",
    decoration: "signature",
    header: "header.floating-capsule@1",
    hero: "hero.beauty-orbit@1",
    navigation: "navigation.visual-chapters@1",
    story: "content.ritual-steps@1",
    highlights: "content.lookbook-chapter@1",
    catalog: "catalog.beauty-swatch@1",
    trust: "trust.ingredient-ledger@1",
    cta: "call-to-action.magazine-close@1",
    footer: "footer.magazine-masthead@1",
    ctaVariant: "magazine-close",
  },
  novatech: {
    tokenPack: "chrome-future",
    motion: "balanced",
    decoration: "clean",
    header: "header.technical-marquee@1",
    hero: "hero.technology-cinematic@1",
    navigation: "navigation.material-index@1",
    story: "content.exploded-feature@1",
    highlights: "content.ritual-steps@1",
    catalog: "catalog.technology-spec@1",
    trust: "trust.specification-matrix@1",
    cta: "call-to-action.technical-brief@1",
    footer: "footer.technical-directory@1",
    ctaVariant: "technical-brief",
  },
  homevibe: {
    tokenPack: "paper-gallery",
    motion: "balanced",
    decoration: "subtle",
    header: "header.floating-capsule@1",
    hero: "hero.room-scene@1",
    navigation: "navigation.visual-chapters@1",
    story: "content.swatch-story@1",
    highlights: "content.lookbook-chapter@1",
    catalog: "catalog.room-set@1",
    trust: "trust.material-passport@1",
    cta: "call-to-action.magazine-close@1",
    footer: "footer.magazine-masthead@1",
    ctaVariant: "magazine-close",
  },
};

const FALLBACK_PROFILE: DefaultProfile = {
  tokenPack: "paper-gallery",
  motion: "balanced",
  decoration: "subtle",
  header: "header.floating-capsule@1",
  hero: "hero.ingredient-monograph@1",
  navigation: "navigation.visual-chapters@1",
  story: "content.lookbook-chapter@1",
  highlights: "content.ritual-steps@1",
  catalog: "catalog.beauty-swatch@1",
  trust: "trust.material-passport@1",
  cta: "call-to-action.magazine-close@1",
  footer: "footer.magazine-masthead@1",
  ctaVariant: "magazine-close",
};

function profileFor(catalog: Catalog) {
  return DEFAULT_PROFILES[catalog.business.handle] || FALLBACK_PROFILE;
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
) {
  const definition = componentById(componentId);
  return {
    key,
    component: componentId,
    contentBlockKey,
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
  const firstProduct = catalog.products[0];
  const highlightedProducts = catalog.products.slice(0, 3);
  const highlightItems = (
    highlightedProducts.length
      ? highlightedProducts.map((product) => ({
          title: product.name,
          body: product.eyebrow || product.description || "Available for inquiry.",
        }))
      : catalog.categories.slice(0, 3).map((category) => ({
          title: category.name,
          body: "Browse this showroom chapter and send one clear inquiry.",
        }))
  ).slice(0, 3);
  const contact = firstText(
    [
      business.whatsapp && `WhatsApp ${business.whatsapp}`,
      business.telegram && `Telegram @${business.telegram}`,
      business.contact_email,
      business.tiktok && `TikTok @${business.tiktok}`,
    ],
    "Inquiry confirmation through SuqPage",
  );
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
      key: "brand-story",
      type: "story",
      kicker: "Showroom story",
      title: business.name,
      body: firstText(
        [business.description],
        "A focused product showroom with a direct inquiry path.",
      ),
      media: imageMedia(
        "story_image",
        firstProduct?.image_path || business.hero_image_path,
        firstProduct?.name || business.name,
      ),
      quote: firstText([business.tagline], "Selected with care."),
    },
    {
      key: "showroom-highlights",
      type: "highlights",
      kicker: "Highlights",
      title: "What to notice first",
      body: "A short guide to the products and categories that shape this showroom.",
      media: [],
      items: highlightItems.length
        ? highlightItems
        : [{ title: business.name, body: "Browse the catalog to start." }],
    },
    {
      key: "showroom-information",
      type: "information",
      kicker: "Details",
      title: "Useful showroom information",
      body: "The core facts customers need before starting an inquiry.",
      media: [],
      items: [
        { label: "Contact", value: contact },
        {
          label: "Catalog",
          value: `${catalog.products.length} products across ${Math.max(
            catalog.categories.length,
            1,
          )} categories`,
        },
        { label: "Confirmation", value: "Availability is confirmed after inquiry." },
      ],
    },
    {
      key: "inquiry-next",
      type: "call_to_action",
      kicker: "Next step",
      title: "Bring selected products into one clear conversation.",
      body: "Add items to the inquiry cart and the business can confirm availability, options, and next steps.",
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
  return parseShowroomDesignProposalV2(
    {
      schemaVersion: 2,
      bankRelease: SHOWROOM_COMPONENT_BANK_LATEST.release,
      tokenPack: profile.tokenPack,
      rationale:
        "Reset-only development cutover to the typed-content showroom bank 1.2 composition.",
      questions: [],
      warnings: [],
      sections: [
        section("header-1", profile.header, profile, null, {
          density: "comfortable",
          show_tagline: true,
        }),
        section("hero-1", profile.hero, profile, "hero-main", {
          alignment: "start",
          height: 680,
        }),
        section("navigation-1", profile.navigation, profile, null, {
          density: "comfortable",
        }),
        section("content-story", profile.story, profile, "brand-story", {
          alignment: "start",
        }),
        section("content-highlights", profile.highlights, profile, "showroom-highlights", {
          alignment: "start",
        }),
        section("catalog-1", profile.catalog, profile, null, {
          columns: 3,
          show_search: true,
          show_filters: true,
        }),
        section("trust-1", profile.trust, profile, "showroom-information", {
          columns: 3,
        }),
        section("call-to-action-1", profile.cta, profile, "inquiry-next", {
          alignment: profile.ctaVariant === "technical-brief" ? "start" : "center",
        }),
        section("footer-1", profile.footer, profile, null, {
          columns: 3,
          show_tagline: true,
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
      availability: item.availability,
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
