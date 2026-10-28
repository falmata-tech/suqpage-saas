import {selectTransportCoordinator} from './transport-coordinator';
import { buyingService, isCallbackRequest, type BuyingService } from "./buying-assistance";
import { platformCookies } from "./platform-state";
import crypto from "node:crypto";
import { hasCapability } from "./capabilities";
import { authDriver } from "./config";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import {
  likePattern,
  normalizePageRequest,
  pageResult,
  pageWindow,
  type PageResult,
} from "./pagination";
import { cleanText, hashPrivateValue } from "./security-core";
import { notifySupportQueue } from "./support-notifications";
import { confirmedMessageId, type ChatReadCommand } from './chat-read-contract';
import { enqueueChatAttention, enqueueReplyOverdueAttention } from './attention-postgres';
import { consumeRuntimeRateLimit } from "./rate-limit-runtime";
import { assertMediaObjectKey } from "./media-storage";
import type { SessionUser } from "./types";
import { supportIdleDeadlines,SUPPORT_IDLE_WINDOWS,SUPPORT_IDLE_SWEEP_LIMIT } from './support-idle-contract';
import { supportReplyState, SUPPORT_STAFF_REPLY_TARGET_MS, SUPPORT_UNASSIGNED_QUEUE_TARGET_MS, SUPPORT_REPLY_SWEEP_LIMIT, type SupportReplyState } from './support-response-contract';
import {supportIdleEndEvidence,type SupportIdleEndEvidence} from './support-idle-evidence';
import {SUPPORT_ACTIVE_ASSIGNMENT_JOIN,SUPPORT_RESPONSE_DEADLINE_SQL,SUPPORT_RESPONSE_EPOCH_SQL,SUPPORT_RESPONSE_START_SQL} from './support-response-sql';
import {participantTransportPlan} from './transport-plan';
import {transportLiveWait} from './transport-live-wait';
import type {TransportPlan} from '@africmade/contracts';

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
  { key: "general", label: "AfricMade help or report", description: "Ask how AfricMade works or report a concern about a listing." },
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
  transportCallback?: { phone:string; email:string|null; submitted:boolean };
  subject: string;
  status: SupportStatus;
  assignedUserId: number | null;
  assignedUserName: string | null;
  lastMessageAt: number;
  createdAt: number;
  transportWaitStartedAt?: number;
  agentJoinedAt?: number | null;
  firstStaffReplyAt?: number | null;
  closedAt: number | null;
  resolvedAt: number | null;
  requestSummary: string;
  unread: boolean;
  agentJoined: boolean;
  /** Saved assignment identity, independent of whether its first join occurred. */
  readEpoch?: string;
  idleWarningAt?: number | null;
  idleEndsAt?: number | null;
  idleEndedAt?: number | null;
  replyState?: SupportReplyState;
  staffReplyDueAt?: number | null;
  transportPlan?: TransportPlan;
  transportPlanLink?: string;
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
  read: boolean;
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
  accessRole: SessionUser["access_role"];
  name: string;
  email: string;
  enabled: boolean;
  queueScope: SupportQueueScope;
  openConversations: number;
};

export type SupportAgentSummary = {
  totalAgents: number;
  enabledAgents: number;
  availableAgents: number;
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
  client_confirmed_read_message_id: number;
  staff_confirmed_read_message_id: number;
  visitor_confirmed_read_message_id: number;
  staff_joined_user_id: number | null;
  staff_joined_at: number | null;
  assignment_epoch: number;
  last_message_id: number;
  participant_last_message_id: number;
  reply_last_message_id: number;
  created_at: number;
  last_message_at: number;
  closed_at: number | null;
  resolved_at: number | null;
  request_summary: string;
  awaiting_participant_since?: number | null;
  idle_ended_at?: number | null;
  awaiting_staff_since?: number | null;
  awaiting_staff_message_id?: number | null;
  overdue_notified_message_id?: number | null;
  staff_joined_assignment_id?: number | null;
  overdue_notified_assignment_id?: number | null;
  active_assignment_id?: number;
  assignment_at?: number | null;
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

function explicitlyJoined(row: ConversationRow) {
  return row.status==='open' && row.assigned_user_id!==null && row.assignment_epoch>0 &&
    row.staff_joined_assignment_id===row.assignment_epoch && row.staff_joined_user_id===row.assigned_user_id && row.staff_joined_at!==null;
}

function responseView(row: ConversationRow, now=Date.now()) {
  return supportReplyState({status:row.status,resolvedAt:row.resolved_at,awaitingStaffSince:row.awaiting_staff_since,
    awaitingParticipantSince:row.awaiting_participant_since,assignedAt:row.assignment_at},now);
}

function conversationView(row: ConversationRow, user: SessionUser, now=Date.now()): SupportConversation {
  const lastRead = user.access_role === "client"
    ? row.client_confirmed_read_message_id
    : row.staff_confirmed_read_message_id;
  const lastIncoming = user.access_role === 'client' ? row.reply_last_message_id : row.participant_last_message_id;
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
    assignedUserName: user.access_role==='client'&&!explicitlyJoined(row)?null:row.assigned_user_name,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    transportWaitStartedAt: row.created_at,
    agentJoinedAt: explicitlyJoined(row)?row.staff_joined_at:null,
    closedAt: row.closed_at,
    resolvedAt: row.resolved_at,
    requestSummary: row.request_summary || "",
    unread: lastIncoming > lastRead,
    agentJoined: explicitlyJoined(row),
    readEpoch: String(row.assignment_epoch),
    ...supportIdleDeadlines(row.awaiting_participant_since??null,row.participant_kind==='visitor'?'guest':'owner'),
    idleEndedAt:row.idle_ended_at??null,
    ...responseView(row,now),
    staffReplyDueAt:user.access_role==='client'?null:responseView(row,now).staffReplyDueAt,
  };
}

// NULL is deliberately historical: only visitors/the recorded opener have a
// provable participant side. Mutable current roles must never rewrite history.
const participantMessageSql="(COALESCE(m.sender_side='participant',m.sender_kind='visitor' OR m.sender_user_id=c.opened_by_user_id,FALSE))";

function baseSelect(includeTransportCompany = false) {
  return `
    SELECT c.*,${SUPPORT_RESPONSE_EPOCH_SQL} active_assignment_id,current_assignment.assigned_at assignment_at,
      (SELECT COALESCE(MAX(a.id),0) FROM support_assignments a WHERE a.conversation_id=c.id) assignment_epoch,${includeTransportCompany ? `(SELECT e.detail::jsonb->>'company' FROM support_events e
      WHERE e.conversation_id=c.id AND e.event_type='transport_handoff' ORDER BY e.id DESC LIMIT 1) transport_company,` : ""}
      COALESCE(b.name,c.requester_label) business_name,assignee.name assigned_user_name,
      (SELECT m.body FROM support_messages m WHERE m.conversation_id=c.id ORDER BY m.id LIMIT 1) request_summary,
      COALESCE((SELECT MAX(m.id) FROM support_messages m WHERE m.conversation_id=c.id),0) last_message_id,
      COALESCE((SELECT MAX(m.id) FROM support_messages m WHERE m.conversation_id=c.id
        AND ${participantMessageSql}),0) participant_last_message_id,
      COALESCE((SELECT MAX(m.id) FROM support_messages m WHERE m.conversation_id=c.id
        AND NOT ${participantMessageSql}
        AND (c.assistance_category NOT IN ('buying_assistance','shipment_observation') OR m.visitor_visible=TRUE)),0) reply_last_message_id
    FROM support_conversations c
    LEFT JOIN businesses b ON b.id=c.business_id
    LEFT JOIN users assignee ON assignee.id=c.assigned_user_id
    ${SUPPORT_ACTIVE_ASSIGNMENT_JOIN}
  `;
}

async function canRead(user: SessionUser, row: Pick<ConversationRow, "business_id" | "status" | "assigned_user_id" | "assistance_category">) {
  if (user.access_role === "client") return Boolean(row.business_id) && user.business_id === row.business_id && Boolean(await currentSupportClient(user));
  if (hasCapability(user, "operations:manage")) return true;
  if (user.access_role === "team_member") {
    if (row.assigned_user_id === user.id) return true;
    const workload = await supportAgentWorkload(user.id);
    return row.status === "waiting" && Boolean(workload?.enabled && acceptsQueue(workload.queue_scope, row.assistance_category));
  }
  return false;
}

async function currentSupportClient(user: SessionUser, lock = false) {
  if (user.access_role !== 'client' || !user.business_id) return null;
  return runtimeGet<{business_id:number}>(`SELECT u.business_id FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND u.business_id=? AND p.access_role='client'
    ${lock ? 'FOR SHARE OF u,p' : ''}`, [user.id,user.business_id]);
}

export async function assertOwnerTransport(user:SessionUser,conversationId?:number,publicRef?:unknown) {
  if (!await currentSupportClient(user)) throw new SupportError('A client account is required.','forbidden');
  if (conversationId === undefined) return;
  const row=await requireConversation(user,conversationId);
  if(row.participant_kind!=='client'||row.assistance_category!=='shipment_observation')throw new SupportError('Transport request was not found.','not_found');
  if(publicRef!==undefined&&(typeof publicRef!=='string'||publicRef!==row.public_ref))throw new SupportError('Request could not be accepted.','conversation_changed');
}

async function requireConversation(user: SessionUser, conversationId: number) {
  const row = await runtimeGet<ConversationRow>(`${baseSelect()} WHERE c.id=?`, [conversationId]);
  if (!row || !(await canRead(user, row))) {
    throw new SupportError("Support conversation was not found.", "not_found");
  }
  return row;
}

const TRANSPORT_CALLBACK_EVENT = 'transport callback submitted';
const TRANSPORT_CALLBACK_MESSAGE = 'Please contact me about this transport request using the contact details on this case.';

async function firstTransportStaffReplyAt(conversationId:number):Promise<number|null>{
  const row=await runtimeGet<{created_at:number|null}>(`SELECT MIN(m.created_at) created_at FROM support_messages m
    JOIN support_conversations c ON c.id=m.conversation_id
    WHERE m.conversation_id=? AND m.sender_kind='user' AND m.sender_user_id IS NOT NULL
      AND m.sender_side IS DISTINCT FROM 'participant' AND m.visitor_visible=TRUE
      AND (c.participant_kind='visitor' OR m.sender_user_id IS DISTINCT FROM c.opened_by_user_id)`,[conversationId]);
  return row?.created_at==null?null:Number(row.created_at);
}

async function noAgentTransportCallbackDue(row:ConversationRow,now:number,firstStaffReplyAt?:number|null):Promise<boolean>{
  if(row.assistance_category!=='shipment_observation'||row.status==='closed')return false;
  const phase=transportLiveWait({status:row.status,waitStartedAt:row.created_at,
    agentJoined:explicitlyJoined(row),agentJoinedAt:explicitlyJoined(row)?row.staff_joined_at:null,
    firstStaffReplyAt:firstStaffReplyAt===undefined?await firstTransportStaffReplyAt(row.id):firstStaffReplyAt},now).phase;
  return phase==='inbox';
}

async function hasTransportCallback(row:ConversationRow):Promise<boolean>{
  return Boolean(await runtimeGet<{id:number}>(`SELECT id FROM support_events
    WHERE conversation_id=? AND event_type='message' AND detail=? ORDER BY id LIMIT 1`,[row.id,TRANSPORT_CALLBACK_EVENT]));
}

/** Staff-only immutable journal. Absent/ambiguous historical proof stays unknown. */
export async function getSupportIdleEndEvidence(user:SessionUser,conversationId:number):Promise<SupportIdleEndEvidence|null>{
  const actor=await runtimeGet<{access_role:string;business_id:number|null}>(`SELECT p.access_role,u.business_id FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=?`,[user.id]);
  if(!actor||actor.access_role!==user.access_role||actor.business_id!==user.business_id||
    !['team_member','operations_manager','platform_admin'].includes(actor.access_role))throw new SupportError('Staff access is required.','forbidden');
  await requireConversation(user,conversationId);
  const event=await runtimeGet<{detail:string}>("SELECT detail FROM support_events WHERE conversation_id=? AND event_type='idle_ended' ORDER BY id DESC LIMIT 1",[conversationId]);
  return event?supportIdleEndEvidence(event.detail):null;
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
    throw new SupportError("Choose how AfricMade can help.", "category_required");
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

function optionalVisitorEmail(value:unknown):string|null{
  if(value==null||typeof value==='string'&&!value.trim())return null;
  return visitorEmail(value);
}

async function submitTransportCallbackLocked(
  row:ConversationRow,
  input:{phone:unknown;email?:unknown;idempotencyKey:unknown},
  senderKey:string,
  actorUserId:number|null,
  now:number,
){
  if(row.assistance_category!=='shipment_observation'||row.resolved_at!==null||row.status==='closed')throw new SupportError('This callback request is no longer available.','not_found');
  const phone=visitorPhone(input.phone),email=optionalVisitorEmail(input.email),key=idempotency(input.idempotencyKey);
  const submitted=await hasTransportCallback(row);
  const existing=await runtimeGet<{id:number;body:string;idempotency_key:string}>(`SELECT id,body,idempotency_key FROM support_messages WHERE conversation_id=? AND sender_key=? AND idempotency_key=?`,[row.id,senderKey,key]);
  if(submitted){
    if(existing&&existing.body===TRANSPORT_CALLBACK_MESSAGE&&row.visitor_phone===phone&&row.visitor_email===email)return {duplicate:true};
    throw new SupportError('Your contact request has already been sent.','callback_already_submitted');
  }
  if(!await noAgentTransportCallbackDue(row,now))throw new SupportError('The live chat is still available.','callback_not_ready');
  if(existing)throw new SupportError('Request could not be accepted.','idempotency_conflict');
  const result=await runtimeGet<{id:number}>(`INSERT INTO support_messages(
    conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible,sender_side
  ) VALUES(?,?,?, ?,?,?,?,TRUE,'participant') RETURNING id`,[
    row.id,actorUserId,row.participant_kind==='visitor'?'visitor':'user',senderKey,TRANSPORT_CALLBACK_MESSAGE,key,now,
  ]);
  const messageId=Number(result!.id);
  const readColumn=row.participant_kind==='visitor'?'visitor_last_read_message_id':'client_last_read_message_id';
  await runtimeRun(`UPDATE support_conversations SET visitor_phone=?,visitor_email=?,updated_at=?,last_message_at=?,
    ${readColumn}=?,awaiting_participant_since=NULL,idle_ended_at=NULL,awaiting_staff_since=?,awaiting_staff_message_id=? WHERE id=?`,
    [phone,email,now,now,messageId,now,messageId,row.id]);
  await runtimeRun(`INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
    VALUES(?,?,'message',?,?)`,[row.id,actorUserId,TRANSPORT_CALLBACK_EVENT,now]);
  await enqueueChatAttention({conversationId:row.id,source:`support-message:${messageId}`,kind:'message',direction:'staff',now});
  return {duplicate:false};
}

/** Adds one callback request to the existing visitor case; it never reopens a live portal. */
export async function submitPublicTransportCallback(
  token:unknown,input:{phone:unknown;email?:unknown;idempotencyKey:unknown},ipHash:string,now=Date.now(),
){
  const normalized=publicSupportToken(token),tokenHash=hashPrivateValue(`public-support:${normalized}`);
  return runtimeTransaction(async()=>{
    await lockSupportWork();
    const {row}=await requirePublicConversation(normalized,now);
    if(row.assistance_category!=='shipment_observation')throw new SupportError('This callback request is not available.','invalid_channel');
    if(!await hasTransportCallback(row)){
      const rate=await consumeRuntimeRateLimit(`public-support:callback:${ipHash}:${tokenHash}`,3,60*60*1000,60*60*1000);
      if(!rate.allowed)throw new SupportError('Please wait before sending another contact request.','rate_limited');
    }
    return submitTransportCallbackLocked(row,input,visitorSenderKey(tokenHash),null,now);
  });
}

/** The signed-in owner may request a callback only for their own transport case. */
export async function submitOwnerTransportCallback(
  user:SessionUser,conversationId:number,input:{publicRef:unknown;phone:unknown;email?:unknown;idempotencyKey:unknown},now=Date.now(),
){
  return runtimeTransaction(async()=>{
    await lockSupportWork();
    if(!await currentSupportClient(user,true))throw new SupportError('A client account is required.','forbidden');
    const row=await requireConversation(user,conversationId);
    if(row.participant_kind!=='client'||row.business_id!==user.business_id||row.assistance_category!=='shipment_observation')throw new SupportError('Transport request was not found.','not_found');
    if(input.publicRef!==row.public_ref)throw new SupportError('This chat changed. Please refresh.','conversation_changed');
    return submitTransportCallbackLocked(row,input,`user:${user.id}`,user.id,now);
  });
}

function acceptsQueue(scope: SupportQueueScope, category: SupportAssistanceCategory) {
  return scope === "all" || scope === (isCallbackRequest(category) ? "transport" : "support");
}
async function lockSupportWork() {
  await runtimeGet("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");
}
export const SUPPORT_IDLE_END_DETAIL='automatic inactivity ending';
const SUPPORT_IDLE_RESUME_DETAIL='visitor resumed automatically ended conversation';
export const SUPPORT_REPLY_OVERDUE_QUERY=`SELECT c.id,c.awaiting_staff_message_id,${SUPPORT_RESPONSE_EPOCH_SQL} assignment_id
 FROM support_conversations c
 ${SUPPORT_ACTIVE_ASSIGNMENT_JOIN}
 WHERE c.status IN ('waiting','open') AND c.resolved_at IS NULL
   AND c.awaiting_staff_since IS NOT NULL AND ${SUPPORT_RESPONSE_DEADLINE_SQL}<=?
   AND c.awaiting_staff_message_id IS NOT NULL
   AND (c.overdue_notified_message_id IS DISTINCT FROM c.awaiting_staff_message_id
     OR c.overdue_notified_assignment_id IS DISTINCT FROM ${SUPPORT_RESPONSE_EPOCH_SQL})
   AND EXISTS(SELECT 1 FROM user_access_profiles p LEFT JOIN support_agent_settings s ON s.user_id=p.user_id
     WHERE p.access_role IN ('platform_admin','operations_manager') OR
       (p.user_id=c.assigned_user_id AND p.access_role='team_member' AND s.queue_scope IN ('all',CASE
         WHEN c.assistance_category IN ('buying_assistance','shipment_observation') THEN 'transport' ELSE 'support' END)))
 ORDER BY ${SUPPORT_RESPONSE_START_SQL},c.id LIMIT ${SUPPORT_REPLY_SWEEP_LIMIT} FOR UPDATE OF c SKIP LOCKED`;

/** Escalates unanswered work without assigning, closing or changing its clock. */
export async function sweepSupportReplyOverdue(now=Date.now(),monotonicNow:()=>number=()=>performance.now()):Promise<{notified:number;skippedBusy:boolean}>{
 if(!Number.isSafeInteger(now)||now<0)throw new SupportError('Request could not be accepted.','invalid_request');
 const started=monotonicNow();
 return runtimeTransaction(async()=>{
  await runtimeRun("SET LOCAL statement_timeout='1000ms'");
  await runtimeRun("SET LOCAL idle_in_transaction_session_timeout='5000ms'");
  await runtimeRun("SET LOCAL lock_timeout='50ms'");
  const locked=await runtimeGet<{locked:boolean}>("SELECT pg_try_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0)) locked");
  if(!locked?.locked)return {notified:0,skippedBusy:true};
  if(monotonicNow()-started>=2500)return {notified:0,skippedBusy:false};
  const due=await runtimeAll<{id:number;awaiting_staff_message_id:number;assignment_id:number}>(SUPPORT_REPLY_OVERDUE_QUERY,[now]);
  let notified=0;
  for(const candidate of due){
   const remaining=3000-(monotonicNow()-started);if(remaining<500)break;
   await runtimeGet("SELECT set_config('statement_timeout',?,true)",[`${Math.min(1000,Math.floor(remaining))}ms`]);
   const recipients=await enqueueReplyOverdueAttention(candidate.id,candidate.awaiting_staff_message_id,candidate.assignment_id,now);
   if(!recipients)continue; // Keep durable work pending when nobody is authorized.
   const target=candidate.assignment_id>0?SUPPORT_STAFF_REPLY_TARGET_MS:SUPPORT_UNASSIGNED_QUEUE_TARGET_MS;
   const changed=await runtimeRun(`UPDATE support_conversations SET overdue_notified_message_id=?,overdue_notified_assignment_id=?
    WHERE id=? AND status IN ('waiting','open') AND resolved_at IS NULL
      AND awaiting_staff_since<=? AND awaiting_staff_message_id=?
      AND (overdue_notified_message_id IS DISTINCT FROM awaiting_staff_message_id OR overdue_notified_assignment_id IS DISTINCT FROM ?)`,
    [candidate.awaiting_staff_message_id,candidate.assignment_id,candidate.id,now-target,candidate.awaiting_staff_message_id,candidate.assignment_id]);
   if(changed.changes)notified++;
  }
  return {notified,skippedBusy:false};
 });
}
export const SUPPORT_IDLE_DUE_QUERY=`SELECT c.id,c.participant_kind,c.awaiting_participant_since
 FROM support_conversations c JOIN (
  (SELECT id,awaiting_participant_since FROM support_conversations
   WHERE participant_kind='visitor' AND status='open' AND assigned_user_id IS NOT NULL
    AND resolved_at IS NULL AND awaiting_participant_since IS NOT NULL AND awaiting_participant_since<=?
    AND assistance_category IN ('buying_assistance','shipment_observation')
   ORDER BY awaiting_participant_since,id LIMIT ${SUPPORT_IDLE_SWEEP_LIMIT})
  UNION ALL
  (SELECT id,awaiting_participant_since FROM support_conversations
   WHERE participant_kind='client' AND status='open' AND assigned_user_id IS NOT NULL
    AND resolved_at IS NULL AND awaiting_participant_since IS NOT NULL AND awaiting_participant_since<=?
   ORDER BY awaiting_participant_since,id LIMIT ${SUPPORT_IDLE_SWEEP_LIMIT})
 ) due ON due.id=c.id
 WHERE c.status='open' AND c.assigned_user_id IS NOT NULL AND c.resolved_at IS NULL
 ORDER BY due.awaiting_participant_since+CASE c.participant_kind
  WHEN 'visitor' THEN ${SUPPORT_IDLE_WINDOWS.guest.endMs} ELSE ${SUPPORT_IDLE_WINDOWS.owner.endMs} END,c.id
 LIMIT ${SUPPORT_IDLE_SWEEP_LIMIT} FOR UPDATE OF c SKIP LOCKED`;

/** Internal scheduled command; never called by a read or a shared-preview timer. */
export async function sweepSupportInactivity(now=Date.now(),monotonicNow:()=>number=()=>performance.now()):Promise<{ended:number;skippedBusy:boolean}>{
 if(!Number.isSafeInteger(now)||now<0)throw new SupportError('Request could not be accepted.','invalid_request');
 const started=monotonicNow();
 return runtimeTransaction(async()=>{
  await runtimeRun("SET LOCAL statement_timeout='1000ms'");
  await runtimeRun("SET LOCAL idle_in_transaction_session_timeout='5000ms'");
  await runtimeRun("SET LOCAL lock_timeout='50ms'");
  const locked=await runtimeGet<{locked:boolean}>("SELECT pg_try_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0)) locked");
  if(!locked?.locked)return {ended:0,skippedBusy:true};
  if(monotonicNow()-started>=2500)return {ended:0,skippedBusy:false};
  const due=await runtimeAll<{id:number;participant_kind:SupportParticipantKind;awaiting_participant_since:number}>(SUPPORT_IDLE_DUE_QUERY,[now-SUPPORT_IDLE_WINDOWS.guest.endMs,now-SUPPORT_IDLE_WINDOWS.owner.endMs]);
  let ended=0;
  for(const candidate of due){
   const remaining=3000-(monotonicNow()-started);
   if(remaining<500)break;
   await runtimeGet("SELECT set_config('statement_timeout',?,true)",[`${Math.min(1000,Math.floor(remaining))}ms`]);
   const source=await runtimeGet<{id:number;created_at:number;confirmed_read:number}>(`SELECT m.id,m.created_at,
     CASE c.participant_kind WHEN 'visitor' THEN c.visitor_confirmed_read_message_id ELSE c.client_confirmed_read_message_id END confirmed_read
     FROM support_messages m JOIN support_conversations c ON c.id=m.conversation_id
     WHERE c.id=? AND m.created_at=? AND (m.sender_side='staff' OR
       (m.sender_side IS NULL AND m.sender_kind='user' AND m.sender_user_id IS DISTINCT FROM c.opened_by_user_id))
       AND (c.assistance_category NOT IN ('buying_assistance','shipment_observation') OR m.visitor_visible=TRUE)
     ORDER BY m.id DESC LIMIT 1`,[candidate.id,candidate.awaiting_participant_since]);
   const participant=source?await runtimeGet<{id:number;created_at:number}>(`SELECT m.id,m.created_at FROM support_messages m
     JOIN support_conversations c ON c.id=m.conversation_id WHERE c.id=? AND ${participantMessageSql} ORDER BY m.id DESC LIMIT 1`,[candidate.id]):undefined;
   const evidence=source?supportIdleEndEvidence({version:1,reason:'participant_no_reply',endedAt:now,
     waitingSince:candidate.awaiting_participant_since,windowMs:SUPPORT_IDLE_WINDOWS[candidate.participant_kind==='visitor'?'guest':'owner'].endMs,
     lastPublicStaffReply:{id:source.id,sentAt:source.created_at},latestParticipantMessage:participant?{id:participant.id,sentAt:participant.created_at}:null,
     lastReplyConfirmedReadAtEnding:source.confirmed_read>=source.id}):null;
   const changed=await runtimeRun(`UPDATE support_conversations
    SET status='closed',closed_at=?,updated_at=?,resolved_at=NULL,
      awaiting_participant_since=NULL,idle_ended_at=?,staff_joined_user_id=NULL,staff_joined_at=NULL,staff_joined_assignment_id=NULL,
      awaiting_staff_since=NULL,awaiting_staff_message_id=NULL
    WHERE id=? AND status='open' AND assigned_user_id IS NOT NULL AND resolved_at IS NULL
      AND awaiting_participant_since=? AND awaiting_participant_since<=?`,[
    now,now,now,candidate.id,candidate.awaiting_participant_since,
    now-SUPPORT_IDLE_WINDOWS[candidate.participant_kind==='visitor'?'guest':'owner'].endMs,
   ]);
   if(!changed.changes)continue;
   if(evidence)await runtimeRun(`INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
     VALUES(?,NULL,'idle_ended',?,?)`,[candidate.id,JSON.stringify(evidence),now]);
   await runtimeRun('UPDATE support_assignments SET released_at=? WHERE conversation_id=? AND released_at IS NULL',[now,candidate.id]);
   const event=await runtimeGet<{id:number}>(`INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
    VALUES(?,NULL,'closed',?,?) RETURNING id`,[candidate.id,SUPPORT_IDLE_END_DETAIL,now]);
   await enqueueChatAttention({conversationId:candidate.id,source:'support-idle-ended:'+event!.id,kind:'closed',direction:'participant',now});
   ended++;
  }
  return {ended,skippedBusy:false};
 });
}
export const SUPPORT_WAITING_SCOPE_SQL = `EXISTS(SELECT 1 FROM support_agent_settings s
  WHERE s.user_id=? AND s.enabled=1 AND (s.queue_scope='all'
    OR (s.queue_scope='transport' AND c.assistance_category IN ('shipment_observation','buying_assistance'))
    OR (s.queue_scope='support' AND c.assistance_category NOT IN ('shipment_observation','buying_assistance'))))`;

// Managed sign-in requires an immutable application identity link; never infer one
// from email or contact the provider while holding queue work locks.
const SUPPORT_AGENT_IDENTITY_SQL = `(?=0 OR EXISTS(
  SELECT 1 FROM auth_identity_links identity_link
  WHERE identity_link.user_id=s.user_id AND identity_link.provider='supabase'
))`;
const requiresManagedStaffIdentity = () => authDriver() === 'supabase' ? 1 : 0;

async function supportAgentWorkload(userId: number, requireSignInReady = false) {
  return runtimeGet<{
    enabled: number;
    queue_scope: SupportQueueScope;
  }>(`
    SELECT s.enabled,s.queue_scope
    FROM support_agent_settings s JOIN user_access_profiles p ON p.user_id=s.user_id
    WHERE s.user_id=? AND p.access_role IN ('team_member','operations_manager')
      AND ${SUPPORT_AGENT_IDENTITY_SQL}
  `, [userId, requireSignInReady ? requiresManagedStaffIdentity() : 0]);
}

async function leastLoadedAgent(category: SupportAssistanceCategory = "general") {
  return runtimeGet<{
    id: number;
    name: string;
    open_count: number;
  }>(`
    SELECT u.id,u.name,
      COUNT(c.id) open_count,
      (SELECT MAX(a.id) FROM support_assignments a WHERE a.assigned_user_id=u.id) last_assignment_id
    FROM support_agent_settings s
    JOIN users u ON u.id=s.user_id
    JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE s.enabled=1 AND p.access_role IN ('team_member','operations_manager')
      AND ${SUPPORT_AGENT_IDENTITY_SQL}
      AND (s.queue_scope='all' OR s.queue_scope=?)
    GROUP BY u.id,u.name
    ORDER BY COUNT(c.id),last_assignment_id ASC NULLS FIRST,u.id
    LIMIT 1
  `, [requiresManagedStaffIdentity(), isCallbackRequest(category) ? "transport" : "support"]);
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
    SET status='open',assigned_user_id=?,updated_at=?,closed_at=NULL,resolved_at=NULL,
        staff_joined_user_id=NULL,staff_joined_at=NULL,staff_joined_assignment_id=NULL,awaiting_participant_since=NULL,idle_ended_at=NULL,
        awaiting_staff_since=${reason==='reopened'?'NULL':'awaiting_staff_since'},awaiting_staff_message_id=${reason==='reopened'?'NULL':'awaiting_staff_message_id'},
        overdue_notified_message_id=NULL,overdue_notified_assignment_id=NULL
    WHERE id=?
  `, [assignedUserId, now, conversationId]);
  const event = await runtimeGet<{id:number}>(`
    INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
    VALUES(?,?,'assigned',?,?) RETURNING id
  `, [conversationId, assignedByUserId, `agent:${assignedUserId};reason:${reason}`, now]);
  const source='support-assignment:'+event!.id;
  await enqueueChatAttention({conversationId,source,kind:'assigned',direction:'staff',now});
}

export const SUPPORT_WAITING_CANDIDATE_LIMIT = 100;
export const SUPPORT_WAITING_TRANSITION_LIMIT = 25;
export const SUPPORT_WAITING_CANDIDATES_QUERY = `
  SELECT c.id,c.assistance_category FROM support_conversations c
  WHERE c.status='waiting' AND c.assigned_user_id IS NULL AND EXISTS(
    SELECT 1 FROM support_agent_settings s JOIN user_access_profiles p ON p.user_id=s.user_id
    WHERE s.enabled=1 AND p.access_role IN ('team_member','operations_manager')
      AND ${SUPPORT_AGENT_IDENTITY_SQL}
      AND (s.queue_scope='all' OR s.queue_scope=CASE
        WHEN c.assistance_category IN ('shipment_observation','buying_assistance') THEN 'transport' ELSE 'support' END)
  )
  ORDER BY c.created_at,c.id LIMIT ${SUPPORT_WAITING_CANDIDATE_LIMIT}
  FOR UPDATE OF c SKIP LOCKED
`;

/** Internal minute maintenance. Waiting always means eligible for automatic pickup. */
export async function sweepWaitingSupportAssignments(
  now = Date.now(),
  monotonicNow: () => number = () => performance.now(),
): Promise<{routed:number;skippedBusy:boolean}> {
  if (!Number.isSafeInteger(now) || now < 0) throw new SupportError("Request could not be accepted.", "invalid_request");
  const started = monotonicNow();
  return runtimeTransaction(async () => {
    await runtimeRun("SET LOCAL statement_timeout='1000ms'");
    await runtimeRun("SET LOCAL idle_in_transaction_session_timeout='5000ms'");
    await runtimeRun("SET LOCAL lock_timeout='50ms'");
    const locked = await runtimeGet<{locked:boolean}>("SELECT pg_try_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0)) locked");
    if (!locked?.locked) return {routed:0,skippedBusy:true};
    if (monotonicNow() - started >= 2500) return {routed:0,skippedBusy:false};
    const waiting = await runtimeAll<{id:number;assistance_category:SupportAssistanceCategory}>(SUPPORT_WAITING_CANDIDATES_QUERY, [requiresManagedStaffIdentity()]);
    let routed = 0;
    for (const conversation of waiting) {
      const remaining = 3000 - (monotonicNow() - started);
      if (routed >= SUPPORT_WAITING_TRANSITION_LIMIT || remaining < 500) break;
      await runtimeGet("SELECT set_config('statement_timeout',?,true)", [`${Math.min(1000,Math.floor(remaining))}ms`]);
      const agent = await leastLoadedAgent(conversation.assistance_category);
      if (!agent) continue;
      await assignConversation(conversation.id, agent.id, null, "automatic", now);
      routed++;
    }
    return {routed,skippedBusy:false};
  });
}

export type SupportRoutingResult = { routed: number; remaining: number };

/** An explicit availability command drains one bounded FIFO batch, never a read. */
export async function routeWaitingSupportConversations(
  user: SessionUser,
  now = Date.now(),
  options: { queue?: "support" | "transport" } = {},
): Promise<SupportRoutingResult> {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  if (options.queue !== undefined && options.queue !== "support" && options.queue !== "transport") {
    throw new SupportError("Choose a support queue.", "invalid_setting");
  }
  return runtimeTransaction(async () => {
    await lockSupportWork();
    if (!await runtimeGet("SELECT 1 FROM user_access_profiles WHERE user_id=? AND access_role IN ('platform_admin','operations_manager') FOR SHARE", [user.id])) {
      throw new SupportError("Operations access is required.", "forbidden");
    }
    const queueWhere = options.queue === "transport"
      ? " AND c.assistance_category IN ('shipment_observation','buying_assistance')"
      : options.queue === "support" ? " AND c.assistance_category NOT IN ('shipment_observation','buying_assistance')" : "";
    const waiting = await runtimeAll<{id:number;assistance_category:SupportAssistanceCategory}>(`
      SELECT c.id,c.assistance_category FROM support_conversations c
      WHERE c.status='waiting' AND c.assigned_user_id IS NULL${queueWhere} AND EXISTS(
        SELECT 1 FROM support_agent_settings s JOIN user_access_profiles p ON p.user_id=s.user_id
        WHERE s.enabled=1 AND p.access_role IN ('team_member','operations_manager')
          AND ${SUPPORT_AGENT_IDENTITY_SQL}
          AND (s.queue_scope='all' OR s.queue_scope=CASE
            WHEN c.assistance_category IN ('buying_assistance','shipment_observation') THEN 'transport' ELSE 'support' END)
      )
      ORDER BY c.created_at,c.id LIMIT 100
    `, [requiresManagedStaffIdentity()]);
    let routed = 0;
    for (const conversation of waiting) {
      const agent = await leastLoadedAgent(conversation.assistance_category);
      if (!agent) continue;
      await assignConversation(conversation.id, agent.id, user.id, "automatic", now);
      routed++;
    }
    const remaining = Number((await runtimeGet<{count:number}>(
      `SELECT COUNT(*) count FROM support_conversations c WHERE c.status='waiting' AND c.assigned_user_id IS NULL${queueWhere}`,
    ))?.count || 0);
    return { routed, remaining };
  });
}

export async function createSupportConversation(
  user: SessionUser,
  input: { subject: unknown; message: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null; coordinatorId?:unknown },
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
    if(!await currentSupportClient(user,true))throw new SupportError('A client account is required.','forbidden');
    const duplicate = await runtimeGet<{ id: number; public_ref: string; business_name: string; business_id:number; assistance_category:string; subject:string; body:string }>(`
      SELECT c.id,c.public_ref,b.name business_name,c.business_id,c.assistance_category,c.subject,m.body
      FROM support_messages m
      JOIN support_conversations c ON c.id=m.conversation_id
      JOIN businesses b ON b.id=c.business_id
      WHERE m.sender_key=? AND m.idempotency_key=?
    `, [`user:${user.id}`, key]);
    if (duplicate) {
      if(duplicate.business_id!==user.business_id||duplicate.assistance_category!=='general'||duplicate.subject!==subject||duplicate.body!==message)throw new SupportError('Request could not be accepted.','idempotency_conflict');
      return { ...duplicate, assigned_user_name: null, duplicate: true };
    }
    const publicRef = `SUP-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const result = await runtimeGet<{ id: number }>(`
      INSERT INTO support_conversations(
        public_ref,participant_kind,business_id,opened_by_user_id,
        assistance_category,requester_label,subject,status,
        created_at,updated_at,last_message_at
      ) VALUES(?,'client',?,?, 'general','AfricMade client',?,'waiting',?,?,?) RETURNING id
    `, [publicRef, user.business_id, user.id, subject, now, now, now]);
    const conversationId = Number(result!.id);
    const messageResult = await runtimeGet<{ id: number }>(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,sender_side
      ) VALUES(?,?,'user',?,?,?,?,'participant') RETURNING id
    `, [conversationId, user.id, `user:${user.id}`, message, key, now]);
    await insertSupportAttachment(Number(messageResult!.id), attachment, now);
    await runtimeRun(`
      UPDATE support_conversations SET client_last_read_message_id=?,awaiting_staff_since=?,awaiting_staff_message_id=? WHERE id=?
    `, [Number(messageResult!.id),now,Number(messageResult!.id),conversationId]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'created','client support conversation',?)
    `, [conversationId, user.id, now]);
    const agent = await leastLoadedAgent();
    if (agent) await assignConversation(conversationId, agent.id, null, "automatic", now);
    else await enqueueChatAttention({conversationId,source:'support-created:'+conversationId,kind:'waiting_chat',direction:'staff',now});
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

export async function createOwnerTransportConversation(user:SessionUser,input:{name:unknown;phone:unknown;origin:unknown;destination:unknown;message?:unknown;idempotencyKey:unknown;coordinatorId?:unknown},now=Date.now()) {
  if(user.access_role!=='client'||!user.business_id)throw new SupportError('A client account is required.','forbidden');
  if(!selectTransportCoordinator(input.coordinatorId).ok)throw new SupportError('Choose a logistics service provider.','invalid_request');
  const name=transportField(input.name,'Enter your name.',80),origin=transportField(input.origin,'Enter the pickup location.',120),destination=transportField(input.destination,'Enter the destination.',120);
  if(typeof input.phone!=='string'||input.phone.length>40)throw new SupportError('Enter a valid phone number.','phone_required');
  const phone=visitorPhone(input.phone),key=idempotency(input.idempotencyKey);
  if(input.message!=null&&(typeof input.message!=='string'||input.message.length>4000))throw new SupportError('Describe what you need in 4,000 characters or fewer.','invalid_request');
  const goods=cleanText(input.message,4000),message=`From: ${origin}\nTo: ${destination}${goods?`\n${goods}`:''}`;
  if(message.length>4000)throw new SupportError('Describe what you need in 4,000 characters or fewer.','invalid_request');
  const created=await runtimeTransaction(async()=>{
    await lockSupportWork();
    if(!await currentSupportClient(user,true))throw new SupportError('A client account is required.','forbidden');
    const existing=await runtimeGet<{id:number;public_ref:string;business_id:number;participant_kind:string;assistance_category:string;requester_label:string;visitor_phone:string;transport_origin:string;transport_destination:string;body:string}>(`SELECT c.id,c.public_ref,c.business_id,c.participant_kind,c.assistance_category,c.requester_label,c.visitor_phone,c.transport_origin,c.transport_destination,m.body
      FROM support_messages m JOIN support_conversations c ON c.id=m.conversation_id
      WHERE m.sender_key=? AND m.idempotency_key=?`,[`user:${user.id}`,key]);
    if(existing){
      if(existing.business_id!==user.business_id||existing.participant_kind!=='client'||existing.assistance_category!=='shipment_observation'||existing.requester_label!==name||existing.visitor_phone!==phone||existing.transport_origin!==origin||existing.transport_destination!==destination||existing.body!==message)throw new SupportError('Request could not be accepted.','idempotency_conflict');
      return {id:existing.id,publicRef:existing.public_ref,duplicate:true};
    }
    const publicRef=`SUP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const result=await runtimeGet<{id:number}>(`INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,visitor_phone,transport_origin,transport_destination,subject,status,created_at,updated_at,last_message_at)
      VALUES(?,'client',?,?,'shipment_observation',?,?,?,?,?,'waiting',?,?,?) RETURNING id`,[publicRef,user.business_id,user.id,name,phone,origin,destination,`${origin} → ${destination}`.slice(0,120),now,now,now]);
    const id=Number(result!.id),first=await runtimeGet<{id:number}>(`INSERT INTO support_messages(conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible,sender_side)
      VALUES(?,?,'user',?,?,?,?,TRUE,'participant') RETURNING id`,[id,user.id,`user:${user.id}`,message,key,now]);
    await runtimeRun('UPDATE support_conversations SET client_last_read_message_id=?,awaiting_staff_since=?,awaiting_staff_message_id=? WHERE id=?',[Number(first!.id),now,Number(first!.id),id]);
    await runtimeRun("INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,'created','client transport conversation',?)",[id,user.id,now]);
    const agent=await leastLoadedAgent('shipment_observation');
    if(agent)await assignConversation(id,agent.id,null,'automatic',now);
    else await enqueueChatAttention({conversationId:id,source:'support-created:'+id,kind:'waiting_chat',direction:'staff',now});
    return {id,publicRef,duplicate:false};
  });
  return created;
}

export async function createPublicSupportConversation(
  input: { category: unknown; email?: unknown; phone: unknown; message?: unknown; name?: unknown; service?: unknown; origin?: unknown; destination?: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null; coordinatorId?:unknown },
  ipHash: string,
  now = Date.now(),
  preparedToken?: string,
) {
  const category = assistanceCategory(input.category);
  const transport = category === "shipment_observation";
  if(input.coordinatorId!==undefined&&!transport||transport&&!selectTransportCoordinator(input.coordinatorId).ok)throw new SupportError("Choose a logistics service provider.","invalid_request");
  const callback = isCallbackRequest(category);
  const service = category === "buying_assistance" ? buyingService(input.service) : null;
  if (category === "buying_assistance" && input.service != null && !service) throw new SupportError("Choose what you need help with.", "invalid_service");
  const name = callback ? transportField(input.name, "Enter your name.", 80) : "Website visitor";
  const origin = transport ? transportField(input.origin, "Enter the pickup location.", 120) : null;
  const destination = transport ? transportField(input.destination, "Enter the destination.", 120) : null;
  const email = callback ? null : visitorEmail(input.email);
  const phone = visitorPhone(input.phone);
  if (category === "buying_assistance" && (typeof input.message !== "string" || input.message.trim().length > 4000)) throw new SupportError("Describe what you need in 4,000 characters or fewer.", "invalid_request");
  if (transport && input.message != null && (typeof input.message !== "string" || input.message.length > 4000)) throw new SupportError("Describe what you need in 4,000 characters or fewer.", "invalid_request");
  const goods = transport ? cleanText(input.message, 4000) : "";
  const message = transport ? `From: ${origin}\nTo: ${destination}${goods ? `\n${goods}` : ""}` : cleanText(input.message, 4000);
  if (message.length > 4000) throw new SupportError("Describe what you need in 4,000 characters or fewer.", "invalid_request");
  const key = idempotency(input.idempotencyKey);
  const attachment = supportAttachment(input.attachment);
  if (callback && attachment) throw new SupportError("These requests do not accept attachments.", "invalid_attachment");
  if (!message) throw new SupportError("Write a message for the AfricMade team.", "message_required");

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
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,sender_side
      ) VALUES(?,NULL,'visitor',?,?,?,?,'participant') RETURNING id
    `, [conversationId, senderKey, message, key, now]);
    await insertSupportAttachment(Number(messageResult!.id), attachment, now);
    await runtimeRun(`
      UPDATE support_conversations SET visitor_last_read_message_id=?,awaiting_staff_since=?,awaiting_staff_message_id=? WHERE id=?
    `, [Number(messageResult!.id),now,Number(messageResult!.id),conversationId]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,NULL,'created',?,?)
    `, [conversationId, `public visitor request:${category}`, now]);
    const agent = await leastLoadedAgent(category);
    if (agent) await assignConversation(conversationId, agent.id, null, "automatic", now);
    else await enqueueChatAttention({conversationId,source:'support-created:'+conversationId,kind:'waiting_chat',direction:'staff',now});
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
  const firstStaffReplyAt=row.assistance_category==='shipment_observation'?await firstTransportStaffReplyAt(row.id):null;
  const callbackDue=await noAgentTransportCallbackDue(row,now,firstStaffReplyAt);
  const callbackSubmitted=callbackDue?await hasTransportCallback(row):false;
  // Retained notes and carrier handoffs stay private; only explicit replies are public.
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
    WHERE m.conversation_id=? AND (? NOT IN ('buying_assistance','shipment_observation') OR m.sender_kind='visitor' OR m.visitor_visible=TRUE)
    ORDER BY m.id DESC LIMIT 100
  `, [row.id, row.assistance_category])).reverse();
  return {
    id: row.id,
    publicRef: row.public_ref,
    createdAt: row.created_at,
    serverNow: now,
    transportWaitStartedAt: row.created_at,
    category: row.assistance_category,
    status: row.status,
    resolvedAt:row.resolved_at,
    assignedUserName: explicitlyJoined(row)?row.assigned_user_name:null,
    agentJoined: explicitlyJoined(row),
    agentJoinedAt: explicitlyJoined(row)?row.staff_joined_at:null,
    firstStaffReplyAt,
    ...supportIdleDeadlines(row.awaiting_participant_since??null,'guest'),
    idleEndedAt:row.idle_ended_at??null,
    ...responseView(row,now),
    staffReplyDueAt:null,
    ...(row.assistance_category==='shipment_observation'?await participantTransportPlan(row.id):{}),
    ...(row.assistance_category==='shipment_observation'?{transportCallback:{phone:row.visitor_phone,email:row.visitor_email,submitted:callbackSubmitted}}:{}),
    messages: (callbackDue?[]:messages).map((message) => ({
      id: message.id,
      sender: message.sender_kind === "visitor" ? "visitor" as const : "staff" as const,
      senderName: message.sender_kind === "visitor" ? "You" : message.sender_name || "AfricMade support",
      body: message.body,
      createdAt: message.created_at,
      attachment: isCallbackRequest(row.assistance_category) ? null : attachmentView(message),
      read: message.sender_kind === 'visitor' && message.id <= row.staff_confirmed_read_message_id,
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

type ReceiptSide = 'client' | 'staff' | 'visitor';
const receiptColumns = {
  client: ['client_confirmed_read_message_id', 'client_confirmed_read_at', 'client_last_read_message_id'],
  staff: ['staff_confirmed_read_message_id', 'staff_confirmed_read_at', 'staff_last_read_message_id'],
  visitor: ['visitor_confirmed_read_message_id', 'visitor_confirmed_read_at', 'visitor_last_read_message_id'],
} as const;

async function confirmVisibleRead(row: ConversationRow, side: ReceiptSide, rawId: unknown, now: number, userId?: number) {
  let id: number;
  try { id = confirmedMessageId(rawId); }
  catch { throw new SupportError('Choose a visible message.', 'invalid_read'); }
  // An acknowledgement must target an incoming visible message, not a sender's
  // own post or a private note whose higher ID would skip unseen replies.
  const predicate = side === 'staff'
    ? participantMessageSql
    : `NOT ${participantMessageSql}
      AND (c.assistance_category NOT IN ('buying_assistance','shipment_observation') OR m.visitor_visible=TRUE)`;
  const message = await runtimeGet<{ id: number }>(`
    SELECT m.id FROM support_messages m JOIN support_conversations c ON c.id=m.conversation_id
    WHERE m.id=? AND c.id=? AND ${predicate}
  `, [id, row.id]);
  if (!message) throw new SupportError('Choose a visible message.', 'invalid_read');
  const [cursor, at, legacy] = receiptColumns[side];
  const previous = Number(row[cursor]);
  await runtimeRun(`UPDATE support_conversations SET
    ${at}=CASE WHEN ${cursor}<? THEN GREATEST(COALESCE(${at},0),?) ELSE ${at} END,
    ${cursor}=GREATEST(${cursor},?),${legacy}=GREATEST(${legacy},?) WHERE id=?`, [id, now, id, id, row.id]);
  const recipientKey=side==='visitor'?'visitor:'+row.id:'user:'+userId;
  await runtimeRun(`UPDATE attention_notifications SET read_at=COALESCE(read_at,?)
    WHERE recipient_key=? AND conversation_id=? AND kind='message'
      AND CASE WHEN source_key ~ '^support-message:[0-9]+$' THEN substring(source_key FROM 17)::bigint<=? ELSE FALSE END`,[now,recipientKey,row.id,id]);
  return { readMessageId: Math.max(id, previous), duplicate: id <= previous, joined:false };
}

/** Explicit current-assignment acceptance; reads and Claim never call this command. */
export async function joinSupportConversation(user:SessionUser,conversationId:number,input:{publicRef:unknown;assignmentEpoch:unknown},now=Date.now()) {
 return runtimeTransaction(async()=>{
  await lockSupportWork();
  const actor=await runtimeGet<{access_role:string;business_id:number|null}>(`SELECT p.access_role,u.business_id FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? FOR SHARE OF u,p`,[user.id]);
  if(!actor||actor.access_role!==user.access_role||actor.business_id!==user.business_id||
    !['team_member','operations_manager','platform_admin'].includes(actor.access_role))throw new SupportError('Staff access is required.','forbidden');
  const row=await requireConversation(user,conversationId);
  if(typeof input.publicRef!=='string'||input.publicRef!==row.public_ref||
    typeof input.assignmentEpoch!=='string'||input.assignmentEpoch!==String(row.assignment_epoch)||row.assignment_epoch<1)
    throw new SupportError('This chat changed. Please refresh.','conversation_changed');
  if(row.status!=='open'||row.resolved_at!==null)throw new SupportError('This conversation is closed.','closed');
  if(await noAgentTransportCallbackDue(row,now))throw new SupportError('The callback form is available for this request.','callback_required');
  const active=await runtimeGet<{id:number}>('SELECT id FROM support_assignments WHERE id=? AND conversation_id=? AND assigned_user_id=? AND released_at IS NULL',
    [row.assignment_epoch,conversationId,user.id]);
  if(row.assigned_user_id!==user.id||!active)throw new SupportError('Only the assigned agent can join this chat.','unassigned');
  if(explicitlyJoined(row))return {duplicate:true};
  await runtimeRun('UPDATE support_conversations SET staff_joined_user_id=?,staff_joined_at=?,staff_joined_assignment_id=? WHERE id=?',
    [user.id,now,row.assignment_epoch,conversationId]);
  await runtimeRun(`INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
    VALUES(?,?,'joined','assigned agent explicitly joined the conversation',?)`,[conversationId,user.id,now]);
  await enqueueChatAttention({conversationId,source:'support-manual-joined:'+row.assignment_epoch,kind:'joined',direction:'participant',now});
  return {duplicate:false};
 });
}

export async function acknowledgeSupportRead(user: SessionUser, conversationId: number, command: ChatReadCommand, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const current = await runtimeGet<{ access_role: string; business_id: number | null }>(`
      SELECT p.access_role,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=?
    `, [user.id]);
    if (!current || current.access_role !== user.access_role || (user.access_role === 'client' && current.business_id !== user.business_id)) {
      throw new SupportError('Support conversation was not found.', 'not_found');
    }
    const row = await requireConversation(user, conversationId);
    if (command.publicRef !== undefined && command.publicRef !== row.public_ref) throw new SupportError('This chat changed. Please refresh.', 'conversation_changed');
    if (user.access_role !== 'client' && row.assigned_user_id !== user.id) {
      throw new SupportError('Only the assigned agent can acknowledge this conversation.', 'unassigned');
    }
    if(user.access_role==='client'&&await noAgentTransportCallbackDue(row,now))throw new SupportError('Live chat is no longer available.','callback_required');
    return confirmVisibleRead(row, user.access_role === 'client' ? 'client' : 'staff', command.messageId, now, user.id);
  });
}

export async function acknowledgePublicRead(token: unknown, command: ChatReadCommand, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const { row } = await requirePublicConversation(token, now);
    if (command.publicRef !== row.public_ref) throw new SupportError('This chat changed. Please refresh.', 'conversation_changed');
    if(await noAgentTransportCallbackDue(row,now))throw new SupportError('Live chat is no longer available.','callback_required');
    return confirmVisibleRead(row, 'visitor', command.messageId, now);
  });
}

export async function postPublicSupportMessage(
  token: unknown,
  input: { message: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null; coordinatorId?:unknown },
  ipHash: string,
  now = Date.now(),
) {
  if (typeof input.message !== "string" || input.message.trim().length > 4000) throw new SupportError("Describe what you need in 4,000 characters or fewer.", "invalid_request");
  const body = cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  const attachment = supportAttachment(input.attachment);
  if (!body) throw new SupportError("Write a message for the AfricMade team.", "message_required");
  const { row, tokenHash } = await requirePublicConversation(token, now);
  if (isCallbackRequest(row.assistance_category) && attachment) throw new SupportError("These requests do not accept attachments.", "invalid_attachment");
  if (row.status === "closed") throw new SupportError("This conversation is closed.", "closed");
  const rate = await consumeRuntimeRateLimit(`public-support:message:${ipHash}:${tokenHash}`, 30, 10 * 60 * 1000, 30 * 60 * 1000);
  if (!rate.allowed) throw new SupportError("Too many messages were sent. Please try again later.", "rate_limited");
  const senderKey = visitorSenderKey(tokenHash);
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const current = await requirePublicConversation(token, now);
    if (current.row.status === "closed") throw new SupportError("This conversation is closed.", "closed");
    if(await noAgentTransportCallbackDue(current.row,now))throw new SupportError('Live chat is no longer available.','callback_required');
    const existing = await runtimeGet<{ id: number; conversation_id: number; body: string }>(`
      SELECT id,conversation_id,body FROM support_messages WHERE sender_key=? AND idempotency_key=?
    `, [senderKey, key]);
    if (existing) {
      if (existing.conversation_id !== row.id || existing.body !== body) throw new SupportError("Request could not be accepted.", "idempotency_conflict");
      return { id: existing.id, duplicate: true };
    }
    const result = await runtimeGet<{ id: number }>(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,sender_side
      ) VALUES(?,NULL,'visitor',?,?,?,?,'participant') RETURNING id
    `, [row.id, senderKey, body, key, now]);
    const messageId = Number(result!.id);
    await insertSupportAttachment(messageId, attachment, now);
    await runtimeRun(`
      UPDATE support_conversations
      SET updated_at=?,last_message_at=?,visitor_last_read_message_id=?,awaiting_participant_since=NULL,idle_ended_at=NULL,
        awaiting_staff_since=COALESCE(awaiting_staff_since,?),awaiting_staff_message_id=COALESCE(awaiting_staff_message_id,?)
      WHERE id=?
    `, [now, now, messageId,now,messageId,row.id]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,NULL,'message','public visitor message',?)
    `, [row.id, now]);
    await enqueueChatAttention({conversationId:row.id,source:'support-message:'+messageId,kind:'message',direction:'staff',now});
    return { id: messageId, duplicate: false };
  });
}

export async function closePublicSupportConversation(token: unknown, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const { row } = await requirePublicConversation(token, now);
    if (row.status === "closed" && row.idle_ended_at == null) return { duplicate: true };
    await runtimeRun(`
      UPDATE support_conversations SET status='closed',closed_at=?,updated_at=?,awaiting_participant_since=NULL,idle_ended_at=NULL,
        awaiting_staff_since=NULL,awaiting_staff_message_id=NULL,staff_joined_assignment_id=NULL WHERE id=?
    `, [now, now, row.id]);
    await runtimeRun(`
      UPDATE support_assignments SET released_at=?
      WHERE conversation_id=? AND released_at IS NULL
    `, [now, row.id]);
    const event=await runtimeGet<{id:number}>(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,NULL,'closed','visitor ended conversation',?) RETURNING id
    `, [row.id, now]);
    await enqueueChatAttention({conversationId:row.id,source:'support-closed:'+event!.id,kind:'closed',direction:'staff',now});
    return { duplicate: false };
  });
}

export async function resumePublicSupportConversation(token:unknown,publicRef:unknown,now=Date.now()):Promise<{duplicate:boolean}>{
 return runtimeTransaction(async()=>{
  await lockSupportWork();
  const {row}=await requirePublicConversation(token,now);
  if(typeof publicRef!=='string'||publicRef!==row.public_ref)throw new SupportError('Request could not be accepted.','conversation_changed');
  if(!isCallbackRequest(row.assistance_category))throw new SupportError('This chat cannot be resumed.','not_resumable');
  if(row.status!=='closed'){
   const previous=await runtimeGet<{event_type:string;detail:string}>("SELECT event_type,detail FROM support_events WHERE conversation_id=? AND event_type IN ('closed','reopened') ORDER BY id DESC LIMIT 1",[row.id]);
   if(previous?.event_type==='reopened'&&previous.detail===SUPPORT_IDLE_RESUME_DETAIL)return {duplicate:true};
   throw new SupportError('This chat cannot be resumed.','not_resumable');
  }
  if(row.idle_ended_at==null||row.resolved_at!==null)throw new SupportError('This chat cannot be resumed.','not_resumable');
  const agent=await leastLoadedAgent(row.assistance_category);
  if(agent)await assignConversation(row.id,agent.id,null,'reopened',now);
  else await runtimeRun(`UPDATE support_conversations SET status='waiting',assigned_user_id=NULL,closed_at=NULL,resolved_at=NULL,
   awaiting_participant_since=NULL,idle_ended_at=NULL,staff_joined_user_id=NULL,staff_joined_at=NULL,staff_joined_assignment_id=NULL,
   awaiting_staff_since=NULL,awaiting_staff_message_id=NULL,updated_at=? WHERE id=?`,[now,row.id]);
  const event=await runtimeGet<{id:number}>(`INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
   VALUES(?,NULL,'reopened',?,?) RETURNING id`,[row.id,SUPPORT_IDLE_RESUME_DETAIL,now]);
  await enqueueChatAttention({conversationId:row.id,source:'support-reopened:'+event!.id,kind:'reopened',direction:'staff',now});
  return {duplicate:false};
 });
}

export async function listSupportConversations(
  user: SessionUser,
  input: { page?: unknown; q?: unknown; status?: unknown; queue?: unknown },
): Promise<PageResult<SupportConversation>> {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const now=Date.now();
  const status = ["waiting", "open", "closed"].includes(String(input.status))
    ? String(input.status) as SupportStatus
    : "";
  const params: Array<string | number> = [];
  let where = " WHERE 1=1";
  if (user.access_role === "client") {
    if (!user.business_id || !await currentSupportClient(user)) throw new SupportError("Client business is missing.", "forbidden");
    where += " AND c.business_id=?";
    params.push(user.business_id);
  } else if (user.access_role === "team_member") {
    where += ` AND ((c.status='waiting' AND ${SUPPORT_WAITING_SCOPE_SQL}) OR c.assigned_user_id=?)`;
    params.push(user.id, user.id);
  } else if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Support access is required.", "forbidden");
  }
  if (input.queue === "transport") {
    if (user.access_role !== 'client' && user.access_role !== "team_member" && !hasCapability(user, "operations:manage")) throw new SupportError("Transport queue access is required.", "forbidden");
    where += user.access_role==='client'?" AND c.participant_kind='client' AND c.assistance_category='shipment_observation'":" AND c.assistance_category IN ('shipment_observation','buying_assistance')";
  }
  if (input.queue === "support" || user.access_role==='client'&&input.queue!=='transport') where += " AND c.assistance_category NOT IN ('shipment_observation','buying_assistance')";
  if (input.status === "active") where += " AND c.status IN ('waiting','open')";
  else if(input.status==='needs_reply'||input.status==='overdue'){
    where+=" AND c.status IN ('waiting','open') AND c.resolved_at IS NULL AND c.awaiting_staff_since IS NOT NULL AND "+SUPPORT_RESPONSE_DEADLINE_SQL+(input.status==='overdue'?'<=?':'>?');
    params.push(now);
  }
  else if(input.status==='waiting_customer')where+=" AND c.status='open' AND c.resolved_at IS NULL AND c.awaiting_staff_since IS NULL AND c.awaiting_participant_since IS NOT NULL";
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
    LEFT JOIN businesses b ON b.id=c.business_id ${SUPPORT_ACTIVE_ASSIGNMENT_JOIN}${where}
  `, params))?.total || 0);
  const window = pageWindow(total, request);
  const rows = await runtimeAll<ConversationRow>(`
    ${baseSelect(input.queue === "transport" && user.access_role !== "client")}${where}
    ORDER BY CASE c.status WHEN 'waiting' THEN 0 WHEN 'open' THEN 1 ELSE 2 END,
      c.last_message_at DESC,c.id DESC
    LIMIT ? OFFSET ?
  `, [...params, window.limit, window.offset]);
  return pageResult(rows.map((row) => conversationView(row, user,now)), total, request);
}

export async function getSupportConversation(user: SessionUser, conversationId: number) {
  const row = await requireConversation(user, conversationId);
  const firstStaffReplyAt=user.access_role==='client'&&row.assistance_category==='shipment_observation'?await firstTransportStaffReplyAt(row.id):null;
  const messages = (await runtimeAll<{
    id: number;
    conversation_id: number;
    sender_user_id: number | null;
    sender_kind: "user" | "visitor";
    sender_side: 'participant' | 'staff' | null;
    sender_name: string;
    sender_role: string;
    visitor_visible: boolean;
    body: string;
    created_at: number;
  } & AttachmentColumns>(`
    SELECT m.id,m.conversation_id,m.sender_user_id,m.sender_kind,m.sender_side,
      CASE WHEN m.sender_kind='visitor' THEN c.requester_label ELSE u.name END sender_name,
      CASE WHEN ${participantMessageSql} THEN CASE WHEN m.sender_kind='visitor' THEN 'visitor' ELSE 'client' END
        ELSE COALESCE(NULLIF(p.access_role,'client'),'team_member') END sender_role,
      m.visitor_visible,m.body,m.created_at,a.id attachment_id,a.original_name attachment_original_name,
      a.mime_type attachment_mime_type,a.byte_size attachment_byte_size
    FROM support_messages m
    JOIN support_conversations c ON c.id=m.conversation_id
    LEFT JOIN users u ON u.id=m.sender_user_id
    LEFT JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_attachments a ON a.message_id=m.id
    WHERE m.conversation_id=? ${user.access_role==='client'&&isCallbackRequest(row.assistance_category)?'AND m.visitor_visible=TRUE':''}
    ORDER BY m.id DESC LIMIT 100
  `, [conversationId])).reverse();
  const callbackDue=user.access_role==='client'&&await noAgentTransportCallbackDue(row,Date.now(),firstStaffReplyAt);
  const callbackSubmitted=user.access_role==='client'&&row.assistance_category==='shipment_observation'?await hasTransportCallback(row):false;
  const lastId = messages.at(-1)?.id || 0;
  return {
    conversation: {...conversationView({ ...row, last_message_id: lastId }, user),
      ...(user.access_role==='client'&&row.assistance_category==='shipment_observation'?{firstStaffReplyAt}:{}),
      ...(user.access_role==='client'&&row.assistance_category==='shipment_observation'?{transportCallback:{phone:row.visitor_phone,email:row.visitor_email,submitted:callbackSubmitted}}:{}),
      ...(user.access_role==='client'&&row.assistance_category==='shipment_observation'?await participantTransportPlan(row.id):{})},
    messages: (callbackDue?[]:messages).map((message): SupportMessage => ({
      id: message.id,
      conversationId: message.conversation_id,
      senderUserId: message.sender_user_id,
      senderName: message.sender_name,
      senderRole: message.sender_role,
      visitorVisible: message.visitor_visible,
      body: message.body,
      createdAt: message.created_at,
      attachment: attachmentView(message),
      read: message.sender_side === 'participant' || (message.sender_side === null && (message.sender_kind === 'visitor' || message.sender_user_id === row.opened_by_user_id))
        ? message.id <= row.staff_confirmed_read_message_id
        : (!isCallbackRequest(row.assistance_category) || message.visitor_visible)
          && message.id <= (row.participant_kind === 'visitor' ? row.visitor_confirmed_read_message_id : row.client_confirmed_read_message_id),
    })),
  };
}

export async function getSupportAttachment(user: SessionUser, conversationId: number, attachmentId: number) {
  if (!Number.isSafeInteger(attachmentId) || attachmentId < 1) throw new SupportError("Attachment was not found.", "not_found");
  const row=await requireConversation(user, conversationId);
  if(user.access_role==='client'&&isCallbackRequest(row.assistance_category))throw new SupportError('Attachment was not found.','not_found');
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
  input: { audience?: unknown; message: unknown; idempotencyKey: unknown; attachment?: SupportAttachmentWrite | null; coordinatorId?:unknown },
  now = Date.now(),
) {
  const body = cleanText(input.message, 4000);
  const key = idempotency(input.idempotencyKey);
  const attachment = supportAttachment(input.attachment);
  if (!body) throw new SupportError("Write a support message.", "message_required");
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const actor=await runtimeGet<{access_role:string;business_id:number|null}>(`SELECT p.access_role,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? FOR SHARE OF u,p`,[user.id]);
    if(!actor||actor.access_role!==user.access_role||actor.business_id!==user.business_id)throw new SupportError('Support conversation was not found.','not_found');
    const senderSide=actor.access_role==='client'?'participant':'staff';
    const row = await requireConversation(user, conversationId);
    const closedNote = isCallbackRequest(row.assistance_category) && user.access_role !== "client" && input.audience === "note";
    if (row.status === "closed" && !closedNote) throw new SupportError("Reopen this conversation before replying.", "closed");
    if(user.access_role==='client'&&await noAgentTransportCallbackDue(row,now))throw new SupportError('Live chat is no longer available.','callback_required');
    if (user.access_role !== "client" && row.assigned_user_id !== user.id && !hasCapability(user, "operations:manage")) {
      throw new SupportError("Claim this conversation before replying.", "unassigned");
    }
    if (input.audience != null && input.audience !== "reply" && input.audience !== "note") throw new SupportError("Request could not be accepted.", "invalid_audience");
    if(input.audience==='note'&&(user.access_role==='client'||!isCallbackRequest(row.assistance_category)))throw new SupportError('Request could not be accepted.','invalid_audience');
    const visible = isCallbackRequest(row.assistance_category) && (user.access_role==='client'||input.audience === "reply");
    const publicReply=user.access_role!=='client'&&input.audience!=='note'&&(!isCallbackRequest(row.assistance_category)||visible);
    if (visible && attachment) throw new SupportError("These requests do not accept attachments.", "invalid_attachment");
    const existing = await runtimeGet<{ id: number; conversation_id: number; body: string; visitor_visible: boolean;sender_side:'participant'|'staff'|null }>(`
      SELECT id,conversation_id,body,visitor_visible,sender_side FROM support_messages WHERE sender_key=? AND idempotency_key=?
    `, [`user:${user.id}`, key]);
    if (existing) {
      if (existing.conversation_id !== conversationId || existing.body !== body || existing.visitor_visible !== visible || (existing.sender_side!==null&&existing.sender_side!==senderSide)) throw new SupportError("Request could not be accepted.", "idempotency_conflict");
      return { id: existing.id, duplicate: true };
    }
    if(publicReply&&(row.assigned_user_id!==user.id||!explicitlyJoined(row)))throw new SupportError('Join this chat before replying.','join_required');
    const result = await runtimeGet<{ id: number }>(`
      INSERT INTO support_messages(
        conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at,visitor_visible,sender_side
      ) VALUES(?,?,'user',?,?,?,?,?,?) RETURNING id
    `, [conversationId, user.id, `user:${user.id}`, body, key, now, visible ? "true" : "false",senderSide]);
    const messageId = Number(result!.id);
    await insertSupportAttachment(messageId, attachment, now);
    const readColumn = user.access_role === "client"
      ? "client_last_read_message_id"
      : "staff_last_read_message_id";
    const awaitingSince=user.access_role==='client'?null:publicReply&&row.status==='open'&&row.assigned_user_id!==null&&(row.participant_kind==='client'||isCallbackRequest(row.assistance_category))?now:row.awaiting_participant_since??null;
    const staffSince=user.access_role==='client'?(row.awaiting_staff_since??now):publicReply?null:row.awaiting_staff_since??null;
    const staffMessage=user.access_role==='client'?(row.awaiting_staff_message_id??messageId):publicReply?null:row.awaiting_staff_message_id??null;
    await runtimeRun(`
      UPDATE support_conversations
      SET updated_at=?,last_message_at=?,${readColumn}=?,awaiting_participant_since=?,awaiting_staff_since=?,awaiting_staff_message_id=?
      WHERE id=?
    `, [now, now, messageId, awaitingSince,staffSince,staffMessage,conversationId]);
    await runtimeRun(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'message','message posted',?)
    `, [conversationId, user.id, now]);
    if(user.access_role==='client' || !isCallbackRequest(row.assistance_category) || visible) await enqueueChatAttention({conversationId,source:'support-message:'+messageId,kind:'message',direction:user.access_role==='client'?'staff':'participant',now});
    return { id: messageId, duplicate: false };
  });
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
    const workload = await supportAgentWorkload(user.id, true);
    if (!workload?.enabled || !acceptsQueue(workload.queue_scope, row.assistance_category)) {
      throw new SupportError("This account is not enabled for support assignments.", "not_support_agent");
    }
    await assignConversation(conversationId, user.id, user.id, "claimed", now);
    return { duplicate: false };
  });
}

export async function closeSupportConversation(user: SessionUser, conversationId: number, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    const actor=await runtimeGet<{access_role:string;business_id:number|null}>(`SELECT p.access_role,u.business_id FROM users u
      JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? FOR SHARE OF u,p`,[user.id]);
    if(!actor||actor.access_role!==user.access_role||actor.business_id!==user.business_id)throw new SupportError('Support conversation was not found.','not_found');
    if(user.access_role==='client'&&!await currentSupportClient(user,true))throw new SupportError('Support conversation was not found.','not_found');
    const row = await requireConversation(user, conversationId);
    if (
      user.access_role !== "client" &&
      row.assigned_user_id !== user.id &&
      !hasCapability(user, "operations:manage")
    ) {
      throw new SupportError("Only the assigned team member can close this conversation.", "forbidden");
    }
    const resolving = user.access_role!=='client';
    if (user.access_role==='client'&&row.status==='closed') return;
    if (row.status === "closed" && row.idle_ended_at == null && (!resolving || row.resolved_at !== null)) return;
    await runtimeRun(`
      UPDATE support_conversations SET status='closed',closed_at=COALESCE(closed_at,?),resolved_at=?,updated_at=?,awaiting_participant_since=NULL,idle_ended_at=NULL,
        awaiting_staff_since=NULL,awaiting_staff_message_id=NULL,staff_joined_assignment_id=NULL WHERE id=?
    `, [now, resolving ? now : null, now, conversationId]);
    await runtimeRun(`
      UPDATE support_assignments SET released_at=?
      WHERE conversation_id=? AND released_at IS NULL
    `, [now, conversationId]);
    const event=await runtimeGet<{id:number}>(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'closed',?,?) RETURNING id
    `, [conversationId, user.id, resolving ? "request resolved" : "conversation closed", now]);
    if(row.status!=='closed') await enqueueChatAttention({conversationId,source:'support-closed:'+event!.id,kind:'closed',direction:user.access_role==='client'?'staff':'participant',now});
  });
}

export async function reopenSupportConversation(user: SessionUser, conversationId: number, now = Date.now()) {
  return runtimeTransaction(async () => {
    await lockSupportWork();
    if(user.access_role==='client'&&!await currentSupportClient(user,true))throw new SupportError('Support conversation was not found.','not_found');
    const row = await requireConversation(user, conversationId);
    const ownerTransport=user.access_role==='client'&&isCallbackRequest(row.assistance_category);
    const ownerResumeDetail='owner resumed automatically ended conversation';
    if (row.status !== "closed") {
      if(ownerTransport){
        const previous=await runtimeGet<{detail:string}>("SELECT detail FROM support_events WHERE conversation_id=? AND event_type='reopened' ORDER BY id DESC LIMIT 1",[conversationId]);
        if(previous?.detail!==ownerResumeDetail)throw new SupportError('This chat cannot be resumed.','not_resumable');
      }
      return;
    }
    if(ownerTransport&&(row.idle_ended_at==null||row.resolved_at!==null))throw new SupportError('This chat cannot be resumed.','not_resumable');
    if (user.access_role === "client" || hasCapability(user, "operations:manage")) {
      const agent = await leastLoadedAgent(row.assistance_category);
      if (agent) {
        await assignConversation(conversationId, agent.id, user.id, "reopened", now);
      } else {
        await runtimeRun(`
          UPDATE support_conversations
          SET status='waiting',assigned_user_id=NULL,closed_at=NULL,resolved_at=NULL,updated_at=?,awaiting_participant_since=NULL,idle_ended_at=NULL,staff_joined_user_id=NULL,staff_joined_at=NULL,staff_joined_assignment_id=NULL,
            awaiting_staff_since=NULL,awaiting_staff_message_id=NULL
          WHERE id=?
        `, [now, conversationId]);
      }
      const event=await runtimeGet<{id:number}>(`
        INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
        VALUES(?,?,'reopened',?,?) RETURNING id
      `, [conversationId, user.id, ownerTransport?ownerResumeDetail:'conversation reopened', now]);
      await enqueueChatAttention({conversationId,source:'support-reopened:'+event!.id,kind:'reopened',direction:'staff',now});
      if(user.access_role!=='client') await enqueueChatAttention({conversationId,source:'support-reopened:'+event!.id,kind:'reopened',direction:'participant',now});
      return;
    }
    if (row.assigned_user_id !== user.id && !hasCapability(user, "operations:manage")) {
      throw new SupportError("Only the assigned team member can reopen this conversation.", "forbidden");
    }
    const workload = row.assigned_user_id ? await supportAgentWorkload(row.assigned_user_id, true) : null;
    if (row.assigned_user_id && (!workload?.enabled || !acceptsQueue(workload.queue_scope, row.assistance_category))) {
      throw new SupportError("That support agent is unavailable.", "unavailable");
    }
    if (!row.assigned_user_id) throw new SupportError("Assign an agent before reopening.", "unassigned");
    await assignConversation(conversationId, row.assigned_user_id, user.id, "reopened", now);
    const event=await runtimeGet<{id:number}>(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'reopened','staff reopened',?) RETURNING id
    `, [conversationId, user.id, now]);
    await enqueueChatAttention({conversationId,source:'support-reopened:'+event!.id,kind:'reopened',direction:'participant',now});
  });
}

export async function listSupportAgentWorkloads(user: SessionUser): Promise<SupportAgentWorkload[]> {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  return (await runtimeAll<{
    user_id: number;
    access_role: SessionUser["access_role"];
    name: string;
    email: string;
    enabled: number;
    queue_scope: SupportQueueScope;
    open_count: number;
  }>(`
    SELECT u.id user_id,u.name,u.email,p.access_role,COALESCE(s.enabled,0) enabled,COALESCE(s.queue_scope,'all') queue_scope,
      COUNT(c.id) open_count
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE p.access_role IN ('team_member','operations_manager')
    GROUP BY u.id,u.name,u.email,p.access_role,s.enabled,s.queue_scope
    ORDER BY COALESCE(s.enabled,0) DESC,COUNT(c.id),lower(u.name)
  `)).map((value) => {
    return {
      userId: value.user_id,
      accessRole: value.access_role,
      name: value.name,
      email: value.email,
      enabled: Boolean(value.enabled),
      queueScope: value.queue_scope,
      openConversations: value.open_count,
    };
  });
}

function supportAgentRows() {
  return `
    SELECT u.id user_id,u.name,u.email,p.access_role,COALESCE(s.enabled,0) enabled,COALESCE(s.queue_scope,'all') queue_scope,
      COUNT(c.id) open_count
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    LEFT JOIN support_conversations c
      ON c.assigned_user_id=u.id AND c.status='open'
    WHERE p.access_role IN ('team_member','operations_manager')
    GROUP BY u.id,u.name,u.email,p.access_role,s.enabled,s.queue_scope
  `;
}

function workloadView(row: {
  user_id: number;
  access_role: SessionUser["access_role"];
  name: string;
  email: string;
  enabled: number;
  queue_scope: SupportQueueScope;
  open_count: number;
}): SupportAgentWorkload {
  return {
    userId: row.user_id,
    accessRole: row.access_role,
    name: row.name,
    email: row.email,
    enabled: Boolean(row.enabled),
    queueScope: row.queue_scope,
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
  if (status === "available") conditions.push("enabled=1");
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const total = Number((await runtimeGet<{ count: number }>(`
    WITH workloads AS (${supportAgentRows()})
    SELECT COUNT(*) count FROM workloads ${where}
  `, values))?.count || 0);
  const window = pageWindow(total, request);
  const rows = await runtimeAll<{
    user_id: number;
    access_role: SessionUser["access_role"];
    name: string;
    email: string;
    enabled: number;
    queue_scope: SupportQueueScope;
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
    open_assignments: number;
    waiting_conversations: number;
  }>(`
    WITH workloads AS (${supportAgentRows()})
    SELECT
      COUNT(*) total_agents,
      SUM(CASE WHEN enabled=1 THEN 1 ELSE 0 END) enabled_agents,
      SUM(CASE WHEN enabled=1 THEN 1 ELSE 0 END) available_agents,
      SUM(open_count) open_assignments,
      (SELECT COUNT(*) FROM support_conversations WHERE status='waiting') waiting_conversations
    FROM workloads
  `))!;
  return {
    totalAgents: Number(row.total_agents || 0),
    enabledAgents: Number(row.enabled_agents || 0),
    availableAgents: Number(row.available_agents || 0),
    openAssignments: Number(row.open_assignments || 0),
    waitingConversations: Number(row.waiting_conversations || 0),
  };
}

export async function updateSupportAgentSetting(
  user: SessionUser,
  input: { userId: unknown; enabled: unknown; maxOpenConversations?: unknown; queueScope?: unknown },
  now = Date.now(),
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new SupportError("Operations access is required.", "forbidden");
  }
  return runtimeTransaction(async () => {
    await lockSupportWork();
    // Older clients may still send maxOpenConversations; it has no effect.
    const userId = Number.parseInt(String(input.userId ?? ""), 10);
    const enabled = input.enabled === true || input.enabled === "1" || input.enabled === "on";
    if (!Number.isSafeInteger(userId) || userId < 1) {
      throw new SupportError("Support agent settings are invalid.", "invalid_setting");
    }
    const staff = await runtimeGet(`
      SELECT 1 FROM user_access_profiles
      WHERE user_id=? AND access_role IN ('team_member','operations_manager')
    `, [userId]);
    if (!staff) throw new SupportError("Support agent was not found.", "invalid_agent");
    const currentWorkload = await supportAgentWorkload(userId);
    const scope = input.queueScope === undefined ? currentWorkload?.queue_scope || "all" : input.queueScope;
    if (scope !== "all" && scope !== "support" && scope !== "transport") throw new SupportError("Choose a support queue.", "invalid_setting");
    const targetRole = await runtimeGet<{access_role:string}>("SELECT access_role FROM user_access_profiles WHERE user_id=?",[userId]);
    if(targetRole?.access_role === "team_member" && scope === "all" &&
      (currentWorkload?.queue_scope === "support" || currentWorkload?.queue_scope === "transport"))
      throw new SupportError("Choose Support agent or Transport agent.","invalid_setting");
    const incompatible = await runtimeGet<{count:number}>(`SELECT COUNT(*) count FROM support_conversations
      WHERE assigned_user_id=? AND status='open' AND ?<>'all' AND
      (CASE WHEN assistance_category IN ('shipment_observation','buying_assistance') THEN 'transport' ELSE 'support' END)<>?`, [userId,scope,scope]);
    if (Number(incompatible?.count)) throw new SupportError("Reassign open conversations before changing this queue.", "queue_conflict");
    await runtimeRun(`
      INSERT INTO support_agent_settings(
        user_id,enabled,updated_by_user_id,updated_at,queue_scope
      ) VALUES(?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET
        enabled=excluded.enabled,
        queue_scope=excluded.queue_scope,
        updated_by_user_id=excluded.updated_by_user_id,
        updated_at=excluded.updated_at
    `, [userId, enabled ? 1 : 0, user.id, now, scope]);
    if (enabled) return routeWaitingSupportConversations(user, now);
    return { routed: 0, remaining: Number((await runtimeGet<{count:number}>(
      "SELECT COUNT(*) count FROM support_conversations WHERE status='waiting' AND assigned_user_id IS NULL",
    ))?.count || 0) };
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
        SET assigned_user_id=NULL,status='waiting',closed_at=NULL,updated_at=?,awaiting_participant_since=NULL,idle_ended_at=NULL,staff_joined_user_id=NULL,staff_joined_at=NULL,staff_joined_assignment_id=NULL,
          overdue_notified_message_id=NULL,overdue_notified_assignment_id=NULL
        WHERE id=?
      `, [now, conversationId]);
    } else {
      const workload = await supportAgentWorkload(assignedUserId, true);
      if (!workload?.enabled || !acceptsQueue(workload.queue_scope, row.assistance_category)) {
        throw new SupportError("That support agent is unavailable.", "unavailable");
      }
      await assignConversation(conversationId, assignedUserId, user.id, "reassigned", now);
    }
    const event=await runtimeGet<{id:number}>(`
      INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
      VALUES(?,?,'reassigned',?,?) RETURNING id
    `, [conversationId, user.id, assignedUserId === null ? "waiting" : `agent:${assignedUserId}`, now]);
    if(row.assigned_user_id!==null) await enqueueChatAttention({conversationId,source:'support-reassigned:'+event!.id,kind:'reassigned',direction:'staff',oldAgentId:row.assigned_user_id,now});
    if(assignedUserId===null) await enqueueChatAttention({conversationId,source:'support-waiting:'+event!.id,kind:'waiting_chat',direction:'staff',now});
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
