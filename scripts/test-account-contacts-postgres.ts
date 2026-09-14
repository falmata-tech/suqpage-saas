import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { postgresRuntimeServices, closePostgresRuntimeForTests } from "../lib/postgres-runtime-services";
import { migratePostgresDatabase } from "../lib/postgres-migrations";
import { createPostgresPublicClientWorkspace } from "../lib/signup-postgres";
import { accountContactPort } from "../lib/account-contact-runtime";
import { saveAccountPhone } from "../lib/account-contacts";

async function main() {
  const target = new URL(process.env.MIRTPAGE_POSTGRES_URL || "");
  assert.ok(["localhost", "127.0.0.1"].includes(target.hostname) && target.port === "54322");
  assert.equal(process.env.MIRTPAGE_DATABASE_DRIVER, "postgres");
  const { runner, catalog } = postgresRuntimeServices();
  const rollback = new Error("ROLLBACK_CONTACT_TEST");
  try {
    await runner.transaction(async () => {
      const before = (await runner.query("SELECT id,email FROM users ORDER BY id")).rows;
      const links = (await runner.query("SELECT * FROM auth_identity_links ORDER BY user_id")).rows;
      await migratePostgresDatabase(runner);
      for (const role of ["anon", "authenticated"]) {
        const permission = (await runner.query<{ allowed: boolean }>("SELECT has_column_privilege(?, 'public.users', 'account_phone', 'SELECT') allowed", [role])).rows[0];
        assert.equal(permission.allowed, false, "Browser roles cannot read private account phone directly");
      }
      assert.deepEqual((await migratePostgresDatabase(runner)).applied, []);
      assert.deepEqual((await runner.query("SELECT id,email FROM users ORDER BY id")).rows, before);
      assert.deepEqual((await runner.query("SELECT * FROM auth_identity_links ORDER BY user_id")).rows, links);
      const created = await createPostgresPublicClientWorkspace(runner, {
        name: "Contact test", businessName: "Contact separation test", businessCategory: "other-manufacturing",
        phone: "+44 7700 900001", consent: true, idempotencyKey: randomUUID(),
      }, { providerUserId: randomUUID(), email: `contact-${randomUUID()}@example.test` });
      const business = (await catalog.getBusinessById(created.businessId))!;
      assert.equal(business.whatsapp, "");
      assert.equal(business.public_email, "");
      assert.equal(business.public_phone, "");
      const account = (await accountContactPort.read(created.userId))!;
      assert.equal(account.account_phone, "+447700900001");
      await saveAccountPhone(accountContactPort, { id: created.userId }, "+447700900002");
      assert.equal((await accountContactPort.read(created.userId))?.email, account.email);
      assert.equal((await accountContactPort.read(created.userId))?.account_phone, "+447700900002");
      assert.ok(!("account_phone" in (await catalog.getUserById(created.userId))!));
      assert.deepEqual(await catalog.getBusinessById(created.businessId), business);
      assert.deepEqual((await runner.query("SELECT id,email FROM users WHERE id<>? ORDER BY id", [created.userId])).rows, before);
      console.log("PASS PostgreSQL migration idempotence, identity preservation, signup privacy, account save and catalog isolation (rolled back)");
      throw rollback;
    });
  } catch (error) { if (error !== rollback) throw error; }
  finally { await closePostgresRuntimeForTests(); }
}
main().catch(() => { console.error("Contact PostgreSQL regression failed; no test transaction was retained."); process.exitCode = 1; });
