import type { Business, Catalog, Product } from "./types";
import { parsePublicContacts, type PublicContacts } from "./business-profile-contacts";

export type InquirySelection = { product: Product; quantity: string; options: Record<string, string> };
export const MAX_INQUIRY_SELECTIONS = 20;
export function productHref(handle: string, productId: number): string {
  return `/@${encodeURIComponent(handle)}?product=${productId}`;
}
export function linkedProduct(catalog: Catalog, value: string | null): Product | null {
  if (!value || !/^[1-9]\d{0,14}$/.test(value)) return null;
  return catalog.products.find(p => p.id === Number(value) && p.business_id === catalog.business.id && Boolean(p.is_published)) || null;
}
export function inquiryEligible(product: Product): boolean {
  return Boolean(product.is_published) && ["available", "limited"].includes(product.availability);
}
export function productSellingUnit(product: Pick<Product, "quantity_unit">): string {
  const unit = product.quantity_unit.trim();
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
export function buildInquiryMessage(business: Pick<Business, "name" | "handle">, selections: InquirySelection[], origin: string): string {
  return [`Hello ${business.name},`, "", "I'd like to ask about:", ...selections.flatMap((line, index) => [
    `${index + 1}. ${line.product.name}`,
    ...Object.entries(line.options).map(([name, value]) => `   ${name}: ${value}`),
    ...(line.quantity.trim() ? [`   Quantity: ${line.quantity.trim()}`] : []),
    `   ${origin}${productHref(business.handle, line.product.id)}`,
  ]), "", "Please confirm availability and the next steps."].join("\n");
}
export function inquiryHandoffs(contacts: PublicContacts, message: string): Array<{ kind: "whatsapp" | "telegram" | "sms"; label: string; href: string }> {
  const links: Array<{ kind: "whatsapp" | "telegram" | "sms"; label: string; href: string }> = [];
  for (const key of ["whatsapp", "telegram", "phone"] as const) {
    let value: string | undefined;
    try { value = parsePublicContacts({ [key]: contacts[key] || "" })[key]; } catch { continue; }
    if (!value) continue;
    const text = encodeURIComponent(message);
    if (key === "whatsapp") links.push({ kind: "whatsapp", label: "WhatsApp", href: `https://wa.me/${value.replace(/^\+/, "")}?text=${text}` });
    if (key === "telegram") links.push({ kind: "telegram", label: "Telegram", href: `https://t.me/${encodeURIComponent(value)}?text=${text}` });
    if (key === "phone") links.push({ kind: "sms", label: "SMS", href: `sms:+${value.replace(/^\+/, "")}?body=${text}` });
  }
  return links;
}
