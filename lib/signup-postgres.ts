import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { SignupError, parseSignupInput } from "./signup";
import type { PostgresTransactionRunner } from "./postgres-runtime";
import { curatedManifestForLegacyDesign } from "./showroom-manifests";

function signupFailure(error: unknown): never {
  if (error instanceof SignupError) throw error;
  if (error instanceof Error && "code" in error && error.code === "23505") {
    const detail = `${error.message} ${"constraint" in error ? String(error.constraint || "") : ""}`.toLowerCase();
    if (detail.includes("email")) throw new SignupError("An account already uses this email. Sign in instead.", 409, "email_conflict");
    if (detail.includes("handle")) throw new SignupError("That showroom address is already in use. Choose another.", 409, "handle_conflict");
  }
  throw new SignupError("Your private workspace could not be created.", 500, "unexpected");
}

export async function createPostgresPublicClientWorkspace(
  runner: PostgresTransactionRunner,
  raw: Record<string, unknown>,
) {
  const input = parseSignupInput(raw);
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    return await runner.transaction(async () => {
      const existingEmail = await runner.query("SELECT 1 FROM users WHERE lower(email)=lower(?) LIMIT 1", [input.email]);
      if (existingEmail.rows.length) throw new SignupError("An account already uses this email. Sign in instead.", 409, "email_conflict");
      const existingHandle = await runner.query("SELECT 1 FROM businesses WHERE lower(handle)=lower(?) LIMIT 1", [input.handle]);
      if (existingHandle.rows.length) throw new SignupError("That showroom address is already in use. Choose another.", 409, "handle_conflict");
      const manifest = JSON.stringify(curatedManifestForLegacyDesign("novatech"));
      const business = await runner.query<{ id: number }>(
        "INSERT INTO businesses(handle,name,design_key,design_manifest_json,status,site_title,contact_email,whatsapp) VALUES(?,?,'composition',?,'draft',?,?,?) RETURNING id",
        [input.handle, input.businessName, manifest, input.businessName, input.email, input.phone],
      );
      const businessId = business.rows[0]?.id;
      if (!businessId) throw new Error("PostgreSQL did not return the created business identifier.");
      const user = await runner.query<{ id: number }>(
        "INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,password_updated_at,created_at) VALUES(?,?,?,'owner',?,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING id",
        [input.email, passwordHash, input.name, businessId],
      );
      const userId = user.rows[0]?.id;
      if (!userId) throw new Error("PostgreSQL did not return the created user identifier.");
      await runner.query("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')", [userId]);
      const publicRef = `REQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const request = await runner.query<{ id: number }>(
        "INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id,idempotency_key,notification_state) VALUES(?,?,?,'onboarding','submitted',?,?,?,?, 'client',?,?,'not_required') RETURNING id",
        [publicRef, businessId, userId, input.name, input.phone, input.businessName, input.requestText, userId, input.idempotencyKey],
      );
      const requestId = request.rows[0]?.id;
      if (!requestId) throw new Error("PostgreSQL did not return the onboarding request identifier.");
      await runner.query("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'self-service private onboarding')", [requestId, userId, "submitted"]);
      return { userId, businessId, requestId, publicRef };
    });
  } catch (error) {
    return signupFailure(error);
  }
}
