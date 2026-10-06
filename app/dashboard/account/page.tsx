
import { getUiText } from "@/lib/i18n/server";
import { saveAccountPhoneAction } from "./actions";
import { accountContactPort } from "@/lib/account-contact-runtime";
import DashboardShell from "@/components/DashboardShell";
import { changePasswordAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { authDriver } from "@/lib/config";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Account({ searchParams }: { searchParams: Promise<{ required?: string; error?: string; saved?: string; contact?: string }> }) {
  const t = await getUiText();
  const user = await requireUser({ allowTemporaryPassword: true });
  const params = await searchParams;
  const contacts = await accountContactPort.read(user.id);
  const business = user.business_id ? (await runtimeBusinessById(user.business_id)) || null : null;
  const managed = authDriver() === "supabase";

  return <DashboardShell user={user} business={business}>
    <div className="dashboard-head"><div><h1>{t("Your account")}</h1></div></div>
    <form className="panel form-grid" action={saveAccountPhoneAction}>
      <div className="field full"><span className="eyebrow">{t("Private contact details")}</span><h2>{t("Account email & phone")}</h2><p>{t("These details belong to your account. Public business contacts are managed separately in your page editor.")}</p></div>
      {params.contact === "saved" ? <p className="notice field full" role="status">{t("Account phone saved.")}</p> : null}
      {params.contact === "invalid" ? <p className="error field full" role="alert">{t("Enter your account phone with + and its country code.")}</p> : null}
      <div className="field"><label htmlFor="account-email">{t("Account email")}</label><input id="account-email" type="email" value={user.email} readOnly /><small>{t("Your sign-in email.")}</small></div>
      <div className="field"><label htmlFor="account-phone">{t("Account phone")}</label><input id="account-phone" name="accountPhone" type="tel" autoComplete="tel" maxLength={40} defaultValue={contacts?.account_phone || ""} placeholder="+251…" aria-describedby="account-phone-help" /><small id="account-phone-help">{t("Private and unverified. Include the country code. This number is not used to sign in.")}</small></div>
      <div className="field full"><button className="btn brand">{t("Save account phone")}</button></div>
    </form>
    {managed ? <section className="panel"><h2>{t("Email sign-in")}</h2><p className="muted">{t("Use a one-time code sent to your account email.")}</p></section> : <>
      {params.required ? <p className="notice">{t("Change the temporary password before using the dashboard.")}</p> : null}
      {params.error ? <p className="error">{params.error}</p> : null}
      {params.saved ? <p className="notice">{t("Password updated and other sessions revoked.")}</p> : null}
      <form className="panel form-grid" action={changePasswordAction}>
        <div className="field full"><label htmlFor="current-password">{t("Current password")}</label><input id="current-password" type="password" name="currentPassword" autoComplete="current-password" required /></div>
        <div className="field"><label htmlFor="new-password">{t("New password")}</label><input id="new-password" type="password" name="newPassword" autoComplete="new-password" minLength={12} required /></div>
        <div className="field"><label htmlFor="confirm-password">{t("Confirm new password")}</label><input id="confirm-password" type="password" name="confirmPassword" autoComplete="new-password" minLength={12} required /></div>
        <div className="field full"><small>{t("At least 12 characters with upper-case, lower-case and a number.")}</small></div>
        <div className="field full"><button className="btn brand">{t("Change password")}</button></div>
      </form>
    </>}
    <section className="panel">
      <h2>{t("Delete account")}</h2>
      <Link className="btn" href="/account-deletion">{t("Request account deletion")}</Link>
    </section>
  </DashboardShell>;
}
