import type { AccessRole, SessionUser } from "./types";

export type Capability =
  | "platform:admin"
  | "operations:manage"
  | "business:manage"
  | "client:workspace";

const grants: Record<AccessRole, ReadonlySet<Capability>> = {
  platform_admin: new Set(["platform:admin", "operations:manage", "business:manage"]),
  operations_manager: new Set(["operations:manage"]),
  legacy_owner: new Set(["business:manage"]),
  team_member: new Set(),
  client: new Set(["client:workspace"]),
};

export function hasCapability(user: SessionUser, capability: Capability) {
  return grants[user.access_role].has(capability);
}

export function canViewBusiness(user: SessionUser, businessId: number, assigned = false) {
  if (hasCapability(user, "operations:manage") || hasCapability(user, "platform:admin")) return true;
  if (user.access_role === "team_member") return assigned;
  return user.business_id === businessId;
}

export function canManageBusiness(user: SessionUser, businessId: number, _assigned = false) {
  if (hasCapability(user, "platform:admin")) return true;
  return user.access_role === "legacy_owner" && user.business_id === businessId;
}

export function isClient(user: SessionUser) {
  return user.access_role === "client";
}
