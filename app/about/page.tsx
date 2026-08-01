import Image from "next/image";
import Link from "next/link";
import SuqPageBrand from "@/components/SuqPageBrand";

export const metadata = {
  title: "About SuqPage",
  description: "How SuqPage helps people discover Ethiopia's independent product businesses.",
};

export default function AboutPage() {
  return <div className="landing-home about-page">
    <header className="landing-header"><div className="landing-container landing-nav"><SuqPageBrand className="landing-brand" /><nav className="landing-desktop-nav" aria-label="Public navigation"><Link href="/">Explore Suqs</Link><Link href="/request">Sign up</Link><Link className="landing-login" href="/login">Login</Link></nav><details className="landing-mobile-menu"><summary aria-label="Open public navigation"><span /><span /><span /></summary><nav aria-label="Mobile public navigation"><Link href="/">Explore Suqs</Link><Link href="/request">Sign up</Link><Link href="/login">Login</Link></nav></details></div></header>
    <main>
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/maker-workshop-hero.jpg" alt="A maker working in a small production workshop" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">Made here. Easier to discover.</span><h1 id="about-title">A permanent place for the products Ethiopia makes.</h1><p>SuqPage helps customers move beyond scattered posts and find the real workshop, farm, studio, or home business behind a product.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">Why SuqPage exists</span><h2>Your location should not decide how seriously people see your business.</h2></div><div><p>Many useful Ethiopian products begin in a workshop, a farm, a family kitchen, or a room at home. The work is real, but the information is split across old posts, messages, and phone calls.</p><p>Each business receives a permanent digital showroom for products, custom capabilities, seasonal availability, its story, and direct inquiry. Customers can discover that Suq by industry, reviewed location, or the weekly virtual Expo without being forced through checkout.</p></div></div></section>
      <section className="about-principles" aria-label="How SuqPage helps"><div className="landing-container"><article><span>01</span><h2>Find the maker</h2><p>Understand who makes, grows, or processes the product.</p></article><article><span>02</span><h2>Browse by place</h2><p>Explore the map while every business keeps its own location and identity.</p></article><article><span>03</span><h2>Ask clearly</h2><p>Build one organized inquiry for a product, custom job, or seasonal batch.</p></article><article><span>04</span><h2>Talk directly</h2><p>The business keeps the customer relationship and responds from its own inbox.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>Already making something worth finding?</h2><p>Introduce your business. We will review it and help shape a Suq that feels like your brand.</p><Link href="/request">Tell us about your business</Link></div></section>
    </main>
  </div>;
}
