import {
  DEFAULT_FEATURED_PROGRAM_POLICY,
  MAX_FEATURED_SHOWROOMS,
  validateFeaturedProgramDate,
} from "./featured-program";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction, type RuntimeSqlValue } from "./runtime-sql";

export class FeaturedProgramSettingsError extends Error {}

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

// The official window supersedes retained historical two-session policy rows.
export async function getFeaturedProgramPolicy() { return DEFAULT_FEATURED_PROGRAM_POLICY; }

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
      AND b.hero_image_path LIKE '/%'
      AND EXISTS(
        SELECT 1 FROM business_industries i
        WHERE i.business_id=b.id AND i.industry_key=?
      )
      AND EXISTS(
        SELECT 1 FROM products product
        WHERE product.business_id=b.id AND product.is_published=1
      )
    ORDER BY lower(b.name),b.id
  `;
  return (await port.all<FeaturedProgramEligibleBusiness>(sql, [industryKey])).sort((a,b)=>a.name.localeCompare(b.name)||a.id-b.id);
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
  if (input.mode === "manual" && businessIds.length > MAX_FEATURED_SHOWROOMS) {
    throw new FeaturedProgramSettingsError(`Choose no more than ${MAX_FEATURED_SHOWROOMS} businesses for Daily Featured.`);
  }
  if (businessIds.some((id) => !eligible.has(id))) throw new FeaturedProgramSettingsError("The manual lineup contains an ineligible business.");
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
  return {
    dateIso: input.dateIso,
    mode: input.mode,
    participantCount: input.mode === "manual" ? businessIds.length : Math.min(eligible.size, MAX_FEATURED_SHOWROOMS),
  };
}

// One bounded, indexed read keeps saved manual changes authoritative even when a
// cache adapter delays tag invalidation. Include the EAT date for midnight rollover.
export async function getFeaturedProgramCacheVersion(now = new Date(), port: FeaturedProgramReadPort = runtimeReadPort) {
  const date = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const today = date.toISOString().slice(0,10);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  const monday = date.toISOString().slice(0,10);
  date.setUTCDate(date.getUTCDate() + 6);
  const sunday = date.toISOString().slice(0,10);
  const rows = await port.all<{date_iso:string;mode:string;updated_at:number;business_id:number|null;position:number|null}>(`
    SELECT d.date_iso,d.mode,d.updated_at,l.business_id,l.position
    FROM featured_program_days d LEFT JOIN featured_program_lineup l ON l.date_iso=d.date_iso
    WHERE d.date_iso BETWEEN ? AND ? ORDER BY d.date_iso,l.position,l.business_id
  `,[monday,sunday]);
  return JSON.stringify([today,rows]);
}
