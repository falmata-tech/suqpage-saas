import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import FocusedEditForm from '@/components/FocusedEditForm';
import {requireUser} from '@/lib/auth';
import {hasCapability} from '@/lib/capabilities';
import {getStaffAccount,getStaffBusinessGrant,StaffOperationError} from '@/lib/staff-operations';
import {getUiText} from '@/lib/i18n/server';
import {updateStaffBusinessGrantAction} from './actions';

export const dynamic='force-dynamic';

export default async function StaffBusinessAccessPage({params}:{params:Promise<{id:string}>}){
  const actor=await requireUser();
  if(!hasCapability(actor,'platform:admin'))redirect('/dashboard');
  const id=Number((await params).id);
  if(!Number.isSafeInteger(id)||id<1)notFound();
  let account,grant;
  try{[account,grant]=await Promise.all([getStaffAccount(actor,id),getStaffBusinessGrant(actor,id)]);}
  catch(error){if(error instanceof StaffOperationError&&error.status===404)notFound();throw error;}
  const t=await getUiText(),returnHref=`/dashboard/admin/staff/${id}`;
  return <DashboardShell user={actor} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t('Breadcrumb')}><Link href="/dashboard/admin/staff">{t('Staff')}</Link><span aria-hidden="true">/</span><Link href={returnHref}>{account.name}</Link><span aria-hidden="true">/</span><strong aria-current="page">{t('Manage businesses')}</strong></nav>
    <div className="dashboard-head"><div><h1>{t('Manage businesses')}</h1><p>{account.name}</p></div></div>
    <FocusedEditForm action={updateStaffBusinessGrantAction} cancelHref={returnHref} submitLabel={grant.enabled?'Stop business management':'Restore business management'}>
      <input type="hidden" name="userId" value={id}/><input type="hidden" name="version" value={grant.version}/><input type="hidden" name="enabled" value={grant.enabled?'0':'1'}/>
      <p className="field full">{t(grant.enabled?'Business management is on':'Business management is off')}</p>
      {grant.enabled?<label className="field full check-field"><input type="checkbox" name="confirmRevoke" value="1" required/><span>{t('This immediately stops {value1} from viewing and editing business pages. Chat assignments stay the same.',{value1:account.name})}</span></label>:<p className="field full muted">{t('This staff member can manage every business page.')}</p>}
    </FocusedEditForm>
  </DashboardShell>;
}
