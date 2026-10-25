"use client";

import {useId,useRef,useState} from 'react';
import {Check,ChevronDown,ExternalLink} from 'lucide-react';
import {TRANSPORT_COORDINATOR,type TransportCoordinator as Coordinator} from '@/lib/transport-coordinator';
import {useUiText} from '@/lib/i18n/ui';
import {LOGISTICS_PROVIDER_COPY} from '@/lib/i18n/transport-copy';
import styles from './TransportSupport.module.css';

/** The arranging company is distinct from each shipment leg's carrier. */
export default function TransportCoordinator({selection=false,compact=false,websiteLink=false,selectedId=null,onSelect}:{selection?:boolean;compact?:boolean;websiteLink?:boolean;selectedId?:Coordinator['id']|null;onSelect?:(id:Coordinator['id'])=>void}) {
  const t=useUiText(),[open,setOpen]=useState(false),panelId=useId(),trigger=useRef<HTMLButtonElement>(null);
  const selected=selectedId===TRANSPORT_COORDINATOR.id;
  const logo=(small=false)=><img className={[styles.coordinatorLogo,small?styles.coordinatorLogoCompact:""].filter(Boolean).join(" ")} src={TRANSPORT_COORDINATOR.logoPath} alt={TRANSPORT_COORDINATOR.name} />;
  const badge=<span className={styles.coordinatorType}>{t(LOGISTICS_PROVIDER_COPY.freightBrokerage)}</span>;
  if(selection)return <div className={styles.coordinatorSelector} data-transport-coordinator={selected?TRANSPORT_COORDINATOR.id:undefined}>
    <button ref={trigger} type="button" data-testid="transport-provider-toggle" className={styles.coordinatorTrigger} aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(value=>!value)}>
      <span className={styles.coordinatorIdentity}><small>{t(LOGISTICS_PROVIDER_COPY.label)}</small>{selected?logo():<strong>{t(LOGISTICS_PROVIDER_COPY.choose)}</strong>}{selected&&<>{badge}<span className={styles.coordinatorDescription}>{t(LOGISTICS_PROVIDER_COPY.description)}</span></>}</span>
      {selected&&<Check className={styles.coordinatorCheck} size={18} aria-label={t('Selected')}/>}<ChevronDown className={open?styles.coordinatorChevronOpen:""} size={18} aria-hidden="true"/>
    </button>
    {open&&<div id={panelId} className={styles.coordinatorOptions}>
      <button type="button" data-testid="transport-provider-option" className={styles.coordinatorOption} aria-pressed={selected} onClick={()=>{onSelect?.(TRANSPORT_COORDINATOR.id);setOpen(false);trigger.current?.focus();}}>{logo(true)}<span>{badge}<span className={styles.coordinatorDescription}>{t(LOGISTICS_PROVIDER_COPY.description)}</span></span>{selected&&<Check size={18} aria-label={t('Selected')}/>}</button>
      <p>{t(LOGISTICS_PROVIDER_COPY.availability)}</p>
    </div>}
  </div>;
  const identity=<>{logo(compact)}<span className={styles.coordinatorBrandDetails}>{!compact&&<small>{t('Arranging company')}</small>}{badge}</span>{websiteLink&&<span className={styles.coordinatorWebsite}>{t('Website')}<ExternalLink size={14} aria-hidden="true"/></span>}</>;
  const className=[styles.coordinator,compact?styles.coordinatorCompact:"",websiteLink?styles.coordinatorWebsiteLink:""].filter(Boolean).join(" ");
  return websiteLink?<a className={className} data-transport-coordinator={TRANSPORT_COORDINATOR.id} href={TRANSPORT_COORDINATOR.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`${TRANSPORT_COORDINATOR.name} · ${t('Website')}`}>{identity}</a>:<span className={className} data-transport-coordinator={TRANSPORT_COORDINATOR.id}>{identity}</span>;
}
