import { useEffect, useRef, useState } from 'react';
import type { Shop } from '../packages/contracts/src';

/** Fetch only when review is mounted. Quantity edits never reload a catalog. */
export function useQuoteCatalogs(keys: string[], load: (key: string) => Promise<Shop>) {
  const [shops, setShops] = useState<Record<string, Shop | null>>({});
  const [revision, refresh] = useState(0);
  const cache = useRef(new Map<string, Shop>());
  const requests = useRef(new Map<string, Promise<Shop>>());
  const selection = JSON.stringify(keys);
  useEffect(() => {
    let live = true;
    const pending = (JSON.parse(selection) as string[]).filter((key) => !cache.current.has(key));
    async function worker() {
      while (live && pending.length) {
        const key = pending.shift()!;
        try {
          let request = requests.current.get(key);
          if (!request) {
            request = load(key).finally(() => {
              requests.current.delete(key);
            });
            requests.current.set(key, request);
          }
          const shop = await request;
          if (live) {
            cache.current.set(key, shop);
            setShops((current) => ({ ...current, [key]: shop }));
          }
        } catch {
          if (live) setShops((current) => ({ ...current, [key]: null }));
        }
      }
    }
    void Promise.all(Array.from({ length: Math.min(3, pending.length) }, worker));
    return () => {
      live = false;
    };
  }, [selection, revision, load]);
  return { shops, retry: () => refresh((value) => value + 1) };
}
