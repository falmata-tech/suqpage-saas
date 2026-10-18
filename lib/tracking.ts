import crypto from 'node:crypto';
import type {SessionUser} from './types';
import {hashPrivateValue} from './security';
import {consumeRuntimeRateLimit} from './rate-limit-runtime';
import {runtimeAll,runtimeGet,runtimeRun,runtimeTransaction} from './runtime-sql';
import {transportPlanEtagMatches} from './transport-plan-contract';
import {
 TrackingError,TRACKING_CODE_MS,TRACKING_SESSION_MS,TRACKING_RESEND_SECONDS,TRACKING_LIST_LIMIT,
 isTrackingChallengeId,isTrackingReference,isTrackingToken,trackingEmail,trackingRecord,parseTrackingShipment,
 parseTrackingSubmit,parseTrackingUpdate,parseTrackingRevoke,trackingEtag,
 type TrackingChallenge,type TrackingSession,type TrackingList,type TrackingRead,type TrackingShipment,
 type StaffTrackingShipment,type StaffTrackingList,type TrackingLocale,type TransportPlanLegInput,
} from './tracking-contract';
export {TrackingError} from './tracking-contract';
export type TrackingChallengeRow={id:string;email:string;email_hash:string;nonce:string;code_hash:string;locale:TrackingLocale;attempts:number;created_at:number;expires_at:number;consumed_at:number|null;superseded_at:number|null};
type Recipient={id:number;email:string;email_hash:string;locale:TrackingLocale;verified_at:number|null};
type SessionRow={recipient_id:number;expires_at:number};
export type TrackingShipmentRow={id:number;reference:string;recipient_id:number;label:string;version:number;legs:unknown;created_by_user_id:number|null;idempotency_key:string;created_at:number;updated_at:number;revoked_at:number|null};
const invalid=()=>new TrackingError('Check the shipment details.','invalid');
function unauthenticated():never{throw new TrackingError('Verify your email to view shipments.','unauthenticated');}
function notFound():never{throw new TrackingError('Shipment was not found.','not_found');}
function conflict():never{throw new TrackingError('This shipment changed. Reload before saving.','conflict');}
function time(now:number){if(!Number.isSafeInteger(now)||now<0||now>8_640_000_000_000_000-TRACKING_SESSION_MS)throw invalid();}
export const trackingEmailHash=(email:string)=>hashPrivateValue(`tracking-email:v1:${email}`);
export const trackingSessionHash=(token:string)=>hashPrivateValue(`tracking-session:v1:${token}`);
export function trackingCode(row:Pick<TrackingChallengeRow,'nonce'|'email'>){return(BigInt('0x'+hashPrivateValue(`tracking-email-code:v1:${row.nonce}:${row.email}`))%BigInt(1_000_000)).toString().padStart(6,'0');}
export const trackingCodeHash=(id:string,email:string,code:string)=>hashPrivateValue(`tracking-email-proof:v1:${id}:${email}:${code}`);
function equal(a:string,b:string){return a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export function trackingChallengeSendable(row:TrackingChallengeRow,now:number){return row.consumed_at===null&&row.superseded_at===null&&row.attempts<5&&row.expires_at>now&&equal(trackingCodeHash(row.id,row.email,trackingCode(row)),row.code_hash);}
function ipHash(key:unknown){if(typeof key!=='string'||key.length>160)throw invalid();return hashPrivateValue('tracking-ip:v1:'+key);}
function rateError(seconds:number):never{throw new TrackingError('Too many code requests. Try again later.','rate_limited',seconds);}

export async function requestTrackingCode(input:{email:unknown;locale?:unknown;ipKey:string},now=Date.now()):Promise<TrackingChallenge>{
 time(now);const raw=trackingRecord(input,['email','locale','ipKey']),email=trackingEmail(raw.email),emailHash=trackingEmailHash(email),ip=ipHash(raw.ipKey);
 const locale:TrackingLocale=raw.locale===undefined?'en':raw.locale==='en'||raw.locale==='am'||raw.locale==='om'?raw.locale:(()=>{throw invalid();})();
 for(const[key,limit]of[[`tracking:start:ip:${ip}`,8],[`tracking:start:email:${emailHash}`,4]]as const){const rate=await consumeRuntimeRateLimit(key,limit,3_600_000);if(!rate.allowed)rateError(rate.retryAfterSeconds);}
 return runtimeTransaction(async()=>{
  await runtimeGet('SELECT pg_advisory_xact_lock(hashtextextended(?,138))',[emailHash]);
  const previous=await runtimeGet<TrackingChallengeRow>('SELECT * FROM tracking_challenges WHERE email_hash=? ORDER BY created_at DESC,id DESC LIMIT 1 FOR UPDATE',[emailHash]);
  if(previous&&previous.created_at+60_000>now){
   const remaining=Math.ceil((previous.created_at+60_000-now)/1000);
   if(!trackingChallengeSendable(previous,now))throw new TrackingError('Please wait a moment and try again.','rate_limited',remaining);
   return{challengeId:previous.id,resendAfter:remaining};
  }
  await runtimeRun('UPDATE tracking_challenges SET superseded_at=? WHERE email_hash=? AND superseded_at IS NULL',[now,emailHash]);
  await runtimeRun(`UPDATE tracking_email_deliveries d SET state='ignored',lease_until=NULL,error_category='superseded'
   WHERE state IN ('pending','sending') AND EXISTS(SELECT 1 FROM tracking_challenges c WHERE c.id=d.challenge_id AND c.email_hash=?)`,[emailHash]);
  const id=crypto.randomBytes(16).toString('hex'),nonce=crypto.randomBytes(32).toString('hex'),proof=trackingCodeHash(id,email,trackingCode({nonce,email}));
  await runtimeRun('INSERT INTO tracking_challenges(id,email,email_hash,nonce,code_hash,locale,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?)',[id,email,emailHash,nonce,proof,locale,now,now+TRACKING_CODE_MS]);
  await runtimeRun("INSERT INTO tracking_email_deliveries(kind,challenge_id,created_at,next_attempt_at,expires_at) VALUES('code',?,?,?,?)",[id,now,now,now+TRACKING_CODE_MS]);
  return{challengeId:id,resendAfter:TRACKING_RESEND_SECONDS};
 });
}
export async function verifyTrackingCode(input:{challengeId:unknown;code:unknown;ipKey?:string},now=Date.now()):Promise<TrackingSession>{
 time(now);const raw=trackingRecord(input,['challengeId','code','ipKey']);
 if(!isTrackingChallengeId(raw.challengeId)||typeof raw.code!=='string'||!/^\d{6}$/.test(raw.code))throw new TrackingError('That code is incorrect or has expired.','invalid');
 const challengeId=raw.challengeId,code=raw.code,ip=ipHash(raw.ipKey??'unknown');
 const rate=await consumeRuntimeRateLimit(`tracking:verify:ip:${ip}`,20,15*60_000);if(!rate.allowed)rateError(rate.retryAfterSeconds);
 const lookup=await runtimeGet<Pick<TrackingChallengeRow,'email_hash'>>('SELECT email_hash FROM tracking_challenges WHERE id=?',[challengeId]);
 if(lookup){const emailRate=await consumeRuntimeRateLimit(`tracking:verify:email:${lookup.email_hash}`,20,15*60_000);if(!emailRate.allowed)rateError(emailRate.retryAfterSeconds);}
 const result=await runtimeTransaction(async()=>{
  const row=await runtimeGet<TrackingChallengeRow>('SELECT * FROM tracking_challenges WHERE id=? FOR UPDATE',[challengeId]);
  if(!row||row.consumed_at!==null||row.superseded_at!==null||row.expires_at<=now||row.attempts>=5)return null;
  if(!equal(trackingCodeHash(row.id,row.email,code),row.code_hash)){await runtimeRun('UPDATE tracking_challenges SET attempts=attempts+1 WHERE id=?',[row.id]);return null;}
  await runtimeRun('UPDATE tracking_challenges SET consumed_at=? WHERE id=?',[now,row.id]);
  await runtimeRun("UPDATE tracking_email_deliveries SET state='ignored',lease_until=NULL,error_category='consumed' WHERE challenge_id=? AND state IN ('pending','sending')",[row.id]);
  const recipient=await runtimeGet<Recipient>(`INSERT INTO tracking_recipients(email,email_hash,locale,verified_at) VALUES(?,?,?,?)
   ON CONFLICT(email) DO UPDATE SET email_hash=EXCLUDED.email_hash,locale=EXCLUDED.locale,verified_at=EXCLUDED.verified_at RETURNING *`,[row.email,row.email_hash,row.locale,now]);
  if(!recipient)throw Error('Tracking recipient write failed');
  const token=crypto.randomBytes(32).toString('hex'),expiresAt=now+TRACKING_SESSION_MS;
  await runtimeRun('INSERT INTO tracking_sessions(token_hash,recipient_id,created_at,expires_at) VALUES(?,?,?,?)',[trackingSessionHash(token),recipient.id,now,expiresAt]);
  return{token,expiresAt};
 });
 if(!result)throw new TrackingError('That code is incorrect or has expired.','invalid');return result;
}
async function session(token:unknown,now:number):Promise<SessionRow>{
 if(!isTrackingToken(token))unauthenticated();
 const row=await runtimeGet<SessionRow>('SELECT s.recipient_id,s.expires_at FROM tracking_sessions s JOIN tracking_recipients r ON r.id=s.recipient_id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>? AND r.verified_at IS NOT NULL FOR SHARE OF s,r',[trackingSessionHash(token),now]);
 if(!row)unauthenticated();return row;
}
export async function readTrackingSession(token:unknown,now=Date.now()){time(now);return runtimeTransaction(async()=>{const row=await session(token,now);return{expiresAt:row.expires_at};});}
export async function revokeTrackingSession(token:unknown,now=Date.now()){time(now);if(isTrackingToken(token))await runtimeRun('UPDATE tracking_sessions SET revoked_at=COALESCE(revoked_at,?) WHERE token_hash=?',[now,trackingSessionHash(token)]);return{saved:true};}
function cursor(value:unknown){if(value===undefined||value===null||value==='')return null;if(typeof value!=='string'||!/^[1-9]\d{0,18}$/.test(value)||BigInt(value)>BigInt('9223372036854775807'))throw invalid();return value;}
function shipment(row:TrackingShipmentRow):TrackingShipment{return parseTrackingShipment({reference:row.reference,label:row.label,version:row.version,legs:row.legs});}
function summary(row:TrackingShipmentRow){const value=shipment(row);return{reference:value.reference,label:value.label,version:value.version,firstOrigin:value.legs[0].origin,lastDestination:value.legs.at(-1)!.destination,legCount:value.legs.length};}
export async function listRecipientShipments(token:unknown,after?:unknown,now=Date.now()):Promise<TrackingList>{
 time(now);const from=cursor(after);return runtimeTransaction(async()=>{
  const who=await session(token,now),rows=await runtimeAll<TrackingShipmentRow>(`SELECT * FROM tracking_shipments WHERE recipient_id=? AND revoked_at IS NULL${from?' AND id<?':''} ORDER BY id DESC LIMIT 25`,from?[who.recipient_id,from]:[who.recipient_id]);
  return{shipments:rows.slice(0,TRACKING_LIST_LIMIT).map(summary),nextCursor:rows.length>TRACKING_LIST_LIMIT?String(rows[TRACKING_LIST_LIMIT-1].id):null};
 });
}
export async function readRecipientShipment(token:unknown,reference:unknown,ifNoneMatch?:unknown,now=Date.now()):Promise<TrackingRead>{
 time(now);return runtimeTransaction(async()=>{
  const who=await session(token,now);if(!isTrackingReference(reference))notFound();
  const header=await runtimeGet<{id:number;reference:string;version:number}>('SELECT id,reference,version FROM tracking_shipments WHERE reference=? AND recipient_id=? AND revoked_at IS NULL FOR SHARE',[reference,who.recipient_id]);
  if(!header)notFound();const etag=trackingEtag(header);if(transportPlanEtagMatches(ifNoneMatch,etag))return{kind:'not_modified',etag};
  const row=await runtimeGet<TrackingShipmentRow>('SELECT * FROM tracking_shipments WHERE id=?',[header.id]);if(!row)notFound();return{kind:'shipment',etag,shipment:shipment(row)};
 });
}

async function staff(actor:SessionUser,managerOnly=false){
 if(!Number.isSafeInteger(actor.id)||actor.id<1)throw new TrackingError('Tracking access is required.','forbidden');
 const row=await runtimeGet<{access_role:SessionUser['access_role'];business_id:number|null}>(`SELECT p.access_role,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? FOR SHARE OF u,p`,[actor.id]);
 if(!row||row.access_role!==actor.access_role||row.business_id!==actor.business_id)throw new TrackingError('Tracking access is required.','forbidden');
 if(['platform_admin','operations_manager'].includes(row.access_role))return;
 const settings=row.access_role==='team_member'&&!managerOnly?await runtimeGet<{queue_scope:string}>('SELECT queue_scope FROM support_agent_settings WHERE user_id=? FOR SHARE',[actor.id]):null;
 if(!settings||!['all','transport'].includes(settings.queue_scope))throw new TrackingError('Tracking access is required.','forbidden');
}
async function staffProjection(row:TrackingShipmentRow):Promise<StaffTrackingShipment>{
 const recipient=await runtimeGet<Recipient>('SELECT * FROM tracking_recipients WHERE id=?',[row.recipient_id]);if(!recipient)notFound();
 const delivery=await runtimeGet<{state:string;error_category:string|null}>('SELECT state,error_category FROM tracking_email_deliveries WHERE shipment_id=?',[row.id]);
 const deliveryState=row.revoked_at!==null||delivery?.state==='ignored'?'cancelled':delivery?.state==='accepted'?'accepted':delivery?.state==='failed'?'failed':delivery?.state==='sending'?'sending':delivery?.error_category==='missing_configuration'?'deferred':'queued';
 return{...shipment(row),id:row.id,recipientEmail:recipient.email,revokedAt:row.revoked_at,deliveryState,sharePath:'/tracking/'+row.reference,createdAt:row.created_at,updatedAt:row.updated_at};
}
export async function readTrackingRecipientVerification(actor:SessionUser,email:unknown){const normalized=trackingEmail(email);return runtimeTransaction(async()=>{await staff(actor);return{verified:Boolean(await runtimeGet('SELECT 1 FROM tracking_recipients WHERE email=? AND email_hash=? AND verified_at IS NOT NULL',[normalized,trackingEmailHash(normalized)]))};});}
export async function listStaffTrackingShipments(actor:SessionUser,input:{q?:string;cursor?:string}={}):Promise<StaffTrackingList>{
 const raw=trackingRecord(input,['q','cursor']),q=raw.q===undefined?'':typeof raw.q==='string'?raw.q.trim():(()=>{throw invalid();})();if(q.length>120)throw invalid();const after=cursor(raw.cursor);
 return runtimeTransaction(async()=>{
  await staff(actor);const values:Array<string|number>=[];const where:string[]=[];
  if(after){where.push('s.id<?');values.push(after);}if(q){where.push('(s.reference ILIKE ? OR s.label ILIKE ? OR r.email ILIKE ?)');const escaped='%'+q.replace(/[\\%_]/g,'\\$&')+'%';values.push(escaped,escaped,escaped);}
  const rows=await runtimeAll<TrackingShipmentRow>(`SELECT s.* FROM tracking_shipments s JOIN tracking_recipients r ON r.id=s.recipient_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY s.id DESC LIMIT 25`,values);
  const shipments=[];for(const row of rows.slice(0,TRACKING_LIST_LIMIT)){const value=await staffProjection(row);const{legs,...rest}=value;shipments.push({...rest,firstOrigin:legs[0].origin,lastDestination:legs.at(-1)!.destination,legCount:legs.length});}
  return{shipments,nextCursor:rows.length>TRACKING_LIST_LIMIT?String(rows[TRACKING_LIST_LIMIT-1].id):null};
 });
}
export async function readStaffTrackingShipment(actor:SessionUser,shipmentId:number):Promise<StaffTrackingShipment>{
 return runtimeTransaction(async()=>{await staff(actor);if(!Number.isSafeInteger(shipmentId)||shipmentId<1)notFound();const row=await runtimeGet<TrackingShipmentRow>('SELECT * FROM tracking_shipments WHERE id=? FOR SHARE',[shipmentId]);if(!row)notFound();return staffProjection(row);});
}
function same(input:readonly TransportPlanLegInput[],row:TrackingShipmentRow,allowNew=false){const legs=shipment(row).legs;return legs.length===input.length&&input.every((leg,i)=>(leg.id===legs[i].id||allowNew&&leg.id===null)&&leg.providerName===legs[i].providerName&&leg.origin===legs[i].origin&&leg.destination===legs[i].destination&&leg.method===legs[i].method);}
async function audit(actor:SessionUser,row:TrackingShipmentRow,event:'submitted'|'updated'|'revoked',now:number,recipientLocale?:TrackingLocale){await runtimeRun('INSERT INTO tracking_events(shipment_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,?,?::jsonb,?)',[row.id,actor.id,event,JSON.stringify({...shipment(row),...(event==='submitted'?{recipientId:row.recipient_id,recipientLocale}: {})}),now]);}
export async function submitTrackingShipment(actor:SessionUser,input:unknown,now=Date.now()):Promise<StaffTrackingShipment>{
 time(now);const command=parseTrackingSubmit(input);if(command.legs.some(l=>l.id!==null))throw invalid();
 return runtimeTransaction(async()=>{
  await staff(actor);
  const existing=await runtimeGet<TrackingShipmentRow>('SELECT * FROM tracking_shipments WHERE created_by_user_id=? AND idempotency_key=? FOR UPDATE',[actor.id,command.idempotencyKey]);
  if(existing){const recipient=await runtimeGet<Recipient>('SELECT * FROM tracking_recipients WHERE id=?',[existing.recipient_id]);if(recipient?.email!==command.recipientEmail||existing.label!==command.label||!same(command.legs,existing,true))conflict();return staffProjection(existing);}
  const recipient=await runtimeGet<Recipient>(`INSERT INTO tracking_recipients(email,email_hash,locale,verified_at) VALUES(?,?,'en',NULL)
   ON CONFLICT(email) DO UPDATE SET email_hash=EXCLUDED.email_hash RETURNING *`,[command.recipientEmail,trackingEmailHash(command.recipientEmail)]);
  if(!recipient)throw Error('Tracking recipient write failed');
  const legs=command.legs.map(l=>({...l,id:crypto.randomUUID()})),reference='SHP-'+crypto.randomBytes(10).toString('hex').toUpperCase();
  let row=await runtimeGet<TrackingShipmentRow>(`INSERT INTO tracking_shipments(reference,recipient_id,label,legs,created_by_user_id,idempotency_key,created_at,updated_at)
   VALUES(?,?,?,?::jsonb,?,?,?,?) ON CONFLICT(created_by_user_id,idempotency_key) DO NOTHING RETURNING *`,[reference,recipient.id,command.label,JSON.stringify(legs),actor.id,command.idempotencyKey,now,now]);
  if(!row){row=await runtimeGet<TrackingShipmentRow>('SELECT * FROM tracking_shipments WHERE created_by_user_id=? AND idempotency_key=? FOR UPDATE',[actor.id,command.idempotencyKey]);if(!row||row.recipient_id!==recipient.id||row.label!==command.label||!same(command.legs,row,true))conflict();return staffProjection(row);}
  await audit(actor,row,'submitted',now,recipient.locale);
  await runtimeRun("INSERT INTO tracking_email_deliveries(kind,shipment_id,created_at,next_attempt_at,expires_at) VALUES('initial',?,?,?,?)",[row.id,now,now,now+24*60*60_000]);
  return staffProjection(row);
 });
}
export async function updateTrackingShipment(actor:SessionUser,input:unknown,now=Date.now()):Promise<StaffTrackingShipment>{
 time(now);const command=parseTrackingUpdate(input);return runtimeTransaction(async()=>{
  await staff(actor);const row=await runtimeGet<TrackingShipmentRow>('SELECT * FROM tracking_shipments WHERE id=? AND reference=? FOR UPDATE',[command.shipmentId,command.reference]);if(!row)notFound();if(row.revoked_at!==null||row.version!==command.expectedVersion)conflict();
  const ids=new Set(shipment(row).legs.map(l=>l.id));if(command.legs.some(l=>l.id!==null&&!ids.has(l.id)))throw invalid();
  if(row.label===command.label&&same(command.legs,row))return staffProjection(row);
  const legs=command.legs.map(l=>({...l,id:l.id??crypto.randomUUID()}));
  const saved=await runtimeGet<TrackingShipmentRow>('UPDATE tracking_shipments SET version=version+1,label=?,legs=?::jsonb,updated_at=? WHERE id=? AND version=? RETURNING *',[command.label,JSON.stringify(legs),now,row.id,command.expectedVersion]);if(!saved)conflict();await audit(actor,saved,'updated',now);return staffProjection(saved);
 });
}
export async function revokeTrackingShipment(actor:SessionUser,input:unknown,now=Date.now()):Promise<StaffTrackingShipment>{
 time(now);const command=parseTrackingRevoke(input);return runtimeTransaction(async()=>{
  await staff(actor,true);const row=await runtimeGet<TrackingShipmentRow>('SELECT * FROM tracking_shipments WHERE id=? AND reference=? FOR UPDATE',[command.shipmentId,command.reference]);if(!row)notFound();if(row.revoked_at!==null)return staffProjection(row);if(row.version!==command.expectedVersion)conflict();
  const saved=await runtimeGet<TrackingShipmentRow>('UPDATE tracking_shipments SET version=version+1,revoked_at=?,updated_at=? WHERE id=? RETURNING *',[now,now,row.id]);if(!saved)notFound();
  await runtimeRun("UPDATE tracking_email_deliveries SET state='ignored',lease_until=NULL,error_category='revoked' WHERE shipment_id=? AND state IN ('pending','sending')",[row.id]);await audit(actor,saved,'revoked',now);return staffProjection(saved);
 });
}
/** Bounded retention for tracking-only ephemeral credentials; never touches chats/accounts. */
export async function cleanupTrackingIdentity(now=Date.now(),limit=100){time(now);const count=Math.max(1,Math.min(100,Number.isSafeInteger(limit)?limit:100));return runtimeTransaction(async()=>{
 await runtimeRun("SET LOCAL statement_timeout='1000ms'");await runtimeRun("SET LOCAL idle_in_transaction_session_timeout='5000ms'");await runtimeRun("SET LOCAL lock_timeout='50ms'");
 const sessions=await runtimeRun('DELETE FROM tracking_sessions WHERE token_hash IN (SELECT token_hash FROM tracking_sessions WHERE expires_at<=? ORDER BY expires_at LIMIT ? FOR UPDATE SKIP LOCKED)',[now,count]);
 const challenges=await runtimeRun('DELETE FROM tracking_challenges WHERE id IN (SELECT id FROM tracking_challenges WHERE expires_at<? ORDER BY expires_at LIMIT ? FOR UPDATE SKIP LOCKED)',[now-24*60*60_000,count]);return{sessions:sessions.changes,challenges:challenges.changes};
});}
export async function isTrackingSchemaReady(){return Boolean(await runtimeGet('SELECT 1 FROM schema_migrations WHERE version=71'));}
