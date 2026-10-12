import PublicMobileNavigation from "@/components/PublicMobileNavigation";
import LanguageSelector from "@/components/LanguageSelector";

import { getUiText } from "@/lib/i18n/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SuqpageBrand from "@/components/SuqpageBrand";
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
    <header className="landing-header"><div className="landing-container landing-nav"><SuqpageBrand className="landing-brand" /><LanguageSelector /><nav className="landing-desktop-nav" aria-label={t("Public navigation")}><Link href="/">{t("Market")}</Link><Link href="/about">{t("About")}</Link></nav><details className="landing-mobile-menu"><summary aria-label={t("Open public navigation")}><span /><span /><span /></summary><nav aria-label={t("Mobile public navigation")}><Link href="/">{t("Market")}</Link><Link href="/about">{t("About")}</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell login-task-shell" aria-labelledby="login-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">{t("Account access")}</span>
          <h1 id="login-title">{t("Sign in to Suqpage.")}</h1>
          {p.next==='inquiries' && <p>{t("Sign in to view your business inquiries.")}</p>}
          <p>{t("Give your social media customers an organized store to browse, find on the map and contact directly. Sign in to create your page or manage inquiries.")}</p>
          <div className="platform-context-note"><strong>{t("New here?")}</strong><span>{t("New business? Enter your email to create your account.")}</span></div>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>{t("Email sign-in")}</span><h2>{t("Continue to your account")}</h2><p>{t(accessMessage)}</p></div>
          <PasswordlessLoginForm emailEnabled={emailEnabled} initialError={p.error || ""} />
          {!emailEnabled?<p className="platform-form-note" role="status">{t("Please try again later or contact Suqpage support.")}</p>:null}
          <Link className="platform-return-link" href="/">{t("Return to Market")}</Link>
        </div>
      </section>
    </main>
    <PublicMobileNavigation/>
  </div>;
}
