import Link from 'next/link';
import {redirect} from 'next/navigation';
import {ArrowLeft,ArrowRight,Eye,Image,Link2,PenLine,Store,Video,Palette,ContactRound} from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import {requireUser} from '@/lib/auth';
import {runtimeBusinessById} from '@/lib/catalog-runtime';
import {ownerHome} from '@/lib/mobile/owner';
import {getUiText} from '@/lib/i18n/server';
import {storefrontAccentVariables} from '@/lib/storefront-accent';
import styles from '../profile.module.css';

export const dynamic='force-dynamic';
export default async function ShowroomManagementPage({searchParams}:{searchParams:Promise<{saved?:string}>}){
 const actor=await requireUser();
 if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');
 const [home,business,t,query]=await Promise.all([ownerHome({...actor,business_id:actor.business_id}),runtimeBusinessById(actor.business_id),getUiText(),searchParams]);
 return <DashboardShell user={actor} business={business||null}>
  <Link className={styles.back} href="/dashboard/profile"><ArrowLeft aria-hidden="true"/>{t('Back to account')}</Link>
  <div className="dashboard-head"><h1>{t('Your page')}</h1></div>
  {query.saved&&<p className="notice" role="status">{t('Changes saved.')}</p>}
  <section className={styles.identity} style={storefrontAccentVariables(home.shop.accentColor)} aria-label={home.shop.name}>
   <div className={styles.logo}>{home.shop.logo?<img src={home.shop.logo} alt=""/>:<Store aria-hidden="true"/>}</div>
   <div className={styles.brand}><h2>{home.shop.name}</h2><p>@{home.shop.handle}</p><span className={styles.status}>{t(home.shop.status==='active'?'Your page is live':home.shop.status==='suspended'?'Suspended':'Private until you publish')}</span></div>
  </section>
  <section className={styles.management} aria-label={t('Your page')}><Link href="/dashboard/page-editor?view=preview&returnTo=showroom"><Eye aria-hidden="true"/><span><strong>{t('Preview page')}</strong><small>{t('See your page as customers see it.')}</small></span><ArrowRight aria-hidden="true"/></Link></section>
  {[
   {label:'Page content',items:[{href:'/dashboard/page-editor?view=edit&task=about&returnTo=showroom',label:'About the business',icon:PenLine},{href:'/dashboard/profile/cover?returnTo=showroom',label:'Cover photo',icon:Image},{href:'/dashboard/page-editor?view=edit&task=video&returnTo=showroom',label:'Business video',icon:Video}]},
   {label:'Appearance',items:[{href:'/dashboard/page-editor?view=preview&task=color&returnTo=showroom',label:'Page color',icon:Palette}]},
   {label:'Sharing and access',items:[{href:'/dashboard/page-editor?view=edit&task=contacts&returnTo=showroom',label:'Public contact details',icon:ContactRound},{href:'/dashboard/profile/handle?returnTo=showroom',label:'Page address',icon:Link2}]},
  ].map(group=><section key={group.label} className={styles.taskGroup} aria-label={t(group.label)}><h2>{t(group.label)}</h2><div className={styles.management}>{group.items.map(({href,label,icon:Icon})=><Link key={href} href={href}><Icon aria-hidden="true"/><span><strong>{t(label)}</strong></span><ArrowRight aria-hidden="true"/></Link>)}</div></section>)}
 </DashboardShell>;
}
