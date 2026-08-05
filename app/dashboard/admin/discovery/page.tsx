import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { listDiscoveryProfilesPage } from "@/lib/discovery-admin";

export const dynamic = "force-dynamic";

export default async function DiscoveryAdminPage({ searchParams }: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const profiles = await listDiscoveryProfilesPage(query);
  return <DashboardShell user={user} business={null}>
    <div className="dashboard-head"><div><span className="eyebrow">Public marketplace</span><h1>Discovery profiles</h1><p>Manage origin, visibility, paid sponsorship, and Sunday Featured Enterprise selections.</p></div><Link className="btn secondary" href="/discover" target="_blank">Open discovery</Link></div>
    <section className="panel">
      <CollectionToolbar action="/dashboard/admin/discovery" search={query.q || ""} placeholder="Business, handle, city, zone, or region" activeFilters={Boolean(query.q || query.status)}>
        <label><span>Business status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option><option>active</option><option>draft</option><option>suspended</option></select></label>
      </CollectionToolbar>
      {profiles.items.length ? <><div className="table-wrap"><table className="data-table"><thead><tr><th>Business</th><th>Industries</th><th>Origin</th><th>Programs</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{profiles.items.map((profile) => <tr key={profile.businessId}><td><strong>{profile.businessName}</strong><br/><small>@{profile.handle} · {profile.status}</small></td><td>{profile.industryKeys.length ? profile.industryKeys.join(", ") : <span className="muted">Not assigned</span>}</td><td>{profile.city || "Missing city"}<br/><small>{profile.zone || profile.region || "Location incomplete"}</small></td><td><span className={`badge ${profile.excluded ? "cancelled" : profile.approved ? "active" : "limited"}`}>{profile.excluded ? "excluded" : profile.approved ? "discoverable" : "incomplete"}</span>{profile.sponsored ? <><br/><small>Sponsored · position {profile.sponsorPosition}</small></> : null}{profile.sundayIndustryKeys.length ? <><br/><small>Sunday · {profile.sundayIndustryKeys.length} industr{profile.sundayIndustryKeys.length === 1 ? "y" : "ies"}</small></> : null}</td><td><Link className="small-btn" href={`/dashboard/admin/discovery/${profile.businessId}`}>Edit profile</Link></td></tr>)}</tbody></table></div><PaginationNav result={profiles} pathname="/dashboard/admin/discovery" params={{ q: query.q, status: query.status }}/></> : <div className="empty-state">No discovery profiles match this view.</div>}
    </section>
  </DashboardShell>;
}
