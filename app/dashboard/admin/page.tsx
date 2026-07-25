import Link from "next/link";
import { redirect } from "next/navigation";
import {
  adminResetClientPasswordAction,
  adminUpdateBusinessAction,
} from "@/app/actions";
import { createStaffAccountAction } from "@/app/staff-actions";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getAllBusinesses } from "@/lib/db";
import { listManagedClients, listStaffAccounts } from "@/lib/staff-operations";

export const dynamic = "force-dynamic";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");

  const query = await searchParams;
  const businesses = getAllBusinesses();
  const clients = listManagedClients();
  const staff = listStaffAccounts();

  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head">
        <div>
          <h1>SaaS administration</h1>
          <p>
            Manage client access, staff accounts, and operational availability.
            Showroom content changes move through approved revisions.
          </p>
        </div>
        <Link className="btn brand" href="/dashboard/clients/new">
          Create client workspace
        </Link>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Administrative change saved.</p> : null}

      <section className="panel">
        <div className="dashboard-head">
          <div>
            <h2>Client access</h2>
            <p>
              Client workspaces may be created before a request is submitted.
              Invitation links are shown once when the workspace is created.
            </p>
          </div>
          <Link className="btn" href="/dashboard/clients/new">
            New client workspace
          </Link>
        </div>
        {clients.length ? (
          <form action={adminResetClientPasswordAction} className="form-grid">
            <div className="field full">
              <label htmlFor="admin-client">Client</label>
              <select id="admin-client" name="userId">
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.email} · {client.business_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="admin-temporary-password">
                New temporary password
              </label>
              <input
                id="admin-temporary-password"
                type="password"
                name="temporaryPassword"
                minLength={12}
                required
              />
            </div>
            <div className="field full">
              <small>
                Resetting a password revokes the client&apos;s active sessions and
                requires a password change at the next sign-in.
              </small>
            </div>
            <div className="field full">
              <button className="btn">Reset client password</button>
            </div>
          </form>
        ) : (
          <div className="empty-state">No client accounts yet.</div>
        )}
      </section>

      <section className="panel">
        <div className="dashboard-head">
          <div>
            <h2>Staff access</h2>
            <p>
              Provision individual operations and assigned-team accounts.
              Shared staff credentials are not supported.
            </p>
          </div>
        </div>
        <div className="split">
          <form action={createStaffAccountAction} className="form-grid">
            <div className="field">
              <label htmlFor="staff-name">Name</label>
              <input id="staff-name" name="name" required maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="staff-email">Email</label>
              <input
                id="staff-email"
                name="email"
                type="email"
                required
                maxLength={160}
              />
            </div>
            <div className="field">
              <label htmlFor="staff-role">Access role</label>
              <select id="staff-role" name="accessRole">
                <option value="team_member">Team member</option>
                <option value="operations_manager">Operations manager</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="staff-password">Temporary password</label>
              <input
                id="staff-password"
                name="temporaryPassword"
                type="password"
                minLength={12}
                required
              />
            </div>
            <div className="field full">
              <small>
                The staff member must change this password at first sign-in.
              </small>
            </div>
            <div className="field full">
              <button className="btn brand">Create staff account</button>
            </div>
          </form>
          <div>
            {staff.length ? (
              <div className="request-card-list">
                {staff.map((member) => (
                  <div className="staff-card" key={member.id}>
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.email}</span>
                    </div>
                    <span className="badge">
                      {member.access_role.replaceAll("_", " ")}
                    </span>
                    <small>
                      {member.must_change_password
                        ? "Temporary password"
                        : "Active sign-in"}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No staff accounts yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Businesses</h2>
        <p>
          Draft showrooms become active only through an approved publication.
          Established showrooms may be suspended or restored without changing
          their content.
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Client</th>
                <th>Publication</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => {
                const client = clients.find(
                  (candidate) => candidate.business_id === business.id,
                );
                return (
                  <tr key={business.id}>
                    <td>
                      <strong>{business.name}</strong>
                      <br />
                      <small>
                        @{business.handle} · {business.design_key}
                      </small>
                    </td>
                    <td>{client?.email ?? "Invitation pending"}</td>
                    <td>
                      {business.status === "draft" ? (
                        <div>
                          <span className="badge draft">draft</span>
                          <br />
                          <small>Requires an approved revision to publish.</small>
                        </div>
                      ) : (
                        <form
                          action={adminUpdateBusinessAction}
                          className="inline-actions"
                        >
                          <input
                            type="hidden"
                            name="businessId"
                            value={business.id}
                          />
                          <select
                            aria-label={`${business.name} operational status`}
                            name="status"
                            defaultValue={business.status}
                          >
                            <option value="active">active</option>
                            <option value="suspended">suspended</option>
                          </select>
                          <button className="small-btn">Save</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
