import type { AccessRole, SessionUser } from "./types";

export type Capability =
  | "platform:admin"
  | "operations:manage"
  | "customer-operations:manage"
  | "basic-product:maintain"
  | "client:workspace"
  | "design-bank:view";

const grants: Record<AccessRole, ReadonlySet<Capability>> = {
  platform_admin: new Set(["platform:admin", "operations:manage", "customer-operations:manage", "basic-product:maintain", "design-bank:view"]),
  operations_manager: new Set(["operations:manage", "customer-operations:manage", "basic-product:maintain", "design-bank:view"]),
  team_member: new Set(["basic-product:maintain", "design-bank:view"]),
  client: new Set(["basic-product:maintain", "client:workspace"]),
};

export function isQueueAgent(user: SessionUser) {
  return user.access_role === "team_member" &&
    (user.staff_queue_scope === "support" || user.staff_queue_scope === "transport");
}

export function hasCapability(user: SessionUser, capability: Capability) {
  if (isQueueAgent(user)) return false;
  return grants[user.access_role].has(capability);
}

export function canViewBusiness(user: SessionUser, businessId: number, assigned = false) {
  if (!Number.isSafeInteger(businessId) || businessId < 1) return false;
  if (user.access_role === "platform_admin") return true;
  if (user.access_role === "team_member" || user.access_role === "operations_manager") return assigned;
  return user.access_role === "client" && user.business_id === businessId;
}

export function canManageBusiness(user: SessionUser, businessId: number, granted = false) {
  return Number.isSafeInteger(businessId) && businessId > 0 &&
    (user.access_role === "platform_admin" ||
      ((user.access_role === "team_member" || user.access_role === "operations_manager") && granted));
}

export function canMaintainBasicProducts(
  user: SessionUser,
  businessId: number,
  assigned = false,
) {
  if (!Number.isSafeInteger(businessId) || businessId < 1) return false;
  if (user.access_role === "client") return user.business_id === businessId;
  if (user.access_role === "team_member" || user.access_role === "operations_manager") return assigned;
  return user.access_role === "platform_admin";
}

export function canOperateBusiness(user: SessionUser, businessId: number) {
  return businessId > 0 && hasCapability(user, "customer-operations:manage");
}

export function isClient(user: SessionUser) {
  return user.access_role === "client";
}

/** Navigation hint only; each workspace still enforces its own authorization. */
export function workspaceHomeHref(user:SessionUser):string {
  if(isQueueAgent(user))return `/dashboard/support?queue=${user.staff_queue_scope}`;
  if(hasCapability(user,'platform:admin'))return '/dashboard/admin';
  if(user.access_role==='client'&&user.business_id)return '/dashboard/profile';
  return '/dashboard';
}
