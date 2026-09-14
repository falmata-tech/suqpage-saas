import { platformEnvironment } from "../lib/platform-environment.mjs";
import {
  createPostgresPool,
  PostgresTransactionRunner,
  postgresRuntimeConfig,
} from "../lib/postgres-runtime";
import { migratePostgresDatabase } from "../lib/postgres-migrations";

async function main() {
  const directUrl = (platformEnvironment().SUQPAGE_POSTGRES_DIRECT_URL || "").trim();
  if (!directUrl) {
    throw new Error("SUQPAGE_POSTGRES_DIRECT_URL is required for PostgreSQL migrations.");
  }

  const config = postgresRuntimeConfig({
    SUQPAGE_POSTGRES_URL: directUrl,
    SUQPAGE_POSTGRES_POOL_MAX: "1",
    SUQPAGE_POSTGRES_CONNECTION_TIMEOUT_MS: platformEnvironment().SUQPAGE_POSTGRES_CONNECTION_TIMEOUT_MS,
    SUQPAGE_POSTGRES_STATEMENT_TIMEOUT_MS: platformEnvironment().SUQPAGE_POSTGRES_STATEMENT_TIMEOUT_MS,
  });
  if (!config) throw new Error("The PostgreSQL migration connection is invalid.");

  const pool = createPostgresPool(config);
  try {
    const result = await migratePostgresDatabase(
      new PostgresTransactionRunner(pool),
      platformEnvironment().SUQPAGE_POSTGRES_MIGRATION_SCHEMA || "public",
      platformEnvironment().SUQPAGE_POSTGRES_MIGRATION_ROLE || "",
    );
    console.log(
      result.applied.length
        ? `Applied PostgreSQL migration ${result.applied.join(", ")}.`
        : "PostgreSQL migrations are current.",
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "PostgreSQL migration failed.");
  process.exitCode = 1;
});
