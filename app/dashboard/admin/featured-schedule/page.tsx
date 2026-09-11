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
          <span className="eyebrow">Marketplace programming</span>
          <h1>Daily Featured schedule</h1>
          <p>Set the broadcast rhythm once, then adjust a date only when its lineup needs editorial control.</p>
        </div>
        <CalendarClock aria-hidden="true" size={30}/>
      </div>
      {query.saved === "policy" ? <p className="notice">Program times and break rules updated.</p> : null}
      {query.saved === "lineup" ? <p className="notice">The lineup was saved and the public timetable recalculated.</p> : null}
      {query.error ? <p className="error">{query.error}</p> : null}

      <section className="featured-schedule-summary" aria-label="Selected program day">
        <form action="/dashboard/admin/featured-schedule" method="get" className="featured-schedule-date">
          <label htmlFor="program-date">Program date</label>
          <input id="program-date" name="date" type="date" defaultValue={requestedDate}/>
          <button className="small-btn" type="submit">Open date</button>
        </form>
        <div><small>Assigned day</small><strong>{assignment.dayLabel}</strong></div>
        <div><small>Industry</small><strong>{assignment.industry.label}</strong></div>
        <div><small>Current mode</small><strong>{effectiveMode === "manual" ? "Manual lineup" : "Automatic"}</strong></div>
        <div><small>Participants</small><strong>{effectiveIds.length}</strong></div>
        <div><small>Sponsor placements</small><strong>{sponsorPlacements.length}</strong></div>
      </section>

      <details className="panel admin-form-disclosure featured-policy" open={false}>
        <summary>Program times and breaks <span>Capacity: 08:00–13:00 and 17:00–22:00 EAT</span></summary>
        <form className="admin-form-disclosure-body form-grid" action={updateFeaturedProgramPolicyAction}>
          <input type="hidden" name="dateIso" value={requestedDate}/>
          <div className="field"><label htmlFor="morning-start">Morning starts</label><input id="morning-start" name="morningStart" type="time" required defaultValue={minuteToTimeInput(policy.morningStartMinute)}/></div>
          <div className="field"><label htmlFor="morning-end">Morning ends</label><input id="morning-end" name="morningEnd" type="time" required defaultValue={minuteToTimeInput(policy.morningEndMinute)}/></div>
          <div className="field"><label htmlFor="afternoon-start">Afternoon starts</label><input id="afternoon-start" name="afternoonStart" type="time" required defaultValue={minuteToTimeInput(policy.afternoonStartMinute)}/></div>
          <div className="field"><label htmlFor="afternoon-end">Afternoon ends</label><input id="afternoon-end" name="afternoonEnd" type="time" required defaultValue={minuteToTimeInput(policy.afternoonEndMinute)}/></div>
          <div className="field"><label htmlFor="changeover-minutes">Changeover minutes</label><input id="changeover-minutes" name="changeoverMinutes" type="number" min="2" max="20" required defaultValue={policy.changeoverMinutes}/></div>
          <div className="field"><label htmlFor="sponsor-break-every">Sponsor break after every</label><input id="sponsor-break-every" name="sponsorBreakEvery" type="number" min="2" max="8" required defaultValue={policy.sponsorBreakEvery}/><small>Number of booth presentations in each session.</small></div>
          <div className="field"><label htmlFor="sponsor-break-minutes">Sponsor-break minutes</label><input id="sponsor-break-minutes" name="sponsorBreakMinutes" type="number" min="5" max="30" required defaultValue={policy.sponsorBreakMinutes}/></div>
          <div className="field"><label htmlFor="sponsor-break-label">Sponsor-break label</label><input id="sponsor-break-label" name="sponsorBreakLabel" maxLength={60} required defaultValue={policy.sponsorBreakLabel}/></div>
          <div className="field full"><label htmlFor="intermission-label">Intermission label</label><input id="intermission-label" name="intermissionLabel" maxLength={60} required defaultValue={policy.intermissionLabel}/></div>
          <div className="field full"><button className="btn" type="submit">Save program policy</button></div>
        </form>
      </details>

      <section className="panel featured-lineup-panel">
        <div className="featured-lineup-heading">
          <div><span className="eyebrow">{requestedDate}</span><h2>{assignment.industry.label}</h2><p>Automatic schedules the first {MAX_FEATURED_SHOWROOMS} eligible pages in name order. Manual lets you choose and reorder up to {MAX_FEATURED_SHOWROOMS} for this date.</p></div>
          <span className="badge active">{effectiveIds.length} scheduled</span>
        </div>
        <form action={saveFeaturedProgramDayAction}>
          <input type="hidden" name="dateIso" value={requestedDate}/>
          <div className="featured-mode-picker" role="radiogroup" aria-labelledby="featured-mode-title">
            <strong className="featured-mode-title" id="featured-mode-title">Scheduling mode</strong>
            <label><input type="radio" name="mode" value="automatic" defaultChecked={effectiveMode === "automatic"}/><span><strong>Automatic</strong><small>Always use the current eligible set.</small></span></label>
            <label><input type="radio" name="mode" value="manual" defaultChecked={effectiveMode === "manual"}/><span><strong>Manual</strong><small>Use the checked businesses in the numbered order.</small></span></label>
          </div>
          {eligible.length ? <FeaturedLineupSelector
            limit={MAX_FEATURED_SHOWROOMS}
            businesses={eligible.map((business, index) => ({
              ...business,
              selected: effectiveOrder.has(business.id),
              position: effectiveOrder.get(business.id) || Math.min(index + 1, MAX_FEATURED_SHOWROOMS),
            }))}
          /> : <div className="empty-state">No eligible page has approved discovery details, an image, and a published offering for this industry.</div>}
          <div className="featured-lineup-actions"><p>Eligibility is checked again when you save and whenever the public schedule is read.</p><button className="btn" type="submit" disabled={!eligible.length}>Save lineup</button></div>
        </form>
      </section>

      <section className="panel featured-agenda-preview">
        <div className="featured-lineup-heading"><div><span className="eyebrow">Generated preview</span><h2>Broadcast agenda</h2><p>Smaller lineups contract toward midday and late evening. Times expand toward full capacity as participation grows.</p></div></div>
        <ol tabIndex={0} aria-label="Generated Daily Featured broadcast agenda">
          {agenda.map((entry, index) => <li className={`agenda-${entry.kind}`} key={`${entry.kind}-${entry.start}-${index}`}>
            <time>{entry.kind === "booth" ? entry.label : entry.timeLabel}</time>
            <span>{entry.kind === "booth" ? `Booth ${String(entry.slot).padStart(2, "0")}` : entry.kind === "sponsor_break" ? sponsorForSlot(entry.sponsorSlot)?.name || entry.label : entry.label}</span>
            <small>{entry.session === "morning" ? "Morning" : entry.session === "afternoon" ? "Afternoon" : "Intermission"}</small>
          </li>)}
        </ol>
      </section>
    </DashboardShell>
  );
}
