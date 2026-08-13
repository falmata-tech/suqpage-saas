import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { listBusinessesPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function AdminBusinesses({ searchParams }: {
  searchParams: Promise<{ error?:string; saved?:string; page?:string; q?:string; status?:string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const businesses = await listBusinessesPage(query);
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/admin">Platform overview</Link><span>/</span><strong>Businesses</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">Customer operations</span><h1>Businesses</h1><p>Find any business, then manage its showroom, marketplace presence, access, activity, and service record in one workspace.</p></div><Link className="btn brand" href="/dashboard/clients/new">Add business</Link></div>
    {query.error ? <p className="error">{query.error}</p> : null}
    {query.saved ? <p className="notice">Business status saved.</p> : null}
    <CollectionToolbar action="/dashboard/admin/businesses" search={query.q || ""} placeholder="Business, handle, or client email" activeFilters={Boolean(query.q || query.status)}>
      <label><span>Status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option><option>active</option><option>draft</option><option>suspended</option></select></label>
    </CollectionToolbar>
    {businesses.items.length ? <>
      <div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>Business</th><th>Access</th><th>Marketplace</th><th>Requests</th><th>Showroom</th><th><span className="sr-only">Workspace</span></th></tr></thead><tbody>{businesses.items.map((business)=><tr key={business.id}>
        <td data-label="Business"><strong>{business.name}</strong><br/><small>@{business.handle}</small></td>
        <td data-label="Access">{business.client_email ? <><strong>{business.client_name}</strong><br/><small>{business.client_email}{business.client_count > 1 ? ` · ${business.client_count} users` : ""}</small></> : <span className="muted">Invitation pending</span>}</td>
        <td data-label="Marketplace"><span className={`badge ${business.marketplace_excluded ? "cancelled" : business.marketplace_approved_at ? "active" : "limited"}`}>{business.marketplace_excluded ? "hidden" : business.marketplace_approved_at ? "visible" : "setup needed"}</span>{business.marketplace_city || business.marketplace_region ? <><br/><small>{[business.marketplace_city,business.marketplace_region].filter(Boolean).join(", ")}</small></> : null}</td>
        <td data-label="Requests">{business.request_count}</td>
        <td data-label="Showroom"><span className={`badge ${business.status}`}>{business.status}</span></td>
        <td data-label="Workspace"><Link className="small-btn" href={`/dashboard?business=${business.id}`}>Open workspace</Link></td>
      </tr>)}</tbody></table></div>
      <PaginationNav result={businesses} pathname="/dashboard/admin/businesses" params={{q:query.q,status:query.status}}/>
    </> : <div className="empty-state">No businesses match this view.</div>}
  </DashboardShell>;
}
