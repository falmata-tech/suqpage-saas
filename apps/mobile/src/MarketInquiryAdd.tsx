import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { SearchItem, Shop } from '@africmade/contracts';
import { MAX_INQUIRY_SELECTIONS, selectionKey } from '../../../lib/product-inquiry';
import { resolveQuoteLine } from '../../../lib/quote-list';
import { businessInquiries } from './use-business-inquiry';
import { request, useApp } from './runtime';
import { Button, Copy } from './ui';
export default function MarketInquiryAdd({ item }: { item: SearchItem }) {
  const { t } = useApp(),
    lock = useRef(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState('');
  async function add() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const shop = await request<Shop>('shops/' + encodeURIComponent(item.handle)),
        p = shop.products.find((p) => p.id === item.id);
      if (!p || p.options.some((o) => o.values.length !== 1)) {
        router.push({ pathname: '/product', params: { handle: item.handle, id: item.id } });
        return;
      }
      const options = Object.fromEntries(p.options.map((o) => [o.name, o.values[0]]));
      if (!resolveQuoteLine(shop, { productId: p.id, quantity: '', options }))
        throw Error('This product is not available for inquiry.');
      await businessInquiries.load(shop.id);
      const current = businessInquiries.read(shop);
      if (!current.ready) throw Error(current.error || 'Please try again.');
      if (current.items.some((l) => selectionKey(l.product.id, l.options) === selectionKey(p.id, options))) {
        setNotice('Already in your inquiry list.');
        return;
      }
      if (current.items.length >= MAX_INQUIRY_SELECTIONS)
        throw Error('You can include up to 20 selections in one inquiry.');
      businessInquiries.update(shop, (lines) => [...lines, { product: p, quantity: '', options }]);
      setNotice('Added to inquiry list.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <View style={{ padding: 8, gap: 4 }}>
      <Button
        secondary
        disabled={busy}
        label={t(busy ? 'Loading…' : 'Add to inquiry list')}
        onPress={() => void add()}
      />
      {!!notice && <Copy muted>{t(notice)}</Copy>}
    </View>
  );
}
