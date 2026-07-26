import Image from "next/image";
import Link from "next/link";
import BazaarMap from "@/components/BazaarMap";
import ShowroomDirectory, { type ShowroomDirectoryEntry } from "@/components/ShowroomDirectory";
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
    const category = catalog?.categories[0]?.name || catalog?.collections[0]?.name || industry;
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
      category,
      searchText: searchable,
    };
  });
  const featuredEntries = directoryEntries.filter((entry) => profilesByBusinessId.get(entry.id)?.featured);

  return (
    <div className="marketplace-home">
      <header className="marketplace-header">
        <div className="market-container marketplace-nav-shell">
          <Link href="/" className="marketplace-brand" aria-label="SuqPage home">
            <Image src="/uploads/seed/suqpage/icon.png" alt="" width={38} height={38} priority />
            <span>SuqPage</span>
          </Link>
          <nav className="marketplace-desktop-nav" aria-label="Public navigation">
            <a href="#bazaar">Bazaar</a>
            <a href="#showrooms">All Showrooms</a>
            <a href="#how-it-works">About SuqPage</a>
            <Link className="market-nav-cta" href="/request">Get a Showroom</Link>
            <Link className="market-login" href="/login"><span className="login-icon" aria-hidden="true" /> Login</Link>
          </nav>
          <details className="marketplace-mobile-menu">
            <summary aria-label="Open public navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile public navigation">
              <a href="#bazaar">Bazaar</a>
              <a href="#showrooms">All Showrooms</a>
              <a href="#how-it-works">About SuqPage</a>
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
                <a className="market-secondary-action" href="#how-it-works">How it works <span className="play-icon" aria-hidden="true" /></a>
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

          <section className="market-schedule" aria-labelledby="schedule-title">
            <h2 id="schedule-title">This week&apos;s bazaar schedule</h2>
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

          <section className="market-section market-showrooms" id="showrooms" aria-labelledby="showrooms-title">
            <div className="market-section-heading">
              <div>
                <h2 id="showrooms-title">All Showrooms</h2>
                <p>Every business on SuqPage. Search by name, /@handle, product, category, or industry.</p>
              </div>
              <a className="market-heading-link" href="#showroom-results">View all showrooms <span aria-hidden="true">›</span></a>
            </div>
            <ShowroomDirectory entries={directoryEntries} />
          </section>

          <section className="market-section market-bazaar-section" id="bazaar">
            <BazaarMap bazaar={bazaar} embedded />
          </section>

          <section className="market-section market-featured" aria-labelledby="featured-title">
            <div className="market-section-heading">
              <div>
                <h2 id="featured-title">Featured businesses <span>— extra visibility</span></h2>
              </div>
              <Link className="market-heading-link" href="/request">Learn about featured placement <span aria-hidden="true">›</span></Link>
            </div>
            {featuredEntries.length ? (
              <div className="featured-rail">
                {featuredEntries.map((entry) => (
                  <Link href={`/@${entry.handle}`} className="featured-card" key={entry.id}>
                    <div className="featured-media">
                      {entry.imageUrl ? <Image src={entry.imageUrl} alt="" width={520} height={280} sizes="260px" /> : <span className="market-media-fallback">{entry.name.slice(0, 1)}</span>}
                      <span>Featured</span>
                    </div>
                    <div><strong>{entry.name}</strong><span>/@{entry.handle}</span><small>{entry.industry}</small></div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="featured-empty">
                <div><span className="market-kicker">Featured placement</span><h3>Extra visibility, clearly labeled.</h3><p>Featured campaigns are separate from the weekly Bazaar included with every showroom.</p></div>
                <Link className="market-primary-action" href="/request">Ask about featured placement <span aria-hidden="true">→</span></Link>
              </div>
            )}
          </section>

          <section className="market-section market-how" id="how-it-works" aria-labelledby="how-title">
            <div className="market-how-main">
              <h2 id="how-title">How SuqPage works</h2>
              <ol>
                <li><span>1</span><div><strong>Get your showroom</strong><p>Create your /@handle showroom.</p></div></li>
                <li><span>2</span><div><strong>Showcase your work</strong><p>Add products and process.</p></div></li>
                <li><span>3</span><div><strong>Get inquiries</strong><p>Customers send clear requests.</p></div></li>
                <li><span>4</span><div><strong>Join weekly Bazaars</strong><p>Appear on your industry day.</p></div></li>
                <li><span>5</span><div><strong>Grow your business</strong><p>Share and build visibility.</p></div></li>
              </ol>
            </div>
            <aside className="market-final-cta">
              <h2>Join makers and businesses growing with SuqPage.</h2>
              <Link className="market-primary-action" href="/request">Get your showroom <span aria-hidden="true">→</span></Link>
            </aside>
          </section>
        </div>
      </main>

      <footer className="market-footer">
        <div className="market-container">
          <Link href="/" className="marketplace-brand"><Image src="/uploads/seed/suqpage/icon.png" alt="" width={32} height={32} /><span>SuqPage</span></Link>
          <nav aria-label="Footer navigation"><a href="#bazaar">Bazaar</a><a href="#showrooms">All Showrooms</a><a href="#how-it-works">About SuqPage</a><Link href="/request">Get a Showroom</Link><Link href="/login">Login</Link></nav>
          <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:falmata.dawano@gmail.com">Contact</a><span>© 2026 SuqPage</span></div>
        </div>
      </footer>
    </div>
  );
}
