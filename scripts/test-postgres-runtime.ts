import assert from "node:assert/strict";
import { createPostgresPool, PostgresTransactionRunner, postgresRuntimeConfig } from "../lib/postgres-runtime";
import { consumePostgresRateLimit, resetPostgresRateLimit } from "../lib/rate-limit-postgres";
import { PostgresCatalogRepository } from "../lib/postgres-catalog-repository";
import { PostgresSessionRepository } from "../lib/postgres-session-repository";
import { createPostgresPublicInquiry } from "../lib/inquiries-postgres";
import { createPostgresPublicClientWorkspace } from "../lib/signup-postgres";
import { PostgresRequestRepository } from "../lib/postgres-request-repository";

async function main() {
  const config = postgresRuntimeConfig({
    MIRTPAGE_POSTGRES_URL: process.env.MIRTPAGE_POSTGRES_REHEARSAL_URL,
    MIRTPAGE_POSTGRES_POOL_MAX: "2",
  });
  assert.ok(config, "A disposable PostgreSQL URL is required for runtime adapter tests.");

  const pool = createPostgresPool(config);
  const runner = new PostgresTransactionRunner(pool);
  try {
    const evidence = await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const businesses = await runner.query<{ count: number }>(
        "SELECT COUNT(*)::int AS count FROM businesses WHERE status=?",
        ["active"],
      );
      assert.ok(businesses.rows[0]?.count > 0, "Expected active rehearsed businesses.");

      const outer = await runner.query<{ pid: number }>("SELECT pg_backend_pid()::int AS pid");
      const inner = await runner.transaction(async () =>
        runner.query<{ pid: number }>("SELECT pg_backend_pid()::int AS pid"),
      );
      assert.equal(inner.rows[0]?.pid, outer.rows[0]?.pid, "Nested work must retain one transaction client.");
      return { activeBusinesses: businesses.rows[0].count, backendPid: outer.rows[0].pid };
    });
    assert.ok(evidence.activeBusinesses > 0);
    assert.ok(evidence.backendPid > 0);

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const repository = new PostgresCatalogRepository(runner);
      const businesses = await repository.getAllBusinesses();
      const business = businesses[0];
      assert.ok(business, "Expected a rehearsed business.");
      assert.equal((await repository.getBusinessByHandle(`@${business.handle}`))?.id, business.id);
      assert.equal((await repository.getBusinessByHandleAny(business.handle))?.id, business.id);
      const catalog = await repository.getCatalogByBusinessId(business.id, true);
      assert.equal(catalog?.business.id, business.id);
      assert.ok(catalog?.categories.length);
      const user = (await runner.query<{ id: number; email: string }>(
        "SELECT id,email FROM users WHERE business_id=? ORDER BY id LIMIT 1",
        [business.id],
      )).rows[0];
      if (user) {
        assert.equal((await repository.getUserById(user.id))?.id, user.id);
        assert.equal((await repository.getUserByEmail(user.email))?.id, user.id);

        const sessions = new PostgresSessionRepository(runner);
        const now = Date.now();
        const tokenHash = `postgres-runtime-${now}`;
        const sessionId = await sessions.create({
          tokenHash,
          userId: user.id,
          expiresAt: now + 60_000,
          now,
          ipHash: "test-ip-hash",
          userAgent: "PostgreSQL runtime test",
        });
        assert.equal((await sessions.findActive(tokenHash, now))?.id, sessionId);
        await sessions.touch(sessionId, now + 1);
        assert.equal((await sessions.findActive(tokenHash, now + 1))?.last_seen_at, now + 1);
        await sessions.revokeByToken(tokenHash, now + 2);
        assert.equal(await sessions.findActive(tokenHash, now + 2), undefined);
      }

      const product = (await runner.query<{ id: number }>(
        "SELECT id FROM products WHERE business_id=? AND is_published=1 AND availability IN ('available','limited') ORDER BY id LIMIT 1",
        [business.id],
      )).rows[0];
      if (product) {
        const groups = (await runner.query<{ id: number; name: string }>("SELECT id,name FROM option_groups WHERE product_id=? ORDER BY position,id", [product.id])).rows;
        const options: Record<string, string> = {};
        for (const group of groups) {
          const value = (await runner.query<{ value: string }>("SELECT value FROM option_values WHERE option_group_id=? ORDER BY id LIMIT 1", [group.id])).rows[0];
          assert.ok(value, `Expected an option value for ${group.name}.`);
          options[group.name] = value.value;
        }
        const key = `postgres-inquiry-${Date.now()}`;
        const first = await createPostgresPublicInquiry(runner, {
          businessId: business.id,
          customerName: "PostgreSQL rehearsal visitor",
          contact: "+251911123456",
          contactMethod: "phone",
          note: "Rehearsal inquiry",
          idempotencyKey: key,
          items: [{ productId: product.id, quantity: "20 kg", options }],
        }, "postgres-rehearsal-ip", async () => undefined);
        assert.equal(first.duplicate, false);
        const repeated = await createPostgresPublicInquiry(runner, {
          businessId: business.id,
          customerName: "PostgreSQL rehearsal visitor",
          contact: "+251911123456",
          contactMethod: "phone",
          idempotencyKey: key,
          items: [{ productId: product.id, options }],
        }, "postgres-rehearsal-ip", async () => undefined);
        assert.equal(repeated.duplicate, true);
        assert.equal(repeated.inquiryId, first.inquiryId);
      }
    });

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const requests = new PostgresRequestRepository(runner);
      const key = `postgres-request-${Date.now()}`;
      const input = { contactName: "PostgreSQL request", contactValue: "+251911123456", businessName: "PostgreSQL Works", requestText: "We need a professional showroom for the products made in our workshop.", idempotencyKey: key, consent: true };
      const created = await requests.createPublicInterest(input, "postgres-request-ip");
      assert.ok(created.id && created.publicRef);
      assert.equal((await requests.createPublicInterest(input, "postgres-request-ip")).id, created.id);
      const detail = await requests.getRequestDetail(created.id);
      assert.equal(detail?.id, created.id);
      assert.equal(detail?.events.length, 1);
      const admin = (await runner.query<{ id: number; email: string; name: string; role: "admin"; business_id: null; must_change_password: number; access_role: "platform_admin" }>("SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,'platform_admin' access_role FROM users u WHERE u.role='admin' ORDER BY id LIMIT 1")).rows[0];
      assert.ok(admin, "Expected an administrator fixture.");
      const page = await requests.listRequestsPage(admin, { page: 1, q: "postgresql request" });
      assert.ok(page.items.some((item) => item.id === created.id));
      const changed = await requests.updateStatus(created.id, "under_review", admin.id);
      assert.equal(changed?.businessId, null);
      const updated = await requests.getRequestDetail(created.id);
      assert.equal(updated?.status, "under_review");
    });

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      const unique = `${Date.now()}${Math.floor(Math.random() * 10_000)}`;
      const input = {
        name: "PostgreSQL Signup",
        email: `postgres-${unique}@example.test`,
        phone: "+251911123456",
        businessName: `PostgreSQL Works ${unique}`,
        handle: `postgres-works-${unique}`,
        password: "PostgresSignup123",
        confirmPassword: "PostgresSignup123",
        requestText: "We make durable goods and need a clear public showroom for local buyers.",
        idempotencyKey: `postgres-signup-${unique}`,
        consent: true,
      };
      const signup = await createPostgresPublicClientWorkspace(runner, input);
      assert.ok(signup.userId && signup.businessId && signup.requestId);
      await assert.rejects(
        () => createPostgresPublicClientWorkspace(runner, { ...input, handle: `other-${unique}`, idempotencyKey: `again-${unique}` }),
        /already uses this email/,
      );
    });

    await runner.transaction(async () => {
      await runner.query("SET LOCAL search_path TO mirtpage_rehearsal");
      await resetPostgresRateLimit(runner, "postgres-runtime-test");
      assert.equal((await consumePostgresRateLimit(runner, "postgres-runtime-test", 2, 60_000)).remaining, 1);
      assert.equal((await consumePostgresRateLimit(runner, "postgres-runtime-test", 2, 60_000)).remaining, 0);
      const blocked = await consumePostgresRateLimit(runner, "postgres-runtime-test", 2, 60_000, 120_000);
      assert.equal(blocked.allowed, false);
      assert.equal(blocked.remaining, 0);
      assert.ok(blocked.retryAfterSeconds > 0);
    });
    console.log("PostgreSQL runtime pool, placeholder, and transaction tests passed.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
