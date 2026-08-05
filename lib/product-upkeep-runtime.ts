import { postgresRuntimeEnabled } from "./postgres-runtime-services";
import { postgresProductUpkeepPort } from "./product-upkeep-postgres";
import { sqliteProductUpkeepPort } from "./product-upkeep-sqlite";

export function runtimeProductUpkeepPort() {
  return postgresRuntimeEnabled() ? postgresProductUpkeepPort : sqliteProductUpkeepPort;
}
