import { redirect } from "next/navigation";
import { runtimeBusinessById } from "./catalog-runtime";
import {
  canMaintainBasicProducts,
  canManageBusiness,
  canViewBusiness,
  hasCapability,
  workspaceHomeHref,
} from "./capabilities";
import type { SessionUser } from "./types";
import { currentBusinessAuthority } from './staff-business-authority';

export async function resolveBusiness(user: SessionUser, requested?: string | number | null) {
  const id = hasCapability(user, "operations:manage") || user.access_role === "team_member" ? Number(requested || 0) : user.business_id;
  if (!id) return null;
  const authority=await currentBusinessAuthority(user,id);
  if (!authority || !canViewBusiness(user, id, authority==='staff')) redirect("/dashboard");
  return (await runtimeBusinessById(id)) || null;
}

export async function resolveManagedBusiness(user: SessionUser, requested?: string | number | null) {
  const business = await resolveBusiness(user, requested);
  if (!business) redirect(workspaceHomeHref(user));
  const authority=await currentBusinessAuthority(user,business.id);
  if (!authority || !canManageBusiness(user, business.id, authority==='staff')) redirect("/dashboard");
  return business;
}
export async function resolveProductBusiness(
  user: SessionUser,
  requested?: string | number | null,
) {
  const business = await resolveBusiness(user, requested);
  if (!business) redirect(workspaceHomeHref(user));
  const authority=await currentBusinessAuthority(user,business.id);
  if (!authority || !canMaintainBasicProducts(user, business.id, authority==='staff')) {
    redirect("/dashboard");
  }
  return business;
}
