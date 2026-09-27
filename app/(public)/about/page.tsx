
import { useUiText } from "@/lib/i18n/ui";
import Image from "next/image";
import Link from "next/link";
import CategoryIllustration from "@/components/CategoryIllustration";
import { DISCOVERY_INDUSTRIES } from "@/lib/discovery-contract";
import styles from "@/components/AboutCategories.module.css";

export const metadata = {
  title: "About Suqpage",
  description: "An online showroom for African businesses, from makers and manufacturers to local shops and home sellers. Starting in Ethiopia.",
};

export default function AboutPage() {
  const t = useUiText();
  return <div className="about-page public-about-experience">
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/landing/suqpage-about-production-v1.webp" alt={t("An illustrated collection of food, textiles and everyday products")} fill priority sizes="100vw" />
        <div className="landing-container about-hero-copy"><span className="landing-eyebrow">{t("About Suqpage")}</span><h1 id="about-title">{t("Local businesses. Easier to find.")}</h1><p>{t("Find businesses in Ethiopia, see what they offer, and contact them directly.")}</p></div>
      </section>
      <section className="about-story"><div className="landing-container about-story-grid"><div><span className="landing-eyebrow">{t("Your online showroom")}</span><h2>{t("One link to everything you offer.")}</h2></div><div><p>{t("Suqpage gives manufacturers, makers, retailers and home businesses an online showroom for their products and services.")}</p><p>{t("Give customers one place to explore your business and what you offer. Share your showroom across your social channels and turn interest into inquiries.")}</p><p>{t("Create a shopfront without a physical store, or extend your existing shop online. Get discovered through search, the map and Daily Featured. Receive inquiries on Suqpage or through your social channels.")}</p></div></div></section>
      <section className="about-principles" aria-label={t("How Suqpage works")}><div className="landing-container"><article><span>01</span><h2>{t("Find a business")}</h2><p>{t("Search for what you need, choose a category or explore the map.")}</p></article><article><span>02</span><h2>{t("See what they offer")}</h2><p>{t("Browse products and services. View photos, watch videos and check prices.")}</p></article><article><span>03</span><h2>{t("Ask the business")}</h2><p>{t("Ask about one item, or add several to your inquiry list and send them together.")}</p></article></div></section>
      <section className={styles.section} aria-labelledby="about-categories-title"><div className="landing-container"><h2 id="about-categories-title">{t("What are you looking for?")}</h2><div className={styles.grid}>
        {DISCOVERY_INDUSTRIES.map(category=><Link key={category.key} href={`/?industry=${category.key}&view=search#discover`}><CategoryIllustration name={category.key} size={48}/><span>{t(category.label)}</span></Link>)}
        <Link href="/?industry=all&view=search#discover"><CategoryIllustration name="grid" size={48}/><span>{t("All categories")}</span></Link>
      </div></div></section>
      <section className="about-action"><div className="landing-container"><h2>{t("Make your business easier to find.")}</h2><p>{t("Create your page, add your products or services, and share it.")}</p><Link href="/login">{t("Create your business page")}</Link></div></section>
    </div>;
}
