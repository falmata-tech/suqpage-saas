import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { getBusinessByHandle, getCatalogByHandle } from "@/lib/db";

export const dynamic="force-dynamic";
function cleanHandle(raw:string){return decodeURIComponent(raw).replace(/^@/,"").replace(/^%40/i,"")}
export async function generateMetadata({params}:{params:Promise<{handle:string}>}):Promise<Metadata>{const business=getBusinessByHandle(cleanHandle((await params).handle));if(!business)return {};const title=business.site_title||business.name,description=business.site_description||business.description,image=business.hero_image_path;return {title,description,icons:business.favicon_path||business.logo_path?{icon:business.favicon_path||business.logo_path}:undefined,openGraph:{title,description,images:image?[image]:[]},twitter:{card:"summary_large_image",title,description,images:image?[image]:[]},robots:{index:true,follow:true}}}
export default async function ShowroomPage({params}:{params:Promise<{handle:string}>}){const catalog=getCatalogByHandle(cleanHandle((await params).handle));if(!catalog)notFound();return <ShowroomApp catalog={catalog}/>}
