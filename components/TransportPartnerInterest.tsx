'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {useLocale} from 'next-intl';
import {useUiText} from '@/lib/i18n/ui';
import styles from './TransportPartnerInterest.module.css';
const empty={companyName:'',contactName:'',email:'',phone:'',message:''};
function submissionKey(){
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export default function TransportPartnerInterest(){
 const t=useUiText(),locale=useLocale(),[draft,setDraft]=useState(empty),[reference,setReference]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const live=useRef(true),pending=useRef<AbortController|null>(null),sending=useRef(false),attempt=useRef<{signature:string;key:string}|null>(null);
 useEffect(()=>{live.current=true;return()=>{live.current=false;pending.current?.abort();};},[]);
 const change=(key:keyof typeof empty,value:string)=>setDraft(old=>({...old,[key]:value}));
 async function submit(event:FormEvent){
  event.preventDefault();if(sending.current)return;
  const data={...draft,locale:locale==='am'||locale==='om'?locale:'en'},signature=JSON.stringify(data);
  sending.current=true;setBusy(true);setError('');const controller=new AbortController();pending.current=controller;
  try{
   if(!attempt.current||attempt.current.signature!==signature)attempt.current={signature,key:submissionKey()};
   const response=await fetch('/api/transport-partners',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,idempotencyKey:attempt.current.key}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
   const value=await response.json() as{reference?:string;error?:string};
   if(!response.ok||!value.reference||!/^PI-[A-F0-9]{12}$/.test(value.reference))throw Error(value.error||'We could not receive your request. Please try again later.');
   if(live.current){setReference(value.reference);setDraft(empty);attempt.current=null;}
  }catch(error){if(live.current)setError(error instanceof Error&&error.name!=='TimeoutError'?error.message:'We could not receive your request. Please try again later.');}
  finally{sending.current=false;if(live.current)setBusy(false);}
 }
 return reference?<div className={styles.receipt} role="status"><h2>{t('Request received. We’ll contact you about the next steps.')}</h2><p>{t('Reference')}: {reference}</p></div>:<form className={styles.form} onSubmit={submit}>
  <div className={styles.pair}>
   <label>{t('Company name')}<input required maxLength={160} autoComplete="organization" value={draft.companyName} disabled={busy} onChange={e=>change('companyName',e.target.value)}/></label>
   <label>{t('Contact name')}<input required maxLength={80} autoComplete="name" value={draft.contactName} disabled={busy} onChange={e=>change('contactName',e.target.value)}/></label>
  </div><div className={styles.pair}>
   <label>{t('Email')}<input required type="email" maxLength={160} autoComplete="email" value={draft.email} disabled={busy} onChange={e=>change('email',e.target.value)}/></label>
   <label>{t('Phone (optional)')}<input type="tel" maxLength={40} autoComplete="tel" value={draft.phone} disabled={busy} onChange={e=>change('phone',e.target.value)}/></label>
  </div>
  <label>{t('About your company')}<textarea required maxLength={4000} rows={5} value={draft.message} disabled={busy} onChange={e=>change('message',e.target.value)}/></label>
  {error&&<p role="alert">{t(error)}</p>}
  <button type="submit" disabled={busy} aria-busy={busy}>{t(busy?'Sending…':'Send request')}</button>
 </form>;
}
