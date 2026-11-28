'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useUiText } from '@/lib/i18n/ui';
import { MAX_INQUIRY_SELECTIONS, productHref, selectionKey } from '@/lib/product-inquiry';
import { publicQuoteShop, readShopLines, writeShopLines } from '@/lib/web-quote-list';
import { resolveQuoteLine } from '@/lib/quote-list';
import styles from './IndependentMarket.module.css';
export default function MarketAddToInquiry({
  handle,
  id,
  remember,
}: {
  handle: string;
  id: number;
  remember: () => void;
}) {
  const t = useUiText(),
    router = useRouter(),
    lock = useRef(false);
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState('');
  async function add() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const shop = await publicQuoteShop(handle),
        product = shop.products.find((p) => p.id === id);
      if (!product || product.options.some((o) => o.values.length !== 1)) {
        remember();
        router.push(productHref(handle, id) + '&ref=discovery');
        return;
      }
      const line = {
        productId: id,
        quantity: '',
        options: Object.fromEntries(product.options.map((o) => [o.name, o.values[0]])),
      };
      if (!resolveQuoteLine(shop, line)) throw Error('This product is not available for inquiry.');
      const existing = readShopLines(handle),
        key = selectionKey(id, line.options);
      if (existing.some((l) => selectionKey(l.productId, l.options) === key)) {
        setNotice('Already in your inquiry list.');
        return;
      }
      if (existing.length >= MAX_INQUIRY_SELECTIONS)
        throw Error('You can include up to 20 selections in one inquiry.');
      writeShopLines(handle, [...existing, line]);
      setNotice('Added to inquiry list.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className={styles.quoteAdd}>
      <button type="button" disabled={busy} onClick={() => void add()}>
        <Plus size={16} />
        {t(busy ? 'Loading…' : 'Add to inquiry list')}
      </button>
      {notice && <small role="status">{t(notice)}</small>}
    </div>
  );
}
