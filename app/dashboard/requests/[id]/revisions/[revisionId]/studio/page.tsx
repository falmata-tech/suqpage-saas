import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import NavigationTrail from "@/components/NavigationTrail";
import RecipeStudio from "@/components/RecipeStudio";
import { requireUser } from "@/lib/auth";
import { getBusinessById } from "@/lib/db";
import { buildShowroomRecipeBrief } from "@/lib/showroom-recipe-service";
import { ShowroomRecipeError } from "@/lib/showroom-recipe-domain";
import { controlledYouTubeAdmissionEnabled, recipeStudioEnabled } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function RecipeStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; revisionId: string }>;
  searchParams: Promise<{ error?: string; category?: string; path?: string; media?: string }>;
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
          { label: `Revision ${data.workspace.revisionNumber} studio` },
        ]}
        fallback={`/dashboard/requests/${requestId}`}
      />
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">AI-assisted production</p>
          <h1>Showroom recipe studio</h1>
          <p>
            One complete content-and-design recipe for{" "}
            {data.workspace.businessName}. The live showroom remains unchanged.
          </p>
        </div>
        <Link
          className="btn secondary"
          href={`/dashboard/requests/${requestId}/revisions/${revisionId}/edit`}
        >
          Administrative recovery editor
        </Link>
      </div>
      {query.error ? (
        <section className="error recipe-error" role="alert">
          <strong>{query.category?.replaceAll("_", " ")} validation</strong>
          <span>{query.path}: {query.error}</span>
        </section>
      ) : null}
      {query.media ? (
        <p className="notice">
          Private {query.media === "youtube" ? "video" : "image"} verified and
          admitted. Export a fresh brief to include its opaque asset key.
        </p>
      ) : null}
      <RecipeStudio
        requestId={requestId}
        revisionId={revisionId}
        brief={JSON.stringify(data.brief, null, 2)}
        initialRecipe={JSON.stringify(data.brief.completeExample, null, 2)}
        youtubeEnabled={controlledYouTubeAdmissionEnabled()}
      />
    </DashboardShell>
  );
}
