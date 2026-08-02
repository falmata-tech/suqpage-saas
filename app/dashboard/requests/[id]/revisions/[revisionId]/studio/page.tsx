import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import RecipeStudio from "@/components/RecipeStudio";
import BlueprintMediaBoard from "@/components/BlueprintMediaBoard";
import { requireUser } from "@/lib/auth";
import { getBusinessById } from "@/lib/db";
import {
  blueprintReadiness,
  blueprintSlotValue,
  mediaPlanFromRecipeMetadata,
} from "@/lib/showroom-blueprint";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "@/lib/showroom-bank-release";
import { buildShowroomRecipeBrief } from "@/lib/showroom-recipe-service";
import { ShowroomRecipeError } from "@/lib/showroom-recipe-domain";
import { controlledYouTubeAdmissionEnabled, recipeStudioEnabled } from "@/lib/config";
import { getContentRevision } from "@/lib/revision-service";
import { requireRevisionSnapshotV4 } from "@/lib/revision-v4-domain";
import { evaluateCompositionFitness } from "@/lib/showroom-guidance";

export const dynamic = "force-dynamic";

export default async function RecipeStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; revisionId: string }>;
  searchParams: Promise<{ error?: string; category?: string; path?: string; media?: string; slot?: string }>;
}) {
  const user = await requireUser();
  const values = await params;
  const query = await searchParams;
  const requestId = Number(values.id);
  const revisionId = Number(values.revisionId);
  if (!recipeStudioEnabled()) {
    redirect(`/dashboard/requests/${requestId}/revisions/${revisionId}/edit`);
  }
  let data: ReturnType<typeof buildShowroomRecipeBrief>;
  try {
    data = buildShowroomRecipeBrief(user, revisionId);
  } catch (error) {
    if (error instanceof ShowroomRecipeError && error.status === 409) {
      redirect(`/dashboard/requests/${requestId}`);
    }
    notFound();
  }
  if (data.workspace.requestId !== requestId) notFound();
  const business = getBusinessById(data.workspace.businessId) || null;
  const revision = getContentRevision(revisionId);
  if (!revision) notFound();
  const snapshot = requireRevisionSnapshotV4(
    revision.snapshot_json,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  const mediaPlan = mediaPlanFromRecipeMetadata(
    revision.recipe_metadata_json,
    snapshot,
  );
  const readiness = blueprintReadiness(snapshot, mediaPlan);
  const fitness = evaluateCompositionFitness(snapshot);
  const mediaSlots = mediaPlan.map((slot) => {
    const value = blueprintSlotValue(snapshot, slot);
    return {
      ...slot,
      complete: Boolean(value),
      previewUrl: value.startsWith("request-attachment:")
        ? `/api/requests/${requestId}/attachments/${value.split(":")[1]}`
        : value.startsWith("/")
          ? value
          : "",
    };
  });
  return (
    <DashboardShell user={user} business={business}>
      <NavigationTrail
        items={[
          {
            label:
              user.access_role === "team_member"
                ? "Assigned requests"
                : "Operations",
            href: "/dashboard/requests",
          },
          {
            label: data.workspace.requestReference,
            href: `/dashboard/requests/${requestId}`,
          },
          { label: `Revision ${data.workspace.revisionNumber} design` },
        ]}
        fallback={`/dashboard/requests/${requestId}`}
      />
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">AI-assisted design</p>
          <h1>Showroom design workspace</h1>
          <p>
            Prepare one complete content and design plan for{" "}
            {data.workspace.businessName}. The live showroom remains unchanged.
          </p>
        </div>
      </div>
      {query.error ? (
        <section className="error recipe-error" role="alert">
          <strong>{query.category?.replaceAll("_", " ")} validation</strong>
          <span>{query.path}: {query.error}</span>
        </section>
      ) : null}
      {query.media ? (
        <p className="notice">
          Private {query.media === "youtube" ? "video" : "image"} added.
          Export a new brief so the AI can use it in the design.
        </p>
      ) : null}
      {query.slot ? (
        <p className="notice">Image added to {query.slot.replaceAll("_", " ")}.</p>
      ) : null}
      <RecipeStudio
        requestId={requestId}
        revisionId={revisionId}
        brief={JSON.stringify(data.brief, null, 2)}
        briefIntent={data.brief.briefIntent}
        currentRecipe={JSON.stringify(data.brief.currentRecipe, null, 2)}
        initialRecipe={JSON.stringify(data.brief.completeExample, null, 2)}
        youtubeEnabled={controlledYouTubeAdmissionEnabled()}
      />
      <BlueprintMediaBoard
        requestId={requestId}
        revisionId={revisionId}
        slots={mediaSlots}
        readiness={readiness}
      />
      <section className="panel showroom-editing" id="showroom-editing">
        <div className="blueprint-section-head">
          <div>
            <p className="eyebrow">Edit the private draft</p>
            <h2>Choose the part you need to change</h2>
            <p>Every change stays in this revision until the client approves it and MirtPage publishes it.</p>
          </div>
        </div>
        <div className="showroom-editing-grid">
          {[
            ["settings", "Showroom settings", "Business identity, logo, hero, contact, live status, and page details."],
            ["design", "Layout and style", "Components, colors, section surfaces, image treatment, and motion."],
            ["content", "Page content", "Headlines, story, process, calls to action, and section media."],
            ["offerings", "Offerings", "Categories, products, capabilities, prices, images, videos, and details."],
          ].map(([area, label, description]) => (
            <Link className="showroom-editing-link" href={`/dashboard/requests/${requestId}/revisions/${revisionId}/edit?area=${area}`} key={area}>
              <strong>{label}</strong><span>{description}</span><b>Open editor</b>
            </Link>
          ))}
        </div>
      </section>
      <section className="panel blueprint-fitness">
        <div>
          <p className="eyebrow">Design quality check</p>
          <h2>{fitness.score}/100 · {fitness.allowed ? "ready to continue" : "changes required"}</h2>
          <p>
            The design is checked for catalog fit, duplicate navigation,
            excessive visual effects, and appropriate image fallbacks.
          </p>
        </div>
        {fitness.issues.length ? (
          <ul>
            {fitness.issues.map((issue) => (
              <li key={`${issue.code}:${issue.sectionKey || ""}`}>
                <strong>{issue.severity}</strong> · {issue.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="notice">No composition conflicts detected.</p>
        )}
      </section>
      <section className="panel review-submit" id="showroom-preview-action">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>Review the complete showroom</h2>
          <p>Check desktop and mobile presentation before sending this revision to the client.</p>
        </div>
        <Link
          className="btn brand"
          href={`/dashboard/requests/${requestId}/revisions/${revisionId}/preview`}
        >
          Open private preview
        </Link>
      </section>
    </DashboardShell>
  );
}
