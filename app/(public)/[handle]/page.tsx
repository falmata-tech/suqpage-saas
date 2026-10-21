import { linkedProduct } from "@/lib/product-inquiry";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ShowroomVisitBeacon from "@/components/ShowroomVisitBeacon";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { runtimeBusinessByHandle, runtimeBusinessByHandleAny, runtimeCatalogByHandle } from "@/lib/catalog-runtime";
import { runtimePublishedPage } from "@/lib/owner-page-publication-runtime";
import { initialBusinessProfile, publicBusinessCatalog } from "@/lib/business-profile";
import { safeJsonLd, showroomJsonLd, showroomSeoMetadata } from "@/lib/public-seo";
import { publicSeoBusinessEligible } from "@/lib/public-seo-runtime";

export const dynamic="force-dynamic";
function cleanHandle(raw:string){return decodeURIComponent(raw).replace(/^@/,"").replace(/^%40/i,"")}
export async function generateMetadata({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<Record<string,string|string[]|undefined>> }): Promise<Metadata> {
  const business = await runtimeBusinessByHandle(cleanHandle((await params).handle));
  if (!business) return { robots: { index: false, follow: false } };
  const rawProduct = (await searchParams).product;
  const productRequested = rawProduct !== undefined;
  const productParam = typeof rawProduct === "string" ? rawProduct : null;
  let product = null;
  if (productRequested) {
    const catalog = await runtimeCatalogByHandle(business.handle);
    product = catalog ? linkedProduct(catalog, productParam) : null;
  }
  const profile = await runtimePublishedPage(business.id);
  const indexable = await publicSeoBusinessEligible(business.id);
  return showroomSeoMetadata({ business, profile, productRequested, product, indexable });
}
export default async function ShowroomPage({ params, searchParams }: {
  params: Promise<{ handle: string }>; searchParams: Promise<Record<string,string|string[]|undefined>>;
}) {
  const handle = cleanHandle((await params).handle);
  const catalog = await runtimeCatalogByHandle(handle);
  if (!catalog) {
    const existing = await runtimeBusinessByHandleAny(handle);
    if (existing?.status === "suspended") redirect("/?showroom=inactive");
    notFound();
  }
  if(handle!==catalog.business.handle){
    const query=new URLSearchParams();
    for(const [key,value] of Object.entries(await searchParams))for(const entry of Array.isArray(value)?value:value===undefined?[]:[value])query.append(key,entry);
    redirect(`/@${catalog.business.handle}${query.size?`?${query}`:''}`);
  }
  const profile = await runtimePublishedPage(catalog.business.id) || initialBusinessProfile(catalog);
  const query = await searchParams;
  const source = query.ref === "featured" ? "featured" : query.ref === "discovery" ? "directory" : "direct";
  const rawProduct = query.product;
  const productRequested = rawProduct !== undefined;
  const product = productRequested ? linkedProduct(catalog, typeof rawProduct === "string" ? rawProduct : null) : null;
  const indexable = await publicSeoBusinessEligible(catalog.business.id);
  return <><ShowroomVisitBeacon handle={catalog.business.handle} source={source} />
    {indexable && (!productRequested || product) ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(showroomJsonLd({ business: catalog.business, profile, product })) }} /> : null}
    <ShowroomApp catalog={publicBusinessCatalog(catalog, profile.contacts, process.env.SUQPAGE_DEMO_INQUIRY_PHONE)} businessProfile={profile} withinPublicApp /></>;
}
