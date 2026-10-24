"use client";
import { useUiText } from "@/lib/i18n/ui";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, Check, Copy, PackageOpen, ListPlus, MessageCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import { inquiryEligible, productSellingUnit } from "@/lib/product-inquiry";
import { offeringNoun, productSupplyLabel } from "@/lib/offerings";
import { formatEtbPrice } from "@/lib/offering-presentation";
import { productMedia } from "@/lib/product-media";
import {orderScopeLabels} from "@/lib/order-scope";
import ProductMediaGallery from "./ProductMediaGallery";
import styles from "./ProductPage.module.css";

export default function ProductPage({ product, backHref, onBack, onAdd, onInquire, isAdded, copyLink, ready, catalogLabel = "Products", isDemo = false }: {
  catalogLabel?: string;
  isDemo?: boolean;
  ready: boolean;
  product: Product | null; backHref: string; onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
  onAdd: (options: Record<string, string>) => void; onInquire: (options: Record<string, string>) => void;
  isAdded: (options: Record<string, string>) => boolean; copyLink: () => void;
}) {
  const t = useUiText();
  const heading = useRef<HTMLHeadingElement>(null);
  const [options, setOptions] = useState<Record<string, string>>(() => Object.fromEntries((product?.option_groups || []).map(g => [g.name, g.values[0]?.value || ""])));
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.closest("[data-product-page]")?.scrollIntoView({ block: "start" }); }, []);
  const noun = product ? offeringNoun(product.offering_kind) : "item";
  const unit = product ? productSellingUnit(product) : "";
  return <article className={styles.page} data-product-page>
    <div className={styles.navigation}><a href={backHref} onClick={onBack}><ArrowLeft size={18} aria-hidden="true" />{t("Back to {value1}", { value1: t(catalogLabel).toLowerCase() })}</a>{product ? <button type="button" onClick={copyLink}><Copy size={16} aria-hidden="true" />{t("Copy {value1} link", { value1: t(noun) })}</button> : null}</div>
    {!product ? <div className={styles.unavailable}><PackageOpen size={36} aria-hidden="true" /><h2 ref={heading} tabIndex={-1}>{t("Item unavailable")}</h2><p>{t("This item is no longer listed. Browse the shop’s other products.")}</p></div> : <div className={styles.layout}>
      <div className={styles.media}><ProductMediaGallery key={product.id} items={productMedia(product)} name={product.name} /></div>
      <div className={styles.copy}>
        {isDemo ? <span className={styles.category}>{t("Example product")}</span> : null}
        {product.category_name ? <span className={styles.category}>{product.category_name}</span> : null}
        <h2 ref={heading} tabIndex={-1}>{product.name}</h2>
        <div className={styles.priceRow}><strong>{product.price_minor !== null ? formatEtbPrice(product.price_minor) : t("Ask for price")}</strong>{unit ? <span>{unit}</span> : null}</div>
        {orderScopeLabels(product.order_scope).length ? <ul className={styles.orderTags} aria-label={t("Order sizes")}>{orderScopeLabels(product.order_scope).map(label=><li key={label}>{t(label)}</li>)}</ul> : null}
        <p className={styles.availability}>{t(productSupplyLabel(product.offering_kind, product.availability))}</p>
        {(product.minimum_order_summary || product.lead_time_summary || product.capacity_summary) ? <dl className={styles.facts}>
          {product.minimum_order_summary ? <div><dt>{t("Minimum order")}</dt><dd>{product.minimum_order_summary}</dd></div> : null}
          {product.lead_time_summary ? <div><dt>{t("Typical lead time")}</dt><dd>{product.lead_time_summary}</dd></div> : null}
          {product.capacity_summary ? <div><dt>{t("Supply capacity")}</dt><dd>{product.capacity_summary}</dd></div> : null}
        </dl> : null}
        {product.description ? <p className={styles.description}>{product.description}</p> : null}
        {product.highlights.length ? <ul className={styles.features} aria-label={t("Highlights")}>{product.highlights.map(feature => <li key={feature}><Check size={14} aria-hidden="true" />{feature}</li>)}</ul> : null}
        {product.option_groups?.some(group => group.values.length > 1) ? <div className={styles.options}>{product.option_groups.filter(group => group.values.length > 1).map(group => <label key={group.id}><span>{group.name}</span><select value={options[group.name] || ""} onChange={e => setOptions(current => ({ ...current, [group.name]: e.target.value }))}>{group.values.map(value => <option key={value.id}>{value.value}</option>)}</select></label>)}</div> : null}
        <div className={styles.actions}>
          <div>
            <button type="button" className={styles.primary} disabled={!ready || !inquiryEligible(product)} onClick={() => onInquire(options)}><MessageCircle size={18} aria-hidden="true" /><span>{t("Inquire about this {value1} only", { value1: t(noun) })}</span></button>
          </div>
          <div>
            <button type="button" className={styles.secondary} disabled={!ready || !inquiryEligible(product) || isAdded(options)} onClick={() => onAdd(options)}>{isAdded(options) ? <Check size={18} aria-hidden="true" /> : <ListPlus size={18} aria-hidden="true" />}<span>{isAdded(options) ? t("Added to inquiry list") : t("Add to inquiry list")}</span></button>
          </div>
        </div>
      </div>
    </div>}
  </article>;
}
