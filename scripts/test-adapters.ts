import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Business } from "../lib/types";
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-adapter-test-"));
    process.env.RESEND_API_KEY = "test-key";
    process.env.NOTIFICATION_FROM_EMAIL = "test@example.com";
    const { assertProductionConfiguration, databaseDriver } = await import("../lib/config");
    delete process.env.SUQPAGE_DATABASE_DRIVER;
    assert.throws(() => databaseDriver(), /must be postgres/);
    process.env.SUQPAGE_DATABASE_DRIVER = "postgres";
    assert.equal(databaseDriver(), "postgres");
    process.env.SUQPAGE_DATABASE_DRIVER = "invalid";
    assert.throws(() => databaseDriver(), /must be postgres/);
    const previousNodeEnv = process.env.NODE_ENV;
    Reflect.set(process.env, "NODE_ENV", "production");
    process.env.NEXT_PUBLIC_APP_URL = "https://suqpage.example.test";
    process.env.SUQPAGE_CANONICAL_URL = "https://suqpage.example.test";
    process.env.PRIVACY_SALT = "postgres-production-privacy-salt";
    process.env.SUQPAGE_BACKUP_ROOT = path.join(root, "backups");
    process.env.SUQPAGE_DATABASE_DRIVER = "postgres";
    process.env.SUQPAGE_POSTGRES_URL =
        "postgresql://suqpage:secret@db.example.test:5432/suqpage?sslmode=require";
    process.env.SUQPAGE_MEDIA_DRIVER = "supabase";
    process.env.SUQPAGE_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY = "service-role-key-long-enough";
    process.env.SUQPAGE_AUTH_DRIVER = "supabase";
    process.env.SUQPAGE_EMAIL_OTP_ENABLED = "1";
    process.env.SUQPAGE_GOOGLE_AUTH_ENABLED = "1";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key-long-enough";
    assert.doesNotThrow(() => assertProductionConfiguration());
    process.env.SUQPAGE_MEDIA_DRIVER = "filesystem";
    assert.throws(() => assertProductionConfiguration(), /must be supabase in production and deploy previews/);
    if (previousNodeEnv === undefined)
        Reflect.deleteProperty(process.env, "NODE_ENV");
    else
        Reflect.set(process.env, "NODE_ENV", previousNodeEnv);
    delete process.env.SUQPAGE_POSTGRES_URL;
    delete process.env.SUQPAGE_MEDIA_DRIVER;
    delete process.env.SUQPAGE_AUTH_DRIVER;
    delete process.env.SUQPAGE_EMAIL_OTP_ENABLED;
    delete process.env.SUQPAGE_GOOGLE_AUTH_ENABLED;
    const { postgresRuntimeConfig, postgresParameters } = await import("../lib/postgres-runtime");
    assert.equal(postgresRuntimeConfig(), null);
    const postgresConfig = postgresRuntimeConfig({
        SUQPAGE_POSTGRES_URL: "postgresql://suqpage:secret@db.example.test:5432/suqpage?sslmode=require",
        SUQPAGE_POSTGRES_POOL_MAX: "5",
        SUQPAGE_POSTGRES_CONNECTION_TIMEOUT_MS: "6000",
        SUQPAGE_POSTGRES_STATEMENT_TIMEOUT_MS: "9000",
    });
    assert.deepEqual(postgresConfig, {
        connectionString: "postgresql://suqpage:secret@db.example.test:5432/suqpage?sslmode=require",
        poolMax: 5,
        connectionTimeoutMs: 6000,
        statementTimeoutMs: 9000,
    });
    assert.throws(() => postgresRuntimeConfig({ SUQPAGE_POSTGRES_URL: "not-a-url" }), /valid PostgreSQL connection URL/);
    assert.throws(() => postgresRuntimeConfig({
        SUQPAGE_POSTGRES_URL: "postgresql://suqpage:secret@db.example.test/suqpage",
        SUQPAGE_POSTGRES_POOL_MAX: "99",
    }), /SUQPAGE_POSTGRES_POOL_MAX/);
    assert.equal(postgresParameters("SELECT ? AS value, '?' AS literal, \"?\" AS quoted"), "SELECT $1 AS value, '?' AS literal, \"?\" AS quoted");
    const { consumeRuntimeRateLimit: consumeRateLimit, resetRuntimeRateLimit: resetRateLimit } = await import("../lib/rate-limit-runtime");
    const { notifyNewInquiry } = await import("../lib/notifications");
    const { getDb, closeDbForTests } = await import("./testing/postgres-fixture");
    await getDb();
    const key = "login:test:user@example.com";
    for (let attempt = 0; attempt < 5; attempt += 1) {
        assert.equal((await consumeRateLimit(key, 5, 60000)).allowed, true);
        await resetRateLimit(key);
    }
    assert.equal((await consumeRateLimit(key, 5, 60000)).remaining, 4);
    const business = {
        name: "Test tenant",
        contact_email: "owner@example.com",
    } as Business;
    const failed = await notifyNewInquiry(business, 1, "Customer", {
        send: async () => new Response(null, { status: 503 }),
    });
    assert.equal(failed, "failed");
    const sent = await notifyNewInquiry(business, 2, "Customer", {
        send: async () => new Response(null, { status: 202 }),
    });
    assert.equal(sent, "sent");
    const timedOut = await notifyNewInquiry(business, 3, "Customer", {
        timeoutMs: 10,
        send: async (_input, init) => new Promise<Response>((_resolve, reject) => {
            const guard = setTimeout(() => reject(new Error("timeout signal was not delivered")), 1000);
            init?.signal?.addEventListener("abort", () => {
                clearTimeout(guard);
                reject(new Error("aborted"));
            }, { once: true });
        }),
    });
    assert.equal(timedOut, "failed");
    await closeDbForTests();
    fs.rmSync(root, { recursive: true, force: true });
    console.log("Adapter boundary tests passed.");
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
