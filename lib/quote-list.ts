import type { Shop } from '../packages/contracts/src';
import { buildSocialInquiryMessage, MAX_INQUIRY_SELECTIONS, selectionKey } from './product-inquiry';
import type { UiText } from './i18n/core';

export type QuoteLine = { productId: number; quantity: string; options: Record<string, string> };
export type QuoteGroup = { handle: string; lines: QuoteLine[] };

export function readQuoteLines(raw: unknown): QuoteLine[] {
  if (!Array.isArray(raw)) return [];
  const lines: QuoteLine[] = [],
    seen = new Set<string>();
  for (const value of raw.slice(0, MAX_INQUIRY_SELECTIONS)) {
    if (!value || !Number.isSafeInteger(value.productId) || value.productId <= 0) continue;
    const options = value.options ?? {};
    if (
      typeof options !== 'object' ||
      Array.isArray(options) ||
      Object.entries(options).some(([k, v]) => !k || typeof v !== 'string')
    )
      continue;
    const key = selectionKey(value.productId, options);
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push({ productId: value.productId, quantity: String(value.quantity ?? '').slice(0, 80), options });
  }
  return lines;
}

export function resolveQuoteLine(shop: Shop, line: QuoteLine) {
  return shop.products.find(
    (p) =>
      p.id === line.productId &&
      p.published &&
      p.kind !== 'service' &&
      ['available', 'limited'].includes(p.availability) &&
      p.options.length === Object.keys(line.options).length &&
      p.options.every((o) => Object.hasOwn(line.options, o.name) && o.values.includes(line.options[o.name])),
  );
}

export function shopQuote(shop: Shop, lines: QuoteLine[], origin: string, t: UiText) {
  const items = lines.map((line) => {
    const p = resolveQuoteLine(shop, line);
    if (!p) throw Error('This product is not available for inquiry.');
    return { id: p.id, name: p.name, quantity: line.quantity, options: line.options };
  });
  return buildSocialInquiryMessage(shop, items, origin, t, 'Please let me know your price and availability.');
}

export type QuoteAttempt = { payload: string; key: string };
export async function deliverShopQuote(
  shop: Shop,
  lines: QuoteLine[],
  contact: { name: string; phone: string; message: string; editedDraft?: string },
  origin: string,
  t: UiText,
  attempts: Map<number, QuoteAttempt>,
  makeKey: (payload: string) => Promise<string> | string,
  post: (body: object) => Promise<{ inquiryId: number; status: string }>,
) {
  if (!lines.length) throw Error('This product is not available for inquiry.');
  const draft = shopQuote(shop, lines, origin, t);
  const body = {
    businessId: shop.id,
    customerName: contact.name,
    contact: contact.phone,
    contactMethod: 'phone',
    note: [contact.editedDraft?.trim() || draft, contact.message.trim()].filter(Boolean).join('\n\n'),
    items: lines,
  };
  const payload = JSON.stringify(body);
  if (attempts.get(shop.id)?.payload !== payload)
    attempts.set(shop.id, { payload, key: await makeKey(payload) });
  const receipt = await post({ ...body, idempotencyKey: attempts.get(shop.id)!.key });
  if (!Number.isSafeInteger(receipt.inquiryId) || receipt.inquiryId < 1 || receipt.status !== 'received')
    throw Error('Your inquiry could not be sent. Please try again.');
  return receipt;
}
export function remainingQuoteLines(current: QuoteLine[], sent: QuoteLine[]) {
  return current.filter(
    (line) =>
      !sent.some(
        (s) =>
          selectionKey(s.productId, s.options) === selectionKey(line.productId, line.options) &&
          s.quantity === line.quantity,
      ),
  );
}

/** Keep only a random inquiry round on disk. The transient payload includes personal details. */
export async function quoteRequestKey(
  payload: string,
  nonce: () => Promise<string>,
  hash: (s: string) => Promise<string>,
) {
  return hash((await nonce()) + '\n' + payload);
}
