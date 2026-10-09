import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import HandleSettingsForm from '@/components/HandleSettingsForm';
import {requireUser} from '@/lib/auth';
import {runtimeBusinessById} from '@/lib/catalog-runtime';
import {readHandleSettings} from '@/lib/business-handle-runtime';
import {saveBusinessHandleAction} from '@/app/dashboard/business/handle-actions';
import {getUiText} from '@/lib/i18n/server';
export const dynamic='force-dynamic';
export default async function HandlePage({searchParams}:{searchParams:Promise<{error?:string}>}){const actor=await requireUser();if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');const [business,settings,t,query]=await Promise.all([runtimeBusinessById(actor.business_id),readHandleSettings(actor,actor.business_id),getUiText(),searchParams]);return <DashboardShell user={actor} business={business||null}><Link className="btn secondary" href="/dashboard/profile">{t('Back to profile')}</Link>{query.error&&<p className="error" role="alert">{t(query.error)}</p>}<HandleSettingsForm settings={settings} businessId={actor.business_id} action={saveBusinessHandleAction} returnTo="profile"/></DashboardShell>;}
