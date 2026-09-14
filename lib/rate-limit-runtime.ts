import { consumePostgresRateLimit, resetPostgresRateLimit } from "./rate-limit-postgres";
import { postgresRuntimeServices } from "./postgres-runtime-services";
export async function consumeRuntimeRateLimit(key: string, limit: number, windowMs: number, blockMs = windowMs) {
    return consumePostgresRateLimit(postgresRuntimeServices().runner, key, limit, windowMs, blockMs);
}
export async function resetRuntimeRateLimit(key: string) {
    await resetPostgresRateLimit(postgresRuntimeServices().runner, key);
}
