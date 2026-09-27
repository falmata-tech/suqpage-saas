import { buyingService, isCallbackRequest, type BuyingService } from "./buying-assistance";
import { platformCookies } from "./platform-state";
import crypto from "node:crypto";
import { hasCapability } from "./capabilities";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import {
  likePattern,
  normalizePageRequest,
  pageResult,
  pageWindow,
  type PageResult,
} from "./pagination";
import { cleanText } from "./security";
import { hashPrivateValue } from "./security";
import { notifySupportQueue } from "./support-notifications";
import { consumeRuntimeRateLimit } from "./rate-limit-runtime";
import { assertMediaObjectKey } from "./media-storage";
import type { SessionUser } from "./types";

export const MAX_OPEN_SUPPORT_CONVERSATIONS = 3;
export const PUBLIC_SUPPORT_SESSION_MS = 7 * 24 * 60 * 60 * 1000;
export const PUBLIC_SUPPORT_COOKIE = platformCookies.support.current;

export type SupportQueueScope = "all" | "support" | "transport";
export type SupportStatus = "waiting" | "open" | "closed";
export type SupportParticipantKind = "client" | "visitor";
export type SupportAssistanceCategory = "general" | "sourcing" | "document_review" | "site_visit" | "shipment_observation" | "buying_assistance";

export const PUBLIC_SUPPORT_CATEGORIES: ReadonlyArray<{
  key: SupportAssistanceCategory;
  label: string;
  description: string;
}> = [
  { key: "general", label: "Suqpage help or report", description: "Ask how Suqpage works or report a concern about a listing." },
  { key: "buying_assistance", label: "Buying assistance", description: "Get help checking a seller, checking product quality, or making a purchase." },
  { key: "shipment_observation", label: "Transport arrangements", description: "Ask for help connecting with a transport option for a purchase." },
] as const;

export type SupportConversation = {
  id: number;
  publicRef: string;
  participantKind: SupportParticipantKind;
  businessId: number | null;
  businessName: string;
  openedByUserId: number | null;
  assistanceCategory: SupportAssistanceCategory;
  requesterLabel: string;
  buyingService: BuyingService | null;
  transportOrigin: string | null;
  transportDestination: string | null;
  transportCompany: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  subject: string;
  status: SupportStatus;
  assignedUserId: number | null;
  assignedUserName: string | null;
  lastMessageAt: number;
  createdAt: number;
  closedAt: number | null;
  resolvedAt: number | null;
  requestSummary: string;
  unread: boolean;
};

export type SupportMessage = {
  visitorVisible: boolean;
  id: number;
  conversationId: number;
  senderUserId: number | null;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: number;
  attachment: SupportAttachment | null;
};

export type SupportAttachment = {
  id: number;
  originalName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
  byteSize: number;
};

export type SupportAttachmentWrite = Omit<SupportAttachment, "id"> & {
  storageKey: string;
};

export type SupportAgentWorkload = {
  userId: number;
  name: string;
  email: string;
  enabled: boolean;
  queueScope: SupportQueueScope;
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
  participant_kind: SupportParticipantKind;
  business_id: number | null;
  business_name: string;
  opened_by_user_id: number | null;
  visitor_token_hash: string | null;
  visitor_session_expires_at: number | null;
  assistance_category: SupportAssistanceCategory;
  requester_label: string;
  buying_service: BuyingService | null;
  transport_origin: string | null;
  transport_destination: string | null;
  transport_company?: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
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
  resolved_at: number | null;
  request_summary: string;
};

type AttachmentColumns = {
  attachment_id: number | null;
  attachment_original_name: string | null;
  attachment_mime_type: SupportAttachment["mimeType"] | null;
  attachment_byte_size: number | null;
};

function attachmentView(row: AttachmentColumns): SupportAttachment | null {
  if (!row.attachment_id || !row.attachment_original_name || !row.attachment_mime_type || !row.attachment_byte_size) return null;
  return {
    id: row.attachment_id,
    originalName: row.attachment_original_name,
    mimeType: row.attachment_mime_type,
    byteSize: row.attachment_byte_size,
  };
}

function conversationView(row: ConversationRow, user: SessionUser): SupportConversation {
  const lastRead = user.access_role === "client"
    ? row.client_last_read_message_id
    : row.staff_last_read_message_id;
  return {
    id: row.id,
    publicRef: row.public_ref,
    participantKind: row.participant_kind,
    businessId: row.business_id,
    businessName: row.business_name,
    openedByUserId: row.opened_by_user_id,
    assistanceCategory: row.assistance_category,
    requesterLabel: row.requester_label,
    buyingService: row.buying_service,
    transportOrigin: row.transport_origin,
    transportDestination: row.transport_destination,
    transportCompany: row.transport_company || null,
    visitorEmail: row.visitor_email,
    visitorPhone: row.visitor_phone,
    subject: row.subject,
    status: row.status,
    assignedUserId: row.assigned_user_id,
    assignedUserName: row.assigned_user_name,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    resolvedAt: row.resolved_at,
    requestSummary: row.request_summary || "",
    unread: row.last_message_id > lastRead,
  };
}

function baseSelect(includeTransportCompany = false) {
  return `
    SELECT c.*,${includeTransportCompany ? `(SELECT e.detail::jsonb->>'company' FROM support_events e
      WHERE e.conversation_id=c.id AND e.event_type='transport_handoff' ORDER BY e.id DESC LIMIT 1) transport_company,` : ""}
      COALESCE(b.name,c.requester_label) business_name,assignee.name assigned_user_name,
      (SELECT m.body FROM support_messages m WHERE m.conversation_id=c.id ORDER BY m.id LIMIT 1) request_summary,
      COALESCE((SELECT MAX(m.id) FROM support_messages m WHERE m.conversation_id=c.id),0) last_message_id
    FROM support_conversations c
    LEFT JOIN businesses b ON b.id=c.business_id
    LEFT JOIN users assignee ON assignee.id=c.assigned_user_id
  `;
}

async function canRead(user: SessionUser, row: Pick<ConversationRow, "business_id" | "status" | "assigned_user_id" | "assistance_category">) {
  if (user.access_role === "client") return Boolean(row.business_id) && user.business_id === row.business_id;
  if (hasCapability(user, "operations:manage")) return true;
  if (user.access_role === "team_member") {
    if (row.assigned_user_id === user.id) return true;
    const workload = await supportAgentWorkload(user.id);
    return row.status === "waiting" && Boolean(workload?.enabled && acceptsQueue(workload.queue_scope, row.assistance_category));
  }
  return false;
}

async function requireConversation(user: SessionUser, conversationId: number) {
  const row = await runtimeGet<ConversationRow>(`${baseSelect()} WHERE c.id=?`, [conversationId]);
  if (!row || !(await canRead(user, row))) {
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

function supportAttachment(value: SupportAttachmentWrite | null | undefined) {
  if (!value) return null;
  let storageKey: string;
  try {
    storageKey = assertMediaObjectKey(value.storageKey);
  } catch {
    throw new SupportError("The attachment reference is invalid.", "invalid_attachment");
  }
  const originalName = cleanText(value.originalName, 180);
  const mimeType = value.mimeType;
  const byteSize = Number(value.byteSize);
  if (!originalName || !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(mimeType)) {
    throw new SupportError("The attachment type is not supported.", "invalid_attachment");
  }
  if (!Number.isSafeInteger(byteSize) || byteSize < 1 || byteSize > 5 * 1024 * 1024) {
    throw new SupportError("Attachments must be 5 MB or smaller.", "invalid_attachment");
  }
  return { storageKey, originalName, mimeType, byteSize };
}

async function insertSupportAttachment(messageId: number, value: ReturnType<typeof supportAttachment>, now: number) {
  if (!value) return;
  await runtimeRun(`
    INSERT INTO support_attachments(message_id,storage_key,original_name,mime_type,byte_size,created_at)
    VALUES(?,?,?,?,?,?)
  `, [messageId, value.storageKey, value.originalName, value.mimeType, value.byteSize, now]);
}

function assistanceCategory(value: unknown): SupportAssistanceCategory {
  const category = cleanText(value, 40) as SupportAssistanceCategory;
  if (!PUBLIC_SUPPORT_CATEGORIES.some((option) => option.key === category)) {
    throw new SupportError("Choose how Suqpage can help.", "category_required");
  }
  return category;
}

function visitorEmail(value: unknown) {
  const email = cleanText(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SupportError("Enter a valid email address.", "email_required");
  }
  return email;
}

function visitorPhone(value: unknown) {
  const raw = cleanText(value, 40);
  const phone = raw.replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    throw new SupportError("Enter a valid phone number.", "phone_required");
  }
  return phone;
}

function publicSupportToken(value: unknown) {
  const token = cleanText(value, 120);
  if (!/^[A-Za-z0-9_-]{40,120}$/.test(token)) {
    throw new SupportError("Support conversation was not found.", "not_found");
  }
  return token;
}

function visitorSenderKey(tokenHash: string) {
  return `visitor:${tokenHash}`;
}

function acceptsQueue(scope: SupportQueueScope, category: SupportAssistanceCategory) {
  return scope === "all" || scope === (isCallbackRequest(category) ? "transport" : "support");
}
async function lockSupportWork() {
  await runtimeGet("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");
}
export const SUPPORT_WAITING_SCOPE_SQL = `EXISTS(SELECT 1 FROM support_agent_settings s
  WHERE s.user_id=? AND s.enabled=1 AND (s.queue_scope='all'
    OR (s.queue_scope='transport' AND c.assistance_category IN ('shipment_observation','buying_assistance'))
    OR (s.queue_scope='support' AND c.assistance_category NOT IN ('shipment_observation','buying_assistance'))))`;

async function supportAgentWorkload(userId: number) {
  return runtimeGet<{
    enabled: number;
    queue_scope: SupportQueueScope;
    max_open_conversations: number;
    open_count: number;
  }>(`
    SELECT s.enabled,s.queue_scope,s.max_open_conversations,
      (SELECT COUNT(*) FROM support_conversations c
       WHERE c.assigned_user_id=s.user_id AND c.status='open') open_count
    FROM support_agent_settings s WHERE s.user_id=?
  `, [userId]);
}

async function leastLoadedAgent(category: SupportAssistanceCategory = "general") {
  return runtimeGet<{
    id: number;
    name: string;
    queue_scope: SupportQueueScope;
    max_open_conversations: number;
    open_count: number;
  }>(`
    SELECT u.id,u.name,s.max_open_conversations,
      COUNT(c.id) open_count
    FROM support_agent_settings s
    JOIN users u ON u.id=s.user_id
    JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE s.enabled=1 AND p.access_role IN ('team_member','operations_manager')
      AND (s.queue_scope='all' OR s.queue_scope=?)
    GROUP BY u.id,u.name,s.max_open_conversations
    HAVING COUNT(c.id)<s.max_open_conversations
    ORDER BY COUNT(c.id),u.id
    LIMIT 1
  `, [isCallbackRequest(category) ? "transport" : "support"]);
}

async function assignConversation(
  conversationId: number,
  assignedUserId: number,
  assignedByUserId: number | null,
  reason: "automatic" | "claimed" | "reassigned" | "reopened",
  now: number,
) {
  await runtimeRun(`
    UPDATE support_assignments SET released_at=?
    WHERE conversation_id=? AND released_at IS NULL
  `, [now, conversationId]);
  await runtimeRun(`
    INSERT INTO support_assignments(
      conversation_id,assigned_user_id,assigned_by_user_id,reason,assigned_at
    ) VALUES(?,?,?,?,?)
  `, [conversationId, assignedUserId, assignedByUserId, reason, now]);
  await runtimeRun(`
    UPDATE support_conversations
    SET status='open',assigned_user_id=?,updated_at=?,closed_at=NULL,resolved_at=NULL
    WHERE id=?
  `, [assignedUserId, now, conversationId]);
  await runtimeRun(`
    INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
    VALUES(?,?,'assigned',?,?)
  `, [conversationId, assignedByUserId, `agent:${assignedUserId};reason:${reason}`, now]);
}

export async function createSupportConversation(
  user: SessionUser,
  input: { subject: unknown; message: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null },
  now = Date.now(),
) {
  if (user.access_role !== "client" || !user.business_id) {
    throw new SupportError("A client account is required.", "forbidden");
  }
  const subject = cleanText(input.subject, 120);
  const message = cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  const attachment = supportAttachment(input.attachment);
  if (!subject) throw new SupportError("Add a short subject.", "subject_required");
  if (!message) throw new SupportError("Write a support message.", "message_required");

  const created = await runtimeTransaction(async () => {
    await lockSupportWork();
    const duplicate = await runtimeGet<{ id: number; public_ref: string; business_name: string }>(`
      SELECT c.id,c.public_ref,b.name business_name
      FROM support_messages m
      JOIN support_conversations c ON c.id=m.conversation_id
      JOIN businesses b ON b.id=c.business_id
      WHERE m.sender_key=? AND m.idempotency_key=?
    `, [`user:${user.id}`, key]);
    if (duplicate) return { ...duplicate, assigned_user_name: null, duplicate: true };
    const publicRef = `SUP-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const result = await runtimeGet<{ id: number }>(`
      INSERT INTO support_conversations(
        public_ref,participant_kind,business_id,opened_by_user_id,
        assistance_category,requester_label,subject,status,
        created_at,updated_at,last_message_at
      ) VALUES(?,'client',?,?, 'general','Suqpage client',?,'waiting',?,?,?) RETURNING id
    `, [publicRef, user.business_id, user.id, subject, now, now, now]);
    const conversationId = Number(result!.id);
    const messageResult = await runtimeGet<{ id: number }>(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at
      ) VALUES(?,?,'user',?,?,?,?) RETURNING id
    `, [conversationId, user.id, `user:${user.id}`, message, key, now]);
    await insertSupportAttachment(Number(messageResult!.id), attachment, now);
    await runtimeRun(`
      UPDATE support_conversations SET client_last_read_message_id=? WHERE id=?
    `, [Number(messageResult!.id), conversationId]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'created','client support conversation',?)
    `, [conversationId, user.id, now]);
    const agent = await leastLoadedAgent();
    if (agent) await assignConversation(conversationId, agent.id, null, "automatic", now);
    const business = (await runtimeGet<{ name: string }>("SELECT name FROM businesses WHERE id=?", [user.business_id]))!;
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

export async function createPublicSupportConversation(
  input: { category: unknown; email?: unknown; phone: unknown; message?: unknown; name?: unknown; service?: unknown; origin?: unknown; destination?: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null },
  ipHash: string,
  now = Date.now(),
  preparedToken?: string,
) {
  const category = assistanceCategory(input.category);
  const transport = category === "shipment_observation";
  const callback = isCallbackRequest(category);
  const service = category === "buying_assistance" ? buyingService(input.service) : null;
  if (category === "buying_assistance" && input.service != null && !service) throw new SupportError("Choose what you need help with.", "invalid_service");
  const name = callback ? transportField(input.name, "Enter your name.", 80) : "Website visitor";
  const origin = transport ? transportField(input.origin, "Enter the pickup location.", 120) : null;
  const destination = transport ? transportField(input.destination, "Enter the destination.", 120) : null;
  const email = callback ? null : visitorEmail(input.email);
  const phone = visitorPhone(input.phone);
  if (category === "buying_assistance" && (typeof input.message !== "string" || input.message.trim().length > 4000)) throw new SupportError("Describe what you need in 4,000 characters or fewer.", "invalid_request");
  const message = transport ? `From: ${origin}\nTo: ${destination}` : cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  const attachment = supportAttachment(input.attachment);
  if (callback && attachment) throw new SupportError("These requests do not accept attachments.", "invalid_attachment");
  if (!message) throw new SupportError("Write a message for the Suqpage team.", "message_required");

  const token = preparedToken ? publicSupportToken(preparedToken) : crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashPrivateValue(`public-support:${token}`);
  const senderKey = visitorSenderKey(tokenHash);
  const categoryLabel = PUBLIC_SUPPORT_CATEGORIES.find((option) => option.key === category)!.label;
  const expiresAt = now + PUBLIC_SUPPORT_SESSION_MS;
  const created = await runtimeTransaction(async () => {
    await lockSupportWork();
    // Cookie ownership, not contact details or the request key, authorizes replay.
    await runtimeGet("SELECT pg_advisory_xact_lock(hashtextextended(?,0))", [`support-start:${tokenHash}`]);
    const existing = await runtimeGet<{id:number;public_ref:string;visitor_session_expires_at:number;visitor_email:string|null;visitor_phone:string;requester_label:string;assistance_category:string;buying_service:BuyingService|null;body:string;idempotency_key:string}>(`
      SELECT c.id,c.public_ref,c.visitor_session_expires_at,c.visitor_email,c.visitor_phone,c.requester_label,
        c.assistance_category,c.buying_service,m.body,m.idempotency_key
      FROM support_conversations c JOIN support_messages m ON m.conversation_id=c.id
      WHERE c.visitor_token_hash=? ORDER BY m.id LIMIT 1`, [tokenHash]);
    if (existing) {
      if (existing.visitor_session_expires_at < now) throw new SupportError("Support session expired. Reopen help and try again.", "not_found");
      if (existing.idempotency_key !== key || existing.body !== message || existing.visitor_email !== email || existing.visitor_phone !== phone || existing.assistance_category !== category || existing.requester_label !== name || existing.buying_service !== service) {
        throw new SupportError("A support chat is already open. Reopen help to continue.", "conflict");
      }
      return {id:existing.id,publicRef:existing.public_ref,assignedUserName:null,expiresAt:existing.visitor_session_expires_at,duplicate:true};
    }
    const rate = await consumeRuntimeRateLimit(`public-support:create:${ipHash}`, 5, 60 * 60 * 1000, 60 * 60 * 1000);
    if (!rate.allowed) throw new SupportError("Too many conversations were started. Please try again later.", "rate_limited");
    const publicRef = `SUP-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const result = await runtimeGet<{ id: number }>(`
      INSERT INTO support_conversations(
        public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,
        assistance_category,requester_label,visitor_email,visitor_phone,transport_origin,transport_destination,buying_service,
        subject,status,created_at,updated_at,last_message_at
      ) VALUES(?,'visitor',?,?,?,?,?,?,?,?,?,?,'waiting',?,?,?) RETURNING id
    `, [publicRef, tokenHash, expiresAt, category, name, email, phone, origin, destination, service, transport ? `${origin} → ${destination}`.slice(0,120) : categoryLabel, now, now, now]);
    const conversationId = Number(result!.id);
    const messageResult = await runtimeGet<{ id: number }>(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at
      ) VALUES(?,NULL,'visitor',?,?,?,?) RETURNING id
    `, [conversationId, senderKey, message, key, now]);
    await insertSupportAttachment(Number(messageResult!.id), attachment, now);
    await runtimeRun(`
      UPDATE support_conversations SET visitor_last_read_message_id=? WHERE id=?
    `, [Number(messageResult!.id), conversationId]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,NULL,'created',?,?)
    `, [conversationId, `public visitor request:${category}`, now]);
    const agent = await leastLoadedAgent(category);
    if (agent) await assignConversation(conversationId, agent.id, null, "automatic", now);
    return { id: conversationId, publicRef, assignedUserName: agent?.name || null, expiresAt, duplicate: false };
  });
  if (!created.duplicate) void notifySupportQueue({
    publicRef: created.publicRef,
    businessName: "Website visitor",
    assignedUserName: created.assignedUserName,
    id: created.id,
  });
  return { id: created.id, publicRef: created.publicRef, token, expiresAt: created.expiresAt, duplicate: created.duplicate };
}

export async function publicSupportSessionIsUsable(token: unknown, now = Date.now()) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{40,120}$/.test(token)) return false;
  const tokenHash = hashPrivateValue(`public-support:${token}`);
  const existing = await runtimeGet<{visitor_session_expires_at:number}>("SELECT visitor_session_expires_at FROM support_conversations WHERE visitor_token_hash=?", [tokenHash]);
  return !existing || existing.visitor_session_expires_at >= now;
}

async function requirePublicConversation(token: unknown, now = Date.now()) {
  const normalized = publicSupportToken(token);
  const tokenHash = hashPrivateValue(`public-support:${normalized}`);
  const row = await runtimeGet<ConversationRow>(`${baseSelect()}
    WHERE c.participant_kind='visitor' AND c.visitor_token_hash=?
      AND c.visitor_session_expires_at>=?
  `, [tokenHash, now]);
  if (!row) throw new SupportError("Support conversation was not found.", "not_found");
  return { row, tokenHash };
}

export async function getPublicSupportConversation(token: unknown, now = Date.now()) {
  const { row } = await requirePublicConversation(token, now);
  // Historical transport keeps receipts; buying exposes only explicit replies.
  if (row.assistance_category === "shipment_observation") return {
    id: row.id, publicRef: row.public_ref, category: row.assistance_category,
    status: row.status, assignedUserName: null, messages: [],
  };
  const messages = (await runtimeAll<{
    id: number;
    sender_kind: "user" | "visitor";
    sender_name: string | null;
    body: string;
    created_at: number;
  } & AttachmentColumns>(`
    SELECT m.id,m.sender_kind,u.name sender_name,m.body,m.created_at,
      a.id attachment_id,a.original_name attachment_original_name,
      a.mime_type attachment_mime_type,a.byte_size attachment_byte_size
    FROM support_messages m
    LEFT JOIN users u ON u.id=m.sender_user_id
    LEFT JOIN support_attachments a ON a.message_id=m.id
    WHERE m.conversation_id=? AND (? <> 'buying_assistance' OR m.sender_kind='visitor' OR m.visitor_visible=TRUE)
    ORDER BY m.id DESC LIMIT 100
  `, [row.id, row.assistance_category])).reverse();
  const lastId = messages.at(-1)?.id || 0;
  await runtimeRun(`
    UPDATE support_conversations
    SET visitor_last_read_message_id=CASE WHEN visitor_last_read_message_id<? THEN ? ELSE visitor_last_read_message_id END
    WHERE id=? AND visitor_last_read_message_id<?
  `, [lastId, lastId, row.id, lastId]);
  return {
    id: row.id,
    publicRef: row.public_ref,
    category: row.assistance_category,
    status: row.status,
    assignedUserName: row.assigned_user_name,
    messages: messages.map((message) => ({
      id: message.id,
      sender: message.sender_kind === "visitor" ? "visitor" as const : "staff" as const,
      senderName: message.sender_kind === "visitor" ? "You" : message.sender_name || "Suqpage support",
      body: message.body,
      createdAt: message.created_at,
      attachment: row.assistance_category === "buying_assistance" ? null : attachmentView(message),
    })),
  };
}

export async function getPublicSupportAttachment(token: unknown, attachmentId: number, now = Date.now()) {
  if (!Number.isSafeInteger(attachmentId) || attachmentId < 1) throw new SupportError("Attachment was not found.", "not_found");
  const { row } = await requirePublicConversation(token, now);
  if (isCallbackRequest(row.assistance_category)) throw new SupportError("Attachment was not found.", "not_found");
  const attachment = await runtimeGet<{
    storage_key: string;
    original_name: string;
    mime_type: SupportAttachment["mimeType"];
    byte_size: number;
  }>(`
    SELECT a.storage_key,a.original_name,a.mime_type,a.byte_size
    FROM support_attachments a
    JOIN support_messages m ON m.id=a.message_id
    WHERE a.id=? AND m.conversation_id=?
  `, [attachmentId, row.id]);
  if (!attachment) throw new SupportError("Attachment was not found.", "not_found");
  return attachment;
}

export async function postPublicSupportMessage(
  token: unknown,
  input: { message: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null },
  ipHash: string,
  now = Date.now(),
) {
  if (typeof input.message !== "string" || input.message.trim().length > 4000) throw new SupportError("Describe what you need in 4,000 characters or fewer.", "invalid_request");
  const body = cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  const attachment = supportAttachment(input.attachment);
  if (!body) throw new SupportError("Write a message for the Suqpage team.", "message_required");
  const { row, tokenHash } = await requirePublicConversation(token, now);
  if (row.assistance_category === "shipment_observation") throw new SupportError("Our team will call you about your request.", "request_only");
  if (row.assistance_category === "buying_assistance" && attachment) throw new SupportError("These requests do not accept attachments.", "invalid_attachment");
  if (row.status === "closed") throw new SupportError("This conversation is closed.", "closed");
  const rate = await consumeRuntimeRateLimit(`public-support:message:${ipHash}:${tokenHash}`, 30, 10 * 60 * 1000, 30 * 60 * 1000);
  if (!rate.allowed) throw new SupportError("Too many messages were sent. Please try again later.", "rate_limited");
  const senderKey = visitorSenderKey(tokenHash);
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const current = await requirePublicConversation(token, now);
    if (current.row.status === "closed") throw new SupportError("This conversation is closed.", "closed");
    const existing = await runtimeGet<{ id: number; conversation_id: number; body: string }>(`
      SELECT id,conversation_id,body FROM support_messages WHERE sender_key=? AND idempotency_key=?
    `, [senderKey, key]);
    if (existing) {
      if (existing.conversation_id !== row.id || existing.body !== body) throw new SupportError("Request could not be accepted.", "idempotency_conflict");
      return { id: existing.id, duplicate: true };
    }
    const result = await runtimeGet<{ id: number }>(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at
      ) VALUES(?,NULL,'visitor',?,?,?,?) RETURNING id
    `, [row.id, senderKey, body, key, now]);
    const messageId = Number(result!.id);
    await insertSupportAttachment(messageId, attachment, now);
    await runtimeRun(`
      UPDATE support_conversations
      SET updated_at=?,last_message_at=?,visitor_last_read_message_id=?
      WHERE id=?
    `, [now, now, messageId, row.id]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,NULL,'message','public visitor message',?)
    `, [row.id, now]);
    return { id: messageId, duplicate: false };
  });
}

export async function closePublicSupportConversation(token: unknown, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const { row } = await requirePublicConversation(token, now);
    if (row.assistance_category === "shipment_observation") throw new SupportError("Our team will call you about your request.", "request_only");
    if (row.status === "closed") return { duplicate: true };
    await runtimeRun(`
      UPDATE support_conversations SET status='closed',closed_at=?,updated_at=? WHERE id=?
    `, [now, now, row.id]);
    await runtimeRun(`
      UPDATE support_assignments SET released_at=?
      WHERE conversation_id=? AND released_at IS NULL
    `, [now, row.id]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,NULL,'closed','visitor ended conversation',?)
    `, [row.id, now]);
    return { duplicate: false };
  });
}

export async function listSupportConversations(
  user: SessionUser,
  input: { page?: unknown; q?: unknown; status?: unknown; queue?: unknown },
): Promise<PageResult<SupportConversation>> {
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
    where += ` AND ((c.status='waiting' AND ${SUPPORT_WAITING_SCOPE_SQL}) OR c.assigned_user_id=?)`;
    params.push(user.id, user.id);
  } else if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Support access is required.", "forbidden");
  }
  if (input.queue === "transport") {
    if (user.access_role !== "team_member" && !hasCapability(user, "operations:manage")) throw new SupportError("Transport queue access is required.", "forbidden");
    where += " AND c.assistance_category IN ('shipment_observation','buying_assistance')";
  }
  if (input.queue === "support") where += " AND c.assistance_category NOT IN ('shipment_observation','buying_assistance')";
  if (input.status === "active") where += " AND c.status IN ('waiting','open')";
  else if (input.status === "history") where += " AND c.status='closed' AND c.resolved_at IS NULL";
  else if (input.status === "resolved") where += " AND c.resolved_at IS NOT NULL";
  else if (status) {
    where += " AND c.status=?";
    params.push(status);
  }
  if (request.search) {
    const pattern = likePattern(request.search);
    where += " AND (lower(c.subject) LIKE ? ESCAPE '\\' OR lower(c.public_ref) LIKE ? ESCAPE '\\' OR lower(COALESCE(b.name,c.requester_label)) LIKE ? ESCAPE '\\' OR COALESCE(c.visitor_phone,'') LIKE ? ESCAPE '\\')";
    params.push(pattern, pattern, pattern, pattern);
  }
  const total = Number((await runtimeGet<{ total: number }>(`
    SELECT COUNT(*) total FROM support_conversations c
    LEFT JOIN businesses b ON b.id=c.business_id${where}
  `, params))?.total || 0);
  const window = pageWindow(total, request);
  const rows = await runtimeAll<ConversationRow>(`
    ${baseSelect(input.queue === "transport")}${where}
    ORDER BY CASE c.status WHEN 'waiting' THEN 0 WHEN 'open' THEN 1 ELSE 2 END,
      c.last_message_at DESC,c.id DESC
    LIMIT ? OFFSET ?
  `, [...params, window.limit, window.offset]);
  return pageResult(rows.map((row) => conversationView(row, user)), total, request);
}

export async function getSupportConversation(user: SessionUser, conversationId: number) {
  const row = await requireConversation(user, conversationId);
  const messages = (await runtimeAll<{
    id: number;
    conversation_id: number;
    sender_user_id: number | null;
    sender_kind: "user" | "visitor";
    sender_name: string;
    sender_role: string;
    visitor_visible: boolean;
    body: string;
    created_at: number;
  } & AttachmentColumns>(`
    SELECT m.id,m.conversation_id,m.sender_user_id,m.sender_kind,
      CASE WHEN m.sender_kind='visitor' THEN c.requester_label ELSE u.name END sender_name,
      CASE WHEN m.sender_kind='visitor' THEN 'visitor'
        ELSE COALESCE(p.access_role,CASE WHEN u.role='admin' THEN 'platform_admin' ELSE 'client' END) END sender_role,
      m.visitor_visible,m.body,m.created_at,a.id attachment_id,a.original_name attachment_original_name,
      a.mime_type attachment_mime_type,a.byte_size attachment_byte_size
    FROM support_messages m
    JOIN support_conversations c ON c.id=m.conversation_id
    LEFT JOIN users u ON u.id=m.sender_user_id
    LEFT JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_attachments a ON a.message_id=m.id
    WHERE m.conversation_id=?
    ORDER BY m.id DESC LIMIT 100
  `, [conversationId])).reverse();
  const lastId = messages.at(-1)?.id || 0;
  const readColumn = user.access_role === "client" ? "client_last_read_message_id" : "staff_last_read_message_id";
  await runtimeRun(`
    UPDATE support_conversations
    SET ${readColumn}=CASE WHEN ${readColumn}<? THEN ? ELSE ${readColumn} END
    WHERE id=?
  `, [lastId, lastId, conversationId]);
  return {
    conversation: conversationView({ ...row, last_message_id: lastId }, user),
    messages: messages.map((message): SupportMessage => ({
      id: message.id,
      conversationId: message.conversation_id,
      senderUserId: message.sender_user_id,
      senderName: message.sender_name,
      senderRole: message.sender_role,
      visitorVisible: message.visitor_visible,
      body: message.body,
      createdAt: message.created_at,
      attachment: attachmentView(message),
    })),
  };
}

export async function getSupportAttachment(user: SessionUser, conversationId: number, attachmentId: number) {
  if (!Number.isSafeInteger(attachmentId) || attachmentId < 1) throw new SupportError("Attachment was not found.", "not_found");
  await requireConversation(user, conversationId);
  const attachment = await runtimeGet<{
    storage_key: string;
    original_name: string;
    mime_type: SupportAttachment["mimeType"];
    byte_size: number;
  }>(`
    SELECT a.storage_key,a.original_name,a.mime_type,a.byte_size
    FROM support_attachments a
    JOIN support_messages m ON m.id=a.message_id
    WHERE a.id=? AND m.conversation_id=?
  `, [attachmentId, conversationId]);
  if (!attachment) throw new SupportError("Attachment was not found.", "not_found");
  return attachment;
}

export async function postSupportMessage(
  user: SessionUser,
  conversationId: number,
  input: { audience?: unknown; message: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null },
  now = Date.now(),
) {
  const body = cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  const attachment = supportAttachment(input.attachment);
  if (!body) throw new SupportError("Write a support message.", "message_required");
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const row = await requireConversation(user, conversationId);
    const closedNote = row.assistance_category === "buying_assistance" && user.access_role !== "client" && input.audience === "note";
    if (row.status === "closed" && !closedNote) throw new SupportError("Reopen this conversation before replying.", "closed");
    if (user.access_role !== "client" && row.assigned_user_id !== user.id && !hasCapability(user, "operations:manage")) {
      throw new SupportError("Claim this conversation before replying.", "unassigned");
    }
    if (input.audience != null && input.audience !== "reply" && input.audience !== "note") throw new SupportError("Request could not be accepted.", "invalid_audience");
    const visible = row.assistance_category === "buying_assistance" && input.audience === "reply";
    if (visible && attachment) throw new SupportError("These requests do not accept attachments.", "invalid_attachment");
    const existing = await runtimeGet<{ id: number; conversation_id: number; body: string; visitor_visible: boolean }>(`
      SELECT id,conversation_id,body,visitor_visible FROM support_messages WHERE sender_key=? AND idempotency_key=?
    `, [`user:${user.id}`, key]);
    if (existing) {
      if (existing.conversation_id !== conversationId || existing.body !== body || existing.visitor_visible !== visible) throw new SupportError("Request could not be accepted.", "idempotency_conflict");
      return { id: existing.id, duplicate: true };
    }
    const result = await runtimeGet<{ id: number }>(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible
      ) VALUES(?,?,'user',?,?,?,?,?) RETURNING id
    `, [conversationId, user.id, `user:${user.id}`, body, key, now, visible ? "true" : "false"]);
    const messageId = Number(result!.id);
    await insertSupportAttachment(messageId, attachment, now);
    const readColumn = user.access_role === "client"
      ? "client_last_read_message_id"
      : "staff_last_read_message_id";
    await runtimeRun(`
      UPDATE support_conversations
      SET updated_at=?,last_message_at=?,${readColumn}=?
      WHERE id=?
    `, [now, now, messageId, conversationId]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'message','message posted',?)
    `, [conversationId, user.id, now]);
    return { id: messageId, duplicate: false };
  });
}

async function activeAssignmentCount(userId: number) {
  return Number((await runtimeGet<{ total: number }>(`
    SELECT COUNT(*) total FROM support_conversations
    WHERE assigned_user_id=? AND status='open'
  `, [userId]))?.total || 0);
}

export async function claimSupportConversation(
  user: SessionUser,
  conversationId: number,
  now = Date.now(),
) {
  if (user.access_role !== "team_member" && !hasCapability(user, "operations:manage")) {
    throw new SupportError("Staff access is required.", "forbidden");
  }
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const row = await requireConversation(user, conversationId);
    if (row.status !== "waiting") {
      if (row.assigned_user_id === user.id && row.status === "open") return { duplicate: true };
      throw new SupportError("This conversation is already assigned.", "already_assigned");
    }
    const workload = await supportAgentWorkload(user.id);
    if (!workload?.enabled || !acceptsQueue(workload.queue_scope, row.assistance_category)) {
      throw new SupportError("This account is not enabled for support assignments.", "not_support_agent");
    }
    if (workload.open_count >= workload.max_open_conversations) {
      throw new SupportError("Close a current conversation before claiming another.", "capacity");
    }
    await assignConversation(conversationId, user.id, user.id, "claimed", now);
    return { duplicate: false };
  });
}

export async function closeSupportConversation(user: SessionUser, conversationId: number, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const row = await requireConversation(user, conversationId);
    if (
      user.access_role !== "client" &&
      row.assigned_user_id !== user.id &&
      !hasCapability(user, "operations:manage")
    ) {
      throw new SupportError("Only the assigned team member can close this conversation.", "forbidden");
    }
    const resolving = row.assistance_category === "buying_assistance";
    if (row.status === "closed" && (!resolving || row.resolved_at !== null)) return;
    await runtimeRun(`
      UPDATE support_conversations SET status='closed',closed_at=COALESCE(closed_at,?),resolved_at=?,updated_at=? WHERE id=?
    `, [now, resolving ? now : null, now, conversationId]);
    await runtimeRun(`
      UPDATE support_assignments SET released_at=?
      WHERE conversation_id=? AND released_at IS NULL
    `, [now, conversationId]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'closed',?,?)
    `, [conversationId, user.id, resolving ? "request resolved" : "conversation closed", now]);
  });
}

export async function reopenSupportConversation(user: SessionUser, conversationId: number, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const row = await requireConversation(user, conversationId);
    if (row.status !== "closed") return;
    if (user.access_role === "client" || hasCapability(user, "operations:manage")) {
      const agent = await leastLoadedAgent(row.assistance_category);
      if (agent) {
        await assignConversation(conversationId, agent.id, user.id, "reopened", now);
      } else {
        await runtimeRun(`
          UPDATE support_conversations
          SET status='waiting',assigned_user_id=NULL,closed_at=NULL,resolved_at=NULL,updated_at=?
          WHERE id=?
        `, [now, conversationId]);
      }
      await runtimeRun(`
        INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
        VALUES(?,?,'reopened','conversation reopened',?)
      `, [conversationId, user.id, now]);
      return;
    }
    if (row.assigned_user_id !== user.id && !hasCapability(user, "operations:manage")) {
      throw new SupportError("Only the assigned team member can reopen this conversation.", "forbidden");
    }
    const workload = row.assigned_user_id ? await supportAgentWorkload(row.assigned_user_id) : null;
    if (row.assigned_user_id && (!workload?.enabled || !acceptsQueue(workload.queue_scope, row.assistance_category) || workload.open_count >= workload.max_open_conversations)) {
      throw new SupportError("The assigned team member is at capacity.", "capacity");
    }
    if (!row.assigned_user_id) throw new SupportError("Assign an agent before reopening.", "unassigned");
    await assignConversation(conversationId, row.assigned_user_id, user.id, "reopened", now);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'reopened','staff reopened',?)
    `, [conversationId, user.id, now]);
  });
}

export async function listSupportAgentWorkloads(user: SessionUser): Promise<SupportAgentWorkload[]> {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  return (await runtimeAll<{
    user_id: number;
    name: string;
    email: string;
    enabled: number;
    queue_scope: SupportQueueScope;
    max_open_conversations: number;
    open_count: number;
  }>(`
    SELECT u.id user_id,u.name,u.email,COALESCE(s.enabled,0) enabled,COALESCE(s.queue_scope,'all') queue_scope,
      COALESCE(s.max_open_conversations,3) max_open_conversations,
      COUNT(c.id) open_count
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE p.access_role IN ('team_member','operations_manager')
    GROUP BY u.id,u.name,u.email,s.enabled,s.queue_scope,s.max_open_conversations
    ORDER BY COALESCE(s.enabled,0) DESC,COUNT(c.id),lower(u.name)
  `)).map((value) => {
    return {
      userId: value.user_id,
      name: value.name,
      email: value.email,
      enabled: Boolean(value.enabled),
      queueScope: value.queue_scope,
      maxOpenConversations: value.max_open_conversations,
      openConversations: value.open_count,
    };
  });
}

function supportAgentRows() {
  return `
    SELECT u.id user_id,u.name,u.email,COALESCE(s.enabled,0) enabled,COALESCE(s.queue_scope,'all') queue_scope,
      COALESCE(s.max_open_conversations,3) max_open_conversations,
      COUNT(c.id) open_count
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE p.access_role IN ('team_member','operations_manager')
    GROUP BY u.id,u.name,u.email,s.enabled,s.queue_scope,s.max_open_conversations
  `;
}

function workloadView(row: {
  user_id: number;
  name: string;
  email: string;
  enabled: number;
  queue_scope: SupportQueueScope;
  max_open_conversations: number;
  open_count: number;
}): SupportAgentWorkload {
  return {
    userId: row.user_id,
    name: row.name,
    email: row.email,
    enabled: Boolean(row.enabled),
    queueScope: row.queue_scope,
    maxOpenConversations: row.max_open_conversations,
    openConversations: row.open_count,
  };
}

export async function listSupportAgentWorkloadsPage(
  user: SessionUser,
  input: { page?: unknown; q?: unknown; status?: unknown },
): Promise<PageResult<SupportAgentWorkload>> {
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
  const total = Number((await runtimeGet<{ count: number }>(`
    WITH workloads AS (${supportAgentRows()})
    SELECT COUNT(*) count FROM workloads ${where}
  `, values))?.count || 0);
  const window = pageWindow(total, request);
  const rows = await runtimeAll<{
    user_id: number;
    name: string;
    email: string;
    enabled: number;
    queue_scope: SupportQueueScope;
    max_open_conversations: number;
    open_count: number;
  }>(`
    WITH workloads AS (${supportAgentRows()})
    SELECT * FROM workloads ${where}
    ORDER BY enabled DESC,open_count,lower(name),user_id
    LIMIT ? OFFSET ?
  `, [...values, window.limit, window.offset]);
  return pageResult(rows.map(workloadView), total, request);
}

export async function getSupportAgentSummary(user: SessionUser): Promise<SupportAgentSummary> {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  const row = (await runtimeGet<{
    total_agents: number;
    enabled_agents: number;
    available_agents: number;
    full_agents: number;
    open_assignments: number;
    waiting_conversations: number;
  }>(`
    WITH workloads AS (${supportAgentRows()})
    SELECT
      COUNT(*) total_agents,
      SUM(CASE WHEN enabled=1 THEN 1 ELSE 0 END) enabled_agents,
      SUM(CASE WHEN enabled=1 AND open_count<max_open_conversations THEN 1 ELSE 0 END) available_agents,
      SUM(CASE WHEN enabled=1 AND open_count>=max_open_conversations THEN 1 ELSE 0 END) full_agents,
      SUM(open_count) open_assignments,
      (SELECT COUNT(*) FROM support_conversations WHERE status='waiting') waiting_conversations
    FROM workloads
  `))!;
  return {
    totalAgents: Number(row.total_agents || 0),
    enabledAgents: Number(row.enabled_agents || 0),
    availableAgents: Number(row.available_agents || 0),
    fullAgents: Number(row.full_agents || 0),
    openAssignments: Number(row.open_assignments || 0),
    waitingConversations: Number(row.waiting_conversations || 0),
  };
}

export async function updateSupportAgentSetting(
  user: SessionUser,
  input: { userId: unknown; enabled: unknown; maxOpenConversations: unknown; queueScope?: unknown },
  now = Date.now(),
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const userId = Number.parseInt(String(input.userId ?? ""), 10);
    const maximum = Number.parseInt(String(input.maxOpenConversations ?? ""), 10);
    const enabled = input.enabled === true || input.enabled === "1" || input.enabled === "on";
    if (!Number.isInteger(userId) || !Number.isInteger(maximum) || maximum < 1 || maximum > 20) {
      throw new SupportError("Support agent settings are invalid.", "invalid_setting");
    }
    const staff = await runtimeGet(`
      SELECT 1 FROM user_access_profiles
      WHERE user_id=? AND access_role IN ('team_member','operations_manager')
    `, [userId]);
    if (!staff) throw new SupportError("Support agent was not found.", "invalid_agent");
    const scope = input.queueScope === undefined ? (await supportAgentWorkload(userId))?.queue_scope || "all" : input.queueScope;
    if (scope !== "all" && scope !== "support" && scope !== "transport") throw new SupportError("Choose a support queue.", "invalid_setting");
    const incompatible = await runtimeGet<{count:number}>(`SELECT COUNT(*) count FROM support_conversations
      WHERE assigned_user_id=? AND status='open' AND ?<>'all' AND
      (CASE WHEN assistance_category IN ('shipment_observation','buying_assistance') THEN 'transport' ELSE 'support' END)<>?`, [userId,scope,scope]);
    if (Number(incompatible?.count)) throw new SupportError("Reassign open conversations before changing this queue.", "capacity");
    const openConversations = await activeAssignmentCount(userId);
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
    await runtimeRun(`
      INSERT INTO support_agent_settings(
        user_id,enabled,max_open_conversations,updated_by_user_id,updated_at,queue_scope
      ) VALUES(?,?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET
        enabled=excluded.enabled,
        queue_scope=excluded.queue_scope,
        max_open_conversations=excluded.max_open_conversations,
        updated_by_user_id=excluded.updated_by_user_id,
        updated_at=excluded.updated_at
    `, [userId, enabled ? 1 : 0, maximum, user.id, now, scope]);
  });
}

export async function reassignSupportConversation(
  user: SessionUser,
  conversationId: number,
  assignedUserId: number | null,
  now = Date.now(),
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const row = await requireConversation(user, conversationId);
    if (row.status === "closed") throw new SupportError("Reopen this conversation before assigning it.", "closed");
    if (row.assigned_user_id === assignedUserId) return;
    if (assignedUserId === null) {
      await runtimeRun(`
        UPDATE support_assignments SET released_at=?
        WHERE conversation_id=? AND released_at IS NULL
      `, [now, conversationId]);
      await runtimeRun(`
        UPDATE support_conversations
        SET assigned_user_id=NULL,status='waiting',closed_at=NULL,updated_at=?
        WHERE id=?
      `, [now, conversationId]);
    } else {
      const workload = await supportAgentWorkload(assignedUserId);
      if (!workload?.enabled || !acceptsQueue(workload.queue_scope, row.assistance_category) || workload.open_count >= workload.max_open_conversations) {
        throw new SupportError("That support agent is unavailable or at capacity.", "capacity");
      }
      await assignConversation(conversationId, assignedUserId, user.id, "reassigned", now);
    }
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'reassigned',?,?)
    `, [conversationId, user.id, assignedUserId === null ? "waiting" : `agent:${assignedUserId}`, now]);
  });
}

function transportField(value: unknown, message: string, max: number) {
  if (typeof value !== "string" || value.trim().length > max) throw new SupportError(message, "invalid_transport");
  const text = cleanText(value, max).replace(/\s+/g, " ").trim();
  if (!text) throw new SupportError(message, "invalid_transport");
  return text;
}

export type TransportHandoff = { id: number; company: string; contact: string; createdAt: number };

export async function getTransportHandoff(user: SessionUser, conversationId: number): Promise<TransportHandoff | null> {
  const row = await requireConversation(user, conversationId);
  if (!hasCapability(user, "operations:manage") && !(user.access_role === "team_member" && row.assigned_user_id === user.id)) throw new SupportError("Transport queue access is required.", "forbidden");
  if (row.assistance_category !== "shipment_observation") throw new SupportError("Transport request was not found.", "not_found");
  const event = await runtimeGet<{id:number;detail:string;created_at:number}>(
    "SELECT id,detail,created_at FROM support_events WHERE conversation_id=? AND event_type='transport_handoff' ORDER BY id DESC LIMIT 1", [conversationId]);
  if (!event) return null;
  const detail = JSON.parse(event.detail) as {company:string;contact:string};
  return {id:event.id,company:detail.company,contact:detail.contact,createdAt:event.created_at};
}

export async function saveTransportHandoff(user: SessionUser, conversationId: number,
  input: {company:unknown;contact:unknown;previousId:unknown}, now=Date.now()) {
  const company = transportField(input.company, "Enter the company name.", 120);
  const contact = transportField(input.contact, "Enter the company contact.", 254);
  const previousId = Number(input.previousId);
  if (!Number.isSafeInteger(previousId) || previousId < 0) throw new SupportError("Reload this request and try again.", "conflict");
  return runtimeTransaction(async () => {
    await lockSupportWork();
    await runtimeGet("SELECT id FROM support_conversations WHERE id=? FOR UPDATE", [conversationId]);
    const row = await requireConversation(user, conversationId);
    if (row.status === "closed") throw new SupportError("Reopen this request before changing the company.", "closed");
    const current = await getTransportHandoff(user, conversationId);
    if (current?.company === company && current.contact === contact) return current;
    if ((current?.id || 0) !== previousId) throw new SupportError("The company was changed by someone else. Reload and try again.", "conflict");
    const event = await runtimeGet<{id:number}>(`INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'transport_handoff',?,?) RETURNING id`, [conversationId,user.id,JSON.stringify({company,contact}),now]);
    return {id:event!.id,company,contact,createdAt:now};
  });
}

export async function getSupportAssignmentHistory(user: SessionUser, conversationId: number) {
  if (user.access_role === "client") throw new SupportError("Staff access is required.", "forbidden");
  await requireConversation(user, conversationId);
  return runtimeAll<{id:number;agent_name:string;assigned_by:string|null;reason:string;assigned_at:number;released_at:number|null}>(`
    SELECT a.id,u.name agent_name,actor.name assigned_by,a.reason,a.assigned_at,a.released_at
    FROM support_assignments a JOIN users u ON u.id=a.assigned_user_id
    LEFT JOIN users actor ON actor.id=a.assigned_by_user_id
    WHERE a.conversation_id=? ORDER BY a.id DESC LIMIT 20`, [conversationId]);
}
