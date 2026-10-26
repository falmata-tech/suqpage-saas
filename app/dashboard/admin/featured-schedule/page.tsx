import Link from "next/link";

import { getUiText } from "@/lib/i18n/server";
import CategoryIllustration from "@/components/CategoryIllustration";
import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import FeaturedLineupSelector from "@/components/FeaturedLineupSelector";
import FocusedEditForm from '@/components/FocusedEditForm';
import { saveFeaturedProgramDayAction } from "@/app/staff-actions";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { featuredProgramAssignment, getSponsoredShowrooms } from "@/lib/discovery";
import { automaticFeaturedLineup, buildFeaturedProgramAgenda, MAX_FEATURED_SHOWROOMS, validateFeaturedProgramDate } from "@/lib/featured-program";
import {
  getFeaturedProgramDaySelection,
  getFeaturedProgramPolicy,
  listFeaturedProgramEligibleBusinesses,
} from "@/lib/featured-program-settings";

export const dynamic = "force-dynamic";

function todayInEthiopia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function normalizedProgramDate(value: string | undefined) {
  try {
    validateFeaturedProgramDate(value || "");
    return value!;
  } catch {
    return todayInEthiopia();
  }
}

export default async function FeaturedSchedulePage({ searchParams }: {
  searchParams: Promise<{ date?: string; saved?: string; error?: string; edit?:string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const requestedDate = normalizedProgramDate(query.date);
  const assignment = featuredProgramAssignment(requestedDate);
  if (!assignment) redirect(`/dashboard/admin/featured-schedule?date=${todayInEthiopia()}&error=${encodeURIComponent("Choose a valid program date.")}`);

  const [policy, selection, eligible, sponsorPlacements] = await Promise.all([
    getFeaturedProgramPolicy(),
    getFeaturedProgramDaySelection(requestedDate),
    listFeaturedProgramEligibleBusinesses(assignment.industry.key),
    getSponsoredShowrooms(),
  ]);
  const eligibleById = new Map(eligible.map((business) => [business.id, business]));
  const retainedManual = selection.businessIds.filter((businessId) => eligibleById.has(businessId));
  const effectiveMode = selection.mode === "manual" && retainedManual.length ? "manual" : "automatic";
  const effectiveIds = (effectiveMode === "manual" ? retainedManual : automaticFeaturedLineup(requestedDate, eligible).map((business) => business.id)).slice(0, MAX_FEATURED_SHOWROOMS);
  const effectiveOrder = new Map(effectiveIds.map((businessId, index) => [businessId, index + 1]));
  const agenda = buildFeaturedProgramAgenda(requestedDate, effectiveIds.length, Date.parse(`${requestedDate}T00:00:00+03:00`), policy);
  const sponsorForSlot = (slot: number | undefined) => slot && sponsorPlacements.length ? sponsorPlacements[(slot - 1) % sponsorPlacements.length] : null;
  const readHref=`/dashboard/admin/featured-schedule?date=${requestedDate}`;

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head featured-schedule-head">
        <div>
          <span className="eyebrow">{t("Marketplace programming")}</span>
          <h1>{t("Daily Featured schedule")}</h1>
          <p>{t("Your evening lineup is automatic. Choose a date to make changes.")}</p>
        </div>
        <CalendarClock aria-hidden="true" size={30}/>
      </div>
      {query.saved === "lineup" ? <p className="notice">{t("The lineup was saved and the public timetable recalculated.")}</p> : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}

      <section className="featured-schedule-summary" aria-label={t("Selected program day")}>
        <form action="/dashboard/admin/featured-schedule" method="get" className="featured-schedule-date">
          <label htmlFor="program-date">{t("Program date")}</label>
          <input id="program-date" name="date" type="date" defaultValue={requestedDate}/>
          <button className="small-btn" type="submit">{t("Open date")}</button>
        </form>
        <div><small>{t("Assigned day")}</small><strong>{assignment.dayLabel}</strong></div>
        <div><small>{t("Category")}</small><strong>{t(assignment.industry.label)}</strong></div>
        <div><small>{t("Current mode")}</small><strong>{effectiveMode === "manual" ? t("Manual lineup") : t("Automatic")}</strong></div>
        <div><small>{t("Participants")}</small><strong>{effectiveIds.length}</strong></div>
        <div><small>{t("Sponsor placements")}</small><strong>{sponsorPlacements.length}</strong></div>
      </section>

      <section className="panel featured-policy">
        <h2>{t("8:15 PM–9:45 PM EAT")}</h2>
        <p>{t("Four businesses, two short sponsor mentions. Times are arranged automatically.")}</p>
        <Link className="small-btn" href="/dashboard/admin/sponsors">{t("Manage sponsors")}</Link>
      </section>

      <section className="panel featured-lineup-panel">
        <div className="featured-lineup-heading">
          <div><span className="eyebrow">{requestedDate}</span><h2><CategoryIllustration name={assignment.industry.key} size={36}/>{t(assignment.industry.label)}</h2><p>{t("Automatic rotates up to {limit} eligible businesses each week. Manual lets you choose their order.", {limit: MAX_FEATURED_SHOWROOMS})}</p></div>
          <span className="badge active">{effectiveIds.length} {" "}{t("scheduled")}</span>
        </div>
        {query.edit==='lineup'?<FocusedEditForm key={`${requestedDate}:${effectiveMode}:${effectiveIds.join(",")}`} action={saveFeaturedProgramDayAction} cancelHref={readHref} submitLabel="Save lineup" disabled={!eligible.length} className="form-grid">
          <input type="hidden" name="dateIso" value={requestedDate}/>
          <div className="featured-mode-picker" role="radiogroup" aria-labelledby="featured-mode-title">
            <strong className="featured-mode-title" id="featured-mode-title">{t("Scheduling mode")}</strong>
            <label><input type="radio" name="mode" value="automatic" defaultChecked={effectiveMode === "automatic"}/><span><strong>{t("Automatic")}</strong><small>{t("Rotate eligible businesses automatically.")}</small></span></label>
            <label><input type="radio" name="mode" value="manual" defaultChecked={effectiveMode === "manual"}/><span><strong>{t("Manual")}</strong><small>{t("Use the checked businesses in the numbered order.")}</small></span></label>
          </div>
          {eligible.length ? <FeaturedLineupSelector
            limit={MAX_FEATURED_SHOWROOMS}
            businesses={eligible.map((business, index) => ({
              ...business,
              selected: effectiveOrder.has(business.id),
              position: effectiveOrder.get(business.id) || Math.min(index + 1, MAX_FEATURED_SHOWROOMS),
            }))}
          /> : <div className="empty-state">{t("No businesses in this category are ready to feature yet.")}</div>}
          <div className="featured-lineup-actions"><p>{t("Eligibility is checked again when you save and whenever the public schedule is read.")}</p></div>
        </FocusedEditForm>:<><ol className="compact-business-list">{effectiveIds.map(id=><li key={id} className="compact-business-row"><span><strong>{eligibleById.get(id)?.name}</strong><small>@{eligibleById.get(id)?.handle}</small></span><Link className="small-btn" href={`/dashboard?business=${id}`}>{t('Open workspace')}</Link></li>)}</ol><Link className="btn brand" href={`${readHref}&edit=lineup`}>{t('Edit')}</Link></>}
      </section>

      <section className="panel featured-agenda-preview">
        <div className="featured-lineup-heading"><div><span className="eyebrow">{t("Generated preview")}</span><h2>{t("Broadcast agenda")}</h2><p>{t("Each business has 20 minutes. Smaller lineups finish earlier.")}</p></div></div>
        <ol tabIndex={0} aria-label={t("Generated Daily Featured broadcast agenda")}>
          {agenda.map((entry, index) => <li className={`agenda-${entry.kind}`} key={`${entry.kind}-${entry.start}-${index}`}>
            <time>{entry.kind === "booth" ? entry.label : entry.timeLabel}</time>
            <span>{entry.kind === "booth" ? t("Booth {value1}", { value1: String(entry.slot).padStart(2, "0") }) : entry.kind === "sponsor_break" ? sponsorForSlot(entry.sponsorSlot)?.name || t("Unassigned sponsor") : t(entry.label)}</span>
            <small>{entry.kind === "booth" ? eligibleById.get(effectiveIds[entry.slot - 1])?.name : entry.kind === "sponsor_break" ? t("Sponsor mention") : t("Booth changeover")}</small>
          </li>)}
        </ol>
      </section>
    </DashboardShell>
  );
}
