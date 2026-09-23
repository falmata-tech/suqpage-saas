import HandleSettingsForm from '@/components/HandleSettingsForm';
import {readHandleSettings} from '@/lib/business-handle-runtime';
import {saveBusinessHandleAction} from './handle-actions';

import { getUiText } from "@/lib/i18n/server";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { runtimeBusinessById } from '@/lib/catalog-runtime';
import { readOwnerBusiness } from '@/lib/owner-business-runtime';
import DashboardShell from '@/components/DashboardShell';
import OwnerBusinessForm from '@/components/OwnerBusinessForm';
import { saveOwnerBusinessAction } from './actions';
export const dynamic='force-dynamic';
export default async function OwnerBusinessPage({searchParams}:{searchParams:Promise<{error?:string;saved?:string}>}){
  const t = await getUiText();
 const actor=await requireUser();if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');
 const setup=await readOwnerBusiness(actor,actor.business_id),business=await runtimeBusinessById(actor.business_id),query=await searchParams;
 return <DashboardShell user={actor} business={business||null}><div className="dashboard-head standard-page-heading"><div><h1>{t("Business details")}</h1><p>{t("Your identity and the area buyers can find you in.")}</p></div><Link href="/dashboard/page-editor" className="btn secondary">{t("Edit page and contacts")}</Link></div>
 {query.error?<p className="error" role="alert">{t(query.error)}</p>:null}{query.saved?<p className="notice" role="status">{t("Business details saved.")}</p>:null}
 <p className="notice">{setup.existing?.is_excluded?t("Your map listing is hidden. Contact support for help."):setup.existing?.approved_at?t("Location saved. It appears on the map when your page is live."):t("Choose your city or town to add a map location. No approval is needed.")}</p>
 <HandleSettingsForm key={setup.business.content_version} settings={await readHandleSettings(actor,actor.business_id!)} businessId={actor.business_id!} action={saveBusinessHandleAction}/><OwnerBusinessForm setup={setup} action={saveOwnerBusinessAction}/></DashboardShell>;
}
