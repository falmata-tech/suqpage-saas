"use client";
import {TRANSPORT_COPY} from "@/lib/i18n/transport-copy";
import LoadingBar from "./LoadingBar";
import { useUiText } from "@/lib/i18n/ui";
import styles from "./TransportSupport.module.css";
import Link from "next/link";
import {usePathname,useSearchParams} from "next/navigation";
import { Truck, X } from "lucide-react";
import TransportCoordinator from "./TransportCoordinator";
import {TRANSPORT_COORDINATOR} from "@/lib/transport-coordinator";
import TransportIntake from "./TransportIntake";
import TransportChatCredit from "./TransportChatCredit";
import { createPortal } from "react-dom";
import { FormEvent, useEffect, useRef, useState } from "react";

import BuyingConversation from "./BuyingConversation";
import type { BuyingConversation as Receipt } from "@/lib/buying-conversation-contract";
import {TRANSPORT_CALLBACK_AFTER_MS,transportLiveWait} from "@/lib/transport-live-wait";
const endpoint = "/api/public-support?channel=transport";

export default function PublicSupportChat() {
  const t = useUiText();
  const pathname=usePathname(),search=useSearchParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const attempt = useRef<{ draft: string; key: string } | null>(null);
  const recovery = useRef(0);
  const recoveryController = useRef<AbortController | null>(null);
  const live = useRef(true);
  const busyRef = useRef(false);
  const openIntent = useRef(false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [alertsStoppedFor,setAlertsStoppedFor]=useState('');
  const [unread,setUnread]=useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [coordinatorId,setCoordinatorId]=useState<typeof TRANSPORT_COORDINATOR.id|null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const visibleUnread=alertsStoppedFor===receipt?.publicRef?0:unread;

  useEffect(()=>{
    const dialog=dialogRef.current;
    if(!mounted||!dialog)return;
    const viewport=window.visualViewport;
    const sync=()=>{
      dialog.style.setProperty('--support-visible-height',`${viewport?.height||window.innerHeight}px`);
      dialog.style.setProperty('--support-visible-top',`${viewport?.offsetTop||0}px`);
    };
    sync();
    viewport?.addEventListener('resize',sync);
    viewport?.addEventListener('scroll',sync);
    window.addEventListener('resize',sync);
    return()=>{viewport?.removeEventListener('resize',sync);viewport?.removeEventListener('scroll',sync);window.removeEventListener('resize',sync);};
  },[mounted]);

  async function loadReceipt() {
    if (busyRef.current) return;
    const generation = ++recovery.current;
    recoveryController.current?.abort();
    const controller = new AbortController();
    recoveryController.current = controller;
    setLoaded(false);
    setSessionReady(false);
    setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) });
      if (!response.ok) throw new Error("Support could not be refreshed.");
      const payload = await response.json() as { conversation: Receipt | null };
      if (!live.current || generation !== recovery.current) return;
      setReceipt(payload.conversation);
      setSessionReady(true);
      setError("");
    } catch {
      if (!live.current || generation !== recovery.current) return;
      setSessionReady(false);
      setError("Support is temporarily unavailable. Please try again.");
    } finally { if (live.current && generation === recovery.current) setLoaded(true); }
  }
  useEffect(()=>{live.current=true;return()=>{live.current=false;recovery.current++;recoveryController.current?.abort();};},[]);
  useEffect(()=>{if(mounted)void loadReceipt();},[mounted]);
  useEffect(()=>{
    setUnread(0);if(!receipt)return;
    const firstStaffReplyAt=receipt.firstStaffReplyAt!==undefined?receipt.firstStaffReplyAt:receipt.messages.reduce<number|null>((first,item)=>item.sender==='staff'?Math.min(first??item.createdAt,item.createdAt):first,null);
    const serverNow=receipt.serverNow??Date.now();
    const waitStartedAt=receipt.transportWaitStartedAt??receipt.createdAt??serverNow;
    const wait=transportLiveWait({status:receipt.status,waitStartedAt,agentJoined:receipt.agentJoined,agentJoinedAt:receipt.agentJoinedAt,firstStaffReplyAt},serverNow);
    if(receipt.transportCallback?.submitted||wait.phase==='inbox'){
      setAlertsStoppedFor(receipt.publicRef);
      return;
    }
    setAlertsStoppedFor('');
    let stopped=false,timer:ReturnType<typeof setTimeout>,failures=0;
    const remaining=Math.max(0,waitStartedAt+TRANSPORT_CALLBACK_AFTER_MS-serverNow);
    const callbackTimer=wait.phase==='joined'?undefined:setTimeout(()=>{if(!stopped){stopped=true;setUnread(0);setAlertsStoppedFor(receipt.publicRef);clearTimeout(timer);}},remaining);
    async function poll(){if(stopped)return;if(!document.hidden)try{const r=await fetch('/api/attention?channel=transport',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('alerts');const value=await r.json() as {unread:number};if(!stopped)setUnread(value.unread);failures=0;}catch{failures++;}if(!stopped)timer=setTimeout(poll,Math.min(30000,5000*2**Math.min(failures,3)));}
    void poll();return()=>{stopped=true;clearTimeout(timer);clearTimeout(callbackTimer);};
  },[receipt?.publicRef,receipt?.serverNow,receipt?.transportWaitStartedAt,receipt?.agentJoined,receipt?.agentJoinedAt,receipt?.firstStaffReplyAt,receipt?.messages,receipt?.transportCallback?.submitted]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open) void loadReceipt();
  }, [open, mounted]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || !sessionReady || receipt || coordinatorId!==TRANSPORT_COORDINATOR.id || !name.trim() || !phone.trim() || !origin.trim() || !destination.trim()) return;
    busyRef.current=true;
    const generation=++recovery.current;recoveryController.current?.abort();
    setBusy(true); setError("");
    try {
      const draft = JSON.stringify([coordinatorId,name,phone,origin,destination,message]);
      if (!attempt.current || attempt.current.draft !== draft) attempt.current = {draft,key:crypto.randomUUID().replaceAll("-", "")};
      const response = await fetch(endpoint, { method: "POST", signal:AbortSignal.timeout(15_000), headers: {"content-type":"application/json"}, body: JSON.stringify({
        action:"start", coordinatorId, category:"shipment_observation", name, phone, origin, destination, message, idempotencyKey:attempt.current.key, website:"",
      }) });
      const payload = await response.json() as { conversation?: Receipt; error?: string };
      if(!live.current||generation!==recovery.current)return;
      if (!response.ok || !payload.conversation) throw new Error(payload.error || "Message could not be sent.");
      setReceipt(payload.conversation); attempt.current = null; setMessage("");
    } catch (caught) { if(live.current&&generation===recovery.current)setError(caught instanceof Error ? caught.message : "Message could not be sent."); }
    finally { busyRef.current=false;if(live.current)setBusy(false); }
  }
  async function anotherRequest() {
    if (busyRef.current) return;
    busyRef.current=true;
    const generation=++recovery.current;recoveryController.current?.abort();
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, {method:"DELETE",signal:AbortSignal.timeout(15_000)});
      if(!live.current||generation!==recovery.current)return;
      if (!response.ok) throw new Error("Request could not be accepted.");
      setReceipt(null); setSessionReady(false); attempt.current = null; setMessage("");setCoordinatorId(null);
      busyRef.current=false;
      await loadReceipt();
    } catch (caught) { if(live.current&&generation===recovery.current)setError(caught instanceof Error ? caught.message : "Request could not be accepted."); }
    finally { busyRef.current=false;if(live.current)setBusy(false); }
  }
  useEffect(()=>{if(search.get('chat')==='transport'){openIntent.current=true;setOpen(true);}},[pathname,search]);
  function show() { openIntent.current=true;setLoaded(false);setSessionReady(false);setError("");setOpen(true); }
  function close() { openIntent.current=false;recovery.current++;recoveryController.current?.abort();setSessionReady(false);setOpen(false); launcherRef.current?.focus(); }

  return <>
    <div className={`public-support-launcher ${styles.launchers}`}>
      <button ref={launcherRef} className={styles.launcher} data-channel="buying" type="button" onClick={show} aria-label={`${t(TRANSPORT_COPY.launcherTitle)} · ${t(TRANSPORT_COPY.launcherSubtitle)}`} aria-haspopup="dialog" aria-expanded={open} disabled={!mounted}>
        <Truck aria-hidden="true" /><span className={styles.launcherLabel}><strong>{t(TRANSPORT_COPY.launcherTitle)}</strong><small>{t(TRANSPORT_COPY.launcherSubtitle)}</small></span>{visibleUnread>0&&<span aria-hidden="true" className={styles.unread}>{visibleUnread>99?'99+':visibleUnread}</span>}
      </button>
    </div>
    {mounted ? createPortal(<dialog ref={dialogRef} className={`public-support-dialog ${styles.dialog}`} aria-labelledby="public-buying-title" onClose={() => { /* A queued close from the previous dismissal must not hide a newly reopened chat. */ if(!openIntent.current)setOpen(false); }} onCancel={event => {event.preventDefault();close();}} onClick={event => {if(event.target === dialogRef.current)close();}}>
      <section className={`${styles.chatSection} ${receipt ? styles.receivedSection : styles.newConversation} ${receipt ? "has-conversation" : "new-conversation"}`}>
        <header><div><h2 id="public-buying-title">{t(TRANSPORT_COPY.title)}</h2></div><button type="button" onClick={close} aria-label={t("Close")}><X aria-hidden="true" /></button></header>
        <div className={receipt ? styles.chatTools : styles.startTools}>
          {receipt&&<TransportCoordinator compact websiteLink/>}
          <Link href="/tracking" onClick={close}>{t("Shipment records")} →</Link>
        </div>
        <div className={receipt ? styles.conversationBody : styles.intakeArea}>
          {!sessionReady && loaded ? <button type="button" onClick={() => void loadReceipt()}>{t("Retry")}</button> : null}
      {!loaded ? <LoadingBar/> : receipt ? <><BuyingConversation key={receipt.publicRef} endpoint={endpoint} initial={receipt} active={open&&sessionReady} checking={!sessionReady} fitViewport onAnother={() => void anotherRequest()} />{error ? <p role="alert">{t(error)}</p> : null}</> :
            <TransportIntake draft={{name,phone,origin,destination,message,coordinatorId}} onChange={(field,value)=>({name:setName,phone:setPhone,origin:setOrigin,destination:setDestination,message:setMessage}[field])(value)} onSelectCoordinator={setCoordinatorId} onSubmit={submit} busy={busy} ready={sessionReady} error={error}/>}
        </div>
        <TransportChatCredit/>
      </section>
    </dialog>,document.body) : null}
  </>;
}
