import Link from 'next/link';
import {redirect} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {canReviewListings} from '@/lib/listing-reports';
import {listingReportPort} from '@/lib/listing-reports-postgres';
import {getUiText} from '@/lib/i18n/server';
import DashboardShell from '@/components/DashboardShell';
import {reviewReportAction} from './actions';
import SupportThreadRefresh from '@/components/SupportThreadRefresh';
export const dynamic='force-dynamic';
export default async function Reports({searchParams}:{searchParams:Promise<{status?:string;page?:string;error?:string;saved?:string}>}){
  const actor=await requireUser();if(!canReviewListings(actor))redirect('/dashboard');
  const query=await searchParams,t=await getUiText(),manager=['platform_admin','operations_manager'].includes(actor.access_role);
  const [reports,agents]=await Promise.all([listingReportPort.list(actor,query),listingReportPort.assignees(actor)]);
  const href=(page:number)=>'/dashboard/reports?'+new URLSearchParams({status:query.status??'active',page:String(page)});
  return <DashboardShell user={actor} business={null}><SupportThreadRefresh active/><div className="dashboard-head"><h1>{t('Listing reports')}</h1></div>
    <nav className="toolbar" aria-label={t('Request status')}>{['active','resolved','dismissed'].map(v=><Link key={v} className="small-btn" aria-current={(query.status??'active')===v?'page':undefined} href={'/dashboard/reports?status='+v}>{t(v==='active'?'Active':v==='resolved'?'Resolved':'Dismissed')}</Link>)}</nav>
    {query.error&&<p role="alert" className="error">{t(query.error)}</p>}{query.saved&&<p role="status" className="notice">{t('Report updated.')}</p>}
    {!reports.items.length&&<div className="empty-state">{t('No reports in this view.')}</div>}
    {reports.items.map(r=><section key={r.id} className="panel" style={{marginTop:16,overflowWrap:'anywhere'}}><small>RPT-{r.receipt.slice(0,8).toUpperCase()}</small><h2>{r.productName||r.businessName}</h2><p><Link href={'/@'+r.handle}>{r.businessName}</Link> · {t(r.reason)}</p>{r.details&&<p style={{whiteSpace:'pre-wrap'}}>{r.details}</p>}<p>{r.assignedName?t('Assigned to {value1}',{value1:r.assignedName}):t('Unassigned')} · {t(r.status==='review'?'In review':r.status==='open'?'Open':r.status==='resolved'?'Resolved':'Dismissed')}</p>
      {r.businessId&&actor.access_role==='platform_admin'&&<Link className="small-btn" href={'/dashboard?business='+r.businessId}>{t('Manage business')}</Link>}
      {!['resolved','dismissed'].includes(r.status)&&<form action={reviewReportAction} className="toolbar" style={{marginTop:12,flexWrap:'wrap'}}><input type="hidden" name="id" value={r.id}/><input type="hidden" name="version" value={r.version}/>
        {!r.assignedUserId&&<button className="small-btn" name="action" value="claim">{t('Claim report')}</button>}
        {manager&&<><label htmlFor={'assign-'+r.id}>{t('Assign to')}</label><select name="assignedUserId" id={'assign-'+r.id} defaultValue={r.assignedUserId??''}><option value="">{t('Choose a support agent')}</option>{agents.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select><button className="small-btn" name="action" value="assign">{t('Assign')}</button></>}
        {(manager||r.assignedUserId===actor.id)&&<><button className="small-btn" name="action" value="resolve">{t('Mark resolved')}</button><button className="small-btn" name="action" value="dismiss">{t('Dismiss report')}</button></>}
      </form>}
    </section>)}
    <nav className="toolbar" aria-label={t('Pagination')} style={{marginTop:20}}>{reports.page>1&&<Link className="small-btn" href={href(reports.page-1)}>{t('Previous')}</Link>}<span>{t('Page {value1} of {value2}',{value1:reports.page,value2:reports.totalPages})}</span>{reports.page<reports.totalPages&&<Link className="small-btn" href={href(reports.page+1)}>{t('Next')}</Link>}</nav>
  </DashboardShell>;
}
