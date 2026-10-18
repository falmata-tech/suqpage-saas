import {postgresRuntimeServices} from './postgres-runtime-services';
import {parseLocale} from './i18n/core';
import {supportAssignmentReplyDueAt,supportReplyOverdueSource} from './support-assignment-response';
import {
  sendSupportEscalationEmail,supportEscalationEmailOrigin,supportEscalationEmailReadiness,
  type SupportEscalationEmail,type SupportEscalationEmailMode,type SupportEscalationEmailPort,type SupportEscalationEmailResult,
} from './support-escalation-email';

type Lease={id:number;notification_id:number;attempts:number;lease_until:number;expires_at:number};
type EmailRow={
  id:number;source_key:string;kind:string;user_id:number|null;recipient_key:string;conversation_id:number|null;
  email:string|null;access_role:string|null;language:string|null;public_ref:string|null;case_status:string|null;
  resolved_at:number|null;assigned_user_id:number|null;assistance_category:string|null;awaiting_staff_since:number|null;
  awaiting_staff_message_id:number|null;assignment_id:number|null;assignment_user_id:number|null;assigned_at:number|null;
  released_at:number|null;assigned_staff_name:string|null;assigned_staff_role:string|null;assigned_staff_scope:string|null;
};
const positive=(value:number|null):value is number=>value!==null&&Number.isSafeInteger(value)&&value>0;

/** A fresh private projection, never a notification snapshot or customer payload. */
export function supportEscalationEmailPayload(row:EmailRow,now:number,origin:string):SupportEscalationEmail|null {
  if(!positive(row.id)||row.kind!=='reply_overdue'||!positive(row.user_id)||row.recipient_key!==`user:${row.user_id}`||
    !['platform_admin','operations_manager'].includes(row.access_role||'')||!row.email||
    !['waiting','open'].includes(row.case_status||'')||row.resolved_at!==null||
    !positive(row.conversation_id)||!positive(row.assigned_user_id)||!positive(row.assignment_id)||
    row.assignment_user_id!==row.assigned_user_id||row.released_at!==null||row.assigned_at===null||!positive(row.awaiting_staff_message_id))return null;
  const queue=['buying_assistance','shipment_observation'].includes(row.assistance_category||'')?'transport':'support';
  if(!['platform_admin','operations_manager'].includes(row.assigned_staff_role||'')&&
    !(row.assigned_staff_role==='team_member'&&['all',queue].includes(row.assigned_staff_scope||'')))return null;
  const due=supportAssignmentReplyDueAt(row.awaiting_staff_since,row.assigned_at);
  if(due===null||now<due||row.source_key!==supportReplyOverdueSource(row.conversation_id,row.awaiting_staff_message_id,row.assignment_id)||!row.public_ref)return null;
  const staffName=(row.assigned_staff_name||'').replace(/[\u0000-\u001f\u007f]+/g,' ').trim().slice(0,160);
  if(!staffName)return null;
  const url=new URL(`/dashboard/support/${row.conversation_id}`,origin);
  url.searchParams.set('queue',queue);url.searchParams.set('status','overdue');
  return {notificationId:row.id,recipientEmail:row.email,publicRef:row.public_ref,queue,assignedStaffName:staffName,dashboardUrl:url.toString(),language:parseLocale(row.language)};
}

/** Leases bound fan-out; provider idempotency covers uncertain accepted retries. */
export async function dispatchSupportEscalationEmails({now=Date.now(),send,limit=2,mode='resend',context}:{now?:number;send?:SupportEscalationEmailPort;limit?:number;mode?:SupportEscalationEmailMode;context?:{origin:string}}={}){
  if(!Number.isSafeInteger(now)||now<0)throw Error('Invalid email dispatch time.');
  const started=performance.now(),currentTime=()=>now+Math.max(0,Math.floor(performance.now()-started));
  // The substitute port can supply its own bounded rendering context in tests.
  // A default provider can never use this to bypass its configuration guard.
  let substituteOrigin:string|null=null;
  if(context){
    if(!send)throw Error('An email dispatch context requires a substitute send port.');
    try{const url=new URL(context.origin);if(context.origin.length>2048||!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error();substituteOrigin=url.origin;}
    catch{throw Error('Invalid email dispatch context.');}
  }
  const origin=substituteOrigin??supportEscalationEmailOrigin(mode),configured=Boolean(origin)&&(Boolean(send)||supportEscalationEmailReadiness(mode).ready);
  const results={processed:0,accepted:0,ignored:0,failed:0,pending:0,superseded:0,configured};
  if(!configured||!origin)return results;
  const batch=Number.isSafeInteger(limit)?Math.max(1,Math.min(limit,2)):2,runner=postgresRuntimeServices().runner;
  // No database transaction or row lock is retained during an HTTP send.
  const query=<T extends Record<string,unknown>>(sql:string,values:readonly unknown[]=[])=>runner.transaction(async()=>{
    await runner.query("SET LOCAL statement_timeout='1000ms'");
    await runner.query("SET LOCAL idle_in_transaction_session_timeout='5000ms'");
    await runner.query("SET LOCAL lock_timeout='50ms'");
    return runner.query<T>(sql,values);
  });
  const expired=(await query<{state:string}>(`WITH due AS (
    SELECT id FROM attention_email_deliveries WHERE state IN ('pending','sending')
      AND (lease_until IS NULL OR lease_until<=?) AND (expires_at<=? OR attempts>=6)
    ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
    UPDATE attention_email_deliveries d SET state=CASE WHEN d.expires_at<=? THEN 'ignored' ELSE 'failed' END,
      lease_until=NULL,error_category=CASE WHEN d.expires_at<=? THEN 'expired' ELSE 'retry_limit' END
    FROM due WHERE d.id=due.id RETURNING d.state`,[now,now,batch,now,now])).rows;
  for(const row of expired){results.processed++;if(row.state==='ignored')results.ignored++;else results.failed++;}
  const leased=(await query<Lease>(`WITH due AS (
    SELECT id FROM attention_email_deliveries WHERE attempts<6 AND next_attempt_at<=? AND expires_at>?
      AND (state='pending' OR state='sending' AND lease_until<=?)
    ORDER BY next_attempt_at,id LIMIT ? FOR UPDATE SKIP LOCKED)
    UPDATE attention_email_deliveries d SET state='sending',attempts=d.attempts+1,lease_until=?
    FROM due WHERE d.id=due.id RETURNING d.id,d.notification_id,d.attempts,d.lease_until,d.expires_at`,[now,now,now,batch,now+30_000])).rows;
  results.processed+=leased.length;
  const deliver=send??((email:SupportEscalationEmail)=>sendSupportEscalationEmail(email,{mode}));
  for(const lease of leased){
    const row=(await query<EmailRow>(`SELECT n.id,n.source_key,n.kind,n.user_id,n.recipient_key,n.conversation_id,
      u.email,p.access_role,f.language,c.public_ref,c.status case_status,c.resolved_at,c.assigned_user_id,
      c.assistance_category,c.awaiting_staff_since,c.awaiting_staff_message_id,
      a.id assignment_id,a.assigned_user_id assignment_user_id,a.assigned_at,a.released_at,
      agent.name assigned_staff_name,ap.access_role assigned_staff_role,s.queue_scope assigned_staff_scope
      FROM attention_notifications n JOIN users u ON u.id=n.user_id JOIN user_access_profiles p ON p.user_id=u.id
      JOIN support_conversations c ON c.id=n.conversation_id
      LEFT JOIN attention_preferences f ON f.recipient_key=n.recipient_key
      LEFT JOIN LATERAL (SELECT id,assigned_user_id,assigned_at,released_at FROM support_assignments
        WHERE conversation_id=c.id AND assigned_user_id=c.assigned_user_id AND released_at IS NULL
        ORDER BY id DESC LIMIT 1) a ON TRUE
      LEFT JOIN users agent ON agent.id=c.assigned_user_id LEFT JOIN user_access_profiles ap ON ap.user_id=agent.id
      LEFT JOIN support_agent_settings s ON s.user_id=agent.id WHERE n.id=?`,[lease.notification_id])).rows[0];
    const at=currentTime(),expired=lease.expires_at<=at;
    const email=row&&!expired?supportEscalationEmailPayload(row,at,origin):null;
    let result:SupportEscalationEmailResult;
    if(!email){
      const changed=await query("UPDATE attention_email_deliveries SET state='ignored',lease_until=NULL,error_category=? WHERE id=? AND state='sending' AND attempts=? AND lease_until=?",[expired?'expired':'no_longer_actionable',lease.id,lease.attempts,lease.lease_until]);
      if(changed.rowCount)results.ignored++;else results.superseded++;
      continue;
    }
    try{result=await deliver(email);}catch{result={state:'failed',category:'provider_failure',retryable:true};}
    if(result.state==='accepted'){
      const changed=await query("UPDATE attention_email_deliveries SET state='accepted',accepted_at=?,lease_until=NULL,error_category=NULL WHERE id=? AND state='sending' AND attempts=? AND lease_until=?",[currentTime(),lease.id,lease.attempts,lease.lease_until]);
      if(changed.rowCount)results.accepted++;else results.superseded++;
      continue;
    }
    const deferred=result.state==='deferred',retry=deferred||result.state==='failed'&&result.retryable&&lease.attempts<6,state=retry?'pending':'failed';
    const next=currentTime()+(deferred?60_000:Math.min(15*60_000,30_000*2**(lease.attempts-1)));
    const changed=await query("UPDATE attention_email_deliveries SET state=?,attempts=?,lease_until=NULL,error_category=?,next_attempt_at=? WHERE id=? AND state='sending' AND attempts=? AND lease_until=?",[state,deferred?lease.attempts-1:lease.attempts,result.category,next,lease.id,lease.attempts,lease.lease_until]);
    if(changed.rowCount)results[state]++;else results.superseded++;
  }
  return results;
}
