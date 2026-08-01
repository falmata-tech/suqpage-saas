import assert from "node:assert/strict";
import { getAllBusinesses, getDb } from "../lib/db";
import { DISCOVERY_INDUSTRIES, getDiscoveryView } from "../lib/discovery";
import { SEEDED_FEATURED_HANDLES } from "../lib/expo-seed";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";

const db = getDb();
assert.equal(getAllBusinesses().filter((business) => business.status === "active").length, 58);
assert.equal(SCALE_DEMO_BUSINESSES.length, 48);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM products").get() as { total: number }).total),
  217,
);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM service_requests").get() as { total: number }).total),
  66,
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
for (const industry of DISCOVERY_INDUSTRIES) {
  const discovery = getDiscoveryView({ db, industry: industry.key });
  industryCounts.push(discovery.total);
  assert.ok(discovery.total >= 8, `${industry.label} has a useful active fixture cohort`);
  assert.ok(discovery.locationCount >= 1, `${industry.label} has a reviewed geographic location`);
  const hallCounts = new Map<string, number>();
  assert.equal(discovery.expo.booths.length, discovery.suqs.length, `${industry.label} Expo includes the complete result set`);
  for (const booth of discovery.expo.booths) {
    const key = String(booth.hall);
    hallCounts.set(key, (hallCounts.get(key) || 0) + 1);
  }
  assert.ok(
    [...hallCounts.values()].every((count) => count <= 12),
    `${industry.label} keeps halls bounded`,
  );
}
assert.equal(industryCounts.reduce((total, count) => total + count, 0), 58);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM business_subscriptions").get() as { total: number }).total),
  58,
);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM showroom_visits").get() as { total: number }).total),
  464,
);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM support_conversations").get() as { total: number }).total),
  30,
);
assert.equal((db.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);

console.log("Scale fixtures passed: 58 Suqs, ten featured, all lifecycle states, and six permanent discovery industries.");
