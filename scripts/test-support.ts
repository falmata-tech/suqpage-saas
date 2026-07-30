import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SessionUser } from "../lib/types";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-support-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "test.db");
  process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
  delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;
  delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
  const { closeDbForTests, getDb } = await import("../lib/db");
  const {
    claimSupportConversation,
    closeSupportConversation,
    createSupportConversation,
    getSupportConversation,
    listSupportAgentWorkloads,
    postSupportMessage,
    reassignSupportConversation,
    reopenSupportConversation,
    SupportError,
    updateSupportAgentSetting,
  } = await import("../lib/support");
  const db = getDb();
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
  updateSupportAgentSetting(operations, { userId: agentOneId, enabled: true, maxOpenConversations: 1 });
  updateSupportAgentSetting(operations, { userId: agentTwoId, enabled: true, maxOpenConversations: 2 });

  const create = (client: SessionUser, index: number) => createSupportConversation(client, {
    subject: `Support subject ${index}`,
    message: `Support message ${index}`,
    idempotencyKey: `support-create-${String(index).padStart(4, "0")}`,
  }, Date.now() + index);
  const first = await create(clientA, 1);
  const second = await create(clientB, 2);
  const third = await create(clientA, 3);
  const fourth = await create(clientB, 4);
  assert.equal(getSupportConversation(operations, first.id).conversation.assignedUserId, agentOneId);
  assert.equal(getSupportConversation(operations, second.id).conversation.assignedUserId, agentTwoId);
  assert.equal(getSupportConversation(operations, third.id).conversation.assignedUserId, agentTwoId);
  assert.equal(getSupportConversation(operations, fourth.id).conversation.status, "waiting");
  assert.throws(
    () => updateSupportAgentSetting(operations, {
      userId: agentTwoId,
      enabled: true,
      maxOpenConversations: 1,
    }),
    SupportError,
  );
  assert.throws(
    () => updateSupportAgentSetting(operations, {
      userId: agentOneId,
      enabled: false,
      maxOpenConversations: 1,
    }),
    SupportError,
  );
  assert.throws(() => getSupportConversation(clientA, second.id), SupportError);
  assert.throws(
    () => postSupportMessage(clientA, second.id, {
      message: "This cross-tenant reply must not be saved.",
      idempotencyKey: "support-denied-0001",
    }),
    SupportError,
  );
  assert.throws(() => claimSupportConversation(agentOne, fourth.id), SupportError);
  assert.throws(() => claimSupportConversation(agentTwo, fourth.id), SupportError);

  postSupportMessage(agentOne, first.id, {
    message: "We are reviewing this request.",
    idempotencyKey: "support-reply-0001",
  });
  closeSupportConversation(agentOne, first.id);
  claimSupportConversation(agentOne, fourth.id);
  assert.equal(getSupportConversation(clientB, fourth.id).conversation.status, "open");
  closeSupportConversation(agentOne, fourth.id);
  reopenSupportConversation(clientB, fourth.id);
  assert.equal(getSupportConversation(operations, fourth.id).conversation.assignedUserId, agentOneId);
  reassignSupportConversation(operations, fourth.id, null);
  assert.equal(getSupportConversation(operations, fourth.id).conversation.status, "waiting");
  const fifth = await create(clientA, 5);
  assert.equal(getSupportConversation(operations, fifth.id).conversation.assignedUserId, agentOneId);
  assert.deepEqual(
    listSupportAgentWorkloads(operations).filter((agent) => agent.enabled).map((agent) => agent.openConversations).sort(),
    [1, 2],
  );
  assert.equal((db.prepare("SELECT COUNT(*) total FROM support_assignments").get() as { total: number }).total, 6);
  assert.ok((db.prepare("SELECT COUNT(*) total FROM support_events").get() as { total: number }).total >= 16);
  assert.equal((db.prepare("PRAGMA foreign_key_check").all() as unknown[]).length, 0);
  closeDbForTests();
  fs.rmSync(root, { recursive: true, force: true });
  console.log("Support tenant scope, least-loaded assignment, capacity, queue, messaging, claim, close, reopen, and reassignment passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
