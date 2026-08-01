import { redirect } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions";
import SuqPageBrand from "@/components/SuqPageBrand";
import { currentUser } from "@/lib/auth";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const user = await currentUser();
  if (user) redirect(user.must_change_password ? "/dashboard/account?required=1" : "/dashboard");
  const p=await searchParams;
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><SuqPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Suqs</Link><Link href="/about">About</Link><Link href="/request">For businesses</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Suqs</Link><Link href="/about">About</Link><Link href="/request">For businesses</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell login-task-shell" aria-labelledby="login-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Private workspace</span>
          <h1 id="login-title">Welcome back to SuqPage.</h1>
          <p>Follow showroom requests, customer inquiries, delivery activity, and private previews in one protected workspace.</p>
          <div className="platform-context-note"><strong>Access is assigned by SuqPage.</strong><span>New accounts confirm a private invitation and change their temporary password before continuing.</span></div>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Account access</span><h2>Sign in</h2><p>Use the email and password connected to your SuqPage account.</p></div>
          <form className="platform-login-form" action={loginAction}>
            {p.error&&<p className="error" role="alert">{p.error}</p>}
            <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" autoComplete="email" required/></div>
            <div className="field"><label htmlFor="login-password">Password</label><input id="login-password" name="password" type="password" autoComplete="current-password" required/></div>
            <button type="submit">Sign in</button>
            <p className="platform-form-note">Temporary passwords must be changed after the first sign-in.</p>
          </form>
          <Link className="platform-return-link" href="/">Return to marketplace</Link>
        </div>
      </section>
    </main>
  </div>;
}
