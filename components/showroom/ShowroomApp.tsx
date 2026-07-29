"use client";

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
import { parseShowroomContentBlocks } from "@/lib/showroom-content-blocks";
import { parsePublishedDesignManifest } from "@/lib/showroom-manifests";
import type { Catalog, Product } from "@/lib/types";
import {
  availabilityLabel,
  offeringKindLabels,
} from "@/lib/offerings";
import { AlHayaDesign, HomeVibeDesign, NovaTechDesign, UsaShopDesign, type DesignProps } from "./designs";
import { CompositionShowroom, InvalidComposition } from "./bank/CompositionShowroom";
import { SHOWROOM_BANK_TOKEN_STYLES } from "./bank/tokens";
import "./showrooms.css";

type CartLine = { product: Product; quantity: string; options: Record<string, string> };
const focusableSelector =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

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

function buildMessage(catalog: Catalog, cart: CartLine[]) {
  const offerings = cart.flatMap((line, index) => {
    const quantity = line.quantity.trim();
    const options = Object.entries(line.options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return [
      `${index + 1}. ${line.product.name}`,
      options ? `   Options: ${options}` : null,
      !quantity ? null : `   Desired quantity: ${quantity}`,
    ].filter((value): value is string => Boolean(value));
  });
  return [
    `Hello ${catalog.business.name},`,
    "",
    "I would like to ask about:",
    ...offerings,
    "",
    "Please confirm availability and the next steps.",
    "",
    `Showroom reference: @${catalog.business.handle}`,
    `https://suqpage.com/@${catalog.business.handle}`,
  ]
    .join("\n");
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

export default function ShowroomApp({ catalog, previewMode = false }: { catalog: Catalog; previewMode?: boolean }) {
  const storageKey = `suqpage-cart:${catalog.business.handle}${previewMode?":private-preview":""}`;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
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
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as Array<{
        productId: number;
        quantity: unknown;
        options: Record<string, string>;
      }>;
      setCart(
        saved.flatMap((line) => {
          const product = catalog.products.find((item) => item.id === line.productId);
          return product && product.is_published
            ? [
                {
                  product,
                  quantity:
                    typeof line.quantity === "string" ||
                    typeof line.quantity === "number"
                      ? String(line.quantity).trim().slice(0, 80)
                      : "",
                  options: line.options || {},
                },
              ]
            : [];
        }),
      );
    } catch {}
  }, [storageKey, catalog.products, previewMode]);

  useEffect(() => {
    if(previewMode)return;
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
  }, [cart, storageKey, previewMode]);

  useEffect(() => {
    if (!selected) return;
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
  }, [selected]);

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
    setSelected(product);
  };
  const add = (product: Product, options: Record<string, string> = {}) => {
    if(previewMode){setSelected(null);show("Private preview only — customer inquiries remain on the live showroom.");return;}
    if (!["available", "limited"].includes(product.availability)) {
      show("This product is not currently available.");
      return;
    }
    const optionKey = JSON.stringify(options);
    setCart((current) => {
      const index = current.findIndex(
        (line) => line.product.id === product.id && JSON.stringify(line.options) === optionKey,
      );
      if (index < 0) {
        return [
          ...current,
          {
            product,
            quantity: "",
            options,
          },
        ];
      }
      return current;
    });
    setSelected(null);
    show("Added to inquiry");
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
    if(previewMode){show("Private preview only — the inquiry cart is disabled.");return;}
    drawerOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
  if (catalog.business.design_key === "composition") {
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
      } else {
        compositionManifest = parsePublishedDesignManifest(manifestInput);
      }
    } catch {}
  }
  const runtimeTokenVariables = compositionManifest
    ? SHOWROOM_BANK_TOKEN_STYLES[
        compositionManifest.tokenPack as keyof typeof SHOWROOM_BANK_TOKEN_STYLES
      ]?.variables
    : undefined;

  return (
    <div
      className={`runtime-root theme-${catalog.business.design_key}`}
      style={runtimeTokenVariables as CSSProperties | undefined}
    >
      {compositionManifest ? (
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
      <button
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
      </button>
      {selected && (
        <div
          ref={productDialog}
          className="product-dialog open"
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
          tabIndex={-1}
        >
          <div className={`product-dialog-panel${selected.image_path ? "" : " no-media"}`}>
            <button className="icon-button dialog-close" aria-label="Close product" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className={`product-dialog-grid${selected.image_path ? "" : " no-media"}`}>
              {selected.image_path ? (
                <img src={selected.image_path} alt={selected.name} />
              ) : null}
              <div>
                <span className="eyebrow">
                  {offeringKindLabels[selected.offering_kind]}
                </span>
                <h2 style={{ fontSize: "2.5rem" }}>{selected.name}</h2>
                <p style={{ lineHeight: 1.7 }}>{selected.description}</p>
                <p><strong>Status:</strong> {availabilityLabel(selected.offering_kind, selected.availability)}</p>
                {selected.capacity_summary ? <p><strong>Capacity:</strong> {selected.capacity_summary}</p> : null}
                {selected.minimum_order_summary ? <p><strong>Minimum order:</strong> {selected.minimum_order_summary}</p> : null}
                {selected.lead_time_summary ? <p><strong>Lead time:</strong> {selected.lead_time_summary}</p> : null}
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
      <InquiryDrawer
        open={drawer}
        close={() => setDrawer(false)}
        opener={drawerOpener}
        catalog={catalog}
        cart={cart}
        setDesiredQuantity={setDesiredQuantity}
        remove={(index) => setCart((current) => current.filter((_, lineIndex) => lineIndex !== index))}
        clear={() => setCart([])}
        show={show}
      />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
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
}) {
  const [preparedMessage, setPreparedMessage] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const panel = useRef<HTMLElement>(null);
  const closeAction = useRef(close);
  closeAction.current = close;
  const signature = JSON.stringify(cart.map((line) => [line.product.id, line.quantity, line.options]));

  useEffect(() => {
    setPreparedMessage("");
    setCopyState("idle");
  }, [signature]);
  useEffect(() => {
    if (!open) return;
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

  const message = buildMessage(catalog, cart);
  const encodedMessage = encodeURIComponent(message);
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

  return (
    <div className={`inquiry-drawer ${open ? "open" : ""}`} aria-hidden={!open} inert={!open}>
      <div className="drawer-backdrop" onClick={close} />
      <aside ref={panel} className="drawer-panel" role="dialog" aria-modal="true" aria-label="Product inquiry" tabIndex={-1}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Your shortlist</span>
            <h2>Products &amp; capabilities inquiry</h2>
            <p>
              {cart.length} {cart.length === 1 ? "selected offering" : "selected offerings"}
            </p>
          </div>
          <button className="icon-button" aria-label="Close inquiry" onClick={close}>
            ×
          </button>
        </div>
        <div className="drawer-scroll">
        {cart.length === 0 ? (
          <div className="empty-cart">Your inquiry is empty.</div>
        ) : (
          cart.map((line, index) => (
            <article className="cart-item" key={`${line.product.id}-${JSON.stringify(line.options)}`}>
              {line.product.image_path ? (
                <img src={line.product.image_path} alt="" />
              ) : (
                <div className="cart-thumb-placeholder" aria-hidden="true">
                  {line.product.name.slice(0, 1)}
                </div>
              )}
              <div className="cart-item-copy">
                <h3>{line.product.name}</h3>
                <div className="cart-options">
                  {Object.entries(line.options)
                    .map(([keyName, value]) => `${keyName}: ${value}`)
                    .join(" · ")}
                </div>
                <label className="optional-quantity">
                  <span>Desired quantity <small>(optional)</small></span>
                  <input
                    type="text"
                    maxLength={80}
                    value={line.quantity}
                    onChange={(event) => setDesiredQuantity(index, event.target.value)}
                    placeholder="e.g. 1 g, 1 ton, 2 pallets"
                  />
                </label>
              </div>
              <button
                className="remove"
                aria-label={`Remove ${line.product.name} from inquiry`}
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </article>
          ))
        )}
        {cart.length > 0 && (
          <div className="drawer-actions">
            <div className="drawer-action-heading">
              <span className="eyebrow">Ready to send</span>
              <h3>Copy your inquiry</h3>
              <p>Paste it into any message. No name or contact details are required here.</p>
            </div>
            <button className="copy-inquiry primary" onClick={copyInquiry}>
              {copyState === "copied" ? "Copied" : "Copy inquiry"}
            </button>
            {catalog.business.whatsapp || catalog.business.telegram ? (
              <div className="direct-handoffs">
                <span>Or open a connected app</span>
                <div>
                  {catalog.business.whatsapp ? (
                    <a
                      href={`https://wa.me/${catalog.business.whatsapp}?text=${encodedMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setPreparedMessage(message)}
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  {catalog.business.telegram ? (
                    <a
                      href={`https://t.me/${catalog.business.telegram}?text=${encodedMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setPreparedMessage(message)}
                    >
                      Telegram
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
            {preparedMessage ? (
              <section className="copied-reference" aria-live="polite">
                <strong>{copyState === "copied" ? "Copied inquiry" : "Inquiry text"}</strong>
                <pre tabIndex={0}>{preparedMessage}</pre>
              </section>
            ) : null}
            <button className="remove clear-inquiry" onClick={clear}>
              Clear inquiry
            </button>
          </div>
        )}
        </div>
      </aside>
    </div>
  );
}
