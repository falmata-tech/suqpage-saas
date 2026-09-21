import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Suqpage",
  description: "A simple digital presence for African businesses. Discover products and services through maps, search and featured businesses, starting in Ethiopia.",
};

export default function AboutPage() {
  return <div className="about-page public-about-experience">
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/suqpage-about-production-v1.webp" alt="An illustrated collection of food, textiles and everyday products" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">About Suqpage</span><h1 id="about-title">Your business deserves to be found.</h1><p>A simple digital presence for businesses across Africa. A clearer way for people to discover what they offer.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">A page of your own</span><h2>Your business, easy to explore.</h2></div><div><p>Growers, makers, traders and service providers all have something different to offer. Suqpage gives each business a page for its story, photos, videos, products and services, with a direct way for people to get in touch.</p><p>Starting in Ethiopia, we are building toward wider African discovery. Explore businesses on a map, search for what you need, compare a clear list of results or meet someone new through Daily Featured. Each path leads to the business’s own page and a simple inquiry.</p></div></div></section>
      <section className="about-principles" aria-label="What Suqpage believes"><div className="landing-container"><article><span>01</span><h2>Find your own way</h2><p>Use location, search and category results to find the right business for you.</p></article><article><span>02</span><h2>Show what makes you different</h2><p>From a home business to an established company, let your work and your story speak for you.</p></article><article><span>03</span><h2>Start a conversation</h2><p>Ask about one product or service, or bring several interests together in one inquiry.</p></article></div></section>
      <section className="about-action"><div className="landing-container"><h2>Make your business easier to find.</h2><p>One shareable page for what you do and how people can reach you.</p><Link href="/login">Join Suqpage</Link></div></section>
    </div>;
}
