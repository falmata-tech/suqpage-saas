import { redirect } from "next/navigation";
import { getBusinessById, getDb, hasRetainedPublication } from "./db";
import {
  canMaintainBasicProducts,
  canManageBusiness,
  canViewBusiness,
  hasCapability,
} from "./capabilities";
import type { SessionUser } from "./types";

export function resolveBusiness(user: SessionUser, requested?: string | number | null) {
  const id = hasCapability(user, "operations:manage") || user.access_role === "team_member" ? Number(requested || 0) : user.business_id;
  if (!id) return null;
  const assigned = user.access_role === "team_member" && Boolean(getAssignedBusiness(user.id, id));
  if (!canViewBusiness(user, id, assigned)) redirect("/dashboard");
  return getBusinessById(id) || null;
}

export function resolveManagedBusiness(user: SessionUser, requested?: string | number | null) {
  const business = resolveBusiness(user, requested);
  if (!business) return null;
  const assigned = user.access_role === "team_member" && Boolean(getAssignedBusiness(user.id, business.id));
  if (!canManageBusiness(user, business.id, assigned)) redirect("/dashboard");
  return business;
}

export function resolveProductBusiness(
  user: SessionUser,
  requested?: string | number | null,
) {
  const business = resolveBusiness(user, requested);
  if (!business) return null;
  const assigned =
    user.access_role === "team_member" &&
    Boolean(getAssignedBusiness(user.id, business.id));
  if (!canMaintainBasicProducts(user, business.id, assigned)) {
    redirect("/dashboard");
  }
  if (!hasRetainedPublication(business.id)) {
    redirect(
      user.access_role === "client"
        ? "/dashboard/requests/new"
        : "/dashboard/requests",
    );
  }
  return business;
}

function getAssignedBusiness(userId: number, businessId: number) {
  // Kept local so capability rules remain framework-independent while assignment is an adapter concern.
  return getDb().prepare("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1").get(userId, businessId);
}
