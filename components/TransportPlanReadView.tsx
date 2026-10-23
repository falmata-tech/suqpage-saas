'use client';

import {useEffect,useRef,useState} from 'react';
import {Car,Copy,ExternalLink,Motorbike,Plane,Truck} from 'lucide-react';
import type {TransportMethod,TransportPlan,TransportPlanLeg} from '@suqpage/contracts';
import {useUiText} from '@/lib/i18n/ui';
import {trackingProviderUrl} from '@/lib/tracking-contract';
import {copyBrowserText} from '@/lib/browser-clipboard';
import styles from './TransportPlanReadView.module.css';

const methods={air:{label:'Air',icon:Plane},truck:{label:'Truck',icon:Truck},van:{label:'Van',icon:Truck},car:{label:'Car',icon:Car},motorcycle:{label:'Motorcycle',icon:Motorbike}} satisfies Record<TransportMethod,{label:string;icon:typeof Truck}>;
type TrackableLeg=TransportPlanLeg&{trackingUrl?:string;trackingCode?:string};
function ProviderTrackingDetails({leg}:{leg:TrackableLeg}){
 const t=useUiText(),[copyState,setCopyState]=useState<'idle'|'copied'|'failed'>('idle');
 const identity=useRef('');identity.current=JSON.stringify([leg.id,leg.trackingUrl,leg.trackingCode]);
 const code=typeof leg.trackingCode==='string'?leg.trackingCode:'';
 let url='';try{url=trackingProviderUrl(leg.trackingUrl);}catch{/* Invalid navigation input stays inert. */}
 useEffect(()=>{identity.current=JSON.stringify([leg.id,leg.trackingUrl,leg.trackingCode]);setCopyState('idle');return()=>{identity.current='';};},[leg.id,leg.trackingUrl,leg.trackingCode]);
 if(!url&&!code)return null;
 return <div className={styles.providerTracking}>
  {code&&<div className={styles.trackingCode}><div><span>{t('Tracking code')}</span><code tabIndex={0}>{code}</code></div><button type="button" aria-label={t('Copy code for {provider}',{provider:leg.providerName})} onClick={async()=>{const current=identity.current,result=await copyBrowserText(code);if(current&&current===identity.current)setCopyState(result?'copied':'failed');}}><Copy size={16} aria-hidden="true"/>{t('Copy code')}</button></div>}
  {url&&<a href={url} target="_blank" rel="noopener noreferrer" aria-label={t('Open provider tracking for {provider} (external website)',{provider:leg.providerName})}>{t('Open provider tracking')}<ExternalLink size={16} aria-hidden="true"/></a>}
  {copyState==='copied'&&<p role="status">{t('Copied')}</p>}
  {copyState==='failed'&&<p role="status">{t('Could not copy. Select the code above and copy it.')}</p>}
 </div>;
}

/** Public plan fields only. Ordinal stages never imply completed travel. */
export default function TransportPlanReadView({plan}:{plan:TransportPlan}){
 const t=useUiText();
 return <section className={styles.plan} aria-label={t('Shipment record')}>
  <p className={styles.count}>{plan.legs.length===1?t('1 transport stage'):t('{count} transport stages',{count:plan.legs.length})}</p>
  <ol className={styles.legs} aria-label={t('Providers in travel order')}>
   {plan.legs.map((leg,index)=>{
    const method=methods[leg.method],MethodIcon=method.icon;
    return <li key={leg.id} className={styles.leg} data-transport-plan-leg={leg.id}>
     <div className={styles.ordinal} aria-label={t('Stage {number}',{number:index+1})}>{index+1}</div>
     <article className={styles.card}>
      <header><h3>{leg.providerName}</h3><span className={styles.method}><MethodIcon size={18} aria-hidden="true"/>{t(method.label)}</span></header>
      <dl className={styles.route}><div><dt>{t('From')}</dt><dd>{leg.origin}</dd></div><div><dt>{t('To')}</dt><dd>{leg.destination}</dd></div></dl>
      <ProviderTrackingDetails leg={leg}/>
     </article>
    </li>;
   })}
  </ol>
 </section>;
}
