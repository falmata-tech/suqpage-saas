import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const APPROVAL = "PROVISION_MIRTPAGE_RUNTIME";
const RUNTIME_ROLE = "mirtpage_runtime";
const SECRET_PATH = path.join(process.cwd(), ".local", "production-secrets.json");

if (process.env.MIRTPAGE_APPROVE_RUNTIME_ROLE !== APPROVAL) {
  throw new Error(`Set MIRTPAGE_APPROVE_RUNTIME_ROLE=${APPROVAL} for this one command.`);
}

function runSupabase(args) {
  const result = spawnSync("supabase", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) throw new Error("The authenticated Supabase CLI request failed.");
  return result.stdout;
}

function parseDotEnvValue(contents, name) {
  const match = contents.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (!match) return "";
  const value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

const credentialOutput = runSupabase(["db", "dump", "--linked", "--schema", "public", "--dry-run"]);
const credentials = Object.fromEntries(
  [...credentialOutput.matchAll(/^export (PG[A-Z]+)="([^"]*)"$/gm)].map((match) => [
    match[1],
    match[2],
  ]),
);
for (const name of ["PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE"]) {
  if (!credentials[name]) throw new Error(`The linked Supabase credentials omitted ${name}.`);
}
const projectRef = credentials.PGUSER.split(".").at(-1);
if (!projectRef || !/^[a-z0-9]{20}$/.test(projectRef)) {
  throw new Error("Could not derive the linked Supabase project reference.");
}

const temporaryUrl = new URL("postgresql://localhost");
temporaryUrl.hostname = credentials.PGHOST;
temporaryUrl.port = credentials.PGPORT;
temporaryUrl.username = credentials.PGUSER;
temporaryUrl.password = credentials.PGPASSWORD;
temporaryUrl.pathname = `/${credentials.PGDATABASE}`;
temporaryUrl.searchParams.set("uselibpqcompat", "true");
temporaryUrl.searchParams.set("sslmode", "require");

const password = crypto.randomBytes(32).toString("base64url");
const owner = new Client({
  connectionString: temporaryUrl.toString(),
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});
await owner.connect();
try {
  await owner.query("BEGIN");
  await owner.query('SET LOCAL ROLE "postgres"');
  await owner.query("SET LOCAL statement_timeout = 0");
  await owner.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${RUNTIME_ROLE}') THEN
        CREATE ROLE ${RUNTIME_ROLE} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
      END IF;
    END
    $$;
    ALTER ROLE ${RUNTIME_ROLE} PASSWORD '${password}';
    GRANT CONNECT ON DATABASE postgres TO ${RUNTIME_ROLE};
    GRANT USAGE ON SCHEMA public TO ${RUNTIME_ROLE};
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${RUNTIME_ROLE};
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${RUNTIME_ROLE};
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${RUNTIME_ROLE};
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      GRANT USAGE, SELECT ON SEQUENCES TO ${RUNTIME_ROLE};
  `);
  await owner.query("COMMIT");
} catch (error) {
  await owner.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await owner.end().catch(() => undefined);
}

const runtimeUrl = new URL(temporaryUrl);
runtimeUrl.port = "6543";
runtimeUrl.username = `${RUNTIME_ROLE}.${projectRef}`;
runtimeUrl.password = password;

const runtime = new Client({ connectionString: runtimeUrl.toString() });
await runtime.connect();
try {
  const result = await runtime.query(
    "SELECT count(*)::int AS tables FROM information_schema.tables WHERE table_schema='public'",
  );
  if (result.rows[0]?.tables !== 44) throw new Error("The runtime role cannot read the copied schema.");
} finally {
  await runtime.end().catch(() => undefined);
}

const apiKeys = JSON.parse(
  runSupabase(["projects", "api-keys", "--project-ref", projectRef, "--output", "json"]),
);
const serviceRoleKey = apiKeys.find((key) => key.name === "service_role")?.api_key;
if (!serviceRoleKey) throw new Error("The linked project has no service-role key.");
const privacySalt = fs.existsSync(".env")
  ? parseDotEnvValue(fs.readFileSync(".env", "utf8"), "PRIVACY_SALT")
  : "";
if (!privacySalt) throw new Error("PRIVACY_SALT is missing from the local .env file.");

fs.mkdirSync(path.dirname(SECRET_PATH), { recursive: true });
fs.writeFileSync(
  SECRET_PATH,
  `${JSON.stringify(
    {
      NEXT_PUBLIC_APP_URL: "https://mirtpage.com",
      MIRTPAGE_CANONICAL_URL: "https://mirtpage.com",
      MIRTPAGE_SERVER_ACTION_ORIGINS: "mirtpage.com,www.mirtpage.com",
      MIRTPAGE_DATABASE_DRIVER: "postgres",
      MIRTPAGE_POSTGRES_URL: runtimeUrl.toString(),
      MIRTPAGE_POSTGRES_POOL_MAX: "2",
      MIRTPAGE_POSTGRES_CONNECTION_TIMEOUT_MS: "6000",
      MIRTPAGE_POSTGRES_STATEMENT_TIMEOUT_MS: "9000",
      MIRTPAGE_MEDIA_DRIVER: "supabase",
      MIRTPAGE_SUPABASE_URL: `https://${projectRef}.supabase.co`,
      MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
      MIRTPAGE_SUPABASE_STORAGE_BUCKET: "mirtpage-media",
      MIRTPAGE_SUPABASE_REQUEST_TIMEOUT_MS: "10000",
      PRIVACY_SALT: privacySalt,
      MIRTPAGE_RECIPE_STUDIO_ENABLED: "1",
      MIRTPAGE_PRODUCT_UPKEEP_ENABLED: "1",
      MIRTPAGE_YOUTUBE_ADMISSION_ENABLED: "1",
    },
    null,
    2,
  )}\n`,
  { mode: 0o600 },
);
fs.chmodSync(SECRET_PATH, 0o600);
console.log("Least-privilege Supabase runtime role provisioned and verified.");
console.log("Production deployment secrets stored in ignored .local/production-secrets.json (mode 600).");
