import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import InviteProspectForm from "@/components/InviteProspectForm";
import NavigationTrail from "@/components/NavigationTrail";
import { updateServiceRequestStatusAction } from "@/app/request-actions";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getBusinessById } from "@/lib/db";
import { REVIEW_REQUEST_STATUSES } from "@/lib/request-domain";
import { canAccessRequest, getRequestDetail } from "@/lib/request-sqlite";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; created?: string; error?: string }> }) {
  const user = await requireUser();
  const requestId = Number.parseInt((await params).id, 10);
  const query = await searchParams;
  if (!Number.isInteger(requestId)) notFound();
  const request = getRequestDetail(requestId);
  if (!request) notFound();
  if (!canAccessRequest(user, request)) notFound();
  const manager = hasCapability(user, "operations:manage");
  const business = !manager && user.business_id ? getBusinessById(user.business_id) || null : null;
  return <DashboardShell user={user} business={business}>
    <NavigationTrail items={[{label:manager?"Operations":"My requests",href:"/dashboard/requests"},{label:request.public_ref}]} fallback="/dashboard/requests"/>
    <div className="dashboard-head"><div><h1>{request.public_ref}</h1><p>{request.request_type} request received {new Date(request.created_at).toLocaleString()}</p></div><span className={`badge ${request.status}`}>{request.status.replaceAll("_", " ")}</span></div>
    {query.created && <p className="notice">Your request was sent to SuqPage.</p>}{query.saved && <p className="notice">Request status updated.</p>}{query.error && <p className="error">That status change is not available from the request’s current state.</p>}
    <div className="split"><section className="panel"><h2>Client instruction</h2><dl className="request-facts"><dt>Contact name</dt><dd>{request.contact_name}</dd><dt>Contact</dt><dd>{request.contact_value}</dd><dt>Business</dt><dd>{request.business_display_name || request.business_name || "Not provided"}</dd><dt>Submitted by</dt><dd>{request.submitter_kind === "manager" ? "SuqPage for client" : request.submitter_kind}</dd></dl><h3>Original request</h3><p className="request-copy">{request.request_text}</p></section>{manager?<section className="panel"><h2>Review status</h2><form action={updateServiceRequestStatusAction} className="form-grid"><input type="hidden" name="requestId" value={request.id}/><div className="field full"><label htmlFor="request-status">Status</label><select id="request-status" name="status" defaultValue={request.status}>{REVIEW_REQUEST_STATUSES.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</select></div><div className="field full"><button className="btn">Update status</button></div></form><p><small>Client review, approval, and publication become available only after a real versioned preview exists.</small></p></section>:<section className="panel"><h2>What happens next</h2><p>SuqPage reviews your instruction, asks for clarification if needed, and prepares private work for your approval. Nothing is published from this request without your approval.</p></section>}</div>
    {manager && request.request_type === "onboarding" && request.submitter_kind === "public" && !request.represented_client_user_id ? <section className="panel"><h2>{request.business_id ? "Replace client invitation" : "Accept prospect and invite client"}</h2><p>Create a draft tenant and a single-use account invitation. The raw link appears once and expires after 72 hours.</p><InviteProspectForm requestId={request.id} clientName={request.contact_name} businessName={request.business_display_name || request.business_name} email={request.contact_value}/></section> : null}
    {request.submitter_kind !== "public" && <section className="panel"><h2>Private reference images</h2>{request.attachments.length ? <div className="request-image-grid">{request.attachments.map((attachment) => <figure key={attachment.id}><img src={`/api/requests/${request.id}/attachments/${attachment.id}`} alt={attachment.original_name}/><figcaption>{attachment.original_name} · {attachment.width}×{attachment.height}</figcaption></figure>)}</div> : <div className="empty-state">No images were attached.</div>}</section>}
    <section className="panel"><h2>Request history</h2><ol className="request-events">{request.events.map((event) => <li key={event.id}><strong>{event.event_type.replaceAll("_", " ")}</strong><span>{event.detail}</span><time>{new Date(event.created_at).toLocaleString()}</time></li>)}</ol></section>
  </DashboardShell>;
}
