import Image from "next/image";
import Link from "next/link";
import ExpoMap from "@/components/ExpoMap";
import ShowroomDirectory, {
  type ShowroomDirectoryEntry,
} from "@/components/ShowroomDirectory";
import SuqPageBrand from "@/components/SuqPageBrand";
import { listBazaarAdminState } from "@/lib/bazaar";
import { getAllBusinesses, getCatalogByBusinessId } from "@/lib/db";
import { getCurrentExpo } from "@/lib/expo";

export const dynamic = "force-dynamic";

const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const scheduleMarks: Record<string, string> = {
  monitor: "01",
  sparkle: "02",
  leaf: "03",
  gear: "04",
  home: "05",
  shirt: "06",
  star: "07",
};

export default function Home() {
  const businesses = getAllBusinesses().filter(
    (business) => business.status === "active",
  );
  const legacyAdminState = listBazaarAdminState();
  const expo = getCurrentExpo();
  const schedule = [...legacyAdminState.themes].sort(
    (left, right) => (left.weekday || 7) - (right.weekday || 7),
  );
  const profilesByBusinessId = new Map(
    legacyAdminState.profiles.map((profile) => [profile.businessId, profile]),
  );

  const directoryEntries: ShowroomDirectoryEntry[] = businesses.map((business) => {
    const catalog = getCatalogByBusinessId(business.id);
    const profile = profilesByBusinessId.get(business.id);
    const industry = profile?.industryLabel || "Enterprise & Export";
    const searchable = [
      business.name,
      business.handle,
      business.tagline,
      business.description,
      business.hero_title,
      business.hero_subtitle,
      industry,
      ...(catalog?.categories || []).map((item) => item.name),
      ...(catalog?.products || []).map(
        (item) =>
          `${item.name} ${item.eyebrow} ${item.description} ${item.category_name || ""}`,
      ),
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
    <div className="landing-home" id="top">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <SuqPageBrand className="landing-brand" />
          <nav className="landing-desktop-nav" aria-label="Public navigation">
            <a href="#expo">Live Expo</a>
            <a href="#showrooms">Showrooms</a>
            <Link href="/request">For producers</Link>
            <Link className="landing-login" href="/login">Login</Link>
          </nav>
          <details className="landing-mobile-menu">
            <summary aria-label="Open public navigation">
              <span /><span /><span />
            </summary>
            <nav aria-label="Mobile public navigation">
              <a href="#expo">Live Expo</a>
              <a href="#showrooms">Showrooms</a>
              <Link href="/request">Get a Showroom</Link>
              <Link href="/login">Login</Link>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <Image
            className="landing-hero-image"
            src="/landing/maker-workshop-hero.jpg"
            alt="A producer shaping a product in a working workshop"
            fill
            priority
            sizes="100vw"
          />
          <div className="landing-hero-overlay" />
          <div className="landing-container landing-hero-inner">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">Built for people who make and grow</span>
              <h1 id="landing-title">Virtual showrooms and daily Expos for producers.</h1>
              <p>
                Present products clearly, tell the production story, and receive
                direct inquiries through a permanent SuqPage showroom. From
                emerging growers to established manufacturers.
              </p>
              <div className="landing-hero-actions">
                <Link className="landing-primary-action" href="/request">
                  Get a SuqPage showroom
                </Link>
                <a className="landing-secondary-action" href="#expo">
                  Explore today&apos;s Expo
                </a>
              </div>
            </div>
            <a className="landing-live-panel" href="#expo">
              <span className="landing-live-label"><i /> Live today</span>
              <strong>{expo.themeName}</strong>
              <span>
                {expo.map.hubs.length} regional Expos · {expo.booths.length} open booths
              </span>
              <b>Open Expo Map</b>
            </a>
          </div>
        </section>

        <section className="landing-benefits" aria-label="SuqPage benefits">
          <div className="landing-container landing-benefit-grid">
            <article><span>01</span><h2>One permanent showroom</h2><p>A clear /@handle for products, capabilities, and inquiries.</p></article>
            <article><span>02</span><h2>Daily Industry visibility</h2><p>Join the rotating Expo wherever eligible producers gather.</p></article>
            <article><span>03</span><h2>Regional discovery</h2><p>Buyers can move from Ethiopia overview to a regional booth.</p></article>
            <article><span>04</span><h2>Direct business inquiry</h2><p>Move serious interest into one structured conversation.</p></article>
          </div>
        </section>

        <section className="landing-expo-section" id="expo">
          <div className="landing-container">
            <div className="landing-section-intro">
              <div>
                <span className="landing-eyebrow">A different Industry every day</span>
                <h2>See where today&apos;s Expo is active.</h2>
              </div>
              <p>
                Every active region becomes an Expo hub when enough participating
                businesses are present. Smaller regional groups join their nearest
                active hub while keeping their real origin visible.
              </p>
            </div>
            <ExpoMap expo={expo} embedded />
          </div>
        </section>

        <section className="landing-schedule" aria-labelledby="schedule-title">
          <div className="landing-container">
            <div className="landing-schedule-head">
              <div>
                <span className="landing-eyebrow">Seven days of production</span>
                <h2 id="schedule-title">The Expo changes every morning.</h2>
              </div>
              <p>Each daily floor highlights one Industry while permanent showrooms stay open all week.</p>
            </div>
            <div className="landing-schedule-grid">
              {schedule.map((theme) => (
                <article
                  key={theme.id}
                  className={theme.slug === expo.themeSlug ? "active" : ""}
                >
                  <span>{scheduleMarks[theme.icon] || "00"}</span>
                  <strong>{weekdayLabels[theme.weekday]}</strong>
                  <p>{theme.name.replace(/Market/g, "Expo")}</p>
                  {theme.slug === expo.themeSlug ? <small>Live today</small> : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-showrooms"
          id="showrooms"
          aria-labelledby="showrooms-title"
        >
          <div className="landing-container">
            <div className="landing-section-intro">
              <div>
                <span className="landing-eyebrow">Permanent business profiles</span>
                <h2 id="showrooms-title">Find a showroom.</h2>
              </div>
              <p>
                Search producers, products, and capabilities across every active
                showroom. Featured businesses appear first inside the same result set.
              </p>
            </div>
            <ShowroomDirectory entries={directoryEntries} />
          </div>
        </section>

        <section className="landing-closing" aria-labelledby="closing-title">
          <div className="landing-container landing-closing-inner">
            <div>
              <span className="landing-eyebrow">Your products deserve a useful presence</span>
              <h2 id="closing-title">Bring your business into the next Expo.</h2>
              <p>
                Tell us what you produce, where you operate, and how buyers should
                inquire. We will shape it into a permanent showroom and prepare
                your Expo booth.
              </p>
            </div>
            <Link className="landing-closing-action" href="/request">
              Start your showroom request
            </Link>
          </div>
        </section>
      </main>

      <nav className="landing-mobile-tabs" aria-label="Marketplace navigation">
        <a href="#top"><span aria-hidden="true">⌂</span>Home</a>
        <a href="#expo"><span aria-hidden="true">⌖</span>Expo</a>
        <a href="#showrooms"><span aria-hidden="true">▦</span>Showrooms</a>
        <Link href="/request"><span aria-hidden="true">＋</span>Join</Link>
      </nav>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div>
            <SuqPageBrand className="landing-brand" />
            <p>Permanent showrooms and regional daily Expos for people who make and grow.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#expo">Live Expo</a>
            <a href="#showrooms">Showrooms</a>
            <Link href="/request">Get a Showroom</Link>
            <Link href="/login">Login</Link>
          </nav>
          <div className="landing-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:falmata.dawano@gmail.com">Contact</a>
            <span>© 2026 SuqPage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
