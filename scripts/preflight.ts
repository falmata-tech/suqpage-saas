import { platformEnvironment } from "../lib/platform-environment.mjs";
import {
  assertProductionConfiguration,
  authDriver,
  databaseDriver,
  mediaRoot,
  mediaStorageDriver,
} from "../lib/config";
import { closePostgresRuntimeForTests } from "../lib/postgres-runtime-services";
import { runtimeAll, runtimeGet } from "../lib/runtime-sql";
import { isSupportedPostgresMigrationLedger, LATEST_POSTGRES_MIGRATION_VERSION } from "../lib/postgres-schema-version";

export async function preflight(read: { get: typeof runtimeGet; all: typeof runtimeAll } = { get: runtimeGet, all: runtimeAll }) {
  assertProductionConfiguration();

  const driver = databaseDriver();
  const migrations = await read.all<{ version: unknown }>(
    "SELECT version FROM schema_migrations ORDER BY version LIMIT ?",
    [LATEST_POSTGRES_MIGRATION_VERSION + 1],
  );
  if (!isSupportedPostgresMigrationLedger(migrations.map(row => row.version))) {
    throw new Error(`PostgreSQL migrations must match a complete reviewed ledger through ${LATEST_POSTGRES_MIGRATION_VERSION} before this release can serve traffic.`);
  }

  if (authDriver() === "supabase") {
    const identityMigration = await read.get<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=37",
    );
    if (!identityMigration) throw new Error("Database migration 37 is required before Supabase Auth can serve traffic.");
    const onboardingMigration = await read.get<{ version: number }>(
      "SELECT version FROM schema_migrations WHERE version=38",
    );
    if (!onboardingMigration) throw new Error("Database migration 38 is required before business onboarding can serve traffic.");
    const unlinked = await read.get<{ total: number }>(`
      SELECT COUNT(*) total FROM users u
      LEFT JOIN auth_identity_links link ON link.user_id=u.id AND link.provider='supabase'
      WHERE link.user_id IS NULL
    `);
    if (Number(unlinked?.total || 0) > 0) {
      throw new Error("Every retained Suqpage user must have one reconciled Supabase identity before Auth cutover.");
    }
  }

  const admins = await read.get<{ total: number }>(
    "SELECT COUNT(*) total FROM users WHERE role='admin'",
  );
  if (!admins?.total) {
    throw new Error("At least one administrator account is required.");
  }

  const temporary = await read.get<{ total: number }>(
    "SELECT COUNT(*) total FROM users WHERE must_change_password=1",
  );
  console.log(`Preflight passed. Database provider: ${driver}`);
  console.log(
    `Media provider: ${mediaStorageDriver()}${
      mediaStorageDriver() === "filesystem" ? ` (${mediaRoot()})` : ""
    }`,
  );
  if (temporary?.total) {
    console.warn(`Warning: ${temporary.total} account(s) still use a temporary password.`);
  }
}

if (platformEnvironment().SUQPAGE_PREFLIGHT_IMPORT_ONLY !== "1") {
  void (async () => {
    try {
      await preflight();
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Preflight failed.");
      process.exitCode = 1;
    } finally {
      await closePostgresRuntimeForTests();
    }
  })();
}
