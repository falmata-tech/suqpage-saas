import type { PostgresRequestRepository } from "./postgres-request-repository";
import { hasCapability } from "./capabilities";
import type { SessionUser } from "./types";
import { postgresRuntimeServices } from "./postgres-runtime-services";
import { runtimeGet } from "./runtime-sql";
import type { ServiceRequest } from "./types";
export function canAccessRequest(user: SessionUser, request: Pick<ServiceRequest, "business_id" | "represented_client_user_id" | "assigned_user_id">) {
  if (hasCapability(user, "operations:manage")) return true;
  if (user.access_role === "client") return Boolean(user.business_id && request.business_id === user.business_id && request.represented_client_user_id === user.id);
  return user.access_role === "team_member" && request.assigned_user_id === user.id;
}
export async function runtimeListRequestsPage(...args: Parameters<PostgresRequestRepository["listRequestsPage"]>) {
    return postgresRuntimeServices().requests.listRequestsPage(...args);
}
export async function runtimeRequestTypeForBusiness(businessId: number) {
    return postgresRuntimeServices().requests.requestTypeForBusiness(businessId);
}
export async function runtimeCurrentShowroomProject(businessId: number) {
    if (!Number.isInteger(businessId) || businessId < 1)
        return undefined;
    return runtimeGet<ServiceRequest>(`
    SELECT * FROM service_requests
    WHERE business_id=?
      AND status IN (
        'submitted','under_review','needs_information','approved_for_work',
        'in_progress','client_review','client_approved'
      )
    ORDER BY updated_at DESC,id DESC
    LIMIT 1
  `, [businessId]);
}
export async function runtimeRequestDetail(id: number) {
    return postgresRuntimeServices().requests.getRequestDetail(id);
}
export async function runtimeRequestAttachment(requestId: number, attachmentId: number) {
    return postgresRuntimeServices().requests.getRequestAttachment(requestId, attachmentId);
}
export async function runtimeAddRequestClarification(...args: Parameters<PostgresRequestRepository["addClarification"]>) {
    return postgresRuntimeServices().requests.addClarification(...args);
}
export async function runtimeUpdateRequestStatus(...args: Parameters<PostgresRequestRepository["updateStatus"]>) {
    return postgresRuntimeServices().requests.updateStatus(...args);
}
