import crypto from "node:crypto";
import { hasCapability } from "./capabilities";
import { MAX_REQUEST_TEXT, RequestError } from "./request-domain";
import { runtimeCurrentShowroomProject, runtimeRequestTypeForBusiness } from "./request-runtime";
import { runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import type { ServiceRequestType, SessionUser } from "./types";

const clean = (value: unknown, max: number) => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);

export async function createOnBehalfRequest(user: SessionUser, formData: FormData) {
  if (!hasCapability(user, "operations:manage")) throw new RequestError("Operations manager access is required.", 403);
  const clientUserId = Number.parseInt(clean(formData.get("clientUserId"), 20), 10) || null;
  const selectedBusinessId = Number.parseInt(clean(formData.get("businessId"), 20), 10) || null;
  const requestText = clean(formData.get("requestText"), MAX_REQUEST_TEXT + 1);
  const idempotencyKey = clean(formData.get("idempotencyKey"), 100);
  if (requestText.length < 10 || requestText.length > MAX_REQUEST_TEXT) throw new RequestError(`Describe the request in 10–${MAX_REQUEST_TEXT.toLocaleString("en-US")} characters.`);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new RequestError("The request session is invalid. Refresh and try again.");
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length) throw new RequestError("Add images from the labeled checklist after the showroom design is imported.");
  const duplicate = await runtimeGet<{id:number;public_ref:string}>("SELECT id,public_ref FROM service_requests WHERE submitted_by_user_id=? AND submitter_kind='manager' AND idempotency_key=?", [user.id,idempotencyKey]);
  if (duplicate) return { id:duplicate.id, publicRef:duplicate.public_ref, duplicate:true, existingProject:false };

  let representedClientUserId: number | null = null;
  let businessId: number | null = null;
  let contactName: string;
  let contactValue: string;
  let businessName: string;
  let requestType: ServiceRequestType = "onboarding";
  if (clientUserId) {
    const client = await runtimeGet<{id:number;name:string;email:string;business_id:number;business_name:string}>(`
      SELECT u.id,u.name,u.email,u.business_id,b.name business_name
      FROM users u JOIN user_access_profiles p ON p.user_id=u.id
      JOIN businesses b ON b.id=u.business_id
      WHERE u.id=? AND p.access_role='client'
    `, [clientUserId]);
    if (!client) throw new RequestError("Choose a valid managed client.");
    representedClientUserId = client.id;
    businessId = client.business_id;
    requestType = await runtimeRequestTypeForBusiness(client.business_id);
    contactName = client.name;
    contactValue = client.email;
    businessName = client.business_name;
  } else if (selectedBusinessId) {
    const business = await runtimeGet<{ id: number; name: string; handle: string; contact_email: string }>(
      "SELECT id,name,handle,contact_email FROM businesses WHERE id=?",
      [selectedBusinessId],
    );
    if (!business) throw new RequestError("Choose a valid managed business.");
    businessId = business.id;
    requestType = await runtimeRequestTypeForBusiness(business.id);
    contactName = business.name;
    contactValue = business.contact_email || `@${business.handle}`;
    businessName = business.name;
  } else {
    contactName = clean(formData.get("contactName"), 100);
    contactValue = clean(formData.get("contactValue"), 160);
    businessName = clean(formData.get("businessName"), 120);
    if (contactName.length < 2 || contactValue.length < 5 || !businessName) throw new RequestError("Prospect name, contact, and business name are required.");
  }

  try {
    return await runtimeTransaction(async () => {
      if (businessId) {
        const current = await runtimeCurrentShowroomProject(businessId);
        if (current) {
          return { id:current.id, publicRef:current.public_ref, duplicate:false, existingProject:true };
        }
      }
      const publicRef = `REQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const inserted = await runtimeGet<{ id: number }>(`
        INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id,idempotency_key,notification_state)
        VALUES(?,?,?,?,'submitted',?,?,?,?, 'manager',?,?,'not_required') RETURNING id
      `, [publicRef,businessId,representedClientUserId,requestType,contactName,contactValue,businessName,requestText,user.id,idempotencyKey]);
      const requestId = Number(inserted!.id);
      await runtimeRun("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'MirtPage submitted on behalf')", [requestId,user.id,"submitted"]);
      return { id:requestId, publicRef, duplicate:false, existingProject:false };
    });
  } catch (error) {
    const afterRace = await runtimeGet<{id:number;public_ref:string}>("SELECT id,public_ref FROM service_requests WHERE submitted_by_user_id=? AND submitter_kind='manager' AND idempotency_key=?", [user.id,idempotencyKey]);
    if (afterRace) return { id:afterRace.id, publicRef:afterRace.public_ref, duplicate:true, existingProject:false };
    if (businessId) {
      const current = await runtimeCurrentShowroomProject(businessId);
      if (current) return { id:current.id, publicRef:current.public_ref, duplicate:false, existingProject:true };
    }
    if (error instanceof RequestError) throw error;
    throw new RequestError("The on-behalf request could not be saved.", 500);
  }
}
