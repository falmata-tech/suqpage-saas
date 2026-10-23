import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { browserSupabasePorts, remapBrowserSupabaseConfigPorts } from "./acceptance-supabase-readiness.mjs";
const config = fs.readFileSync("supabase/config.toml", "utf8");
const example = fs.readFileSync(".env.example", "utf8");
const nativeSetup = fs.readFileSync("scripts/setup.ts", "utf8");
const nativeMigrations = fs.readFileSync("lib/postgres-migrations.ts", "utf8");
const generator = fs.readFileSync("scripts/configure-local-supabase.mjs", "utf8");
const runtimeConfig = fs.readFileSync("lib/config.ts", "utf8");
const compose = fs.readFileSync("docker-compose.yml", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const localDev = fs.readFileSync("scripts/start-local-dev.mjs", "utf8");
const acceptance = fs.readFileSync("scripts/acceptance-runner.mjs", "utf8");
const acceptanceProbe = fs.readFileSync("scripts/acceptance-db-probe.mjs", "utf8");
const acceptanceVideo = fs.readFileSync("scripts/acceptance-video-fixture.mjs", "utf8");
const qualityWorkflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
assert.match(config, /\[db\.pooler\][\s\S]*?enabled = false/);
assert.match(config, /\[realtime\][\s\S]*?enabled = false/);
assert.match(config, /\[studio\][\s\S]*?enabled = false/);
assert.match(config, /\[edge_runtime\][\s\S]*?enabled = false/);
assert.match(config, /\[analytics\][\s\S]*?enabled = false/);
assert.match(config, /minimum_password_length = 12/);
assert.match(config, /password_requirements = "lower_upper_letters_digits"/);
function configSection(source, name) {
    const start = source.indexOf(`[${name}]\n`);
    assert.notEqual(start, -1, `Missing ${name} configuration`);
    return source.slice(start).split(/\n\[/, 1)[0];
}
const localRates = configSection(config, "auth.rate_limit");
for (const [key, value] of Object.entries({ email_sent: 120, sms_sent: 30, anonymous_users: 30, token_refresh: 150, sign_in_sign_ups: 30, token_verifications: 30, web3: 30 })) {
    assert.match(localRates, new RegExp(`^${key} = ${value}$`, "m"));
}
const localEmail = configSection(config, "auth.email");
for (const setting of ['enable_signup = true', 'double_confirm_changes = true', 'enable_confirmations = true', 'max_frequency = "1s"', 'otp_length = 6', 'otp_expiry = 3600']) {
    assert.ok(localEmail.split("\n").includes(setting), `Local email must retain ${setting}`);
}
const localSmtp = configSection(config, "auth.email.smtp");
assert.match(localSmtp, /^enabled = true$/m);
assert.match(localSmtp, /^host = "supabase_inbucket_mirtpage"$/m);
assert.match(localSmtp, /^port = 1025$/m);
assert.doesNotMatch(localSmtp.split("\n").filter(line => !line.trimStart().startsWith("#")).join("\n"), /env\(|smtp\.gmail|smtp\.resend|smtp\.sendgrid/);
assert.match(config, /\[auth\.external\.google\][\s\S]*?enabled = false[\s\S]*?client_id = "env\(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID\)"[\s\S]*?secret = "env\(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET\)"[\s\S]*?skip_nonce_check = false[\s\S]*?email_optional = false/);
assert.match(config, /\[storage\.buckets\.mirtpage-media\][\s\S]*?public = false/);
assert.match(example, /^SUQPAGE_DATABASE_DRIVER=postgres$/m);
assert.match(example, /^SUQPAGE_POSTGRES_URL=postgresql:\/\/postgres:postgres@127\.0\.0\.1:54322\/postgres$/m);
assert.match(example, /^SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=$/m);
assert.match(example, /^SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=$/m);
assert.match(nativeSetup, /Demo setup only permits a local PostgreSQL target/);
assert.match(nativeSetup, /existing data preserved/);
assert.match(nativeMigrations, /Refusing to install into an unversioned populated schema/);
assert.match(nativeMigrations, /REVOKE ALL ON ALL TABLES/);
assert.match(generator, /supabase-runtime\.env/);
assert.doesNotMatch(generator, /googleConfigured|providerConfiguration/);
assert.match(generator, /SUQPAGE_GOOGLE_AUTH_ENABLED=0/);
assert.match(generator, /mode: 0o600/);
assert.doesNotMatch(generator, /console\.log\([^)]*(ANON_KEY|SERVICE_ROLE_KEY|publishableKey|serviceRoleKey)/);
assert.match(runtimeConfig, /SUQPAGE_DATABASE_DRIVER must be postgres in every environment/);
assert.match(runtimeConfig, /isApprovedProviderUrl/);
assert.match(runtimeConfig, /\["127\.0\.0\.1", "localhost", "\[::1\]"\]/);
assert.match(compose, /SUQPAGE_DATABASE_DRIVER: postgres/);
assert.doesNotMatch(compose, /SUQPAGE_DATABASE_DRIVER: sqlite/);
for (const scriptName of [
    "local:postgres:seed",
    "local:postgres:migrate",
    "local:auth:migrate",
    "local:media:migrate",
]) {
    assert.match(packageJson.scripts[scriptName], /--env-file=\.local\/supabase-runtime\.env/);
}
assert.match(packageJson.scripts["local:media:migrate"], /--execute$/);
assert.equal(packageJson.scripts["dev:local"], "node scripts/start-local-dev.mjs");
assert.equal(packageJson.scripts.dev, packageJson.scripts['dev:local']);
assert.match(localDev, /process\.loadEnvFile\("\.local\/supabase-runtime\.env"\)/);
assert.match(localDev, /SUQPAGE_DATABASE_DRIVER !== "postgres"/);
assert.match(localDev, /"54322"/);
assert.match(localDev, /"54321"/);
assert.match(acceptance, /suqpage-browser-/);
assert.ok(acceptance.includes('.replaceAll("supabase_inbucket_mirtpage", `supabase_inbucket_${browserSupabaseProjectId}`)'), "Browser fixtures use their isolated mail catcher");
assert.match(acceptance, /browserSupabasePorts\(\)/);
assert.deepEqual(browserSupabasePorts({}), {
    api: 56321, db: 56322, shadow: 56320, smtp: 56324, pooler: 56329, analytics: 56327,
});
assert.deepEqual(browserSupabasePorts({ SUQPAGE_BROWSER_SUPABASE_API_PORT: "54321" }), {
    api: 54321, db: 54322, shadow: 54320, smtp: 54324, pooler: 54329, analytics: 54327,
});
assert.match(acceptance, /"--ignore-health-check"/);
assert.match(acceptance, /await waitForBrowserSupabaseReady\([\s\S]*?supabase", \["status"/);
assert.match(acceptance, /\.replace\(\/\^email_sent = 120\$\/m, "email_sent = 6"\)/);
// Execute only the actual config-preparation function, with no real filesystem,
// process, service or network capability. This proves its finite quota remap and
// refusal before writes, rather than just repeating the source regexp.
const prepareStart = acceptance.indexOf("function prepareBrowserSupabaseProject() {");
const prepareEnd = acceptance.indexOf("\nfunction run(", prepareStart);
assert.ok(prepareStart >= 0 && prepareEnd > prepareStart);
const prepareSource = acceptance.slice(prepareStart, prepareEnd);
function prepareConfigFixture(source) {
    const writes = [], copies = [];
    const context = {
        path,
        process: { cwd: () => "/fixture/repository" },
        supabaseConfigRoot: "/fixture/disposable/supabase",
        browserSupabaseProjectId: "suqpage-browser-123",
        browserPorts: browserSupabasePorts({}),
        baseURL: "http://127.0.0.1:3109",
        remapBrowserSupabaseConfigPorts,
        fs: {
            mkdirSync() {},
            readFileSync(file) { assert.equal(file, "/fixture/repository/supabase/config.toml"); return source; },
            writeFileSync(file, value, options) { writes.push({ file, value, options }); },
            copyFileSync(from, to) { copies.push({ from, to }); },
            cpSync(from, to, options) { copies.push({ from, to, options }); },
        },
    };
    let error;
    try { vm.runInNewContext(`${prepareSource}\nprepareBrowserSupabaseProject();`, context, { timeout: 1000 }); }
    catch (failure) { error = failure; }
    return { writes, copies, error };
}
const prepared = prepareConfigFixture(config);
assert.equal(prepared.error, undefined);
assert.equal(prepared.writes.length, 1);
assert.equal(prepared.writes[0].file, "/fixture/disposable/supabase/config.toml");
assert.equal(prepared.writes[0].options.flag, "wx");
const disposableConfig = prepared.writes[0].value;
assert.match(disposableConfig, /^project_id = "suqpage-browser-123"$/m);
assert.match(configSection(disposableConfig, "auth.rate_limit"), /^email_sent = 6$/m);
assert.equal(configSection(disposableConfig, "auth.rate_limit").replace(/^email_sent = 6$/m, "email_sent = 120"), localRates);
assert.equal(configSection(disposableConfig, "auth.email"), localEmail);
assert.equal(configSection(disposableConfig, "auth.email.smtp").replaceAll("supabase_inbucket_suqpage-browser-123", "supabase_inbucket_mirtpage"), localSmtp);
assert.match(disposableConfig, /^site_url = "http:\/\/127\.0\.0\.1:3109"$/m);
assert.equal(prepared.copies.length, 2);
for (const baseline of ["email_sent = 2", "email_sent = 6", "email_sent = 0", "email_sent = 999", "email_sent = 120\nemail_sent = 120", "# email quota missing"]) {
    const rejected = prepareConfigFixture(config.replace(/^email_sent = 120$/m, baseline));
    assert.match(rejected.error?.message || "", /Unexpected developer email limit/);
    assert.deepEqual(rejected.writes, []);
    assert.deepEqual(rejected.copies, []);
}
for (const driver of ["SUQPAGE_DATABASE_DRIVER", "SUQPAGE_AUTH_DRIVER", "SUQPAGE_MEDIA_DRIVER"]) {
    assert.match(acceptance, new RegExp(`${driver}: "${driver === "SUQPAGE_DATABASE_DRIVER" ? "postgres" : "supabase"}"`));
}
assert.match(acceptance, /supabase", \["stop", "--workdir", supabaseProjectRoot, "--no-backup"\]/);
assert.doesNotMatch(acceptanceProbe, /node:sqlite|DatabaseSync/);
assert.doesNotMatch(acceptanceVideo, /node:sqlite|DatabaseSync/);
assert.match(qualityWorkflow, /browser:[\s\S]*?supabase\/setup-cli@3c2f5e2ae34c34e428e8e206e2c4d21fa2d20fbf[\s\S]*?version: 2\.111\.0[\s\S]*?npm run test:acceptance/);
console.log("Local Supabase PostgreSQL, Auth, Storage, and isolation contracts passed.");
