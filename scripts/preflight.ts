import fs from "node:fs";
import {
  assertProductionConfiguration,
  databaseDriver,
  databasePath,
  mediaRoot,
  mediaStorageDriver,
} from "../lib/config";
import { runtimeGet } from "../lib/runtime-sql";

export async function preflight() {
  assertProductionConfiguration();

  const driver = databaseDriver();
  if (driver === "sqlite") {
    const { getDb } = await import("../lib/db");
    const database = getDb();
    const integrity = database
      .prepare("PRAGMA integrity_check")
      .get() as Record<string, string>;
    if (!Object.values(integrity).includes("ok")) {
      throw new Error("Database integrity check failed.");
    }
    fs.accessSync(databasePath(), fs.constants.R_OK | fs.constants.W_OK);
  }

  const admins = await runtimeGet<{ total: number }>(
    "SELECT COUNT(*) total FROM users WHERE role='admin'",
  );
  if (!admins?.total) {
    throw new Error("At least one administrator account is required.");
  }

  const temporary = await runtimeGet<{ total: number }>(
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

if (process.env.MIRTPAGE_PREFLIGHT_IMPORT_ONLY !== "1") {
  preflight().catch((error) => {
    console.error(error instanceof Error ? error.message : "Preflight failed.");
    process.exitCode = 1;
  });
}
