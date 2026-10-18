import { runtimeAll,runtimeGet,runtimeRun,runtimeTransaction } from './runtime-sql';
import { OwnerPageError } from './owner-page-domain';
import { likePattern,normalizePageRequest,pageResult,pageWindow,type PageResult } from './pagination';
import type { SessionUser } from './types';

export interface BusinessAssignmentCandidate {
 id:number;
 name:string;
 email:string;
 active:number;
 canAssign:boolean;
}

export async function listBusinessAssignmentCandidates(actor:SessionUser,businessId:number,input:{page?:unknown;q?:unknown}={}):Promise<PageResult<BusinessAssignmentCandidate>>{
 if(actor.access_role!=='platform_admin'||!await runtimeGet("SELECT 1 FROM user_access_profiles WHERE user_id=? AND access_role='platform_admin'",[actor.id]))throw new OwnerPageError('Administrator access is required.',403);
 if(!Number.isSafeInteger(businessId)||businessId<1||!await runtimeGet('SELECT 1 FROM businesses WHERE id=?',[businessId]))throw new OwnerPageError('Business not found.',404);
 const request=normalizePageRequest({page:input.page,search:input.q}),pattern=likePattern(request.search);
 // Historical associations remain visible for explicit revocation; they never
 // turn a scoped chat agent (or a changed role) into an eligible page editor.
 const eligible="p.access_role='team_member' AND COALESCE(s.queue_scope,'all')='all'";
 const from=`FROM users u LEFT JOIN user_access_profiles p ON p.user_id=u.id
  LEFT JOIN support_agent_settings s ON s.user_id=u.id
  LEFT JOIN staff_business_assignments a ON a.user_id=u.id AND a.business_id=?
  WHERE ((${eligible}) OR a.user_id IS NOT NULL)
  AND (lower(u.name) LIKE ? ESCAPE '\\' OR lower(u.email) LIKE ? ESCAPE '\\')`;
 const total=Number((await runtimeGet<{total:number}>(`SELECT COUNT(*) total ${from}`,[businessId,pattern,pattern]))?.total||0),window=pageWindow(total,request);
 const rows=await runtimeAll<{id:number;name:string;email:string;active:number;can_assign:boolean}>(`SELECT u.id,u.name,u.email,COALESCE(a.active,0) active,COALESCE((${eligible}),false) can_assign ${from} ORDER BY lower(u.name),u.id LIMIT ? OFFSET ?`,[businessId,pattern,pattern,window.limit,window.offset]);
 return pageResult(rows.map(({can_assign,...row})=>({...row,canAssign:can_assign})),total,request);
}

export async function setBusinessAssignment(actor:SessionUser,businessId:number,userId:number,active:boolean){
 if(actor.access_role!=='platform_admin')throw new OwnerPageError('Administrator access is required.',403);
 if(!Number.isSafeInteger(businessId)||businessId<1||!Number.isSafeInteger(userId)||userId<1||typeof active!=='boolean')throw new OwnerPageError('Choose a valid business and staff account.');
 return runtimeTransaction(async()=>{
  // Availability/scope changes take this same lock, so a concurrent queue-role
  // update cannot race a new business-editor grant.
  await runtimeGet("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");
  if(!await runtimeGet("SELECT 1 FROM user_access_profiles WHERE user_id=? AND access_role='platform_admin' FOR SHARE",[actor.id]))throw new OwnerPageError('Administrator access is required.',403);
  if(!await runtimeGet('SELECT 1 FROM businesses WHERE id=?',[businessId])||!await runtimeGet('SELECT 1 FROM users WHERE id=? FOR SHARE',[userId]))throw new OwnerPageError('Business or team member not found.',404);
  const profile=await runtimeGet<{access_role:string}>('SELECT access_role FROM user_access_profiles WHERE user_id=? FOR SHARE',[userId]);
  const settings=await runtimeGet<{queue_scope:string}>('SELECT queue_scope FROM support_agent_settings WHERE user_id=? FOR SHARE',[userId]);
  if(active&&(profile?.access_role!=='team_member'||settings?.queue_scope==='support'||settings?.queue_scope==='transport'))throw new OwnerPageError('Choose a team member with page-editing access.',403);
  if(!active&&!await runtimeGet('SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=?',[userId,businessId]))throw new OwnerPageError('Business assignment not found.',404);
  await runtimeRun(`INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,?) ON CONFLICT(user_id,business_id) DO UPDATE SET active=excluded.active,assigned_by_user_id=excluded.assigned_by_user_id`,[userId,businessId,actor.id,Number(active)]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,'')",[actor.id,businessId,active?'business.staff_assigned':'business.staff_revoked',JSON.stringify({staffUserId:userId})]);
 });
}
