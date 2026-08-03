import crypto from "node:crypto";
import { hasCapability } from "./capabilities";
import { getDb, inTransaction } from "./db";
import {
  likePattern,
  normalizePageRequest,
  pageResult,
  pageWindow,
  type PageResult,
} from "./pagination";
import { cleanText } from "./security";
import { notifySupportQueue } from "./support-notifications";
import type { SessionUser } from "./types";

export const MAX_OPEN_SUPPORT_CONVERSATIONS = 3;

export type SupportStatus = "waiting" | "open" | "closed";

export type SupportConversation = {
  id: number;
  publicRef: string;
  businessId: number;
  businessName: string;
  openedByUserId: number;
  subject: string;
  status: SupportStatus;
  assignedUserId: number | null;
  assignedUserName: string | null;
  lastMessageAt: number;
  createdAt: number;
  closedAt: number | null;
  unread: boolean;
};

export type SupportMessage = {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: number;
};

export type SupportAgentWorkload = {
  userId: number;
  name: string;
  email: string;
  enabled: boolean;
  maxOpenConversations: number;
  openConversations: number;
};

export type SupportAgentSummary = {
  totalAgents: number;
  enabledAgents: number;
  availableAgents: number;
  fullAgents: number;
  openAssignments: number;
  waitingConversations: number;
};

export class SupportError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

type ConversationRow = {
  id: number;
  public_ref: string;
  business_id: number;
  business_name: string;
  opened_by_user_id: number;
  subject: string;
  status: SupportStatus;
  assigned_user_id: number | null;
  assigned_user_name: string | null;
  client_last_read_message_id: number;
  staff_last_read_message_id: number;
  last_message_id: number;
  created_at: number;
  last_message_at: number;
  closed_at: number | null;
};

function conversationView(row: ConversationRow, user: SessionUser): SupportConversation {
  const lastRead = user.access_role === "client"
    ? row.client_last_read_message_id
    : row.staff_last_read_message_id;
  return {
    id: row.id,
    publicRef: row.public_ref,
    businessId: row.business_id,
    businessName: row.business_name,
    openedByUserId: row.opened_by_user_id,
    subject: row.subject,
    status: row.status,
    assignedUserId: row.assigned_user_id,
    assignedUserName: row.assigned_user_name,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    unread: row.last_message_id > lastRead,
  };
}

function baseSelect() {
  return `
    SELECT c.*,b.name business_name,assignee.name assigned_user_name,
      COALESCE((SELECT MAX(m.id) FROM support_messages m WHERE m.conversation_id=c.id),0) last_message_id
    FROM support_conversations c
    JOIN businesses b ON b.id=c.business_id
    LEFT JOIN users assignee ON assignee.id=c.assigned_user_id
  `;
}

function canRead(user: SessionUser, row: Pick<ConversationRow, "business_id" | "status" | "assigned_user_id">) {
  if (user.access_role === "client") return user.business_id === row.business_id;
  if (hasCapability(user, "operations:manage")) return true;
  if (user.access_role === "team_member") {
    return row.status === "waiting" || row.assigned_user_id === user.id;
  }
  return false;
}

function requireConversation(user: SessionUser, conversationId: number) {
  const row = getDb().prepare(`${baseSelect()} WHERE c.id=?`).get(conversationId) as ConversationRow | undefined;
  if (!row || !canRead(user, row)) {
    throw new SupportError("Support conversation was not found.", "not_found");
  }
  return row;
}

function idempotency(value: unknown) {
  const key = cleanText(value, 100);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(key)) {
    throw new SupportError("Message session is invalid. Refresh and try again.", "invalid_idempotency");
  }
  return key;
}

function supportAgentWorkload(userId: number) {
  return getDb().prepare(`
    SELECT s.enabled,s.max_open_conversations,
      (SELECT COUNT(*) FROM support_conversations c
       WHERE c.assigned_user_id=s.user_id AND c.status='open') open_count
    FROM support_agent_settings s WHERE s.user_id=?
  `).get(userId) as {
    enabled: number;
    max_open_conversations: number;
    open_count: number;
  } | undefined;
}

function leastLoadedAgent() {
  return getDb().prepare(`
    SELECT u.id,u.name,s.max_open_conversations,
      COUNT(c.id) open_count
    FROM support_agent_settings s
    JOIN users u ON u.id=s.user_id
    JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE s.enabled=1 AND p.access_role IN ('team_member','operations_manager')
    GROUP BY u.id,u.name,s.max_open_conversations
    HAVING COUNT(c.id)<s.max_open_conversations
    ORDER BY COUNT(c.id),u.id
    LIMIT 1
  `).get() as {
    id: number;
    name: string;
    max_open_conversations: number;
    open_count: number;
  } | undefined;
}

function assignConversation(
  conversationId: number,
  assignedUserId: number,
  assignedByUserId: number | null,
  reason: "automatic" | "claimed" | "reassigned" | "reopened",
  now: number,
) {
  getDb().prepare(`
    UPDATE support_assignments SET released_at=?
    WHERE conversation_id=? AND released_at IS NULL
  `).run(now, conversationId);
  getDb().prepare(`
    INSERT INTO support_assignments(
      conversation_id,assigned_user_id,assigned_by_user_id,reason,assigned_at
    ) VALUES(?,?,?,?,?)
  `).run(conversationId, assignedUserId, assignedByUserId, reason, now);
  getDb().prepare(`
    UPDATE support_conversations
    SET status='open',assigned_user_id=?,updated_at=?,closed_at=NULL
    WHERE id=?
  `).run(assignedUserId, now, conversationId);
  getDb().prepare(`
    INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
    VALUES(?,?,'assigned',?,?)
  `).run(conversationId, assignedByUserId, `agent:${assignedUserId};reason:${reason}`, now);
}

export async function createSupportConversation(
  user: SessionUser,
  input: { subject: unknown; message: unknown; idempotencyKey: unknown },
  now = Date.now(),
) {
  if (user.access_role !== "client" || !user.business_id) {
    throw new SupportError("A client account is required.", "forbidden");
  }
  const subject = cleanText(input.subject, 120);
  const message = cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  if (!subject) throw new SupportError("Add a short subject.", "subject_required");
  if (!message) throw new SupportError("Write a support message.", "message_required");

  const created = inTransaction(() => {
    const duplicate = getDb().prepare(`
      SELECT c.id,c.public_ref,b.name business_name
      FROM support_messages m
      JOIN support_conversations c ON c.id=m.conversation_id
      JOIN businesses b ON b.id=c.business_id
      WHERE m.sender_user_id=? AND m.idempotency_key=?
    `).get(user.id, key) as { id: number; public_ref: string; business_name: string } | undefined;
    if (duplicate) return { ...duplicate, assigned_user_name: null, duplicate: true };
    const publicRef = `SUP-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const result = getDb().prepare(`
      INSERT INTO support_conversations(
        public_ref,business_id,opened_by_user_id,subject,status,
        created_at,updated_at,last_message_at
      ) VALUES(?,?,?,?,'waiting',?,?,?)
    `).run(publicRef, user.business_id, user.id, subject, now, now, now);
    const conversationId = Number(result.lastInsertRowid);
    const messageResult = getDb().prepare(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,body,idempotency_key,created_at
      ) VALUES(?,?,?,?,?)
    `).run(conversationId, user.id, message, key, now);
    getDb().prepare(`
      UPDATE support_conversations SET client_last_read_message_id=? WHERE id=?
    `).run(Number(messageResult.lastInsertRowid), conversationId);
    getDb().prepare(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'created','client support conversation',?)
    `).run(conversationId, user.id, now);
    const agent = leastLoadedAgent();
    if (agent) assignConversation(conversationId, agent.id, null, "automatic", now);
    const business = getDb().prepare("SELECT name FROM businesses WHERE id=?")
      .get(user.business_id) as { name: string };
    return {
      id: conversationId,
      public_ref: publicRef,
      business_name: business.name,
      assigned_user_name: agent?.name || null,
      duplicate: false,
    };
  });
  if (!created.duplicate) {
    void notifySupportQueue({
      publicRef: created.public_ref,
      businessName: created.business_name,
      assignedUserName: created.assigned_user_name,
      id: created.id,
    });
  }
  return {
    id: created.id,
    publicRef: created.public_ref,
    duplicate: created.duplicate,
  };
}

export function listSupportConversations(
  user: SessionUser,
  input: { page?: unknown; q?: unknown; status?: unknown },
): PageResult<SupportConversation> {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const status = ["waiting", "open", "closed"].includes(String(input.status))
    ? String(input.status) as SupportStatus
    : "";
  const params: Array<string | number> = [];
  let where = " WHERE 1=1";
  if (user.access_role === "client") {
    if (!user.business_id) throw new SupportError("Client business is missing.", "forbidden");
    where += " AND c.business_id=?";
    params.push(user.business_id);
  } else if (user.access_role === "team_member") {
    where += " AND (c.status='waiting' OR c.assigned_user_id=?)";
    params.push(user.id);
  } else if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Support access is required.", "forbidden");
  }
  if (status) {
    where += " AND c.status=?";
    params.push(status);
  }
  if (request.search) {
    const pattern = likePattern(request.search);
    where += " AND (lower(c.subject) LIKE ? ESCAPE '\\' OR lower(c.public_ref) LIKE ? ESCAPE '\\' OR lower(b.name) LIKE ? ESCAPE '\\')";
    params.push(pattern, pattern, pattern);
  }
  const total = (getDb().prepare(`
    SELECT COUNT(*) total FROM support_conversations c
    JOIN businesses b ON b.id=c.business_id${where}
  `).get(...params) as { total: number }).total;
  const window = pageWindow(total, request);
  const rows = getDb().prepare(`
    ${baseSelect()}${where}
    ORDER BY CASE c.status WHEN 'waiting' THEN 0 WHEN 'open' THEN 1 ELSE 2 END,
      c.last_message_at DESC,c.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, window.limit, window.offset) as ConversationRow[];
  return pageResult(rows.map((row) => conversationView(row, user)), total, request);
}

export function getSupportConversation(user: SessionUser, conversationId: number) {
  const row = requireConversation(user, conversationId);
  const messages = getDb().prepare(`
    SELECT m.id,m.conversation_id,m.sender_user_id,u.name sender_name,
      COALESCE(p.access_role,CASE WHEN u.role='admin' THEN 'platform_admin' ELSE 'client' END) sender_role,
      m.body,m.created_at
    FROM support_messages m JOIN users u ON u.id=m.sender_user_id
    LEFT JOIN user_access_profiles p ON p.user_id=u.id
    WHERE m.conversation_id=?
    ORDER BY m.id DESC LIMIT 100
  `).all(conversationId).reverse() as Array<{
    id: number;
    conversation_id: number;
    sender_user_id: number;
    sender_name: string;
    sender_role: string;
    body: string;
    created_at: number;
  }>;
  const lastId = messages.at(-1)?.id || 0;
  getDb().prepare(`
    UPDATE support_conversations
    SET ${user.access_role === "client" ? "client_last_read_message_id" : "staff_last_read_message_id"}=MAX(
      ${user.access_role === "client" ? "client_last_read_message_id" : "staff_last_read_message_id"},?
    )
    WHERE id=?
  `).run(lastId, conversationId);
  return {
    conversation: conversationView({ ...row, last_message_id: lastId }, user),
    messages: messages.map((message): SupportMessage => ({
      id: message.id,
      conversationId: message.conversation_id,
      senderUserId: message.sender_user_id,
      senderName: message.sender_name,
      senderRole: message.sender_role,
      body: message.body,
      createdAt: message.created_at,
    })),
  };
}

export function postSupportMessage(
  user: SessionUser,
  conversationId: number,
  input: { message: unknown; idempotencyKey: unknown },
  now = Date.now(),
) {
  const body = cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  if (!body) throw new SupportError("Write a support message.", "message_required");
  return inTransaction(() => {
    const row = requireConversation(user, conversationId);
    if (row.status === "closed") throw new SupportError("Reopen this conversation before replying.", "closed");
    if (user.access_role !== "client" && row.assigned_user_id !== user.id && !hasCapability(user, "operations:manage")) {
      throw new SupportError("Claim this conversation before replying.", "unassigned");
    }
    const existing = getDb().prepare(`
      SELECT id FROM support_messages WHERE sender_user_id=? AND idempotency_key=?
    `).get(user.id, key) as { id: number } | undefined;
    if (existing) return { id: existing.id, duplicate: true };
    const result = getDb().prepare(`
      INSERT INTO support_messages(conversation_id,sender_user_id,body,idempotency_key,created_at)
      VALUES(?,?,?,?,?)
    `).run(conversationId, user.id, body, key, now);
    const messageId = Number(result.lastInsertRowid);
    const readColumn = user.access_role === "client"
      ? "client_last_read_message_id"
      : "staff_last_read_message_id";
    getDb().prepare(`
      UPDATE support_conversations
      SET updated_at=?,last_message_at=?,${readColumn}=?
      WHERE id=?
    `).run(now, now, messageId, conversationId);
    getDb().prepare(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'message','message posted',?)
    `).run(conversationId, user.id, now);
    return { id: messageId, duplicate: false };
  });
}

function activeAssignmentCount(userId: number) {
  return (getDb().prepare(`
    SELECT COUNT(*) total FROM support_conversations
    WHERE assigned_user_id=? AND status='open'
  `).get(userId) as { total: number }).total;
}

export function claimSupportConversation(
  user: SessionUser,
  conversationId: number,
  now = Date.now(),
) {
  if (user.access_role !== "team_member" && !hasCapability(user, "operations:manage")) {
    throw new SupportError("Staff access is required.", "forbidden");
  }
  return inTransaction(() => {
    const row = requireConversation(user, conversationId);
    if (row.status !== "waiting") {
      if (row.assigned_user_id === user.id && row.status === "open") return { duplicate: true };
      throw new SupportError("This conversation is already assigned.", "already_assigned");
    }
    const workload = supportAgentWorkload(user.id);
    if (!workload?.enabled) {
      throw new SupportError("This account is not enabled for support assignments.", "not_support_agent");
    }
    if (workload.open_count >= workload.max_open_conversations) {
      throw new SupportError("Close a current conversation before claiming another.", "capacity");
    }
    assignConversation(conversationId, user.id, user.id, "claimed", now);
    return { duplicate: false };
  });
}

export function closeSupportConversation(user: SessionUser, conversationId: number, now = Date.now()) {
  return inTransaction(() => {
    const row = requireConversation(user, conversationId);
    if (
      user.access_role !== "client" &&
      row.assigned_user_id !== user.id &&
      !hasCapability(user, "operations:manage")
    ) {
      throw new SupportError("Only the assigned team member can close this conversation.", "forbidden");
    }
    getDb().prepare(`
      UPDATE support_conversations SET status='closed',closed_at=?,updated_at=? WHERE id=?
    `).run(now, now, conversationId);
    getDb().prepare(`
      UPDATE support_assignments SET released_at=?
      WHERE conversation_id=? AND released_at IS NULL
    `).run(now, conversationId);
    getDb().prepare(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'closed','conversation closed',?)
    `).run(conversationId, user.id, now);
  });
}

export function reopenSupportConversation(user: SessionUser, conversationId: number, now = Date.now()) {
  return inTransaction(() => {
    const row = requireConversation(user, conversationId);
    if (row.status !== "closed") return;
    if (user.access_role === "client") {
      const agent = leastLoadedAgent();
      if (agent) {
        assignConversation(conversationId, agent.id, user.id, "reopened", now);
      } else {
        getDb().prepare(`
          UPDATE support_conversations
          SET status='waiting',assigned_user_id=NULL,closed_at=NULL,updated_at=?
          WHERE id=?
        `).run(now, conversationId);
      }
      getDb().prepare(`
        INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
        VALUES(?,?,'reopened','client reopened',?)
      `).run(conversationId, user.id, now);
      return;
    }
    if (row.assigned_user_id !== user.id && !hasCapability(user, "operations:manage")) {
      throw new SupportError("Only the assigned team member can reopen this conversation.", "forbidden");
    }
    const workload = row.assigned_user_id ? supportAgentWorkload(row.assigned_user_id) : null;
    if (row.assigned_user_id && (!workload?.enabled || workload.open_count >= workload.max_open_conversations)) {
      throw new SupportError("The assigned team member is at capacity.", "capacity");
    }
    if (!row.assigned_user_id) throw new SupportError("Assign an agent before reopening.", "unassigned");
    assignConversation(conversationId, row.assigned_user_id, user.id, "reopened", now);
    getDb().prepare(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'reopened','staff reopened',?)
    `).run(conversationId, user.id, now);
  });
}

export function listSupportAgentWorkloads(user: SessionUser): SupportAgentWorkload[] {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  return getDb().prepare(`
    SELECT u.id user_id,u.name,u.email,COALESCE(s.enabled,0) enabled,
      COALESCE(s.max_open_conversations,3) max_open_conversations,
      COUNT(c.id) open_count
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE p.access_role IN ('team_member','operations_manager')
    GROUP BY u.id,u.name,u.email,s.enabled,s.max_open_conversations
    ORDER BY COALESCE(s.enabled,0) DESC,COUNT(c.id),lower(u.name)
  `).all().map((row) => {
    const value = row as {
      user_id: number;
      name: string;
      email: string;
      enabled: number;
      max_open_conversations: number;
      open_count: number;
    };
    return {
      userId: value.user_id,
      name: value.name,
      email: value.email,
      enabled: Boolean(value.enabled),
      maxOpenConversations: value.max_open_conversations,
      openConversations: value.open_count,
    };
  });
}

function supportAgentRows() {
  return `
    SELECT u.id user_id,u.name,u.email,COALESCE(s.enabled,0) enabled,
      COALESCE(s.max_open_conversations,3) max_open_conversations,
      COUNT(c.id) open_count
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE p.access_role IN ('team_member','operations_manager')
    GROUP BY u.id,u.name,u.email,s.enabled,s.max_open_conversations
  `;
}

function workloadView(row: {
  user_id: number;
  name: string;
  email: string;
  enabled: number;
  max_open_conversations: number;
  open_count: number;
}): SupportAgentWorkload {
  return {
    userId: row.user_id,
    name: row.name,
    email: row.email,
    enabled: Boolean(row.enabled),
    maxOpenConversations: row.max_open_conversations,
    openConversations: row.open_count,
  };
}

export function listSupportAgentWorkloadsPage(
  user: SessionUser,
  input: { page?: unknown; q?: unknown; status?: unknown },
): PageResult<SupportAgentWorkload> {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  const request = normalizePageRequest({ page: input.page, search: input.q }, 5);
  const status = cleanText(input.status, 20);
  const conditions: string[] = [];
  const values: Array<string | number> = [];
  if (request.search) {
    conditions.push("(lower(name) LIKE ? ESCAPE '\\' OR lower(email) LIKE ? ESCAPE '\\')");
    const pattern = likePattern(request.search);
    values.push(pattern, pattern);
  }
  if (status === "enabled") conditions.push("enabled=1");
  if (status === "disabled") conditions.push("enabled=0");
  if (status === "available") conditions.push("enabled=1 AND open_count<max_open_conversations");
  if (status === "full") conditions.push("enabled=1 AND open_count>=max_open_conversations");
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const total = Number((getDb().prepare(`
    WITH workloads AS (${supportAgentRows()})
    SELECT COUNT(*) count FROM workloads ${where}
  `).get(...values) as { count: number }).count);
  const window = pageWindow(total, request);
  const rows = getDb().prepare(`
    WITH workloads AS (${supportAgentRows()})
    SELECT * FROM workloads ${where}
    ORDER BY enabled DESC,open_count,lower(name),user_id
    LIMIT ? OFFSET ?
  `).all(...values, window.limit, window.offset) as Array<{
    user_id: number;
    name: string;
    email: string;
    enabled: number;
    max_open_conversations: number;
    open_count: number;
  }>;
  return pageResult(rows.map(workloadView), total, request);
}

export function getSupportAgentSummary(user: SessionUser): SupportAgentSummary {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  const row = getDb().prepare(`
    WITH workloads AS (${supportAgentRows()})
    SELECT
      COUNT(*) total_agents,
      SUM(CASE WHEN enabled=1 THEN 1 ELSE 0 END) enabled_agents,
      SUM(CASE WHEN enabled=1 AND open_count<max_open_conversations THEN 1 ELSE 0 END) available_agents,
      SUM(CASE WHEN enabled=1 AND open_count>=max_open_conversations THEN 1 ELSE 0 END) full_agents,
      SUM(open_count) open_assignments,
      (SELECT COUNT(*) FROM support_conversations WHERE status='waiting') waiting_conversations
    FROM workloads
  `).get() as {
    total_agents: number;
    enabled_agents: number;
    available_agents: number;
    full_agents: number;
    open_assignments: number;
    waiting_conversations: number;
  };
  return {
    totalAgents: Number(row.total_agents || 0),
    enabledAgents: Number(row.enabled_agents || 0),
    availableAgents: Number(row.available_agents || 0),
    fullAgents: Number(row.full_agents || 0),
    openAssignments: Number(row.open_assignments || 0),
    waitingConversations: Number(row.waiting_conversations || 0),
  };
}

export function updateSupportAgentSetting(
  user: SessionUser,
  input: { userId: unknown; enabled: unknown; maxOpenConversations: unknown },
  now = Date.now(),
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  const userId = Number.parseInt(String(input.userId ?? ""), 10);
  const maximum = Number.parseInt(String(input.maxOpenConversations ?? ""), 10);
  const enabled = input.enabled === true || input.enabled === "1" || input.enabled === "on";
  if (!Number.isInteger(userId) || !Number.isInteger(maximum) || maximum < 1 || maximum > 20) {
    throw new SupportError("Support agent settings are invalid.", "invalid_setting");
  }
  const staff = getDb().prepare(`
    SELECT 1 FROM user_access_profiles
    WHERE user_id=? AND access_role IN ('team_member','operations_manager')
  `).get(userId);
  if (!staff) throw new SupportError("Support agent was not found.", "invalid_agent");
  const openConversations = activeAssignmentCount(userId);
  if (openConversations > maximum) {
    throw new SupportError(
      `Reassign or close ${openConversations - maximum} conversation(s) before lowering this limit.`,
      "capacity",
    );
  }
  if (!enabled && openConversations > 0) {
    throw new SupportError(
      "Reassign or close this agent's conversations before disabling support assignments.",
      "capacity",
    );
  }
  getDb().prepare(`
    INSERT INTO support_agent_settings(
      user_id,enabled,max_open_conversations,updated_by_user_id,updated_at
    ) VALUES(?,?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET
      enabled=excluded.enabled,
      max_open_conversations=excluded.max_open_conversations,
      updated_by_user_id=excluded.updated_by_user_id,
      updated_at=excluded.updated_at
  `).run(userId, enabled ? 1 : 0, maximum, user.id, now);
}

export function reassignSupportConversation(
  user: SessionUser,
  conversationId: number,
  assignedUserId: number | null,
  now = Date.now(),
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  return inTransaction(() => {
    requireConversation(user, conversationId);
    if (assignedUserId === null) {
      getDb().prepare(`
        UPDATE support_assignments SET released_at=?
        WHERE conversation_id=? AND released_at IS NULL
      `).run(now, conversationId);
      getDb().prepare(`
        UPDATE support_conversations
        SET assigned_user_id=NULL,status='waiting',closed_at=NULL,updated_at=?
        WHERE id=?
      `).run(now, conversationId);
    } else {
      const workload = supportAgentWorkload(assignedUserId);
      if (!workload?.enabled || workload.open_count >= workload.max_open_conversations) {
        throw new SupportError("That support agent is unavailable or at capacity.", "capacity");
      }
      assignConversation(conversationId, assignedUserId, user.id, "reassigned", now);
    }
    getDb().prepare(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'reassigned',?,?)
    `).run(conversationId, user.id, assignedUserId === null ? "waiting" : `agent:${assignedUserId}`, now);
  });
}
