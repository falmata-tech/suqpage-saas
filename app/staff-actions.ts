"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { DiscoveryAdminError, updateDiscoveryProfile } from "@/lib/discovery-admin";
import { featuredProgramAssignment } from "@/lib/discovery";
import {
  FeaturedProgramSettingsError,
  listFeaturedProgramEligibleBusinesses,
  saveFeaturedProgramDay,
} from "@/lib/featured-program-settings";
import { createStaffAccount, StaffOperationError } from "@/lib/staff-operations";
import { scheduleAttentionDelivery } from "@/lib/attention-after";
import { audit, cleanText } from "@/lib/security";
import { stageUploadedImage, type StagedImage } from "@/lib/media";
import { createExternalSponsorAd, getExternalSponsorAd, setBusinessSponsorship, SponsorAdminError, updateExternalSponsorAd } from "@/lib/sponsor-admin";
import {runtimeTransaction} from '@/lib/runtime-sql';

export async function createStaffAccountAction(formData: FormData): Promise<import("@/lib/owner-edit-contract").OwnerEditResult> {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    await createStaffAccount({ name:formData.get("name"), email:formData.get("email"), password:formData.get("temporaryPassword"), accessRole:formData.get("accessRole") },user);
  } catch (error) {
    return {error:error instanceof StaffOperationError ? error.message : "Could not create staff account."};
  }
  scheduleAttentionDelivery();
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/staff");
  redirect(`/dashboard/admin/staff?saved=staff&q=${encodeURIComponent(String(formData.get("email") || "").trim().toLowerCase())}`);
}

export async function updateDiscoveryProfileAction(formData: FormData):Promise<import('@/lib/owner-edit-contract').OwnerEditResult> {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  const businessId = Number.parseInt(String(formData.get("businessId") || ""), 10);
  let staged: StagedImage | null = null;
  try {
    staged = await stageUploadedImage(formData.get("boothImage"), "booth");
    const result = await updateDiscoveryProfile({
      businessId,
      proposalVersion:formData.get("proposalVersion"),
      ...(formData.has('industryKeys')||formData.get('industriesPresent')==='1'?{industryKeys:formData.getAll("industryKeys")} : {}),
      ...(staged ? {boothImagePath:staged.imageRef} : {}),
      ...Object.fromEntries(['city','zone','region','countryCode','placeId','latitude','longitude','fallbackStyle','productionScale'].filter(key=>formData.has(key)).map(key=>[key,formData.get(key)])),
      ...(formData.has('sponsorPosition') ? {sponsored:formData.get("sponsored") === "on",sponsorPosition:formData.get('sponsorPosition')} : {}),
      ...(formData.has('excluded')||formData.get('visibilityPresent')==='1'?{excluded:formData.get("excluded") === "on"} : {}),
    });
    await audit("discovery.profile_updated", { userId:user.id, businessId:result.businessId, detail:{ businessId:result.businessId } });
  } catch (error) {
    await staged?.discard();
    const message = error instanceof DiscoveryAdminError ? error.message : "Could not save the discovery profile.";
    return {error:message};
  }
  revalidatePath("/dashboard/admin/discovery");
  revalidatePath("/");
  revalidatePath("/discover");
  redirect(`/dashboard/admin/discovery/${businessId}?saved=profile`);
}

function sponsorAdminError(error: unknown) {
  return error instanceof SponsorAdminError ? error.message : "The sponsor placement could not be saved.";
}

function sponsorReturnPath(formData:FormData) {
  const query=new URLSearchParams(),q=cleanText(formData.get('return_q'),200);
  const business=String(formData.get('return_business')||'');
  if(/^[1-9]\d{0,9}$/.test(business)&&Number(business)===Number(formData.get('businessId')))return '/dashboard/admin/sponsors?business='+business;
  if(q)query.set('q',q);
  for(const key of ['businessPage','adPage']){const value=String(formData.get('return_'+key)||'');if(/^[1-9]\d{0,5}$/.test(value))query.set(key,value);}
  return '/dashboard/admin/sponsors'+(query.size?'?'+query:'');
}
function sponsorSavedPath(formData:FormData,kind:string){const path=sponsorReturnPath(formData);return path+(path.includes('?')?'&':'?')+'saved='+kind;}

export async function createExternalSponsorAdAction(formData: FormData):Promise<import('@/lib/owner-edit-contract').OwnerEditResult> {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  let staged: StagedImage | null = null;
  try {
    staged = await stageUploadedImage(formData.get("image"), "sponsor");
    if (!staged) throw new SponsorAdminError("Upload a sponsor image.");
    const imagePath=staged.imageRef;
    await runtimeTransaction(async()=>{const created = await createExternalSponsorAd({
      name: formData.get("name"), description: formData.get("description"), imagePath,
      websiteUrl: formData.get("websiteUrl"), phone: formData.get("phone"), position: formData.get("position"),
      active: formData.get("active") === "on",
    });
    await audit("sponsor.external_created", { userId: user.id, detail: { sponsorAdId: created.id } });});
  } catch (error) {
    await staged?.discard();
    return {error:sponsorAdminError(error)};
  }
  revalidatePath("/featured");
  revalidatePath("/dashboard/admin/sponsors");
  redirect(sponsorSavedPath(formData,'external'));
}

export async function updateExternalSponsorAdAction(formData: FormData):Promise<import('@/lib/owner-edit-contract').OwnerEditResult> {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  const id = Number.parseInt(String(formData.get("id") || ""), 10);
  let staged: StagedImage | null = null;
  try {
    const current = Number.isInteger(id) ? await getExternalSponsorAd(id) : undefined;
    if (!current) throw new SponsorAdminError("Sponsor ad not found.");
    staged = await stageUploadedImage(formData.get("image"), "sponsor");
    await runtimeTransaction(async()=>{await updateExternalSponsorAd({
      id, name: formData.get("name"), description: formData.get("description"), imagePath: staged?.imageRef || current.imagePath,
      websiteUrl: formData.get("websiteUrl"), phone: formData.get("phone"), position: formData.get("position"),
      active: formData.get("active") === "on",
    });
    await audit("sponsor.external_updated", { userId: user.id, detail: { sponsorAdId: id } });});
  } catch (error) {
    await staged?.discard();
    return {error:sponsorAdminError(error)};
  }
  revalidatePath("/featured");
  revalidatePath("/dashboard/admin/sponsors");
  redirect(sponsorSavedPath(formData,'external'));
}

export async function setBusinessSponsorshipAction(formData: FormData):Promise<import('@/lib/owner-edit-contract').OwnerEditResult> {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) throw new Error("Platform administrator access required.");
  try {
    await runtimeTransaction(async()=>{const result = await setBusinessSponsorship({
      businessId: formData.get("businessId"), position: formData.get("position"), active: formData.get("active") === "on",
    });
    await audit("sponsor.showroom_updated", { userId: user.id, businessId: result.businessId, detail: { active: formData.get("active") === "on" } });});
  } catch (error) {
    return {error:sponsorAdminError(error)};
  }
  revalidatePath("/featured");
  revalidatePath("/dashboard/admin/sponsors");
  redirect(sponsorSavedPath(formData,'showroom'));
}

export async function saveFeaturedProgramDayAction(formData: FormData):Promise<import('@/lib/owner-edit-contract').OwnerEditResult> {
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
    return {error:message};
  }
  updateTag("public-featured");
  updateTag("public-marketplace");
  revalidatePath("/featured");
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/dashboard/admin/featured-schedule");
  redirect(`/dashboard/admin/featured-schedule?date=${encodeURIComponent(dateIso)}&saved=lineup`);
}
