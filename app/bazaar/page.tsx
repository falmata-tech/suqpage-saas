import Image from "next/image";
import Link from "next/link";
import BazaarMap from "@/components/BazaarMap";
import { getCurrentBazaar } from "@/lib/bazaar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daily Bazaar | SuqPage",
  description: "Explore today's themed SuqPage Bazaar and enter permanent business showrooms.",
};

export default function BazaarPage() {
  const bazaar = getCurrentBazaar();
  return (
    <>
      <header className="topbar">
        <div className="container" style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Link href="/" className="brand">
            <Image src="/uploads/seed/suqpage/icon.png" alt="" width={34} height={34} />
            SuqPage
          </Link>
          <nav className="nav" aria-label="Public navigation">
            <Link href="/bazaar">Bazaar</Link>
            <Link href="/#showrooms">All Showrooms</Link>
            <Link href="/request">Get a Showroom</Link>
            <Link className="btn secondary" href="/login">Login</Link>
          </nav>
        </div>
      </header>
      <main className="bazaar-page">
        <section className="bazaar-hero">
          <div className="container bazaar-hero-grid">
            <div>
              <span className="eyebrow">Daily Bazaar</span>
              <h1>Move through today&apos;s Bazaar.</h1>
              <p>Browse the themed floor, preview a booth, then enter the business&apos;s permanent SuqPage showroom.</p>
            </div>
            <div className="bazaar-live-card">
              <span className={`badge ${bazaar.status === "live" ? "active" : "limited"}`}>{bazaar.status === "live" ? "Live now" : bazaar.status}</span>
              <h2>{bazaar.themeName}</h2>
              <p>{bazaar.booths.length} {bazaar.booths.length === 1 ? "booth" : "booths"} on the floor</p>
            </div>
          </div>
        </section>
        <div className="container">
          <BazaarMap bazaar={bazaar} />
        </div>
      </main>
    </>
  );
}
