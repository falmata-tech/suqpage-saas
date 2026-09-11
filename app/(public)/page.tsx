import { Suspense } from "react";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import { MarketWorkspaceLoading } from "@/components/PublicWorkspaceLoading";
import { getPublicMarketplaceView } from "@/lib/public-discovery-cache";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Market | AfricMade",
  description: "Find locally made and grown products from Ethiopian artisans, farms, workshops, and small manufacturers.",
};

type MarketSearchParams = Promise<{ industry?: string; q?: string; place?: string; showroom?: string; view?: string; type?: string }>;

async function MarketWorkspace({ searchParams }: { searchParams: MarketSearchParams }) {
  const query = await searchParams;
  const discovery = await getPublicMarketplaceView({
    industry: query.industry,
    q: query.q,
    place: query.place,
  });

  return <>
    {query.showroom === "inactive" ? <div className="landing-account-notice" role="status">That page is temporarily unavailable. Explore other local products in the Market.</div> : null}
    <DiscoveryWorkspace
      discovery={discovery}
      hideIntro
      view={query.view === "search" ? "search" : "map"}
      resultType={query.type === "products" || query.type === "businesses" ? query.type : "all"}
    />
  </>;
}

export default function MarketPage({ searchParams }: {
  searchParams: MarketSearchParams;
}) {
  return <div className="public-experience public-market-experience">
      <header className="public-experience-head">
        <span>AfricMade Market</span>
        <h1>Find locally made and grown products.</h1>
        <p>Explore pages from Ethiopian artisans, farms, workshops, and small manufacturers. See their work and contact them directly.</p>
      </header>
      <Suspense fallback={<MarketWorkspaceLoading />}><MarketWorkspace searchParams={searchParams} /></Suspense>
    </div>;
}
