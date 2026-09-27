import { discoveryCategoryKey } from "./discovery-contract";
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
  async (industry: string, place: string, page: string, type: string, _scheduleVersion: string): Promise<MarketplaceDiscoveryView> => getMarketplaceDiscoveryView({ industry, place, page, type }),
  ["public-marketplace-v8-category-sets", String(ownerPageEditorEnabled())],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-marketplace"] },
);

const cachedFeatured = unstable_cache(
  async (featuredDay: string, _scheduleVersion: string): Promise<FeaturedShowroomsView> => getFeaturedShowroomsView({ featuredDay }),
  ["public-featured-v4-evening", String(ownerPageEditorEnabled())],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-featured"] },
);

const cachedSponsors = unstable_cache(
  async (): Promise<SponsorPlacement[]> => getSponsoredShowrooms(),
  ["public-sponsors-v1"],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-sponsors"] },
);

export async function getPublicMarketplaceView(input: { industry?: string | readonly string[]; q?: string; place?: string; page?: string; type?: string }) {
  const query = (input.q || "").trim();
  input = { ...input, industry: discoveryCategoryKey(input.industry) };
  const view = await (query ? getMarketplaceDiscoveryView(input) : cachedMarketplace(discoveryCategoryKey(input.industry), input.place || "", input.page || "1", input.type || "all", await getFeaturedProgramCacheVersion()));
  if (query || !ownerPageEditorEnabled()) return view;
  const covers = await runtimeCurrentPageCovers(view.showrooms.map((showroom) => showroom.id));
  return { ...view, showrooms: view.showrooms.map((showroom) => ({ ...showroom, heroImagePath: covers.get(showroom.id) || "" })), searchBusinesses: view.searchBusinesses.map((showroom) => ({ ...showroom, heroImagePath: covers.get(showroom.id) || "" })) };
}

export async function getPublicFeaturedView(featuredDay?: string) {
  const view = await cachedFeatured(featuredDay || "", await getFeaturedProgramCacheVersion());
  if (!ownerPageEditorEnabled()) return view;
  const covers = await runtimeCurrentPageCovers(view.featured.booths.flatMap((booth) => booth.revealed ? [booth.showroom.id] : []));
  return { ...view, featured: { ...view.featured, booths: view.featured.booths.map((booth) => booth.revealed
    ? { ...booth, showroom: { ...booth.showroom, heroImagePath: covers.get(booth.showroom.id) || "" } } : booth) } };
}

export function getPublicSponsors() {
  return cachedSponsors();
}
