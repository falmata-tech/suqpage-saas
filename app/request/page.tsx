import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import MirtPageBrand from "@/components/MirtPageBrand";

export const metadata = { title: "Request a MirtPage showroom" };

export default function RequestPage() {
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell request-task-shell" aria-labelledby="request-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Business signup</span>
          <h1 id="request-title">Start your MirtPage showroom.</h1>
          <p>Create a private workspace and tell us what your business makes, grows, or produces. Your showroom stays private while we design it with you.</p>
          <ol className="platform-task-steps">
            <li><span>01</span><div><strong>Create your account</strong><small>Your business workspace opens immediately.</small></div></li>
            <li><span>02</span><div><strong>Describe your showroom</strong><small>Start with a clear written brief; the imported design creates the image checklist.</small></div></li>
            <li><span>03</span><div><strong>Review before publication</strong><small>Nothing appears publicly until you approve the design and MirtPage publishes it.</small></div></li>
          </ol>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Business signup</span><h2>Create your private workspace.</h2><p>No payment or finished catalog is needed to begin.</p></div>
          <SignupForm />
          <div className="platform-form-footer"><span>Already have an account?</span><Link href="/login">Sign in to your workspace</Link></div>
        </div>
      </section>
    </main>
  </div>;
}
