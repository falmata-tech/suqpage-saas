import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const prefix = `mirtpage-audit-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const image = `${prefix}:test`;
const volume = `${prefix}-data`;
const app = `${prefix}-app`;
const setupContainer = `${prefix}-setup`;
const canonicalUrl = "https://mirtpage.test";
const proxyOrigin = "proxy.mirtpage.test";
const requiredIgnores = [
  ".git",
  "node_modules",
  ".next",
  ".next-acceptance",
  ".acceptance-tsconfig-*.json",
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
    .map((line) => (/^(ADMIN|CLIENT) \|/.test(line) ? "[credential row redacted]" : line))
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
  assert.match(value, /^mirtpage-audit-[a-z0-9:-]+$/, `Refusing to clean unexpected Docker resource: ${value}`);
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
    "--build-arg", `MIRTPAGE_SERVER_ACTION_ORIGINS=${proxyOrigin}`,
    "--tag", image,
    ".",
  ]);

  const user = run(["image", "inspect", image, "--format", "{{.Config.User}}"], { capture: true }).stdout.trim();
  assert.equal(user, "mirtpage", "The final image must run as the non-root mirtpage user");

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
    `if(!origins.includes('mirtpage.test')||!origins.includes('${proxyOrigin}')||origins.some((origin)=>origin.includes('*')))process.exit(1);`,
  ].join("");
  run(["run", "--rm", image, "node", "-e", originProbe]);
  run(["run", "--rm", image, "npm", "run", "test:trace"]);

  const environment = [
    "-e", `NEXT_PUBLIC_APP_URL=${canonicalUrl}`,
    "-e", "PRIVACY_SALT=container-test-privacy-salt-long-enough",
    "-e", "MIRTPAGE_SUPPRESS_CREDENTIAL_OUTPUT=1",
  ];
  const unconfigured = run([
    "run", "--name", app,
    ...environment,
    image,
  ], { capture: true, allowFailure: true });
  const combinedLogs = `${unconfigured.stdout || ""}\n${unconfigured.stderr || ""}`;
  assert(!/^(ADMIN|CLIENT) \|/m.test(combinedLogs), "Container logs exposed generated credential values");
  assert.notEqual(unconfigured.status, 0, "An unconfigured production container must fail closed");
  assert.match(combinedLogs, /MIRTPAGE_DATABASE_DRIVER is required/, "Production preflight did not reject the unconfigured container");

  console.log("Docker context, build-time origins, non-root image, trace privacy, and fail-closed startup tests passed.");
} finally {
  cleanup();
}
