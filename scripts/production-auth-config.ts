import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { suqpageEmailBrandingPatch } from "./auth-email-templates";
import { AuthCredentialError, resolveAuthCredential, type CredentialSource } from "./auth-credentials";

export const PRODUCTION_AUTH = Object.freeze({
  project: "sjeiiqxgscuqajpgddcc",
  origin: "https://suqpage.com",
});
const callbacks = "https://suqpage.com/auth/callback,https://mirtpage.com/auth/callback";
export const AUTH_ORIGIN_POLICIES = Object.freeze({
  legacy: Object.freeze({ site_url: PRODUCTION_AUTH.origin, uri_allow_list: `${PRODUCTION_AUTH.origin}/auth/callback` }),
  "dual-old-primary": Object.freeze({ site_url: PRODUCTION_AUTH.origin, uri_allow_list: callbacks }),
  "dual-new-primary": Object.freeze({ site_url: "https://mirtpage.com", uri_allow_list: callbacks }),
});
export type AuthOriginPhase = keyof typeof AUTH_ORIGIN_POLICIES;
const MAX_BYTES = 512 * 1024;
const PLAN_TTL = 10 * 60 * 1000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export type AuthConfig = Record<string, unknown>;
export interface AuthConfigPort {
  readonly credential: { source: CredentialSource; fingerprint: string };
  project(): Promise<{ id: string; status: string }>;
  read(): Promise<AuthConfig>;
  patch(patch: AuthConfig): Promise<void>;
}
type PlanOperation = { kind: "legacy-settings"; sourcePhase: null; targetPhase: null }
  | { kind: "origin-transition"; sourcePhase: AuthOriginPhase; targetPhase: AuthOriginPhase };
type Plan = {
  version: 3;
  credential: AuthConfigPort["credential"];
  project: string;
  createdAt: number;
  before: AuthConfig;
  patch: AuthConfig;
} & PlanOperation;
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
    ...suqpageEmailBrandingPatch(),
    mailer_otp_length: 6,
    mailer_otp_exp: 600,
    smtp_max_frequency: 60,
    mailer_autoconfirm: false,
    mailer_allow_unverified_email_sign_ins: false,
    external_google_skip_nonce_check: false,
    external_google_email_optional: false,
    mailer_subjects_confirmation: "Your MirtPage sign-in code",
    mailer_subjects_magic_link: "Your MirtPage sign-in code",
    mailer_templates_confirmation_content: template,
    mailer_templates_magic_link_content: template,
  };
  for (const [key, value] of Object.entries(patch)) {
    requireGuard(Object.hasOwn(permitted, key), "Patch contains a forbidden field; credential edits need separate owner action.");
    requireGuard(value === permitted[key], "Patch value does not match the reviewed production policy.");
  }
}

function originPhase(value: unknown): asserts value is AuthOriginPhase {
  requireGuard(typeof value === "string" && Object.hasOwn(AUTH_ORIGIN_POLICIES, value), "Invalid origin phase.");
}
function originTransition(project: string, source: unknown, target: unknown): AuthConfig {
  requireGuard(project === PRODUCTION_AUTH.project, "Wrong production project.");
  originPhase(source);
  originPhase(target);
  requireGuard((source === "legacy" && target === "dual-old-primary")
    || (source === "dual-old-primary" && target === "dual-new-primary")
    || (source === "dual-new-primary" && target === "dual-old-primary"), "Origin phase transition is not permitted.");
  return { ...AUTH_ORIGIN_POLICIES[target] };
}
function matchesOrigin(config: AuthConfig, phase: AuthOriginPhase): boolean {
  return Object.entries(AUTH_ORIGIN_POLICIES[phase]).every(([field, value]) => config[field] === value);
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

type PlanInput = { project: string; directory: string; port: AuthConfigPort; now?: number };
async function preparePlan(input: PlanInput, operation: PlanOperation, patch: AuthConfig) {
  privateDirectory(input.directory);
  const before = await readCurrent(input.port);
  if (operation.kind === "origin-transition") {
    originPhase(operation.sourcePhase);
    requireGuard(matchesOrigin(before, operation.sourcePhase), "Current Auth origin does not match the exact source phase.");
  }
  requireGuard(Object.keys(patch).some((key) => canonical(before[key]) !== canonical(patch[key])), "There are no changes to apply.");
  const plan: Plan = { version: 3, ...operation, credential: { ...input.port.credential }, project: input.project,
    createdAt: input.now ?? Date.now(), before, patch };
  const id = crypto.randomBytes(12).toString("hex");
  const file = planPath(input.directory, id);
  writePrivate(file, plan);
  requireGuard(digest(readJson(file, true)) === digest(plan), "Backup verification failed.");
  return { id, approval: digest(plan), project: plan.project, kind: plan.kind,
    sourcePhase: plan.sourcePhase, targetPhase: plan.targetPhase,
    origin: operation.kind === "origin-transition" ? patch.site_url : before.site_url,
    credentialSource: plan.credential.source,
    expiresAt: plan.createdAt + PLAN_TTL,
    changes: Object.keys(plan.patch).sort().map((field) => ({ field,
      value: field.startsWith("mailer_templates_") ? "Reviewed repository email template" : plan.patch[field] })) };
}

export async function prepareAuthPlan(input: PlanInput & { patch: unknown; template: string }) {
  validatePatch(input.project, input.patch, input.template);
  return preparePlan(input, { kind: "legacy-settings", sourcePhase: null, targetPhase: null }, input.patch);
}

export async function prepareAuthOriginPlan(input: PlanInput & { sourcePhase: unknown; targetPhase: unknown }) {
  const patch = originTransition(input.project, input.sourcePhase, input.targetPhase);
  originPhase(input.sourcePhase);
  originPhase(input.targetPhase);
  return preparePlan(input, { kind: "origin-transition", sourcePhase: input.sourcePhase, targetPhase: input.targetPhase }, patch);
}

export function expectedAuthReadback(before: AuthConfig, patch: AuthConfig): AuthConfig {
  const expected = { ...before, ...patch };
  for (const [map, prefix] of [["mailer_subjects_custom_contents", "mailer_subjects_"],
    ["mailer_templates_custom_contents", "mailer_templates_"]] as const) {
    if (!Object.hasOwn(before, map)) continue;
    const flags = before[map];
    requireGuard(record(flags), "Invalid provider email customization metadata.");
    const updated = { ...flags };
    for (const [field, value] of Object.entries(patch)) {
      const key = field.toUpperCase();
      if (!field.startsWith(prefix) || !Object.hasOwn(flags, key)) continue;
      requireGuard(typeof flags[key] === "boolean" && typeof value === "string" && value.length > 0,
        "Invalid provider email customization metadata.");
      updated[key] = true;
    }
    expected[map] = updated;
  }
  return expected;
}

export async function applyAuthPlan(input: {
  project: string; id: string; approval: string; template: string; directory: string; port: AuthConfigPort; now?: number;
}): Promise<void> {
  requireGuard(input.project === PRODUCTION_AUTH.project, "Wrong production project.");
  const file = planPath(input.directory, input.id);
  const raw = readJson(file, true);
  requireGuard(record(raw) && raw.version === 3, "Invalid plan version; prepare a new version-3 review plan.");
  requireGuard(raw.project === input.project && record(raw.before)
    && typeof raw.createdAt === "number" && Number.isFinite(raw.createdAt), "Invalid plan.");
  requireGuard(record(raw.credential) && canonical(raw.credential) === canonical(input.port.credential),
    "Credential source or login changed after planning; prepare a new review plan. No provider write was made.");
  if (raw.kind === "origin-transition") {
    const patch = originTransition(input.project, raw.sourcePhase, raw.targetPhase);
    requireGuard(record(raw.patch) && canonical(raw.patch) === canonical(patch), "Origin patch does not match the exact target phase policy.");
    originPhase(raw.sourcePhase);
    requireGuard(matchesOrigin(raw.before, raw.sourcePhase), "Saved Auth origin does not match the exact source phase.");
  } else {
    requireGuard(raw.kind === "legacy-settings" && raw.sourcePhase === null && raw.targetPhase === null, "Invalid plan operation kind or phases.");
    validatePatch(input.project, raw.patch, input.template);
  }
  requireGuard(record(raw.patch), "Invalid plan patch.");
  const age = (input.now ?? Date.now()) - raw.createdAt;
  requireGuard(age >= 0 && age <= PLAN_TTL, "Plan expired or has a future timestamp; prepare another read-only plan.");
  requireGuard(/^[a-f0-9]{64}$/.test(input.approval) && digest(raw) === input.approval, "Reviewed plan digest does not match.");
  requireGuard(!fs.existsSync(`${file}.attempt`), "This plan was already attempted; inspect provider state before replanning.");
  const current = await readCurrent(input.port);
  requireGuard(digest(current) === digest(raw.before), "Provider configuration changed after review; no write was made.");
  const expected = expectedAuthReadback(current, raw.patch);
  // Reserve the attempt before sending: a timeout may still have committed remotely.
  writePrivate(`${file}.attempt`, { attemptedAt: input.now ?? Date.now(), approval: input.approval });
  await input.port.patch(raw.patch);
  const after = await readCurrent(input.port);
  requireGuard(digest(after) === digest(expected), "Provider readback differs from the exact approved change; stop and inspect, do not retry or auto-restore.");
  writePrivate(`${file}.verified`, { verifiedAt: Date.now(), approval: input.approval });
}

export function supabaseAuthPort(token: string, fetcher: typeof fetch = fetch, source: CredentialSource = "env"): AuthConfigPort {
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
    credential: Object.freeze({ source, fingerprint: digest(token) }),
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
    "from-phase": { type: "string" }, "to-phase": { type: "string" },
    "credential-source": { type: "string", default: "env" },
  } });
  const mode = positionals[0];
  requireGuard(positionals.length === 1 && (mode === "plan" || mode === "apply"),
    "Usage: plan --project REF (--patch JSON | --from-phase PHASE --to-phase PHASE) | apply --project REF --plan ID --approve DIGEST");
  requireGuard(values.project === PRODUCTION_AUTH.project, "Specify the exact production project.");
  const transition = values["from-phase"] !== undefined || values["to-phase"] !== undefined;
  const hasPatch = values.patch !== undefined;
  requireGuard(mode === "plan" ? values.plan === undefined && values.approve === undefined
    && (transition ? Boolean(values["from-phase"] && values["to-phase"]) && !hasPatch : Boolean(values.patch))
    : Boolean(values.plan && values.approve) && !hasPatch && !transition, "Invalid plan/apply arguments.");
  const template = fs.readFileSync(path.join(ROOT, "supabase/templates/magic-link.html"), "utf8");
  const patch = mode === "plan" && !transition ? readJson(path.resolve(values.patch!)) : undefined;
  if (mode === "plan") {
    if (transition) originTransition(values.project, values["from-phase"], values["to-phase"]);
    else validatePatch(values.project, patch, template);
  }
  const local = path.join(ROOT, ".local");
  if (!fs.existsSync(local)) fs.mkdirSync(local, { mode: 0o700 });
  const stat = fs.lstatSync(local);
  requireGuard(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === process.getuid?.()
    && (stat.mode & 0o022) === 0, "Unsafe repository-local directory.");
  const directory = path.join(local, "production-auth-plans");
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { mode: 0o700 });
  const credential = await resolveAuthCredential(values["credential-source"], process.env.SUPABASE_ACCESS_TOKEN || "");
  const port = supabaseAuthPort(credential.token, fetch, credential.source);
  if (mode === "plan") console.log(JSON.stringify(transition
    ? await prepareAuthOriginPlan({ project: values.project, sourcePhase: values["from-phase"], targetPhase: values["to-phase"], directory, port })
    : await prepareAuthPlan({ project: values.project, patch, template, directory, port }), null, 2));
  else {
    await applyAuthPlan({ project: values.project, id: values.plan!, approval: values.approve!, template, directory, port });
    console.log("The exact approved Auth patch was applied and read back. Credentials were not edited.");
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  void main().catch((error: unknown) => {
    console.error(error instanceof GuardError || error instanceof AuthCredentialError ? error.message : "Auth configuration stopped because arguments or local I/O failed. No provider response or credentials were printed.");
    process.exitCode = 1;
  });
}
