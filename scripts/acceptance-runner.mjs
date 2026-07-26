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
const env = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_APP_URL: "https://suqpage.test",
  SUQPAGE_DB_PATH: path.join(root, "acceptance.db"),
  SUQPAGE_MEDIA_ROOT: path.join(root, "media"),
  SUQPAGE_BACKUP_ROOT: path.join(root, "backups"),
  SUQPAGE_CREDENTIAL_PATH: credentialsPath,
  PRIVACY_SALT: "acceptance-test-privacy-salt-long-enough",
  PORT: String(port),
  SUQPAGE_TEST_BASE_URL: baseURL,
  SUQPAGE_TEST_CREDENTIALS: credentialsPath,
  SUQPAGE_TEST_DB: path.join(root, "acceptance.db"),
  SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT: "1",
  SUQPAGE_SERVER_ACTION_ORIGINS: baseURL,
  SUQPAGE_NEXT_DIST_DIR: distDir,
  SUQPAGE_NEXT_TSCONFIG: tsconfigName,
  SUQPAGE_BAZAAR_NOW: "2026-07-26T10:00:00.000Z",
};

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env,
    ...(capture ? { encoding: "utf8" } : { stdio: "inherit" }),
  });
  if (result.status !== 0) {
    if (capture && result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} exited with ${result.status}`);
  }
  return capture ? result.stdout : "";
}

let app = null;

async function stop() {
  if (!app || app.exitCode !== null) return;
  try { process.platform === "win32" ? app.kill("SIGTERM") : process.kill(-app.pid, "SIGTERM"); }
  catch { app.kill("SIGTERM"); }
  await Promise.race([new Promise((resolve) => app.once("close", resolve)), new Promise((resolve) => setTimeout(resolve, 4_000))]);
}

try {
  fs.writeFileSync(tsconfigPath, `${JSON.stringify({ extends: "./tsconfig.json", include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"] }, null, 2)}\n`, { flag: "wx" });
  const setupOutput = run(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/setup.ts", "--reset"], { capture: true });
  if (/^(?:ADMIN|CLIENT) \|/m.test(setupOutput)) throw new Error("Acceptance setup exposed credential values.");
  for (const line of setupOutput.split("\n").filter((value) => value.startsWith("SuqPage database") || value.startsWith("Temporary credentials"))) console.log(line);
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
  run(process.execPath, ["node_modules/@playwright/test/cli.js", "test"]);
} finally {
  await stop();
  fs.rmSync(root, { recursive: true, force: true });
  fs.rmSync(buildOutputPath, { recursive: true, force: true });
  fs.rmSync(tsconfigPath, { force: true });
}
