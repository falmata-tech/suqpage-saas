import { createClient } from "@supabase/supabase-js";
import { supabaseAuthConfig } from "../config";
import { linkedSuqpageUserId } from "../supabase-auth";
import { runtimeUserById } from "../catalog-runtime";
import type { SessionUser } from "../types";
export class MobileError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly code = "invalid",
  ) {
    super(message);
  }
}
export interface NativeIdentityPort {
  verify(token: string): Promise<{ id: string; email: string } | null>;
  linked(id: string): Promise<number | null>;
  user(id: number): Promise<SessionUser | null | undefined>;
}
export const nativeIdentityPort: NativeIdentityPort = {
  async verify(token) {
    const c = supabaseAuthConfig();
    if (!c.url || !c.publishableKey)
      throw new MobileError("Sign-in is unavailable.", 503);
    const client = createClient(c.url, c.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(c.requestTimeoutMs),
          }),
      },
    });
    const { data, error } = await client.auth.getUser(token);
    return !error && data.user?.email && data.user.email_confirmed_at
      ? { id: data.user.id, email: data.user.email }
      : null;
  },
  linked: linkedSuqpageUserId,
  user: runtimeUserById,
};
export async function nativeIdentity(
  request: Request,
  port: NativeIdentityPort = nativeIdentityPort,
) {
  const value = request.headers.get("authorization") || "";
  if (!/^Bearer [A-Za-z0-9._-]{20,8192}$/.test(value))
    throw new MobileError("Sign in to continue.", 401, "unauthenticated");
  let identity;
  try {
    identity = await port.verify(value.slice(7));
  } catch (e) {
    if (e instanceof MobileError) throw e;
    throw new MobileError("Sign-in is temporarily unavailable.", 503);
  }
  if (!identity)
    throw new MobileError("Sign in again to continue.", 401, "unauthenticated");
  const id = await port.linked(identity.id);
  const user = id ? await port.user(id) : null;
  if (id && !user) throw new MobileError("Account unavailable.", 401);
  return { identity, user };
}
export async function nativeOwner(
  request: Request,
  port: NativeIdentityPort = nativeIdentityPort,
) {
  const { user } = await nativeIdentity(request, port);
  if (!user)
    throw new MobileError("Set up your business first.", 409, "setup_required");
  if (user.access_role !== "client" || !user.business_id)
    throw new MobileError(
      "Staff management is available on the website.",
      403,
      "owner_only",
    );
  return user as SessionUser & { business_id: number };
}
export async function boundedBody(request: Request, max = 24000) {
  if (Number(request.headers.get("content-length") || 0) > max)
    throw new MobileError("Request is too large.", 413);
  const reader = request.body?.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  if (reader)
    try {
      for (;;) {
        const p = await reader.read();
        if (p.done) break;
        size += p.value.byteLength;
        if (size > max) {
          await reader.cancel();
          throw new MobileError("Request is too large.", 413);
        }
        chunks.push(p.value);
      }
    } finally {
      reader.releaseLock();
    }
  return Buffer.concat(chunks);
}
export async function jsonBody(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    throw new MobileError("Send JSON.", 415);
  try {
    const v: unknown = JSON.parse((await boundedBody(request)).toString());
    if (!v || typeof v !== "object" || Array.isArray(v))
      throw new MobileError("Invalid request.");
    return v as Record<string, unknown>;
  } catch (e) {
    if (e instanceof MobileError) throw e;
    throw new MobileError("Invalid request.");
  }
}
export function numericId(value: string) {
  const n = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(n) || n < 1)
    throw new MobileError("Not found.", 404);
  return n;
}
export function ownerTarget(actor: SessionUser, target: unknown) {
  if (target !== undefined && Number(target) !== actor.business_id)
    throw new MobileError("Business access denied.", 403);
}

/** Only wrap pure, validated domain parsers; never wrap storage/provider exceptions. */
export function mobileParse<T>(parse: () => T): T {
  try {
    return parse();
  } catch (error) {
    throw new MobileError(
      error instanceof Error ? error.message : "Check the entered details.",
    );
  }
}
