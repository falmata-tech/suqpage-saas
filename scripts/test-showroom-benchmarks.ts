import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAllBusinesses, getCatalogByBusinessId } from "../lib/db";
import { SEEDED_EXPO_PROFILES, seededExpoBoothPath } from "../lib/expo-seed";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import { evaluateCompositionFitness } from "../lib/showroom-guidance";
import { ADDITIONAL_SEED_SHOWROOM_BRIEFS } from "../lib/showroom-seed-briefs";

const activeBusinesses = getAllBusinesses().filter((business) => business.status === "active");
const offeringKinds = new Set<string>();
const quantityModes = new Set<string>();
assert.ok(activeBusinesses.length >= 25, "reset must create at least 25 active Expo showrooms");
assert.equal(
  activeBusinesses.length,
  Object.keys(SEEDED_EXPO_PROFILES).length,
  "every seeded active showroom has an Expo location profile",
);
for (const business of activeBusinesses) {
  const catalog = getCatalogByBusinessId(business.id);
  assert.ok(catalog && catalog.products.length >= 3, `${business.handle} has an inquiry-ready catalog`);
  for (const product of catalog.products) {
    offeringKinds.add(product.offering_kind);
    quantityModes.add(product.quantity_mode);
    if (product.offering_kind === "manufacturing_capability") {
      assert.ok(product.capacity_summary, `${business.handle} capability states capacity`);
      assert.ok(product.lead_time_summary, `${business.handle} capability states lead time`);
    }
  }
  assert.ok(
    fs.existsSync(path.join(process.cwd(), "public", seededExpoBoothPath(business.handle))),
    `${business.handle} has a generated booth image`,
  );
}
assert.deepEqual(
  [...offeringKinds].sort(),
  ["made_to_order", "manufacturing_capability", "production_supply", "standard_product"],
  "reset fixtures exercise every offering kind",
);
assert.deepEqual(
  [...quantityModes].sort(),
  ["optional", "required"],
  "reset fixtures exercise both desired-quantity policies",
);

const authoredHandles = new Set(Object.keys(ADDITIONAL_SEED_SHOWROOM_BRIEFS));
const authoredBusinesses = activeBusinesses.filter((business) =>
  authoredHandles.has(business.handle));
assert.equal(authoredBusinesses.length, 18, "all 18 additional showrooms have authored briefs");
const authoredSignatures = new Set<string>();
const authoredTokens = new Set<string>();
const authoredHeaders = new Set<string>();
const authoredHeroes = new Set<string>();
const authoredCatalogs = new Set<string>();
const authoredCtas = new Set<string>();
const authoredFooters = new Set<string>();
const authoredStoryTitles = new Set<string>();
const authoredProcessTitles = new Set<string>();
for (const business of authoredBusinesses) {
  const catalog = getCatalogByBusinessId(business.id);
  assert.ok(catalog, `${business.handle} authored catalog exists`);
  const snapshot = catalogToRevisionSnapshotV4(catalog);
  assert.equal(evaluateCompositionFitness(snapshot).allowed, true, `${business.handle} authored fitness`);
  const ids = snapshot.designManifest.sections.map((section) => section.component);
  authoredSignatures.add(`${snapshot.designManifest.tokenPack}|${ids.join("|")}`);
  authoredTokens.add(snapshot.designManifest.tokenPack);
  authoredHeaders.add(ids[0]);
  authoredHeroes.add(ids[1]);
  authoredCatalogs.add(ids[4]);
  authoredCtas.add(ids[5]);
  authoredFooters.add(ids[6]);
  const story = snapshot.contentBlocks.blocks.find((block) => block.key === "brand-story");
  const process = snapshot.contentBlocks.blocks.find((block) => block.key === "showroom-highlights");
  assert.ok(story && process, `${business.handle} has authored narrative blocks`);
  authoredStoryTitles.add(story.title);
  authoredProcessTitles.add(process.title);
  assert.match(
    snapshot.designManifest.rationale,
    /Composition direction:/,
    `${business.handle} records its authored composition direction`,
  );
}
assert.equal(authoredSignatures.size, 18, "every additional showroom has a distinct full design signature");
assert.ok(authoredTokens.size >= 12, "authored showrooms exercise at least twelve token systems");
assert.equal(authoredHeaders.size, 7, "authored showrooms exercise all header anatomies");
assert.ok(authoredHeroes.size >= 11, "authored showrooms exercise at least eleven hero anatomies");
assert.ok(authoredCatalogs.size >= 8, "authored showrooms exercise at least eight catalog anatomies");
assert.ok(authoredCtas.size >= 5, "authored showrooms exercise at least five CTA anatomies");
assert.equal(authoredFooters.size, 6, "authored showrooms exercise all footer anatomies");
assert.equal(authoredStoryTitles.size, 18, "authored showrooms do not reuse story titles");
assert.equal(authoredProcessTitles.size, 18, "authored showrooms do not reuse process titles");

const benchmarkHandles = new Set([
  "selam-weave",
  "afia-botanics",
  "warka-furniture",
  "addis-metalworks",
  "green-terrace-farm",
  "blue-nile-apiary",
  "rift-valley-mill",
  "entoto-ceramics",
  "koba-leather",
  "nova-assembly",
]);
const businesses = activeBusinesses.filter((business) => benchmarkHandles.has(business.handle));
assert.equal(businesses.length, 10, "ten design benchmark showrooms remain available");
const productCounts = new Set<number>();
const tokenPacks = new Set<string>();
const heroTreatments = new Set<string>();
const headerComponents = new Set<string>();
const footerComponents = new Set<string>();
const catalogComponents = new Set<string>();
const storyComponents = new Set<string>();
const processComponents = new Set<string>();
const middleSequences = new Set<string>();
const surfaceSequences = new Set<string>();
for (const business of businesses) {
  const catalog = getCatalogByBusinessId(business.id);
  assert.ok(catalog, `${business.handle} catalog exists`);
  assert.equal(catalog.collections.length, 0, `${business.handle} has no active collections`);
  assert.ok(
    catalog.categories.every((category) => category.collection_id === null),
    `${business.handle} categories use the category-only taxonomy`,
  );
  assert.ok(
    catalog.products.every((product) => product.collection_id === null),
    `${business.handle} products use the category-only taxonomy`,
  );
  assert.ok(catalog.products.length >= 4, `${business.handle} has a useful catalog`);
  productCounts.add(catalog.products.length);
  const snapshot = catalogToRevisionSnapshotV4(catalog);
  assert.equal(snapshot.collections.length, 0, `${business.handle} snapshot has no collections`);
  assert.ok(
    snapshot.categories.every((category) => category.collectionKey === null),
    `${business.handle} snapshot categories have no collection relationship`,
  );
  assert.ok(
    snapshot.products.every((product) => product.collectionKey === null),
    `${business.handle} snapshot products have no collection relationship`,
  );
  assert.equal(evaluateCompositionFitness(snapshot).allowed, true, `${business.handle} fitness`);
  const componentIds = snapshot.designManifest.sections.map(
    (section) => section.component,
  );
  assert.equal(componentIds.length, 7, `${business.handle} has the canonical section count`);
  assert.equal(
    new Set(componentIds).size,
    componentIds.length,
    `${business.handle} does not repeat an exact component anatomy`,
  );
  tokenPacks.add(snapshot.designManifest.tokenPack);
  const heroSection = snapshot.designManifest.sections.find((section) =>
    section.component.startsWith("hero."),
  );
  const headerSection = snapshot.designManifest.sections.find((section) =>
    section.component.startsWith("header."),
  );
  const footerSection = snapshot.designManifest.sections.find((section) =>
    section.component.startsWith("footer."),
  );
  assert.ok(heroSection, `${business.handle} has one hero`);
  assert.ok(headerSection, `${business.handle} has one header`);
  assert.ok(footerSection, `${business.handle} has one footer`);
  heroTreatments.add(heroSection.mediaIntegration || "none");
  headerComponents.add(headerSection.component);
  footerComponents.add(footerSection.component);
  assert.equal(
    snapshot.designManifest.sections.some((section) =>
      section.component.startsWith("navigation."),
    ),
    false,
    `${business.handle} uses catalog-owned category navigation`,
  );
  const catalogSection = snapshot.designManifest.sections.find((section) =>
    section.component.startsWith("catalog."),
  );
  const storySection = snapshot.designManifest.sections[2];
  const processSection = snapshot.designManifest.sections[3];
  assert.equal(storySection.properties.alignment, "start", `${business.handle} story starts`);
  assert.equal(processSection.properties.alignment, "end", `${business.handle} process alternates`);
  assert.ok(catalogSection, `${business.handle} has one catalog`);
  catalogComponents.add(catalogSection.component);
  storyComponents.add(storySection.component);
  processComponents.add(processSection.component);
  middleSequences.add(
    snapshot.designManifest.sections
      .slice(2, -2)
      .map((section) => section.key)
      .join(">"),
  );
  surfaceSequences.add(
    snapshot.designManifest.sections
      .map((section) => section.surfaceRole)
      .join(">"),
  );
  assert.equal(
    catalogSection.properties.show_filters,
    catalog.categories.length > 1,
    `${business.handle} enables only useful catalog filters`,
  );
  assert.equal(
    catalogSection.properties.show_search,
    catalog.products.length > 6,
    `${business.handle} enables search only for a larger catalog`,
  );
  for (const ref of [business.hero_image_path, ...catalog.products.map((product) => product.image_path)].filter(Boolean)) {
    const absolute = path.join(process.cwd(), "public", ref);
    assert.ok(fs.existsSync(absolute), `${business.handle} media exists: ${ref}`);
  }
}
assert.ok(productCounts.size >= 4, "benchmark catalogs vary their product count");
assert.ok(tokenPacks.size >= 8, "benchmarks exercise at least eight semantic token systems");
assert.ok(heroTreatments.size >= 6, "benchmarks exercise at least six hero media treatments");
assert.equal(headerComponents.size, 7, "benchmarks exercise all seven header anatomies");
assert.equal(footerComponents.size, 6, "benchmarks exercise all six footer anatomies");
assert.ok(catalogComponents.size >= 7, "benchmarks exercise at least seven catalog anatomies");
assert.ok(storyComponents.size >= 4, "benchmarks exercise at least four story anatomies");
assert.ok(processComponents.size >= 3, "benchmarks exercise at least three process anatomies");
assert.deepEqual(
  [...middleSequences],
  ["content-story>content-process>catalog-1"],
  "all benchmarks preserve story, process, then products",
);
assert.deepEqual(
  [...surfaceSequences],
  ["surface>soft>surface>soft>canvas>strong>inverse"],
  "all benchmarks preserve the neutral-to-emphasis surface hierarchy",
);

console.log("Twenty-eight Expo showrooms, 18 authored briefs, and ten validated design benchmarks passed.");
