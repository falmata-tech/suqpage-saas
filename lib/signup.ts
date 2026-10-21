import {findKnownPlace} from './place-catalog';
import type {KnownPlace} from './place-search';
import { parseAccentColor } from "./storefront-accent";
import { parseBusinessHandle } from "./business-handle";
import { parseAccountPhone } from "./account-contacts";
import crypto from "node:crypto";
import { isBusinessCategoryKey, type BusinessCategoryKey } from "./business-categories";

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
  place: KnownPlace;
  accentColor?: string;
  idempotencyKey: string;
};

const text = (value: unknown) => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
const normalizeEmail = (value: unknown) => text(value).toLowerCase();
const normalizeHandle = (value: unknown) => text(value).normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function generatedHandle(businessName: string, providerUserId: string) {
  const base = normalizeHandle(businessName) || "business";
  const suffix = crypto.createHash("sha256").update(providerUserId).digest("hex").slice(0, 12);
  return `${base.slice(0, Math.max(3, 59 - suffix.length)).replace(/-+$/g, "")}-${suffix}`;
}


export function parseSignupInput(raw: Record<string, unknown>, identity: SignupIdentity): SignupInput {
  const name = text(raw.name);
  const email = normalizeEmail(identity.email);
  let phone: string;
  try { phone = parseAccountPhone(raw.phone); } catch { throw new SignupError("Enter your account phone with + and its country code."); }
  const businessName = text(raw.businessName);
  const businessCategory = text(raw.businessCategory);
  const idempotencyKey = text(raw.idempotencyKey);
  const place = typeof raw.placeId === 'string' && raw.placeId.length <= 80 ? findKnownPlace(raw.placeId) : null;
  const providerUserId = text(identity.providerUserId);
  const consent = raw.consent === true || raw.consent === "true" || raw.consent === "on" || raw.consent === "1";

  if (!/^[0-9a-f-]{32,64}$/i.test(providerUserId)) throw new SignupError("Your verified account session is invalid.", 401, "identity");
  if (name.length < 2 || name.length > 100) throw new SignupError("Enter your name using 2-100 characters.");
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SignupError("Your verified account needs a valid email address.", 401, "identity");
  if (!phone) throw new SignupError("Enter your private account phone.");
  if (businessName.length < 2 || businessName.length > 120) throw new SignupError("Enter your business name using 2-120 characters.");
  if (!isBusinessCategoryKey(businessCategory)) throw new SignupError("Choose the category that best describes your work.");
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new SignupError("The setup session is invalid. Refresh and try again.");
  if (!place) throw new SignupError("Choose your business city from the results.", 400, "city_required");
  if (raw.countryCode !== undefined && raw.countryCode !== place.countryCode) throw new SignupError("Choose a city in the selected country.", 400, "country_mismatch");
  if (!consent) throw new SignupError("Agree to the Terms and Privacy Policy to continue.");
  let handle = generatedHandle(businessName, providerUserId);
  if (Object.hasOwn(raw, "handle")) {
    try { handle = parseBusinessHandle(raw.handle); }
    catch (error) { throw new SignupError(error instanceof Error ? error.message : "Enter a page handle."); }
  }
  let accentColor: string;
  try { accentColor = parseAccentColor(raw.accentColor); }
  catch (error) { throw new SignupError((error as Error).message); }
  return { name, email, phone, businessName, handle, businessCategory, place, idempotencyKey, ...(accentColor ? { accentColor } : {}) };
}

export async function createPublicClientWorkspace(raw: Record<string, unknown>, identity: SignupIdentity) {
  const { postgresRuntimeServices } = await import("./postgres-runtime-services");
  const { createPostgresPublicClientWorkspace } = await import("./signup-postgres");
  return createPostgresPublicClientWorkspace(postgresRuntimeServices().runner, raw, identity);
}
