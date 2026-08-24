import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import PublicAppShell from "@/components/PublicAppShell";
import { getPublicMarketplaceView } from "@/lib/public-discovery-cache";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Market | MirtPage",
  description: "Find Ethiopian businesses for custom work, ready products, and wholesale supply by industry and reviewed location.",
};

export default async function MarketPage({ searchParams }: {
  searchParams: Promise<{ industry?: string; q?: string; place?: string; showroom?: string }>;
}) {
  const query = await searchParams;
  const discovery = await getPublicMarketplaceView({
    industry: query.industry,
    q: query.q,
    place: query.place,
  });

  return <PublicAppShell>
    <div className="public-experience public-market-experience">
      {query.showroom === "inactive" ? <div className="landing-account-notice" role="status">That showroom is temporarily unavailable. Explore active businesses in the market.</div> : null}
      <header className="public-experience-head">
        <span>MirtPage market</span>
        <h1>Find Ethiopian makers and producers.</h1>
        <p>Explore online showrooms for custom work, ready products, and wholesale supply across Ethiopia.</p>
      </header>
      <DiscoveryWorkspace discovery={discovery} hideIntro />
    </div>
  </PublicAppShell>;
}
