import { runtimeGet,runtimeRun,runtimeTransaction } from './runtime-sql';
import { OwnerPageError } from './owner-page-domain';
import type { SessionUser } from './types';
export async function setBusinessAssignment(actor:SessionUser,businessId:number,userId:number,active:boolean){
 if(actor.access_role!=='platform_admin')throw new OwnerPageError('Administrator access is required.',403);
 if(!Number.isSafeInteger(businessId)||businessId<1||!Number.isSafeInteger(userId)||userId<1||typeof active!=='boolean')throw new OwnerPageError('Choose a valid business and staff account.');
 return runtimeTransaction(async()=>{
  if(!await runtimeGet("SELECT 1 FROM user_access_profiles WHERE user_id=? AND access_role='platform_admin'",[actor.id]))throw new OwnerPageError('Administrator access is required.',403);
  if(!await runtimeGet('SELECT 1 FROM businesses WHERE id=?',[businessId])||!await runtimeGet("SELECT 1 FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND p.access_role='team_member'",[userId]))throw new OwnerPageError('Business or team member not found.',404);
  await runtimeRun(`INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,?) ON CONFLICT(user_id,business_id) DO UPDATE SET active=excluded.active,assigned_by_user_id=excluded.assigned_by_user_id`,[userId,businessId,actor.id,Number(active)]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,'')",[actor.id,businessId,active?'business.staff_assigned':'business.staff_revoked',JSON.stringify({staffUserId:userId})]);
 });
}
