import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getBusinessById } from "@/lib/db";
import { listAssignedRequests, listClientRequests, listOperationsRequests } from "@/lib/request-sqlite";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const user = await requireUser();
  const manager = hasCapability(user,"operations:manage");
  const client = user.access_role === "client";
  const teamMember = user.access_role === "team_member";
  if (!manager && !client && !teamMember) redirect("/dashboard");
  const requests = manager ? listOperationsRequests() : client ? listClientRequests(user) : listAssignedRequests(user.id);
  const business = client && user.business_id ? getBusinessById(user.business_id) || null : null;
  const title = manager ? "Client requests" : client ? "My requests" : "Assigned requests";
  const description = manager ? "Review, record, and assign private onboarding and showroom-change work." : client ? "Track every request SuqPage is handling for your showroom." : "Only work explicitly assigned to you appears here.";
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>{title}</h1><p>{description}</p></div>{manager ? <Link className="btn brand" href="/dashboard/requests/on-behalf">Record on behalf</Link> : client ? <Link className="btn brand" href="/dashboard/requests/new">New request</Link> : null}</div>
    <section className="panel"><h2>{manager ? "Operations queue" : "Request history"}</h2>{requests.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Reference</th>{!client ? <th>Prospect / business</th> : null}<th>Type</th><th>Status</th>{manager ? <th>Assigned to</th> : null}<th>Images</th><th>Received</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><Link href={`/dashboard/requests/${request.id}`}><strong>{request.public_ref}</strong></Link></td>{!client ? <td>{request.business_display_name || request.business_name || request.contact_name}</td> : null}<td>{request.request_type}</td><td><span className={`badge ${request.status}`}>{request.status.replaceAll("_"," ")}</span></td>{manager ? <td>{request.assigned_user_name || "Unassigned"}</td> : null}<td>{request.attachment_count}</td><td>{new Date(request.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty-state">{manager ? "No requests have been submitted." : client ? "No requests yet. Use New request when you want SuqPage to update your showroom." : "No work is assigned to you."}</div>}</section>
  </DashboardShell>;
}
