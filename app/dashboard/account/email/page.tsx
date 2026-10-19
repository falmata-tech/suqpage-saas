import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import OwnerEmailChangeForm from '@/components/OwnerEmailChangeForm';
import { requireUser } from '@/lib/auth';
import { currentSupabaseProviderIdentity } from '@/lib/supabase-auth';
import { ownerEmailChangeEnabled, ownerEmailChangeStatus } from '@/lib/owner-email-runtime';
import { runtimeBusinessById } from '@/lib/catalog-runtime';
import { getUiText } from '@/lib/i18n/server';
import { requestSignInEmailChange, verifySignInEmailCode } from './actions';

export const dynamic = 'force-dynamic';

export default async function OwnerEmailChangePage() {
  if (!ownerEmailChangeEnabled()) redirect('/dashboard/account');
  const actor = await requireUser();
  if (actor.access_role !== 'client' || !actor.business_id) redirect('/dashboard/account');
  const identity = await currentSupabaseProviderIdentity();
  if (!identity || identity.userId !== actor.id || identity.email !== actor.email) redirect('/dashboard/account');
  const t = await getUiText();
  const business = await runtimeBusinessById(actor.business_id);
  let status: Awaited<ReturnType<typeof ownerEmailChangeStatus>> = { state: 'idle' };
  try { status = await ownerEmailChangeStatus(actor, identity); }
  catch { /* The form gives a bounded retry message rather than exposing provider details. */ }
  return <DashboardShell user={actor} business={business || null}>
    <div className="navigation-trail"><Link className="btn secondary" href="/dashboard/account">{t('Account settings')}</Link></div>
    <div className="dashboard-head"><h1>{t('Change sign-in email')}</h1></div>
    <OwnerEmailChangeForm currentEmail={actor.email} initial={status} requestAction={requestSignInEmailChange} verifyAction={verifySignInEmailCode}/>
  </DashboardShell>;
}
