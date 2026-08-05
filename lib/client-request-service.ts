import crypto from "node:crypto";
import { MAX_REQUEST_TEXT, RequestError } from "./request-domain";
import { runtimeRequestTypeForBusiness } from "./request-runtime";
import { runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import type { SessionUser } from "./types";

export async function createAuthenticatedClientRequest(user: SessionUser, formData: FormData) {
  if (user.access_role !== "client" || !user.business_id) throw new RequestError("Client workspace access is required.", 403);
  const requestType = await runtimeRequestTypeForBusiness(user.business_id);
  const requestText = String(formData.get("requestText") || "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  const idempotencyKey = String(formData.get("idempotencyKey") || "").trim();
  if (requestText.length < 10 || requestText.length > MAX_REQUEST_TEXT) throw new RequestError(`Describe the request in 10–${MAX_REQUEST_TEXT.toLocaleString("en-US")} characters.`);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new RequestError("The request session is invalid. Refresh and try again.");
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length) throw new RequestError("Add images from the labeled checklist after the showroom design is imported.");
  const duplicate = await runtimeGet<{id:number;public_ref:string}>("SELECT id,public_ref FROM service_requests WHERE submitted_by_user_id=? AND submitter_kind='client' AND idempotency_key=?", [user.id, idempotencyKey]);
  if (duplicate) return { id:duplicate.id, publicRef:duplicate.public_ref, duplicate:true };

  try {
    const created = await runtimeTransaction(async () => {
      const publicRef = `REQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const result = await runtimeGet<{ id: number }>(`
        INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id,idempotency_key,notification_state)
        SELECT ?,b.id,u.id,?,'submitted',u.name,u.email,b.name,?,'client',u.id,?,'not_required'
        FROM businesses b JOIN users u ON u.business_id=b.id
        JOIN user_access_profiles p ON p.user_id=u.id AND p.access_role='client'
        WHERE b.id=? AND u.id=? RETURNING id
      `, [publicRef, requestType, requestText, idempotencyKey, user.business_id, user.id]);
      if (!result) throw new RequestError("The client account is no longer linked to this business.", 403);
      const requestId = Number(result.id);
      await runtimeRun("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'authenticated client request')", [requestId, user.id, "submitted"]);
      return { id:requestId, publicRef, duplicate:false };
    });
    return created;
  } catch (error) {
    const afterRace = await runtimeGet<{id:number;public_ref:string}>("SELECT id,public_ref FROM service_requests WHERE submitted_by_user_id=? AND submitter_kind='client' AND idempotency_key=?", [user.id, idempotencyKey]);
    if (afterRace) return { id:afterRace.id, publicRef:afterRace.public_ref, duplicate:true };
    if (error instanceof RequestError) throw error;
    throw new RequestError("The request could not be saved.", 500);
  }
}
