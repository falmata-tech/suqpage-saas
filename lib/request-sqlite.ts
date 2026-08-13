import crypto from "node:crypto";
import { getDb, inTransaction } from "./db";
import { classifyShowroomRequest, isReviewTransitionAllowed, RequestError, REQUEST_STATUSES, type PublicInterestInput } from "./request-domain";
import type { PublicRequestRecord, RequestRepository } from "./request-ports";
import { hasCapability } from "./capabilities";
import {
  likePattern,
  normalizePageRequest,
  pageResult,
  pageWindow,
  type PageResult,
} from "./pagination";
import type { RequestAttachment, RequestEvent, ServiceRequest, ServiceRequestStatus, SessionUser } from "./types";

export type OperationsRequest = ServiceRequest & {
  attachment_count: number;
  business_display_name: string | null;
  assigned_user_name: string | null;
};

export type RequestDetail = ServiceRequest & {
  attachments: RequestAttachment[];
  events: RequestEvent[];
  business_display_name?: string | null;
  assigned_user_name?: string | null;
};

export class SqliteRequestRepository implements RequestRepository {
  findPublicDuplicate(ipHash: string, idempotencyKey: string): PublicRequestRecord | undefined {
    const found = getDb().prepare("SELECT id,public_ref FROM service_requests WHERE submitter_kind='public' AND ip_hash=? AND idempotency_key=?").get(ipHash, idempotencyKey) as { id:number; public_ref:string } | undefined;
    return found ? { id: found.id, publicRef: found.public_ref } : undefined;
  }

  createPublicInterest(input: PublicInterestInput, ipHash: string): PublicRequestRecord {
    return inTransaction(() => {
      const publicRef = `REQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const result = getDb().prepare(`
        INSERT INTO service_requests(
          public_ref,request_type,status,contact_name,contact_value,business_name,
          request_text,submitter_kind,idempotency_key,ip_hash,notification_state
        ) VALUES(?,'onboarding','submitted',?,?,?,?, 'public',?,?,'not_required')
      `).run(publicRef, input.contactName, input.contactValue, input.businessName, input.requestText, input.idempotencyKey, ipHash);
      const id = Number(result.lastInsertRowid);
      getDb().prepare("INSERT INTO request_events(request_id,event_type,detail) VALUES(?,'submitted','public interest')").run(id);
      return { id, publicRef };
    });
  }
}

export function listOperationsRequests(limit = 100): OperationsRequest[] {
  return getDb().prepare(`
    SELECT r.*,COUNT(a.id) attachment_count,b.name business_display_name,u.name assigned_user_name
    FROM service_requests r
    LEFT JOIN request_attachments a ON a.request_id=r.id
    LEFT JOIN businesses b ON b.id=r.business_id
    LEFT JOIN users u ON u.id=r.assigned_user_id
    GROUP BY r.id
    ORDER BY r.created_at DESC,r.id DESC
    LIMIT ?
  `).all(Math.max(1, Math.min(100, limit))) as OperationsRequest[];
}

export function listClientRequests(user: SessionUser, limit = 100): OperationsRequest[] {
  if (user.access_role !== "client" || !user.business_id) return [];
  return getDb().prepare(`
    SELECT r.*,COUNT(a.id) attachment_count,b.name business_display_name,u.name assigned_user_name
    FROM service_requests r
    LEFT JOIN request_attachments a ON a.request_id=r.id
    LEFT JOIN businesses b ON b.id=r.business_id
    LEFT JOIN users u ON u.id=r.assigned_user_id
    WHERE r.business_id=? AND (r.represented_client_user_id=? OR r.submitted_by_user_id=?)
    GROUP BY r.id ORDER BY r.created_at DESC,r.id DESC LIMIT ?
  `).all(user.business_id, user.id, user.id, Math.max(1, Math.min(100, limit))) as OperationsRequest[];
}

export function listAssignedRequests(userId: number, limit = 100): OperationsRequest[] {
  return getDb().prepare(`
    SELECT r.*,COUNT(a.id) attachment_count,b.name business_display_name,u.name assigned_user_name
    FROM service_requests r
    LEFT JOIN request_attachments a ON a.request_id=r.id
    LEFT JOIN businesses b ON b.id=r.business_id
    LEFT JOIN users u ON u.id=r.assigned_user_id
    WHERE r.assigned_user_id=?
    GROUP BY r.id ORDER BY r.created_at DESC,r.id DESC LIMIT ?
  `).all(userId,Math.max(1,Math.min(100,limit))) as OperationsRequest[];
}

export function listRequestsPage(
  user: SessionUser,
  input: { page?: unknown; q?: unknown; status?: unknown; business?: unknown; project?: unknown },
): PageResult<OperationsRequest> {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const statuses = [...REQUEST_STATUSES];
  const status = statuses.includes(input.status as ServiceRequestStatus)
    ? String(input.status)
    : "";
  const params: Array<string | number | null> = [];
  let where = " WHERE 1=1";
  if (hasCapability(user, "operations:manage")) {
    // Managers operate across the queue.
  } else if (user.access_role === "client" && user.business_id) {
    where +=
      " AND r.business_id=? AND (r.represented_client_user_id=? OR r.submitted_by_user_id=?)";
    params.push(user.business_id, user.id, user.id);
  } else if (user.access_role === "team_member") {
    where += " AND r.assigned_user_id=?";
    params.push(user.id);
  } else {
    return pageResult([], 0, request);
  }
  const businessId = Number.parseInt(String(input.business ?? ""), 10);
  if (Number.isInteger(businessId) && businessId > 0 && user.access_role !== "client") {
    where += " AND r.business_id=?";
    params.push(businessId);
  }
  if (status) {
    where += " AND r.status=?";
    params.push(status);
  }
  if (input.project === "current") {
    where += " AND r.status IN ('submitted','under_review','needs_information','approved_for_work','in_progress','client_review','client_approved')";
  } else if (input.project === "history") {
    where += " AND r.status IN ('published','completed','rejected','cancelled')";
  }
  if (request.search) {
    const pattern = likePattern(request.search);
    where += ` AND (
      lower(r.public_ref) LIKE ? ESCAPE '\\'
      OR lower(r.contact_name) LIKE ? ESCAPE '\\'
      OR lower(COALESCE(r.business_name,'')) LIKE ? ESCAPE '\\'
      OR lower(COALESCE(b.name,'')) LIKE ? ESCAPE '\\'
      OR lower(COALESCE(u.name,'')) LIKE ? ESCAPE '\\'
    )`;
    params.push(pattern, pattern, pattern, pattern, pattern);
  }
  const from = `
    FROM service_requests r
    LEFT JOIN businesses b ON b.id=r.business_id
    LEFT JOIN users u ON u.id=r.assigned_user_id${where}`;
  const totalItems = Number(
    (
      getDb()
        .prepare(`SELECT COUNT(*) total ${from}`)
        .get(...params) as { total: number }
    ).total,
  );
  const window = pageWindow(totalItems, request);
  const items = getDb().prepare(`
    SELECT r.*,
      (SELECT COUNT(*) FROM request_attachments a WHERE a.request_id=r.id) attachment_count,
      b.name business_display_name,u.name assigned_user_name
    ${from}
    ORDER BY r.updated_at DESC,r.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, window.limit, window.offset) as OperationsRequest[];
  return pageResult(items, totalItems, request);
}

export function requestTypeForBusiness(businessId: number) {
  const state = getDb().prepare(`
    SELECT b.status,b.content_version contentVersion,
      (SELECT COUNT(*) FROM published_catalog_versions v WHERE v.business_id=b.id) retainedVersions
    FROM businesses b WHERE b.id=?
  `).get(businessId) as {status:"active"|"draft"|"suspended";contentVersion:number;retainedVersions:number}|undefined;
  if (!state) throw new RequestError("Business not found.",404);
  return classifyShowroomRequest(state);
}

export function canAccessRequest(user: SessionUser, request: Pick<ServiceRequest,"business_id"|"represented_client_user_id"|"assigned_user_id">) {
  if (hasCapability(user, "operations:manage")) return true;
  if (user.access_role === "client") return Boolean(user.business_id && request.business_id === user.business_id && request.represented_client_user_id === user.id);
  if (user.access_role === "team_member") return request.assigned_user_id === user.id;
  return false;
}

export function getRequestDetail(id: number): RequestDetail | undefined {
  const request = getDb().prepare(`
    SELECT r.*,b.name business_display_name,u.name assigned_user_name
    FROM service_requests r
    LEFT JOIN businesses b ON b.id=r.business_id
    LEFT JOIN users u ON u.id=r.assigned_user_id
    WHERE r.id=?
  `).get(id) as RequestDetail | undefined;
  if (!request) return undefined;
  request.attachments = getDb().prepare("SELECT * FROM request_attachments WHERE request_id=? ORDER BY id").all(id) as RequestAttachment[];
  request.events = getDb().prepare(`
    SELECT e.*,u.name actor_name,p.access_role actor_access_role
    FROM request_events e
    LEFT JOIN users u ON u.id=e.actor_user_id
    LEFT JOIN user_access_profiles p ON p.user_id=u.id
    WHERE e.request_id=? ORDER BY e.created_at,e.id
  `).all(id) as RequestEvent[];
  return request;
}

export function addRequestClarification(user: SessionUser, requestId: number, rawMessage: unknown) {
  const message = String(rawMessage ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (message.length < 1 || message.length > 2_000) throw new RequestError("Clarification messages must be 1–2,000 characters.");
  return inTransaction(() => {
    const request = getRequestDetail(requestId);
    if (!request || !canAccessRequest(user, request)) throw new RequestError("Request not found.",404);
    if (["published","completed","rejected","cancelled"].includes(request.status)) throw new RequestError("This request no longer accepts clarification messages.",409);
    const client = user.access_role === "client";
    let nextStatus = request.status;
    if (client && request.status === "needs_information") nextStatus = "under_review";
    if (!client && ["submitted","under_review","in_progress"].includes(request.status)) nextStatus = "needs_information";
    getDb().prepare("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)").run(requestId,user.id,client?"client_clarification":"staff_clarification",message);
    if (nextStatus !== request.status) getDb().prepare("UPDATE service_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(nextStatus,requestId);
    return { businessId:request.business_id, status:nextStatus, messageLength:message.length };
  });
}

export function getRequestAttachment(requestId: number, attachmentId: number) {
  return getDb().prepare("SELECT * FROM request_attachments WHERE id=? AND request_id=?").get(attachmentId, requestId) as RequestAttachment | undefined;
}

export function updateRequestStatus(id: number, status: ServiceRequestStatus, actorUserId: number) {
  return inTransaction(() => {
    const existing = getDb().prepare("SELECT id,business_id,status FROM service_requests WHERE id=?").get(id) as {id:number;business_id:number|null;status:ServiceRequestStatus}|undefined;
    if (!existing) return undefined;
    if (!isReviewTransitionAllowed(existing.status, status)) throw new RequestError("That request status transition is not available.");
    if (existing.status === status) return { businessId: existing.business_id };
    getDb().prepare("UPDATE service_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(status, id);
    getDb().prepare("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)").run(id, actorUserId, "status_changed", `${existing.status}->${status}`);
    return { businessId: existing.business_id };
  });
}
