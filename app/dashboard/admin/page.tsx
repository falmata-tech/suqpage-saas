import Link from "next/link";
import { redirect } from "next/navigation";
import {
  adminResetClientPasswordAction,
  adminUpdateBusinessAction,
} from "@/app/actions";
import { createStaffAccountAction } from "@/app/staff-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import {
  getManagedClient,
  getPlatformCounts,
  listBusinessesPage,
  listManagedClientsPage,
  listStaffPage,
} from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

type AdminView = "businesses" | "clients" | "staff";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    view?: string;
    page?: string;
    q?: string;
    status?: string;
    role?: string;
    client?: string;
  }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");

  const query = await searchParams;
  const view: AdminView = ["businesses", "clients", "staff"].includes(query.view || "")
    ? (query.view as AdminView)
    : "businesses";
  const counts = getPlatformCounts();
  const businesses = view === "businesses" ? listBusinessesPage(query) : null;
  const clients = view === "clients" ? listManagedClientsPage(query) : null;
  const staff = view === "staff" ? listStaffPage(query) : null;
  const selectedClientId = Number.parseInt(query.client || "", 10);
  const selectedClient =
    view === "clients" && Number.isInteger(selectedClientId)
      ? getManagedClient(selectedClientId)
      : undefined;

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">Platform operations</span>
          <h1>SaaS administration</h1>
          <p>Find one account or business, then take one clear administrative action.</p>
        </div>
        <Link className="btn brand" href="/dashboard/clients/new">
          Create client workspace
        </Link>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Administrative change saved.</p> : null}

      <div className="cards admin-metrics">
        <Link className="metric" href="/dashboard/admin?view=businesses">
          <span>Businesses</span><strong>{counts.businesses}</strong><small>Publication and account state</small>
        </Link>
        <Link className="metric" href="/dashboard/admin?view=clients">
          <span>Client accounts</span><strong>{counts.clients}</strong><small>Access and password recovery</small>
        </Link>
        <Link className="metric" href="/dashboard/admin?view=staff">
          <span>Staff</span><strong>{counts.staff}</strong><small>{counts.open_requests} open requests</small>
        </Link>
      </div>

      <nav className="workspace-tabs" aria-label="Administration views">
        <Link className={view === "businesses" ? "active" : ""} href="/dashboard/admin?view=businesses">Businesses</Link>
        <Link className={view === "clients" ? "active" : ""} href="/dashboard/admin?view=clients">Clients</Link>
        <Link className={view === "staff" ? "active" : ""} href="/dashboard/admin?view=staff">Staff</Link>
      </nav>

      {view === "businesses" && businesses ? (
        <section className="panel">
          <div className="collection-heading">
            <div><h2>Businesses</h2><p>Search publication state without loading every tenant workspace.</p></div>
          </div>
          <CollectionToolbar action="/dashboard/admin" search={query.q || ""} placeholder="Business, handle, or client email" hidden={{ view }} activeFilters={Boolean(query.q || query.status)}>
            <label><span>Status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option><option>active</option><option>draft</option><option>suspended</option></select></label>
          </CollectionToolbar>
          {businesses.items.length ? (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Business</th><th>Client access</th><th>Requests</th><th>Publication</th><th><span className="sr-only">Workspace</span></th></tr></thead>
                  <tbody>{businesses.items.map((business) => (
                    <tr key={business.id}>
                      <td><strong>{business.name}</strong><br/><small>@{business.handle}</small></td>
                      <td>{business.client_email || "Invitation pending"}</td>
                      <td>{business.request_count}</td>
                      <td>
                        {business.status === "draft" ? (
                          <span className="badge draft">draft</span>
                        ) : (
                          <form action={adminUpdateBusinessAction} className="inline-actions">
                            <input type="hidden" name="businessId" value={business.id}/>
                            <select aria-label={`${business.name} operational status`} name="status" defaultValue={business.status}>
                              <option value="active">active</option>
                              <option value="suspended">suspended</option>
                            </select>
                            <button className="small-btn">Save</button>
                          </form>
                        )}
                      </td>
                      <td><Link className="small-btn" href={`/dashboard?business=${business.id}`}>Open</Link></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <PaginationNav result={businesses} pathname="/dashboard/admin" params={{ view, q: query.q, status: query.status }}/>
            </>
          ) : <div className="empty-state">No businesses match this view.</div>}
        </section>
      ) : null}

      {view === "clients" && clients ? (
        <>
          {selectedClient ? (
            <section className="panel focused-admin-action">
              <div className="dashboard-head">
                <div><span className="eyebrow">Focused account action</span><h2>Reset {selectedClient.name}&apos;s password</h2><p>{selectedClient.business_name} · {selectedClient.email}</p></div>
                <Link className="small-btn" href={`/dashboard/admin?view=clients&q=${encodeURIComponent(query.q || "")}`}>Cancel</Link>
              </div>
              <form action={adminResetClientPasswordAction} className="form-grid">
                <input type="hidden" name="userId" value={selectedClient.id}/>
                <div className="field full"><label htmlFor="admin-temporary-password">New temporary password</label><input id="admin-temporary-password" type="password" name="temporaryPassword" minLength={12} required/></div>
                <div className="field full"><small>This revokes active sessions and requires a password change at next sign-in.</small></div>
                <div className="field full"><button className="btn">Reset client password</button></div>
              </form>
            </section>
          ) : null}
          <section className="panel">
            <div className="dashboard-head"><div><h2>Client access</h2><p>Search accounts, then open password recovery for one client.</p></div><Link className="btn" href="/dashboard/clients/new">New client workspace</Link></div>
            <CollectionToolbar action="/dashboard/admin" search={query.q || ""} placeholder="Client, email, business, or handle" hidden={{ view }}/>
            {clients.items.length ? (
              <>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Client</th><th>Business</th><th>Workspace</th><th><span className="sr-only">Action</span></th></tr></thead>
                    <tbody>{clients.items.map((client) => (
                      <tr key={client.id}>
                        <td><strong>{client.name}</strong><br/><small>{client.email}</small></td>
                        <td>{client.business_name}<br/><small>{client.business_status}</small></td>
                        <td><span className={`badge ${client.request_type === "onboarding" ? "draft" : "active"}`}>{client.request_type}</span></td>
                        <td><Link className="small-btn" href={`/dashboard/admin?view=clients&client=${client.id}&q=${encodeURIComponent(query.q || "")}`}>Reset password</Link></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <PaginationNav result={clients} pathname="/dashboard/admin" params={{ view, q: query.q }}/>
              </>
            ) : <div className="empty-state">No client accounts match this search.</div>}
          </section>
        </>
      ) : null}

      {view === "staff" && staff ? (
        <section className="panel">
          <div className="dashboard-head"><div><h2>Staff access</h2><p>Provision individual accounts and review current workload.</p></div></div>
          <details className="admin-create-disclosure" open={Boolean(query.error)}>
            <summary>Create staff account</summary>
            <form action={createStaffAccountAction} className="form-grid">
              <div className="field"><label htmlFor="staff-name">Name</label><input id="staff-name" name="name" required maxLength={100}/></div>
              <div className="field"><label htmlFor="staff-email">Email</label><input id="staff-email" name="email" type="email" required maxLength={160}/></div>
              <div className="field"><label htmlFor="staff-role">Access role</label><select id="staff-role" name="accessRole"><option value="team_member">Team member</option><option value="operations_manager">Operations manager</option></select></div>
              <div className="field"><label htmlFor="staff-password">Temporary password</label><input id="staff-password" name="temporaryPassword" type="password" minLength={12} required/></div>
              <div className="field full"><button className="btn brand">Create staff account</button></div>
            </form>
          </details>
          <CollectionToolbar action="/dashboard/admin" search={query.q || ""} placeholder="Staff name or email" hidden={{ view }} activeFilters={Boolean(query.q || query.role)}>
            <label><span>Role</span><select name="role" defaultValue={query.role || ""}><option value="">All roles</option><option value="team_member">Team member</option><option value="operations_manager">Operations manager</option></select></label>
          </CollectionToolbar>
          {staff.items.length ? (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Staff member</th><th>Role</th><th>Assignments</th><th>Open requests</th><th>Sign-in</th></tr></thead>
                  <tbody>{staff.items.map((member) => (
                    <tr key={member.id}>
                      <td><strong>{member.name}</strong><br/><small>{member.email}</small></td>
                      <td>{member.access_role.replaceAll("_", " ")}</td>
                      <td>{member.active_assignments}</td>
                      <td>{member.open_requests}</td>
                      <td><span className={`badge ${member.must_change_password ? "draft" : "active"}`}>{member.must_change_password ? "Temporary password" : "Active"}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <PaginationNav result={staff} pathname="/dashboard/admin" params={{ view, q: query.q, role: query.role }}/>
            </>
          ) : <div className="empty-state">No staff accounts match this view.</div>}
        </section>
      ) : null}
    </DashboardShell>
  );
}
