import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateSupportAgentSettingEditAction } from "@/app/support-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import FocusedEditForm from "@/components/FocusedEditForm";
import StaffWorkspaceNavigation from '@/components/StaffWorkspaceNavigation';
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import {workloadViewState,workloadHref,staffListViewState,staffListHref} from '@/lib/support-navigation';
import {
  getSupportAgentSummary,
  listSupportAgentWorkloadsPage,
} from "@/lib/support";

export const dynamic = "force-dynamic";

function savedCount(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return null;
  const count = Number(value);
  return Number.isSafeInteger(count) ? count : null;
}

export default async function SupportAgents({ searchParams }: {
  searchParams: Promise<{ page?:string; q?:string; status?:string; error?:string; saved?:string; routed?:string; remaining?:string; edit?:string; back_q?:string; back_page?:string; back_status?:string; back_origin?:string; back_role?:string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user,"operations:manage")) redirect("/dashboard/support");
  const query = await searchParams;
  const status=query.status === "available" ? "enabled" : query.status === "enabled" || query.status === "disabled" ? query.status : "";
  const result = await listSupportAgentWorkloadsPage(user,{...query,status});
  const summary = await getSupportAgentSummary(user);
  const view=workloadViewState({...query,status,page:String(result.page)});
  const editId=query.edit && /^[1-9]\d{0,14}$/.test(query.edit) && Number.isSafeInteger(Number(query.edit)) ? Number(query.edit) : null;
  const selected=editId ? result.items.find(agent=>agent.userId===editId) : undefined;
  const hasOrigin=query.back_q!==undefined || query.back_page!==undefined || query.back_status!==undefined;
  const backView=hasOrigin?workloadViewState({q:query.back_q,page:query.back_page,status:query.back_status}):view;
  const admin=hasCapability(user,'platform:admin'),staffOrigin=admin&&query.back_origin==='staff';
  const staffView=staffListViewState({q:query.back_q,page:query.back_page,role:query.back_role});
  const cancelHref=staffOrigin?staffListHref(staffView):workloadHref(backView);
  function editHref(id:number,email:string){
    const params=new URLSearchParams({q:email,edit:String(id),back_q:view.q||'',back_page:view.page||'1',back_status:view.status||''});
    return '/dashboard/support/agents?'+params;
  }
  const parentHref=admin?'/dashboard/admin/staff':'/dashboard/support?queue=support';
  const routed=savedCount(query.routed);
  const remaining=savedCount(query.remaining);
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t("Breadcrumb")}><Link href={parentHref}>{t(admin?"Staff":"Business support")}</Link><span aria-hidden="true">/</span>{selected?<><Link href={cancelHref}>{t("Workload & availability")}</Link><span aria-hidden="true">/</span><strong aria-current="page">{selected.name}</strong></>:<strong aria-current="page">{t("Workload & availability")}</strong>}</nav>
    <div className="dashboard-head"><div><span className="eyebrow">{t(selected?"Workload & availability":"Staff")}</span><h1>{selected?selected.name:t("Workload & availability")}</h1>{selected?<p>{selected.email}</p>:<><p>{t("New chats go to an available agent with the fewest open conversations. Equal workloads take turns.")}</p><p>{t("Pausing new chats keeps existing conversations assigned.")}</p></>}</div><Link className="small-btn" href={selected?cancelHref:parentHref}>{t(selected?"Back to results":admin?"Back to staff":"Back to inbox")}</Link></div>
    {admin?<StaffWorkspaceNavigation active="workload" accountsLabel={t('Accounts')} workloadLabel={t('Workload & availability')}/>:null}
    {query.error ? <p className="error">{t(query.error)}</p> : null}{query.saved ? <p className="notice">{t("Support agent settings saved.")}</p> : null}
    {query.saved && routed !== null && remaining !== null ? <p className="notice">{t("Assigned {value1} waiting conversations. Still waiting: {value2}.",{value1:routed,value2:remaining})}</p> : null}
    {query.edit && !selected ? <p className="error" role="alert">{t("That support agent is unavailable.")}</p>:null}
    {selected ? <FocusedEditForm action={updateSupportAgentSettingEditAction} cancelHref={cancelHref}>
      {Object.entries(staffOrigin?staffView:backView).map(([key,value])=><input key={key} type="hidden" name={'view_'+key} value={value}/>)}
      {staffOrigin?<input type="hidden" name="view_origin" value="staff"/>:null}
      <input type="hidden" name="userId" value={selected.userId}/>
      <div className="field full support-agent-load"><span>{t("Open conversations")}</span><strong>{selected.openConversations}</strong></div>
      <label className="field full check-field"><input type="checkbox" name="enabled" defaultChecked={selected.enabled}/><span>{t("Receives new chats")}</span></label>
      <p className="field full muted">{t("Pausing new chats keeps existing conversations assigned.")}</p>
      <label className="field full"><span>{t(selected.accessRole === "team_member" && selected.queueScope !== "all" ? "Role" : "Queue")}</span><select name="queueScope" defaultValue={selected.queueScope}>{(selected.queueScope === "all" || selected.accessRole === "operations_manager") && <option value="all">{t("All requests")}</option>}<option value="support">{t(selected.accessRole === "operations_manager" ? "Business support" : "Support agent")}</option><option value="transport">{t(selected.accessRole === "operations_manager" ? "Transport dispatch" : "Transport agent")}</option></select></label>
    </FocusedEditForm> : <>
    <section className="support-capacity-summary" aria-label={t("Staff workload summary")}>
      <span><small>{t("Waiting")}</small><strong>{summary.waitingConversations}</strong></span>
      <span><small>{t("Receives new chats")}</small><strong>{summary.availableAgents}</strong></span>
      <span><small>{t("Paused")}</small><strong>{summary.totalAgents-summary.availableAgents}</strong></span>
      <span><small>{t("Open assignments")}</small><strong>{summary.openAssignments}</strong></span>
    </section>
    <CollectionToolbar action="/dashboard/support/agents" search={query.q || ""} placeholder={t("Agent name or email")} activeFilters={Boolean(query.q || status)}>
      <label><span>{t("Availability")}</span><select name="status" defaultValue={status}><option value="">{t("All agents")}</option><option value="enabled">{t("Receives new chats")}</option><option value="disabled">{t("Paused")}</option></select></label>
    </CollectionToolbar>
    <section className="admin-data-surface" aria-label={t("Support agent settings")}>
      {result.items.length ? <table className="data-table"><thead><tr><th>{t("Name")}</th><th>{t("Queue")}</th><th>{t("Open conversations")}</th><th>{t("Availability")}</th><th>{t("Edit")}</th></tr></thead><tbody>
        {result.items.map(agent=><tr key={agent.userId}>
          <td data-label={t("Name")}><div className="support-agent-identity"><strong>{agent.name}</strong><small>{agent.email}</small></div></td>
          <td data-label={t("Queue")}>{t(agent.queueScope==='all'?"All requests":agent.queueScope==='transport'?"Transport dispatch":"Business support")}</td>
          <td data-label={t("Open conversations")}><strong>{agent.openConversations}</strong></td>
          <td data-label={t("Availability")}><span className={'badge '+(agent.enabled?'active':'draft')}>{t(agent.enabled?"Receives new chats":"Paused")}</span></td>
          <td data-label={t("Edit")}><Link className="small-btn" href={editHref(agent.userId,agent.email)}>{t("Edit")}</Link></td>
        </tr>)}
      </tbody></table> : <div className="empty-state">{t("No support agents match this view.")}</div>}
    </section>
    <PaginationNav result={result} pathname="/dashboard/support/agents" params={{q:query.q,status}}/>
    </>}
  </DashboardShell>;
}
