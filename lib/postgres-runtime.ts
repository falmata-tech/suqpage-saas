import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient, types } from "pg";

const DEFAULT_POOL_MAX = 4;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;
const DEFAULT_STATEMENT_TIMEOUT_MS = 8_000;
const MIN_POOL_MAX = 1;
const MAX_POOL_MAX = 10;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 30_000;

export type PostgresRuntimeConfig = {
  connectionString: string;
  poolMax: number;
  connectionTimeoutMs: number;
  statementTimeoutMs: number;
};

export type PostgresQueryResult<T> = {
  rows: T[];
  rowCount: number;
};

type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

function boundedInteger(
  raw: string | undefined,
  fallback: number,
  name: string,
  min: number,
  max: number,
) {
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer from ${min} to ${max}.`);
  }
  return value;
}

export function postgresRuntimeConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): PostgresRuntimeConfig | null {
  const connectionString = (environment.MIRTPAGE_POSTGRES_URL || "").trim();
  if (!connectionString) return null;

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error("MIRTPAGE_POSTGRES_URL must be a valid PostgreSQL connection URL.");
  }
  if (
    (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") ||
    !parsed.hostname ||
    !parsed.username ||
    !parsed.password ||
    parsed.hash
  ) {
    throw new Error("MIRTPAGE_POSTGRES_URL must include a PostgreSQL host, user, and password.");
  }

  return {
    connectionString,
    poolMax: boundedInteger(
      environment.MIRTPAGE_POSTGRES_POOL_MAX,
      DEFAULT_POOL_MAX,
      "MIRTPAGE_POSTGRES_POOL_MAX",
      MIN_POOL_MAX,
      MAX_POOL_MAX,
    ),
    connectionTimeoutMs: boundedInteger(
      environment.MIRTPAGE_POSTGRES_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS,
      "MIRTPAGE_POSTGRES_CONNECTION_TIMEOUT_MS",
      MIN_TIMEOUT_MS,
      MAX_TIMEOUT_MS,
    ),
    statementTimeoutMs: boundedInteger(
      environment.MIRTPAGE_POSTGRES_STATEMENT_TIMEOUT_MS,
      DEFAULT_STATEMENT_TIMEOUT_MS,
      "MIRTPAGE_POSTGRES_STATEMENT_TIMEOUT_MS",
      MIN_TIMEOUT_MS,
      MAX_TIMEOUT_MS,
    ),
  };
}

export function sqliteParametersToPostgres(sql: string) {
  let index = 0;
  let quote: "'" | '"' | null = null;
  let result = "";

  for (let cursor = 0; cursor < sql.length; cursor += 1) {
    const character = sql[cursor];
    if (quote) {
      result += character;
      if (character === quote) {
        if (sql[cursor + 1] === quote) {
          result += sql[cursor + 1];
          cursor += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      result += character;
      continue;
    }
    if (character === "?") {
      index += 1;
      result += `$${index}`;
      continue;
    }
    result += character;
  }
  return result;
}

export function createPostgresPool(config: PostgresRuntimeConfig) {
  // PostgreSQL returns BIGINT/Numeric values as strings by default. MirtPage IDs
  // and timestamps are bounded safe integers, so normalize them at this adapter.
  types.setTypeParser(20, Number);
  types.setTypeParser(1700, Number);
  return new Pool({
    connectionString: config.connectionString,
    max: config.poolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: config.connectionTimeoutMs,
    statement_timeout: config.statementTimeoutMs,
    query_timeout: config.statementTimeoutMs,
  });
}

export class PostgresTransactionRunner {
  private readonly currentClient = new AsyncLocalStorage<PoolClient>();

  constructor(private readonly pool: Pool) {}

  async query<T extends Record<string, unknown>>(
    sql: string,
    values: readonly unknown[] = [],
  ): Promise<PostgresQueryResult<T>> {
    const executor: Queryable = this.currentClient.getStore() || this.pool;
    const result = await executor.query<T>(sqliteParametersToPostgres(sql), [...values]);
    return { rows: result.rows, rowCount: result.rowCount || 0 };
  }

  async transaction<T>(operation: () => Promise<T>): Promise<T> {
    const active = this.currentClient.getStore();
    if (active) return operation();

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await this.currentClient.run(client, operation);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // The original operation error remains the bounded failure reported upstream.
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
