import { notFound } from "next/navigation";
import ShowroomApp from "@/components/showroom/ShowroomApp";
import { requireUser } from "@/lib/auth";
import { canViewBusiness } from "@/lib/capabilities";
import { runtimeBusinessByHandleAny, runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";
import { runtimeGet } from "@/lib/runtime-sql";
export const dynamic="force-dynamic";
export default async function Preview({params}:{params:Promise<{handle:string}>}){const user=await requireUser();const handle=decodeURIComponent((await params).handle).replace(/^@/,"");const business=await runtimeBusinessByHandleAny(handle);if(!business)notFound();const assigned=user.access_role==="team_member"&&Boolean(await runtimeGet("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1",[user.id,business.id]));if(!canViewBusiness(user,business.id,assigned))notFound();const catalog=await runtimeCatalogByBusinessId(business.id,true);if(!catalog)notFound();return <ShowroomApp catalog={catalog} previewMode/>}
