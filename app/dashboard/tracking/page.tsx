import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import styles from '@/components/ShipmentStaff.module.css';
import {requireUser} from '@/lib/auth';
import {getUiText} from '@/lib/i18n/server';
import {listStaffTrackingShipments} from '@/lib/tracking';
import {TrackingError} from '@/lib/tracking-contract';
import {canUseStaffTracking,trackingStaffHref,trackingStaffView,trackingDeliveryKey} from './navigation';

export const dynamic='force-dynamic';

export default async function StaffTrackingPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const actor=await requireUser();if(!canUseStaffTracking(actor))redirect('/dashboard');
 const t=await getUiText(),view=trackingStaffView(await searchParams);
 const result=await listStaffTrackingShipments(actor,view).catch(error=>{if(error instanceof TrackingError&&error.code==='forbidden')redirect('/dashboard');throw error;});
 return <DashboardShell user={actor} business={null}>
  <header className={styles.heading}><div><h1>{t('Tracking')}</h1><p>{t('Create and manage shipment plans.')}</p></div><Link className="btn brand" href={'/dashboard/tracking/new'+(Object.keys(view).length?'?'+new URLSearchParams(view):'')}>{t('New shipment')}</Link></header>
  <form className={styles.search} method="get"><label>{t('Search shipments')}<input name="q" maxLength={120} defaultValue={view.q||''}/></label><button className="btn secondary">{t('Search')}</button>{view.q?<Link className="btn secondary" href="/dashboard/tracking">{t('Clear search')}</Link>:null}</form>
  <div className={styles.workspace}>
   {!result.shipments.length?<p className={styles.notice}>{t('No shipments in this view.')}</p>:<ul className={styles.list}>{result.shipments.map(shipment=><li className={styles.record} key={shipment.id}>
    <div><span className="eyebrow">{shipment.reference}</span><h2>{shipment.label||`${shipment.firstOrigin} → ${shipment.lastDestination}`}</h2>{shipment.label?<p>{shipment.firstOrigin} → {shipment.lastDestination}</p>:null}<p>{shipment.recipientEmail}</p><p className={styles.muted}>{t(shipment.legCount===1?'1 transport stage':'{count} transport stages',{count:shipment.legCount})} · {t(trackingDeliveryKey[shipment.deliveryState])}{shipment.revokedAt!==null?<> · {t('Shipment access revoked.')}</>:null}</p></div>
    <Link className="btn secondary" href={trackingStaffHref(view,shipment.id)}>{t('Open')}</Link>
   </li>)}</ul>}
  </div>
  <nav className={styles.pagination} aria-label={t('Result pages')}>{view.cursor?<Link className="btn secondary" href={trackingStaffHref({q:view.q})}>{t('Back to first page')}</Link>:<span/>}{result.nextCursor?<Link className="btn secondary" href={trackingStaffHref({...view,cursor:result.nextCursor})}>{t('Next')}</Link>:null}</nav>
 </DashboardShell>;
}
