import { consumeRateLimit, resetRateLimit } from "./rate-limit";
import { consumePostgresRateLimit, resetPostgresRateLimit } from "./rate-limit-postgres";
import { postgresRuntimeEnabled, postgresRuntimeServices } from "./postgres-runtime-services";

export async function consumeRuntimeRateLimit(key: string, limit: number, windowMs: number, blockMs = windowMs) {
  return postgresRuntimeEnabled()
    ? consumePostgresRateLimit(postgresRuntimeServices().runner, key, limit, windowMs, blockMs)
    : consumeRateLimit(key, limit, windowMs, blockMs);
}

export async function resetRuntimeRateLimit(key: string) {
  if (postgresRuntimeEnabled()) await resetPostgresRateLimit(postgresRuntimeServices().runner, key);
  else resetRateLimit(key);
}
