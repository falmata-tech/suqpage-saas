import { postgresRuntimeServices } from "./postgres-runtime-services";
export type RuntimeSqlValue = string | number | bigint | Uint8Array | null;
export async function runtimeGet<T>(sql: string, values: readonly RuntimeSqlValue[] = []): Promise<T | undefined> {
  return (await postgresRuntimeServices().runner.query<T & Record<string, unknown>>(sql, values)).rows[0];
}
export async function runtimeAll<T>(sql: string, values: readonly RuntimeSqlValue[] = []): Promise<T[]> {
  return (await postgresRuntimeServices().runner.query<T & Record<string, unknown>>(sql, values)).rows;
}
export async function runtimeRun(sql: string, values: readonly RuntimeSqlValue[] = []) {
  return { changes: (await postgresRuntimeServices().runner.query(sql, values)).rowCount };
}
export async function runtimeTransaction<T>(operation: () => Promise<T>): Promise<T> {
  return postgresRuntimeServices().runner.transaction(operation);
}
