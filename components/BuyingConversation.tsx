"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, Clock3, Send, Wifi } from "lucide-react";
import { useUiText } from "@/lib/i18n/ui";
import { buyingRefreshDelay, type BuyingConversation as Conversation } from "@/lib/buying-conversation-contract";
import styles from "./BuyingConversation.module.css";
import { useVisibleChatRead } from './ChatReadObserver';
import AttentionAlerts from './AttentionAlerts';

export default function BuyingConversation({ initial, active, onAnother, endpoint = "/api/public-support?channel=buying" }: { endpoint?: string; initial: Conversation; active: boolean; onAnother: () => void }) {
  const t = useUiText();
  const [conversation, setConversation] = useState(initial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ending, setEnding] = useState(false);
  const busyRef = useRef(false);
  const version = useRef(0);
  const attempt = useRef<{ draft: string; key: string } | null>(null);
  const history = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  const lastId = conversation.messages.at(-1)?.id;
  const awaitingReply = conversation.status !== "closed" && !conversation.agentJoined && !conversation.messages.some(item => item.sender === "staff");
  useVisibleChatRead(history,active,async messageId=>{
    const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'read',messageId,publicRef:initial.publicRef}),signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('read');
  },initial.publicRef);
  useEffect(() => { setConversation(initial); }, [initial]);
  useEffect(() => {
    const node = history.current;
    if (node && (firstScroll.current || node.scrollHeight - node.scrollTop - node.clientHeight < 240)) { node.scrollTop = node.scrollHeight; firstScroll.current = false; }
  }, [lastId]);
  useEffect(() => {
    if (!active) return;
    let stopped = false, inFlight = false, failures = 0;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController | undefined;
    async function refresh() {
      clearTimeout(timer);
      if (stopped || inFlight) return;
      if (!document.hidden && !busyRef.current) {
        inFlight = true;
        controller = new AbortController();
        const timeout = setTimeout(() => controller?.abort(), 12_000);
        const generation = version.current;
        try {
          const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
          const payload = await response.json() as { conversation?: Conversation | null };
          if (!response.ok || payload.conversation?.publicRef !== initial.publicRef) throw new Error("session");
          if (!stopped && generation === version.current) { setConversation(payload.conversation); setConnected(true); if (payload.conversation.status === "closed") setError(""); }
          failures = 0;
        } catch { if (!stopped) { failures++; setConnected(false); } }
        finally { clearTimeout(timeout); inFlight = false; }
      }
      if (!stopped) timer = setTimeout(refresh, buyingRefreshDelay(failures));
    }
    const resume = () => { if (!document.hidden) void refresh(); };
    timer = setTimeout(refresh, buyingRefreshDelay(0));
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => { stopped = true; clearTimeout(timer); controller?.abort(); document.removeEventListener("visibilitychange", resume); window.removeEventListener("online", resume); };
  }, [active, initial.publicRef, endpoint]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || !message.trim() || conversation.status === "closed") return;
    busyRef.current = true; setBusy(true); setError(""); version.current++;
    const draft = message.trim();
    if (!attempt.current || attempt.current.draft !== draft) attempt.current = { draft, key: crypto.randomUUID() };
    try {
      const response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(15_000), headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "message", publicRef: initial.publicRef, message: draft, idempotencyKey: attempt.current.key }) });
      const payload = await response.json() as { conversation?: Conversation; error?: string };
      if (!response.ok || !payload.conversation) throw new Error(payload.error || "Message could not be sent.");
      setConversation(payload.conversation); setMessage(""); attempt.current = null; setConnected(true);
      requestAnimationFrame(() => { if (history.current) history.current.scrollTop = history.current.scrollHeight; });
    } catch (caught) { setError(caught instanceof Error && caught.name !== "TimeoutError" ? caught.message : "Message could not be sent."); }
    finally { busyRef.current = false; setBusy(false); version.current++; }
  }
  async function endChat() {
    if (busyRef.current || conversation.status === "closed") return;
    busyRef.current = true; setBusy(true); setEnding(true); setError(""); version.current++;
    try {
      const response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(15_000), headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "close", publicRef: initial.publicRef }) });
      const payload = await response.json() as { conversation?: Conversation; error?: string };
      if (!response.ok || !payload.conversation) throw new Error(payload.error || "Support could not be updated.");
      setConversation(payload.conversation); setConnected(true);
    } catch { setError("Support could not be updated."); }
    finally { busyRef.current = false; setBusy(false); setEnding(false); version.current++; }
  }
  return <div className={styles.conversation}>
    <AttentionAlerts identity={initial.publicRef} endpoint={endpoint.includes('transport')?'/api/attention?channel=transport':'/api/attention?channel=buying'} onOpen={()=>{if(history.current)history.current.scrollTop=history.current.scrollHeight;}}/>
    <div className={styles.status} data-waiting={awaitingReply} role="status">
      <strong>{conversation.status === 'closed' ? t('Closed') : conversation.agentJoined ? t('{value1} joined your chat',{value1:conversation.assignedUserName||t('An agent')}) : conversation.assignedUserName ? t('Assigned to {value1}',{value1:conversation.assignedUserName}) : <><Clock3 aria-hidden="true" />{t(conversation.category === "shipment_observation" ? "Waiting for our transport team" : "Waiting for our team")}</>}</strong>
      {connected && conversation.status !== "closed" ? <span className={styles.connection}><Wifi aria-hidden="true" />{t("Chat connected")}</span> : null}
      {conversation.status !== "closed" ? <button type="button" className={styles.endChat} onClick={() => void endChat()} disabled={busy} aria-busy={ending}>{t("End chat")}</button> : null}
      {!connected ? <span>{t("Connection interrupted. Retrying…")}</span> : null}
    </div>
    {awaitingReply ? <p className={styles.waitingHint}>{t("Replies appear here automatically. You can return to this chat in this browser.")}</p> : null}
    <div ref={history} className={styles.history} role="log" aria-live="polite" aria-relevant="additions" aria-label={t("Support message history")} tabIndex={0}>
      {conversation.messages.map(item => <article key={item.id} data-sender={item.sender}>
        <strong>{item.sender === "visitor" ? t("You") : item.senderName}</strong>
        <p>{item.body}</p><div className={styles.messageMeta}><time dateTime={new Date(item.createdAt).toISOString()}>{new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12: true }).format(item.createdAt)}</time>{item.sender === "visitor" ? <span data-receipt={item.read?'read':'sent'}><Check aria-hidden="true" />{t(item.read?'Read':'Sent')}</span> : null}</div>
        {item.sender==='staff'?<span data-read-message-id={item.id} aria-hidden="true" style={{display:'block',height:1}}/>:null}
      </article>)}
    </div>
    {conversation.status === "closed" ? <p className={styles.waitingHint}>{t("Our team can still follow up by phone.")}</p> : null}
    {error ? <p className="public-support-error" role="alert">{t(error)}</p> : null}
    {conversation.status !== "closed" ? <form className={styles.composer} onSubmit={send}>
      <label htmlFor="buying-reply">{t("Reply")}</label>
      <textarea id="buying-reply" rows={2} maxLength={4000} value={message} onChange={event => setMessage(event.target.value)} required disabled={busy} />
      <button type="submit" disabled={busy || !message.trim()}><Send aria-hidden="true" />{busy && !ending ? t("Sending…") : t("Send")}</button>
    </form> : <button type="button" className={styles.another} onClick={onAnother}>{t("Send another request")}</button>}
  </div>;
}
