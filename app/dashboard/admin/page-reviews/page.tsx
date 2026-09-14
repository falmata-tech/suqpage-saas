import Link from 'next/link';
import { notFound } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import CollectionToolbar from '@/components/CollectionToolbar';
import PaginationNav from '@/components/PaginationNav';
import { requireUser } from '@/lib/auth';
import { listPageReviews } from '@/lib/page-review-runtime';
export const dynamic='force-dynamic';
export default async function PageReviews({searchParams}:{searchParams:Promise<{page?:string;q?:string;status?:string}>}){
 const user=await requireUser();if(user.access_role!=='platform_admin')notFound();const query=await searchParams;const results=await listPageReviews(query);
 return <DashboardShell user={user} business={null}><div className="dashboard-head standard-page-heading"><div><h1>Page reviews</h1><p>Review each owner's saved page and products before its first publication.</p></div></div>
 <CollectionToolbar action="/dashboard/admin/page-reviews" search={query.q||''} placeholder="Business or handle"><label><span>Review status</span><select name="status" defaultValue={query.status||'pending'}><option value="pending">Pending review</option><option value="changes_requested">Changes requested</option><option value="approved">Approved</option></select></label></CollectionToolbar>
 {results.items.length?<div className="compact-business-list">{results.items.map(r=><Link className="compact-business-row" key={r.businessId} href={`/dashboard/admin/page-reviews/${r.businessId}`}><span><strong>{r.name}</strong><small>@{r.handle}</small></span><span className="badge">{r.status.replaceAll('_',' ')}</span><b>Review page</b></Link>)}</div>:<div className="empty-state">No pages match this review queue.</div>}
 <PaginationNav result={results} pathname="/dashboard/admin/page-reviews" params={{q:query.q,status:query.status}}/></DashboardShell>;
}
