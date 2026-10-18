'use client';

import {Car,Motorbike,Plane,Truck} from 'lucide-react';
import type {TransportMethod,TransportPlan} from '@suqpage/contracts';
import {useUiText} from '@/lib/i18n/ui';
import styles from './TransportPlanReadView.module.css';

const methods={air:{label:'Air',icon:Plane},truck:{label:'Truck',icon:Truck},van:{label:'Van',icon:Truck},car:{label:'Car',icon:Car},motorcycle:{label:'Motorcycle',icon:Motorbike}} satisfies Record<TransportMethod,{label:string;icon:typeof Truck}>;

/** Public plan fields only. Ordinal stages never imply completed travel. */
export default function TransportPlanReadView({plan}:{plan:TransportPlan}){
 const t=useUiText();
 return <section className={styles.plan} aria-label={t('Transport plan')}>
  <p className={styles.count}>{plan.legs.length===1?t('1 transport stage'):t('{count} transport stages',{count:plan.legs.length})}</p>
  <ol className={styles.legs} aria-label={t('Providers in travel order')}>
   {plan.legs.map((leg,index)=>{
    const method=methods[leg.method],MethodIcon=method.icon;
    return <li key={leg.id} className={styles.leg} data-transport-plan-leg={leg.id}>
     <div className={styles.ordinal} aria-label={t('Stage {number}',{number:index+1})}>{index+1}</div>
     <article className={styles.card}>
      <header><h3>{leg.providerName}</h3><span className={styles.method}><MethodIcon size={18} aria-hidden="true"/>{t(method.label)}</span></header>
      <dl className={styles.route}><div><dt>{t('From')}</dt><dd>{leg.origin}</dd></div><div><dt>{t('To')}</dt><dd>{leg.destination}</dd></div></dl>
     </article>
    </li>;
   })}
  </ol>
 </section>;
}
