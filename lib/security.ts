import crypto from "node:crypto";
import { headers } from "next/headers";
import { appUrl } from "./app-url";
import { getDb } from "./db";

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

export function requestIpFromHeaders(source: Headers) {
  const forwarded = source.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || source.get("x-real-ip") || "unknown";
}

export async function currentRequestIdentity() {
  const source = await headers();
  const ip = requestIpFromHeaders(source);
  return {
    ip,
    ipHash: hashPrivateValue(ip),
    userAgent: (source.get("user-agent") || "").slice(0, 300),
  };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  let normalized: string;
  try { normalized = new URL(origin).origin; } catch { throw new Error("Invalid request origin."); }
  const allowed = new Set<string>();
  for (const candidate of [request.url, appUrl(), ...(process.env.SUQPAGE_SERVER_ACTION_ORIGINS || "").split(",")]) {
    const value = candidate.trim();
    if (!value) continue;
    try { allowed.add(new URL(value).origin); }
    catch {
      const scheme = process.env.NODE_ENV === "production" ? "https" : "http";
      try { allowed.add(new URL(`${scheme}://${value.replace(/\/$/, "")}`).origin); } catch {}
    }
  }
  if (!allowed.has(normalized)) throw new Error("Invalid request origin.");
}

export function audit(action: string, options: { userId?: number | null; businessId?: number | null; detail?: unknown; ipHash?: string } = {}) {
  const detail = typeof options.detail === "string" ? options.detail : JSON.stringify(options.detail || {});
  getDb().prepare("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,?)").run(
    options.userId || null,
    options.businessId || null,
    action.slice(0, 100),
    detail.slice(0, 2000),
    options.ipHash || "",
  );
}

export function cleanText(value: unknown, max: number) {
  return String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);
}
