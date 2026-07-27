import assert from "node:assert/strict";
import { getAllBusinesses, getCatalogByBusinessId } from "../lib/db";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import {
  evaluateCompositionFitness,
  guidanceForComponent,
  SHOWROOM_TEMPLATES,
} from "../lib/showroom-guidance";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "../lib/showroom-bank-release";

assert.equal(SHOWROOM_TEMPLATES.length, 8);
for (const template of SHOWROOM_TEMPLATES) {
  assert.equal(template.components.length, 8);
  for (const id of template.components) {
    assert.ok(
      SHOWROOM_COMPONENT_BANK_LATEST.components.some((component) => component.id === id),
      `${template.id} references ${id}`,
    );
  }
}
for (const component of SHOWROOM_COMPONENT_BANK_LATEST.components) {
  const guidance = guidanceForComponent(component);
  assert.ok(guidance.noMediaFallbacks.length > 0);
  assert.equal(guidance.supportsRtl, true);
}
const business = getAllBusinesses().find((item) => item.handle === "selam-weave");
assert.ok(business);
const catalog = getCatalogByBusinessId(business.id);
assert.ok(catalog);
const snapshot = catalogToRevisionSnapshotV4(catalog);
assert.equal(evaluateCompositionFitness(snapshot).allowed, true);
const sparseDense = structuredClone(snapshot);
const catalogSection = sparseDense.designManifest.sections.find((section) =>
  section.component.startsWith("catalog."),
);
assert.ok(catalogSection);
catalogSection.component = "catalog.dense-wholesale@1";
sparseDense.products = sparseDense.products.slice(0, 3);
const rejected = evaluateCompositionFitness(sparseDense);
assert.equal(rejected.allowed, false);
assert.ok(rejected.issues.some((issue) => issue.code === "catalog_too_sparse"));

console.log("Showroom templates, component guidance, and deterministic fitness passed.");
