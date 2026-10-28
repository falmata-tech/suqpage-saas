import { publicSiteOrigin } from "./public-site-origin";
import { businessProfileDescription } from "./business-profile";
import type { ShopPageContent } from "./owner-page-domain";
import type { Business, Product } from "./types";
import type { Metadata } from "next";

export const SITEMAP_PAGE_SIZE = 10_000;
export const SITEMAP_STATIC_PATHS = ["/", "/about", "/featured", "/showrooms", "/privacy", "/terms"] as const;
export const BRAND_SOCIAL_IMAGE = "/pwa/africmade-icon-v4-512.png";
export const DIRECTORY_PAGE_SIZE = 24;

export type PublicSeoEntry = { handle: string; product_id: number | string | null };

/** A numeric keyset cursor keeps public directory reads bounded and repeatable. */
export function publicDirectoryCursor(value: unknown): number | null {
  if (value === undefined) return 0;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const cursor = Number(value);
  return Number.isSafeInteger(cursor) ? cursor : null;
}

export function publicDirectoryPage<T extends { id: number }>(rows: readonly T[]): { items: T[]; nextCursor: number | null } {
  if (rows.length > DIRECTORY_PAGE_SIZE + 1 || rows.some((row, index) =>
    !Number.isSafeInteger(row.id) || row.id <= 0 || (index > 0 && row.id <= rows[index - 1].id))) {
    throw new Error("Invalid public directory page");
  }
  const items = rows.slice(0, DIRECTORY_PAGE_SIZE);
  return { items, nextCursor: rows.length > DIRECTORY_PAGE_SIZE ? items[items.length - 1].id : null };
}

export function publicDirectorySummary(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 180 ? `${normalized.slice(0, 177).trimEnd()}…` : normalized;
}

/** Public URLs use the visitor site independently of API/Auth migration. */
export function publicSeoUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) throw new Error("Public SEO path must stay on the configured origin");
  return new URL(path, `${publicSiteOrigin()}/`).toString();
}

export function showroomSeoPath(handle: string, productId?: number): string {
  const path = `/@${encodeURIComponent(handle)}`;
  return productId === undefined ? path : `${path}?product=${productId}`;
}

export function sitemapPageCount(publicEntryCount: number): number {
  if (!Number.isSafeInteger(publicEntryCount) || publicEntryCount < 0) throw new Error("Invalid public sitemap count");
  return Math.max(1, Math.ceil((SITEMAP_STATIC_PATHS.length + publicEntryCount) / SITEMAP_PAGE_SIZE));
}

export function sitemapPageWindow(page: number): { limit: number; offset: number; staticPaths: readonly string[] } {
  if (!Number.isSafeInteger(page) || page < 0) throw new Error("Invalid sitemap page");
  const staticPaths = page === 0 ? SITEMAP_STATIC_PATHS : [];
  return {
    limit: SITEMAP_PAGE_SIZE - staticPaths.length,
    offset: page === 0 ? 0 : SITEMAP_PAGE_SIZE - SITEMAP_STATIC_PATHS.length + (page - 1) * SITEMAP_PAGE_SIZE,
    staticPaths,
  };
}

export function publicSeoEntryPath(entry: PublicSeoEntry): string {
  const productId = entry.product_id === null ? undefined : Number(entry.product_id);
  if (!entry.handle || (productId !== undefined && (!Number.isSafeInteger(productId) || productId <= 0))) {
    throw new Error("Invalid public sitemap entry");
  }
  return showroomSeoPath(entry.handle, productId);
}

export function publicSeoImageUrl(value: string | null | undefined): string | undefined {
  if (!value || value.startsWith("//") || value.includes("\\")) return undefined;
  try {
    const url = new URL(value, `${publicSiteOrigin()}/`);
    if (!(["http:", "https:"].includes(url.protocol))) return undefined;
    return url.toString();
  } catch { return undefined; }
}

/** Page data must come from the same published catalog as the visible showroom. */
export function showroomSeoMetadata(input: {
  business: Business;
  profile?: Pick<ShopPageContent, "about" | "introduction" | "heroImage">;
  productRequested: boolean;
  product?: Product | null;
  indexable?: boolean;
}): Metadata {
  const { business, profile, productRequested, product } = input;
  if (productRequested && !product) return {
    title: "Product unavailable",
    robots: { index: false, follow: true },
  };
  const title = product ? `${product.name} · ${business.name}` : business.site_title?.trim() || business.name;
  const description = product
    ? product.description || undefined
    : business.site_description?.trim() || (profile && businessProfileDescription(profile)) || business.description || business.hero_subtitle || business.tagline || undefined;
  const path = showroomSeoPath(business.handle, product?.id);
  const url = publicSeoUrl(path);
  const image = publicSeoImageUrl(product
    ? product.image_path || business.logo_path || BRAND_SOCIAL_IMAGE
    : profile?.heroImage || business.hero_image_path || business.logo_path || BRAND_SOCIAL_IMAGE);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "AfricMade", images: image ? [image] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    robots: { index: input.indexable !== false && !Boolean(business.is_demo), follow: true },
  };
}

/** This describes the visible page without implying checkout, verified stock or reviews. */
export function showroomJsonLd(input: {
  business: Business;
  profile?: Pick<ShopPageContent, "about" | "introduction" | "heroImage">;
  product?: Product | null;
}): Record<string, unknown> {
  const { business, profile, product } = input;
  const url = publicSeoUrl(showroomSeoPath(business.handle, product?.id));
  const image = publicSeoImageUrl(product ? product.image_path : business.logo_path);
  const description = product
    ? product.description
    : (profile && businessProfileDescription(profile)) || business.description;
  return {
    "@context": "https://schema.org",
    "@type": product ? "WebPage" : "Organization",
    name: product ? `${product.name} · ${business.name}` : business.name,
    url,
    ...(description ? { description } : {}),
    ...(image ? product ? { primaryImageOfPage: image } : { logo: image } : {}),
    ...(product ? { isPartOf: { "@type": "WebPage", url: publicSeoUrl(showroomSeoPath(business.handle)) } } : {}),
  };
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
}

export function sitemapIndexXml(pageCount: number): string {
  if (!Number.isSafeInteger(pageCount) || pageCount < 1 || pageCount > 50_000) throw new Error("Sitemap index exceeds supported bounds");
  const entries = Array.from({ length: pageCount }, (_, page) => `<sitemap><loc>${escapeXml(publicSeoUrl(`/sitemaps/${page}`))}</loc></sitemap>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;
}

export function sitemapUrlsetXml(paths: readonly string[]): string {
  if (paths.length > SITEMAP_PAGE_SIZE) throw new Error("Sitemap page exceeds supported bounds");
  const entries = paths.map(path => `<url><loc>${escapeXml(publicSeoUrl(path))}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}
