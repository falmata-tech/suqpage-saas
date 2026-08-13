import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import ClientWorkflowNav from "@/components/ClientWorkflowNav";
import NavigationTrail from "@/components/NavigationTrail";
import RevisionEditor from "@/components/RevisionEditor";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { runtimeAll } from "@/lib/runtime-sql";
import { canAccessRequest, runtimeRequestDetail } from "@/lib/request-runtime";
import { requireRevisionSnapshotV4 } from "@/lib/revision-v4-domain";
import { withAuthoritativeBusinessSettings } from "@/lib/revision-domain";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "@/lib/showroom-bank-release";
import { getContentRevision } from "@/lib/revision-service";

export const dynamic = "force-dynamic";

export default async function EditRevisionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; revisionId: string }>;
  searchParams: Promise<{ saved?: string; area?: string; error?: string }>;
}) {
  const user = await requireUser();
  const values = await params;
  const query = await searchParams;
  const requestId = Number(values.id);
  const revisionId = Number(values.revisionId);
  const request = await runtimeRequestDetail(requestId);
  const revision = await getContentRevision(revisionId);
  if (
    !request ||
    !revision ||
    revision.request_id !== requestId ||
    !request.business_id ||
    !canAccessRequest(user, request) ||
    user.access_role === "client"
  ) notFound();
  if (revision.status !== "draft") {
    redirect(`/dashboard/requests/${requestId}/revisions/${revisionId}/preview`);
  }
  const business = await runtimeBusinessById(request.business_id);
  if (!business) notFound();
  const approvedMedia = await runtimeAll<{
      asset_key: string;
      label: string;
      kind: "image" | "youtube";
      request_attachment_id: number | null;
      provider_id: string | null;
    }>("SELECT asset_key,label,kind,request_attachment_id,provider_id FROM recipe_media_assets WHERE request_id=? ORDER BY id",[requestId]);
  const attachmentIds = new Set(request.attachments.map((attachment) => attachment.id));
  const imageOptions = [
    ...request.attachments.map((attachment) => ({
      value: `request-attachment:${attachment.id}`,
      label: `Available image · ${attachment.original_name}`,
      kind: "image" as const,
    })),
    ...approvedMedia
      .filter((asset) =>
        asset.kind === "youtube" ||
        (asset.request_attachment_id && !attachmentIds.has(asset.request_attachment_id)),
      )
      .map((asset) => ({
        value: asset.kind === "image"
          ? `request-attachment:${asset.request_attachment_id}`
          : `youtube:${asset.provider_id}`,
        label: asset.label,
        kind: (asset.kind === "youtube" ? "video" : "image") as "image" | "video",
      })),
  ];

  return (
    <DashboardShell user={user} business={business}>
      <NavigationTrail
        items={[
          { label: user.access_role === "team_member" ? "Assigned requests" : "Operations", href: "/dashboard/requests" },
          { label: request.public_ref, href: `/dashboard/requests/${requestId}` },
          { label: `Revision ${revision.revision_number} editor` },
        ]}
        fallback={`/dashboard/requests/${requestId}`}
      />
      <ClientWorkflowNav requestId={requestId} revisionId={revisionId} active="edit" />
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Private draft</p>
          <h1>Edit current showroom</h1>
          <p>Change only what needs attention, save the private draft, and review the complete result before it reaches the client.</p>
        </div>
      </div>
      {query.saved ? <p className="notice">Private draft saved.</p> : null}
      {query.error ? <p className="error">{query.error}</p> : null}
      <RevisionEditor
        requestId={requestId}
        revisionId={revisionId}
        initial={withAuthoritativeBusinessSettings(
          requireRevisionSnapshotV4(revision.snapshot_json, SHOWROOM_COMPONENT_BANK_LATEST),
          business,
        )}
        summary={revision.summary}
        imageOptions={imageOptions}
        previewBusiness={business}
        initialArea={(["settings", "design", "content", "offerings"] as const).includes(query.area as "settings" | "design" | "content" | "offerings") ? query.area as "settings" | "design" | "content" | "offerings" : "settings"}
      />
    </DashboardShell>
  );
}
