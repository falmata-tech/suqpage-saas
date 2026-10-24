import { Suspense } from "react";
import FeaturedShowroomsWorkspace from "@/components/FeaturedShowroomsWorkspace";
import { FeaturedWorkspaceLoading } from "@/components/PublicWorkspaceLoading";
import { getPublicFeaturedView, getPublicSponsors } from "@/lib/public-discovery-cache";
import { getUiText } from "@/lib/i18n/server";
import { MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import { BRAND_SOCIAL_IMAGE, publicSeoImageUrl, publicSeoUrl } from "@/lib/public-seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getUiText();
  const title = t("Featured"), description = t(MARKET_STOREFRONT_COPY.description);
  const url = publicSeoUrl("/featured");
  const image = publicSeoImageUrl(BRAND_SOCIAL_IMAGE);
  return { title, description, alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "AfricMade", images: image ? [image] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] } };
}

type FeaturedSearchParams = Promise<{ featuredDay?: string }>;

async function FeaturedWorkspace({ searchParams }: { searchParams: FeaturedSearchParams }) {
  const query = await searchParams;
  const [discovery, sponsoredShowrooms] = await Promise.all([
    getPublicFeaturedView(query.featuredDay),
    getPublicSponsors(),
  ]);

  return <FeaturedShowroomsWorkspace discovery={discovery} sponsoredShowrooms={sponsoredShowrooms} />;
}

export default function FeaturedPage({ searchParams }: { searchParams: FeaturedSearchParams }) {
  return <div className="public-experience public-featured-experience">
    <Suspense fallback={<FeaturedWorkspaceLoading />}><FeaturedWorkspace searchParams={searchParams} /></Suspense>
  </div>;
}
