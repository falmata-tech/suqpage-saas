import {readMarketSearch, MarketSearchError, type MarketSearch} from '@/lib/market-search';
import Link from 'next/link';

import { MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import { getUiText } from "@/lib/i18n/server";
import { Suspense } from "react";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import { MarketWorkspaceLoading } from "@/components/PublicWorkspaceLoading";
import { getIndependentPublicMarketplace } from "@/lib/public-discovery-cache";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const t = await getUiText();
  const title = t(MARKET_STOREFRONT_COPY.title), description = t(MARKET_STOREFRONT_COPY.description);
  return { title, description, openGraph: { title, description, siteName: "MirtPage" }, twitter: { title, description } };
}

type MarketSearchParams = Promise<Record<string,string|string[]|undefined>>;

async function MarketWorkspace({ searchParams }: { searchParams: MarketSearchParams }) {
  const t = await getUiText();
  const query = await searchParams;
  const params=new URLSearchParams();for(const [key,value] of Object.entries(query)){for(const item of Array.isArray(value)?value:value?[value]:[])params.append(key,item);}
  let initialBusiness:MarketSearch,initialProduct:MarketSearch;
  // Older shared-query links open their requested view without coupling scopes.
  const legacy=!([...params.keys()].some(k=>k.startsWith('b.')||k.startsWith('p.')))&&Boolean(query.q||query.industry||query.category||query.place||query.offeringType||query.madeToOrder);
  const selectedView=query.view==='search'||(legacy&&query.view!=='map')?'search':query.view==='map'?'map':undefined;
  try {
    initialBusiness=readMarketSearch(params,'b.');initialProduct=readMarketSearch(params,'p.');
    // Validate retired/invalid unprefixed filters even on links without a query.
    const old=new URLSearchParams(params);for(const item of params.getAll('industry'))old.append('category',item);
    if(legacy)Object.assign(selectedView==='search'?initialProduct:initialBusiness,readMarketSearch(old));
    else if(params.has('offeringType')||params.has('madeToOrder'))readMarketSearch(old);
  } catch(error) {
    if(!(error instanceof MarketSearchError))throw error;
    return <section className="panel" role="alert"><p>{t('Check your search filters.')}</p><Link className="btn" href="/?view=map">{t('Clear filters')}</Link></section>;
  }
  const [discovery,productDiscovery]=await Promise.all([getIndependentPublicMarketplace('businesses',initialBusiness),getIndependentPublicMarketplace('products',initialProduct)]);

  return <>
    {query.showroom === "inactive" ? <div className="landing-account-notice" role="status">{t("That page is temporarily unavailable. Explore other local products in the Market.")}</div> : null}
    <DiscoveryWorkspace
      discovery={discovery}
      productDiscovery={productDiscovery}
      initialBusiness={initialBusiness}
      initialProduct={initialProduct}
      hideIntro
      view={selectedView}
    />
  </>;
}

export default async function MarketPage({ searchParams }: {
  searchParams: MarketSearchParams;
}) {
  const t = await getUiText();
  return <div className="public-experience public-market-experience">
      <header className="market-landing-introduction">
        <h1>{t(MARKET_STOREFRONT_COPY.title)}</h1>
        <p>{t(MARKET_STOREFRONT_COPY.description)}</p>
      </header>
      <Suspense fallback={<MarketWorkspaceLoading />}><MarketWorkspace searchParams={searchParams} /></Suspense>
    </div>;
}
