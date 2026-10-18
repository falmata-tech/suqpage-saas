"use client";
import {useEffect,useRef,useState} from 'react';
import {Bell,X} from 'lucide-react';
import {useUiText} from '@/lib/i18n/ui';
import {attentionLabel} from '@/lib/i18n/attention-copy';
import type {AttentionFeed,AttentionItem} from '@/lib/attention-contract';
import styles from './AttentionAlerts.module.css';
import {peerFooterVisible} from './ChatReadObserver';

export default function AttentionAlerts({identity,endpoint='/api/attention',onOpen}:{identity:string;endpoint?:string;onOpen?:()=>void}) {
  type Feed=AttentionFeed&{push?:{web:{available:boolean;publicKey:string}}};
  const t=useUiText(),[feed,setFeed]=useState<Feed|null>(null),[error,setError]=useState(''),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
  const openRef=useRef(false);openRef.current=open;
  const identityRef=useRef(identity);identityRef.current=identity;
  const dialog=useRef<HTMLDialogElement>(null),button=useRef<HTMLButtonElement>(null),audio=useRef<AudioContext|null>(null),soundAt=useRef(0),latest=useRef<number|null>(null);
  useEffect(()=>{setFeed(null);setOpen(false);latest.current=null;return()=>{void audio.current?.close();audio.current=null;};},[identity]);
  useEffect(()=>{const unlock=()=>{if(feed?.preferences.soundEnabled){audio.current||=new AudioContext();void audio.current.resume().catch(()=>{});}};document.addEventListener('pointerdown',unlock,{once:true});return()=>document.removeEventListener('pointerdown',unlock);},[feed?.preferences.soundEnabled]);
  async function load(){
    const r=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('alerts');const value=await r.json() as Feed;
    if(identityRef.current!==identity)return value;
    const key='suqpage-alert-cursor:'+identity;
    if(latest.current===null){try{latest.current=Number(localStorage.getItem(key)||value.latestId);}catch{latest.current=value.latestId;}}
    try{latest.current=Math.max(latest.current,Number(localStorage.getItem(key)||0));}catch{/* Storage can be disabled. */}
    function beingRead(n:AttentionItem){if(n.kind!=='message'||openRef.current)return false;const d=n.destination;const ownerTransport=d.screen==='owner-chat'&&n.channel==='transport'&&location.pathname==='/dashboard/transport'&&Number.isSafeInteger(d.id)?document.querySelector('[data-owner-transport-id="'+d.id+'"]'):null;const root=d.screen==='transport-chat'&&onOpen?document.querySelector('.public-support-dialog[open]'):ownerTransport?ownerTransport.querySelector('[role="log"]'):['owner-chat','support-chat'].includes(d.screen)&&location.pathname===`/dashboard/support/${d.id}`?document.querySelector('.support-thread'):null;const footer=root?.querySelectorAll<HTMLElement>('[data-read-message-id]');return Boolean(footer?.length&&peerFooterVisible(footer[footer.length-1]));}
    if(document.hasFocus() && value.latestId>latest.current && value.preferences.soundEnabled && value.items.some(n=>n.id>latest.current!&&!n.read&&!beingRead(n))&&Date.now()-soundAt.current>3000 && audio.current?.state==='running'){
      const oscillator=audio.current.createOscillator(),gain=audio.current.createGain();oscillator.connect(gain);gain.connect(audio.current.destination);oscillator.frequency.value=660;
      gain.gain.setValueAtTime(.05,audio.current.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.current.currentTime+.18);oscillator.start();oscillator.stop(audio.current.currentTime+.2);soundAt.current=Date.now();
    }
    latest.current=Math.max(latest.current,value.latestId);try{localStorage.setItem(key,String(latest.current));}catch{/* Private/read state stays server-side. */}
    setFeed(value);setError('');return value;
  }
  useEffect(()=>{
    let stopped=false,timer:ReturnType<typeof setTimeout>,failures=0;
    async function poll(){if(stopped)return;if(!document.hidden)try{await load();failures=0;}catch{failures++;if(openRef.current)setError('Alerts are temporarily unavailable.');}if(!stopped)timer=setTimeout(poll,Math.min(30000,5000*2**Math.min(failures,3)));}
    const resume=()=>{if(!document.hidden){clearTimeout(timer);void poll();}};void poll();document.addEventListener('visibilitychange',resume);return()=>{stopped=true;clearTimeout(timer);document.removeEventListener('visibilitychange',resume);};
  },[endpoint,identity]);
  useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();else if(!open&&dialog.current?.open)dialog.current.close();},[open]);
  async function update(body:Record<string,unknown>){setBusy(true);setError('');try{const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('alerts');const value=await r.json();if(identityRef.current!==identity)return false;setFeed(value);return true;}catch{setError('Could not update alerts. Try again.');return false;}finally{setBusy(false);}}
  async function sounds(enabled:boolean){if(enabled){audio.current ||= new AudioContext();await audio.current.resume();}await update({action:'preferences',soundEnabled:enabled,language:document.documentElement.lang||'en'});}
  async function notifications(){
    setBusy(true);setError('');try{
      if(!feed?.push?.web.available||!('serviceWorker' in navigator)||!('Notification' in window)||await Notification.requestPermission()!=='granted')throw new Error('permission');
      const registration=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;
      const raw=atob(feed.push.web.publicKey.replace(/-/g,'+').replace(/_/g,'/')),key=Uint8Array.from(raw,c=>c.charCodeAt(0));
      const subscription=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
      await update({action:'subscribe',device:{kind:'web',subscription:subscription.toJSON()}});
    }catch{setError('Could not enable notifications. Try again.');}finally{setBusy(false);}
  }
  async function visit(item:AttentionItem){if(!await update({action:'read',id:item.id}))return;setOpen(false);if(onOpen){onOpen();return;}const d=item.destination;window.location.assign(d.screen==='inquiries'?`/dashboard/inquiries?inquiry=${d.id}&business=${d.businessId}`:d.screen==='support-queue'?'/dashboard/support':d.screen==='owner-chat'&&item.channel==='transport'?`/dashboard/transport?conversation=${d.id}`:`/dashboard/support/${d.id}`);}
  return <>
    <button ref={button} type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setOpen(true);void load().catch(()=>setError('Alerts are temporarily unavailable.'));}}><Bell aria-hidden="true"/>{t('Alerts')}{Boolean(feed?.unread)&&<span className={styles.badge}>{feed!.unread>99?'99+':feed!.unread}</span>}</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={'alerts-title-'+identity} onClose={event=>{event.stopPropagation();setOpen(false);button.current?.focus();}} onCancel={event=>{event.stopPropagation();setOpen(false);}}>
      <header><h2 id={'alerts-title-'+identity}>{t('Alerts')}</h2><button type="button" className={styles.close} aria-label={t('Close')} onClick={()=>setOpen(false)}><X aria-hidden="true"/></button></header>
      <div className={styles.settings}><label><input type="checkbox" checked={feed?.preferences.soundEnabled||false} disabled={busy||!feed} onChange={e=>void sounds(e.target.checked).catch(()=>setError('Could not update alerts. Try again.'))}/>{t('Play a sound for new alerts')}</label></div>
      {feed?.push?.web.available?<div className={styles.settings}><button type="button" className={styles.trigger} disabled={busy} onClick={()=>feed.enabled?.web?void update({action:'unsubscribe'}):void notifications()}>{t(feed.enabled?.web?'Turn off notifications':'Turn on notifications')}</button></div>:null}
      {Boolean(feed?.unread)&&<div className={styles.settings}><button type="button" className={styles.trigger} disabled={busy} onClick={()=>void update({action:'read_all',id:feed!.latestId})}>{t('Mark all read')}</button></div>}
      {error?<p role="alert" className={`${styles.notice} ${styles.error}`}>{t(error)}</p>:null}
      {!feed?<p className={styles.notice}>{t('Loading…')}</p>:!feed.items.length?<p className={styles.notice}>{t('No alerts yet.')}</p>:<div className={styles.items}>{feed.items.map(item=><button key={item.id} type="button" className={styles.item} data-unread={!item.read} disabled={busy} onClick={()=>void visit(item)}><strong>{t(attentionLabel(item))}</strong><small>{item.channel?t(item.channel==='transport'?'Transport':'Business support')+' · ':''}{new Date(item.createdAt).toLocaleString(undefined,{hour12:true})}</small></button>)}</div>}
    </dialog>
  </>;
}
