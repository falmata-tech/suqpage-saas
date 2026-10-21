import { hashPrivateValue } from './security-core';
import { PostgresTransactionRunner } from './postgres-runtime';
import { postgresRuntimeServices } from './postgres-runtime-services';
import type { SessionUser } from './types';
import { attentionPreferenceInput, defaultAttentionPreferences, type AttentionKind, type AttentionFeed, type AttentionItem, type AttentionPreferences } from './attention-contract';
import {pushCapabilities,validatedPushSubscription} from './attention-push';
import { SUPPORT_STAFF_REPLY_TARGET_MS } from './support-response-contract';
import {supportReplyOverdueSource} from './support-assignment-response';
import {SUPPORT_ACTIVE_ASSIGNMENT_JOIN,SUPPORT_RESPONSE_EPOCH_SQL,SUPPORT_RESPONSE_START_SQL} from './support-response-sql';

export class AttentionError extends Error { constructor(message: string, readonly code = 'not_found') { super(message); } }
type Actor = { id: number; access_role: string; business_id: number | null; enabled: boolean | number | null; queue_scope: string | null };
type Case = { id: number; participant_kind: 'client' | 'visitor'; business_id: number | null; opened_by_user_id: number | null; assigned_user_id: number | null; assistance_category: string; status: string; visitor_session_expires_at: number | null };
type Recipient = { key: string; userId?: number; visitorId?: number };
type Event = { source: string; kind: AttentionKind; conversationId?: number; inquiryId?: number; now: number; emailManagers?:boolean };
type NotificationRow = { id: number; user_id: number | null; conversation_id: number | null; inquiry_id: number | null; inquiry_business_id:number|null; kind: AttentionKind; created_at: number; read_at: number | null; assistance_category: string | null };
const executor = () => postgresRuntimeServices().runner;
const transport = (category: string) => ['buying_assistance','shipment_observation'].includes(category);

async function caseRow(runner: PostgresTransactionRunner, id: number): Promise<Case> {
  const row = (await runner.query<Case>('SELECT id,participant_kind,business_id,opened_by_user_id,assigned_user_id,assistance_category,status,visitor_session_expires_at FROM support_conversations WHERE id=?',[id])).rows[0];
  if (!row) throw new AttentionError('This chat is unavailable.');
  return row;
}
async function recipients(runner: PostgresTransactionRunner, c: Case, direction: 'participant'|'staff', now: number): Promise<Recipient[]> {
  if (direction === 'participant') {
    if (c.participant_kind === 'visitor') return c.visitor_session_expires_at && c.visitor_session_expires_at >= now ? [{ key: 'visitor:'+c.id, visitorId:c.id }] : [];
    const rows = await runner.query<{id:number}>("SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.business_id=? AND p.access_role='client'",[c.business_id]);
    return rows.rows.map(row=>({key:'user:'+row.id,userId:row.id}));
  }
  if (c.assigned_user_id !== null) return [{key:'user:'+c.assigned_user_id,userId:c.assigned_user_id}];
  const rows = await runner.query<{id:number}>(`SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id LEFT JOIN support_agent_settings s ON s.user_id=u.id
    WHERE p.access_role IN ('platform_admin','operations_manager') OR
      (p.access_role='team_member' AND s.enabled=1 AND s.queue_scope IN ('all',?))`,[transport(c.assistance_category)?'transport':'support']);
  return rows.rows.map(row=>({key:'user:'+row.id,userId:row.id}));
}
async function enqueue(runner: PostgresTransactionRunner, targets: Recipient[], event: Event) {
  for (const target of targets) {
    const inserted = await runner.query<{id:number}>(`INSERT INTO attention_notifications(source_key,recipient_key,user_id,visitor_conversation_id,conversation_id,inquiry_id,kind,created_at)
      VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(source_key,recipient_key) DO NOTHING RETURNING id`,[event.source,target.key,target.userId??null,target.visitorId??null,event.conversationId??null,event.inquiryId??null,event.kind,event.now]);
    if (!inserted.rows[0]) continue;
    if(event.kind==='reply_overdue'&&event.emailManagers&&target.userId)await runner.query(`INSERT INTO attention_email_deliveries(notification_id,created_at,next_attempt_at,expires_at)
      SELECT ?,?,?,? FROM user_access_profiles p WHERE p.user_id=? AND p.access_role IN ('platform_admin','operations_manager')
      ON CONFLICT(notification_id) DO NOTHING`,[inserted.rows[0].id,event.now,event.now,event.now+24*60*60_000,target.userId]);
    await runner.query(`INSERT INTO attention_deliveries(notification_id,subscription_id,next_attempt_at)
      SELECT ?,s.id,? FROM attention_subscriptions s WHERE s.recipient_key=? AND s.revoked_at IS NULL AND (s.expires_at IS NULL OR s.expires_at>=?)
      ON CONFLICT(notification_id,subscription_id) DO NOTHING`,[inserted.rows[0].id,event.now,target.key,event.now]);
  }
}
export async function enqueueInquiryAttention(runner: PostgresTransactionRunner, businessId: number, inquiryId: number, now=Date.now()) {
  const rows=await runner.query<{id:number}>("SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.business_id=? AND p.access_role='client'",[businessId]);
  const targets=rows.rows.length?rows.rows:(await runner.query<{id:number}>("SELECT user_id id FROM user_access_profiles WHERE access_role IN ('platform_admin','operations_manager')")).rows;
  await enqueue(runner,targets.map(row=>({key:'user:'+row.id,userId:row.id})),{source:'inquiry:'+inquiryId,kind:'inquiry',inquiryId,now});
}
export async function enqueueChatAttention(input: { conversationId:number; source:string; kind:Exclude<AttentionKind,'inquiry'>; direction:'participant'|'staff'; now:number; oldAgentId?:number }) {
  if(input.direction==='participant'&&['assigned','reassigned','reply_overdue'].includes(input.kind))return;
  const runner=executor(),c=await caseRow(runner,input.conversationId);
  if(input.kind==='reassigned' && input.oldAgentId) {
    await enqueue(runner,[{key:'user:'+input.oldAgentId,userId:input.oldAgentId}],{source:input.source,kind:'reassigned',now:input.now});return;
  }
  await enqueue(runner,await recipients(runner,c,input.direction,input.now),{source:input.source,kind:input.kind,conversationId:c.id,now:input.now});
  if(input.oldAgentId && input.oldAgentId!==c.assigned_user_id) await enqueue(runner,[{key:'user:'+input.oldAgentId,userId:input.oldAgentId}],{source:input.source,kind:'reassigned',now:input.now});
}

/** Called within the support-work transaction; no participant is an escalation recipient. */
export async function enqueueReplyOverdueAttention(conversationId:number,messageId:number,assignmentId:number,now:number):Promise<number>{
  const runner=executor();
  const c=(await runner.query<{id:number;assigned_user_id:number|null;assistance_category:string;assigned_staff:boolean}>(`SELECT c.id,c.assigned_user_id,c.assistance_category,
    (current_assignment.id IS NOT NULL AND EXISTS(SELECT 1 FROM user_access_profiles p LEFT JOIN support_agent_settings s ON s.user_id=p.user_id
      WHERE p.user_id=c.assigned_user_id AND (p.access_role IN ('platform_admin','operations_manager') OR
        (p.access_role='team_member' AND s.queue_scope IN ('all',CASE WHEN c.assistance_category IN ('buying_assistance','shipment_observation') THEN 'transport' ELSE 'support' END))))) assigned_staff
    FROM support_conversations c ${SUPPORT_ACTIVE_ASSIGNMENT_JOIN}
    WHERE c.id=? AND c.status IN ('waiting','open') AND c.resolved_at IS NULL
      AND c.awaiting_staff_message_id=? AND ${SUPPORT_RESPONSE_START_SQL}<=? AND ${SUPPORT_RESPONSE_EPOCH_SQL}=?`,
    [conversationId,messageId,now-SUPPORT_STAFF_REPLY_TARGET_MS,assignmentId])).rows[0];
  if(!c)return 0;
  const targets=(await runner.query<{id:number}>(`SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    WHERE p.access_role IN ('platform_admin','operations_manager') OR
      (u.id=? AND p.access_role='team_member' AND s.queue_scope IN ('all',?))`,
    [c.assigned_user_id,transport(c.assistance_category)?'transport':'support'])).rows;
  await enqueue(runner,targets.map(row=>({key:'user:'+row.id,userId:row.id})),
    {source:supportReplyOverdueSource(conversationId,messageId,assignmentId),kind:'reply_overdue',conversationId,now,emailManagers:c.assigned_staff});
  return targets.length;
}
async function actor(user: SessionUser): Promise<Actor> {
  const row=(await executor().query<Actor>(`SELECT u.id,p.access_role,u.business_id,s.enabled,s.queue_scope FROM users u JOIN user_access_profiles p ON p.user_id=u.id LEFT JOIN support_agent_settings s ON s.user_id=u.id WHERE u.id=?`,[user.id])).rows[0];
  if(!row || row.access_role!==user.access_role || row.business_id!==user.business_id) throw new AttentionError('Sign in to continue.');
  return row;
}
async function visitor(token: unknown, now=Date.now()): Promise<Case> {
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{40,120}$/.test(token)) throw new AttentionError('This chat is unavailable.');
  const row=(await executor().query<Case>(`SELECT id,participant_kind,business_id,opened_by_user_id,assigned_user_id,assistance_category,status,visitor_session_expires_at FROM support_conversations
    WHERE visitor_token_hash=? AND participant_kind='visitor' AND visitor_session_expires_at>=? AND assistance_category IN ('buying_assistance','shipment_observation')`,[hashPrivateValue('public-support:'+token),now])).rows[0];
  if(!row) throw new AttentionError('This chat is unavailable.');return row;
}
async function preferences(key: string): Promise<AttentionPreferences> {
  const row=(await executor().query<{sound_enabled:boolean;language:AttentionPreferences['language']}>('SELECT sound_enabled,language FROM attention_preferences WHERE recipient_key=?',[key])).rows[0];
  return row?{soundEnabled:row.sound_enabled,language:row.language}:defaultAttentionPreferences;
}
function allowedRows(a: Actor): {where:string;values:Array<string|number|null>} {
  if(a.access_role==='client') return {where:'((n.inquiry_id IS NOT NULL AND i.business_id=?) OR (n.conversation_id IS NOT NULL AND c.business_id=?))',values:[a.business_id,a.business_id]};
  if(['platform_admin','operations_manager'].includes(a.access_role)) return {where:'TRUE',values:[]};
  return {where:`(n.kind='reassigned' AND n.conversation_id IS NULL) OR c.assigned_user_id=? OR (c.status='waiting' AND ?=1 AND ? IN ('all',CASE WHEN c.assistance_category IN ('buying_assistance','shipment_observation') THEN 'transport' ELSE 'support' END))`,values:[a.id,Number(Boolean(a.enabled)),a.queue_scope]};
}
function currentAttentionSql(participant:boolean){
  return `${participant?"n.kind NOT IN ('assigned','reassigned','reply_overdue') AND ":''}
    (n.kind<>'joined' OR (c.staff_joined_assignment_id IS NOT NULL
      AND c.staff_joined_assignment_id=(SELECT MAX(a.id) FROM support_assignments a WHERE a.conversation_id=c.id)
      AND c.staff_joined_user_id=c.assigned_user_id
      AND n.source_key='support-manual-joined:' || c.staff_joined_assignment_id::text))
    AND (n.kind<>'reply_overdue' OR (c.status IN ('waiting','open') AND c.resolved_at IS NULL
      AND ${SUPPORT_RESPONSE_START_SQL}<=? AND c.awaiting_staff_message_id IS NOT NULL
      AND n.source_key='support-reply-overdue:' || c.id::text || ':' || c.awaiting_staff_message_id::text || ':' || ${SUPPORT_RESPONSE_EPOCH_SQL}::text
      AND (EXISTS(SELECT 1 FROM user_access_profiles p WHERE p.user_id=n.user_id AND p.access_role IN ('platform_admin','operations_manager')) OR
        (c.assigned_user_id=n.user_id AND EXISTS(SELECT 1 FROM user_access_profiles p JOIN support_agent_settings s ON s.user_id=p.user_id
          WHERE p.user_id=n.user_id AND p.access_role='team_member' AND s.queue_scope IN ('all',CASE
            WHEN c.assistance_category IN ('buying_assistance','shipment_observation') THEN 'transport' ELSE 'support' END))))))`;
}
async function feed(key:string, actorRow: Actor|null, visitorRow:Case|null):Promise<AttentionFeed> {
  const scope=actorRow?allowedRows(actorRow):{where:'n.visitor_conversation_id=?',values:[visitorRow!.id]};
  const indexedActor = actorRow ? 'n.user_id=?' : 'n.visitor_conversation_id=?';
  const from=`FROM attention_notifications n LEFT JOIN support_conversations c ON c.id=n.conversation_id ${SUPPORT_ACTIVE_ASSIGNMENT_JOIN} LEFT JOIN inquiries i ON i.id=n.inquiry_id WHERE ${indexedActor} AND n.recipient_key=? AND (${scope.where}) AND ${currentAttentionSql(!actorRow||actorRow.access_role==='client')}`;
  const values=[actorRow?.id??visitorRow!.id,key,...scope.values,Date.now()-SUPPORT_STAFF_REPLY_TARGET_MS];
  const rows=(await executor().query<NotificationRow>(`SELECT n.*,c.assistance_category,i.business_id inquiry_business_id ${from} ORDER BY n.id DESC LIMIT 30`,values)).rows;
  const counts=(await executor().query<{unread:number}>(`SELECT COUNT(*) unread ${from} AND n.read_at IS NULL`,values)).rows[0];
  const items=rows.map((n):AttentionItem=>({id:n.id,kind:n.kind,channel:n.conversation_id?(transport(n.assistance_category||'')?'transport':'support'):null,createdAt:n.created_at,read:n.read_at!==null,
    destination:n.inquiry_id?{screen:'inquiries',id:n.inquiry_id,businessId:n.inquiry_business_id??undefined}:visitorRow?{screen:'transport-chat'}:n.conversation_id?{screen:actorRow?.access_role==='client'?'owner-chat':'support-chat',id:n.conversation_id}:{screen:'support-queue'}}));
  const subs=(await executor().query<{kind:'web'|'expo'}>('SELECT DISTINCT kind FROM attention_subscriptions WHERE recipient_key=? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>=?)',[key,Date.now()])).rows;
  return {items,unread:Number(counts.unread),latestId:items[0]?.id||0,preferences:await preferences(key),enabled:{web:subs.some(s=>s.kind==='web'),expo:subs.some(s=>s.kind==='expo')}};
}
export async function userAttentionFeed(user: SessionUser) {const a=await actor(user);return feed('user:'+a.id,a,null);}
export async function visitorAttentionFeed(token:unknown,now=Date.now()) {const c=await visitor(token,now);return feed('visitor:'+c.id,null,c);}
export async function assertVisitorAttentionChannel(token:unknown,channel:'transport'|'buying'){const c=await visitor(token);if(c.assistance_category!==(channel==='transport'?'shipment_observation':'buying_assistance'))throw new AttentionError('This chat is unavailable.');}
export async function userAttentionPreferences(user:SessionUser,raw:Record<string,unknown>) {const a=await actor(user);return savePreferences('user:'+a.id,raw);}
export async function visitorAttentionPreferences(token:unknown,raw:Record<string,unknown>) {const c=await visitor(token);return savePreferences('visitor:'+c.id,raw);}
async function savePreferences(key:string,raw:Record<string,unknown>) {
  let p:AttentionPreferences;try{p=attentionPreferenceInput(raw);}catch{throw new AttentionError('Choose your alert settings.','invalid');}
  await executor().query(`INSERT INTO attention_preferences(recipient_key,sound_enabled,language,updated_at) VALUES(?,?,?,?)
    ON CONFLICT(recipient_key) DO UPDATE SET sound_enabled=EXCLUDED.sound_enabled,language=EXCLUDED.language,updated_at=EXCLUDED.updated_at`,[key,p.soundEnabled,p.language,Date.now()]);return p;
}
async function markRead(key:string,id:unknown) {
  if(typeof id!=='number'||!Number.isSafeInteger(id)||id<1) throw new AttentionError('Choose an alert.','invalid');
  await executor().query('UPDATE attention_notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND recipient_key=?',[Date.now(),id,key]);
}
export async function readUserAttention(user:SessionUser,id:unknown) {const a=await actor(user);const current=await userAttentionFeed(user);if(!current.items.some(n=>n.id===id))throw new AttentionError('This alert is unavailable.');await markRead('user:'+a.id,id);}
export async function readVisitorAttention(token:unknown,id:unknown) {const c=await visitor(token);const current=await visitorAttentionFeed(token);if(!current.items.some(n=>n.id===id))throw new AttentionError('This alert is unavailable.');await markRead('visitor:'+c.id,id);}

async function readAll(key:string,a:Actor|null,c:Case|null,through:unknown){
  const current=await feed(key,a,c);
  if(typeof through!=='number'||!Number.isSafeInteger(through)||through<1||through>current.latestId)throw new AttentionError('Choose an alert.','invalid');
  const scope=a?allowedRows(a):{where:'n.visitor_conversation_id=?',values:[c!.id]};
  await executor().query(`UPDATE attention_notifications SET read_at=COALESCE(read_at,?) WHERE id IN (
    SELECT n.id FROM attention_notifications n LEFT JOIN inquiries i ON i.id=n.inquiry_id LEFT JOIN support_conversations c ON c.id=n.conversation_id ${SUPPORT_ACTIVE_ASSIGNMENT_JOIN}
    WHERE n.recipient_key=? AND n.id<=? AND (${scope.where}) AND ${currentAttentionSql(!a||a.access_role==='client')})`,[Date.now(),key,through,...scope.values,Date.now()-SUPPORT_STAFF_REPLY_TARGET_MS]);
}
export async function readAllUserAttention(user:SessionUser,through:unknown){const a=await actor(user);await readAll('user:'+a.id,a,null,through);}
export async function readAllVisitorAttention(token:unknown,through:unknown){const c=await visitor(token);await readAll('visitor:'+c.id,null,c,through);}

async function subscribe(key:string,raw:unknown,expiresAt:number|null,nativeAllowed:boolean){
  let input:ReturnType<typeof validatedPushSubscription>;try{input=validatedPushSubscription(raw);}catch{throw new AttentionError('Choose a supported notification device.','invalid');}
  if(input.kind==='expo'&&!nativeAllowed)throw new AttentionError('Staff accounts sign in on the website.','forbidden');
  const caps=pushCapabilities();if(!(input.kind==='web'?caps.web.available:caps.expo.available))throw new AttentionError('Notifications are not available yet.','unconfigured');
  const endpoint=input.kind==='web'?input.subscription.endpoint:input.token;
  const hash=hashPrivateValue('attention-device:'+endpoint);
  return executor().transaction(async()=>{
  await executor().query('SELECT pg_advisory_xact_lock(hashtextextended(?,0))',['attention-device:'+hash]);
  const previous=(await executor().query<{recipient_key:string}>('SELECT recipient_key FROM attention_subscriptions WHERE endpoint_hash=? AND revoked_at IS NULL',[hash])).rows;
  if(previous.some(p=>p.recipient_key!==key&&p.recipient_key.split(':')[0]===key.split(':')[0]))throw new AttentionError('This device is already registered.','device_bound');
  const now=Date.now();
  const saved=(await executor().query<{id:number}>(`INSERT INTO attention_subscriptions(recipient_key,kind,endpoint_hash,subscription_json,expires_at,created_at)
    VALUES(?,?,?,?,?,?) ON CONFLICT(endpoint_hash,recipient_key) DO UPDATE SET kind=EXCLUDED.kind,subscription_json=EXCLUDED.subscription_json,expires_at=EXCLUDED.expires_at,revoked_at=NULL RETURNING id`,[key,input.kind,hash,JSON.stringify(input),expiresAt,now])).rows[0];
  await executor().query(`INSERT INTO attention_deliveries(notification_id,subscription_id,next_attempt_at)
    SELECT n.id,?,? FROM attention_notifications n WHERE n.recipient_key=? AND n.read_at IS NULL AND n.kind IN ('message','inquiry') AND n.created_at>=?
    ON CONFLICT(notification_id,subscription_id) DO NOTHING`,[saved.id,now,key,now-5*60*1000]);
  return {saved:true};
  });
}
export async function subscribeUserAttention(user:SessionUser,raw:unknown){const a=await actor(user);return subscribe('user:'+a.id,raw,Date.now()+90*24*60*60*1000,a.access_role==='client');}
export async function subscribeVisitorAttention(token:unknown,raw:unknown){const c=await visitor(token);return subscribe('visitor:'+c.id,raw,c.visitor_session_expires_at,true);}
async function revoke(key:string){await executor().query('UPDATE attention_subscriptions SET revoked_at=COALESCE(revoked_at,?) WHERE recipient_key=?',[Date.now(),key]);return {saved:true};}
export async function revokeUserAttention(user:SessionUser){const a=await actor(user);return revoke('user:'+a.id);}
export async function revokeVisitorAttention(token:unknown){const c=await visitor(token);return revoke('visitor:'+c.id);}
export {pushCapabilities};
