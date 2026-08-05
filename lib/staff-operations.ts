import bcrypt from "bcryptjs";
import { isStrongPassword } from "./passwords";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import type { AccessRole, Business } from "./types";

export type StaffRole = Extract<AccessRole, "team_member" | "operations_manager">;
export type StaffAccount = {
  id:number; email:string; name:string; access_role:StaffRole; must_change_password:number;
};
export type ManagedClient = { id:number; email:string; name:string; business_id:number; business_name:string; request_type:"onboarding"|"change" };

export class StaffOperationError extends Error {}

const clean = (value: unknown, max: number) => String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);

export async function listStaffAccounts(): Promise<StaffAccount[]> {
  return runtimeAll<StaffAccount>(`
    SELECT u.id,u.email,u.name,u.must_change_password,p.access_role
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    WHERE p.access_role IN ('team_member','operations_manager')
    ORDER BY p.access_role,u.name
  `);
}

export async function listTeamMembers(): Promise<StaffAccount[]> {
  return (await listStaffAccounts()).filter((staff) => staff.access_role === "team_member");
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

export async function createStaffAccount(raw: { name:unknown; email:unknown; password:unknown; accessRole:unknown }) {
  const name = clean(raw.name, 100);
  const email = clean(raw.email, 160).toLowerCase();
  const password = String(raw.password ?? "");
  const accessRole = clean(raw.accessRole, 40) as StaffRole;
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !["team_member", "operations_manager"].includes(accessRole) || !isStrongPassword(password)) {
    throw new StaffOperationError("Complete every staff field and use a 12+ character temporary password with upper-case, lower-case, and a number.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    return runtimeTransaction(async () => {
      const inserted = await runtimeGet<{ id: number }>(`
        INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,created_at)
        VALUES(?,?,?,'admin',NULL,1,CURRENT_TIMESTAMP) RETURNING id
      `, [email, passwordHash, name]);
      const userId = Number(inserted!.id);
      await runtimeRun("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)", [userId, accessRole]);
      return { userId, accessRole };
    });
  } catch (error) {
    if (error instanceof StaffOperationError) throw error;
    throw new StaffOperationError("That staff email is already in use.");
  }
}

export async function listAssignedBusinesses(userId: number): Promise<Business[]> {
  return runtimeAll<Business>(`
    SELECT b.* FROM businesses b
    JOIN staff_business_assignments a ON a.business_id=b.id
    WHERE a.user_id=? AND a.active=1
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
        WHERE u.id=? AND p.access_role='team_member'
      `, [teamMemberId]);
      if (!teamMember) throw new StaffOperationError("Choose a valid team member.");
    }
    await runtimeRun("UPDATE service_requests SET assigned_user_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [teamMemberId, requestId]);
    if (request.business_id && teamMemberId !== null) {
      await runtimeRun(`
        INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active)
        VALUES(?,?,?,1)
        ON CONFLICT(user_id,business_id) DO UPDATE SET assigned_by_user_id=excluded.assigned_by_user_id,active=1
      `, [teamMemberId, request.business_id, actorUserId]);
    }
    if (request.business_id && request.assigned_user_id && request.assigned_user_id !== teamMemberId) {
      const stillNeeded = await runtimeGet(`
        SELECT 1 FROM service_requests
        WHERE assigned_user_id=? AND business_id=? AND id<>?
          AND status NOT IN ('completed','rejected','cancelled') LIMIT 1
      `, [request.assigned_user_id, request.business_id, requestId]);
      if (!stillNeeded) await runtimeRun("UPDATE staff_business_assignments SET active=0 WHERE user_id=? AND business_id=?", [request.assigned_user_id, request.business_id]);
    }
    await runtimeRun("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)", [
      requestId, actorUserId, teamMemberId === null ? "unassigned" : "assigned", teamMemberId === null ? "assignment cleared" : `team_member:${teamMemberId}`,
    ]);
    return { businessId:request.business_id, previousUserId:request.assigned_user_id, assignedUserId:teamMemberId };
  });
}
