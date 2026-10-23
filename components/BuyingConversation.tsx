"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, Clock3, Send, Wifi } from "lucide-react";
import { useUiText } from "@/lib/i18n/ui";
import {useLocale} from 'next-intl';
import { TRANSPORT_COPY } from "@/lib/i18n/transport-copy";
import { buyingRefreshDelay, type BuyingConversation as Conversation } from "@/lib/buying-conversation-contract";
import {estimateServerNow,formatTransportElapsed,transportLiveWait} from '@/lib/transport-live-wait';
import {TRANSPORT_COORDINATOR} from '@/lib/transport-coordinator';
import {rememberTransportDraft,takeTransportDraft} from "@/lib/tracking-navigation";
import styles from "./BuyingConversation.module.css";
import { useVisibleChatRead } from './ChatReadObserver';
import AttentionAlerts from './AttentionAlerts';
import { supportIdlePresentation } from '@/lib/support-idle-contract';
import { clientChatPresentation } from '@/lib/support-client-state';


export default function BuyingConversation({ initial, active, checking=false, onAnother, endpoint = "/api/public-support?channel=buying", conversationId, showAlerts=true, draftScope="", fitViewport=false }: { endpoint?: string; initial: Conversation; active: boolean; checking?: boolean; onAnother: () => void; conversationId?: number; showAlerts?: boolean;draftScope?:string;fitViewport?:boolean }) {
  const t = useUiText();
  const locale=useLocale();
  const transportChat=endpoint.includes('transport');
  const [conversation, setConversation] = useState(initial);
  const [clockNow,setClockNow]=useState(initial.serverNow??Date.now());
  const serverClock=useRef({serverNow:initial.serverNow??Date.now(),clientAt:performance.now()});
  const draftKey=`transport-reply:${draftScope}:${endpoint}:${initial.publicRef}`;
  const [message, setMessage] = useState(()=>takeTransportDraft<string>(draftKey)||"");
  const [callbackPhone,setCallbackPhone]=useState(initial.transportCallback?.phone||'');
  const [callbackEmail,setCallbackEmail]=useState(initial.transportCallback?.email||'');
  const callbackAttempt=useRef<{signature:string;key:string}|null>(null);
  const draftRef=useRef(message);draftRef.current=message;
  useEffect(()=>()=>{rememberTransportDraft(draftKey,draftRef.current);},[draftKey]);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ending, setEnding] = useState(false);
  const [resuming,setResuming]=useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const busyRef = useRef(false);
  const live = useRef(true);
  const pollController=useRef<AbortController|null>(null);
  const wakePolling=useRef<()=>void>(()=>{});
  const version = useRef(0);
  const attempt = useRef<{ draft: string; key: string } | null>(null);
  const history = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  const currentConversation=useRef(conversation);currentConversation.current=conversation;
  useEffect(()=>{const serverNow=conversation.serverNow??Date.now();serverClock.current={serverNow,clientAt:performance.now()};setClockNow(serverNow);},[conversation.serverNow]);
  const idle=supportIdlePresentation(conversation,Date.now());
  const presentation=clientChatPresentation(conversation);
  const firstStaffReplyAt=conversation.firstStaffReplyAt!==undefined?conversation.firstStaffReplyAt:conversation.messages.reduce<number|null>((first,item)=>item.sender==='staff'?Math.min(first??item.createdAt,item.createdAt):first,null);
  const liveWait=transportChat?transportLiveWait({status:conversation.status,waitStartedAt:conversation.transportWaitStartedAt??conversation.createdAt,agentJoined:conversation.agentJoined,agentJoinedAt:conversation.agentJoinedAt,firstStaffReplyAt},clockNow):null;
  const lastId = conversation.messages.at(-1)?.id;
  const awaitingReply = presentation.awaitingTeam;
  const callbackMode=transportChat&&liveWait?.phase==='inbox';
  const callbackSubmitted=Boolean(conversation.transportCallback?.submitted);
  const terminalClosed=conversation.status==='closed'&&!idle.autoEnded;
  useEffect(()=>{if(!transportChat||!active||callbackMode)return;const timer=setInterval(()=>setClockNow(estimateServerNow(serverClock.current.serverNow,serverClock.current.clientAt,performance.now())),1000);return()=>clearInterval(timer);},[transportChat,active,callbackMode]);
  useVisibleChatRead(history,active&&!callbackMode,async messageId=>{
    const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'read',messageId,publicRef:initial.publicRef,...(conversationId?{conversationId}:{})}),signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('read');
  },initial.publicRef);
  useEffect(()=>{live.current=true;return()=>{live.current=false;version.current++;pollController.current?.abort();};},[]);
  // Recovery selects a case; only this component's current responses update that case.
  useEffect(() => { version.current++;setConversation(initial);firstScroll.current=true; }, [initial.publicRef]);
  useEffect(() => {
    const node = history.current;
    if (node && (firstScroll.current || node.scrollHeight - node.scrollTop - node.clientHeight < 240)) { node.scrollTop = node.scrollHeight; firstScroll.current = false; }
  }, [lastId]);
  useEffect(() => {
    if (!active || callbackMode || terminalClosed) { setRefreshing(false); return; }
    setRefreshing(true);
    let stopped = false, inFlight = false, failures = 0;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController | undefined;
    async function refresh() {
      clearTimeout(timer);
      if (stopped || inFlight) return;
      if (!document.hidden && !busyRef.current) {
        inFlight = true;
        controller = new AbortController();
        pollController.current=controller;
        const timeout = setTimeout(() => controller?.abort(), 12_000);
        const generation = version.current;
        try {
          const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
          const payload = await response.json() as { conversation?: Conversation | null };
          if (!response.ok || payload.conversation?.publicRef !== initial.publicRef) throw new Error("session");
          if (!stopped && generation === version.current) { currentConversation.current=payload.conversation;setConversation(payload.conversation); setConnected(true); if (payload.conversation.status === "closed") setError(""); }
          failures = 0;
        } catch { if (!stopped && generation === version.current) { failures++; setConnected(false); } }
        finally { clearTimeout(timeout); inFlight = false;if(!stopped&&generation===version.current)setRefreshing(false); }
      }
      if (!stopped){clearTimeout(timer);timer = setTimeout(refresh, currentConversation.current.status==='closed'?30_000:buyingRefreshDelay(failures));}
    }
    const resume = () => { if (!document.hidden) void refresh(); };
    wakePolling.current=()=>{clearTimeout(timer);if(!stopped)timer=setTimeout(refresh,5000);};
    void refresh();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    return () => { stopped = true;wakePolling.current=()=>{};version.current++; clearTimeout(timer); controller?.abort(); document.removeEventListener("visibilitychange", resume); window.removeEventListener("online", resume); window.removeEventListener("focus",resume); };
  }, [active, initial.publicRef, endpoint, callbackMode, terminalClosed]);

  useEffect(()=>{setCallbackPhone(initial.transportCallback?.phone||'');setCallbackEmail(initial.transportCallback?.email||'');callbackAttempt.current=null;},[initial.publicRef,initial.transportCallback?.phone,initial.transportCallback?.email]);

  async function submitCallback(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busyRef.current||!callbackMode||callbackSubmitted||!callbackPhone.trim())return;
    busyRef.current=true;setBusy(true);setError('');const generation=++version.current;pollController.current?.abort();
    const signature=JSON.stringify([callbackPhone.trim(),callbackEmail.trim()]);
    if(!callbackAttempt.current||callbackAttempt.current.signature!==signature)callbackAttempt.current={signature,key:crypto.randomUUID()};
    try{
      const response=await fetch(endpoint,{method:'POST',signal:AbortSignal.timeout(15_000),headers:{'content-type':'application/json'},body:JSON.stringify({action:'callback',publicRef:initial.publicRef,phone:callbackPhone,email:callbackEmail,idempotencyKey:callbackAttempt.current.key,...(conversationId?{conversationId}:{})})});
      const payload=await response.json() as {conversation?:Conversation;error?:string};
      if(!live.current||generation!==version.current)return;
      if(!response.ok||payload.conversation?.publicRef!==initial.publicRef)throw new Error(payload.error||'Your request could not be sent.');
      currentConversation.current=payload.conversation;setConversation(payload.conversation);setConnected(true);callbackAttempt.current=null;
    }catch(caught){if(live.current&&generation===version.current)setError(caught instanceof Error&&caught.name!=='TimeoutError'?caught.message:'Your request could not be sent. Try again.');}
    finally{busyRef.current=false;if(live.current)setBusy(false);}
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || checking || refreshing || !message.trim() || conversation.status === "closed") return;
    busyRef.current = true; setBusy(true); setError(""); const generation=++version.current;pollController.current?.abort();
    const draft = message.trim();
    if (!attempt.current || attempt.current.draft !== draft) attempt.current = { draft, key: crypto.randomUUID() };
    try {
      const response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(15_000), headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "message", publicRef: initial.publicRef, message: draft, idempotencyKey: attempt.current.key, ...(conversationId?{conversationId}:{}) }) });
      const payload = await response.json() as { conversation?: Conversation; error?: string };
      if(!live.current||generation!==version.current)return;
      if (!response.ok || payload.conversation?.publicRef !== initial.publicRef) throw new Error(payload.error || "Message could not be sent.");
      currentConversation.current=payload.conversation;setConversation(payload.conversation); setMessage(""); attempt.current = null; setConnected(true);
      requestAnimationFrame(() => { if (history.current) history.current.scrollTop = history.current.scrollHeight; });
    } catch (caught) { if(live.current&&generation===version.current)setError(caught instanceof Error && caught.name !== "TimeoutError" ? caught.message : "Message could not be sent."); }
    finally { busyRef.current = false;if(live.current)setBusy(false); }
  }
  async function changeSession(action:'close'|'resume') {
    if (busyRef.current || checking || refreshing || (action==='resume'?!idle.autoEnded:conversation.status==='closed')) return;
    busyRef.current = true; setBusy(true); setEnding(action==='close');setResuming(action==='resume'); setError(""); const generation=++version.current;pollController.current?.abort();
    try {
      const response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(15_000), headers: { "content-type": "application/json" }, body: JSON.stringify({ action, publicRef: initial.publicRef, ...(conversationId?{conversationId}:{}) }) });
      const payload = await response.json() as { conversation?: Conversation; error?: string };
      if(!live.current||generation!==version.current)return;
      if (!response.ok || payload.conversation?.publicRef !== initial.publicRef) throw new Error(payload.error || "Support could not be updated.");
      currentConversation.current=payload.conversation;setConversation(payload.conversation); setConnected(true);
    } catch { if(live.current&&generation===version.current)setError("Support could not be updated."); }
    finally { busyRef.current = false;if(live.current){setBusy(false);setEnding(false);setResuming(false);if(action==='resume'&&currentConversation.current.status!=='closed')wakePolling.current();} }
  }
  const liveWaiting=liveWait?.phase==='waiting'||liveWait?.phase==='busy';
  return <div className={`${styles.conversation}${fitViewport?` ${styles.fitViewport}`:''}`}>
    {!callbackMode&&showAlerts && <AttentionAlerts identity={initial.publicRef} endpoint={endpoint.includes('transport')?'/api/attention?channel=transport':'/api/attention?channel=buying'} onOpen={()=>{if(history.current)history.current.scrollTop=history.current.scrollHeight;}}/>}
    {callbackMode?<section className={styles.callback} aria-labelledby="transport-callback-heading">
      {callbackSubmitted?<>
        <h3 id="transport-callback-heading">{t(TRANSPORT_COPY.callbackReceivedHeading)}</h3>
        <p>{t(TRANSPORT_COPY.callbackReceived)}</p>
        <ul>{conversation.transportCallback?.phone?<li><strong>{t(TRANSPORT_COPY.callbackPhone)}:</strong> {conversation.transportCallback.phone}</li>:null}{conversation.transportCallback?.email?<li><strong>{t(TRANSPORT_COPY.callbackEmail)}:</strong> {conversation.transportCallback.email}</li>:null}</ul>
        <small>{initial.publicRef}</small>
        <button type="button" className={styles.another} onClick={onAnother} disabled={busy||checking}>{t('Send another request')}</button>
      </>:<>
        <h3 id="transport-callback-heading">{t(TRANSPORT_COPY.callbackHeading)}</h3>
        <p>{t(TRANSPORT_COPY.callbackDescription)}</p>
        <form onSubmit={submitCallback}>
          <label htmlFor="transport-callback-phone">{t(TRANSPORT_COPY.callbackPhone)}</label>
          <input id="transport-callback-phone" type="tel" autoComplete="tel" value={callbackPhone} onChange={event=>setCallbackPhone(event.target.value)} required maxLength={40} />
          <label htmlFor="transport-callback-email">{t(TRANSPORT_COPY.callbackEmail)}</label>
          <input id="transport-callback-email" type="email" autoComplete="email" value={callbackEmail} onChange={event=>setCallbackEmail(event.target.value)} maxLength={254} />
          {error?<p className="public-support-error" role="alert">{t(error)}</p>:null}
          <button type="submit" disabled={busy||checking||!callbackPhone.trim()}>{busy?t('Sending…'):t(TRANSPORT_COPY.callbackSubmit)}</button>
        </form>
        <button type="button" className={styles.cancelRequest} disabled={busy||checking} onClick={()=>void changeSession('close')}>{t('Cancel request')}</button>
      </>}
      {error&&callbackSubmitted?<p className="public-support-error" role="alert">{t(error)}</p>:null}
    </section>:<>
    <div className={styles.status} data-waiting={awaitingReply} role="status">
      <strong>{checking||refreshing?t('Checking…'):!connected?t('Connection interrupted. Retrying…'):<>{presentation.awaitingTeam&&<Clock3 aria-hidden="true"/>}{liveWait?.phase==='busy'?t(TRANSPORT_COPY.busyStatus):t(transportChat&&presentation.awaitingTeam?TRANSPORT_COPY.waitingStatus:presentation.statusKey)}</>}</strong>
      {liveWait?.phase==='busy'?<span className={styles.connection} aria-live="off">{t(TRANSPORT_COPY.elapsed,{value1:formatTransportElapsed(liveWait.elapsedMs,locale)})}</span>:null}
      <small data-chat-reference={initial.publicRef} style={{gridColumn:1,gridRow:3}}>{initial.publicRef}</small>
      {connected && !checking && !refreshing && presentation.joined ? <span className={styles.connection}><Wifi aria-hidden="true" />{t(presentation.joined.key,presentation.joined.values)}</span> : null}
      {conversation.status !== "closed" ? <button type="button" className={styles.endChat} onClick={() => void changeSession('close')} disabled={busy||checking||refreshing} aria-busy={ending}>{t("End chat")}</button> : null}
      {!connected ? <span>{t("Connection interrupted. Retrying…")}</span> : null}
    </div>
    {liveWait?.phase==='waiting'&&awaitingReply?<p className={styles.waitingHint}>{t(TRANSPORT_COPY.waiting)}</p>:null}
    {liveWait?.phase==='busy'?<p className={styles.waitingHint}>{t(TRANSPORT_COPY.busy)}</p>:null}
    {!transportChat&&awaitingReply ? <p className={styles.waitingHint}>{t("Replies appear here automatically. You can return to this chat in this browser.")}</p> : null}
    {!checking&&!refreshing&&connected&&idle.warning?<p className={styles.waitingHint} role="status">{t('This chat will end soon. Send a message to keep it open.')}</p>:null}
    <div ref={history} className={styles.history} role="log" aria-live="polite" aria-relevant="additions" aria-label={t("Support message history")} tabIndex={0}>
      {conversation.messages.map(item => <article key={item.id} data-sender={item.sender}>
        <strong>{item.sender === "visitor" ? t("You") : item.senderName}</strong>
        <p>{item.body}</p><div className={styles.messageMeta}><time dateTime={new Date(item.createdAt).toISOString()}>{new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12: true }).format(item.createdAt)}</time>{item.sender === "visitor" ? <span data-receipt={item.read?'read':'sent'}><Check aria-hidden="true" />{t(item.read?'Read':'Sent')}</span> : null}</div>
        {item.sender==='staff'?<span data-read-message-id={item.id} aria-hidden="true" style={{display:'block',height:1}}/>:null}
      </article>)}
    </div>
    {conversation.status === "closed" && conversation.resolvedAt == null && (!transportChat||idle.autoEnded) ? <p className={styles.waitingHint}>{t(idle.autoEnded?'This chat ended because we did not hear back. Your messages are saved.':"Our team can still follow up by phone.")}</p> : null}
    {error ? <p className="public-support-error" role="alert">{t(error)}</p> : null}
    {conversation.status !== "closed" ? <form className={styles.composer} onSubmit={send}>
      <label htmlFor="buying-reply">{t("Reply")}</label>
      <textarea id="buying-reply" rows={2} maxLength={4000} value={message} onChange={event => setMessage(event.target.value)} required disabled={busy||checking||refreshing} />
      <button type="submit" disabled={busy || checking || refreshing || !message.trim()}><Send aria-hidden="true" />{busy && !ending ? t("Sending…") : t("Send")}</button>
    </form> : <>
      {idle.autoEnded?<button type="button" className={styles.another} disabled={busy||checking||refreshing} aria-busy={resuming} onClick={()=>void changeSession('resume')}>{t(resuming?'Resuming…':'Resume chat')}</button>:null}
      <button type="button" className={styles.another} data-secondary={idle.autoEnded} disabled={busy||checking||refreshing} onClick={onAnother}>{t("Send another request")}</button>
    </>}
    </>}
  </div>;
}
