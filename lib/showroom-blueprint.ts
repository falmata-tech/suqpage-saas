import type { RevisionSnapshotV4 } from "./revision-v4-domain";

export const MAX_BLUEPRINT_MEDIA_SLOTS = 160;

export type BlueprintMediaOwner = "business" | "product" | "block";
export type BlueprintMediaAspect = "any" | "landscape" | "portrait" | "square";
export type BlueprintMediaClassification = "factual" | "illustrative";

export type BlueprintMediaSlot = {
  key: string;
  ownerType: BlueprintMediaOwner;
  ownerKey: string;
  slotKey: string;
  label: string;
  purpose: string;
  required: boolean;
  aspectRatio: BlueprintMediaAspect;
  altText: string;
  classification: BlueprintMediaClassification;
};

export type BlueprintReadiness = {
  total: number;
  complete: number;
  required: number;
  requiredComplete: number;
  unresolvedRequired: BlueprintMediaSlot[];
  previewReady: boolean;
  reviewReady: boolean;
};

export class ShowroomBlueprintError extends Error {
  constructor(
    message: string,
    public readonly path = "$.mediaPlan",
  ) {
    super(message);
    this.name = "ShowroomBlueprintError";
  }
}

const keyPattern = /^[A-Za-z0-9_-]{1,80}$/;
const unsafePattern = /(?:<\/?[a-z][^>]*>|javascript:|data:|https?:\/\/|[\u0000-\u001F\u007F])/i;

function record(
  input: unknown,
  path: string,
  keys: readonly string[],
): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ShowroomBlueprintError("A media-plan slot must be an object.", path);
  }
  const value = input as Record<string, unknown>;
  const unknown = Object.keys(value).find((key) => !keys.includes(key));
  if (unknown) {
    throw new ShowroomBlueprintError("The media-plan slot contains an unsupported field.", `${path}.${unknown}`);
  }
  return value;
}

function text(input: unknown, path: string, maximum: number, required = true) {
  if (typeof input !== "string") {
    throw new ShowroomBlueprintError("The media-plan field must be text.", path);
  }
  const value = input.trim();
  if ((required && !value) || value.length > maximum || unsafePattern.test(value)) {
    throw new ShowroomBlueprintError("The media-plan field is outside its safe text limits.", path);
  }
  return value;
}

function targetExists(snapshot: RevisionSnapshotV4, slot: BlueprintMediaSlot) {
  if (slot.ownerType === "business") {
    return slot.ownerKey === "business" &&
      ["logo", "hero_image", "favicon"].includes(slot.slotKey);
  }
  if (slot.ownerType === "product") {
    return slot.slotKey === "product_image" &&
      snapshot.products.some((product) => product.key === slot.ownerKey);
  }
  return snapshot.contentBlocks.blocks.some((block) => block.key === slot.ownerKey);
}

export function parseBlueprintMediaPlan(
  input: unknown,
  snapshot: RevisionSnapshotV4,
): BlueprintMediaSlot[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input) || input.length > MAX_BLUEPRINT_MEDIA_SLOTS) {
    throw new ShowroomBlueprintError("The media plan must be a bounded list.");
  }
  const result = input.map((entry, index) => {
    const path = `$.mediaPlan[${index}]`;
    const value = record(entry, path, [
      "key",
      "ownerType",
      "ownerKey",
      "slotKey",
      "label",
      "purpose",
      "required",
      "aspectRatio",
      "altText",
      "classification",
    ]);
    const ownerType = value.ownerType;
    if (!["business", "product", "block"].includes(String(ownerType))) {
      throw new ShowroomBlueprintError("Choose a supported media owner.", `${path}.ownerType`);
    }
    const aspectRatio = value.aspectRatio;
    if (!["any", "landscape", "portrait", "square"].includes(String(aspectRatio))) {
      throw new ShowroomBlueprintError("Choose a supported aspect ratio.", `${path}.aspectRatio`);
    }
    const classification = value.classification;
    if (!["factual", "illustrative"].includes(String(classification))) {
      throw new ShowroomBlueprintError("Choose factual or illustrative media.", `${path}.classification`);
    }
    if (typeof value.required !== "boolean") {
      throw new ShowroomBlueprintError("Media required state must be true or false.", `${path}.required`);
    }
    const slot: BlueprintMediaSlot = {
      key: text(value.key, `${path}.key`, 80),
      ownerType: ownerType as BlueprintMediaOwner,
      ownerKey: text(value.ownerKey, `${path}.ownerKey`, 80),
      slotKey: text(value.slotKey, `${path}.slotKey`, 80),
      label: text(value.label, `${path}.label`, 120),
      purpose: text(value.purpose, `${path}.purpose`, 300),
      required: value.required,
      aspectRatio: aspectRatio as BlueprintMediaAspect,
      altText: text(value.altText, `${path}.altText`, 240, false),
      classification: classification as BlueprintMediaClassification,
    };
    if (![slot.key, slot.ownerKey, slot.slotKey].every((item) => keyPattern.test(item))) {
      throw new ShowroomBlueprintError("Media-plan keys must be stable identifiers.", path);
    }
    if (!targetExists(snapshot, slot)) {
      throw new ShowroomBlueprintError("The media-plan slot points to missing showroom content.", path);
    }
    return slot;
  });
  if (new Set(result.map((slot) => slot.key)).size !== result.length) {
    throw new ShowroomBlueprintError("Media-plan slot keys must be unique.");
  }
  const targets = result.map((slot) => `${slot.ownerType}:${slot.ownerKey}:${slot.slotKey}`);
  if (new Set(targets).size !== targets.length) {
    throw new ShowroomBlueprintError("A showroom media destination may appear only once.");
  }
  return result;
}

export function blueprintSlotValue(
  snapshot: RevisionSnapshotV4,
  slot: BlueprintMediaSlot,
) {
  if (slot.ownerType === "business") {
    if (slot.slotKey === "logo") return snapshot.business.logoRef;
    if (slot.slotKey === "hero_image") return snapshot.business.heroImageRef;
    return snapshot.business.faviconRef;
  }
  if (slot.ownerType === "product") {
    return snapshot.products.find((product) => product.key === slot.ownerKey)?.imageRef || "";
  }
  const block = snapshot.contentBlocks.blocks.find((item) => item.key === slot.ownerKey);
  return block?.media.find((media) => media.slotKey === slot.slotKey)?.assetKeys[0] || "";
}

export function blueprintReadiness(
  snapshot: RevisionSnapshotV4,
  mediaPlan: BlueprintMediaSlot[],
): BlueprintReadiness {
  const complete = mediaPlan.filter((slot) => blueprintSlotValue(snapshot, slot));
  const required = mediaPlan.filter((slot) => slot.required);
  const unresolvedRequired = required.filter((slot) => !blueprintSlotValue(snapshot, slot));
  return {
    total: mediaPlan.length,
    complete: complete.length,
    required: required.length,
    requiredComplete: required.length - unresolvedRequired.length,
    unresolvedRequired,
    previewReady: true,
    reviewReady: unresolvedRequired.length === 0,
  };
}

export function assignBlueprintSlot(
  snapshot: RevisionSnapshotV4,
  slot: BlueprintMediaSlot,
  assetRef: string,
): RevisionSnapshotV4 {
  if (!/^request-attachment:\d+$/.test(assetRef)) {
    throw new ShowroomBlueprintError("A fulfilled image must be a verified request attachment.");
  }
  if (slot.ownerType === "business") {
    const field = slot.slotKey === "logo"
      ? "logoRef"
      : slot.slotKey === "hero_image"
        ? "heroImageRef"
        : "faviconRef";
    return {
      ...snapshot,
      business: { ...snapshot.business, [field]: assetRef },
    };
  }
  if (slot.ownerType === "product") {
    return {
      ...snapshot,
      products: snapshot.products.map((product) =>
        product.key === slot.ownerKey
          ? { ...product, imageRef: assetRef }
          : product,
      ),
    };
  }
  return {
    ...snapshot,
    contentBlocks: {
      ...snapshot.contentBlocks,
      blocks: snapshot.contentBlocks.blocks.map((block) => {
        if (block.key !== slot.ownerKey) return block;
        const media = block.media.filter((item) => item.slotKey !== slot.slotKey);
        media.push({
          slotKey: slot.slotKey,
          assetKeys: [assetRef],
          altText: slot.altText || slot.label,
          caption: slot.classification === "illustrative" ? "Illustrative image" : "",
        });
        return { ...block, media } as typeof block;
      }),
    },
  };
}

export function mediaPlanFromRecipeMetadata(
  input: string | null,
  snapshot: RevisionSnapshotV4,
) {
  if (!input) return [];
  try {
    const metadata = JSON.parse(input) as { mediaPlan?: unknown };
    return parseBlueprintMediaPlan(metadata.mediaPlan, snapshot);
  } catch (error) {
    if (error instanceof ShowroomBlueprintError) throw error;
    throw new ShowroomBlueprintError("Stored recipe media metadata is invalid.");
  }
}
