import Image from "next/image";
import Link from "next/link";
import MirtPageBrand from "@/components/MirtPageBrand";

export const metadata = {
  title: "About MirtPage",
  description: "How MirtPage helps people discover Ethiopia's makers, growers, workshops, processors, and growing factories.",
};

export default function AboutPage() {
  return <div className="landing-home about-page">
    <header className="landing-header"><div className="landing-container landing-nav"><MirtPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Showrooms</Link><Link href="/request">Sign up</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Showrooms</Link><Link href="/request">Sign up</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main>
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/maker-workshop-hero.jpg" alt="A maker working in a small production workshop" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">Made here. Easier to discover.</span><h1 id="about-title">A permanent place for the products Ethiopia makes.</h1><p>MirtPage helps customers move beyond scattered posts and find the real farm, studio, workshop, processing room, or growing factory behind a product.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">Why MirtPage exists</span><h2>Your location or production scale should not decide how seriously people see your business.</h2></div><div><p>Useful Ethiopian products begin on farms, in family kitchens, inside workshops, and across growing production floors. The work is real, but the information is often split across old posts, messages, and phone calls.</p><p>Each business receives a permanent digital showroom for products, manufacturing capabilities, seasonal availability, production context, its story, and direct consumer or B2B inquiry. Customers can discover that showroom by industry, reviewed location, or the weekly virtual Expo without being forced through checkout.</p></div></div></section>
      <section className="about-principles" aria-label="How MirtPage helps"><div className="landing-container"><article><span>01</span><h2>Find the maker</h2><p>Understand who makes, grows, or processes the product.</p></article><article><span>02</span><h2>Browse by place</h2><p>Explore the map while every business keeps its own location and identity.</p></article><article><span>03</span><h2>Ask clearly</h2><p>Build one organized inquiry for a product, custom job, or seasonal batch.</p></article><article><span>04</span><h2>Talk directly</h2><p>The business keeps the customer relationship and responds from its own inbox.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>Already making something worth finding?</h2><p>From one skilled maker to a growing factory, introduce your business and we will help shape a showroom that fits your brand and buyers.</p><Link href="/request">Tell us about your business</Link></div></section>
    </main>
  </div>;
}
