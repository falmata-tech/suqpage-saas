import Image from "next/image";
import Link from "next/link";
import PublicAppShell from "@/components/PublicAppShell";

export const metadata = {
  title: "About MirtPage",
  description: "Explore online showrooms from Ethiopian workshops, growers, producers, and manufacturers, understand their capabilities, and contact them directly.",
};

export default function AboutPage() {
  return <PublicAppShell>
    <div className="about-page public-about-experience">
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/mirtpage-about-production-v2.webp" alt="An illustrative progression from Ethiopian agricultural and craft materials to finished local products" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">Built around Ethiopian production</span><h1 id="about-title">A clearer market for the businesses that make Ethiopia&apos;s goods.</h1><p>MirtPage gives Ethiopian workshops, growers, processors, and manufacturers online showrooms where households and trade buyers can discover what they make, understand their capabilities, and contact them directly.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">Why MirtPage exists</span><h2>Good producers should not be difficult to find.</h2></div><div><p>An aluminum workshop may make doors and windows to measurement. A furniture or metal workshop may sell finished pieces and also accept custom work. A grower, food processor, beauty producer, or factory may need retailers, wholesalers, and distributors for repeat supply. Across them all, equipment, materials, land, training, wages, and daily discipline become useful goods and skilled work.</p><p>MirtPage brings those offers into one searchable marketplace without flattening their differences. Each business gets a professional online showroom for its approved custom capabilities, ready products, or wholesale supply. Buyers can search by product, capability, industry, and reviewed location, then see what the business makes and send an inquiry directly. MirtPage creates the presentation and connection; the commercial relationship stays with the producer.</p></div></div></section>
      <section className="about-principles" aria-label="How MirtPage connects Ethiopian trade"><div className="landing-container"><article><span>01</span><h2>Start with what you need</h2><p>Search for a finished product, a made-to-order capability, or a dependable source of supply.</p></article><article><span>02</span><h2>Compare what businesses can deliver</h2><p>Review products, custom capabilities, production context, and available supply details.</p></article><article><span>03</span><h2>Understand the producer</h2><p>See what the business makes, where it operates, and the practical information it provides.</p></article><article><span>04</span><h2>Start the conversation</h2><p>Send a direct inquiry to discuss specifications, quantity, availability, and next steps.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>Make your work easier to find and understand.</h2><p>Give buyers one online showroom to understand what your business makes, what it can customize or supply, and how to contact you.</p><Link href="/request">Build your showroom</Link></div></section>
    </div>
  </PublicAppShell>;
}
