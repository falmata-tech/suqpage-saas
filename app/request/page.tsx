import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import MirtPageBrand from "@/components/MirtPageBrand";

export const metadata = { title: "Build your MirtPage showroom", description: "Create a private workspace and begin a professional showroom for your Ethiopian-made products or production capabilities." };

export default function RequestPage() {
  return <div className="landing-home platform-task-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Showrooms</Link><Link href="/about">About</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main className="platform-task-main">
      <section className="platform-task-shell request-task-shell" aria-labelledby="request-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">For local producers</span>
          <h1 id="request-title">Give your products a professional place to be found.</h1>
          <p>You have already invested in making, growing, or processing something here. Create a private workspace and we will shape that work into a showroom for consumer and wholesale buyers.</p>
          <ol className="platform-task-steps">
            <li><span>01</span><div><strong>Open your workspace</strong><small>Your private business workspace is ready immediately.</small></div></li>
            <li><span>02</span><div><strong>Show us what you produce</strong><small>Describe your business, buyers, products, capabilities, and preferred brand direction.</small></div></li>
            <li><span>03</span><div><strong>Approve your showroom</strong><small>Nothing appears publicly until you approve the design and MirtPage publishes it.</small></div></li>
          </ol>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>Business signup</span><h2>Create your private workspace.</h2><p>Begin with your business and what you produce. No payment or finished catalog is required.</p></div>
          <SignupForm />
          <div className="platform-form-footer"><span>Already have an account?</span><Link href="/login">Sign in to your workspace</Link></div>
        </div>
      </section>
    </main>
  </div>;
}
