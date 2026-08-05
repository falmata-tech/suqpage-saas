import crypto from "node:crypto";
import { hasCapability } from "./capabilities";
import { pageResult, pageWindow, normalizePageRequest, likePattern, type PageResult } from "./pagination";
import type { PostgresTransactionRunner } from "./postgres-runtime";
import { classifyShowroomRequest, isReviewTransitionAllowed, RequestError, REQUEST_STATUSES, type PublicInterestInput } from "./request-domain";
import type { PublicRequestRecord } from "./request-ports";
import type { RequestAttachment, RequestEvent, ServiceRequest, ServiceRequestStatus, SessionUser } from "./types";

export type OperationsRequest = ServiceRequest & { attachment_count: number; business_display_name: string | null; assigned_user_name: string | null };
export type RequestDetail = ServiceRequest & { attachments: RequestAttachment[]; events: RequestEvent[]; business_display_name?: string | null; assigned_user_name?: string | null };

export class PostgresRequestRepository {
  constructor(private readonly runner: PostgresTransactionRunner) {}

  async findPublicDuplicate(ipHash: string, idempotencyKey: string): Promise<PublicRequestRecord | undefined> {
    const row = (await this.runner.query<{ id: number; public_ref: string }>("SELECT id,public_ref FROM service_requests WHERE submitter_kind='public' AND ip_hash=? AND idempotency_key=?", [ipHash, idempotencyKey])).rows[0];
    return row ? { id: row.id, publicRef: row.public_ref } : undefined;
  }

  async createPublicInterest(input: PublicInterestInput, ipHash: string): Promise<PublicRequestRecord> {
    return this.runner.transaction(async () => {
      const duplicate = await this.findPublicDuplicate(ipHash, input.idempotencyKey);
      if (duplicate) return duplicate;
      const publicRef = `REQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      try {
        const row = await this.runner.query<{ id: number }>("INSERT INTO service_requests(public_ref,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,idempotency_key,ip_hash,notification_state) VALUES(?,'onboarding','submitted',?,?,?,?, 'public',?,?,'not_required') RETURNING id", [publicRef, input.contactName, input.contactValue, input.businessName, input.requestText, input.idempotencyKey, ipHash]);
        const id = row.rows[0]?.id;
        if (!id) throw new Error("PostgreSQL did not return the public request identifier.");
        await this.runner.query("INSERT INTO request_events(request_id,event_type,detail) VALUES(?,'submitted','public interest')", [id]);
        return { id, publicRef };
      } catch (error) {
        if (!(error instanceof Error) || !("code" in error) || error.code !== "23505") throw error;
        const raced = await this.findPublicDuplicate(ipHash, input.idempotencyKey);
        if (!raced) throw error;
        return raced;
      }
    });
  }

  async listRequestsPage(user: SessionUser, input: { page?: unknown; q?: unknown; status?: unknown }): Promise<PageResult<OperationsRequest>> {
    const request = normalizePageRequest({ page: input.page, search: input.q });
    const status = REQUEST_STATUSES.has(input.status as ServiceRequestStatus) ? String(input.status) : "";
    const params: Array<string | number | null> = [];
    let where = " WHERE 1=1";
    if (hasCapability(user, "operations:manage")) {
      // Platform managers may see the complete queue.
    } else if (user.access_role === "client" && user.business_id) {
      where += " AND r.business_id=? AND (r.represented_client_user_id=? OR r.submitted_by_user_id=?)";
      params.push(user.business_id, user.id, user.id);
    } else if (user.access_role === "team_member") {
      where += " AND r.assigned_user_id=?";
      params.push(user.id);
    } else return pageResult([], 0, request);
    if (status) { where += " AND r.status=?"; params.push(status); }
    if (request.search) {
      const pattern = likePattern(request.search);
      where += " AND (lower(r.public_ref) LIKE ? ESCAPE '\\' OR lower(r.contact_name) LIKE ? ESCAPE '\\' OR lower(COALESCE(r.business_name,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(b.name,'')) LIKE ? ESCAPE '\\' OR lower(COALESCE(u.name,'')) LIKE ? ESCAPE '\\')";
      params.push(pattern, pattern, pattern, pattern, pattern);
    }
    const from = ` FROM service_requests r LEFT JOIN businesses b ON b.id=r.business_id LEFT JOIN users u ON u.id=r.assigned_user_id${where}`;
    const total = (await this.runner.query<{ total: number }>(`SELECT COUNT(*)::int total${from}`, params)).rows[0]?.total || 0;
    const window = pageWindow(total, request);
    const items = (await this.runner.query<OperationsRequest>(`SELECT r.*,(SELECT COUNT(*)::int FROM request_attachments a WHERE a.request_id=r.id) attachment_count,b.name business_display_name,u.name assigned_user_name${from} ORDER BY r.updated_at DESC,r.id DESC LIMIT ? OFFSET ?`, [...params, window.limit, window.offset])).rows;
    return pageResult(items, total, request);
  }

  async requestTypeForBusiness(businessId: number) {
    const state = (await this.runner.query<{ status: "active" | "draft" | "suspended"; contentversion: number; retainedversions: number }>("SELECT b.status,b.content_version contentVersion,(SELECT COUNT(*)::int FROM published_catalog_versions v WHERE v.business_id=b.id) retainedVersions FROM businesses b WHERE b.id=?", [businessId])).rows[0];
    if (!state) throw new RequestError("Business not found.", 404);
    return classifyShowroomRequest({ status: state.status, contentVersion: state.contentversion, retainedVersions: state.retainedversions });
  }

  canAccessRequest(user: SessionUser, request: Pick<ServiceRequest, "business_id" | "represented_client_user_id" | "assigned_user_id">) {
    if (hasCapability(user, "operations:manage")) return true;
    if (user.access_role === "client") return Boolean(user.business_id && request.business_id === user.business_id && request.represented_client_user_id === user.id);
    return user.access_role === "team_member" && request.assigned_user_id === user.id;
  }

  async getRequestDetail(id: number): Promise<RequestDetail | undefined> {
    const request = (await this.runner.query<RequestDetail>("SELECT r.*,b.name business_display_name,u.name assigned_user_name FROM service_requests r LEFT JOIN businesses b ON b.id=r.business_id LEFT JOIN users u ON u.id=r.assigned_user_id WHERE r.id=?", [id])).rows[0];
    if (!request) return undefined;
    request.attachments = (await this.runner.query<RequestAttachment>("SELECT * FROM request_attachments WHERE request_id=? ORDER BY id", [id])).rows;
    request.events = (await this.runner.query<RequestEvent>("SELECT e.*,u.name actor_name,p.access_role actor_access_role FROM request_events e LEFT JOIN users u ON u.id=e.actor_user_id LEFT JOIN user_access_profiles p ON p.user_id=u.id WHERE e.request_id=? ORDER BY e.created_at,e.id", [id])).rows;
    return request;
  }

  async getRequestAttachment(requestId: number, attachmentId: number) {
    return (await this.runner.query<RequestAttachment>(
      "SELECT * FROM request_attachments WHERE id=? AND request_id=?",
      [attachmentId, requestId],
    )).rows[0];
  }

  async addClarification(user: SessionUser, requestId: number, rawMessage: unknown) {
    const message = String(rawMessage ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    if (!message || message.length > 2_000) throw new RequestError("Clarification messages must be 1–2,000 characters.");
    return this.runner.transaction(async () => {
      const request = await this.getRequestDetail(requestId);
      if (!request || !this.canAccessRequest(user, request)) throw new RequestError("Request not found.", 404);
      if (["published", "completed", "rejected", "cancelled"].includes(request.status)) throw new RequestError("This request no longer accepts clarification messages.", 409);
      const client = user.access_role === "client";
      const next = client && request.status === "needs_information" ? "under_review" : !client && ["submitted", "under_review", "in_progress"].includes(request.status) ? "needs_information" : request.status;
      await this.runner.query("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)", [requestId, user.id, client ? "client_clarification" : "staff_clarification", message]);
      if (next !== request.status) await this.runner.query("UPDATE service_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [next, requestId]);
      return { businessId: request.business_id, status: next, messageLength: message.length };
    });
  }

  async updateStatus(id: number, status: ServiceRequestStatus, actorUserId: number) {
    return this.runner.transaction(async () => {
      const existing = (await this.runner.query<{ id: number; business_id: number | null; status: ServiceRequestStatus }>("SELECT id,business_id,status FROM service_requests WHERE id=? FOR UPDATE", [id])).rows[0];
      if (!existing) return undefined;
      if (!isReviewTransitionAllowed(existing.status, status)) throw new RequestError("That request status transition is not available.");
      if (existing.status !== status) {
        await this.runner.query("UPDATE service_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [status, id]);
        await this.runner.query("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)", [id, actorUserId, "status_changed", `${existing.status}->${status}`]);
      }
      return { businessId: existing.business_id };
    });
  }
}
