import { postgresRuntimePreviewEnabled } from "./postgres-runtime-services";
import { postgresProductUpkeepPort } from "./product-upkeep-postgres";
import { sqliteProductUpkeepPort } from "./product-upkeep-sqlite";

export function runtimeProductUpkeepPort() {
  return postgresRuntimePreviewEnabled() ? postgresProductUpkeepPort : sqliteProductUpkeepPort;
}
