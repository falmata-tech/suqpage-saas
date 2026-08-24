import FeaturedShowroomsWorkspace from "@/components/FeaturedShowroomsWorkspace";
import PublicAppShell from "@/components/PublicAppShell";
import { getPublicFeaturedView, getPublicSponsors } from "@/lib/public-discovery-cache";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Daily Featured Showrooms | MirtPage",
  description: "Enter MirtPage's scheduled daily showroom floor and discover Ethiopian producers by industry.",
};

export default async function FeaturedPage({ searchParams }: {
  searchParams: Promise<{ featuredDay?: string }>;
}) {
  const query = await searchParams;
  const [discovery, sponsoredShowrooms] = await Promise.all([
    getPublicFeaturedView(query.featuredDay),
    getPublicSponsors(),
  ]);

  return <PublicAppShell>
    <div className="public-experience public-featured-experience">
      <FeaturedShowroomsWorkspace discovery={discovery} sponsoredShowrooms={sponsoredShowrooms} />
    </div>
  </PublicAppShell>;
}
