"use client";

import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Home,
  LayoutGrid,
  MessageCircle,
  ShoppingBag, Copy, Send, Smartphone, X, PackageOpen, Check,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
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
  availabilityLabel,
  offeringKindLabels,
} from "@/lib/offerings";
import { formatEtbPrice } from "@/lib/offering-presentation";
import { normalizeProductDetailPattern } from "@/lib/product-detail-patterns";
import { privacyEnhancedYouTubeEmbedUrl } from "@/lib/youtube-provider";
import { AlHayaDesign, HomeVibeDesign, NovaTechDesign, UsaShopDesign, type DesignProps } from "./designs";
import { CompositionShowroom, InvalidComposition } from "./bank/CompositionShowroom";
import BusinessProfile from "./BusinessProfile";
import ProductPage from "./ProductPage";
import inquiryStyles from "./InquiryComposer.module.css";
import { legacyPublicContacts, type PublicContacts } from "@/lib/business-profile-contacts";
import { buildInquiryMessage, inquiryHandoffs, inquiryEligible, linkedProduct, MAX_INQUIRY_SELECTIONS, restoreInquiry, selectionKey, selectionOptions, type InquirySelection } from "@/lib/product-inquiry";
import type { ShopPageContent } from "@/lib/owner-page-domain";
import { showroomTokenVariables } from "./bank/tokens";
import "./showrooms.css";

type CartLine = InquirySelection;
const PUBLIC_WORKSPACE_RETURN_KEY = "mirtpage:last-marketplace-url:v1";
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

function legacyCopy(value: string) {
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {}
  }
  return legacyCopy(value);
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const routedProduct = businessProfile && !previewMode ? searchParams.get("product") : null;
  const storageKey = `mirtpage-cart:${catalog.business.handle}${previewMode?":private-preview":""}`;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [localSelected, setSelected] = useState<Product | null>(null);
  const selected = businessProfile && !previewMode ? linkedProduct(catalog, routedProduct) : localSelected;
  const [directLine, setDirectLine] = useState<CartLine | null>(null);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const productReturnScroll = useRef<number | null>(null);
  const previousProductId = useRef<number | null>(null);
  const [productMediaMode, setProductMediaMode] = useState<"image" | "video">("image");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const productDialog = useRef<HTMLDivElement>(null);
  const productOpener = useRef<HTMLElement | null>(null);
  const drawerOpener = useRef<HTMLElement | null>(null);

  const products = useMemo(
    () =>
      catalog.products.filter(
        (product) =>
          product.is_published &&
          (filter === "all" || product.category_id === Number(filter)) &&
          (!query ||
            `${product.name} ${product.description} ${product.category_name} ${product.offering_kind} ${product.capacity_summary}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [catalog.products, filter, query],
  );

  useEffect(() => {
    if(previewMode){setCart([]);return;}
    try {
      setCart(restoreInquiry(catalog, JSON.parse(localStorage.getItem(storageKey) || "[]")));
    } catch { setCart([]); }
    setHydratedKey(storageKey);
  }, [storageKey, catalog, previewMode]);

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
    if (previewMode && !businessProfile) { show("Preview only. No inquiry will be sent."); return; }
    const validOptions = selectionOptions(product, options);
    if (!inquiryEligible(product) || product.business_id !== catalog.business.id || !validOptions) { show("Choose the available product options first."); return; }
    const key = selectionKey(product.id, validOptions);
    if (cart.some(line => selectionKey(line.product.id, line.options) === key)) { show("Already added to your inquiry."); return; }
    if (cart.length >= MAX_INQUIRY_SELECTIONS) { show("You can include up to 20 selections in one inquiry."); return; }
    setCart(current => current.length >= MAX_INQUIRY_SELECTIONS || current.some(line => selectionKey(line.product.id, line.options) === key)
      ? current : [...current, { product, quantity: "", options: validOptions }]);
    if (!businessProfile) setSelected(null);
    show(cart.length ? `Added. ${cart.length + 1} products ready to inquire about.` : "Added. Keep browsing or inquire about this item.");
  };
  const inquireNow = (product: Product, options: Record<string, string>) => {
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
  const setDesiredQuantity = (index: number, raw: string) =>
    setCart((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) return line;
        return { ...line, quantity: raw.replace(/\s+/g, " ").slice(0, 80) };
      }),
    );

  const cartCount = cart.length;
  const openCart = () => {
    if(previewMode && !businessProfile){show("Private preview only — the inquiry cart is disabled.");return;}
    drawerOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDirectLine(null);
    setDrawer(true);
  };
  const designProps: DesignProps = {
    catalog,
    products,
    filter,
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
    <>
      {!(previewMode && businessProfile) ? <nav
        className={`showroom-host-bar${withinPublicApp ? " showroom-host-bar-shell" : ""}`}
        aria-label="Page return navigation"
      >
        <button type="button" className="showroom-host-back" aria-label="Back to Market" onClick={() => {
          let remembered: string | null = null;
          try {
            remembered = window.sessionStorage.getItem(PUBLIC_WORKSPACE_RETURN_KEY);
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
          <span>Back to Market</span>
        </button>
      </nav> : null}
      <ShowroomRoot
        className={`runtime-root theme-${catalog.business.design_key}${withinPublicApp ? " is-public-shell" : ""}${compositionManifest && !previewMode && !embedded ? " has-showroom-mobile-nav" : ""}`}
        style={runtimeTokenVariables as CSSProperties | undefined}
      >
      {!embedded && !businessProfile ? <h1 className="sr-only">{catalog.business.name} on Suqpage</h1> : null}
      {businessProfile ? <BusinessProfile {...designProps} profile={businessProfile} previewMode={previewMode} embedded={embedded}
        selectedIds={cart.map(line => line.product.id)} onBackToProducts={backToProducts}
        productDetail={selected || routedProduct ? <ProductPage key={selected?.id || "unavailable"} product={selected}
          backHref={`/@${catalog.business.handle}`} onBack={backToProducts}
          onAdd={options => selected && add(selected, options)} onInquire={options => selected && inquireNow(selected, options)}
          isAdded={options => Boolean(selected && cart.some(line => selectionKey(line.product.id, line.options) === selectionKey(selected.id, options)))}
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
      {!previewMode && !businessProfile ? <button
        type="button"
        className={`floating-inquiry-trigger${cartCount ? " has-items" : ""}`}
        aria-label={`Inquiry, ${cartCount} selected ${cartCount === 1 ? "item" : "items"}`}
        title="Open inquiry"
        onClick={openCart}
      >
        <span className="floating-inquiry-icon" aria-hidden="true" />
        <span className="floating-inquiry-label">Inquiry</span>
        {cartCount ? (
          <span className="floating-inquiry-count" aria-hidden="true">{cartCount}</span>
        ) : null}
      </button> : null}
      {compositionManifest && !previewMode && !embedded ? (
        <nav className="showroom-mobile-nav" aria-label="Page sections">
          <a href="#showroom-home"><Home aria-hidden="true" /><span>Home</span></a>
          <a href="#showroom-story"><BookOpen aria-hidden="true" /><span>Story</span></a>
          <a href="#showroom-catalog"><LayoutGrid aria-hidden="true" /><span>Offerings</span></a>
          <a href="#showroom-contact"><MessageCircle aria-hidden="true" /><span>Contact</span></a>
          <button type="button" onClick={openCart} aria-label={`Inquiry, ${cartCount} selected ${cartCount === 1 ? "item" : "items"}`}>
            <span className="showroom-mobile-nav-icon"><ShoppingBag aria-hidden="true" />{cartCount ? <b aria-hidden="true">{cartCount}</b> : null}</span>
            <span>Inquiry</span>
          </button>
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
            <button className="icon-button dialog-close" aria-label="Close product" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className={`product-dialog-grid${selected.image_path || selected.video_ref ? "" : " no-media"}`}>
              {selected.image_path || selected.video_ref ? (
                <div className="product-dialog-media">
                  {selected.image_path && selected.video_ref ? (
                    <div className="product-dialog-media-tabs" aria-label="Product media">
                      <button
                        type="button"
                        className={productMediaMode === "image" ? "active" : ""}
                        aria-pressed={productMediaMode === "image"}
                        onClick={() => setProductMediaMode("image")}
                      >
                        Photo
                      </button>
                      <button
                        type="button"
                        className={productMediaMode === "video" ? "active" : ""}
                        aria-pressed={productMediaMode === "video"}
                        onClick={() => setProductMediaMode("video")}
                      >
                        Video
                      </button>
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
                  {offeringKindLabels[selected.offering_kind]}
                </span>
                <h2>{selected.name}</h2>
                {selected.price_minor !== null ? (
                  <p className="product-dialog-price">{formatEtbPrice(selected.price_minor)}</p>
                ) : null}
                <p className="product-dialog-description">{selected.description}</p>
                {selected.highlights.length ? (
                  <ul className="product-dialog-highlights" aria-label="Offering highlights">
                    {selected.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                ) : null}
                <dl className="product-dialog-facts">
                  <div><dt>Status</dt><dd>{availabilityLabel(selected.offering_kind, selected.availability)}</dd></div>
                  {selected.quantity_unit ? <div><dt>Offered by</dt><dd>{selected.quantity_unit}</dd></div> : null}
                  {selected.capacity_summary ? <div><dt>Capacity</dt><dd>{selected.capacity_summary}</dd></div> : null}
                  {selected.minimum_order_summary ? <div><dt>Minimum order</dt><dd>{selected.minimum_order_summary}</dd></div> : null}
                  {selected.lead_time_summary ? <div><dt>Lead time</dt><dd>{selected.lead_time_summary}</dd></div> : null}
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
                  aria-label="Add selected item"
                  disabled={!["available", "limited"].includes(selected.availability)}
                  onClick={() => add(selected, selections)}
                >
                  Add to inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!previewMode || businessProfile ? <InquiryDrawer
        open={drawer}
        close={() => { setDrawer(false); setDirectLine(null); }}
        opener={drawerOpener}
        catalog={catalog}
        cart={directLine ? [directLine] : cart}
        directOnly={Boolean(directLine)}
        contacts={businessProfile?.contacts || legacyPublicContacts(catalog.business)}
        setDesiredQuantity={(index, value) => directLine ? setDirectLine({ ...directLine, quantity: value.replace(/\s+/g, " ").slice(0, 80) }) : setDesiredQuantity(index, value)}
        remove={(index) => directLine ? setDirectLine(null) : setCart((current) => current.filter((_, lineIndex) => lineIndex !== index))}
        clear={() => setCart([])}
        show={show}
        previewOnly={previewMode}
      /> : null}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      </ShowroomRoot>
    </>
  );
}

function ProductVideo({ product }: { product: Product }) {
  let src = "";
  try {
    src = privacyEnhancedYouTubeEmbedUrl(product.video_ref);
  } catch {
    return null;
  }
  return (
    <div className="product-dialog-video">
      <iframe
        src={src}
        title={`${product.name} video`}
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
  const [platformStep, setPlatformStep] = useState(false);
  const [preparedMessage, setPreparedMessage] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const [phone, setPhone] = useState("");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendError, setSendError] = useState("");
  const idempotencyKey = useRef("");
  const requestGeneration = useRef(0);
  const panel = useRef<HTMLElement>(null);
  const closeAction = useRef(close);
  closeAction.current = close;
  const signature = JSON.stringify(cart.map((line) => [line.product.id, line.quantity, line.options]));

  useEffect(() => {
    requestGeneration.current += 1;
    setPlatformStep(false);
    setPreparedMessage("");
    setCopyState("idle");
    setSendState("idle");
    setSendError("");
    idempotencyKey.current = "";
  }, [signature]);
  useEffect(() => {
    if (!open) return;
    setPlatformStep(false);
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
      opener.current?.focus();
    };
  }, [open, opener]);

  useEffect(() => {
    if (open && platformStep) panel.current?.querySelector<HTMLInputElement>('input[type="tel"]')?.focus();
  }, [open, platformStep]);

  const message = buildInquiryMessage(catalog.business, cart, typeof window === "undefined" ? "" : window.location.origin);
  const handoffs = inquiryHandoffs(contacts, message);
  async function copyInquiry() {
    if (!cart.length) {
      show("Add at least one product or capability.");
      return;
    }
    setPreparedMessage(message);
    const copied = await copyText(message);
    setCopyState(copied ? "copied" : "manual");
    show(copied ? "Inquiry copied." : "Select the inquiry text and copy it.");
  }
  function updatePhone(value: string) {
    setPhone(value.slice(0, 40));
    if (sendState === "sent" || sendState === "error") {
      setSendState("idle");
      setSendError("");
      idempotencyKey.current = "";
    }
  }
  async function sendInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewOnly || !cart.length || sendState === "sending" || sendState === "sent") return;
    const digits = phone.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(phone.trim()) || digits.length < 7 || digits.length > 15) {
      setSendState("error");
      setSendError("Enter a valid phone number with 7 to 15 digits.");
      return;
    }
    if (!idempotencyKey.current) {
      idempotencyKey.current = `showroom-${crypto.randomUUID()}`;
    }
    const generation = requestGeneration.current;
    setSendState("sending");
    setSendError("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        signal: AbortSignal.timeout(15_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: catalog.business.id,
          customerName: "Page visitor",
          contact: phone,
          contactMethod: "phone",
          idempotencyKey: idempotencyKey.current,
          items: cart.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
            options: line.options,
          })),
          website: "",
        }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "The inquiry could not be sent. Please try again.");
      }
      if (generation !== requestGeneration.current) return;
      setSendState("sent");
      show("Inquiry sent.");
    } catch (error) {
      if (generation !== requestGeneration.current) return;
      setSendState("error");
      setSendError(error instanceof Error ? error.message : "The inquiry could not be sent. Please try again.");
    }
  }

  if (!open || typeof document === "undefined") return null;
  const busy = sendState === "sending";
  const item = (line: CartLine, index: number, grouped: boolean) => <div className={inquiryStyles.summary}>
    {line.product.image_path ? <img src={line.product.image_path} alt="" /> : <span className={inquiryStyles.thumb}><PackageOpen size={24} aria-hidden="true" /></span>}
    <div className={inquiryStyles.itemCopy}><h3>{line.product.name}</h3><p>{Object.entries(line.options).filter(([name]) => (line.product.option_groups?.find(group => group.name === name)?.values.length || 0) > 1).map(([name, value]) => `${name}: ${value}`).join(" · ")}</p>
      <details className={inquiryStyles.quantity}><summary>{line.quantity ? `Quantity: ${line.quantity}` : "Add quantity (optional)"}</summary><label>Desired quantity<input type="text" value={line.quantity} maxLength={80} placeholder="e.g. 2 pieces or 5 kg" disabled={busy} onChange={e => setDesiredQuantity(index, e.target.value)} /></label></details>
    </div>
    {grouped ? <button type="button" className={inquiryStyles.remove} disabled={busy} onClick={() => remove(index)} aria-label={`Remove ${line.product.name} from inquiry`}><X size={18} aria-hidden="true" /></button> : null}
  </div>;
  return createPortal(<div className={inquiryStyles.overlay}>
    <div className={inquiryStyles.backdrop} onClick={close} />
    <aside ref={panel} className={inquiryStyles.panel} role="dialog" aria-modal="true" aria-label="Product inquiry" tabIndex={-1}>
      <header className={inquiryStyles.head}><div><h2>{cart.length > 1 ? `Inquire about ${cart.length} products` : "Inquire about this product"}</h2><p>{catalog.business.name}</p></div><button type="button" className={inquiryStyles.close} aria-label="Close inquiry" onClick={close}><X size={20} aria-hidden="true" /></button></header>
      <div className={inquiryStyles.scroll}>
        {!cart.length ? <div className={inquiryStyles.empty}><ShoppingBag size={32} aria-hidden="true" /><p>Choose a product to start an inquiry.</p><button type="button" className={inquiryStyles.platformButton} onClick={close}>Browse products</button></div> : <>
          {cart.length > 1 ? <ul className={inquiryStyles.list} aria-label="Inquiry products">{cart.map((line, index) => <li key={selectionKey(line.product.id, line.options)}>{item(line, index, true)}</li>)}</ul> : item(cart[0], 0, !directOnly)}
          {previewOnly ? <p className={inquiryStyles.note}>Preview only. No inquiry will be sent.</p> : platformStep ? <form className={inquiryStyles.platform} onSubmit={sendInquiry}>
            <button className={inquiryStyles.back} type="button" disabled={busy} onClick={() => { setPlatformStep(false); requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>("[data-platform-send]")?.focus()); }}><ArrowLeft size={16} aria-hidden="true" />Back to sending options</button>
            <h3>Send on Suqpage</h3><p>Your inquiry goes to the shop’s inbox. Add a phone number so they can reply.</p>
            <label>Reply phone number<input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => updatePhone(e.target.value)} placeholder="+251…" maxLength={40} required disabled={busy || sendState === "sent"} aria-invalid={sendState === "error"} aria-describedby="inquiry-send-status" /></label>
            <button type="submit" className={inquiryStyles.platformButton} disabled={busy || sendState === "sent"}>{sendState === "sent" ? <Check size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}{busy ? "Sending…" : sendState === "sent" ? "Inquiry sent" : "Send inquiry"}</button>
            <p id="inquiry-send-status" className={sendState === "sent" ? inquiryStyles.success : inquiryStyles.error} role={sendState === "error" ? "alert" : "status"}>{sendState === "sent" ? `Sent to ${catalog.business.name}. They can reply using your phone number.` : sendError}</p>
          </form> : <div className={inquiryStyles.methods}>
            <h3>How would you like to send it?</h3>
            <div className={inquiryStyles.channels}>{handoffs.map(link => <a key={link.kind} href={link.href} target={link.kind === "sms" ? undefined : "_blank"} rel={link.kind === "sms" ? undefined : "noopener noreferrer"} onClick={() => setPreparedMessage(message)}>{link.kind === "sms" ? <Smartphone size={18} aria-hidden="true" /> : link.kind === "telegram" ? <Send size={18} aria-hidden="true" /> : <MessageCircle size={18} aria-hidden="true" />}{link.label}{link.kind !== "sms" ? <span className="sr-only"> (new tab)</span> : null}</a>)}
              <button type="button" onClick={copyInquiry}><Copy size={18} aria-hidden="true" />{copyState === "copied" ? "Copied" : "Copy inquiry"}</button>
            </div>
            <button type="button" className={inquiryStyles.platformButton} data-platform-send onClick={() => setPlatformStep(true)}><Send size={18} aria-hidden="true" />Send on Suqpage</button>
            <p className={inquiryStyles.note}>Messaging apps open a draft for you to review and send.</p>
            <details className={inquiryStyles.preview} open={preparedMessage ? true : undefined}><summary>{copyState === "manual" ? "Select and copy your message" : "Preview inquiry message"}</summary><textarea aria-label="Inquiry message" readOnly value={message} onFocus={e => e.target.select()} /></details>
          </div>}
          {cart.length > 1 ? <button className={inquiryStyles.clear} disabled={busy} type="button" onClick={clear}>Clear inquiry list</button> : null}
        </>}
      </div>
    </aside>
  </div>, document.body);
}
