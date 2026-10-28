import assert from "node:assert/strict";
import { africMadeEmailBrandingPatch } from "./auth-email-templates";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  applyAuthPlan, AUTH_ORIGIN_POLICIES, digest, expectedAuthReadback, prepareAuthOriginPlan, prepareAuthPlan,
  PRODUCTION_AUTH, supabaseAuthPort, validatePatch,
  type AuthConfig, type AuthConfigPort, type AuthOriginPhase,
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
    credential: { source: "env", fingerprint: digest("fixture-credential") },
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
  { mailer_subjects_confirmation: "Your MirtPage sign-in code" },
  { mailer_subjects_magic_link: "Arbitrary subject" },
  { smtp_sender_name: "Suqpage" }, { mailer_subjects_confirmation: "Your Suqpage sign-in code" },
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
test("all AfricMade email branding is exact and cannot alter providers or sender addresses", () => {
  const patch = africMadeEmailBrandingPatch();
  assert.equal(Object.keys(patch).length, 27);
  validatePatch(project, patch, template);
  for (const [key, value] of Object.entries(patch)) {
    assert.doesNotMatch(value, /mirtpage|africpage|suqpage/i);
    assert.throws(() => validatePatch(project, { [key]: "unreviewed" }, template));
  }
  for (const patch of [{ smtp_admin_email: "new@example.test" }, { mailer_notifications_email_changed_enabled: true }]) {
    assert.throws(() => validatePatch(project, patch, template));
  }
});

test("email contrast repair admits only the thirteen exact HTML fields", () => {
  const patch=Object.fromEntries(Object.entries(africMadeEmailBrandingPatch()).filter(([key])=>key.startsWith("mailer_templates_")&&key.endsWith("_content")));
  assert.equal(Object.keys(patch).length,13);
  assert.ok(Object.keys(patch).every(key=>key.startsWith("mailer_templates_")));
  for(const html of Object.values(patch))assert.match(html,/africmade-wordmark-email-white-v3\.png/);
  validatePatch(project,patch,template);
});

test("saved legacy-brand settings plans are rejected before any provider read", async () => {
  const f = fixture();
  try {
    const plan = await f.plan({ smtp_sender_name: "AfricMade" });
    const file = path.join(f.directory, `${plan.id}.json`);
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    saved.patch.smtp_sender_name = "Suqpage";
    fs.writeFileSync(file, JSON.stringify(saved));
    const denied = { ...f.port, async project() { throw Error("Old presentation must fail before provider reads"); } };
    await assert.rejects(applyAuthPlan({ ...f, ...plan, approval: digest(saved), port: denied }), /policy/);
    assert.equal(f.writes.length, 0);
    assert.ok(!fs.existsSync(`${file}.attempt`));
  } finally { f.dispose(); }
});

test("plans bind credential source and login, and reject old unbound plans before provider calls", async () => {
  const f = fixture();
  try {
    const plan = await f.plan();
    assert.equal(plan.credentialSource, "env");
    const file = path.join(f.directory, `${plan.id}.json`);
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.equal(saved.version, 3);
    assert.equal(saved.kind, "legacy-settings");
    assert.equal(saved.sourcePhase, null);
    assert.equal(saved.targetPhase, null);
    assert.ok(!fs.readFileSync(file, "utf8").includes("fixture-credential"));
    const denied = { ...f.port, async project() { throw Error("Must reject before provider read"); } };
    for (const credential of [{ source: "cli" as const, fingerprint: f.port.credential.fingerprint },
      { source: "env" as const, fingerprint: digest("other-login") }]) {
      await assert.rejects(applyAuthPlan({ ...f, ...plan, port: { ...denied, credential } }), /Credential/);
    }
    for (const version of [1, 2]) {
      fs.writeFileSync(file, JSON.stringify({ ...saved, version }));
      await assert.rejects(applyAuthPlan({ ...f, ...plan, port: denied }), /Invalid plan/);
    }
    assert.equal(f.writes.length, 0);
    assert.ok(!fs.existsSync(`${file}.attempt`));
  } finally { f.dispose(); }
});

test("explicit target and safe exact patch are required", async () => {
  assert.throws(() => validatePatch("another-project", { mailer_otp_length: 6 }, template), /project/);
  validatePatch(project, { mailer_otp_length: 6, mailer_otp_exp: 600, smtp_max_frequency: 60, mailer_autoconfirm: false,
    mailer_subjects_confirmation: "Your AfricMade sign-in code", mailer_subjects_magic_link: "Your AfricMade sign-in code",
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

test("readback predicts only approved customization flags and preserves every other field", async () => {
  for (const corruption of ["none", "unrelated-flag", "false-flag", "removed", "added", "wrong-type", "content", "credential"]) {
    const f = fixture();
    try {
      const config = f.config();
      config.mailer_subjects_custom_contents = { MAILER_SUBJECTS_INVITE: false, MAILER_SUBJECTS_RECOVERY: false };
      config.mailer_templates_custom_contents = { MAILER_TEMPLATES_INVITE_CONTENT: false };
      const patch = { mailer_subjects_invite: "You are invited to AfricMade",
        mailer_templates_invite_content: africMadeEmailBrandingPatch().mailer_templates_invite_content };
      const plan = await f.plan(patch);
      const originalPatch = f.port.patch;
      f.port.patch = async request => {
        assert.deepEqual(request, patch); // Derived flags never enter the write.
        await originalPatch(request);
        const after = f.config();
        const subjects = after.mailer_subjects_custom_contents as Record<string, unknown>;
        const templates = after.mailer_templates_custom_contents as Record<string, unknown>;
        subjects.MAILER_SUBJECTS_INVITE = true;
        templates.MAILER_TEMPLATES_INVITE_CONTENT = true;
        if (corruption === "unrelated-flag") subjects.MAILER_SUBJECTS_RECOVERY = true;
        if (corruption === "false-flag") subjects.MAILER_SUBJECTS_INVITE = false;
        if (corruption === "removed") delete subjects.MAILER_SUBJECTS_RECOVERY;
        if (corruption === "added") subjects.UNREVIEWED = true;
        if (corruption === "wrong-type") subjects.MAILER_SUBJECTS_INVITE = "true";
        if (corruption === "content") after.mailer_subjects_invite = "unexpected";
        if (corruption === "credential") after.smtp_pass = "changed";
      };
      if (corruption === "none") await f.apply(plan);
      else await assert.rejects(f.apply(plan), /readback/);
      assert.equal(f.writes.length, 1);
      assert.equal(fs.existsSync(path.join(f.directory, `${plan.id}.json.verified`)), corruption === "none");
      await assert.rejects(f.apply(plan), /already attempted/);
    } finally { f.dispose(); }
  }
});
test("customization metadata is immutable and malformed metadata cannot admit a write", async () => {
  const before = { mailer_subjects_custom_contents: { MAILER_SUBJECTS_INVITE: false } };
  const expected = expectedAuthReadback(before, { mailer_subjects_invite: "You are invited to AfricMade" });
  assert.equal(before.mailer_subjects_custom_contents.MAILER_SUBJECTS_INVITE, false);
  assert.deepEqual(expected.mailer_subjects_custom_contents, { MAILER_SUBJECTS_INVITE: true });
  for (const flags of [null, [], { MAILER_SUBJECTS_INVITE: "false" }]) {
    const f = fixture();
    try {
      f.config().mailer_subjects_custom_contents = flags;
      const plan = await f.plan({ mailer_subjects_invite: "You are invited to AfricMade" });
      await assert.rejects(f.apply(plan), /metadata/);
      assert.equal(f.writes.length, 0);
      assert.equal(fs.existsSync(path.join(f.directory, `${plan.id}.json.attempt`)), false);
    } finally { f.dispose(); }
  }
});

const transitions: readonly [AuthOriginPhase, AuthOriginPhase][] = [
  ["legacy", "dual-old-primary"], ["dual-old-primary", "dual-new-primary"], ["dual-new-primary", "dual-old-primary"],
  ["dual-new-primary", "africmade-callback-old-primary"],
  ["africmade-callback-old-primary", "africmade-primary"],
  ["africmade-primary", "africmade-callback-old-primary"],
];
function originFixture(sourcePhase: AuthOriginPhase = "legacy") {
  const f = fixture();
  Object.assign(f.config(), AUTH_ORIGIN_POLICIES[sourcePhase]);
  return { ...f, originPlan(targetPhase: unknown = "dual-old-primary") {
    return prepareAuthOriginPlan({ ...f, sourcePhase, targetPhase });
  } };
}

for (const [sourcePhase, targetPhase] of transitions) {
  test(`origin transition ${sourcePhase} to ${targetPhase} binds the exact two fields and preserves the complete provider state`, async () => {
    const f = originFixture(sourcePhase);
    try {
      const before = structuredClone(f.config());
      const plan = await f.originPlan(targetPhase);
      const file = path.join(f.directory, `${plan.id}.json`);
      const saved = JSON.parse(fs.readFileSync(file, "utf8"));
      assert.equal(saved.version, 3);
      assert.equal(saved.kind, "origin-transition");
      assert.equal(saved.sourcePhase, sourcePhase);
      assert.equal(saved.targetPhase, targetPhase);
      assert.deepEqual(saved.before, before);
      assert.deepEqual(saved.patch, AUTH_ORIGIN_POLICIES[targetPhase]);
      assert.equal(plan.approval, digest(saved));
      assert.equal(plan.sourcePhase, sourcePhase);
      assert.equal(plan.targetPhase, targetPhase);
      assert.equal(plan.origin, AUTH_ORIGIN_POLICIES[targetPhase].site_url);
      assert.equal(fs.statSync(file).mode & 0o777, 0o600);
      assert.equal(f.writes.length, 0);
      assert.doesNotMatch(JSON.stringify(plan), /test-only|production-client/);
      await f.apply(plan);
      assert.deepEqual(f.writes, [AUTH_ORIGIN_POLICIES[targetPhase]]);
      assert.deepEqual(f.config(), { ...before, ...AUTH_ORIGIN_POLICIES[targetPhase] });
      assert.ok(fs.existsSync(`${file}.verified`));
      await assert.rejects(f.apply(plan), /already attempted/);
    } finally { f.dispose(); }
  });
}

test("origin policy tuples are exact and no phase can retire the legacy callback", () => {
  assert.deepEqual(AUTH_ORIGIN_POLICIES, {
    legacy: { site_url: "https://suqpage.com", uri_allow_list: "https://suqpage.com/auth/callback" },
    "dual-old-primary": { site_url: "https://suqpage.com", uri_allow_list: "https://suqpage.com/auth/callback,https://mirtpage.com/auth/callback" },
    "dual-new-primary": { site_url: "https://mirtpage.com", uri_allow_list: "https://suqpage.com/auth/callback,https://mirtpage.com/auth/callback" },
    "africmade-callback-old-primary": { site_url: "https://mirtpage.com", uri_allow_list: "https://suqpage.com/auth/callback,https://mirtpage.com/auth/callback,https://africmade.com/auth/callback" },
    "africmade-primary": { site_url: "https://africmade.com", uri_allow_list: "https://suqpage.com/auth/callback,https://mirtpage.com/auth/callback,https://africmade.com/auth/callback" },
  });
  assert.ok(Object.isFrozen(AUTH_ORIGIN_POLICIES));
  for (const policy of Object.values(AUTH_ORIGIN_POLICIES)) {
    assert.ok(Object.isFrozen(policy));
    assert.ok(policy.uri_allow_list.split(",").includes("https://suqpage.com/auth/callback"));
    for (const patch of [policy, { site_url: policy.site_url }, { uri_allow_list: policy.uri_allow_list },
      { ...policy, mailer_otp_length: 6 }]) {
      assert.throws(() => validatePatch(project, patch, template), /forbidden/);
    }
  }
  for (const phase of ["africmade-callback-old-primary", "africmade-primary"] as const) {
    const allowed = AUTH_ORIGIN_POLICIES[phase].uri_allow_list.split(",");
    assert.deepEqual(allowed, ["https://suqpage.com/auth/callback", "https://mirtpage.com/auth/callback", "https://africmade.com/auth/callback"]);
  }
});

test("unsupported origin phases, skipped steps, no-ops and callback retirement reject before any provider call", async () => {
  const f = fixture();
  try {
    let calls = 0;
    f.port.project = async () => { calls++; throw Error("Provider must not be called"); };
    f.port.read = async () => { calls++; throw Error("Provider must not be called"); };
    for (const sourcePhase of Object.keys(AUTH_ORIGIN_POLICIES)) {
      for (const targetPhase of Object.keys(AUTH_ORIGIN_POLICIES)) {
        if (transitions.some(([source, target]) => source === sourcePhase && target === targetPhase)) continue;
        await assert.rejects(prepareAuthOriginPlan({ ...f, sourcePhase, targetPhase }), /phase transition/);
      }
    }
    for (const phase of [undefined, null, [], {}, "__proto__", "toString", "new-only", "https://mirtpage.com",
      "https://www.mirtpage.com", "https://mirtpage.com:443", "http://mirtpage.com", "https://mirtpage.com/?q=1",
      "https://africmade.com", "https://www.africmade.com", "https://africmade.com:443", "http://africmade.com",
      "africmade-primary?uri_allow_list=*"]) {
      await assert.rejects(prepareAuthOriginPlan({ ...f, sourcePhase: "legacy", targetPhase: phase }), /phase/);
      await assert.rejects(prepareAuthOriginPlan({ ...f, sourcePhase: phase, targetPhase: "dual-old-primary" }), /phase/);
    }
    await assert.rejects(prepareAuthOriginPlan({ ...f, project: "other", sourcePhase: "legacy", targetPhase: "dual-old-primary" }), /project/);
    assert.equal(calls, 0);
    assert.equal(f.writes.length, 0);
    assert.deepEqual(fs.readdirSync(f.directory), []);
  } finally { f.dispose(); }
});

test("source phase must exactly match the complete current origin tuple before a plan is created", async () => {
  for (const mismatch of [
    { uri_allow_list: undefined },
    { site_url: "https://www.suqpage.com" },
    { uri_allow_list: "https://suqpage.com/auth/callback,https://preview.example.test/auth/callback" },
    { ...AUTH_ORIGIN_POLICIES["dual-new-primary"] },
    { uri_allow_list: "https://mirtpage.com/auth/callback,https://suqpage.com/auth/callback" },
  ]) {
    const f = originFixture();
    try {
      Object.assign(f.config(), mismatch);
      await assert.rejects(f.originPlan(), /exact source phase/);
      assert.equal(f.writes.length, 0);
      assert.deepEqual(fs.readdirSync(f.directory), []);
    } finally { f.dispose(); }
  }
});

test("AfricMade stages reject a wrong current host or changed callback list before a plan exists", async () => {
  for (const [sourcePhase, targetPhase, mismatch] of [
    ["dual-new-primary", "africmade-callback-old-primary", { uri_allow_list: AUTH_ORIGIN_POLICIES["africmade-callback-old-primary"].uri_allow_list }],
    ["africmade-callback-old-primary", "africmade-primary", { uri_allow_list: AUTH_ORIGIN_POLICIES["dual-new-primary"].uri_allow_list }],
    ["africmade-callback-old-primary", "africmade-primary", { uri_allow_list: `${AUTH_ORIGIN_POLICIES["africmade-callback-old-primary"].uri_allow_list},https://unreviewed.test/auth/callback` }],
    ["africmade-primary", "africmade-callback-old-primary", { site_url: "https://www.africmade.com" }],
  ] as const) {
    const f = originFixture(sourcePhase);
    try {
      Object.assign(f.config(), mismatch);
      await assert.rejects(f.originPlan(targetPhase), /exact source phase/);
      assert.equal(f.writes.length, 0);
      assert.deepEqual(fs.readdirSync(f.directory), []);
    } finally { f.dispose(); }
  }
});

test("AfricMade plans reject removed callbacks, extra hosts, wrong primary and mixed settings before provider access", async () => {
  for (const [sourcePhase, targetPhase] of [
    ["dual-new-primary", "africmade-callback-old-primary"],
    ["africmade-callback-old-primary", "africmade-primary"],
  ] as const) {
    const f = originFixture(sourcePhase);
    try {
      const plan = await f.originPlan(targetPhase);
      const file = path.join(f.directory, `${plan.id}.json`);
      const original = JSON.parse(fs.readFileSync(file, "utf8"));
      const target = AUTH_ORIGIN_POLICIES[targetPhase];
      let providerCalls = 0;
      f.port.project = async () => { providerCalls++; throw Error("Provider must not be called"); };
      f.port.read = async () => { providerCalls++; throw Error("Provider must not be called"); };
      for (const patch of [
        { ...target, uri_allow_list: AUTH_ORIGIN_POLICIES["dual-new-primary"].uri_allow_list },
        { ...target, uri_allow_list: `${target.uri_allow_list},https://unreviewed.test/auth/callback` },
        { ...target, site_url: "https://www.africmade.com" },
        { ...target, external_google_enabled: false },
      ]) {
        const edited = { ...original, patch };
        fs.writeFileSync(file, JSON.stringify(edited));
        await assert.rejects(f.apply({ ...plan, approval: digest(edited) }), /exact target phase policy/);
      }
      assert.equal(providerCalls, 0);
      assert.equal(f.writes.length, 0);
      assert.equal(fs.existsSync(`${file}.attempt`), false);
    } finally { f.dispose(); }
  }
});

test("origin plan kind, phases and mixed or malformed patches cannot be laundered with a new approval digest", async () => {
  const f = originFixture();
  try {
    const plan = await f.originPlan();
    const file = path.join(f.directory, `${plan.id}.json`);
    const original = JSON.parse(fs.readFileSync(file, "utf8"));
    let calls = 0;
    f.port.project = async () => { calls++; throw Error("Provider must not be called"); };
    f.port.read = async () => { calls++; throw Error("Provider must not be called"); };
    const corruptions = [
      { version: 2 }, { kind: "unknown" }, { sourcePhase: "dual-old-primary" }, { targetPhase: "dual-new-primary" },
      { kind: "legacy-settings", sourcePhase: null, targetPhase: null },
      { sourcePhase: "dual-new-primary", targetPhase: "dual-old-primary" },
      ...[
        { site_url: "https://suqpage.com" }, { uri_allow_list: AUTH_ORIGIN_POLICIES["dual-old-primary"].uri_allow_list },
        { ...AUTH_ORIGIN_POLICIES["dual-old-primary"], smtp_pass: "smuggled-secret" },
        { ...AUTH_ORIGIN_POLICIES["dual-old-primary"], mailer_otp_length: 6 },
        { ...AUTH_ORIGIN_POLICIES["dual-old-primary"], mailer_subjects_magic_link: "Your MirtPage sign-in code" },
        { ...AUTH_ORIGIN_POLICIES["dual-old-primary"], external_google_enabled: true },
        { site_url: "https://suqpage.com", uri_allow_list: "https://mirtpage.com/auth/callback,https://suqpage.com/auth/callback" },
        { site_url: "https://mirtpage.com", uri_allow_list: "https://mirtpage.com/auth/callback" },
        { ...AUTH_ORIGIN_POLICIES["dual-old-primary"], site_url: "https://suqpage.com/" },
        { ...AUTH_ORIGIN_POLICIES["dual-old-primary"], uri_allow_list: `${AUTH_ORIGIN_POLICIES["dual-old-primary"].uri_allow_list},https://*.mirtpage.com/**` },
      ].map(patch => ({ patch })),
    ];
    for (const corruption of corruptions) {
      const edited = { ...original, ...corruption };
      fs.writeFileSync(file, JSON.stringify(edited));
      await assert.rejects(f.apply({ ...plan, approval: digest(edited) }), /plan|phase|policy|forbidden/);
    }
    assert.equal(calls, 0);
    assert.equal(f.writes.length, 0);
    assert.equal(fs.existsSync(`${file}.attempt`), false);
  } finally { f.dispose(); }
});

test("origin transitions retain credential, freshness, digest, drift and exclusive attempt fences", async () => {
  const f = originFixture();
  try {
    const plan = await f.originPlan();
    await assert.rejects(f.apply(plan, { approval: "0".repeat(64) }), /digest/);
    await assert.rejects(f.apply(plan, { now: now + 600_001 }), /expired/);
    await assert.rejects(f.apply(plan, { now: now - 1 }), /future/);
    const port = { ...f.port, credential: { source: "env" as const, fingerprint: digest("different-login") },
      async project() { throw Error("Must reject before provider read"); } };
    await assert.rejects(applyAuthPlan({ ...f, ...plan, port }), /Credential/);
    f.config().smtp_pass = "changed-in-dashboard";
    await assert.rejects(f.apply(plan), /changed after review/);
    f.config().smtp_pass = fixtureConfig().smtp_pass;
    assert.equal(f.writes.length, 0);
    const results = await Promise.allSettled([f.apply(plan), f.apply(plan)]);
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    assert.equal(f.writes.length, 1);
  } finally { f.dispose(); }
});

test("origin transition ambiguous writes and unrelated readback drift stop without retry or automatic restore", async () => {
  for (const failure of ["timeout", "unrelated-drift"] as const) {
    const f = originFixture();
    try {
      const plan = await f.originPlan();
      const original = f.port.patch;
      let attempts = 0;
      f.port.patch = async patch => {
        attempts++;
        if (failure === "timeout") throw Error("ambiguous timeout");
        await original(patch);
        f.config().external_google_secret = "unrelated-provider-change";
      };
      await assert.rejects(f.apply(plan), failure === "timeout" ? /timeout/ : /readback/);
      await assert.rejects(f.apply(plan), /already attempted/);
      assert.equal(attempts, 1);
      assert.equal(fs.existsSync(path.join(f.directory, `${plan.id}.json.verified`)), false);
    } finally { f.dispose(); }
  }
});

test("CLI finite phase selection refuses partial, mixed, arbitrary or apply-time phase input before credentials", () => {
  const f = fixture();
  try {
    const patch = path.join(f.directory, "patch.json");
    fs.writeFileSync(patch, JSON.stringify({ mailer_otp_length: 6 }), { mode: 0o600 });
    for (const args of [
      ["plan", "--from-phase", "legacy"], ["plan", "--to-phase", "dual-old-primary"],
      ["plan", "--from-phase=", "--to-phase=", "--patch", patch],
      ["plan", "--from-phase", "legacy", "--to-phase", "dual-new-primary"],
      ["plan", "--from-phase", "legacy", "--to-phase", "https://mirtpage.com"],
      ["plan", "--from-phase", "legacy", "--to-phase", "dual-old-primary", "--patch", patch],
      ...["--patch=", "--plan=", "--approve="].map(option =>
        ["plan", "--from-phase", "legacy", "--to-phase", "dual-old-primary", option]),
      ...["--plan=", "--approve="].map(option => ["plan", "--patch", patch, option]),
      ["apply", "--plan", "a".repeat(24), "--approve", "b".repeat(64), "--from-phase", "legacy", "--to-phase", "dual-old-primary"],
      ...["--patch=", "--from-phase=", "--to-phase="].map(option =>
        ["apply", "--plan", "a".repeat(24), "--approve", "b".repeat(64), option]),
      ["apply", "--plan=", "--approve", "b".repeat(64)],
      ["apply", "--plan", "a".repeat(24), "--approve="],
    ]) {
      const result = spawnSync(process.execPath, ["--import", path.join(root, "node_modules/tsx/dist/loader.mjs"),
        path.join(root, "scripts/production-auth-config.ts"), ...args, "--project", project], {
        cwd: f.directory, env: { PATH: process.env.PATH, NODE_ENV: "test" }, encoding: "utf8", timeout: 10_000,
      });
      assert.equal(result.status, 1);
      assert.doesNotMatch(`${result.stdout}${result.stderr}`, /SUPABASE_ACCESS_TOKEN|Provider request/);
      assert.match(result.stderr, /arguments|phase/);
    }
  } finally { f.dispose(); }
});
