import fs from "node:fs";
import path from "node:path";
import { databasePath, mediaRoot } from "../lib/config";
import { getDb } from "../lib/db";

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.resolve(
  process.env.SUQPAGE_BACKUP_ROOT || path.join(process.cwd(), "backups"),
  stamp,
);
fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
getDb().exec("PRAGMA wal_checkpoint(FULL)");
const databaseBackup = path.join(destination, "suqpage.db");
fs.copyFileSync(databasePath(), databaseBackup);
try { fs.chmodSync(databaseBackup, 0o600); } catch {}
if (fs.existsSync(mediaRoot())) {
  fs.cpSync(mediaRoot(), path.join(destination, "media"), { recursive: true });
}
const manifest = path.join(destination, "backup.json");
fs.writeFileSync(
  manifest,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      database: databasePath(),
      media: mediaRoot(),
    },
    null,
    2,
  ),
  { mode: 0o600 },
);
console.log(`Backup created: ${destination}`);
