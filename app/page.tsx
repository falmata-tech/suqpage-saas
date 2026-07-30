import Image from "next/image";
import Link from "next/link";
import ExpoMap from "@/components/ExpoMap";
import ShowroomDirectory from "@/components/ShowroomDirectory";
import SuqPageBrand from "@/components/SuqPageBrand";
import { listBazaarThemes } from "@/lib/bazaar";
import { getCurrentExpo } from "@/lib/expo";
import {
  listPublicIndustries,
  listPublicShowrooms,
} from "@/lib/scalable-queries";

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    showroomPage?: string;
    showroomQ?: string;
    showroomIndustry?: string;
    showroomSort?: string;
  }>;
}) {
  const query = await searchParams;
  const directoryQuery = String(query.showroomQ || "");
  const directoryIndustry = String(query.showroomIndustry || "all");
  const directorySort = query.showroomSort === "handle" ? "handle" : "name";
  const directory = listPublicShowrooms({
    page: query.showroomPage,
    q: directoryQuery,
    industry: directoryIndustry,
    sort: directorySort,
  });
  const industries = listPublicIndustries();
  const expoThemes = listBazaarThemes();
  const expo = getCurrentExpo();
  const schedule = [...expoThemes].sort(
    (left, right) => (left.weekday || 7) - (right.weekday || 7),
  );
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
              <h1 id="landing-title">Virtual showrooms and daily Expos for makers, growers, and manufacturers.</h1>
              <p>
                Present products and production capabilities clearly, tell the
                business story, and receive direct inquiries through a permanent
                SuqPage showroom. From independent growers and workshops to
                established factories and producer cooperatives.
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
                {expo.map.hubs.length} host cities · {expo.booths.length} open booths
              </span>
              <b>Open Expo Map</b>
            </a>
          </div>
        </section>

        <section className="landing-benefits" aria-label="SuqPage benefits">
          <div className="landing-container landing-benefit-grid">
            <article><span>01</span><h2>One permanent showroom</h2><p>A clear /@handle for products, capabilities, and inquiries.</p></article>
            <article><span>02</span><h2>Daily Industry visibility</h2><p>Join the rotating Expo wherever eligible producers gather.</p></article>
            <article><span>03</span><h2>City-hosted discovery</h2><p>Move from the Ethiopia overview into a complete local Expo hall.</p></article>
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
                Participating showrooms gather inside Expo halls hosted by major
                cities. Smaller zone groups join the nearest active host while
                every business keeps its real origin visible.
              </p>
            </div>
            <section className="landing-expo-calendar" aria-labelledby="expo-calendar-title">
              <div className="landing-expo-calendar-head">
                <div>
                  <span className="landing-eyebrow">A different Industry every morning</span>
                  <h3 id="expo-calendar-title">This week&apos;s Expo calendar</h3>
                </div>
                <p>Permanent showrooms remain open every day.</p>
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
            </section>
            <ExpoMap expo={expo} embedded />
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
            <ShowroomDirectory
              result={directory}
              industries={industries}
              query={directoryQuery}
              industry={directoryIndustry}
              sort={directorySort}
            />
          </div>
        </section>

        <section className="landing-closing" aria-labelledby="closing-title">
          <div className="landing-container landing-closing-inner">
            <div>
              <span className="landing-eyebrow">Your production deserves a useful presence</span>
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
            <p>Permanent showrooms and city-hosted daily Expos for people who make and grow.</p>
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
