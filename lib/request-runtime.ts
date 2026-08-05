import { postgresRuntimePreviewEnabled, postgresRuntimeServices } from "./postgres-runtime-services";
import {
  addRequestClarification as addSqliteRequestClarification,
  canAccessRequest,
  getRequestAttachment as getSqliteRequestAttachment,
  getRequestDetail as getSqliteRequestDetail,
  listRequestsPage as listSqliteRequestsPage,
  requestTypeForBusiness as sqliteRequestTypeForBusiness,
  updateRequestStatus as updateSqliteRequestStatus,
} from "./request-sqlite";

export { canAccessRequest };

export async function runtimeListRequestsPage(...args: Parameters<typeof listSqliteRequestsPage>) {
  return postgresRuntimePreviewEnabled()
    ? postgresRuntimeServices().requests.listRequestsPage(...args)
    : listSqliteRequestsPage(...args);
}

export async function runtimeRequestTypeForBusiness(businessId: number) {
  return postgresRuntimePreviewEnabled()
    ? postgresRuntimeServices().requests.requestTypeForBusiness(businessId)
    : sqliteRequestTypeForBusiness(businessId);
}

export async function runtimeRequestDetail(id: number) {
  return postgresRuntimePreviewEnabled()
    ? postgresRuntimeServices().requests.getRequestDetail(id)
    : getSqliteRequestDetail(id);
}

export async function runtimeRequestAttachment(requestId: number, attachmentId: number) {
  return postgresRuntimePreviewEnabled()
    ? postgresRuntimeServices().requests.getRequestAttachment(requestId, attachmentId)
    : getSqliteRequestAttachment(requestId, attachmentId);
}

export async function runtimeAddRequestClarification(...args: Parameters<typeof addSqliteRequestClarification>) {
  return postgresRuntimePreviewEnabled()
    ? postgresRuntimeServices().requests.addClarification(...args)
    : addSqliteRequestClarification(...args);
}

export async function runtimeUpdateRequestStatus(...args: Parameters<typeof updateSqliteRequestStatus>) {
  return postgresRuntimePreviewEnabled()
    ? postgresRuntimeServices().requests.updateStatus(...args)
    : updateSqliteRequestStatus(...args);
}
