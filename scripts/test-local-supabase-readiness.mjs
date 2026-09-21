import assert from "node:assert/strict";
import fs from "node:fs";
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
assert.match(acceptance, /api: 56321, db: 56322/);
for (const driver of ["SUQPAGE_DATABASE_DRIVER", "SUQPAGE_AUTH_DRIVER", "SUQPAGE_MEDIA_DRIVER"]) {
    assert.match(acceptance, new RegExp(`${driver}: "${driver === "SUQPAGE_DATABASE_DRIVER" ? "postgres" : "supabase"}"`));
}
assert.match(acceptance, /supabase", \["stop", "--workdir", supabaseProjectRoot, "--no-backup"\]/);
assert.doesNotMatch(acceptanceProbe, /node:sqlite|DatabaseSync/);
assert.doesNotMatch(acceptanceVideo, /node:sqlite|DatabaseSync/);
assert.match(qualityWorkflow, /browser:[\s\S]*?supabase\/setup-cli@3c2f5e2ae34c34e428e8e206e2c4d21fa2d20fbf[\s\S]*?version: 2\.111\.0[\s\S]*?npm run test:acceptance/);
console.log("Local Supabase PostgreSQL, Auth, Storage, and isolation contracts passed.");
