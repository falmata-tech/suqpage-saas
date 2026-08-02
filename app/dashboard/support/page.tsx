import crypto from "node:crypto";
import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { createSupportConversationAction, updateSupportAgentSettingAction } from "@/app/support-actions";
import { requireUser } from "@/lib/auth";
import { supportWhatsAppUrl } from "@/lib/config";
import { getBusinessById } from "@/lib/db";
import { listSupportAgentWorkloads, listSupportConversations } from "@/lib/support";

export const dynamic = "force-dynamic";

export default async function SupportInbox({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const business = user.business_id ? getBusinessById(user.business_id) || null : null;
  const result = listSupportConversations(user, query);
  const client = user.access_role === "client";
  const emergencyWhatsApp = supportWhatsAppUrl();
  const workloads = user.access_role === "operations_manager" || user.access_role === "platform_admin"
    ? listSupportAgentWorkloads(user)
    : [];
  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">{client ? "MirtPage support" : "Customer support"}</span>
          <h1>{client ? "How can we help?" : "Support inbox"}</h1>
          <p>{client ? "Keep questions and replies together with your MirtPage account." : "Claim waiting conversations, help the client, and close work when it is resolved."}</p>
        </div>
        {client && emergencyWhatsApp ? <a className="btn secondary" href={emergencyWhatsApp} target="_blank" rel="noreferrer">Emergency WhatsApp</a> : null}
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.saved ? <p className="notice">Support agent settings saved.</p> : null}
      {client ? (
        <form className="panel form-grid support-new" action={createSupportConversationAction}>
          <h2 className="full">Start a conversation</h2>
          <input type="hidden" name="idempotencyKey" value={crypto.randomBytes(16).toString("hex")} />
          <div className="field full">
            <label htmlFor="support-subject">Subject</label>
            <input id="support-subject" name="subject" maxLength={120} required placeholder="What do you need help with?" />
          </div>
          <div className="field full">
            <label htmlFor="support-message">Message</label>
            <textarea id="support-message" name="message" maxLength={4000} required rows={5} />
          </div>
          <div className="field full"><button className="btn brand">Send to MirtPage support</button></div>
        </form>
      ) : (
        <CollectionToolbar action="/dashboard/support" search={query.q || ""} placeholder="Conversation, business, or reference">
          <label><span>Status</span><select name="status" defaultValue={query.status || ""}><option value="">All statuses</option><option value="waiting">Waiting</option><option value="open">Open</option><option value="closed">Closed</option></select></label>
        </CollectionToolbar>
      )}
      {!client && workloads.length ? (
        <details className="panel support-workload">
          <summary>Agent workload and assignment limits</summary>
          <div className="support-agent-grid">
            {workloads.map((agent) => (
              <form action={updateSupportAgentSettingAction} key={agent.userId}>
                <input type="hidden" name="userId" value={agent.userId} />
                <span><strong>{agent.name}</strong><small>{agent.openConversations} open of {agent.maxOpenConversations}</small></span>
                <label><input type="checkbox" name="enabled" defaultChecked={agent.enabled} /> Receives support</label>
                <label>Limit <input type="number" name="maxOpenConversations" min="1" max="20" defaultValue={agent.maxOpenConversations} /></label>
                <button className="small-btn">Save</button>
              </form>
            ))}
          </div>
        </details>
      ) : null}
      <section className="support-list" aria-label="Support conversations">
        {result.items.map((conversation) => (
          <Link className="support-row" href={`/dashboard/support/${conversation.id}`} key={conversation.id}>
            <span>
              <small>{conversation.publicRef} · {conversation.businessName}</small>
              <strong>{conversation.subject}</strong>
              <small>{conversation.assignedUserName ? `Assigned to ${conversation.assignedUserName}` : "Waiting for a team member"}</small>
            </span>
            <span>
              {conversation.unread ? <b className="support-unread">New</b> : null}
              <b className={`badge ${conversation.status}`}>{conversation.status}</b>
            </span>
          </Link>
        ))}
        {!result.items.length ? <div className="empty-state">{client ? "No support conversations yet." : "No conversations match this queue."}</div> : null}
      </section>
      <PaginationNav result={result} pathname="/dashboard/support" params={{ q: query.q, status: query.status }} />
    </DashboardShell>
  );
}
