import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { databasePath, mediaRoot } from "../lib/config";

const sourceArg = process.argv.find((arg) => arg.startsWith("--from="));
if (!sourceArg) throw new Error("Use npm run restore -- --from=/absolute/path/to/backup");
const source = path.resolve(sourceArg.slice(7));
const sourceDb = path.join(source, "suqpage.db");
if (!fs.existsSync(sourceDb)) throw new Error("Backup database not found.");

const validation = new DatabaseSync(sourceDb, { readOnly: true });
const integrity = validation.prepare("PRAGMA integrity_check").get() as Record<string, string>;
validation.close();
if (!Object.values(integrity).includes("ok")) {
  throw new Error(`Backup database failed integrity validation: ${JSON.stringify(integrity)}`);
}

fs.mkdirSync(path.dirname(databasePath()), { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) {
  const target = `${databasePath()}${suffix}`;
  if (fs.existsSync(target)) fs.rmSync(target);
}
fs.copyFileSync(sourceDb, databasePath());
try { fs.chmodSync(databasePath(), 0o600); } catch {}

const sourceMedia = path.join(source, "media");
if (fs.existsSync(mediaRoot())) fs.rmSync(mediaRoot(), { recursive: true, force: true });
if (fs.existsSync(sourceMedia)) fs.cpSync(sourceMedia, mediaRoot(), { recursive: true });
console.log(`Restored and verified backup from ${source}`);
