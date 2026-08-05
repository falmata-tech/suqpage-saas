import assert from "node:assert/strict";
import { createPostgresPool, PostgresTransactionRunner, postgresRuntimeConfig } from "../lib/postgres-runtime";

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
    console.log("PostgreSQL runtime pool, placeholder, and transaction tests passed.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
