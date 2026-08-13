import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ALL_DISCOVERY_INDUSTRIES, DISCOVERY_INDUSTRIES, getDiscoveryView, getFeaturedShowroomsView, getMarketplaceDiscoveryView, getSponsoredShowrooms } from "../lib/discovery";
import { updateDiscoveryProfile } from "../lib/discovery-admin";
import { buildDistrictVenueLayout, buildExhibitionGridVenueLayout, buildPerimeterVenueLayout } from "../lib/discovery-venue-layout";
import { buildFeaturedProgramAgenda, featuredBoothWalkthroughs, featuredBroadcastPhase } from "../lib/featured-program";
import { migrateDatabase } from "../lib/schema";

const discoveryUiSource = fs.readFileSync(
  path.join(process.cwd(), "components/DiscoveryWorkspace.tsx"),
  "utf8",
);
const discoveryCssSource = fs.readFileSync(
  path.join(process.cwd(), "app/discovery.css"),
  "utf8",
);
const cityMarketplaceSource = discoveryUiSource.slice(
  discoveryUiSource.indexOf("function CityMarketplacePanel"),
  discoveryUiSource.indexOf("function DiscoveryList"),
);
assert.match(discoveryUiSource, /window\.setTimeout[\s\S]*420/);
assert.match(discoveryUiSource, /router\.replace/);
assert.doesNotMatch(discoveryUiSource, /type="submit">Search/);
assert.match(discoveryUiSource, /navigator\.geolocation\.getCurrentPosition/);
assert.match(discoveryUiSource, /Filter by region or city/);
assert.match(discoveryUiSource, /discovery-industry-menu/);
assert.match(discoveryUiSource, /industry-accent-swatch/);
assert.match(discoveryUiSource, /data-industry=\{showroom\.primaryIndustryKey\}/);
assert.match(discoveryUiSource, /CityMarketplacePanel group=\{activeCity\} industryKey=\{discovery\.industry\.key\}/);
assert.match(discoveryUiSource, /city-showroom-panel\$\{industryKey === "all" \? "" : " industry-themed"\}/);
assert.match(discoveryUiSource, /className="discovery-list-wrap" data-industry=\{discovery\.industry\.key\}/);
assert.match(discoveryUiSource, /className="discovery-list-industry"/);
assert.match(discoveryUiSource, /showroom\.primaryIndustryShortLabel/);
assert.match(discoveryUiSource, /className="city-industry-district"/);
assert.match(discoveryUiSource, /layout\.districts\.map/);
assert.match(discoveryUiSource, /presence\.shortLabel \|\| "Open"/);
assert.doesNotMatch(discoveryUiSource, /className="city-industry-run"/);
assert.doesNotMatch(cityMarketplaceSource, /Row \{row\}|padStart/, "City Market storefronts do not expose scheduled booth references");
assert.match(discoveryUiSource, /R\{row\} · \{booth\.reference\}/, "Daily Featured Showrooms retains scheduled row and booth references");
assert.doesNotMatch(discoveryUiSource, /discovery-industries-static/);
assert.match(discoveryUiSource, /featured-booth-platform/);
assert.match(discoveryUiSource, /featured-experience/);
assert.match(discoveryUiSource, /TikTok Live/);
assert.match(discoveryUiSource, /Livestream ended/);
assert.match(discoveryUiSource, /point-showroom-store/);
assert.match(discoveryUiSource, /SHOWROOM_DETAIL_SCALE/);
assert.match(discoveryUiSource, /walkthrough-current/);
assert.doesNotMatch(discoveryUiSource, /randomSponsorPair/);
assert.doesNotMatch(discoveryUiSource, /rail\.scrollTo/);
assert.match(discoveryUiSource, /mirtpage:discovery-navigation:v1/);
assert.match(discoveryUiSource, /mirtpage:last-marketplace-url:v1/);
assert.match(discoveryUiSource, /mapPersistenceEnabledRef\.current = false/);
assert.doesNotMatch(discoveryCssSource, /background-size:\s*(?:34|36)px\s+(?:34|36)px/);
assert.match(discoveryCssSource, /venue-hall-shell-v2\.webp/);
assert.match(discoveryCssSource, /\[data-industry="electronics"\]/);
assert.match(discoveryCssSource, /var\(--industry-accent/);
assert.match(discoveryCssSource, /city-shop-fascia[^\n]+background:\s*var\(--industry-accent-strong/);
assert.match(discoveryCssSource, /city-showroom-panel\.industry-themed \.city-showroom-floor/);
assert.match(discoveryCssSource, /discovery-list article[^\n]+border-left-width:\s*6px/);
assert.match(discoveryCssSource, /discovery-list-wrap\[data-industry\]:not\(\[data-industry="all"\]\)/);
assert.match(discoveryCssSource, /\.city-industry-district/);
assert.match(discoveryCssSource, /\.city-shop-fascia \.city-shop-open/);
assert.equal(featuredBroadcastPhase("2026-08-09", 20, new Date("2026-08-09T07:59:59+03:00")), "scheduled");
assert.equal(featuredBroadcastPhase("2026-08-09", 20, new Date("2026-08-09T08:00:00+03:00")), "live");
assert.equal(featuredBroadcastPhase("2026-08-09", 20, new Date("2026-08-09T13:00:00+03:00")), "intermission");
assert.equal(featuredBroadcastPhase("2026-08-09", 20, new Date("2026-08-09T17:00:00+03:00")), "live");
assert.equal(featuredBroadcastPhase("2026-08-09", 20, new Date("2026-08-09T22:00:00+03:00")), "ended");
const agendaAtStart = buildFeaturedProgramAgenda("2026-08-09", 20, new Date("2026-08-09T08:00:00+03:00"));
const walkthroughsAtStart = featuredBoothWalkthroughs("2026-08-09", 20, new Date("2026-08-09T08:00:00+03:00"));
assert.equal(walkthroughsAtStart.length, 20);
assert.equal(walkthroughsAtStart[0].label, "08:00–08:24");
assert.equal(walkthroughsAtStart.filter((walkthrough) => walkthrough.current).length, 1);
assert.equal(walkthroughsAtStart[0].current, true);
assert.equal(agendaAtStart.filter((entry) => entry.kind === "sponsor_break").length, 6);
const intermissionAtStart = agendaAtStart.find((entry) => entry.kind === "intermission");
assert.equal(intermissionAtStart?.kind === "intermission" ? intermissionAtStart.timeLabel : "", "13:00–17:00");
const walkthroughsAtSecond = featuredBoothWalkthroughs("2026-08-09", 20, new Date("2026-08-09T08:29:00+03:00"));
assert.equal(walkthroughsAtSecond[1].current, true);
assert.equal(walkthroughsAtSecond[0].current, false);
assert.equal(featuredBoothWalkthroughs("2026-08-09", 20, new Date("2026-08-09T14:00:00+03:00")).some((walkthrough) => walkthrough.current), false);
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

for (const count of [1, 5, 10, 11, 20, 37, 64]) {
  const layout = buildExhibitionGridVenueLayout(count, 224, 190);
  assert.equal(layout.positions.length, count, `${count} Daily Featured booths receive exactly one exhibition bay`);
  assert.equal(new Set(layout.positions.map((position) => `${position.left}:${position.top}`)).size, count, `${count} exhibition bays remain unique`);
  assert.equal(layout.rows, Math.ceil(count / layout.columns), `${count} Daily Featured booths grow by complete deterministic rows`);
  layout.positions.forEach((position, index) => {
    assert.ok(position.left >= layout.safeInset && position.top >= layout.safeInset, `${count}:${index} clears the top and left venue walls`);
    assert.ok(position.left + layout.cardWidth <= layout.width - layout.safeInset && position.top + layout.cardHeight <= layout.height - layout.safeInset, `${count}:${index} clears the bottom and right venue walls`);
    if (index > 0 && index % layout.columns !== 0) assert.ok(position.left > layout.positions[index - 1].left, `${count}:${index} advances left-to-right within its numbered row`);
    if (index >= layout.columns) assert.ok(position.top > layout.positions[index - layout.columns].top, `${count}:${index} advances top-to-bottom across numbered rows`);
    layout.positions.slice(index + 1).forEach((other, otherIndex) => {
      const separated = position.left + layout.cardWidth <= other.left || other.left + layout.cardWidth <= position.left || position.top + layout.cardHeight <= other.top || other.top + layout.cardHeight <= position.top;
      assert.ok(separated, `${count}:${index} does not overlap ${index + otherIndex + 1} across Daily Featured rows`);
    });
  });
}

const portraitFeaturedLayout = buildExhibitionGridVenueLayout(20, 224, 190, .7);
const wideFeaturedLayout = buildExhibitionGridVenueLayout(20, 224, 190, 2);
assert.ok(portraitFeaturedLayout.columns < wideFeaturedLayout.columns, "portrait Featured floors use fewer columns than wide floors");
assert.ok(portraitFeaturedLayout.rows > wideFeaturedLayout.rows, "portrait Featured floors gain rows while wide floors gain columns");
assert.ok(portraitFeaturedLayout.width / portraitFeaturedLayout.height < wideFeaturedLayout.width / wideFeaturedLayout.height, "Featured floor geometry follows the measured stage aspect");
assert.deepEqual(buildExhibitionGridVenueLayout(20, 224, 190, .7), portraitFeaturedLayout, "responsive Featured geometry remains deterministic within an aspect band");

const districtFixture = [
  { key: "electronics", label: "Electronics" },
  ...Array.from({ length: 2 }, () => ({ key: "beauty-wellness", label: "Beauty & home care" })),
  ...Array.from({ length: 4 }, () => ({ key: "agriculture-growers", label: "Agriculture" })),
  ...Array.from({ length: 20 }, () => ({ key: "food-farming", label: "Food & beverage" })),
];
const districtLayout = buildDistrictVenueLayout(districtFixture, 218, 186);
assert.equal(districtLayout.districts.length, 4, "one City Market district is created for each industry");
assert.deepEqual(districtLayout.districts.map((district) => district.count), [1, 2, 4, 20], "district size follows uneven industry participation");
assert.deepEqual(buildDistrictVenueLayout(districtFixture, 218, 186), districtLayout, "the same City Market participants always receive the same geometry");
districtLayout.districts.forEach((district, districtIndex) => {
  assert.ok(district.left >= districtLayout.safeInset && district.top >= 0, `${district.key} clears the venue's top and left architecture`);
  assert.ok(district.left + district.width <= districtLayout.width - districtLayout.safeInset && district.top + district.height < districtLayout.height, `${district.key} clears the venue's bottom and right architecture`);
  assert.equal(district.itemIndices.length, district.count, `${district.key} contains every member exactly once`);
  district.itemIndices.forEach((itemIndex) => {
    const position = districtLayout.positions[itemIndex];
    assert.ok(position.left >= district.left && position.top >= district.top, `${district.key}:${itemIndex} begins inside its district`);
    assert.ok(position.left + districtLayout.cardWidth <= district.left + district.width && position.top + districtLayout.cardHeight <= district.top + district.height, `${district.key}:${itemIndex} remains inside its district`);
  });
  districtLayout.districts.slice(districtIndex + 1).forEach((other) => {
    const separated = district.left + district.width <= other.left || other.left + other.width <= district.left || district.top + district.height <= other.top || other.top + other.height <= district.top;
    assert.ok(separated, `${district.key} does not overlap ${other.key}`);
  });
});
districtLayout.positions.forEach((position, index) => {
  districtLayout.positions.slice(index + 1).forEach((other, otherIndex) => {
    const separated = position.left + districtLayout.cardWidth <= other.left || other.left + districtLayout.cardWidth <= position.left || position.top + districtLayout.cardHeight <= other.top || other.top + districtLayout.cardHeight <= position.top;
    assert.ok(separated, `City Market booth ${index} does not overlap booth ${index + otherIndex + 1}`);
  });
});
const portraitDistrictLayout = buildDistrictVenueLayout(districtFixture, 218, 186, .7);
const wideDistrictLayout = buildDistrictVenueLayout(districtFixture, 218, 186, 2);
assert.ok(portraitDistrictLayout.width / portraitDistrictLayout.height < wideDistrictLayout.width / wideDistrictLayout.height, "City Market districts repack for portrait and wide stages");
assert.deepEqual(buildDistrictVenueLayout(districtFixture, 218, 186, .7), portraitDistrictLayout, "responsive City Market district geometry remains deterministic within an aspect band");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-discovery-"));
const db = new DatabaseSync(path.join(root, "discovery.db"));

async function main() {
try {
  migrateDatabase(db, { assertDestructiveMigrationCheckpoint: () => {} });

  const addIndustry = db.prepare("INSERT INTO discovery_industries(key,label,icon,position,active) VALUES(?,?,?,?,1) ON CONFLICT(key) DO UPDATE SET label=excluded.label,icon=excluded.icon,position=excluded.position,active=1");
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
    excluded?: boolean;
    status?: "active" | "draft" | "suspended";
    expired?: boolean;
    industryKey?: string;
    live?: { platform: "tiktok" | "facebook" | "youtube" | "google_meet"; url: string };
    unsafeRetainedLiveUrl?: string;
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
    if (input.live) db.prepare("UPDATE businesses SET is_live=1,live_platform=?,live_url=? WHERE id=?").run(input.live.platform, input.live.url, id);
    if (input.unsafeRetainedLiveUrl) db.prepare("UPDATE businesses SET is_live=1,live_platform='youtube',live_url=? WHERE id=?").run(input.unsafeRetainedLiveUrl, id);
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
      live: index === 0 ? { platform: "tiktok", url: "https://www.tiktok.com/@addisdevice/live" } : undefined,
      unsafeRetainedLiveUrl: index === 1 ? "https://evil.example/live" : undefined,
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
  seed({ handle: "hidden-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, product: "Confidential motor", excluded: true });
  seed({ handle: "expired-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, expired: true });
  seed({ handle: "draft-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, status: "draft" });
  seed({ handle: "empty-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, product: "" });
  seed({ handle: "sheger-soap", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.025, longitude: 38.755, industryKey: "beauty-wellness", sponsored: true });
  for (let index = 0; index < 3; index += 1) {
    seed({ handle: `sunday-grower-${index + 1}`, city: "Jimma", zone: "Jimma", region: "Oromia", latitude: 7.67 + index * .0001, longitude: 36.83 + index * .0001, industryKey: "agriculture-growers" });
  }
  addMembership.run(firstAddisBusinessId, "machinery-tools");
  addProduct.run(firstAddisBusinessId, "Unpublished turbine", "unpublished-turbine", "Internal draft only", 0);

  const monday = new Date("2026-07-27T07:00:00+03:00");
  const allIndustries = await getDiscoveryView({ db, featuredDay: 1, now: monday });
  const marketplaceOnly = await getMarketplaceDiscoveryView({ db, now: monday });
  assert.equal("featured" in marketplaceOnly, false, "the Market projection excludes the featured floor");
  assert.equal("sponsoredShowrooms" in marketplaceOnly, false, "the Market projection excludes the sponsor directory");
  const featuredOnly = await getFeaturedShowroomsView({ db, featuredDay: 1, now: monday });
  assert.equal("showrooms" in featuredOnly, false, "the featured projection excludes geographic Market rows");
  assert.equal(featuredOnly.featured.selectedWeekday, 1);
  const sponsorsOnly = await getSponsoredShowrooms({ db });
  assert.equal(sponsorsOnly.length, 3, "the sponsor route receives only the bounded global paid pool");
  assert.equal(allIndustries.industry.key, ALL_DISCOVERY_INDUSTRIES.key, "public discovery begins with All industries selected");
  assert.equal(allIndustries.industries[0].key, ALL_DISCOVERY_INDUSTRIES.key, "All industries is the first public filter option");
  assert.equal(allIndustries.total, 23, "the initial projection includes every eligible industry");
  assert.equal(allIndustries.showrooms.length, 23, "the all-industry map projection matches its total");
  assert.equal(new Set(allIndustries.showrooms.map((showroom) => showroom.id)).size, 23, "a cross-listed showroom appears once in the combined projection");
  const crossListedShowroom = allIndustries.showrooms.find((showroom) => showroom.id === firstAddisBusinessId);
  assert.deepEqual(crossListedShowroom && {
    key: crossListedShowroom.primaryIndustryKey,
    label: crossListedShowroom.primaryIndustryShortLabel,
  }, { key: "electronics", label: "Electronics" }, "a cross-listed showroom receives its earliest canonical industry as stable visual metadata");
  const allIndustryAddis = allIndustries.cityGroups.find((group) => group.city === "Addis Ababa");
  assert.ok(allIndustryAddis, "the combined projection retains the Addis Ababa City Showroom");
  const industryPosition = new Map<string, number>(DISCOVERY_INDUSTRIES.map((industry, index) => [industry.key, index]));
  assert.deepEqual(
    allIndustryAddis.showrooms.map((showroom) => showroom.primaryIndustryKey),
    [...allIndustryAddis.showrooms]
      .sort((left, right) =>
        (industryPosition.get(left.primaryIndustryKey) ?? 999) - (industryPosition.get(right.primaryIndustryKey) ?? 999)
        || left.name.localeCompare(right.name)
        || left.id - right.id)
      .map((showroom) => showroom.primaryIndustryKey),
    "the all-industry City Showroom places canonical industry groups next to each other",
  );
  assert.ok(allIndustryAddis.showrooms.some((showroom) => showroom.primaryIndustryKey === "beauty-wellness"), "the grouped floor includes a visibly distinct second industry");
  assert.equal(allIndustries.list.items.length, 5, "the combined List remains server-paginated at five rows");
  assert.equal(allIndustries.list.pageCount, 5, "combined pagination is calculated from the all-industry total");
  assert.ok(allIndustries.places.some((place) => place.kind === "city" && place.city === "Jimma"), "place options cover locations from every industry");
  assert.equal(allIndustries.featured.industryCode, "ELC", "the all-industry map state does not change Monday's featured industry");
  const explicitAll = await getDiscoveryView({ db, industry: "all", featuredDay: 1, now: monday });
  assert.deepEqual(explicitAll.showrooms.map((showroom) => showroom.id), allIndustries.showrooms.map((showroom) => showroom.id), "the explicit all value matches the omitted-filter projection");

  const view = await getDiscoveryView({ db, industry: "electronics", featuredDay: 1, now: monday });
  assert.equal(view.total, 19, "active approved businesses with a published offering appear regardless of manual renewal date");
  assert.equal(view.sponsoredCount, 2);
  assert.equal(view.sponsoredShowrooms.length, 3, "the bounded global sponsor projection includes eligible staff selections from every industry");
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
  const validLive = view.showrooms.find((showroom) => showroom.handle === "addis-device-1");
  assert.deepEqual(validLive && { isLive: validLive.isLive, platform: validLive.livePlatform, url: validLive.liveUrl }, { isLive: true, platform: "tiktok", url: "https://www.tiktok.com/@addisdevice/live" }, "valid provider state is normalized into public discovery");
  const unsafeLive = view.showrooms.find((showroom) => showroom.handle === "addis-device-2");
  assert.deepEqual(unsafeLive && { isLive: unsafeLive.isLive, platform: unsafeLive.livePlatform, url: unsafeLive.liveUrl }, { isLive: false, platform: "", url: "" }, "unsafe retained provider state fails closed without serializing its destination");
  assert.equal(view.featuredNowBusinessId, null, "no business is featured before the Daily Featured program window");
  const machineryView = await getDiscoveryView({ db, industry: "machinery-tools", featuredDay: 4, now: monday });
  assert.equal(machineryView.total, 1, "a cross-listed showroom remains eligible through its non-primary industry membership");
  assert.equal(machineryView.showrooms[0].primaryIndustryKey, "electronics", "filter membership does not rewrite stable primary visual metadata");
  assert.equal(view.featured.boothCount, 19);
  assert.equal(view.featured.mode, "featured");
  assert.equal(view.featured.isToday, true);
  assert.equal(view.featured.selectedWeekday, 1);
  assert.equal(view.featured.schedule.length, 7);
  assert.deepEqual(view.featured.schedule.map((day) => day.dayLabel), ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "schedule positions remain fixed from Monday through Sunday");
  assert.equal(view.featured.schedule.find((day) => day.isToday)?.dayLabel, "Monday");
  assert.ok(view.featured.booths.every((booth) => booth.revealed && booth.showroom.imagePath === `/booths/${booth.showroom.handle}.webp`), "today's Daily Featured uses each business's approved booth profile image");
  assert.deepEqual(view.featured.booths.map((booth) => booth.slot), Array.from({ length: 19 }, (_, index) => index + 1), "every Daily Featured business receives one continuous floor slot");
  assert.equal(new Set(view.featured.booths.map((booth) => booth.reference)).size, view.featured.booths.length, "Daily Featured booth references are unique");
  assert.match(view.featured.booths[0].reference, /^ELC-B\d{2}$/);

  const activeFeaturedTime = new Date("2026-07-27T11:10:00+03:00");
  const activeFeatured = await getDiscoveryView({ db, industry: "electronics", featuredDay: 1, now: activeFeaturedTime });
  assert.ok(activeFeatured.featuredNowBusinessId, "the live Daily Featured session identifies one current deterministic booth");
  const activeFeaturedBooth = activeFeatured.featured.booths.find((booth) => booth.revealed && booth.showroom.id === activeFeatured.featuredNowBusinessId);
  assert.ok(activeFeaturedBooth?.revealed, "the featured business belongs to today's eligible Daily Featured floor");
  db.prepare("UPDATE businesses SET is_live=1,live_platform='youtube',live_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ' WHERE id=?").run(activeFeatured.featuredNowBusinessId);
  const overlappingLive = await getDiscoveryView({ db, industry: "electronics", featuredDay: 1, now: activeFeaturedTime });
  assert.equal(overlappingLive.showrooms.find((showroom) => showroom.id === overlappingLive.featuredNowBusinessId)?.isLive, true, "merchant live state remains stored while presentation gives the Daily Featured spotlight precedence");
  const anotherDatePreview = await getDiscoveryView({ db, industry: "electronics", featuredDay: 2, now: activeFeaturedTime });
  assert.equal(anotherDatePreview.featuredNowBusinessId, activeFeatured.featuredNowBusinessId, "previewing another Daily Featured date does not change today's active spotlight business");
  const duringIntermission = await getDiscoveryView({ db, industry: "electronics", featuredDay: 1, now: new Date("2026-07-27T14:01:00+03:00") });
  assert.equal(duringIntermission.featuredNowBusinessId, null, "the Daily Featured spotlight clears during the four-hour intermission");

  assert.equal(view.list.items.length, 5, "the database-backed List response is capped at five rows");
  assert.equal(view.list.pageCount, 4);
  const secondPage = await getDiscoveryView({ db, industry: "electronics", page: 2, view: "list", featuredDay: 1, now: monday });
  assert.equal(secondPage.list.page, 2);
  assert.equal(secondPage.list.items.length, 5);
  assert.equal(secondPage.view, "list");
  assert.equal(secondPage.list.items.some((item) => view.list.items.some((first) => first.id === item.id)), false, "List pages do not repeat rows");
  const clampedPage = await getDiscoveryView({ db, industry: "electronics", page: 99, view: "list", featuredDay: 1, now: monday });
  assert.equal(clampedPage.list.page, 4, "an out-of-range page is clamped to the final page");
  assert.equal(clampedPage.list.items.length, 4);

  const oromia = await getDiscoveryView({ db, industry: "electronics", place: "region:Oromia", view: "list", featuredDay: 1, now: monday });
  assert.equal(oromia.place, "region:Oromia");
  assert.equal(oromia.total, 4, "region filtering is applied before count and pagination");
  assert.equal(oromia.list.items.length, 4);
  assert.ok(oromia.showrooms.every((showroom) => showroom.region === "Oromia"));
  const adamaPlace = view.places.find((place) => place.kind === "city" && place.city === "Adama");
  assert.ok(adamaPlace, "an available city is projected as an allowlisted place option");
  const adama = await getDiscoveryView({ db, industry: "electronics", place: adamaPlace?.key, featuredDay: 1, now: monday });
  assert.equal(adama.total, 3);
  assert.ok(adama.showrooms.every((showroom) => showroom.city === "Adama"));
  const invalidPlace = await getDiscoveryView({ db, industry: "electronics", place: "city:invented:nowhere", featuredDay: 1, now: monday });
  assert.equal(invalidPlace.place, "", "an unknown place is ignored rather than becoming an arbitrary SQL filter");
  assert.equal(invalidPlace.total, view.total);

  const search = await getDiscoveryView({ db, industry: "electronics", q: "Needle signal", featuredDay: 1, now: monday });
  assert.equal(search.total, 1, "published offering text is searchable");
  assert.equal(search.showrooms[0].city, "Addis Ababa");
  assert.equal(search.cityGroups.length, 0, "a single searched result remains an isolated exact-coordinate storefront badge");
  assert.equal(search.featured.booths.length, 19, "map search does not narrow the independently scheduled Daily Featured");
  assert.deepEqual(search.sponsoredShowrooms.map((showroom) => showroom.handle), view.sponsoredShowrooms.map((showroom) => showroom.handle), "map search does not alter the global sponsor pool");
  assert.deepEqual(search.suggestions[0], {
    kind: "offering",
    label: "Needle signal tester",
    detail: "Offering from addis device 1",
    query: "Needle signal tester",
  }, "matching published offerings lead the bounded suggestion projection");
  assert.ok(search.suggestions.some((suggestion) => suggestion.kind === "showroom" && suggestion.query === "addis device 1"), "a matching result also offers its public showroom name");
  const placeSuggestions = await getDiscoveryView({ db, q: "Addis", featuredDay: 1, now: monday });
  assert.ok(placeSuggestions.suggestions.some((suggestion) => suggestion.kind === "place" && suggestion.query === "Addis Ababa"), "reviewed place labels are suggested from eligible results");
  const boundedSuggestions = await getDiscoveryView({ db, q: "device", featuredDay: 1, now: monday });
  assert.equal(boundedSuggestions.suggestions.length, 6, "search suggestions are capped at six");
  assert.equal(new Set(boundedSuggestions.suggestions.map((suggestion) => suggestion.query.toLowerCase())).size, boundedSuggestions.suggestions.length, "duplicate suggestion values are collapsed");
  const shortSuggestions = await getDiscoveryView({ db, q: "N", featuredDay: 1, now: monday });
  assert.deepEqual(shortSuggestions.suggestions, [], "fewer than two trimmed characters returns no suggestions");
  const wrongIndustrySuggestions = await getDiscoveryView({ db, industry: "beauty-wellness", q: "Needle", featuredDay: 1, now: monday });
  assert.deepEqual(wrongIndustrySuggestions.suggestions, [], "suggestions preserve the selected industry scope");
  const excludedSuggestions = await getDiscoveryView({ db, q: "Confidential motor", featuredDay: 1, now: monday });
  assert.deepEqual(excludedSuggestions.suggestions, [], "excluded showroom offerings never enter suggestions");
  const unpublishedSuggestions = await getDiscoveryView({ db, q: "Unpublished turbine", featuredDay: 1, now: monday });
  assert.deepEqual(unpublishedSuggestions.suggestions, [], "unpublished offerings never enter suggestions");

  const tuesday = await getDiscoveryView({ db, industry: "electronics", q: "Needle signal", featuredDay: 2, now: monday });
  assert.equal(tuesday.featured.title, "Daily Featured Showrooms");
  assert.equal(tuesday.featured.isToday, false);
  assert.equal(tuesday.featured.boothCount, 1);
  assert.deepEqual(tuesday.sponsoredShowrooms.map((showroom) => showroom.handle), view.sponsoredShowrooms.map((showroom) => showroom.handle), "the global sponsor pool remains stable when the selected Daily Featured day changes industry");
  assert.ok(tuesday.featured.booths.every((booth) => !booth.revealed && booth.showroom === null), "non-today Daily Featured slots contain no business projection");
  assert.equal(JSON.stringify(tuesday.featured.booths).includes("sheger-soap"), false, "non-today page data does not leak a business handle");

  const wednesday = await getDiscoveryView({ db, industry: "electronics", featuredDay: 3, now: new Date("2026-07-29T09:00:00+03:00") });
  assert.deepEqual(wednesday.featured.schedule.map((day) => day.dayLabel), ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "advancing today does not reorder weekday cards");
  assert.equal(wednesday.featured.schedule.find((day) => day.isToday)?.dayLabel, "Wednesday", "today indicator moves within the fixed week");
  assert.equal(wednesday.featured.schedule[0].dateIso, "2026-07-27");
  assert.equal(wednesday.featured.schedule[2].dateIso, "2026-07-29");

  const sunday = await getDiscoveryView({ db, industry: "electronics", featuredDay: 0, now: monday });
  assert.equal(sunday.featured.mode, "featured");
  assert.equal(sunday.featured.title, "Daily Featured Showrooms");
  assert.equal(sunday.featured.industryLabel, "Agriculture, livestock & primary produce");
  assert.equal(sunday.featured.boothCount, 3);
  assert.ok(sunday.featured.booths.every((booth) => !booth.revealed && booth.showroom === null), "the future Sunday Daily Featured is redacted like every other future date");
  assert.ok(sunday.featured.booths.every((booth) => /^AGR-B\d{2}$/.test(booth.reference)));
  const sundayToday = await getDiscoveryView({ db, featuredDay: 0, now: new Date("2026-08-02T09:00:00+03:00") });
  assert.equal(sundayToday.featured.booths.length, 3);
  assert.ok(sundayToday.featured.booths.every((booth) => booth.revealed), "today's Sunday agriculture floor reveals eligible showrooms");

  const invalidIndustry = await getDiscoveryView({ db, industry: "not-real" });
  assert.equal(invalidIndustry.industry.key, ALL_DISCOVERY_INDUSTRIES.key, "an unknown industry fails open to the allowlisted all-industry projection");

  const plan = db.prepare("EXPLAIN QUERY PLAN SELECT business_id FROM business_industries WHERE industry_key=?").all("electronics") as Array<{ detail: string }>;
  assert.ok(plan.some((row) => /business_industry_lookup_idx|sqlite_autoindex_business_industries/i.test(row.detail)), "industry membership uses an index");
  assert.equal(
    Number((db.prepare("SELECT COUNT(*) total FROM discovery_industries").get() as { total: number }).total),
    7,
    "the controlled industry vocabulary has seven entries",
  );

  await updateDiscoveryProfile({
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
  const refreshedToday = await getDiscoveryView({ db, industry: "electronics", featuredDay: 1, now: monday });
  const updatedBooth = refreshedToday.featured.booths.find((booth) => booth.revealed && booth.showroom.id === firstAddisBusinessId);
  assert.equal(updatedBooth?.revealed ? updatedBooth.showroom.imagePath : null, "/booths/admin-approved.webp", "the public booth reads its image from the owning business profile");
  assert.deepEqual(
    (db.prepare("SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key").all(firstAddisBusinessId) as Array<{ industry_key: string }>).map((row) => row.industry_key),
    ["electronics", "machinery-tools"],
    "admin discovery updates replace indexed industry membership atomically",
  );
  await assert.rejects(() => updateDiscoveryProfile({
    businessId: firstAddisBusinessId,
    industryKeys: ["not-real"],
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
    excluded: false,
  }, db), /Choose at least one industry/, "admin discovery updates reject industries outside the controlled vocabulary");
  db.prepare("UPDATE business_discovery_profiles SET booth_image_path='' WHERE business_id=(SELECT id FROM businesses WHERE handle='bishoftu-repair')").run();
  const missingBoothMedia = await getDiscoveryView({ db, industry: "electronics", featuredDay: 1, now: monday });
  assert.equal(missingBoothMedia.total, 19, "missing booth setup does not erase an otherwise eligible geographic Showroom");
  assert.equal(missingBoothMedia.featured.boothCount, 18, "a business without its own approved booth image does not receive an Daily Featured slot");

  console.log("Geographic Showroom discovery and weekly industry Daily Featured tests passed.");
} finally {
  db.close();
  fs.rmSync(root, { recursive: true, force: true });
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
