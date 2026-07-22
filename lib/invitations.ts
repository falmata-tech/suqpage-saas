import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { getDb, inTransaction } from "./db";
import { isStrongPassword } from "./passwords";
import type { ClientInvitation } from "./types";

export const INVITATION_LIFETIME_MS = 72 * 60 * 60 * 1000;
const DESIGNS = new Set(["alhaya", "usashopet", "novatech", "homevibe"]);

export class InvitationError extends Error {
  constructor(message: string, public code: "invalid" | "expired" | "replayed" | "conflict" = "invalid") {
    super(message);
  }
}

const clean = (value: unknown, max: number) => String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
const normalizeEmail = (value: unknown) => clean(value, 160).toLowerCase();
const normalizeHandle = (value: unknown) => clean(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const hashInvitationToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export type CreateInvitationInput = {
  requestId: number;
  clientName: string;
  email: string;
  businessName: string;
  handle: string;
  designKey: string;
  actorUserId: number;
};

export function createClientInvitation(raw: CreateInvitationInput, options: { now?: number; token?: string } = {}) {
  const requestId = Number(raw.requestId);
  const clientName = clean(raw.clientName, 100);
  const email = normalizeEmail(raw.email);
  const businessName = clean(raw.businessName, 120);
  const handle = normalizeHandle(raw.handle);
  const designKey = clean(raw.designKey, 40);
  if (!Number.isInteger(requestId) || !clientName || !businessName || !handle || !/^\S+@\S+\.\S+$/.test(email) || !DESIGNS.has(designKey)) {
    throw new InvitationError("Complete the client, business, handle, email, and design fields.");
  }
  const token = options.token || crypto.randomBytes(32).toString("base64url");
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) throw new InvitationError("Could not create a secure invitation.");
  const now = options.now ?? Date.now();
  const expiresAt = now + INVITATION_LIFETIME_MS;

  const result = inTransaction(() => {
    const request = getDb().prepare("SELECT id,request_type,submitter_kind,status,business_id FROM service_requests WHERE id=?").get(requestId) as { id:number; request_type:string; submitter_kind:string; status:string; business_id:number|null } | undefined;
    if (!request || request.request_type !== "onboarding" || request.submitter_kind !== "public" || !["submitted", "under_review", "needs_information", "approved_for_work"].includes(request.status)) {
      throw new InvitationError("This onboarding request is not available for invitation.", "conflict");
    }
    if (getDb().prepare("SELECT 1 FROM users WHERE lower(email)=lower(?)").get(email)) {
      throw new InvitationError("An account already uses that email.", "conflict");
    }
    let businessId = request.business_id;
    if (businessId) {
      const updated = getDb().prepare("UPDATE businesses SET handle=?,name=?,design_key=?,site_title=? WHERE id=? AND status='draft'").run(handle, businessName, designKey, businessName, businessId);
      if (updated.changes !== 1) throw new InvitationError("Only a draft business can receive a replacement invitation.", "conflict");
    } else {
      const inserted = getDb().prepare("INSERT INTO businesses(handle,name,design_key,status,site_title) VALUES(?,?,?,'draft',?)").run(handle, businessName, designKey, businessName);
      businessId = Number(inserted.lastInsertRowid);
    }
    getDb().prepare("UPDATE client_invitations SET revoked_at=? WHERE request_id=? AND accepted_at IS NULL AND revoked_at IS NULL").run(now, requestId);
    const invitation = getDb().prepare(`
      INSERT INTO client_invitations(request_id,business_id,email,name,token_hash,expires_at,created_by_user_id,created_at)
      VALUES(?,?,?,?,?,?,?,?)
    `).run(requestId, businessId, email, clientName, hashInvitationToken(token), expiresAt, raw.actorUserId, now);
    getDb().prepare("UPDATE service_requests SET business_id=?,status='approved_for_work',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(businessId, requestId);
    getDb().prepare("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'72-hour manual invitation created')").run(requestId, raw.actorUserId, "invitation_created");
    return { invitationId: Number(invitation.lastInsertRowid), businessId };
  });
  return { ...result, token, expiresAt };
}

export type InvitationView = Pick<ClientInvitation, "id" | "request_id" | "business_id" | "email" | "name" | "expires_at"> & { business_name:string };

export function getActiveInvitation(token: string, now = Date.now()): InvitationView | undefined {
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return undefined;
  return getDb().prepare(`
    SELECT i.id,i.request_id,i.business_id,i.email,i.name,i.expires_at,b.name business_name
    FROM client_invitations i JOIN businesses b ON b.id=i.business_id
    WHERE i.token_hash=? AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at>?
  `).get(hashInvitationToken(token), now) as InvitationView | undefined;
}

export function redeemClientInvitation(raw: { token:string; name:string; password:string }, now = Date.now()) {
  const token = String(raw.token || "");
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) throw new InvitationError("This invitation is not valid.");
  const name = clean(raw.name, 100);
  if (!name) throw new InvitationError("Enter your name.");
  if (!isStrongPassword(raw.password)) throw new InvitationError("Use at least 12 characters with upper-case, lower-case, and a number.");
  const tokenHash = hashInvitationToken(token);
  return inTransaction(() => {
    const invitation = getDb().prepare(`
      SELECT * FROM client_invitations WHERE token_hash=?
    `).get(tokenHash) as ClientInvitation | undefined;
    if (!invitation) throw new InvitationError("This invitation is not valid.");
    if (invitation.accepted_at !== null) throw new InvitationError("This invitation has already been used.", "replayed");
    if (invitation.revoked_at !== null) throw new InvitationError("This invitation was replaced or revoked.", "replayed");
    if (invitation.expires_at <= now) throw new InvitationError("This invitation has expired.", "expired");
    if (getDb().prepare("SELECT 1 FROM users WHERE lower(email)=lower(?)").get(invitation.email)) throw new InvitationError("An account already uses this invitation email.", "conflict");
    const inserted = getDb().prepare(`
      INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,password_updated_at,created_at)
      VALUES(?,?,?,'owner',?,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    `).run(invitation.email, bcrypt.hashSync(raw.password, 12), name, invitation.business_id);
    const userId = Number(inserted.lastInsertRowid);
    getDb().prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
    const accepted = getDb().prepare("UPDATE client_invitations SET accepted_at=?,accepted_user_id=? WHERE id=? AND accepted_at IS NULL AND revoked_at IS NULL").run(now, userId, invitation.id);
    if (accepted.changes !== 1) throw new InvitationError("This invitation is no longer available.", "replayed");
    getDb().prepare("UPDATE service_requests SET represented_client_user_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(userId, invitation.request_id);
    getDb().prepare("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'client account established')").run(invitation.request_id, userId, "invitation_accepted");
    return { userId, businessId: invitation.business_id, requestId: invitation.request_id };
  });
}
