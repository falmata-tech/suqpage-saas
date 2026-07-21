import { notFound } from "next/navigation";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { requireUser } from "@/lib/auth";
import { getBusinessByHandleAny, getCatalogByBusinessId } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function Preview({params}:{params:Promise<{handle:string}>}){const user=await requireUser();const handle=decodeURIComponent((await params).handle).replace(/^@/,"");const business=getBusinessByHandleAny(handle);if(!business||user.role==="owner"&&user.business_id!==business.id)notFound();const catalog=getCatalogByBusinessId(business.id,true);if(!catalog)notFound();return <ShowroomApp catalog={catalog}/>}
