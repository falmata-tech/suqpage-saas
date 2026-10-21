'use client';

import Link from 'next/link';
import {ArrowLeft,ArrowRight,Mail,Package,ShieldCheck} from 'lucide-react';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {useLocale} from 'next-intl';
import {useUiText} from '@/lib/i18n/ui';
import type {TrackingShipment as RecipientShipment,TrackingList as RecipientShipmentPage,TrackingShipmentSummary as RecipientShipmentSummary} from '@/lib/tracking-contract';
import {parseTrackingShipment} from '@/lib/tracking-contract';
import LoadingBar from './LoadingBar';
import {trackingReturnHref} from '@/lib/tracking-navigation';
import TransportPlanReadView from './TransportPlanReadView';
import styles from './TrackingPortal.module.css';

class RequestError extends Error{constructor(readonly status:number,message:string){super(message);}}
async function request<T>(path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
 const response=await fetch('/api/tracking/'+path,{method:body===undefined?'GET':'POST',cache:'no-store',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:signal??AbortSignal.timeout(12000)});
 const value=await response.json() as T&{error?:string};if(!response.ok)throw new RequestError(response.status,value.error||'Unable to connect. Please try again.');return value;
}

export default function TrackingPortal({reference,returnHref}:{reference?:string;returnHref?:string}){
 const t=useUiText(),locale=useLocale();
 const [phase,setPhase]=useState<'loading'|'email'|'code'|'list'|'detail'>('loading');
 const [email,setEmail]=useState(''),[code,setCode]=useState(''),[challenge,setChallenge]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[resendAt,setResendAt]=useState(0),[clock,setClock]=useState(Date.now());
 const [shipments,setShipments]=useState<RecipientShipmentSummary[]>([]),[cursor,setCursor]=useState<string|null>(null);
 const [selected,setSelected]=useState(reference||''),[shipment,setShipment]=useState<RecipientShipment|null>(null);
 const generation=useRef(0),live=useRef(true),pending=useRef(false),detailController=useRef<AbortController|null>(null);
 const hasList=useRef(false),detailRefresh=useRef<(()=>Promise<void>)|null>(null);
 const firstInput=useRef<HTMLInputElement>(null);
 function expired(){generation.current++;hasList.current=false;setShipment(null);setShipments([]);setCursor(null);setChallenge('');setCode('');setPhase('email');setError('Verify your email to open your shipments.');}
 async function loadList(more=false){
  const current=generation.current;setError('');
  try{const value=await request<RecipientShipmentPage>('shipments'+(more&&cursor?'?cursor='+encodeURIComponent(cursor):''));if(!live.current||current!==generation.current)return;hasList.current=true;setShipments(rows=>more?[...rows,...value.shipments.filter(item=>!rows.some(row=>row.reference===item.reference))]:value.shipments);setCursor(value.nextCursor);setPhase('list');}
  catch(caught){if(!live.current||current!==generation.current)return;if(caught instanceof RequestError&&caught.status===401)expired();else setError(caught instanceof RequestError?caught.message:'Unable to connect. Please try again.');}
 }
 useEffect(()=>{
  live.current=true;const controller=new AbortController();let stopped=false;
  void request<{expiresAt:number}>('session',undefined,controller.signal).then(()=>{if(stopped)return;if(reference){setSelected(reference);setPhase('detail');}else void loadList();}).catch(caught=>{if(!stopped){setPhase('email');if(!(caught instanceof RequestError&&caught.status===401))setError('Unable to connect. Please try again.');}});
  return()=>{stopped=true;live.current=false;generation.current++;controller.abort();detailController.current?.abort();};
  // The server page keys the portal by locator; credentials never enter route state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{if(phase==='email'||phase==='code')firstInput.current?.focus();},[phase]);
 useEffect(()=>{if(phase!=='code')return;const timer=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(timer);},[phase]);
 useEffect(()=>{
  if(phase!=='detail'||!selected)return;
  let stopped=false,inFlight=false,failures=0,resume=false,terminal=false,timer:ReturnType<typeof setTimeout>|undefined,etag='',snapshot:RecipientShipment|null=null;
  const current=++generation.current;setShipment(null);setError('');
  const active=()=>!document.hidden&&document.hasFocus();
  async function refresh(){
   if(stopped||terminal||inFlight||!active())return;clearTimeout(timer);inFlight=true;const controller=new AbortController();detailController.current=controller;
   const timeout=setTimeout(()=>controller.abort(),10000);
   try{
    const response=await fetch('/api/tracking/shipments/'+encodeURIComponent(selected),{cache:'no-store',headers:etag?{'If-None-Match':etag}:undefined,signal:controller.signal});
    if(stopped||current!==generation.current||controller.signal.aborted)return;
    if(response.status===401){expired();return;}
    if(response.status===404){terminal=true;snapshot=null;setShipment(null);setShipments(rows=>rows.filter(row=>row.reference!==selected));setError('This shipment is unavailable.');return;}
    if(response.status===304){if(!snapshot){etag='';throw new Error('Missing shipment body');}}
    else{
     const value:unknown=await response.json();if(!response.ok)throw new RequestError(response.status,'Unable to connect. Please try again.');
     const next=parseTrackingShipment(value);if(next.reference!==selected)throw new Error('Wrong shipment');
     if(stopped||current!==generation.current||controller.signal.aborted)return;
     snapshot=next;setShipment(next);etag=response.headers.get('etag')||'';
    }
    failures=0;setError('');
   }catch{if(!stopped&&current===generation.current&&active()&&!resume){failures++;setError('Unable to connect. Please try again.');}}
   finally{
    clearTimeout(timeout);inFlight=false;if(detailController.current===controller)detailController.current=null;
    if(!stopped&&!terminal&&current===generation.current&&active()){
     if(resume){resume=false;void refresh();}else timer=setTimeout(refresh,Math.min(30000,5000*2**Math.min(failures,3)));
    }
   }
  }
  detailRefresh.current=refresh;
  const activity=()=>{clearTimeout(timer);if(active()){if(inFlight){if(detailController.current?.signal.aborted)resume=true;}else void refresh();}else{resume=false;detailController.current?.abort();}};
  document.addEventListener('visibilitychange',activity);window.addEventListener('focus',activity);window.addEventListener('blur',activity);window.addEventListener('online',activity);void refresh();
  return()=>{stopped=true;detailRefresh.current=null;clearTimeout(timer);detailController.current?.abort();document.removeEventListener('visibilitychange',activity);window.removeEventListener('focus',activity);window.removeEventListener('blur',activity);window.removeEventListener('online',activity);};
 },[phase,selected]);
 async function action(operation:()=>Promise<void>){if(pending.current)return;pending.current=true;setBusy(true);setError('');try{await operation();}catch(caught){if(live.current)setError(caught instanceof RequestError?caught.message:'Unable to connect. Please try again.');}finally{pending.current=false;if(live.current)setBusy(false);}}
 async function sendCode(){await action(async()=>{const value=await request<{challengeId:string;resendAfter:number}>('request-code',{email,locale});if(!live.current)return;setChallenge(value.challengeId);setCode('');setResendAt(Date.now()+value.resendAfter*1000);setClock(Date.now());setPhase('code');});}
 function verify(event:FormEvent){event.preventDefault();void action(async()=>{await request('verify',{challengeId:challenge,code});if(!live.current)return;setCode('');setChallenge('');if(selected)setPhase('detail');else await loadList();});}
 function showList(){if(pending.current)return;generation.current++;detailController.current?.abort();setSelected('');setShipment(null);setError('');if(hasList.current)setPhase('list');else void action(()=>loadList());}
 function signOut(){void action(async()=>{await request('logout',{});if(!live.current)return;generation.current++;hasList.current=false;setShipment(null);setShipments([]);setCursor(null);setCode('');setEmail('');setSelected('');setPhase('email');});}
 const seconds=Math.max(0,Math.ceil((resendAt-clock)/1000));
 return <section className={styles.page}>
  <header className={styles.heading}><div><p className={styles.eyebrow}><Package size={18} aria-hidden="true"/>{t('Shipment tracking')}</p><h1>{t(phase==='detail'?'Shipment tracking':'Your shipments')}</h1></div>{['list','detail'].includes(phase)&&<button type="button" onClick={signOut} disabled={busy}>{t('Sign out')}</button>}</header>
  {phase==='loading'&&<LoadingBar label={t('Loading…')}/>}
  {error&&<div role="alert" className={styles.error}><p>{t(error)}</p>{(phase==='loading'||phase==='list'||phase==='detail'&&error!=='This shipment is unavailable.')&&<button disabled={busy} onClick={()=>{if(phase==='detail')void detailRefresh.current?.();else void action(()=>loadList());}}>{t('Retry')}</button>}</div>}
  {phase==='email'&&<div className={styles.verification}><span className={styles.symbol}><Mail size={26} aria-hidden="true"/></span><h2>{t('Enter your email to view your shipments.')}</h2><form onSubmit={event=>{event.preventDefault();void sendCode();}}><label htmlFor="tracking-email">{t('Email')}</label><input ref={firstInput} id="tracking-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={event=>setEmail(event.target.value)} required disabled={busy}/><button className={styles.primary} disabled={busy||!email.trim()}>{t(busy?'Sending…':'Send code')}<ArrowRight size={19} aria-hidden="true"/></button></form></div>}
  {phase==='code'&&<div className={styles.verification}><span className={styles.symbol}><ShieldCheck size={26} aria-hidden="true"/></span><h2>{t('Check your email for a six-digit code.')}</h2><p className={styles.address}>{email}</p><form onSubmit={verify}><label htmlFor="tracking-code">{t('Verification code')}</label><input ref={firstInput} id="tracking-code" className={styles.code} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,''))} disabled={busy} required/><button className={styles.primary} disabled={busy||code.length!==6}>{t(busy?'Checking…':'Verify code')}<ArrowRight size={19} aria-hidden="true"/></button></form><div className={styles.codeActions}><button type="button" disabled={busy||seconds>0} onClick={()=>void sendCode()}>{seconds?t('Resend code in {seconds}s',{seconds}):t('Resend code')}</button><button type="button" disabled={busy} onClick={()=>{setCode('');setChallenge('');setError('');setPhase('email');}}>{t('Change email')}</button></div></div>}
  {phase==='list'&&<><p className={styles.intro}>{t('Open a shipment to see the arranged route and provider details.')}</p>{!shipments.length?<div className={styles.empty}><Package size={32} aria-hidden="true"/><p>{t('No shipments yet. Your transport agent can add a shipment for this email.')}</p></div>:<ul className={styles.shipments}>{shipments.map(item=><li key={item.reference}><button type="button" onClick={()=>{setSelected(item.reference);setPhase('detail');}}><span className={styles.shipmentIcon}><Package size={22} aria-hidden="true"/></span><span><small>{item.reference}</small><strong>{item.label||`${item.firstOrigin} → ${item.lastDestination}`}</strong>{item.label&&<span>{item.firstOrigin} → {item.lastDestination}</span>}<span>{item.legCount===1?t('1 transport stage'):t('{count} transport stages',{count:item.legCount})}</span></span><ArrowRight size={20} aria-label={t('Open')}/></button></li>)}</ul>}{cursor&&<button className={styles.more} disabled={busy} onClick={()=>void action(()=>loadList(true))}>{t(busy?'Loading…':'Load more')}</button>}</>}
  {phase==='detail'&&<><button className={styles.back} type="button" disabled={busy} onClick={showList}><ArrowLeft size={18} aria-hidden="true"/>{t('Back to shipments')}</button>{shipment?<><p className={styles.reference}>{shipment.reference}</p>{shipment.label&&<h2>{shipment.label}</h2>}<div aria-live="polite"><TransportPlanReadView plan={{version:shipment.version,legs:shipment.legs}}/></div></>:!error&&<LoadingBar label={t('Loading shipment tracking…')}/>}</>}
  <footer className={styles.footer}><Link href={trackingReturnHref(returnHref)}>{t('Back to transport chat')}</Link></footer>
 </section>;
}
