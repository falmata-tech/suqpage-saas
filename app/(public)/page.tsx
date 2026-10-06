
import { MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import { useUiText } from "@/lib/i18n/ui";
import { getUiText } from "@/lib/i18n/server";
import { Suspense } from "react";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import { MarketWorkspaceLoading } from "@/components/PublicWorkspaceLoading";
import { getPublicMarketplaceView } from "@/lib/public-discovery-cache";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Market",
  description: "Explore organized storefronts from the businesses you follow. Browse products, services and options, then inquire directly on Suqpage.",
};

type MarketSearchParams = Promise<{ industry?: string | string[]; q?: string; place?: string | string[]; showroom?: string; view?: string; type?: string; page?: string }>;

async function MarketWorkspace({ searchParams }: { searchParams: MarketSearchParams }) {
  const t = await getUiText();
  const query = await searchParams;
  const discovery = await getPublicMarketplaceView({
    industry: query.industry,
    q: query.q,
    place: query.place,
    page: query.page,
    type: query.type,
  });

  return <>
    {query.showroom === "inactive" ? <div className="landing-account-notice" role="status">{t("That page is temporarily unavailable. Explore other local products in the Market.")}</div> : null}
    <DiscoveryWorkspace
      discovery={discovery}
      hideIntro
      view={query.view === "search" ? "search" : query.view === "map" ? "map" : undefined}
    />
  </>;
}

export default function MarketPage({ searchParams }: {
  searchParams: MarketSearchParams;
}) {
  const t = useUiText();
  return <div className="public-experience public-market-experience">
      <header className="public-experience-head">
        <span>{t("Suqpage Market")}</span>
        <h1>{t(MARKET_STOREFRONT_COPY.title)}</h1>
        <p>{t(MARKET_STOREFRONT_COPY.description)}</p>
      </header>
      <Suspense fallback={<MarketWorkspaceLoading />}><MarketWorkspace searchParams={searchParams} /></Suspense>
    </div>;
}
