import { DatabaseSync } from "node:sqlite";
import { databasePath, ensureRuntimeDirectories } from "../lib/config";
import { assertDestructiveMigrationCheckpoint } from "../lib/migration-checkpoint";
import { migrateDatabase } from "../lib/schema";

ensureRuntimeDirectories();
const database = new DatabaseSync(databasePath());
try {
  migrateDatabase(database, { assertDestructiveMigrationCheckpoint });
  console.log(`Migrations applied to ${databasePath()}`);
} finally {
  database.close();
}
