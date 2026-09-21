"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, Check, Copy, PackageOpen, Play, ListPlus, MessageCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import { inquiryEligible, productSellingUnit } from "@/lib/product-inquiry";
import { offeringNoun } from "@/lib/offerings";
import { formatEtbPrice } from "@/lib/offering-presentation";
import { privacyEnhancedYouTubeEmbedUrl } from "@/lib/youtube-provider";
import styles from "./ProductPage.module.css";

export default function ProductPage({ product, backHref, onBack, onAdd, onInquire, isAdded, copyLink, catalogLabel = "Products" }: {
  catalogLabel?: string;
  product: Product | null; backHref: string; onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
  onAdd: (options: Record<string, string>) => void; onInquire: (options: Record<string, string>) => void;
  isAdded: (options: Record<string, string>) => boolean; copyLink: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const [playing, setPlaying] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const hasPhoto = Boolean(product?.image_path) && !imageFailed;
  const [options, setOptions] = useState<Record<string, string>>(() => Object.fromEntries((product?.option_groups || []).map(g => [g.name, g.values[0]?.value || ""])));
  useEffect(() => { if (photo.current?.complete && photo.current.naturalWidth === 0) setImageFailed(true); }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.closest("[data-product-page]")?.scrollIntoView({ block: "start" }); }, []);
  let video = "";
  if (product?.video_ref) { try { video = privacyEnhancedYouTubeEmbedUrl(product.video_ref); } catch {} }
  const noun = product ? offeringNoun(product.offering_kind) : "item";
  const unit = product ? productSellingUnit(product) : "";
  return <article className={styles.page} data-product-page>
    <div className={styles.navigation}><a href={backHref} onClick={onBack}><ArrowLeft size={18} aria-hidden="true" />Back to {catalogLabel.toLowerCase()}</a>{product ? <button type="button" onClick={copyLink}><Copy size={16} aria-hidden="true" />Copy {noun} link</button> : null}</div>
    {!product ? <div className={styles.unavailable}><PackageOpen size={36} aria-hidden="true" /><h2 ref={heading} tabIndex={-1}>Item unavailable</h2><p>This item is no longer listed here. Explore the business’s current offerings.</p></div> : <div className={styles.layout}>
      <div className={styles.media}>
        <div className={styles.stage}>
          {playing && video ? <iframe src={`${video}?autoplay=1`} title={`${product.name} video`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            : hasPhoto ? <img ref={photo} src={product.image_path} alt={product.name} onError={() => setImageFailed(true)} /> : <div className={styles.placeholder}><PackageOpen size={40} aria-hidden="true" /><span>{video ? "See more in the video" : "No photo yet"}</span></div>}
          {!playing && video ? <button type="button" className={styles.play} onClick={() => setPlaying(true)}><Play size={18} aria-hidden="true" />Watch video</button> : null}
        </div>
        {playing ? <button className={styles.photo} type="button" onClick={() => setPlaying(false)}>{hasPhoto ? "Back to photo" : "Close video"}</button> : null}
      </div>
      <div className={styles.copy}>
        {product.category_name ? <span className={styles.category}>{product.category_name}</span> : null}
        <h2 ref={heading} tabIndex={-1}>{product.name}</h2>
        <div className={styles.priceRow}><strong>{product.price_minor !== null ? formatEtbPrice(product.price_minor) : "Ask for price"}</strong>{unit ? <span>{unit}</span> : null}</div>
        {product.description ? <p className={styles.description}>{product.description}</p> : null}
        {product.highlights.length ? <ul className={styles.features} aria-label="Highlights">{product.highlights.map(feature => <li key={feature}><Check size={14} aria-hidden="true" />{feature}</li>)}</ul> : null}
        {product.availability !== "available" ? <p className={styles.availability}>{({ limited: "Limited availability", unavailable: "Currently unavailable", coming_soon: "Coming soon" })[product.availability]}</p> : null}
        {product.option_groups?.some(group => group.values.length > 1) ? <div className={styles.options}>{product.option_groups.filter(group => group.values.length > 1).map(group => <label key={group.id}><span>{group.name}</span><select value={options[group.name] || ""} onChange={e => setOptions(current => ({ ...current, [group.name]: e.target.value }))}>{group.values.map(value => <option key={value.id}>{value.value}</option>)}</select></label>)}</div> : null}
        <div className={styles.actions}>
          <div>
            <button type="button" className={styles.primary} disabled={!inquiryEligible(product)} onClick={() => onInquire(options)}><MessageCircle size={18} aria-hidden="true" /><span>Inquire about this {noun} only</span></button>
          </div>
          <div>
            <button type="button" className={styles.secondary} disabled={!inquiryEligible(product) || isAdded(options)} onClick={() => onAdd(options)}>{isAdded(options) ? <Check size={18} aria-hidden="true" /> : <ListPlus size={18} aria-hidden="true" />}<span>{isAdded(options) ? "Added to list" : "Add to inquiry list"}</span></button>
          </div>
        </div>
      </div>
    </div>}
  </article>;
}
