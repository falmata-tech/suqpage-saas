"use client";
import { useUiText } from "@/lib/i18n/ui";
import styles from "./TransportSupport.module.css";
import { MessageCircle, ShoppingBag, X } from "lucide-react";
import { createPortal } from "react-dom";
import { FormEvent, useEffect, useRef, useState } from "react";

import BuyingConversation from "./BuyingConversation";
import type { BuyingConversation as Receipt } from "@/lib/buying-conversation-contract";
const endpoint = "/api/public-support?channel=buying";

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open) void loadReceipt();
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !sessionReady || receipt || !name.trim() || !phone.trim() || !message.trim()) return;
    setBusy(true); setError("");
    try {
      const draft = JSON.stringify([name, phone, message]);
      if (!attempt.current || attempt.current.draft !== draft) attempt.current = {draft,key:crypto.randomUUID().replaceAll("-", "")};
      const response = await fetch(endpoint, { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({
        action:"start", category:"buying_assistance", name, phone, message, idempotencyKey:attempt.current.key, website:"",
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
  function close() { setOpen(false); launcherRef.current?.focus(); }

  return <>
    <div className={`public-support-launcher ${styles.launchers}`}>
      <button ref={launcherRef} className={styles.launcher} data-channel="buying" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <MessageCircle aria-hidden="true" /><span className={styles.launcherLabel}><strong>{t("Buying assistance")}</strong><small>{t("Live chat")}</small></span>
      </button>
    </div>
    {mounted ? createPortal(<dialog ref={dialogRef} className={`public-support-dialog ${styles.dialog}`} aria-labelledby="public-buying-title" onClose={() => setOpen(false)} onCancel={event => {event.preventDefault();close();}} onClick={event => {if(event.target === dialogRef.current)close();}}>
      <section className={receipt ? styles.receivedSection : "new-conversation"}>
        <header><div><span className={styles.chatEyebrow}><MessageCircle aria-hidden="true" />{t("Live chat")}</span><h2 id="public-buying-title">{t("Buying assistance")}</h2></div><button type="button" onClick={close} aria-label={t("Close")}><X aria-hidden="true" /></button></header>
        {!sessionReady && loaded ? <button type="button" onClick={() => void loadReceipt()}>{t("Retry")}</button> : null}
        {!loaded ? <p className="public-support-loading" role="status">{t("Loading…")}</p> : receipt ? <><BuyingConversation initial={receipt} active={open} onAnother={() => void anotherRequest()} />{error ? <p role="alert">{t(error)}</p> : null}</> : <>
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}><ShoppingBag aria-hidden="true" /></div>
            <h3>{t("What can we help you with?")}</h3>
            <p>{t("Talk with our team about a purchase, a seller or product quality.")}</p>
          </div>
          <form className={styles.intake} onSubmit={submit}>
            <label htmlFor="public-buying-message">{t("Your message")}</label>
            <textarea id="public-buying-message" value={message} onChange={event=>setMessage(event.target.value)} maxLength={4000} rows={3} required placeholder={t("Tell us what you need. You can include a product or shop link.")} />
            <div className="public-support-contact-fields">
              <label htmlFor="public-buying-name">{t("Name")}<input id="public-buying-name" autoComplete="name" value={name} onChange={event=>setName(event.target.value)} maxLength={80} required placeholder={t("Your name")} /></label>
              <label htmlFor="public-buying-phone">{t("Phone")}<input id="public-buying-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={event=>setPhone(event.target.value)} maxLength={40} required placeholder="+251…" /></label>
            </div>
            {error ? <p className="public-support-error" role="alert">{t(error)}</p> : null}
            <button type="submit" className={styles.submit} disabled={busy || !sessionReady || !name.trim() || !phone.trim() || !message.trim()}><MessageCircle aria-hidden="true" /><span>{busy ? t("Sending…") : t("Start chat")}</span></button>
          </form>
        </>}
      </section>
    </dialog>,document.body) : null}
  </>;
}
