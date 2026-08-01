"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { DiscoveryAdminError, updateDiscoveryProfile } from "@/lib/discovery-admin";
import { assignRequestToTeamMember, createStaffAccount, StaffOperationError } from "@/lib/staff-operations";
import { audit, cleanText } from "@/lib/security";

export async function createStaffAccountAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    const created = createStaffAccount({ name:formData.get("name"), email:formData.get("email"), password:formData.get("temporaryPassword"), accessRole:formData.get("accessRole") });
    audit("staff.account_created", { userId:user.id, detail:{ targetUserId:created.userId, accessRole:created.accessRole } });
  } catch (error) {
    redirect(`/dashboard/admin?view=staff&error=${encodeURIComponent(error instanceof StaffOperationError ? error.message : "Could not create staff account.")}`);
  }
  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?view=staff&saved=staff");
}

export async function assignRequestAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "operations:manage")) throw new Error("Operations manager access required.");
  const requestId = Number.parseInt(cleanText(formData.get("requestId"), 20), 10);
  const rawTeamMember = cleanText(formData.get("teamMemberId"), 20);
  const teamMemberId = rawTeamMember ? Number.parseInt(rawTeamMember, 10) : null;
  if (!Number.isInteger(requestId) || teamMemberId !== null && !Number.isInteger(teamMemberId)) redirect("/dashboard/requests?error=assignment");
  try {
    const assigned = assignRequestToTeamMember(requestId, teamMemberId, user.id);
    audit("service_request.assigned", { userId:user.id, businessId:assigned.businessId, detail:{ requestId, assignedUserId:assigned.assignedUserId, previousUserId:assigned.previousUserId } });
  } catch (error) {
    redirect(`/dashboard/requests/${requestId}?error=assignment`);
  }
  revalidatePath("/dashboard/requests");
  revalidatePath(`/dashboard/requests/${requestId}`);
  redirect(`/dashboard/requests/${requestId}?assigned=1`);
}

export async function updateDiscoveryProfileAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  const businessId = Number.parseInt(String(formData.get("businessId") || ""), 10);
  try {
    const result = updateDiscoveryProfile({
      businessId,
      industryKeys: formData.getAll("industryKeys"),
      boothImagePath: formData.get("boothImagePath"),
      city: formData.get("city"), zone: formData.get("zone"), region: formData.get("region"),
      latitude: formData.get("latitude"), longitude: formData.get("longitude"),
      fallbackStyle: formData.get("fallbackStyle"),
      featured: formData.get("featured") === "on",
      excluded: formData.get("excluded") === "on",
    });
    audit("discovery.profile_updated", { userId:user.id, businessId:result.businessId, detail:{ businessId:result.businessId } });
  } catch (error) {
    const message = error instanceof DiscoveryAdminError ? error.message : "Could not save the discovery profile.";
    redirect(`/dashboard/admin/discovery/${businessId}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard/admin/discovery");
  revalidatePath("/");
  revalidatePath("/discover");
  redirect(`/dashboard/admin/discovery/${businessId}?saved=profile`);
}
