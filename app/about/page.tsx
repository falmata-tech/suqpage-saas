import Image from "next/image";
import Link from "next/link";
import MirtPageBrand from "@/components/MirtPageBrand";

export const metadata = {
  title: "About MirtPage",
  description: "MirtPage helps Ethiopian producers turn real production into a showroom buyers can find, understand, and contact directly.",
};

export default function AboutPage() {
  return <div className="landing-home about-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Showrooms</Link><Link href="/request">Sign up</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Showrooms</Link><Link href="/request">Sign up</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main>
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/maker-workshop-hero.jpg" alt="A maker working in a small production workshop" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">The case for making here</span><h1 id="about-title">Production is a bet on Ethiopia.</h1><p>Every workshop opened, crop planted, formula refined, and production line started is capital and conviction put to work. MirtPage exists to help that work reach a market.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">Why visibility matters</span><h2>Good products cannot grow if buyers cannot find them.</h2></div><div><p>Production carries costs long before the first sale: equipment, materials, land, training, wages, and the discipline to keep showing up. It builds skill, supports livelihoods, strengthens local supply, and gives Ethiopia one more alternative to importing what can be made here.</p><p>Yet a buyer can be a few kilometers away and never know that capacity exists. MirtPage gives each participating producer a permanent showroom and a place on a searchable national map. Buyers can see what the business makes, where it operates, and how to begin with a retail purchase, a wholesale inquiry, or a custom production request. The relationship stays directly with the producer.</p></div></div></section>
      <section className="about-principles" aria-label="How MirtPage helps"><div className="landing-container"><article><span>01</span><h2>Find local capacity</h2><p>Search Ethiopian production by industry, product, and reviewed location.</p></article><article><span>02</span><h2>Judge the fit</h2><p>Understand products, capabilities, process, and the people behind the work.</p></article><article><span>03</span><h2>Source at any scale</h2><p>Ask about a single product, wholesale supply, or a custom production run.</p></article><article><span>04</span><h2>Deal directly</h2><p>The producer receives the inquiry and keeps the customer relationship.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>Making locally should not mean selling invisibly.</h2><p>Bring us the business you have built. We will turn its products, capabilities, and story into a showroom buyers can act on.</p><Link href="/request">Build your showroom</Link></div></section>
    </main>
  </div>;
}
