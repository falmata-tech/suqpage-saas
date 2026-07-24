import {
  MAX_COMPONENT_BANK_COMPONENTS,
  MAX_SHOWROOM_PROPOSAL_BYTES,
  SHOWROOM_COMPOSITION_SCHEMA_VERSION,
  ShowroomCompositionError,
  parseShowroomComponentBank,
  parseShowroomDesignProposal,
  type ShowroomComponentBank,
  type ShowroomComponentDefinition,
  type ShowroomDesignProposal,
  type ShowroomSection,
} from "./showroom-composition";
import {
  SHOWROOM_CONTENT_BLOCK_TYPES,
  parseShowroomContentBlocks,
  type ShowroomContentBlocksDocument,
  type ShowroomContentBlockType,
} from "./showroom-content-blocks";

export const SHOWROOM_COMPONENT_BANK_SCHEMA_VERSION_V2 = 2;
export const SHOWROOM_DESIGN_SCHEMA_VERSION_V2 = 2;

export type ShowroomComponentDefinitionV2 = ShowroomComponentDefinition & {
  acceptedContentTypes: ShowroomContentBlockType[];
};

export type ShowroomComponentBankV2 = Omit<
  ShowroomComponentBank,
  "schemaVersion" | "components"
> & {
  schemaVersion: 2;
  components: ShowroomComponentDefinitionV2[];
};

export type ShowroomSectionV2 = ShowroomSection & {
  contentBlockKey: string | null;
};

export type ShowroomDesignProposalV2 = Omit<
  ShowroomDesignProposal,
  "schemaVersion" | "sections"
> & {
  schemaVersion: 2;
  sections: ShowroomSectionV2[];
};

const fail = (message: string, code: string, status = 400): never => {
  throw new ShowroomCompositionError(message, code, status);
};

function record(
  input: unknown,
  label: string,
  allowed: readonly string[],
): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return fail(`${label} must be an object.`, "invalid_object");
  }
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    fail(`${label} contains an unsupported field.`, "unknown_field");
  }
  return value;
}

function parsedInput(input: unknown, limit?: number): Record<string, unknown> {
  let serialized: string;
  try {
    serialized = typeof input === "string" ? input : JSON.stringify(input);
  } catch {
    return fail("The showroom document cannot be serialized.", "invalid_json");
  }
  if (limit && new TextEncoder().encode(serialized).byteLength > limit) {
    return fail("The showroom document exceeds its size limit.", "proposal_size", 413);
  }
  try {
    return record(
      typeof input === "string" ? JSON.parse(input) : input,
      "Showroom document",
      [
        "schemaVersion",
        "release",
        "components",
        "tokenPacks",
        "requiredSlots",
        "requiredCapabilities",
        "bankRelease",
        "tokenPack",
        "rationale",
        "questions",
        "warnings",
        "sections",
      ],
    );
  } catch (error) {
    if (error instanceof ShowroomCompositionError) throw error;
    return fail("The showroom document is not valid JSON.", "invalid_json");
  }
}

function contentTypes(input: unknown, componentId: unknown) {
  if (!Array.isArray(input) || input.length > SHOWROOM_CONTENT_BLOCK_TYPES.length) {
    return fail(
      `Component ${String(componentId)} has invalid content compatibility.`,
      "invalid_content_types",
    );
  }
  const values = input.map((value) => {
    if (
      typeof value !== "string" ||
      !SHOWROOM_CONTENT_BLOCK_TYPES.includes(value as ShowroomContentBlockType)
    ) {
      return fail(
        `Component ${String(componentId)} accepts an unknown content type.`,
        "invalid_content_type",
      );
    }
    return value as ShowroomContentBlockType;
  });
  if (new Set(values).size !== values.length) {
    fail(
      `Component ${String(componentId)} repeats a content type.`,
      "duplicate_content_type",
    );
  }
  return values;
}

function toV1Bank(bank: ShowroomComponentBankV2): ShowroomComponentBank {
  return {
    ...bank,
    schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
    components: bank.components.map(({ acceptedContentTypes: _, ...component }) =>
      component
    ),
  };
}

export function parseShowroomComponentBankV2(
  input: unknown,
): ShowroomComponentBankV2 {
  const raw = parsedInput(input);
  if (raw.schemaVersion !== SHOWROOM_COMPONENT_BANK_SCHEMA_VERSION_V2) {
    return fail("The component-bank schema version is not supported.", "schema_version");
  }
  if (
    !Array.isArray(raw.components) ||
    !raw.components.length ||
    raw.components.length > MAX_COMPONENT_BANK_COMPONENTS
  ) {
    return fail("The component bank has an invalid component list.", "invalid_list");
  }
  const compatibility = raw.components.map((entry, index) => {
    const component = record(entry, `Component ${index + 1}`, [
      "id",
      "name",
      "description",
      "slot",
      "codeReference",
      "repeatable",
      "providesCapabilities",
      "incompatibleWith",
      "properties",
      "bindings",
      "mediaSlots",
      "acceptedContentTypes",
    ]);
    return contentTypes(component.acceptedContentTypes, component.id);
  });
  const v1Bank = parseShowroomComponentBank({
    ...raw,
    schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
    components: raw.components.map((entry) => {
      const { acceptedContentTypes: _, ...component } = entry as Record<string, unknown>;
      return component;
    }),
  });
  return {
    ...v1Bank,
    schemaVersion: SHOWROOM_COMPONENT_BANK_SCHEMA_VERSION_V2,
    components: v1Bank.components.map((component, index) => ({
      ...component,
      acceptedContentTypes: compatibility[index],
    })),
  };
}

export function parseShowroomDesignProposalV2(
  input: unknown,
  bankInput: unknown,
  contentInput: unknown,
): ShowroomDesignProposalV2 {
  const raw = parsedInput(input, MAX_SHOWROOM_PROPOSAL_BYTES);
  if (raw.schemaVersion !== SHOWROOM_DESIGN_SCHEMA_VERSION_V2) {
    return fail("The design schema version is not supported.", "schema_version");
  }
  if (!Array.isArray(raw.sections)) {
    return fail("Proposal sections must be a list.", "invalid_list");
  }
  const bank = parseShowroomComponentBankV2(bankInput);
  const content = parseShowroomContentBlocks(contentInput);
  const contentKeys = new Map(content.blocks.map((block) => [block.key, block]));
  const requestedContentKeys: Array<string | null> = raw.sections.map(
    (entry, index) => {
      const section = record(entry, `Proposal section ${index + 1}`, [
        "key",
        "component",
        "properties",
        "bindings",
        "contentBlockKey",
      ]);
      if (section.contentBlockKey === null) return null;
      if (typeof section.contentBlockKey !== "string") {
        return fail(
          `Proposal section ${index + 1} needs a contentBlockKey or null.`,
          "invalid_content_key",
        );
      }
      return section.contentBlockKey;
    },
  );
  const proposalV1 = parseShowroomDesignProposal(
    {
      ...raw,
      schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
      sections: raw.sections.map((entry) => {
        const { contentBlockKey: _, ...section } = entry as Record<string, unknown>;
        return section;
      }),
    },
    toV1Bank(bank),
  );
  const componentById = new Map(
    bank.components.map((component) => [component.id, component]),
  );
  const sections = proposalV1.sections.map((section, index) => {
    const component = componentById.get(section.component);
    if (!component) return fail("The design references an unknown component.", "unknown_component");
    const contentBlockKey = requestedContentKeys[index];
    if (!component.acceptedContentTypes.length && contentBlockKey !== null) {
      return fail(
        `Component ${component.id} cannot consume a content block.`,
        "incompatible_content",
      );
    }
    if (component.acceptedContentTypes.length && contentBlockKey === null) {
      return fail(
        `Component ${component.id} requires a typed content block.`,
        "missing_content",
      );
    }
    if (contentBlockKey !== null) {
      const block = contentKeys.get(contentBlockKey);
      if (!block || !component.acceptedContentTypes.includes(block.type)) {
        return fail(
          `Component ${component.id} and content block are incompatible.`,
          "incompatible_content",
        );
      }
    }
    return { ...section, contentBlockKey };
  });
  const used = requestedContentKeys.filter((key): key is string => key !== null);
  if (new Set(used).size !== used.length) {
    fail("A content block cannot be assigned more than once.", "duplicate_content_assignment");
  }
  if (used.length !== content.blocks.length || used.some((key) => !contentKeys.has(key))) {
    fail("Every typed content block must be assigned exactly once.", "orphan_content");
  }
  return { ...proposalV1, schemaVersion: 2, sections };
}

export function componentBankV2AsV1(
  bank: ShowroomComponentBankV2,
): ShowroomComponentBank {
  return toV1Bank(bank);
}

export function contentDocumentForDesignV2(
  input: unknown,
): ShowroomContentBlocksDocument {
  return parseShowroomContentBlocks(input);
}
