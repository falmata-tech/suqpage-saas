import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import SignupForm from "@/components/SignupForm";
import SuqpageBrand from "@/components/SuqpageBrand";
import { supabaseAuthEnabled } from "@/lib/config";
import { currentSupabaseProviderIdentity } from "@/lib/supabase-auth";

export const metadata = { title: "Set up your shop", description: "Add your shop and contact details to Suqpage." };

export default async function RequestPage() {
  const identity = supabaseAuthEnabled() ? await currentSupabaseProviderIdentity() : null;
  if (!identity) redirect("/login");
  if (identity.userId) redirect("/dashboard");
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><SuqpageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Market</Link><Link href="/about">About</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell request-task-shell" aria-labelledby="request-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Account setup</span>
          <h1 id="request-title">Set up your shop.</h1>
          <p>Start with a name, category, and contact number.</p>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Shop details</span><h2>Introduce your business</h2><p>You can add products and prepare your page after setup.</p></div>
          <SignupForm email={identity.email} initialName={identity.displayName} />
          <div className="platform-form-footer"><span>Using the wrong account?</span><form action={logoutAction}><button className="platform-link-button" type="submit">Sign out</button></form></div>
        </div>
      </section>
    </main>
  </div>;
}
