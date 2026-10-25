import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import {requireUser} from '@/lib/auth';
import {hasCapability} from '@/lib/capabilities';
import {getStaffAccount,getStaffBusinessGrant,StaffOperationError} from '@/lib/staff-operations';
import {getUiText} from '@/lib/i18n/server';

export const dynamic='force-dynamic';

export default async function StaffAccountPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string}>}){
  const actor=await requireUser();
  if(!hasCapability(actor,'platform:admin'))redirect('/dashboard');
  const id=Number((await params).id);
  if(!Number.isSafeInteger(id)||id<1)notFound();
  let account,grant;
  try{[account,grant]=await Promise.all([getStaffAccount(actor,id),getStaffBusinessGrant(actor,id)]);}
  catch(error){if(error instanceof StaffOperationError&&error.status===404)notFound();throw error;}
  const t=await getUiText(),query=await searchParams;
  const role=account.access_role==='operations_manager'?'Operations manager':account.queue_scope==='transport'?'Transport agent':account.queue_scope==='support'?'Support agent':'Team member';
  return <DashboardShell user={actor} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t('Breadcrumb')}><Link href="/dashboard/admin/staff">{t('Staff')}</Link><span aria-hidden="true">/</span><strong aria-current="page">{account.name}</strong></nav>
    <div className="dashboard-head"><div><h1>{account.name}</h1><p>{account.email}</p></div><Link className="small-btn" href="/dashboard/admin/staff">{t('Back to staff')}</Link></div>
    {query.saved==='businesses'?<p className="notice" role="status">{t('Business management access updated.')}</p>:null}
    <section className="panel"><div className="dashboard-section-head"><div><h2>{t('Manage businesses')}</h2><p>{t('This staff member can manage every business page.')}</p></div></div>
      <div className="inline-actions" style={{alignItems:'center',marginTop:12}}>
        <span className={`badge ${grant.enabled?'active':'draft'}`}>{t(grant.enabled?'Business management is on':'Business management is off')}</span>
        <Link className="small-btn" href={`/dashboard/admin/staff/${id}/manage-businesses`}>{t('Edit business access')}</Link>
      </div>
    </section>
    <section className="panel"><div className="dashboard-section-head"><div><h2>{t('Workload & availability')}</h2><p>{t(role)}</p></div><Link className="small-btn" href={`/dashboard/support/agents?q=${encodeURIComponent(account.email)}&edit=${id}&back_origin=staff`}>{t('Manage')}</Link></div></section>
  </DashboardShell>;
}
