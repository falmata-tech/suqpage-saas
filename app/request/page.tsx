import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import MirtPageBrand from "@/components/MirtPageBrand";

export const metadata = { title: "Build your MirtPage showroom", description: "Put your Ethiopian production where retail and wholesale buyers can find it." };

export default function RequestPage() {
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell request-task-shell" aria-labelledby="request-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">For Ethiopian producers</span>
          <h1 id="request-title">Put your production where buyers can find it.</h1>
          <p>Tell us what you make and who you need to reach. We will turn it into a professional showroom and place it inside MirtPage&apos;s discovery marketplace.</p>
          <ol className="platform-task-steps">
            <li><span>01</span><div><strong>Open your workspace</strong><small>Your private business workspace is ready immediately.</small></div></li>
            <li><span>02</span><div><strong>Brief the showroom</strong><small>Describe the business, buyers, products, capabilities, and brand direction.</small></div></li>
            <li><span>03</span><div><strong>Review before launch</strong><small>Nothing appears publicly until you approve the design and MirtPage publishes it.</small></div></li>
          </ol>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Business signup</span><h2>Create your private workspace.</h2><p>Start with the facts you have. A finished catalog is not required.</p></div>
          <SignupForm />
          <div className="platform-form-footer"><span>Already have an account?</span><Link href="/login">Sign in to your workspace</Link></div>
        </div>
      </section>
    </main>
  </div>;
}
