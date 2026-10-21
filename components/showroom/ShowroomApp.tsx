"use client";
import {copyBrowserText as copyText, openCopiedBrowserLink} from "@/lib/browser-clipboard";
import LanguageSelector from "@/components/LanguageSelector";
import SuqpageBrand from "@/components/SuqpageBrand";
import { useUiText } from "@/lib/i18n/ui";

import { readPlatformState } from "@/lib/platform-state";

import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Home,
  LayoutGrid,
  MessageCircle,
  ShoppingBag, Copy, MessageSquare, X, PackageOpen,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "@/lib/showroom-bank-release";
import { parseShowroomDesignProposalV2 } from "@/lib/showroom-composition-v2";
import {
  parseShowroomContentBlocks,
  type ShowroomContentBlocksDocument,
} from "@/lib/showroom-content-blocks";
import { canonicalizeShowroomChapters } from "@/lib/showroom-chapters";
import { parsePublishedDesignManifest } from "@/lib/showroom-manifests";
import type { Catalog, Product } from "@/lib/types";
import {
  catalogOfferingLabel,
  offeringNoun,
  isPublicProduct,
  productSupplyLabel,
} from "@/lib/offerings";
import { formatEtbPrice } from "@/lib/offering-presentation";
import { normalizeProductDetailPattern } from "@/lib/product-detail-patterns";
import { productVideoEmbedUrl } from "@/lib/video/product-video";
import { showroomCategories, showroomProductCategory } from "@/lib/showroom-categories";
import SocialVideoFrame from "../SocialVideoFrame";
import { AlHayaDesign, HomeVibeDesign, NovaTechDesign, UsaShopDesign, type DesignProps } from "./designs";
import { CompositionShowroom, InvalidComposition } from "./bank/CompositionShowroom";
import BusinessProfile from "./BusinessProfile";
import ProductPage from "./ProductPage";
import PublicBusinessSafety from '../PublicBusinessSafety';
import { InquiryFloatingAction } from "@/components/PublicActionDock";
import inquiryStyles from "./InquiryComposer.module.css";
import { legacyPublicContacts, type PublicContacts, type PublicContactLink } from "@/lib/business-profile-contacts";
import { canOpenPublicContact } from "@/lib/demo-inquiry-policy";
import { buildInquiryMessage, inquiryHandoffs, inquiryEligible, linkedProduct, MAX_INQUIRY_SELECTIONS, restoreInquiry, selectionKey, selectionOptions, type InquirySelection } from "@/lib/product-inquiry";
import type { ShopPageContent } from "@/lib/owner-page-domain";
import { showroomTokenVariables } from "./bank/tokens";
import "./showrooms.css";

type CartLine = InquirySelection;
const PUBLIC_WORKSPACE_RETURN_KEY = "suqpage:last-marketplace-url:v1";
const focusableSelector =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function validPublicWorkspaceReturn(raw: string | null, origin: string) {
  if (!raw) return null;
  try {
    const destination = new URL(raw, origin);
    if (destination.origin !== origin || !["/", "/featured"].includes(destination.pathname)) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}

function trapTab(event: KeyboardEvent, root: HTMLElement) {
  if (event.key !== "Tab") return;
  const controls = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hidden && element.getClientRects().length > 0,
  );
  if (!controls.length) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}

export default function ShowroomApp({ catalog, previewMode = false, embedded = false, withinPublicApp = false, businessProfile }: { catalog: Catalog; previewMode?: boolean; embedded?: boolean; withinPublicApp?: boolean; businessProfile?: ShopPageContent }) {
  const t = useUiText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routedProduct = businessProfile && !previewMode ? searchParams.get("product") : null;
  const storageKey = `suqpage-cart:${catalog.business.handle}${previewMode?":private-preview":""}`;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [localSelected, setSelected] = useState<Product | null>(null);
  const selected = businessProfile && !previewMode ? linkedProduct(catalog, routedProduct) : localSelected;
  const [directLine, setDirectLine] = useState<CartLine | null>(null);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  // Reused routes cannot expose the previous tenant's selections before restore.
  const cartReady = previewMode || hydratedKey === storageKey;
  const savedCart = useMemo(() => cartReady ? restoreInquiry(catalog, cart.map(line => ({ productId: line.product.id, quantity: line.quantity, options: line.options }))) : [], [cartReady, catalog, cart]);
  const activeDirectLine = useMemo(() => directLine ? restoreInquiry(catalog, [{ productId: directLine.product.id, quantity: directLine.quantity, options: directLine.options }])[0] || null : null, [catalog, directLine]);
  const productReturnScroll = useRef<number | null>(null);
  const previousProductId = useRef<number | null>(null);
  const [productMediaMode, setProductMediaMode] = useState<"image" | "video">("image");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [contactFallback, setContactFallback] = useState<{href:string;label:string} | null>(null);
  const productDialog = useRef<HTMLDivElement>(null);
  const productOpener = useRef<HTMLElement | null>(null);
  const drawerOpener = useRef<HTMLElement | null>(null);
  const categories = useMemo(() => showroomCategories(catalog), [catalog]);
  const categoryFilter = filter === "all" || categories.some(category => String(category.id) === filter) ? filter : "all";
  useEffect(() => { if (filter !== categoryFilter) setFilter(categoryFilter); }, [filter, categoryFilter]);

  const products = useMemo(
    () =>
      catalog.products.filter(
        (product) =>
          product.business_id === catalog.business.id && product.is_published && isPublicProduct(product) &&
          (categoryFilter === "all" || product.category_id === Number(categoryFilter)) &&
          (!query ||
            `${product.name} ${product.description} ${showroomProductCategory(catalog.business.id, categories, product)?.name || ""} ${product.offering_kind} ${product.capacity_summary}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [catalog.products, catalog.business.id, categories, categoryFilter, query],
  );

  useEffect(() => {
    if(previewMode){setCart([]);return;}
    try {
      setCart(restoreInquiry(catalog, JSON.parse(readPlatformState(localStorage, storageKey) || "[]")));
    } catch { setCart([]); }
    setHydratedKey(storageKey);
  }, [storageKey, catalog, previewMode]);

  useEffect(() => { setDrawer(false); setDirectLine(null); }, [storageKey]);

  useEffect(() => {
    if(previewMode || hydratedKey !== storageKey)return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(
          cart.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
            options: line.options,
          })),
        ),
      );
    } catch {}
  }, [cart, storageKey, previewMode, hydratedKey]);

  useEffect(() => {
    if (!selected || businessProfile) return;
    const root = productDialog.current;
    if (!root) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelected(null);
        return;
      }
      trapTab(event, root);
    };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => root.querySelector<HTMLElement>(focusableSelector)?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      productOpener.current?.focus();
    };
  }, [selected, businessProfile]);

  useEffect(() => {
    if (!businessProfile) return;
    const oldId = previousProductId.current;
    previousProductId.current = selected?.id || null;
    if (selected || !oldId) return;
    requestAnimationFrame(() => {
      const link = document.querySelector<HTMLAnchorElement>(`[data-business-profile] a[href="/@${catalog.business.handle}?product=${oldId}"]`);
      if (productReturnScroll.current !== null) window.scrollTo(0, productReturnScroll.current);
      else link?.scrollIntoView({ block: "center" });
      link?.focus({ preventScroll: true });
    });
  }, [selected, businessProfile, catalog.business.handle]);

  const show = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2_600);
  };
  const openProduct = (product: Product) => {
    productOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const defaults: Record<string, string> = {};
    product.option_groups?.forEach((group) => {
      if (group.values[0]) defaults[group.name] = group.values[0].value;
    });
    setSelections(defaults);
    setProductMediaMode(product.image_path ? "image" : "video");
    if (businessProfile && !previewMode) {
      productReturnScroll.current = window.scrollY;
      const url = new URL(window.location.href);
      url.searchParams.set("product", String(product.id));
      window.history.pushState(null, "", `${url.pathname}${url.search}`);
    } else setSelected(product);
  };
  const add = (product: Product, options: Record<string, string> = {}) => {
    if (!cartReady) return;
    if (previewMode && !businessProfile) { show("Preview only. No inquiry will be sent."); return; }
    const validOptions = selectionOptions(product, options);
    if (!inquiryEligible(product) || product.business_id !== catalog.business.id || !validOptions) { show("Choose the available product options first."); return; }
    const key = selectionKey(product.id, validOptions);
    if (cart.some(line => selectionKey(line.product.id, line.options) === key)) { show("Already in your inquiry list."); return; }
    if (cart.length >= MAX_INQUIRY_SELECTIONS) { show("You can include up to 20 selections in one inquiry."); return; }
    setCart(current => current.length >= MAX_INQUIRY_SELECTIONS || current.some(line => selectionKey(line.product.id, line.options) === key)
      ? current : [...current, { product, quantity: "", options: validOptions }]);
    if (!businessProfile) setSelected(null);
    show("Added to inquiry list.");
  };
  const inquireNow = (product: Product, options: Record<string, string>) => {
    if (!cartReady) return;
    const validOptions = selectionOptions(product, options);
    if (!inquiryEligible(product) || product.business_id !== catalog.business.id || !validOptions) return;
    drawerOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDirectLine({ product, quantity: "", options: validOptions });
    setDrawer(true);
  };
  const backToProducts = (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    if (previewMode) setSelected(null);
    else {
      const url = new URL(window.location.href); url.searchParams.delete("product");
      window.history.pushState(null, "", `${url.pathname}${url.search}`);
    }
    requestAnimationFrame(() => {
      if (productOpener.current?.isConnected) { if (productReturnScroll.current !== null) window.scrollTo(0, productReturnScroll.current); productOpener.current.focus({ preventScroll: true }); }
      else document.querySelector<HTMLElement>("[data-business-profile] [aria-label='Products']")?.scrollIntoView({ block: "start" });
    });
  };
  const setDesiredQuantity = (index: number, raw: string) => {
    const selection = savedCart[index];
    if (!selection) return;
    const key = selectionKey(selection.product.id, selection.options);
    setCart((current) =>
      current.map((line) => {
        if (selectionKey(line.product.id, line.options) !== key) return line;
        return { ...line, quantity: raw.replace(/\s+/g, " ").slice(0, 80) };
      }),
    );
  };
  const removeSavedSelection = (index: number) => {
    const selection = savedCart[index];
    if (!selection) return;
    const key = selectionKey(selection.product.id, selection.options);
    setCart(current => current.filter(line => selectionKey(line.product.id, line.options) !== key));
  };

  const cartCount = savedCart.length;
  const openCart = () => {
    if (!cartReady) return;
    if(previewMode && !businessProfile){show("Private preview only — the inquiry cart is disabled.");return;}
    drawerOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDirectLine(null);
    setDrawer(true);
  };
  useEffect(() => {
    if (!cartReady || previewMode || searchParams.get("inquiry") !== "list" || window.location.pathname !== `/@${encodeURIComponent(catalog.business.handle)}`) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("inquiry");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    drawerOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDirectLine(null);
    setDrawer(true);
  }, [cartReady, previewMode, searchParams, storageKey]);
  async function contactWithSelections(event: React.MouseEvent<HTMLAnchorElement>, contact: PublicContactLink) {
    if (!canOpenPublicContact(catalog.business.is_demo, catalog.business.approvedDemoContactMethods, contact.kind)) { event.preventDefault(); return; }
    if (!savedCart.length) return;
    const message = buildInquiryMessage(catalog.business, savedCart, window.location.origin, t);
    const link = inquiryHandoffs(businessProfile?.contacts || legacyPublicContacts(catalog.business), message).find(item => item.kind === contact.kind && item.external);
    if (!link) return;
    event.preventDefault();
    setContactFallback(null);
    const result = await openCopiedBrowserLink(message, link.href, link.external);
    if (!result.opened) setContactFallback(link);
    show(result.copied ? "Message copied. Paste it in the conversation if needed." : "Select and copy your message");
    if (!result.copied || !result.opened) openCart();
  }
  const designProps: DesignProps = {
    catalog,
    products,
    filter: categoryFilter,
    setFilter,
    query,
    setQuery,
    openProduct,
    addProduct: (product) => (product.option_groups?.length ? openProduct(product) : add(product)),
    cartCount,
    openCart,
  };
  const registry = {
    alhaya: AlHayaDesign,
    usashopet: UsaShopDesign,
    novatech: NovaTechDesign,
    homevibe: HomeVibeDesign,
  } as const;
  const legacyDesign =
    registry[catalog.business.design_key as keyof typeof registry];
  const LegacyDesign = legacyDesign;
  let compositionManifest = null;
  let compositionContentBlocks = undefined;
  if (!businessProfile && catalog.business.design_key === "composition") {
    try {
      const manifestInput = JSON.parse(catalog.business.design_manifest_json);
      if (manifestInput?.schemaVersion === 2) {
        compositionContentBlocks = parseShowroomContentBlocks(
          JSON.parse(catalog.business.content_blocks_json),
          "managed",
        );
        compositionManifest = parseShowroomDesignProposalV2(
          manifestInput,
          SHOWROOM_COMPONENT_BANK_LATEST,
          compositionContentBlocks,
          "managed",
        );
        const canonical = canonicalizeShowroomChapters(
          compositionContentBlocks,
          compositionManifest,
        );
        compositionContentBlocks = parseShowroomContentBlocks(
          canonical.contentBlocks,
          "managed",
        );
        compositionManifest = parseShowroomDesignProposalV2(
          canonical.designManifest,
          SHOWROOM_COMPONENT_BANK_LATEST,
          compositionContentBlocks,
          "managed",
        );
      } else {
        compositionManifest = parsePublishedDesignManifest(manifestInput);
      }
    } catch {}
  }
  const runtimeTokenVariables = compositionManifest
    ? showroomTokenVariables(compositionManifest)
    : undefined;
  const productDetailPattern = normalizeProductDetailPattern(
    compositionManifest && "productDetailPattern" in compositionManifest
      ? compositionManifest.productDetailPattern
      : undefined,
  );
  const ShowroomRoot = embedded || withinPublicApp ? "div" : "main";

  return (
    <PublicBusinessSafety business={catalog.business} productId={selected?.id} disabled={previewMode}>
      {!(previewMode && businessProfile) ? <nav
        className={`showroom-host-bar${withinPublicApp ? " showroom-host-bar-shell" : ""}`}
        aria-label={t("Page return navigation")}
      >
        <button type="button" className="showroom-host-back" aria-label={t("Back to Market")} onClick={() => {
          let remembered: string | null = null;
          try {
            remembered = readPlatformState(window.sessionStorage, PUBLIC_WORKSPACE_RETURN_KEY);
          } catch {}
          const destination = validPublicWorkspaceReturn(remembered, window.location.origin);
          if (destination) {
            router.push(destination);
            return;
          }
          const referrer = document.referrer ? new URL(document.referrer) : null;
          if (referrer?.origin === window.location.origin && (referrer.pathname === "/" || referrer.pathname === "/discover")) {
            router.back();
            return;
          }
          router.push("/");
        }}>
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={2.4} />
          <span>{t("Back to Market")}</span>
        </button>
        {withinPublicApp ? <SuqpageBrand className="showroom-host-brand" /> : null}
        <span className="showroom-language"><LanguageSelector /></span>
      </nav> : null}
      <ShowroomRoot
        className={`runtime-root theme-${catalog.business.design_key}${withinPublicApp ? " is-public-shell" : ""}${compositionManifest && !previewMode && !embedded ? " has-showroom-mobile-nav" : ""}`}
        style={runtimeTokenVariables as CSSProperties | undefined}
      >
      {!embedded && !businessProfile ? <h1 className="sr-only">{catalog.business.name} {" "}{t("on MirtPage")}</h1> : null}
      {businessProfile ? <BusinessProfile {...designProps} profile={businessProfile} previewMode={previewMode} embedded={embedded}
        selectedIds={savedCart.map(line => line.product.id)} onBackToProducts={backToProducts} onContact={contactWithSelections}
        productDetail={selected || routedProduct ? <ProductPage ready={previewMode || hydratedKey === storageKey} catalogLabel={catalogOfferingLabel(catalog.products.filter(product => product.is_published))} key={selected?.id || "unavailable"} product={selected ? {...selected, category_name: showroomProductCategory(catalog.business.id, categories, selected)?.name} : null}
          backHref={`/@${catalog.business.handle}`} onBack={backToProducts}
          onAdd={options => selected && add(selected, options)} onInquire={options => selected && inquireNow(selected, options)}
          isAdded={options => Boolean(selected && savedCart.some(line => selectionKey(line.product.id, line.options) === selectionKey(selected.id, options)))}
          copyLink={async () => { const copied = await copyText(`${window.location.origin}/@${catalog.business.handle}?product=${selected?.id}`); show(copied ? "Product link copied." : "Copy the product address from your browser."); }} /> : undefined} /> : compositionManifest ? (
        <CompositionShowroom
          {...designProps}
          manifest={compositionManifest}
          contentBlocks={compositionContentBlocks}
        />
      ) : LegacyDesign ? (
        // Temporary read-only recovery path for pre-migration database backups.
        <LegacyDesign {...designProps} />
      ) : (
        <InvalidComposition />
      )}
      {contactFallback && <a href={contactFallback.href} target="_blank" rel="noopener noreferrer">{contactFallback.label} ↗</a>}
      {!previewMode && !embedded ? <InquiryFloatingAction count={cartCount} handle={catalog.business.handle} onOpen={openCart} dialogOpen={drawer && cartReady} /> : null}
      {compositionManifest && !previewMode && !embedded ? (
        <nav className="showroom-mobile-nav" aria-label={t("Page sections")}>
          <a href="#showroom-home"><Home aria-hidden="true" /><span>{t("Home")}</span></a>
          <a href="#showroom-story"><BookOpen aria-hidden="true" /><span>{t("Story")}</span></a>
          <a href="#showroom-catalog"><LayoutGrid aria-hidden="true" /><span>{t("Offerings")}</span></a>
          <a href="#showroom-contact"><MessageCircle aria-hidden="true" /><span>{t("Contact")}</span></a>
        </nav>
      ) : null}
      {selected && !businessProfile && (
        <div
          ref={productDialog}
          className="product-dialog open"
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
          tabIndex={-1}
        >
          <div
            className={`product-dialog-panel${selected.image_path || selected.video_ref ? "" : " no-media"}`}
            data-detail-pattern={productDetailPattern}
          >
            <button className="icon-button dialog-close" aria-label={t("Close product")} onClick={() => setSelected(null)}>
              ×
            </button>
            <div className={`product-dialog-grid${selected.image_path || selected.video_ref ? "" : " no-media"}`}>
              {selected.image_path || selected.video_ref ? (
                <div className="product-dialog-media">
                  {selected.image_path && selected.video_ref ? (
                    <div className="product-dialog-media-tabs" aria-label={t("Product media")}>
                      <button
                        type="button"
                        className={productMediaMode === "image" ? "active" : ""}
                        aria-pressed={productMediaMode === "image"}
                        onClick={() => setProductMediaMode("image")}
                      >
                        {t("Photo")}</button>
                      <button
                        type="button"
                        className={productMediaMode === "video" ? "active" : ""}
                        aria-pressed={productMediaMode === "video"}
                        onClick={() => setProductMediaMode("video")}
                      >
                        {t("Video")}</button>
                    </div>
                  ) : null}
                  {selected.image_path && productMediaMode === "image" ? (
                    <img src={selected.image_path} alt={selected.name} />
                  ) : null}
                  {selected.video_ref && productMediaMode === "video" ? (
                    <ProductVideo product={selected} />
                  ) : null}
                </div>
              ) : null}
              <div className="product-dialog-copy">
                <span className="eyebrow">
                  {t(productSupplyLabel(selected.offering_kind, selected.availability))}
                </span>
                <h2>{selected.name}</h2>
                {selected.price_minor !== null ? (
                  <p className="product-dialog-price">{formatEtbPrice(selected.price_minor)}</p>
                ) : null}
                <p className="product-dialog-description">{selected.description}</p>
                {selected.highlights.length ? (
                  <ul className="product-dialog-highlights" aria-label={t("Offering highlights")}>
                    {selected.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                ) : null}
                <dl className="product-dialog-facts">
                  <div><dt>{t("Status")}</dt><dd>{t(productSupplyLabel(selected.offering_kind, selected.availability))}</dd></div>
                  {selected.quantity_unit ? <div><dt>{t("Offered by")}</dt><dd>{selected.quantity_unit}</dd></div> : null}
                  {selected.capacity_summary ? <div><dt>{t("Capacity")}</dt><dd>{selected.capacity_summary}</dd></div> : null}
                  {selected.minimum_order_summary ? <div><dt>{t("Minimum order")}</dt><dd>{selected.minimum_order_summary}</dd></div> : null}
                  {selected.lead_time_summary ? <div><dt>{t("Lead time")}</dt><dd>{selected.lead_time_summary}</dd></div> : null}
                </dl>
                {selected.option_groups?.map((group) => (
                  <label className="option-set" key={group.id}>
                    <strong>{group.name}</strong>
                    <select
                      value={selections[group.name] || ""}
                      onChange={(event) =>
                        setSelections((current) => ({ ...current, [group.name]: event.target.value }))
                      }
                    >
                      {group.values.map((value) => (
                        <option key={value.id}>{value.value}</option>
                      ))}
                    </select>
                  </label>
                ))}
                <button
                  className="sr-cart-trigger"
                  aria-label={t("Add selected item")}
                  disabled={!["available", "limited"].includes(selected.availability)}
                  onClick={() => add(selected, selections)}
                >
                  {t("Add to inquiry list")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!previewMode || businessProfile ? <InquiryDrawer
        open={drawer && cartReady}
        close={() => { setDrawer(false); setDirectLine(null); }}
        opener={drawerOpener}
        catalog={catalog}
        cart={directLine ? (activeDirectLine ? [activeDirectLine] : []) : savedCart}
        directOnly={Boolean(directLine)}
        contacts={businessProfile?.contacts || legacyPublicContacts(catalog.business)}
        setDesiredQuantity={(index, value) => activeDirectLine ? setDirectLine({ ...activeDirectLine, quantity: value.replace(/\s+/g, " ").slice(0, 80) }) : setDesiredQuantity(index, value)}
        remove={(index) => activeDirectLine ? setDirectLine(null) : removeSavedSelection(index)}
        clear={() => setCart([])}
        show={show}
        previewOnly={previewMode}
      /> : null}
      {toast && (
        <div className="toast" role="status">
          {t(toast)}
        </div>
      )}
      </ShowroomRoot>
    </PublicBusinessSafety>
  );
}

function ProductVideo({ product }: { product: Product }) {
  const t = useUiText();
  let src = "";
  try {
    src = productVideoEmbedUrl(product.video_ref);
  } catch {
    return null;
  }
  if (!product.video_ref.startsWith("youtube:")) return <div className="product-dialog-video"><SocialVideoFrame poster={product.image_path} video={product.video_ref} title={t("{value1} video", {value1:product.name})}/></div>;
  return (
    <div className="product-dialog-video">
      <iframe
        src={src}
        title={t("{value1} video", { value1: product.name })}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        allowFullScreen
      />
    </div>
  );
}

function InquiryDrawer({
  open,
  close,
  opener,
  catalog,
  cart,
  setDesiredQuantity,
  remove,
  clear,
  show,
  previewOnly = false,
  contacts,
  directOnly = false,
}: {
  open: boolean;
  close: () => void;
  opener: RefObject<HTMLElement | null>;
  catalog: Catalog;
  cart: CartLine[];
  setDesiredQuantity: (index: number, raw: string) => void;
  remove: (index: number) => void;
  clear: () => void;
  show: (message: string) => void;
  previewOnly?: boolean;
  contacts: PublicContacts;
  directOnly?: boolean;
}) {
  const t = useUiText();
  const [preparedMessage, setPreparedMessage] = useState("");
  const [openError, setOpenError] = useState("");
  const [fallbackLink, setFallbackLink] = useState<{href:string;label:string} | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const panel = useRef<HTMLElement>(null);
  const closeAction = useRef(close);
  closeAction.current = close;
  const signature = JSON.stringify(cart.map((line) => [line.product.id, line.quantity, line.options]));

  useEffect(() => {
    setPreparedMessage("");
    setCopyState("idle");
    setOpenError("");
    setFallbackLink(null);
  }, [signature, t]);
  useEffect(() => {
    if (!open) return;
    setPreparedMessage("");

    const root = panel.current;
    if (!root) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAction.current();
        return;
      }
      trapTab(event, root);
    };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => root.querySelector<HTMLElement>(focusableSelector)?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      // The coordinated dock becomes interactive again after modal cleanup.
      requestAnimationFrame(() => {
        const previous = opener.current;
        if (previous?.isConnected && previous !== document.body && previous !== document.documentElement && previous.matches(focusableSelector) && previous.getClientRects().length && !previous.closest("[inert]")) previous.focus();
        else {
          const floating = Array.from(document.querySelectorAll<HTMLElement>("[data-inquiry-floating]")).find(element => element.getClientRects().length && !element.closest("[inert]"));
          (floating || document.querySelector<HTMLElement>("[data-business-profile] a"))?.focus();
        }
      });
    };
  }, [open, opener]);

  const message = buildInquiryMessage(catalog.business, cart, typeof window === "undefined" ? "" : window.location.origin, t);
  const handoffs = inquiryHandoffs(contacts, message);
  async function copyInquiry() {
    if (!cart.length) {
      show("Choose at least one product.");
      return;
    }
    setPreparedMessage(message);
    const copied = await copyText(message);
    setCopyState(copied ? "copied" : "manual");
    show(copied ? "Inquiry copied." : "Select the inquiry text and copy it.");
  }
  async function openSocial(event: React.MouseEvent<HTMLAnchorElement>, link: ReturnType<typeof inquiryHandoffs>[number]) {
    event.preventDefault();
    if (!canOpenPublicContact(catalog.business.is_demo, catalog.business.approvedDemoContactMethods, link.kind)) return;
    setPreparedMessage(message);
    setOpenError("");
    setFallbackLink(null);
    const result = await openCopiedBrowserLink(message, link.href, link.external);
    setCopyState(result.copied ? "copied" : "manual");
    if (!result.opened) {
      setFallbackLink(link);
      setOpenError("Could not open the social app. Use the link below.");
    }
  }

  if (!open || typeof document === "undefined") return null;
  const busy = false;
  const item = (line: CartLine, index: number, grouped: boolean) => <div className={inquiryStyles.summary}>
    {line.product.image_path ? <img src={line.product.image_path} alt="" /> : <span className={inquiryStyles.thumb}><PackageOpen size={24} aria-hidden="true" /></span>}
    <div className={inquiryStyles.itemCopy}><h3>{line.product.name}</h3><p>{Object.entries(line.options).filter(([name]) => (line.product.option_groups?.find(group => group.name === name)?.values.length || 0) > 1).map(([name, value]) => `${name}: ${value}`).join(" · ")}</p>
      <details className={inquiryStyles.quantity}><summary>{line.quantity ? t("{value1}: {value2}", { value1: t("Quantity"), value2: line.quantity }) : t("Add quantity (optional)")}</summary><label>{t("Quantity")}<input type="text" value={line.quantity} maxLength={80} placeholder={t("e.g. 2 pieces or 5 kg")} disabled={busy} onChange={e => setDesiredQuantity(index, e.target.value)} /></label></details>
    </div>
    {grouped ? <button type="button" className={inquiryStyles.remove} disabled={busy} onClick={() => remove(index)} aria-label={t("Remove {value1} from inquiry", { value1: line.product.name })}><X size={18} aria-hidden="true" /></button> : null}
  </div>;
  return createPortal(<div className={inquiryStyles.overlay}>
    <div className={inquiryStyles.backdrop} onClick={close} />
    <aside ref={panel} className={inquiryStyles.panel} role="dialog" aria-modal="true" aria-label={t("Business inquiry")} tabIndex={-1}>
      <header className={inquiryStyles.head}><div><h2>{cart.length > 1 ? t("Inquire about {value1} items", { value1: cart.length }) : t("Inquire about this {value1}", { value1: t(cart[0] ? offeringNoun(cart[0].product.offering_kind) : "item") })}</h2><p>{catalog.business.name}</p></div><button type="button" className={inquiryStyles.close} aria-label={t("Close inquiry")} onClick={close}><X size={20} aria-hidden="true" /></button></header>
      <div className={inquiryStyles.scroll}>
        {!cart.length ? <div className={inquiryStyles.empty}><ShoppingBag size={32} aria-hidden="true" /><p>{t("Choose a product to start an inquiry.")}</p><button type="button" className={inquiryStyles.platformButton} onClick={close}>{t("Browse products")}</button></div> : <>
          {cart.length > 1 ? <ul className={inquiryStyles.list} aria-label={t("Inquiry items")}>{cart.map((line, index) => <li key={selectionKey(line.product.id, line.options)}>{item(line, index, true)}</li>)}</ul> : item(cart[0], 0, !directOnly)}
          {previewOnly ? <p className={inquiryStyles.note}>{t("Preview only. No inquiry will be sent.")}</p> : <div className={inquiryStyles.methods}>
            <h3>{t("Message the business")}</h3>
            <p className={inquiryStyles.note}>{t("Your message and selected products are copied before the conversation opens. Paste them if needed.")}</p>
            <div className={inquiryStyles.channels}>{handoffs.map(link => !canOpenPublicContact(catalog.business.is_demo, catalog.business.approvedDemoContactMethods, link.kind) ? <button key={link.kind} type="button" disabled><MessageSquare size={18} aria-hidden="true" />{link.label}</button> : <a key={link.kind} href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined} onClick={event => void openSocial(event, link)}><MessageSquare size={18} aria-hidden="true" />{link.label}{link.external && <span className="sr-only"> {t("(new tab)")}</span>}</a>)}
            </div><div className={inquiryStyles.manualCopy}>
              <button type="button" onClick={copyInquiry}><Copy size={18} aria-hidden="true" />{copyState === "copied" ? t("Copied") : t("Copy message")}</button>
            </div>
            {!handoffs.length && <p className={inquiryStyles.note}>{t("No social contact is available here. You can still copy the message.")}</p>}
            {copyState === "copied" && <p role="status" className={inquiryStyles.success}>{t("Message copied. Paste it in the conversation if needed.")}</p>}
            {copyState === "manual" && <p role="status">{t("Select and copy your message")}</p>}
            {openError && <p role="alert">{t(openError)}</p>}
            {fallbackLink && <a href={fallbackLink.href} target="_blank" rel="noopener noreferrer">{fallbackLink.label} ↗</a>}
            <details className={inquiryStyles.preview} open={preparedMessage ? true : undefined}><summary>{t("Your message")}</summary><textarea aria-label={t("Inquiry message")} readOnly value={message} onFocus={e => e.target.select()} /></details>
          </div>}
          {cart.length > 1 ? <button className={inquiryStyles.clear} disabled={busy} type="button" onClick={clear}>{t("Clear inquiry list")}</button> : null}
        </>}
      </div>
    </aside>
  </div>, document.body);
}
