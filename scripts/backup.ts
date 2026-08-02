import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { backupRoot, databasePath, mediaRoot } from "../lib/config";

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.resolve(
  backupRoot(),
  stamp,
);
fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
if (!fs.existsSync(databasePath())) {
  throw new Error("Database not found. Nothing can be backed up.");
}
const source = new DatabaseSync(databasePath());
const integrity = source.prepare("PRAGMA integrity_check").get() as Record<
  string,
  string
>;
if (!Object.values(integrity).includes("ok")) {
  source.close();
  throw new Error("Database integrity check failed. Backup was not created.");
}
const foreignKeyFailures = source.prepare("PRAGMA foreign_key_check").all();
if (foreignKeyFailures.length) {
  source.close();
  throw new Error("Database foreign-key check failed. Backup was not created.");
}
source.exec("PRAGMA wal_checkpoint(FULL)");
source.close();
const databaseBackup = path.join(destination, "mirtpage.db");
fs.copyFileSync(databasePath(), databaseBackup);
try { fs.chmodSync(databaseBackup, 0o600); } catch {}
const databaseBytes = fs.statSync(databaseBackup).size;
const databaseSha256 = crypto
  .createHash("sha256")
  .update(fs.readFileSync(databaseBackup))
  .digest("hex");
const copied = new DatabaseSync(databaseBackup, { readOnly: true });
const copiedIntegrity = copied.prepare("PRAGMA integrity_check").get() as Record<
  string,
  string
>;
const copiedForeignKeys = copied.prepare("PRAGMA foreign_key_check").all();
copied.close();
if (
  !Object.values(copiedIntegrity).includes("ok") ||
  copiedForeignKeys.length
) {
  throw new Error("Copied database failed backup verification.");
}
if (fs.existsSync(mediaRoot())) {
  fs.cpSync(mediaRoot(), path.join(destination, "media"), { recursive: true });
}
const manifest = path.join(destination, "backup.json");
fs.writeFileSync(
  manifest,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      sourceDatabase: databasePath(),
      media: mediaRoot(),
      integrity: "ok",
      foreignKeyFailures: 0,
      databaseBytes,
      databaseSha256,
    },
    null,
    2,
  ),
  { mode: 0o600 },
);
console.log(`Backup created: ${destination}`);
