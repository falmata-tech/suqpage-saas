
import { getUiText } from "@/lib/i18n/server";
import AccountProfileForm from "@/components/AccountProfileForm";
import { saveProfileAccountAction } from "./actions";
import { accountContactPort } from "@/lib/account-contact-runtime";
import DashboardShell from "@/components/DashboardShell";
import { changePasswordAction, logoutAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { authDriver } from "@/lib/config";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Account({ searchParams }: { searchParams: Promise<{ required?: string; error?: string; saved?: string; contact?: string; returnTo?: string; edit?: string }> }) {
  const t = await getUiText();
  const user = await requireUser({ allowTemporaryPassword: true });
  const params = await searchParams;
  const contacts = await accountContactPort.read(user.id);
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const managed = authDriver() === "supabase";
  const editing=params.returnTo==='profile'||params.edit==='details';
  const passwordEditor=!managed&&Boolean(params.required||user.must_change_password||params.error||params.edit==='password');

  if(editing)return <DashboardShell user={user} business={business}>
    <div className="navigation-trail"><Link className="btn secondary" href={params.returnTo==='profile'?'/dashboard/profile':'/dashboard/account'}>{t(params.returnTo==='profile'?'Back to account':'Account settings')}</Link></div>
    <div className="dashboard-head"><h1>{t('Edit account details')}</h1></div>
    <AccountProfileForm name={user.name} email={user.email} phone={contacts?.account_phone||''} action={saveProfileAccountAction} returnTo={params.returnTo==='profile'?'profile':'account'}/>
    <Link className="btn secondary" href={params.returnTo==='profile'?'/dashboard/profile':'/dashboard/account'}>{t('Cancel')}</Link>
  </DashboardShell>;

  return <DashboardShell user={user} business={business}>
    <div className="navigation-trail"><Link className="btn secondary" href={user.access_role==='client'?'/dashboard/profile':'/dashboard'}>{t(user.access_role==='client'?'Back to account':'Overview')}</Link></div>
    <div className="dashboard-head"><div><h1>{t("Account settings")}</h1></div></div>
    {!passwordEditor&&<section className="panel">
      <div className="dashboard-head"><h2>{t('Private contact details')}</h2><Link className="small-btn" href="/dashboard/account?edit=details">{t('Edit account details')}</Link></div>
      {params.contact==='saved'?<p className="notice" role="status">{t('Changes saved.')}</p>:null}
      <dl className="form-grid"><div><dt>{t('Name')}</dt><dd>{user.name}</dd></div><div><dt>{t('Account email')}</dt><dd>{user.email}</dd></div><div><dt>{t('Account phone')}</dt><dd>{contacts?.account_phone||t('Not configured')}</dd></div></dl>
      <p className="muted">{t('These details belong to your account. Public business contacts are managed separately in your page editor.')}</p>
    </section>}

    {managed ? <section className="panel"><h2>{t("Email sign-in")}</h2><p className="muted">{t("Use a one-time code sent to your account email.")}</p></section> : <>
      {params.required ? <p className="notice">{t("Change the temporary password before using the dashboard.")}</p> : null}
      {params.error ? <p className="error">{params.error}</p> : null}
      {params.saved ? <p className="notice">{t("Password updated and other sessions revoked.")}</p> : null}
      {passwordEditor?<form className="panel form-grid" action={changePasswordAction}>
        <div className="field full"><label htmlFor="current-password">{t("Current password")}</label><input id="current-password" type="password" name="currentPassword" autoComplete="current-password" required /></div>
        <div className="field"><label htmlFor="new-password">{t("New password")}</label><input id="new-password" type="password" name="newPassword" autoComplete="new-password" minLength={12} required /></div>
        <div className="field"><label htmlFor="confirm-password">{t("Confirm new password")}</label><input id="confirm-password" type="password" name="confirmPassword" autoComplete="new-password" minLength={12} required /></div>
        <div className="field full"><small>{t("At least 12 characters with upper-case, lower-case and a number.")}</small></div>
        <div className="field full"><button className="btn brand">{t("Change password")}</button></div>
      </form>:<section className="panel"><h2>{t('Account security')}</h2><Link className="btn secondary" href="/dashboard/account?edit=password">{t('Change password')}</Link></section>}
    </>}
    {!passwordEditor&&<section className="panel"><h2>{t('Account security')}</h2><div className="dashboard-head"><form action={logoutAction}><button className="btn secondary" type="submit">{t("Sign out")}</button></form><Link className="btn secondary" href="/account-deletion">{t("Request account deletion")}</Link></div></section>}
  </DashboardShell>;
}
