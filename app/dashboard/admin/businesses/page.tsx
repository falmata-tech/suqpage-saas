import Link from "next/link";
import { redirect } from "next/navigation";
import { adminUpdateBusinessAction } from "@/app/actions";
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
    <div className="dashboard-head"><div><span className="eyebrow">Platform accounts</span><h1>Businesses</h1><p>Find a showroom, review account state, or open its working context.</p></div><Link className="btn brand" href="/dashboard/clients/new">Create client workspace</Link></div>
    {query.error ? <p className="error">{query.error}</p> : null}
    {query.saved ? <p className="notice">Business status saved.</p> : null}
    <CollectionToolbar action="/dashboard/admin/businesses" search={query.q || ""} placeholder="Business, handle, or client email" activeFilters={Boolean(query.q || query.status)}>
      <label><span>Status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option><option>active</option><option>draft</option><option>suspended</option></select></label>
    </CollectionToolbar>
    {businesses.items.length ? <>
      <div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>Business</th><th>Client access</th><th>Requests</th><th>Publication</th><th><span className="sr-only">Workspace</span></th></tr></thead><tbody>{businesses.items.map((business)=><tr key={business.id}>
        <td data-label="Business"><strong>{business.name}</strong><br/><small>@{business.handle}</small></td>
        <td data-label="Client access">{business.client_email || "Invitation pending"}</td><td data-label="Requests">{business.request_count}</td>
        <td data-label="Publication">{business.status === "draft" ? <span className="badge draft">draft</span> : <form action={adminUpdateBusinessAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><select aria-label={`${business.name} operational status`} name="status" defaultValue={business.status}><option value="active">active</option><option value="suspended">suspended</option></select><button className="small-btn">Save</button></form>}</td>
        <td data-label="Workspace"><Link className="small-btn" href={`/dashboard?business=${business.id}`}>Open workspace</Link></td>
      </tr>)}</tbody></table></div>
      <PaginationNav result={businesses} pathname="/dashboard/admin/businesses" params={{q:query.q,status:query.status}}/>
    </> : <div className="empty-state">No businesses match this view.</div>}
  </DashboardShell>;
}
