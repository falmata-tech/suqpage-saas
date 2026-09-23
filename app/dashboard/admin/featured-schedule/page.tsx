import ClockInput from "@/components/ClockInput";

import { getUiText } from "@/lib/i18n/server";
import CategoryIllustration from "@/components/CategoryIllustration";
import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import FeaturedLineupSelector from "@/components/FeaturedLineupSelector";
import { saveFeaturedProgramDayAction, updateFeaturedProgramPolicyAction } from "@/app/staff-actions";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { featuredProgramAssignment, getSponsoredShowrooms } from "@/lib/discovery";
import { buildFeaturedProgramAgenda, MAX_FEATURED_SHOWROOMS, validateFeaturedProgramDate } from "@/lib/featured-program";
import {
  getFeaturedProgramDaySelection,
  getFeaturedProgramPolicy,
  listFeaturedProgramEligibleBusinesses,
  minuteToTimeInput,
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
  searchParams: Promise<{ date?: string; saved?: string; error?: string }>;
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
  const effectiveIds = (effectiveMode === "manual" ? retainedManual : eligible.map((business) => business.id)).slice(0, MAX_FEATURED_SHOWROOMS);
  const effectiveOrder = new Map(effectiveIds.map((businessId, index) => [businessId, index + 1]));
  const agenda = buildFeaturedProgramAgenda(requestedDate, effectiveIds.length, Date.parse(`${requestedDate}T00:00:00+03:00`), policy);
  const sponsorForSlot = (slot: number | undefined) => slot && sponsorPlacements.length ? sponsorPlacements[(slot - 1) % sponsorPlacements.length] : null;

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head featured-schedule-head">
        <div>
          <span className="eyebrow">{t("Marketplace programming")}</span>
          <h1>{t("Daily Featured schedule")}</h1>
          <p>{t("Set the broadcast rhythm once, then adjust a date only when its lineup needs editorial control.")}</p>
        </div>
        <CalendarClock aria-hidden="true" size={30}/>
      </div>
      {query.saved === "policy" ? <p className="notice">{t("Program times and break rules updated.")}</p> : null}
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

      <details className="panel admin-form-disclosure featured-policy" open={false}>
        <summary>{t("Program times and breaks")}{" "}<span>{t("Capacity: 8:00 AM–1:00 PM and 5:00 PM–10:00 PM EAT")}</span></summary>
        <form className="admin-form-disclosure-body form-grid" action={updateFeaturedProgramPolicyAction}>
          <input type="hidden" name="dateIso" value={requestedDate}/>
          <div className="field"><label htmlFor="morning-start">{t("Morning starts")}</label><ClockInput id="morning-start" name="morningStart" label={t("Morning starts")} defaultValue={minuteToTimeInput(policy.morningStartMinute)}/></div>
          <div className="field"><label htmlFor="morning-end">{t("Morning ends")}</label><ClockInput id="morning-end" name="morningEnd" label={t("Morning ends")} defaultValue={minuteToTimeInput(policy.morningEndMinute)}/></div>
          <div className="field"><label htmlFor="afternoon-start">{t("Afternoon starts")}</label><ClockInput id="afternoon-start" name="afternoonStart" label={t("Afternoon starts")} defaultValue={minuteToTimeInput(policy.afternoonStartMinute)}/></div>
          <div className="field"><label htmlFor="afternoon-end">{t("Afternoon ends")}</label><ClockInput id="afternoon-end" name="afternoonEnd" label={t("Afternoon ends")} defaultValue={minuteToTimeInput(policy.afternoonEndMinute)}/></div>
          <div className="field"><label htmlFor="changeover-minutes">{t("Changeover minutes")}</label><input id="changeover-minutes" name="changeoverMinutes" type="number" min="2" max="20" required defaultValue={policy.changeoverMinutes}/></div>
          <div className="field"><label htmlFor="sponsor-break-every">{t("Sponsor break after every")}</label><input id="sponsor-break-every" name="sponsorBreakEvery" type="number" min="2" max="8" required defaultValue={policy.sponsorBreakEvery}/><small>{t("Number of booth presentations in each session.")}</small></div>
          <div className="field"><label htmlFor="sponsor-break-minutes">{t("Sponsor-break minutes")}</label><input id="sponsor-break-minutes" name="sponsorBreakMinutes" type="number" min="5" max="30" required defaultValue={policy.sponsorBreakMinutes}/></div>
          <div className="field"><label htmlFor="sponsor-break-label">{t("Sponsor-break label")}</label><input id="sponsor-break-label" name="sponsorBreakLabel" maxLength={60} required defaultValue={policy.sponsorBreakLabel}/></div>
          <div className="field full"><label htmlFor="intermission-label">{t("Intermission label")}</label><input id="intermission-label" name="intermissionLabel" maxLength={60} required defaultValue={policy.intermissionLabel}/></div>
          <div className="field full"><button className="btn" type="submit">{t("Save program policy")}</button></div>
        </form>
      </details>

      <section className="panel featured-lineup-panel">
        <div className="featured-lineup-heading">
          <div><span className="eyebrow">{requestedDate}</span><h2><CategoryIllustration name={assignment.industry.key} size={36}/>{t(assignment.industry.label)}</h2><p>{t("Automatic selects the first {limit} eligible pages by name. Manual lets you choose and order up to {limit} pages.", {limit: MAX_FEATURED_SHOWROOMS})}</p></div>
          <span className="badge active">{effectiveIds.length} {" "}{t("scheduled")}</span>
        </div>
        <form action={saveFeaturedProgramDayAction}>
          <input type="hidden" name="dateIso" value={requestedDate}/>
          <div className="featured-mode-picker" role="radiogroup" aria-labelledby="featured-mode-title">
            <strong className="featured-mode-title" id="featured-mode-title">{t("Scheduling mode")}</strong>
            <label><input type="radio" name="mode" value="automatic" defaultChecked={effectiveMode === "automatic"}/><span><strong>{t("Automatic")}</strong><small>{t("Always use the current eligible set.")}</small></span></label>
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
          <div className="featured-lineup-actions"><p>{t("Eligibility is checked again when you save and whenever the public schedule is read.")}</p><button className="btn" type="submit" disabled={!eligible.length}>{t("Save lineup")}</button></div>
        </form>
      </section>

      <section className="panel featured-agenda-preview">
        <div className="featured-lineup-heading"><div><span className="eyebrow">{t("Generated preview")}</span><h2>{t("Broadcast agenda")}</h2><p>{t("Times adjust to the number of businesses featured.")}</p></div></div>
        <ol tabIndex={0} aria-label={t("Generated Daily Featured broadcast agenda")}>
          {agenda.map((entry, index) => <li className={`agenda-${entry.kind}`} key={`${entry.kind}-${entry.start}-${index}`}>
            <time>{entry.kind === "booth" ? entry.label : entry.timeLabel}</time>
            <span>{entry.kind === "booth" ? t("Booth {value1}", { value1: String(entry.slot).padStart(2, "0") }) : entry.kind === "sponsor_break" ? sponsorForSlot(entry.sponsorSlot)?.name || entry.label : entry.label}</span>
            <small>{entry.session === "morning" ? t("Morning") : entry.session === "afternoon" ? t("Afternoon") : t("Intermission")}</small>
          </li>)}
        </ol>
      </section>
    </DashboardShell>
  );
}
