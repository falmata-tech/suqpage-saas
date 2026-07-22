import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { updateServiceRequestStatusAction } from "@/app/request-actions";
import { requireUser } from "@/lib/auth";
import { REVIEW_REQUEST_STATUSES } from "@/lib/request-domain";
import { getRequestDetail } from "@/lib/request-sqlite";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  const requestId = Number.parseInt((await params).id, 10);
  const query = await searchParams;
  if (!Number.isInteger(requestId)) notFound();
  const request = getRequestDetail(requestId);
  if (!request) notFound();
  return <DashboardShell user={user} business={null}>
    <div className="dashboard-head"><div><Link href="/dashboard/requests">← Client requests</Link><h1>{request.public_ref}</h1><p>{request.request_type} request received {new Date(request.created_at).toLocaleString()}</p></div><span className={`badge ${request.status}`}>{request.status.replaceAll("_", " ")}</span></div>
    {query.saved && <p className="notice">Request status updated.</p>}{query.error && <p className="error">That status change is not available from the request’s current state.</p>}
    <div className="split"><section className="panel"><h2>Client instruction</h2><dl className="request-facts"><dt>Contact name</dt><dd>{request.contact_name}</dd><dt>Contact</dt><dd>{request.contact_value}</dd><dt>Business</dt><dd>{request.business_display_name || request.business_name || "Not provided"}</dd><dt>Submitted by</dt><dd>{request.submitter_kind === "manager" ? "SuqPage for client" : request.submitter_kind}</dd></dl><h3>Original request</h3><p className="request-copy">{request.request_text}</p></section><section className="panel"><h2>Review status</h2><form action={updateServiceRequestStatusAction} className="form-grid"><input type="hidden" name="requestId" value={request.id}/><div className="field full"><label htmlFor="request-status">Status</label><select id="request-status" name="status" defaultValue={request.status}>{REVIEW_REQUEST_STATUSES.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</select></div><div className="field full"><button className="btn">Update status</button></div></form><p><small>Client review, approval, and publication become available only after a real versioned preview exists.</small></p></section></div>
    {request.submitter_kind !== "public" && <section className="panel"><h2>Private reference images</h2>{request.attachments.length ? <div className="request-image-grid">{request.attachments.map((attachment) => <figure key={attachment.id}><img src={`/api/requests/${request.id}/attachments/${attachment.id}`} alt={attachment.original_name}/><figcaption>{attachment.original_name} · {attachment.width}×{attachment.height}</figcaption></figure>)}</div> : <div className="empty-state">No images were attached.</div>}</section>}
    <section className="panel"><h2>Request history</h2><ol className="request-events">{request.events.map((event) => <li key={event.id}><strong>{event.event_type.replaceAll("_", " ")}</strong><span>{event.detail}</span><time>{new Date(event.created_at).toLocaleString()}</time></li>)}</ol></section>
  </DashboardShell>;
}
