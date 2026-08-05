import type { PostgresTransactionRunner } from "./postgres-runtime";

export type ActiveSession = {
  id: number;
  user_id: number;
  last_seen_at: number;
};

export type NewSession = {
  tokenHash: string;
  userId: number;
  expiresAt: number;
  now: number;
  ipHash: string;
  userAgent: string;
};

export class PostgresSessionRepository {
  constructor(private readonly runner: PostgresTransactionRunner) {}

  async findActive(tokenHash: string, now: number): Promise<ActiveSession | undefined> {
    return (await this.runner.query<ActiveSession>(`
      SELECT id,user_id,last_seen_at
      FROM sessions
      WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?
    `, [tokenHash, now])).rows[0];
  }

  async touch(id: number, now: number) {
    return this.runner.query("UPDATE sessions SET last_seen_at=? WHERE id=?", [now, id]);
  }

  async create(input: NewSession) {
    return this.runner.transaction(async () => {
      await this.runner.query("DELETE FROM sessions WHERE expires_at<=? OR revoked_at IS NOT NULL", [input.now]);
      const inserted = await this.runner.query<{ id: number }>(
        "INSERT INTO sessions(token_hash,user_id,expires_at,created_at,last_seen_at,ip_hash,user_agent) VALUES(?,?,?,?,?,?,?) RETURNING id",
        [
          input.tokenHash,
          input.userId,
          input.expiresAt,
          input.now,
          input.now,
          input.ipHash,
          input.userAgent,
        ],
      );
      const id = inserted.rows[0]?.id;
      if (!id) throw new Error("PostgreSQL did not return the created session identifier.");
      return id;
    });
  }

  async revokeByToken(tokenHash: string, now: number) {
    return this.runner.query(
      "UPDATE sessions SET revoked_at=? WHERE token_hash=? AND revoked_at IS NULL",
      [now, tokenHash],
    );
  }

  async revokeAllForUser(userId: number, now: number) {
    return this.runner.query(
      "UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL",
      [now, userId],
    );
  }
}
