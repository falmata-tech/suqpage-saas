import Link from "next/link";
import {redirect} from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import FocusedEditForm from "@/components/FocusedEditForm";
import StaffWorkspaceNavigation from '@/components/StaffWorkspaceNavigation';
import {createStaffAccountAction} from "@/app/staff-actions";
import {requireUser} from "@/lib/auth";
import {hasCapability} from "@/lib/capabilities";
import {authDriver} from "@/lib/config";
import {getUiText} from "@/lib/i18n/server";

export const dynamic="force-dynamic";
export default async function NewStaffPage() {
  const user=await requireUser();
  if(!hasCapability(user,"platform:admin"))redirect("/dashboard");
  const t=await getUiText(),managed=authDriver()==="supabase";
  return <DashboardShell user={user} business={null}>
    <nav className="workspace-breadcrumbs" aria-label={t("Breadcrumb")}><Link href="/dashboard/admin/staff">{t("Staff")}</Link><span aria-hidden="true">/</span><strong aria-current="page">{t("Create staff account")}</strong></nav>
    <div className="dashboard-head"><div><h1>{t("Create staff account")}</h1><p>{t("Add staff and manage their access.")}</p></div></div>
    <StaffWorkspaceNavigation active="accounts" accountsLabel={t('Accounts')} workloadLabel={t('Workload & availability')}/>
    <FocusedEditForm action={createStaffAccountAction} cancelHref="/dashboard/admin/staff" submitLabel="Create staff account">
      <div className="field"><label htmlFor="staff-name">{t("Name")}</label><input id="staff-name" name="name" required maxLength={100}/></div>
      <div className="field"><label htmlFor="staff-email">{t("Email")}</label><input id="staff-email" name="email" type="email" required maxLength={160}/></div>
      <div className="field"><label htmlFor="staff-role">{t("Access role")}</label><select id="staff-role" name="accessRole"><option value="support_agent">{t("Support agent")}</option><option value="transport_agent">{t("Transport agent")}</option></select></div>
      {!managed&&<div className="field"><label htmlFor="staff-password">{t("Temporary password")}</label><input id="staff-password" name="temporaryPassword" type="password" minLength={12} required/></div>}
    </FocusedEditForm>
  </DashboardShell>;
}
