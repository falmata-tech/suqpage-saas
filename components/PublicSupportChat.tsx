"use client";

import { FileText, Headphones, Paperclip, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const categories = [
  { key: "general", label: "General help" },
  { key: "sourcing", label: "Find a supplier" },
  { key: "document_review", label: "Review documents" },
  { key: "site_visit", label: "Arrange a site visit" },
  { key: "shipment_observation", label: "Observe a shipment" },
] as const;

type Conversation = {
  publicRef: string;
  category: string;
  status: "waiting" | "open" | "closed";
  assignedUserName: string | null;
  messages: Array<{
    id: number;
    sender: "visitor" | "staff";
    senderName: string;
    body: string;
    createdAt: number;
    attachment: {
      id: number;
      originalName: string;
      mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
      byteSize: number;
    } | null;
  }>;
};

function fileSize(value: number) {
  return value >= 1024 * 1024 ? `${(value / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(value / 1024))} KB`;
}

function idempotencyKey() {
  return crypto.randomUUID().replaceAll("-", "");
}

export default function PublicSupportChat() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const attachmentRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [category, setCategory] = useState<(typeof categories)[number]["key"]>("general");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadConversation() {
    try {
      const response = await fetch("/api/public-support", { cache: "no-store" });
      if (!response.ok) throw new Error("Support could not be refreshed.");
      const payload = await response.json() as { conversation: Conversation | null };
      setConversation(payload.conversation);
      setLoaded(true);
    } catch {
      setLoaded(true);
      setError("Support is temporarily unavailable. Please try again.");
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open && !loaded) void loadConversation();
  }, [open, loaded]);

  useEffect(() => {
    if (!open || !conversation || conversation.status === "closed") return;
    const refreshVisibleConversation = () => {
      if (!document.hidden) void loadConversation();
    };
    const interval = window.setInterval(refreshVisibleConversation, 5_000);
    document.addEventListener("visibilitychange", refreshVisibleConversation);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshVisibleConversation);
    };
  }, [open, conversation?.publicRef, conversation?.status]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages.length]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("action", conversation ? "message" : "start");
      body.set("category", category);
      body.set("email", conversation ? "" : email);
      body.set("phone", conversation ? "" : phone);
      body.set("message", message);
      body.set("idempotencyKey", idempotencyKey());
      body.set("website", "");
      if (attachment) body.set("attachment", attachment);
      const response = await fetch("/api/public-support", {
        method: "POST",
        body,
      });
      const payload = await response.json() as { conversation?: Conversation; error?: string };
      if (!response.ok || !payload.conversation) throw new Error(payload.error || "Message could not be sent.");
      setConversation(payload.conversation);
      setMessage("");
      setAttachment(null);
      if (attachmentRef.current) attachmentRef.current.value = "";
      setLoaded(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Message could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  async function endChat() {
    if (!conversation || busy || !window.confirm("End this support chat? You can still read the closed conversation here.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/public-support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      });
      const payload = await response.json() as { conversation?: Conversation; error?: string };
      if (!response.ok || !payload.conversation) throw new Error(payload.error || "The chat could not be ended.");
      setConversation(payload.conversation);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The chat could not be ended.");
    } finally {
      setBusy(false);
    }
  }

  async function startAnotherChat() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/public-support", { method: "DELETE" });
      if (!response.ok) throw new Error("A new chat could not be started.");
      setConversation(null);
      setCategory("general");
      setMessage("");
      setAttachment(null);
      if (attachmentRef.current) attachmentRef.current.value = "";
      setLoaded(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "A new chat could not be started.");
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  return <>
    <button ref={launcherRef} className="public-support-launcher" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
      <Headphones aria-hidden="true" />
      <span>Ask MirtPage</span>
    </button>
    <dialog ref={dialogRef} className="public-support-dialog" aria-labelledby="public-support-title" onClose={() => setOpen(false)} onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === dialogRef.current) close(); }}>
      <section className={conversation ? "has-conversation" : "new-conversation"}>
        <header>
          <div><span>Live support</span><h2 id="public-support-title">Ask MirtPage</h2></div>
          <button type="button" onClick={close} aria-label="Close support"><X aria-hidden="true" /></button>
        </header>
        {!loaded ? <p className="public-support-loading" role="status">Opening support…</p> : conversation ? <>
          <div className="public-support-state"><span><strong>{conversation.status === "waiting" ? "Waiting for a team member" : conversation.status === "closed" ? "Conversation closed" : `Connected${conversation.assignedUserName ? ` with ${conversation.assignedUserName}` : ""}`}</strong><small>{conversation.publicRef}</small></span>{conversation.status !== "closed" ? <button type="button" onClick={endChat} disabled={busy}>End chat</button> : <button type="button" onClick={startAnotherChat} disabled={busy}>Start another chat</button>}</div>
          <div ref={threadRef} className="public-support-thread" aria-live="polite" aria-label="Support messages">
            {conversation.messages.map((item) => <article key={item.id} className={item.sender}>
              <strong>{item.senderName}</strong>
              <p>{item.body}</p>
              {item.attachment ? item.attachment.mimeType.startsWith("image/")
                ? <a className="public-support-attachment image" href={`/api/public-support/attachments/${item.attachment.id}`} target="_blank" rel="noreferrer"><img src={`/api/public-support/attachments/${item.attachment.id}`} alt={item.attachment.originalName} loading="lazy" /><span>{item.attachment.originalName} · {fileSize(item.attachment.byteSize)}</span></a>
                : <a className="public-support-attachment file" href={`/api/public-support/attachments/${item.attachment.id}`}><FileText aria-hidden="true" /><span><b>{item.attachment.originalName}</b><small>PDF · {fileSize(item.attachment.byteSize)}</small></span></a>
                : null}
            </article>)}
          </div>
        </> : <div className="public-support-intro">
          <p>Browse and contact showrooms directly. Ask our team for sourcing support, a document review, an on-site observation, or shipment observation.</p>
          <small>These services provide documented assistance, not certification, a guarantee, or an endorsement.</small>
          <label className="public-support-category" htmlFor="public-support-category">How can we help?<select id="public-support-category" value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number]["key"])}>{categories.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select></label>
        </div>}
        {conversation?.status === "closed" ? error ? <p className="public-support-error" role="alert">{error}</p> : null : loaded ? <form onSubmit={submit}>
          {!conversation ? <div className="public-support-contact-fields">
            <label htmlFor="public-support-email">Email<input id="public-support-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required placeholder="you@example.com" /></label>
            <label htmlFor="public-support-phone">Phone<input id="public-support-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={40} required placeholder="+251…" /></label>
            <small>Required so our team can continue by email or phone if this chat disconnects.</small>
          </div> : null}
          <label htmlFor="public-support-message">{conversation ? "Reply" : "Your message"}</label>
          <textarea id="public-support-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={3} required placeholder={conversation ? "Write a reply…" : "Tell us what you need…"} />
          <label className="public-support-attachment-input" htmlFor="public-support-attachment"><Paperclip aria-hidden="true" /><span>{attachment ? attachment.name : "Attach image or PDF"}</span><input ref={attachmentRef} id="public-support-attachment" name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setAttachment(event.target.files?.[0] || null)} /></label>
          <small className="public-support-attachment-help">Optional · one JPEG, PNG, WebP, or PDF · 5 MB maximum</small>
          {error ? <p className="public-support-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={busy || !message.trim() || (!conversation && (!email.trim() || !phone.trim()))}><Send aria-hidden="true" /><span>{busy ? "Sending…" : "Send"}</span></button>
        </form> : null}
      </section>
    </dialog>
  </>;
}
