import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import OwnerPageEditor from "@/components/OwnerPageEditor";
import { requireUser } from "@/lib/auth";
import { resolveBusiness } from "@/lib/dashboard";
import { runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";
import { OwnerPageError, isPageOwner } from "@/lib/owner-page-domain";
import { ownerPageEditorEnabled, ownerPagePort } from "@/lib/owner-page-runtime";
import { readOwnerPage } from "@/lib/owner-page-service";
import { pagePublicationPort } from "@/lib/owner-page-publication-runtime";

export const dynamic = "force-dynamic";

export default async function PageEditor({ searchParams }: { searchParams: Promise<{ business?: string; view?: string }> }) {
  if (!ownerPageEditorEnabled()) notFound();
  const user = await requireUser();
  const query = await searchParams;
  const business = await resolveBusiness(user, query.business);
  if (!business) notFound();
  let draft;
  try { draft = await readOwnerPage(ownerPagePort, user, business.id); }
  catch (error) { if (error instanceof OwnerPageError && error.status === 403) notFound(); throw error; }
  const catalog = await runtimeCatalogByBusinessId(business.id, true);
  if (!catalog) notFound();
  const publication = await pagePublicationPort.latest(business.id);
  return <DashboardShell user={user} business={business}>
    <OwnerPageEditor initialPreview={query.view === "preview"} catalog={catalog} initialDraft={draft} initialPublication={publication} owner={isPageOwner(user, business.id)} />
  </DashboardShell>;
}
