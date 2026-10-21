import { getUiText } from "@/lib/i18n/server";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { runtimeBusinessById } from '@/lib/catalog-runtime';
import { readOwnerBusiness } from '@/lib/owner-business-runtime';
import DashboardShell from '@/components/DashboardShell';
import OwnerBusinessForm from '@/components/OwnerBusinessForm';
import { saveOwnerBusinessAction } from './actions';
import {countryName} from '@/lib/countries';
import {BUSINESS_CATEGORY_OPTIONS} from '@/lib/business-categories';
export const dynamic='force-dynamic';
export default async function OwnerBusinessPage({searchParams}:{searchParams:Promise<{error?:string;saved?:string;returnTo?:string;edit?:string}>}){
  const t = await getUiText();
 const actor=await requireUser();if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');
 const setup=await readOwnerBusiness(actor,actor.business_id),business=await runtimeBusinessById(actor.business_id),query=await searchParams;
 const location=setup.location||setup.proposal;
 if(query.edit==='handle')redirect('/dashboard/profile/handle?returnTo=showroom');
 return <DashboardShell user={actor} business={business||null}><div className="dashboard-head standard-page-heading"><div><h1>{t("Business details")}</h1><p>{t("Your identity and the area buyers can find you in.")}</p></div></div>
 <Link className="btn secondary" href="/dashboard/profile">{t("Back to account")}</Link>
 {query.error?<p className="error" role="alert">{t(query.error)}</p>:null}{query.saved?<p className="notice" role="status">{t("Business details saved.")}</p>:null}
 <p className="notice">{setup.existing?.is_excluded?t("Your map listing is hidden. Contact support for help."):setup.existing?.approved_at?t("Location saved. It appears on the map when your page is live."):t("Choose your city or town to add a map location. No approval is needed.")}</p>
 {query.returnTo==='profile'||query.edit==='details'?<OwnerBusinessForm setup={setup} action={saveOwnerBusinessAction} returnTo={query.returnTo==='profile'?'profile':undefined} cancelHref={query.returnTo==='profile'?'/dashboard/profile':'/dashboard/business'}/>:<>
 <section className="panel"><div className="dashboard-head"><h2>{t('Business details')}</h2><Link className="small-btn" href="/dashboard/business?edit=details">{t('Edit')}</Link></div><dl className="form-grid"><div><dt>{t('Business name')}</dt><dd>{setup.business.name}</dd></div><div><dt>{t('Country')}</dt><dd>{countryName(location?.country_code||setup.existing?.country_code||'')}</dd></div><div><dt>{t('City or town')}</dt><dd>{location?.city||setup.existing?.city||t('Not configured')}</dd></div><div><dt>{t('Category')}</dt><dd>{t(BUSINESS_CATEGORY_OPTIONS.find(category=>category.key===setup.category)?.label||'Not configured')}</dd></div></dl></section>
 </>}
 </DashboardShell>;
}
