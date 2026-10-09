import { productVideo } from './video/product-video';
import { parseProductMedia, type ProductMedia } from "./product-media";
import type { Product } from "./types";
import {
  normalizeQuantityMode,
  offeringKinds,
  quantityModes,
  type OfferingKind,
  type QuantityMode,
} from "./offerings";
import {
  normalizeOfferingHighlights,
  normalizeOfferingPriceMinor,
  normalizeOfferingUnit,
} from "./offering-presentation";

export type ProductUpkeepKind = "create" | "update";
export type ProductImageAction = "keep" | "remove" | "replace";

export type ProductOptionInput = { name: string; values: string[] };

export type BasicProductCommand = {
  media?: ProductMedia[];
  preserveMetadata?: boolean;
  updateListingState?: boolean;
  optionGroups?: ProductOptionInput[];
  isPublished?: boolean;
  kind: ProductUpkeepKind;
  businessId: number;
  productId: number | null;
  expectedContentVersion: number;
  idempotencyKey: string;
  name: string;
  description: string;
  availability: Product["availability"];
  offeringKind: OfferingKind;
  quantityMode: QuantityMode;
  capacitySummary: string;
  minimumOrderSummary: string;
  leadTimeSummary: string;
  priceMinor: number | null;
  quantityUnit: string;
  highlights: string[];
  videoRef: string;
  categoryId: number | null;
  imageAction: ProductImageAction;
  serviceNote: string;
};

export class ProductUpkeepError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "invalid_command",
  ) {
    super(message);
  }
}

const commandKeys = new Set([
  "media",
  "preserveMetadata",
  "updateListingState",
  "optionGroups",
  "isPublished",
  "kind",
  "businessId",
  "productId",
  "expectedContentVersion",
  "idempotencyKey",
  "name",
  "description",
  "availability",
  "offeringKind",
  "quantityMode",
  "capacitySummary",
  "minimumOrderSummary",
  "leadTimeSummary",
  "priceMinor",
  "quantityUnit",
  "highlights",
  "videoRef",
  "categoryId",
  "imageAction",
  "serviceNote",
]);
const availabilityValues = new Set<Product["availability"]>([
  "available",
  "limited",
  "unavailable",
  "coming_soon",
]);
const imageActions = new Set<ProductImageAction>(["keep", "remove", "replace"]);
const controlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const text = (value: unknown, max: number) =>
  String(value ?? "").trim().replace(controlPattern, "").slice(0, max);
const boundedText = (value: unknown, max: number, label: string) => {
  const cleaned = String(value ?? "").trim().replace(controlPattern, "");
  if (cleaned.length > max) {
    throw new ProductUpkeepError(`${label} is too long.`);
  }
  return cleaned;
};

const positiveInteger = (value: unknown, label: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ProductUpkeepError(`${label} is invalid.`);
  }
  return parsed;
};

const optionalInteger = (value: unknown, label: string) => {
  if (value === null || value === undefined || value === "") return null;
  return positiveInteger(value, label);
};

export function parseProductOptions(raw: unknown): ProductOptionInput[] {
  if (!Array.isArray(raw) || raw.length > 4) throw new ProductUpkeepError("Use up to four option groups.");
  const names = new Set<string>();
  return raw.map(entry => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry) || Object.keys(entry).some(key => !["name", "values"].includes(key))) throw new ProductUpkeepError("Invalid product options.");
    const name = boundedText(entry.name, 80, "Option name");
    if (!name || names.has(name.toLowerCase())) throw new ProductUpkeepError("Give each option group a different name.");
    names.add(name.toLowerCase());
    if (!Array.isArray(entry.values) || !entry.values.length || entry.values.length > 50) throw new ProductUpkeepError("Each option needs 1–50 choices.");
    const values = entry.values.map((value: unknown) => {
      if (typeof value !== "string") throw new ProductUpkeepError("Option choices must be text.");
      const text = boundedText(value, 100, "Option choice");
      if (!text) throw new ProductUpkeepError("Remove empty option choices.");
      return text;
    });
    if (new Set(values.map((v: string) => v.toLowerCase())).size !== values.length) throw new ProductUpkeepError("Option choices must be different.");
    return { name, values };
  });
}

export function parseBasicProductCommand(
  raw: Record<string, unknown>,
): BasicProductCommand {
  if (Object.keys(raw).some((key) => !commandKeys.has(key))) {
    throw new ProductUpkeepError(
      "The product update contains unsupported fields.",
      400,
      "unsupported_fields",
    );
  }
  if (raw.preserveMetadata !== undefined && typeof raw.preserveMetadata !== "boolean") throw new ProductUpkeepError("Invalid metadata policy.");
  const kind = raw.kind;
  if (kind !== "create" && kind !== "update") {
    throw new ProductUpkeepError("Choose a valid product action.");
  }
  const productId = optionalInteger(raw.productId, "Product");
  if ((kind === "create" && productId !== null) || (kind === "update" && !productId)) {
    throw new ProductUpkeepError("The product action does not match its target.");
  }
  const name = text(raw.name, 140);
  const description = text(raw.description, 3000);
  if (!name) throw new ProductUpkeepError("Product name is required.");
  if (!description) {
    throw new ProductUpkeepError("Product description is required.");
  }
  const availability = text(raw.availability, 30) as Product["availability"];
  if (!availabilityValues.has(availability)) {
    throw new ProductUpkeepError("Choose a valid availability.");
  }
  const offeringKind = text(raw.offeringKind, 40) as OfferingKind;
  if (!offeringKinds.includes(offeringKind)) {
    throw new ProductUpkeepError("Choose a valid offering type.");
  }
  const submittedQuantityMode = text(raw.quantityMode, 20) as QuantityMode;
  if (!quantityModes.includes(submittedQuantityMode)) {
    throw new ProductUpkeepError("Choose a valid desired-quantity policy.");
  }
  const quantityMode = normalizeQuantityMode(submittedQuantityMode);
  const imageAction = text(raw.imageAction, 20) as ProductImageAction;
  if (!imageActions.has(imageAction)) {
    throw new ProductUpkeepError("Choose a valid image action.");
  }
  const idempotencyKey = text(raw.idempotencyKey, 100);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw new ProductUpkeepError(
      "The product form expired. Refresh and try again.",
      400,
      "invalid_idempotency_key",
    );
  }
  let priceMinor: number | null;
  let quantityUnit: string;
  let highlights: string[];
  try {
    priceMinor = normalizeOfferingPriceMinor(raw.priceMinor);
    quantityUnit = normalizeOfferingUnit(raw.quantityUnit);
    highlights = normalizeOfferingHighlights(raw.highlights);
  } catch (error) {
    throw new ProductUpkeepError(
      error instanceof Error ? error.message : "The offering details are invalid.",
    );
  }
  if (raw.isPublished !== undefined && typeof raw.isPublished !== "boolean") throw new ProductUpkeepError("Choose listed or hidden visibility.");
  if (raw.updateListingState !== undefined && typeof raw.updateListingState !== "boolean") throw new ProductUpkeepError("Invalid listing update.");
  return {
    ...(raw.media !== undefined ? {media: (() => {try {return parseProductMedia(raw.media);} catch(error) {throw new ProductUpkeepError(error instanceof Error ? error.message : "Invalid product media.");}})()} : {}),
    ...(raw.preserveMetadata !== undefined ? { preserveMetadata: raw.preserveMetadata as boolean } : {}),
    ...(raw.updateListingState !== undefined ? { updateListingState: raw.updateListingState as boolean } : {}),
    ...(raw.optionGroups !== undefined ? { optionGroups: parseProductOptions(raw.optionGroups) } : {}),
    ...(raw.isPublished !== undefined ? { isPublished: raw.isPublished as boolean } : {}),
    kind,
    businessId: positiveInteger(raw.businessId, "Business"),
    productId,
    expectedContentVersion: positiveInteger(
      raw.expectedContentVersion,
      "Content version",
    ),
    idempotencyKey,
    name,
    description,
    availability,
    offeringKind,
    quantityMode,
    capacitySummary: boundedText(raw.capacitySummary, 180, "Capacity"),
    minimumOrderSummary: boundedText(raw.minimumOrderSummary, 140, "Minimum order"),
    leadTimeSummary: boundedText(raw.leadTimeSummary, 140, "Lead time"),
    priceMinor,
    quantityUnit,
    highlights,
    videoRef: (() => {
      const value = text(raw.videoRef, 40);
      if (value) { try { productVideo(value); } catch { throw new ProductUpkeepError("Use a supported video link."); } }
      return value;
    })(),
    categoryId: optionalInteger(raw.categoryId, "Category"),
    imageAction,
    serviceNote: text(raw.serviceNote, 300),
  };
}
