import crypto from "node:crypto";
import { getDb, inTransaction } from "./db";
import { FileRequestAttachmentStore } from "./request-media";
import { MAX_REQUEST_IMAGES, MAX_REQUEST_TEXT, RequestError } from "./request-domain";
import type { StoredRequestImage } from "./request-ports";
import type { ServiceRequestType, SessionUser } from "./types";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function createAuthenticatedClientRequest(user: SessionUser, formData: FormData) {
  if (user.access_role !== "client" || !user.business_id) throw new RequestError("Client workspace access is required.", 403);
  const requestType = String(formData.get("requestType") || "change") as ServiceRequestType;
  const requestText = String(formData.get("requestText") || "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  const idempotencyKey = String(formData.get("idempotencyKey") || "").trim();
  if (!new Set<ServiceRequestType>(["onboarding", "change"]).has(requestType)) throw new RequestError("Choose a valid request type.");
  if (requestText.length < 10 || requestText.length > MAX_REQUEST_TEXT) throw new RequestError(`Describe the request in 10–${MAX_REQUEST_TEXT.toLocaleString("en-US")} characters.`);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new RequestError("The request session is invalid. Refresh and try again.");
  const duplicate = getDb().prepare("SELECT id,public_ref FROM service_requests WHERE submitted_by_user_id=? AND submitter_kind='client' AND idempotency_key=?").get(user.id, idempotencyKey) as {id:number;public_ref:string}|undefined;
  if (duplicate) return { id:duplicate.id, publicRef:duplicate.public_ref, duplicate:true };

  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > MAX_REQUEST_IMAGES) throw new RequestError(`Attach no more than ${MAX_REQUEST_IMAGES} images.`, 413);
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) throw new RequestError(`${file.name || "An image"} is larger than 5 MB.`, 413);
    if (!allowedTypes.has(file.type)) throw new RequestError("Only JPEG, PNG, and WebP images are accepted.");
  }

  const storage = new FileRequestAttachmentStore();
  const stored: StoredRequestImage[] = [];
  try {
    for (const file of files) stored.push(await storage.save({ originalName:file.name, claimedType:file.type, bytes:Buffer.from(await file.arrayBuffer()) }));
    const created = inTransaction(() => {
      const publicRef = `REQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const result = getDb().prepare(`
        INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id,idempotency_key,notification_state)
        SELECT ?,b.id,u.id,?,'submitted',u.name,u.email,b.name,?,'client',u.id,?,'not_required'
        FROM businesses b JOIN users u ON u.business_id=b.id
        JOIN user_access_profiles p ON p.user_id=u.id AND p.access_role='client'
        WHERE b.id=? AND u.id=?
      `).run(publicRef, requestType, requestText, idempotencyKey, user.business_id, user.id);
      if (result.changes !== 1) throw new RequestError("The client account is no longer linked to this business.", 403);
      const requestId = Number(result.lastInsertRowid);
      const insertAttachment = getDb().prepare("INSERT INTO request_attachments(request_id,storage_key,original_name,mime_type,byte_size,width,height) VALUES(?,?,?,?,?,?,?)");
      for (const image of stored) insertAttachment.run(requestId, image.storageKey, image.originalName, image.mime, image.buffer.byteLength, image.width, image.height);
      getDb().prepare("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'authenticated client request')").run(requestId, user.id, "submitted");
      return { id:requestId, publicRef, duplicate:false };
    });
    return created;
  } catch (error) {
    storage.remove(stored.map((image) => image.storageKey));
    const afterRace = getDb().prepare("SELECT id,public_ref FROM service_requests WHERE submitted_by_user_id=? AND submitter_kind='client' AND idempotency_key=?").get(user.id, idempotencyKey) as {id:number;public_ref:string}|undefined;
    if (afterRace) return { id:afterRace.id, publicRef:afterRace.public_ref, duplicate:true };
    if (error instanceof RequestError) throw error;
    throw new RequestError("The request could not be saved.", 500);
  }
}
