import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DISCOVERY_INDUSTRIES, getDiscoveryView } from "../lib/discovery";
import { updateDiscoveryProfile } from "../lib/discovery-admin";
import { buildPerimeterVenueLayout } from "../lib/discovery-venue-layout";
import { migrateDatabase } from "../lib/schema";

const discoveryUiSource = fs.readFileSync(
  path.join(process.cwd(), "components/DiscoveryWorkspace.tsx"),
  "utf8",
);
const discoveryCssSource = fs.readFileSync(
  path.join(process.cwd(), "app/discovery.css"),
  "utf8",
);
assert.match(discoveryUiSource, /window\.setTimeout[\s\S]*420/);
assert.match(discoveryUiSource, /router\.replace/);
assert.doesNotMatch(discoveryUiSource, /type="submit">Search/);
assert.doesNotMatch(discoveryCssSource, /background-size:\s*(?:34|36)px\s+(?:34|36)px/);
assert.match(discoveryCssSource, /venue-hall-shell-v2\.webp/);
assert.doesNotMatch(discoveryUiSource, /VenueLandscaping|venue-bench|venue-planter/);
const venueShell = path.join(process.cwd(), "public/landing/venue-hall-shell-v2.webp");
assert.ok(fs.existsSync(venueShell), "the local architectural venue shell exists");
assert.ok(fs.statSync(venueShell).size <= 300_000, "the architectural venue shell stays under 300 KB");

for (const count of [1, 5, 10, 11, 20, 37]) {
  const layout = buildPerimeterVenueLayout(count, 224, 164);
  assert.equal(layout.positions.length, count, `${count} businesses receive exactly one perimeter position`);
  assert.equal(new Set(layout.positions.map((position) => `${position.left}:${position.top}`)).size, count, `${count} perimeter positions remain unique`);
  assert.ok(layout.clearWidth > 0 && layout.clearHeight > 0, `${count} businesses retain an empty central court`);
  const clearLeft = layout.centerX - layout.clearWidth / 2;
  const clearRight = layout.centerX + layout.clearWidth / 2;
  const clearTop = layout.centerY - layout.clearHeight / 2;
  const clearBottom = layout.centerY + layout.clearHeight / 2;
  layout.positions.forEach((position, index) => {
    assert.ok(position.left >= 0 && position.top >= 0 && position.left + layout.cardWidth <= layout.width && position.top + layout.cardHeight <= layout.height, `${count}:${index} stays inside the hall`);
    const outsideCenter = position.left + layout.cardWidth <= clearLeft || position.left >= clearRight || position.top + layout.cardHeight <= clearTop || position.top >= clearBottom;
    assert.ok(outsideCenter, `${count}:${index} stays outside the central court`);
    layout.positions.slice(index + 1).forEach((other, otherIndex) => {
      const separated = position.left + layout.cardWidth <= other.left || other.left + layout.cardWidth <= position.left || position.top + layout.cardHeight <= other.top || other.top + layout.cardHeight <= position.top;
      assert.ok(separated, `${count}:${index} does not overlap ${index + otherIndex + 1}`);
    });
  });
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-discovery-"));
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
  const addSponsorship = db.prepare("INSERT INTO discovery_sponsorships(business_id,position,active,updated_at) VALUES(?,100,1,?)");
  const addSundaySelection = db.prepare("INSERT INTO sunday_showcase_selections(industry_key,business_id,position,active,updated_at) VALUES(?,?,100,1,?)");
  const future = Date.now() + 30 * 24 * 60 * 60 * 1000;

  function seed(input: {
    handle: string;
    city: string;
    zone: string;
    region: string;
    latitude: number;
    longitude: number;
    product?: string;
    sponsored?: boolean;
    sundaySelected?: boolean;
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
      db.prepare("UPDATE business_subscriptions SET grace_ends_at=? WHERE business_id=?").run(future + 5 * 24 * 60 * 60 * 1000, id);
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
      input.sponsored ? 1 : 0,
      input.excluded ? 1 : 0,
      Date.now(),
      Date.now(),
    );
    const industryKey = input.industryKey || "electronics";
    addMembership.run(id, industryKey);
    if (input.sponsored) addSponsorship.run(id, Date.now());
    if (input.sundaySelected) addSundaySelection.run(industryKey, id, Date.now());
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
      sponsored: index < 2,
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
  seed({ handle: "sheger-soap", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.025, longitude: 38.755, industryKey: "beauty-wellness", sponsored: true });
  for (let index = 0; index < 3; index += 1) {
    seed({ handle: `sunday-textile-${index + 1}`, city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.03 + index * .0001, longitude: 38.76 + index * .0001, industryKey: "fashion-textiles", sundaySelected: true });
  }

  const monday = new Date("2026-07-27T09:00:00+03:00");
  const view = getDiscoveryView({ db, industry: "electronics", expoDay: 1, now: monday });
  assert.equal(view.total, 19, "active approved businesses with a published offering appear regardless of manual renewal date");
  assert.equal(view.sponsoredCount, 2);
  assert.equal(view.locationCount, 3, "real reviewed city locations remain distinct");
  assert.deepEqual(view.cityGroups.map((group) => [group.city, group.count]), [["Addis Ababa", 15], ["Adama", 3]], "multi-business reviewed cities form deterministic counted gateways");
  assert.equal(new Set(view.cityGroups.flatMap((group) => group.showrooms.map((showroom) => showroom.id))).size, 18, "a grouped business appears once in one city gateway");
  assert.equal(view.cityGroups[0].latitude, view.cityGroups[0].showrooms.reduce((total, showroom) => total + showroom.latitude, 0) / view.cityGroups[0].count, "gateway latitude is the exact member centroid");
  assert.equal(view.cityGroups[0].longitude, view.cityGroups[0].showrooms.reduce((total, showroom) => total + showroom.longitude, 0) / view.cityGroups[0].count, "gateway longitude is the exact member centroid");
  assert.deepEqual(
    view.showrooms.filter((showroom) => showroom.handle === "bishoftu-repair").map((showroom) => [showroom.latitude, showroom.longitude]),
    [[8.748, 38.982]],
    "a sparse business keeps its exact reviewed coordinates",
  );
  assert.equal(view.showrooms.some((showroom) => showroom.handle === "expired-device"), true, "manual renewal dates do not hide an active published showroom");
  assert.equal(view.expo.boothCount, 19);
  assert.equal(view.expo.mode, "expo");
  assert.equal(view.expo.isToday, true);
  assert.equal(view.expo.selectedWeekday, 1);
  assert.equal(view.expo.schedule.length, 7);
  assert.deepEqual(view.expo.schedule.map((day) => day.dayLabel), ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "schedule positions remain fixed from Monday through Sunday");
  assert.equal(view.expo.schedule.find((day) => day.isToday)?.dayLabel, "Monday");
  assert.ok(view.expo.booths.every((booth) => booth.revealed && booth.showroom.imagePath === `/booths/${booth.showroom.handle}.webp`), "today's Expo uses each business's approved booth profile image");
  assert.deepEqual(view.expo.booths.map((booth) => booth.slot), Array.from({ length: 19 }, (_, index) => index + 1), "every Expo business receives one continuous floor slot");
  assert.equal(new Set(view.expo.booths.map((booth) => booth.reference)).size, view.expo.booths.length, "Expo booth references are unique");
  assert.match(view.expo.booths[0].reference, /^ELC-B\d{2}$/);

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
  assert.equal(search.showrooms[0].city, "Addis Ababa");
  assert.equal(search.cityGroups.length, 0, "a single searched result remains an isolated exact-coordinate pin");
  assert.equal(search.expo.booths.length, 19, "map search does not narrow the independently scheduled Expo");

  const tuesday = getDiscoveryView({ db, industry: "electronics", q: "Needle signal", expoDay: 2, now: monday });
  assert.equal(tuesday.expo.title, "Beauty, hygiene & household care Expo");
  assert.equal(tuesday.expo.isToday, false);
  assert.equal(tuesday.expo.boothCount, 1);
  assert.ok(tuesday.expo.booths.every((booth) => !booth.revealed && booth.showroom === null), "non-today Expo slots contain no business projection");
  assert.equal(JSON.stringify(tuesday.expo.booths).includes("sheger-soap"), false, "non-today page data does not leak a business handle");

  const wednesday = getDiscoveryView({ db, industry: "electronics", expoDay: 3, now: new Date("2026-07-29T09:00:00+03:00") });
  assert.deepEqual(wednesday.expo.schedule.map((day) => day.dayLabel), ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "advancing today does not reorder weekday cards");
  assert.equal(wednesday.expo.schedule.find((day) => day.isToday)?.dayLabel, "Wednesday", "today indicator moves within the fixed week");
  assert.equal(wednesday.expo.schedule[0].dateIso, "2026-07-27");
  assert.equal(wednesday.expo.schedule[2].dateIso, "2026-07-29");

  const sunday = getDiscoveryView({ db, industry: "electronics", expoDay: 0, now: monday });
  assert.equal(sunday.expo.mode, "livestream");
  assert.equal(sunday.expo.title, "Featured Enterprises: Textiles, garments, leather & paper");
  assert.equal(sunday.expo.boothCount, 3);
  assert.ok(sunday.expo.booths.every((booth) => !booth.revealed && booth.showroom === null), "the future Sunday lineup is also redacted");
  assert.ok(sunday.expo.booths.every((booth) => /^LIVE-\d{2}$/.test(booth.reference)));
  const sundayIndustries = Array.from({ length: 7 }, (_, week) => getDiscoveryView({
    db,
    expoDay: 0,
    now: new Date(monday.getTime() + week * 7 * 86_400_000),
  }).expo.title);
  assert.equal(new Set(sundayIndustries.slice(0, 6)).size, 6, "Sunday rotates through all six industries");
  assert.equal(sundayIndustries[6], sundayIndustries[0], "Sunday industry rotation loops after six weeks");
  const sundayToday = getDiscoveryView({ db, expoDay: 0, now: new Date("2026-08-02T09:00:00+03:00") });
  assert.equal(sundayToday.expo.booths.length, 3);
  assert.ok(sundayToday.expo.booths.every((booth) => booth.revealed), "today's Sunday floor reveals only selected enterprises");

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
    productionScale: "workshop",
    sponsored: true,
    sponsorPosition: 2,
    sundayIndustryKeys: ["electronics"],
    sundayPosition: 3,
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
    { ...(db.prepare("SELECT position,active FROM discovery_sponsorships WHERE business_id=?").get(firstAddisBusinessId) as { position: number; active: number }) },
    { position: 2, active: 1 },
    "admin discovery updates persist paid sponsorship independently",
  );
  assert.deepEqual(
    (db.prepare("SELECT industry_key,position FROM sunday_showcase_selections WHERE business_id=?").all(firstAddisBusinessId) as Array<{ industry_key: string; position: number }>).map((row) => ({ ...row })),
    [{ industry_key: "electronics", position: 3 }],
    "admin discovery updates persist MirtPage's Sunday selection independently",
  );
  const refreshedToday = getDiscoveryView({ db, industry: "electronics", expoDay: 1, now: monday });
  const updatedBooth = refreshedToday.expo.booths.find((booth) => booth.revealed && booth.showroom.id === firstAddisBusinessId);
  assert.equal(updatedBooth?.revealed ? updatedBooth.showroom.imagePath : null, "/booths/admin-approved.webp", "the public booth reads its image from the owning business profile");
  assert.deepEqual(
    (db.prepare("SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key").all(firstAddisBusinessId) as Array<{ industry_key: string }>).map((row) => row.industry_key),
    ["electronics", "machinery-tools"],
    "admin discovery updates replace indexed industry membership atomically",
  );
  assert.throws(() => updateDiscoveryProfile({
    businessId: firstAddisBusinessId,
    industryKeys: ["electronics"],
    boothImagePath: "/booths/admin-approved.webp",
    city: "Addis Ababa",
    zone: "Addis Ababa",
    region: "Addis Ababa",
    latitude: 9.03,
    longitude: 38.76,
    fallbackStyle: "technical",
    productionScale: "workshop",
    sponsored: true,
    sponsorPosition: 2,
    sundayIndustryKeys: ["beauty-wellness"],
    sundayPosition: 3,
    excluded: false,
  }, db), /Sunday selections must match/, "Sunday curation cannot assign a business outside its reviewed industries");
  db.prepare("UPDATE business_discovery_profiles SET booth_image_path='' WHERE business_id=(SELECT id FROM businesses WHERE handle='bishoftu-repair')").run();
  const missingBoothMedia = getDiscoveryView({ db, industry: "electronics", expoDay: 1, now: monday });
  assert.equal(missingBoothMedia.total, 19, "missing booth setup does not erase an otherwise eligible geographic Showroom");
  assert.equal(missingBoothMedia.expo.boothCount, 18, "a business without its own approved booth image does not receive an Expo slot");

  console.log("Geographic Showroom discovery and weekly industry Expo tests passed.");
} finally {
  db.close();
  fs.rmSync(root, { recursive: true, force: true });
}
