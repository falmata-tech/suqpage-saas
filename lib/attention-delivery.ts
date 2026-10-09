import {postgresRuntimeServices} from './postgres-runtime-services';
import {createUiText} from './i18n/core';
import {attentionLabel} from './i18n/attention-copy';
import {validatedPushSubscription,sendAttentionPush,type AttentionPushPort,type PushPayload} from './attention-push';
import type {AttentionItem,AttentionKind} from './attention-contract';
import am from './i18n/messages/am.json';import om from './i18n/messages/om.json';import so from './i18n/messages/so.json';import ti from './i18n/messages/ti.json';
type DeliveryRow={id:number;notification_id:number;subscription_id:number;attempts:number};
type PayloadRow={id:number;kind:AttentionKind;user_id:number|null;visitor_conversation_id:number|null;conversation_id:number|null;inquiry_id:number|null;created_at:number;read_at:number|null;recipient_key:string;subscription_json:string;subscription_kind:string;revoked_at:number|null;expires_at:number|null;access_role:string|null;business_id:number|null;enabled:number|null;queue_scope:string|null;case_business_id:number|null;assigned_user_id:number|null;case_status:string|null;assistance_category:string|null;visitor_session_expires_at:number|null;inquiry_business_id:number|null;sound_enabled:boolean|null;language:'en'|'am'|'om'|'so'|'ti'|null};
const catalogs={en:{},am,om,so,ti};

function permitted(r:PayloadRow,now:number){
  if(r.revoked_at!==null||r.read_at!==null||r.created_at<now-30*60*1000||(r.expires_at!==null&&r.expires_at<now))return false;
  if(r.visitor_conversation_id!==null)return r.recipient_key==='visitor:'+r.visitor_conversation_id && r.visitor_conversation_id===r.conversation_id && Boolean(r.visitor_session_expires_at&&r.visitor_session_expires_at>=now);
  if(!r.access_role||r.recipient_key!=='user:'+r.user_id)return false;
  if(r.subscription_kind==='expo'&&r.access_role!=='client')return false;
  if(r.access_role==='client')return Boolean(r.business_id)&&(r.inquiry_id!==null?r.inquiry_business_id===r.business_id:r.case_business_id===r.business_id);
  if(['platform_admin','operations_manager'].includes(r.access_role))return true;
  if(r.access_role!=='team_member')return false;
  if(r.kind==='reassigned'&&r.conversation_id===null)return true;
  return r.assigned_user_id===r.user_id || r.case_status==='waiting'&&r.enabled===1&&[r.assistance_category==='shipment_observation'||r.assistance_category==='buying_assistance'?'transport':'support','all'].includes(r.queue_scope||'');
}
function payload(r:PayloadRow):PushPayload{
  const visitor=r.visitor_conversation_id!==null,owner=r.access_role==='client';
  const destination:AttentionItem['destination']=r.inquiry_id?{screen:'inquiries',id:r.inquiry_id,businessId:r.inquiry_business_id??undefined}:visitor?{screen:'transport-chat'}:r.conversation_id?{screen:owner?'owner-chat':'support-chat',id:r.conversation_id}:{screen:'support-queue'};
  const item:AttentionItem={id:r.id,kind:r.kind,channel:r.assistance_category==='shipment_observation'?'transport':'support',createdAt:r.created_at,read:false,destination};
  const t=createUiText(catalogs[r.language||'en']);
  return {notificationId:r.id,title:'Suqpage',body:t(attentionLabel(item)),destination,scope:visitor?'visitor':'user',silent:!r.sound_enabled};
}

/** Bounded leased dispatch. Provider acceptance never means a person received/read it. */
export async function dispatchAttention({send=sendAttentionPush,now=Date.now(),limit=12}:{send?:AttentionPushPort;now?:number;limit?:number}={}){
  const runner=postgresRuntimeServices().runner;
  await runner.query("UPDATE attention_deliveries SET state='failed',lease_until=NULL,error_category='retry_limit' WHERE state='sending' AND attempts>=6 AND lease_until<?",[now]);
  const leased=(await runner.query<DeliveryRow>(`WITH due AS (
    SELECT id FROM attention_deliveries WHERE attempts<6 AND next_attempt_at<=? AND
      (state='pending' OR (state='sending' AND lease_until<?)) ORDER BY id LIMIT ? FOR UPDATE SKIP LOCKED)
    UPDATE attention_deliveries d SET state='sending',attempts=d.attempts+1,lease_until=?
    FROM due WHERE d.id=due.id RETURNING d.id,d.notification_id,d.subscription_id,d.attempts`,[now,now,Math.max(1,Math.min(limit,50)),now+30000])).rows;
  const results={accepted:0,ignored:0,failed:0,pending:0};
  // Small batches bound provider fan-out and connection use.
  for(let at=0;at<leased.length;at+=4)await Promise.all(leased.slice(at,at+4).map(async d=>{
    const r=(await runner.query<PayloadRow>(`SELECT n.*,s.kind subscription_kind,s.subscription_json,s.revoked_at,s.expires_at,p.access_role,u.business_id,a.enabled,a.queue_scope,
      c.business_id case_business_id,c.assigned_user_id,c.status case_status,c.assistance_category,c.visitor_session_expires_at,i.business_id inquiry_business_id,f.sound_enabled,f.language
      FROM attention_notifications n JOIN attention_subscriptions s ON s.id=? AND s.recipient_key=n.recipient_key
      LEFT JOIN users u ON u.id=n.user_id LEFT JOIN user_access_profiles p ON p.user_id=u.id LEFT JOIN support_agent_settings a ON a.user_id=u.id
      LEFT JOIN support_conversations c ON c.id=n.conversation_id LEFT JOIN inquiries i ON i.id=n.inquiry_id LEFT JOIN attention_preferences f ON f.recipient_key=n.recipient_key
      WHERE n.id=?`,[d.subscription_id,d.notification_id])).rows[0];
    if(!r||!permitted(r,now)){await runner.query("UPDATE attention_deliveries SET state='ignored',lease_until=NULL,error_category='no_longer_actionable' WHERE id=? AND state='sending'",[d.id]);results.ignored++;return;}
    let result:Awaited<ReturnType<AttentionPushPort>>;
    try{result=await send(validatedPushSubscription(JSON.parse(r.subscription_json)),payload(r));}catch{result={state:'failed',category:'invalid_device',retryable:false};}
    if(result.state==='accepted'){
      await runner.query("UPDATE attention_deliveries SET state='accepted',lease_until=NULL,provider_receipt=?,next_attempt_at=?,error_category=NULL WHERE id=?",[result.receipt??null,now+15*60*1000,d.id]);results.accepted++;return;
    }
    if(result.state==='expired')await runner.query('UPDATE attention_subscriptions SET revoked_at=COALESCE(revoked_at,?) WHERE id=?',[now,d.subscription_id]);
    const retry=result.retryable&&d.attempts<6,state=retry?'pending':'failed';
    await runner.query('UPDATE attention_deliveries SET state=?,lease_until=NULL,error_category=?,next_attempt_at=? WHERE id=?',[state,result.category,now+Math.min(15*60*1000,30000*2**d.attempts),d.id]);results[state]++;
  }));
  return {processed:leased.length,...results};
}

/** Check Expo's handoff receipts; they still are not human Read receipts. */
export async function checkExpoAttentionReceipts(now=Date.now(),send:typeof fetch=fetch){
  if(process.env.SUQPAGE_NATIVE_PUSH_ENABLED!=='1'||process.env.SUQPAGE_NATIVE_PUSH_MODE!=='standard')return {checked:0};
  const runner=postgresRuntimeServices().runner;
  const rows=(await runner.query<{id:number;provider_receipt:string;subscription_id:number}>("SELECT id,provider_receipt,subscription_id FROM attention_deliveries WHERE state='accepted' AND provider_receipt IS NOT NULL AND next_attempt_at<=? ORDER BY id LIMIT 100",[now])).rows;
  if(!rows.length)return {checked:0};
  let data:Record<string,{status?:string;details?:{error?:string}}>;
  try{const r=await send('https://exp.host/--/api/v2/push/getReceipts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ids:rows.map(r=>r.provider_receipt)}),signal:AbortSignal.timeout(4000)});if(!r.ok)return {checked:0};data=(await r.json() as {data:typeof data}).data||{};}catch{return {checked:0};}
  for(const row of rows){const receipt=data[row.provider_receipt];if(!receipt){await runner.query('UPDATE attention_deliveries SET next_attempt_at=? WHERE id=?',[now+15*60*1000,row.id]);continue;}
    if(receipt.status==='ok')await runner.query('UPDATE attention_deliveries SET provider_receipt=NULL WHERE id=?',[row.id]);
    else{await runner.query("UPDATE attention_deliveries SET state='failed',error_category='provider_handoff_failed',provider_receipt=NULL WHERE id=?",[row.id]);if(receipt.details?.error==='DeviceNotRegistered')await runner.query('UPDATE attention_subscriptions SET revoked_at=? WHERE id=?',[now,row.subscription_id]);}
  }return {checked:rows.length};
}
