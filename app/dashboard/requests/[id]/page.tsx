import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import InviteProspectForm from "@/components/InviteProspectForm";
import NavigationTrail from "@/components/NavigationTrail";
import { updateServiceRequestStatusAction } from "@/app/request-actions";
import { assignRequestAction } from "@/app/staff-actions";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getBusinessById } from "@/lib/db";
import { REVIEW_REQUEST_STATUSES } from "@/lib/request-domain";
import { canAccessRequest, getRequestDetail } from "@/lib/request-sqlite";
import { listTeamMembers } from "@/lib/staff-operations";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; created?: string; assigned?:string; error?: string }> }) {
  const user = await requireUser();
  const requestId = Number.parseInt((await params).id, 10);
  const query = await searchParams;
  if (!Number.isInteger(requestId)) notFound();
  const request = getRequestDetail(requestId);
  if (!request) notFound();
  if (!canAccessRequest(user, request)) notFound();
  const manager = hasCapability(user, "operations:manage");
  const teamMember = user.access_role === "team_member";
  const businessId = !manager ? request.business_id : null;
  const business = !manager && businessId ? getBusinessById(businessId) || null : null;
  const teamMembers = manager ? listTeamMembers() : [];
  return <DashboardShell user={user} business={business}>
    <NavigationTrail items={[{label:manager?"Operations":teamMember?"Assigned requests":"My requests",href:"/dashboard/requests"},{label:request.public_ref}]} fallback="/dashboard/requests"/>
    <div className="dashboard-head"><div><h1>{request.public_ref}</h1><p>{request.request_type} request received {new Date(request.created_at).toLocaleString()}</p></div><span className={`badge ${request.status}`}>{request.status.replaceAll("_", " ")}</span></div>
    {query.created && <p className="notice">{query.created === "manager" ? "The request was recorded on behalf of the client." : "Your request was sent to SuqPage."}</p>}{query.saved && <p className="notice">Request status updated.</p>}{query.assigned && <p className="notice">Assignment updated.</p>}{query.error && <p className="error">That request operation could not be completed.</p>}
    <div className="split"><section className="panel"><h2>Client instruction</h2><dl className="request-facts"><dt>Contact name</dt><dd>{request.contact_name}</dd><dt>Contact</dt><dd>{request.contact_value}</dd><dt>Business</dt><dd>{request.business_display_name || request.business_name || "Not provided"}</dd><dt>Submitted by</dt><dd>{request.submitter_kind === "manager" ? "SuqPage for client" : request.submitter_kind}</dd>{request.assigned_user_name ? <><dt>Assigned to</dt><dd>{request.assigned_user_name}</dd></> : null}</dl><h3>Original request</h3><p className="request-copy">{request.request_text}</p></section>{manager || teamMember ? <section className="panel"><h2>Work status</h2><form action={updateServiceRequestStatusAction} className="form-grid"><input type="hidden" name="requestId" value={request.id}/><div className="field full"><label htmlFor="request-status">Status</label><select id="request-status" name="status" defaultValue={request.status}>{REVIEW_REQUEST_STATUSES.map((status) => <option value={status} key={status}>{status.replaceAll("_"," ")}</option>)}</select></div><div className="field full"><button className="btn">Update status</button></div></form><p><small>Versioned content preparation and client review controls arrive in the next workflow phase. Current live data cannot be edited here.</small></p></section> : <section className="panel"><h2>What happens next</h2><p>SuqPage reviews your instruction, asks for clarification if needed, and prepares private work for your approval. Nothing is published from this request without your approval.</p></section>}</div>
    {manager ? <section className="panel"><h2>Team assignment</h2><form action={assignRequestAction} className="form-grid"><input type="hidden" name="requestId" value={request.id}/><div className="field full"><label htmlFor="request-assignee">Assigned team member</label><select id="request-assignee" name="teamMemberId" defaultValue={request.assigned_user_id || ""}><option value="">Unassigned</option>{teamMembers.map((member)=><option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}</select></div><div className="field full"><button className="btn">Save assignment</button></div></form></section> : null}
    {manager && request.request_type === "onboarding" && ["public","manager"].includes(request.submitter_kind) && !request.represented_client_user_id ? <section className="panel"><h2>{request.business_id ? "Replace client invitation" : "Accept prospect and invite client"}</h2><p>Create a draft tenant and a single-use account invitation. The raw link appears once and expires after 72 hours.</p><InviteProspectForm requestId={request.id} clientName={request.contact_name} businessName={request.business_display_name || request.business_name} email={request.contact_value}/></section> : null}
    {request.submitter_kind !== "public" && <section className="panel"><h2>Private reference images</h2>{request.attachments.length ? <div className="request-image-grid">{request.attachments.map((attachment) => <figure key={attachment.id}><img src={`/api/requests/${request.id}/attachments/${attachment.id}`} alt={attachment.original_name}/><figcaption>{attachment.original_name} · {attachment.width}×{attachment.height}</figcaption></figure>)}</div> : <div className="empty-state">No images were attached.</div>}</section>}
    <section className="panel"><h2>Request history</h2><ol className="request-events">{request.events.map((event) => <li key={event.id}><strong>{event.event_type.replaceAll("_", " ")}</strong><span>{event.detail}</span><time>{new Date(event.created_at).toLocaleString()}</time></li>)}</ol></section>
  </DashboardShell>;
}
