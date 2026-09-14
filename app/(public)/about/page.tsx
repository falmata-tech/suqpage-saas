import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Suqpage",
  description: "A place for every shop to be discovered. Suqpage connects buyers with sellers, starting in Ethiopia.",
};

export default function AboutPage() {
  return <div className="about-page public-about-experience">
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/suqpage-about-production-v1.webp" alt="An illustrated collection of food, textiles and everyday products" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">About Suqpage</span><h1 id="about-title">Good shops deserve to be found.</h1><p>The shop around the corner. The seller working from home. The one you have not discovered yet.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">Closer than you think</span><h2>A bigger view of your local market.</h2></div><div><p>Finding what you need should not depend on knowing the right street or the right person. Suqpage brings shops and their products into one place, so you can discover more of what is available around you.</p><p>Every shop gets a page of its own. Every buyer gets a direct connection to the seller. Starting in Ethiopia, we are building a market where a small shop can reach beyond its neighborhood without losing its identity.</p></div></div></section>
      <section className="about-principles" aria-label="What Suqpage believes"><div className="landing-container"><article><span>01</span><h2>More choice, closer to you</h2><p>Discover shops you know and those you have yet to meet.</p></article><article><span>02</span><h2>A place of your own</h2><p>From a first home business to an established store, your shop has room here.</p></article><article><span>03</span><h2>People, not just listings</h2><p>See who you are buying from and start a conversation directly.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>Your next customer could be nearby.</h2><p>Give them a place to find you.</p><Link href="/login">Join Suqpage</Link></div></section>
    </div>;
}
