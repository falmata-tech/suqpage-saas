import {OWNER_ACTIVITY_METRICS} from "@/lib/i18n/owner-activity-copy";
import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import {requireUser} from '@/lib/auth';
import {runtimeBusinessById} from '@/lib/catalog-runtime';
import {ownerHome} from '@/lib/mobile/owner';
import {getUiText} from '@/lib/i18n/server';
import styles from './profile.module.css';
import {Store,Package,Headphones,ArrowRight,Building2,Settings,Truck} from 'lucide-react';
import {storefrontAccentVariables} from '@/lib/storefront-accent';

export const dynamic='force-dynamic';
export default async function ProfilePage({searchParams}:{searchParams:Promise<{saved?:string}>}) {
  const actor=await requireUser();
  if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');
  const [home,business,t,query]=await Promise.all([ownerHome({...actor,business_id:actor.business_id}),runtimeBusinessById(actor.business_id),getUiText(),searchParams]);
  const activity=home.activity;
  return <DashboardShell user={actor} business={business||null}>
    <div className="dashboard-head"><h1>{t('Account')}</h1></div>
    {query.saved && <p className="notice" role="status">{t('Changes saved.')}</p>}
    <section className={styles.identity} style={storefrontAccentVariables(home.shop.accentColor)} aria-label={home.shop.name}>
      <div className={styles.logo}>{home.shop.logo?<img src={home.shop.logo} alt=""/>:<Store aria-hidden="true"/>}</div>
      <div className={styles.brand}><h2>{home.shop.name}</h2><p>@{home.shop.handle}</p><span className={styles.status}>{t(home.shop.status==='active'?'Your page is live':home.shop.status==='suspended'?'Suspended':'Private until you publish')}</span></div>
    </section>
    {activity && <dl className={styles.metrics}>{OWNER_ACTIVITY_METRICS.map(({field,label})=><div key={field}><dt>{t(label)}</dt><dd>{activity[field]}</dd></div>)}</dl>}
    <section className={styles.management} aria-label={t('Manage your business')}>
      {[{href:'/dashboard/profile/showroom',label:'Your page',description:'Preview and edit your page.',icon:Store},{href:'/dashboard/products',label:'Products',description:'Add and update your products.',icon:Package},{href:'/dashboard/transport',label:'Transport chat',description:'Discuss transport options in live chat.',icon:Truck},{href:'/dashboard/business',label:'Business details',description:'Name, category and business location.',icon:Building2},{href:'/dashboard/account',label:'Account settings',description:'Private details and sign-in.',icon:Settings},{href:'/dashboard/support',label:'Support',description:'Chat with the AfricMade support team.',icon:Headphones}].map(({href,label,description,icon:Icon})=><Link href={href} key={href}><Icon aria-hidden="true"/><span><strong>{t(label)}</strong><small>{t(description)}</small></span><ArrowRight aria-hidden="true"/></Link>)}
    </section>
  </DashboardShell>;
}
