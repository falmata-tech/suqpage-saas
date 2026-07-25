import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MAX_SHOWROOM_PROPOSAL_BYTES,
  ShowroomCompositionError,
  parseShowroomComponentBank,
  parseShowroomDesignProposal,
} from "../lib/showroom-composition";

const bankFixture = {
  schemaVersion: 1,
  release: "showroom-bank@1.0.0",
  components: [
    {
      id: "header.clean@1",
      name: "Clean header",
      description: "A bounded header with brand identity and inquiry access.",
      slot: "header",
      codeReference: "components/showroom/bank/header/CleanHeader.tsx",
      repeatable: false,
      providesCapabilities: ["inquiry_cart_trigger"],
      incompatibleWith: [],
      properties: [
        {
          key: "density",
          label: "Header density",
          type: "enum",
          required: true,
          values: ["compact", "comfortable"],
        },
        {
          key: "sticky",
          label: "Sticky header",
          type: "boolean",
          required: false,
        },
      ],
      bindings: [
        {
          key: "brand",
          label: "Brand name",
          required: true,
          allowedSources: ["business.name"],
        },
        {
          key: "logo",
          label: "Brand logo",
          required: false,
          allowedSources: ["business.logo"],
        },
      ],
      mediaSlots: [],
    },
    {
      id: "hero.split@1",
      name: "Split hero",
      description: "A split text and image hero for a strong first impression.",
      slot: "hero",
      codeReference: "components/showroom/bank/hero/SplitHero.tsx",
      repeatable: false,
      providesCapabilities: [],
      incompatibleWith: [],
      properties: [
        {
          key: "image_side",
          label: "Image side",
          type: "enum",
          required: true,
          values: ["left", "right"],
        },
        {
          key: "height",
          label: "Hero height",
          type: "integer",
          required: true,
          min: 320,
          max: 720,
        },
      ],
      bindings: [
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
          required: true,
          allowedSources: ["business.hero_image"],
        },
      ],
      mediaSlots: [
        {
          key: "hero_image",
          label: "Hero image",
          source: "business.hero_image",
          required: true,
          acceptedKinds: ["image"],
          minItems: 1,
          maxItems: 1,
          aspectRatio: "landscape",
        },
      ],
    },
    {
      id: "catalog.editorial-grid@1",
      name: "Editorial product grid",
      description: "A searchable product grid with category and inquiry actions.",
      slot: "catalog",
      codeReference:
        "components/showroom/bank/catalog/EditorialProductGrid.tsx",
      repeatable: false,
      providesCapabilities: [
        "catalog_search",
        "category_filter",
        "product_detail",
        "add_to_inquiry",
      ],
      incompatibleWith: [],
      properties: [
        {
          key: "columns",
          label: "Desktop columns",
          type: "integer",
          required: true,
          min: 2,
          max: 5,
        },
        {
          key: "show_filters",
          label: "Show category filters",
          type: "boolean",
          required: true,
        },
      ],
      bindings: [
        {
          key: "products",
          label: "Product list",
          required: true,
          allowedSources: ["catalog.products", "catalog.featured_products"],
        },
        {
          key: "categories",
          label: "Category list",
          required: true,
          allowedSources: ["catalog.categories"],
        },
      ],
      mediaSlots: [],
    },
    {
      id: "content.story@1",
      name: "Brand story",
      description: "An optional narrative section using the business description.",
      slot: "content",
      codeReference: "components/showroom/bank/content/BrandStory.tsx",
      repeatable: false,
      providesCapabilities: [],
      incompatibleWith: ["trust.credentials@1"],
      properties: [],
      bindings: [
        {
          key: "body",
          label: "Story body",
          required: true,
          allowedSources: ["business.description"],
        },
      ],
      mediaSlots: [],
    },
    {
      id: "trust.credentials@1",
      name: "Credentials",
      description: "An optional trust section backed by approved business text.",
      slot: "trust",
      codeReference: "components/showroom/bank/trust/Credentials.tsx",
      repeatable: false,
      providesCapabilities: [],
      incompatibleWith: ["content.story@1"],
      properties: [],
      bindings: [
        {
          key: "body",
          label: "Trust content",
          required: true,
          allowedSources: ["business.description"],
        },
      ],
      mediaSlots: [],
    },
    {
      id: "footer.contact@1",
      name: "Contact footer",
      description: "A closing section using canonical contact methods.",
      slot: "footer",
      codeReference: "components/showroom/bank/footer/ContactFooter.tsx",
      repeatable: false,
      providesCapabilities: [],
      incompatibleWith: [],
      properties: [],
      bindings: [
        {
          key: "contacts",
          label: "Contact methods",
          required: true,
          allowedSources: ["business.contact_methods"],
        },
      ],
      mediaSlots: [],
    },
  ],
  tokenPacks: [
    {
      id: "earth-olive",
      name: "Earth and olive",
      description: "Warm neutrals with restrained olive accents.",
    },
    {
      id: "bright-editorial",
      name: "Bright editorial",
      description: "High-contrast editorial presentation for product imagery.",
    },
  ],
  requiredSlots: ["header", "hero", "catalog", "footer"],
  requiredCapabilities: [
    "catalog_search",
    "category_filter",
    "product_detail",
    "add_to_inquiry",
    "inquiry_cart_trigger",
  ],
};

const proposalFixture = {
  schemaVersion: 1,
  bankRelease: "showroom-bank@1.0.0",
  tokenPack: "earth-olive",
  rationale:
    "The split hero leads into an editorial grid while preserving all inquiry behavior.",
  questions: ["Should the hero use the supplied product image or brand image?"],
  warnings: [],
  sections: [
    {
      key: "main-header",
      component: "header.clean@1",
      properties: { density: "comfortable", sticky: true },
      bindings: { brand: "business.name", logo: "business.logo" },
    },
    {
      key: "main-hero",
      component: "hero.split@1",
      properties: { image_side: "right", height: 560 },
      bindings: {
        title: "business.hero_title",
        subtitle: "business.hero_subtitle",
        image: "business.hero_image",
      },
    },
    {
      key: "main-catalog",
      component: "catalog.editorial-grid@1",
      properties: { columns: 3, show_filters: true },
      bindings: {
        products: "catalog.products",
        categories: "catalog.categories",
      },
    },
    {
      key: "main-footer",
      component: "footer.contact@1",
      properties: {},
      bindings: { contacts: "business.contact_methods" },
    },
  ],
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function expectCompositionError(
  operation: () => unknown,
  expectedCode: string,
): void {
  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof ShowroomCompositionError);
    assert.equal(error.code, expectedCode);
    return true;
  });
}

const bank = parseShowroomComponentBank(clone(bankFixture));
assert.equal(bank.release, "showroom-bank@1.0.0");
assert.equal(bank.components.length, 6);
assert.deepEqual(
  parseShowroomComponentBank(clone(bankFixture)),
  bank,
  "bank normalization must be deterministic",
);

const proposal = parseShowroomDesignProposal(
  JSON.stringify(proposalFixture),
  bank,
);
assert.equal(proposal.sections.length, 4);
assert.equal(proposal.sections[2].properties.columns, 3);
assert.deepEqual(
  parseShowroomDesignProposal(clone(proposalFixture), clone(bankFixture)),
  proposal,
  "proposal normalization must be deterministic",
);

const executableField = {
  ...clone(proposalFixture),
  rawCss: "body { display: none }",
};
expectCompositionError(
  () => parseShowroomDesignProposal(executableField, bank),
  "unknown_field",
);

const externalLocator = clone(proposalFixture) as {
  rationale: string;
};
externalLocator.rationale = "Load javascript:alert(1)";
expectCompositionError(
  () => parseShowroomDesignProposal(externalLocator, bank),
  "unsafe_value",
);

const rawMarkup = clone(proposalFixture) as {
  warnings: string[];
};
rawMarkup.warnings = ["Use <script> for the interaction."];
expectCompositionError(
  () => parseShowroomDesignProposal(rawMarkup, bank),
  "unsafe_value",
);

const wrongRelease = clone(proposalFixture) as {
  bankRelease: string;
};
wrongRelease.bankRelease = "showroom-bank@2.0.0";
expectCompositionError(
  () => parseShowroomDesignProposal(wrongRelease, bank),
  "release_mismatch",
);

const unknownComponent = clone(proposalFixture) as {
  sections: Array<{ component: string }>;
};
unknownComponent.sections[1].component = "hero.unreviewed@1";
expectCompositionError(
  () => parseShowroomDesignProposal(unknownComponent, bank),
  "unknown_component",
);

const unknownProperty = clone(proposalFixture) as {
  sections: Array<{ properties: Record<string, unknown> }>;
};
unknownProperty.sections[1].properties.raw_html = "<script />";
expectCompositionError(
  () => parseShowroomDesignProposal(unknownProperty, bank),
  "unknown_field",
);

const invalidPropertyValue = clone(proposalFixture) as {
  sections: Array<{ properties: Record<string, unknown> }>;
};
invalidPropertyValue.sections[2].properties.columns = 12;
expectCompositionError(
  () => parseShowroomDesignProposal(invalidPropertyValue, bank),
  "invalid_integer",
);

const invalidBinding = clone(proposalFixture) as unknown as {
  sections: Array<{ bindings: Record<string, string> }>;
};
invalidBinding.sections[2].bindings.products = "business.description";
expectCompositionError(
  () => parseShowroomDesignProposal(invalidBinding, bank),
  "invalid_binding_source",
);

const missingSlot = clone(proposalFixture) as {
  sections: Array<{ component: string }>;
};
missingSlot.sections = missingSlot.sections.filter(
  (section) => section.component !== "hero.split@1",
);
expectCompositionError(
  () => parseShowroomDesignProposal(missingSlot, bank),
  "missing_slot",
);

const missingCapabilityBank = clone(bankFixture) as {
  requiredSlots: string[];
};
missingCapabilityBank.requiredSlots = ["header", "hero", "footer"];
const missingCapabilityProposal = clone(proposalFixture) as {
  sections: Array<{ component: string }>;
};
missingCapabilityProposal.sections = missingCapabilityProposal.sections.filter(
  (section) => section.component !== "catalog.editorial-grid@1",
);
expectCompositionError(
  () =>
    parseShowroomDesignProposal(
      missingCapabilityProposal,
      missingCapabilityBank,
    ),
  "missing_capability",
);

const incompatible = clone(proposalFixture) as {
  sections: Array<Record<string, unknown>>;
};
incompatible.sections.splice(
  2,
  0,
  {
    key: "brand-story",
    component: "content.story@1",
    properties: {},
    bindings: { body: "business.description" },
  },
  {
    key: "trust-story",
    component: "trust.credentials@1",
    properties: {},
    bindings: { body: "business.description" },
  },
);
expectCompositionError(
  () => parseShowroomDesignProposal(incompatible, bank),
  "incompatible_components",
);

const duplicateBank = clone(bankFixture) as {
  components: Array<{ id: string }>;
};
duplicateBank.components[1].id = duplicateBank.components[0].id;
expectCompositionError(
  () => parseShowroomComponentBank(duplicateBank),
  "duplicate_value",
);

const weakenedBank = clone(bankFixture) as {
  requiredCapabilities: string[];
};
weakenedBank.requiredCapabilities = ["product_detail"];
expectCompositionError(
  () => parseShowroomComponentBank(weakenedBank),
  "missing_bank_capability",
);

const oversizedProposal = JSON.stringify({
  ...proposalFixture,
  rationale: "x".repeat(MAX_SHOWROOM_PROPOSAL_BYTES),
});
expectCompositionError(
  () => parseShowroomDesignProposal(oversizedProposal, bank),
  "proposal_size",
);

for (const schemaPath of [
  "showroom-sdk/component-bank.schema.json",
  "showroom-sdk/showroom-proposal.schema.json",
]) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8")) as {
    $schema?: string;
    additionalProperties?: boolean;
  };
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.additionalProperties, false);
}

console.log(
  "Showroom composition bank, proposal, safety, compatibility, and schema contracts passed.",
);
