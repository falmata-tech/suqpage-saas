import {hasMarketCriteria,normalizeMarketSearch,type MarketScope,type MarketSearch} from './market-search';
import { discoveryCategoryKey, discoveryPlaceKey } from "./discovery-contract";
import {readExcludedBusinesses} from './blocked-businesses-server';
import { getFeaturedProgramCacheVersion } from "./featured-program-settings";
import { unstable_cache } from "next/cache";
import { ownerPageEditorEnabled } from "./owner-page-runtime";
import { runtimeCurrentPageCovers } from "./owner-page-publication-runtime";
import {
  getFeaturedShowroomsView,
  getMarketplaceDiscoveryView,
  getSponsoredShowrooms,
  type FeaturedShowroomsView,
  type MarketplaceDiscoveryView,
  type SponsorPlacement,
} from "./discovery";

const PUBLIC_DISCOVERY_REVALIDATE_SECONDS = 20;

const cachedMarketplace = unstable_cache(
  async (industry: string, place: string, page: string, type: string, _scheduleVersion: string, excluded: string): Promise<MarketplaceDiscoveryView> => getMarketplaceDiscoveryView({ industry, place, page, type,excludedBusinessIds:JSON.parse(excluded) }),
  ["public-marketplace-v11-products", String(ownerPageEditorEnabled())],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-marketplace"] },
);

const cachedFeatured = unstable_cache(
  async (featuredDay: string, _scheduleVersion: string, excluded: string): Promise<FeaturedShowroomsView> => getFeaturedShowroomsView({ featuredDay,excludedBusinessIds:JSON.parse(excluded) }),
  ["public-featured-v5-products", String(ownerPageEditorEnabled())],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-featured"] },
);

const cachedSponsors = unstable_cache(
  async (excluded:string): Promise<SponsorPlacement[]> => getSponsoredShowrooms({excludedBusinessIds:JSON.parse(excluded)}),
  ["public-sponsors-v2-products"],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-sponsors"] },
);

export async function getPublicMarketplaceView(input: { industry?: string | readonly string[]; q?: string; place?: string | readonly string[]; page?: string; type?: string }) {
  const query = (input.q || "").trim();
  const excluded=await readExcludedBusinesses();
  // Public results are offerings; businesses remain in the map projection.
  // Normalize legacy type URLs before SQL counting and pagination.
  input = { ...input, industry: discoveryCategoryKey(input.industry), type: "products", place: discoveryPlaceKey(input.place) };
  const view = await (query ? getMarketplaceDiscoveryView({...input,excludedBusinessIds:excluded}) : cachedMarketplace(discoveryCategoryKey(input.industry), discoveryPlaceKey(input.place), input.page || "1", input.type || "all", await getFeaturedProgramCacheVersion(),JSON.stringify(excluded)));
  if (query || !ownerPageEditorEnabled()) return view;
  const covers = await runtimeCurrentPageCovers(view.showrooms.map((showroom) => showroom.id));
  return { ...view, showrooms: view.showrooms.map((showroom) => ({ ...showroom, heroImagePath: covers.get(showroom.id) || "" })), searchBusinesses: view.searchBusinesses.map((showroom) => ({ ...showroom, heroImagePath: covers.get(showroom.id) || "" })) };
}

export async function getPublicFeaturedView(featuredDay?: string) {
  const view = await cachedFeatured(featuredDay || "", await getFeaturedProgramCacheVersion(),JSON.stringify(await readExcludedBusinesses()));
  if (!ownerPageEditorEnabled()) return view;
  const covers = await runtimeCurrentPageCovers(view.featured.booths.flatMap((booth) => booth.revealed ? [booth.showroom.id] : []));
  return { ...view, featured: { ...view.featured, booths: view.featured.booths.map((booth) => booth.revealed
    ? { ...booth, showroom: { ...booth.showroom, heroImagePath: covers.get(booth.showroom.id) || "" } } : booth) } };
}

export async function getPublicSponsors() {
  return cachedSponsors(JSON.stringify(await readExcludedBusinesses()));
}

// Only two finite default-browse keys. Arbitrary searches, later pages and
// personal exclusions never populate the shared application cache.
const cachedIndependentBrowse = unstable_cache(
 async (scope:MarketScope) => getMarketplaceDiscoveryView({scope}),
 ['independent-browse-products-v2',String(ownerPageEditorEnabled())],
 {revalidate:PUBLIC_DISCOVERY_REVALIDATE_SECONDS,tags:['public-marketplace']},
);
export async function getCachedIndependentMarketplace(options:Parameters<typeof getMarketplaceDiscoveryView>[0]) {
 const scope=options?.scope;
 if(!scope)return getMarketplaceDiscoveryView(options);
 const search=normalizeMarketSearch({q:options.q,category:options.industry,country:options.country,city:options.city,place:options.place,offeringType:options.offeringType,madeToOrder:scope==='products'?options.madeToOrder:false,page:options.page});
 if(!hasMarketCriteria(search)&&search.page===1&&!options.excludedBusinessIds?.length&&!options.readPort&&!options.now)return cachedIndependentBrowse(scope);
 return getMarketplaceDiscoveryView(options);
}

/** Public adapter resolves personal exclusions before any shared cache use. */
export async function getIndependentPublicMarketplace(scope:MarketScope,search:MarketSearch) {
  const excluded=await readExcludedBusinesses();
  const view=await getCachedIndependentMarketplace({scope,q:search.query,industry:search.categories,country:search.countries,city:search.cities,place:search.legacyPlaces,madeToOrder:search.madeToOrder,page:search.page,excludedBusinessIds:excluded});
  if(!ownerPageEditorEnabled()||!view.showrooms.length)return view;
  const covers=await runtimeCurrentPageCovers(view.showrooms.map(s=>s.id));
  return {...view,showrooms:view.showrooms.map(s=>({...s,heroImagePath:covers.get(s.id)||s.heroImagePath}))};
}
