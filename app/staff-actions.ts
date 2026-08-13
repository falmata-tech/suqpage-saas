"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { DiscoveryAdminError, updateDiscoveryProfile } from "@/lib/discovery-admin";
import { featuredProgramAssignment } from "@/lib/discovery";
import {
  FeaturedProgramSettingsError,
  featuredProgramPolicyFromForm,
  listFeaturedProgramEligibleBusinesses,
  saveFeaturedProgramDay,
  updateFeaturedProgramPolicy,
} from "@/lib/featured-program-settings";
import { assignRequestToTeamMember, createStaffAccount, StaffOperationError } from "@/lib/staff-operations";
import { audit, cleanText } from "@/lib/security";
import { stageUploadedImage, type StagedImage } from "@/lib/media";

export async function createStaffAccountAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    const created = await createStaffAccount({ name:formData.get("name"), email:formData.get("email"), password:formData.get("temporaryPassword"), accessRole:formData.get("accessRole") });
    await audit("staff.account_created", { userId:user.id, detail:{ targetUserId:created.userId, accessRole:created.accessRole } });
  } catch (error) {
    redirect(`/dashboard/admin/staff?error=${encodeURIComponent(error instanceof StaffOperationError ? error.message : "Could not create staff account.")}`);
  }
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/staff");
  redirect("/dashboard/admin/staff?saved=staff");
}

export async function assignRequestAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "operations:manage")) throw new Error("Operations manager access required.");
  const requestId = Number.parseInt(cleanText(formData.get("requestId"), 20), 10);
  const rawTeamMember = cleanText(formData.get("teamMemberId"), 20);
  const teamMemberId = rawTeamMember ? Number.parseInt(rawTeamMember, 10) : null;
  if (!Number.isInteger(requestId) || teamMemberId !== null && !Number.isInteger(teamMemberId)) redirect("/dashboard/requests?error=assignment");
  try {
    const assigned = await assignRequestToTeamMember(requestId, teamMemberId, user.id);
    await audit("service_request.assigned", { userId:user.id, businessId:assigned.businessId, detail:{ requestId, assignedUserId:assigned.assignedUserId, previousUserId:assigned.previousUserId } });
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
  let staged: StagedImage | null = null;
  try {
    staged = await stageUploadedImage(formData.get("boothImage"), "booth");
    const result = await updateDiscoveryProfile({
      businessId,
      industryKeys: formData.getAll("industryKeys"),
      boothImagePath: staged?.imageRef || formData.get("existingBoothImagePath"),
      city: formData.get("city"), zone: formData.get("zone"), region: formData.get("region"),
      latitude: formData.get("latitude"), longitude: formData.get("longitude"),
      fallbackStyle: formData.get("fallbackStyle"),
      productionScale: formData.get("productionScale"),
      sponsored: formData.get("sponsored") === "on",
      sponsorPosition: formData.get("sponsorPosition"),
      excluded: formData.get("excluded") === "on",
    });
    await audit("discovery.profile_updated", { userId:user.id, businessId:result.businessId, detail:{ businessId:result.businessId } });
  } catch (error) {
    await staged?.discard();
    const message = error instanceof DiscoveryAdminError ? error.message : "Could not save the discovery profile.";
    redirect(`/dashboard/admin/discovery/${businessId}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard/admin/discovery");
  revalidatePath("/");
  revalidatePath("/discover");
  redirect(`/dashboard/admin/discovery/${businessId}?saved=profile`);
}

export async function updateFeaturedProgramPolicyAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  const dateIso = cleanText(formData.get("dateIso"), 10);
  try {
    const policy = featuredProgramPolicyFromForm({
      morningStart: formData.get("morningStart"),
      morningEnd: formData.get("morningEnd"),
      afternoonStart: formData.get("afternoonStart"),
      afternoonEnd: formData.get("afternoonEnd"),
      changeoverMinutes: formData.get("changeoverMinutes"),
      sponsorBreakEvery: formData.get("sponsorBreakEvery"),
      sponsorBreakMinutes: formData.get("sponsorBreakMinutes"),
      sponsorBreakLabel: formData.get("sponsorBreakLabel"),
      intermissionLabel: formData.get("intermissionLabel"),
    });
    await updateFeaturedProgramPolicy(policy, user.id);
    await audit("featured_program.policy_updated", { userId: user.id, detail: {
      morningStartMinute: policy.morningStartMinute,
      morningEndMinute: policy.morningEndMinute,
      afternoonStartMinute: policy.afternoonStartMinute,
      afternoonEndMinute: policy.afternoonEndMinute,
      changeoverMinutes: policy.changeoverMinutes,
      sponsorBreakEvery: policy.sponsorBreakEvery,
      sponsorBreakMinutes: policy.sponsorBreakMinutes,
    } });
  } catch (error) {
    const message = error instanceof FeaturedProgramSettingsError ? error.message : "Could not update the program policy.";
    redirect(`/dashboard/admin/featured-schedule?date=${encodeURIComponent(dateIso)}&error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/dashboard/admin/featured-schedule");
  redirect(`/dashboard/admin/featured-schedule?date=${encodeURIComponent(dateIso)}&saved=policy`);
}

export async function saveFeaturedProgramDayAction(formData: FormData) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  const dateIso = cleanText(formData.get("dateIso"), 10);
  try {
    const assignment = featuredProgramAssignment(dateIso);
    if (!assignment) throw new FeaturedProgramSettingsError("Choose a valid program date.");
    const eligible = await listFeaturedProgramEligibleBusinesses(assignment.industry.key);
    const selected = formData.getAll("businessId").map((value) => Number.parseInt(cleanText(value, 20), 10));
    const ordered = selected
      .map((businessId, index) => ({
        businessId,
        position: Number.parseInt(cleanText(formData.get(`position-${businessId}`), 10), 10) || index + 1,
        index,
      }))
      .sort((left, right) => left.position - right.position || left.index - right.index)
      .map((entry) => entry.businessId);
    const mode = cleanText(formData.get("mode"), 20) === "manual" ? "manual" : "automatic";
    const result = await saveFeaturedProgramDay({
      dateIso,
      mode,
      businessIds: ordered,
      eligibleBusinessIds: eligible.map((business) => business.id),
      actorUserId: user.id,
    });
    await audit("featured_program.day_saved", { userId: user.id, detail: {
      dateIso,
      mode: result.mode,
      participantCount: result.participantCount,
      industryKey: assignment.industry.key,
    } });
  } catch (error) {
    const message = error instanceof FeaturedProgramSettingsError ? error.message : "Could not save the featured-showroom lineup.";
    redirect(`/dashboard/admin/featured-schedule?date=${encodeURIComponent(dateIso)}&error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/dashboard/admin/featured-schedule");
  redirect(`/dashboard/admin/featured-schedule?date=${encodeURIComponent(dateIso)}&saved=lineup`);
}
