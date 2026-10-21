import { headers } from "next/headers";
import { runtimeRun } from "./runtime-sql";
import { trustedOriginPolicy } from "./trusted-origins";
import { hashPrivateValue } from "./security-core";
export { hashPrivateValue, cleanText } from "./security-core";

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
  const allowed = new Set(trustedOriginPolicy(process.env).mutationOrigins);
  try { allowed.add(new URL(request.url).origin); } catch { throw new Error("Invalid request origin."); }
  if (!allowed.has(normalized)) throw new Error("Invalid request origin.");
}

export async function audit(action: string, options: { userId?: number | null; businessId?: number | null; detail?: unknown; ipHash?: string } = {}) {
  const detail = typeof options.detail === "string" ? options.detail : JSON.stringify(options.detail || {});
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,?)", [
    options.userId || null,
    options.businessId || null,
    action.slice(0, 100),
    detail.slice(0, 2000),
    options.ipHash || "",
  ]);
}
