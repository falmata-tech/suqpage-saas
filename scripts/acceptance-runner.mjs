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
const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-acceptance-"));
const runId = path.basename(root);
const distDir = path.posix.join(".next-acceptance", runId);
const buildOutputPath = path.join(process.cwd(), distDir);
const tsconfigName = `.acceptance-tsconfig-${runId}.json`;
const tsconfigPath = path.join(process.cwd(), tsconfigName);
const baseURL = `http://127.0.0.1:${port}`;
const credentialsPath = path.join(root, "credentials.txt");
const supabaseProjectRoot = path.join(root, "supabase-browser-project");
const supabaseConfigRoot = path.join(supabaseProjectRoot, "supabase");
const browserSupabaseProjectId = `mirtpage-browser-${process.pid}`;
const browserSupabasePorts = { api: 56321, db: 56322, shadow: 56320, smtp: 56324, pooler: 56329, analytics: 56327 };
const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_APP_URL: baseURL,
  MIRTPAGE_CANONICAL_URL: baseURL,
  MIRTPAGE_RUNTIME_PROFILE: "browser-test",
  MIRTPAGE_DATABASE_DRIVER: "sqlite",
  MIRTPAGE_AUTH_DRIVER: "local",
  MIRTPAGE_MEDIA_DRIVER: "filesystem",
  MIRTPAGE_DB_PATH: path.join(root, "acceptance.db"),
  MIRTPAGE_MEDIA_ROOT: path.join(root, "media"),
  MIRTPAGE_BACKUP_ROOT: path.join(root, "backups"),
  MIRTPAGE_CREDENTIAL_PATH: credentialsPath,
  PRIVACY_SALT: "acceptance-test-privacy-salt-long-enough",
  PORT: String(port),
  MIRTPAGE_TEST_BASE_URL: baseURL,
  MIRTPAGE_TEST_CREDENTIALS: credentialsPath,
  MIRTPAGE_SUPPRESS_CREDENTIAL_OUTPUT: "1",
  MIRTPAGE_SERVER_ACTION_ORIGINS: baseURL,
  MIRTPAGE_NEXT_DIST_DIR: distDir,
  MIRTPAGE_NEXT_TSCONFIG: tsconfigName,
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
}

function run(command, args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env,
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
  const setupOutput = run(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/setup.ts", "--reset"], { capture: true });
  if (/^(?:ADMIN|CLIENT) \|/m.test(setupOutput)) throw new Error("Acceptance setup exposed credential values.");
  for (const line of setupOutput.split("\n").filter((value) => value.startsWith("MirtPage database") || value.startsWith("Temporary credentials"))) console.log(line);
  Object.assign(env, {
    MIRTPAGE_DATABASE_DRIVER: "postgres",
    MIRTPAGE_POSTGRES_URL: databaseUrl,
    MIRTPAGE_POSTGRES_DIRECT_URL: databaseUrl,
    MIRTPAGE_LOCAL_POSTGRES_URL: databaseUrl,
    MIRTPAGE_LOCAL_SUPABASE_PROFILE: "browser-test",
    MIRTPAGE_POSTGRES_POOL_MAX: "4",
    MIRTPAGE_POSTGRES_CONNECTION_TIMEOUT_MS: "5000",
    MIRTPAGE_POSTGRES_STATEMENT_TIMEOUT_MS: "8000",
    MIRTPAGE_MEDIA_DRIVER: "supabase",
    MIRTPAGE_SUPABASE_URL: apiUrl,
    MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY: required(provider, "SERVICE_ROLE_KEY"),
    MIRTPAGE_SUPABASE_STORAGE_BUCKET: "mirtpage-media",
    MIRTPAGE_MEDIA_REQUEST_TIMEOUT_MS: "8000",
    MIRTPAGE_AUTH_DRIVER: "supabase",
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: required(provider, "ANON_KEY"),
    MIRTPAGE_GOOGLE_AUTH_ENABLED: "0",
    MIRTPAGE_SUPABASE_AUTH_REQUEST_TIMEOUT_MS: "8000",
    MIRTPAGE_APPROVE_LOCAL_COPY: "COPY_TO_LOCAL_SUPABASE",
    MIRTPAGE_APPROVE_AUTH_MIGRATION: "1",
  });
  run(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/rehearse-postgres.ts", "--local-copy"]);
  run(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/migrate-supabase-auth.ts", "--apply"]);
  run(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/migrate-media-to-object-storage.ts", "--execute"]);
  run(process.execPath, ["node_modules/next/dist/bin/next", "build"]);

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
