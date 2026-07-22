"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Catalog, Product } from "@/lib/types";
import { AlHayaDesign, HomeVibeDesign, NovaTechDesign, UsaShopDesign, type DesignProps } from "./designs";
import "./showrooms.css";

type CartLine = { product: Product; quantity: number; options: Record<string, string> };

const statusText: Record<string, string> = {
  available: "Available",
  limited: "Limited",
  unavailable: "Unavailable",
  coming_soon: "Coming soon",
};
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

function buildMessage(catalog: Catalog, cart: CartLine[], name: string, note: string) {
  return [
    `Hello ${catalog.business.name},`,
    "",
    `My name is ${name}. I would like to ask about:`,
    ...cart.map((line, index) => {
      const options = Object.entries(line.options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      return `${index + 1}. ${line.product.name} × ${line.quantity}${options ? ` (${options})` : ""}`;
    }),
    note ? `\nNote: ${note}` : "",
    "Please confirm availability and the next steps.",
    `Sent from @${catalog.business.handle} on SuqPage.`,
  ]
    .filter(Boolean)
    .join("\n");
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
            `${product.name} ${product.description} ${product.category_name}`
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
        quantity: number;
        options: Record<string, string>;
      }>;
      setCart(
        saved.flatMap((line) => {
          const product = catalog.products.find((item) => item.id === line.productId);
          return product && product.is_published
            ? [
                {
                  product,
                  quantity: Math.max(1, Math.min(Number(line.quantity) || 1, Math.max(1, product.stock_count))),
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
    if (!["available", "limited"].includes(product.availability) || product.stock_count < 1) {
      show("This product is not currently available.");
      return;
    }
    const optionKey = JSON.stringify(options);
    setCart((current) => {
      const index = current.findIndex(
        (line) => line.product.id === product.id && JSON.stringify(line.options) === optionKey,
      );
      if (index < 0) return [...current, { product, quantity: 1, options }];
      return current.map((line, lineIndex) =>
        lineIndex === index
          ? { ...line, quantity: Math.min(product.stock_count, 20, line.quantity + 1) }
          : line,
      );
    });
    setSelected(null);
    show("Added to inquiry");
  };
  const quantity = (index: number, delta: number) =>
    setCart((current) =>
      current
        .map((line, lineIndex) =>
          lineIndex === index
            ? { ...line, quantity: Math.min(line.product.stock_count, 20, line.quantity + delta) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );

  const designProps: DesignProps = {
    catalog,
    products,
    filter,
    setFilter,
    query,
    setQuery,
    openProduct,
    addProduct: (product) => (product.option_groups?.length ? openProduct(product) : add(product)),
    cartCount: cart.reduce((count, line) => count + line.quantity, 0),
    openCart: () => {
      if(previewMode){show("Private preview only — the inquiry cart is disabled.");return;}
      drawerOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDrawer(true);
    },
  };
  const registry = {
    alhaya: AlHayaDesign,
    usashopet: UsaShopDesign,
    novatech: NovaTechDesign,
    homevibe: HomeVibeDesign,
  } as const;
  const Design = registry[catalog.business.design_key as keyof typeof registry] || NovaTechDesign;

  return (
    <div className={`runtime-root theme-${catalog.business.design_key}`}>
      <Design {...designProps} />
      {selected && (
        <div
          ref={productDialog}
          className="product-dialog open"
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
          tabIndex={-1}
        >
          <div className="product-dialog-panel">
            <button className="icon-button dialog-close" aria-label="Close product" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="product-dialog-grid">
              <img src={selected.image_path} alt={selected.name} />
              <div>
                <span className="eyebrow">{selected.eyebrow}</span>
                <h2 style={{ fontSize: "2.5rem", letterSpacing: "-.05em" }}>{selected.name}</h2>
                <p style={{ lineHeight: 1.7 }}>{selected.description}</p>
                <p>
                  <strong>Availability:</strong> {statusText[selected.availability]} · <strong>Count:</strong>{" "}
                  {selected.stock_count}
                </p>
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
                  disabled={!["available", "limited"].includes(selected.availability) || selected.stock_count < 1}
                  onClick={() => add(selected, selections)}
                >
                  Add selected item
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
        quantity={quantity}
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
  quantity,
  remove,
  clear,
  show,
}: {
  open: boolean;
  close: () => void;
  opener: RefObject<HTMLElement | null>;
  catalog: Catalog;
  cart: CartLine[];
  quantity: (index: number, delta: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  show: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef(crypto.randomUUID());
  const panel = useRef<HTMLElement>(null);
  const closeAction = useRef(close);
  closeAction.current = close;
  const signature = JSON.stringify(cart.map((line) => [line.product.id, line.quantity, line.options]));

  useEffect(() => {
    key.current = crypto.randomUUID();
  }, [signature]);
  useEffect(() => {
    if (!open) return;
    const root = panel.current;
    if (!root) return;
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
      opener.current?.focus();
    };
  }, [open, opener]);

  const message = buildMessage(catalog, cart, name || "Customer", note);
  async function saveInquiry(channel: string) {
    if (!name.trim() || !contact.trim()) {
      show("Enter your name and contact first.");
      return false;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: catalog.business.id,
          customerName: name,
          contact,
          contactMethod: channel,
          note,
          website: "",
          idempotencyKey: key.current,
          items: cart.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
            options: line.options,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        show(data.error || "The inquiry could not be saved.");
        return false;
      }
      return true;
    } catch {
      show("Network error. Your list is still available here.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function send(channel: "whatsapp" | "telegram" | "tiktok" | "share") {
    if (!cart.length) {
      show("Add at least one product.");
      return;
    }
    if (channel === "tiktok") legacyCopy(message);
    if (!(await saveInquiry(channel))) return;
    const business = catalog.business;
    const encoded = encodeURIComponent(message);
    if (channel === "whatsapp") {
      if (!business.whatsapp) {
        setManual(message);
        show("WhatsApp is not connected yet.");
        return;
      }
      window.location.assign(`https://wa.me/${business.whatsapp}?text=${encoded}`);
    }
    if (channel === "telegram") {
      if (!business.telegram) {
        setManual(message);
        show("Telegram is not connected yet.");
        return;
      }
      window.location.assign(`https://t.me/${business.telegram}?text=${encoded}`);
    }
    if (channel === "tiktok") {
      setManual(message);
      if (!business.tiktok) {
        show("TikTok is not connected yet. The message is displayed below.");
        return;
      }
      window.location.assign(`https://www.tiktok.com/@${business.tiktok}`);
    }
    if (channel === "share") {
      try {
        if (navigator.share) await navigator.share({ title: `${business.name} inquiry`, text: message });
        else {
          const ok = legacyCopy(message);
          setManual(message);
          show(ok ? "Message copied." : "Select the message below and copy it.");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setManual(message);
        show("Select the message below and copy it.");
      }
    }
  }

  return (
    <div className={`inquiry-drawer ${open ? "open" : ""}`} aria-hidden={!open} inert={!open}>
      <div className="drawer-backdrop" onClick={close} />
      <aside ref={panel} className="drawer-panel" role="dialog" aria-modal="true" aria-label="Product inquiry" tabIndex={-1}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Your shortlist</span>
            <h2>Product inquiry</h2>
          </div>
          <button className="icon-button" aria-label="Close inquiry" onClick={close}>
            ×
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart">Your inquiry is empty.</div>
        ) : (
          cart.map((line, index) => (
            <div className="cart-item" key={`${line.product.id}-${JSON.stringify(line.options)}`}>
              <img src={line.product.image_path} alt="" />
              <div>
                <h3>{line.product.name}</h3>
                <div className="cart-options">
                  {Object.entries(line.options)
                    .map(([keyName, value]) => `${keyName}: ${value}`)
                    .join(" · ")}
                </div>
                <div className="qty">
                  <button aria-label={`Decrease quantity for ${line.product.name}`} onClick={() => quantity(index, -1)}>
                    −
                  </button>
                  <strong>{line.quantity}</strong>
                  <button aria-label={`Increase quantity for ${line.product.name}`} onClick={() => quantity(index, 1)}>
                    +
                  </button>
                </div>
              </div>
              <button
                className="remove"
                aria-label={`Remove ${line.product.name} from inquiry`}
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          ))
        )}
        {cart.length > 0 && (
          <div className="drawer-form">
            <label>
              <strong>First name</strong>
              <input
                value={name}
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your first name"
              />
            </label>
            <label>
              <strong>WhatsApp, phone or email</strong>
              <input
                value={contact}
                maxLength={120}
                onChange={(event) => setContact(event.target.value)}
                placeholder="How the business can contact you"
              />
            </label>
            <label>
              <strong>Additional note</strong>
              <textarea
                value={note}
                maxLength={1000}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Delivery area or another question"
              />
            </label>
            <div className="send-grid">
              <button disabled={busy} className="primary" onClick={() => send("whatsapp")}>
                WhatsApp
              </button>
              <button disabled={busy} onClick={() => send("telegram")}>
                Telegram
              </button>
              <button disabled={busy} onClick={() => send("tiktok")}>
                TikTok
              </button>
              <button disabled={busy} onClick={() => send("share")}>
                Share / copy
              </button>
            </div>
            {manual && (
              <>
                <strong>Message</strong>
                <div
                  className="manual-message"
                  tabIndex={0}
                  onClick={(event) => {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(event.currentTarget);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                  }}
                >
                  {manual}
                </div>
              </>
            )}
            <button className="remove" onClick={clear}>
              Clear inquiry
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
