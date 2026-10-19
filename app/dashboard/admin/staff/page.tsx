
import { getUiText } from "@/lib/i18n/server";
import { authDriver } from "@/lib/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import StaffWorkspaceNavigation from '@/components/StaffWorkspaceNavigation';
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
    <div className="dashboard-head"><div><h1>{t("Staff")}</h1><p>{t("Add staff and manage their access.")}</p></div><Link className="btn brand" href="/dashboard/admin/staff/new">{t("Create staff account")}</Link></div>
    <StaffWorkspaceNavigation active="accounts" accountsLabel={t('Accounts')} workloadLabel={t('Workload & availability')}/>
    {query.error ? <p className="error">{t(query.error)}</p> : null}{query.saved ? <p className="notice">{t(query.saved==='agent'?"Support agent settings saved.":"Staff account created.")}</p> : null}
    <CollectionToolbar action="/dashboard/admin/staff" search={query.q || ""} placeholder={t("Staff name or email")} activeFilters={Boolean(query.q || query.role)}><label><span>{t("Role")}</span><select name="role" defaultValue={query.role || ""}><option value="">{t("All roles")}</option><option value="support_agent">{t("Support agent")}</option><option value="transport_agent">{t("Transport agent")}</option></select></label></CollectionToolbar>
    {staff.items.length ? <>
      <div className="table-wrap admin-data-surface"><table className="data-table"><thead><tr>
        <th>{t('Staff member')}</th><th>{t('Role')}</th><th>{t('Open conversations')}</th><th>{t('Manage businesses')}</th><th>{t('Sign-in')}</th><th><span className="sr-only">{t('Manage')}</span></th>
      </tr></thead><tbody>{staff.items.map(member=><tr key={member.id}>
        <td data-label={t('Staff member')}><strong>{member.name}</strong><br/><small>{member.email}</small></td>
        <td data-label={t('Role')}>{t(member.access_role==='operations_manager'?'Operations manager':member.queue_scope==='support'?'Support agent':member.queue_scope==='transport'?'Transport agent':'Team member')}</td>
        <td data-label={t('Open conversations')}>{member.open_conversations}</td>
        <td data-label={t('Manage businesses')}><span className={`badge ${member.manage_businesses?'active':'draft'}`}>{t(member.manage_businesses?'Business management is on':'Business management is off')}</span></td>
        <td data-label={t('Sign-in')}><span className={`badge ${!managed&&member.must_change_password?'draft':'active'}`}>{!managed&&member.must_change_password?t('Password change required'):t('Ready')}</span></td>
        <td data-label={t('Manage')}><Link className="small-btn" href={`/dashboard/admin/staff/${member.id}`}>{t('Manage')}</Link></td>
      </tr>)}</tbody></table></div>
      <PaginationNav result={staff} pathname="/dashboard/admin/staff" params={{q:query.q,role:query.role}}/>
    </> : <div className="empty-state">{t('No staff accounts match this view.')}</div>}
  </DashboardShell>;
}
