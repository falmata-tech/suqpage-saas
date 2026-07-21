import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-operations-"));
const env = {
  ...process.env,
  SUQPAGE_DB_PATH: path.join(root, "data", "app.db"),
  SUQPAGE_MEDIA_ROOT: path.join(root, "data", "media"),
  SUQPAGE_BACKUP_ROOT: path.join(root, "backups"),
  SUQPAGE_CREDENTIAL_PATH: path.join(root, "credentials.txt"),
  PRIVACY_SALT: "operations-test-privacy-salt-long-enough",
};
const tsx = ["node_modules/tsx/dist/cli.mjs"];
function run(script, args = []) {
  const result = spawnSync(process.execPath, [...tsx, script, ...args], { cwd: process.cwd(), env, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${script} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

try {
  run("scripts/setup.ts", ["--reset"]);
  run("scripts/migrate.ts");
  fs.mkdirSync(env.SUQPAGE_MEDIA_ROOT, { recursive: true });
  fs.writeFileSync(path.join(env.SUQPAGE_MEDIA_ROOT, "restore-proof.txt"), "media restore proof");
  run("scripts/backup.ts");
  const backup = path.join(env.SUQPAGE_BACKUP_ROOT, fs.readdirSync(env.SUQPAGE_BACKUP_ROOT).sort().at(-1));

  let db = new DatabaseSync(env.SUQPAGE_DB_PATH);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM businesses").get().count, 4);
  db.exec("DELETE FROM businesses");
  db.close();
  fs.rmSync(env.SUQPAGE_MEDIA_ROOT, { recursive: true, force: true });

  run("scripts/restore.ts", [`--from=${backup}`]);
  db = new DatabaseSync(env.SUQPAGE_DB_PATH, { readOnly: true });
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM businesses").get().count, 4);
  db.close();
  assert.equal(fs.readFileSync(path.join(env.SUQPAGE_MEDIA_ROOT, "restore-proof.txt"), "utf8"), "media restore proof");
  console.log("Migration, database integrity, backup, and restore tests passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
