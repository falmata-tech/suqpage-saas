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
  fs.mkdirSync(path.join(env.SUQPAGE_MEDIA_ROOT, "requests"), { recursive: true });
  const requestStorageKey = "11111111-1111-4111-8111-111111111111.png";
  fs.writeFileSync(path.join(env.SUQPAGE_MEDIA_ROOT, "requests", requestStorageKey), "private request attachment");
  let db = new DatabaseSync(env.SUQPAGE_DB_PATH);
  const owner = db.prepare("SELECT id,business_id FROM users WHERE role='owner' ORDER BY id LIMIT 1").get();
  const requestId = Number(db.prepare("INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id,idempotency_key,ip_hash) VALUES('REQ-BACKUP000001',?,?,'change','submitted','Backup Client','private@example.test','Backup Business','Please preserve this private authenticated request during backup and restore.','client',?,'operations-backup-key','private-hash')").run(owner.business_id,owner.id,owner.id).lastInsertRowid);
  db.prepare("INSERT INTO request_attachments(request_id,storage_key,original_name,mime_type,byte_size,width,height) VALUES(?,?,?,?,?,?,?)").run(requestId,requestStorageKey,"private.png","image/png",26,1,1);
  db.prepare("INSERT INTO request_events(request_id,event_type,detail) VALUES(?,'submitted','authenticated client request')").run(requestId);
  db.close();
  run("scripts/backup.ts");
  const backup = path.join(env.SUQPAGE_BACKUP_ROOT, fs.readdirSync(env.SUQPAGE_BACKUP_ROOT).sort().at(-1));

  db = new DatabaseSync(env.SUQPAGE_DB_PATH);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM businesses").get().count, 4);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM service_requests").get().count, 1);
  db.exec("DELETE FROM businesses");
  db.close();
  fs.rmSync(env.SUQPAGE_MEDIA_ROOT, { recursive: true, force: true });

  run("scripts/restore.ts", [`--from=${backup}`]);
  db = new DatabaseSync(env.SUQPAGE_DB_PATH, { readOnly: true });
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM businesses").get().count, 4);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM service_requests").get().count, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM request_attachments").get().count, 1);
  db.close();
  assert.equal(fs.readFileSync(path.join(env.SUQPAGE_MEDIA_ROOT, "restore-proof.txt"), "utf8"), "media restore proof");
  assert.equal(fs.readFileSync(path.join(env.SUQPAGE_MEDIA_ROOT, "requests", requestStorageKey), "utf8"), "private request attachment");
  console.log("Migration, database integrity, request attachment backup, and restore tests passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
