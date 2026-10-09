import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SessionUser } from "../lib/types";
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-account-health-"));
    process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
    process.env.PRIVACY_SALT = "account-health-test-salt-long-enough";
    const { closeDbForTests, getBusinessByHandle, getDb } = await import("./testing/postgres-fixture");
    const { getShowroomInsights, recordShowroomVisit, } = await import("../lib/account-health");
    const db = await getDb();
    const businessA = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('tenant-a','Tenant A','composition','active')").run()).insertedId);
    const businessB = Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('tenant-b','Tenant B','composition','active')").run()).insertedId);
    const addUser = db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,? ,? ,?,?,0)");
    const clientAId = Number((await addUser.run("a@example.test", "x", "Client A", "owner", businessA)).insertedId);
    const clientBId = Number((await addUser.run("b@example.test", "x", "Client B", "owner", businessB)).insertedId);
    const operationsId = Number((await addUser.run("ops@example.test", "x", "Operations", "admin", null)).insertedId);
    const addRole = db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)");
    await addRole.run(clientAId, "client");
    await addRole.run(clientBId, "client");
    await addRole.run(operationsId, "operations_manager");
    const clientA: SessionUser = { id: clientAId, email: "a@example.test", name: "Client A", role: "owner", access_role: "client", business_id: businessA, must_change_password: 0 };
    const clientB: SessionUser = { id: clientBId, email: "b@example.test", name: "Client B", role: "owner", access_role: "client", business_id: businessB, must_change_password: 0 };
    const operations: SessionUser = { id: operationsId, email: "ops@example.test", name: "Operations", role: "admin", access_role: "operations_manager", business_id: null, must_change_password: 0 };
    const now = Date.now();
    // Rehearse the upgrade from an existing historical ledger, without deleting it.
    await db.prepare("INSERT INTO business_subscriptions(business_id,plan_name,currency,starts_at,current_period_start,current_period_end,grace_ends_at,updated_at) VALUES(?,'Historical plan','ETB',1,1,2,3,1)").run(businessA);
    await db.prepare("INSERT INTO subscription_payments(public_ref,business_id,currency,idempotency_key,paid_at,recorded_by_user_id,created_at) VALUES('HISTORICAL',?,'ETB','historical-record',1,?,1)").run(businessA,operationsId);
    const beforeLedger=await db.prepare('SELECT * FROM business_subscriptions ORDER BY business_id').all();
    const beforePayments=await db.prepare('SELECT * FROM subscription_payments ORDER BY id').all();
    const schema=(await db.prepare('SELECT current_schema() name').get()).name;
    const {postgresTriggerDefinitions}=await import('./postgres-trigger-definitions');
    // Reinstall just the superseded creation trigger to represent the pre-upgrade state.
    const historical=postgresTriggerDefinitions(schema);
    const start=historical.indexOf('CREATE FUNCTION "'+schema+'".create_business_subscription');
    assert.ok(start>=0);await db.exec(historical.slice(start));
    assert.ok(await db.prepare("SELECT 1 FROM pg_trigger WHERE tgname='business_subscription_after_insert' AND tgrelid='businesses'::regclass").get());
    await db.prepare('DELETE FROM schema_migrations WHERE version=60').run();
    const {migratePostgresDatabase}=await import('../lib/postgres-migrations');
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[60]);
    assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
    assert.deepEqual(await db.prepare('SELECT * FROM business_subscriptions ORDER BY business_id').all(),beforeLedger);
    assert.deepEqual(await db.prepare('SELECT * FROM subscription_payments ORDER BY id').all(),beforePayments);
    const newShop=await db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES('no-plan-shop','No plan shop','composition')").run();
    assert.equal(await db.prepare('SELECT 1 FROM business_subscriptions WHERE business_id=?').get(newShop.insertedId),undefined);
    assert.ok(await getBusinessByHandle('tenant-a'),'historical renewal dates cannot hide an active showroom');
    await db.prepare("UPDATE businesses SET status='suspended' WHERE id=?").run(businessA);
    assert.equal(await getBusinessByHandle('tenant-a'),undefined);
    await db.prepare("UPDATE businesses SET status='active' WHERE id=?").run(businessA);
    assert.equal((await recordShowroomVisit({ handle: "tenant-a", visitorToken: "visitor-a", source: "featured", now })).recorded, true);
    assert.equal((await recordShowroomVisit({ handle: "tenant-a", visitorToken: "visitor-a", source: "featured", now })).recorded, false);
    assert.equal((await recordShowroomVisit({ handle: "tenant-a", visitorToken: "visitor-a", source: "directory", now })).recorded, true);
    assert.deepEqual(await getShowroomInsights(clientA, businessA, now), {
        totalVisitors: 2,
        featuredVisitors: 1,
        directoryVisitors: 1,
        directVisitors: 0,
        last30Days: 2,
    });
    await assert.rejects(() => getShowroomInsights(clientB, businessA), /unavailable/);
    assert.equal((await db.prepare("SELECT COUNT(*) total FROM subscription_payments WHERE business_id=?").get(businessA) as {
        total: number;
    }).total, 1);
    assert.equal((await db.prepare("SELECT COUNT(*) total FROM pg_constraint WHERE connamespace=current_schema()::regnamespace AND NOT convalidated").get()).total, 0);
    await closeDbForTests();
    fs.rmSync(root, { recursive: true, force: true });
    console.log("Subscription retirement, non-destructive upgrade, tenant insights and privacy visit attribution passed.");
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
