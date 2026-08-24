import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ALL_DISCOVERY_INDUSTRIES, DISCOVERY_INDUSTRIES, getDiscoveryView, getFeaturedShowroomsView, getMarketplaceDiscoveryView, getSponsoredShowrooms, groupNearbyShowrooms, type DiscoveryShowroom } from "../lib/discovery";
import { updateDiscoveryProfile } from "../lib/discovery-admin";
import { buildFeaturedProgramAgenda, featuredBoothWalkthroughs, featuredBroadcastPhase } from "../lib/featured-program";
import { migrateDatabase } from "../lib/schema";
import { createExternalSponsorAd, SponsorAdminError } from "../lib/sponsor-admin";

const discoveryMapSource = fs.readFileSync(
  path.join(process.cwd(), "components/DiscoveryWorkspace.tsx"),
  "utf8",
);
const discoveryCssSource = fs.readFileSync(
  path.join(process.cwd(), "app/discovery.css"),
  "utf8",
);
const featuredUiSource = fs.readFileSync(
  path.join(process.cwd(), "components/FeaturedShowroomsWorkspace.tsx"),
  "utf8",
);
const discoveryUiSource = `${discoveryMapSource}\n${featuredUiSource}`;
const featuredPageSource = fs.readFileSync(
  path.join(process.cwd(), "app/featured/page.tsx"),
  "utf8",
);
const publicDiscoveryCacheSource = fs.readFileSync(
  path.join(process.cwd(), "lib/public-discovery-cache.ts"),
  "utf8",
);
const nearbyViewerSource = discoveryMapSource.slice(discoveryMapSource.indexOf("function NearbyShowroomsViewer"));
assert.match(discoveryUiSource, /window\.setTimeout[\s\S]*420/);
assert.match(discoveryUiSource, /router\.replace/);
assert.doesNotMatch(discoveryUiSource, /type="submit">Search/);
assert.match(discoveryUiSource, /navigator\.geolocation\.getCurrentPosition/);
assert.match(discoveryUiSource, /Filter by region or city/);
assert.match(discoveryUiSource, /discovery-industry-menu/);
assert.match(discoveryUiSource, /industry-accent-swatch/);
assert.match(discoveryUiSource, /data-industry=\{showroom\.primaryIndustryKey\}/);
assert.doesNotMatch(discoveryUiSource, /DiscoveryList|discovery-list|selectDiscoveryView/);
assert.match(discoveryUiSource, /showroom\.primaryIndustryShortLabel/);
assert.match(discoveryUiSource, /NEARBY_GROUP_ZOOM = 14/);
assert.match(discoveryUiSource, /function NearbyShowroomsViewer/);
assert.match(discoveryUiSource, /className=\{`nearby-showroom-viewer/);
assert.match(discoveryUiSource, /className="nearby-showroom-grid"/);
assert.doesNotMatch(discoveryUiSource, /SharedLocationPanel|shared-location-floor|shared-location-more|buildScrollableSharedLocationVenueLayout/);
assert.doesNotMatch(nearbyViewerSource, /Row \{row\}|padStart|pagination|Show more/, "nearby cards expose no scheduled references, pagination, or incremental loading");
assert.match(discoveryUiSource, /<b>\{booth\.reference\}<\/b>/, "Daily Featured Showrooms retains scheduled booth references");
assert.doesNotMatch(discoveryUiSource, /discovery-industries-static/);
assert.match(discoveryUiSource, /function IndustryStartChooser/);
assert.match(discoveryUiSource, /className="featured-gallery"/);
assert.match(discoveryUiSource, /className={`featured-card/);
assert.doesNotMatch(discoveryUiSource, /featured-floor|featured-booth-platform|buildScrollableFeaturedVenueLayout/);
assert.match(discoveryUiSource, /featured-experience/);
assert.match(discoveryUiSource, /TikTok Live/);
assert.match(discoveryUiSource, /Livestream ended/);
assert.match(discoveryUiSource, /point-showroom-store/);
assert.match(discoveryUiSource, /point-hit-target/);
assert.doesNotMatch(discoveryUiSource, /className="point-halo"/);
assert.match(discoveryUiSource, /SHOWROOM_DETAIL_SCALE/);
assert.match(discoveryMapSource, /getClusters\(viewportGeoBounds, clusterZoom\)/, "cluster projection is bounded to the committed map viewport");
assert.match(discoveryMapSource, /requestIdleCallback\(loadDetails, \{ timeout: 3_000 \}\)/, "secondary geography waits for browser idle time");
assert.match(discoveryMapSource, /setTimeout\(loadDetails, 1_500\)/, "browsers without idle callbacks defer secondary geography");
assert.match(discoveryMapSource, /const MapGeographyLayers = memo/, "static geography is isolated from marker viewport commits");
assert.match(discoveryMapSource, /showPrimaryRoads=\{zoomLevel >= 1\.45\}/, "primary road detail is progressive by zoom level");
assert.match(discoveryMapSource, /showSecondaryRoads=\{zoomLevel >= 2\.4\}/, "secondary road detail is progressive by zoom level");
assert.match(discoveryMapSource, /ethiopia-places-cities-osm\.geojson/, "country context loads the bounded city place tier");
assert.match(discoveryMapSource, /if \(loadTowns && !townPlaces\)/, "town places load only at their visible zoom tier");
assert.match(discoveryMapSource, /if \(loadVillages && !villagePlaces\)/, "village places load only at their visible zoom tier");
assert.match(discoveryMapSource, /Promise\.all\(requests\)/, "detail tiers commit from one batched request group");
assert.match(discoveryMapSource, /startTransition\(\(\) => setMapViewport/, "viewport projection work is a non-urgent React update");
assert.match(discoveryMapSource, /const MAX_PLACE_LABELS = 180/, "mounted map place labels retain an explicit upper bound");
assert.match(discoveryMapSource, /MAX_PLACE_LABELS - visibleCityPlaces\.length/, "detailed labels cannot exceed the remaining mounted-label budget");
assert.match(discoveryMapSource, /visibleCityCandidates\.slice\(0, 8\)/, "only eight population-prioritized city labels remain in the gesture hot path");
assert.match(discoveryMapSource, /className="discovery-place-cities"/, "major-city labels use a stable gesture layer");
assert.match(discoveryCssSource, /\.map-navigating \.discovery-place-details \{ visibility: hidden; \}/, "only detailed place labels pause during active navigation");
assert.match(discoveryMapSource, /visibleNearbyGroups\.map/, "terminal nearby markers remain viewport bounded");
assert.match(discoveryMapSource, /visibleUngroupedShowrooms\.map/, "terminal showroom markers remain viewport bounded");
assert.doesNotMatch(discoveryMapSource, /discovery\.showrooms\.find\(\(candidate\) => candidate\.id === properties\.showroomId\)/, "marker resolution does not scan every showroom");
assert.match(discoveryUiSource, /walkthrough-current/);
assert.doesNotMatch(discoveryUiSource, /randomSponsorPair/);
assert.doesNotMatch(discoveryUiSource, /rail\.scrollTo/);
assert.match(discoveryUiSource, /mirtpage:discovery-navigation:v1/);
assert.match(discoveryUiSource, /mirtpage:last-marketplace-url:v1/);
assert.match(discoveryUiSource, /rememberCurrentPublicWorkspace/);
assert.match(nearbyViewerSource, /onClick=\{\(\) => onSelect\(showroom\.id\)\}/);
assert.match(discoveryUiSource, /mapPersistenceEnabledRef\.current = false/);
assert.doesNotMatch(discoveryCssSource, /background-size:\s*(?:34|36)px\s+(?:34|36)px/);
assert.match(discoveryCssSource, /\[data-industry="electronics"\]/);
assert.match(discoveryCssSource, /var\(--industry-accent/);
assert.doesNotMatch(discoveryCssSource, /\.discovery-list|\.discovery-pages|\.discovery-tabs/);
assert.match(discoveryCssSource, /\.nearby-showroom-grid\s*\{[^}]*repeat\(3/);
assert.match(discoveryCssSource, /\.nearby-showroom-grid\s*\{[^}]*repeat\(2/);
assert.doesNotMatch(nearbyViewerSource, /overflow-y|scrollTo|IntersectionObserver/);
assert.match(discoveryCssSource, /\.featured-gallery\s*\{[^}]*grid-template-columns/);
assert.match(discoveryCssSource, /\.featured-card-media > img/);
assert.doesNotMatch(discoveryCssSource, /\.featured-floor|\.featured-booth/);
assert.equal(featuredBroadcastPhase("2026-08-09", 10, new Date("2026-08-09T10:04:59+03:00")), "scheduled");
assert.equal(featuredBroadcastPhase("2026-08-09", 10, new Date("2026-08-09T10:05:00+03:00")), "live");
assert.equal(featuredBroadcastPhase("2026-08-09", 10, new Date("2026-08-09T13:00:00+03:00")), "intermission");
assert.equal(featuredBroadcastPhase("2026-08-09", 10, new Date("2026-08-09T19:05:00+03:00")), "live");
assert.equal(featuredBroadcastPhase("2026-08-09", 10, new Date("2026-08-09T22:00:00+03:00")), "ended");
const agendaAtStart = buildFeaturedProgramAgenda("2026-08-09", 10, new Date("2026-08-09T10:05:00+03:00"));
const walkthroughsAtStart = featuredBoothWalkthroughs("2026-08-09", 10, new Date("2026-08-09T10:05:00+03:00"));
assert.equal(walkthroughsAtStart.length, 10);
assert.equal(walkthroughsAtStart[0].label, "10:05–10:35");
assert.equal(walkthroughsAtStart.filter((walkthrough) => walkthrough.current).length, 1);
assert.equal(walkthroughsAtStart[0].current, true);
assert.equal(agendaAtStart.filter((entry) => entry.kind === "sponsor_break").length, 2);
const intermissionAtStart = agendaAtStart.find((entry) => entry.kind === "intermission");
assert.equal(intermissionAtStart?.kind === "intermission" ? intermissionAtStart.timeLabel : "", "13:00–19:05");
const walkthroughsAtSecond = featuredBoothWalkthroughs("2026-08-09", 10, new Date("2026-08-09T10:40:00+03:00"));
assert.equal(walkthroughsAtSecond[1].current, true);
assert.equal(walkthroughsAtSecond[0].current, false);
assert.equal(featuredBoothWalkthroughs("2026-08-09", 10, new Date("2026-08-09T14:00:00+03:00")).some((walkthrough) => walkthrough.current), false);
assert.doesNotMatch(discoveryUiSource, /VenueLandscaping|venue-bench|venue-planter/);
assert.match(featuredPageSource, /components\/FeaturedShowroomsWorkspace/);
assert.doesNotMatch(featuredUiSource, /d3-(?:geo|selection|transition|zoom)|supercluster/i, "Daily Featured does not import the geographic map engine");
assert.match(publicDiscoveryCacheSource, /if \(query\) return getMarketplaceDiscoveryView\(input\)/, "free-form searches bypass the public result cache");
assert.match(publicDiscoveryCacheSource, /revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS/, "common public projections use a bounded server cache");
assert.match(publicDiscoveryCacheSource, /public-marketplace-v2-nearby-groups/, "the marketplace cache identity tracks the nearby-group projection contract");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-discovery-"));
const db = new DatabaseSync(path.join(root, "discovery.db"));

function distanceKm(left: { latitude: number; longitude: number }, right: { latitude: number; longitude: number }) {
  const radians = (value: number) => value * Math.PI / 180;
  const latitudeDelta = radians(right.latitude - left.latitude);
  const longitudeDelta = radians(right.longitude - left.longitude);
  const latitudeA = radians(left.latitude);
  const latitudeB = radians(right.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

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
  for (let index = 0; index < 45; index += 1) {
    const sharesAddisWorkshop = index < 2;
    const businessId = seed({
      handle: `addis-device-${index + 1}`,
      city: "Addis Ababa",
      zone: "Addis Ababa",
      region: "Addis Ababa",
      latitude: sharesAddisWorkshop ? 9.018 : 9.018 + index * .0001,
      longitude: sharesAddisWorkshop ? 38.748 : 38.748 + index * .0001,
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
      latitude: index < 2 ? 8.545 : 8.545 + index * .0001,
      longitude: index < 2 ? 39.272 : 39.272 + index * .0001,
    });
  }
  seed({ handle: "bishoftu-repair", city: "Bishoftu", zone: "East Shewa", region: "Oromia", latitude: 8.748, longitude: 38.982 });
  seed({ handle: "hidden-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, product: "Confidential motor", excluded: true });
  seed({ handle: "expired-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, expired: true });
  seed({ handle: "draft-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, status: "draft" });
  seed({ handle: "empty-device", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.01, longitude: 38.75, product: "" });
  seed({ handle: "sheger-soap", city: "Addis Ababa", zone: "Addis Ababa", region: "Addis Ababa", latitude: 9.018, longitude: 38.748, industryKey: "beauty-wellness", sponsored: true });
  for (let index = 0; index < 3; index += 1) {
    seed({ handle: `sunday-grower-${index + 1}`, city: "Jimma", zone: "Jimma", region: "Oromia", latitude: 7.67 + index * .0001, longitude: 36.83 + index * .0001, industryKey: "agriculture-growers" });
  }
  addMembership.run(firstAddisBusinessId, "machinery-tools");
  addProduct.run(firstAddisBusinessId, "Unpublished turbine", "unpublished-turbine", "Internal draft only", 0);
  assert.ok(db.prepare("SELECT 1 FROM schema_migrations WHERE version=35").get(), "external sponsor migration is recorded");
  await assert.rejects(() => createExternalSponsorAd({ name: "Unsafe advertiser", description: "Rejected destination", imagePath: "/media/sponsor-test.webp", websiteUrl: "http://unsafe.example", phone: "", position: 1, active: true }, db), SponsorAdminError);
  await createExternalSponsorAd({
    name: "Addis Trade Services",
    description: "Business services for Ethiopian producers.",
    imagePath: "/media/sponsor-test.webp",
    websiteUrl: "https://sponsor.example/partners",
    phone: "+251 (911) 000-111",
    position: 50,
    active: true,
  }, db);
  assert.equal((db.prepare("SELECT phone FROM external_sponsor_ads WHERE name=?").get("Addis Trade Services") as { phone: string }).phone, "+251911000111", "external sponsor phone is normalized before persistence");

  const monday = new Date("2026-07-27T07:00:00+03:00");
  const allIndustries = await getDiscoveryView({ db, featuredDay: 1, now: monday });
  const marketplaceOnly = await getMarketplaceDiscoveryView({ db, now: monday });
  assert.equal("featured" in marketplaceOnly, false, "the Market projection excludes the featured floor");
  assert.equal("sponsoredShowrooms" in marketplaceOnly, false, "the Market projection excludes the sponsor directory");
  const featuredOnly = await getFeaturedShowroomsView({ db, featuredDay: 1, now: monday });
  assert.equal("showrooms" in featuredOnly, false, "the featured projection excludes geographic Market rows");
  assert.equal(featuredOnly.featured.selectedWeekday, 1);
  const sponsorsOnly = await getSponsoredShowrooms({ db });
  assert.equal(sponsorsOnly.length, 4, "the sponsor route merges showroom and external placements into the bounded global paid pool");
  assert.deepEqual(sponsorsOnly[0] && { kind: sponsorsOnly[0].kind, name: sponsorsOnly[0].name, href: sponsorsOnly[0].href }, { kind: "external", name: "Addis Trade Services", href: "https://sponsor.example/partners" }, "external sponsor details project without creating a showroom route");
  assert.equal(allIndustries.industry.key, "", "public discovery retains an unset orientation state until the visitor chooses");
  assert.equal(allIndustries.industries.at(-1)?.key, ALL_DISCOVERY_INDUSTRIES.key, "All industries is the eighth and final public choice");
  assert.equal(allIndustries.industries.length, 8, "the orientation chooser contains seven industries plus All industries");
  assert.equal(allIndustries.total, 54, "the initial map loads every eligible industry behind the chooser");
  assert.equal(allIndustries.showrooms.length, 54, "the all-industry map projection matches its total");
  assert.doesNotMatch(JSON.stringify(allIndustries.nearbyGroups), /"tagline"|"description"|"imagePath"/, "nearby groups reference canonical showroom rows without duplicating their content payload");
  assert.equal(new Set(allIndustries.showrooms.map((showroom) => showroom.id)).size, 54, "a cross-listed showroom appears once in the combined projection");
  const crossListedShowroom = allIndustries.showrooms.find((showroom) => showroom.id === firstAddisBusinessId);
  assert.deepEqual(crossListedShowroom && {
    key: crossListedShowroom.primaryIndustryKey,
    label: crossListedShowroom.primaryIndustryShortLabel,
  }, { key: "electronics", label: "Electronics" }, "a cross-listed showroom receives its earliest canonical industry as stable visual metadata");
  const allShowroomById = new Map(allIndustries.showrooms.map((showroom) => [showroom.id, showroom]));
  const allGroupMembers = (group: (typeof allIndustries.nearbyGroups)[number]) => group.showroomIds.map((id) => allShowroomById.get(id)).filter((showroom): showroom is DiscoveryShowroom => Boolean(showroom));
  const allIndustryAddis = allIndustries.nearbyGroups.filter((group) => group.city === "Addis Ababa");
  assert.ok(allIndustryAddis.length > 1, "the dense combined Addis projection is split into multiple readable nearby groups");
  assert.ok(allIndustryAddis.every((group) => group.count >= 2 && group.count <= 6), "every nearby group contains two to six readable cards");
  const industryPosition = new Map<string, number>(DISCOVERY_INDUSTRIES.map((industry, index) => [industry.key, index]));
  const mixedAddisGroup = allIndustryAddis.find((group) => allGroupMembers(group).some((showroom) => showroom.primaryIndustryKey === "beauty-wellness"));
  assert.ok(mixedAddisGroup, "the combined nearby projection retains a visibly distinct second industry");
  const mixedAddisMembers = mixedAddisGroup ? allGroupMembers(mixedAddisGroup) : [];
  assert.deepEqual(
    mixedAddisMembers.map((showroom) => showroom.primaryIndustryKey),
    [...mixedAddisMembers]
      .sort((left, right) =>
        (industryPosition.get(left.primaryIndustryKey) ?? 999) - (industryPosition.get(right.primaryIndustryKey) ?? 999)
        || left.name.localeCompare(right.name)
        || left.id - right.id)
      .map((showroom) => showroom.primaryIndustryKey),
    "each all-industry nearby viewer keeps canonical industries adjacent",
  );
  const combinedGroupedIds = allIndustries.nearbyGroups.flatMap((group) => group.showroomIds);
  assert.equal(new Set(combinedGroupedIds).size, combinedGroupedIds.length, "a showroom appears in at most one nearby group");
  assert.ok(allIndustryAddis.every((group) => allGroupMembers(group).every((showroom) => showroom.city === group.city && showroom.region === group.region)), "nearby groups never cross reviewed city or region boundaries");
  assert.ok(allIndustries.places.some((place) => place.kind === "city" && place.city === "Jimma"), "place options cover locations from every industry");
  assert.equal(allIndustries.featured.industryCode, "ELC", "the all-industry map state does not change Monday's featured industry");
  const explicitAll = await getDiscoveryView({ db, industry: "all", featuredDay: 1, now: monday });
  assert.deepEqual(explicitAll.showrooms.map((showroom) => showroom.id), allIndustries.showrooms.map((showroom) => showroom.id), "the explicit all value matches the omitted-filter projection");
  assert.equal(explicitAll.industry.key, ALL_DISCOVERY_INDUSTRIES.key, "the explicit all value closes orientation with All industries selected");

  const view = await getDiscoveryView({ db, industry: "electronics", featuredDay: 1, now: monday });
  assert.equal(view.total, 50, "active approved businesses with a published offering appear regardless of manual renewal date");
  assert.equal(view.sponsoredCount, 2);
  assert.equal(view.sponsoredShowrooms.length, 4, "the bounded global sponsor projection includes eligible showroom and external selections");
  assert.equal(view.locationCount, 3, "real reviewed city locations remain distinct");
  assert.equal(view.nearbyGroups.filter((group) => group.city === "Adama").length, 1, "three close Adama businesses form one readable nearby group");
  assert.equal(view.nearbyGroups.filter((group) => group.city === "Addis Ababa").length, 8, "forty-five close Addis showrooms split into balanced six-card-or-smaller groups");
  const viewShowroomById = new Map(view.showrooms.map((showroom) => [showroom.id, showroom]));
  const viewGroupMembers = (group: (typeof view.nearbyGroups)[number]) => group.showroomIds.map((id) => viewShowroomById.get(id)).filter((showroom): showroom is DiscoveryShowroom => Boolean(showroom));
  const groupedIds = view.nearbyGroups.flatMap((group) => group.showroomIds);
  assert.equal(new Set(groupedIds).size, groupedIds.length, "a nearby business appears once in one viewer");
  assert.ok(view.nearbyGroups.every((group) => group.count === group.showroomIds.length && group.count >= 2 && group.count <= 6), "nearby group counts remain exact and bounded");
  assert.ok(view.nearbyGroups.every((group) => viewGroupMembers(group).some((anchor) =>
    viewGroupMembers(group).every((showroom) => distanceKm(anchor, showroom) <= .8),
  )), "each group remains within one member's configured eight-hundred-meter neighborhood");
  const addisFirst = view.showrooms.find((showroom) => showroom.handle === "addis-device-1");
  assert.deepEqual(addisFirst && [addisFirst.latitude, addisFirst.longitude], [9.018, 38.748], "nearby grouping does not rewrite reviewed showroom coordinates");
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
  assert.equal(view.featured.boothCount, 40, "automatic Daily Featured projection is capped at forty");
  assert.equal(view.featured.mode, "featured");
  assert.equal(view.featured.isToday, true);
  assert.equal(view.featured.selectedWeekday, 1);
  assert.equal(view.featured.schedule.length, 7);
  assert.deepEqual(view.featured.schedule.map((day) => day.dayLabel), ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "schedule positions remain fixed from Monday through Sunday");
  assert.equal(view.featured.schedule.find((day) => day.isToday)?.dayLabel, "Monday");
  assert.ok(view.featured.booths.every((booth) => booth.revealed && booth.showroom.imagePath === `/booths/${booth.showroom.handle}.webp`), "today's Daily Featured uses each business's approved booth profile image");
  assert.deepEqual(view.featured.booths.map((booth) => booth.slot), Array.from({ length: 40 }, (_, index) => index + 1), "the bounded Daily Featured lineup receives one continuous floor slot per business");
  assert.equal(new Set(view.featured.booths.map((booth) => booth.reference)).size, view.featured.booths.length, "Daily Featured booth references are unique");
  assert.match(view.featured.booths[0].reference, /^ELC-B\d{2}$/);

  const activeFeaturedTime = new Date("2026-07-27T08:02:00+03:00");
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

  assert.equal("list" in view, false, "the map-only Market projection does not serialize a duplicate ranked List surface");
  assert.equal("view" in view, false, "the map-only Market projection does not serialize a view-mode contract");

  const oromia = await getDiscoveryView({ db, industry: "electronics", place: "region:Oromia", featuredDay: 1, now: monday });
  assert.equal(oromia.place, "region:Oromia");
  assert.equal(oromia.total, 4, "region filtering is applied before the geographic projection");
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
  assert.equal(search.nearbyGroups.length, 0, "a single searched result remains an isolated storefront marker");
  assert.equal(search.featured.booths.length, 40, "map search does not narrow the independently scheduled bounded Daily Featured");
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
  assert.equal(invalidIndustry.industry.key, "", "an unknown industry keeps the required chooser open");
  assert.equal(invalidIndustry.total, allIndustries.total, "an unknown industry still projects the safe de-duplicated combined map behind the chooser");

  const plan = db.prepare("EXPLAIN QUERY PLAN SELECT business_id FROM business_industries WHERE industry_key=?").all("electronics") as Array<{ detail: string }>;
  assert.ok(plan.some((row) => /business_industry_lookup_idx|sqlite_autoindex_business_industries/i.test(row.detail)), "industry membership uses an index");
  assert.equal(
    Number((db.prepare("SELECT COUNT(*) total FROM discovery_industries").get() as { total: number }).total),
    7,
    "the controlled industry vocabulary has seven entries",
  );

  const scaleShowrooms: DiscoveryShowroom[] = Array.from({ length: 10_000 }, (_, index) => {
    const location = index % 100;
    const locationIndex = Math.floor(index / 100);
    return {
      id: 100_000 + index,
      handle: `scale-showroom-${index}`,
      name: `Scale Showroom ${index}`,
      tagline: "Scale fixture",
      description: "Synthetic non-customer performance fixture.",
      logoPath: "",
      imagePath: "",
      city: `Scale City ${location}`,
      zone: `Scale Zone ${location}`,
      region: `Scale Region ${location % 10}`,
      latitude: 6 + location * 0.02 + Math.floor(locationIndex / 2) * 0.02 + (locationIndex % 2) * 0.0001,
      longitude: 35 + location * 0.02 + Math.floor(locationIndex / 2) * 0.02 + (locationIndex % 2) * 0.0001,
      fallbackStyle: "technical",
      sponsored: false,
      productionScale: "workshop",
      isLive: false,
      livePlatform: "",
      liveUrl: "",
      primaryIndustryKey: "electronics",
      primaryIndustryLabel: "Electronics",
      primaryIndustryShortLabel: "Electronics",
    };
  });
  const groupingStartedAt = performance.now();
  const scaleGroups = groupNearbyShowrooms(scaleShowrooms);
  const groupingDurationMs = performance.now() - groupingStartedAt;
  assert.ok(groupingDurationMs < 2_500, `10,000-showroom grouping stays below 2.5 seconds (measured ${groupingDurationMs.toFixed(1)}ms)`);
  assert.equal(scaleGroups.reduce((total, group) => total + group.count, 0), scaleShowrooms.length, "scale grouping retains every nearby showroom exactly once");
  assert.ok(scaleGroups.every((group) => group.count >= 2 && group.count <= 6), "scale grouping preserves the two-to-six-card viewer contract");

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
  assert.equal(missingBoothMedia.total, 50, "missing booth setup does not erase an otherwise eligible geographic Showroom");
  assert.equal(missingBoothMedia.featured.boothCount, 40, "a business without its own approved booth image does not receive a Daily Featured slot and the projection remains capped");
  assert.equal(missingBoothMedia.featured.booths.some((booth) => booth.revealed && booth.showroom.handle === "bishoftu-repair"), false, "the showroom missing approved Featured media is excluded even when enough replacements preserve capacity");

  console.log(`Geographic Showroom discovery and weekly industry Daily Featured tests passed; 10,000-showroom grouping completed in ${groupingDurationMs.toFixed(1)}ms.`);
} finally {
  db.close();
  fs.rmSync(root, { recursive: true, force: true });
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
