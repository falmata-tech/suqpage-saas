import crypto from "node:crypto";
import { getDb, inTransaction } from "./db";
import { hasCapability } from "./capabilities";
import {
  likePattern,
  normalizePageRequest,
  pageResult,
  pageWindow,
  type PageResult,
} from "./pagination";
import { cleanText, hashPrivateValue } from "./security";
import type { SessionUser } from "./types";

export const SUBSCRIPTION_GRACE_DAYS = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

export type AccountState = "active" | "grace" | "inactive";

export type SubscriptionView = {
  businessId: number;
  businessName: string;
  handle: string;
  planName: string;
  amountMinor: number | null;
  currency: string;
  startsAt: number;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  graceEndsAt: number;
  state: AccountState;
};

export type ShowroomInsights = {
  totalVisitors: number;
  expoVisitors: number;
  directoryVisitors: number;
  directVisitors: number;
  last30Days: number;
};

export class AccountHealthError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

type SubscriptionRow = {
  business_id: number;
  business_name: string;
  handle: string;
  plan_name: string;
  amount_minor: number | null;
  currency: string;
  starts_at: number;
  current_period_start: number;
  current_period_end: number;
  grace_ends_at: number;
};

function stateAt(row: Pick<SubscriptionRow, "current_period_end" | "grace_ends_at">, now: number): AccountState {
  if (now <= row.current_period_end) return "active";
  if (now <= row.grace_ends_at) return "grace";
  return "inactive";
}

function view(row: SubscriptionRow, now: number): SubscriptionView {
  return {
    businessId: row.business_id,
    businessName: row.business_name,
    handle: row.handle,
    planName: row.plan_name,
    amountMinor: row.amount_minor,
    currency: row.currency,
    startsAt: row.starts_at,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    graceEndsAt: row.grace_ends_at,
    state: stateAt(row, now),
  };
}

export function ensureBusinessSubscription(
  businessId: number,
  options: { now?: number; amountMinor?: number | null } = {},
) {
  const now = options.now ?? Date.now();
  const end = addMonth(now);
  getDb().prepare(`
    INSERT OR IGNORE INTO business_subscriptions(
      business_id,plan_name,amount_minor,currency,starts_at,current_period_start,
      current_period_end,grace_ends_at,updated_at
    ) VALUES(?,'SuqPage monthly',?,'ETB',?,?,?,?,?)
  `).run(
    businessId,
    options.amountMinor ?? null,
    now,
    now,
    end,
    end + SUBSCRIPTION_GRACE_DAYS * DAY_MS,
    now,
  );
}

export function getBusinessSubscription(
  businessId: number,
  now = Date.now(),
): SubscriptionView | null {
  ensureBusinessSubscription(businessId, { now });
  const row = getDb().prepare(`
    SELECT s.*,b.name business_name,b.handle
    FROM business_subscriptions s JOIN businesses b ON b.id=s.business_id
    WHERE s.business_id=?
  `).get(businessId) as SubscriptionRow | undefined;
  return row ? view(row, now) : null;
}

export function hasPublicEntitlement(businessId: number, now = Date.now()) {
  const subscription = getBusinessSubscription(businessId, now);
  return Boolean(subscription && subscription.state !== "inactive");
}

function addMonth(value: number) {
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const finalDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, finalDay));
  return date.getTime();
}

export function recordManualPayment(
  user: SessionUser,
  input: {
    businessId: unknown;
    amount: unknown;
    paidAt?: unknown;
    idempotencyKey: unknown;
  },
  now = Date.now(),
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new AccountHealthError("Operations access is required.", "forbidden");
  }
  const businessId = Number.parseInt(String(input.businessId ?? ""), 10);
  const rawAmount = String(input.amount ?? "").trim();
  const amount = rawAmount ? Number.parseFloat(rawAmount) : null;
  const idempotencyKey = cleanText(input.idempotencyKey, 100);
  const paidAt = input.paidAt ? Date.parse(String(input.paidAt)) : now;
  if (!Number.isInteger(businessId) || businessId < 1) {
    throw new AccountHealthError("Business is invalid.", "invalid_business");
  }
  if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000)) {
    throw new AccountHealthError("Payment amount is invalid.", "invalid_amount");
  }
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    throw new AccountHealthError("Payment session is invalid.", "invalid_idempotency");
  }
  if (!Number.isFinite(paidAt)) {
    throw new AccountHealthError("Payment date is invalid.", "invalid_date");
  }

  return inTransaction(() => {
    ensureBusinessSubscription(businessId, { now });
    const existing = getDb().prepare(`
      SELECT id,public_ref FROM subscription_payments
      WHERE business_id=? AND idempotency_key=?
    `).get(businessId, idempotencyKey) as { id: number; public_ref: string } | undefined;
    if (existing) return { ...existing, duplicate: true };

    const current = getBusinessSubscription(businessId, now);
    if (!current) throw new AccountHealthError("Subscription was not found.", "missing");
    const periodStart = Math.max(now, current.currentPeriodEnd);
    const periodEnd = addMonth(periodStart);
    const publicRef = `PAY-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const result = getDb().prepare(`
      INSERT INTO subscription_payments(
        public_ref,business_id,amount_minor,currency,idempotency_key,paid_at,
        recorded_by_user_id,created_at
      ) VALUES(?,?,?,'ETB',?,?,?,?)
    `).run(
      publicRef,
      businessId,
      amount === null ? null : Math.round(amount * 100),
      idempotencyKey,
      paidAt,
      user.id,
      now,
    );
    getDb().prepare(`
      UPDATE business_subscriptions
      SET amount_minor=?,current_period_start=?,current_period_end=?,
        grace_ends_at=?,updated_at=?
      WHERE business_id=?
    `).run(
      amount === null ? null : Math.round(amount * 100),
      periodStart,
      periodEnd,
      periodEnd + SUBSCRIPTION_GRACE_DAYS * DAY_MS,
      now,
      businessId,
    );
    return { id: Number(result.lastInsertRowid), public_ref: publicRef, duplicate: false };
  });
}

export function listSubscriptionPayments(user: SessionUser, businessId: number) {
  if (
    user.access_role === "client" && user.business_id !== businessId ||
    user.access_role === "team_member" ||
    !Number.isInteger(businessId)
  ) {
    throw new AccountHealthError("Payment history is unavailable.", "forbidden");
  }
  return getDb().prepare(`
    SELECT id,public_ref,amount_minor,currency,paid_at,created_at
    FROM subscription_payments
    WHERE business_id=?
    ORDER BY created_at DESC,id DESC LIMIT 24
  `).all(businessId) as Array<{
    id: number;
    public_ref: string;
    amount_minor: number | null;
    currency: string;
    paid_at: number | null;
    created_at: number;
  }>;
}

export function getShowroomInsights(user: SessionUser, businessId: number, now = Date.now()): ShowroomInsights {
  if (
    user.access_role === "client" && user.business_id !== businessId ||
    user.access_role === "team_member"
  ) {
    throw new AccountHealthError("Showroom insights are unavailable.", "forbidden");
  }
  const values = getDb().prepare(`
    SELECT
      COUNT(*) total,
      SUM(CASE WHEN source='expo' THEN 1 ELSE 0 END) expo,
      SUM(CASE WHEN source='directory' THEN 1 ELSE 0 END) directory,
      SUM(CASE WHEN source='direct' THEN 1 ELSE 0 END) direct,
      SUM(CASE WHEN created_at>=? THEN 1 ELSE 0 END) recent
    FROM showroom_visits WHERE business_id=?
  `).get(now - 30 * DAY_MS, businessId) as {
    total: number;
    expo: number | null;
    directory: number | null;
    direct: number | null;
    recent: number | null;
  };
  return {
    totalVisitors: values.total,
    expoVisitors: values.expo || 0,
    directoryVisitors: values.directory || 0,
    directVisitors: values.direct || 0,
    last30Days: values.recent || 0,
  };
}

export function listAccountHealthPage(
  user: SessionUser,
  input: { page?: unknown; q?: unknown; status?: unknown },
  now = Date.now(),
): PageResult<SubscriptionView> {
  if (!hasCapability(user, "operations:manage")) {
    throw new AccountHealthError("Operations access is required.", "forbidden");
  }
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const requestedState = ["active", "grace", "inactive"].includes(String(input.status))
    ? String(input.status) as AccountState
    : "";
  const params: Array<string | number> = [];
  let where = " WHERE 1=1";
  if (request.search) {
    where += " AND (lower(b.name) LIKE ? ESCAPE '\\' OR lower(b.handle) LIKE ? ESCAPE '\\')";
    const pattern = likePattern(request.search);
    params.push(pattern, pattern);
  }
  if (requestedState === "active") {
    where += " AND s.current_period_end>=?";
    params.push(now);
  } else if (requestedState === "grace") {
    where += " AND s.current_period_end<? AND s.grace_ends_at>=?";
    params.push(now, now);
  } else if (requestedState === "inactive") {
    where += " AND s.grace_ends_at<?";
    params.push(now);
  }
  const total = (getDb().prepare(`
    SELECT COUNT(*) total FROM business_subscriptions s
    JOIN businesses b ON b.id=s.business_id${where}
  `).get(...params) as { total: number }).total;
  const window = pageWindow(total, request);
  const rows = getDb().prepare(`
    SELECT s.*,b.name business_name,b.handle
    FROM business_subscriptions s JOIN businesses b ON b.id=s.business_id${where}
    ORDER BY s.grace_ends_at,lower(b.name),b.id
    LIMIT ? OFFSET ?
  `).all(...params, window.limit, window.offset) as SubscriptionRow[];
  return pageResult(rows.map((row) => view(row, now)), total, request);
}

export function recordShowroomVisit(input: {
  handle: unknown;
  visitorToken: string;
  source: unknown;
  occurrenceId?: unknown;
  hubKey?: unknown;
  now?: number;
}) {
  const handle = cleanText(input.handle, 80).replace(/^@/, "").toLowerCase();
  const source = ["expo", "directory"].includes(String(input.source))
    ? String(input.source) as "expo" | "directory"
    : "direct";
  const now = input.now ?? Date.now();
  const business = getDb().prepare(`
    SELECT id FROM businesses
    WHERE lower(handle)=? AND status='active'
  `).get(handle) as { id: number } | undefined;
  if (!business) return { recorded: false };
  const date = new Date(now).toISOString().slice(0, 10);
  const visitorHash = hashPrivateValue(`${input.visitorToken}|${date}`);
  const occurrenceId = Number.parseInt(String(input.occurrenceId ?? ""), 10);
  const validOccurrenceId = source === "expo" && Number.isInteger(occurrenceId) &&
    getDb().prepare("SELECT 1 FROM bazaar_occurrences WHERE id=?").get(occurrenceId)
    ? occurrenceId
    : null;
  const hubKey = cleanText(input.hubKey, 80).toLowerCase().replace(/[^a-z0-9-]/g, "");
  const result = getDb().prepare(`
    INSERT OR IGNORE INTO showroom_visits(
      business_id,visitor_hash,visit_date,source,expo_occurrence_id,expo_hub_key,created_at
    ) VALUES(?,?,?,?,?,?,?)
  `).run(
    business.id,
    visitorHash,
    date,
    source,
    validOccurrenceId,
    source === "expo" ? hubKey : "",
    now,
  );
  return { recorded: result.changes > 0 };
}
