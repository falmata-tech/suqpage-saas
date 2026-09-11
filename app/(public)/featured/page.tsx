import { Suspense } from "react";
import FeaturedShowroomsWorkspace from "@/components/FeaturedShowroomsWorkspace";
import { FeaturedWorkspaceLoading } from "@/components/PublicWorkspaceLoading";
import { getPublicFeaturedView, getPublicSponsors } from "@/lib/public-discovery-cache";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Daily Featured | AfricMade",
  description: "Meet selected Ethiopian artisans, farms, workshops, and small manufacturers in AfricMade's daily live program.",
};

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
