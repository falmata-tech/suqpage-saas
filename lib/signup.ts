import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { getDb, inTransaction } from "./db";
import { isStrongPassword } from "./passwords";
import { curatedManifestForLegacyDesign } from "./showroom-manifests";

export class SignupError extends Error {
  constructor(message: string, public status = 400, public code = "invalid") {
    super(message);
  }
}

type SignupInput = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  handle: string;
  password: string;
  requestText: string;
  idempotencyKey: string;
};

const text = (value: unknown) => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const normalizeEmail = (value: unknown) => text(value).toLowerCase();
const normalizeHandle = (value: unknown) => text(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function parseSignupInput(raw: Record<string, unknown>): SignupInput {
  const name = text(raw.name);
  const email = normalizeEmail(raw.email);
  const phone = text(raw.phone);
  const businessName = text(raw.businessName);
  const handle = normalizeHandle(raw.handle);
  const password = String(raw.password ?? "");
  const confirmPassword = String(raw.confirmPassword ?? "");
  const requestText = text(raw.requestText);
  const idempotencyKey = text(raw.idempotencyKey);
  const consent = raw.consent === true || raw.consent === "true" || raw.consent === "on" || raw.consent === "1";

  if (name.length < 2 || name.length > 100) throw new SignupError("Enter your name using 2–100 characters.");
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SignupError("Enter a valid email address.");
  if (phone.length < 5 || phone.length > 40) throw new SignupError("Enter a usable phone or WhatsApp number.");
  if (businessName.length < 2 || businessName.length > 120) throw new SignupError("Enter your business name using 2–120 characters.");
  if (handle.length < 3 || handle.length > 80) throw new SignupError("Choose a showroom address using at least 3 letters or numbers.");
  if (!isStrongPassword(password)) throw new SignupError("Use at least 12 characters with upper-case, lower-case, and a number.");
  if (password !== confirmPassword) throw new SignupError("Passwords do not match.");
  if (requestText.length < 20 || requestText.length > 4_000) throw new SignupError("Describe what you make and the showroom you need using 20–4,000 characters.");
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new SignupError("The signup session is invalid. Refresh and try again.");
  if (!consent) throw new SignupError("Confirm that MirtPage may use these details to create your private workspace.");
  return { name, email, phone, businessName, handle, password, requestText, idempotencyKey };
}

export function createPublicClientWorkspace(raw: Record<string, unknown>) {
  const input = parseSignupInput(raw);
  const db = getDb();
  if (db.prepare("SELECT 1 FROM users WHERE lower(email)=?").get(input.email)) {
    throw new SignupError("An account already uses this email. Sign in instead.", 409, "email_conflict");
  }
  if (db.prepare("SELECT 1 FROM businesses WHERE lower(handle)=?").get(input.handle)) {
    throw new SignupError("That showroom address is already in use. Choose another.", 409, "handle_conflict");
  }

  try {
    return inTransaction(() => {
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
      `).run(input.email, bcrypt.hashSync(input.password, 12), input.name, businessId);
      const userId = Number(userResult.lastInsertRowid);
      db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
      const publicRef = `REQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const requestResult = db.prepare(`
        INSERT INTO service_requests(
          public_ref,business_id,represented_client_user_id,request_type,status,
          contact_name,contact_value,business_name,request_text,submitter_kind,
          submitted_by_user_id,idempotency_key,notification_state
        ) VALUES(?,?,?,'onboarding','submitted',?,?,?,?, 'client',?,?,'not_required')
      `).run(publicRef, businessId, userId, input.name, input.phone, input.businessName, input.requestText, userId, input.idempotencyKey);
      const requestId = Number(requestResult.lastInsertRowid);
      db.prepare("INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'self-service private onboarding')").run(requestId, userId, "submitted");
      return { userId, businessId, requestId, publicRef };
    });
  } catch (error) {
    if (error instanceof SignupError) throw error;
    if (error instanceof Error && /users\.email|UNIQUE constraint failed: users\.email/i.test(error.message)) {
      throw new SignupError("An account already uses this email. Sign in instead.", 409, "email_conflict");
    }
    if (error instanceof Error && /businesses\.handle|UNIQUE constraint failed: businesses\.handle/i.test(error.message)) {
      throw new SignupError("That showroom address is already in use. Choose another.", 409, "handle_conflict");
    }
    throw new SignupError("Your private workspace could not be created.", 500, "unexpected");
  }
}
