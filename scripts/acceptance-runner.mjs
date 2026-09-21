import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const port = await new Promise((resolve, reject) => {
  const server = net.createServer();
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    const selected = typeof address === "object" && address ? address.port : 0;
    server.close((error) => error ? reject(error) : resolve(selected));
  });
});
const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-acceptance-"));
const runId = path.basename(root);
const distDir = path.posix.join(".next-acceptance", runId);
const buildOutputPath = path.join(process.cwd(), distDir);
const tsconfigName = `.acceptance-tsconfig-${runId}.json`;
const tsconfigPath = path.join(process.cwd(), tsconfigName);
const baseURL = `http://127.0.0.1:${port}`;
const credentialsPath = path.join(root, "credentials.txt");
const supabaseProjectRoot = path.join(root, "supabase-browser-project");
const supabaseConfigRoot = path.join(supabaseProjectRoot, "supabase");
const browserSupabaseProjectId = `suqpage-browser-${process.pid}`;
const browserSupabasePorts = { api: 56321, db: 56322, shadow: 56320, smtp: 56324, pooler: 56329, analytics: 56327 };
const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_APP_URL: baseURL,
  SUQPAGE_CANONICAL_URL: baseURL,
  SUQPAGE_RUNTIME_PROFILE: "browser-test",
  SUQPAGE_DATABASE_DRIVER: "postgres",
  SUQPAGE_AUTH_DRIVER: "supabase",
  SUQPAGE_MEDIA_DRIVER: "supabase",
  SUQPAGE_MEDIA_ROOT: path.join(root, "media"),
  SUQPAGE_BACKUP_ROOT: path.join(root, "backups"),
  SUQPAGE_CREDENTIAL_PATH: credentialsPath,
  PRIVACY_SALT: "acceptance-test-privacy-salt-long-enough",
  PORT: String(port),
    SUQPAGE_TEST_BASE_URL: baseURL,
    SUQPAGE_TEST_CREDENTIALS: credentialsPath,
    SUQPAGE_TEST_MAILPIT_URL: `http://127.0.0.1:${browserSupabasePorts.smtp}`,
  SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT: "1",
  SUQPAGE_SERVER_ACTION_ORIGINS: baseURL,
  SUQPAGE_NEXT_DIST_DIR: distDir,
  SUQPAGE_NEXT_TSCONFIG: tsconfigName,
};

function parseEnvironment(source) {
  const values = new Map();
  for (const line of source.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values.set(match[1], value);
  }
  return values;
}

function required(values, name) {
  const value = values.get(name) || "";
  if (!value) throw new Error(`Browser Supabase status did not provide ${name}.`);
  return value;
}

function prepareBrowserSupabaseProject() {
  fs.mkdirSync(supabaseConfigRoot, { recursive: true });
  let config = fs.readFileSync(path.join(process.cwd(), "supabase/config.toml"), "utf8");
  config = config
    .replace(/^project_id = ".*"$/m, `project_id = "${browserSupabaseProjectId}"`)
    .replaceAll("supabase_inbucket_mirtpage", `supabase_inbucket_${browserSupabaseProjectId}`)
    .replaceAll("54321", String(browserSupabasePorts.api))
    .replaceAll("54322", String(browserSupabasePorts.db))
    .replaceAll("54320", String(browserSupabasePorts.shadow))
    .replaceAll("54324", String(browserSupabasePorts.smtp))
    .replaceAll("54329", String(browserSupabasePorts.pooler))
    .replaceAll("54327", String(browserSupabasePorts.analytics))
    .replace(/^site_url = .*$/m, `site_url = "${baseURL}"`)
    .replace(/^additional_redirect_urls = .*$/m, `additional_redirect_urls = ["${baseURL}", "${baseURL}/auth/callback"]`);
  fs.writeFileSync(path.join(supabaseConfigRoot, "config.toml"), config, { flag: "wx" });
  fs.copyFileSync(path.join(process.cwd(), "supabase/seed.sql"), path.join(supabaseConfigRoot, "seed.sql"));
  fs.cpSync(
    path.join(process.cwd(), "supabase/templates"),
    path.join(supabaseConfigRoot, "templates"),
    { recursive: true },
  );
}

function run(command, args, { capture = false, allowFailure = false, environment = env } = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: environment,
    ...(capture ? { encoding: "utf8" } : { stdio: "inherit" }),
  });
  if (!allowFailure && result.status !== 0) {
    if (capture && result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} exited with ${result.status}`);
  }
  return capture ? result.stdout : "";
}

let app = null;
let browserSupabaseAttempted = false;

async function stop() {
  if (!app || app.exitCode !== null) return;
  try { process.platform === "win32" ? app.kill("SIGTERM") : process.kill(-app.pid, "SIGTERM"); }
  catch { app.kill("SIGTERM"); }
  await Promise.race([new Promise((resolve) => app.once("close", resolve)), new Promise((resolve) => setTimeout(resolve, 4_000))]);
}

try {
  prepareBrowserSupabaseProject();
  browserSupabaseAttempted = true;
  run("supabase", ["start", "--workdir", supabaseProjectRoot], { capture: true });
  const provider = parseEnvironment(run("supabase", ["status", "--workdir", supabaseProjectRoot, "-o", "env"], { capture: true }));
  const apiUrl = required(provider, "API_URL");
  const databaseUrl = required(provider, "DB_URL");
  if (new URL(apiUrl).port !== String(browserSupabasePorts.api) || new URL(databaseUrl).port !== String(browserSupabasePorts.db)) {
    throw new Error("Browser acceptance started on an unexpected Supabase port family.");
  }
  fs.writeFileSync(tsconfigPath, `${JSON.stringify({
    extends: "./tsconfig.json",
    include: [
      "next-env.d.ts",
      "app/**/*.ts",
      "app/**/*.tsx",
      "components/**/*.ts",
      "components/**/*.tsx",
      "lib/**/*.ts",
      "scripts/**/*.ts",
      "tests/**/*.ts",
    ],
    exclude: ["node_modules", ".next", ".next-*"],
  }, null, 2)}\n`, { flag: "wx" });
  Object.assign(env, {
    SUQPAGE_DATABASE_DRIVER: "postgres",
    SUQPAGE_POSTGRES_URL: databaseUrl,
    SUQPAGE_POSTGRES_DIRECT_URL: databaseUrl,
    SUQPAGE_LOCAL_POSTGRES_URL: databaseUrl,
    SUQPAGE_LOCAL_SUPABASE_PROFILE: "browser-test",
    SUQPAGE_POSTGRES_POOL_MAX: "4",
    SUQPAGE_POSTGRES_CONNECTION_TIMEOUT_MS: "5000",
    SUQPAGE_POSTGRES_STATEMENT_TIMEOUT_MS: "8000",
    SUQPAGE_MEDIA_DRIVER: "supabase",
    SUQPAGE_SUPABASE_URL: apiUrl,
    SUQPAGE_SUPABASE_SERVICE_ROLE_KEY: required(provider, "SERVICE_ROLE_KEY"),
    SUQPAGE_SUPABASE_STORAGE_BUCKET: "mirtpage-media",
    SUQPAGE_MEDIA_REQUEST_TIMEOUT_MS: "8000",
    SUQPAGE_AUTH_DRIVER: "supabase",
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: required(provider, "ANON_KEY"),
    SUQPAGE_EMAIL_OTP_ENABLED: "1",
    SUQPAGE_GOOGLE_AUTH_ENABLED: "1",
    SUQPAGE_SUPABASE_AUTH_REQUEST_TIMEOUT_MS: "8000",
    SUQPAGE_APPROVE_AUTH_MIGRATION: "1",
  });
  run(process.execPath, ["--import", "tsx", "scripts/setup.ts"]);
  run(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/migrate-supabase-auth.ts", "--apply"]);
  run(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/migrate-media-to-object-storage.ts", "--execute"]);
  // Match deployment: provider configuration belongs to the runtime, not the build.
  const buildEnv = { ...env };
  const buildKeys = new Set(['SUQPAGE_NEXT_DIST_DIR', 'SUQPAGE_NEXT_TSCONFIG', 'SUQPAGE_SERVER_ACTION_ORIGINS', 'SUQPAGE_CANONICAL_URL']);
  for (const key of Object.keys(buildEnv)) {
    if (/^(?:SUQPAGE_|MIRTPAGE_|NEXT_PUBLIC_SUPABASE_)/.test(key) && !buildKeys.has(key)) buildEnv[key] = '';
  }
  buildEnv.PRIVACY_SALT = '';
  buildEnv.RESEND_API_KEY = '';
  run(process.execPath, ["node_modules/next/dist/bin/next", "build"], { environment: buildEnv });
  const prerendered = JSON.parse(fs.readFileSync(path.join(buildOutputPath, 'prerender-manifest.json'), 'utf8')).routes;
  for (const route of ['/login', '/request']) {
    if (route in prerendered) throw new Error(`Auth route ${route} was incorrectly prerendered without runtime settings.`);
  }

  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: process.cwd(), env, stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32",
  });
  app.stdout.on("data", (data) => process.stdout.write(data));
  app.stderr.on("data", (data) => process.stderr.write(data));

  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(`${baseURL}/api/health`)).ok) { ready = true; break; } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("Acceptance server did not become ready.");
  run(process.execPath, ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)]);
} finally {
  await stop();
  if (browserSupabaseAttempted) run("supabase", ["stop", "--workdir", supabaseProjectRoot, "--no-backup"], { capture: true, allowFailure: true });
  fs.rmSync(root, { recursive: true, force: true });
  fs.rmSync(buildOutputPath, { recursive: true, force: true });
  fs.rmSync(tsconfigPath, { force: true });
}
