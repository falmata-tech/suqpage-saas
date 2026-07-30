import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ShowroomVisitBeacon from "@/components/ShowroomVisitBeacon";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { getBusinessByHandle, getBusinessByHandleAny, getCatalogByHandle } from "@/lib/db";
import { hasPublicEntitlement } from "@/lib/account-health";

export const dynamic="force-dynamic";
function cleanHandle(raw:string){return decodeURIComponent(raw).replace(/^@/,"").replace(/^%40/i,"")}
export async function generateMetadata({params}:{params:Promise<{handle:string}>}):Promise<Metadata>{const business=getBusinessByHandle(cleanHandle((await params).handle));if(!business)return {};const title=business.site_title||business.name,description=business.site_description||business.description,image=business.hero_image_path;return {title,description,icons:business.favicon_path||business.logo_path?{icon:business.favicon_path||business.logo_path}:undefined,openGraph:{title,description,images:image?[image]:[]},twitter:{card:"summary_large_image",title,description,images:image?[image]:[]},robots:{index:true,follow:true}}}
export default async function ShowroomPage({params,searchParams}:{params:Promise<{handle:string}>;searchParams:Promise<{ref?:string;occurrence?:string;hub?:string}>}){const handle=cleanHandle((await params).handle);const existing=getBusinessByHandleAny(handle);if(existing?.status==="active"&&!hasPublicEntitlement(existing.id))redirect("/?showroom=inactive");const catalog=getCatalogByHandle(handle);if(!catalog)notFound();const query=await searchParams;const source=query.ref==="expo"?"expo":query.ref==="directory"?"directory":"direct";return <><ShowroomVisitBeacon handle={catalog.business.handle} source={source} occurrenceId={query.occurrence} hubKey={query.hub}/><ShowroomApp catalog={catalog}/></>}
