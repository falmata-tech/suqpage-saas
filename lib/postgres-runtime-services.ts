import { PostgresCatalogRepository } from "./postgres-catalog-repository";
import { createPostgresPool, PostgresTransactionRunner, postgresRuntimeConfig } from "./postgres-runtime";
import { PostgresSessionRepository } from "./postgres-session-repository";
import { PostgresRequestRepository } from "./postgres-request-repository";

type RuntimeServices = {
  pool: ReturnType<typeof createPostgresPool>;
  runner: PostgresTransactionRunner;
  catalog: PostgresCatalogRepository;
  sessions: PostgresSessionRepository;
  requests: PostgresRequestRepository;
};

let services: RuntimeServices | null = null;

export function postgresRuntimeEnabled() {
  return process.env.MIRTPAGE_DATABASE_DRIVER === "postgres";
}

export function postgresRuntimeServices() {
  if (!postgresRuntimeEnabled()) throw new Error("PostgreSQL runtime is not enabled.");
  if (services) return services;
  const config = postgresRuntimeConfig();
  if (!config) throw new Error("MIRTPAGE_POSTGRES_URL is required for PostgreSQL runtime.");
  const pool = createPostgresPool(config);
  const runner = new PostgresTransactionRunner(pool);
  services = {
    pool,
    runner,
    catalog: new PostgresCatalogRepository(runner),
    sessions: new PostgresSessionRepository(runner),
    requests: new PostgresRequestRepository(runner),
  };
  return services;
}

export async function closePostgresRuntimeForTests() {
  if (!services) return;
  const active = services;
  services = null;
  await active.pool.end();
}
