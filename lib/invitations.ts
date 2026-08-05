import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { isStrongPassword } from "./passwords";
import { runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import {
  curatedManifestForLegacyDesign,
  isLegacyShowroomDesignKey,
} from "./showroom-manifests";
import type { ClientInvitation } from "./types";

export const INVITATION_LIFETIME_MS = 72 * 60 * 60 * 1000;

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
  requestId: number | null;
  clientName: string;
  email: string;
  businessName: string;
  handle: string;
  designKey: string;
  actorUserId: number;
};

export async function createClientInvitation(raw: CreateInvitationInput, options: { now?: number; token?: string } = {}) {
  const requestId = raw.requestId === null ? null : Number(raw.requestId);
  const clientName = clean(raw.clientName, 100);
  const email = normalizeEmail(raw.email);
  const businessName = clean(raw.businessName, 120);
  const handle = normalizeHandle(raw.handle);
  const designKey = clean(raw.designKey, 40);
  if ((requestId !== null && !Number.isInteger(requestId)) || !clientName || !businessName || !handle || !/^\S+@\S+\.\S+$/.test(email) || !isLegacyShowroomDesignKey(designKey)) {
    throw new InvitationError("Complete the client, business, handle, email, and design fields.");
  }
  const designManifestJson = JSON.stringify(
    curatedManifestForLegacyDesign(designKey),
  );
  const token = options.token || crypto.randomBytes(32).toString("base64url");
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) throw new InvitationError("Could not create a secure invitation.");
  const now = options.now ?? Date.now();
  const expiresAt = now + INVITATION_LIFETIME_MS;

  const result = await runtimeTransaction(async () => {
    if (await runtimeGet("SELECT 1 FROM users WHERE lower(email)=lower(?)", [email])) {
      throw new InvitationError("An account already uses that email.", "conflict");
    }
    const request = requestId === null ? undefined : await runtimeGet<{ id:number; request_type:string; submitter_kind:string; status:string; business_id:number|null; represented_client_user_id:number|null }>("SELECT id,request_type,submitter_kind,status,business_id,represented_client_user_id FROM service_requests WHERE id=?", [requestId]);
    if (requestId !== null && (!request || request.request_type !== "onboarding" || !["public","manager"].includes(request.submitter_kind) || request.represented_client_user_id || !["submitted", "under_review", "needs_information", "approved_for_work"].includes(request.status))) {
      throw new InvitationError("This onboarding request is not available for invitation.", "conflict");
    }
    let businessId = request?.business_id ?? null;
    if (businessId) {
      const updated = await runtimeRun("UPDATE businesses SET handle=?,name=?,design_key='composition',design_manifest_json=?,site_title=? WHERE id=? AND status='draft'", [handle, businessName, designManifestJson, businessName, businessId]);
      if (updated.changes !== 1) throw new InvitationError("Only a draft business can receive a replacement invitation.", "conflict");
    } else {
      const inserted = await runtimeGet<{ id: number }>("INSERT INTO businesses(handle,name,design_key,design_manifest_json,status,site_title) VALUES(?,?,'composition',?,'draft',?) RETURNING id", [handle, businessName, designManifestJson, businessName]);
      businessId = Number(inserted!.id);
    }
    await runtimeRun("UPDATE client_invitations SET revoked_at=? WHERE business_id=? AND accepted_at IS NULL AND revoked_at IS NULL", [now, businessId]);
    const invitation = await runtimeGet<{ id: number }>(`
      INSERT INTO client_invitations(request_id,business_id,email,name,token_hash,expires_at,created_by_user_id,created_at)
      VALUES(?,?,?,?,?,?,?,?) RETURNING id
    `, [requestId, businessId, email, clientName, hashInvitationToken(token), expiresAt, raw.actorUserId, now]);
    if (requestId !== null) {
      await runtimeRun("UPDATE service_requests SET business_id=?,status='approved_for_work',updated_at=CURRENT_TIMESTAMP WHERE id=?", [businessId, requestId]);
      await runtimeRun("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'72-hour manual invitation created')", [requestId, raw.actorUserId, "invitation_created"]);
    }
    return { invitationId: Number(invitation!.id), businessId };
  });
  return { ...result, token, expiresAt };
}

export type InvitationView = Pick<ClientInvitation, "id" | "request_id" | "business_id" | "email" | "name" | "expires_at"> & { business_name:string };

export async function getActiveInvitation(token: string, now = Date.now()): Promise<InvitationView | undefined> {
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return undefined;
  return runtimeGet<InvitationView>(`
    SELECT i.id,i.request_id,i.business_id,i.email,i.name,i.expires_at,b.name business_name
    FROM client_invitations i JOIN businesses b ON b.id=i.business_id
    WHERE i.token_hash=? AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at>?
  `, [hashInvitationToken(token), now]);
}

export async function redeemClientInvitation(raw: { token:string; name:string; password:string }, now = Date.now()) {
  const token = String(raw.token || "");
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) throw new InvitationError("This invitation is not valid.");
  const name = clean(raw.name, 100);
  if (!name) throw new InvitationError("Enter your name.");
  if (!isStrongPassword(raw.password)) throw new InvitationError("Use at least 12 characters with upper-case, lower-case, and a number.");
  const tokenHash = hashInvitationToken(token);
  if (!(await getActiveInvitation(token, now))) {
    throw new InvitationError("This invitation is invalid, expired, or already used.");
  }
  const passwordHash = await bcrypt.hash(raw.password, 12);
  return runtimeTransaction(async () => {
    const invitation = await runtimeGet<ClientInvitation>(`
      SELECT * FROM client_invitations WHERE token_hash=?
    `, [tokenHash]);
    if (!invitation) throw new InvitationError("This invitation is not valid.");
    if (invitation.accepted_at !== null) throw new InvitationError("This invitation has already been used.", "replayed");
    if (invitation.revoked_at !== null) throw new InvitationError("This invitation was replaced or revoked.", "replayed");
    if (invitation.expires_at <= now) throw new InvitationError("This invitation has expired.", "expired");
    if (await runtimeGet("SELECT 1 FROM users WHERE lower(email)=lower(?)", [invitation.email])) throw new InvitationError("An account already uses this invitation email.", "conflict");
    const inserted = await runtimeGet<{ id: number }>(`
      INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,password_updated_at,created_at)
      VALUES(?,?,?,'owner',?,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING id
    `, [invitation.email, passwordHash, name, invitation.business_id]);
    const userId = Number(inserted!.id);
    await runtimeRun("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')", [userId]);
    const accepted = await runtimeRun("UPDATE client_invitations SET accepted_at=?,accepted_user_id=? WHERE id=? AND accepted_at IS NULL AND revoked_at IS NULL", [now, userId, invitation.id]);
    if (accepted.changes !== 1) throw new InvitationError("This invitation is no longer available.", "replayed");
    if (invitation.request_id !== null) {
      await runtimeRun("UPDATE service_requests SET represented_client_user_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [userId, invitation.request_id]);
      await runtimeRun("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'client account established')", [invitation.request_id, userId, "invitation_accepted"]);
    }
    return { userId, businessId: invitation.business_id, requestId: invitation.request_id };
  });
}
