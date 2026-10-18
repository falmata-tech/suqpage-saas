import { publicationLocationConfirmed } from "@/lib/publication-readiness-runtime";
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
import { getUiText } from "@/lib/i18n/server";
import {ownerPageTask} from '@/lib/owner-page-tasks';

export const dynamic = "force-dynamic";

export default async function PageEditor({ searchParams }: { searchParams: Promise<{ business?: string; view?: string; task?: string; error?: string; saved?: string; returnTo?: string }> }) {
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
  const owner = isPageOwner(user, business.id);
  const t = await getUiText();
  return <DashboardShell user={user} business={business}>
    {query.returnTo==='profile' && <a className="btn secondary" href="/dashboard/profile">{t("Back to account")}</a>}
    {query.error ? <p className="error" role="alert">{t(query.error)}</p> : null}
    {query.saved === 'handle' ? <p className="notice" role="status">{t('Business details saved.')}</p> : null}
    <OwnerPageEditor key={business.id} returnTo={owner?(query.returnTo==='profile'?'profile':'showroom'):undefined} initialTask={ownerPageTask(query.task)} locationConfirmed={await publicationLocationConfirmed(business.id)} initialPreview={query.task==='color'||query.view === "preview" || (owner && business.status === 'draft' && query.view !== 'edit'&&!query.task)} catalog={catalog} initialDraft={draft} initialPublication={publication} owner={owner} />
  </DashboardShell>;
}
