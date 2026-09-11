import crypto from "node:crypto";
import { SignupError, parseSignupInput, type SignupIdentity } from "./signup";
import type { PostgresTransactionRunner } from "./postgres-runtime";
import { curatedManifestForLegacyDesign } from "./showroom-manifests";

function signupFailure(error: unknown): never {
  if (error instanceof SignupError) throw error;
  if (error instanceof Error && "code" in error && error.code === "23505") {
    const detail = `${error.message} ${"constraint" in error ? String(error.constraint || "") : ""}`.toLowerCase();
    if (detail.includes("provider_user_id") || detail.includes("auth_identity")) throw new SignupError("This account already has an AfricMade workspace.", 409, "already_linked");
    if (detail.includes("email")) throw new SignupError("An account already uses this email. Contact support if you cannot access it.", 409, "email_conflict");
    if (detail.includes("handle")) throw new SignupError("A workspace address collision occurred. Try again.", 409, "handle_conflict");
  }
  throw new SignupError("Your private workspace could not be created.", 500, "unexpected");
}

export async function createPostgresPublicClientWorkspace(
  runner: PostgresTransactionRunner,
  raw: Record<string, unknown>,
  identity: SignupIdentity,
) {
  const input = parseSignupInput(raw, identity);
  const passwordSentinel = `!supabase-passwordless:${crypto.randomBytes(24).toString("base64url")}`;
  try {
    return await runner.transaction(async () => {
      const existingLink = await runner.query("SELECT user_id FROM auth_identity_links WHERE provider='supabase' AND provider_user_id=? LIMIT 1", [identity.providerUserId]);
      if (existingLink.rows.length) throw new SignupError("This account already has an AfricMade workspace.", 409, "already_linked");
      const existingEmail = await runner.query("SELECT 1 FROM users WHERE lower(email)=lower(?) LIMIT 1", [input.email]);
      if (existingEmail.rows.length) throw new SignupError("An account already uses this email. Contact support if you cannot access it.", 409, "email_conflict");
      const existingHandle = await runner.query("SELECT 1 FROM businesses WHERE lower(handle)=lower(?) LIMIT 1", [input.handle]);
      if (existingHandle.rows.length) throw new SignupError("A workspace address collision occurred. Try again.", 409, "handle_conflict");
      const manifest = JSON.stringify(curatedManifestForLegacyDesign("novatech"));
      const business = await runner.query<{ id: number }>(
        "INSERT INTO businesses(handle,name,design_key,design_manifest_json,status,site_title,contact_email,whatsapp) VALUES(?,?,'composition',?,'draft',?,?,?) RETURNING id",
        [input.handle, input.businessName, manifest, input.businessName, input.email, input.phone],
      );
      const businessId = business.rows[0]?.id;
      if (!businessId) throw new Error("PostgreSQL did not return the created business identifier.");
      const user = await runner.query<{ id: number }>(
        "INSERT INTO users(email,password_hash,name,role,business_id,must_change_password,password_updated_at,created_at) VALUES(?,?,?,'owner',?,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING id",
        [input.email, passwordSentinel, input.name, businessId],
      );
      const userId = user.rows[0]?.id;
      if (!userId) throw new Error("PostgreSQL did not return the created user identifier.");
      await runner.query("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')", [userId]);
      await runner.query("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,?)", [userId, identity.providerUserId, input.email, Date.now()]);
      const now = Date.now();
      await runner.query(
        "INSERT INTO business_onboarding_profiles(business_id,declared_category_key,idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?)",
        [businessId, input.businessCategory, input.idempotencyKey, now, now],
      );
      return { userId, businessId };
    });
  } catch (error) {
    return signupFailure(error);
  }
}
