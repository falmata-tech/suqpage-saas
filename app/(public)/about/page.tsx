import Image from "next/image";
import Link from "next/link";
import CategoryIllustration from "@/components/CategoryIllustration";
import { DISCOVERY_INDUSTRIES } from "@/lib/discovery-contract";
import styles from "@/components/AboutCategories.module.css";

export const metadata = {
  title: "About Suqpage",
  description: "Find African businesses, browse products and services, and get in touch. Start with businesses in Ethiopia.",
};

export default function AboutPage() {
  return <div className="about-page public-about-experience">
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/suqpage-about-production-v1.webp" alt="An illustrated collection of food, textiles and everyday products" fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">About Suqpage</span><h1 id="about-title">Local businesses. Easier to find.</h1><p>Find products and services from businesses across Africa, starting in Ethiopia.</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">A page of your own</span><h2>Show people what you do.</h2></div><div><p>Whether you grow, make, sell or provide a service, Suqpage gives your business a page. Add photos, videos, products, services and contact details.</p><p>Customers can find you on the map, in search results or on Daily Featured. They can see what you offer and ask you about it directly.</p></div></div></section>
      <section className="about-principles" aria-label="How Suqpage works"><div className="landing-container"><article><span>01</span><h2>Find a business</h2><p>Search for what you need, choose a category or explore the map.</p></article><article><span>02</span><h2>See what they offer</h2><p>Browse products and services. View photos, watch videos and check prices.</p></article><article><span>03</span><h2>Ask the business</h2><p>Ask about one item, or add several to your inquiry list and send them together.</p></article></div></section>
      <section className={styles.section} aria-labelledby="about-categories-title"><div className="landing-container"><h2 id="about-categories-title">What are you looking for?</h2><div className={styles.grid}>
        {DISCOVERY_INDUSTRIES.map(category=><Link key={category.key} href={`/?industry=${category.key}&view=search#discover`}><CategoryIllustration name={category.key} size={48}/><span>{category.label}</span></Link>)}
        <Link href="/?industry=all&view=search#discover"><CategoryIllustration name="grid" size={48}/><span>All categories</span></Link>
      </div></div></section>
      <section className="about-action"><div className="landing-container"><h2>Make your business easier to find.</h2><p>Create your page, add your products or services, and share it.</p><Link href="/login">Join Suqpage</Link></div></section>
    </div>;
}
