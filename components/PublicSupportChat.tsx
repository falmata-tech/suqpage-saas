"use client";
import {TRANSPORT_COPY} from "@/lib/i18n/transport-copy";
import LoadingBar from "./LoadingBar";
import { useUiText } from "@/lib/i18n/ui";
import styles from "./TransportSupport.module.css";
import { MessageCircle, Truck, X, MapPin, UserRound, Phone } from "lucide-react";
import { createPortal } from "react-dom";
import { FormEvent, useEffect, useRef, useState } from "react";

import BuyingConversation from "./BuyingConversation";
import type { BuyingConversation as Receipt } from "@/lib/buying-conversation-contract";
const endpoint = "/api/public-support?channel=transport";

export default function PublicSupportChat() {
  const t = useUiText();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const attempt = useRef<{ draft: string; key: string } | null>(null);
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
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error("Support could not be refreshed.");
      const payload = await response.json() as { conversation: Receipt | null };
      setReceipt(payload.conversation);
      setSessionReady(true);
      setError("");
    } catch {
      setSessionReady(false);
      setError("Support is temporarily unavailable. Please try again.");
    } finally { setLoaded(true); }
  }
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
    if (busy || !sessionReady || receipt || !name.trim() || !phone.trim() || !origin.trim() || !destination.trim()) return;
    setBusy(true); setError("");
    try {
      const draft = JSON.stringify([name, phone, origin, destination, message]);
      if (!attempt.current || attempt.current.draft !== draft) attempt.current = {draft,key:crypto.randomUUID().replaceAll("-", "")};
      const response = await fetch(endpoint, { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({
        action:"start", category:"shipment_observation", name, phone, origin, destination, message, idempotencyKey:attempt.current.key, website:"",
      }) });
      const payload = await response.json() as { conversation?: Receipt; error?: string };
      if (!response.ok || !payload.conversation) throw new Error(payload.error || "Message could not be sent.");
      setReceipt(payload.conversation); attempt.current = null; setMessage("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Message could not be sent."); }
    finally { setBusy(false); }
  }
  async function anotherRequest() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, {method:"DELETE"});
      if (!response.ok) throw new Error("Request could not be accepted.");
      setReceipt(null); setSessionReady(false); attempt.current = null; setMessage("");
      await loadReceipt();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Request could not be accepted."); }
    finally { setBusy(false); }
  }
  useEffect(()=>{if(new URLSearchParams(window.location.search).get('chat')==='transport')setOpen(true);},[]);
  function close() { setOpen(false); launcherRef.current?.focus(); }

  return <>
    <div className={`public-support-launcher ${styles.launchers}`}>
      <button ref={launcherRef} className={styles.launcher} data-channel="buying" type="button" onClick={() => setOpen(true)} aria-label={`${t(TRANSPORT_COPY.launcherTitle)} ${t(TRANSPORT_COPY.launcherSubtitle)}`} aria-haspopup="dialog" aria-expanded={open} disabled={!mounted}>
        <MessageCircle aria-hidden="true" /><span className={styles.launcherLabel}><strong>{t(TRANSPORT_COPY.launcherTitle)}</strong><small>{t(TRANSPORT_COPY.launcherSubtitle)}</small></span>{unread>0&&<span aria-hidden="true" style={{position:'absolute',right:4,top:4,background:'#fff',color:'#c93600',borderRadius:12,minWidth:20,padding:'2px 5px',fontSize:12,fontWeight:700}}>{unread>99?'99+':unread}</span>}
      </button>
    </div>
    {mounted ? createPortal(<dialog ref={dialogRef} className={`public-support-dialog ${styles.dialog}`} aria-labelledby="public-buying-title" onClose={() => setOpen(false)} onCancel={event => {event.preventDefault();close();}} onClick={event => {if(event.target === dialogRef.current)close();}}>
      <section className={receipt ? styles.receivedSection : "new-conversation"}>
        <header><div><span className={styles.chatEyebrow}><MessageCircle aria-hidden="true" />{t("Live Chat")}</span><h2 id="public-buying-title">{t(TRANSPORT_COPY.title)}</h2></div><button type="button" onClick={close} aria-label={t("Close")}><X aria-hidden="true" /></button></header>
        {!sessionReady && loaded ? <button type="button" onClick={() => void loadReceipt()}>{t("Retry")}</button> : null}
        {!loaded ? <LoadingBar/> : receipt ? <><BuyingConversation endpoint={endpoint} initial={receipt} active={open} onAnother={() => void anotherRequest()} />{error ? <p role="alert">{t(error)}</p> : null}</> : <>
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}><Truck aria-hidden="true" /></div>
            <h3>{t(TRANSPORT_COPY.invitation)}</h3>
            <p>{t(TRANSPORT_COPY.description)}</p>
          </div>
          <form className={styles.intake} onSubmit={submit}>
            <div className={`public-support-contact-fields ${styles.routePair}`}>
              <label htmlFor="transport-origin"><span className={styles.fieldLabel}><MapPin size={16} aria-hidden="true" />{t("From")}</span><input id="transport-origin" value={origin} onChange={event=>setOrigin(event.target.value)} maxLength={120} required placeholder={t("City or area")} /></label>
              <label htmlFor="transport-destination"><span className={styles.fieldLabel}><MapPin size={16} aria-hidden="true" />{t("To")}</span><input id="transport-destination" value={destination} onChange={event=>setDestination(event.target.value)} maxLength={120} required placeholder={t("City or area")} /></label>
            </div>
            <div className="public-support-contact-fields">
              <label htmlFor="public-buying-name"><span className={styles.fieldLabel}><UserRound size={16} aria-hidden="true" />{t("Name")}</span><input id="public-buying-name" autoComplete="name" value={name} onChange={event=>setName(event.target.value)} maxLength={80} required placeholder={t("Your name")} /></label>
              <label htmlFor="public-buying-phone"><span className={styles.fieldLabel}><Phone size={16} aria-hidden="true" />{t("Phone")}</span><input id="public-buying-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={event=>setPhone(event.target.value)} maxLength={40} required placeholder="+251…" /></label>
            </div>
            <label htmlFor="public-buying-message">{t("Goods or transport details (optional)")}</label>
            <textarea id="public-buying-message" value={message} onChange={event=>setMessage(event.target.value)} maxLength={3700} rows={2} placeholder={t("What are you sending? You can add a product link.")} />
            <p>{t("We’ll reply here or call if you leave the chat.")}</p>
            {error ? <p className="public-support-error" role="alert">{t(error)}</p> : null}
            <button type="submit" className={styles.submit} disabled={busy || !sessionReady || !name.trim() || !phone.trim() || !origin.trim() || !destination.trim()}><MessageCircle aria-hidden="true" /><span>{busy ? t("Sending…") : t("Start chat")}</span></button>
          </form>
        </>}
      </section>
    </dialog>,document.body) : null}
  </>;
}
