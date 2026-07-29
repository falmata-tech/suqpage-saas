import type { Product } from "./types";
import {
  offeringKinds,
  quantityModes,
  type OfferingKind,
  type QuantityMode,
} from "./offerings";

export type ProductUpkeepKind = "create" | "update";
export type ProductImageAction = "keep" | "remove" | "replace";

export type BasicProductCommand = {
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
  const quantityMode = text(raw.quantityMode, 20) as QuantityMode;
  if (!quantityModes.includes(quantityMode)) {
    throw new ProductUpkeepError("Choose a valid desired-quantity policy.");
  }
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
  return {
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
    categoryId: optionalInteger(raw.categoryId, "Category"),
    imageAction,
    serviceNote: text(raw.serviceNote, 300),
  };
}
