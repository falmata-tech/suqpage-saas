import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const prefix = `suqpage-audit-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const image = `${prefix}:test`;
const volume = `${prefix}-data`;
const app = `${prefix}-app`;
const setupContainer = `${prefix}-setup`;
const canonicalUrl = "https://suqpage.test";
const proxyOrigin = "proxy.suqpage.test";
const requiredIgnores = [
  ".git",
  "node_modules",
  ".next",
  "test-results",
  "playwright-report",
  ".env",
  ".env.*",
  ".local",
  "data",
  "backups",
  "public/uploads/runtime",
];

function safeOutput(value) {
  return String(value || "")
    .split("\n")
    .map((line) => (/^(ADMIN|OWNER) \|/.test(line) ? "[credential row redacted]" : line))
    .join("\n");
}

function run(args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync("docker", args, {
    cwd: process.cwd(),
    encoding: capture ? "utf8" : undefined,
    stdio: capture ? "pipe" : "inherit",
  });
  if (!allowFailure && result.status !== 0) {
    throw new Error(
      `docker ${args[0]} failed with ${result.status}\n${safeOutput(result.stdout)}\n${safeOutput(result.stderr)}`,
    );
  }
  return result;
}

function assertAuditResource(value) {
  assert.match(value, /^suqpage-audit-[a-z0-9:-]+$/, `Refusing to clean unexpected Docker resource: ${value}`);
}

function cleanup() {
  for (const resource of [app, setupContainer, volume, image]) assertAuditResource(resource);
  run(["rm", "-f", app], { capture: true, allowFailure: true });
  run(["rm", "-f", setupContainer], { capture: true, allowFailure: true });
  run(["volume", "rm", volume], { capture: true, allowFailure: true });
  run(["image", "rm", image], { capture: true, allowFailure: true });
}

const ignoreLines = new Set(
  fs.readFileSync(".dockerignore", "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#")),
);
for (const required of requiredIgnores) {
  assert(ignoreLines.has(required), `.dockerignore must exclude ${required}`);
}
assert(ignoreLines.has("!.env.example"), ".dockerignore must retain the documented environment template");

try {
  run([
    "build",
    "--build-arg", `NEXT_PUBLIC_APP_URL=${canonicalUrl}`,
    "--build-arg", `SUQPAGE_SERVER_ACTION_ORIGINS=${proxyOrigin}`,
    "--tag", image,
    ".",
  ]);

  const user = run(["image", "inspect", image, "--format", "{{.Config.User}}"], { capture: true }).stdout.trim();
  assert.equal(user, "suqpage", "The final image must run as the non-root suqpage user");

  const forbiddenPaths = [
    "/app/.git",
    "/app/.env",
    "/app/.local",
    "/app/data",
    "/app/backups",
    "/app/test-results",
    "/app/playwright-report",
    "/app/public/uploads/runtime",
  ];
  const absenceCheck = forbiddenPaths.map((file) => `test ! -e ${file}`).join(" && ");
  run(["run", "--rm", image, "sh", "-c", absenceCheck]);

  const originProbe = [
    "const fs=require('fs');",
    "const value=JSON.parse(fs.readFileSync('/app/.next/required-server-files.json','utf8'));",
    "const origins=value.config?.experimental?.serverActions?.allowedOrigins||[];",
    `if(!origins.includes('suqpage.test')||!origins.includes('${proxyOrigin}')||origins.some((origin)=>origin.includes('*')))process.exit(1);`,
  ].join("");
  run(["run", "--rm", image, "node", "-e", originProbe]);

  run(["volume", "create", volume], { capture: true });
  const environment = [
    "-e", `NEXT_PUBLIC_APP_URL=${canonicalUrl}`,
    "-e", "SUQPAGE_DB_PATH=/data/suqpage.db",
    "-e", "SUQPAGE_MEDIA_ROOT=/data/media",
    "-e", "SUQPAGE_BACKUP_ROOT=/data/backups",
    "-e", "SUQPAGE_CREDENTIAL_PATH=/data/credentials.txt",
    "-e", "PRIVACY_SALT=container-test-privacy-salt-long-enough",
    "-e", "SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT=1",
  ];
  const setup = run([
    "run", "--rm", "--name", setupContainer,
    ...environment,
    "-v", `${volume}:/data`,
    image,
    "npm", "run", "setup", "--", "--reset",
  ], { capture: true });
  assert(!/^(ADMIN|OWNER) \|/m.test(setup.stdout), "Container setup exposed generated credential values");

  run([
    "run", "-d", "--name", app,
    "-p", "127.0.0.1::3000",
    ...environment,
    "-v", `${volume}:/data`,
    image,
  ], { capture: true });

  const mapping = run(["port", app, "3000/tcp"], { capture: true }).stdout.trim();
  const port = Number(mapping.match(/:(\d+)$/)?.[1]);
  assert(Number.isInteger(port) && port > 0, `Could not resolve the temporary container port: ${mapping}`);

  let healthy = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.ok && (await response.json()).status === "ok") {
        healthy = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const logs = run(["logs", app], { capture: true, allowFailure: true });
  const combinedLogs = `${logs.stdout || ""}\n${logs.stderr || ""}`;
  assert(!/^(ADMIN|OWNER) \|/m.test(combinedLogs), "Container logs exposed generated credential values");
  assert.match(combinedLogs, /Preflight passed\./, "Production preflight did not complete in the container");
  assert(healthy, `Container health did not become ready\n${safeOutput(combinedLogs)}`);

  console.log("Docker context, build-time origins, non-root preflight, and health tests passed.");
} finally {
  cleanup();
}
