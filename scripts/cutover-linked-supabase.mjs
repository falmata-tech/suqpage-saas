import { spawnSync } from "node:child_process";
import process from "node:process";

const approval = process.env.MIRTPAGE_APPROVE_PRODUCTION_COPY;
if (approval !== "COPY_TO_EMPTY_SUPABASE") {
  throw new Error(
    "Set MIRTPAGE_APPROVE_PRODUCTION_COPY=COPY_TO_EMPTY_SUPABASE for this one command.",
  );
}

const credentialResult = spawnSync(
  "supabase",
  ["db", "dump", "--linked", "--schema", "public", "--dry-run"],
  { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);
if (credentialResult.status !== 0) {
  throw new Error("The linked Supabase CLI could not issue temporary database credentials.");
}

const credentials = Object.fromEntries(
  [...credentialResult.stdout.matchAll(/^export (PG[A-Z]+)="([^"]*)"$/gm)].map((match) => [
    match[1],
    match[2],
  ]),
);
for (const name of ["PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE"]) {
  if (!credentials[name]) throw new Error(`The linked Supabase credentials omitted ${name}.`);
}

const connection = new URL("postgresql://localhost");
connection.hostname = credentials.PGHOST;
connection.port = credentials.PGPORT;
connection.username = credentials.PGUSER;
connection.password = credentials.PGPASSWORD;
connection.pathname = `/${credentials.PGDATABASE}`;
connection.searchParams.set("uselibpqcompat", "true");
connection.searchParams.set("sslmode", "require");

const copy = spawnSync(
  process.execPath,
  ["--import", "tsx", "scripts/rehearse-postgres.ts", "--production-copy"],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      MIRTPAGE_POSTGRES_DIRECT_URL: connection.toString(),
      MIRTPAGE_POSTGRES_MIGRATION_ROLE:
        process.env.MIRTPAGE_POSTGRES_MIGRATION_ROLE || "postgres",
    },
  },
);
if (copy.status !== 0) process.exit(copy.status || 1);
