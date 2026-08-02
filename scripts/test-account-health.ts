import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SessionUser } from "../lib/types";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-account-health-"));
  process.env.MIRTPAGE_DB_PATH = path.join(root, "test.db");
  process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.PRIVACY_SALT = "account-health-test-salt-long-enough";
  const { closeDbForTests, getBusinessByHandle, getDb } = await import("../lib/db");
  const {
    getBusinessSubscription,
    getShowroomInsights,
    recordManualPayment,
    recordShowroomVisit,
  } = await import("../lib/account-health");
  const db = getDb();
  const businessA = Number(db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('tenant-a','Tenant A','composition','active')").run().lastInsertRowid);
  const businessB = Number(db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('tenant-b','Tenant B','composition','active')").run().lastInsertRowid);
  const addUser = db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,? ,? ,?,?,0)");
  const clientAId = Number(addUser.run("a@example.test", "x", "Client A", "owner", businessA).lastInsertRowid);
  const clientBId = Number(addUser.run("b@example.test", "x", "Client B", "owner", businessB).lastInsertRowid);
  const operationsId = Number(addUser.run("ops@example.test", "x", "Operations", "admin", null).lastInsertRowid);
  const addRole = db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)");
  addRole.run(clientAId, "client");
  addRole.run(clientBId, "client");
  addRole.run(operationsId, "operations_manager");
  const clientA: SessionUser = { id: clientAId, email: "a@example.test", name: "Client A", role: "owner", access_role: "client", business_id: businessA, must_change_password: 0 };
  const clientB: SessionUser = { id: clientBId, email: "b@example.test", name: "Client B", role: "owner", access_role: "client", business_id: businessB, must_change_password: 0 };
  const operations: SessionUser = { id: operationsId, email: "ops@example.test", name: "Operations", role: "admin", access_role: "operations_manager", business_id: null, must_change_password: 0 };

  const now = Date.now();
  db.prepare("UPDATE business_subscriptions SET starts_at=?,current_period_start=?,current_period_end=?,grace_ends_at=? WHERE business_id=?")
    .run(now - 90 * 86_400_000, now - 31 * 86_400_000, now - 2 * 86_400_000, now + 2 * 86_400_000, businessA);
  assert.equal(getBusinessSubscription(businessA, now)?.state, "grace");
  assert.ok(getBusinessByHandle("tenant-a"));
  db.prepare("UPDATE business_subscriptions SET grace_ends_at=? WHERE business_id=?")
    .run(now - 1, businessA);
  assert.equal(getBusinessSubscription(businessA, now)?.state, "inactive");
  assert.ok(getBusinessByHandle("tenant-a"), "an advisory renewal date does not hide an active showroom");
  db.prepare("UPDATE businesses SET status='suspended' WHERE id=?").run(businessA);
  assert.equal(getBusinessByHandle("tenant-a"), undefined, "explicit suspension hides the showroom");
  db.prepare("UPDATE businesses SET status='active' WHERE id=?").run(businessA);

  const renewed = recordManualPayment(operations, {
    businessId: businessA,
    amount: "",
    paidAt: new Date(now).toISOString(),
    idempotencyKey: "account-renewal-0001",
  }, now);
  const duplicate = recordManualPayment(operations, {
    businessId: businessA,
    amount: "",
    paidAt: new Date(now).toISOString(),
    idempotencyKey: "account-renewal-0001",
  }, now);
  assert.equal(renewed.duplicate, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(getBusinessSubscription(businessA, now)?.amountMinor, null);
  assert.equal(getBusinessSubscription(businessA, now)?.state, "active");

  assert.equal(recordShowroomVisit({ handle: "tenant-a", visitorToken: "visitor-a", source: "expo", occurrenceId: 1, hubKey: "addis-ababa", now }).recorded, true);
  assert.equal(recordShowroomVisit({ handle: "tenant-a", visitorToken: "visitor-a", source: "expo", occurrenceId: 1, hubKey: "addis-ababa", now }).recorded, false);
  assert.equal(recordShowroomVisit({ handle: "tenant-a", visitorToken: "visitor-a", source: "directory", now }).recorded, true);
  assert.deepEqual(getShowroomInsights(clientA, businessA, now), {
    totalVisitors: 2,
    expoVisitors: 1,
    directoryVisitors: 1,
    directVisitors: 0,
    last30Days: 2,
  });
  assert.throws(() => getShowroomInsights(clientB, businessA), /unavailable/);
  assert.equal((db.prepare("SELECT COUNT(*) total FROM subscription_payments WHERE business_id=?").get(businessA) as { total: number }).total, 1);
  assert.equal((db.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);
  closeDbForTests();
  fs.rmSync(root, { recursive: true, force: true });
  console.log("Account lifecycle, manual renewal, tenant insights, and privacy visit attribution passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
