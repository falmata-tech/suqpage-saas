import Link from "next/link";
import RequestForm from "@/components/RequestForm";
import SuqPageBrand from "@/components/SuqPageBrand";

export const metadata = { title: "Request a SuqPage showroom" };

export default function RequestPage() {
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><SuqPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Suqs</Link><Link href="/about">About</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Suqs</Link><Link href="/about">About</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell request-task-shell" aria-labelledby="request-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">Get a SuqPage showroom</span>
          <h1 id="request-title">Introduce your business. We’ll take it from there.</h1>
          <p>Start with your contact details and a short note about what you make, grow, process, or supply.</p>
          <ol className="platform-task-steps">
            <li><span>01</span><div><strong>Tell us what you do</strong><small>No catalog setup or image upload is needed here.</small></div></li>
            <li><span>02</span><div><strong>SuqPage reviews the fit</strong><small>Submitting interest does not create an account or publish a page.</small></div></li>
            <li><span>03</span><div><strong>Continue privately</strong><small>Accepted businesses receive an invitation for the detailed work.</small></div></li>
          </ol>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Expression of interest</span><h2>Start with the essentials.</h2><p>We will use this information only to review your interest and contact you.</p></div>
          <RequestForm />
          <div className="platform-form-footer"><span>Already have an account?</span><Link href="/login">Sign in to your workspace</Link></div>
        </div>
      </section>
    </main>
  </div>;
}
