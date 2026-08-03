import Link from "next/link";
import { redirect } from "next/navigation";
import { adminResetClientPasswordAction } from "@/app/actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getManagedClient, listManagedClientsPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function AdminClients({ searchParams }: {
  searchParams: Promise<{ error?:string; saved?:string; page?:string; q?:string; client?:string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const clients = listManagedClientsPage(query);
  const selectedId = Number.parseInt(query.client || "",10);
  const selected = Number.isInteger(selectedId) ? getManagedClient(selectedId) : undefined;
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/admin">Platform overview</Link><span>/</span><strong>Clients</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">Customer access</span><h1>Clients</h1><p>Review private workspaces and handle one account action at a time.</p></div><Link className="btn brand" href="/dashboard/clients/new">Create client workspace</Link></div>
    {query.error ? <p className="error">{query.error}</p> : null}{query.saved ? <p className="notice">Client account updated.</p> : null}
    {selected ? <section className="panel focused-admin-action"><div className="dashboard-head"><div><span className="eyebrow">Password recovery</span><h2>Reset {selected.name}&apos;s password</h2><p>{selected.business_name} · {selected.email}</p></div><Link className="small-btn" href={`/dashboard/admin/clients?q=${encodeURIComponent(query.q || "")}`}>Cancel</Link></div><form action={adminResetClientPasswordAction} className="form-grid"><input type="hidden" name="userId" value={selected.id}/><div className="field full"><label htmlFor="admin-temporary-password">New temporary password</label><input id="admin-temporary-password" type="password" name="temporaryPassword" minLength={12} required/></div><div className="field full"><small>Active sessions are revoked. The client must change this password after signing in.</small></div><div className="field full"><button className="btn">Reset password</button></div></form></section> : null}
    <CollectionToolbar action="/dashboard/admin/clients" search={query.q || ""} placeholder="Client, email, business, or handle"/>
    {clients.items.length ? <><div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>Client</th><th>Business</th><th>Workspace stage</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{clients.items.map((client)=><tr key={client.id}><td data-label="Client"><strong>{client.name}</strong><br/><small>{client.email}</small></td><td data-label="Business">{client.business_name}<br/><small>{client.business_status}</small></td><td data-label="Workspace stage"><span className={`badge ${client.request_type === "onboarding" ? "draft" : "active"}`}>{client.request_type}</span></td><td data-label="Account action"><Link className="small-btn" href={`/dashboard/admin/clients?client=${client.id}&q=${encodeURIComponent(query.q || "")}`}>Reset password</Link></td></tr>)}</tbody></table></div><PaginationNav result={clients} pathname="/dashboard/admin/clients" params={{q:query.q}}/></> : <div className="empty-state">No client accounts match this search.</div>}
  </DashboardShell>;
}
