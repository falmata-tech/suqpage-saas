import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Search, Store } from "lucide-react";
import { useUiText } from "@/lib/i18n/ui";
import { ABOUT_STOREFRONT_SECTIONS, CUSTOMER_MAP_COPY, MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import styles from "@/components/AboutStorefront.module.css";

export async function generateMetadata() {
  const t = await getUiText();
  return { title: t("About Suqpage"), description: `${t(MARKET_STOREFRONT_COPY.title)} ${t(MARKET_STOREFRONT_COPY.description)}` };
}
const icons = { shop: Store, map: MapPin, chat: MessageCircle, search: Search };

export default function AboutPage() {
  const t = useUiText();
  return <div className={styles.page}>
    <header className={styles.header}>
      <h1>{t("About Suqpage")}</h1>
      <nav aria-label={t("On this page")}>{ABOUT_STOREFRONT_SECTIONS.map(section =>
        <a key={section.id} href={`#for-${section.id}`}>{t(section.label)} <ArrowRight aria-hidden="true" /></a>
      )}</nav>
    </header>
    {ABOUT_STOREFRONT_SECTIONS.map(section => <section key={section.id} id={`for-${section.id}`} className={`${styles.section} ${section.id === "businesses" ? styles.business : ""}`} aria-labelledby={`${section.id}-title`}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>{t(section.label)}</span>
        <h2 id={`${section.id}-title`}>{t(section.title)}</h2>
        <p>{t(section.description)}</p>
        <Link className={styles.action} href={section.id === "customers" ? "/" : "/login"}>{t(section.action)} <ArrowRight aria-hidden="true" /></Link>
        {section.id === "customers" && <Link className={styles.mapLink} href="/"><MapPin aria-hidden="true"/><span><strong>{t(CUSTOMER_MAP_COPY.title)}</strong>{t(CUSTOMER_MAP_COPY.description)}</span></Link>}
      </div>
      <div className={styles.benefits}>{section.benefits.map(benefit => {
        const Icon = icons[benefit.icon];
        return <article key={benefit.title}><span className={styles.icon}><Icon aria-hidden="true" /></span><div><h3>{t(benefit.title)}</h3><p>{t(benefit.description)}</p></div></article>;
      })}</div>
    </section>)}
  </div>;
}
