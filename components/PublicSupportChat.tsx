"use client";
import {TRANSPORT_COPY} from "@/lib/i18n/transport-copy";
import LoadingBar from "./LoadingBar";
import { useUiText } from "@/lib/i18n/ui";
import styles from "./TransportSupport.module.css";
import Link from "next/link";
import {usePathname,useSearchParams} from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import TransportIntake from "./TransportIntake";
import { createPortal } from "react-dom";
import { FormEvent, useEffect, useRef, useState } from "react";

import BuyingConversation from "./BuyingConversation";
import type { BuyingConversation as Receipt } from "@/lib/buying-conversation-contract";
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
  const [unread,setUnread]=useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    let stopped=false,timer:ReturnType<typeof setTimeout>,failures=0;
    async function poll(){if(stopped)return;if(!document.hidden)try{const r=await fetch('/api/attention?channel=transport',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('alerts');const value=await r.json() as {unread:number};if(!stopped)setUnread(value.unread);failures=0;}catch{failures++;}if(!stopped)timer=setTimeout(poll,Math.min(30000,5000*2**Math.min(failures,3)));}
    void poll();return()=>{stopped=true;clearTimeout(timer);};
  },[receipt?.publicRef]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open) void loadReceipt();
  }, [open, mounted]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || !sessionReady || receipt || !name.trim() || !phone.trim() || !origin.trim() || !destination.trim()) return;
    busyRef.current=true;
    const generation=++recovery.current;recoveryController.current?.abort();
    setBusy(true); setError("");
    try {
      const draft = JSON.stringify([name, phone, origin, destination, message]);
      if (!attempt.current || attempt.current.draft !== draft) attempt.current = {draft,key:crypto.randomUUID().replaceAll("-", "")};
      const response = await fetch(endpoint, { method: "POST", signal:AbortSignal.timeout(15_000), headers: {"content-type":"application/json"}, body: JSON.stringify({
        action:"start", category:"shipment_observation", name, phone, origin, destination, message, idempotencyKey:attempt.current.key, website:"",
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
      setReceipt(null); setSessionReady(false); attempt.current = null; setMessage("");
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
        <MessageCircle aria-hidden="true" /><span className={styles.launcherLabel}><strong>{t(TRANSPORT_COPY.launcherTitle)}</strong><small>{t(TRANSPORT_COPY.launcherSubtitle)}</small></span>{unread>0&&<span aria-hidden="true" className={styles.unread}>{unread>99?'99+':unread}</span>}
      </button>
    </div>
    {mounted ? createPortal(<dialog ref={dialogRef} className={`public-support-dialog ${styles.dialog}`} aria-labelledby="public-buying-title" onClose={() => { /* A queued close from the previous dismissal must not hide a newly reopened chat. */ if(!openIntent.current)setOpen(false); }} onCancel={event => {event.preventDefault();close();}} onClick={event => {if(event.target === dialogRef.current)close();}}>
      <section className={receipt ? styles.receivedSection : "new-conversation"}>
        <header><div><span className={styles.chatEyebrow}><MessageCircle aria-hidden="true" />{t("Live Chat")}</span><h2 id="public-buying-title">{t(TRANSPORT_COPY.title)}</h2></div><button type="button" onClick={close} aria-label={t("Close")}><X aria-hidden="true" /></button></header>
        <div className={styles.trackingEntry}><Link href="/tracking" onClick={close}>{t("Shipment tracking")} →</Link></div>
        {!sessionReady && loaded ? <button type="button" onClick={() => void loadReceipt()}>{t("Retry")}</button> : null}
        {!loaded ? <LoadingBar/> : receipt ? <><BuyingConversation key={receipt.publicRef} endpoint={endpoint} initial={receipt} active={open&&sessionReady} checking={!sessionReady} onAnother={() => void anotherRequest()} />{error ? <p role="alert">{t(error)}</p> : null}</> : <>
          <TransportIntake draft={{name,phone,origin,destination,message}} onChange={(field,value)=>({name:setName,phone:setPhone,origin:setOrigin,destination:setDestination,message:setMessage}[field])(value)} onSubmit={submit} busy={busy} ready={sessionReady} error={error}/>

        </>}
      </section>
    </dialog>,document.body) : null}
  </>;
}
