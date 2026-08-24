import { unstable_cache } from "next/cache";
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
  async (industry: string, place: string): Promise<MarketplaceDiscoveryView> => getMarketplaceDiscoveryView({ industry, place }),
  ["public-marketplace-v2-nearby-groups"],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-marketplace"] },
);

const cachedFeatured = unstable_cache(
  async (featuredDay: string): Promise<FeaturedShowroomsView> => getFeaturedShowroomsView({ featuredDay }),
  ["public-featured-v1"],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-featured"] },
);

const cachedSponsors = unstable_cache(
  async (): Promise<SponsorPlacement[]> => getSponsoredShowrooms(),
  ["public-sponsors-v1"],
  { revalidate: PUBLIC_DISCOVERY_REVALIDATE_SECONDS, tags: ["public-sponsors"] },
);

export function getPublicMarketplaceView(input: { industry?: string; q?: string; place?: string }) {
  const query = (input.q || "").trim();
  if (query) return getMarketplaceDiscoveryView(input);
  return cachedMarketplace(input.industry || "", input.place || "");
}

export function getPublicFeaturedView(featuredDay?: string) {
  return cachedFeatured(featuredDay || "");
}

export function getPublicSponsors() {
  return cachedSponsors();
}
