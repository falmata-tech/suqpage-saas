import bcrypt from "bcryptjs";
import { isStrongPassword } from "./passwords";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import type { AccessRole, Business, SessionUser } from "./types";
import {hasCapability} from "./capabilities";
import { authDriver } from "./config";
import { finalizeSupabaseIdentity, provisionSupabaseEmailIdentity, removePendingSupabaseIdentity } from "./supabase-auth";
import { routeWaitingSupportConversations } from "./support";
import {audit} from './security';

export type StaffRole = Extract<AccessRole, "team_member" | "operations_manager">;
export type StaffAccount = {
  id:number; email:string; name:string; access_role:StaffRole; must_change_password:number;
  queue_scope?: "support"|"transport"|"all"|null;
};
export type ManagedClient = { id:number; email:string; name:string; business_id:number; business_name:string; request_type:"onboarding"|"change" };

export class StaffOperationError extends Error {
  constructor(message: string, public status = 400, public code = 'invalid') { super(message); }
}

export type StaffBusinessGrant = { userId:number; enabled:boolean; version:number; updatedAt:number };
type GrantRow = { user_id:number; enabled:number; version:number; updated_at:number };
function presentGrant(row:GrantRow):StaffBusinessGrant {
  return {userId:Number(row.user_id),enabled:Number(row.enabled)===1,version:Number(row.version),updatedAt:Number(row.updated_at)};
}

async function requireCurrentAdministrator(actor:SessionUser, lock=false):Promise<void> {
  if(actor.access_role!=='platform_admin'||!Number.isSafeInteger(actor.id)||actor.id<1||
    !await runtimeGet(`SELECT p.user_id FROM user_access_profiles p WHERE p.user_id=? AND p.access_role='platform_admin' ${lock?'FOR SHARE':''}`,[actor.id])){
    throw new StaffOperationError('Platform administrator access required.',403,'forbidden');
  }
}

export async function getStaffBusinessGrant(actor:SessionUser,userId:number):Promise<StaffBusinessGrant> {
  await requireCurrentAdministrator(actor);
  if(!Number.isSafeInteger(userId)||userId<1)throw new StaffOperationError('Staff account not found.',404,'not_found');
  const row=await runtimeGet<GrantRow>(`SELECT g.user_id,g.enabled,g.version,g.updated_at FROM staff_business_grants g
    JOIN user_access_profiles p ON p.user_id=g.user_id
    WHERE g.user_id=? AND p.access_role IN ('team_member','operations_manager')`,[userId]);
  if(!row)throw new StaffOperationError('Staff business permission not found.',404,'not_found');
  return presentGrant(row);
}

export async function setStaffBusinessGrant(actor:SessionUser,userId:number,enabled:boolean,expectedVersion:number):Promise<StaffBusinessGrant> {
  if(typeof enabled!=='boolean'||!Number.isSafeInteger(expectedVersion)||expectedVersion<1){
    throw new StaffOperationError('Reload this staff permission before saving.',409,'invalid_version');
  }
  if(!Number.isSafeInteger(userId)||userId<1)throw new StaffOperationError('Staff account not found.',404,'not_found');
  return runtimeTransaction(async()=>{
    await requireCurrentAdministrator(actor,true);
    const target=await runtimeGet<{access_role:AccessRole}>(`SELECT access_role FROM user_access_profiles
      WHERE user_id=? FOR SHARE`,[userId]);
    if(target?.access_role!=='team_member'&&target?.access_role!=='operations_manager'){
      throw new StaffOperationError('Staff account not found.',404,'not_found');
    }
    const row=await runtimeGet<GrantRow>(`SELECT user_id,enabled,version,updated_at FROM staff_business_grants
      WHERE user_id=? FOR UPDATE`,[userId]);
    if(!row)throw new StaffOperationError('Staff permission is unavailable. Refresh before saving.',409,'missing_grant');
    if(Number(row.version)!==expectedVersion)throw new StaffOperationError('This permission changed. Reload before saving.',409,'stale_version');
    if((Number(row.enabled)===1)===enabled)return presentGrant(row);
    const now=Date.now();
    const saved=await runtimeGet<GrantRow>(`UPDATE staff_business_grants
      SET enabled=?,version=version+1,updated_by_user_id=?,updated_at=?
      WHERE user_id=? AND version=? RETURNING user_id,enabled,version,updated_at`,
      [Number(enabled),actor.id,now,userId,expectedVersion]);
    if(!saved)throw new StaffOperationError('This permission changed. Reload before saving.',409,'stale_version');
    await audit(enabled?'staff.business_management_enabled':'staff.business_management_revoked',{
      userId:actor.id,detail:{targetUserId:userId,version:Number(saved.version)},
    });
    return presentGrant(saved);
  });
}

const clean = (value: unknown, max: number) => String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);

export async function listStaffAccounts(): Promise<StaffAccount[]> {
  return runtimeAll<StaffAccount>(`
    SELECT u.id,u.email,u.name,u.must_change_password,p.access_role,s.queue_scope
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    WHERE p.access_role IN ('team_member','operations_manager')
    ORDER BY p.access_role,u.name
  `);
}

export async function getStaffAccount(actor:SessionUser,userId:number):Promise<StaffAccount> {
  await requireCurrentAdministrator(actor);
  if(!Number.isSafeInteger(userId)||userId<1)throw new StaffOperationError('Staff account not found.',404,'not_found');
  const row=await runtimeGet<StaffAccount>(`SELECT u.id,u.email,u.name,u.must_change_password,p.access_role,s.queue_scope
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id
    WHERE u.id=? AND p.access_role IN ('team_member','operations_manager')`,[userId]);
  if(!row)throw new StaffOperationError('Staff account not found.',404,'not_found');
  return row;
}

export async function listTeamMembers(): Promise<StaffAccount[]> {
  return (await listStaffAccounts()).filter((staff) => staff.access_role === "team_member" && staff.queue_scope !== "support" && staff.queue_scope !== "transport");
}

export async function listManagedClients(): Promise<ManagedClient[]> {
  const rows = await runtimeAll<ManagedClient>(`
    SELECT u.id,u.email,u.name,u.business_id,b.name business_name,
      CASE WHEN b.status='draft' AND b.content_version=1
        AND NOT EXISTS(SELECT 1 FROM published_catalog_versions v WHERE v.business_id=b.id)
        THEN 'onboarding' ELSE 'change' END request_type
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    JOIN businesses b ON b.id=u.business_id
    WHERE p.access_role='client'
    ORDER BY b.name,u.name
  `);
  return rows.map(({ id, email, name, business_id, business_name, request_type }) => ({
    id,
    email,
    name,
    business_id,
    business_name,
    request_type,
  }));
}

export async function createStaffAccount(raw: { name:unknown; email:unknown; password:unknown; accessRole:unknown }, actor: SessionUser) {
  if (!hasCapability(actor,"platform:admin") || !Number.isSafeInteger(actor.id) ||
    !await runtimeGet("SELECT 1 FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND p.access_role='platform_admin'",[actor.id]))
    throw new StaffOperationError("Platform administrator access required.");
  const name = clean(raw.name, 100);
  const email = clean(raw.email, 160).toLowerCase();
  const managed = authDriver() === "supabase";
  const password = managed ? "" : String(raw.password ?? "");
  const functionRole = clean(raw.accessRole, 40);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !["support_agent", "transport_agent"].includes(functionRole) || (!managed && !isStrongPassword(password))) {
    throw new StaffOperationError(managed ? "Enter a name, valid email and staff role." : "Complete every staff field and use a 12+ character temporary password with upper-case, lower-case, and a number.");
  }
  const accessRole = "team_member" as const;
  const queueScope = functionRole === "support_agent" ? "support" as const : "transport" as const;
  const passwordHash = managed ? "!supabase-managed-identity" : await bcrypt.hash(password, 12);
  let providerUserId = "";
  if (managed) {
    try { providerUserId = await provisionSupabaseEmailIdentity({ email, name }); }
    catch { throw new StaffOperationError("That staff email is already in use or managed identity is temporarily unavailable."); }
  }
  try {
    const result = await runtimeTransaction(async () => {
      if(!await runtimeGet("SELECT user_id FROM user_access_profiles WHERE user_id=? AND access_role='platform_admin' FOR SHARE",[actor.id]))throw new StaffOperationError('Platform administrator access required.');
      const inserted = await runtimeGet<{ id: number }>(`
        INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,created_at)
        VALUES(?,?,?,'admin',NULL,?,CURRENT_TIMESTAMP) RETURNING id
      `, [email, passwordHash, name, managed ? 0 : 1]);
      const userId = Number(inserted!.id);
      await runtimeRun("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)", [userId, accessRole]);
      await runtimeRun(`INSERT INTO staff_business_grants(user_id,enabled,version,updated_by_user_id,updated_at)
        VALUES(?,1,1,?,?)`, [userId,actor.id,Date.now()]);
      await runtimeRun("INSERT INTO support_agent_settings(user_id,enabled,updated_by_user_id,updated_at,queue_scope) VALUES(?,1,?,?,?)",[userId,actor.id,Date.now(),queueScope]);
      if (providerUserId) await runtimeRun("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,?)", [userId, providerUserId, email, Date.now()]);
      const routing = await routeWaitingSupportConversations(actor);
      await audit('staff.account_created',{userId:actor.id,detail:{targetUserId:userId,accessRole,queueScope}});
      return { userId, accessRole, queueScope, routing };
    });
    if (providerUserId) await finalizeSupabaseIdentity(providerUserId, result.userId).catch(() => undefined);
    return result;
  } catch (error) {
    if (providerUserId) await removePendingSupabaseIdentity(providerUserId).catch(() => false);
    if (error instanceof StaffOperationError) throw error;
    throw new StaffOperationError(error&&typeof error==='object'&&'code' in error&&error.code==='23505'?"That staff email is already in use.":"Could not create staff account.");
  }
}

export async function listAssignedBusinesses(userId: number): Promise<Business[]> {
  return runtimeAll<Business>(`
    SELECT b.* FROM businesses b
    WHERE EXISTS(SELECT 1 FROM staff_business_grants g
      JOIN user_access_profiles p ON p.user_id=g.user_id
      WHERE g.user_id=? AND g.enabled=1 AND p.access_role IN ('team_member','operations_manager'))
    ORDER BY b.name
  `, [userId]);
}

export async function assignRequestToTeamMember(requestId: number, teamMemberId: number | null, actorUserId: number) {
  return runtimeTransaction(async () => {
    const request = await runtimeGet<{id:number;business_id:number|null;assigned_user_id:number|null}>("SELECT id,business_id,assigned_user_id FROM service_requests WHERE id=?", [requestId]);
    if (!request) throw new StaffOperationError("Request not found.");
    if (teamMemberId !== null) {
      const teamMember = await runtimeGet(`
        SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
        WHERE u.id=? AND p.access_role='team_member' AND NOT EXISTS(
          SELECT 1 FROM support_agent_settings s WHERE s.user_id=u.id AND s.queue_scope IN ('support','transport'))
      `, [teamMemberId]);
      if (!teamMember) throw new StaffOperationError("Choose a valid team member.");
    }
    await runtimeRun("UPDATE service_requests SET assigned_user_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [teamMemberId, requestId]);
    await runtimeRun("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)", [
      requestId, actorUserId, teamMemberId === null ? "unassigned" : "assigned", teamMemberId === null ? "assignment cleared" : `team_member:${teamMemberId}`,
    ]);
    return { businessId:request.business_id, previousUserId:request.assigned_user_id, assignedUserId:teamMemberId };
  });
}
