import { createUiText, type UiText } from "./i18n/core";
import type { Business, Catalog, Product } from "./types";
import { publicContactLinks, parsePublicContacts, type PublicContacts } from "./business-profile-contacts";
import {isPublicProduct} from './offerings';

export type InquirySelection = { product: Product; quantity: string; options: Record<string, string> };
export const MAX_INQUIRY_SELECTIONS = 20;
export function productHref(handle: string, productId: number): string {
  return `/@${encodeURIComponent(handle)}?product=${productId}`;
}
export function linkedProduct(catalog: Catalog, value: string | null): Product | null {
  if (!value || !/^[1-9]\d{0,14}$/.test(value)) return null;
  return catalog.products.find(p => p.id === Number(value) && p.business_id === catalog.business.id && Boolean(p.is_published) && isPublicProduct(p)) || null;
}
export function inquiryEligible(product: Product): boolean {
  return isPublicProduct(product) && Boolean(product.is_published) && ["available", "limited"].includes(product.availability);
}
export function productSellingUnit(product: Pick<Product, "quantity_unit"> & Partial<Pick<Product, "offering_kind">>): string {
  const unit = product.quantity_unit.trim();
  if (product.offering_kind === "service") return unit ? `Per ${unit.replace(/^per\s+/i, "")}` : "";
  return /^(pieces?|pcs?|units?|each)$/i.test(unit) ? "By the piece" : /^bulk$/i.test(unit) ? "In bulk" : unit ? `Sold by ${unit}` : "";
}
export function selectionOptions(product: Product, raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const entries = Object.entries(raw);
  const groups = product.option_groups || [];
  if (entries.length !== groups.length) return null;
  const result: Record<string, string> = {};
  for (const group of groups) {
    const value = (raw as Record<string, unknown>)[group.name];
    if (typeof value !== "string" || !group.values.some(v => v.value === value)) return null;
    Object.defineProperty(result, group.name, { value, enumerable: true, writable: true });
  }
  return result;
}
export function selectionKey(productId: number, options: Record<string, string>): string {
  return JSON.stringify([productId, Object.entries(options).sort(([a], [b]) => a.localeCompare(b))]);
}
export function restoreInquiry(catalog: Catalog, raw: unknown): InquirySelection[] {
  if (!Array.isArray(raw)) return [];
  const result: InquirySelection[] = [];
  const seen = new Set<string>();
  for (const candidate of raw.slice(0, MAX_INQUIRY_SELECTIONS)) {
    if (!candidate || typeof candidate !== "object") continue;
    const product = catalog.products.find(p => p.id === candidate.productId && p.business_id === catalog.business.id && inquiryEligible(p));
    if (!product) continue;
    const options = selectionOptions(product, candidate.options || {});
    if (!options) continue;
    const key = selectionKey(product.id, options);
    if (seen.has(key)) continue;
    seen.add(key);
    const quantity = typeof candidate.quantity === "string" || typeof candidate.quantity === "number" ? String(candidate.quantity).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 80) : "";
    result.push({ product, quantity, options });
  }
  return result;
}
export type SocialInquiryItem = {
  id: number; name: string; quantity: string; options: Record<string, string>;
  service?: boolean;
};
/** Language applies to our words only. Business/product/option text stays literal. */
export function buildSocialInquiryMessage(
  business: Pick<Business, "name" | "handle">,
  items: SocialInquiryItem[], origin: string, t: UiText = createUiText({}),
): string {
  const products=items.filter(item=>!item.service);
  if(products.length===0)return [t("Hello {value1},",{value1:business.name}),"",t("Could you tell me what products are available and how I can order?"),"",`${origin.replace(/\/$/,"")}/@${encodeURIComponent(business.handle)}`].join("\n");
  return [t("Hello {value1},", { value1: business.name }), "",
    t("I'd like to ask about:"), ...products.flatMap((item, index) => [
      `${index + 1}. ${item.name}`,
      ...Object.entries(item.options).map(([name, value]) => `   ${name}: ${value}`),
      ...(item.quantity.trim() ? [`   ${t(item.service ? "Request" : "Quantity")}: ${item.quantity.trim()}`] : []),
      `   ${origin.replace(/\/$/, "")}${productHref(business.handle, item.id)}`,
    ]), "", t("Are these available, and how can I order?")].join("\n");
}
export function buildInquiryMessage(business: Pick<Business, "name" | "handle">, selections: InquirySelection[], origin: string, t?: UiText): string {
  return buildSocialInquiryMessage(business, selections.filter(line => isPublicProduct(line.product)).map(line => ({
    id: line.product.id, name: line.product.name, quantity: line.quantity,
    options: line.options, service: line.product.offering_kind === "service",
  })), origin, t);
}
export function inquiryHandoffs(contacts: PublicContacts, message: string) {
  const text = encodeURIComponent(message);
  const links = publicContactLinks(contacts).filter(link => ["whatsapp", "telegram"].includes(link.kind)).map(link => ({ ...link,
    href: link.kind === "whatsapp" || link.kind === "telegram" ? `${link.href}?text=${text}` : link.href,
  }));
  try {
    const phone = parsePublicContacts({phone: contacts.phone || ""}).phone;
    if (phone) links.push({kind:"phone", label:"SMS", href:`sms:+${phone.replace(/^\+/, "")}?body=${text}`, external:false});
  } catch { /* Omit invalid retained contacts. */ }
  return links;
}
