
import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateSupportAgentSettingAction } from "@/app/support-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import {
  getSupportAgentSummary,
  listSupportAgentWorkloadsPage,
} from "@/lib/support";

export const dynamic = "force-dynamic";

export default async function SupportAgents({ searchParams }: {
  searchParams: Promise<{ page?:string; q?:string; status?:string; error?:string; saved?:string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard/support");
  const query = await searchParams;
  const result = await listSupportAgentWorkloadsPage(user,query);
  const summary = await getSupportAgentSummary(user);
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t("Breadcrumb")}><Link href="/dashboard/support">{t("Support inbox")}</Link><span>/</span><strong>{t("Agents")}</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">{t("Support operations")}</span><h1>{t("Support agents")}</h1><p>{t("Set who receives new conversations and keep workload within a clear limit.")}</p></div><Link className="small-btn" href="/dashboard/support">{t("Open inbox")}</Link></div>
    {query.error ? <p className="error">{t(query.error)}</p> : null}{query.saved ? <p className="notice">{t("Support agent settings saved.")}</p> : null}
    <section className="support-capacity-summary" aria-label={t("Support capacity summary")}>
      <span><small>{t("Waiting")}</small><strong>{summary.waitingConversations}</strong></span>
      <span><small>{t("Available agents")}</small><strong>{summary.availableAgents}</strong></span>
      <span><small>{t("At capacity")}</small><strong>{summary.fullAgents}</strong></span>
      <span><small>{t("Open assignments")}</small><strong>{summary.openAssignments}</strong></span>
    </section>
    <CollectionToolbar action="/dashboard/support/agents" search={query.q || ""} placeholder={t("Agent name or email")} activeFilters={Boolean(query.q || query.status)}>
      <label><span>{t("Availability")}</span><select name="status" defaultValue={query.status || ""}><option value="">{t("All agents")}</option><option value="available">{t("Available")}</option><option value="full">{t("At capacity")}</option><option value="enabled">{t("Receiving support")}</option><option value="disabled">{t("Not receiving support")}</option></select></label>
    </CollectionToolbar>
    <section className="support-agent-list" aria-label={t("Support agent settings")}>
      {result.items.map((agent)=><form action={updateSupportAgentSettingAction} key={agent.userId}>
        <input type="hidden" name="userId" value={agent.userId}/>
        <div className="support-agent-identity"><strong>{agent.name}</strong><small>{agent.email}</small></div>
        <div className="support-agent-load"><span>{agent.openConversations} {" "}{t("of")}{" "}{agent.maxOpenConversations} {" "}{t("open")}</span><progress max={agent.maxOpenConversations} value={agent.openConversations}>{agent.openConversations}</progress></div>
        <label className="support-agent-toggle"><input type="checkbox" name="enabled" defaultChecked={agent.enabled}/><span>{t("Receives support")}</span></label>
        <label className="support-agent-limit"><span>{t("Conversation limit")}</span><input type="number" name="maxOpenConversations" min="1" max="20" defaultValue={agent.maxOpenConversations}/></label>
        <button className="small-btn">{t("Save")}</button>
      </form>)}
      {!result.items.length ? <div className="empty-state">{t("No support agents match this view.")}</div> : null}
    </section>
    <PaginationNav result={result} pathname="/dashboard/support/agents" params={{q:query.q,status:query.status}}/>
  </DashboardShell>;
}
