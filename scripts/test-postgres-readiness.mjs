import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-postgres-readiness-"));
const container = `mirtpage-postgres-${process.pid}`;
const password = "mirtpage-rehearsal-only";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    env: { ...process.env, ...options.env },
  });
  if (result.status !== 0) {
    const detail = options.capture ? `${result.stdout || ""}${result.stderr || ""}`.trim() : "";
    throw new Error(`${command} ${args[0] || ""} failed${detail ? `: ${detail}` : "."}`);
  }
  return String(result.stdout || "").trim();
}

function waitForPostgres() {
  let consecutiveReady = 0;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = spawnSync("docker", [
      "exec",
      container,
      "pg_isready",
      "-U",
      "mirtpage",
      "-d",
      "mirtpage",
    ], { encoding: "utf8", stdio: "ignore" });
    consecutiveReady = result.status === 0 ? consecutiveReady + 1 : 0;
    if (consecutiveReady >= 2) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  throw new Error("The disposable PostgreSQL service did not become ready.");
}

try {
  run(process.execPath, ["--import", "tsx", "scripts/setup.ts", "--reset"], {
    env: {
      MIRTPAGE_DB_PATH: path.join(root, "source.db"),
      MIRTPAGE_MEDIA_ROOT: path.join(root, "media"),
      MIRTPAGE_CREDENTIAL_PATH: path.join(root, "seed-credentials.txt"),
      MIRTPAGE_SUPPRESS_CREDENTIAL_OUTPUT: "1",
    },
  });
  run("docker", [
    "run",
    "-d",
    "--rm",
    "--name",
    container,
    "-p",
    "127.0.0.1::5432",
    "-e",
    "POSTGRES_USER=mirtpage",
    "-e",
    `POSTGRES_PASSWORD=${password}`,
    "-e",
    "POSTGRES_DB=mirtpage",
    "postgres:17.10-alpine",
  ]);
  waitForPostgres();
  const mapping = run("docker", ["port", container, "5432/tcp"], { capture: true });
  const port = mapping.match(/:(\d+)$/)?.[1];
  if (!port) throw new Error("Could not resolve the disposable PostgreSQL port.");
  run(process.execPath, ["--import", "tsx", "scripts/rehearse-postgres.ts", "--reset-target"], {
    env: {
      MIRTPAGE_DB_PATH: path.join(root, "source.db"),
      MIRTPAGE_POSTGRES_REHEARSAL_URL: `postgresql://mirtpage:${password}@127.0.0.1:${port}/mirtpage`,
    },
  });
  run(process.execPath, ["--import", "tsx", "scripts/test-postgres-runtime.ts"], {
    env: {
      MIRTPAGE_POSTGRES_REHEARSAL_URL: `postgresql://mirtpage:${password}@127.0.0.1:${port}/mirtpage`,
    },
  });
  run(process.execPath, ["--import", "tsx", "scripts/rehearse-postgres.ts", "--production-copy"], {
    env: {
      MIRTPAGE_DB_PATH: path.join(root, "source.db"),
      MIRTPAGE_POSTGRES_DIRECT_URL: `postgresql://mirtpage:${password}@127.0.0.1:${port}/mirtpage`,
      MIRTPAGE_APPROVE_PRODUCTION_COPY: "COPY_TO_EMPTY_SUPABASE",
    },
  });
  console.log("Disposable PostgreSQL 17 schema, data, constraints, triggers, sequences, invariants, fingerprints, and read-only source rehearsal passed.");
} finally {
  spawnSync("docker", ["stop", container], { stdio: "ignore" });
  fs.rmSync(root, { recursive: true, force: true });
}
