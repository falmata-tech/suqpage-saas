import LanguageSelector from "@/components/LanguageSelector";

import { getUiText } from "@/lib/i18n/server";
import { authDriver } from "@/lib/config";
import NavigationTrail from "@/components/NavigationTrail";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";
import { redeemInvitationAction } from "@/app/invitation-actions";
import { getActiveInvitation } from "@/lib/invitations";

export const dynamic = "force-dynamic";

const maskEmail = (email:string) => {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"•".repeat(Math.max(2, Math.min(6, name.length - 2)))}@${domain}`;
};

export default async function InvitationPage({ params, searchParams }: { params:Promise<{token:string}>; searchParams:Promise<{error?:string}> }) {
  const t = await getUiText();
  const managed = authDriver() === "supabase";
  const token = (await params).token;
  const query = await searchParams;
  const invitation = await getActiveInvitation(token);
  const errors: Record<string,string> = {
    mismatch: "The passwords do not match.",
    expired: "This invitation expired or was replaced. Ask Suqpage for a new link.",
    replayed: "This invitation has already been used.",
    conflict: "An account already exists for this email. Contact Suqpage for help.",
    invalid: "The invitation could not be accepted.",
  };
  return <><LanguageSelector /><main className="invite-page public-mobile-page"><div className="invite-card">
    <NavigationTrail items={[{label:t("Suqpage"),href:"/"},{label:t("Client invitation")}]} fallback="/"/>
    {!invitation ? <><span className="eyebrow">{t("Invitation unavailable")}</span><h1>{t("Ask Suqpage for a new invitation")}</h1><p>{t("This link is invalid, expired, already used, or was replaced for your protection.")}</p><a className="btn secondary" href="/">{t("Return home")}</a></> : <>
      <span className="eyebrow">{t("Private client invitation")}</span><h1>{t("Join")}{" "}{invitation.business_name}</h1><p>{t("Set up your private client workspace. You’ll use it to edit your page, manage products, follow inquiries, and contact support.")}</p>
      <div className="invite-summary"><div><small>{t("Account email")}</small><strong>{maskEmail(invitation.email)}</strong></div><div><small>{t("Link expires")}</small><strong>{new Date(invitation.expires_at).toLocaleString("en-US", { hour12: true })}</strong></div></div>
      {query.error && <p className="error" role="alert">{errors[query.error] || errors.invalid}</p>}
      <form action={redeemInvitationAction} className="form-grid"><input type="hidden" name="token" value={token}/><div className="field full"><label htmlFor="invite-account-name">{t("Your name")}</label><input id="invite-account-name" name="name" autoComplete="name" required maxLength={100}/></div>{!managed ? <><div className="field"><label htmlFor="invite-password">{t("Password")}</label><input id="invite-password" type="password" name="password" autoComplete="new-password" minLength={12} required/></div><div className="field"><label htmlFor="invite-confirm">{t("Confirm password")}</label><input id="invite-confirm" type="password" name="confirmPassword" autoComplete="new-password" minLength={12} required/></div><div className="field full"><small>{t("Use 12–128 characters with upper-case, lower-case, and a number.")}</small></div></> : null}<div className="field full"><button className="btn brand">{managed ? t("Accept invitation and sign in") : t("Create private workspace")}</button></div></form>
    </>}
  </div></main><PublicMobileNavigation /></>;
}
