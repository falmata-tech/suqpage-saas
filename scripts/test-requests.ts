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
  const { canManageBusiness, canViewBusiness } = await import("../lib/capabilities");
  const { createAuthenticatedClientRequest } = await import("../lib/client-request-service");
  const { createClientInvitation, getActiveInvitation, hashInvitationToken, InvitationError, redeemClientInvitation } = await import("../lib/invitations");
  const { canAccessRequest, listClientRequests } = await import("../lib/request-sqlite");
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

    const firstToken = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const secondToken = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    const invitation = createClientInvitation({ requestId:first.id, clientName:"Amina Client", email:"amina@example.test", businessName:"Amina Market", handle:"amina-market", designKey:"homevibe", actorUserId:adminId }, { now:1_000_000, token:firstToken });
    assert.equal(getActiveInvitation(firstToken,1_000_001)?.business_name,"Amina Market");
    const storedInvitation = getDb().prepare("SELECT token_hash FROM client_invitations WHERE id=?").get(invitation.invitationId) as {token_hash:string};
    assert.equal(storedInvitation.token_hash,hashInvitationToken(firstToken));
    assert.notEqual(storedInvitation.token_hash,firstToken);
    createClientInvitation({ requestId:first.id, clientName:"Amina Client", email:"amina@example.test", businessName:"Amina Market", handle:"amina-market", designKey:"homevibe", actorUserId:adminId }, { now:1_000_100, token:secondToken });
    assert.equal(getActiveInvitation(firstToken,1_000_101),undefined);
    assert.ok(getActiveInvitation(secondToken,1_000_101));
    const redeemed = redeemClientInvitation({token:secondToken,name:"Amina Client",password:"ClientPassword123!"},1_000_200);
    const client = getDb().prepare(`SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,p.access_role FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=?`).get(redeemed.userId) as any;
    assert.equal(client.access_role,"client");
    assert.equal(client.must_change_password,0);
    assert.equal(canViewBusiness(client,redeemed.businessId),true);
    assert.equal(canManageBusiness(client,redeemed.businessId),false);
    assert.throws(()=>redeemClientInvitation({token:secondToken,name:"Amina Client",password:"ClientPassword123!"},1_000_201),InvitationError);
    assert.equal((getDb().prepare("SELECT COUNT(*) count FROM users WHERE lower(email)='amina@example.test'").get() as {count:number}).count,1);

    const clientForm = new FormData();
    clientForm.set("requestType","change");
    clientForm.set("requestText","Please replace the hero image and add the new summer collection.");
    clientForm.set("idempotencyKey","client_request_key_123456");
    clientForm.append("images",new File([new Uint8Array(png)],"summer-reference.png",{type:"image/png"}));
    const clientRequest = await createAuthenticatedClientRequest(client,clientForm);
    const clientDetail = getRequestDetail(clientRequest.id)!;
    assert.equal(clientDetail.attachments.length,1);
    assert.equal(canAccessRequest(client,clientDetail),true);
    assert.equal(listClientRequests(client).some((request)=>request.id===clientRequest.id),true);
    const otherClient = {...client,id:client.id+100,business_id:redeemed.businessId+100};
    assert.equal(canAccessRequest(otherClient,clientDetail),false);
    const sameBusinessOtherClient = {...client,id:client.id+101};
    assert.equal(canAccessRequest(sameBusinessOtherClient,clientDetail),false);
    assert.equal(listClientRequests(sameBusinessOtherClient).some((request)=>request.id===clientRequest.id),false);
    const repeatedClientRequest = await createAuthenticatedClientRequest(client,clientForm);
    assert.equal(repeatedClientRequest.id,clientRequest.id);
    assert.equal(repeatedClientRequest.duplicate,true);

    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "short" }, "ip-b", { repository, rateLimiter: allowedRate }), RequestError);
    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "request_test_key_223456", requestText: "x".repeat(2_001) }, "ip-b2", { repository, rateLimiter: allowedRate }), RequestError);
    const deniedRate = { consume: () => ({ allowed: false, retryAfterSeconds: 300 }) };
    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "request_test_key_456789" }, "ip-e", { repository, rateLimiter: deniedRate }), (error: unknown) => error instanceof RequestError && error.status === 429 && error.retryAfter === 300);

    const migrations = getDb().prepare("SELECT version FROM schema_migrations ORDER BY version").all() as Array<{ version: number }>;
    assert.deepEqual(migrations.map((migration) => migration.version), [1, 2, 3, 4]);
    console.log("Managed request integration tests passed.");
  } finally {
    closeDbForTests();
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
