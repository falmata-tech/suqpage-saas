import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAllBusinesses, getCatalogByBusinessId } from "../lib/db";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import { evaluateCompositionFitness } from "../lib/showroom-guidance";

const businesses = getAllBusinesses().filter((business) => business.status === "active");
assert.equal(businesses.length, 10, "reset must create ten active benchmark businesses");
const productCounts = new Set<number>();
for (const business of businesses) {
  const catalog = getCatalogByBusinessId(business.id);
  assert.ok(catalog, `${business.handle} catalog exists`);
  assert.ok(catalog.products.length >= 4, `${business.handle} has a useful catalog`);
  productCounts.add(catalog.products.length);
  const snapshot = catalogToRevisionSnapshotV4(catalog);
  assert.equal(evaluateCompositionFitness(snapshot).allowed, true, `${business.handle} fitness`);
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
  assert.ok(catalogSection, `${business.handle} has one catalog`);
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

console.log("Ten validated benchmark showrooms, varied catalogs, media, and fitness passed.");
