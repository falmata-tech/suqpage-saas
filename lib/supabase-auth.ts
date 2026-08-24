import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { appUrl } from "./app-url";
import { assertSupabaseAuthConfiguration, supabaseAuthConfig } from "./config";
import { runtimeGet } from "./runtime-sql";

type LinkedIdentity = { user_id: number };

export class ManagedIdentityError extends Error {
  constructor(message: string, readonly code: "conflict" | "provider_unavailable" | "unlinked" = "provider_unavailable") {
    super(message);
  }
}

function boundedFetch(timeoutMs: number): typeof fetch {
  return async (input, init = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const signal = init.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal;
    try { return await fetch(input, { ...init, signal }); }
    finally { clearTimeout(timeout); }
  };
}

function publicConfig() {
  const config = supabaseAuthConfig();
  if (!config.url || config.publishableKey.length < 20) {
    throw new Error("Supabase Auth is not configured.");
  }
  return config;
}

export async function createMirtPageSupabaseServerClient() {
  const config = publicConfig();
  const jar = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    global: { fetch: boundedFetch(config.requestTimeoutMs) },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Server Components rely on proxy refresh for cookie writes. */ }
      },
    },
  });
}

export function createMirtPageSupabaseAdminClient(): SupabaseClient {
  const config = assertSupabaseAuthConfiguration();
  return createClient(config.url, config.serviceRoleKey, {
    global: { fetch: boundedFetch(config.requestTimeoutMs) },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function provisionSupabasePasswordIdentity(input: { email: string; password: string; passwordHash?: string; name: string }) {
  const client = createMirtPageSupabaseAdminClient();
  const { data, error } = await client.auth.admin.createUser({
    email: input.email,
    ...(input.passwordHash ? { password_hash: input.passwordHash } : { password: input.password }),
    email_confirm: true,
    user_metadata: { display_name: input.name },
    app_metadata: { mirtpage_link_state: "pending" },
  });
  if (error || !data.user) {
    if (error?.code === "email_exists" || error?.status === 422) throw new ManagedIdentityError("An account already uses this email.", "conflict");
    throw new ManagedIdentityError("Managed identity is temporarily unavailable.");
  }
  return data.user.id;
}

export async function finalizeSupabaseIdentity(providerUserId: string, userId: number) {
  const client = createMirtPageSupabaseAdminClient();
  const { error } = await client.auth.admin.updateUserById(providerUserId, {
    app_metadata: { mirtpage_user_id: String(userId), mirtpage_link_state: "linked" },
  });
  if (error) throw new ManagedIdentityError("Managed identity could not be finalized.");
}

export async function removePendingSupabaseIdentity(providerUserId: string) {
  const client = createMirtPageSupabaseAdminClient();
  const { error } = await client.auth.admin.deleteUser(providerUserId);
  return !error;
}

export async function linkedMirtPageUserId(providerUserId: string) {
  const link = await runtimeGet<LinkedIdentity>(
    "SELECT user_id FROM auth_identity_links WHERE provider='supabase' AND provider_user_id=?",
    [providerUserId],
  );
  return link?.user_id || null;
}

async function resolveCurrentSupabaseIdentity() {
  const client = await createMirtPageSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  const userId = await linkedMirtPageUserId(data.user.id);
  return userId ? { providerUserId: data.user.id, userId, email: data.user.email || "" } : null;
}

export const currentSupabaseIdentity = cache(resolveCurrentSupabaseIdentity);

export async function signInWithSupabasePassword(email: string, password: string) {
  const client = await createMirtPageSupabaseServerClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  const userId = await linkedMirtPageUserId(data.user.id);
  if (!userId) {
    await client.auth.signOut({ scope: "local" });
    return null;
  }
  return { providerUserId: data.user.id, userId };
}

export async function signOutSupabaseSession() {
  const client = await createMirtPageSupabaseServerClient();
  await client.auth.signOut({ scope: "local" });
}

export async function beginGoogleSignIn() {
  const config = assertSupabaseAuthConfiguration();
  if (!config.googleEnabled) return null;
  const client = await createMirtPageSupabaseServerClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl()}/auth/callback`, skipBrowserRedirect: true },
  });
  return error ? null : data.url;
}

export async function completeSupabaseCodeExchange(code: string) {
  const client = await createMirtPageSupabaseServerClient();
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  if (error || !data.user) return null;
  const userId = await linkedMirtPageUserId(data.user.id);
  if (!userId) {
    await client.auth.signOut({ scope: "local" });
    return null;
  }
  return { providerUserId: data.user.id, userId };
}

export async function updateCurrentSupabasePassword(email: string, currentPassword: string, nextPassword: string) {
  const identity = await signInWithSupabasePassword(email, currentPassword);
  if (!identity) return false;
  const client = await createMirtPageSupabaseServerClient();
  const { error } = await client.auth.updateUser({ password: nextPassword });
  return !error;
}

export async function updateLinkedSupabasePassword(userId: number, nextPassword: string) {
  const link = await runtimeGet<{ provider_user_id: string }>(
    "SELECT provider_user_id FROM auth_identity_links WHERE provider='supabase' AND user_id=?",
    [userId],
  );
  if (!link) return false;
  const client = createMirtPageSupabaseAdminClient();
  const { error } = await client.auth.admin.updateUserById(link.provider_user_id, { password: nextPassword });
  return !error;
}
