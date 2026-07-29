import Link from "next/link";
import ExpoMap from "@/components/ExpoMap";
import SuqPageBrand from "@/components/SuqPageBrand";
import { getCurrentExpo } from "@/lib/expo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daily Expo | SuqPage",
  description: "Explore today's city-hosted SuqPage Expos and enter permanent business showrooms.",
};

export default function ExpoPage() {
  const expo = getCurrentExpo();
  return (
    <div className="expo-page">
      <header className="topbar expo-page-header">
        <div className="container expo-page-nav">
          <SuqPageBrand />
          <nav className="nav" aria-label="Public navigation">
            <Link href="/expo">Expo</Link>
            <Link href="/#showrooms">Showrooms</Link>
            <Link href="/request">Get a Showroom</Link>
            <Link className="btn secondary" href="/login">Login</Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="expo-page-intro">
          <div className="container expo-page-intro-grid">
            <div>
              <span className="expo-kicker">Today across Ethiopia</span>
              <h1>Find today&apos;s Expo host cities.</h1>
              <p>
                Use the Ethiopia overview to choose a host city, zoom into its
                virtual Expo hall, then continue into permanent showrooms built
                for direct inquiries.
              </p>
            </div>
            <dl className="expo-page-stats">
              <div><dt>Today&apos;s Industry</dt><dd>{expo.themeName}</dd></div>
              <div><dt>Host cities</dt><dd>{expo.map.hubs.length}</dd></div>
              <div><dt>Open booths</dt><dd>{expo.booths.length}</dd></div>
            </dl>
          </div>
        </section>
        <div className="container expo-page-workspace">
          <ExpoMap expo={expo} />
        </div>
      </main>
    </div>
  );
}
