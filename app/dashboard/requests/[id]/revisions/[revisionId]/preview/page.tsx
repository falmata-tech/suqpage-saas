import Link from "next/link";
import { notFound } from "next/navigation";
import { decideRevisionAction, publishRevisionAction, submitRevisionAction } from "@/app/revision-actions";
import DashboardShell from "@/components/DashboardShell";
import ClientWorkflowNav from "@/components/ClientWorkflowNav";
import NavigationTrail from "@/components/NavigationTrail";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { canAccessRequest, runtimeRequestDetail } from "@/lib/request-runtime";
import { snapshotToCatalog, withAuthoritativeBusinessSettings } from "@/lib/revision-domain";
import { requireRevisionSnapshotV4 } from "@/lib/revision-v4-domain";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "@/lib/showroom-bank-release";
import { getContentRevision, listContentRevisions } from "@/lib/revision-service";
import {
  blueprintReadiness,
  mediaPlanFromRecipeMetadata,
} from "@/lib/showroom-blueprint";
import { evaluateCompositionFitness } from "@/lib/showroom-guidance";

export const dynamic = "force-dynamic";

export default async function RevisionPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; revisionId: string }>;
  searchParams: Promise<{
    submitted?: string;
    decided?: string;
    error?: string;
    recipe?: string;
    categories?: string;
    products?: string;
    sections?: string;
  }>;
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
    (user.access_role === "client" && revision.status === "draft")
  ) notFound();
  const business = await runtimeBusinessById(request.business_id);
  if (!business) notFound();
  const latest = (await listContentRevisions(requestId))[0]?.id === revision.id;
  const snapshot = withAuthoritativeBusinessSettings(
    requireRevisionSnapshotV4(revision.snapshot_json, SHOWROOM_COMPONENT_BANK_LATEST),
    business,
  );
  const readiness = blueprintReadiness(
    snapshot,
    mediaPlanFromRecipeMetadata(revision.recipe_metadata_json, snapshot),
  );
  const fitness = evaluateCompositionFitness(snapshot);
  const catalog = snapshotToCatalog(snapshot, business, (ref) =>
    ref.startsWith("request-attachment:")
      ? `/api/requests/${requestId}/attachments/${ref.split(":")[1]}`
      : ref,
  );
  const clientCanDecide = user.access_role === "client" && revision.status === "awaiting_review" && latest;
  const managerCanPublish = hasCapability(user, "operations:manage") && revision.status === "approved" && latest;
  const staffCanSubmit = user.access_role !== "client" && revision.status === "draft" && latest;
  const reviewReady = readiness.reviewReady && fitness.allowed;
  const count = (value?: string) => value?.split(":").map(Number) || [];

  return (
    <DashboardShell user={user} business={business}>
      <NavigationTrail
        items={[
          {
            label: user.access_role === "client" ? "My requests" : user.access_role === "team_member" ? "Assigned requests" : "Operations",
            href: "/dashboard/requests",
          },
          { label: request.public_ref, href: `/dashboard/requests/${requestId}` },
          { label: `Revision ${revision.revision_number} preview` },
        ]}
        fallback={`/dashboard/requests/${requestId}`}
      />
      <ClientWorkflowNav requestId={requestId} revisionId={revisionId} active="preview" canEdit={user.access_role !== "client"} />
      <section className="panel revision-preview-head">
        <div>
          <span className={`badge ${revision.status}`}>{revision.status.replaceAll("_", " ")}</span>
          <h1>Revision {revision.revision_number} private preview</h1>
          <p>Request {request.public_ref} · based on live showroom version {revision.base_content_version}</p>
          {revision.summary ? <p><strong>What changed:</strong> {revision.summary}</p> : null}
        </div>
      </section>
      {query.recipe ? (
        <section className="panel recipe-difference">
          <h2>Imported design changes</h2>
          <div className="metric-grid">
            {[["Categories", count(query.categories)], ["Products", count(query.products)], ["Design sections", count(query.sections)]].map(([label, values]) => (
              <div className="metric" key={String(label)}>
                <strong>{String(label)}</strong>
                <span>{(values as number[])[0]} → {(values as number[])[1]}</span>
              </div>
            ))}
          </div>
          <p>The public showroom is unchanged. Review this private preview before sending it to the client.</p>
        </section>
      ) : null}
      {query.submitted ? <p className="notice">Revision sent for client review.</p> : null}
      {query.decided ? <p className="notice">Your {query.decided} decision was recorded for this revision.</p> : null}
      {query.error ? <p className="error">{query.error}</p> : null}
      {staffCanSubmit ? (
        <form action={submitRevisionAction} className="panel review-submit">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="revisionId" value={revisionId} />
          <div>
            <h2>{reviewReady ? "Ready for the client?" : "Complete the design first"}</h2>
            <p>
              {readiness.requiredComplete}/{readiness.required} required images complete · design quality {fitness.score}/100.
              {fitness.allowed ? "" : " Resolve the remaining design issues in the workspace."}
            </p>
          </div>
          {reviewReady ? (
            <button className="btn brand">Send revision for client review</button>
          ) : (
            <Link className="btn brand" href={`/dashboard/requests/${requestId}/revisions/${revisionId}/studio`}>Open design workspace</Link>
          )}
        </form>
      ) : null}
      {clientCanDecide ? (
        <form action={decideRevisionAction} className="panel form-grid">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="revisionId" value={revisionId} />
          <div className="field full">
            <label htmlFor="decision-comment">Comments <span className="optional">required when rejecting</span></label>
            <textarea id="decision-comment" name="comment" maxLength={1000} placeholder="Tell MirtPage what should change, or add an optional approval note." />
          </div>
          <div className="inline-actions">
            <button className="btn brand" name="decision" value="approve">Approve this revision</button>
            <button className="btn danger" name="decision" value="reject">Request changes</button>
          </div>
        </form>
      ) : null}
      {managerCanPublish ? (
        <form action={publishRevisionAction} className="panel review-submit">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="revisionId" value={revisionId} />
          <div>
            <h2>Client approval recorded</h2>
            <p>MirtPage checks this approved revision against the current live showroom before publication.</p>
          </div>
          <button className="btn brand">Publish approved revision</button>
        </form>
      ) : null}
      {revision.decision_comment ? (
        <section className="panel"><h2>Client decision note</h2><p className="request-copy">{revision.decision_comment}</p></section>
      ) : null}
      <section className="revision-showroom" aria-label={`Revision ${revision.revision_number} showroom preview`}>
        <ShowroomApp catalog={catalog} previewMode embedded privateMediaRequestId={requestId} />
      </section>
    </DashboardShell>
  );
}
