"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useUiText } from "@/lib/i18n/ui";
import type { OwnerTransportState } from "@/lib/owner-transport-contract";
import {TRANSPORT_COORDINATOR} from '@/lib/transport-coordinator';
import {rememberTransportDraft,takeTransportDraft,clearTransportDraft} from "@/lib/tracking-navigation";
import BuyingConversation from "./BuyingConversation";
import TransportIntake, { type TransportDraft } from "./TransportIntake";
import TransportChatCredit from "./TransportChatCredit";
import transportStyles from "./TransportSupport.module.css";
import styles from "./OwnerTransportWorkspace.module.css";

export default function OwnerTransportWorkspace({ initial, draftScope="" }: { initial: OwnerTransportState;draftScope?:string }) {
  const t = useUiText();
  const router = useRouter();
  const [conversation, setConversation] = useState(initial.conversation);
  const draftKey="owner-transport:"+draftScope;
  const trackingHref="/tracking?return="+encodeURIComponent("/dashboard/transport"+(conversation?"?conversation="+conversation.id:"?new=1"));
  const [draft, setDraft] = useState<TransportDraft>(()=>({ ...initial.defaults, origin: "", destination: "", message: "",coordinatorId:null,...takeTransportDraft<TransportDraft>(draftKey) }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const live = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const attempt = useRef<{ draft: string; key: string } | null>(null);
  useEffect(() => { live.current = true; return () => { live.current = false; controller.current?.abort(); }; }, []);

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!live.current || busyRef.current || conversation || draft.coordinatorId!==TRANSPORT_COORDINATOR.id || !draft.name.trim() || !draft.phone.trim() || !draft.origin.trim() || !draft.destination.trim()) return;
    busyRef.current = true;
    setBusy(true); setError("");
    const signature = JSON.stringify(draft);
    if (!attempt.current || attempt.current.draft !== signature) attempt.current = { draft: signature, key: crypto.randomUUID() };
    const current = new AbortController(); controller.current = current;
    try {
      const response = await fetch("/api/owner-transport", { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.any([current.signal, AbortSignal.timeout(15_000)]), body: JSON.stringify({ action: "start", ...draft, idempotencyKey: attempt.current.key }) });
      const payload = await response.json() as Partial<OwnerTransportState> & { error?: string };
      if (!live.current) return;
      if (!response.ok || !payload.conversation || !Number.isSafeInteger(payload.conversation.id) || payload.conversation.id < 1) throw new Error(payload.error || "Message could not be sent.");
      clearTransportDraft(draftKey);setConversation(payload.conversation); attempt.current = null;
      router.replace(`/dashboard/transport?conversation=${payload.conversation.id}`,{scroll:false});
    } catch (caught) {
      if (live.current) setError(caught instanceof Error && !["TimeoutError", "AbortError", "TypeError"].includes(caught.name) ? caught.message : "Message could not be sent.");
    } finally { busyRef.current = false; if (live.current) setBusy(false); }
  }

  return <>
    <div className="dashboard-head"><div><h1>{t("Transport chat")}</h1><Link href="/dashboard/profile">{t("Back to account")}</Link></div><div className={styles.actions}><Link className="small-btn" href={trackingHref} onClick={()=>rememberTransportDraft(draftKey,draft)}>{t("Shipment records")}</Link><Link className="small-btn" href="/dashboard/transport/history">{t("Chat history")}</Link>{conversation && <Link className="small-btn" href="/dashboard/transport?new=1">{t("Send another request")}</Link>}</div></div>
    <section className={`${transportStyles.dialog} ${styles.panel}`} aria-label={t("Transport chat")} data-owner-transport-id={conversation?.id}>
      <div className={styles.eyebrow}><MessageCircle size={16} aria-hidden="true" />{t("Live Chat")}</div>
      {conversation ? <BuyingConversation key={conversation.publicRef} initial={conversation} draftScope={draftScope} active endpoint={`/api/owner-transport?conversation=${conversation.id}`} conversationId={conversation.id} showAlerts={false} onAnother={() => router.push("/dashboard/transport?new=1")} />
        : <TransportIntake owner draft={draft} onChange={(field, value) => setDraft(previous => ({ ...previous, [field]: value }))} onSelectCoordinator={coordinatorId=>setDraft(previous=>({...previous,coordinatorId}))} onSubmit={start} busy={busy} ready error={error} />}
      <TransportChatCredit/>
    </section>
  </>;
}
