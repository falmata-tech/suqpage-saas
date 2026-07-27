import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ShowroomCompositionError,
  parseShowroomComponentBank,
} from "../lib/showroom-composition";
import {
  parseShowroomComponentBankV2,
  parseShowroomDesignProposalV2,
  type ShowroomComponentBankV2,
} from "../lib/showroom-composition-v2";
import { SHOWROOM_COMPONENT_BANK_1_1 } from "../lib/showroom-bank-release";
import { curatedManifestForLegacyDesign } from "../lib/showroom-manifests";

const acceptedBySlot = {
  header: [],
  hero: ["hero"],
  navigation: [],
  content: ["story", "highlights"],
  catalog: [],
  trust: ["information"],
  call_to_action: ["call_to_action"],
  footer: [],
} as const;

const bankInput = {
  ...SHOWROOM_COMPONENT_BANK_1_1,
  schemaVersion: 2,
  release: "showroom-bank@1.2.0",
  components: SHOWROOM_COMPONENT_BANK_1_1.components.map((component) => ({
    ...component,
    acceptedContentTypes: [...acceptedBySlot[component.slot]],
    contentMediaSlots:
      component.slot === "hero"
        ? [{ key: "hero_image", label: "Hero image", required: false, acceptedKinds: ["image"], minItems: 0, maxItems: 1, aspectRatio: "landscape" }]
        : component.slot === "content" || component.slot === "trust"
          ? [{ key: "story_image", label: "Story image", required: false, acceptedKinds: ["image"], minItems: 0, maxItems: 1, aspectRatio: "any" }]
          : [],
  })),
};
const bank = parseShowroomComponentBankV2(bankInput);
assert.equal(bank.schemaVersion, 2);
assert.equal(bank.components.length, SHOWROOM_COMPONENT_BANK_1_1.components.length);
assert.equal(parseShowroomComponentBank(SHOWROOM_COMPONENT_BANK_1_1).release, "showroom-bank@1.1.0");

const content = {
  schemaVersion: 1,
  blocks: [
    { key: "opening", type: "hero", kicker: "Collection", title: "Material and form", body: "A reviewed opening.", media: [] },
    { key: "story", type: "story", kicker: "Story", title: "Made with intent", body: "A reviewed story.", media: [], quote: "Designed for daily life." },
    { key: "facts", type: "information", kicker: "Details", title: "What to know", body: "Reviewed information.", media: [], items: [{ label: "Material", value: "Client supplied." }] },
    { key: "next", type: "call_to_action", kicker: "Next", title: "Ask about the collection", body: "Start a product inquiry.", media: [], action: "inquiry", actionLabel: "Start an inquiry" },
  ],
} as const;
const blockForSlot = {
  header: null,
  hero: "opening",
  navigation: null,
  content: "story",
  catalog: null,
  trust: "facts",
  call_to_action: "next",
  footer: null,
} as const;
const manifest = curatedManifestForLegacyDesign("alhaya");
const proposal = {
  ...manifest,
  schemaVersion: 2,
  bankRelease: bank.release,
  sections: manifest.sections.map((section) => {
    const definition = bank.components.find((component) => component.id === section.component);
    assert.ok(definition);
    return { ...section, contentBlockKey: blockForSlot[definition.slot] };
  }),
};

const parsed = parseShowroomDesignProposalV2(proposal, bank, content);
assert.equal(parsed.schemaVersion, 2);
assert.deepEqual(
  parsed.sections.map((section) => section.contentBlockKey).filter(Boolean),
  ["opening", "story", "facts", "next"],
);
const parsedHero = parsed.sections.find((section) => section.contentBlockKey === "opening");
const parsedStory = parsed.sections.find((section) => section.contentBlockKey === "story");
assert.equal(parsedHero?.mediaIntegration, "editorial_overlap");
assert.equal(parsedStory?.mediaIntegration, "edge_fade");

const ambientProposal = {
  ...proposal,
  sections: proposal.sections.map((section) =>
    section.contentBlockKey === "opening"
      ? { ...section, mediaIntegration: "ambient_overlay" }
      : section
  ),
};
assert.equal(
  parseShowroomDesignProposalV2(ambientProposal, bank, content).sections.find(
    (section) => section.contentBlockKey === "opening",
  )?.mediaIntegration,
  "ambient_overlay",
);

function expectCode(callback: () => unknown, code: string) {
  assert.throws(
    callback,
    (error: unknown) => error instanceof ShowroomCompositionError && error.code === code,
  );
}

const heroIndex = parsed.sections.findIndex((section) => section.contentBlockKey === "opening");
expectCode(
  () => parseShowroomDesignProposalV2({ ...proposal, sections: proposal.sections.map((section, index) => index === heroIndex ? { ...section, contentBlockKey: "story" } : section) }, bank, content),
  "incompatible_content",
);
expectCode(
  () => parseShowroomDesignProposalV2({ ...proposal, sections: proposal.sections.map((section, index) => index === heroIndex ? { ...section, contentBlockKey: null } : section) }, bank, content),
  "missing_content",
);
expectCode(
  () =>
    parseShowroomDesignProposalV2(
      {
        ...proposal,
        sections: proposal.sections.map((section) =>
          section.contentBlockKey === "opening"
            ? { ...section, mediaIntegration: "picture_frame" }
            : section,
        ),
      },
      bank,
      content,
    ),
  "invalid_media_integration",
);
expectCode(
  () =>
    parseShowroomDesignProposalV2(
      {
        ...proposal,
        sections: proposal.sections.map((section, index) =>
          index === 0
            ? { ...section, mediaIntegration: "ambient_overlay" }
            : section,
        ),
      },
      bank,
      content,
    ),
  "incompatible_media_integration",
);
const contentSection = proposal.sections.find((section) => section.contentBlockKey === "story");
assert.ok(contentSection);
expectCode(
  () => parseShowroomDesignProposalV2({ ...proposal, sections: [...proposal.sections, { ...contentSection, key: "story-repeat" }] }, bank, content),
  "duplicate_content_assignment",
);
expectCode(
  () => parseShowroomDesignProposalV2(proposal, bank, { ...content, blocks: [...content.blocks, { ...content.blocks[1], key: "unused-story" }] }),
  "orphan_content",
);
expectCode(
  () => parseShowroomDesignProposalV2(proposal, bank, { ...content, blocks: content.blocks.map((block) => block.key === "opening" ? { ...block, media: [{ slotKey: "unsupported", assetKeys: ["asset_0123456789abcdefabcd"], altText: "A supplied image", caption: "" }] } : block) }),
  "incompatible_content_media",
);
const malformedBank = structuredClone(bankInput) as unknown as ShowroomComponentBankV2;
delete (malformedBank.components[0] as Partial<ShowroomComponentBankV2["components"][number]>).acceptedContentTypes;
expectCode(() => parseShowroomComponentBankV2(malformedBank), "invalid_content_types");

for (const schemaPath of [
  "showroom-sdk/component-bank-v2.schema.json",
  "showroom-sdk/showroom-proposal-v2.schema.json",
]) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8")) as {
    $schema?: string;
    additionalProperties?: boolean;
  };
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.additionalProperties, false);
}
const bankSchemaSource = fs.readFileSync(
  "showroom-sdk/component-bank-v2.schema.json",
  "utf8",
);
assert.match(bankSchemaSource, /acceptedContentTypes/);
assert.match(bankSchemaSource, /contentMediaSlots/);
assert.match(bankSchemaSource, /component-bank\.schema\.json#\/\$defs\/property/);
const designSchemaSource = fs.readFileSync(
  "showroom-sdk/showroom-proposal-v2.schema.json",
  "utf8",
);
assert.match(designSchemaSource, /contentBlockKey/);
assert.match(designSchemaSource, /mediaIntegration/);
assert.match(designSchemaSource, /ambient_overlay/);

console.log("Additive design-v2 component compatibility, exact block assignment, and bank-v1 isolation passed.");
