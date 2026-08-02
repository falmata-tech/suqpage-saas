import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAllBusinesses, getCatalogByBusinessId, getDb } from "../lib/db";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";
import {
  SEEDED_FEATURED_HANDLES,
  seededExpoBoothPath,
} from "../lib/expo-seed";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import { evaluateCompositionFitness } from "../lib/showroom-guidance";

const activeBusinesses = getAllBusinesses().filter((business) => business.status === "active");
const offeringKinds = new Set<string>();
const quantityModes = new Set<string>();
assert.equal(activeBusinesses.length, 66, "reset creates 66 Made-in-Ethiopia demo showrooms");
assert.equal(SCALE_DEMO_BUSINESSES.length, 56, "discovery fixture registry contains 56 authored businesses");
assert.equal(
  Number((getDb().prepare("SELECT COUNT(*) total FROM business_discovery_profiles").get() as { total: number }).total),
  activeBusinesses.length,
  "every seeded active showroom has an approved discovery profile",
);
const featuredHandles = (getDb().prepare(`
  SELECT b.handle FROM businesses b
  JOIN business_discovery_profiles p ON p.business_id=b.id
  WHERE b.status='active' AND p.is_featured=1 AND p.is_excluded=0
  ORDER BY b.handle
`).all() as Array<{ handle: string }>).map((row) => row.handle);
assert.equal(featuredHandles.length, 10, "reset creates ten featured showrooms");
assert.deepEqual(
  featuredHandles,
  [...SEEDED_FEATURED_HANDLES].sort(),
  "only the explicitly curated showrooms are featured",
);
for (const business of activeBusinesses) {
  const catalog = getCatalogByBusinessId(business.id);
  assert.equal(catalog?.products.length, 4, `${business.handle} has exactly four designed offerings`);
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
  ["optional"],
  "reset fixtures use optional desired quantity",
);

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
  assert.equal(catalog.products.length, 4, `${business.handle} has four designed offerings`);
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
    business.handle === "addis-metalworks" || catalog.products.length > 6,
    `${business.handle} uses search only for scale or the specification-lookup benchmark`,
  );
  for (const ref of [business.hero_image_path, ...catalog.products.map((product) => product.image_path)].filter(Boolean)) {
    const absolute = path.join(process.cwd(), "public", ref);
    assert.ok(fs.existsSync(absolute), `${business.handle} media exists: ${ref}`);
  }
}
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
  ["surface>accent-soft>surface>secondary-soft>canvas>strong>inverse"],
  "all benchmarks introduce both palette families before the strong close",
);

console.log("Sixty-six designed discovery showrooms with four offerings and ten validated benchmark compositions passed.");
