import assert from "node:assert/strict";
import { getAllBusinesses, getCatalogByBusinessId } from "../lib/db";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import {
  evaluateCompositionFitness,
  guidanceForComponent,
  SHOWROOM_DESIGN_PROCESS,
  SHOWROOM_MEDIA_TREATMENTS,
  SHOWROOM_TEMPLATES,
} from "../lib/showroom-guidance";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "../lib/showroom-bank-release";

assert.equal(SHOWROOM_TEMPLATES.length, 8);
for (const template of SHOWROOM_TEMPLATES) {
  assert.equal(template.sectionPlan.length, 6);
  assert.deepEqual(
    template.sectionPlan.map((section) => section.slot),
    ["header", "hero", "content", "catalog", "call_to_action", "footer"],
  );
  assert.ok(template.description.length > 20);
  assert.ok(template.contentNeeds.length > 0);
  assert.ok(template.visualTones.length > 0);
  assert.ok(template.surfaceGuidance.length >= 2);
  assert.ok(template.pacingRules.length >= 2);
  assert.ok(template.avoidWhen.length > 0);
  assert.equal("signatureBudget" in template, false);
  assert.equal("archetypes" in template, false);
  assert.equal("tokenPack" in template, false);
  assert.equal("components" in template, false);
}
assert.equal(SHOWROOM_DESIGN_PROCESS.decisionOrder[2], "page_template");
assert.equal(SHOWROOM_MEDIA_TREATMENTS.natural.visualWeight, "neutral");
assert.equal(SHOWROOM_MEDIA_TREATMENTS.surface_blend.visualWeight, "signature");
assert.equal(SHOWROOM_MEDIA_TREATMENTS.ambient_overlay.status, "legacy");
for (const component of SHOWROOM_COMPONENT_BANK_LATEST.components) {
  const guidance = guidanceForComponent(component);
  assert.ok(guidance.noMediaFallbacks.length > 0);
  assert.equal(guidance.supportsRtl, true);
  assert.ok(guidance.visualDescription.length > 40);
  assert.ok(guidance.contentNeeds.length > 0);
  assert.ok(guidance.idealWhen.length > 0);
  assert.ok(guidance.avoidWhen.length > 0);
  assert.ok(guidance.renderedAnatomy.regions.length > 0);
  assert.ok(guidance.renderedAnatomy.mediaPlanes.max >= guidance.renderedAnatomy.mediaPlanes.min);
  if (component.slot === "hero" || component.slot === "content") {
    assert.ok(guidance.compatibleMediaIntegrations.includes("natural"));
  }
  assert.equal("businessArchetypes" in guidance, false);
  assert.equal("catalogModes" in guidance, false);
}
for (const slot of ["header", "footer"] as const) {
  const guidance = SHOWROOM_COMPONENT_BANK_LATEST.components
    .filter((component) => component.slot === slot)
    .map((component) => guidanceForComponent(component));
  assert.equal(
    new Set(guidance.map((entry) => entry.layoutFamily)).size,
    guidance.length,
    `${slot} choices expose distinct layout families`,
  );
  assert.equal(
    new Set(guidance.map((entry) => entry.renderedAnatomy.regions.join(">"))).size,
    guidance.length,
    `${slot} choices expose distinct rendered anatomy`,
  );
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

const duplicateControls = structuredClone(snapshot);
const duplicateCatalog = duplicateControls.designManifest.sections.find((section) =>
  section.component.startsWith("catalog."),
);
assert.ok(duplicateCatalog);
duplicateCatalog.properties.show_filters = true;
duplicateControls.designManifest.sections.splice(2, 0, {
  key: "navigation-duplicate",
  component: "navigation.category-pills@1",
  contentBlockKey: null,
  properties: {
    density: "comfortable",
    motion_intensity: "quiet",
    decorative_depth: "clean",
  },
  bindings: {
    categories: "catalog.categories",
  },
});
const duplicateControlsResult = evaluateCompositionFitness(duplicateControls);
assert.equal(duplicateControlsResult.allowed, false);
assert.ok(
  duplicateControlsResult.issues.some(
    (issue) =>
      issue.code === "duplicate_category_controls" ||
      issue.code === "noncanonical_section_count",
  ),
);

const reordered = structuredClone(snapshot);
const story = reordered.designManifest.sections[2];
reordered.designManifest.sections[2] = reordered.designManifest.sections[3];
reordered.designManifest.sections[3] = story;
assert.ok(
  evaluateCompositionFitness(reordered).issues.some(
    (issue) => issue.code === "noncanonical_section_order",
  ),
);

const filler = structuredClone(snapshot);
filler.designManifest.sections.splice(4, 0, {
  key: "trust-filler",
  component: "trust.metrics@1",
  contentBlockKey: null,
  properties: {
    density: "comfortable",
    motion_intensity: "quiet",
    decorative_depth: "clean",
  },
  bindings: {},
  surfaceRole: "surface",
});
assert.ok(
  evaluateCompositionFitness(filler).issues.some(
    (issue) => issue.code === "noncanonical_section_count",
  ),
);

const monotone = structuredClone(snapshot);
for (const section of monotone.designManifest.sections) {
  section.surfaceRole = "canvas";
}
assert.ok(
  evaluateCompositionFitness(monotone).issues.some(
    (issue) => issue.code === "surface_monotony",
  ),
);
assert.equal(evaluateCompositionFitness(monotone).allowed, true);

const alternateSurfaces = structuredClone(snapshot);
const alternateRoleOrder = [
  "inverse",
  "canvas",
  "strong",
  "surface",
  "secondary-soft",
  "accent-soft",
] as const;
alternateSurfaces.designManifest.sections.forEach((section, index) => {
  section.surfaceRole = alternateRoleOrder[index];
});
assert.equal(evaluateCompositionFitness(alternateSurfaces).allowed, true);
assert.equal(
  evaluateCompositionFitness(alternateSurfaces).issues.some(
    (issue) => issue.code === "noncanonical_surface_sequence",
  ),
  false,
);

const expressiveComposition = structuredClone(snapshot);
expressiveComposition.designManifest.sections[0].component =
  "header.transparent-overlay@1";
expressiveComposition.designManifest.sections[4].component =
  "call-to-action.magazine-close@1";
expressiveComposition.designManifest.sections[5].component =
  "footer.magazine-masthead@1";
const expressiveResult = evaluateCompositionFitness(expressiveComposition);
assert.equal(expressiveResult.allowed, true);
assert.ok(
  expressiveResult.issues.some(
    (issue) =>
      issue.code === "too_many_signatures" && issue.severity === "warning",
  ),
);

const missingSignatureMedia = structuredClone(snapshot);
missingSignatureMedia.business.heroImageRef = "";
const hero = missingSignatureMedia.designManifest.sections.find((section) =>
  section.component.startsWith("hero."),
);
assert.ok(hero);
hero.mediaIntegration = "surface_blend";
const heroBlock = missingSignatureMedia.contentBlocks.blocks.find(
  (block) => block.key === hero.contentBlockKey,
);
assert.ok(heroBlock);
heroBlock.media = [];
const missingMediaResult = evaluateCompositionFitness(missingSignatureMedia);
assert.equal(missingMediaResult.allowed, false);
assert.ok(
  missingMediaResult.issues.some(
    (issue) => issue.code === "media_treatment_requires_image",
  ),
);

console.log("Showroom templates, component guidance, and deterministic fitness passed.");
