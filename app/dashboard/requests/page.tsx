import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getBusinessById } from "@/lib/db";
import { listClientRequests, listOperationsRequests } from "@/lib/request-sqlite";

export const dynamic = "force-dynamic";

export default async function OperationsRequestsPage() {
  const user = await requireUser();
  const manager = hasCapability(user, "operations:manage");
  if (!manager && user.access_role !== "client") redirect("/dashboard");
  const requests = manager ? listOperationsRequests() : listClientRequests(user);
  const business = !manager && user.business_id ? getBusinessById(user.business_id) || null : null;
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>{manager ? "Client requests" : "My requests"}</h1><p>{manager ? "Private onboarding and showroom-change work awaiting review." : "Track every request SuqPage is handling for your showroom."}</p></div>{!manager&&<Link className="btn brand" href="/dashboard/requests/new">New request</Link>}</div>
    <section className="panel"><h2>{manager ? "Operations queue" : "Request history"}</h2>{requests.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Reference</th>{manager&&<th>Prospect / business</th>}<th>Type</th><th>Status</th><th>Images</th><th>Received</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><Link href={`/dashboard/requests/${request.id}`}><strong>{request.public_ref}</strong></Link></td>{manager&&<td>{request.business_display_name || request.business_name || request.contact_name}</td>}<td>{request.request_type}</td><td><span className={`badge ${request.status}`}>{request.status.replaceAll("_", " ")}</span></td><td>{request.attachment_count}</td><td>{new Date(request.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty-state">{manager ? "No requests have been submitted." : "No requests yet. Use New request when you want SuqPage to update your showroom."}</div>}</section>
  </DashboardShell>;
}
