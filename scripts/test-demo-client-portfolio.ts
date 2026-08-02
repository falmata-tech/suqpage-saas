import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAllBusinesses, getCatalogByBusinessId } from "../lib/db";
import { seededExpoBoothPath } from "../lib/expo-seed";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";
import { evaluateCompositionFitness } from "../lib/showroom-guidance";

const root = process.cwd();
const active = getAllBusinesses().filter((business) => business.status === "active");
const logoRefs = new Set<string>();
const heroRefs = new Set<string>();
const boothRefs = new Set<string>();
const offeringRefs = new Set<string>();
const rationales = new Set<string>();
const paletteSignatures = new Set<string>();
const processVideoRefs = new Set<string>();

assert.equal(active.length, 66, "portfolio contains 66 active fictional clients");
assert.equal(SCALE_DEMO_BUSINESSES.length, 56, "56 clients use complete explicit creative records");
assert.equal(new Set(SCALE_DEMO_BUSINESSES.map((business) => business.creative.customerRequest)).size, 56, "scale clients have independent customer requests");
assert.equal(new Set(SCALE_DEMO_BUSINESSES.map((business) => business.heroTitle)).size, 56, "scale clients have independent hero direction");
assert.equal(SCALE_DEMO_BUSINESSES.filter((business) => business.productionScale === "growing_factory").length, 8, "eight growing factories broaden the portfolio");

for (const business of active) {
  const catalog = getCatalogByBusinessId(business.id);
  assert.ok(catalog, `${business.handle} catalog exists`);
  assert.equal(catalog.products.length, 4, `${business.handle} publishes exactly four offerings`);
  assert.ok(business.logo_path.startsWith("/"), `${business.handle} has a managed logo`);
  assert.ok(business.hero_image_path.startsWith("/"), `${business.handle} has managed hero media`);
  assert.match(business.process_video_ref, /^youtube:[A-Za-z0-9_-]{11}$/, `${business.handle} has a controlled process video`);

  const boothPath = seededExpoBoothPath(business.handle);
  for (const reference of [business.logo_path, business.hero_image_path, boothPath]) {
    const absolute = path.join(root, "public", reference);
    assert.ok(fs.existsSync(absolute), `${business.handle} media exists: ${reference}`);
    assert.ok(fs.statSync(absolute).size > 200, `${business.handle} media is non-empty: ${reference}`);
  }
  assert.ok(fs.statSync(path.join(root, "public", business.hero_image_path)).size <= 3 * 1024 * 1024, `${business.handle} hero stays within the 3 MiB fixture budget`);
  if (business.hero_image_path.includes("/uploads/seed/portfolio/demo-")) {
    assert.ok(business.hero_image_path.endsWith(".webp"), `${business.handle} generated hero uses WebP`);
    assert.ok(fs.statSync(path.join(root, "public", business.hero_image_path)).size <= 300 * 1024, `${business.handle} generated hero stays within 300 KiB`);
  }

  const projectBrief = path.join(root, "showroom-projects", business.handle, "BRIEF.md");
  const reviewFile = path.join(root, "showroom-projects", business.handle, "reviews", "REVIEW.md");
  assert.ok(fs.existsSync(projectBrief), `${business.handle} has a durable team brief`);
  assert.ok(fs.existsSync(reviewFile), `${business.handle} has a visual review record`);
  const briefText = fs.readFileSync(projectBrief, "utf8");
  for (const heading of ["## Customer And Goal", "## Brand Direction", "## Final Palette", "## Media Authority", "## Composition Direction", "## Booth Direction"]) {
    assert.ok(briefText.includes(heading), `${business.handle} brief includes ${heading}`);
  }

  for (const product of catalog.products) {
    assert.ok(product.image_path.startsWith("/"), `${business.handle}/${product.slug} has managed product media`);
    const absolute = path.join(root, "public", product.image_path);
    assert.ok(fs.existsSync(absolute), `${business.handle}/${product.slug} product media exists`);
    assert.ok(fs.statSync(absolute).size > 200, `${business.handle}/${product.slug} product media is non-empty`);
    if (product.image_path.includes("/uploads/seed/portfolio/demo-")) {
      assert.ok(product.image_path.endsWith(".webp"), `${business.handle}/${product.slug} generated offering uses WebP`);
      assert.ok(fs.statSync(absolute).size <= 150 * 1024, `${business.handle}/${product.slug} generated offering stays within 150 KiB`);
    }
    offeringRefs.add(product.image_path);
    assert.equal(product.video_ref, business.process_video_ref, `${business.handle}/${product.slug} has a relevant demo video`);
  }

  const snapshot = catalogToRevisionSnapshotV4(catalog);
  assert.ok(snapshot.designManifest.customPalette, `${business.handle} has a complete custom palette`);
  assert.equal(evaluateCompositionFitness(snapshot).allowed, true, `${business.handle} composition is admitted`);
  if (business.handle === "addis-metalworks") {
    const catalogSection = snapshot.designManifest.sections.find((section) => section.component.startsWith("catalog."));
    assert.equal(catalogSection?.properties?.show_search, true, "the specification-led benchmark retains catalog search");
  }
  logoRefs.add(business.logo_path);
  heroRefs.add(business.hero_image_path);
  boothRefs.add(boothPath);
  rationales.add(snapshot.designManifest.rationale);
  paletteSignatures.add(JSON.stringify(snapshot.designManifest.customPalette));
  processVideoRefs.add(business.process_video_ref);
}

assert.equal(logoRefs.size, 66, "every fictional client has an independent logo path");
assert.equal(heroRefs.size, 66, "every fictional client has an independent hero path");
assert.equal(boothRefs.size, 66, "every fictional client has an independent booth path");
assert.equal(offeringRefs.size, 264, "every offering has an independent managed image slot");
assert.equal(rationales.size, 66, "every design manifest retains a client-specific rationale");
assert.ok(paletteSignatures.size >= 40, "the portfolio exercises broad client-specific color direction");
assert.ok(processVideoRefs.size >= 10, "the portfolio uses varied production-relevant video references");

console.log("Complete demo portfolio passed: 66 briefs, logos, heroes, booths, videos, admitted palettes, and 264 imaged offerings.");
