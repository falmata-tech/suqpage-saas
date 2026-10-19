import { notFound } from "next/navigation";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { requireUser } from "@/lib/auth";
import { canViewBusiness } from "@/lib/capabilities";
import { runtimeBusinessByHandleAny, runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";
import { currentBusinessAuthority } from '@/lib/staff-business-authority';
import { initialBusinessProfile } from "@/lib/business-profile";
import { runtimePublishedPage } from "@/lib/owner-page-publication-runtime";
export const dynamic="force-dynamic";
export default async function Preview({ params }: { params: Promise<{ handle: string }> }) {
  const user = await requireUser();
  const handle = decodeURIComponent((await params).handle).replace(/^@/, "");
  const business = await runtimeBusinessByHandleAny(handle);
  if (!business) notFound();
  const authority=await currentBusinessAuthority(user,business.id);
  if (!authority || !canViewBusiness(user, business.id, authority==='staff')) notFound();
  const catalog = await runtimeCatalogByBusinessId(business.id, true);
  if (!catalog) notFound();
  // Private drafts are previewed only in their editor.
  const profile = await runtimePublishedPage(business.id) || initialBusinessProfile(catalog);
  return <ShowroomApp catalog={catalog} businessProfile={profile} previewMode />;
}
