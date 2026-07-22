import crypto from "node:crypto";
import { getDb, inTransaction } from "./db";
import { isReviewTransitionAllowed, RequestError, type PublicInterestInput } from "./request-domain";
import type { PublicRequestRecord, RequestRepository } from "./request-ports";
import { hasCapability } from "./capabilities";
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
  request.events = getDb().prepare("SELECT * FROM request_events WHERE request_id=? ORDER BY created_at,id").all(id) as RequestEvent[];
  return request;
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
