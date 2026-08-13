import assert from "node:assert/strict";
import { getAllBusinesses, getDb } from "../lib/db";
import { DISCOVERY_INDUSTRIES, FEATURED_WEEK, getDiscoveryView } from "../lib/discovery";
import { SEEDED_FEATURED_HANDLES } from "../lib/marketplace-seed";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";

async function main() {
const db = getDb();
assert.ok(getAllBusinesses().filter((business) => business.status === "active").length >= 66, "the retained database includes the complete 66-business scale baseline");
assert.equal(SCALE_DEMO_BUSINESSES.length, 56);
assert.ok(
  Number((db.prepare("SELECT COUNT(*) total FROM products").get() as { total: number }).total) >= 264,
  "the retained database includes the complete 264-product scale baseline",
);
assert.ok(
  Number((db.prepare("SELECT COUNT(*) total FROM service_requests").get() as { total: number }).total) >= 66,
  "the retained database includes the complete request workflow baseline",
);
assert.equal(
  Number((db.prepare(`
    SELECT COUNT(*) total FROM (
      SELECT business_id
      FROM service_requests
      WHERE business_id IS NOT NULL
        AND status IN (
          'submitted','under_review','needs_information','approved_for_work',
          'in_progress','client_review','client_approved'
        )
      GROUP BY business_id
      HAVING COUNT(*) > 1
    )
  `).get() as { total: number }).total),
  0,
  "the workflow fixture keeps at most one current showroom project per business",
);
assert.equal(
  Number((db.prepare(`
    SELECT COUNT(*) total FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id
    WHERE p.access_role='operations_manager'
  `).get() as { total: number }).total),
  4,
);
assert.equal(
  Number((db.prepare(`
    SELECT COUNT(*) total FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id
    WHERE p.access_role='team_member'
  `).get() as { total: number }).total),
  8,
);
assert.deepEqual(
  (
    db.prepare("SELECT DISTINCT status FROM service_requests ORDER BY status").all() as Array<{ status: string }>
  ).map((row) => row.status),
  [
    "approved_for_work",
    "cancelled",
    "client_approved",
    "client_review",
    "completed",
    "in_progress",
    "needs_information",
    "published",
    "rejected",
    "submitted",
    "under_review",
  ],
);
const featured = db.prepare(`
  SELECT b.handle FROM business_discovery_profiles p
  JOIN businesses b ON b.id=p.business_id
  WHERE p.is_featured=1 AND p.is_excluded=0 ORDER BY b.handle
`).all() as Array<{ handle: string }>;
assert.deepEqual(featured.map((row) => row.handle), [...SEEDED_FEATURED_HANDLES].sort());

const industryCounts: number[] = [];
let globalSponsorHandles: string[] | null = null;
for (const industry of DISCOVERY_INDUSTRIES) {
  const featuredDay = FEATURED_WEEK.find((day) => day.industryKey === industry.key)?.weekday;
  assert.notEqual(featuredDay, undefined, `${industry.label} has one stable weekday assignment`);
  const discovery = await getDiscoveryView({ db, industry: industry.key, featuredDay });
  industryCounts.push(discovery.total);
  assert.ok(discovery.total >= 8, `${industry.label} has a useful active fixture cohort`);
  assert.equal(discovery.sponsoredShowrooms.length, 5, "the public projection exposes exactly five globally selected sponsors");
  const sponsorHandles = discovery.sponsoredShowrooms.map((showroom) => showroom.handle);
  if (globalSponsorHandles) assert.deepEqual(sponsorHandles, globalSponsorHandles, `${industry.label} does not alter the global sponsor pool`);
  else globalSponsorHandles = sponsorHandles;
  assert.ok(discovery.locationCount >= 1, `${industry.label} has a reviewed geographic location`);
  const groupedIds = discovery.cityGroups.flatMap((group) => group.showrooms.map((showroom) => showroom.id));
  assert.equal(new Set(groupedIds).size, groupedIds.length, `${industry.label} city gateways contain no duplicate businesses`);
  assert.ok(discovery.cityGroups.every((group) => group.count === group.showrooms.length && group.count > 1), `${industry.label} city gateway counts remain exact`);
  assert.equal(discovery.featured.booths.length, discovery.showrooms.length, `${industry.label} Daily Featured includes the complete result set`);
  assert.deepEqual(discovery.featured.booths.map((booth) => booth.slot), Array.from({ length: discovery.featured.boothCount }, (_, index) => index + 1), `${industry.label} uses one continuous sequence of floor slots`);
  assert.equal(new Set(discovery.featured.booths.map((booth) => booth.reference)).size, discovery.featured.boothCount, `${industry.label} floor references remain unique`);
  assert.ok((await getDiscoveryView({ db, industry: industry.key, scale: "growing_factory" })).total >= 1, `${industry.label} has a growing-factory fixture`);
}
const searchedMonday = await getDiscoveryView({ db, industry: "electronics", q: "Nova Assembly", featuredDay: 1 });
assert.equal(searchedMonday.total, 1, "map search narrows geographic results");
assert.equal(searchedMonday.featured.booths.length, industryCounts[0], "map search does not shrink the selected Daily Featured program");
assert.ok(industryCounts.reduce((total, count) => total + count, 0) >= 66, "the seven industry projections retain the complete scale baseline");
assert.ok(
  Number((db.prepare("SELECT COUNT(*) total FROM business_subscriptions").get() as { total: number }).total) >= 66,
  "the retained database includes renewal ledgers for the scale baseline",
);
assert.ok(
  Number((db.prepare("SELECT COUNT(*) total FROM showroom_visits").get() as { total: number }).total) >= 464,
  "runtime showroom visits may grow beyond the seeded scale baseline",
);
assert.ok(
  Number((db.prepare("SELECT COUNT(*) total FROM support_conversations").get() as { total: number }).total) >= 30,
  "the retained database includes the support workload baseline",
);
assert.equal((db.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);

console.log("Scale fixtures passed: 66 showrooms, five global sponsors, both production scales, all lifecycle states, and seven discovery industries.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
