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
import { supportWhatsAppUrl } from "@/lib/config";
import { runtimeBusinessById, runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";
import { listSupportConversations } from "@/lib/support";

export const dynamic = "force-dynamic";

export default async function SupportInbox({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; queue?: string; error?: string; saved?: string; video?: string; product?: string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const transport = query.queue === "transport";
  const help = query.queue === "support";
  const client = user.access_role === "client";
  const status = transport && !client ? (["active", "history", "resolved"].includes(query.status || "") ? query.status! : query.status === "closed" ? "history" : "active") : query.status;
  const result = await listSupportConversations(user, { ...query, status });
  const videoTarget = client && (query.video === "header" || query.video === "product") ? query.video : null;
  const videoProduct = videoTarget === "product" ? (await runtimeCatalogByBusinessId(user.business_id!,true))?.products.find(item=>item.id===Number(query.product)) : null;
  const emergencyWhatsApp = supportWhatsAppUrl();
  const operations = user.access_role === "operations_manager" || user.access_role === "platform_admin";
  return (
    <DashboardShell user={user} business={business}>
      <SupportThreadRefresh active />
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">{client ? t("Suqpage support") : t("Customer support")}</span>
          <h1>{client ? t("How can we help?") : (transport ? t("Buying assistance") : t("Support inbox"))}</h1>
          {client ? <p>{t("Keep questions and replies together with your Suqpage account.")}</p> : null}
        </div>
        {client && emergencyWhatsApp ? <a className="btn secondary" href={emergencyWhatsApp} target="_blank" rel="noreferrer">{t("Emergency WhatsApp")}</a> : operations ? <Link className="small-btn" href="/dashboard/support/agents">{t("Manage support agents")}</Link> : null}
      </div>
      {!client ? <nav className={styles.tabs} aria-label={t("Support queues")}>
        <Link href="/dashboard/support" aria-current={!transport && !help ? "page" : undefined}>{t("All support")}</Link>
        <Link href="/dashboard/support?queue=support" aria-current={help ? "page" : undefined}>{t("Business support")}</Link>
        <Link href="/dashboard/support?queue=transport" aria-current={transport ? "page" : undefined}>{t("Buying assistance")}</Link>
      </nav> : null}
      {transport && !client ? <nav className={styles.tabs} aria-label={t("Request status")}>
        {(["active", "history", "resolved"] as const).map(value => <Link key={value} href={`/dashboard/support?${new URLSearchParams({queue:"transport", status:value, ...(query.q ? {q:query.q} : {})})}`} aria-current={status === value ? "page" : undefined}>{t(value === "active" ? "Active" : value === "history" ? "Chat history" : "Resolved")}</Link>)}
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
        <form className="panel form-grid support-new" action={createSupportConversationAction} encType="multipart/form-data">
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
        <CollectionToolbar action="/dashboard/support" hidden={{queue: transport ? "transport" : help ? "support" : undefined, status: transport ? status : undefined}} search={query.q || ""} placeholder={t("Conversation, business, or reference")}>
          {!transport ? <label><span>{t("Status")}</span><select name="status" defaultValue={query.status || ""}><option value="">{t("All statuses")}</option><option value="waiting">{t("Waiting")}</option><option value="open">{t("Open")}</option><option value="closed">{t("Closed")}</option></select></label> : null}
        </CollectionToolbar>
      )}
      <section className="support-list" aria-label={t("Support conversations")}>
        {result.items.map((conversation) => (
          <Link className="support-row" href={`/dashboard/support/${conversation.id}`} key={conversation.id}>
            <span>
              <small>{conversation.publicRef} · {conversation.businessName}{conversation.participantKind === "visitor" ? t(" · {value1}", { value1: conversation.assistanceCategory === "buying_assistance" ? t("Buying assistance") : conversation.assistanceCategory === "shipment_observation" ? t("Transport") : t("Get help") }) : ""}</small>
              <strong>{conversation.assistanceCategory === "buying_assistance" ? t(conversation.subject) : conversation.subject}</strong>
              {conversation.assistanceCategory === "buying_assistance" ? <small className={styles.requestExcerpt}>{conversation.requestSummary}</small> : null}
              {transport && conversation.assistanceCategory === "shipment_observation" ? <small>{conversation.transportCompany ? `${t("Transport company")}: ${conversation.transportCompany}` : t("No company selected")}</small> : null}
              <small>{conversation.assignedUserName ? t("Assigned to {value1}", { value1: conversation.assignedUserName }) : t("Waiting for a team member")}</small>
            </span>
            <span>
              {conversation.unread ? <b className="support-unread">{t("New")}</b> : null}
              <b className={`badge ${conversation.status}`}>{t(conversation.assistanceCategory === "buying_assistance" && conversation.status === "closed" ? conversation.resolvedAt ? "Resolved" : "Chat ended" : conversation.status)}</b>
            </span>
          </Link>
        ))}
        {!result.items.length ? <div className="empty-state">{client ? t("No support conversations yet.") : t("No conversations match this queue.")}</div> : null}
      </section>
      <PaginationNav result={result} pathname="/dashboard/support" params={{ q: query.q, status, queue: query.queue }} />
    </DashboardShell>
  );
}
