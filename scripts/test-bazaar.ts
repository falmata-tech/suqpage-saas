import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-bazaar-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "bazaar.db");
  process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.SUQPAGE_BACKUP_ROOT = path.join(root, "backups");

  const { closeDbForTests, getDb } = await import("../lib/db");
  const {
    BazaarAdminError,
    getCurrentBazaar,
    listBazaarAdminState,
    updateBazaarBoothPlacement,
    updateBazaarBoothProfile,
    updateBazaarTheme,
  } = await import("../lib/bazaar");
  const db = getDb();

  const insertBusiness = db.prepare(`
    INSERT INTO businesses(
      handle,name,design_key,design_manifest_json,tagline,description,
      hero_title,hero_subtitle,hero_image_path,logo_path,status
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?)
  `);
  insertBusiness.run(
    "alhayabrand",
    "Al Haya Brand",
    "composition",
    "{}",
    "Modest essentials",
    "Textile showroom",
    "Quiet elegance",
    "Modest wear and clear inquiries",
    "/uploads/seed/alhaya/hero-featured.jpg",
    "",
    "active",
  );
  insertBusiness.run(
    "usashopet",
    "USAshopET",
    "composition",
    "{}",
    "Beauty shelf",
    "Beauty and wellness showroom",
    "Your beauty shelf",
    "Trusted personal care",
    "/uploads/seed/usashopet/hero.jpg",
    "",
    "active",
  );
  insertBusiness.run(
    "novatech",
    "NovaTech",
    "composition",
    "{}",
    "Flagship technology",
    "Technology showroom",
    "The next generation",
    "Devices and human confirmation",
    "/uploads/seed/novatech/iphone-17-pro.jpg",
    "",
    "active",
  );
  insertBusiness.run(
    "homevibe",
    "HomeVibe",
    "composition",
    "{}",
    "Home goods",
    "Inactive draft showroom",
    "A calmer home",
    "Home essentials",
    "/uploads/seed/homevibe/dyson-v16.jpg",
    "",
    "draft",
  );
  insertBusiness.run(
    "community-maker",
    "Community Maker",
    "composition",
    "{}",
    "Local work",
    "No media yet",
    "Local work",
    "A no-media booth fallback",
    "",
    "",
    "active",
  );

  const sunday = new Date("2026-07-26T10:00:00.000Z");
  const first = getCurrentBazaar({ db, now: sunday });
  assert.equal(first.status, "live");
  assert.equal(first.themeSlug, "community-market-special-event");
  assert.deepEqual(
    first.booths.map((booth) => booth.name).sort(),
    ["Al Haya Brand", "Community Maker", "NovaTech", "USAshopET"],
  );
  assert.equal(first.booths.some((booth) => booth.name === "HomeVibe"), false);
  assert.equal(
    first.booths.find((booth) => booth.name === "Community Maker")?.imageUrl,
    "",
  );
  assert.equal(
    first.booths.find((booth) => booth.name === "Community Maker")?.fallbackToken,
    "market",
  );

  const stableCoordinates = first.booths.map((booth) => ({
    id: booth.businessId,
    x: booth.x,
    y: booth.y,
    width: booth.width,
    height: booth.height,
  }));
  const second = getCurrentBazaar({ db, now: sunday });
  assert.deepEqual(
    second.booths.map((booth) => ({
      id: booth.businessId,
      x: booth.x,
      y: booth.y,
      width: booth.width,
      height: booth.height,
    })),
    stableCoordinates,
  );
  assert.equal(
    (db.prepare("SELECT COUNT(*) count FROM bazaar_occurrences").get() as { count: number }).count,
    1,
  );
  assert.equal(
    (db.prepare("SELECT COUNT(*) count FROM bazaar_booths").get() as { count: number }).count,
    first.booths.length,
  );

  db.prepare(`
    UPDATE bazaar_booth_profiles
    SET is_excluded=1
    WHERE business_id=(SELECT id FROM businesses WHERE handle='usashopet')
  `).run();
  const afterExclusion = getCurrentBazaar({ db, now: sunday });
  assert.equal(afterExclusion.booths.some((booth) => booth.handle === "usashopet"), false);
  assert.equal(
    (db.prepare(`
      SELECT status FROM bazaar_booths
      WHERE business_id=(SELECT id FROM businesses WHERE handle='usashopet')
    `).get() as { status: string }).status,
    "excluded",
  );

  db.prepare(`
    UPDATE bazaar_booth_profiles
    SET is_featured=1
    WHERE business_id=(SELECT id FROM businesses WHERE handle='novatech')
  `).run();
  const afterFeatured = getCurrentBazaar({ db, now: sunday });
  assert.equal(afterFeatured.booths[0].handle, "novatech");
  assert.equal(afterFeatured.booths[0].featured, true);

  const adminState = listBazaarAdminState({ db, now: sunday });
  assert.equal(adminState.themes.length, 7);
  assert.equal(adminState.profiles.some((profile) => profile.handle === "novatech" && profile.featured), true);
  const themeId = (
    db.prepare("SELECT id FROM bazaar_themes WHERE slug='electronics-appliances'").get() as { id: number }
  ).id;
  updateBazaarTheme({
    themeId,
    name: "Electronics Discovery",
    industryKeys: " electronics, machinery-tools, electronics ",
    timezone: "Africa/Addis_Ababa",
    startsAtTime: "04:00",
    active: true,
  }, db);
  assert.deepEqual(
    JSON.parse((db.prepare("SELECT industry_keys_json FROM bazaar_themes WHERE id=?").get(themeId) as { industry_keys_json: string }).industry_keys_json),
    ["electronics", "machinery-tools"],
  );
  assert.throws(
    () => updateBazaarTheme({ themeId, name: "", industryKeys: "", timezone: "Africa/Addis_Ababa", startsAtTime: "bad", active: true }, db),
    (error: unknown) => error instanceof BazaarAdminError && error.code === "required",
  );

  const communityBusinessId = (
    db.prepare("SELECT id FROM businesses WHERE handle='community-maker'").get() as { id: number }
  ).id;
  updateBazaarBoothProfile({
    businessId: communityBusinessId,
    industryKeys: "community, food-farming",
    boothImagePath: "",
    fallbackStyle: "market",
    featured: true,
    excluded: false,
  }, db);
  assert.equal(
    (db.prepare("SELECT is_featured FROM bazaar_booth_profiles WHERE business_id=?").get(communityBusinessId) as { is_featured: number }).is_featured,
    1,
  );
  assert.throws(
    () => updateBazaarBoothProfile({ businessId: communityBusinessId, industryKeys: "community", boothImagePath: "https://remote.test/img.jpg", fallbackStyle: "market", featured: false, excluded: false }, db),
    (error: unknown) => error instanceof BazaarAdminError && error.code === "invalid_media_path",
  );

  const boothId = afterFeatured.booths[0].id;
  updateBazaarBoothPlacement({ boothId, x: 120, y: 140, width: 190, height: 120 }, db);
  assert.deepEqual(
    { ...(db.prepare("SELECT x,y,width,height FROM bazaar_booths WHERE id=?").get(boothId) as { x: number; y: number; width: number; height: number }) },
    { x: 120, y: 140, width: 190, height: 120 },
  );
  assert.throws(
    () => updateBazaarBoothPlacement({ boothId, x: -1, y: 140, width: 190, height: 120 }, db),
    (error: unknown) => error instanceof BazaarAdminError && error.code === "out_of_bounds",
  );

  db.prepare("UPDATE bazaar_themes SET active=0").run();
  const unavailable = getCurrentBazaar({ db, now: sunday });
  assert.equal(unavailable.status, "unavailable");
  assert.equal(unavailable.booths.length, 0);

  closeDbForTests();
  fs.rmSync(root, { recursive: true, force: true });
  console.log("Bazaar occurrence, booth placement, fallback, exclusion, and unavailable-state tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
