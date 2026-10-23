import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BUSINESS_CATEGORY_OPTIONS } from "@/lib/business-categories";
import { getUiText } from "@/lib/i18n/server";
import { DIRECTORY_PAGE_SIZE, BRAND_SOCIAL_IMAGE, publicDirectoryCursor, publicDirectoryPage, publicDirectorySummary, publicSeoImageUrl, publicSeoUrl, showroomSeoPath } from "@/lib/public-seo";
import { listPublicDirectoryBusinesses } from "@/lib/public-seo-runtime";
import { ABOUT_STOREFRONT_SECTIONS, MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import type { Metadata } from "next";
import styles from "./ShowroomDirectory.module.css";

export const dynamic = "force-dynamic";
type SearchParams = Promise<{ after?: string | string[] }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const t = await getUiText();
  const after = publicDirectoryCursor((await searchParams).after);
  if (after === null) return { robots: { index: false, follow: true } };
  const title = t("Businesses"), description = t(MARKET_STOREFRONT_COPY.description);
  const url = publicSeoUrl(after ? `/showrooms?after=${after}` : "/showrooms");
  const image = publicSeoImageUrl(BRAND_SOCIAL_IMAGE);
  return { title, description, alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "MirtPage", images: image ? [image] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] } };
}

export default async function ShowroomDirectory({ searchParams }: { searchParams: SearchParams }) {
  const t = await getUiText();
  const after = publicDirectoryCursor((await searchParams).after);
  if (after === null) notFound();
  const { items, nextCursor } = publicDirectoryPage(await listPublicDirectoryBusinesses(after, DIRECTORY_PAGE_SIZE + 1));
  if (after && items.length === 0) notFound();

  return <div className={styles.stage}><div className={styles.page}>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}>MirtPage</p><h1>{t("Businesses")}</h1>
        <p>{t(ABOUT_STOREFRONT_SECTIONS[0].title)}</p></div>
    </header>
    {items.length ? <div className={styles.grid}>{items.map(business => {
      const category = BUSINESS_CATEGORY_OPTIONS.find(option => option.key === business.category_key);
      const summary = publicDirectorySummary(business.summary);
      const logo = publicSeoImageUrl(business.logo_path);
      return <article className={styles.card} key={business.id}>
        <Link className={styles.cardLink} href={showroomSeoPath(business.handle)}>
          <span className={styles.logo}>{logo ? <Image src={logo} alt="" width={60} height={60} unoptimized /> : <span aria-hidden="true">M</span>}</span>
          <span className={styles.cardBody}>
            <strong>{business.name}</strong>
            <span className={styles.context}>{[business.city?.trim(), category ? t(category.label) : ""].filter(Boolean).join(" · ")}</span>
            {summary ? <span className={styles.summary}>{summary}</span> : null}
            <span className={styles.open}>{t("View page")} <span aria-hidden="true">→</span></span>
          </span>
        </Link>
      </article>;
    })}</div> : <div className={styles.empty}><p>{t("No public business showrooms are listed yet.")}</p><Link className={styles.open} href="/?view=search">{t("Browse product listings")} <span aria-hidden="true">→</span></Link></div>}
    {nextCursor ? <nav className={styles.pagination} aria-label={t("Businesses")}>
      <Link href={`/showrooms?after=${nextCursor}`}>{t("Next")} <span aria-hidden="true">→</span></Link>
    </nav> : null}
  </div></div>;
}
