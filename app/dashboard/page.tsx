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
import { pagePublicationPort } from '@/lib/owner-page-publication-runtime';
import { ownerPagePort } from '@/lib/owner-page-runtime';
import { readOwnerPage } from '@/lib/owner-page-service';
import { OwnerPageError } from '@/lib/owner-page-domain';
import { adminUpdateBusinessAction } from '@/app/actions';
export const dynamic='force-dynamic';
function ShowroomVisitSummary({ insights, businessName }: { insights: ShowroomInsights; businessName: string }) {
  const metrics = [
    ["Unique visits", insights.totalVisitors, "All recorded page sources"],
    ["From marketplace", insights.directoryVisitors, "Visitors arriving through map or list discovery"],
    ["Direct visits", insights.directVisitors, "Visitors opening the page directly"],
    ["Last 30 days", insights.last30Days, "Deduplicated daily visits"],
  ] as const;
  return <section className="overview-insights" id="showroom-visits" aria-labelledby="showroom-visits-title"><div className="attention-heading"><div><span className="eyebrow">Page performance</span><h2 id="showroom-visits-title">Page visits</h2></div><p>Privacy-conscious totals show how people reached {businessName}.</p></div><div className="cards account-insights">{metrics.map(([label, value, detail]) => <article className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</div></section>;
}


export default async function Dashboard({searchParams}:{searchParams:Promise<{business?:string;page?:string;q?:string;saved?:string;error?:string}>}){
 const user=await requireUser();const params=await searchParams;const business=await resolveBusiness(user,params.business);
 const admin=hasCapability(user,'platform:admin');const operations=hasCapability(user,'operations:manage');
 if(!business){
  const businesses=user.access_role==='team_member'?await listAssignedBusinessesPage(user.id,params):operations?await listBusinessesPage(params):null;
  return <DashboardShell user={user} business={null}><div className="dashboard-head standard-page-heading"><div><h1>{user.access_role==='team_member'?'Assigned businesses':'Business workspaces'}</h1><p>Open a business to manage its page, products and customer activity.</p></div>{admin?<Link className="btn brand" href="/dashboard/clients/new">Add business</Link>:null}</div>
   <CollectionToolbar action="/dashboard" search={params.q||''} placeholder="Business or handle"/>
   {businesses?.items.length?<><div className="compact-business-list">{businesses.items.map(b=><Link key={b.id} className="compact-business-row" href={`/dashboard?business=${b.id}`}><span><strong>{b.name}</strong><small>@{b.handle}</small></span><span className={`badge ${b.status}`}>{b.status}</span><b>Open workspace</b></Link>)}</div><PaginationNav result={businesses} pathname="/dashboard" params={{q:params.q}}/></>:<div className="empty-state">No businesses match this view.</div>}
  </DashboardShell>;
 }
 const publication=await pagePublicationPort.latest(business.id);
 const activity=await getBusinessActivityCounts(business.id);const attention=await getDashboardAttention(user,business.id);
 let editable=false;try{await readOwnerPage(ownerPagePort,user,business.id);editable=true;}catch(error){if(!(error instanceof OwnerPageError&&error.status===403))throw error;}
 const insights=user.access_role!=="team_member"?await getShowroomInsights(user,business.id):null;
 const setup=user.access_role==='client'?await readOwnerBusiness(user,business.id):null;
 const listingStatus=setup?.existing?.is_excluded?"Map listing hidden — contact support":setup?.existing?.approved_at?"Location saved":"Choose your city or storefront location";
 const suffix=`?business=${business.id}`;
 const pageStatus=business.status==='active'?'Live':business.status==='suspended'?'Suspended':'Private draft';
 return <DashboardShell user={user} business={business}>
 <div className="dashboard-head standard-page-heading"><div><span className="eyebrow">Business workspace</span><h1>{business.name}</h1></div>{editable?<Link className="btn brand" href={`/dashboard/page-editor${suffix}`}>Edit page</Link>:<Link className="btn" href={`/preview/@${business.handle}`}>Preview page</Link>}</div>
 {params.error?<p className="error">{params.error}</p>:null}{params.saved?<p className="notice">Changes saved.</p>:null}
 <div className="cards"><article className="metric"><span>Page status</span><strong>{pageStatus}</strong><small>{publication?'Save updates your live page':'Set up your page and items, then publish when ready.'}</small></article><Link className="metric" href={`/dashboard/products${suffix}`}><span>Products & services</span><strong>{activity.products}</strong></Link>{user.access_role!=='team_member'?<Link className="metric" href={`/dashboard/inquiries${suffix}`}><span>New inquiries</span><strong>{attention.customerInquiries||0}</strong></Link>:null}</div>
 {insights?<ShowroomVisitSummary insights={insights} businessName={business.name}/>:null}
 {setup && business.status==='draft'?<section className="panel" aria-label="Get your business online"><h2>Get your business online</h2><ol><li><Link href="/dashboard/business">Set up your business and location</Link></li><li><Link href="/dashboard/page-editor">Add your cover, About and contacts</Link></li><li><Link href="/dashboard/products">Add products or services</Link></li><li><Link href="/dashboard/page-editor">Preview and publish your page</Link></li></ol></section>:null}
 <section className="client-workspace-actions" aria-label="Suqpage page workspace">
 {user.access_role==='client'?<Link href="/dashboard/business"><span><strong>Business details</strong><small>{listingStatus}</small></span><b>Set up</b></Link>:null}
 <Link href={`/dashboard/products${suffix}`}><span><strong>Products & services</strong></span><b>Manage</b></Link>
 {!setup?<Link href={`/dashboard/catalog${suffix}`}><span><strong>Categories</strong></span><b>Manage</b></Link>:null}
 {editable?<Link href={`/dashboard/page-editor${suffix}`}><span><strong>Your page</strong><small>Cover, About, public contacts and publication.</small></span><b>Open</b></Link>:<article className="panel"><h2>Page assistance</h2><p>The owner can enable team assistance in their page editor.</p></article>}
 <Link href="/dashboard/account"><span><strong>Account security</strong></span><b>Open</b></Link>
 <Link href="/dashboard/support"><span><strong>Support</strong></span><b>Open</b></Link>
 {admin?<><Link href={`/dashboard/admin/discovery/${business.id}`}><span><strong>Marketplace</strong></span><b>Manage</b></Link><Link href={`/dashboard/admin/businesses/${business.id}/team`}><span><strong>Staff assistance</strong><small>Assign or revoke access to this business.</small></span><b>Manage</b></Link></>:null}
 </section>
 {admin&&business.status!=='draft'?<section className="panel"><h2>Public page status</h2><form action={adminUpdateBusinessAction} className="inline-actions"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="returnBusiness" value={business.id}/><select aria-label="Public page status" name="status" defaultValue={business.status}><option value="active">Active</option><option value="suspended">Suspended</option></select><button className="small-btn">Update status</button></form></section>:null}
 </DashboardShell>;
}
