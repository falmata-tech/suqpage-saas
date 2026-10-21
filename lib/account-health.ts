import crypto from "node:crypto";
import { cleanText, hashPrivateValue } from "./security";
import { runtimeGet, runtimeRun } from "./runtime-sql";
import type { SessionUser } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ShowroomInsights = {
  totalVisitors: number;
  featuredVisitors: number;
  directoryVisitors: number;
  directVisitors: number;
  last30Days: number;
};

export class AccountHealthError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

export async function getShowroomInsights(user: SessionUser, businessId: number, now = Date.now()): Promise<ShowroomInsights> {
  if (
    user.access_role === "client" && user.business_id !== businessId ||
    user.access_role === "team_member"
  ) {
    throw new AccountHealthError("Showroom insights are unavailable.", "forbidden");
  }
  const values = (await runtimeGet<{
    total: number;
    featured: number | null;
    directory: number | null;
    direct: number | null;
    recent: number | null;
  }>(`
    SELECT
      COUNT(*) total,
      -- The retained SQL value predates Daily Featured. Keep it adapter-local
      -- until a backup-backed constrained-table migration can replace it.
      SUM(CASE WHEN source='expo' THEN 1 ELSE 0 END) featured,
      SUM(CASE WHEN source='directory' THEN 1 ELSE 0 END) directory,
      SUM(CASE WHEN source='direct' THEN 1 ELSE 0 END) direct,
      SUM(CASE WHEN created_at>=? THEN 1 ELSE 0 END) recent
    FROM showroom_visits WHERE business_id=?
  `, [now - 30 * DAY_MS, businessId]))!;
  return {
    totalVisitors: values.total,
    featuredVisitors: values.featured || 0,
    directoryVisitors: values.directory || 0,
    directVisitors: values.direct || 0,
    last30Days: values.recent || 0,
  };
}

export async function recordShowroomVisit(input: {
  handle: unknown;
  visitorToken: string;
  source: unknown;
  occurrenceId?: unknown;
  hubKey?: unknown;
  now?: number;
}) {
  const handle = cleanText(input.handle, 80).replace(/^@/, "").toLowerCase();
  const source = ["featured", "directory"].includes(String(input.source))
    ? String(input.source) as "featured" | "directory"
    : "direct";
  const now = input.now ?? Date.now();
  const business = await runtimeGet<{ id: number }>(`
    SELECT id FROM businesses
    WHERE lower(handle)=? AND status='active'
  `, [handle]);
  if (!business) return { recorded: false };
  const date = new Date(now).toISOString().slice(0, 10);
  const visitorHash = hashPrivateValue(`${input.visitorToken}|${date}`);
  const occurrenceId = Number.parseInt(String(input.occurrenceId ?? ""), 10);
  const validOccurrenceId = null;
  const hubKey = cleanText(input.hubKey, 80).toLowerCase().replace(/[^a-z0-9-]/g, "");
  const storedSource = source === "featured" ? "expo" : source;
  const result = await runtimeRun(`
    INSERT INTO showroom_visits(
      business_id,visitor_hash,visit_date,source,expo_occurrence_id,expo_hub_key,created_at
    ) VALUES(?,?,?,?,?,?,?) ON CONFLICT DO NOTHING
  `, [
    business.id,
    visitorHash,
    date,
    storedSource,
    validOccurrenceId,
    source === "featured" ? hubKey : "",
    now,
  ]);
  return { recorded: result.changes > 0 };
}
