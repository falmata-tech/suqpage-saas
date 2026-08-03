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
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard/support");
  const query = await searchParams;
  const result = listSupportAgentWorkloadsPage(user,query);
  const summary = getSupportAgentSummary(user);
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/support">Support inbox</Link><span>/</span><strong>Agents</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">Support operations</span><h1>Support agents</h1><p>Set who receives new conversations and keep workload within a clear limit.</p></div><Link className="small-btn" href="/dashboard/support">Open inbox</Link></div>
    {query.error ? <p className="error">{query.error}</p> : null}{query.saved ? <p className="notice">Support agent settings saved.</p> : null}
    <section className="support-capacity-summary" aria-label="Support capacity summary">
      <span><small>Waiting</small><strong>{summary.waitingConversations}</strong></span>
      <span><small>Available agents</small><strong>{summary.availableAgents}</strong></span>
      <span><small>At capacity</small><strong>{summary.fullAgents}</strong></span>
      <span><small>Open assignments</small><strong>{summary.openAssignments}</strong></span>
    </section>
    <CollectionToolbar action="/dashboard/support/agents" search={query.q || ""} placeholder="Agent name or email" activeFilters={Boolean(query.q || query.status)}>
      <label><span>Availability</span><select name="status" defaultValue={query.status || ""}><option value="">All agents</option><option value="available">Available</option><option value="full">At capacity</option><option value="enabled">Receiving support</option><option value="disabled">Not receiving support</option></select></label>
    </CollectionToolbar>
    <section className="support-agent-list" aria-label="Support agent settings">
      {result.items.map((agent)=><form action={updateSupportAgentSettingAction} key={agent.userId}>
        <input type="hidden" name="userId" value={agent.userId}/>
        <div className="support-agent-identity"><strong>{agent.name}</strong><small>{agent.email}</small></div>
        <div className="support-agent-load"><span>{agent.openConversations} of {agent.maxOpenConversations} open</span><progress max={agent.maxOpenConversations} value={agent.openConversations}>{agent.openConversations}</progress></div>
        <label className="support-agent-toggle"><input type="checkbox" name="enabled" defaultChecked={agent.enabled}/><span>Receives support</span></label>
        <label className="support-agent-limit"><span>Conversation limit</span><input type="number" name="maxOpenConversations" min="1" max="20" defaultValue={agent.maxOpenConversations}/></label>
        <button className="small-btn">Save</button>
      </form>)}
      {!result.items.length ? <div className="empty-state">No support agents match this view.</div> : null}
    </section>
    <PaginationNav result={result} pathname="/dashboard/support/agents" params={{q:query.q,status:query.status}}/>
  </DashboardShell>;
}
