"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { REVIEW_REQUEST_STATUSES, RequestError } from "@/lib/request-domain";
import { canAccessRequest, getRequestDetail, updateRequestStatus } from "@/lib/request-sqlite";
import { audit, cleanText } from "@/lib/security";
import type { ServiceRequestStatus } from "@/lib/types";

export async function updateServiceRequestStatusAction(formData: FormData) {
  const user = await requireUser();
  const requestId = Number.parseInt(cleanText(formData.get("requestId"), 20), 10);
  const status = cleanText(formData.get("status"), 40) as ServiceRequestStatus;
  if (!Number.isInteger(requestId) || !REVIEW_REQUEST_STATUSES.includes(status)) redirect("/dashboard/requests?error=invalid");
  const request = getRequestDetail(requestId);
  if (!request || !canAccessRequest(user,request) || user.access_role === "client") throw new Error("Assigned staff or operations manager access required.");
  try {
    const result = updateRequestStatus(requestId, status, user.id);
    if (!result) redirect("/dashboard/requests?error=missing");
    audit("service_request.status_updated", { userId: user.id, businessId: result.businessId, detail: { requestId, status } });
  } catch (error) {
    if (error instanceof RequestError) redirect(`/dashboard/requests/${requestId}?error=transition`);
    throw error;
  }
  revalidatePath("/dashboard/requests");
  revalidatePath(`/dashboard/requests/${requestId}`);
  redirect(`/dashboard/requests/${requestId}?saved=1`);
}
