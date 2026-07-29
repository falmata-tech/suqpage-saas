"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  BazaarAdminError,
  updateBazaarBoothPlacement,
  updateBazaarBoothProfile,
  updateBazaarTheme,
} from "@/lib/bazaar";
import { hasCapability } from "@/lib/capabilities";
import { getCurrentExpo, regenerateCurrentExpo } from "@/lib/expo";
import { assignRequestToTeamMember, createStaffAccount, StaffOperationError } from "@/lib/staff-operations";
import { audit, cleanText } from "@/lib/security";

function bazaarAdminError(error: unknown) {
  return error instanceof BazaarAdminError ? error.message : "Could not save Expo controls.";
}

export async function createStaffAccountAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    const created = createStaffAccount({ name:formData.get("name"), email:formData.get("email"), password:formData.get("temporaryPassword"), accessRole:formData.get("accessRole") });
    audit("staff.account_created", { userId:user.id, detail:{ targetUserId:created.userId, accessRole:created.accessRole } });
  } catch (error) {
    redirect(`/dashboard/admin?error=${encodeURIComponent(error instanceof StaffOperationError ? error.message : "Could not create staff account.")}`);
  }
  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?saved=staff");
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

export async function updateBazaarThemeAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    const result = updateBazaarTheme({
      themeId: formData.get("themeId"),
      name: formData.get("name"),
      industryKeys: formData.get("industryKeys"),
      timezone: formData.get("timezone"),
      startsAtTime: formData.get("startsAtTime"),
      active: formData.get("active") === "on",
    });
    getCurrentExpo();
    audit("bazaar.theme_updated", { userId:user.id, detail:{ themeId:result.themeId } });
  } catch (error) {
    redirect(`/dashboard/admin/bazaar?error=${encodeURIComponent(bazaarAdminError(error))}`);
  }
  revalidatePath("/dashboard/admin/bazaar");
  revalidatePath("/");
  revalidatePath("/expo");
  revalidatePath("/bazaar");
  redirect("/dashboard/admin/bazaar?saved=theme");
}

export async function updateBazaarBoothProfileAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    const result = updateBazaarBoothProfile({
      businessId: formData.get("businessId"),
      industryKeys: formData.get("industryKeys"),
      boothImagePath: formData.get("boothImagePath"),
      city: formData.get("city"),
      zone: formData.get("zone"),
      region: formData.get("region"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      fallbackStyle: formData.get("fallbackStyle"),
      featured: formData.get("featured") === "on",
      excluded: formData.get("excluded") === "on",
    });
    regenerateCurrentExpo();
    audit("bazaar.booth_profile_updated", { userId:user.id, businessId:result.businessId, detail:{ businessId:result.businessId } });
  } catch (error) {
    redirect(`/dashboard/admin/bazaar?error=${encodeURIComponent(bazaarAdminError(error))}`);
  }
  revalidatePath("/dashboard/admin/bazaar");
  revalidatePath("/");
  revalidatePath("/expo");
  revalidatePath("/bazaar");
  redirect("/dashboard/admin/bazaar?saved=profile");
}

export async function updateBazaarBoothPlacementAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    const result = updateBazaarBoothPlacement({
      boothId: formData.get("boothId"),
      x: formData.get("x"),
      y: formData.get("y"),
      width: formData.get("width"),
      height: formData.get("height"),
    });
    audit("bazaar.booth_placement_updated", { userId:user.id, detail:{ boothId:result.boothId } });
  } catch (error) {
    redirect(`/dashboard/admin/bazaar?error=${encodeURIComponent(bazaarAdminError(error))}`);
  }
  revalidatePath("/dashboard/admin/bazaar");
  revalidatePath("/bazaar");
  redirect("/dashboard/admin/bazaar?saved=placement");
}

export async function regenerateBazaarAction() {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  const current = regenerateCurrentExpo();
  audit("bazaar.regenerated", { userId:user.id, detail:{ occurrenceId:current.occurrenceId, boothCount:current.booths.length } });
  revalidatePath("/dashboard/admin/bazaar");
  revalidatePath("/");
  revalidatePath("/expo");
  revalidatePath("/bazaar");
  redirect("/dashboard/admin/bazaar?saved=regenerated");
}
