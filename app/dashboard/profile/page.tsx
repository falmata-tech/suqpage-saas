import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import {requireUser} from '@/lib/auth';
import {runtimeBusinessById} from '@/lib/catalog-runtime';
import {ownerHome} from '@/lib/mobile/owner';
import {getUiText} from '@/lib/i18n/server';
import styles from './profile.module.css';
import {logoutAction} from '@/app/actions';

export const dynamic='force-dynamic';
export default async function ProfilePage({searchParams}:{searchParams:Promise<{saved?:string}>}) {
  const actor=await requireUser();
  if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');
  const [home,business,t,query]=await Promise.all([ownerHome({...actor,business_id:actor.business_id}),runtimeBusinessById(actor.business_id),getUiText(),searchParams]);
  const row=(label:string,value:string,href:string)=><Link className={styles.row} href={href} aria-label={t(label)}><span><strong>{t(label)}</strong><small>{value}</small></span><b>{t('Edit')}</b></Link>;
  return <DashboardShell user={actor} business={business||null}>
    <div className="dashboard-head"><h1>{t('Profile')}</h1></div>
    {query.saved && <p className="notice" role="status">{t('Changes saved.')}</p>}
    <section className={styles.identity}>
      <img className={styles.cover} src={home.shop.cover} alt=""/>
      <div className={styles.brand}>{home.shop.logo && <img src={home.shop.logo} alt=""/>}<div><h2>{home.shop.name}</h2><p>@{home.shop.handle}</p></div></div>
      <p>{t(home.shop.status==='active'?'Your page is live':home.shop.status==='suspended'?'Suspended':'Private until you publish')}</p>
      <div className={styles.actions}><Link className="btn secondary" href="/dashboard/page-editor?view=preview&returnTo=profile">{t('Preview page')}</Link><Link className="btn brand" href="/dashboard/page-editor?view=edit&returnTo=profile">{t('Edit page')}</Link></div>
    </section>
    {home.activity && <div className={styles.metrics}>{[["Page visits",home.activity.visitsTotal],["Last 30 days",home.activity.visits30Days],["New inquiries",home.activity.newInquiries],["Products & services",home.activity.products]].map(([label,count])=><article key={label}><span>{t(String(label))}</span><strong>{count}</strong></article>)}</div>}
    <div className={styles.columns}>
      <section className="panel"><h2>{t('Your business')}</h2>
        {row('Edit cover',t('Cover photo'),'/dashboard/profile/cover')}
        {row('Business details',home.shop.name,'/dashboard/business?returnTo=profile')}
        {row('Page address','@'+home.shop.handle,'/dashboard/profile/handle')}
        {row('Public contact details',home.shop.contacts.phone||home.shop.contacts.email||t('Your page'),'/dashboard/page-editor?view=edit&returnTo=profile')}
      </section>
      <section className="panel"><h2>{t('Your account')}</h2><p>{home.user.name}</p><p>{home.user.email}</p><p>{home.user.phone}</p><Link className="btn secondary" href="/dashboard/account?returnTo=profile">{t('Edit account details')}</Link><form action={logoutAction}><button className="btn secondary" type="submit">{t('Sign out')}</button></form></section>
    </div>
    <div className={styles.actions}><Link href="/about">{t("About Suqpage")}</Link><Link href="/privacy">{t("Privacy")}</Link><Link href="/terms">{t("Terms")}</Link></div>
    <div className={styles.actions}><Link className="btn secondary" href="/dashboard/products">{t('Products & services')}</Link><Link className="btn secondary" href="/dashboard/inquiries">{t('Customer inquiries')}</Link><Link className="btn secondary" href="/dashboard/support">{t('Support')}</Link></div>
  </DashboardShell>;
}
