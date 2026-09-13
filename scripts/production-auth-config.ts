import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

export const PRODUCTION_AUTH = Object.freeze({
  project: "sjeiiqxgscuqajpgddcc",
  origin: "https://africmade.netlify.app",
});
const MAX_BYTES = 512 * 1024;
const PLAN_TTL = 10 * 60 * 1000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export type AuthConfig = Record<string, unknown>;
export interface AuthConfigPort {
  project(): Promise<{ id: string; status: string }>;
  read(): Promise<AuthConfig>;
  patch(patch: AuthConfig): Promise<void>;
}
type Plan = {
  version: 1;
  project: string;
  createdAt: number;
  before: AuthConfig;
  patch: AuthConfig;
};
class GuardError extends Error {}

function requireGuard(condition: unknown, message: string): asserts condition {
  if (!condition) throw new GuardError(message);
}
function record(value: unknown): value is AuthConfig {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (record(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export function digest(value: unknown): string {
  return crypto.createHash("sha256").update(canonical(value)).digest("hex");
}

export function validatePatch(project: string, patch: unknown, template: string): asserts patch is AuthConfig {
  requireGuard(project === PRODUCTION_AUTH.project, "Wrong production project.");
  requireGuard(record(patch) && Object.keys(patch).length > 0, "A nonempty JSON patch is required.");
  const permitted: AuthConfig = {
    site_url: PRODUCTION_AUTH.origin,
    uri_allow_list: `${PRODUCTION_AUTH.origin}/auth/callback`,
    mailer_otp_length: 6,
    mailer_otp_exp: 600,
    smtp_max_frequency: 60,
    mailer_autoconfirm: false,
    mailer_allow_unverified_email_sign_ins: false,
    external_google_skip_nonce_check: false,
    external_google_email_optional: false,
    mailer_subjects_confirmation: "Your AfricMade sign-in code",
    mailer_subjects_magic_link: "Your AfricMade sign-in code",
    mailer_templates_confirmation_content: template,
    mailer_templates_magic_link_content: template,
  };
  for (const [key, value] of Object.entries(patch)) {
    requireGuard(Object.hasOwn(permitted, key), "Patch contains a forbidden field; credential edits need separate owner action.");
    requireGuard(value === permitted[key], "Patch value does not match the reviewed production policy.");
  }
}

function privateDirectory(directory: string): void {
  const stat = fs.lstatSync(directory);
  requireGuard(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === process.getuid?.()
    && (stat.mode & 0o077) === 0, "Plan directory must be owned, private, and not a symlink.");
}
function planPath(directory: string, id: string): string {
  privateDirectory(directory);
  requireGuard(/^[a-f0-9]{24}$/.test(id), "Invalid plan ID.");
  return path.join(directory, `${id}.json`);
}
function readJson(file: string, privateFile = false): unknown {
  let fd: number | undefined;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    const stat = fs.fstatSync(fd);
    requireGuard(stat.isFile() && stat.size <= MAX_BYTES, "Invalid or oversized JSON file.");
    if (privateFile) requireGuard(stat.uid === process.getuid?.() && (stat.mode & 0o077) === 0, "Plan file is not private.");
    return JSON.parse(fs.readFileSync(fd, "utf8")) as unknown;
  } catch {
    throw new GuardError("Cannot read a valid, bounded, non-symlink JSON file with the required permissions.");
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}
function writePrivate(file: string, value: unknown): void {
  const fd = fs.openSync(file, "wx", 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify(value));
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}
async function readCurrent(port: AuthConfigPort): Promise<AuthConfig> {
  const project = await port.project();
  requireGuard(project.id === PRODUCTION_AUTH.project && project.status === "ACTIVE_HEALTHY", "Production project identity or health did not pass.");
  const config = await port.read();
  requireGuard(record(config) && typeof config.site_url === "string"
    && typeof config.external_google_enabled === "boolean"
    && typeof config.mailer_autoconfirm === "boolean", "Provider returned incomplete Auth configuration.");
  return config;
}

export async function prepareAuthPlan(input: {
  project: string; patch: unknown; template: string; directory: string; port: AuthConfigPort; now?: number;
}) {
  validatePatch(input.project, input.patch, input.template);
  const patch = input.patch;
  privateDirectory(input.directory);
  const before = await readCurrent(input.port);
  requireGuard(Object.keys(patch).some((key) => canonical(before[key]) !== canonical(patch[key])), "There are no changes to apply.");
  const plan: Plan = { version: 1, project: input.project, createdAt: input.now ?? Date.now(), before, patch };
  const id = crypto.randomBytes(12).toString("hex");
  const file = planPath(input.directory, id);
  writePrivate(file, plan);
  requireGuard(digest(readJson(file, true)) === digest(plan), "Backup verification failed.");
  return { id, approval: digest(plan), project: plan.project, origin: PRODUCTION_AUTH.origin,
    expiresAt: plan.createdAt + PLAN_TTL,
    changes: Object.keys(plan.patch).sort().map((field) => ({ field,
      value: field.startsWith("mailer_templates_") ? "Reviewed repository email template" : plan.patch[field] })) };
}

export async function applyAuthPlan(input: {
  project: string; id: string; approval: string; template: string; directory: string; port: AuthConfigPort; now?: number;
}): Promise<void> {
  requireGuard(input.project === PRODUCTION_AUTH.project, "Wrong production project.");
  const file = planPath(input.directory, input.id);
  const raw = readJson(file, true);
  requireGuard(record(raw) && raw.version === 1 && raw.project === input.project && record(raw.before)
    && typeof raw.createdAt === "number" && Number.isFinite(raw.createdAt), "Invalid plan.");
  validatePatch(raw.project as string, raw.patch, input.template);
  const age = (input.now ?? Date.now()) - raw.createdAt;
  requireGuard(age >= 0 && age <= PLAN_TTL, "Plan expired or has a future timestamp; prepare another read-only plan.");
  requireGuard(/^[a-f0-9]{64}$/.test(input.approval) && digest(raw) === input.approval, "Reviewed plan digest does not match.");
  requireGuard(!fs.existsSync(`${file}.attempt`), "This plan was already attempted; inspect provider state before replanning.");
  const current = await readCurrent(input.port);
  requireGuard(digest(current) === digest(raw.before), "Provider configuration changed after review; no write was made.");
  // Reserve the attempt before sending: a timeout may still have committed remotely.
  writePrivate(`${file}.attempt`, { attemptedAt: input.now ?? Date.now(), approval: input.approval });
  await input.port.patch(raw.patch);
  const after = await readCurrent(input.port);
  requireGuard(digest(after) === digest({ ...current, ...raw.patch }), "Provider readback differs from the exact approved change; stop and inspect, do not retry or auto-restore.");
  writePrivate(`${file}.verified`, { verifiedAt: Date.now(), approval: input.approval });
}

export function supabaseAuthPort(token: string, fetcher: typeof fetch = fetch): AuthConfigPort {
  requireGuard(Boolean(token) && !/[\r\n]/.test(token), "An explicit SUPABASE_ACCESS_TOKEN is required; no stored credentials are discovered.");
  const base = `https://api.supabase.com/v1/projects/${PRODUCTION_AUTH.project}`;
  async function request(suffix: string, patch?: AuthConfig): Promise<unknown> {
    try {
      const response = await fetcher(base + suffix, {
        method: patch ? "PATCH" : "GET", redirect: "error", signal: AbortSignal.timeout(15_000),
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        ...(patch ? { body: JSON.stringify(patch) } : {}),
      });
      requireGuard(response.ok, "Provider request failed.");
      if (patch) { await response.body?.cancel(); return null; }
      const reader = response.body?.getReader();
      requireGuard(reader, "Missing provider response.");
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error("Oversized provider response."); }
        chunks.push(chunk.value);
      }
      return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
    } catch {
      throw new GuardError("Provider request failed or returned invalid data. No automatic retry; inspect state before another attempt.");
    }
  }
  return {
    async project() {
      const value = await request("");
      requireGuard(record(value) && typeof value.id === "string" && typeof value.status === "string", "Invalid project response.");
      return { id: value.id, status: value.status };
    },
    async read() {
      const value = await request("/config/auth");
      requireGuard(record(value), "Invalid Auth response.");
      return value;
    },
    async patch(patch) { await request("/config/auth", patch); },
  };
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    project: { type: "string" }, patch: { type: "string" }, plan: { type: "string" }, approve: { type: "string" },
  } });
  const mode = positionals[0];
  requireGuard(positionals.length === 1 && (mode === "plan" || mode === "apply"),
    "Usage: plan --project REF --patch JSON | apply --project REF --plan ID --approve DIGEST");
  requireGuard(values.project === PRODUCTION_AUTH.project, "Specify the exact production project.");
  requireGuard(mode === "plan" ? Boolean(values.patch) && !values.plan && !values.approve
    : Boolean(values.plan && values.approve) && !values.patch, "Invalid plan/apply arguments.");
  const template = fs.readFileSync(path.join(ROOT, "supabase/templates/magic-link.html"), "utf8");
  const patch = mode === "plan" ? readJson(path.resolve(values.patch!)) : undefined;
  if (mode === "plan") validatePatch(values.project, patch, template);
  const local = path.join(ROOT, ".local");
  if (!fs.existsSync(local)) fs.mkdirSync(local, { mode: 0o700 });
  const stat = fs.lstatSync(local);
  requireGuard(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === process.getuid?.()
    && (stat.mode & 0o022) === 0, "Unsafe repository-local directory.");
  const directory = path.join(local, "production-auth-plans");
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { mode: 0o700 });
  const port = supabaseAuthPort(process.env.SUPABASE_ACCESS_TOKEN || "");
  if (mode === "plan") console.log(JSON.stringify(await prepareAuthPlan({ project: values.project, patch, template, directory, port }), null, 2));
  else {
    await applyAuthPlan({ project: values.project, id: values.plan!, approval: values.approve!, template, directory, port });
    console.log("The exact approved Auth patch was applied and read back. Credentials were not edited.");
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  void main().catch((error: unknown) => {
    console.error(error instanceof GuardError ? error.message : "Auth configuration stopped because arguments or local I/O failed. No provider response or credentials were printed.");
    process.exitCode = 1;
  });
}
