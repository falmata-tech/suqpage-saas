import assert from "node:assert/strict";
import { getAllBusinesses, getCatalogByBusinessId } from "../lib/db";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import {
  assignBlueprintSlot,
  blueprintReadiness,
  blueprintSlotValue,
  parseBlueprintMediaPlan,
} from "../lib/showroom-blueprint";

const business = getAllBusinesses().find((item) => item.handle === "selam-weave");
assert.ok(business, "benchmark business must exist");
const catalog = getCatalogByBusinessId(business.id);
assert.ok(catalog, "benchmark catalog must exist");
const original = catalogToRevisionSnapshotV4(catalog);
const target = original.products[0];
const snapshot = {
  ...original,
  products: original.products.map((product) =>
    product.key === target.key ? { ...product, imageRef: "" } : product,
  ),
};
const mediaPlan = parseBlueprintMediaPlan([
  {
    key: "primary-product",
    ownerType: "product",
    ownerKey: target.key,
    slotKey: "product_image",
    label: `${target.name} product image`,
    purpose: "Show the actual product clearly in the catalog.",
    required: true,
    aspectRatio: "square",
    altText: target.name,
    classification: "factual",
  },
], snapshot);
assert.equal(blueprintReadiness(snapshot, mediaPlan).reviewReady, false);
const fulfilled = assignBlueprintSlot(snapshot, mediaPlan[0], "request-attachment:123");
assert.equal(blueprintSlotValue(fulfilled, mediaPlan[0]), "request-attachment:123");
assert.equal(blueprintReadiness(fulfilled, mediaPlan).reviewReady, true);
assert.throws(
  () => parseBlueprintMediaPlan([{ ...mediaPlan[0], purpose: "https://unsafe.test" }], snapshot),
  /safe text limits/,
);

console.log("Showroom blueprint media-plan parsing, readiness, and exact assignment passed.");
