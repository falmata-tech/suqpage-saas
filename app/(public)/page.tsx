
import { useUiText } from "@/lib/i18n/ui";
import { getUiText } from "@/lib/i18n/server";
import { Suspense } from "react";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import { MarketWorkspaceLoading } from "@/components/PublicWorkspaceLoading";
import { getPublicMarketplaceView } from "@/lib/public-discovery-cache";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Market",
  description: "Find local businesses on Suqpage. Explore products, services, photos and videos in one organized showroom, and inquire directly.",
};

type MarketSearchParams = Promise<{ industry?: string | string[]; q?: string; place?: string; showroom?: string; view?: string; type?: string; page?: string }>;

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
      view={query.view === "search" ? "search" : "map"}
      resultType={query.type === "products" || query.type === "businesses" ? query.type : "all"}
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
        <h1>{t("Everything a business offers, in one place.")}</h1>
        <p>{t("Discover businesses near you. Explore their story, products, services and capabilities—then find their location and get in touch directly.")}</p>
      </header>
      <Suspense fallback={<MarketWorkspaceLoading />}><MarketWorkspace searchParams={searchParams} /></Suspense>
    </div>;
}
