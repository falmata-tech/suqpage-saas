import TransportCoordinator from "@/components/TransportCoordinator";
import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import ShipmentEditor from '@/components/ShipmentEditor';
import ShipmentStaffActions from '@/components/ShipmentStaffActions';
import TransportPlanReadView from '@/components/TransportPlanReadView';
import styles from '@/components/ShipmentStaff.module.css';
import {requireUser} from '@/lib/auth';
import {getUiText} from '@/lib/i18n/server';
import {readStaffTrackingShipment} from '@/lib/tracking';
import {TrackingError} from '@/lib/tracking-contract';
import {canUseStaffTracking,trackingStaffHref,trackingStaffView,trackingDeliveryKey} from '../navigation';

export const dynamic='force-dynamic';
export default async function StaffShipmentPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const actor=await requireUser();if(!canUseStaffTracking(actor))redirect('/dashboard');
 const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<1)notFound();
 const shipment=await readStaffTrackingShipment(actor,id).catch(error=>{if(error instanceof TrackingError&&error.code==='forbidden')redirect('/dashboard');if(error instanceof TrackingError&&error.code==='not_found')notFound();throw error;});
 const query=await searchParams,view=trackingStaffView(query),readHref=trackingStaffHref(view,id),editing=query.edit==='1'&&shipment.revokedAt===null,t=await getUiText();
 const manager=actor.access_role==='platform_admin'||actor.access_role==='operations_manager';
 return <DashboardShell user={actor} business={null}><div className={styles.workspace} data-staff-shipment>
  <Link className="support-back-link" href={trackingStaffHref(view)}>{t('Back to shipment records')}</Link>
  <header className={styles.heading}><div><span className="eyebrow">{shipment.reference}</span><h1>{shipment.label||t('Shipment record')}</h1></div>{!editing&&shipment.revokedAt===null?<Link className="btn brand" href={trackingStaffHref(view,id,{edit:true})}>{t('Edit shipment record')}</Link>:null}</header>
  {editing?<ShipmentEditor shipment={shipment} navigation={view} cancelHref={readHref}/>:<>
   {query.created==='1'||query.saved==='1'?<p className="notice" role="status">{t('Shipment record saved.')}</p>:null}
   {shipment.revokedAt!==null?<p className="notice" role="status">{t('Shipment access revoked.')}</p>:null}
   <dl className={styles.facts}><div><dt>{t('Recipient email')}</dt><dd>{shipment.recipientEmail}</dd></div><div><dt>{t('Email status')}</dt><dd>{t(trackingDeliveryKey[shipment.deliveryState])}</dd></div></dl>
   <TransportCoordinator/>
   <TransportPlanReadView plan={{version:shipment.version,legs:shipment.legs}}/>
   <ShipmentStaffActions shipment={shipment} navigation={view} canRevoke={manager}/>
  </>}
 </div></DashboardShell>;
}
