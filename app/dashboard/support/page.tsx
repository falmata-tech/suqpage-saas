import { isCallbackRequest } from "@/lib/buying-assistance";
import SupportThreadRefresh from "@/components/SupportThreadRefresh";
import styles from "@/components/TransportSupport.module.css";

import { getUiText } from "@/lib/i18n/server";
import crypto from "node:crypto";
import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { createSupportConversationAction, createVideoRequestAction } from "@/app/support-actions";
import { requireUser } from "@/lib/auth";
import { isQueueAgent } from "@/lib/capabilities";
import { supportWhatsAppUrl } from "@/lib/config";
import { runtimeBusinessById, runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";
import { listSupportConversations } from "@/lib/support";
import { supportInboxHref, supportThreadHref, supportViewState } from "@/lib/support-navigation";
import SupportInboxRedirect from '@/components/SupportInboxRedirect';
import { supportStaffState, supportStaffWorkState } from '@/lib/support-staff-state';
import {clientChatPresentation} from '@/lib/support-client-state';

export const dynamic = "force-dynamic";

export default async function SupportInbox({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; queue?: string; error?: string; saved?: string; video?: string; product?: string; routed?: string; remaining?: string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const scopedAgent = isQueueAgent(user);
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const client = user.access_role === "client";
  const queue = client ? undefined : scopedAgent ? user.staff_queue_scope==='transport'?'transport':'support' : query.queue === "transport" ? "transport" : "support";
  const transport = queue === "transport";
  const status = client ? ["active","waiting","open","closed","history","resolved"].includes(query.status||'')?query.status:undefined : ["active","needs_reply","overdue","waiting_customer","waiting","open","history","resolved"].includes(query.status||"") ? query.status! : query.status==='closed'?'history':'active';
  const activeView=!client&&['active','needs_reply','overdue','waiting_customer'].includes(status||'');
  const result = await listSupportConversations(user, { ...query, queue, status });
  const view = supportViewState({...query, queue, status, page:String(result.page)});
  const videoTarget = client && (query.video === "header" || query.video === "product") ? query.video : null;
  const videoProduct = videoTarget === "product" ? (await runtimeCatalogByBusinessId(user.business_id!,true))?.products.find(item=>item.id===Number(query.product)) : null;
  const emergencyWhatsApp = supportWhatsAppUrl();
  const operations = user.access_role === "operations_manager" || user.access_role === "platform_admin";
  const count = (value: string | undefined) => value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
  const routed = count(query.routed), remaining = count(query.remaining);
  return (
    <DashboardShell user={user} business={business} supportQueue={queue}>
      {scopedAgent && query.queue !== queue ? <SupportInboxRedirect state={view} error={query.error}/> : null}
      <SupportThreadRefresh active />
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">{client ? t("MirtPage support") : t("Chats")}</span>
          <h1>{client ? t("How can we help?") : t(transport ? "Transport" : "Business support")}</h1>
          {client ? <p>{t("Keep questions and replies together with your MirtPage account.")}</p> : null}
        </div>
        {client && emergencyWhatsApp ? <a className="btn secondary" href={emergencyWhatsApp} target="_blank" rel="noreferrer">{t("Emergency WhatsApp")}</a> : operations ? <Link className="small-btn" href="/dashboard/support/agents">{t("Workload & availability")}</Link> : null}
      </div>
      {!client ? <nav className={styles.tabs} aria-label={t("Request status")}>
        {["active", "waiting", "history", "resolved"].map(value => <Link key={value} href={supportInboxHref({...view,status:value,page:undefined})} aria-current={status === value || value==='active'&&(activeView||status==='open') ? "page" : undefined}>{t(value === "active" ? "All active" : value === "history" ? "Chat history" : value === "resolved" ? "Resolved" : "Unassigned")}</Link>)}
      </nav> : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      {query.saved ? <p className="notice">{t("Support conversation updated.")}</p> : null}
      {operations && routed !== null && remaining !== null ? <p className="notice" role="status">{t("Assigned {value1} waiting conversations. Still waiting: {value2}.", {value1:routed,value2:remaining})}</p> : null}
      {videoTarget && (videoTarget === "header" || videoProduct) ? <form className="panel form-grid support-new" action={createVideoRequestAction}>
        <h2 className="full">{t("Request a video")}</h2>
        <p className="full">{videoProduct ? videoProduct.name : t("Business video")}</p>
        <input type="hidden" name="target" value={videoTarget} />
        <input type="hidden" name="productId" value={videoProduct?.id || ""} />
        <input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />
        <div className="field full"><label htmlFor="video-source">{t("Video link")}</label><input id="video-source" name="sourceUrl" type="url" required maxLength={1500} placeholder="https://" /><small>{t("Share a link our team can open to view or download your video.")}</small></div>
        <div className="field full"><label htmlFor="video-note">{t("Message")}{" "}{t("(optional)")}</label><textarea id="video-note" name="note" maxLength={1500} rows={3} /></div>
        <div className="field full"><button className="btn brand">{t("Send video request")}</button></div>
      </form> : client ? (
        <form className="panel form-grid support-new" action={createSupportConversationAction}>
          <h2 className="full">{t("Start a conversation")}</h2>
          <input type="hidden" name="idempotencyKey" value={crypto.randomBytes(16).toString("hex")} />
          <div className="field full">
            <label htmlFor="support-subject">{t("Subject")}</label>
            <input id="support-subject" name="subject" maxLength={120} required placeholder={t("What do you need help with?")} />
          </div>
          <div className="field full">
            <label htmlFor="support-message">{t("Message")}</label>
            <textarea id="support-message" name="message" maxLength={4000} required rows={5} />
          </div>
          <div className="field full">
            <label htmlFor="support-attachment">{t("Attachment")}{" "}<span className="muted">{t("(optional)")}</span></label>
            <input id="support-attachment" name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" />
            <small>{t("One JPEG, PNG, WebP, or PDF up to 5 MB.")}</small>
          </div>
          <div className="field full"><button className="btn brand">{t("Send to MirtPage support")}</button></div>
        </form>
      ) : (
        <CollectionToolbar action="/dashboard/support" hidden={{queue,...(!activeView?{status}:{})}} search={view.q || ""} placeholder={t("Conversation, business, or reference")} activeFilters={activeView?false:Boolean(view.q)}>
          {activeView?<label className={styles.replyFilter}><span>{t('Reply status')}</span><select name="status" defaultValue={status}>{[['active','All active'],['needs_reply','Needs staff reply'],['overdue','Overdue'],['waiting_customer','Waiting for customer']].map(([value,label])=><option value={value} key={value}>{t(label)}</option>)}</select></label>:null}
          {activeView&&view.q?<Link className="small-btn" href={supportInboxHref({...view,q:undefined,page:undefined})}>{t('Clear')}</Link>:null}
        </CollectionToolbar>
      )}
      <section className="support-list" aria-label={t("Support conversations")}>
        {result.items.map((conversation) => {
          const assignment = supportStaffState(conversation);
          const work = supportStaffWorkState(conversation);
          const customer = clientChatPresentation(conversation);
          return (
          <Link className="support-row" href={supportThreadHref(conversation.id, client ? {} : view)} key={conversation.id}>
            <span>
              <small>{conversation.publicRef} · {conversation.businessName}{conversation.participantKind === "visitor" ? t(" · {value1}", { value1: conversation.assistanceCategory === "buying_assistance" ? t("Buying assistance") : conversation.assistanceCategory === "shipment_observation" ? t("Transport") : t("Get help") }) : ""}</small>
              <strong>{conversation.assistanceCategory === "buying_assistance" ? t(conversation.subject) : conversation.subject}</strong>
              {!client&&work.replyKey?<span className={styles.workState} data-support-work><strong>{t(work.replyKey)}</strong>{work.overdue?<b className={styles.overdue}>{t('Overdue')}</b>:null}</span>:null}
              {isCallbackRequest(conversation.assistanceCategory) ? <small className={styles.requestExcerpt}>{conversation.requestSummary}</small> : null}
              {client?customer.joined?<small data-client-join>{t(customer.joined.key,customer.joined.values)}</small>:null:<small data-assignment-state>{t(assignment.key, assignment.values)}</small>}
            </span>
            <span>
              {conversation.unread ? <b className="support-unread">{t("New")}</b> : null}
              <b className={`badge ${conversation.status}`}>{t(client?customer.statusKey:work.terminalKey||conversation.status)}</b>
            </span>
          </Link>
        );})}
        {!result.items.length ? <div className="empty-state">{client ? t("No support conversations yet.") : t("No conversations match this queue.")}</div> : null}
      </section>
      <PaginationNav result={result} pathname="/dashboard/support" params={{ q: view.q, status, queue }} />
    </DashboardShell>
  );
}
