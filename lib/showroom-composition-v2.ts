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
  type ShowroomSlot,
} from "./showroom-composition";
import type {
  SectionMediaIntegration,
  ShowroomColorPalette,
} from "./showroom-design-systems";
import {
  SHOWROOM_CONTENT_BLOCK_TYPES,
  parseShowroomContentBlocks,
  type ShowroomContentBlocksDocument,
  type ShowroomContentBlockType,
} from "./showroom-content-blocks";
import {
  PRODUCT_DETAIL_PATTERNS,
  normalizeProductDetailPattern,
  type ProductDetailPattern,
} from "./product-detail-patterns";

export const SHOWROOM_COMPONENT_BANK_SCHEMA_VERSION_V2 = 2;
export const SHOWROOM_DESIGN_SCHEMA_VERSION_V2 = 2;
export const SHOWROOM_SECTION_MEDIA_INTEGRATIONS = [
  "natural",
  "surface_blend",
  "ambient_overlay",
  "edge_fade",
  "split_bleed",
  "editorial_overlap",
  "product_stage",
  "hidden",
] as const satisfies readonly SectionMediaIntegration[];
export const SHOWROOM_SECTION_SURFACE_ROLES = [
  "canvas",
  "surface",
  "soft",
  "accent-soft",
  "secondary-soft",
  "strong",
  "inverse",
] as const;
export type SectionSurfaceRole =
  (typeof SHOWROOM_SECTION_SURFACE_ROLES)[number];

export type ShowroomContentMediaSlotDefinition = {
  key: string;
  label: string;
  required: boolean;
  acceptedKinds: Array<"image" | "video">;
  minItems: number;
  maxItems: number;
  aspectRatio: "any" | "landscape" | "portrait" | "square";
};

export type ShowroomComponentDefinitionV2 = ShowroomComponentDefinition & {
  acceptedContentTypes: ShowroomContentBlockType[];
  contentMediaSlots: ShowroomContentMediaSlotDefinition[];
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
  mediaIntegration?: SectionMediaIntegration | null;
  surfaceRole?: SectionSurfaceRole;
};

export type ShowroomDesignProposalV2 = Omit<
  ShowroomDesignProposal,
  "schemaVersion" | "sections"
> & {
  schemaVersion: 2;
  customPalette?: ShowroomColorPalette;
  productDetailPattern: ProductDetailPattern;
  sections: ShowroomSectionV2[];
};

const fail = (message: string, code: string, status = 400): never => {
  throw new ShowroomCompositionError(message, code, status);
};

export const SHOWROOM_CUSTOM_PALETTE_KEYS = [
  "canvas",
  "surface",
  "layer",
  "text",
  "textMuted",
  "primary",
  "primarySoft",
  "secondary",
  "secondarySoft",
  "onSecondary",
  "strong",
  "onStrong",
  "inverse",
  "onInverse",
  "border",
] as const satisfies readonly (keyof ShowroomColorPalette)[];

const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

function relativeLuminance(hex: string) {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(
    (value) => Number.parseInt(value, 16) / 255,
  );
  const linear = channels.map((value) =>
    value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function showroomColorContrast(first: string, second: string) {
  const values = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function parseCustomPalette(input: unknown): ShowroomColorPalette | undefined {
  if (input === undefined) return undefined;
  const value = record(input, "Custom palette", SHOWROOM_CUSTOM_PALETTE_KEYS);
  for (const key of SHOWROOM_CUSTOM_PALETTE_KEYS) {
    if (typeof value[key] !== "string" || !hexColorPattern.test(value[key])) {
      fail(
        `Custom palette ${key} must be a six-digit hex color.`,
        "invalid_custom_palette",
      );
    }
  }
  const palette = value as ShowroomColorPalette;
  const normalSurfaces = [
    palette.canvas,
    palette.surface,
    palette.layer,
    palette.primarySoft,
    palette.secondarySoft,
  ];
  const unreadableBody = normalSurfaces.some(
    (background) => showroomColorContrast(palette.text, background) < 4.5,
  );
  if (
    unreadableBody ||
    showroomColorContrast(palette.onSecondary, palette.secondary) < 4.5 ||
    showroomColorContrast(palette.onStrong, palette.strong) < 4.5 ||
    showroomColorContrast(palette.onInverse, palette.inverse) < 4.5
  ) {
    fail(
      "Custom palette text and emphasis colors must meet WCAG AA contrast on every surface where they render.",
      "custom_palette_contrast",
    );
  }
  return palette;
}

export function defaultMediaIntegrationForSection(
  slot: ShowroomSlot,
  componentId: string,
): SectionMediaIntegration | null {
  if (slot === "content") return "natural";
  if (slot !== "hero") return null;
  if (/centered-statement/.test(componentId)) return "hidden";
  return "natural";
}

export function defaultSurfaceRoleForSection(
  slot: ShowroomSlot,
): SectionSurfaceRole {
  if (slot === "header") return "surface";
  if (slot === "hero") return "accent-soft";
  if (slot === "trust") return "secondary-soft";
  if (slot === "call_to_action") return "strong";
  if (slot === "footer") return "inverse";
  return "canvas";
}

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
        "customPalette",
        "productDetailPattern",
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

const contentMediaKeyPattern = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

function contentMediaSlots(
  input: unknown,
  componentId: unknown,
): ShowroomContentMediaSlotDefinition[] {
  if (!Array.isArray(input) || input.length > 8) {
    return fail(
      `Component ${String(componentId)} has invalid content-media slots.`,
      "invalid_content_media_slots",
    );
  }
  const slots = input.map((entry, index) => {
    const slot = record(entry, `Content-media slot ${index + 1}`, [
      "key",
      "label",
      "required",
      "acceptedKinds",
      "minItems",
      "maxItems",
      "aspectRatio",
    ]);
    if (
      typeof slot.key !== "string" ||
      slot.key.length > 80 ||
      !contentMediaKeyPattern.test(slot.key) ||
      typeof slot.label !== "string" ||
      !slot.label.trim() ||
      slot.label.length > 100 ||
      typeof slot.required !== "boolean" ||
      !Array.isArray(slot.acceptedKinds) ||
      !slot.acceptedKinds.length ||
      slot.acceptedKinds.length > 2 ||
      slot.acceptedKinds.some((kind) => kind !== "image" && kind !== "video") ||
      new Set(slot.acceptedKinds).size !== slot.acceptedKinds.length ||
      !Number.isInteger(slot.minItems) ||
      !Number.isInteger(slot.maxItems) ||
      Number(slot.minItems) < 0 ||
      Number(slot.maxItems) > 12 ||
      Number(slot.minItems) > Number(slot.maxItems) ||
      (slot.required && Number(slot.minItems) < 1) ||
      (!slot.required && Number(slot.minItems) !== 0) ||
      !["any", "landscape", "portrait", "square"].includes(
        String(slot.aspectRatio),
      )
    ) {
      return fail(
        `Component ${String(componentId)} has an invalid content-media slot.`,
        "invalid_content_media_slot",
      );
    }
    return {
      key: slot.key,
      label: slot.label.trim(),
      required: slot.required,
      acceptedKinds: slot.acceptedKinds as Array<"image" | "video">,
      minItems: Number(slot.minItems),
      maxItems: Number(slot.maxItems),
      aspectRatio: slot.aspectRatio as ShowroomContentMediaSlotDefinition["aspectRatio"],
    };
  });
  if (new Set(slots.map((slot) => slot.key)).size !== slots.length) {
    fail(
      `Component ${String(componentId)} repeats a content-media slot.`,
      "duplicate_content_media_slot",
    );
  }
  return slots;
}

function toV1Bank(bank: ShowroomComponentBankV2): ShowroomComponentBank {
  return {
    ...bank,
    schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
    components: bank.components.map(
      ({ acceptedContentTypes: _, contentMediaSlots: __, ...component }) =>
        component,
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
      "contentMediaSlots",
    ]);
    return {
      acceptedContentTypes: contentTypes(
        component.acceptedContentTypes,
        component.id,
      ),
      contentMediaSlots: contentMediaSlots(component.contentMediaSlots, component.id),
    };
  });
  const v1Bank = parseShowroomComponentBank({
    ...raw,
    schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
    components: raw.components.map((entry) => {
      const {
        acceptedContentTypes: _,
        contentMediaSlots: __,
        ...component
      } = entry as Record<string, unknown>;
      return component;
    }),
  });
  return {
    ...v1Bank,
    schemaVersion: SHOWROOM_COMPONENT_BANK_SCHEMA_VERSION_V2,
    components: v1Bank.components.map((component, index) => ({
      ...component,
      acceptedContentTypes: compatibility[index].acceptedContentTypes,
      contentMediaSlots: compatibility[index].contentMediaSlots,
    })),
  };
}

export function parseShowroomDesignProposalV2(
  input: unknown,
  bankInput: unknown,
  contentInput: unknown,
  contentMode: "opaque" | "managed" = "opaque",
): ShowroomDesignProposalV2 {
  const raw = parsedInput(input, MAX_SHOWROOM_PROPOSAL_BYTES);
  if (raw.schemaVersion !== SHOWROOM_DESIGN_SCHEMA_VERSION_V2) {
    return fail("The design schema version is not supported.", "schema_version");
  }
  if (!Array.isArray(raw.sections)) {
    return fail("Proposal sections must be a list.", "invalid_list");
  }
  const bank = parseShowroomComponentBankV2(bankInput);
  const content = parseShowroomContentBlocks(contentInput, contentMode);
  const customPalette = parseCustomPalette(raw.customPalette);
  if (
    raw.productDetailPattern !== undefined &&
    !PRODUCT_DETAIL_PATTERNS.includes(raw.productDetailPattern as ProductDetailPattern)
  ) {
    fail("The product detail pattern is not supported.", "invalid_product_detail_pattern");
  }
  const productDetailPattern = normalizeProductDetailPattern(raw.productDetailPattern);
  const contentKeys = new Map(content.blocks.map((block) => [block.key, block]));
  const requestedSections = raw.sections.map(
    (entry, index) => {
      const section = record(entry, `Proposal section ${index + 1}`, [
        "key",
        "component",
        "properties",
        "bindings",
        "contentBlockKey",
        "mediaIntegration",
        "surfaceRole",
      ]);
      if (
        section.contentBlockKey !== null &&
        typeof section.contentBlockKey !== "string"
      ) {
        return fail(
          `Proposal section ${index + 1} needs a contentBlockKey or null.`,
          "invalid_content_key",
        );
      }
      if (
        section.mediaIntegration !== undefined &&
        section.mediaIntegration !== null &&
        (typeof section.mediaIntegration !== "string" ||
          !SHOWROOM_SECTION_MEDIA_INTEGRATIONS.includes(
            section.mediaIntegration as SectionMediaIntegration,
          ))
      ) {
        return fail(
          `Proposal section ${index + 1} has an unsupported mediaIntegration.`,
          "invalid_media_integration",
        );
      }
      if (
        section.surfaceRole !== undefined &&
        (typeof section.surfaceRole !== "string" ||
          !SHOWROOM_SECTION_SURFACE_ROLES.includes(
            section.surfaceRole as SectionSurfaceRole,
          ))
      ) {
        return fail(
          `Proposal section ${index + 1} has an unsupported surfaceRole.`,
          "invalid_surface_role",
        );
      }
      return {
        contentBlockKey: section.contentBlockKey as string | null,
        mediaIntegration:
          section.mediaIntegration as SectionMediaIntegration | null | undefined,
        surfaceRole: section.surfaceRole as SectionSurfaceRole | undefined,
      };
    },
  );
  const {
    customPalette: _customPalette,
    productDetailPattern: _productDetailPattern,
    ...v1Input
  } = raw;
  const proposalV1 = parseShowroomDesignProposal(
    {
      ...v1Input,
      schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
      sections: raw.sections.map((entry) => {
        const {
          contentBlockKey: _,
          mediaIntegration: __,
          surfaceRole: ___,
          ...section
        } = entry as Record<string, unknown>;
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
    const contentBlockKey = requestedSections[index].contentBlockKey;
    const mediaIntegration =
      requestedSections[index].mediaIntegration ??
      defaultMediaIntegrationForSection(component.slot, component.id);
    const surfaceRole =
      requestedSections[index].surfaceRole ??
      defaultSurfaceRoleForSection(component.slot);
    if (
      mediaIntegration !== null &&
      component.slot !== "hero" &&
      component.slot !== "content"
    ) {
      return fail(
        `Component ${component.id} cannot use section media integration.`,
        "incompatible_media_integration",
      );
    }
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
      const slotByKey = new Map(
        component.contentMediaSlots.map((slot) => [slot.key, slot]),
      );
      for (const media of block.media) {
        const slot = slotByKey.get(media.slotKey);
        if (
          !slot ||
          media.assetKeys.length < slot.minItems ||
          media.assetKeys.length > slot.maxItems
        ) {
          return fail(
            `Component ${component.id} cannot accept the assigned media slot.`,
            "incompatible_content_media",
          );
        }
      }
      for (const slot of component.contentMediaSlots) {
        if (slot.required && !block.media.some((media) => media.slotKey === slot.key)) {
          return fail(
            `Component ${component.id} requires content media slot ${slot.key}.`,
            "missing_content_media",
          );
        }
      }
    }
    return { ...section, contentBlockKey, mediaIntegration, surfaceRole };
  });
  const used = requestedSections
    .map((section) => section.contentBlockKey)
    .filter((key): key is string => key !== null);
  const duplicate = used.find((key, index) => used.indexOf(key) !== index);
  if (duplicate) {
    fail(
      `Content block "${duplicate}" is assigned more than once. Set exactly one section contentBlockKey to this key.`,
      "duplicate_content_assignment",
    );
  }
  const unknown = used.find((key) => !contentKeys.has(key));
  if (unknown) {
    fail(
      `Section contentBlockKey "${unknown}" does not match a typed content block.`,
      "orphan_content",
    );
  }
  const unassigned = content.blocks.find((block) => !used.includes(block.key));
  if (unassigned) {
    fail(
      `Content block "${unassigned.key}" is not assigned. Set exactly one compatible section contentBlockKey to this key or remove the block from contentBlocks.`,
      "orphan_content",
    );
  }
  return {
    ...proposalV1,
    schemaVersion: 2,
    ...(customPalette ? { customPalette } : {}),
    productDetailPattern,
    sections,
  };
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
