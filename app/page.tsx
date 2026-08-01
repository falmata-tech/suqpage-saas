import Image from "next/image";
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
            <a href="#discover">Discover Suqs</a>
            <a href="#for-makers">For small businesses</a>
            <Link href="/request">Get your SuqPage</Link>
            <Link className="landing-login" href="/login">Login</Link>
          </nav>
          <details className="landing-mobile-menu">
            <summary aria-label="Open public navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile public navigation">
              <a href="#discover">Discover Suqs</a>
              <a href="#for-makers">For small businesses</a>
              <Link href="/request">Get your SuqPage</Link>
              <Link href="/login">Login</Link>
            </nav>
          </details>
        </div>
      </header>

      <main>
        {query.showroom === "inactive" ? <div className="landing-account-notice" role="status">That Suq is temporarily unavailable. Discover active businesses below.</div> : null}
        <section className="landing-hero" aria-labelledby="landing-title">
          <Image className="landing-hero-image" src="/landing/maker-workshop-hero.jpg" alt="A maker working inside a small production workshop" fill priority sizes="100vw" />
          <div className="landing-hero-overlay" />
          <div className="landing-container landing-hero-inner">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">Made here. Easier to discover.</span>
              <h1 id="landing-title">A permanent place for the products Ethiopia makes.</h1>
              <p>
                Discover small workshops, growers, food processors, craftspeople,
                and home brands by industry and city. Each has a clear Suq where
                you can understand the work, choose what interests you, and ask
                the business directly.
              </p>
              <div className="landing-hero-actions">
                <a className="landing-primary-action" href="#discover">Discover a Suq</a>
                <Link className="landing-secondary-action" href="/request">Get your SuqPage</Link>
              </div>
            </div>
            <a className="landing-hero-note" href="#discover">
              <span>Start with an industry</span>
              <strong>{discovery.industries.length} ways to explore</strong>
              <p>Then move through Ethiopia&apos;s City Suqs and visit the businesses that fit.</p>
              <b>Open discovery</b>
            </a>
          </div>
        </section>

        <section className="landing-benefits" aria-label="SuqPage benefits">
          <div className="landing-container landing-benefit-grid">
            <article><span>01</span><h2>Find the real maker</h2><p>Move past scattered posts and understand who makes the product.</p></article>
            <article><span>02</span><h2>Browse by place</h2><p>Enter a City Suq and discover independent businesses around it.</p></article>
            <article><span>03</span><h2>Choose without checkout pressure</h2><p>Build an inquiry around products, custom work, or a seasonal batch.</p></article>
            <article><span>04</span><h2>Talk directly</h2><p>Send one organized inquiry while the owner keeps the relationship.</p></article>
          </div>
        </section>

        <section className="landing-story" id="for-makers" aria-labelledby="maker-title">
          <div className="landing-container landing-story-grid">
            <div>
              <span className="landing-eyebrow">For businesses already doing real work</span>
              <h2 id="maker-title">Your location should not decide how seriously people see your business.</h2>
            </div>
            <div>
              <p>
                Many useful Ethiopian products begin in a workshop, a farm, a
                family kitchen, or a room at home. The work is real, but the
                information is split across old posts, messages, and phone calls.
              </p>
              <p>
                SuqPage gives that business a permanent digital showroom without
                pretending it is a large corporation or forcing it into a rigid
                online store. Products, custom capabilities, seasonal availability,
                story, and contact all become easy to understand.
              </p>
              <Link href="/request">Tell us about your business</Link>
            </div>
          </div>
        </section>

        <section className="landing-discovery-section">
          <div className="landing-container">
            <DiscoveryWorkspace discovery={discovery} embedded />
          </div>
        </section>

        <section className="landing-closing" aria-labelledby="closing-title">
          <div className="landing-container landing-closing-inner">
            <div>
              <span className="landing-eyebrow">A showroom without the showroom rent</span>
              <h2 id="closing-title">Give your products one clear place to be found.</h2>
              <p>Tell us what you make, grow, or process. We will help organize it into a professional Suq that still feels like your business.</p>
            </div>
            <Link className="landing-closing-action" href="/request">Get your SuqPage</Link>
          </div>
        </section>
      </main>

      <nav className="landing-mobile-tabs" aria-label="Primary navigation">
        <a href="#top"><span aria-hidden="true">⌂</span>Home</a>
        <a href="#discover"><span aria-hidden="true">⌖</span>Discover</a>
        <Link href="/request"><span aria-hidden="true">＋</span>Join</Link>
      </nav>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div><SuqPageBrand className="landing-brand" /><p>Permanent digital showrooms for Ethiopia&apos;s independent makers, growers, and product businesses.</p></div>
          <nav aria-label="Footer navigation"><Link href="/discover">Discover Suqs</Link><Link href="/request">Get your SuqPage</Link><Link href="/login">Login</Link></nav>
          <div className="landing-legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:falmata.dawano@gmail.com">Contact</a><span>© 2026 SuqPage</span></div>
        </div>
      </footer>
    </div>
  );
}
