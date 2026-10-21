/** Platform labels only; activity values come from the authorized owner response. */
export const OWNER_ACTIVITY_METRICS = [
  { field: "visitsTotal", label: "Page visits" },
  { field: "visits30Days", label: "Last 30 days" },
  { field: "products", label: "Products" },
] as const;
