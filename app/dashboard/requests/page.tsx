import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { runtimeBusinessById, runtimeHasRetainedPublication } from "@/lib/catalog-runtime";
import { resolveBusiness } from "@/lib/dashboard";
import { runtimeListRequestsPage } from "@/lib/request-runtime";
import { REQUEST_STATUSES } from "@/lib/request-domain";
import { listBusinessClientAccess } from "@/lib/scalable-queries";
import type { OperationsRequest } from "@/lib/request-sqlite";

export const dynamic = "force-dynamic";

const projectKind = (request: Pick<OperationsRequest, "request_type">) =>
  request.request_type === "onboarding" ? "Showroom setup" : "Showroom update";

const readableStatus = (status: string) => status.replaceAll("_", " ");

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; business?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const manager = hasCapability(user, "operations:manage");
  const client = user.access_role === "client";
  const teamMember = user.access_role === "team_member";
  if (!manager && !client && !teamMember) redirect("/dashboard");

  const business = client && user.business_id
    ? (await runtimeBusinessById(user.business_id)) || null
    : query.business
      ? await resolveBusiness(user, query.business)
      : null;

  if (business) {
    const [currentPage, history, established, businessOwners] = await Promise.all([
      runtimeListRequestsPage(user, { business: business.id, project: "current", page: 1 }),
      runtimeListRequestsPage(user, { ...query, business: business.id, project: "history" }),
      runtimeHasRetainedPublication(business.id),
      manager ? listBusinessClientAccess(business.id) : Promise.resolve([]),
    ]);
    const current = currentPage.items[0];
    const nextKind = current
      ? current.request_type === "onboarding" ? "setup" : "update"
      : established ? "update" : "setup";
    const startHref = manager
      ? businessOwners[0]
        ? `/dashboard/requests/on-behalf?client=${businessOwners[0].id}`
        : `/dashboard/requests/on-behalf?business=${business.id}`
      : client ? "/dashboard/requests/new" : null;
    const actionLabel = current
      ? `Continue showroom ${current.request_type === "onboarding" ? "setup" : "update"}`
      : established
        ? "Update showroom"
        : "Create showroom";
    const actionHref = current ? `/dashboard/requests/${current.id}` : startHref;

    return <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">{business.name}</span>
          <h1>Showroom project</h1>
          <p>{current ? `Continue the current ${nextKind}, review progress, and prepare its next decision.` : `Start the next ${nextKind} when the business is ready.`}</p>
        </div>
        {actionHref ? <Link className="btn brand" href={actionHref}>{actionLabel}</Link> : null}
      </div>

      <section className="panel showroom-project-current" aria-labelledby="current-showroom-project">
        <div className="collection-heading">
          <div>
            <span className="eyebrow">Current work</span>
            <h2 id="current-showroom-project">{current ? projectKind(current) : `No active showroom ${nextKind}`}</h2>
          </div>
          {current ? <span className={`badge ${current.status}`}>{readableStatus(current.status)}</span> : null}
        </div>
        {current ? <>
          <p>{current.request_text}</p>
          <div className="project-meta">
            <span><b>Started</b>{new Date(current.created_at).toLocaleDateString()}</span>
            <span><b>Last activity</b>{new Date(current.updated_at).toLocaleString()}</span>
            <span><b>Reference</b>{current.public_ref}</span>
          </div>
        </> : <div className="empty-state">
          <h3>{established ? "Ready for the next update" : "Ready to create the first showroom"}</h3>
          <p>{teamMember ? "No showroom project is currently assigned for this business." : established ? "Start one focused update. It stays private until the owner approves the exact revision." : "Start the setup with a clear business brief. MirtPage will prepare a private design for owner review."}</p>
        </div>}
      </section>

      <section className="panel" aria-labelledby="showroom-history">
        <div className="collection-heading"><div><span className="eyebrow">Previous work</span><h2 id="showroom-history">Showroom history</h2><p>Completed, cancelled, and closed projects remain available for reference.</p></div></div>
        {history.items.length || query.q ? <CollectionToolbar
          action="/dashboard/requests"
          search={query.q || ""}
          placeholder="Search showroom history"
          activeFilters={Boolean(query.q)}
          hidden={{ business: business.id }}
        /> : null}
        {history.items.length ? <>
          <div className="table-wrap"><table className="data-table"><thead><tr><th>Project</th><th>Status</th><th>Reference</th><th>Updated</th></tr></thead><tbody>{history.items.map((project) => <tr key={project.id}>
            <td><Link href={`/dashboard/requests/${project.id}`}><strong>{projectKind(project)}</strong></Link></td>
            <td><span className={`badge ${project.status}`}>{readableStatus(project.status)}</span></td>
            <td>{project.public_ref}</td>
            <td>{new Date(project.updated_at).toLocaleString()}</td>
          </tr>)}</tbody></table></div>
          <PaginationNav result={history} pathname="/dashboard/requests" params={{ q: query.q, business: business.id }}/>
        </> : <div className="empty-state">{query.q ? "No showroom history matches this search." : "Completed showroom projects will appear here."}</div>}
      </section>
    </DashboardShell>;
  }

  const requests = await runtimeListRequestsPage(user, query);
  const title = manager ? "Showroom requests" : "Assigned requests";
  const description = manager ? "Review, record, and assign private onboarding and showroom-update work." : "Only work explicitly assigned to you appears here.";
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>{title}</h1><p>{description}</p></div>{manager ? <Link className="btn brand" href="/dashboard/requests/on-behalf">Record a request</Link> : null}</div>
    <section className="panel">
      <div className="collection-heading"><div><h2>Operations queue</h2><p>Search by reference, business, contact, or assignee.</p></div></div>
      {requests.items.length || query.q || query.status ? <CollectionToolbar action="/dashboard/requests" search={query.q || ""} placeholder="Reference, business, or assignee" activeFilters={Boolean(query.q || query.status)}>
        <label><span>Status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option>{[...REQUEST_STATUSES].map((status) => <option key={status} value={status}>{readableStatus(status)}</option>)}</select></label>
      </CollectionToolbar> : null}
      {requests.items.length ? <>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Reference</th><th>Prospect / business</th><th>Type</th><th>Status</th>{manager ? <th>Assigned to</th> : null}<th>Images</th><th>Updated</th></tr></thead><tbody>{requests.items.map((request) => <tr key={request.id}>
          <td><Link href={`/dashboard/requests/${request.id}`}><strong>{request.public_ref}</strong></Link></td>
          <td>{request.business_display_name || request.business_name || request.contact_name}</td>
          <td>{request.request_type}</td><td><span className={`badge ${request.status}`}>{readableStatus(request.status)}</span></td>
          {manager ? <td>{request.assigned_user_name || "Unassigned"}</td> : null}<td>{request.attachment_count}</td><td>{new Date(request.updated_at).toLocaleString()}</td>
        </tr>)}</tbody></table></div>
        <PaginationNav result={requests} pathname="/dashboard/requests" params={{ q: query.q, status: query.status }}/>
      </> : <div className="empty-state">{manager ? "No requests match this view." : "No assigned work matches this view."}</div>}
    </section>
  </DashboardShell>;
}
