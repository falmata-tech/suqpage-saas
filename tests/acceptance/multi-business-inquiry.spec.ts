import {expect, test} from './fixtures';
import type {Market, Shop} from '@africmade/contracts';

test('a buyer can request one quote per shop and retry a lost receipt without duplicating it', async ({page, request}) => {
  await page.setViewportSize({width: 390, height: 844});
  const chosen: Array<{shop: Shop; itemId: number; name: string}> = [];
  const scanned = new Map<string, Shop>();
  for (let batch = 1; chosen.length < 2; batch++) {
    const response = await request.get('/api/mobile/v1/market?scope=products&page=' + batch);
    expect(response.ok()).toBe(true);
    const market: Market = await response.json();
    for (const listing of market.items) {
      if (chosen.some(entry => entry.shop.handle === listing.handle)) continue;
      if (!scanned.has(listing.handle)) {
        const snapshot = await request.get('/api/mobile/v1/shops/' + encodeURIComponent(listing.handle));
        expect(snapshot.ok()).toBe(true);
        scanned.set(listing.handle, await snapshot.json());
      }
      const shop = scanned.get(listing.handle)!;
      const item = shop.products.find(p => p.id === listing.id);
      if (item && ['available', 'limited'].includes(item.availability) && item.options.every(o => o.values.length === 1)) {
        chosen.push({shop, itemId: item.id, name: item.name});
      }
      if (chosen.length === 2) break;
    }
    if (batch >= market.pages) break;
  }
  expect(chosen).toHaveLength(2);
  await page.goto('/?view=search');
  for (const {shop, name} of chosen) {
    await page.getByRole('searchbox', {name: 'Search products', exact: true}).fill(name);
    const card = page.locator('article.discovery-product-card').filter({hasText: shop.name}).filter({hasText:name}).first();
    await card.getByRole('button', {name: 'Add to inquiry list', exact: true}).click();
    await expect(card.getByRole('status')).toHaveText('Added to inquiry list.');
  }
  await page.reload();
  await page.locator('[data-inquiry-floating]').click();
  const dialog = page.getByRole('dialog', {name:'Inquiry list',exact:true});
  for (const entry of chosen) await expect(dialog.getByRole('region', {name:entry.shop.name})).toContainText(entry.name);

  const receipts: Array<{shop:number; id:number; key:string}> = [];
  await page.route('**/api/inquiries',async route=>{
    const body=route.request().postDataJSON();
    const recipient=chosen.find(entry=>entry.shop.id===body.businessId);
    expect(body.items.map((line:{productId:number})=>line.productId)).toEqual([recipient!.itemId]);
    const result=await route.fetch();
    expect(result.ok()).toBe(true);
    const receipt=await result.json();
    expect(receipt.status).toBe('received');
    receipts.push({shop:body.businessId,id:receipt.inquiryId,key:body.idempotencyKey});
    if(receipts.length===2)await route.abort('failed');
    else await route.fulfill({response:result});
  });
  const send=dialog.getByRole('button',{name:'Send to business inboxes',exact:true});
  await send.click();
  await dialog.getByLabel('Your name').fill('Acceptance quote buyer');
  await dialog.getByLabel('Phone number').fill('+12025550143');
  await send.click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByRole('region')).toHaveCount(1);
  await send.click();
  await expect(dialog.getByRole('button',{name:'Continue browsing'})).toBeVisible();
  expect(receipts).toHaveLength(3);
  expect(receipts[2]).toEqual(receipts[1]);
  expect(new Set(receipts.map(r=>r.id)).size).toBe(2);
});
