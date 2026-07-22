import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { listOperationsRequests } from "@/lib/request-sqlite";

export const dynamic = "force-dynamic";

export default async function OperationsRequestsPage() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  const requests = listOperationsRequests();
  return <DashboardShell user={user} business={null}>
    <div className="dashboard-head"><div><h1>Client requests</h1><p>Private onboarding and showroom-change work awaiting review.</p></div></div>
    <section className="panel"><h2>Operations queue</h2>{requests.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Reference</th><th>Prospect / business</th><th>Type</th><th>Status</th><th>Images</th><th>Received</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><Link href={`/dashboard/requests/${request.id}`}><strong>{request.public_ref}</strong></Link></td><td>{request.business_display_name || request.business_name || request.contact_name}</td><td>{request.request_type}</td><td><span className={`badge ${request.status}`}>{request.status.replaceAll("_", " ")}</span></td><td>{request.attachment_count}</td><td>{new Date(request.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty-state">No requests have been submitted.</div>}</section>
  </DashboardShell>;
}
