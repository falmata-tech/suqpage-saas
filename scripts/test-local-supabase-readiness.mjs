import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync("supabase/config.toml", "utf8");
const example = fs.readFileSync(".env.example", "utf8");
const copy = fs.readFileSync("scripts/rehearse-postgres.ts", "utf8");
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
assert.match(config, /\[storage\.buckets\.mirtpage-media\][\s\S]*?public = false/);
assert.match(example, /^MIRTPAGE_DATABASE_DRIVER=postgres$/m);
assert.match(example, /^MIRTPAGE_POSTGRES_URL=postgresql:\/\/postgres:postgres@127\.0\.0\.1:54322\/postgres$/m);
assert.match(copy, /MIRTPAGE_APPROVE_LOCAL_COPY/);
assert.match(copy, /LOCAL_SUPABASE_PROFILE === "browser-test" \? "56322" : "54322"/);
assert.match(copy, /\["development", "browser-test"\]\.includes\(LOCAL_SUPABASE_PROFILE\)/);
assert.match(copy, /commandKeepAlive/);
assert.match(copy, /if \(targetConnected && transactionStarted\)/);
assert.match(generator, /supabase-runtime\.env/);
assert.match(generator, /mode: 0o600/);
assert.doesNotMatch(generator, /console\.log\([^)]*(ANON_KEY|SERVICE_ROLE_KEY|publishableKey|serviceRoleKey)/);
assert.match(runtimeConfig, /MIRTPAGE_DATABASE_DRIVER is required/);
assert.match(runtimeConfig, /isApprovedProviderUrl/);
assert.match(runtimeConfig, /\["127\.0\.0\.1", "localhost", "\[::1\]"\]/);
assert.match(compose, /MIRTPAGE_DATABASE_DRIVER: postgres/);
assert.doesNotMatch(compose, /MIRTPAGE_DATABASE_DRIVER: sqlite/);
for (const scriptName of [
  "local:postgres:copy",
  "local:postgres:migrate",
  "local:auth:migrate",
  "local:media:migrate",
]) {
  assert.match(packageJson.scripts[scriptName], /^.*tsx --env-file=\.local\/supabase-runtime\.env /);
  assert.doesNotMatch(packageJson.scripts[scriptName], /node --env-file=.*--import tsx/);
}
assert.match(packageJson.scripts["local:media:migrate"], /--execute$/);
assert.equal(packageJson.scripts["dev:local"], "node scripts/start-local-dev.mjs");
assert.match(localDev, /process\.loadEnvFile\("\.local\/supabase-runtime\.env"\)/);
assert.match(localDev, /MIRTPAGE_DATABASE_DRIVER !== "postgres"/);
assert.match(localDev, /"54322"/);
assert.match(localDev, /"54321"/);
assert.match(acceptance, /mirtpage-browser-/);
assert.match(acceptance, /api: 56321, db: 56322/);
for (const driver of ["MIRTPAGE_DATABASE_DRIVER", "MIRTPAGE_AUTH_DRIVER", "MIRTPAGE_MEDIA_DRIVER"]) {
  assert.match(acceptance, new RegExp(`${driver}: "${driver === "MIRTPAGE_DATABASE_DRIVER" ? "postgres" : "supabase"}"`));
}
assert.match(acceptance, /supabase", \["stop", "--workdir", supabaseProjectRoot, "--no-backup"\]/);
assert.doesNotMatch(acceptanceProbe, /node:sqlite|DatabaseSync/);
assert.doesNotMatch(acceptanceVideo, /node:sqlite|DatabaseSync/);
assert.match(
  qualityWorkflow,
  /browser:[\s\S]*?supabase\/setup-cli@3c2f5e2ae34c34e428e8e206e2c4d21fa2d20fbf[\s\S]*?version: 2\.111\.0[\s\S]*?npm run test:acceptance/,
);
console.log("Local Supabase PostgreSQL, Auth, Storage, and isolation contracts passed.");
