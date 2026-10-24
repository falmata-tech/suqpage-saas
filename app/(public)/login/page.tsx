
import { getUiText } from "@/lib/i18n/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PasswordlessLoginForm from "@/components/PasswordlessLoginForm";
import { supabaseAuthConfig, supabaseAuthEnabled } from "@/lib/config";
import { currentSupabaseProviderIdentity } from "@/lib/supabase-auth";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string;next?:string}>}){
  const t = await getUiText();
  await connection();
  const managedAuth = supabaseAuthEnabled();
  const identity = managedAuth ? await currentSupabaseProviderIdentity() : null;
  if (identity) redirect(identity.userId ? "/dashboard" : "/request");
  const p=await searchParams;
  const config=supabaseAuthConfig();
  const emailEnabled=managedAuth&&config.emailOtpEnabled;
  const accessMessage=emailEnabled
    ? "Continue with email"
    : "Account access is temporarily unavailable.";
  return <div className="landing-home platform-task-page">
    <div className="platform-task-main">
      <section className="platform-task-shell login-task-shell" aria-labelledby="login-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">{t("Account access")}</span>
          <h1 id="login-title">{t("Sign in to AfricMade.")}</h1>
          <p>{t("Use your email to sign in or create an account.")}</p>
          <div className="platform-context-note"><strong>{t("New here?")}</strong><span>{t("Enter your email to get started.")}</span></div>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>{t("Email sign-in")}</span><h2>{t("Continue to your account")}</h2><p>{t(accessMessage)}</p></div>
          <PasswordlessLoginForm emailEnabled={emailEnabled} initialError={p.error || ""} />
          {!emailEnabled?<p className="platform-form-note" role="status">{t("Please try again later or contact AfricMade support.")}</p>:null}
          <Link className="platform-return-link" href="/transport-partners">{t("Logistics service providers: Ask to be listed")}</Link>
          <Link className="platform-return-link" href="/">{t("Return to Market")}</Link>
        </div>
      </section>
    </div>
  </div>;
}
