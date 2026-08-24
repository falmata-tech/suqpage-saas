import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const destination = path.resolve(".local/supabase-runtime.env");

function parseEnvironment(source) {
  const values = new Map();
  for (const line of source.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values.set(match[1], value);
  }
  return values;
}

function required(values, name) {
  const value = values.get(name) || "";
  if (!value) throw new Error(`Local Supabase status did not provide ${name}.`);
  return value;
}

function assertLoopback(raw, port, label) {
  const url = new URL(raw);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.port !== port) {
    throw new Error(`${label} must use the local Supabase loopback port ${port}.`);
  }
  return raw;
}

const status = execFileSync("supabase", ["status", "-o", "env"], {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const values = parseEnvironment(status);
const apiUrl = assertLoopback(required(values, "API_URL"), "54321", "Local API URL");
const databaseUrl = assertLoopback(required(values, "DB_URL"), "54322", "Local database URL");
const publishableKey = required(values, "ANON_KEY");
const serviceRoleKey = required(values, "SERVICE_ROLE_KEY");

const retained = fs.existsSync(destination) ? parseEnvironment(fs.readFileSync(destination, "utf8")) : new Map();
const privacySalt = retained.get("PRIVACY_SALT") || crypto.randomBytes(32).toString("hex");
const lines = [
  "# Generated from the local Supabase stack. Never commit this file.",
  "NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000",
  "MIRTPAGE_CANONICAL_URL=http://127.0.0.1:3000",
  "MIRTPAGE_DATABASE_DRIVER=postgres",
  `MIRTPAGE_POSTGRES_URL=${databaseUrl}`,
  `MIRTPAGE_POSTGRES_DIRECT_URL=${databaseUrl}`,
  `MIRTPAGE_LOCAL_POSTGRES_URL=${databaseUrl}`,
  "MIRTPAGE_POSTGRES_POOL_MAX=4",
  "MIRTPAGE_POSTGRES_CONNECTION_TIMEOUT_MS=5000",
  "MIRTPAGE_POSTGRES_STATEMENT_TIMEOUT_MS=8000",
  "MIRTPAGE_MEDIA_DRIVER=supabase",
  `MIRTPAGE_SUPABASE_URL=${apiUrl}`,
  `MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
  "MIRTPAGE_SUPABASE_STORAGE_BUCKET=mirtpage-media",
  "MIRTPAGE_MEDIA_REQUEST_TIMEOUT_MS=8000",
  "MIRTPAGE_AUTH_DRIVER=supabase",
  `NEXT_PUBLIC_SUPABASE_URL=${apiUrl}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`,
  "MIRTPAGE_GOOGLE_AUTH_ENABLED=0",
  "MIRTPAGE_SUPABASE_AUTH_REQUEST_TIMEOUT_MS=8000",
  `PRIVACY_SALT=${privacySalt}`,
  "NEXT_PUBLIC_MIRTPAGE_PWA_ENABLED=true",
  "MIRTPAGE_PRODUCT_UPKEEP_ENABLED=1",
  "MIRTPAGE_RECIPE_STUDIO_ENABLED=1",
  "MIRTPAGE_YOUTUBE_ADMISSION_ENABLED=1",
  "",
];

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, lines.join("\n"), { mode: 0o600 });
fs.chmodSync(destination, 0o600);
console.log("Wrote the isolated local Supabase runtime profile without printing credentials.");
