import {redirect} from "next/navigation";
import Link from "next/link";
import {getUiText} from "@/lib/i18n/server";
import {getShowroomInsights} from "@/lib/account-health";
import DashboardShell from "@/components/DashboardShell";
import CollectionToolbar from "@/components/CollectionToolbar";
import PaginationNav from "@/components/PaginationNav";
import facts from "@/components/BusinessRecordFacts.module.css";
import {requireUser} from "@/lib/auth";
import {resolveBusiness} from "@/lib/dashboard";
import {hasCapability,isQueueAgent} from "@/lib/capabilities";
import {listBusinessesPage,listAssignedBusinessesPage,getBusinessActivityCounts,listBusinessClientAccess} from "@/lib/scalable-queries";
import {ownerPagePort} from "@/lib/owner-page-runtime";
import {readOwnerPage} from "@/lib/owner-page-service";
import {OwnerPageError} from "@/lib/owner-page-domain";
import {getDiscoveryProfileAdminView} from "@/lib/discovery-admin";

export const dynamic='force-dynamic';

export default async function Dashboard({searchParams}:{searchParams:Promise<{business?:string;page?:string;q?:string;saved?:string;error?:string}>}) {
  const t=await getUiText(),user=await requireUser();
  if(isQueueAgent(user))redirect(`/dashboard/support?queue=${user.staff_queue_scope}`);
  if(user.access_role==='client'&&user.business_id)redirect('/dashboard/profile');
  const params=await searchParams,business=await resolveBusiness(user,params.business);
  const admin=hasCapability(user,'platform:admin'),operations=hasCapability(user,'operations:manage');
  if(!business) {
    const businesses=user.access_role==='team_member'?await listAssignedBusinessesPage(user.id,params):operations?await listBusinessesPage(params):null;
    return <DashboardShell user={user} business={null}>
      <div className="dashboard-head standard-page-heading"><div><h1>{t(user.access_role==='team_member'?'Assigned businesses':'Business workspaces')}</h1><p>{t('Open a business to manage its page, products and customer activity.')}</p></div>{admin?<Link className="btn brand" href="/dashboard/clients/new">{t('Add business')}</Link>:null}</div>
      <CollectionToolbar action="/dashboard" search={params.q||''} placeholder={t('Business or handle')}/>
      {businesses?.items.length?<><div className="compact-business-list">{businesses.items.map(item=><Link key={item.id} className="compact-business-row" href={`/dashboard?business=${item.id}`}><span><strong>{item.name}</strong><small>@{item.handle}</small></span><span className={`badge ${item.status}`}>{t(item.status)}</span><b>{t('Open workspace')}</b></Link>)}</div><PaginationNav result={businesses} pathname="/dashboard" params={{q:params.q}}/></>:<div className="empty-state">{t('No businesses match this view.')}</div>}
    </DashboardShell>;
  }
  const [activity,insights,profile,owners]=await Promise.all([
    getBusinessActivityCounts(business.id),
    user.access_role!=='team_member'?getShowroomInsights(user,business.id):null,
    admin?getDiscoveryProfileAdminView(business.id):null,
    admin?listBusinessClientAccess(business.id):[],
  ]);
  let editable=false;
  try {await readOwnerPage(ownerPagePort,user,business.id);editable=true;}
  catch(error){if(!(error instanceof OwnerPageError&&error.status===403))throw error;}
  const pageStatus=business.status==='active'?'Live':business.status==='suspended'?'Suspended':'Private draft';
  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head standard-page-heading"><div><h1>{t('Overview')}</h1><p>{t('Business workspace')}</p></div><Link className="btn brand" href={editable?`/dashboard/page-editor?business=${business.id}&view=preview`:`/preview/@${business.handle}`}>{t('Preview page')}</Link></div>
    {params.error?<p className="error">{t(params.error)}</p>:null}{params.saved?<p className="notice">{t('Changes saved.')}</p>:null}
    <div className="cards">
      <article className="metric"><span>{t('Page status')}</span><strong>{t(pageStatus)}</strong><small>{t('The owner publishes page changes.')}</small></article>
      <article className="metric"><span>{t('Products')}</span><strong>{activity.products}</strong>{hasCapability(user,'basic-product:maintain')?<Link className={facts.taskLink} href={`/dashboard/products?business=${business.id}`}>{t('View products')}</Link>:null}</article>
      {insights?<article className="metric" id="showroom-visits"><span>{t('Page visits')}</span><strong>{insights.totalVisitors}</strong><small>{t('Last 30 days')}: {insights.last30Days}</small></article>:null}
    </div>
    {admin?<section className="panel"><h2>{t('Business details')}</h2><dl className={facts.facts}>
      <dt>{t('Business name')}</dt><dd>{business.name}<Link className={facts.taskLink} href={`/dashboard/settings?business=${business.id}`}>{t('Business details')}</Link></dd>
      <dt>{t('Page address')}</dt><dd>@{business.handle}</dd>
      <dt>{t('Location')}</dt><dd>{profile?.city||t('Not set')}<Link className={facts.taskLink} href={`/dashboard/admin/discovery/${business.id}`}>{t('Location & visibility')}</Link></dd>
      <dt>{t('Owner sign-in')}</dt><dd>{owners.map(owner=>owner.name).join(', ')||t('Invitation pending')}<Link className={facts.taskLink} href={`/dashboard/access?business=${business.id}`}>{t('Access')}</Link></dd>
    </dl></section>:null}
    {!editable?<p className="notice">{t('The owner can enable team assistance in their page editor.')}</p>:null}
  </DashboardShell>;
}
