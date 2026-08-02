import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getBusinessById } from "@/lib/db";
import { listRequestsPage } from "@/lib/request-sqlite";
import { REQUEST_STATUSES } from "@/lib/request-domain";

export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const manager = hasCapability(user,"operations:manage");
  const client = user.access_role === "client";
  const teamMember = user.access_role === "team_member";
  if (!manager && !client && !teamMember) redirect("/dashboard");
  const requests = listRequestsPage(user, query);
  const business = client && user.business_id ? getBusinessById(user.business_id) || null : null;
  const title = manager ? "Client requests" : client ? "My requests" : "Assigned requests";
  const description = manager ? "Review, record, and assign private onboarding and showroom-change work." : client ? "Track every request MirtPage is handling for your showroom." : "Only work explicitly assigned to you appears here.";
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>{title}</h1><p>{description}</p></div>{manager ? <Link className="btn brand" href="/dashboard/requests/on-behalf">Create client request</Link> : client ? <Link className="btn brand" href="/dashboard/requests/new">New request</Link> : null}</div>
    <section className="panel">
      <div className="collection-heading">
        <div>
          <h2>{manager ? "Operations queue" : "Request history"}</h2>
          <p>Search by reference, business, contact, or assignee.</p>
        </div>
      </div>
      <CollectionToolbar
        action="/dashboard/requests"
        search={query.q || ""}
        placeholder="Reference, business, or assignee"
        activeFilters={Boolean(query.q || query.status)}
      >
        <label>
          <span>Status</span>
          <select name="status" defaultValue={query.status || ""}>
            <option value="">All statuses</option>
            {[...REQUEST_STATUSES].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </CollectionToolbar>
      {requests.items.length ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Reference</th>{!client ? <th>Prospect / business</th> : null}<th>Type</th><th>Status</th>{manager ? <th>Assigned to</th> : null}<th>Images</th><th>Updated</th></tr></thead>
              <tbody>{requests.items.map((request) => (
                <tr key={request.id}>
                  <td><Link href={`/dashboard/requests/${request.id}`}><strong>{request.public_ref}</strong></Link></td>
                  {!client ? <td>{request.business_display_name || request.business_name || request.contact_name}</td> : null}
                  <td>{request.request_type}</td>
                  <td><span className={`badge ${request.status}`}>{request.status.replaceAll("_"," ")}</span></td>
                  {manager ? <td>{request.assigned_user_name || "Unassigned"}</td> : null}
                  <td>{request.attachment_count}</td>
                  <td>{new Date(request.updated_at).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <PaginationNav
            result={requests}
            pathname="/dashboard/requests"
            params={{ q: query.q, status: query.status }}
          />
        </>
      ) : (
        <div className="empty-state">{manager ? "No requests match this view." : client ? "No requests yet. Use New request when you want MirtPage to update your showroom." : "No assigned work matches this view."}</div>
      )}
    </section>
  </DashboardShell>;
}
