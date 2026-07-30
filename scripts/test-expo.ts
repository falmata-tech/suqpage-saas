import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-expo-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "expo.db");
  process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.SUQPAGE_BACKUP_ROOT = path.join(root, "backups");

  const { closeDbForTests, getDb } = await import("../lib/db");
  const { seedDefaultBazaarConfig } = await import("../lib/bazaar");
  const {
    assignExpoHubs,
    getCurrentExpo,
    geographicDistanceKm,
  } = await import("../lib/expo");
  const { DENSE_DEMO_BUSINESSES } = await import("../lib/dense-demo-seed");
  const db = getDb();

  const pureCandidates = [
    { businessId: 1, name: "Addis One", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.03, longitude: 38.74, featured: false },
    { businessId: 2, name: "Addis Two", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.04, longitude: 38.75, featured: false },
    { businessId: 3, name: "Oromia One", city: "Adama", zone: "East Shewa", region: "Oromia", latitude: 8.54, longitude: 39.27, featured: true },
    { businessId: 4, name: "Oromia Two", city: "Bishoftu", zone: "East Shewa", region: "Oromia", latitude: 8.75, longitude: 38.98, featured: false },
    { businessId: 5, name: "Sparse", city: "Gambela", zone: "Agniwak", region: "Gambela", latitude: 8.25, longitude: 34.59, featured: false },
  ];
  const pureAssignments = assignExpoHubs(pureCandidates);
  assert.deepEqual(
    [...new Set(pureAssignments.map((assignment) => assignment.hubKey))],
    ["adama", "addis-ababa"],
  );
  const sparseAssignment = pureAssignments.find((assignment) => assignment.businessId === 5)!;
  const sparseOrigin = pureCandidates.find((candidate) => candidate.businessId === 5)!;
  const addisDistance = geographicDistanceKm(sparseOrigin, {
    latitude: 9.035,
    longitude: 38.745,
  });
  const adamaDistance = geographicDistanceKm(sparseOrigin, {
    latitude: 8.54,
    longitude: 39.27,
  });
  assert.equal(
    sparseAssignment.hubKey,
    addisDistance < adamaDistance ? "addis-ababa" : "adama",
  );
  assert.equal(sparseAssignment.originZone, "Agniwak");
  assert.equal(sparseAssignment.originRegion, "Gambela");

  const hallAssignments = assignExpoHubs(
    Array.from({ length: 13 }, (_, index) => ({
      businessId: index + 1,
      name: `Maker ${String(index + 1).padStart(2, "0")}`,
      city: "Addis Ababa",
      zone: "Addis Ababa",
      region: "Addis Ababa",
      latitude: 9.03,
      longitude: 38.74,
      featured: false,
    })),
  );
  assert.equal(hallAssignments.filter((entry) => entry.hallNumber === 1).length, 12);
  assert.equal(hallAssignments.filter((entry) => entry.hallNumber === 2).length, 1);

  const denseAddisAssignments = assignExpoHubs([
    {
      businessId: 1,
      name: "Existing Addis One",
      city: "Addis Ababa",
      zone: "Addis Ababa",
      region: "Addis Ababa",
      latitude: 9.03,
      longitude: 38.74,
      featured: false,
    },
    {
      businessId: 2,
      name: "Existing Addis Two",
      city: "Addis Ababa",
      zone: "Addis Ababa",
      region: "Addis Ababa",
      latitude: 9.04,
      longitude: 38.75,
      featured: false,
    },
    ...DENSE_DEMO_BUSINESSES.map((business, index) => ({
      businessId: index + 3,
      name: business.name,
      city: "Addis Ababa",
      zone: "Addis Ababa",
      region: "Addis Ababa",
      latitude: business.latitude,
      longitude: business.longitude,
      featured: false,
    })),
  ]);
  assert.equal(denseAddisAssignments.length, 22);
  assert.equal(
    denseAddisAssignments.filter((entry) => entry.hallNumber === 1).length,
    12,
  );
  assert.equal(
    denseAddisAssignments.filter((entry) => entry.hallNumber === 2).length,
    10,
  );
  assert.deepEqual(
    [...new Set(denseAddisAssignments.map((entry) => entry.hubKey))],
    ["addis-ababa"],
  );

  const insertBusiness = db.prepare(`
    INSERT INTO businesses(
      handle,name,design_key,design_manifest_json,tagline,description,
      hero_title,hero_subtitle,hero_image_path,logo_path,status
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?)
  `);
  const fixtures = [
    ["addis-one", "Addis One", "Addis Ababa", "Addis Ababa", "Addis Ababa", 9.03, 38.74, "/booths/addis-one.webp"],
    ["addis-two", "Addis Two", "Addis Ababa", "Addis Ababa", "Addis Ababa", 9.04, 38.75, "/booths/addis-two.webp"],
    ["oromia-one", "Oromia One", "Adama", "East Shewa", "Oromia", 8.54, 39.27, "/booths/oromia-one.webp"],
    ["oromia-two", "Oromia Two", "Bishoftu", "East Shewa", "Oromia", 8.75, 38.98, "/booths/oromia-two.webp"],
    ["sparse-maker", "Sparse Maker", "Gambela", "Agniwak", "Gambela", 8.25, 34.59, "/booths/sparse.webp"],
    ["missing-media", "Missing Media", "Bahir Dar", "Bahir Dar", "Amhara", 11.57, 37.36, ""],
  ] as const;
  for (const [handle, name] of fixtures) {
    insertBusiness.run(
      handle,
      name,
      "composition",
      "{}",
      "Producer",
      "Expo fixture",
      name,
      "Regional producer",
      "",
      "",
      "active",
    );
  }
  seedDefaultBazaarConfig(db);
  const updateProfile = db.prepare(`
    UPDATE bazaar_booth_profiles
    SET industry_keys_json='["community"]',booth_image_path=?,city=?,zone=?,region=?,
      latitude=?,longitude=?,approved_at=CURRENT_TIMESTAMP,is_excluded=0
    WHERE business_id=(SELECT id FROM businesses WHERE handle=?)
  `);
  for (const [handle, , city, zone, region, latitude, longitude, boothImage] of fixtures) {
    updateProfile.run(boothImage, city, zone, region, latitude, longitude, handle);
  }

  const sunday = new Date("2026-07-26T10:00:00.000Z");
  const first = getCurrentExpo({ db, now: sunday });
  assert.equal(first.themeSlug, "enterprise-export-showcase");
  assert.equal(first.status, "live");
  assert.equal(first.booths.length, 5);
  assert.equal(first.map.hubs.length, 2);
  assert.equal(first.booths.some((booth) => booth.handle === "missing-media"), false);
  assert.equal(new Set(first.booths.map((booth) => booth.boothReference)).size, 5);
  assert.equal(
    first.booths.find((booth) => booth.handle === "sparse-maker")?.region,
    "Gambela",
  );
  const legacyBusinessId = first.booths[0].businessId;
  db.prepare(`
    UPDATE expo_hub_assignments
    SET origin_zone='',hub_key='legacy-region',hub_name='Legacy Region Expo',
      hub_zone='',hub_region=''
    WHERE occurrence_id=? AND business_id=?
  `).run(first.occurrenceId, legacyBusinessId);
  const migrated = getCurrentExpo({ db, now: sunday });
  const migratedBooth = migrated.booths.find(
    (booth) => booth.businessId === legacyBusinessId,
  );
  assert.ok(migratedBooth);
  assert.notEqual(migratedBooth.hubKey, "legacy-region");
  assert.ok(migratedBooth.zone);
  assert.ok(
    migrated.map.hubs.find((hub) => hub.key === migratedBooth.hubKey)?.zone,
    "migration-16 assignments receive city-host zone metadata",
  );

  const stable = migrated.booths.map((booth) => ({
    businessId: booth.businessId,
    hubKey: booth.hubKey,
    boothReference: booth.boothReference,
  }));
  db.prepare(`
    UPDATE bazaar_booth_profiles
    SET latitude=14.5,longitude=40.5
    WHERE business_id=(SELECT id FROM businesses WHERE handle='sparse-maker')
  `).run();
  const second = getCurrentExpo({ db, now: sunday });
  assert.deepEqual(
    second.booths.map((booth) => ({
      businessId: booth.businessId,
      hubKey: booth.hubKey,
      boothReference: booth.boothReference,
    })),
    stable,
  );
  assert.equal(
    (db.prepare("SELECT COUNT(*) count FROM expo_hub_assignments").get() as { count: number }).count,
    5,
  );

  closeDbForTests();
  fs.rmSync(root, { recursive: true, force: true });
console.log("Expo eligibility, city hosts, nearest assignment, hall capacity, and occurrence stability passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
