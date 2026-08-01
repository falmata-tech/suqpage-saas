import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DISCOVERY_INDUSTRIES, getDiscoveryView } from "../lib/discovery";
import { updateDiscoveryProfile } from "../lib/discovery-admin";
import { migrateDatabase } from "../lib/schema";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-discovery-"));
const db = new DatabaseSync(path.join(root, "discovery.db"));

try {
  migrateDatabase(db, { assertDestructiveMigrationCheckpoint: () => {} });

  const addIndustry = db.prepare("INSERT INTO discovery_industries(key,label,icon,position,active) VALUES(?,?,?,?,1)");
  DISCOVERY_INDUSTRIES.forEach((industry, index) => addIndustry.run(industry.key, industry.label, industry.icon, index));
  const addBusiness = db.prepare("INSERT INTO businesses(handle,name,design_key,tagline,description,status) VALUES(?,?,?,?,?,?)");
  const addProduct = db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,?,?,?,?)");
  const addProfile = db.prepare(`
    INSERT INTO business_discovery_profiles(
      business_id,booth_image_path,city,zone,region,latitude,longitude,
      fallback_style,is_featured,is_excluded,approved_at,updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const addMembership = db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)");
  const future = Date.now() + 30 * 24 * 60 * 60 * 1000;

  function seed(input: {
    handle: string;
    city: string;
    zone: string;
    region: string;
    latitude: number;
    longitude: number;
    product?: string;
    featured?: boolean;
    excluded?: boolean;
    status?: "active" | "draft" | "suspended";
    expired?: boolean;
    industryKey?: string;
  }) {
    const id = Number(addBusiness.run(
      input.handle,
      input.handle.replaceAll("-", " "),
      "composition",
      `Useful work from ${input.city}`,
      "A fictional small workshop fixture.",
      input.status || "active",
    ).lastInsertRowid);
    if (input.product !== "") addProduct.run(id, input.product || `Device ${input.handle}`, `device-${input.handle}`, input.product || "Practical device", 1);
    if (input.expired) {
      const now = Date.now();
      db.prepare(`
        UPDATE business_subscriptions
        SET starts_at=?,current_period_start=?,current_period_end=?,grace_ends_at=?
        WHERE business_id=?
      `).run(now - 40 * 86_400_000, now - 35 * 86_400_000, now - 5 * 86_400_000, now - 86_400_000, id);
    } else {
      db.prepare("UPDATE business_subscriptions SET grace_ends_at=? WHERE business_id=?").run(future, id);
    }
    addProfile.run(
      id,
      `/booths/${input.handle}.webp`,
      input.city,
      input.zone,
      input.region,
      input.latitude,
      input.longitude,
      "technical",
      input.featured ? 1 : 0,
      input.excluded ? 1 : 0,
      Date.now(),
      Date.now(),
    );
    addMembership.run(id, input.industryKey || "electronics");
    return id;
  }

  let firstAddisBusinessId = 0;
  for (let index = 0; index < 14; index += 1) {
    const businessId = seed({
      handle: `addis-device-${index + 1}`,
      city: "Addis Ababa",
      zone: "Addis Ababa",
      region: "Addis Ababa",
      latitude: 9.018 + index * .0001,
      longitude: 38.748 + index * .0001,
      product: index === 0 ? "Needle signal tester" : undefined,
      featured: index < 2,
    });
    if (index === 0) firstAddisBusinessId = businessId;
  }
  for (let index = 0; index < 3; index += 1) {
    seed({
      handle: `adama-device-${index + 1}`,
      city: "Adama",
      zone: "East Shewa",
      region: "Oromia",
      latitude: 8.545 + index * .0001,
      longitude: 39.272 + index * .0001,
    });
  }
  seed({ handle: "bishoftu-repair", city: "Bishoftu", zone: "East Shewa", region: "Oromia", latitude: 8.748, longitude: 38.982 });
  seed({ handle: "hidden-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, excluded: true });
  seed({ handle: "expired-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, expired: true });
  seed({ handle: "draft-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, status: "draft" });
  seed({ handle: "empty-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, product: "" });
  seed({ handle: "sheger-soap", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.025, longitude: 38.755, industryKey: "beauty-wellness", featured: true });

  const monday = new Date("2026-07-27T09:00:00+03:00");
  const view = getDiscoveryView({ db, industry: "electronics", expoDay: 1, now: monday });
  assert.equal(view.total, 19, "active approved businesses with a published offering appear regardless of manual renewal date");
  assert.equal(view.featuredCount, 2);
  assert.equal(view.locationCount, 3, "real reviewed city locations remain distinct");
  assert.deepEqual(view.cityGroups.map((group) => [group.city, group.count]), [["Addis Ababa", 15], ["Adama", 3]], "multi-business reviewed cities form deterministic counted gateways");
  assert.equal(new Set(view.cityGroups.flatMap((group) => group.suqs.map((suq) => suq.id))).size, 18, "a grouped business appears once in one city gateway");
  assert.equal(view.cityGroups[0].latitude, view.cityGroups[0].suqs.reduce((total, suq) => total + suq.latitude, 0) / view.cityGroups[0].count, "gateway latitude is the exact member centroid");
  assert.equal(view.cityGroups[0].longitude, view.cityGroups[0].suqs.reduce((total, suq) => total + suq.longitude, 0) / view.cityGroups[0].count, "gateway longitude is the exact member centroid");
  assert.deepEqual(
    view.suqs.filter((suq) => suq.handle === "bishoftu-repair").map((suq) => [suq.latitude, suq.longitude]),
    [[8.748, 38.982]],
    "a sparse business keeps its exact reviewed coordinates",
  );
  assert.equal(view.suqs.some((suq) => suq.handle === "expired-device"), true, "manual renewal dates do not hide an active published showroom");
  assert.equal(view.expo.hallCount, 2);
  assert.equal(view.expo.mode, "expo");
  assert.equal(view.expo.selectedWeekday, 1);
  assert.equal(view.expo.schedule.length, 7);
  assert.equal(view.expo.schedule.find((day) => day.isToday)?.dayLabel, "Monday");
  assert.equal(Math.max(...view.expo.booths.map((booth) => booth.booth)), 12, "an Expo hall never exposes more than twelve booth positions");
  assert.equal(new Set(view.expo.booths.map((booth) => booth.reference)).size, view.expo.booths.length, "Expo booth references are unique");
  assert.match(view.expo.booths[0].reference, /^ELC-H1-B\d{2}$/);

  assert.equal(view.list.items.length, 5, "the database-backed List response is capped at five rows");
  assert.equal(view.list.pageCount, 4);
  const secondPage = getDiscoveryView({ db, industry: "electronics", page: 2, view: "list", expoDay: 1, now: monday });
  assert.equal(secondPage.list.page, 2);
  assert.equal(secondPage.list.items.length, 5);
  assert.equal(secondPage.view, "list");
  assert.equal(secondPage.list.items.some((item) => view.list.items.some((first) => first.id === item.id)), false, "List pages do not repeat rows");
  const clampedPage = getDiscoveryView({ db, industry: "electronics", page: 99, view: "list", expoDay: 1, now: monday });
  assert.equal(clampedPage.list.page, 4, "an out-of-range page is clamped to the final page");
  assert.equal(clampedPage.list.items.length, 4);

  const search = getDiscoveryView({ db, industry: "electronics", q: "Needle signal", expoDay: 1, now: monday });
  assert.equal(search.total, 1, "published offering text is searchable");
  assert.equal(search.suqs[0].city, "Addis Ababa");
  assert.equal(search.cityGroups.length, 0, "a single searched result remains an isolated exact-coordinate pin");
  assert.equal(search.expo.booths.length, 19, "map search does not narrow the independently scheduled Expo");

  const tuesday = getDiscoveryView({ db, industry: "electronics", q: "Needle signal", expoDay: 2, now: monday });
  assert.equal(tuesday.expo.title, "Beauty & body care Expo");
  assert.deepEqual(tuesday.expo.booths.map((booth) => booth.handle), ["sheger-soap"]);

  const sunday = getDiscoveryView({ db, industry: "electronics", expoDay: 0, now: monday });
  assert.equal(sunday.expo.mode, "livestream");
  assert.equal(sunday.expo.title, "Sunday Suq Live");
  assert.deepEqual(new Set(sunday.expo.booths.map((booth) => booth.handle)), new Set(["addis-device-1", "addis-device-2", "sheger-soap"]));
  assert.ok(sunday.expo.booths.every((booth) => /^LIVE-\d{2}$/.test(booth.reference)));

  const invalidIndustry = getDiscoveryView({ db, industry: "not-real" });
  assert.equal(invalidIndustry.industry.key, DISCOVERY_INDUSTRIES[0].key, "invalid industry resolves to the first allowlisted industry");

  const plan = db.prepare("EXPLAIN QUERY PLAN SELECT business_id FROM business_industries WHERE industry_key=?").all("electronics") as Array<{ detail: string }>;
  assert.ok(plan.some((row) => /business_industry_lookup_idx|sqlite_autoindex_business_industries/i.test(row.detail)), "industry membership uses an index");
  assert.equal(
    Number((db.prepare("SELECT COUNT(*) total FROM discovery_industries").get() as { total: number }).total),
    6,
    "the controlled industry vocabulary has six entries",
  );

  updateDiscoveryProfile({
    businessId: firstAddisBusinessId,
    industryKeys: ["electronics", "machinery-tools"],
    boothImagePath: "/booths/admin-approved.webp",
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.03,
    longitude: 38.76,
    fallbackStyle: "technical",
    featured: true,
    excluded: false,
  }, db);
  const updatedProfile = db.prepare(`
    SELECT booth_image_path,is_featured,is_excluded FROM business_discovery_profiles
    WHERE business_id=?
  `).get(firstAddisBusinessId) as { booth_image_path: string; is_featured: number; is_excluded: number };
  assert.deepEqual({ ...updatedProfile }, {
    booth_image_path: "/booths/admin-approved.webp",
    is_featured: 1,
    is_excluded: 0,
  }, "admin discovery updates persist the profile flags and media path");
  assert.deepEqual(
    (db.prepare("SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key").all(firstAddisBusinessId) as Array<{ industry_key: string }>).map((row) => row.industry_key),
    ["electronics", "machinery-tools"],
    "admin discovery updates replace indexed industry membership atomically",
  );

  console.log("Geographic Suq discovery and weekly industry Expo tests passed.");
} finally {
  db.close();
  fs.rmSync(root, { recursive: true, force: true });
}
