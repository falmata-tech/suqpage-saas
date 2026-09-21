"use client";

import type { ReactNode } from "react";
import { catalogOfferingLabel } from "@/lib/offerings";
import { productHref } from "@/lib/product-inquiry";

import { ArrowUpRight, Globe, Mail, MessageCircle, Music2, PackageOpen, Phone, Play, ListPlus, Search, ClipboardList, X, Camera, Send, Check } from "lucide-react";
import { useId, useState } from "react";
import type { ShopPageContent } from "@/lib/owner-page-domain";
import { formatEtbPrice } from "@/lib/offering-presentation";
import { normalizeControlledYouTubeUrl, privacyEnhancedYouTubeEmbedUrl } from "@/lib/youtube-provider";
import type { DesignProps } from "./designs";
import { businessProfileDescription } from "@/lib/business-profile";
import { legacyPublicContacts, publicContactLinks, type PublicContactKind } from "@/lib/business-profile-contacts";
import styles from "./BusinessProfile.module.css";

function ProfileDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  if (!text) return null;
  const long = text.length > 190;
  const excerpt = text.slice(0, 190).replace(/\s+\S*$/, "");
  return <div className={styles.description}>
    <p id={id} className={expanded ? styles.expandedDescription : undefined} tabIndex={expanded ? 0 : undefined}>{long && !expanded ? `${excerpt}…` : text}</p>
    {long ? <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)}>{expanded ? "Read less" : "Read more"}</button> : null}
  </div>;
}

function CoverMedia({ image, video, name }: { image: string; video: string; name: string }) {
  const [playing, setPlaying] = useState(false);
  if (!image && !video) return null;
  return <div className={styles.coverMedia}>
    {playing && video ? <iframe src={`${privacyEnhancedYouTubeEmbedUrl(normalizeControlledYouTubeUrl(video).managedRef)}?autoplay=1`}
      title={`Video about ${name}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image ? <img src={image} alt="" fetchPriority="high" /> : null}
      {video ? <button type="button" className={styles.playCover} aria-label={`Play business video about ${name}`} onClick={() => setPlaying(true)}>
        <span><Play size={25} fill="currentColor" aria-hidden="true" /></span><span className={styles.playCaption}>Meet the business</span>
      </button> : null}
    </>}
  </div>;
}

const contactIcons = { phone: Phone, email: Mail, website: Globe, whatsapp: MessageCircle, tiktok: Music2, instagram: Camera, telegram: Send, facebook: Globe } satisfies Record<PublicContactKind, typeof Phone>;

export default function BusinessProfile(p: DesignProps & { profile: ShopPageContent; previewMode?: boolean; embedded?: boolean; productDetail?: ReactNode; selectedIds?: number[]; onBackToProducts?: () => void }) {
  const { business, categories } = p.catalog;
  const profile = p.profile;
  const catalogLabel = catalogOfferingLabel(p.catalog.products.filter(product => product.is_published));
  const id = useId();
  const productsId = `${id}-products`;
  const BusinessHeading = p.embedded ? "h2" : "h1";
  const contacts = publicContactLinks(profile.contacts || legacyPublicContacts(business));
  return <div className={styles.profile} data-business-profile>
    <section className={styles.cover} aria-label="Business introduction">
      <CoverMedia key={`${business.id}:${profile.heroImage}:${profile.videoUrl}`} image={profile.heroImage} video={profile.videoUrl} name={business.name} />
      <div className={styles.identity}>
        <div className={styles.identityHeading}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {business.logo_path ? <img className={styles.logo} src={business.logo_path} alt="" /> : null}
          <div><span className={styles.handle}>@{business.handle}</span><BusinessHeading className={styles.businessName}>{business.name}</BusinessHeading></div>
        </div>
        <ProfileDescription key={businessProfileDescription(profile)} text={businessProfileDescription(profile)} />
      </div>
    </section>
    <nav className={styles.navigation} aria-label="Business profile sections">
      <a href={`#${productsId}`} aria-current="location" onClick={p.productDetail ? e => { e.preventDefault(); p.onBackToProducts?.(); } : undefined}>{catalogLabel} <span>{p.catalog.products.filter((product) => product.is_published).length}</span></a>
      {p.cartCount > 0 ? <button type="button" className={styles.cart} onClick={p.openCart} aria-label={`View inquiry list, ${p.cartCount} ${p.cartCount === 1 ? "item" : "items"}`}>
        <ClipboardList size={18} aria-hidden="true" /><span>View inquiry list</span><span className={styles.count} aria-hidden="true">{p.cartCount}</span>
      </button> : null}
    </nav>
    <section id={productsId} className={styles.productsSection} aria-label={catalogLabel}>
      <h2 className="sr-only">{catalogLabel}</h2>
      {p.productDetail || <>
      <div className={styles.filters}>
        <div className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <input type="search" aria-label={`Search ${catalogLabel.toLowerCase()}`} placeholder="Search this business" value={p.query} onChange={(e) => p.setQuery(e.target.value)} />
          {p.query ? <button type="button" title="Clear search" aria-label="Clear product search" onClick={() => p.setQuery("")}><X size={17} aria-hidden="true" /></button> : null}
        </div>
        {categories.some((c) => c.is_active) ? <select aria-label="Product category" value={p.filter} onChange={(e) => p.setFilter(e.target.value)}>
          <option value="all">All {catalogLabel.toLowerCase()}</option>
          {categories.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select> : null}
        <span className={styles.resultCount} aria-live="polite">{p.products.length} {p.products.length === 1 ? "item" : "items"}</span>
      </div>
      {p.products.length ? <div className={styles.grid}>
        {p.products.map((product) => <article key={product.id} className={styles.product}>
          <a className={styles.productImage} href={productHref(business.handle, product.id)} onClick={e => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) { e.preventDefault(); p.openProduct(product); } }} aria-label={`View ${product.name}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {product.image_path ? <img src={product.image_path} alt="" loading="lazy" decoding="async" /> : <PackageOpen size={32} aria-hidden="true" />}
          </a>
          <div className={styles.productCopy}>
            <h3><a href={productHref(business.handle, product.id)} onClick={e => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) { e.preventDefault(); p.openProduct(product); } }}>{product.name}</a></h3>
            {product.description ? <p>{product.description}</p> : null}
            {product.availability !== "available" ? <span className={styles.availability}>{({ limited: "Limited availability", unavailable: "Unavailable", coming_soon: "Coming soon" })[product.availability]}</span> : null}
            <div className={styles.productActions}>
              <span className={styles.price}>{product.price_minor !== null ? formatEtbPrice(product.price_minor) : "Ask for price"}</span>
              <button type="button" className={styles.add} aria-label={`${p.selectedIds?.includes(product.id) ? "Added to inquiry list" : "Add to inquiry list"}: ${product.name}`} title="Add to inquiry list"
                disabled={product.availability === "unavailable" || product.availability === "coming_soon" || p.selectedIds?.includes(product.id)} onClick={() => p.addProduct(product)}>{p.selectedIds?.includes(product.id) ? <Check size={16} aria-hidden="true" /> : <ListPlus size={16} aria-hidden="true" />}<span>{p.selectedIds?.includes(product.id) ? "Added to inquiry list" : "Add to inquiry list"}</span></button>
            </div>
          </div>
        </article>)}
      </div> : <div className={styles.empty}><PackageOpen size={28} aria-hidden="true" /><p>{p.query || p.filter !== "all" ? `No matching ${catalogLabel.toLowerCase()}.` : `No ${catalogLabel.toLowerCase()} yet.`}</p>
        {p.query || p.filter !== "all" ? <button type="button" onClick={() => { p.setQuery(""); p.setFilter("all"); }}>Show all {catalogLabel.toLowerCase()}</button> : null}
      </div>}
      </>}
    </section>
    <section className={styles.contacts} aria-label="Connect with this business">
      <div className={styles.contactHeading}><h2>Stay in touch<ArrowUpRight size={22} aria-hidden="true" /></h2><p>{business.name}</p></div>
      <div className={styles.contactLinks}>
        <button type="button" className={styles.contactInquiry} onClick={p.cartCount ? p.openCart : () => { p.onBackToProducts?.(); document.getElementById(productsId)?.scrollIntoView({ block: "start" }); }}><ClipboardList size={18} aria-hidden="true" />{p.cartCount > 1 ? "Inquire about selected items" : p.cartCount ? "Inquire about selected item" : `Explore ${catalogLabel.toLowerCase()}`}</button>
        {contacts.map((contact) => {
          const Icon = contactIcons[contact.kind];
          const content = <><Icon size={18} aria-hidden="true" /><span>{contact.label}</span></>;
          return p.previewMode ? <span key={contact.kind} className={styles.contactPreview}>{content}</span>
            : <a key={contact.kind} href={contact.href} target={contact.external ? "_blank" : undefined} rel={contact.external ? "noopener noreferrer" : undefined}>
              {content}{contact.external ? <span className="sr-only"> (new tab)</span> : null}
            </a>;
        })}
      </div>
    </section>
  </div>;
}
