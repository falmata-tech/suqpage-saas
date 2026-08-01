import Link from "next/link";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import SuqPageBrand from "@/components/SuqPageBrand";
import { getDiscoveryView } from "@/lib/discovery";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; q?: string; showroom?: string }>;
}) {
  const query = await searchParams;
  const discovery = getDiscoveryView({ industry: query.industry, q: query.q });
  return (
    <div className="landing-home" id="top">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <SuqPageBrand className="landing-brand" />
          <nav className="landing-desktop-nav" aria-label="Public navigation">
            <a href="#discover">Explore Suqs</a>
            <Link href="/about">About</Link>
            <Link href="/request">For businesses</Link>
            <Link className="landing-login" href="/login">Login</Link>
          </nav>
          <details className="landing-mobile-menu">
            <summary aria-label="Open public navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile public navigation">
              <a href="#discover">Explore Suqs</a>
              <Link href="/about">About</Link>
              <Link href="/request">For businesses</Link>
              <Link href="/login">Login</Link>
            </nav>
          </details>
        </div>
      </header>

      <main className="landing-market-main">
        {query.showroom === "inactive" ? <div className="landing-account-notice" role="status">That Suq is temporarily unavailable. Discover active businesses below.</div> : null}
        <div className="landing-container landing-market-shell">
          <section className="landing-market-banner" aria-labelledby="landing-title">
            <div><span>For makers, growers, and product businesses</span><h1 id="landing-title">Give your products one clear place to be found.</h1></div>
            <p>A permanent digital showroom customers can discover by industry, location, and the daily virtual Expo.</p>
            <Link href="/request">Build your Suq</Link>
          </section>
          <section className="landing-discovery-section" aria-label="SuqPage marketplace">
            <DiscoveryWorkspace discovery={discovery} embedded />
          </section>
        </div>

        <section className="landing-closing" aria-labelledby="closing-title">
          <div className="landing-container landing-closing-inner">
            <div>
              <span className="landing-eyebrow">Your work deserves a clear front door</span>
              <h2 id="closing-title">Make it easier for the right customer to understand what you do.</h2>
              <p>Tell us what you make, grow, or process. We will shape a professional Suq around your real products, capabilities, and brand.</p>
            </div>
            <div className="landing-closing-actions"><Link className="landing-closing-action" href="/request">Start your Suq</Link><Link href="/about">How SuqPage works</Link></div>
          </div>
        </section>
      </main>

      <nav className="landing-mobile-tabs" aria-label="Primary navigation">
        <a href="#discover"><span aria-hidden="true">⌖</span>Explore</a>
        <a href="#daily-expo-title"><span aria-hidden="true">★</span>Expo</a>
        <Link href="/about"><span aria-hidden="true">i</span>About</Link>
      </nav>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div><SuqPageBrand className="landing-brand" /><p>Permanent digital showrooms for Ethiopia&apos;s independent makers, growers, and product businesses.</p></div>
          <nav aria-label="Footer navigation"><Link href="/discover">Explore Suqs</Link><Link href="/about">About SuqPage</Link><Link href="/request">For businesses</Link><Link href="/login">Login</Link></nav>
          <div className="landing-legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:falmata.dawano@gmail.com">Contact</a><span>© 2026 SuqPage</span></div>
        </div>
      </footer>
    </div>
  );
}
