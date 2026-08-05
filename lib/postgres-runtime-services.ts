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

export function postgresRuntimePreviewEnabled() {
  return process.env.MIRTPAGE_DATABASE_DRIVER === "postgres" && process.env.MIRTPAGE_POSTGRES_RUNTIME_PREVIEW === "1";
}

export function postgresRuntimeServices() {
  if (!postgresRuntimePreviewEnabled()) throw new Error("PostgreSQL runtime preview is not enabled.");
  if (services) return services;
  const config = postgresRuntimeConfig();
  if (!config) throw new Error("MIRTPAGE_POSTGRES_URL is required for PostgreSQL runtime preview.");
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
