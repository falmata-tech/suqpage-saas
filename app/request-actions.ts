"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { REVIEW_REQUEST_STATUSES, RequestError } from "@/lib/request-domain";
import { canAccessRequest, runtimeAddRequestClarification, runtimeRequestDetail, runtimeUpdateRequestStatus } from "@/lib/request-runtime";
import { audit, cleanText } from "@/lib/security";
import type { ServiceRequestStatus } from "@/lib/types";

export async function updateServiceRequestStatusAction(formData: FormData) {
  const user = await requireUser();
  const requestId = Number.parseInt(cleanText(formData.get("requestId"), 20), 10);
  const status = cleanText(formData.get("status"), 40) as ServiceRequestStatus;
  if (!Number.isInteger(requestId) || !REVIEW_REQUEST_STATUSES.includes(status)) redirect("/dashboard/requests?error=invalid");
  const request = await runtimeRequestDetail(requestId);
  if (!request || !canAccessRequest(user,request) || user.access_role === "client") throw new Error("Assigned staff or operations manager access required.");
  try {
    const result = await runtimeUpdateRequestStatus(requestId, status, user.id);
    if (!result) redirect("/dashboard/requests?error=missing");
    await audit("service_request.status_updated", { userId: user.id, businessId: result.businessId, detail: { requestId, status } });
  } catch (error) {
    if (error instanceof RequestError) redirect(`/dashboard/requests/${requestId}?error=transition`);
    throw error;
  }
  revalidatePath("/dashboard/requests");
  revalidatePath(`/dashboard/requests/${requestId}`);
  redirect(`/dashboard/requests/${requestId}?saved=1`);
}

export async function addRequestClarificationAction(formData: FormData) {
  const user = await requireUser();
  const requestId = Number.parseInt(cleanText(formData.get("requestId"),20),10);
  if (!Number.isInteger(requestId)) redirect("/dashboard/requests?error=invalid");
  try {
    const result = await runtimeAddRequestClarification(user,requestId,formData.get("message"));
    await audit("service_request.clarification_added", { userId:user.id, businessId:result.businessId, detail:{ requestId, messageLength:result.messageLength, status:result.status } });
  } catch (error) {
    redirect(`/dashboard/requests/${requestId}?error=${error instanceof RequestError ? "clarification" : "unknown"}`);
  }
  revalidatePath("/dashboard/requests");
  revalidatePath(`/dashboard/requests/${requestId}`);
  redirect(`/dashboard/requests/${requestId}?clarified=1`);
}
