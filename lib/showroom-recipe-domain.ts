import crypto from "node:crypto";
import {
  requireRevisionSnapshotV3,
  type RevisionSnapshotV3,
} from "./revision-domain";
import { SHOWROOM_COMPONENT_BANK } from "./showroom-bank-release";
import { parseShowroomDesignProposal } from "./showroom-composition";

export const SHOWROOM_RECIPE_SCHEMA_VERSION = 1;
export const SHOWROOM_CONTENT_SCHEMA_VERSION = 1;
export const MAX_SHOWROOM_RECIPE_BYTES = 1024 * 1024;

export type RecipeIssueCategory =
  | "content"
  | "design"
  | "cross_document"
  | "provenance"
  | "tenant_asset";

export type RecipeIssue = {
  category: RecipeIssueCategory;
  path: string;
  message: string;
};

export class ShowroomRecipeError extends Error {
  constructor(
    public readonly issues: RecipeIssue[],
    public readonly status = 400,
  ) {
    super(issues[0]?.message || "The showroom recipe is invalid.");
    this.name = "ShowroomRecipeError";
  }
}

export type RecipeProvenance = {
  path: string;
  sourceKey: string;
  kind: "source_fact" | "ai_draft";
};

export type ShowroomRecipeEnvelope = {
  schemaVersion: 1;
  baseContentVersion: number;
  content: {
    schemaVersion: 1;
    business: RevisionSnapshotV3["business"];
    collections: RevisionSnapshotV3["collections"];
    categories: RevisionSnapshotV3["categories"];
    products: RevisionSnapshotV3["products"];
  };
  design: RevisionSnapshotV3["designManifest"];
  summary: string;
  rationale: string;
  questions: string[];
  warnings: string[];
  declaredRemovals: {
    collections: string[];
    categories: string[];
    products: string[];
  };
  provenance: RecipeProvenance[];
};

export type RecipeValidationContext = {
  baseContentVersion: number;
  baseSnapshot: RevisionSnapshotV3;
  allowedAssetKeys: ReadonlySet<string>;
  allowedSourceKeys: ReadonlySet<string>;
  assetDetails: ReadonlyMap<
    string,
    { kind: "image" | "video"; width?: number; height?: number }
  >;
};

export type RecipeDifference = {
  collections: { before: number; after: number; added: number; removed: number };
  categories: { before: number; after: number; added: number; removed: number };
  products: { before: number; after: number; added: number; removed: number };
  designSections: { before: number; after: number };
};

export type ValidatedShowroomRecipe = {
  recipe: ShowroomRecipeEnvelope;
  snapshot: RevisionSnapshotV3;
  importHash: string;
  difference: RecipeDifference;
  duplicate?: boolean;
};

const controlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const unsafePattern = /(?:<\/?[a-z][^>]*>|javascript:|data:|https?:\/\/)/i;
const stableKeyPattern = /^[A-Za-z0-9_-]{1,80}$/;

function issue(
  category: RecipeIssueCategory,
  path: string,
  message: string,
): never {
  throw new ShowroomRecipeError([{ category, path, message }]);
}

function object(
  value: unknown,
  path: string,
  keys: readonly string[],
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issue("content", path, `${path} must be an object.`);
  }
  const result = value as Record<string, unknown>;
  const unknown = Object.keys(result).find((key) => !keys.includes(key));
  if (unknown) {
    issue(
      "content",
      `${path}.${unknown}`,
      `${path}.${unknown} is not supported.`,
    );
  }
  return result;
}

function text(
  value: unknown,
  path: string,
  maximum: number,
  required = false,
) {
  if (typeof value !== "string") {
    issue("content", path, `${path} must be text.`);
  }
  const result = value.trim();
  if (
    (required && !result) ||
    result.length > maximum ||
    controlPattern.test(result) ||
    unsafePattern.test(result)
  ) {
    issue("content", path, `${path} is outside its safe text limits.`);
  }
  return result;
}

function textList(value: unknown, path: string, maximum: number) {
  if (!Array.isArray(value) || value.length > maximum) {
    issue("content", path, `${path} must be a bounded list.`);
  }
  return value.map((entry, index) =>
    text(entry, `${path}[${index}]`, 500, true),
  );
}

function keyList(value: unknown, path: string, maximum: number) {
  const values = textList(value, path, maximum);
  if (
    values.some((entry) => !stableKeyPattern.test(entry)) ||
    new Set(values).size !== values.length
  ) {
    issue("content", path, `${path} must contain unique stable keys.`);
  }
  return values;
}

function parseEnvelope(input: unknown): ShowroomRecipeEnvelope {
  let serialized: string;
  try {
    serialized = typeof input === "string" ? input : JSON.stringify(input);
  } catch {
    issue("content", "$", "The showroom recipe is not serializable.");
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_SHOWROOM_RECIPE_BYTES) {
    throw new ShowroomRecipeError(
      [{ category: "content", path: "$", message: "The showroom recipe is larger than 1 MiB." }],
      413,
    );
  }
  let parsed: unknown = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      issue("content", "$", "The showroom recipe is not valid JSON.");
    }
  }
  const raw = object(parsed, "$", [
    "schemaVersion",
    "baseContentVersion",
    "content",
    "design",
    "summary",
    "rationale",
    "questions",
    "warnings",
    "declaredRemovals",
    "provenance",
  ]);
  if (raw.schemaVersion !== SHOWROOM_RECIPE_SCHEMA_VERSION) {
    issue("content", "$.schemaVersion", "The recipe schema version is not supported.");
  }
  if (
    !Number.isInteger(raw.baseContentVersion) ||
    Number(raw.baseContentVersion) < 1
  ) {
    issue("content", "$.baseContentVersion", "The base content version is invalid.");
  }
  const content = object(raw.content, "$.content", [
    "schemaVersion",
    "business",
    "collections",
    "categories",
    "products",
  ]);
  if (content.schemaVersion !== SHOWROOM_CONTENT_SCHEMA_VERSION) {
    issue("content", "$.content.schemaVersion", "The content schema version is not supported.");
  }
  const removals = object(raw.declaredRemovals, "$.declaredRemovals", [
    "collections",
    "categories",
    "products",
  ]);
  if (!Array.isArray(raw.provenance) || raw.provenance.length > 4000) {
    issue("provenance", "$.provenance", "Provenance must be a bounded list.");
  }
  const provenance = raw.provenance.map((entry, index) => {
    const value = object(entry, `$.provenance[${index}]`, [
      "path",
      "sourceKey",
      "kind",
    ]);
    const kind = value.kind;
    if (kind !== "source_fact" && kind !== "ai_draft") {
      issue("provenance", `$.provenance[${index}].kind`, "Choose source_fact or ai_draft.");
    }
    return {
      path: text(value.path, `$.provenance[${index}].path`, 300, true),
      sourceKey: text(
        value.sourceKey,
        `$.provenance[${index}].sourceKey`,
        100,
        true,
      ),
      kind: kind as RecipeProvenance["kind"],
    };
  });
  return {
    schemaVersion: 1,
    baseContentVersion: Number(raw.baseContentVersion),
    content: {
      schemaVersion: 1,
      business: content.business as RevisionSnapshotV3["business"],
      collections: content.collections as RevisionSnapshotV3["collections"],
      categories: content.categories as RevisionSnapshotV3["categories"],
      products: content.products as RevisionSnapshotV3["products"],
    },
    design: raw.design as RevisionSnapshotV3["designManifest"],
    summary: text(raw.summary, "$.summary", 500, true),
    rationale: text(raw.rationale, "$.rationale", 2000),
    questions: textList(raw.questions, "$.questions", 20),
    warnings: textList(raw.warnings, "$.warnings", 20),
    declaredRemovals: {
      collections: keyList(removals.collections, "$.declaredRemovals.collections", 100),
      categories: keyList(removals.categories, "$.declaredRemovals.categories", 200),
      products: keyList(removals.products, "$.declaredRemovals.products", 500),
    },
    provenance,
  };
}

function exactDifference(before: string[], after: string[]) {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  return {
    before: before.length,
    after: after.length,
    added: after.filter((key) => !beforeSet.has(key)).length,
    removed: before.filter((key) => !afterSet.has(key)).length,
  };
}

function requireDeclaredRemovals(
  label: keyof ShowroomRecipeEnvelope["declaredRemovals"],
  before: string[],
  after: string[],
  declared: string[],
) {
  const afterSet = new Set(after);
  const missing = before.filter((key) => !afterSet.has(key));
  const declaredSet = new Set(declared);
  if (missing.some((key) => !declaredSet.has(key))) {
    issue(
      "provenance",
      `$.declaredRemovals.${label}`,
      `Every removed ${label} key must be declared explicitly.`,
    );
  }
  if (declared.some((key) => !missing.includes(key))) {
    issue(
      "provenance",
      `$.declaredRemovals.${label}`,
      `Declared ${label} removals must match the complete replacement content.`,
    );
  }
}

function requiredFactPaths(snapshot: RevisionSnapshotV3) {
  const paths = ["$.content.business.name"];
  for (const field of ["contactEmail", "whatsapp", "telegram", "tiktok"] as const) {
    if (snapshot.business[field]) paths.push(`$.content.business.${field}`);
  }
  snapshot.products.forEach((product, index) => {
    paths.push(
      `$.content.products[${index}].name`,
      `$.content.products[${index}].description`,
      `$.content.products[${index}].availability`,
    );
  });
  return paths;
}

function contentPathExists(
  content: ShowroomRecipeEnvelope["content"],
  path: string,
) {
  if (!path.startsWith("$.content.")) return false;
  const tokens = path
    .slice("$.content.".length)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".");
  let current: unknown = content;
  for (const token of tokens) {
    if (Array.isArray(current)) {
      const index = Number(token);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return false;
      }
      current = current[index];
    } else if (current && typeof current === "object" && token in current) {
      current = (current as Record<string, unknown>)[token];
    } else {
      return false;
    }
  }
  return (
    current === null ||
    ["string", "number", "boolean"].includes(typeof current)
  );
}

function mediaSourceValue(
  snapshot: RevisionSnapshotV3,
  source: string,
) {
  if (source === "business.logo") return snapshot.business.logoRef;
  if (source === "business.hero_image") return snapshot.business.heroImageRef;
  return "";
}

function aspectMatches(
  expected: "any" | "landscape" | "portrait" | "square",
  width?: number,
  height?: number,
) {
  if (expected === "any" || !width || !height) return true;
  const ratio = width / height;
  if (expected === "landscape") return ratio >= 1.2;
  if (expected === "portrait") return ratio <= 0.83;
  return ratio >= 0.8 && ratio <= 1.25;
}

export function validateShowroomRecipe(
  input: unknown,
  context: RecipeValidationContext,
): ValidatedShowroomRecipe {
  const recipe = parseEnvelope(input);
  if (recipe.baseContentVersion !== context.baseContentVersion) {
    throw new ShowroomRecipeError(
      [{
        category: "cross_document",
        path: "$.baseContentVersion",
        message: "The live showroom changed after this brief was exported.",
      }],
      409,
    );
  }
  let design: RevisionSnapshotV3["designManifest"];
  try {
    design = parseShowroomDesignProposal(
      recipe.design,
      SHOWROOM_COMPONENT_BANK,
    );
  } catch (error) {
    issue(
      "design",
      "$.design",
      error instanceof Error ? error.message : "The design proposal is invalid.",
    );
  }
  let snapshot: RevisionSnapshotV3;
  try {
    snapshot = requireRevisionSnapshotV3({
      schemaVersion: 3,
      business: recipe.content.business,
      collections: recipe.content.collections,
      categories: recipe.content.categories,
      products: recipe.content.products,
      designManifest: design,
    });
  } catch (error) {
    issue(
      "content",
      "$.content",
      error instanceof Error ? error.message : "The content proposal is invalid.",
    );
  }
  const imageRefs = [
    snapshot.business.logoRef,
    snapshot.business.heroImageRef,
    snapshot.business.faviconRef,
    ...snapshot.products.map((product) => product.imageRef),
  ].filter(Boolean);
  const unknownAsset = imageRefs.find(
    (assetKey) => !context.allowedAssetKeys.has(assetKey),
  );
  if (unknownAsset) {
    issue(
      "tenant_asset",
      "$.content",
      "The recipe references media outside this request or business.",
    );
  }
  const componentById = new Map(
    SHOWROOM_COMPONENT_BANK.components.map((component) => [
      component.id,
      component,
    ]),
  );
  for (const [sectionIndex, section] of snapshot.designManifest.sections.entries()) {
    const component = componentById.get(section.component);
    for (const mediaSlot of component?.mediaSlots || []) {
      const value = mediaSourceValue(snapshot, mediaSlot.source);
      if (mediaSlot.required && !value) {
        issue(
          "cross_document",
          `$.design.sections[${sectionIndex}]`,
          `${component?.name || "The selected component"} requires ${mediaSlot.label.toLowerCase()}.`,
        );
      }
      if (value && !mediaSlot.acceptedKinds.includes("image")) {
        issue(
          "cross_document",
          `$.design.sections[${sectionIndex}]`,
          `${mediaSlot.label} does not accept an image.`,
        );
      }
      const details = value ? context.assetDetails.get(value) : undefined;
      if (
        details &&
        (!mediaSlot.acceptedKinds.includes(details.kind) ||
          !aspectMatches(
            mediaSlot.aspectRatio,
            details.width,
            details.height,
          ))
      ) {
        issue(
          "cross_document",
          `$.design.sections[${sectionIndex}]`,
          `${mediaSlot.label} is incompatible with the selected component.`,
        );
      }
    }
  }
  if (recipe.questions.length) {
    issue(
      "provenance",
      "$.questions",
      "Required questions must be resolved before a candidate can be imported.",
    );
  }
  const invalidSource = recipe.provenance.find(
    (entry) => !context.allowedSourceKeys.has(entry.sourceKey),
  );
  if (invalidSource) {
    issue(
      "provenance",
      "$.provenance",
      "A provenance entry references a source outside the exported brief.",
    );
  }
  if (
    new Set(recipe.provenance.map((entry) => entry.path)).size !==
    recipe.provenance.length
  ) {
    issue(
      "provenance",
      "$.provenance",
      "Each content path may have only one provenance entry.",
    );
  }
  const unknownPath = recipe.provenance.find(
    (entry) => !contentPathExists(recipe.content, entry.path),
  );
  if (unknownPath) {
    issue(
      "provenance",
      unknownPath.path,
      "A provenance entry points to a field that is not in the content proposal.",
    );
  }
  const provenanceByPath = new Map(
    recipe.provenance.map((entry) => [entry.path, entry]),
  );
  const missingFact = requiredFactPaths(snapshot).find(
    (path) => provenanceByPath.get(path)?.kind !== "source_fact",
  );
  if (missingFact) {
    issue(
      "provenance",
      missingFact,
      "This factual field needs an exported source_fact reference.",
    );
  }
  const base = context.baseSnapshot;
  requireDeclaredRemovals(
    "collections",
    base.collections.map((item) => item.key),
    snapshot.collections.map((item) => item.key),
    recipe.declaredRemovals.collections,
  );
  requireDeclaredRemovals(
    "categories",
    base.categories.map((item) => item.key),
    snapshot.categories.map((item) => item.key),
    recipe.declaredRemovals.categories,
  );
  requireDeclaredRemovals(
    "products",
    base.products.map((item) => item.key),
    snapshot.products.map((item) => item.key),
    recipe.declaredRemovals.products,
  );
  const canonical = JSON.stringify(recipe);
  return {
    recipe,
    snapshot,
    importHash: crypto.createHash("sha256").update(canonical).digest("hex"),
    difference: {
      collections: exactDifference(
        base.collections.map((item) => item.key),
        snapshot.collections.map((item) => item.key),
      ),
      categories: exactDifference(
        base.categories.map((item) => item.key),
        snapshot.categories.map((item) => item.key),
      ),
      products: exactDifference(
        base.products.map((item) => item.key),
        snapshot.products.map((item) => item.key),
      ),
      designSections: {
        before: base.designManifest.sections.length,
        after: snapshot.designManifest.sections.length,
      },
    },
  };
}
