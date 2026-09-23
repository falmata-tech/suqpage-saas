
import { getUiText } from "@/lib/i18n/server";
import crypto from "node:crypto";
import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { createSupportConversationAction } from "@/app/support-actions";
import { requireUser } from "@/lib/auth";
import { supportWhatsAppUrl } from "@/lib/config";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { listSupportConversations } from "@/lib/support";

export const dynamic = "force-dynamic";

export default async function SupportInbox({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; error?: string; saved?: string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const result = await listSupportConversations(user, query);
  const client = user.access_role === "client";
  const emergencyWhatsApp = supportWhatsAppUrl();
  const operations = user.access_role === "operations_manager" || user.access_role === "platform_admin";
  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">{client ? t("Suqpage support") : t("Customer support")}</span>
          <h1>{client ? t("How can we help?") : t("Support inbox")}</h1>
          <p>{client ? t("Keep questions and replies together with your Suqpage account.") : t("Claim waiting conversations, help the client, and close work when it is resolved.")}</p>
        </div>
        {client && emergencyWhatsApp ? <a className="btn secondary" href={emergencyWhatsApp} target="_blank" rel="noreferrer">{t("Emergency WhatsApp")}</a> : operations ? <Link className="small-btn" href="/dashboard/support/agents">{t("Manage support agents")}</Link> : null}
      </div>
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      {query.saved ? <p className="notice">{t("Support conversation updated.")}</p> : null}
      {client ? (
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
        <CollectionToolbar action="/dashboard/support" search={query.q || ""} placeholder={t("Conversation, business, or reference")}>
          <label><span>{t("Status")}</span><select name="status" defaultValue={query.status || ""}><option value="">{t("All statuses")}</option><option value="waiting">{t("Waiting")}</option><option value="open">{t("Open")}</option><option value="closed">{t("Closed")}</option></select></label>
        </CollectionToolbar>
      )}
      <section className="support-list" aria-label={t("Support conversations")}>
        {result.items.map((conversation) => (
          <Link className="support-row" href={`/dashboard/support/${conversation.id}`} key={conversation.id}>
            <span>
              <small>{conversation.publicRef} · {conversation.businessName}{conversation.participantKind === "visitor" ? t(" · {value1}", { value1: conversation.assistanceCategory.replaceAll("_", " ") }) : ""}</small>
              <strong>{conversation.subject}</strong>
              <small>{conversation.assignedUserName ? t("Assigned to {value1}", { value1: conversation.assignedUserName }) : t("Waiting for a team member")}</small>
            </span>
            <span>
              {conversation.unread ? <b className="support-unread">{t("New")}</b> : null}
              <b className={`badge ${t(conversation.status)}`}>{t(conversation.status)}</b>
            </span>
          </Link>
        ))}
        {!result.items.length ? <div className="empty-state">{client ? t("No support conversations yet.") : t("No conversations match this queue.")}</div> : null}
      </section>
      <PaginationNav result={result} pathname="/dashboard/support" params={{ q: query.q, status: query.status }} />
    </DashboardShell>
  );
}
