import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SuqpageBrand from "@/components/SuqpageBrand";
import PasswordlessLoginForm from "@/components/PasswordlessLoginForm";
import { supabaseAuthConfig, supabaseAuthEnabled } from "@/lib/config";
import { currentSupabaseProviderIdentity } from "@/lib/supabase-auth";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  await connection();
  const managedAuth = supabaseAuthEnabled();
  const identity = managedAuth ? await currentSupabaseProviderIdentity() : null;
  if (identity) redirect(identity.userId ? "/dashboard" : "/request");
  const p=await searchParams;
  const config=supabaseAuthConfig();
  const emailEnabled=managedAuth&&config.emailOtpEnabled;
  const accessMessage=emailEnabled
    ? "Use a one-time email code."
    : "Account access is temporarily unavailable.";
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><SuqpageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell login-task-shell" aria-labelledby="login-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Account access</span>
          <h1 id="login-title">Sign in to Suqpage.</h1>
          <p>Your shop, products, and customer inquiries in one place.</p>
          <div className="platform-context-note"><strong>New here?</strong><span>The same sign-in creates your account. Add your shop details next.</span></div>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Passwordless access</span><h2>Continue to your account</h2><p>{accessMessage}</p></div>
          <PasswordlessLoginForm emailEnabled={emailEnabled} initialError={p.error || ""} />
          {!emailEnabled?<p className="platform-form-note" role="status">Please try again later or contact Suqpage support.</p>:null}
          <Link className="platform-return-link" href="/">Return to Market</Link>
        </div>
      </section>
    </main>
  </div>;
}
