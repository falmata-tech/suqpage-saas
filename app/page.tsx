import Image from "next/image";
import Link from "next/link";
import BazaarMap from "@/components/BazaarMap";
import ShowroomDirectory, { type ShowroomDirectoryEntry } from "@/components/ShowroomDirectory";
import SuqPageBrand from "@/components/SuqPageBrand";
import { listBazaarAdminState } from "@/lib/bazaar";
import { getAllBusinesses, getCatalogByBusinessId } from "@/lib/db";

export const dynamic = "force-dynamic";

const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const scheduleMarks: Record<string, string> = {
  monitor: "TV",
  sparkle: "+",
  leaf: "LF",
  gear: "GR",
  home: "HM",
  shirt: "TS",
  star: "ST",
};

export default function Home() {
  const businesses = getAllBusinesses().filter((business) => business.status === "active");
  const bazaarState = listBazaarAdminState();
  const bazaar = bazaarState.current;
  const schedule = [...bazaarState.themes].sort((left, right) => (left.weekday || 7) - (right.weekday || 7));
  const profilesByBusinessId = new Map(bazaarState.profiles.map((profile) => [profile.businessId, profile]));

  const directoryEntries: ShowroomDirectoryEntry[] = businesses.map((business) => {
    const catalog = getCatalogByBusinessId(business.id);
    const profile = profilesByBusinessId.get(business.id);
    const industry = profile?.industryLabel || "Community Market";
    const searchable = [
      business.name,
      business.handle,
      business.tagline,
      business.description,
      business.hero_title,
      business.hero_subtitle,
      industry,
      ...((catalog?.categories || []).map((item) => item.name)),
      ...((catalog?.collections || []).map((item) => `${item.name} ${item.description}`)),
      ...((catalog?.products || []).map((item) => `${item.name} ${item.eyebrow} ${item.description} ${item.category_name || ""} ${item.collection_name || ""}`)),
    ].join(" ").toLowerCase();
    return {
      id: business.id,
      handle: business.handle,
      name: business.name,
      tagline: business.tagline,
      imageUrl: business.hero_image_path || business.logo_path || "",
      industry,
      searchText: searchable,
      featured: true,
    };
  });

  return (
    <div className="marketplace-home" id="top">
      <header className="marketplace-header">
        <div className="market-container marketplace-nav-shell">
          <SuqPageBrand className="marketplace-brand" />
          <nav className="marketplace-desktop-nav" aria-label="Public navigation">
            <a href="#bazaar">Bazaar</a>
            <a href="#showrooms">All Showrooms</a>
            <Link className="market-nav-cta" href="/request">Get a Showroom</Link>
            <Link className="market-login" href="/login"><span className="login-icon" aria-hidden="true" /> Login</Link>
          </nav>
          <details className="marketplace-mobile-menu">
            <summary aria-label="Open public navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile public navigation">
              <a href="#bazaar">Bazaar</a>
              <a href="#showrooms">All Showrooms</a>
              <Link href="/request">Get a Showroom</Link>
              <Link href="/login">Login</Link>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <div className="market-container market-home-frame">
          <section className="market-hero" aria-labelledby="market-hero-title">
            <Image
              className="market-hero-image"
              src="/landing/maker-workshop-hero.jpg"
              alt="A furniture maker shaping wood in his workshop"
              fill
              priority
              sizes="(max-width: 720px) 100vw, 1240px"
            />
            <div className="market-hero-shade" />
            <div className="market-hero-copy">
              <h1 id="market-hero-title">Your products.<br />Your story.<br /><span>Your own showroom.</span></h1>
              <p>For artisans, growers, producers, and small manufacturers. Show what you sell, explain your process, receive customer inquiries, and share your own /@handle.</p>
              <div className="market-hero-actions">
                <Link className="market-primary-action" href="/request">Get your SuqPage showroom <span aria-hidden="true">→</span></Link>
              </div>
              <div className="market-benefits" aria-label="Showroom benefits">
                <span><i aria-hidden="true">@</i>Your own<br />/@handle</span>
                <span><i aria-hidden="true">P</i>Show your<br />products</span>
                <span><i aria-hidden="true">Q</i>Receive customer<br />inquiries</span>
                <span><i aria-hidden="true">B</i>Join weekly<br />Bazaars</span>
              </div>
            </div>
            <aside className="market-hero-bazaar" aria-label="Today's Bazaar">
              <div>
                <span className="market-kicker">Today&apos;s Bazaar</span>
                <span className="market-theme-mark" aria-hidden="true">{scheduleMarks[schedule.find((theme) => theme.slug === bazaar.themeSlug)?.icon || "star"] || "ST"}</span>
              </div>
              <h2>{bazaar.themeName}</h2>
              <span className={`market-live-status ${bazaar.status}`}>{bazaar.status === "live" ? "Live now" : bazaar.status}</span>
              <p>New discoveries. Real businesses.<br />Changes daily at 4:00 AM.</p>
              <a href="#bazaar">View today&apos;s Bazaar <span aria-hidden="true">→</span></a>
            </aside>
          </section>

          <section className="market-section market-bazaar-section" id="bazaar">
            <BazaarMap bazaar={bazaar} embedded />
          </section>

          <section className="market-section market-showrooms" id="showrooms" aria-labelledby="showrooms-title">
            <div className="market-section-heading">
              <div>
                <span className="market-kicker">Permanent showrooms</span>
                <h2 id="showrooms-title">Explore SuqPage</h2>
                <p>Search every business once. Featured showrooms appear first without creating a second catalog.</p>
              </div>
            </div>
            <ShowroomDirectory entries={directoryEntries} />
          </section>

          <section className="market-schedule" aria-labelledby="schedule-title">
            <div className="market-schedule-heading">
              <span className="market-kicker">Changes every morning</span>
              <h2 id="schedule-title">This week&apos;s Bazaar</h2>
            </div>
            <div className="market-schedule-rail">
              {schedule.map((theme) => (
                <article key={theme.id} className={`market-schedule-card market-schedule-${theme.icon}${theme.slug === bazaar.themeSlug ? " active" : ""}`}>
                  <strong>{weekdayLabels[theme.weekday]}</strong>
                  <span className="market-schedule-mark" aria-hidden="true">{scheduleMarks[theme.icon] || "SP"}</span>
                  <p>{theme.name}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="market-closing" aria-labelledby="market-closing-title">
            <div>
              <span className="market-kicker">Your business, clearly presented</span>
              <h2 id="market-closing-title">Ready to give your business a showroom of its own?</h2>
              <p>Tell us what you sell and how customers reach you. We&apos;ll help shape it into a polished SuqPage showroom.</p>
            </div>
            <Link className="market-closing-action" href="/request">Tell us about your business <span aria-hidden="true">→</span></Link>
          </section>
        </div>
      </main>

      <nav className="market-mobile-tabs" aria-label="Marketplace navigation">
        <a href="#top"><span aria-hidden="true">⌂</span>Home</a>
        <a href="#bazaar"><span aria-hidden="true">⌖</span>Bazaar</a>
        <a href="#showrooms"><span aria-hidden="true">▦</span>Showrooms</a>
        <Link href="/login"><span aria-hidden="true">○</span>Account</Link>
      </nav>

      <footer className="market-footer">
        <div className="market-container">
          <SuqPageBrand className="marketplace-brand" />
          <nav aria-label="Footer navigation"><a href="#bazaar">Bazaar</a><a href="#showrooms">All Showrooms</a><Link href="/request">Get a Showroom</Link><Link href="/login">Login</Link></nav>
          <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:falmata.dawano@gmail.com">Contact</a><span>© 2026 SuqPage</span></div>
        </div>
      </footer>
    </div>
  );
}
