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

export const dynamic = "force-dynamic";

export default async function SupportInbox({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; queue?: string; error?: string; saved?: string; video?: string; product?: string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const scopedAgent = isQueueAgent(user);
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const client = user.access_role === "client";
  const queue = client ? undefined : scopedAgent ? user.staff_queue_scope==='transport'?'transport':'support' : query.queue === "transport" ? "transport" : "support";
  const transport = queue === "transport";
  const status = client ? query.status : transport ? (["active", "history", "resolved"].includes(query.status || "") ? query.status! : query.status === "closed" ? "history" : "active") : (["active","waiting","open","closed"].includes(query.status||"") ? query.status! : "active");
  const result = await listSupportConversations(user, { ...query, queue, status });
  const view = supportViewState({...query, queue, status, page:String(result.page)});
  const videoTarget = client && (query.video === "header" || query.video === "product") ? query.video : null;
  const videoProduct = videoTarget === "product" ? (await runtimeCatalogByBusinessId(user.business_id!,true))?.products.find(item=>item.id===Number(query.product)) : null;
  const emergencyWhatsApp = supportWhatsAppUrl();
  const operations = user.access_role === "operations_manager" || user.access_role === "platform_admin";
  return (
    <DashboardShell user={user} business={business} supportQueue={queue}>
      {scopedAgent && query.queue !== queue ? <SupportInboxRedirect state={view} error={query.error}/> : null}
      <SupportThreadRefresh active />
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">{client ? t("Suqpage support") : t("Chats")}</span>
          <h1>{client ? t("How can we help?") : t(transport ? "Transport" : "Business support")}</h1>
          {client ? <p>{t("Keep questions and replies together with your Suqpage account.")}</p> : null}
        </div>
        {client && emergencyWhatsApp ? <a className="btn secondary" href={emergencyWhatsApp} target="_blank" rel="noreferrer">{t("Emergency WhatsApp")}</a> : operations ? <Link className="small-btn" href="/dashboard/support/agents">{t("Workload & availability")}</Link> : null}
      </div>
      {!client ? <nav className={styles.tabs} aria-label={t("Request status")}>
        {(transport ? ["active", "history", "resolved"] : ["active", "waiting", "closed"]).map(value => <Link key={value} href={supportInboxHref({...view,status:value,page:undefined})} aria-current={status === value ? "page" : undefined}>{t(value === "active" ? "Active" : value === "history" ? "Chat history" : value === "resolved" ? "Resolved" : value === "waiting" ? "Waiting" : "Closed")}</Link>)}
      </nav> : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      {query.saved ? <p className="notice">{t("Support conversation updated.")}</p> : null}
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
          <div className="field full"><button className="btn brand">{t("Send to Suqpage support")}</button></div>
        </form>
      ) : (
        <CollectionToolbar action="/dashboard/support" hidden={{queue, status}} search={view.q || ""} placeholder={t("Conversation, business, or reference")} activeFilters={Boolean(view.q)} />
      )}
      <section className="support-list" aria-label={t("Support conversations")}>
        {result.items.map((conversation) => (
          <Link className="support-row" href={supportThreadHref(conversation.id, client ? {} : view)} key={conversation.id}>
            <span>
              <small>{conversation.publicRef} · {conversation.businessName}{conversation.participantKind === "visitor" ? t(" · {value1}", { value1: conversation.assistanceCategory === "buying_assistance" ? t("Buying assistance") : conversation.assistanceCategory === "shipment_observation" ? t("Transport") : t("Get help") }) : ""}</small>
              <strong>{conversation.assistanceCategory === "buying_assistance" ? t(conversation.subject) : conversation.subject}</strong>
              {isCallbackRequest(conversation.assistanceCategory) ? <small className={styles.requestExcerpt}>{conversation.requestSummary}</small> : null}
              {transport && conversation.assistanceCategory === "shipment_observation" ? <small>{conversation.transportCompany ? `${t("Transport company")}: ${conversation.transportCompany}` : t("No company selected")}</small> : null}
              <small>{conversation.assignedUserName ? t("Assigned to {value1}", { value1: conversation.assignedUserName }) : t("Waiting for a team member")}</small>
            </span>
            <span>
              {conversation.unread ? <b className="support-unread">{t("New")}</b> : null}
              <b className={`badge ${conversation.status}`}>{t(isCallbackRequest(conversation.assistanceCategory) && conversation.status === "closed" ? conversation.resolvedAt ? "Resolved" : "Chat ended" : conversation.status)}</b>
            </span>
          </Link>
        ))}
        {!result.items.length ? <div className="empty-state">{client ? t("No support conversations yet.") : t("No conversations match this queue.")}</div> : null}
      </section>
      <PaginationNav result={result} pathname="/dashboard/support" params={{ q: view.q, status, queue }} />
    </DashboardShell>
  );
}
