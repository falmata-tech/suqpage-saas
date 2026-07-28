export const SHOWROOM_COMPOSITION_SCHEMA_VERSION = 1;
export const MAX_COMPONENT_BANK_COMPONENTS = 128;
export const MAX_COMPONENT_BANK_TOKEN_PACKS = 32;
export const MAX_SHOWROOM_SECTIONS = 24;
export const MAX_SHOWROOM_PROPOSAL_BYTES = 256 * 1024;
export const MAX_SHOWROOM_PROPOSAL_MESSAGES = 20;

export const SHOWROOM_SLOTS = [
  "header",
  "hero",
  "navigation",
  "content",
  "catalog",
  "trust",
  "call_to_action",
  "footer",
] as const;

export const SHOWROOM_CAPABILITIES = [
  "catalog_search",
  "category_filter",
  "product_detail",
  "add_to_inquiry",
  "inquiry_cart_trigger",
] as const;

export const MANDATORY_SHOWROOM_CAPABILITIES = [
  "product_detail",
  "add_to_inquiry",
  "inquiry_cart_trigger",
] as const satisfies readonly (typeof SHOWROOM_CAPABILITIES)[number][];

export const SHOWROOM_BINDING_SOURCES = [
  "business.name",
  "business.tagline",
  "business.description",
  "business.logo",
  "business.hero_title",
  "business.hero_subtitle",
  "business.hero_image",
  "business.contact_methods",
  "catalog.categories",
  "catalog.products",
  "catalog.featured_products",
] as const;

export type ShowroomSlot = (typeof SHOWROOM_SLOTS)[number];
export type ShowroomCapability = (typeof SHOWROOM_CAPABILITIES)[number];
export type ShowroomBindingSource = (typeof SHOWROOM_BINDING_SOURCES)[number];
export type ShowroomPrimitive = string | boolean | number;

export type EnumPropertyDefinition = {
  key: string;
  label: string;
  type: "enum";
  required: boolean;
  values: string[];
};

export type BooleanPropertyDefinition = {
  key: string;
  label: string;
  type: "boolean";
  required: boolean;
};

export type IntegerPropertyDefinition = {
  key: string;
  label: string;
  type: "integer";
  required: boolean;
  min: number;
  max: number;
};

export type ShowroomPropertyDefinition =
  | EnumPropertyDefinition
  | BooleanPropertyDefinition
  | IntegerPropertyDefinition;

export type ShowroomBindingDefinition = {
  key: string;
  label: string;
  required: boolean;
  allowedSources: ShowroomBindingSource[];
};

export type ShowroomMediaSlotDefinition = {
  key: string;
  label: string;
  source: ShowroomBindingSource;
  required: boolean;
  acceptedKinds: Array<"image" | "video">;
  minItems: number;
  maxItems: number;
  aspectRatio: "any" | "landscape" | "portrait" | "square";
};

export type ShowroomComponentDefinition = {
  id: string;
  name: string;
  description: string;
  slot: ShowroomSlot;
  codeReference: string;
  repeatable: boolean;
  providesCapabilities: ShowroomCapability[];
  incompatibleWith: string[];
  properties: ShowroomPropertyDefinition[];
  bindings: ShowroomBindingDefinition[];
  mediaSlots: ShowroomMediaSlotDefinition[];
};

export type ShowroomTokenPackDefinition = {
  id: string;
  name: string;
  description: string;
};

export type ShowroomComponentBank = {
  schemaVersion: 1;
  release: string;
  components: ShowroomComponentDefinition[];
  tokenPacks: ShowroomTokenPackDefinition[];
  requiredSlots: ShowroomSlot[];
  requiredCapabilities: ShowroomCapability[];
};

export type ShowroomSection = {
  key: string;
  component: string;
  properties: Record<string, ShowroomPrimitive>;
  bindings: Record<string, ShowroomBindingSource>;
};

export type ShowroomDesignProposal = {
  schemaVersion: 1;
  bankRelease: string;
  tokenPack: string;
  rationale: string;
  questions: string[];
  warnings: string[];
  sections: ShowroomSection[];
};

export class ShowroomCompositionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "ShowroomCompositionError";
  }
}

const identifierPattern = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const versionedComponentPattern = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*@[1-9][0-9]*$/;
const bankReleasePattern = /^showroom-bank@[1-9][0-9]*(?:\.[0-9]+){0,2}$/;
const codeReferencePattern =
  /^components\/showroom\/bank\/[A-Za-z0-9._/-]+\.(?:ts|tsx)$/;
const unsafeLocatorPattern = /(?:https?|javascript|data):/i;
const unsafeMarkupPattern = /<\/?[A-Za-z][^>]*>/;
const controlPattern = /[\u0000-\u001F\u007F]/;
const singletonSlots = new Set<ShowroomSlot>([
  "header",
  "hero",
  "navigation",
  "footer",
]);

function fail(message: string, code: string): never {
  throw new ShowroomCompositionError(message, code);
}

function record(
  value: unknown,
  name: string,
  allowedKeys: readonly string[],
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${name} must be an object.`, "invalid_object");
  }
  const result = value as Record<string, unknown>;
  const unknownKeys = Object.keys(result).filter(
    (entry) => !allowedKeys.includes(entry),
  );
  if (unknownKeys.length) {
    fail(`${name} contains an unsupported field.`, "unknown_field");
  }
  return result;
}

function list(value: unknown, name: string, maximum: number): unknown[] {
  if (!Array.isArray(value)) {
    fail(`${name} must be a list.`, "invalid_list");
  }
  if (value.length > maximum) {
    fail(`${name} exceeds its allowed item limit.`, "item_limit");
  }
  return value;
}

function textValue(
  value: unknown,
  name: string,
  maximum: number,
  required = true,
): string {
  if (typeof value !== "string") {
    fail(`${name} must be text.`, "invalid_text");
  }
  const result = value.trim();
  if ((required && !result) || result.length > maximum || controlPattern.test(result)) {
    fail(`${name} is outside its allowed text limits.`, "text_limit");
  }
  if (unsafeLocatorPattern.test(result) || unsafeMarkupPattern.test(result)) {
    fail(`${name} cannot contain markup or an external locator.`, "unsafe_value");
  }
  return result;
}

function booleanValue(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") {
    fail(`${name} must be true or false.`, "invalid_boolean");
  }
  return value;
}

function integerValue(
  value: unknown,
  name: string,
  minimum: number,
  maximum: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    fail(`${name} must be an integer in its allowed range.`, "invalid_integer");
  }
  return value;
}

function identifier(value: unknown, name: string, maximum = 80): string {
  const result = textValue(value, name, maximum);
  if (!identifierPattern.test(result)) {
    fail(`${name} must use a stable lowercase identifier.`, "invalid_identifier");
  }
  return result;
}

function unique<T>(values: T[], name: string): T[] {
  if (new Set(values).size !== values.length) {
    fail(`${name} contains duplicate values.`, "duplicate_value");
  }
  return values;
}

function enumValue<T extends string>(
  value: unknown,
  name: string,
  allowed: readonly T[],
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    fail(`${name} is not supported.`, "unsupported_value");
  }
  return value as T;
}

function stringList(
  value: unknown,
  name: string,
  maximumItems: number,
  maximumLength: number,
): string[] {
  return unique(
    list(value, name, maximumItems).map((entry, index) =>
      textValue(entry, `${name} item ${index + 1}`, maximumLength),
    ),
    name,
  );
}

function parsePropertyDefinition(
  input: unknown,
  componentId: string,
): ShowroomPropertyDefinition {
  const raw = record(input, `Property for ${componentId}`, [
    "key",
    "label",
    "type",
    "required",
    "values",
    "min",
    "max",
  ]);
  const key = identifier(raw.key, `Property key for ${componentId}`, 50);
  const label = textValue(raw.label, `Property label ${key}`, 100);
  const type = enumValue(raw.type, `Property type ${key}`, [
    "enum",
    "boolean",
    "integer",
  ] as const);
  const required = booleanValue(raw.required, `Property required flag ${key}`);

  if (type === "enum") {
    if (raw.min !== undefined || raw.max !== undefined) {
      fail(`Enum property ${key} cannot declare a numeric range.`, "invalid_property");
    }
    const values = stringList(raw.values, `Enum values for ${key}`, 20, 60);
    if (!values.length) {
      fail(`Enum property ${key} needs at least one value.`, "invalid_property");
    }
    return {
      key,
      label,
      type,
      required,
      values,
    };
  }

  if (type === "boolean") {
    if (
      raw.values !== undefined ||
      raw.min !== undefined ||
      raw.max !== undefined
    ) {
      fail(`Boolean property ${key} has unsupported constraints.`, "invalid_property");
    }
    return { key, label, type, required };
  }

  if (raw.values !== undefined) {
    fail(`Integer property ${key} cannot declare enum values.`, "invalid_property");
  }
  const min = integerValue(raw.min, `Minimum for ${key}`, -1000, 1000);
  const max = integerValue(raw.max, `Maximum for ${key}`, -1000, 1000);
  if (min > max) {
    fail(`Integer property ${key} has an invalid range.`, "invalid_property");
  }
  return { key, label, type, required, min, max };
}

function parseBindingDefinition(
  input: unknown,
  componentId: string,
): ShowroomBindingDefinition {
  const raw = record(input, `Binding for ${componentId}`, [
    "key",
    "label",
    "required",
    "allowedSources",
  ]);
  const key = identifier(raw.key, `Binding key for ${componentId}`, 50);
  const allowedSources = unique(
    list(raw.allowedSources, `Binding sources for ${key}`, 12).map(
      (entry, index) =>
        enumValue(
          entry,
          `Binding source ${index + 1} for ${key}`,
          SHOWROOM_BINDING_SOURCES,
        ),
    ),
    `Binding sources for ${key}`,
  );
  if (!allowedSources.length) {
    fail(`Binding ${key} needs at least one source.`, "invalid_binding");
  }
  return {
    key,
    label: textValue(raw.label, `Binding label ${key}`, 100),
    required: booleanValue(raw.required, `Binding required flag ${key}`),
    allowedSources,
  };
}

function parseMediaSlotDefinition(
  input: unknown,
  componentId: string,
): ShowroomMediaSlotDefinition {
  const raw = record(input, `Media slot for ${componentId}`, [
    "key",
    "label",
    "source",
    "required",
    "acceptedKinds",
    "minItems",
    "maxItems",
    "aspectRatio",
  ]);
  const key = identifier(raw.key, `Media-slot key for ${componentId}`, 50);
  const acceptedKinds = unique(
    list(raw.acceptedKinds, `Accepted media for ${key}`, 2).map((entry) =>
      enumValue(entry, `Accepted media for ${key}`, ["image", "video"] as const),
    ),
    `Accepted media for ${key}`,
  );
  if (!acceptedKinds.length) {
    fail(`Media slot ${key} needs an accepted kind.`, "invalid_media_slot");
  }
  const minItems = integerValue(raw.minItems, `Minimum media for ${key}`, 0, 10);
  const maxItems = integerValue(raw.maxItems, `Maximum media for ${key}`, 1, 10);
  if (minItems > maxItems) {
    fail(`Media slot ${key} has an invalid count range.`, "invalid_media_slot");
  }
  return {
    key,
    label: textValue(raw.label, `Media-slot label ${key}`, 100),
    source: enumValue(raw.source, `Media source for ${key}`, SHOWROOM_BINDING_SOURCES),
    required: booleanValue(raw.required, `Media-slot required flag ${key}`),
    acceptedKinds,
    minItems,
    maxItems,
    aspectRatio: enumValue(
      raw.aspectRatio,
      `Media aspect ratio for ${key}`,
      ["any", "landscape", "portrait", "square"] as const,
    ),
  };
}

function parseComponentDefinition(input: unknown): ShowroomComponentDefinition {
  const raw = record(input, "Component definition", [
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
  ]);
  const id = textValue(raw.id, "Component ID", 100);
  if (!versionedComponentPattern.test(id)) {
    fail("Component ID must contain a positive explicit version.", "invalid_component_id");
  }
  const codeReference = textValue(raw.codeReference, `Code reference for ${id}`, 200);
  if (
    !codeReferencePattern.test(codeReference) ||
    codeReference.includes("..") ||
    codeReference.includes("//")
  ) {
    fail(`Component ${id} has an invalid repository code reference.`, "invalid_code_reference");
  }
  const properties = list(raw.properties, `Properties for ${id}`, 24).map(
    (entry) => parsePropertyDefinition(entry, id),
  );
  unique(
    properties.map((entry) => entry.key),
    `Property keys for ${id}`,
  );
  const bindings = list(raw.bindings, `Bindings for ${id}`, 16).map((entry) =>
    parseBindingDefinition(entry, id),
  );
  unique(
    bindings.map((entry) => entry.key),
    `Binding keys for ${id}`,
  );
  const mediaSlots = list(raw.mediaSlots, `Media slots for ${id}`, 8).map(
    (entry) => parseMediaSlotDefinition(entry, id),
  );
  unique(
    mediaSlots.map((entry) => entry.key),
    `Media-slot keys for ${id}`,
  );
  return {
    id,
    name: textValue(raw.name, `Component name ${id}`, 100),
    description: textValue(raw.description, `Component description ${id}`, 500),
    slot: enumValue(raw.slot, `Component slot ${id}`, SHOWROOM_SLOTS),
    codeReference,
    repeatable: booleanValue(raw.repeatable, `Repeatable flag for ${id}`),
    providesCapabilities: unique(
      list(raw.providesCapabilities, `Capabilities for ${id}`, 5).map(
        (entry, index) =>
          enumValue(
            entry,
            `Capability ${index + 1} for ${id}`,
            SHOWROOM_CAPABILITIES,
          ),
      ),
      `Capabilities for ${id}`,
    ),
    incompatibleWith: stringList(
      raw.incompatibleWith,
      `Incompatibilities for ${id}`,
      32,
      100,
    ),
    properties,
    bindings,
    mediaSlots,
  };
}

export function parseShowroomComponentBank(
  input: unknown,
): ShowroomComponentBank {
  const raw = record(input, "Component bank", [
    "schemaVersion",
    "release",
    "components",
    "tokenPacks",
    "requiredSlots",
    "requiredCapabilities",
  ]);
  if (raw.schemaVersion !== SHOWROOM_COMPOSITION_SCHEMA_VERSION) {
    fail("The component-bank schema version is not supported.", "schema_version");
  }
  const release = textValue(raw.release, "Component-bank release", 80);
  if (!bankReleasePattern.test(release)) {
    fail("The component-bank release is invalid.", "invalid_release");
  }
  const components = list(
    raw.components,
    "Component definitions",
    MAX_COMPONENT_BANK_COMPONENTS,
  ).map(parseComponentDefinition);
  if (!components.length) {
    fail("A component bank needs at least one component.", "empty_bank");
  }
  const componentIds = unique(
    components.map((entry) => entry.id),
    "Component IDs",
  );
  const knownComponents = new Set(componentIds);
  for (const component of components) {
    for (const incompatibleId of component.incompatibleWith) {
      if (
        incompatibleId === component.id ||
        !knownComponents.has(incompatibleId)
      ) {
        fail(
          `Component ${component.id} has an invalid incompatibility.`,
          "invalid_incompatibility",
        );
      }
    }
  }
  const tokenPacks = list(
    raw.tokenPacks,
    "Token packs",
    MAX_COMPONENT_BANK_TOKEN_PACKS,
  ).map((input) => {
    const source = record(input, "Token pack", ["id", "name", "description"]);
    const id = identifier(source.id, "Token-pack ID", 80);
    return {
      id,
      name: textValue(source.name, `Token-pack name ${id}`, 100),
      description: textValue(
        source.description,
        `Token-pack description ${id}`,
        500,
      ),
    };
  });
  if (!tokenPacks.length) {
    fail("A component bank needs at least one token pack.", "empty_token_packs");
  }
  unique(
    tokenPacks.map((entry) => entry.id),
    "Token-pack IDs",
  );
  const requiredSlots = unique(
    list(raw.requiredSlots, "Required slots", SHOWROOM_SLOTS.length).map(
      (entry, index) =>
        enumValue(entry, `Required slot ${index + 1}`, SHOWROOM_SLOTS),
    ),
    "Required slots",
  );
  const requiredCapabilities = unique(
    list(
      raw.requiredCapabilities,
      "Required capabilities",
      SHOWROOM_CAPABILITIES.length,
    ).map((entry, index) =>
      enumValue(
        entry,
        `Required capability ${index + 1}`,
        SHOWROOM_CAPABILITIES,
      ),
    ),
    "Required capabilities",
  );
  if (
    MANDATORY_SHOWROOM_CAPABILITIES.some(
      (entry) => !requiredCapabilities.includes(entry),
    )
  ) {
    fail(
      "The bank must require every mandatory smart-showroom capability.",
      "missing_bank_capability",
    );
  }
  const componentSlots = new Set(components.map((entry) => entry.slot));
  const providedCapabilities = new Set(
    components.flatMap((entry) => entry.providesCapabilities),
  );
  if (requiredSlots.some((entry) => !componentSlots.has(entry))) {
    fail("The bank cannot satisfy every required slot.", "unfulfillable_bank");
  }
  if (
    requiredCapabilities.some((entry) => !providedCapabilities.has(entry))
  ) {
    fail(
      "The bank cannot satisfy every required capability.",
      "unfulfillable_bank",
    );
  }
  return {
    schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
    release,
    components,
    tokenPacks,
    requiredSlots,
    requiredCapabilities,
  };
}

function parseSection(
  input: unknown,
  componentById: ReadonlyMap<string, ShowroomComponentDefinition>,
): ShowroomSection {
  const raw = record(input, "Proposal section", [
    "key",
    "component",
    "properties",
    "bindings",
  ]);
  const key = identifier(raw.key, "Section key", 80);
  const componentId = textValue(raw.component, `Component for ${key}`, 100);
  const component = componentById.get(componentId);
  if (!component) {
    fail(`Section ${key} references an unknown component.`, "unknown_component");
  }
  const rawProperties = record(raw.properties, `Properties for section ${key}`, [
    ...component.properties.map((entry) => entry.key),
  ]);
  for (const definition of component.properties) {
    if (definition.required && rawProperties[definition.key] === undefined) {
      fail(
        `Section ${key} is missing a required property.`,
        "missing_property",
      );
    }
  }
  const properties: Record<string, ShowroomPrimitive> = {};
  for (const [propertyKey, propertyValue] of Object.entries(rawProperties)) {
    const definition = component.properties.find(
      (entry) => entry.key === propertyKey,
    );
    if (!definition) {
      fail(`Section ${key} uses an unknown property.`, "unknown_property");
    }
    if (definition.type === "enum") {
      if (
        typeof propertyValue !== "string" ||
        !definition.values.includes(propertyValue)
      ) {
        fail(
          `Section ${key} has an unsupported property value.`,
          "invalid_property_value",
        );
      }
      properties[propertyKey] = propertyValue;
    } else if (definition.type === "boolean") {
      properties[propertyKey] = booleanValue(
        propertyValue,
        `Property ${propertyKey} for ${key}`,
      );
    } else {
      properties[propertyKey] = integerValue(
        propertyValue,
        `Property ${propertyKey} for ${key}`,
        definition.min,
        definition.max,
      );
    }
  }

  const rawBindings = record(raw.bindings, `Bindings for section ${key}`, [
    ...component.bindings.map((entry) => entry.key),
  ]);
  for (const definition of component.bindings) {
    if (definition.required && rawBindings[definition.key] === undefined) {
      fail(
        `Section ${key} is missing a required binding.`,
        "missing_binding",
      );
    }
  }
  const bindings: Record<string, ShowroomBindingSource> = {};
  for (const [bindingKey, bindingValue] of Object.entries(rawBindings)) {
    const definition = component.bindings.find(
      (entry) => entry.key === bindingKey,
    );
    if (
      !definition ||
      typeof bindingValue !== "string" ||
      !definition.allowedSources.includes(bindingValue as ShowroomBindingSource)
    ) {
      fail(
        `Section ${key} has an unsupported binding.`,
        "invalid_binding_source",
      );
    }
    bindings[bindingKey] = bindingValue as ShowroomBindingSource;
  }
  return { key, component: component.id, properties, bindings };
}

export function parseShowroomDesignProposal(
  input: unknown,
  bankInput: unknown,
): ShowroomDesignProposal {
  let serialized: string;
  try {
    serialized = typeof input === "string" ? input : JSON.stringify(input);
  } catch {
    fail("The showroom proposal cannot be serialized.", "invalid_json");
  }
  if (new TextEncoder().encode(serialized).byteLength > MAX_SHOWROOM_PROPOSAL_BYTES) {
    throw new ShowroomCompositionError(
      "The showroom proposal is larger than 256 KiB.",
      "proposal_size",
      413,
    );
  }
  let proposalInput: unknown = input;
  if (typeof input === "string") {
    try {
      proposalInput = JSON.parse(input);
    } catch {
      fail("The showroom proposal is not valid JSON.", "invalid_json");
    }
  }
  const bank = parseShowroomComponentBank(bankInput);
  const raw = record(proposalInput, "Showroom proposal", [
    "schemaVersion",
    "bankRelease",
    "tokenPack",
    "rationale",
    "questions",
    "warnings",
    "sections",
  ]);
  if (raw.schemaVersion !== SHOWROOM_COMPOSITION_SCHEMA_VERSION) {
    fail("The showroom proposal schema version is not supported.", "schema_version");
  }
  const bankRelease = textValue(raw.bankRelease, "Proposal bank release", 80);
  if (bankRelease !== bank.release) {
    fail("The proposal targets another component-bank release.", "release_mismatch");
  }
  const tokenPack = identifier(raw.tokenPack, "Proposal token pack", 80);
  if (!bank.tokenPacks.some((entry) => entry.id === tokenPack)) {
    fail("The proposal references an unknown token pack.", "unknown_token_pack");
  }
  const componentById = new Map(
    bank.components.map((entry) => [entry.id, entry] as const),
  );
  const sections = list(
    raw.sections,
    "Proposal sections",
    MAX_SHOWROOM_SECTIONS,
  ).map((entry) => parseSection(entry, componentById));
  if (!sections.length) {
    fail("The proposal needs at least one section.", "empty_proposal");
  }
  unique(
    sections.map((entry) => entry.key),
    "Proposal section keys",
  );

  const selectedComponents = sections.map((entry) => {
    const component = componentById.get(entry.component);
    if (!component) {
      fail("The proposal references an unknown component.", "unknown_component");
    }
    return component;
  });
  for (const component of selectedComponents) {
    if (
      !component.repeatable &&
      selectedComponents.filter((entry) => entry.id === component.id).length > 1
    ) {
      fail(
        `Component ${component.id} cannot be repeated.`,
        "repeated_component",
      );
    }
  }
  for (const slot of singletonSlots) {
    if (selectedComponents.filter((entry) => entry.slot === slot).length > 1) {
      fail(`The ${slot} slot can appear only once.`, "repeated_slot");
    }
  }
  const selectedIds = new Set(selectedComponents.map((entry) => entry.id));
  for (const component of selectedComponents) {
    if (component.incompatibleWith.some((entry) => selectedIds.has(entry))) {
      fail(
        `Component ${component.id} conflicts with another section.`,
        "incompatible_components",
      );
    }
  }
  const selectedSlots = new Set(selectedComponents.map((entry) => entry.slot));
  if (bank.requiredSlots.some((entry) => !selectedSlots.has(entry))) {
    fail("The proposal is missing a required showroom slot.", "missing_slot");
  }
  const selectedCapabilities = new Set(
    selectedComponents.flatMap((entry) => entry.providesCapabilities),
  );
  if (
    bank.requiredCapabilities.some(
      (entry) => !selectedCapabilities.has(entry),
    )
  ) {
    fail(
      "The proposal is missing a required smart-showroom capability.",
      "missing_capability",
    );
  }

  return {
    schemaVersion: SHOWROOM_COMPOSITION_SCHEMA_VERSION,
    bankRelease,
    tokenPack,
    rationale: textValue(raw.rationale, "Proposal rationale", 2000, false),
    questions: list(
      raw.questions,
      "Proposal questions",
      MAX_SHOWROOM_PROPOSAL_MESSAGES,
    ).map((entry, index) =>
      textValue(entry, `Proposal question ${index + 1}`, 500),
    ),
    warnings: list(
      raw.warnings,
      "Proposal warnings",
      MAX_SHOWROOM_PROPOSAL_MESSAGES,
    ).map((entry, index) =>
      textValue(entry, `Proposal warning ${index + 1}`, 500),
    ),
    sections,
  };
}
