import Link from "next/link";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import MirtPageBrand from "@/components/MirtPageBrand";
import { getDiscoveryView } from "@/lib/discovery";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Discover Showrooms | MirtPage",
  description: "Discover Ethiopian makers, growers, workshops, processors, and growing factories by industry, scale, reviewed location, and weekly virtual Expo.",
};

export default async function DiscoverPage({ searchParams }: {
  searchParams: Promise<{ industry?: string; scale?: string; q?: string; page?: string; view?: string; expoDay?: string }>;
}) {
  const query = await searchParams;
  const discovery = getDiscoveryView({ industry: query.industry, scale: query.scale, q: query.q, page: query.page, view: query.view, expoDay: query.expoDay });
  return <div className="discover-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Home</Link><Link href="/request">Get a showroom</Link><Link className="landing-login" href="/login">Login</Link></nav></div></header>
    <main className="landing-container discover-page-main"><DiscoveryWorkspace discovery={discovery} /></main>
  </div>;
}
