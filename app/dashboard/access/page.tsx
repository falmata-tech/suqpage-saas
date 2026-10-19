import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import FocusedEditForm from '@/components/FocusedEditForm';
import {getUiText} from '@/lib/i18n/server';
import {requireUser} from '@/lib/auth';
import {authDriver} from '@/lib/config';
import {hasCapability} from '@/lib/capabilities';
import {resolveManagedBusiness} from '@/lib/dashboard';
import {listBusinessClientAccess} from '@/lib/scalable-queries';
import {adminResetClientPasswordAction,adminUpdateBusinessAction} from '@/app/actions';

export const dynamic='force-dynamic';
export default async function BusinessAccessPage({searchParams}:{searchParams:Promise<{business?:string;edit?:string;user?:string;saved?:string;accessError?:string;error?:string}>}){
  const t=await getUiText(),actor=await requireUser();
  if(!hasCapability(actor,'platform:admin'))redirect('/dashboard');
  const query=await searchParams,business=await resolveManagedBusiness(actor,query.business);
  const owners=await listBusinessClientAccess(business.id),managed=authDriver()==='supabase';
  const recovery=!managed&&query.edit==='recovery'?owners.find(owner=>owner.id===Number(query.user)):undefined;
  const status=business.status!=='draft'&&query.edit==='status';
  const readHref=`/dashboard/access?business=${business.id}`;
  return <DashboardShell user={actor} business={business}>
    <div className="dashboard-head standard-page-heading"><h1>{t(recovery?'Account recovery':status?'Public page status':'Access')}</h1></div>
    {query.saved==='password'?<p className="notice" role="status">{t('Temporary owner password saved. Existing sessions were revoked.')}</p>:null}
    {query.saved==='status'?<p className="notice" role="status">{t('Business status saved.')}</p>:null}
    {query.accessError?<p className="error" role="alert">{t(query.accessError)}</p>:null}
    {query.error?<p className="error" role="alert">{t(query.error)}</p>:null}
    {status?<section className="panel"><FocusedEditForm action={adminUpdateBusinessAction} cancelHref={readHref} submitLabel="Update status" className="form-grid"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="returnBusiness" value={business.id}/><input type="hidden" name="returnTo" value="access"/><label className="field full"><span>{t('Public page status')}</span><select name="status" defaultValue={business.status}><option value="active">{t('Active')}</option><option value="suspended">{t('Suspended')}</option></select></label></FocusedEditForm></section>:recovery?<section className="panel"><h2>{recovery.name}</h2><p>{recovery.email}</p><FocusedEditForm action={adminResetClientPasswordAction} cancelHref={readHref} submitLabel="Reset owner password" className="form-grid">
      <input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="userId" value={recovery.id}/><input type="hidden" name="returnTo" value="access"/>
      <div className="field full"><label htmlFor="owner-temporary-password">{t('New temporary password')}</label><input id="owner-temporary-password" type="password" name="temporaryPassword" minLength={12} required/><small>{t('Use at least 12 characters with upper-case, lower-case, and a number. The owner must change it after signing in.')}</small></div>
    </FocusedEditForm></section>:<>
      <section className="panel owner-access"><h2>{t('Owner sign-in')}</h2><p>{t(managed?'Owners sign in with a code sent to their account email.':'Recover access with a temporary password.')}</p>
        {owners.length?owners.map(owner=><div className="owner-access-record" key={owner.id}><div className="record-head"><div><strong>{owner.name}</strong><p>{owner.email}</p></div><span className={`badge ${!managed&&owner.must_change_password?'limited':'active'}`}>{t(!managed&&owner.must_change_password?'password change required':'active')}</span></div>{!managed?<Link className="small-btn" href={`${readHref}&edit=recovery&user=${owner.id}`}>{t('Account recovery')}</Link>:null}</div>):<p className="muted">{t('The owner invitation has not been accepted yet. Sign-in details will appear here after activation.')}</p>}
      </section>
      <section className="panel"><div className="dashboard-section-head"><h2>{t('Public page status')}</h2>{business.status!=='draft'?<Link className="small-btn" href={`${readHref}&edit=status`}>{t('Edit')}</Link>:null}</div><span className={`badge ${business.status}`}>{t(business.status==='active'?'Live':business.status==='suspended'?'Suspended':'Private draft')}</span></section>
    </>}
  </DashboardShell>;
}
