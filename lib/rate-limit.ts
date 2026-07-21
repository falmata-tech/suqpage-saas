import { getDb, inTransaction } from "./db";

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number; remaining: number };

export function consumeRateLimit(key: string, limit: number, windowMs: number, blockMs = windowMs): RateLimitResult {
  const now = Date.now();
  return inTransaction(() => {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM rate_limits WHERE key=?").get(key) as any;
    if (existing?.blocked_until > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((existing.blocked_until - now) / 1000), remaining: 0 };
    }
    if (!existing || now - existing.window_start >= windowMs) {
      db.prepare("INSERT INTO rate_limits(key,window_start,count,blocked_until) VALUES(?,?,1,0) ON CONFLICT(key) DO UPDATE SET window_start=excluded.window_start,count=1,blocked_until=0").run(key, now);
      return { allowed: true, retryAfterSeconds: 0, remaining: Math.max(0, limit - 1) };
    }
    const count = Number(existing.count) + 1;
    const blockedUntil = count > limit ? now + blockMs : 0;
    db.prepare("UPDATE rate_limits SET count=?,blocked_until=? WHERE key=?").run(count, blockedUntil, key);
    return {
      allowed: count <= limit,
      retryAfterSeconds: count <= limit ? 0 : Math.ceil(blockMs / 1000),
      remaining: Math.max(0, limit - count),
    };
  });
}

export function resetRateLimit(key: string) {
  getDb().prepare("DELETE FROM rate_limits WHERE key=?").run(key);
}

export function clearExpiredRateLimits() {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  getDb().prepare("DELETE FROM rate_limits WHERE window_start < ? AND blocked_until < ?").run(cutoff, Date.now());
}
