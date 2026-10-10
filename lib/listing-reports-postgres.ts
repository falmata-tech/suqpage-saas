import crypto from 'node:crypto';
import {runtimeGet,runtimeAll,runtimeRun,runtimeTransaction} from './runtime-sql';
import {hashPrivateValue} from './security';
import {consumeRuntimeRateLimit} from './rate-limit-runtime';
import {normalizePageRequest,pageWindow} from './pagination';
import {CatalogSafetyError,excludedBusinessIds} from './catalog-safety';
import {requireReportStaff,type ListingReportPort,type ListingReport,type ReportTarget} from './listing-reports';
import type {SessionUser} from './types';
import {runtimeUserById} from './catalog-runtime';
async function freshReportActor(actor:SessionUser){const current=await runtimeUserById(actor.id);if(!current)throw new CatalogSafetyError('Report access denied.',403);requireReportStaff(current);return current;}
async function target(businessId:number,productId:number|null):Promise<ReportTarget|null>{
  const row=await runtimeGet<{id:number;handle:string;name:string;status:string;product_name:string|null;is_published:number|null}>(`SELECT b.id,b.handle,b.name,b.status,p.name product_name,p.is_published FROM businesses b LEFT JOIN products p ON p.id=? AND p.business_id=b.id WHERE b.id=?`,[productId,businessId]);
  if(!row||productId&&!row.product_name)return null;
  return {businessId:row.id,productId,handle:row.handle,businessName:row.name,productName:row.product_name??'',visible:row.status==='active'&&(!productId||row.is_published===1)};
}
type ReportRow={id:number;receipt:string;business_id:number|null;product_id:number|null;handle:string;business_name:string;product_name:string;reason:string;details:string;status:ListingReport['status'];version:number;assigned_user_id:number|null;assigned_name:string|null;created_at:number;updated_at:number;request_hash:string;payload_hash:string};
function dto(r:ReportRow):ListingReport{return {id:r.id,receipt:r.receipt,businessId:r.business_id,productId:r.product_id,handle:r.handle,businessName:r.business_name,productName:r.product_name,reason:r.reason,details:r.details,status:r.status,version:r.version,assignedUserId:r.assigned_user_id,assignedName:r.assigned_name,createdAt:Number(r.created_at),updatedAt:Number(r.updated_at)};}
const select=`SELECT r.*,u.name assigned_name FROM content_reports r LEFT JOIN users u ON u.id=r.assigned_user_id`;
async function assignees(actor:SessionUser){
  actor=await freshReportActor(actor);
  return runtimeAll<{id:number;name:string}>(`SELECT u.id,u.name FROM users u JOIN user_access_profiles p ON p.user_id=u.id JOIN support_agent_settings s ON s.user_id=u.id WHERE p.access_role='team_member' AND s.enabled=1 AND s.queue_scope IN ('support','all') ORDER BY u.name,u.id LIMIT 100`);
}
export const listingReportPort:ListingReportPort={
  async submit(command,ipHash){
    if(!/^[a-f0-9]{64}$/.test(ipHash))throw new CatalogSafetyError('Report could not be saved.',503);
    const requestHash=hashPrivateValue('report-request:'+ipHash+':'+command.idempotencyKey);
    const payloadHash=hashPrivateValue(JSON.stringify({...command,idempotencyKey:undefined}));
    return runtimeTransaction(async()=>{
      await runtimeRun('SELECT pg_advisory_xact_lock(hashtextextended(?,0))',[requestHash]);
      const old=await runtimeGet<ReportRow>('SELECT * FROM content_reports WHERE request_hash=?',[requestHash]);
      if(old){if(old.payload_hash!==payloadHash)throw new CatalogSafetyError('This report changed. Start a new report.',409);return {receipt:old.receipt,duplicate:true};}
      const publicTarget=await target(command.businessId,command.productId);
      if(!publicTarget?.visible)throw new CatalogSafetyError('Listing not found.',404);
      const limit=await consumeRuntimeRateLimit('report:'+ipHash,5,3600000);
      if(!limit.allowed)throw new CatalogSafetyError('Please wait before sending another report.',429);
      const receipt=crypto.randomUUID(),now=Date.now();
      await runtimeRun(`INSERT INTO content_reports(receipt,business_id,product_id,handle,business_name,product_name,reason,details,request_hash,payload_hash,ip_hash,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,[receipt,command.businessId,command.productId,publicTarget.handle,publicTarget.businessName,publicTarget.productName,command.reason,command.details,requestHash,payloadHash,ipHash,now,now]);
      return {receipt,duplicate:false};
    });
  },
  async list(actor,input){
    actor=await freshReportActor(actor);
    const status=['open','review','resolved','dismissed'].includes(String(input.status))?String(input.status):'active';
    const where=status==='active'?"r.status IN ('open','review')":'r.status=?';const params=status==='active'?[]:[status];
    const total=Number((await runtimeGet<{total:number}>(`SELECT count(*) total FROM content_reports r WHERE ${where}`,params))?.total??0);
    const window=pageWindow(total,normalizePageRequest({page:input.page},15));
    const rows=await runtimeAll<ReportRow>(`${select} WHERE ${where} ORDER BY r.created_at DESC,r.id DESC LIMIT ? OFFSET ?`,[...params,window.limit,window.offset]);
    return {items:rows.map(dto),page:window.page,totalPages:window.totalPages,totalItems:total};
  },assignees,
  async update(actor,input){
    actor=await freshReportActor(actor);
    const id=excludedBusinessIds([input.id])[0],version=Number(input.version);
    if(!Number.isSafeInteger(version)||version<1||!['claim','assign','resolve','dismiss'].includes(String(input.action)))throw new CatalogSafetyError('Check the report details.');
    await runtimeTransaction(async()=>{
      const row=await runtimeGet<ReportRow>('SELECT * FROM content_reports WHERE id=? FOR UPDATE',[id]);
      if(!row)throw new CatalogSafetyError('Report not found.',404);
      if(row.version!==version)throw new CatalogSafetyError('This report changed. Reload and try again.',409);
      if(['resolved','dismissed'].includes(row.status))throw new CatalogSafetyError('This report is already closed.',409);
      const manager=['platform_admin','operations_manager'].includes(actor.access_role);
      let assigned=row.assigned_user_id,status=row.status;
      if(input.action==='claim'){
        if(assigned&&assigned!==actor.id)throw new CatalogSafetyError('This report is already assigned.',409);
        assigned=actor.id;status='review';
      }else if(input.action==='assign'){
        if(!manager)throw new CatalogSafetyError('Report assignment denied.',403);
        const next=excludedBusinessIds([input.assignedUserId])[0];
        if(!(await assignees(actor)).some(u=>u.id===next))throw new CatalogSafetyError('Choose a support agent.');
        assigned=next;status='review';
      }else{
        if(!manager&&assigned!==actor.id)throw new CatalogSafetyError('Claim this report first.',403);
        if(input.action==='resolve'){
          const current=row.business_id&&!(row.product_name&&!row.product_id)?await target(row.business_id,row.product_id):null;
          if(current?.visible)throw new CatalogSafetyError('Remove the reported content before resolving this report.',409);
        }
        status=input.action==='resolve'?'resolved':'dismissed';
      }
      await runtimeRun(`UPDATE content_reports SET assigned_user_id=?,status=?,version=version+1,updated_at=?,decided_by=CASE WHEN ? IN ('resolved','dismissed') THEN ? ELSE decided_by END WHERE id=?`,[assigned,status,Date.now(),status,actor.id,id]);
    });
  },
};
