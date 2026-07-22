import { notFound } from "next/navigation";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { requireUser } from "@/lib/auth";
import { canViewBusiness } from "@/lib/capabilities";
import { getBusinessByHandleAny, getCatalogByBusinessId, getDb } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function Preview({params}:{params:Promise<{handle:string}>}){const user=await requireUser();const handle=decodeURIComponent((await params).handle).replace(/^@/,"");const business=getBusinessByHandleAny(handle);if(!business)notFound();const assigned=user.access_role==="team_member"&&Boolean(getDb().prepare("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1").get(user.id,business.id));if(!canViewBusiness(user,business.id,assigned))notFound();const catalog=getCatalogByBusinessId(business.id,true);if(!catalog)notFound();return <ShowroomApp catalog={catalog} previewMode/>}
