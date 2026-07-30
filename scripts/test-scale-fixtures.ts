import assert from "node:assert/strict";
import { getAllBusinesses, getDb } from "../lib/db";
import { getCurrentExpo } from "../lib/expo";
import { SEEDED_FEATURED_HANDLES } from "../lib/expo-seed";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";

const db = getDb();
assert.equal(getAllBusinesses().filter((business) => business.status === "active").length, 398);
assert.equal(SCALE_DEMO_BUSINESSES.length, 350);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM products").get() as { total: number }).total),
  1237,
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
  SELECT b.handle FROM bazaar_booth_profiles p
  JOIN businesses b ON b.id=p.business_id
  WHERE p.is_featured=1 ORDER BY b.handle
`).all() as Array<{ handle: string }>;
assert.deepEqual(featured.map((row) => row.handle), [...SEEDED_FEATURED_HANDLES].sort());

const sunday = new Date("2026-08-02T10:00:00.000Z");
const dailyCounts: number[] = [];
for (let offset = 0; offset < 7; offset += 1) {
  const now = new Date(sunday);
  now.setUTCDate(sunday.getUTCDate() + offset);
  const expo = getCurrentExpo({ db, now });
  dailyCounts.push(expo.booths.length);
  assert.ok(expo.booths.length >= 50, `${expo.themeName} has at least 50 booths`);
  assert.equal(expo.map.hubs.length, 5, `${expo.themeName} has five city venues`);
  const venueCounts = expo.map.hubs.map((hub) => hub.boothCount);
  assert.ok(venueCounts.every((count) => count >= 10 && count <= 20));
  assert.ok(Math.max(...venueCounts) - Math.min(...venueCounts) <= 1);
  const hallCounts = new Map<string, number>();
  for (const booth of expo.booths) {
    const key = `${booth.hubKey}:${booth.hallNumber}`;
    hallCounts.set(key, (hallCounts.get(key) || 0) + 1);
  }
  assert.ok(
    [...hallCounts.values()].every((count) => count <= 12),
    `${expo.themeName} keeps halls bounded`,
  );
}
assert.deepEqual(dailyCounts, [54, 54, 54, 51, 74, 53, 54]);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM business_subscriptions").get() as { total: number }).total),
  398,
);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM showroom_visits").get() as { total: number }).total),
  3184,
);
assert.equal(
  Number((db.prepare("SELECT COUNT(*) total FROM support_conversations").get() as { total: number }).total),
  30,
);
assert.equal((db.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);

console.log("Scale fixtures passed: 398 showrooms, ten featured, all lifecycle states, and five balanced venues every day.");
