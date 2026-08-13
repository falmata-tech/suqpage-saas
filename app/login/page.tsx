import { redirect } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions";
import MirtPageBrand from "@/components/MirtPageBrand";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";
import { currentUser } from "@/lib/auth";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const user = await currentUser();
  if (user) redirect(user.must_change_password ? "/dashboard/account?required=1" : "/dashboard");
  const p=await searchParams;
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link href="/request">Sign up</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link href="/request">Sign up</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell login-task-shell" aria-labelledby="login-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Business workspace</span>
          <h1 id="login-title">Welcome back to MirtPage.</h1>
          <p>Manage your showroom, customer inquiries, design requests, private previews, and support conversations in one protected workspace.</p>
          <div className="platform-context-note"><strong>Not on MirtPage yet?</strong><span>Create a private workspace and present your custom work, ready products, or wholesale supply in one showroom.</span></div>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Account access</span><h2>Sign in</h2><p>Use the email and password connected to your MirtPage account.</p></div>
          <form className="platform-login-form" action={loginAction}>
            {p.error&&<p className="error" role="alert">{p.error}</p>}
            <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" autoComplete="email" required/></div>
            <div className="field"><label htmlFor="login-password">Password</label><input id="login-password" name="password" type="password" autoComplete="current-password" required/></div>
            <button type="submit">Sign in</button>
            <p className="platform-form-note">Staff-created temporary passwords must be changed after the first sign-in.</p>
          </form>
          <div className="platform-form-footer"><span>Need a showroom?</span><Link href="/request">Create your account</Link></div>
          <Link className="platform-return-link" href="/">Return to marketplace</Link>
        </div>
      </section>
    </main>
    <PublicMobileNavigation />
  </div>;
}
