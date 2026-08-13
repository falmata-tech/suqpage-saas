import {
  DEFAULT_FEATURED_PROGRAM_POLICY,
  validateFeaturedProgramDate,
  validateFeaturedProgramPolicy,
  type FeaturedProgramPolicy,
} from "./featured-program";
import { cleanText } from "./security";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction, type RuntimeSqlValue } from "./runtime-sql";

export class FeaturedProgramSettingsError extends Error {}

type PolicyRow = {
  morning_start_minute: number;
  morning_end_minute: number;
  afternoon_start_minute: number;
  afternoon_end_minute: number;
  changeover_minutes: number;
  sponsor_break_every: number;
  sponsor_break_minutes: number;
  sponsor_break_label: string;
  intermission_label: string;
};

export type FeaturedProgramDayMode = "automatic" | "manual";

export type FeaturedProgramDaySelection = {
  dateIso: string;
  mode: FeaturedProgramDayMode;
  businessIds: number[];
};

export type FeaturedProgramEligibleBusiness = {
  id: number;
  name: string;
  handle: string;
  city: string;
  region: string;
};

export interface FeaturedProgramReadPort {
  get<T>(sql: string, values?: readonly RuntimeSqlValue[]): Promise<T | undefined>;
  all<T>(sql: string, values?: readonly RuntimeSqlValue[]): Promise<T[]>;
}

export interface FeaturedProgramWritePort extends FeaturedProgramReadPort {
  run(sql: string, values?: readonly RuntimeSqlValue[]): Promise<unknown>;
  transaction<T>(operation: () => Promise<T>): Promise<T>;
}

const runtimeReadPort: FeaturedProgramReadPort = {
  get: runtimeGet,
  all: runtimeAll,
};

const runtimeWritePort: FeaturedProgramWritePort = {
  ...runtimeReadPort,
  run: runtimeRun,
  transaction: runtimeTransaction,
};

function mapPolicy(row: PolicyRow | undefined): FeaturedProgramPolicy {
  if (!row) return DEFAULT_FEATURED_PROGRAM_POLICY;
  return validateFeaturedProgramPolicy({
    morningStartMinute: Number(row.morning_start_minute),
    morningEndMinute: Number(row.morning_end_minute),
    afternoonStartMinute: Number(row.afternoon_start_minute),
    afternoonEndMinute: Number(row.afternoon_end_minute),
    changeoverMinutes: Number(row.changeover_minutes),
    sponsorBreakEvery: Number(row.sponsor_break_every),
    sponsorBreakMinutes: Number(row.sponsor_break_minutes),
    sponsorBreakLabel: row.sponsor_break_label,
    intermissionLabel: row.intermission_label,
  });
}

export function minuteToTimeInput(minute: number) {
  if (!Number.isSafeInteger(minute) || minute < 0 || minute > 1439) throw new FeaturedProgramSettingsError("Program time is outside one day.");
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function timeInputToMinute(value: unknown, label: string) {
  const cleaned = cleanText(value, 5);
  const match = /^(\d{2}):(\d{2})$/.exec(cleaned);
  if (!match) throw new FeaturedProgramSettingsError(`${label} must use a valid time.`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new FeaturedProgramSettingsError(`${label} must use a valid time.`);
  return hour * 60 + minute;
}

function integerInput(value: unknown, label: string) {
  const parsed = Number.parseInt(cleanText(value, 10), 10);
  if (!Number.isSafeInteger(parsed)) throw new FeaturedProgramSettingsError(`${label} must be a whole number.`);
  return parsed;
}

export function featuredProgramPolicyFromForm(input: {
  morningStart: unknown;
  morningEnd: unknown;
  afternoonStart: unknown;
  afternoonEnd: unknown;
  changeoverMinutes: unknown;
  sponsorBreakEvery: unknown;
  sponsorBreakMinutes: unknown;
  sponsorBreakLabel: unknown;
  intermissionLabel: unknown;
}) {
  try {
    return validateFeaturedProgramPolicy({
      morningStartMinute: timeInputToMinute(input.morningStart, "Morning start"),
      morningEndMinute: timeInputToMinute(input.morningEnd, "Morning end"),
      afternoonStartMinute: timeInputToMinute(input.afternoonStart, "Afternoon start"),
      afternoonEndMinute: timeInputToMinute(input.afternoonEnd, "Afternoon end"),
      changeoverMinutes: integerInput(input.changeoverMinutes, "Booth changeover"),
      sponsorBreakEvery: integerInput(input.sponsorBreakEvery, "Sponsor-break frequency"),
      sponsorBreakMinutes: integerInput(input.sponsorBreakMinutes, "Sponsor-break duration"),
      sponsorBreakLabel: cleanText(input.sponsorBreakLabel, 60),
      intermissionLabel: cleanText(input.intermissionLabel, 60),
    });
  } catch (error) {
    throw new FeaturedProgramSettingsError(error instanceof Error ? error.message : "Featured program policy is invalid.");
  }
}

export async function getFeaturedProgramPolicy(port: FeaturedProgramReadPort = runtimeReadPort) {
  const sql = `
    SELECT morning_start_minute,morning_end_minute,afternoon_start_minute,
      afternoon_end_minute,changeover_minutes,sponsor_break_every,
      sponsor_break_minutes,sponsor_break_label,intermission_label
    FROM featured_program_policy WHERE id=1
  `;
  const row = await port.get<PolicyRow>(sql);
  return mapPolicy(row);
}

export async function updateFeaturedProgramPolicy(policy: FeaturedProgramPolicy, actorUserId: number, port: FeaturedProgramWritePort = runtimeWritePort) {
  let validated: FeaturedProgramPolicy;
  try {
    validated = validateFeaturedProgramPolicy(policy);
  } catch (error) {
    throw new FeaturedProgramSettingsError(error instanceof Error ? error.message : "Featured program policy is invalid.");
  }
  if (!Number.isSafeInteger(actorUserId) || actorUserId <= 0) throw new FeaturedProgramSettingsError("A valid administrator is required.");
  const sql = `
    INSERT INTO featured_program_policy(
      id,morning_start_minute,morning_end_minute,afternoon_start_minute,
      afternoon_end_minute,changeover_minutes,sponsor_break_every,
      sponsor_break_minutes,sponsor_break_label,intermission_label,
      updated_by_user_id,updated_at
    ) VALUES(1,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      morning_start_minute=excluded.morning_start_minute,
      morning_end_minute=excluded.morning_end_minute,
      afternoon_start_minute=excluded.afternoon_start_minute,
      afternoon_end_minute=excluded.afternoon_end_minute,
      changeover_minutes=excluded.changeover_minutes,
      sponsor_break_every=excluded.sponsor_break_every,
      sponsor_break_minutes=excluded.sponsor_break_minutes,
      sponsor_break_label=excluded.sponsor_break_label,
      intermission_label=excluded.intermission_label,
      updated_by_user_id=excluded.updated_by_user_id,
      updated_at=excluded.updated_at
  `;
  const values = [
    validated.morningStartMinute,
    validated.morningEndMinute,
    validated.afternoonStartMinute,
    validated.afternoonEndMinute,
    validated.changeoverMinutes,
    validated.sponsorBreakEvery,
    validated.sponsorBreakMinutes,
    validated.sponsorBreakLabel,
    validated.intermissionLabel,
    actorUserId,
    Date.now(),
  ];
  await port.run(sql, values);
  return validated;
}

export async function getFeaturedProgramDaySelection(dateIso: string, port: FeaturedProgramReadPort = runtimeReadPort): Promise<FeaturedProgramDaySelection> {
  try { validateFeaturedProgramDate(dateIso); } catch (error) { throw new FeaturedProgramSettingsError(error instanceof Error ? error.message : "Program date is invalid."); }
  const daySql = "SELECT mode FROM featured_program_days WHERE date_iso=?";
  const day = await port.get<{ mode: FeaturedProgramDayMode }>(daySql, [dateIso]);
  if (day?.mode !== "manual") return { dateIso, mode: "automatic", businessIds: [] };
  const lineupSql = "SELECT business_id FROM featured_program_lineup WHERE date_iso=? ORDER BY position,business_id";
  const rows = await port.all<{ business_id: number }>(lineupSql, [dateIso]);
  return { dateIso, mode: "manual", businessIds: rows.map((row) => Number(row.business_id)) };
}

export async function listFeaturedProgramEligibleBusinesses(industryKey: string, port: FeaturedProgramReadPort = runtimeReadPort): Promise<FeaturedProgramEligibleBusiness[]> {
  const sql = `
    SELECT b.id,b.name,b.handle,p.city,p.region
    FROM businesses b
    JOIN business_discovery_profiles p ON p.business_id=b.id
    WHERE b.status='active'
      AND p.is_excluded=0
      AND p.approved_at > 0
      AND p.booth_image_path LIKE '/%'
      AND EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=?
      )
      AND EXISTS(
        SELECT 1 FROM products product
        WHERE product.business_id=b.id AND product.is_published=1
      )
    ORDER BY lower(b.name),b.id
    LIMIT 100
  `;
  return port.all<FeaturedProgramEligibleBusiness>(sql, [industryKey]);
}

export async function saveFeaturedProgramDay(input: {
  dateIso: string;
  mode: FeaturedProgramDayMode;
  businessIds: number[];
  eligibleBusinessIds: number[];
  actorUserId: number;
}, port: FeaturedProgramWritePort = runtimeWritePort) {
  try { validateFeaturedProgramDate(input.dateIso); } catch (error) { throw new FeaturedProgramSettingsError(error instanceof Error ? error.message : "Program date is invalid."); }
  if (input.mode !== "automatic" && input.mode !== "manual") throw new FeaturedProgramSettingsError("Choose Automatic or Manual scheduling.");
  if (!Number.isSafeInteger(input.actorUserId) || input.actorUserId <= 0) throw new FeaturedProgramSettingsError("A valid administrator is required.");
  const eligible = new Set(input.eligibleBusinessIds.filter((id) => Number.isSafeInteger(id) && id > 0));
  const businessIds = [...new Set(input.businessIds.filter((id) => Number.isSafeInteger(id) && id > 0))];
  if (input.mode === "manual" && !businessIds.length) throw new FeaturedProgramSettingsError("Choose at least one eligible business for a manual lineup.");
  if (businessIds.length > 100 || businessIds.some((id) => !eligible.has(id))) throw new FeaturedProgramSettingsError("The manual lineup contains an ineligible business.");
  const now = Date.now();
  const operation = async () => {
    if (input.mode === "automatic") {
      await port.run("DELETE FROM featured_program_days WHERE date_iso=?", [input.dateIso]);
      return;
    }
    await port.run(`
      INSERT INTO featured_program_days(date_iso,mode,updated_by_user_id,updated_at)
      VALUES(?,'manual',?,?)
      ON CONFLICT(date_iso) DO UPDATE SET
        mode='manual',updated_by_user_id=excluded.updated_by_user_id,updated_at=excluded.updated_at
    `, [input.dateIso, input.actorUserId, now]);
    await port.run("DELETE FROM featured_program_lineup WHERE date_iso=?", [input.dateIso]);
    for (let index = 0; index < businessIds.length; index += 1) {
      await port.run("INSERT INTO featured_program_lineup(date_iso,business_id,position) VALUES(?,?,?)", [input.dateIso, businessIds[index], index + 1]);
    }
  };
  await port.transaction(operation);
  return { dateIso: input.dateIso, mode: input.mode, participantCount: input.mode === "manual" ? businessIds.length : eligible.size };
}
