import Image from "next/image";
import Link from "next/link";
import MirtPageBrand from "@/components/MirtPageBrand";

export const metadata = {
  title: "About MirtPage",
  description: "Why MirtPage helps Ethiopia's small and growing producers build a professional presence and reach consumer and wholesale buyers.",
};

export default function AboutPage() {
  return <div className="landing-home about-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Showrooms</Link><Link href="/request">Sign up</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Showrooms</Link><Link href="/request">Sign up</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main>
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/maker-workshop-hero.jpg" alt="A maker working in a small production workshop" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">For the people who choose to produce</span><h1 id="about-title">The people who make locally deserve to be found.</h1><p>Across Ethiopia, producers are investing their time, savings, land, tools, skill, and reputation in making useful products here. MirtPage helps more people find and understand their work.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">Why MirtPage exists</span><h2>Producing locally is a commitment worth backing.</h2></div><div><p>Small manufacturers, growers, processors, and workshops take the harder path of building production close to home. Their work develops practical skill, supports jobs and local supply, and gives buyers more Ethiopian-made choices. Yet many remain difficult to discover or evaluate beyond scattered posts, messages, and phone calls.</p><p>MirtPage closes that visibility gap. Each business receives a permanent professional showroom for its products, capabilities, process, location, and story. Consumer and wholesale buyers can discover the business by product or place and send a direct inquiry. The producer keeps its identity, customer relationship, and control of the conversation.</p></div></div></section>
      <section className="about-principles" aria-label="How MirtPage helps"><div className="landing-container"><article><span>01</span><h2>See what is made nearby</h2><p>Discover producers by industry and reviewed location across Ethiopia.</p></article><article><span>02</span><h2>Understand the work</h2><p>See products, capabilities, process, and the business behind them.</p></article><article><span>03</span><h2>Inquire at any scale</h2><p>Ask about one item, a wholesale batch, seasonal supply, or custom production.</p></article><article><span>04</span><h2>Deal directly</h2><p>The producer keeps the customer relationship and answers from its own inbox.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>You already did the difficult part: making something here.</h2><p>Tell us what you produce. We will help give it a professional showroom that nearby customers and wholesale buyers can find and understand before sending a direct inquiry.</p><Link href="/request">Tell us about your business</Link></div></section>
    </main>
  </div>;
}
