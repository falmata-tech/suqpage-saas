import Link from "next/link";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import MirtPageBrand from "@/components/MirtPageBrand";
import { getDiscoveryView } from "@/lib/discovery";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
    searchParams: Promise<{ industry?: string; scale?: string; q?: string; showroom?: string; page?: string; view?: string; expoDay?: string }>;
}) {
  const query = await searchParams;
  const discovery = getDiscoveryView({ industry: query.industry, scale: query.scale, q: query.q, page: query.page, view: query.view, expoDay: query.expoDay });
  return (
    <div className="landing-home" id="top">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <MirtPageBrand className="landing-brand" />
          <nav className="landing-desktop-nav" aria-label="Public navigation">
            <a href="#discover">Explore Showrooms</a>
            <Link href="/about">About</Link>
            <Link href="/request">Sign up</Link>
            <Link className="landing-login" href="/login">Login</Link>
          </nav>
          <details className="landing-mobile-menu">
            <summary aria-label="Open public navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile public navigation">
              <a href="#discover">Explore Showrooms</a>
              <Link href="/about">About</Link>
              <Link href="/request">Sign up</Link>
              <Link href="/login">Login</Link>
            </nav>
          </details>
        </div>
      </header>

      <main className="landing-market-main">
        {query.showroom === "inactive" ? <div className="landing-account-notice" role="status">That showroom is temporarily unavailable. Discover active businesses below.</div> : null}
        <div className="landing-container landing-market-shell">
          <section className="landing-market-banner" aria-labelledby="landing-title">
            <div><span>Ethiopian products, made visible</span><h1 id="landing-title">Made in Ethiopia. Find the people who make it.</h1></div>
            <p>Search growers, makers, workshops, processors, and factories by product, industry, or location, then visit each business&apos;s digital showroom.</p>
            <a href="#discover">Explore showrooms</a>
          </section>
          <section className="landing-discovery-section" aria-label="MirtPage marketplace">
            <DiscoveryWorkspace discovery={discovery} embedded />
          </section>
        </div>

        <section className="landing-closing" aria-labelledby="closing-title">
          <div className="landing-container landing-closing-inner">
            <div>
              <span className="landing-eyebrow">Your work deserves a clear front door</span>
              <h2 id="closing-title">Make it easier for the right customer to understand what you do.</h2>
              <p>Whether you grow by the season, make by hand, or run a growing production floor, we shape a professional showroom around your products, capacity, capabilities, and brand.</p>
            </div>
            <div className="landing-closing-actions"><Link className="landing-closing-action" href="/request">Start your showroom</Link><Link href="/about">How MirtPage works</Link></div>
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
          <div><MirtPageBrand className="landing-brand" /><p>Permanent digital showrooms for Ethiopia&apos;s makers, growers, workshops, processors, and growing factories.</p></div>
          <nav aria-label="Footer navigation"><Link href="/discover">Explore Showrooms</Link><Link href="/about">About MirtPage</Link><Link href="/request">Sign up</Link><Link href="/login">Login</Link></nav>
          <div className="landing-legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:falmata.dawano@gmail.com">Contact</a><span>© 2026 MirtPage</span></div>
        </div>
      </footer>
    </div>
  );
}
