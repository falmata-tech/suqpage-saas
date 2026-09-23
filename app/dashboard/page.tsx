
import { useUiText } from "@/lib/i18n/ui";
import { getUiText } from "@/lib/i18n/server";
import Link from 'next/link';
import { getShowroomInsights, type ShowroomInsights } from '@/lib/account-health';
import DashboardShell from '@/components/DashboardShell';
import CollectionToolbar from '@/components/CollectionToolbar';
import PaginationNav from '@/components/PaginationNav';
import { requireUser } from '@/lib/auth';
import { resolveBusiness } from '@/lib/dashboard';
import { hasCapability } from '@/lib/capabilities';
import { listBusinessesPage,listAssignedBusinessesPage,getBusinessActivityCounts } from '@/lib/scalable-queries';
import { getDashboardAttention } from '@/lib/dashboard-attention';
import { readOwnerBusiness } from '@/lib/owner-business-runtime';
import { ownerPagePort } from '@/lib/owner-page-runtime';
import { readOwnerPage } from '@/lib/owner-page-service';
import { OwnerPageError } from '@/lib/owner-page-domain';
import { adminUpdateBusinessAction } from '@/app/actions';
export const dynamic='force-dynamic';
function ShowroomVisitSummary({ insights, businessName }: { insights: ShowroomInsights; businessName: string }) {
  const t = useUiText();
  const metrics = [
    ["Unique visits", insights.totalVisitors, "All recorded page sources"],
    ["From marketplace", insights.directoryVisitors, "Visitors arriving through map or list discovery"],
    ["Direct visits", insights.directVisitors, "Visitors opening the page directly"],
    ["Last 30 days", insights.last30Days, "Deduplicated daily visits"],
  ] as const;
  return <section className="overview-insights" id="showroom-visits" aria-labelledby="showroom-visits-title"><div className="attention-heading"><div><span className="eyebrow">{t("Page performance")}</span><h2 id="showroom-visits-title">{t("Page visits")}</h2></div><p>{t("Visits to {business}", {business: businessName})}</p></div><div className="cards account-insights">{metrics.map(([label, value, detail]) => <article className="metric" key={label}><span>{t(label)}</span><strong>{value}</strong><small>{t(detail)}</small></article>)}</div></section>;
}


export default async function Dashboard({searchParams}:{searchParams:Promise<{business?:string;page?:string;q?:string;saved?:string;error?:string}>}){
  const t = await getUiText();
 const user=await requireUser();const params=await searchParams;const business=await resolveBusiness(user,params.business);
 const admin=hasCapability(user,'platform:admin');const operations=hasCapability(user,'operations:manage');
 if(!business){
  const businesses=user.access_role==='team_member'?await listAssignedBusinessesPage(user.id,params):operations?await listBusinessesPage(params):null;
  return <DashboardShell user={user} business={null}><div className="dashboard-head standard-page-heading"><div><h1>{user.access_role==='team_member'?t("Assigned businesses"):t("Business workspaces")}</h1><p>{t("Open a business to manage its page, products and customer activity.")}</p></div>{admin?<Link className="btn brand" href="/dashboard/clients/new">{t("Add business")}</Link>:null}</div>
   <CollectionToolbar action="/dashboard" search={params.q||''} placeholder={t("Business or handle")}/>
   {businesses?.items.length?<><div className="compact-business-list">{businesses.items.map(b=><Link key={b.id} className="compact-business-row" href={`/dashboard?business=${b.id}`}><span><strong>{b.name}</strong><small>@{b.handle}</small></span><span className={`badge ${b.status}`}>{b.status}</span><b>{t("Open workspace")}</b></Link>)}</div><PaginationNav result={businesses} pathname="/dashboard" params={{q:params.q}}/></>:<div className="empty-state">{t("No businesses match this view.")}</div>}
  </DashboardShell>;
 }
 const activity=await getBusinessActivityCounts(business.id);const attention=await getDashboardAttention(user,business.id);
 let editable=false;try{await readOwnerPage(ownerPagePort,user,business.id);editable=true;}catch(error){if(!(error instanceof OwnerPageError&&error.status===403))throw error;}
 const insights=user.access_role!=="team_member"?await getShowroomInsights(user,business.id):null;
 const setup=user.access_role==='client'?await readOwnerBusiness(user,business.id):null;
 const listingStatus=setup?.existing?.is_excluded?"Map listing hidden — contact support":setup?.existing?.approved_at?"Location saved":"Choose your city or storefront location";
 const suffix=`?business=${business.id}`;
 const pageStatus=business.status==='active'?'Live':business.status==='suspended'?'Suspended':'Private draft';
 return <DashboardShell user={user} business={business}>
 <div className="dashboard-head standard-page-heading"><div><span className="eyebrow">{t("Business workspace")}</span><h1>{business.name}</h1></div>{editable?<Link className="btn brand" href={`/dashboard/page-editor${suffix}`}>{t("Edit page")}</Link>:<Link className="btn" href={`/preview/@${business.handle}`}>{t("Preview page")}</Link>}</div>
 {params.error?<p className="error">{params.error}</p>:null}{params.saved?<p className="notice">{t("Changes saved.")}</p>:null}
 <div className="cards"><article className="metric"><span>{t("Page status")}</span><strong>{pageStatus}</strong><small>{business.status==='suspended'?t("Contact support to restore access."):user.access_role!=='client'?t("The owner publishes page changes."):business.status==='active'?t("Save updates your live page"):t("Set up your page and items, then publish when ready.")}</small></article><Link className="metric" href={`/dashboard/products${suffix}`}><span>{t("Products & services")}</span><strong>{activity.products}</strong></Link>{user.access_role!=='team_member'?<Link className="metric" href={`/dashboard/inquiries${suffix}`}><span>{t("New inquiries")}</span><strong>{attention.customerInquiries||0}</strong></Link>:null}</div>
 {insights?<ShowroomVisitSummary insights={insights} businessName={business.name}/>:null}
 {setup && business.status==='draft'?<section className="panel" aria-label={t("Get your business online")}><h2>{t("Get your business online")}</h2><ol><li><Link href="/dashboard/business">{t("Set up your business and location")}</Link></li><li><Link href="/dashboard/page-editor">{t("Add your cover, About and contacts")}</Link></li><li><Link href="/dashboard/products">{t("Add products or services")}</Link></li><li><Link href="/dashboard/page-editor">{t("Preview and publish your page")}</Link></li></ol></section>:null}
 <section className="client-workspace-actions" aria-label={t("Suqpage page workspace")}>
 {user.access_role==='client'?<Link href="/dashboard/business"><span><strong>{t("Business details")}</strong><small>{listingStatus}</small></span><b>{t("Set up")}</b></Link>:null}
 <Link href={`/dashboard/products${suffix}`}><span><strong>{t("Products & services")}</strong></span><b>{t("Manage")}</b></Link>
 {!setup?<Link href={`/dashboard/catalog${suffix}`}><span><strong>{t("Categories")}</strong></span><b>{t("Manage")}</b></Link>:null}
 {editable?<Link href={`/dashboard/page-editor${suffix}`}><span><strong>{t("Your page")}</strong><small>{t("Cover, About, public contacts and publication.")}</small></span><b>{t("Open")}</b></Link>:<article className="panel"><h2>{t("Page assistance")}</h2><p>{t("The owner can enable team assistance in their page editor.")}</p></article>}
 <Link href="/dashboard/account"><span><strong>{t("Account security")}</strong></span><b>{t("Open")}</b></Link>
 <Link href="/dashboard/support"><span><strong>{t("Support")}</strong></span><b>{t("Open")}</b></Link>
 {admin?<><Link href={`/dashboard/admin/discovery/${business.id}`}><span><strong>{t("Marketplace")}</strong></span><b>{t("Manage")}</b></Link><Link href={`/dashboard/admin/businesses/${business.id}/team`}><span><strong>{t("Staff assistance")}</strong><small>{t("Assign or revoke access to this business.")}</small></span><b>{t("Manage")}</b></Link></>:null}
 </section>
 {admin&&business.status!=='draft'?<section className="panel"><h2>{t("Public page status")}</h2><form action={adminUpdateBusinessAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="returnBusiness" value={business.id}/><select aria-label={t("Public page status")} name="status" defaultValue={business.status}><option value="active">{t("Active")}</option><option value="suspended">{t("Suspended")}</option></select><button className="small-btn">{t("Update status")}</button></form></section>:null}
 </DashboardShell>;
}
