import { getVideoRequest } from "@/lib/support-video-requests";
import styles from "@/components/TransportSupport.module.css";
import { isCallbackRequest } from "@/lib/buying-assistance";

import { getUiText } from "@/lib/i18n/server";
import crypto from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  reviewVideoRequestAction,
  claimSupportConversationAction,
  closeSupportConversationAction,
  postSupportMessageAction,
  reassignSupportConversationAction,
  reopenSupportConversationAction,
  joinSupportConversationAction,
} from "@/app/support-actions";
import DashboardShell from "@/components/DashboardShell";
import SupportThreadRefresh from "@/components/SupportThreadRefresh";
import SupportAssignmentPicker from "@/components/SupportAssignmentPicker";
import ChatReadObserver from '@/components/ChatReadObserver';
import SupportNavigationFields from '@/components/SupportNavigationFields';
import {supportInboxHref,supportThreadHref,supportViewState,supportAssignmentHistoryHref} from '@/lib/support-navigation';
import {isQueueAgent} from '@/lib/capabilities';
import {ArrowLeft} from 'lucide-react';
import SupportInboxRedirect from '@/components/SupportInboxRedirect';
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { getSupportConversation, getSupportIdleEndEvidence, listSupportAgentWorkloads, SupportError } from "@/lib/support";
import {supportIdlePresentation} from '@/lib/support-idle-contract';
import {supportStaffState} from '@/lib/support-staff-state';
import {supportStaffWorkState} from '@/lib/support-staff-state';
import {clientChatPresentation} from '@/lib/support-client-state';
import SupportJoinButton from '@/components/SupportJoinButton';

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
  searchParams: Promise<{ error?: string; sent?: string; claimed?: string; closed?: string; reopened?: string; routed?: string; assigned?: string; queue?:string; status?:string; q?:string; page?:string; panel?:string }>;
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
  if (user.access_role === "client" && data.conversation.assistanceCategory === "shipment_observation") redirect(`/dashboard/transport?conversation=${id}`);
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const client = user.access_role === "client";
  const idleEndEvidence = client ? null : await getSupportIdleEndEvidence(user, id);
  const idle=supportIdlePresentation(data.conversation,Date.now());
  const assignment=supportStaffState(data.conversation);
  const work=supportStaffWorkState(data.conversation);
  const customer=clientChatPresentation(data.conversation);
  const operations = user.access_role === "operations_manager" || user.access_role === "platform_admin";
  const buying = isCallbackRequest(data.conversation.assistanceCategory);
  const privateNotes = data.conversation.participantKind === "visitor" && !buying;
  const callback = isCallbackRequest(data.conversation.assistanceCategory);
  const transport = data.conversation.assistanceCategory === "shipment_observation";
  const canManage = operations || data.conversation.assignedUserId === user.id;
  const videoRequest = await getVideoRequest(user,id);
  const agents = operations ? (await listSupportAgentWorkloads(user)).filter((agent) => agent.enabled && (agent.queueScope === "all" || agent.queueScope === (callback ? "transport" : "support"))) : [];
  const inboxStatus = data.conversation.status === "closed" ? data.conversation.resolvedAt ? "resolved" : "history" : "active";
  const view = client ? {} : supportViewState(query,{
    forcedQueue:isQueueAgent(user)?(user.staff_queue_scope==='transport'?'transport':'support'):undefined,
    fallbackQueue:callback?'transport':'support',
    fallbackStatus:inboxStatus,
  });
  const inboxHref=supportInboxHref(view);
  const detailsOnly=!client&&view.panel==='details';
  const assignedStaff=!client&&data.conversation.assignedUserId===user.id;
  const canJoin=assignedStaff&&data.conversation.status==='open'&&!data.conversation.agentJoined;
  const canPublicReply=assignedStaff&&data.conversation.status==='open'&&data.conversation.agentJoined&&!privateNotes;
  const canNote=!client&&canManage&&(buying&&(data.conversation.status==='open'||data.conversation.status==='closed')||privateNotes&&data.conversation.status==='open');
  const noteOnly=canNote&&!canPublicReply;
  const canReply=client&&(data.conversation.status==='open'||data.conversation.status==='waiting')||canPublicReply;
  return (
    <DashboardShell user={user} business={business} supportQueue={client?undefined:callback?'transport':'support'}>
      <SupportThreadRefresh active closed={data.conversation.status === "closed"} />
      <div className={!client?styles.staffWorkspace:undefined} data-staff-conversation={!client||undefined}>
      {!client?<header className={styles.threadHeader} data-staff-chat-header>
        <div className={styles.threadHeading}>
          <Link href={inboxHref} className={styles.inboxReturn} aria-label={t('Back to inbox')}><ArrowLeft aria-hidden="true" size={20}/></Link>
          <div className={styles.threadIdentity}>
            <p>{t(callback?'Transport':'Business support')} · <span>{data.conversation.publicRef}</span></p>
            <h1 title={data.conversation.subject}>{data.conversation.assistanceCategory==='buying_assistance'?t(data.conversation.subject):data.conversation.subject}</h1>
          </div>
          <Link className={detailsOnly?styles.backToChat:styles.detailsLink} href={supportThreadHref(id,{...view,panel:detailsOnly?undefined:'details'})}>{t(detailsOnly?'Back to conversation':'Details')}</Link>
        </div>
        <div className={styles.threadMeta}>
          {work.replyKey?<span className={styles.workState} data-support-work><strong>{t(work.replyKey)}</strong>{work.overdue?<b className={styles.overdue}>{t('Overdue')}</b>:null}</span>:null}
          <span data-assignment-state>{t(assignment.key,assignment.values)}</span>
          {idle.autoEnded?<small>{t('Automatically ended after no reply.')}</small>:null}
        </div>
      </header>:<>
      <div className="support-thread-head">
        <div>
          <Link href={inboxHref} className="support-back-link"><ArrowLeft aria-hidden="true" size={17}/>{t("Back to inbox")}</Link>
          <span className="eyebrow">{data.conversation.publicRef}</span>
          <h1>{data.conversation.assistanceCategory === "buying_assistance" ? t(data.conversation.subject) : data.conversation.subject}</h1>
          {!client&&work.replyKey?<div className={styles.workState} data-support-work><strong>{t(work.replyKey)}</strong>{work.overdue?<b className={styles.overdue}>{t('Overdue')}</b>:null}</div>:null}
          {!client&&work.dueAt!==null?<small className={styles.replyDue}><time dateTime={new Date(work.dueAt).toISOString()}>{t('Reply due {value1}',{value1:dateTime(work.dueAt)})}</time></small>:null}
          {!client ? <p data-assignment-state>{t(assignment.key,assignment.values)}</p> : null}
          {client&&customer.joined?<p data-client-join>{t(customer.joined.key,customer.joined.values)}</p>:null}
          <p>{data.conversation.businessName}{data.conversation.participantKind === "visitor" ? t(" · {value1}", { value1: transport ? t("Transport") : callback ? t("Buying assistance") : t("Get help") }) : ""} · <span className={`badge ${data.conversation.status}`}>{t(client?customer.statusKey:work.terminalKey||data.conversation.status)}</span></p>
          {client&&idle.warning?<p role="status">{t('This chat will end soon. Send a message to keep it open.')}</p>:null}
          {idle.autoEnded?<p>{t(client?'This chat ended because we did not hear back. Your messages are saved.':'Automatically ended after no reply.')}</p>:null}
        </div>
      </div>
      </>}
      {query.error||query.assigned||query.sent?<div className={styles.threadNotices}>
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      {query.assigned ? <p className="notice">{t("Support conversation updated.")}</p> : null}
      {query.sent ? <p className="notice">{privateNotes || query.sent === "note" ? t("Note saved") : t("Reply sent.")}</p> : null}
      </div>:null}
      <div className={`${styles.conversationWorkspace} ${!client?styles.staffConversation:''}`} data-details-view={detailsOnly||undefined}>
        <div className={styles.conversationMain} hidden={detailsOnly}>
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
      <ChatReadObserver conversationId={id} canRead={!detailsOnly&&(client||data.conversation.assignedUserId===user.id)} receiptEpoch={data.conversation.readEpoch}/>
      {canJoin?<section className={`panel ${styles.joinPrompt}`}><p>{t('Join this chat before sending a reply.')}</p><form action={joinSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id}/><input type="hidden" name="publicRef" value={data.conversation.publicRef}/><input type="hidden" name="assignmentEpoch" value={data.conversation.readEpoch||''}/><SupportJoinButton/></form></section>:null}
      {canReply || canNote ? (
        <form className="panel support-reply" action={postSupportMessageAction}>
          <SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} />
          <input type="hidden" name="idempotencyKey" value={crypto.randomBytes(16).toString("hex")} />
          {noteOnly ? <input type="hidden" name="audience" value="note" /> : buying ? <label className={styles.replyAudience}>{t("Message type")}<select name="audience" defaultValue="reply"><option value="reply">{t("Reply")}</option><option value="note">{t("Internal note")}</option></select></label> : null}
          <label htmlFor="support-reply">{noteOnly ? t("Internal note") : buying ? t("Message") : privateNotes ? t("Internal note") : t("Reply")}</label>
          <textarea id="support-reply" name="message" maxLength={4000} required rows={client?4:3} />
          {!buying ? <><label htmlFor="support-reply-attachment">{t("Attachment")}{" "}<span className="muted">{t("(optional)")}</span></label>
          <input id="support-reply-attachment" name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" />
          <small>{t("One JPEG, PNG, WebP, or PDF up to 5 MB.")}</small></> : null}
          <button className="btn brand">{noteOnly ? t("Add note") : buying ? t("Send") : privateNotes ? t("Add note") : t("Send reply")}</button>
        </form>
      ) : data.conversation.status === "waiting" && !client ? (
        <p className="notice">{privateNotes ? t("Claim this request to add notes.") : t("Claim this conversation before replying.")}</p>
      ) : null}
        </div>
        <aside className={styles.conversationContext}>
          <section className={`panel ${styles.conversationManagement}`} aria-label={t("Manage")}>
            <h2>{t("Manage")}</h2>
            <p>{data.conversation.businessName}</p>
            {!client&&work.dueAt!==null?<small className={styles.replyDue}><time dateTime={new Date(work.dueAt).toISOString()}>{t('Reply due {value1}',{value1:dateTime(work.dueAt)})}</time></small>:null}
<div className="support-thread-actions">
          {!client && data.conversation.status === "waiting" ? (
            <form action={claimSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn brand">{t("Claim conversation")}</button></form>
          ) : null}
          {!client && canManage && !data.conversation.resolvedAt ? <form action={closeSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn secondary">{t("Mark resolved")}</button></form> : null}
          {client && data.conversation.status !== "closed" ? (
            <form action={closeSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn secondary">{t("End chat")}</button></form>
          ) : data.conversation.status === "closed" && (client || canManage) ? (
            <form action={reopenSupportConversationAction}><SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} /><button className="btn brand">{t(client&&idle.autoEnded?'Resume chat':"Reopen")}</button></form>
          ) : null}
          {operations && data.conversation.status !== "closed" ? (
            <form action={reassignSupportConversationAction} className="support-reassign">
              <SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} />
              <SupportAssignmentPicker conversationId={id} assignedUserId={data.conversation.assignedUserId} assignedUserName={data.conversation.assignedUserName} agents={agents} label={t("Assign support agent")} waitingLabel={t("Waiting queue")} pausedLabel={t("Paused")}/>
              <button className="small-btn">{t("Assign")}</button>
            </form>
          ) : null}
        </div>
      {!client ? <p><Link className="small-btn" href={supportAssignmentHistoryHref(id,view)}>{t('Assignment history')}</Link></p> : null}
          </section>
      {idleEndEvidence ? <section className={`panel ${styles.idleEvidence}`} aria-labelledby="idle-end-evidence-title" data-idle-end-evidence>
        <h2 id="idle-end-evidence-title">{t('Ended after no customer reply')}</h2>
        <dl className={styles.companyDetails}>
          <div><dt>{t('Last team reply')}</dt><dd><time dateTime={new Date(idleEndEvidence.lastPublicStaffReply.sentAt).toISOString()}>{dateTime(idleEndEvidence.lastPublicStaffReply.sentAt)}</time></dd></div>
          <div><dt>{t('Chat ended')}</dt><dd><time dateTime={new Date(idleEndEvidence.endedAt).toISOString()}>{dateTime(idleEndEvidence.endedAt)}</time></dd></div>
          <div><dt>{t('Read status at ending')}</dt><dd>{t(idleEndEvidence.lastReplyConfirmedReadAtEnding ? 'Confirmed read' : 'Not marked read')}</dd></div>
        </dl>
      </section> : null}
      {!client && (data.conversation.participantKind === "visitor" || callback) ? (
        <section className="panel support-visitor-contact" aria-labelledby="visitor-contact-title">
          <div><span className="eyebrow">{t(buying ? "Request summary" : "Reconnect details")}</span><h2 id="visitor-contact-title">{buying ? data.conversation.requesterLabel : t("Visitor contact")}</h2>{buying ? <p className={styles.requestDetails}>{data.conversation.requestSummary}</p> : <p>{t("Use these details only to continue this support conversation.")}</p>}</div>
          <div>
            {data.conversation.visitorEmail ? <a href={`mailto:${data.conversation.visitorEmail}`}>{data.conversation.visitorEmail}</a> : callback ? null : <span>{t("Email unavailable for this older conversation")}</span>}
            {data.conversation.visitorPhone ? <a href={`tel:${data.conversation.visitorPhone}`}>{data.conversation.visitorPhone}</a> : <span>{t("Phone unavailable for this older conversation")}</span>}
          </div>
        </section>
      ) : null}
      {videoRequest ? <section className="panel form-grid">
        <h2 className="full">{t("Video request")}</h2>
        <p className="full">{videoRequest.target_kind === "header" ? t("Business video") : videoRequest.target_label} · {t(videoRequest.status === "pending" ? "Awaiting review" : videoRequest.status === "approved" ? "Approved" : "Declined")}</p>
        <a className="full" href={videoRequest.source_url} target="_blank" rel="noreferrer">{t("Open submitted video")}</a>
        {canPublicReply && videoRequest.status === "pending" ? <form className="full form-grid" action={reviewVideoRequestAction}>
          <SupportNavigationFields state={view}/><input type="hidden" name="conversationId" value={id} />
          <div className="field full"><label htmlFor="approved-video">{t(videoRequest.target_kind === "product" ? "Video link" : "YouTube link")}</label><input id="approved-video" name="videoUrl" type="url" maxLength={500} /></div>
          <div className="field full"><label htmlFor="video-review-reply">{t("Reply to owner")}</label><textarea id="video-review-reply" name="reply" required maxLength={1500} rows={3} /></div>
          <div className="full support-thread-actions"><button className="btn brand" name="decision" value="approved">{t("Approve video")}</button><button className="btn secondary" name="decision" value="declined">{t("Decline")}</button></div>
        </form> : null}
      </section> : null}
        </aside>
      </div>
      </div>
    </DashboardShell>
  );
}
