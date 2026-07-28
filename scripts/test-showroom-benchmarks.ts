import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAllBusinesses, getCatalogByBusinessId } from "../lib/db";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import { evaluateCompositionFitness } from "../lib/showroom-guidance";

const businesses = getAllBusinesses().filter((business) => business.status === "active");
assert.equal(businesses.length, 10, "reset must create ten active benchmark businesses");
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

console.log("Ten validated benchmark showrooms, canonical journeys, varied anatomy, media, and fitness passed.");
