export const ORDER_SCOPES = ["unspecified", "single", "bulk", "both"] as const;
export type OrderScope = (typeof ORDER_SCOPES)[number];

export function isOrderScope(value: unknown): value is OrderScope {
  return ORDER_SCOPES.includes(value as OrderScope);
}

/** Legacy rows and snapshots make no unverified order-size claim. */
export function readOrderScope(value: unknown): OrderScope {
  return isOrderScope(value) ? value : "unspecified";
}

export function orderScopeLabels(value: unknown): string[] {
  switch (readOrderScope(value)) {
    case "single": return ["Single items welcome"];
    case "bulk": return ["Bulk orders welcome"];
    case "both": return ["Single items welcome", "Bulk orders welcome"];
    default: return [];
  }
}
