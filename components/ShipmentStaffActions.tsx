"use client";

import {useEffect,useId,useRef,useState} from 'react';
import {unstable_rethrow} from 'next/navigation';
import {Copy} from 'lucide-react';
import type {StaffTrackingShipment} from '@/lib/tracking-contract';
import type {TrackingStaffView} from '@/app/dashboard/tracking/navigation';
import {revokeShipmentAction} from '@/app/dashboard/tracking/actions';
import {useUiText} from '@/lib/i18n/ui';
import styles from './ShipmentStaff.module.css';

type ShipmentActionsProps={shipment:StaffTrackingShipment;navigation:TrackingStaffView;canRevoke:boolean};
export default function ShipmentStaffActions(props:ShipmentActionsProps){return <ShipmentControls key={`${props.shipment.id}:${props.shipment.reference}`} {...props}/>;}
function ShipmentControls({shipment,navigation,canRevoke}:ShipmentActionsProps){
 const t=useUiText(),title=useId(),dialog=useRef<HTMLDialogElement>(null),revokeButton=useRef<HTMLButtonElement>(null),fallbackInput=useRef<HTMLInputElement>(null),pending=useRef(false),wasOpen=useRef(false);
 const confirmation=useRef({shipmentId:shipment.id,reference:shipment.reference,expectedVersion:shipment.version});
 const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false),[fallback,setFallback]=useState('');
 useEffect(()=>{if(confirm&&!dialog.current?.open)dialog.current?.showModal();if(!confirm&&dialog.current?.open)dialog.current.close();if(!confirm&&wasOpen.current)revokeButton.current?.focus();wasOpen.current=confirm;},[confirm]);
 useEffect(()=>{if(fallback){fallbackInput.current?.focus();fallbackInput.current?.select();}},[fallback]);
 return <section className={styles.link}>
  <p>{t('The recipient must verify their email on the Shipment records page to open this record.')}</p>
  <div className={styles.actions}>
   <button className="btn secondary" type="button" disabled={shipment.revokedAt!==null} onClick={async()=>{
    setCopied(false);setFallback('');if(!/^\/tracking\/SHP-[A-F0-9]{20}$/.test(shipment.sharePath))return;
    const link=new URL(shipment.sharePath,window.location.origin).href;
    try{await navigator.clipboard.writeText(link);setCopied(true);}catch{setFallback(link);}
   }}><Copy size={18} aria-hidden="true"/>{t('Copy shipment record link')}</button>
   {canRevoke&&shipment.revokedAt===null?<button ref={revokeButton} className="btn secondary" type="button" onClick={()=>{confirmation.current={shipmentId:shipment.id,reference:shipment.reference,expectedVersion:shipment.version};setError('');setConfirm(true);}}>{t('Revoke shipment record access')}</button>:null}
  </div>
  {copied?<p role="status">{t('Copied')}</p>:null}
  {fallback?<label>{t('Select and copy the link below.')}<input ref={fallbackInput} readOnly value={fallback}/></label>:null}
  <dialog ref={dialog} className={styles.confirmation} aria-labelledby={title} onCancel={event=>{if(pending.current)event.preventDefault();else setConfirm(false);}} onClose={()=>{if(!pending.current)setConfirm(false);}}>
   <h2 id={title}>{t('Revoke shipment record access?')}</h2>
   <p>{t('The recipient will no longer be able to open this record. Other records are unchanged.')}</p>
   <form aria-busy={busy} onSubmit={async event=>{
    event.preventDefault();if(pending.current)return;const data=new FormData(event.currentTarget);pending.current=true;setBusy(true);setError('');
    try{const result=await revokeShipmentAction(data);if(result?.error)setError(result.error);}catch(failure){unstable_rethrow(failure);setError('Unable to connect. Please try again.');}finally{pending.current=false;setBusy(false);}
   }}>
    <input type="hidden" name="shipmentId" value={confirmation.current.shipmentId}/><input type="hidden" name="reference" value={confirmation.current.reference}/><input type="hidden" name="expectedVersion" value={confirmation.current.expectedVersion}/>
    {Object.entries(navigation).map(([key,value])=><input key={key} type="hidden" name={'nav_'+key} value={value}/>)}
    {error?<p className="error" role="alert">{t(error)}</p>:null}
    <div className={styles.actions}><button className="btn secondary" type="button" autoFocus disabled={busy} onClick={()=>setConfirm(false)}>{t('Cancel')}</button><button className="btn brand" disabled={busy}>{t(busy?'Saving…':'Revoke shipment record access')}</button></div>
   </form>
  </dialog>
 </section>;
}
