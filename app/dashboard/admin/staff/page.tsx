
import { getUiText } from "@/lib/i18n/server";
import { authDriver } from "@/lib/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createStaffAccountAction } from "@/app/staff-actions";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { listStaffPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function AdminStaff({ searchParams }: {
  searchParams: Promise<{ error?:string; saved?:string; page?:string; q?:string; role?:string }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const managed = authDriver() === "supabase";
  const query = await searchParams;
  const staff = await listStaffPage(query);
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t("Breadcrumb")}><Link href="/dashboard/admin">{t("Overview")}</Link><span>/</span><strong>{t("Staff")}</strong></nav>
    <div className="dashboard-head"><div><span className="eyebrow">{t("Platform access")}</span><h1>{t("Staff")}</h1><p>{t("Add staff and manage their access.")}</p></div><Link className="small-btn" href="/dashboard/support/agents">{t("Workload & availability")}</Link></div>
    {query.error ? <p className="error">{t(query.error)}</p> : null}{query.saved ? <p className="notice">{t("Staff account created.")}</p> : null}
    <details className="admin-create-disclosure" open={Boolean(query.error)}><summary>{t("Create staff account")}</summary><form action={createStaffAccountAction} className="form-grid"><div className="field"><label htmlFor="staff-name">{t("Name")}</label><input id="staff-name" name="name" required maxLength={100}/></div><div className="field"><label htmlFor="staff-email">{t("Email")}</label><input id="staff-email" name="email" type="email" required maxLength={160}/></div><div className="field"><label htmlFor="staff-role">{t("Access role")}</label><select id="staff-role" name="accessRole"><option value="support_agent">{t("Support agent")}</option><option value="transport_agent">{t("Transport agent")}</option></select></div>{!managed ? <div className="field"><label htmlFor="staff-password">{t("Temporary password")}</label><input id="staff-password" name="temporaryPassword" type="password" minLength={12} required/></div> : null}<div className="field full"><button className="btn brand">{t("Create staff account")}</button></div></form></details>
    <CollectionToolbar action="/dashboard/admin/staff" search={query.q || ""} placeholder={t("Staff name or email")} activeFilters={Boolean(query.q || query.role)}><label><span>{t("Role")}</span><select name="role" defaultValue={query.role || ""}><option value="">{t("All roles")}</option><option value="support_agent">{t("Support agent")}</option><option value="transport_agent">{t("Transport agent")}</option></select></label></CollectionToolbar>
    {staff.items.length ? <><div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr><th>{t("Staff member")}</th><th>{t("Role")}</th><th>{t("Open conversations")}</th><th>{t("Sign-in")}</th></tr></thead><tbody>{staff.items.map((member)=><tr key={member.id}><td data-label="Staff member"><strong>{member.name}</strong><br/><small>{member.email}</small></td><td data-label="Role">{t(member.access_role === "team_member" && member.queue_scope === "support" ? "Support agent" : member.access_role === "team_member" && member.queue_scope === "transport" ? "Transport agent" : member.access_role === "operations_manager" ? "Operations manager" : "Team member")}<br/><Link href={`/dashboard/support/agents?q=${encodeURIComponent(member.email)}`}>{t("Manage")}</Link></td><td data-label="Open conversations">{member.open_conversations}</td><td data-label="Sign-in"><span className={`badge ${!managed && member.must_change_password ? "draft" : "active"}`}>{!managed && member.must_change_password ? t("Password change required") : t("Ready")}</span></td></tr>)}</tbody></table></div><PaginationNav result={staff} pathname="/dashboard/admin/staff" params={{q:query.q,role:query.role}}/></> : <div className="empty-state">{t("No staff accounts match this view.")}</div>}
  </DashboardShell>;
}
