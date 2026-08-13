import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import ClientWorkflowNav from "@/components/ClientWorkflowNav";
import InviteProspectForm from "@/components/InviteProspectForm";
import NavigationTrail from "@/components/NavigationTrail";
import { addRequestClarificationAction, updateServiceRequestStatusAction } from "@/app/request-actions";
import { assignRequestAction } from "@/app/staff-actions";
import { createRevisionDraftAction, rollbackRevisionAction } from "@/app/revision-actions";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { presentRequestEvent } from "@/lib/request-presentation";
import { REVIEW_REQUEST_STATUSES } from "@/lib/request-domain";
import { canAccessRequest, runtimeRequestDetail } from "@/lib/request-runtime";
import { listTeamMemberChoices } from "@/lib/scalable-queries";
import { listContentRevisions } from "@/lib/revision-service";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; created?: string; assigned?:string; clarified?:string; published?:string; rolledBack?:string; error?: string; staffQ?: string }> }) {
  const user = await requireUser();
  const requestId = Number.parseInt((await params).id, 10);
  const query = await searchParams;
  if (!Number.isInteger(requestId)) notFound();
  const request = await runtimeRequestDetail(requestId);
  if (!request) notFound();
  if (!canAccessRequest(user, request)) notFound();
  const manager = hasCapability(user, "operations:manage");
  const teamMember = user.access_role === "team_member";
  const client = user.access_role === "client";
  const businessId = request.business_id;
  const business = businessId ? (await runtimeBusinessById(businessId)) || null : null;
  const teamMembers = manager
    ? await listTeamMemberChoices(query.staffQ, request.assigned_user_id)
    : [];
  const revisions = request.business_id ? await listContentRevisions(request.id) : [];
  const draftRevision = revisions.find((revision) => revision.status === "draft");
  const workflowRevision = client
    ? revisions.find((revision) => ["awaiting_review", "approved"].includes(revision.status))
    : draftRevision || revisions[0];
  const clarifications=request.events.filter((event)=>event.event_type==="client_clarification"||event.event_type==="staff_clarification");
  const history=request.events.filter((event)=>event.event_type!=="client_clarification"&&event.event_type!=="staff_clarification");
  const clarificationOpen=!["published","completed","rejected","cancelled"].includes(request.status);
  const canAuthor=(manager||teamMember)&&["submitted","under_review","needs_information","approved_for_work","in_progress"].includes(request.status);
  const projectTitle=request.request_type==="onboarding"?"Showroom setup":"Showroom update";
  const projectsHref=business ? `/dashboard/requests${manager ? `?business=${business.id}` : ""}` : "/dashboard/requests";
  return <DashboardShell user={user} business={business}>
    <NavigationTrail items={[{label:business?"Showroom project":manager?"Operations":"Assigned requests",href:projectsHref},{label:projectTitle}]} fallback={projectsHref}/>
    <ClientWorkflowNav requestId={request.id} revisionId={workflowRevision?.id} active="request" canEdit={!client} canPreview={!client || Boolean(workflowRevision)}/>
    <div className="dashboard-head"><div><span className="eyebrow">{request.public_ref}</span><h1>{projectTitle}</h1><p>Started {new Date(request.created_at).toLocaleString()}</p></div><span className={`badge ${request.status}`}>{request.status.replaceAll("_", " ")}</span></div>
    {query.created && <p className="notice">{query.created === "manager" ? "The showroom project was started for the client." : "Your showroom project was sent to MirtPage."}</p>}{query.saved && <p className="notice">Project status updated.</p>}{query.assigned && <p className="notice">Assignment updated.</p>}{query.clarified && <p className="notice">Clarification message added.</p>}{"published" in query && <p className="notice">The approved revision is now live.</p>}{"rolledBack" in query && <p className="notice">The previous showroom version was restored and published.</p>}{query.error && <p className="error">{query.error==="clarification"?"The clarification message could not be added.":query.error}</p>}
    <div className="split"><section className="panel"><h2>{request.request_type === "change" ? "Requested changes" : "Setup brief"}</h2><dl className="request-facts"><dt>Contact name</dt><dd>{request.contact_name}</dd><dt>Contact</dt><dd>{request.contact_value}</dd><dt>Business</dt><dd>{request.business_display_name || request.business_name || "Not provided"}</dd><dt>Started by</dt><dd>{request.submitter_kind === "manager" ? "MirtPage team" : request.submitter_kind}</dd>{request.assigned_user_name && !client ? <><dt>Assigned to</dt><dd>{request.assigned_user_name}</dd></> : null}</dl><h3>{request.request_type === "change" ? "Requested outcome" : "Original instruction"}</h3><p className="request-copy">{request.request_text}</p></section>{manager || teamMember ? <section className="panel"><h2>Work status</h2><form action={updateServiceRequestStatusAction} className="form-grid"><input type="hidden" name="requestId" value={request.id}/><div className="field full"><label htmlFor="request-status">Status</label><select id="request-status" name="status" defaultValue={request.status}>{REVIEW_REQUEST_STATUSES.map((status) => <option value={status} key={status}>{status.replaceAll("_"," ")}</option>)}</select></div><div className="field full"><button className="btn">Update status</button></div></form><p><small>Prepare changes in a private revision. The published showroom stays unchanged until approval.</small></p></section> : <section className="panel"><h2>What happens next</h2><p>MirtPage reviews your instruction, asks for clarification if needed, and prepares private work for your approval. Nothing becomes public without your approval.</p></section>}</div>
    {manager ? <details className="panel admin-workflow-disclosure" open={Boolean(query.staffQ)}><summary>Team assignment <span>{request.assigned_user_name || "Unassigned"}</span></summary><div className="admin-workflow-disclosure-body"><form className="collection-toolbar" action={`/dashboard/requests/${request.id}`} method="get"><label className="collection-search"><span>Find a team member</span><input name="staffQ" type="search" defaultValue={query.staffQ || ""} maxLength={120} placeholder="Name or email"/></label><button className="small-btn">Search staff</button></form><form action={assignRequestAction} className="form-grid"><input type="hidden" name="requestId" value={request.id}/><div className="field full"><label htmlFor="request-assignee">Assigned team member</label><select id="request-assignee" name="teamMemberId" defaultValue={request.assigned_user_id || ""}><option value="">Unassigned</option>{teamMembers.map((member)=><option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}</select><small>Showing at most 20 matching team members. Search to narrow a larger team.</small></div><div className="field full"><button className="btn">Save assignment</button></div></form></div></details> : null}
    {request.business_id ? (
      <section className="panel">
        <div className="dashboard-head">
          <div><h2>Private revisions</h2><p>Numbered previews stay separate from the live showroom until the client approves them and a manager publishes them.</p></div>
          {canAuthor && draftRevision ? <div className="inline-actions"><Link className="btn brand" href={`/dashboard/requests/${request.id}/revisions/${draftRevision.id}/edit`}>Edit current showroom</Link><Link className="btn secondary" href={`/dashboard/requests/${request.id}/revisions/${draftRevision.id}/studio`}>AI-assisted redesign</Link></div> : null}
        </div>
        {canAuthor && !draftRevision ? request.request_type === "change" ? (
          <div className="showroom-authoring-choices" aria-label="Choose an update tool">
            <form action={createRevisionDraftAction} className="showroom-authoring-choice"><input type="hidden" name="requestId" value={request.id}/><input type="hidden" name="workspace" value="edit"/><div><strong>Edit current showroom</strong><span>Keep the current design and change only the copy, images, offerings, components, colors, or motion that need attention.</span></div><button className="btn brand">Start editing</button></form>
            <form action={createRevisionDraftAction} className="showroom-authoring-choice"><input type="hidden" name="requestId" value={request.id}/><input type="hidden" name="workspace" value="studio"/><div><strong>AI-assisted redesign</strong><span>Use a complete AI recipe when the showroom needs a new structure, visual direction, or broad content rewrite.</span></div><button className="btn secondary">Open AI design</button></form>
          </div>
        ) : (
          <form action={createRevisionDraftAction} className="showroom-setup-action"><input type="hidden" name="requestId" value={request.id}/><input type="hidden" name="workspace" value="studio"/><button className="btn brand">Prepare first showroom design</button></form>
        ) : null}
        {revisions.length ? (
          <div className="request-card-list bounded-record-list" role="region" aria-label="Private revision history" tabIndex={0}>
            {revisions.map((revision) => (
              <div className="staff-card" key={revision.id}>
                <div><strong>Revision {revision.revision_number}</strong><span>Based on live version {revision.base_content_version}{revision.published_content_version ? ` · published as ${revision.published_content_version}` : ""}</span></div>
                <span className={`badge ${revision.status}`}>{revision.status.replaceAll("_", " ")}</span>
                {revision.status === "draft" && (manager || teamMember) ? null : (
                  <div className="inline-actions">
                    {revision.status === "draft" ? <span className="muted">MirtPage is preparing this revision.</span> : <Link className="small-btn" href={`/dashboard/requests/${request.id}/revisions/${revision.id}/preview`}>View preview</Link>}
                    {manager && revision.status === "published" ? <form action={rollbackRevisionAction}><input type="hidden" name="requestId" value={request.id}/><input type="hidden" name="businessId" value={revision.business_id}/><input type="hidden" name="targetVersion" value={revision.base_content_version}/><button className="small-btn danger">Restore version {revision.base_content_version}</button></form> : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <div className="empty-state">No private revision has been prepared yet.</div>}
      </section>
    ) : null}
    {manager && request.request_type === "onboarding" && ["public","manager"].includes(request.submitter_kind) && !request.represented_client_user_id ? <section className="panel"><h2>{request.business_id ? "Replace client invitation" : "Accept prospect and invite client"}</h2><p>Create a private business workspace and a single-use account invitation. The link appears once and expires after 72 hours.</p><InviteProspectForm requestId={request.id} clientName={request.contact_name} businessName={request.business_display_name || request.business_name} email={request.contact_value}/></section> : null}
    {request.submitter_kind !== "public" && request.attachments.length ? <section className="panel"><h2>Showroom images</h2><p>Images uploaded through this design&apos;s labeled checklist.</p><div className="request-image-grid">{request.attachments.map((attachment) => <figure key={attachment.id}><img src={`/api/requests/${request.id}/attachments/${attachment.id}`} alt={attachment.original_name}/><figcaption>{attachment.original_name} · {attachment.width}×{attachment.height}</figcaption></figure>)}</div></section> : null}
    <section className="panel"><h2>Clarifications</h2>{clarifications.length?<ol className="request-events bounded-record-list" aria-label="Clarification messages" tabIndex={0}>{clarifications.map((event)=>{const own=event.actor_user_id===user.id;const label=user.access_role==="client"?(event.actor_access_role==="client"?(own?"You":"Client"):"MirtPage team"):(event.actor_name||"MirtPage team");return <li key={event.id}><strong>{label}</strong><span>{event.detail}</span><time>{new Date(event.created_at).toLocaleString()}</time></li>})}</ol>:<div className="empty-state">No clarification messages yet.</div>}{clarificationOpen?<form action={addRequestClarificationAction} className="form-grid"><input type="hidden" name="requestId" value={request.id}/><div className="field full"><label htmlFor="clarification-message">{user.access_role==="client"?"Reply to MirtPage":"Ask or answer a clarification"}</label><textarea id="clarification-message" name="message" required maxLength={2000} placeholder="Add information without changing the original request."/></div><div className="field full"><button className="btn">Add clarification</button></div></form>:null}</section>
    <details className="panel admin-workflow-disclosure"><summary>Project history <span>{history.length} {history.length === 1 ? "event" : "events"}</span></summary><div className="admin-workflow-disclosure-body"><ol className="request-events bounded-record-list" aria-label="Project history" tabIndex={0}>{history.map((event) => { const presented = presentRequestEvent(event, client); return <li key={event.id}><strong>{presented.label}</strong><span>{presented.detail}</span><time>{new Date(event.created_at).toLocaleString()}</time></li>; })}</ol></div></details>
  </DashboardShell>;
}
