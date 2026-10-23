import crypto from 'node:crypto';
import {parsePartnerInterest} from './transport-partner-interest-contract';
import {runtimeAll,runtimeGet,runtimeRun,runtimeTransaction} from './runtime-sql';
import {hashPrivateValue} from './security-core';
import {consumePostgresRateLimit} from './rate-limit-postgres';
import {postgresRuntimeServices} from './postgres-runtime-services';

export class PartnerInterestError extends Error {
 constructor(public readonly code:'invalid'|'conflict'|'rate_limited'|'unavailable',public readonly retryAfterSeconds=0){
  super(code==='conflict'?'This request changed. Please submit it again.':code==='rate_limited'?'Too many requests. Please try again later.':code==='unavailable'?'We could not receive your request. Please try again later.':'Check the information you entered.');
 }
}
const DAY=86400000;
export async function submitPartnerInterest(raw:unknown,ipKey:string,now=Date.now()):Promise<{reference:string}>{
 const parsed=parsePartnerInterest(raw);
 if(!parsed.ok||typeof ipKey!=='string'||!ipKey||ipKey.length>300||!Number.isSafeInteger(now)||now<0)throw new PartnerInterestError('invalid');
 const value=parsed.value,signature=crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
 const ipHash=hashPrivateValue('partner-interest:ip:v1:'+ipKey),emailHash=hashPrivateValue('partner-interest:email:v1:'+value.email);
 return runtimeTransaction(async()=>{
  await runtimeGet('SELECT pg_advisory_xact_lock(hashtextextended(?,180))',[value.idempotencyKey]);
  const previous=await runtimeGet<{reference:string;request_fingerprint:string}>('SELECT reference,request_fingerprint FROM transport_partner_interests WHERE idempotency_key=?',[value.idempotencyKey]);
  if(previous){if(previous.request_fingerprint!==signature)throw new PartnerInterestError('conflict');return{reference:previous.reference};}
  // Recipient roles remain private and authoritative; the applicant cannot choose them.
  const admins=await runtimeAll<{id:number}>(`SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='platform_admin' AND u.email IS NOT NULL AND u.email<>'' ORDER BY u.id FOR SHARE OF u,p`);
  if(!admins.length)throw new PartnerInterestError('unavailable');
  const runner=postgresRuntimeServices().runner;
  for(const[key,limit,window]of[[`partner:ip:${ipHash}`,5,3600000],[`partner:email:${emailHash}`,3,DAY]]as const){
   const rate=await consumePostgresRateLimit(runner,key,limit,window,window,now);
   if(!rate.allowed)throw new PartnerInterestError('rate_limited',rate.retryAfterSeconds);
  }
  const reference='PI-'+crypto.randomBytes(6).toString('hex').toUpperCase();
  const row=await runtimeGet<{id:number}>(`INSERT INTO transport_partner_interests(reference,company_name,contact_name,email,email_hash,phone,message,locale,idempotency_key,request_fingerprint,ip_hash,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`,[reference,value.companyName,value.contactName,value.email,emailHash,value.phone,value.message,value.locale,value.idempotencyKey,signature,ipHash,now]);
  if(!row)throw new Error('Partner interest was not saved');
  for(const admin of admins)await runtimeRun('INSERT INTO transport_partner_interest_deliveries(interest_id,admin_user_id,created_at,next_attempt_at,expires_at) VALUES(?,?,?,?,?)',[row.id,admin.id,now,now,now+7*DAY]);
  return{reference};
 });
}
/** Bounded retention; no public list or applicant lookup endpoint exists. */
export async function cleanupPartnerInterests(now=Date.now(),limit=100){
 if(!Number.isSafeInteger(now)||now<0)throw new Error('Invalid cleanup time');
 const maximum=Number.isSafeInteger(limit)?Math.max(1,Math.min(100,limit)):100;
 const result=await runtimeRun(`DELETE FROM transport_partner_interests WHERE id IN(SELECT id FROM transport_partner_interests WHERE created_at<? ORDER BY created_at,id LIMIT ?)`,[now-90*DAY,maximum]);
 return{deleted:result.changes};
}
