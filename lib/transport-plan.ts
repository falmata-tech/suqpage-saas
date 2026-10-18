import crypto from 'node:crypto';
import type {SessionUser} from './types';
import {hashPrivateValue} from './security';
import {runtimeGet,runtimeRun,runtimeTransaction} from './runtime-sql';
import {
 TransportPlanError,isTransportPlanCapability,parseSavedTransportPlan,parseTransportPlanLink,parseTransportPlanSave,
 transportPlanEtag,transportPlanEtagMatches,
 type SavedTransportPlan,type SharedTransportPlan,type StaffTransportPlan,type TransportPlan,type TransportPlanLegInput,
} from './transport-plan-contract';
export {TransportPlanError} from './transport-plan-contract';

type PlanRow={conversation_id:number;version:number;legs:unknown;share_nonce:string;share_token_hash:string;updated_by_user_id:number|null;updated_at:number};
type CaseRow={id:number;public_ref:string;assistance_category:string;assigned_user_id:number|null};
type ActorRow={access_role:SessionUser['access_role'];business_id:number|null};
function notFound():never{throw new TransportPlanError('Transport plan was not found.','not_found');}
function forbidden():never{throw new TransportPlanError('Transport access is required.','forbidden');}
function conflict():never{throw new TransportPlanError('This transport plan changed. Reload before saving.','conflict');}
function capability(nonce:string){return hashPrivateValue(`transport-plan-capability:${nonce}`);}
function lookupHash(token:string){return hashPrivateValue(`transport-plan-lookup:${token}`);}
function sharePath(row:Pick<PlanRow,'share_nonce'>){return `/transport-plan#${capability(row.share_nonce)}`;}
function projection(row:Pick<PlanRow,'version'|'legs'>):TransportPlan{return parseSavedTransportPlan(row.version,row.legs);}
function saved(row:PlanRow):SavedTransportPlan{return{plan:projection(row),sharePath:sharePath(row)};}
function timestamp(now:number){if(!Number.isSafeInteger(now)||now<0||now>8_640_000_000_000_000)throw new TransportPlanError('Check the transport plan.','invalid_request');}

/** Call only inside the transaction retaining these fresh role/case locks. */
async function staffCase(actor:SessionUser,conversationId:number,write=false,publicRef?:string):Promise<CaseRow>{
 if(!Number.isSafeInteger(actor.id)||actor.id<1)forbidden();
 const current=await runtimeGet<ActorRow>(`SELECT p.access_role,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
  WHERE u.id=? FOR SHARE OF u,p`,[actor.id]);
 if(!current||current.access_role!==actor.access_role||current.business_id!==actor.business_id||
  !['platform_admin','operations_manager','team_member'].includes(current.access_role))forbidden();
 if(!Number.isSafeInteger(conversationId)||conversationId<1)notFound();
 const row=await runtimeGet<CaseRow>(`SELECT id,public_ref,assistance_category,assigned_user_id FROM support_conversations WHERE id=? FOR ${write?'UPDATE':'SHARE'}`,[conversationId]);
 if(!row||row.assistance_category!=='shipment_observation'||publicRef!==undefined&&row.public_ref!==publicRef)notFound();
 if(current.access_role==='team_member'){
  const settings=await runtimeGet<{queue_scope:string}>('SELECT queue_scope FROM support_agent_settings WHERE user_id=? FOR SHARE',[actor.id]);
  if(row.assigned_user_id!==actor.id||!settings||!['transport','all'].includes(settings.queue_scope))forbidden();
 }
 return row;
}
function sameLegs(input:readonly TransportPlanLegInput[],plan:TransportPlan,allowNewIds=false):boolean{
 return input.length===plan.legs.length&&input.every((leg,index)=>{
  const current=plan.legs[index];return(leg.id===current.id||allowNewIds&&leg.id===null)&&leg.providerName===current.providerName&&leg.origin===current.origin&&leg.destination===current.destination&&leg.method===current.method;
 });
}
async function auditPlan(actor:SessionUser,row:PlanRow,event:'transport_plan_updated'|'transport_plan_link_replaced',now:number){
 await runtimeRun('INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,?,?,?)',
  [row.conversation_id,actor.id,event,JSON.stringify({version:row.version,legs:projection(row).legs}),now]);
}

export async function readStaffTransportPlan(actor:SessionUser,conversationId:number):Promise<StaffTransportPlan>{
 return runtimeTransaction(async()=>{
  await staffCase(actor,conversationId);
  const row=await runtimeGet<PlanRow>('SELECT * FROM support_transport_plans WHERE conversation_id=? FOR SHARE',[conversationId]);
  return row?saved(row):{plan:null,sharePath:null};
 });
}
export async function saveTransportPlan(actor:SessionUser,input:unknown,now=Date.now()):Promise<SavedTransportPlan>{
 const command=parseTransportPlanSave(input);timestamp(now);
 return runtimeTransaction(async()=>{
  await staffCase(actor,command.conversationId,true,command.publicRef);
  const current=await runtimeGet<PlanRow>('SELECT * FROM support_transport_plans WHERE conversation_id=? FOR UPDATE',[command.conversationId]);
  if(current&&current.version!==command.expectedVersion){
   if(current.version===command.expectedVersion+1&&sameLegs(command.legs,projection(current),true))return saved(current);
   conflict();
  }
  if(!current&&command.expectedVersion!==0)conflict();
  const existingIds=new Set(current?projection(current).legs.map(leg=>leg.id):[]);
  if(command.legs.some(leg=>leg.id!==null&&!existingIds.has(leg.id)))throw new TransportPlanError('Check the transport plan.','invalid_request');
  if(current&&sameLegs(command.legs,projection(current)))return saved(current);
  const legs=command.legs.map(leg=>({...leg,id:leg.id??crypto.randomUUID()}));
  let row:PlanRow|undefined;
  if(current){
   row=await runtimeGet<PlanRow>(`UPDATE support_transport_plans SET version=version+1,legs=?::jsonb,updated_by_user_id=?,updated_at=?
    WHERE conversation_id=? AND version=? RETURNING *`,[JSON.stringify(legs),actor.id,now,command.conversationId,command.expectedVersion]);
  }else{
   const nonce=crypto.randomBytes(32).toString('hex');
   row=await runtimeGet<PlanRow>(`INSERT INTO support_transport_plans(conversation_id,version,legs,share_nonce,share_token_hash,updated_by_user_id,updated_at)
    VALUES(?,1,?::jsonb,?,?,?,?) RETURNING *`,[command.conversationId,JSON.stringify(legs),nonce,lookupHash(capability(nonce)),actor.id,now]);
  }
  if(!row)conflict();await auditPlan(actor,row,'transport_plan_updated',now);return saved(row);
 });
}
export async function replaceTransportPlanLink(actor:SessionUser,input:unknown,now=Date.now()):Promise<SavedTransportPlan>{
 const command=parseTransportPlanLink(input);timestamp(now);
 return runtimeTransaction(async()=>{
  await staffCase(actor,command.conversationId,true,command.publicRef);
  const nonce=crypto.randomBytes(32).toString('hex');
  const row=await runtimeGet<PlanRow>(`UPDATE support_transport_plans SET version=version+1,share_nonce=?,share_token_hash=?,updated_by_user_id=?,updated_at=?
   WHERE conversation_id=? AND version=? RETURNING *`,[nonce,lookupHash(capability(nonce)),actor.id,now,command.conversationId,command.expectedVersion]);
  if(!row)conflict();await auditPlan(actor,row,'transport_plan_link_replaced',now);return saved(row);
 });
}
export async function readSharedTransportPlan(token:unknown,ifNoneMatch?:unknown):Promise<SharedTransportPlan>{
 if(!isTransportPlanCapability(token))notFound();
 return runtimeTransaction(async()=>{
  // Validate the active capability before considering any client cache state.
  const header=await runtimeGet<{conversation_id:number;version:number}>(`SELECT p.conversation_id,p.version FROM support_transport_plans p
   JOIN support_conversations c ON c.id=p.conversation_id WHERE p.share_token_hash=? AND c.assistance_category='shipment_observation' FOR SHARE OF p`,[lookupHash(token)]);
  if(!header)notFound();const etag=transportPlanEtag(header.version);
  if(transportPlanEtagMatches(ifNoneMatch,etag))return{kind:'not_modified',etag};
  const row=await runtimeGet<Pick<PlanRow,'version'|'legs'>>('SELECT version,legs FROM support_transport_plans WHERE conversation_id=?',[header.conversation_id]);
  if(!row)notFound();return{kind:'plan',etag,plan:projection(row)};
 });
}

/** Retired S137 participant projection: tracking now requires its own verified session. */
export async function participantTransportPlan(_conversationId:number):Promise<{transportPlan?:TransportPlan;transportPlanLink?:string}>{
 return {};
}
