import { useEffect, useState } from 'react';
import type { Shop } from '../packages/contracts/src';
import { readPlatformState } from './platform-state';
import { readQuoteLines, type QuoteLine, type QuoteGroup, quoteRequestKey } from './quote-list';

const eventName = 'africmade-quote-list-change';
const memory = new Map<string, QuoteLine[]>();
export function readShopLines(handle: string): QuoteLine[] {
  if (memory.has(handle)) return memory.get(handle)!;
  try {
    return readQuoteLines(JSON.parse(readPlatformState(localStorage, 'suqpage-cart:' + handle) || '[]'));
  } catch {
    return [];
  }
}
export function writeShopLines(handle: string, lines: QuoteLine[]) {
  try {
    localStorage.setItem('suqpage-cart:' + handle, JSON.stringify(lines));
    memory.delete(handle);
  } catch {
    memory.set(handle, lines);
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: handle }));
}
function groups(): QuoteGroup[] {
  const names = new Set(memory.keys());
  try {
    for (const key of Object.keys(localStorage)) {
      const match = /^(?:suqpage|mirtpage)-cart:([a-z0-9-]{3,80})$/.exec(key);
      if (match) names.add(match[1]);
    }
  } catch {
    /* In-memory selections remain usable. */
  }
  return [...names]
    .sort()
    .map((handle) => ({ handle, lines: readShopLines(handle) }))
    .filter((g) => g.lines.length);
}
export function useQuoteGroups() {
  const [items, setItems] = useState<QuoteGroup[]>([]);
  useEffect(() => {
    function updateShop(handle: string) {
      const lines = readShopLines(handle);
      setItems((previous) => {
        const index = previous.findIndex((g) => g.handle === handle);
        if (index < 0)
          return lines.length
            ? [...previous, { handle, lines }].sort((a, b) => a.handle.localeCompare(b.handle))
            : previous;
        if (!lines.length) return previous.filter((g) => g.handle !== handle);
        return previous.map((g, i) => (i === index ? { handle, lines } : g));
      });
    }
    const onWrite = (event: Event) => updateShop((event as CustomEvent<string>).detail);
    const onStorage = (event: StorageEvent) => {
      if (!event.key) {
        setItems(groups());
        return;
      }
      const match = /^(?:suqpage|mirtpage)-cart:([a-z0-9-]{3,80})$/.exec(event.key);
      if (match) updateShop(match[1]);
    };
    setItems(groups());
    window.addEventListener('storage', onStorage);
    window.addEventListener(eventName, onWrite);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(eventName, onWrite);
    };
  }, []);
  return items;
}
export async function publicQuoteShop(handle: string): Promise<Shop> {
  const r = await fetch('/api/mobile/v1/shops/' + encodeURIComponent(handle), { cache: 'no-store' });
  if (!r.ok) throw Error('Business not available.');
  const shop: Shop = await r.json();
  if (shop.handle !== handle || !Array.isArray(shop.products)) throw Error('Business not available.');
  return shop;
}
export const openQuoteList = () => window.dispatchEvent(new Event('africmade-open-quote-list'));

const visitNonces = new Map<number, string>();
export function finishWebQuote(id: number) {
  visitNonces.delete(id);
  try {
    localStorage.removeItem('africmade-quote-round:' + id);
  } catch {
    /* Storage can be unavailable. */
  }
}

export async function webQuoteKey(id: number, payload: string) {
  return quoteRequestKey(
    payload,
    async () => {
      const key = 'africmade-quote-round:' + id;
      try {
        const saved = localStorage.getItem(key);
        if (saved) return saved;
      } catch {}
      const value = visitNonces.get(id) ?? crypto.randomUUID();
      visitNonces.set(id, value);
      try {
        localStorage.setItem(key, value);
      } catch {}
      return value;
    },
    async (value) =>
      Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))),
        (byte) => byte.toString(16).padStart(2, '0'),
      ).join(''),
  );
}
