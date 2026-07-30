import Link from "next/link";
import { redirect } from "next/navigation";
import {
  regenerateBazaarAction,
  updateBazaarThemeAction,
} from "@/app/staff-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { listBazaarProfilesPage, listBazaarThemes } from "@/lib/bazaar";
import { hasCapability } from "@/lib/capabilities";
import { getCurrentExpo } from "@/lib/expo";

export const dynamic = "force-dynamic";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function ExpoAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    page?: string;
    q?: string;
    status?: string;
  }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const profiles = listBazaarProfilesPage(query);
  const themes = listBazaarThemes();
  const expo = getCurrentExpo();

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">Daily Expo</span>
          <h1>Expo controls</h1>
          <p>Find one participant, review eligibility, then edit its focused Expo profile.</p>
        </div>
        <div className="inline-actions">
          <Link className="btn secondary" href="/expo" target="_blank">Open public Expo</Link>
          <form action={regenerateBazaarAction}><button className="btn brand">Regenerate current Expo</button></form>
        </div>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Expo controls saved.</p> : null}

      <div className="cards admin-metrics">
        <div className="metric"><span>Live theme</span><strong>{expo.themeName}</strong><small>{expo.status}</small></div>
        <div className="metric"><span>Host cities</span><strong>{expo.map.hubs.length}</strong><small>Current occurrence</small></div>
        <div className="metric"><span>Open booths</span><strong>{expo.booths.length}</strong><small>Across all halls</small></div>
      </div>

      <section className="panel">
        <div className="collection-heading">
          <div><h2>Business Expo profiles</h2><p>Compact eligibility and today&apos;s assignment. Full fields stay on the profile page.</p></div>
        </div>
        <CollectionToolbar action="/dashboard/admin/bazaar" search={query.q || ""} placeholder="Business, handle, city, zone, or region" activeFilters={Boolean(query.q || query.status)}>
          <label><span>Business status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option><option>active</option><option>draft</option><option>suspended</option></select></label>
        </CollectionToolbar>
        {profiles.items.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Business</th><th>Industry</th><th>Location</th><th>Eligibility</th><th>Today</th><th><span className="sr-only">Action</span></th></tr></thead>
                <tbody>{profiles.items.map((profile) => (
                  <tr key={profile.businessId}>
                    <td><strong>{profile.businessName}</strong><br/><small>@{profile.handle} · {profile.status}</small></td>
                    <td>{profile.industryLabel}{profile.featured ? <><br/><span className="badge active">featured</span></> : null}</td>
                    <td>{profile.city || "Missing city"}<br/><small>{profile.zone || profile.region || "Location incomplete"}</small></td>
                    <td><span className={`badge ${profile.excluded ? "cancelled" : profile.eligible ? "active" : "limited"}`}>{profile.excluded ? "excluded" : profile.eligible ? "Expo eligible" : `Missing ${profile.eligibilityIssues.join(", ")}`}</span></td>
                    <td>{profile.booth ? <><strong>{profile.booth.boothReference}</strong><br/><small>{profile.booth.floorRow ? `Floor row ${profile.booth.floorRow}` : "Current occurrence"}</small></> : <span className="muted">Not participating</span>}</td>
                    <td><Link className="small-btn" href={`/dashboard/admin/bazaar/${profile.businessId}`}>Edit profile</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <PaginationNav result={profiles} pathname="/dashboard/admin/bazaar" params={{ q: query.q, status: query.status }}/>
          </>
        ) : <div className="empty-state">No Expo profiles match this view.</div>}
      </section>

      <section className="panel">
        <h2>Weekly Expo themes</h2>
        <p>Seven fixed schedule rows remain visible because this set is intentionally bounded.</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Day</th><th>Theme</th><th>Schedule and Industry</th></tr></thead>
            <tbody>{themes.map((theme) => (
              <tr key={theme.id}>
                <td><strong>{weekdays[theme.weekday]}</strong><br/><small>{theme.slug}</small></td>
                <td>
                  <form action={updateBazaarThemeAction} className="bazaar-theme-form">
                    <input type="hidden" name="themeId" value={theme.id}/>
                    <input type="hidden" name="industryKeys" value={theme.industryKeys.join(", ")}/>
                    <input type="hidden" name="timezone" value={theme.timezone}/>
                    <input type="hidden" name="startsAtTime" value={theme.startsAtTime}/>
                    <div className="field"><label htmlFor={`theme-name-${theme.id}`}>Theme name</label><input id={`theme-name-${theme.id}`} name="name" defaultValue={theme.name.replace(/Market/g, "Expo")} required/></div>
                    <label className="check-field"><input type="checkbox" name="active" defaultChecked={theme.active}/>Active</label>
                    <button className="small-btn">Save theme</button>
                  </form>
                </td>
                <td>
                  <form action={updateBazaarThemeAction} className="bazaar-theme-form">
                    <input type="hidden" name="themeId" value={theme.id}/>
                    <input type="hidden" name="name" value={theme.name.replace(/Market/g, "Expo")}/>
                    {theme.active ? <input type="hidden" name="active" value="on"/> : null}
                    <div className="field"><label htmlFor={`theme-keys-${theme.id}`}>Industry keys</label><input id={`theme-keys-${theme.id}`} name="industryKeys" defaultValue={theme.industryKeys.join(", ")} required/></div>
                    <div className="field"><label htmlFor={`theme-timezone-${theme.id}`}>Timezone</label><input id={`theme-timezone-${theme.id}`} name="timezone" defaultValue={theme.timezone} required/></div>
                    <div className="field"><label htmlFor={`theme-start-${theme.id}`}>Start time</label><input id={`theme-start-${theme.id}`} name="startsAtTime" defaultValue={theme.startsAtTime} pattern="[0-9]{2}:[0-9]{2}" required/></div>
                    <button className="small-btn">Save schedule</button>
                  </form>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
