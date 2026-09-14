import { platformEnvironment } from "./platform-environment.mjs";
import fs from "node:fs";
import path from "node:path";
import { postgresRuntimeConfig } from "./postgres-runtime";

const DEFAULT_MEDIA_REQUEST_TIMEOUT_MS = 8_000;
const MIN_MEDIA_REQUEST_TIMEOUT_MS = 1_000;
const MAX_MEDIA_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_AUTH_REQUEST_TIMEOUT_MS = 8_000;

export function isApprovedProviderUrl(url: URL) {
  const browserTestRuntime = platformEnvironment().SUQPAGE_RUNTIME_PROFILE === "browser-test";
  const localHttp =
    (process.env.NODE_ENV !== "production" || browserTestRuntime) &&
    url.protocol === "http:" &&
    ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  return (
    (url.protocol === "https:" || localHttp) &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash
  );
}

export function databaseDriver(): "postgres" {
  if (platformEnvironment().SUQPAGE_DATABASE_DRIVER?.trim() !== "postgres") {
    throw new Error("SUQPAGE_DATABASE_DRIVER must be postgres in every environment.");
  }
  return "postgres";
}

export function mediaRoot() {
  return path.resolve(
    /* turbopackIgnore: true */ platformEnvironment().SUQPAGE_MEDIA_ROOT ||
      path.join(/* turbopackIgnore: true */ process.cwd(), "data", "media"),
  );
}

export function backupRoot() {
  return path.resolve(
    /* turbopackIgnore: true */ platformEnvironment().SUQPAGE_BACKUP_ROOT ||
      path.join(/* turbopackIgnore: true */ process.cwd(), "backups"),
  );
}

export function requestAttachmentRoot() {
  return path.resolve(/* turbopackIgnore: true */ mediaRoot(), "requests");
}

export function supportAttachmentRoot() {
  return path.resolve(/* turbopackIgnore: true */ mediaRoot(), "support");
}

export function mediaStorageDriver() {
  const value = (platformEnvironment().SUQPAGE_MEDIA_DRIVER || "filesystem").trim();
  if (value !== "filesystem" && value !== "supabase") {
    throw new Error("SUQPAGE_MEDIA_DRIVER must be filesystem or supabase.");
  }
  return value as "filesystem" | "supabase";
}

export function authDriver() {
  const value = (platformEnvironment().SUQPAGE_AUTH_DRIVER || "local").trim();
  if (value !== "local" && value !== "supabase") {
    throw new Error("SUQPAGE_AUTH_DRIVER must be local or supabase.");
  }
  return value as "local" | "supabase";
}

export function supabaseAuthConfig() {
  const timeout = Number(platformEnvironment().SUQPAGE_SUPABASE_AUTH_REQUEST_TIMEOUT_MS || DEFAULT_AUTH_REQUEST_TIMEOUT_MS);
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, ""),
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    serviceRoleKey: platformEnvironment().SUQPAGE_SUPABASE_SERVICE_ROLE_KEY || "",
    emailOtpEnabled: platformEnvironment().SUQPAGE_EMAIL_OTP_ENABLED === "1",
    googleEnabled: platformEnvironment().SUQPAGE_GOOGLE_AUTH_ENABLED === "1",
    requestTimeoutMs: timeout,
  };
}

export function supabaseAuthEnabled() {
  return authDriver() === "supabase";
}

export function assertSupabaseAuthConfiguration() {
  const config = supabaseAuthConfig();
  let url: URL;
  try { url = new URL(config.url); }
  catch { throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL in Supabase auth mode."); }
  if (!isApprovedProviderUrl(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be HTTPS or an approved local loopback URL in Supabase auth mode.");
  }
  if (config.publishableKey.length < 20) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required in Supabase auth mode.");
  if (config.serviceRoleKey.length < 20) throw new Error("SUQPAGE_SUPABASE_SERVICE_ROLE_KEY is required in Supabase auth mode.");
  if (!Number.isSafeInteger(config.requestTimeoutMs) || config.requestTimeoutMs < 1_000 || config.requestTimeoutMs > 30_000) {
    throw new Error("SUQPAGE_SUPABASE_AUTH_REQUEST_TIMEOUT_MS must be an integer from 1000 to 30000.");
  }
  return config;
}

export function mediaRequestTimeoutMs() {
  const raw = platformEnvironment().SUQPAGE_MEDIA_REQUEST_TIMEOUT_MS;
  if (!raw) return DEFAULT_MEDIA_REQUEST_TIMEOUT_MS;
  const value = Number(raw);
  if (
    !Number.isSafeInteger(value) ||
    value < MIN_MEDIA_REQUEST_TIMEOUT_MS ||
    value > MAX_MEDIA_REQUEST_TIMEOUT_MS
  ) {
    throw new Error(
      `SUQPAGE_MEDIA_REQUEST_TIMEOUT_MS must be an integer from ${MIN_MEDIA_REQUEST_TIMEOUT_MS} to ${MAX_MEDIA_REQUEST_TIMEOUT_MS}.`,
    );
  }
  return value;
}

export function supabaseMediaStorageConfig() {
  return {
    url: (platformEnvironment().SUQPAGE_SUPABASE_URL || "").trim(),
    serviceRoleKey: platformEnvironment().SUQPAGE_SUPABASE_SERVICE_ROLE_KEY || "",
    bucket: (platformEnvironment().SUQPAGE_SUPABASE_STORAGE_BUCKET || "mirtpage-media").trim(),
    requestTimeoutMs: mediaRequestTimeoutMs(),
  };
}

export function productUpkeepEnabled() {
  return platformEnvironment().SUQPAGE_PRODUCT_UPKEEP_ENABLED !== "0";
}

export function recipeStudioEnabled() {
  return platformEnvironment().SUQPAGE_RECIPE_STUDIO_ENABLED !== "0";
}

export function controlledYouTubeAdmissionEnabled() {
  return platformEnvironment().SUQPAGE_YOUTUBE_ADMISSION_ENABLED === "1";
}

export function supportWhatsAppUrl() {
  const value = platformEnvironment().SUQPAGE_SUPPORT_WHATSAPP_URL || "";
  return /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(value) ? value : "";
}

export function ensureRuntimeDirectories() {
  fs.mkdirSync(mediaRoot(), { recursive: true });
  fs.mkdirSync(requestAttachmentRoot(), { recursive: true });
  fs.mkdirSync(supportAttachmentRoot(), { recursive: true });
}

export function assertProductionConfiguration() {
  if (process.env.NODE_ENV !== "production") return;
  const browserTestRuntime = platformEnvironment().SUQPAGE_RUNTIME_PROFILE === "browser-test";
  const database = databaseDriver();
  const identity = authDriver();
  if (database !== "postgres") {
    throw new Error("SUQPAGE_DATABASE_DRIVER must be postgres in production and deploy previews.");
  }
  if (identity !== "supabase") {
    throw new Error("SUQPAGE_AUTH_DRIVER must be supabase in production and deploy previews.");
  }
  const url = platformEnvironment().SUQPAGE_CANONICAL_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const localBrowserTestUrl = browserTestRuntime && (() => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname);
    } catch { return false; }
  })();
  if (!/^https:\/\//i.test(url) && !localBrowserTestUrl) {
    throw new Error(
      "SUQPAGE_CANONICAL_URL must be an HTTPS URL in production.",
    );
  }
  if (!process.env.PRIVACY_SALT || process.env.PRIVACY_SALT.length < 24) {
    throw new Error("PRIVACY_SALT must be at least 24 characters in production.");
  }
  const driver = mediaStorageDriver();
  if (driver !== "supabase") {
    throw new Error("SUQPAGE_MEDIA_DRIVER must be supabase in production and deploy previews.");
  }
  mediaRequestTimeoutMs();
  if (!postgresRuntimeConfig()) {
    throw new Error("SUQPAGE_POSTGRES_URL is required in PostgreSQL mode.");
  }
  const storage = supabaseMediaStorageConfig();
  let parsed: URL;
  try {
    parsed = new URL(storage.url);
  } catch {
    throw new Error(
      "SUQPAGE_SUPABASE_URL must be a valid HTTPS URL in Supabase media mode.",
    );
  }
  if (!isApprovedProviderUrl(parsed)) {
    throw new Error(
      "SUQPAGE_SUPABASE_URL must be HTTPS or an approved local loopback URL in Supabase media mode.",
    );
  }
  if (storage.serviceRoleKey.length < 20) {
    throw new Error(
      "SUQPAGE_SUPABASE_SERVICE_ROLE_KEY is required in Supabase media mode.",
    );
  }
  if (!/^[a-z0-9][a-z0-9_-]{1,62}$/i.test(storage.bucket)) {
    throw new Error("SUQPAGE_SUPABASE_STORAGE_BUCKET is invalid.");
  }
  const identityConfig = assertSupabaseAuthConfiguration();
  if (!identityConfig.emailOtpEnabled) {
    throw new Error("Suqpage production requires verified email-code sign-in.");
  }
}
