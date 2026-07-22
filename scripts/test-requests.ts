import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-requests-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "requests.db");
  process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.PRIVACY_SALT = "request-test-privacy-salt-long-enough";

  const { getDb, closeDbForTests } = await import("../lib/db");
  const { FileRequestAttachmentStore, resolveRequestAttachment } = await import("../lib/request-media");
  const { SqliteRequestRepository, getRequestDetail, updateRequestStatus } = await import("../lib/request-sqlite");
  const { createPublicInterest } = await import("../lib/request-service");
  const { RequestError } = await import("../lib/request-domain");
  const repository = new SqliteRequestRepository();
  const attachments = new FileRequestAttachmentStore();
  const allowedRate = { consume: () => ({ allowed: true, retryAfterSeconds: 0 }) };
  const input = {
    contactName: "Amina Client",
    contactValue: "+251 911 000 000",
    businessName: "Amina Market",
    requestText: "Please build a warm showroom for my handmade products.",
    idempotencyKey: "request_test_key_123456",
    consent: true,
  };
  const png = await sharp({ create: { width: 3, height: 2, channels: 4, background: { r: 42, g: 90, b: 120, alpha: 1 } } }).png().toBuffer();
  const image = { originalName: "../private\u0000-reference.png", claimedType: "image/png", bytes: png };

  try {
    const adminId = Number(getDb().prepare("INSERT INTO users(email,password_hash,name,role) VALUES('request-admin@test.local','unused','Request Admin','admin')").run().lastInsertRowid);
    const first = await createPublicInterest(input, "ip-a", { repository, rateLimiter: allowedRate });
    assert.equal(first.duplicate, false);
    assert.match(first.publicRef, /^REQ-[A-F0-9]{12}$/);
    const detail = getRequestDetail(first.id);
    assert.ok(detail);
    assert.equal(detail.request_text, input.requestText);
    assert.equal(detail.attachments.length, 0);
    assert.equal(detail.events.length, 1);
    assert.equal(detail.events[0].event_type, "submitted");
    assert.equal(resolveRequestAttachment("../requests.db"), null);

    const duplicate = await createPublicInterest(input, "ip-a", { repository, rateLimiter: { consume: () => { throw new Error("duplicate must bypass rate limiting"); } } });
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.id, first.id);
    assert.equal((getDb().prepare("SELECT COUNT(*) count FROM service_requests").get() as { count: number }).count, 1);
    assert.equal((getDb().prepare("SELECT COUNT(*) count FROM request_attachments").get() as { count: number }).count, 0);
    assert.equal(fs.readdirSync(path.join(root, "media", "requests")).length, 0);
    assert.throws(() => getDb().prepare("INSERT INTO request_attachments(request_id,storage_key,original_name,mime_type,byte_size,width,height) VALUES(?,?,?,?,?,?,?)").run(first.id,"11111111-1111-4111-8111-111111111111.png","blocked.png","image/png",1,1,1), /public interest requests cannot have attachments/);

    const stored = await attachments.save(image);
    assert.equal(stored.originalName, "private-reference.png");
    const attachmentPath = resolveRequestAttachment(stored.storageKey);
    assert.ok(attachmentPath && fs.existsSync(attachmentPath));
    attachments.remove([stored.storageKey]);

    updateRequestStatus(first.id, "under_review", adminId);
    assert.equal(getRequestDetail(first.id)?.status, "under_review");
    assert.throws(() => updateRequestStatus(first.id, "published", adminId), RequestError);
    assert.equal(getRequestDetail(first.id)?.events.length, 2);

    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "short" }, "ip-b", { repository, rateLimiter: allowedRate }), RequestError);
    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "request_test_key_223456", requestText: "x".repeat(2_001) }, "ip-b2", { repository, rateLimiter: allowedRate }), RequestError);
    const deniedRate = { consume: () => ({ allowed: false, retryAfterSeconds: 300 }) };
    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "request_test_key_456789" }, "ip-e", { repository, rateLimiter: deniedRate }), (error: unknown) => error instanceof RequestError && error.status === 429 && error.retryAfter === 300);

    const migrations = getDb().prepare("SELECT version FROM schema_migrations ORDER BY version").all() as Array<{ version: number }>;
    assert.deepEqual(migrations.map((migration) => migration.version), [1, 2, 3]);
    console.log("Managed request integration tests passed.");
  } finally {
    closeDbForTests();
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
