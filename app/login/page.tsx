import { redirect } from "next/navigation";
import Link from "next/link";
import { googleLoginAction } from "@/app/actions";
import AfricMadeBrand from "@/components/AfricMadeBrand";
import PasswordlessLoginForm from "@/components/PasswordlessLoginForm";
import { supabaseAuthConfig, supabaseAuthEnabled } from "@/lib/config";
import { currentSupabaseProviderIdentity } from "@/lib/supabase-auth";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const managedAuth = supabaseAuthEnabled();
  const identity = managedAuth ? await currentSupabaseProviderIdentity() : null;
  if (identity) redirect(identity.userId ? "/dashboard" : "/request");
  const p=await searchParams;
  const config=supabaseAuthConfig();
  const emailEnabled=managedAuth&&config.emailOtpEnabled;
  const googleEnabled=managedAuth&&config.googleEnabled;
  const accessMessage=emailEnabled&&googleEnabled
    ? "Use a one-time email code or Google."
    : emailEnabled
      ? "Use a one-time email code."
      : googleEnabled
        ? "Use your Google account."
        : "Account access is temporarily unavailable.";
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><AfricMadeBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell login-task-shell" aria-labelledby="login-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Account access</span>
          <h1 id="login-title">Sign in to AfricMade.</h1>
          <p>Manage your AfricMade page, inquiries, and support.</p>
          <div className="platform-context-note"><strong>Creating an account?</strong><span>Verify your email or Google account, then add your work and contact details.</span></div>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Passwordless access</span><h2>Continue to your account</h2><p>{accessMessage}</p></div>
          <PasswordlessLoginForm emailEnabled={emailEnabled} initialError={p.error || ""} />
          {!emailEnabled&&!googleEnabled?<p className="platform-form-note" role="status">Please try again later or contact AfricMade support.</p>:null}
          {googleEnabled?<><div className="platform-provider-divider"><span>or</span></div><form className="platform-login-provider" action={googleLoginAction}><button type="submit">Continue with Google</button></form></>:null}
          <Link className="platform-return-link" href="/">Return to Market</Link>
        </div>
      </section>
    </main>
  </div>;
}
