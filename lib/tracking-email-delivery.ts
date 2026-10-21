import {postgresRuntimeServices} from './postgres-runtime-services';
import {trackingChallengeSendable,trackingCode,type TrackingChallengeRow} from './tracking';
import {TrackingError,parseTrackingShipment,type TrackingLocale} from './tracking-contract';
import {sendTrackingEmail,trackingEmailReadiness,type TrackingEmail,type TrackingEmailMode,type TrackingEmailPort,type TrackingEmailResult} from './tracking-email';
import {selectedHostedEmailMode} from './support-escalation-email';
type Lease={id:number;kind:'code'|'initial';challenge_id:string|null;shipment_id:number|null;attempts:number;lease_until:number;expires_at:number};
export async function dispatchTrackingEmails({now=Date.now(),limit=2,mode=selectedHostedEmailMode(),send}:{now?:number;limit?:number;mode?:TrackingEmailMode;send?:TrackingEmailPort}={}){
 if(!Number.isSafeInteger(now)||now<0)throw Error('Invalid tracking dispatch time');
 const results={processed:0,accepted:0,ignored:0,failed:0,pending:0,superseded:0,configured:Boolean(send)||trackingEmailReadiness(mode).ready};
 const runner=postgresRuntimeServices().runner,batch=Math.max(1,Math.min(2,Number.isSafeInteger(limit)?limit:2)),started=performance.now(),at=()=>now+Math.max(0,Math.floor(performance.now()-started));
 const query=<T extends Record<string,unknown>>(sql:string,values:readonly unknown[]=[])=>runner.transaction(async()=>{await runner.query("SET LOCAL statement_timeout='1000ms'");await runner.query("SET LOCAL idle_in_transaction_session_timeout='5000ms'");await runner.query("SET LOCAL lock_timeout='50ms'");return runner.query<T>(sql,values);});
 const expired=await query(`WITH due AS(SELECT id FROM tracking_email_deliveries WHERE state IN ('pending','sending') AND (lease_until IS NULL OR lease_until<=?) AND(expires_at<=? OR attempts>=6) ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
  UPDATE tracking_email_deliveries d SET state=CASE WHEN expires_at<=? THEN 'ignored' ELSE 'failed' END,lease_until=NULL,error_category=CASE WHEN expires_at<=? THEN 'expired' ELSE 'retry_limit' END FROM due WHERE d.id=due.id RETURNING d.state`,[now,now,batch,now,now]);
 for(const row of expired.rows){results.processed++;if(row.state==='ignored')results.ignored++;else results.failed++;}
 if(!results.configured){
  const deferred=await query(`WITH due AS(SELECT id FROM tracking_email_deliveries WHERE (state='pending' OR state='sending' AND lease_until<=?) AND attempts<6 AND next_attempt_at<=? AND expires_at>? ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
   UPDATE tracking_email_deliveries d SET state='pending',lease_until=NULL,error_category='missing_configuration',next_attempt_at=? FROM due WHERE d.id=due.id RETURNING d.id`,[now,now,now,batch,now+60_000]);
  results.processed+=deferred.rowCount;results.pending+=deferred.rowCount;return results;
 }
 const leases=(await query<Lease>(`WITH due AS(SELECT id FROM tracking_email_deliveries WHERE attempts<6 AND next_attempt_at<=? AND expires_at>? AND(state='pending' OR state='sending' AND lease_until<=?) ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
  UPDATE tracking_email_deliveries d SET state='sending',attempts=attempts+1,lease_until=? FROM due WHERE d.id=due.id RETURNING d.*`,[now,now,now,batch,now+30_000])).rows;results.processed+=leases.length;
 for(const lease of leases){
  let email:TrackingEmail|null=null;
  if(lease.expires_at>at()){
   if(lease.kind==='code'){
    const row=(await query<TrackingChallengeRow&Record<string,unknown>>('SELECT * FROM tracking_challenges WHERE id=?',[lease.challenge_id])).rows[0];
    if(row&&trackingChallengeSendable(row,at()))email={deliveryId:lease.id,recipientEmail:row.email,locale:row.locale,kind:'code',code:trackingCode(row)};
   }else{
    const row=(await query<{reference:string;recipient_id:number;email:string;detail:unknown}>(`SELECT s.reference,s.recipient_id,r.email,e.detail
     FROM tracking_shipments s JOIN tracking_recipients r ON r.id=s.recipient_id
     JOIN LATERAL(SELECT detail FROM tracking_events WHERE shipment_id=s.id AND event_type='submitted' ORDER BY id LIMIT 1)e ON TRUE
     WHERE s.id=? AND s.revoked_at IS NULL`,[lease.shipment_id])).rows[0];
    if(row&&row.detail&&typeof row.detail==='object'&&!Array.isArray(row.detail)){
     const saved=row.detail as Record<string,unknown>;
     if(saved.recipientId===row.recipient_id&&saved.reference===row.reference&&['en','am','om'].includes(String(saved.recipientLocale))){
      try{const snapshot=parseTrackingShipment({reference:saved.reference,label:saved.label,version:saved.version,legs:saved.legs});
       email={deliveryId:lease.id,recipientEmail:row.email,locale:saved.recipientLocale as TrackingLocale,kind:'initial',shipment:snapshot};
      }catch(error){if(!(error instanceof TrackingError))throw error;}
     }
    }
   }
  }
  let result:TrackingEmailResult|null=null;
  if(email){try{result=await(send??((value:TrackingEmail)=>sendTrackingEmail(value,{mode})))(email);}catch{result={state:'failed',category:'provider_failure',retryable:true};}}
  let state:string,category:string|null,next=at(),attempts=lease.attempts;
  if(!result){state='ignored';category='no_longer_actionable';}
  else if(result.state==='accepted'){state='accepted';category=null;}
  else if(result.state==='deferred'){state='pending';category=result.category;next+=60_000;attempts--;}
  else{state=result.retryable&&lease.attempts<6?'pending':'failed';category=result.category;next+=Math.min(15*60_000,30_000*2**(lease.attempts-1));}
  const changed=await query("UPDATE tracking_email_deliveries SET state=?,attempts=?,lease_until=NULL,error_category=?,next_attempt_at=?,accepted_at=? WHERE id=? AND state='sending' AND attempts=? AND lease_until=?",[state,attempts,category,next,state==='accepted'?at():null,lease.id,lease.attempts,lease.lease_until]);
  if(!changed.rowCount)results.superseded++;else if(state==='accepted')results.accepted++;else if(state==='ignored')results.ignored++;else if(state==='failed')results.failed++;else results.pending++;
 }
 return results;
}
