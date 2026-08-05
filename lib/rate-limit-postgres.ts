import type { PostgresTransactionRunner } from "./postgres-runtime";
import type { RateLimitResult } from "./rate-limit";

type RateLimitRow = {
  key: string;
  window_start: number;
  count: number;
  blocked_until: number;
};

export async function consumePostgresRateLimit(
  runner: PostgresTransactionRunner,
  key: string,
  limit: number,
  windowMs: number,
  blockMs = windowMs,
  now = Date.now(),
): Promise<RateLimitResult> {
  return runner.transaction(async () => {
    const inserted = await runner.query<RateLimitRow>(
      "INSERT INTO rate_limits(key,window_start,count,blocked_until) VALUES(?,?,1,0) ON CONFLICT(key) DO NOTHING RETURNING key,window_start,count,blocked_until",
      [key, now],
    );
    if (inserted.rows[0]) {
      return { allowed: true, retryAfterSeconds: 0, remaining: Math.max(0, limit - 1) };
    }

    const existing = await runner.query<RateLimitRow>(
      "SELECT key,window_start,count,blocked_until FROM rate_limits WHERE key=? FOR UPDATE",
      [key],
    );
    const row = existing.rows[0];
    if (!row) throw new Error("Rate-limit row was unavailable after conflict resolution.");
    if (row.blocked_until > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((row.blocked_until - now) / 1000),
        remaining: 0,
      };
    }
    if (now - row.window_start >= windowMs) {
      await runner.query(
        "UPDATE rate_limits SET window_start=?,count=1,blocked_until=0 WHERE key=?",
        [now, key],
      );
      return { allowed: true, retryAfterSeconds: 0, remaining: Math.max(0, limit - 1) };
    }

    const count = Number(row.count) + 1;
    const blockedUntil = count > limit ? now + blockMs : 0;
    await runner.query(
      "UPDATE rate_limits SET count=?,blocked_until=? WHERE key=?",
      [count, blockedUntil, key],
    );
    return {
      allowed: count <= limit,
      retryAfterSeconds: count <= limit ? 0 : Math.ceil(blockMs / 1000),
      remaining: Math.max(0, limit - count),
    };
  });
}

export async function resetPostgresRateLimit(
  runner: PostgresTransactionRunner,
  key: string,
) {
  await runner.query("DELETE FROM rate_limits WHERE key=?", [key]);
}

export async function clearExpiredPostgresRateLimits(
  runner: PostgresTransactionRunner,
  now = Date.now(),
) {
  const cutoff = now - 7 * 24 * 60 * 60 * 1000;
  await runner.query("DELETE FROM rate_limits WHERE window_start < ? AND blocked_until < ?", [cutoff, now]);
}
