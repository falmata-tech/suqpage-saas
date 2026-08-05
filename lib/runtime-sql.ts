import { getDb } from "./db";
import { postgresRuntimePreviewEnabled, postgresRuntimeServices } from "./postgres-runtime-services";

export type RuntimeSqlValue = string | number | bigint | Uint8Array | null;

export async function runtimeGet<T>(sql: string, values: readonly RuntimeSqlValue[] = []): Promise<T | undefined> {
  if (postgresRuntimePreviewEnabled()) return (await postgresRuntimeServices().runner.query<T & Record<string, unknown>>(sql, values)).rows[0] as T | undefined;
  return getDb().prepare(sql).get(...values) as T | undefined;
}

export async function runtimeAll<T>(sql: string, values: readonly RuntimeSqlValue[] = []): Promise<T[]> {
  if (postgresRuntimePreviewEnabled()) return (await postgresRuntimeServices().runner.query<T & Record<string, unknown>>(sql, values)).rows as T[];
  return getDb().prepare(sql).all(...values) as T[];
}

export async function runtimeRun(sql: string, values: readonly RuntimeSqlValue[] = []) {
  if (postgresRuntimePreviewEnabled()) {
    const result = await postgresRuntimeServices().runner.query(sql, values);
    return { changes: result.rowCount };
  }
  return getDb().prepare(sql).run(...values);
}

let sqliteTransactionQueue: Promise<void> = Promise.resolve();

export async function runtimeTransaction<T>(operation: () => Promise<T>): Promise<T> {
  if (postgresRuntimePreviewEnabled()) return postgresRuntimeServices().runner.transaction(operation);
  const previous = sqliteTransactionQueue;
  let release = () => {};
  sqliteTransactionQueue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = await operation();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    release();
  }
}
