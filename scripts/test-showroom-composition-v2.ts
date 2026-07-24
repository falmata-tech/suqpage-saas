import assert from "node:assert/strict";
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
const malformedBank = structuredClone(bankInput) as unknown as ShowroomComponentBankV2;
delete (malformedBank.components[0] as Partial<ShowroomComponentBankV2["components"][number]>).acceptedContentTypes;
expectCode(() => parseShowroomComponentBankV2(malformedBank), "invalid_content_types");

console.log("Additive design-v2 component compatibility, exact block assignment, and bank-v1 isolation passed.");
