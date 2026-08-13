import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-operations-"));
const env = {
  ...process.env,
  MIRTPAGE_DB_PATH: path.join(root, "data", "app.db"),
  MIRTPAGE_MEDIA_ROOT: path.join(root, "data", "media"),
  MIRTPAGE_BACKUP_ROOT: path.join(root, "backups"),
  MIRTPAGE_CREDENTIAL_PATH: path.join(root, "credentials.txt"),
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
  let db = new DatabaseSync(env.MIRTPAGE_DB_PATH);
  const preCutover = {
    businesses: db.prepare("SELECT COUNT(*) count FROM businesses").get().count,
    products: db.prepare("SELECT COUNT(*) count FROM products").get().count,
    clients: db.prepare("SELECT COUNT(*) count FROM users WHERE role='owner'").get().count,
    requests: db.prepare("SELECT COUNT(*) count FROM service_requests").get().count,
    revisions: db.prepare("SELECT COUNT(*) count FROM content_revisions").get().count,
  };
  db.exec(`
    PRAGMA foreign_keys=OFF;
    DROP TABLE support_events;
    DROP TABLE support_assignments;
    DROP TABLE support_messages;
    DROP TABLE support_conversations;
    DROP TABLE support_agent_settings;
    DROP TABLE showroom_visits;
    DROP TABLE subscription_payments;
    DROP TABLE business_subscriptions;
    DROP TRIGGER IF EXISTS business_subscription_after_insert;
    DELETE FROM schema_migrations WHERE version IN (21,22);
    PRAGMA foreign_keys=ON;
  `);
  db.close();
  run("scripts/migrate.ts");
  db = new DatabaseSync(env.MIRTPAGE_DB_PATH);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM businesses").get().count,preCutover.businesses);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM products").get().count,preCutover.products);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM user_access_profiles WHERE access_role='client'").get().count,preCutover.clients);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM businesses WHERE design_key='composition' AND design_manifest_json!=''").get().count,preCutover.businesses);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version IN (21,22)").get().count,2);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM business_subscriptions").get().count,preCutover.businesses);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM support_conversations").get().count,0);
  assert.equal(db.prepare("PRAGMA foreign_key_check").all().length,0);
  db.close();
  fs.mkdirSync(env.MIRTPAGE_MEDIA_ROOT, { recursive: true });
  fs.writeFileSync(path.join(env.MIRTPAGE_MEDIA_ROOT, "restore-proof.txt"), "media restore proof");
  fs.mkdirSync(path.join(env.MIRTPAGE_MEDIA_ROOT, "requests"), { recursive: true });
  const requestStorageKey = "11111111-1111-4111-8111-111111111111.png";
  fs.writeFileSync(path.join(env.MIRTPAGE_MEDIA_ROOT, "requests", requestStorageKey), "private request attachment");
  db = new DatabaseSync(env.MIRTPAGE_DB_PATH);
  const owner = db.prepare(`
    SELECT u.id,u.business_id
    FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id
    WHERE p.access_role='client'
      AND u.business_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM service_requests request
        WHERE request.business_id=u.business_id
          AND request.status IN (
            'submitted','under_review','needs_information','approved_for_work',
            'in_progress','client_review','client_approved'
          )
      )
    ORDER BY u.id
    LIMIT 1
  `).get();
  assert.ok(owner, "operations backup fixture requires a client without an active showroom project");
  const admin = db.prepare("SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='platform_admin' LIMIT 1").get();
  db.prepare("INSERT INTO client_invitations(request_id,business_id,email,name,token_hash,expires_at,created_by_user_id,created_at) VALUES(NULL,?,'backup-invite@example.test','Backup Invite','backup-invitation-hash',?,?,?)").run(owner.business_id,Date.now()+60_000,admin.id,Date.now());
  const requestId = Number(db.prepare("INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id,idempotency_key,ip_hash) VALUES('REQ-BACKUP000001',?,?,'change','submitted','Backup Client','private@example.test','Backup Business','Please preserve this private authenticated request during backup and restore.','client',?,'operations-backup-key','private-hash')").run(owner.business_id,owner.id,owner.id).lastInsertRowid);
  const requestAttachmentId = Number(db.prepare("INSERT INTO request_attachments(request_id,storage_key,original_name,mime_type,byte_size,width,height) VALUES(?,?,?,?,?,?,?)").run(requestId,requestStorageKey,"private.png","image/png",26,1,1).lastInsertRowid);
  db.prepare("INSERT INTO recipe_media_assets(request_id,asset_key,kind,label,request_attachment_id,rights_acknowledged,added_by_user_id) VALUES(?,'asset_11111111111111111111','image','Backup recipe image',?,1,?)").run(requestId,requestAttachmentId,admin.id);
  db.prepare("INSERT INTO request_events(request_id,event_type,detail) VALUES(?,'submitted','authenticated client request')").run(requestId);
  const designManifest = JSON.parse(db.prepare("SELECT design_manifest_json FROM businesses WHERE id=?").get(owner.business_id).design_manifest_json);
  const revisionSnapshot = JSON.stringify({ schemaVersion:2, business:{name:"Backup Business",designKey:"composition",tagline:"",description:"",logoRef:"",heroTitle:"Backup preview",heroSubtitle:"",heroImageRef:"",contactEmail:"",whatsapp:"",telegram:"",tiktok:"",siteTitle:"Backup Business",siteDescription:"",faviconRef:""}, designManifest, collections:[], categories:[], products:[] });
  const revisionId = Number(db.prepare("INSERT INTO content_revisions(request_id,business_id,revision_number,base_content_version,status,snapshot_json,summary,created_by_user_id,submitted_at) VALUES(?,?,1,1,'awaiting_review',?,'Backup revision',?,CURRENT_TIMESTAMP)").run(requestId,owner.business_id,revisionSnapshot,owner.id).lastInsertRowid);
  db.prepare("UPDATE published_catalog_versions SET source_revision_id=?,actor_user_id=? WHERE business_id=? AND content_version=1").run(revisionId,owner.id,owner.business_id);
  const retainedVersionCount = db.prepare("SELECT COUNT(*) count FROM published_catalog_versions").get().count;
  const expectedRequestCount = preCutover.requests + 1;
  const expectedRevisionCount = preCutover.revisions + 1;
  db.close();
  run("scripts/backup.ts");
  const backup = path.join(env.MIRTPAGE_BACKUP_ROOT, fs.readdirSync(env.MIRTPAGE_BACKUP_ROOT).sort().at(-1));

  db = new DatabaseSync(env.MIRTPAGE_DB_PATH);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM businesses").get().count, preCutover.businesses);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM service_requests").get().count, expectedRequestCount);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM content_revisions").get().count, expectedRevisionCount);
  db.exec("DELETE FROM businesses");
  db.close();
  fs.rmSync(env.MIRTPAGE_MEDIA_ROOT, { recursive: true, force: true });

  run("scripts/restore.ts", [`--from=${backup}`]);
  db = new DatabaseSync(env.MIRTPAGE_DB_PATH, { readOnly: true });
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM businesses").get().count, preCutover.businesses);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM service_requests").get().count, expectedRequestCount);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM request_attachments").get().count, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM recipe_media_assets").get().count, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM content_revisions").get().count, expectedRevisionCount);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM published_catalog_versions").get().count, retainedVersionCount);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM business_subscriptions").get().count, preCutover.businesses);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM schema_migrations WHERE version IN (21,22)").get().count, 2);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM client_invitations WHERE request_id IS NULL AND token_hash='backup-invitation-hash'").get().count, 1);
  db.close();
  assert.equal(fs.readFileSync(path.join(env.MIRTPAGE_MEDIA_ROOT, "restore-proof.txt"), "utf8"), "media restore proof");
  assert.equal(fs.readFileSync(path.join(env.MIRTPAGE_MEDIA_ROOT, "requests", requestStorageKey), "utf8"), "private request attachment");
  console.log("Migration, database integrity, request attachment/revision backup, and restore tests passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
