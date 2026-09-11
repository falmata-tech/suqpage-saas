import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import SignupForm from "@/components/SignupForm";
import AfricMadeBrand from "@/components/AfricMadeBrand";
import { supabaseAuthEnabled } from "@/lib/config";
import { currentSupabaseProviderIdentity } from "@/lib/supabase-auth";

export const metadata = { title: "Set up your account", description: "Add your work and contact details to AfricMade." };

export default async function RequestPage() {
  const identity = supabaseAuthEnabled() ? await currentSupabaseProviderIdentity() : null;
  if (!identity) redirect("/login");
  if (identity.userId) redirect("/dashboard");
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><AfricMadeBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell request-task-shell" aria-labelledby="request-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Account setup</span>
          <h1 id="request-title">Set up your AfricMade account.</h1>
          <p>Add the name, category, and contact details for your work.</p>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Account details</span><h2>About your work</h2><p>You can create an AfricMade page after setup.</p></div>
          <SignupForm email={identity.email} initialName={identity.displayName} />
          <div className="platform-form-footer"><span>Using the wrong account?</span><form action={logoutAction}><button className="platform-link-button" type="submit">Sign out</button></form></div>
        </div>
      </section>
    </main>
  </div>;
}
