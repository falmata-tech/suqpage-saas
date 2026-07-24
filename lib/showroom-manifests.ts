import {
  parseShowroomDesignProposal,
  type ShowroomDesignProposal,
  type ShowroomPrimitive,
} from "./showroom-composition";
import {
  SHOWROOM_COMPONENT_BANK,
  resolveShowroomComponentBank,
} from "./showroom-bank-release";
import type {
  ShowroomDecorativeDepth,
  ShowroomMotionIntensity,
} from "./showroom-experience";

export const LEGACY_SHOWROOM_DESIGN_KEYS = [
  "alhaya",
  "usashopet",
  "novatech",
  "homevibe",
] as const;

export type LegacyShowroomDesignKey =
  (typeof LEGACY_SHOWROOM_DESIGN_KEYS)[number];

type CuratedIdentity = LegacyShowroomDesignKey | "composition";

type SectionSeed = {
  component: string;
  properties?: Record<string, ShowroomPrimitive>;
};

type ManifestSeed = {
  tokenPack: string;
  rationale: string;
  motion: ShowroomMotionIntensity;
  decoration: ShowroomDecorativeDepth;
  sections: SectionSeed[];
};

const CURATED_MANIFEST_SEEDS: Record<LegacyShowroomDesignKey, ManifestSeed> = {
  alhaya: {
    tokenPack: "linen-luxury",
    rationale:
      "A quiet editorial composition with tactile warmth and restrained movement for a premium modest-fashion catalog.",
    motion: "quiet",
    decoration: "signature",
    sections: [
      { component: "header.editorial-wordmark@1", properties: { density: "spacious", show_tagline: true } },
      { component: "hero.editorial-collage@1", properties: { alignment: "start", height: 680 } },
      { component: "navigation.minimal-tabs@1", properties: { density: "comfortable" } },
      { component: "content.editorial-quote@1", properties: { alignment: "center" } },
      { component: "catalog.editorial-grid@1", properties: { columns: 3, show_search: true, show_filters: true } },
      { component: "trust.business-principles@1", properties: { columns: 3 } },
      { component: "call-to-action.inquiry@1", properties: { alignment: "center" } },
      { component: "footer.editorial@1", properties: { columns: 3, show_tagline: true } },
    ],
  },
  usashopet: {
    tokenPack: "beauty-editorial",
    rationale:
      "An energetic beauty-editorial composition that keeps discovery playful while preserving a direct inquiry path.",
    motion: "expressive",
    decoration: "signature",
    sections: [
      { component: "header.catalog-command@1", properties: { density: "compact", show_tagline: true } },
      { component: "hero.collection-mosaic@1", properties: { alignment: "start", height: 620 } },
      { component: "navigation.category-pills@1", properties: { density: "compact" } },
      { component: "content.founder-note@1", properties: { alignment: "start" } },
      { component: "catalog.feature-tiles@1", properties: { columns: 3, show_search: true, show_filters: true } },
      { component: "trust.product-details@1", properties: { columns: 3 } },
      { component: "call-to-action.inquiry@1", properties: { alignment: "center" } },
      { component: "footer.contact-panel@1", properties: { columns: 3, show_tagline: true } },
    ],
  },
  novatech: {
    tokenPack: "technology-mono",
    rationale:
      "A precise product-led technology composition with crisp hierarchy, controlled energy, and specification-friendly browsing.",
    motion: "balanced",
    decoration: "clean",
    sections: [
      { component: "header.compact-utility@1", properties: { density: "compact", show_tagline: false } },
      { component: "hero.product-spotlight@1", properties: { alignment: "center", height: 640 } },
      { component: "navigation.catalog-index@1", properties: { density: "compact" } },
      { component: "content.production-metrics@1", properties: { alignment: "start" } },
      { component: "catalog.minimal-list@1", properties: { columns: 2, show_search: true, show_filters: true } },
      { component: "trust.product-details@1", properties: { columns: 3 } },
      { component: "call-to-action.consultation@1", properties: { alignment: "start" } },
      { component: "footer.compact@1", properties: { columns: 2, show_tagline: false } },
    ],
  },
  homevibe: {
    tokenPack: "furniture-walnut",
    rationale:
      "A warm material-led home composition with calm editorial pacing and a tactile collection-first catalog.",
    motion: "balanced",
    decoration: "subtle",
    sections: [
      { component: "header.producer-badge@1", properties: { density: "comfortable", show_tagline: true } },
      { component: "hero.material-detail@1", properties: { alignment: "start", height: 700 } },
      { component: "navigation.collection-rail@1", properties: { density: "spacious" } },
      { component: "content.material-focus@1", properties: { alignment: "start" } },
      { component: "catalog.collection-led@1", properties: { columns: 3, show_search: true, show_filters: true } },
      { component: "trust.care-guide@1", properties: { columns: 3 } },
      { component: "call-to-action.consultation@1", properties: { alignment: "start" } },
      { component: "footer.editorial@1", properties: { columns: 3, show_tagline: true } },
    ],
  },
};

const componentById = new Map(
  SHOWROOM_COMPONENT_BANK.components.map((component) => [
    component.id,
    component,
  ]),
);

function buildManifest(seed: ManifestSeed): ShowroomDesignProposal {
  return parseShowroomDesignProposal(
    {
      schemaVersion: 1,
      bankRelease: SHOWROOM_COMPONENT_BANK.release,
      tokenPack: seed.tokenPack,
      rationale: seed.rationale,
      questions: [],
      warnings: [],
      sections: seed.sections.map((section, index) => {
        const definition = componentById.get(section.component);
        if (!definition) {
          throw new Error(`Curated showroom component ${section.component} is missing.`);
        }
        const requiredProperties = Object.fromEntries(
          definition.properties
            .filter((property) => property.required)
            .map((property) => [
              property.key,
              property.key === "motion_intensity"
                ? seed.motion
                : property.key === "decorative_depth"
                  ? seed.decoration
                  : property.type === "enum"
                    ? property.values[0]
                    : property.type === "boolean"
                      ? false
                      : property.min,
            ]),
        );
        const bindings = Object.fromEntries(
          definition.bindings
            .filter((binding) => binding.required)
            .map((binding) => [binding.key, binding.allowedSources[0]]),
        );
        return {
          key: `${definition.slot}-${index + 1}`,
          component: section.component,
          properties: { ...requiredProperties, ...section.properties },
          bindings,
        };
      }),
    },
    SHOWROOM_COMPONENT_BANK,
  );
}

const CURATED_MANIFESTS = Object.freeze(
  Object.fromEntries(
    LEGACY_SHOWROOM_DESIGN_KEYS.map((designKey) => [
      designKey,
      buildManifest(CURATED_MANIFEST_SEEDS[designKey]),
    ]),
  ) as Record<LegacyShowroomDesignKey, ShowroomDesignProposal>,
);

export function isLegacyShowroomDesignKey(
  value: unknown,
): value is LegacyShowroomDesignKey {
  return (
    typeof value === "string" &&
    LEGACY_SHOWROOM_DESIGN_KEYS.includes(value as LegacyShowroomDesignKey)
  );
}

export function parsePublishedDesignManifest(
  input: unknown,
): ShowroomDesignProposal {
  let candidate: unknown = input;
  if (typeof input === "string") {
    try {
      candidate = JSON.parse(input);
    } catch {
      candidate = input;
    }
  }
  const release =
    candidate && typeof candidate === "object" && !Array.isArray(candidate)
      ? (candidate as Record<string, unknown>).bankRelease
      : undefined;
  return parseShowroomDesignProposal(
    input,
    resolveShowroomComponentBank(release),
  );
}

export function curatedManifestForLegacyDesign(
  designKey: LegacyShowroomDesignKey,
): ShowroomDesignProposal {
  return structuredClone(CURATED_MANIFESTS[designKey]);
}

export function resolveDesignManifest(
  designKey: CuratedIdentity | string,
  manifestInput?: unknown,
): ShowroomDesignProposal {
  if (designKey === "composition") {
    if (manifestInput === undefined || manifestInput === null || manifestInput === "") {
      throw new Error("A composition showroom requires a design manifest.");
    }
    return parsePublishedDesignManifest(manifestInput);
  }
  if (!isLegacyShowroomDesignKey(designKey)) {
    throw new Error("The showroom design identity is not supported.");
  }
  return curatedManifestForLegacyDesign(designKey);
}
