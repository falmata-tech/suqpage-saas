import { databasePath } from "../lib/config";import { getDb } from "../lib/db";getDb().prepare("SELECT 1").get();console.log(`Migrations applied to ${databasePath()}`);
