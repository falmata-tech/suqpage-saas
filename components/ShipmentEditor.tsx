"use client";

import {useEffect,useRef,useState} from 'react';
import type {StaffTrackingShipment} from '@/lib/tracking-contract';
import {submitShipmentAction,updateShipmentAction} from '@/app/dashboard/tracking/actions';
import type {TrackingStaffView} from '@/app/dashboard/tracking/navigation';
import {useUiText} from '@/lib/i18n/ui';
import TransportPlanEditor from './TransportPlanEditor';
import styles from './ShipmentStaff.module.css';

type ShipmentEditorProps={shipment:StaffTrackingShipment|null;idempotencyKey?:string;navigation:TrackingStaffView;cancelHref:string};
export default function ShipmentEditor(props:ShipmentEditorProps){
 return <ShipmentDraft key={props.shipment?`${props.shipment.id}:${props.shipment.reference}`:'new'} {...props}/>;
}
function ShipmentDraft({shipment,idempotencyKey,navigation,cancelHref}:ShipmentEditorProps){
 const t=useUiText(),[email,setEmail]=useState(shipment?.recipientEmail||''),[label,setLabel]=useState(shipment?.label||'');
 const recipient=useRef<HTMLInputElement>(null);
 const submitKey=useRef(idempotencyKey||'');
 useEffect(()=>{if(!shipment)recipient.current?.focus();},[shipment]);
 return <div className={styles.workspace}>
  <TransportPlanEditor trackingFields plan={shipment?{version:shipment.version,legs:shipment.legs}:null} cancelHref={cancelHref} action={shipment?updateShipmentAction:submitShipmentAction} submitLabel={shipment?'Save changes':'Submit shipment'} visibilityMessage="Only the verified recipient can view this shipment." focusFirstLeg={Boolean(shipment)}
   formFields={<>
    {Object.entries(navigation).map(([key,value])=><input key={key} type="hidden" name={'nav_'+key} value={value}/>)}
    {shipment?<><input type="hidden" name="shipmentId" value={shipment.id}/><input type="hidden" name="reference" value={shipment.reference}/></>:<input type="hidden" name="idempotencyKey" value={submitKey.current}/>}
   </>}
   beforeLegs={<section className={styles.recipient} aria-label={t('Recipient email')}>
    {shipment?<dl><dt>{t('Recipient email')}</dt><dd>{shipment.recipientEmail}</dd></dl>:<>
     <label>{t('Recipient email')}<input ref={recipient} name="recipientEmail" type="email" required maxLength={254} autoComplete="off" value={email} onChange={event=>setEmail(event.target.value)}/></label>
     <p>{t('Enter the recipient’s email. They will verify it in Shipment tracking to view this shipment.')}</p>
     <p>{t('Submitting saves the shipment and queues its initial details email.')}</p>
    </>}
    <label>{t('Shipment label (optional)')}<input name="label" maxLength={120} value={label} onChange={event=>setLabel(event.target.value)}/></label>
   </section>}/>
 </div>;
}
