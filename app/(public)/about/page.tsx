import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About AfricMade",
  description: "Making Ethiopia's artisans, farms, workshops, and small manufacturers easier to find.",
};

export default function AboutPage() {
  return <div className="about-page public-about-experience">
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/africmade-about-production-v1.webp" alt="An illustrative progression from Ethiopian agricultural and craft materials to finished local products" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">About AfricMade</span><h1 id="about-title">A stronger market starts closer to home.</h1><p>AfricMade brings Ethiopia&apos;s artisans, farms, workshops, and small manufacturers into view, so more people can find and buy what is made and grown around them.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">The opportunity is already here</span><h2>Remarkable work should not depend on word of mouth.</h2></div><div><p>Across Ethiopia, local hands build furniture, weave textiles, grow food, shape metal, create art, and make goods people use every day. Too much of that work remains difficult to find beyond its immediate neighborhood.</p><p>AfricMade gives it a clear place in the market: one map, one page for each business, and a direct path from discovery to conversation. We are starting in Ethiopia, with a wider African market in view.</p></div></div></section>
      <section className="about-principles" aria-label="What AfricMade believes"><div className="landing-container"><article><span>01</span><h2>Find what is already here</h2><p>See more of what is made and grown in your city, region, and country.</p></article><article><span>02</span><h2>See the work behind it</h2><p>Discover the people, skills, process, and place behind each product.</p></article><article><span>03</span><h2>Build direct relationships</h2><p>Bring buyers and local businesses together without hiding the source.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>Put your work where buyers can find it.</h2><p>Join AfricMade and begin building a clear presence for what you make or grow.</p><Link href="/login">Join AfricMade</Link></div></section>
    </div>;
}
