import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Shop } from '../packages/contracts/src';
import {
  deliverShopQuote,
  remainingQuoteLines,
  shopQuote,
  type QuoteAttempt,
  type QuoteLine,
} from '../lib/quote-list';
import { createUiText } from '../lib/i18n/core';
const t = createUiText({});
const shop = (id: number): Shop => ({
  id,
  handle: 'workshop-' + id,
  name: 'Workshop ' + id,
  about: '',
  cover: '',
  videoUrl: '',
  contacts: {},
  version: 1,
  status: 'active',
  isDemo: false,
  products: [
    {
      id: id * 10,
      name: 'Cup ' + id,
      kind: 'standard_product',
      published: true,
      description: '',
      priceMinor: null,
      media: [],
      availability: 'available',
      quantityMode: 'optional',
      quantityUnit: '',
      options: [{ name: 'Size', values: ['S', 'L'] }],
    },
  ],
});
const line = (id: number): QuoteLine => ({
  productId: id * 10,
  quantity: '12 boxes',
  options: { Size: 'L' },
});
test('each shop receives only its own canonical selections and quote text', async () => {
  const attempts = new Map<number, QuoteAttempt>(),
    contact = { name: 'Buyer', phone: '2025550148', message: 'Lead time?' };
  for (const id of [1, 2]) {
    await deliverShopQuote(
      shop(id),
      [line(id)],
      contact,
      'https://example.test',
      t,
      attempts,
      () => String(id),
      async (body) => {
        assert.deepEqual(body, {
          businessId: id,
          customerName: contact.name,
          contact: contact.phone,
          contactMethod: 'phone',
          note: shopQuote(shop(id), [line(id)], 'https://example.test', t) + '\n\nLead time?',
          items: [line(id)],
          idempotencyKey: String(id),
        });
        assert.ok(!JSON.stringify(body).includes('Cup ' + (3 - id)));
        return { inquiryId: id, status: 'received' };
      },
    );
  }
  assert.throws(() => shopQuote(shop(1), [line(2)], 'https://example.test', t));
  assert.throws(() =>
    shopQuote(shop(1), [{ ...line(1), options: { Size: 'retired' } }], 'https://example.test', t),
  );
});
test('a lost receipt retries with the same key and an incomplete receipt cannot clear a group', async () => {
  const attempts = new Map<number, QuoteAttempt>(),
    keys: string[] = [];
  const send = (post: (body: object) => Promise<{ inquiryId: number; status: string }>) =>
    deliverShopQuote(
      shop(1),
      [line(1)],
      { name: 'Buyer', phone: '2025550148', message: '' },
      'https://example.test',
      t,
      attempts,
      () => crypto.randomUUID(),
      post,
    );
  await assert.rejects(
    send(async (body) => {
      keys.push(Reflect.get(body, 'idempotencyKey'));
      throw Error('Network');
    }),
  );
  await assert.rejects(
    send(async (body) => {
      keys.push(Reflect.get(body, 'idempotencyKey'));
      return { inquiryId: 0, status: 'accepted' };
    }),
  );
  await send(async (body) => {
    keys.push(Reflect.get(body, 'idempotencyKey'));
    return { inquiryId: 3, status: 'received' };
  });
  assert.equal(new Set(keys).size, 1);
  assert.deepEqual(remainingQuoteLines([line(1), line(2)], [line(1)]), [line(2)]);
  const edited = { ...line(1), quantity: '24 boxes' };
  assert.deepEqual(remainingQuoteLines([edited], [line(1)]), [edited]);
});

test('a custom inquiry for one shop keeps its canonical selected items', async () => {
  const items = [line(1)];
  await deliverShopQuote(
    shop(1),
    items,
    { name: 'Buyer', phone: '2025550148', message: '', editedDraft: 'Can you quote delivery on Friday?' },
    'https://example.test',
    t,
    new Map(),
    () => crypto.randomUUID(),
    async (body) => {
      assert.equal(Reflect.get(body, 'note'), 'Can you quote delivery on Friday?');
      assert.deepEqual(Reflect.get(body, 'items'), items);
      return { inquiryId: 1, status: 'received' };
    },
  );
});
