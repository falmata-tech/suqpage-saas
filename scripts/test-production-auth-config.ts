import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  applyAuthPlan, digest, prepareAuthPlan, PRODUCTION_AUTH, supabaseAuthPort, validatePatch,
  type AuthConfig, type AuthConfigPort,
} from "./production-auth-config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = fs.readFileSync(path.join(root, "supabase/templates/magic-link.html"), "utf8");
const project = PRODUCTION_AUTH.project;
const now = 1_800_000_000_000;
const fixtureConfig = (): AuthConfig => ({
  site_url: "http://localhost:3000", external_google_enabled: true,
  external_google_client_id: "production-client", external_google_secret: "test-only-provider-secret",
  smtp_pass: "test-only-smtp-secret", mailer_autoconfirm: false, mailer_otp_length: 8,
});
function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-auth-guard-"));
  fs.chmodSync(directory, 0o700);
  let config = fixtureConfig();
  const writes: AuthConfig[] = [];
  const port: AuthConfigPort = {
    async project() { return { id: project, status: "ACTIVE_HEALTHY" }; },
    async read() { return structuredClone(config); },
    async patch(patch) { writes.push(structuredClone(patch)); config = { ...config, ...patch }; },
  };
  const base = { project, template, directory, port, now };
  return { ...base, writes, port, config: () => config,
    async plan(patch: unknown = { mailer_otp_length: 6 }) { return prepareAuthPlan({ ...base, patch }); },
    async apply(plan: { id: string; approval: string }, extra = {}) { return applyAuthPlan({ ...base, ...plan, ...extra }); },
    dispose() { fs.rmSync(directory, { recursive: true, force: true }); },
  };
}

const forbidden: unknown[] = [
  {}, null, [], { site_url: "http://localhost:3000" }, { site_url: "https://africmade.netlify.app.evil.test" },
  { uri_allow_list: "https://*.netlify.app/**" }, { uri_allow_list: `${PRODUCTION_AUTH.origin}/auth/callback,http://localhost:3000` },
  { mailer_otp_length: 8 }, { mailer_otp_length: "6" }, { mailer_autoconfirm: true },
  { mailer_allow_unverified_email_sign_ins: true }, { external_google_skip_nonce_check: true },
  { external_google_email_optional: true }, { external_google_enabled: false },
  { external_google_client_id: "local-client" }, { external_google_secret: "new-secret" },
  { smtp_pass: "new-secret" }, { smtp_host: "localhost" }, { smtp_user: "other-sender" },
  { mailer_templates_confirmation_content: "<a href='https://evil.test'>Sign in</a>" },
  { mailer_subjects_confirmation: "Your AfricMade sign-in code" },
  { mailer_subjects_magic_link: "Arbitrary subject" },
  { unknown: true }, { mailer_otp_length: 6, smtp_pass: "smuggled-secret" },
  JSON.parse('{"__proto__":{"mailer_otp_length":6}}'),
];
for (const [index, patch] of forbidden.entries()) {
  test(`reject unsafe patch ${index + 1} before reading the provider`, async () => {
    const f = fixture();
    try {
      f.port.read = async () => { throw new Error("Provider must not be called"); };
      await assert.rejects(f.plan(patch), /patch|required|forbidden|policy/i);
      assert.equal(f.writes.length, 0);
      assert.deepEqual(fs.readdirSync(f.directory), []);
    } finally { f.dispose(); }
  });
}
test("explicit target and safe exact patch are required", async () => {
  assert.throws(() => validatePatch("another-project", { mailer_otp_length: 6 }, template), /project/);
  validatePatch(project, { site_url: PRODUCTION_AUTH.origin, uri_allow_list: `${PRODUCTION_AUTH.origin}/auth/callback`,
    mailer_otp_length: 6, mailer_otp_exp: 600, smtp_max_frequency: 60, mailer_autoconfirm: false,
    mailer_subjects_confirmation: "Your Suqpage sign-in code", mailer_subjects_magic_link: "Your Suqpage sign-in code",
    mailer_templates_confirmation_content: template, mailer_templates_magic_link_content: template }, template);
  const f = fixture();
  try {
    f.port.project = async () => ({ id: "another-project", status: "ACTIVE_HEALTHY" });
    await assert.rejects(f.plan(), /identity or health/);
    f.port.project = async () => ({ id: project, status: "INACTIVE" });
    await assert.rejects(f.plan(), /identity or health/);
    assert.equal(f.writes.length, 0);
  } finally { f.dispose(); }
});
test("apply revalidates forbidden patches even with a recomputed review digest", async () => {
  const f = fixture();
  try {
    const plan = await f.plan();
    const file = path.join(f.directory, `${plan.id}.json`);
    const original = JSON.parse(fs.readFileSync(file, "utf8"));
    f.port.read = async () => { throw Error("Must reject before reading provider"); };
    for (const patch of forbidden) {
      const edited = { ...original, patch };
      fs.writeFileSync(file, JSON.stringify(edited));
      await assert.rejects(f.apply({ ...plan, approval: digest(edited) }), /patch|required|forbidden|policy/i);
    }
    assert.equal(f.writes.length, 0);
  } finally { f.dispose(); }
});
test("plan backs up privately without writing; apply sends only reviewed fields and preserves credentials", async () => {
  const f = fixture();
  try {
    const plan = await f.plan();
    const file = path.join(f.directory, `${plan.id}.json`);
    assert.equal(f.writes.length, 0);
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")).before, fixtureConfig());
    assert(!JSON.stringify(plan).includes("test-only"));
    assert.deepEqual(plan.changes, [{ field: "mailer_otp_length", value: 6 }]);
    await f.apply(plan);
    assert.deepEqual(f.writes, [{ mailer_otp_length: 6 }]);
    assert.equal(f.config().external_google_secret, fixtureConfig().external_google_secret);
    assert.equal(f.config().smtp_pass, fixtureConfig().smtp_pass);
    assert(fs.existsSync(`${file}.verified`));
    await assert.rejects(f.apply(plan), /already attempted/);
    assert.equal(f.writes.length, 1);
  } finally { f.dispose(); }
});
test("bad digest, expiry, future date, remote drift and concurrent changes block apply", async () => {
  const f = fixture();
  try {
    const plan = await f.plan();
    await assert.rejects(f.apply(plan, { approval: "0".repeat(64) }), /digest/);
    await assert.rejects(f.apply(plan, { now: now + 600_001 }), /expired/);
    await assert.rejects(f.apply(plan, { now: now - 1 }), /future/);
    f.config().external_google_secret = "changed-in-dashboard";
    await assert.rejects(f.apply(plan), /changed after review/);
    assert.equal(f.writes.length, 0);
  } finally { f.dispose(); }
});
test("missing, malformed, tampered, symlinked and nonprivate backups block writes", async () => {
  const f = fixture();
  try {
    const plan = await f.plan();
    const file = path.join(f.directory, `${plan.id}.json`);
    const original = fs.readFileSync(file, "utf8");
    fs.chmodSync(file, 0o644);
    await assert.rejects(f.apply(plan), /permissions/);
    fs.chmodSync(file, 0o600);
    fs.writeFileSync(file, "not-json SECRET");
    await assert.rejects(f.apply(plan), (e: Error) => !e.message.includes("SECRET"));
    fs.writeFileSync(file, original.replace('"mailer_otp_length":6', '"mailer_otp_length":8'));
    await assert.rejects(f.apply(plan), /policy/);
    fs.rmSync(file);
    await assert.rejects(f.apply(plan), /Cannot read/);
    fs.writeFileSync(`${file}.other`, original, { mode: 0o600 });
    fs.symlinkSync(`${file}.other`, file);
    await assert.rejects(f.apply(plan), /Cannot read/);
    await assert.rejects(f.apply({ ...plan, id: "../../some-file" }), /Invalid plan/);
    assert.equal(f.writes.length, 0);
  } finally { f.dispose(); }
});
test("incomplete provider snapshot or unsafe backup directory cannot admit a plan", async () => {
  const f = fixture();
  try {
    fs.chmodSync(f.directory, 0o755);
    await assert.rejects(f.plan(), /private/);
    fs.chmodSync(f.directory, 0o700);
    f.port.read = async () => ({ site_url: "https://example.test" });
    await assert.rejects(f.plan(), /incomplete/);
    assert.equal(f.writes.length, 0);
  } finally { f.dispose(); }
});
test("symlinked backup directories and no-op plans are refused", async () => {
  const f = fixture();
  const link = `${f.directory}-link`;
  try {
    fs.symlinkSync(f.directory, link);
    await assert.rejects(prepareAuthPlan({ ...f, directory: link, patch: { mailer_otp_length: 6 } }), /symlink/);
    await assert.rejects(f.plan({ mailer_autoconfirm: false }), /no changes/);
    assert.deepEqual(fs.readdirSync(f.directory), []);
  } finally { fs.rmSync(link); f.dispose(); }
});
test("uncertain writes consume the attempt and never automatically retry or roll back", async () => {
  const f = fixture();
  try {
    const plan = await f.plan();
    let attempts = 0;
    f.port.patch = async () => { attempts++; throw new Error("ambiguous timeout"); };
    await assert.rejects(f.apply(plan), /timeout/);
    await assert.rejects(f.apply(plan), /already attempted/);
    assert.equal(attempts, 1);
  } finally { f.dispose(); }
});
test("only one concurrent application can write", async () => {
  const f = fixture();
  try {
    const plan = await f.plan();
    const outcomes = await Promise.allSettled([f.apply(plan), f.apply(plan)]);
    assert.equal(outcomes.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(f.writes.length, 1);
  } finally { f.dispose(); }
});
test("readback detects missing edits and unrelated credential changes without broad rollback", async () => {
  for (const unrelated of [false, true]) {
    const f = fixture();
    try {
      const plan = await f.plan();
      f.port.patch = async (patch) => {
        f.writes.push(patch);
        if (unrelated) Object.assign(f.config(), patch, { smtp_pass: "provider-drift" });
      };
      await assert.rejects(f.apply(plan), /readback differs/);
      assert.equal(f.writes.length, 1);
      assert(!fs.existsSync(path.join(f.directory, `${plan.id}.json.verified`)));
    } finally { f.dispose(); }
  }
});
test("HTTP adapter pins target, disables redirects, bounds requests, and redacts failures without retries", async () => {
  assert.throws(() => supabaseAuthPort(""), /explicit/);
  const requests: { url: string; method?: string; body?: BodyInit | null }[] = [];
  const fakeFetch: typeof fetch = async (input, init) => {
    assert.equal(init?.redirect, "error");
    assert(init?.signal);
    requests.push({ url: String(input), method: init?.method, body: init?.body });
    return new Response(JSON.stringify(fixtureConfig()));
  };
  const port = supabaseAuthPort("test-only-access-token", fakeFetch);
  await port.read();
  await port.patch({ mailer_otp_length: 6 });
  assert(requests.every((r) => r.url === `https://api.supabase.com/v1/projects/${project}/config/auth`));
  assert.equal(requests[1].method, "PATCH");
  assert.equal(requests[1].body, '{"mailer_otp_length":6}');
  for (const response of [new Response("SECRET", { status: 403 }), new Response("SECRET", { status: 302 }),
    new Response("SECRET not json"), new Response("x".repeat(512 * 1024 + 1))]) {
    let calls = 0;
    const broken = supabaseAuthPort("test-only-access-token", async () => { calls++; return response; });
    await assert.rejects(broken.read(), (e: Error) => /Provider request failed/.test(e.message) && !e.message.includes("SECRET"));
    assert.equal(calls, 1);
  }
  const unavailable = supabaseAuthPort("test-only-access-token", async () => { throw Error("SECRET timeout"); });
  await assert.rejects(unavailable.read(), (e: Error) => !e.message.includes("SECRET"));
});
test("CLI refuses unsafe input from another directory without credentials or provider calls", () => {
  const f = fixture();
  try {
    const patch = path.join(f.directory, "patch.json");
    fs.writeFileSync(patch, JSON.stringify({ external_google_secret: "DO_NOT_PRINT_THIS" }), { mode: 0o600 });
    for (const args of [[], ["plan", "--project", "other", "--patch", patch],
      ["plan", "--project", project, "--patch", patch], ["apply", "--project", project, "--plan", "bad"]]) {
      const result = spawnSync(process.execPath, ["--import", path.join(root, "node_modules/tsx/dist/loader.mjs"),
        path.join(root, "scripts/production-auth-config.ts"), ...args], {
        cwd: f.directory, env: { PATH: process.env.PATH, NODE_ENV: "test" }, encoding: "utf8", timeout: 10_000,
      });
      assert.equal(result.status, 1);
      assert(!`${result.stdout}${result.stderr}`.includes("DO_NOT_PRINT_THIS"));
    }
  } finally { f.dispose(); }
});
