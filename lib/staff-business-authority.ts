import { runtimeGet } from './runtime-sql';
import type { SessionUser } from './types';

export type BusinessAuthority = 'owner' | 'staff' | 'administrator';

type CurrentProfile = { business_id: number | null; access_role: SessionUser['access_role'] };

/** Global navigation hint; mutations still recheck the locked grant by business. */
export async function currentStaffBusinessGrant(actor:SessionUser):Promise<boolean> {
  if(!Number.isSafeInteger(actor.id)||actor.id<1||
    (actor.access_role!=='team_member'&&actor.access_role!=='operations_manager'))return false;
  const row=await runtimeGet<{enabled:number}>(`SELECT g.enabled FROM staff_business_grants g
    JOIN user_access_profiles p ON p.user_id=g.user_id
    WHERE g.user_id=? AND p.access_role=?`,[actor.id,actor.access_role]);
  return Number(row?.enabled)===1;
}

/**
 * Resolve authority from current persisted identity and the independent staff
 * grant. Call inside a mutation transaction with lock=true: the grant's SHARE
 * lock then serializes the write with an administrator's revoke (UPDATE).
 */
export async function currentBusinessAuthority(
  actor: SessionUser,
  businessId: number,
  lock = false,
): Promise<BusinessAuthority | null> {
  if (!Number.isSafeInteger(actor.id) || actor.id < 1 || !Number.isSafeInteger(businessId) || businessId < 1) return null;
  const profile = await runtimeGet<CurrentProfile>(`
    SELECT u.business_id,p.access_role FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id
    WHERE u.id=? ${lock ? 'FOR SHARE OF u,p' : ''}`, [actor.id]);
  if (!profile || profile.access_role !== actor.access_role) return null;
  if (profile.access_role === 'platform_admin') return 'administrator';
  if (profile.access_role === 'client') {
    return profile.business_id === businessId && actor.business_id === businessId ? 'owner' : null;
  }
  if (profile.access_role !== 'team_member' && profile.access_role !== 'operations_manager') return null;
  const grant = await runtimeGet<{enabled:number}>(`
    SELECT enabled FROM staff_business_grants WHERE user_id=? ${lock ? 'FOR SHARE' : ''}`, [actor.id]);
  return Number(grant?.enabled) === 1 ? 'staff' : null;
}

export async function canManageCurrentBusiness(actor: SessionUser, businessId: number, lock = false): Promise<boolean> {
  return (await currentBusinessAuthority(actor,businessId,lock)) !== null;
}
