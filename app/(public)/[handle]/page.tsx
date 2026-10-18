import { linkedProduct } from "@/lib/product-inquiry";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ShowroomVisitBeacon from "@/components/ShowroomVisitBeacon";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { runtimeBusinessByHandle, runtimeBusinessByHandleAny, runtimeCatalogByHandle } from "@/lib/catalog-runtime";
import { runtimePublishedPage } from "@/lib/owner-page-publication-runtime";
import { initialBusinessProfile, businessProfileDescription, publicBusinessCatalog } from "@/lib/business-profile";

export const dynamic="force-dynamic";
function cleanHandle(raw:string){return decodeURIComponent(raw).replace(/^@/,"").replace(/^%40/i,"")}
export async function generateMetadata({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<{ product?: string }> }): Promise<Metadata> {
  const business = await runtimeBusinessByHandle(cleanHandle((await params).handle));
  if (!business) return {};
  const productParam = (await searchParams).product;
  if (productParam) {
    const catalog = await runtimeCatalogByHandle(business.handle);
    const product = catalog ? linkedProduct(catalog, productParam) : null;
    if (!product) return { title: "Product unavailable", robots: { index: false, follow: true } };
    return { title: `${product.name} · ${business.name}`, description: product.description,
      openGraph: { title: product.name, description: product.description, images: product.image_path ? [product.image_path] : [] } };
  }
  const profile = await runtimePublishedPage(business.id);
  const title = business.name;
  const description = profile ? businessProfileDescription(profile) : business.description || business.hero_subtitle;
  const image = profile ? profile.heroImage : business.hero_image_path;
  return { title, description,
    openGraph: { title, description, images: image ? [image] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    robots: { index: true, follow: true } };
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
  return <><ShowroomVisitBeacon handle={catalog.business.handle} source={source} />
    <ShowroomApp catalog={publicBusinessCatalog(catalog, profile.contacts, process.env.SUQPAGE_DEMO_INQUIRY_PHONE)} businessProfile={profile} withinPublicApp /></>;
}
