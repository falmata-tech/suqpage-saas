import crypto from "node:crypto";
import { isBusinessCategoryKey, type BusinessCategoryKey } from "./business-categories";
import { getDb, inTransaction } from "./db";
import { curatedManifestForLegacyDesign } from "./showroom-manifests";

export class SignupError extends Error {
  constructor(message: string, public status = 400, public code = "invalid") {
    super(message);
  }
}

export type SignupIdentity = {
  providerUserId: string;
  email: string;
};

export type SignupInput = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  handle: string;
  businessCategory: BusinessCategoryKey;
  idempotencyKey: string;
};

const text = (value: unknown) => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const normalizeEmail = (value: unknown) => text(value).toLowerCase();
const normalizeHandle = (value: unknown) => text(value).normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function generatedHandle(businessName: string, providerUserId: string) {
  const base = normalizeHandle(businessName) || "business";
  const suffix = crypto.createHash("sha256").update(providerUserId).digest("hex").slice(0, 12);
  return `${base.slice(0, Math.max(3, 67 - suffix.length)).replace(/-+$/g, "")}-${suffix}`;
}

function managedIdentityPasswordSentinel() {
  return `!supabase-passwordless:${crypto.randomBytes(24).toString("base64url")}`;
}

export function parseSignupInput(raw: Record<string, unknown>, identity: SignupIdentity): SignupInput {
  const name = text(raw.name);
  const email = normalizeEmail(identity.email);
  const phone = text(raw.phone);
  const businessName = text(raw.businessName);
  const businessCategory = text(raw.businessCategory);
  const idempotencyKey = text(raw.idempotencyKey);
  const providerUserId = text(identity.providerUserId);
  const consent = raw.consent === true || raw.consent === "true" || raw.consent === "on" || raw.consent === "1";

  if (!/^[0-9a-f-]{32,64}$/i.test(providerUserId)) throw new SignupError("Your verified account session is invalid.", 401, "identity");
  if (name.length < 2 || name.length > 100) throw new SignupError("Enter your name using 2-100 characters.");
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SignupError("Your verified account needs a valid email address.", 401, "identity");
  if (phone.length < 5 || phone.length > 40) throw new SignupError("Enter a usable phone or WhatsApp number.");
  if (businessName.length < 2 || businessName.length > 120) throw new SignupError("Enter your business name using 2-120 characters.");
  if (!isBusinessCategoryKey(businessCategory)) throw new SignupError("Choose the category that best describes your work.");
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new SignupError("The setup session is invalid. Refresh and try again.");
  if (!consent) throw new SignupError("Agree to the Terms and Privacy Policy to continue.");
  return { name, email, phone, businessName, handle: generatedHandle(businessName, providerUserId), businessCategory, idempotencyKey };
}

export async function createPublicClientWorkspace(raw: Record<string, unknown>, identity: SignupIdentity) {
  const { postgresRuntimeEnabled, postgresRuntimeServices } = await import("./postgres-runtime-services");
  if (postgresRuntimeEnabled()) {
    const { createPostgresPublicClientWorkspace } = await import("./signup-postgres");
    return createPostgresPublicClientWorkspace(postgresRuntimeServices().runner, raw, identity);
  }
  const input = parseSignupInput(raw, identity);
  const db = getDb();

  try {
    return inTransaction(() => {
      const existingLink = db.prepare("SELECT user_id FROM auth_identity_links WHERE provider='supabase' AND provider_user_id=?").get(identity.providerUserId) as { user_id: number } | undefined;
      if (existingLink) throw new SignupError("This account already has an AfricMade workspace.", 409, "already_linked");
      if (db.prepare("SELECT 1 FROM users WHERE lower(email)=?").get(input.email)) {
        throw new SignupError("An account already uses this email. Contact support if you cannot access it.", 409, "email_conflict");
      }
      if (db.prepare("SELECT 1 FROM businesses WHERE lower(handle)=?").get(input.handle)) {
        throw new SignupError("A workspace address collision occurred. Try again.", 409, "handle_conflict");
      }

      const manifest = JSON.stringify(curatedManifestForLegacyDesign("novatech"));
      const businessResult = db.prepare(`
        INSERT INTO businesses(
          handle,name,design_key,design_manifest_json,status,site_title,
          contact_email,whatsapp
        ) VALUES(?,?,'composition',?,'draft',?,?,?)
      `).run(input.handle, input.businessName, manifest, input.businessName, input.email, input.phone);
      const businessId = Number(businessResult.lastInsertRowid);
      const userResult = db.prepare(`
        INSERT INTO users(
          email,password_hash,name,role,business_id,must_change_password,
          password_updated_at,created_at
        ) VALUES(?,?,?,'owner',?,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      `).run(input.email, managedIdentityPasswordSentinel(), input.name, businessId);
      const userId = Number(userResult.lastInsertRowid);
      db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
      db.prepare("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES(?,'supabase',?,?,?)").run(userId, identity.providerUserId, input.email, Date.now());
      const now = Date.now();
      db.prepare(`
        INSERT INTO business_onboarding_profiles(
          business_id,declared_category_key,idempotency_key,created_at,updated_at
        ) VALUES(?,?,?,?,?)
      `).run(businessId, input.businessCategory, input.idempotencyKey, now, now);
      return { userId, businessId };
    });
  } catch (error) {
    if (error instanceof SignupError) throw error;
    if (error instanceof Error && /users\.email|UNIQUE constraint failed: users\.email/i.test(error.message)) {
      throw new SignupError("An account already uses this email. Contact support if you cannot access it.", 409, "email_conflict");
    }
    if (error instanceof Error && /businesses\.handle|UNIQUE constraint failed: businesses\.handle/i.test(error.message)) {
      throw new SignupError("A workspace address collision occurred. Try again.", 409, "handle_conflict");
    }
    if (error instanceof Error && /auth_identity_links/i.test(error.message)) {
      throw new SignupError("This account already has an AfricMade workspace.", 409, "already_linked");
    }
    throw new SignupError("Your private workspace could not be created.", 500, "unexpected");
  }
}
