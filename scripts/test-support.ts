import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SessionUser } from "../lib/types";

const publicSupportRouteSource = fs.readFileSync(path.join(process.cwd(), "app/api/public-support/route.ts"), "utf8");
const publicAttachmentRouteSource = fs.readFileSync(path.join(process.cwd(), "app/api/public-support/attachments/[attachmentId]/route.ts"), "utf8");
const authenticatedAttachmentRouteSource = fs.readFileSync(path.join(process.cwd(), "app/api/support/[conversationId]/attachments/[attachmentId]/route.ts"), "utf8");
const publicSupportUiSource = fs.readFileSync(path.join(process.cwd(), "components/PublicSupportChat.tsx"), "utf8");
const supportRefreshSource = fs.readFileSync(path.join(process.cwd(), "components/SupportThreadRefresh.tsx"), "utf8");
assert.match(publicSupportRouteSource, /await staged\?\.discard\(\)\.catch/, "failed public writes clean staged support objects");
assert.match(publicSupportRouteSource, /if \(result\.duplicate\) await staged\?\.discard\(\)/, "idempotent public retries clean duplicate staged objects");
assert.ok(publicAttachmentRouteSource.indexOf("await getPublicSupportAttachment") < publicAttachmentRouteSource.indexOf("await readSupportAttachment"), "public token authorization precedes private storage reads");
assert.ok(authenticatedAttachmentRouteSource.indexOf("await getSupportAttachment") < authenticatedAttachmentRouteSource.indexOf("await readSupportAttachment"), "tenant/staff authorization precedes private storage reads");
assert.match(publicSupportUiSource, /if \(!document\.hidden\) void loadConversation\(\)/, "public support pauses polling while its browser document is hidden");
assert.match(supportRefreshSource, /if \(!document\.hidden\) router\.refresh\(\)/, "staff support pauses route refresh while its browser document is hidden");

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-support-"));
  process.env.MIRTPAGE_DB_PATH = path.join(root, "test.db");
  process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
  delete process.env.MIRTPAGE_TELEGRAM_BOT_TOKEN;
  delete process.env.MIRTPAGE_TELEGRAM_SUPPORT_CHAT_ID;
  const { closeDbForTests, getDb } = await import("../lib/db");
  const {
    claimSupportConversation,
    closePublicSupportConversation,
    closeSupportConversation,
    createPublicSupportConversation,
    createSupportConversation,
    getPublicSupportConversation,
    getPublicSupportAttachment,
    getSupportConversation,
    getSupportAttachment,
    getSupportAgentSummary,
    listSupportAgentWorkloads,
    listSupportAgentWorkloadsPage,
    postSupportMessage,
    postPublicSupportMessage,
    reassignSupportConversation,
    reopenSupportConversation,
    SupportError,
    updateSupportAgentSetting,
  } = await import("../lib/support");
  const { readSupportAttachment, stageSupportAttachment } = await import("../lib/support-media");
  const db = getDb();
  assert.ok(db.prepare("SELECT 1 FROM schema_migrations WHERE version=36").get(), "migration 36 installs private support attachments");
  const stagedImage = await stageSupportAttachment(new File(
    [fs.readFileSync(path.join(process.cwd(), "public/pwa/favicon-32.png"))],
    "sample.png",
    { type: "image/png" },
  ));
  assert.equal(stagedImage?.mimeType, "image/png", "support images are decoded and sanitized before private storage");
  await stagedImage?.discard();
  const businessA = Number(db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('support-a','Support A','composition','active')").run().lastInsertRowid);
  const businessB = Number(db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('support-b','Support B','composition','active')").run().lastInsertRowid);
  const addUser = db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,?,?,?,?,0)");
  const makeUser = (email: string, name: string, role: "admin" | "owner", businessId: number | null) =>
    Number(addUser.run(email, "x", name, role, businessId).lastInsertRowid);
  const clientAId = makeUser("client-a@example.test", "Client A", "owner", businessA);
  const clientBId = makeUser("client-b@example.test", "Client B", "owner", businessB);
  const agentOneId = makeUser("agent-1@example.test", "Agent One", "admin", null);
  const agentTwoId = makeUser("agent-2@example.test", "Agent Two", "admin", null);
  const operationsId = makeUser("operations@example.test", "Operations", "admin", null);
  const addRole = db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)");
  addRole.run(clientAId, "client");
  addRole.run(clientBId, "client");
  addRole.run(agentOneId, "team_member");
  addRole.run(agentTwoId, "team_member");
  addRole.run(operationsId, "operations_manager");
  const user = (id: number, access_role: SessionUser["access_role"], business_id: number | null, name: string): SessionUser => ({
    id, email: `${id}@example.test`, name, role: access_role === "client" ? "owner" : "admin", access_role, business_id, must_change_password: 0,
  });
  const clientA = user(clientAId, "client", businessA, "Client A");
  const clientB = user(clientBId, "client", businessB, "Client B");
  const agentOne = user(agentOneId, "team_member", null, "Agent One");
  const agentTwo = user(agentTwoId, "team_member", null, "Agent Two");
  const operations = user(operationsId, "operations_manager", null, "Operations");
  const { getDashboardAttention } = await import("../lib/dashboard-attention");
  await updateSupportAgentSetting(operations, { userId: agentOneId, enabled: true, maxOpenConversations: 1 });
  await updateSupportAgentSetting(operations, { userId: agentTwoId, enabled: true, maxOpenConversations: 2 });

  const create = (client: SessionUser, index: number) => createSupportConversation(client, {
    subject: `Support subject ${index}`,
    message: `Support message ${index}`,
    idempotencyKey: `support-create-${String(index).padStart(4, "0")}`,
  }, Date.now() + index);
  const first = await create(clientA, 1);
  const second = await create(clientB, 2);
  const third = await create(clientA, 3);
  const fourth = await create(clientB, 4);
  assert.equal((await getDashboardAttention(operations)).supportReplies, 4, "operations sees waiting and client-authored unread support");
  assert.equal((await getDashboardAttention(agentOne)).supportReplies, 2, "an agent sees assigned unread work plus the shared waiting queue");
  assert.equal((await getDashboardAttention(clientA, businessA)).supportReplies, 0, "a client does not see their own opening messages as unread replies");
  assert.equal((await getSupportConversation(operations, first.id)).conversation.assignedUserId, agentOneId);
  assert.equal((await getSupportConversation(operations, second.id)).conversation.assignedUserId, agentTwoId);
  assert.equal((await getSupportConversation(operations, third.id)).conversation.assignedUserId, agentTwoId);
  assert.equal((await getSupportConversation(operations, fourth.id)).conversation.status, "waiting");
  await assert.rejects(
    () => updateSupportAgentSetting(operations, {
      userId: agentTwoId,
      enabled: true,
      maxOpenConversations: 1,
    }),
    SupportError,
  );
  await assert.rejects(
    () => updateSupportAgentSetting(operations, {
      userId: agentOneId,
      enabled: false,
      maxOpenConversations: 1,
    }),
    SupportError,
  );
  await assert.rejects(() => getSupportConversation(clientA, second.id), SupportError);
  await assert.rejects(
    () => postSupportMessage(clientA, second.id, {
      message: "This cross-tenant reply must not be saved.",
      idempotencyKey: "support-denied-0001",
    }),
    SupportError,
  );
  await assert.rejects(() => claimSupportConversation(agentOne, fourth.id), SupportError);
  await assert.rejects(() => claimSupportConversation(agentTwo, fourth.id), SupportError);

  await postSupportMessage(agentOne, first.id, {
    message: "We are reviewing this request.",
    idempotencyKey: "support-reply-0001",
  });
  await closeSupportConversation(agentOne, first.id);
  await claimSupportConversation(agentOne, fourth.id);
  assert.equal((await getSupportConversation(clientB, fourth.id)).conversation.status, "open");
  await closeSupportConversation(agentOne, fourth.id);
  await reopenSupportConversation(clientB, fourth.id);
  assert.equal((await getSupportConversation(operations, fourth.id)).conversation.assignedUserId, agentOneId);
  await reassignSupportConversation(operations, fourth.id, null);
  assert.equal((await getSupportConversation(operations, fourth.id)).conversation.status, "waiting");
  const fifth = await create(clientA, 5);
  assert.equal((await getSupportConversation(operations, fifth.id)).conversation.assignedUserId, agentOneId);
  assert.deepEqual(
    (await listSupportAgentWorkloads(operations)).filter((agent) => agent.enabled).map((agent) => agent.openConversations).sort(),
    [1, 2],
  );
  assert.equal((await listSupportAgentWorkloadsPage(operations, { status:"enabled" })).totalItems,2);
  assert.equal((await listSupportAgentWorkloadsPage(operations, {})).pageSize,5);
  assert.equal((await listSupportAgentWorkloadsPage(operations, { q:"Agent One" })).items[0]?.userId,agentOneId);
  assert.equal((await listSupportAgentWorkloadsPage(operations, { status:"disabled" })).totalItems,1);
  assert.deepEqual(await getSupportAgentSummary(operations),{
    totalAgents:3,
    enabledAgents:2,
    availableAgents:0,
    fullAgents:2,
    openAssignments:3,
    waitingConversations:1,
  });
  assert.equal((db.prepare("SELECT COUNT(*) total FROM support_assignments").get() as { total: number }).total, 6);
  assert.ok((db.prepare("SELECT COUNT(*) total FROM support_events").get() as { total: number }).total >= 16);
  const visitorNow = Date.now() + 20_000;
  const visitorCountBeforeInvalid = Number((db.prepare("SELECT COUNT(*) total FROM support_conversations WHERE participant_kind='visitor'").get() as { total: number }).total);
  await assert.rejects(() => createPublicSupportConversation({
    category: "sourcing",
    email: "invalid",
    phone: "+251911223344",
    message: "This invalid request must not be stored.",
    idempotencyKey: "public-support-invalid-0001",
  }, "visitor-ip-invalid", visitorNow), (error: unknown) => error instanceof SupportError && error.code === "email_required");
  await assert.rejects(() => createPublicSupportConversation({
    category: "sourcing",
    email: "visitor@example.test",
    phone: "12",
    message: "This invalid request must not be stored.",
    idempotencyKey: "public-support-invalid-0002",
  }, "visitor-ip-invalid", visitorNow), (error: unknown) => error instanceof SupportError && error.code === "phone_required");
  assert.equal(Number((db.prepare("SELECT COUNT(*) total FROM support_conversations WHERE participant_kind='visitor'").get() as { total: number }).total), visitorCountBeforeInvalid, "invalid visitor contacts create no support row");
  const visitor = await createPublicSupportConversation({
    category: "sourcing",
    email: "Visitor@Example.Test",
    phone: "+251 (911) 223-344",
    message: "Help me identify a suitable local workshop.",
    idempotencyKey: "public-support-create-0001",
  }, "visitor-ip-one", visitorNow);
  const visitorThread = await getPublicSupportConversation(visitor.token, visitorNow + 1);
  assert.equal(visitorThread.category, "sourcing");
  assert.equal(visitorThread.messages[0]?.sender, "visitor");
  assert.equal("visitorEmail" in visitorThread, false, "the public thread projection does not echo private reconnect details");
  const storedVisitorContact = db.prepare("SELECT visitor_email,visitor_phone FROM support_conversations WHERE id=?").get(visitor.id) as { visitor_email: string; visitor_phone: string };
  assert.equal(storedVisitorContact.visitor_email, "visitor@example.test", "visitor email is normalized before persistence");
  assert.equal(storedVisitorContact.visitor_phone, "+251911223344", "visitor phone is normalized before persistence");
  await assert.rejects(() => getPublicSupportConversation(`${visitor.token}x`, visitorNow + 1), SupportError);
  await assert.rejects(() => getSupportConversation(clientA, visitor.id), SupportError);
  const staffVisitorView = await getSupportConversation(operations, visitor.id);
  assert.equal(staffVisitorView.conversation.participantKind, "visitor");
  assert.equal(staffVisitorView.conversation.businessId, null);
  assert.equal(staffVisitorView.conversation.visitorEmail, "visitor@example.test");
  assert.equal(staffVisitorView.conversation.visitorPhone, "+251911223344");
  const stagedPdf = await stageSupportAttachment(new File(
    ["%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"],
    "production requirements.pdf",
    { type: "application/pdf" },
  ));
  assert.ok(stagedPdf, "a valid PDF stages in private support storage");
  const visitorReply = await postPublicSupportMessage(visitor.token, {
    message: "The requirement is for a short production run.",
    idempotencyKey: "public-support-reply-0001",
    attachment: stagedPdf,
  }, "visitor-ip-one", visitorNow + 2);
  const attachmentRow = db.prepare("SELECT id FROM support_attachments WHERE message_id=?").get(visitorReply.id) as { id: number };
  assert.ok(attachmentRow.id, "the support attachment is linked to its message");
  const publicAttachment = await getPublicSupportAttachment(visitor.token, attachmentRow.id, visitorNow + 2);
  assert.equal(publicAttachment.original_name, "production requirements.pdf");
  assert.equal((await readSupportAttachment(publicAttachment.storage_key, publicAttachment.mime_type))?.contentType, "application/pdf");
  assert.equal((await getSupportAttachment(operations, visitor.id, attachmentRow.id)).original_name, "production requirements.pdf");
  await assert.rejects(() => getSupportAttachment(clientA, visitor.id, attachmentRow.id), SupportError);
  await assert.rejects(() => getPublicSupportAttachment(`${visitor.token}x`, attachmentRow.id, visitorNow + 2), SupportError);
  assert.equal((await getPublicSupportConversation(visitor.token, visitorNow + 2)).messages.at(-1)?.attachment?.id, attachmentRow.id);
  const duplicateStage = await stageSupportAttachment(new File(
    ["%PDF-1.7\nduplicate\n%%EOF"],
    "duplicate.pdf",
    { type: "application/pdf" },
  ));
  const duplicateVisitorReply = await postPublicSupportMessage(visitor.token, {
    message: "The requirement is for a short production run.",
    idempotencyKey: "public-support-reply-0001",
    attachment: duplicateStage,
  }, "visitor-ip-one", visitorNow + 3);
  assert.equal(visitorReply.duplicate, false);
  assert.equal(duplicateVisitorReply.duplicate, true);
  await duplicateStage?.discard();
  assert.equal(Number((db.prepare("SELECT COUNT(*) total FROM support_attachments WHERE message_id=?").get(visitorReply.id) as { total: number }).total), 1, "an idempotent retry does not create a second attachment row");
  await assert.rejects(
    () => stageSupportAttachment(new File(["not a real file"], "deceptive.pdf", { type: "application/pdf" })),
    /Only valid JPEG, PNG, WebP, and PDF/,
  );
  await postSupportMessage(operations, visitor.id, {
    message: "A team member will review the request.",
    idempotencyKey: "public-support-staff-0001",
  }, visitorNow + 4);
  assert.equal((await getPublicSupportConversation(visitor.token, visitorNow + 5)).messages.at(-1)?.sender, "staff");
  await assert.rejects(() => closePublicSupportConversation(`${visitor.token}x`, visitorNow + 6), SupportError);
  assert.equal((await closePublicSupportConversation(visitor.token, visitorNow + 6)).duplicate, false, "visitor can end the owned active chat");
  assert.equal((await closePublicSupportConversation(visitor.token, visitorNow + 7)).duplicate, true, "visitor close is idempotent");
  assert.equal((await getPublicSupportConversation(visitor.token, visitorNow + 8)).status, "closed");
  assert.equal(Number((db.prepare("SELECT COUNT(*) total FROM support_assignments WHERE conversation_id=? AND released_at IS NULL").get(visitor.id) as { total: number }).total), 0, "visitor close releases active staff assignment");
  await assert.rejects(() => postPublicSupportMessage(visitor.token, {
    message: "This reply must not reopen a closed conversation.",
    idempotencyKey: "public-support-closed-0001",
  }, "visitor-ip-one", visitorNow + 9), (error: unknown) => error instanceof SupportError && error.code === "closed");
  await assert.rejects(() => getPublicSupportConversation(visitor.token, visitor.expiresAt + 1), SupportError);
  assert.equal((db.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);
  closeDbForTests();
  fs.rmSync(root, { recursive: true, force: true });
  console.log("Support tenant scope, visitor contact validation, anonymous token isolation, least-loaded assignment, capacity, messaging, expiry, close, reopen, and reassignment passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
