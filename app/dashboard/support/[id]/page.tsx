import { getVideoRequest } from "@/lib/support-video-requests";
import styles from "@/components/TransportSupport.module.css";
import { isCallbackRequest } from "@/lib/buying-assistance";
import TransportHandoffForm from "@/components/TransportHandoffForm";

import { getUiText } from "@/lib/i18n/server";
import crypto from "node:crypto";
import Link from "next/link";
import {
  reviewVideoRequestAction,
  claimSupportConversationAction,
  closeSupportConversationAction,
  postSupportMessageAction,
  reassignSupportConversationAction,
  reopenSupportConversationAction,
} from "@/app/support-actions";
import DashboardShell from "@/components/DashboardShell";
import SupportThreadRefresh from "@/components/SupportThreadRefresh";
import ChatReadObserver from '@/components/ChatReadObserver';
import SupportNavigationFields from '@/components/SupportNavigationFields';
import {supportInboxHref,supportViewState} from '@/lib/support-navigation';
import {isQueueAgent} from '@/lib/capabilities';
import {ArrowLeft} from 'lucide-react';
import SupportInboxRedirect from '@/components/SupportInboxRedirect';
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { getSupportConversation, getTransportHandoff, getSupportAssignmentHistory, listSupportAgentWorkloads, SupportError } from "@/lib/support";

export const dynamic = "force-dynamic";

function dateTime(value: number) {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

function fileSize(value: number) {
  return value >= 1024 * 1024 ? `${(value / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(value / 1024))} KB`;
}

export default async function SupportThread({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; sent?: string; claimed?: string; closed?: string; reopened?: string; routed?: string; assigned?: string; queue?:string; status?:string; q?:string; page?:string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  const id = Number((await params).id);
  const query = await searchParams;
  const data = Number.isSafeInteger(id) && id > 0 ? await getSupportConversation(user, id).catch(error => {
    if (error instanceof SupportError && error.code === "not_found") return null;
    throw error;
  }) : null;
  if (!data) {
    const view=supportViewState(query,{forcedQueue:isQueueAgent(user)?(user.staff_queue_scope==='transport'?'transport':'support'):undefined,fallbackQueue:user.access_role==='client'?undefined:'support'});
    const business=user.business_id?(await runtimeBusinessById(user.business_id))||null:null;
    return <DashboardShell user={user} business={business} supportQueue={view.queue}>
      <div className="dashboard-head"><h1>{t("This conversation is unavailable.")}</h1></div>
      <SupportInboxRedirect state={view} error="This conversation is unavailable." fallback/>
    </DashboardShell>;
  }
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const client = user.access_role === "client";
  const operations = user.access_role === "operations_manager" || user.access_role === "platform_admin";
  const buying = isCallbackRequest(data.conversation.assistanceCategory);
  const privateNotes = data.conversation.participantKind === "visitor" && !buying;
  const callback = isCallbackRequest(data.conversation.assistanceCategory);
  const transport = data.conversation.assistanceCategory === "shipment_observation";
  const canManage = operations || data.conversation.assignedUserId === user.id;
  const videoRequest = await getVideoRequest(user,id);
  const history = !client ? await getSupportAssignmentHistory(user, id) : [];
  const handoff = canManage && transport ? await getTransportHandoff(user, id) : null;
  const agents = operations ? (await listSupportAgentWorkloads(user)).filter((agent) => agent.enabled && (agent.queueScope === "all" || agent.queueScope === (callback ? "transport" : "support"))) : [];
  const inboxStatus = data.conversation.status === "closed" ? data.conversation.resolvedAt ? "resolved" : "history" : "active";
  const view = client ? {} : supportViewState(query,{
    forcedQueue:isQueueAgent(user)?(user.staff_queue_scope==='transport'?'transport':'support'):undefined,
    fallbackQueue:callback?'transport':'support',
    fallbackStatus:callback?inboxStatus:data.conversation.status==='closed'?'closed':'active',
  });
  const inboxHref=supportInboxHref(view);
  const canNote = buying && canManage && data.conversation.status === "closed";
  const canReply = data.conversation.status === "open"
    ? client || data.conversation.assignedUserId === user.id || user.access_role === "operations_manager" || user.access_role === "platform_admin"
    : data.conversation.status === "waiting" && client;
  return (
    <DashboardShell user={user} business={business} supportQueue={client?undefined:callback?'transport':'support'}>
      <SupportThreadRefresh active={data.conversation.status !== "closed"} />
      {!client ? <nav className="workspace-breadcrumbs" aria-label={t("Breadcrumb")}><Link href={inboxHref}>{t(callback?"Transport":"Business support")}</Link><span aria-hidden="true">/</span><strong aria-current="page">{data.conversation.publicRef}</strong></nav> : null}
      <div className="support-thread-head">
        <div>
          <Link href={inboxHref} className="support-back-link"><ArrowLeft aria-hidden="true" size={17}/>{t("Back to inbox")}</Link>
          <span className="eyebrow">{data.conversation.publicRef}</span>
          <h1>{data.conversation.assistanceCategory === "buying_assistance" ? t(data.conversation.subject) : data.conversation.subject}</h1>
          {!client ? <p>{data.conversation.assignedUserName ? t("Assigned to {value1}", {value1:data.conversation.assignedUserName}) : t("Waiting for a team member")}</p> : null}
          <p>{data.conversation.businessName}{data.conversation.participantKind === "visitor" ? t(" · {value1}", { value1: transport ? t("Transport") : callback ? t("Buying assistance") : t("Get help") }) : ""} · <span className={`badge ${data.conversation.status}`}>{t(buying && data.conversation.status === "closed" ? data.conversation.resolvedAt ? "Resolved" : "Chat ended" : data.conversation.status)}</span></p>
        </div>
        <div className="support-thread-actions">
          {!client && data.conversation.status === "waiting" ? (
            <form action={claimSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn brand">{t("Claim conversation")}</button></form>
          ) : null}
          {buying && canManage && !data.conversation.resolvedAt ? <form action={closeSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn secondary">{t("Mark resolved")}</button></form> : null}
          {!buying && data.conversation.status !== "closed" && (client || canManage) ? (
            <form action={closeSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn secondary">{t("Close")}</button></form>
          ) : data.conversation.status === "closed" && (client || canManage) ? (
            <form action={reopenSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn brand">{t("Reopen")}</button></form>
          ) : null}
          {operations && data.conversation.status !== "closed" ? (
            <form action={reassignSupportConversationAction} className="support-reassign">
              <SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} />
              <select name="assignedUserId" aria-label={t("Assign support agent")} defaultValue={data.conversation.assignedUserId || ""}>
                <option value="">{t("Waiting queue")}</option>
                {agents.map((agent) => <option key={agent.userId} value={agent.userId}>{agent.name} ({agent.openConversations}/{agent.maxOpenConversations})</option>)}
              </select>
              <button className="small-btn">{t("Assign")}</button>
            </form>
          ) : null}
        </div>
      </div>
      {!client && data.conversation.participantKind === "visitor" ? (
        <section className="panel support-visitor-contact" aria-labelledby="visitor-contact-title">
          <div><span className="eyebrow">{t(buying ? "Request summary" : "Reconnect details")}</span><h2 id="visitor-contact-title">{buying ? data.conversation.requesterLabel : t("Visitor contact")}</h2>{buying ? <p className={styles.requestDetails}>{data.conversation.requestSummary}</p> : <p>{t("Use these details only to continue this support conversation.")}</p>}</div>
          <div>
            {data.conversation.visitorEmail ? <a href={`mailto:${data.conversation.visitorEmail}`}>{data.conversation.visitorEmail}</a> : callback ? null : <span>{t("Email unavailable for this older conversation")}</span>}
            {data.conversation.visitorPhone ? <a href={`tel:${data.conversation.visitorPhone}`}>{data.conversation.visitorPhone}</a> : <span>{t("Phone unavailable for this older conversation")}</span>}
          </div>
        </section>
      ) : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      {videoRequest ? <section className="panel form-grid">
        <h2 className="full">{t("Video request")}</h2>
        <p className="full">{videoRequest.target_kind === "header" ? t("Business video") : videoRequest.target_label} · {t(videoRequest.status === "pending" ? "Awaiting review" : videoRequest.status === "approved" ? "Approved" : "Declined")}</p>
        <a className="full" href={videoRequest.source_url} target="_blank" rel="noreferrer">{t("Open submitted video")}</a>
        {!client && canManage && videoRequest.status === "pending" && data.conversation.status === "open" ? <form className="full form-grid" action={reviewVideoRequestAction}>
          <SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} />
          <div className="field full"><label htmlFor="approved-video">{t(videoRequest.target_kind === "product" ? "Video link" : "YouTube link")}</label><input id="approved-video" name="videoUrl" type="url" maxLength={500} /></div>
          <div className="field full"><label htmlFor="video-review-reply">{t("Reply to owner")}</label><textarea id="video-review-reply" name="reply" required maxLength={1500} rows={3} /></div>
          <div className="full support-thread-actions"><button className="btn brand" name="decision" value="approved">{t("Approve video")}</button><button className="btn secondary" name="decision" value="declined">{t("Decline")}</button></div>
        </form> : null}
      </section> : null}
      {canManage && transport ? <TransportHandoffForm key={handoff?.id || 0} conversationId={id} navigation={view} handoff={handoff} closed={data.conversation.status === "closed"} saved={Boolean(query.routed)} summary={[
        data.conversation.publicRef, data.conversation.requesterLabel, data.conversation.visitorPhone,
        data.conversation.requestSummary || data.messages[0]?.body,
      ].filter(Boolean).join("\n")} /> : null}
      {!client && history.length ? <details className="panel support-assignment-history"><summary>{t("Assignment history")}</summary><ol>
        {history.map(item => <li key={item.id}><strong>{item.agent_name}</strong> · <time dateTime={new Date(item.assigned_at).toISOString()}>{dateTime(item.assigned_at)}</time><small>{item.assigned_by ? t("Assigned by {name}", {name:item.assigned_by}) : t("Automatic assignment")}{item.released_at ? ` · ${t("Released")} ${dateTime(item.released_at)}` : ""}</small></li>)}
      </ol></details> : null}
      {query.assigned ? <p className="notice">{t("Support conversation updated.")}</p> : null}
      {query.sent ? <p className="notice">{privateNotes || query.sent === "note" ? t("Note saved") : t("Reply sent.")}</p> : null}
      <section className="support-thread" aria-label={privateNotes ? t("Request notes") : t("Support message history")} tabIndex={0}>
        {data.messages.map((message) => (
          <article className={`support-message ${message.senderRole === "client" || message.senderRole === "visitor" ? "client" : "staff"}`} key={message.id}>
            <header><strong>{message.senderName}</strong><time dateTime={new Date(message.createdAt).toISOString()}>{dateTime(message.createdAt)}</time></header>
            {buying && message.senderRole !== "visitor" ? <small>{message.visitorVisible ? t("Reply") : t("Internal note")}</small> : null}
            <p>{message.body}</p>
            {message.attachment ? message.attachment.mimeType.startsWith("image/")
              ? <a className="support-message-attachment image" href={`/api/support/${id}/attachments/${message.attachment.id}`} target="_blank" rel="noreferrer"><img src={`/api/support/${id}/attachments/${message.attachment.id}`} alt={message.attachment.originalName} loading="lazy" /><span>{message.attachment.originalName} · {fileSize(message.attachment.byteSize)}</span></a>
              : <a className="support-message-attachment file" href={`/api/support/${id}/attachments/${message.attachment.id}`}><strong>{message.attachment.originalName}</strong><small>{t("PDF ·")}{" "}{fileSize(message.attachment.byteSize)}</small></a>
              : null}
            {message.senderUserId===user.id && (!buying || message.visitorVisible) ? <small data-receipt={message.read?'read':'sent'}>{t(message.read?'Read':'Sent')}</small> : null}
            {(client ? message.senderRole!=='client' : message.senderRole==='client'||message.senderRole==='visitor') ? <span data-read-message-id={message.id} aria-hidden="true" style={{display:'block',height:1}}/> : null}
          </article>
        ))}
      </section>
      <ChatReadObserver conversationId={id} canRead={client||data.conversation.assignedUserId===user.id}/>
      {canReply || canNote ? (
        <form className="panel support-reply" action={postSupportMessageAction}>
          <SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} />
          <input type="hidden" name="idempotencyKey" value={crypto.randomBytes(16).toString("hex")} />
          {canNote ? <input type="hidden" name="audience" value="note" /> : buying ? <label className={styles.replyAudience}>{t("Message type")}<select name="audience" defaultValue="reply"><option value="reply">{t("Reply")}</option><option value="note">{t("Internal note")}</option></select></label> : null}
          <label htmlFor="support-reply">{canNote ? t("Internal note") : buying ? t("Message") : privateNotes ? t("Internal note") : t("Reply")}</label>
          <textarea id="support-reply" name="message" maxLength={4000} required rows={4} />
          {!buying ? <><label htmlFor="support-reply-attachment">{t("Attachment")}{" "}<span className="muted">{t("(optional)")}</span></label>
          <input id="support-reply-attachment" name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" />
          <small>{t("One JPEG, PNG, WebP, or PDF up to 5 MB.")}</small></> : null}
          <button className="btn brand">{canNote ? t("Add note") : buying ? t("Send") : privateNotes ? t("Add note") : t("Send reply")}</button>
        </form>
      ) : data.conversation.status === "waiting" && !client ? (
        <p className="notice">{privateNotes ? t("Claim this request to add notes.") : t("Claim this conversation before replying.")}</p>
      ) : null}
    </DashboardShell>
  );
}
