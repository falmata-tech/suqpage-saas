import { FeaturedShowroomsWorkspace } from "@/components/DiscoveryWorkspace";
import PublicAppShell from "@/components/PublicAppShell";
import { getFeaturedShowroomsView, getSponsoredShowrooms } from "@/lib/discovery";

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
    getFeaturedShowroomsView({ featuredDay: query.featuredDay }),
    getSponsoredShowrooms(),
  ]);

  return <PublicAppShell>
    <div className="public-experience public-featured-experience">
      <FeaturedShowroomsWorkspace discovery={discovery} sponsoredShowrooms={sponsoredShowrooms} />
    </div>
  </PublicAppShell>;
}
