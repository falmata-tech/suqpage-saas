import Link from "next/link";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import MirtPageBrand from "@/components/MirtPageBrand";
import { getDiscoveryView } from "@/lib/discovery";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
    searchParams: Promise<{ industry?: string; q?: string; showroom?: string; page?: string; view?: string; expoDay?: string }>;
}) {
  const query = await searchParams;
  const discovery = await getDiscoveryView({ industry: query.industry, q: query.q, page: query.page, view: query.view, expoDay: query.expoDay });
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
            <div><span>A marketplace for Ethiopian production</span><h1 id="landing-title">Find what Ethiopia makes.</h1></div>
            <p>Search workshops, growers, processors, and growing factories by product or place. See the work, visit the showroom, and start a direct retail or wholesale inquiry.</p>
            <a href="#discover">Explore showrooms</a>
          </section>
          <section className="landing-discovery-section" aria-label="MirtPage marketplace">
            <DiscoveryWorkspace discovery={discovery} embedded />
          </section>
        </div>

        <section className="landing-closing" aria-labelledby="closing-title">
          <div className="landing-container landing-closing-inner">
            <div>
              <span className="landing-eyebrow">For people who bet on making locally</span>
              <h2 id="closing-title">You built the product. We build the place buyers find it.</h2>
              <p>Get a professional showroom, a reviewed location on the national marketplace, and a direct path to retail and wholesale buyers without taking on the machinery of an ecommerce operation.</p>
            </div>
            <div className="landing-closing-actions"><Link className="landing-closing-action" href="/request">Build your showroom</Link><Link href="/about">Why MirtPage exists</Link></div>
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
          <div><MirtPageBrand className="landing-brand" /><p>The discovery marketplace for products made, grown, and processed in Ethiopia.</p></div>
          <nav aria-label="Footer navigation"><Link href="/discover">Explore Showrooms</Link><Link href="/about">About MirtPage</Link><Link href="/request">Sign up</Link><Link href="/login">Login</Link></nav>
          <div className="landing-legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:falmata.dawano@gmail.com">Contact</a><span>© 2026 MirtPage</span></div>
        </div>
      </footer>
    </div>
  );
}
