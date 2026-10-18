import crypto from 'node:crypto';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import ShipmentEditor from '@/components/ShipmentEditor';
import styles from '@/components/ShipmentStaff.module.css';
import {requireUser} from '@/lib/auth';
import {getUiText} from '@/lib/i18n/server';
import {listStaffTrackingShipments} from '@/lib/tracking';
import {TrackingError} from '@/lib/tracking-contract';
import {canUseStaffTracking,trackingStaffHref,trackingStaffView} from '../navigation';

export const dynamic='force-dynamic';
export default async function NewShipmentPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const actor=await requireUser();if(!canUseStaffTracking(actor))redirect('/dashboard');
 // An authorized read checks fresh role/settings and table readiness before the editor.
 await listStaffTrackingShipments(actor).catch(error=>{if(error instanceof TrackingError&&error.code==='forbidden')redirect('/dashboard');throw error;});
 const t=await getUiText(),view=trackingStaffView(await searchParams),back=trackingStaffHref(view);
 return <DashboardShell user={actor} business={null}><div className={styles.workspace}>
  <Link className="support-back-link" href={back}>{t('Back to shipments')}</Link><header className={styles.heading}><h1>{t('New shipment')}</h1></header>
  <ShipmentEditor shipment={null} idempotencyKey={crypto.randomUUID()} navigation={view} cancelHref={back}/>
 </div></DashboardShell>;
}
