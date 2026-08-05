import crypto from "node:crypto";
import Link from "next/link";
import {
  claimSupportConversationAction,
  closeSupportConversationAction,
  postSupportMessageAction,
  reassignSupportConversationAction,
  reopenSupportConversationAction,
} from "@/app/support-actions";
import DashboardShell from "@/components/DashboardShell";
import SupportThreadRefresh from "@/components/SupportThreadRefresh";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { getSupportConversation, listSupportAgentWorkloads } from "@/lib/support";

export const dynamic = "force-dynamic";

function dateTime(value: number) {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

export default async function SupportThread({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; sent?: string; claimed?: string; closed?: string; reopened?: string }>;
}) {
  const user = await requireUser();
  const id = Number.parseInt((await params).id, 10);
  const query = await searchParams;
  const data = getSupportConversation(user, id);
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const client = user.access_role === "client";
  const operations = user.access_role === "operations_manager" || user.access_role === "platform_admin";
  const agents = operations ? listSupportAgentWorkloads(user).filter((agent) => agent.enabled) : [];
  const canReply = data.conversation.status === "open"
    ? client || data.conversation.assignedUserId === user.id || user.access_role === "operations_manager" || user.access_role === "platform_admin"
    : data.conversation.status === "waiting" && client;
  return (
    <DashboardShell user={user} business={business}>
      <SupportThreadRefresh active={data.conversation.status !== "closed"} />
      <div className="support-thread-head">
        <div>
          <Link href="/dashboard/support">Back to support inbox</Link>
          <span className="eyebrow">{data.conversation.publicRef}</span>
          <h1>{data.conversation.subject}</h1>
          <p>{data.conversation.businessName} · <span className={`badge ${data.conversation.status}`}>{data.conversation.status}</span></p>
        </div>
        <div className="support-thread-actions">
          {!client && data.conversation.status === "waiting" ? (
            <form action={claimSupportConversationAction}><input type="hidden" name="conversationId" value={id} /><button className="btn brand">Claim conversation</button></form>
          ) : null}
          {data.conversation.status !== "closed" ? (
            <form action={closeSupportConversationAction}><input type="hidden" name="conversationId" value={id} /><button className="btn secondary">Close</button></form>
          ) : (
            <form action={reopenSupportConversationAction}><input type="hidden" name="conversationId" value={id} /><button className="btn brand">Reopen</button></form>
          )}
          {operations ? (
            <form action={reassignSupportConversationAction} className="support-reassign">
              <input type="hidden" name="conversationId" value={id} />
              <select name="assignedUserId" aria-label="Assign support agent" defaultValue={data.conversation.assignedUserId || ""}>
                <option value="">Waiting queue</option>
                {agents.map((agent) => <option key={agent.userId} value={agent.userId}>{agent.name} ({agent.openConversations}/{agent.maxOpenConversations})</option>)}
              </select>
              <button className="small-btn">Assign</button>
            </form>
          ) : null}
        </div>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.sent ? <p className="notice">Reply sent.</p> : null}
      <section className="support-thread" aria-label="Support message history" tabIndex={0}>
        {data.messages.map((message) => (
          <article className={`support-message ${message.senderRole === "client" ? "client" : "staff"}`} key={message.id}>
            <header><strong>{message.senderName}</strong><time dateTime={new Date(message.createdAt).toISOString()}>{dateTime(message.createdAt)}</time></header>
            <p>{message.body}</p>
          </article>
        ))}
      </section>
      {canReply ? (
        <form className="panel support-reply" action={postSupportMessageAction}>
          <input type="hidden" name="conversationId" value={id} />
          <input type="hidden" name="idempotencyKey" value={crypto.randomBytes(16).toString("hex")} />
          <label htmlFor="support-reply">Reply</label>
          <textarea id="support-reply" name="message" maxLength={4000} required rows={4} />
          <button className="btn brand">Send reply</button>
        </form>
      ) : data.conversation.status === "waiting" && !client ? (
        <p className="notice">Claim this conversation before replying.</p>
      ) : null}
    </DashboardShell>
  );
}
