import assert from "node:assert/strict";
import {
  REVISION_SCHEMA_VERSION_V4,
  parseRevisionSnapshotV4,
} from "../lib/revision-v4-domain";
import { RevisionError } from "../lib/revision-domain";
import { SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE } from "../lib/showroom-bank-release";

const block = {
  key: "opening",
  type: "hero",
  kicker: "Collection",
  title: "Material and form",
  body: "A reviewed opening.",
  media: [],
} as const;
const hero = SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.find(
  (component) => component.slot === "hero" && component.acceptedContentTypes.includes("hero"),
)!;
type CandidateComponent = (typeof SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components)[number];
const required = (component: CandidateComponent) => ({
  properties: Object.fromEntries(
    component.properties
      .filter((property) => property.required)
      .map((property) => [
        property.key,
        property.type === "enum"
          ? property.values[0]
          : property.type === "boolean"
            ? false
            : property.min,
      ]),
  ),
  bindings: Object.fromEntries(
    component.bindings
      .filter((binding) => binding.required)
      .map((binding) => [binding.key, binding.allowedSources[0]]),
  ),
});
const requiredComponents = ["header", "hero", "catalog", "footer"].map((slot) =>
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.find(
    (component) => component.slot === slot && (slot !== "hero" || component.id === hero.id),
  )!,
);
const input = {
  schemaVersion: REVISION_SCHEMA_VERSION_V4,
  business: {
    name: "Textile House",
    designKey: "composition",
    tagline: "Woven locally",
    description: "A client-approved textile story.",
    logoRef: "",
    heroTitle: "Textile House",
    heroSubtitle: "Reviewed collections",
    heroImageRef: "",
    contactEmail: "hello@example.test",
    whatsapp: "",
    telegram: "",
    tiktok: "",
    siteTitle: "Textile House",
    siteDescription: "Reviewed textile collections.",
    faviconRef: "",
  },
  collections: [],
  categories: [],
  products: [],
  contentBlocks: { schemaVersion: 1, blocks: [block] },
  designManifest: {
    schemaVersion: 2,
    bankRelease: SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.release,
    tokenPack: SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.tokenPacks[0].id,
    rationale: "A bounded textile opening.",
    questions: [],
    warnings: [],
    sections: requiredComponents.map((component, index) => ({
      key: `${component.slot}-${index + 1}`,
      component: component.id,
      ...required(component),
      contentBlockKey: component.slot === "hero" ? block.key : null,
    })),
  },
};

const parsed = parseRevisionSnapshotV4(input, SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE);
assert.equal(parsed.schemaVersion, 4);
assert.equal(parsed.contentBlocks.blocks[0].type, "hero");
assert.equal(
  parsed.designManifest.sections.find((section) => section.component === hero.id)?.contentBlockKey,
  "opening",
);

assert.throws(
  () => parseRevisionSnapshotV4({ ...input, unexpected: true }, SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE),
  RevisionError,
);
assert.throws(
  () => parseRevisionSnapshotV4({ ...input, schemaVersion: 3 }, SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE),
  RevisionError,
);
assert.throws(
  () =>
    parseRevisionSnapshotV4(
      {
        ...input,
        contentBlocks: {
          schemaVersion: 1,
          blocks: [{ ...block, body: "https://untrusted.example" }],
        },
      },
      SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
    ),
  RevisionError,
);
assert.throws(
  () =>
    parseRevisionSnapshotV4(
      {
        ...input,
        designManifest: {
          ...input.designManifest,
          sections: input.designManifest.sections.map((section) => ({
            ...section,
            contentBlockKey: section.contentBlockKey === "opening" ? null : section.contentBlockKey,
          })),
        },
      },
      SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
    ),
  RevisionError,
);

console.log("Revision-v4 typed content and design-v2 isolation tests passed.");
