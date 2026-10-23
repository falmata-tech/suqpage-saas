import {postgresRuntimeServices} from './postgres-runtime-services';
import {parsePartnerInterest} from './transport-partner-interest-contract';
import {partnerInterestEmailReadiness,sendPartnerInterestEmail,type PartnerInterestEmailPort} from './transport-partner-email';
import {selectedHostedEmailMode,type SupportEscalationEmailMode} from './support-escalation-email';
import type {TransactionalEmailResult} from './gmail-smtp-email';

type Lease={id:number;interest_id:number;admin_user_id:number;attempts:number;lease_until:number;expires_at:number};
export async function partnerInterestSchemaReady(){
 const result=await postgresRuntimeServices().runner.query<{ready:boolean}>("SELECT to_regclass('transport_partner_interest_deliveries') IS NOT NULL ready");
 return result.rows[0]?.ready===true;
}
export async function dispatchPartnerInterestEmails({now=Date.now(),limit=2,mode=selectedHostedEmailMode(),send}:{now?:number;limit?:number;mode?:SupportEscalationEmailMode;send?:PartnerInterestEmailPort}={}){
 if(!Number.isSafeInteger(now)||now<0)throw Error('Invalid partner email dispatch time');
 const results={processed:0,accepted:0,ignored:0,failed:0,pending:0,superseded:0,configured:Boolean(send)||partnerInterestEmailReadiness(mode).ready};
 const runner=postgresRuntimeServices().runner,batch=Number.isSafeInteger(limit)?Math.max(1,Math.min(2,limit)):2,started=performance.now(),at=()=>now+Math.max(0,Math.floor(performance.now()-started));
 const query=<T extends Record<string,unknown>>(sql:string,values:readonly unknown[]=[])=>runner.transaction(async()=>{
  await runner.query("SET LOCAL statement_timeout='1000ms'");await runner.query("SET LOCAL idle_in_transaction_session_timeout='5000ms'");await runner.query("SET LOCAL lock_timeout='50ms'");return runner.query<T>(sql,values);
 });
 const expired=await query<{state:string}>(`WITH due AS(SELECT id FROM transport_partner_interest_deliveries WHERE state IN ('pending','sending') AND (lease_until IS NULL OR lease_until<=?) AND (expires_at<=? OR attempts>=6) ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
  UPDATE transport_partner_interest_deliveries d SET state=CASE WHEN d.expires_at<=? THEN 'ignored' ELSE 'failed' END,lease_until=NULL,error_category=CASE WHEN d.expires_at<=? THEN 'expired' ELSE 'retry_limit' END FROM due WHERE d.id=due.id RETURNING d.state`,[now,now,batch,now,now]);
 for(const row of expired.rows){results.processed++;if(row.state==='ignored')results.ignored++;else results.failed++;}
 if(!results.configured){
  const deferred=await query(`WITH due AS(SELECT id FROM transport_partner_interest_deliveries WHERE (state='pending' OR state='sending' AND lease_until<=?) AND attempts<6 AND next_attempt_at<=? AND expires_at>? ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
   UPDATE transport_partner_interest_deliveries d SET state='pending',lease_until=NULL,error_category='missing_configuration',next_attempt_at=? FROM due WHERE d.id=due.id RETURNING d.id`,[now,now,now,batch,now+60000]);
  results.processed+=deferred.rowCount;results.pending+=deferred.rowCount;return results;
 }
 const leases=(await query<Lease>(`WITH due AS(SELECT id FROM transport_partner_interest_deliveries WHERE attempts<6 AND next_attempt_at<=? AND expires_at>? AND(state='pending' OR state='sending' AND lease_until<=?) ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
  UPDATE transport_partner_interest_deliveries d SET state='sending',attempts=d.attempts+1,lease_until=? FROM due WHERE d.id=due.id RETURNING d.*`,[now,now,now,batch,now+30000])).rows;results.processed+=leases.length;
 for(const lease of leases){
  // Resolve the current admin role/address at delivery, never applicant-controlled routing.
  const row=(await query<{reference:string;company_name:string;contact_name:string;email:string;phone:string|null;message:string;locale:string;idempotency_key:string;recipient_email:string}>(`SELECT i.*,u.email recipient_email FROM transport_partner_interests i JOIN transport_partner_interest_deliveries d ON d.interest_id=i.id JOIN users u ON u.id=d.admin_user_id JOIN user_access_profiles p ON p.user_id=u.id WHERE d.id=? AND d.state='sending' AND d.attempts=? AND d.lease_until=? AND d.lease_until>? AND p.access_role='platform_admin'`,[lease.id,lease.attempts,lease.lease_until,at()])).rows[0];
  const parsed=row?parsePartnerInterest({companyName:row.company_name,contactName:row.contact_name,email:row.email,phone:row.phone,message:row.message,locale:row.locale,idempotencyKey:row.idempotency_key}):null;
  let result:TransactionalEmailResult|null=null;
  if(row&&parsed?.ok&&lease.expires_at>at())try{result=await(send??(email=>sendPartnerInterestEmail(email,{mode})))({deliveryId:lease.id,reference:row.reference,recipientEmail:row.recipient_email,interest:parsed.value});}catch{result={state:'failed',category:'provider_failure',retryable:true};}
  let state:string,category:string|null,next=at(),attempts=lease.attempts;
  if(!result){state='ignored';category='no_longer_actionable';}
  else if(result.state==='accepted'){state='accepted';category=null;}
  else if(result.state==='deferred'){state='pending';category=result.category;next+=60000;attempts--;}
  else{state=result.retryable&&attempts<6?'pending':'failed';category=result.category;next+=Math.min(900000,30000*2**(attempts-1));}
  const changed=await query("UPDATE transport_partner_interest_deliveries SET state=?,attempts=?,lease_until=NULL,error_category=?,next_attempt_at=?,accepted_at=? WHERE id=? AND state='sending' AND attempts=? AND lease_until=?",[state,attempts,category,next,state==='accepted'?at():null,lease.id,lease.attempts,lease.lease_until]);
  if(!changed.rowCount)results.superseded++;else if(state==='accepted')results.accepted++;else if(state==='ignored')results.ignored++;else if(state==='failed')results.failed++;else results.pending++;
 }
 return results;
}
