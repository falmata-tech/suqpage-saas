import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import RevisionEditor from "@/components/RevisionEditor";
import { requireUser } from "@/lib/auth";
import { getBusinessById } from "@/lib/db";
import { canAccessRequest, getRequestDetail } from "@/lib/request-sqlite";
import { requireRevisionSnapshotV2 } from "@/lib/revision-domain";
import { getContentRevision } from "@/lib/revision-service";

export const dynamic="force-dynamic";
export default async function EditRevisionPage({params,searchParams}:{params:Promise<{id:string;revisionId:string}>;searchParams:Promise<{saved?:string;error?:string}>}){const user=await requireUser();const values=await params;const query=await searchParams;const requestId=Number(values.id),revisionId=Number(values.revisionId);const request=getRequestDetail(requestId),revision=getContentRevision(revisionId);if(!request||!revision||revision.request_id!==requestId||!request.business_id||!canAccessRequest(user,request)||user.access_role==="client")notFound();if(revision.status!=="draft")redirect(`/dashboard/requests/${requestId}/revisions/${revisionId}/preview`);const business=getBusinessById(request.business_id);if(!business)notFound();const imageOptions=request.attachments.map((attachment)=>({value:`request-attachment:${attachment.id}`,label:`Client reference · ${attachment.original_name}`}));return <DashboardShell user={user} business={business}><NavigationTrail items={[{label:user.access_role==="team_member"?"Assigned requests":"Operations",href:"/dashboard/requests"},{label:request.public_ref,href:`/dashboard/requests/${requestId}`},{label:`Revision ${revision.revision_number}`}]} fallback={`/dashboard/requests/${requestId}`}/><div className="dashboard-head"><div><h1>Prepare revision {revision.revision_number}</h1><p>Private draft based on live content version {revision.base_content_version}. Nothing here changes the live showroom.</p></div></div>{query.saved?<p className="notice">Private draft saved.</p>:null}{query.error?<p className="error">{query.error}</p>:null}<RevisionEditor requestId={requestId} revisionId={revisionId} initial={requireRevisionSnapshotV2(revision.snapshot_json)} summary={revision.summary} imageOptions={imageOptions}/></DashboardShell>}
