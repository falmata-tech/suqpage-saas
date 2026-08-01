import Link from "next/link";
import DiscoveryWorkspace from "@/components/DiscoveryWorkspace";
import SuqPageBrand from "@/components/SuqPageBrand";
import { getDiscoveryView } from "@/lib/discovery";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Discover Suqs | SuqPage",
  description: "Discover independent Ethiopian makers and product businesses by industry and City Suq.",
};

export default async function DiscoverPage({ searchParams }: {
  searchParams: Promise<{ industry?: string; q?: string }>;
}) {
  const query = await searchParams;
  const discovery = getDiscoveryView({ industry: query.industry, q: query.q });
  return <div className="discover-page">
    <header className="landing-header"><div className="landing-container landing-nav"><SuqPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Home</Link><Link href="/request">Get your SuqPage</Link><Link className="landing-login" href="/login">Login</Link></nav></div></header>
    <main className="landing-container discover-page-main"><DiscoveryWorkspace discovery={discovery} /></main>
  </div>;
}
