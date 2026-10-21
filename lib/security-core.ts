import crypto from "node:crypto";

function privacySalt() {
  const value = process.env.PRIVACY_SALT;
  if (process.env.NODE_ENV === "production" && (!value || value.length < 24)) {
    throw new Error("PRIVACY_SALT must be at least 24 characters in production.");
  }
  return value || "suqpage-development-privacy-salt";
}

export function hashPrivateValue(value: string) {
  return crypto.createHmac("sha256", privacySalt()).update(value).digest("hex");
}

export function cleanText(value: unknown, max: number) {
  return String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);
}
