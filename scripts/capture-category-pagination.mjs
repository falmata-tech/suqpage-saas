import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {installMapTileFixture, MAP_TILE_FIXTURE_ID} from './testing/map-tile-fixture.mjs';

assert.ok(!process.argv.some(value => value === '--actual-tiles' || value.startsWith('--actual-tiles=')), 'Automated map drivers require synthetic tiles; real-provider checks are separate and manual.');
const base = process.env.SUQPAGE_TEST_BASE_URL || 'http://127.0.0.1:3101';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Local browser origin required');
const out = process.env.SUQPAGE_TEST_SCREENSHOT_DIR || '/tmp/suqpage-category-review';
fs.mkdirSync(out, {recursive: true, mode: 0o700});
const browser = await chromium.launch();
const evidence = [], tileFixtures = [];

// FE-065 AC9 supersedes the old five-card Next/Previous control. Keep this
// caller-compatible entry point and use real API batches as the authority.
async function products(context, page = 1) {
  const response = await context.request.get(`${base}/api/discovery?scope=products&category=electronics&page=${page}`);
  assert.equal(response.status(), 200, 'Real category product API succeeds');
  const result = await response.json();
  assert.equal(result.resultPage.page, page);
  assert.equal(result.resultPage.pageSize, 12);
  assert.equal(result.searchProducts.length, Math.min(result.resultPage.pageSize, result.resultPage.totalItems - result.resultPage.firstItem + 1));
  assert.equal(new Set(result.searchProducts.map(item => item.id)).size, result.searchProducts.length);
  return result;
}
const productIds = page => page.locator('.discovery-product-link').evaluateAll(links => links.map(link => Number(new URL(link.href).searchParams.get('product'))));

try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({viewport: {width, height: width === 1440 ? 1000 : 844}, serviceWorkers: 'block'});
    const tiles = await installMapTileFixture(context);
    tileFixtures.push(tiles);
    const page = await context.newPage(), errors = [], appendRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin === new URL(base).origin && url.pathname === '/api/discovery' && url.searchParams.get('scope') === 'products' && url.searchParams.get('page') === '2') appendRequests.push(url.search);
    });
    try {
      const first = await products(context), second = await products(context, 2);
      assert.ok(first.resultPage.totalPages >= 2, 'Electronics fixture exercises a real next batch');
      const firstIds = first.searchProducts.map(item => item.id);
      const twoPageIds = [...new Set([...firstIds, ...second.searchProducts.map(item => item.id)])];
      assert.equal(twoPageIds.length, firstIds.length + second.searchProducts.length, 'Server pages have no duplicate products');

      await page.goto(`${base}/?view=search&b.q=Studio&p.category=electronics`);
      await expect(page.getByRole('heading', {name: 'Products', exact: true, level: 2})).toBeVisible();
      await expect.poll(() => productIds(page)).toEqual(firstIds);
      await expect(page.getByRole('searchbox', {name: 'Search products', exact: true})).toHaveValue('');
      await expect(page.getByRole('button', {name: 'Category 1', exact: true})).toBeVisible();
      await expect(page.locator('.discovery-pagination,.discovery-business-results')).toHaveCount(0);

      await page.getByRole('button', {name: 'Business locations', exact: true}).click();
      await expect(page.getByRole('searchbox', {name: 'Search businesses', exact: true})).toHaveValue('Studio');
      const map = page.locator('.leaflet-container');
      await expect(map).toBeVisible();
      await expect.poll(() => tiles.servedCount()).toBeGreaterThan(0);
      const retained = `category-${width}`;
      await map.evaluate((element, value) => { element.dataset.categoryRetained = value; }, retained);
      await page.getByRole('button', {name: 'Product listings', exact: true}).click();
      const list = page.locator('.discovery-search-results');
      await expect.poll(() => productIds(page)).toEqual(firstIds);
      await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
      await expect.poll(() => productIds(page)).toEqual(twoPageIds);
      assert.equal(appendRequests.length, 1, 'List-end approach requests the second batch exactly once');
      const scrollTop = await list.evaluate(element => element.scrollTop);
      assert.ok(scrollTop > 0, 'Products scroll inside their own pane');

      await page.getByRole('button', {name: 'Business locations', exact: true}).click();
      await expect(map).toBeVisible();
      await expect(map).toHaveAttribute('data-category-retained', retained);
      await expect(page.getByRole('searchbox', {name: 'Search businesses', exact: true})).toHaveValue('Studio');
      await page.getByRole('button', {name: 'Product listings', exact: true}).click();
      await expect.poll(() => productIds(page)).toEqual(twoPageIds);
      await expect.poll(() => list.evaluate(element => element.scrollTop)).toBe(scrollTop);
      await expect(map).toHaveAttribute('data-category-retained', retained);

      await page.reload();
      await expect.poll(() => productIds(page)).toEqual(firstIds);
      await expect(page.getByRole('button', {name: 'Category 1', exact: true})).toBeVisible();
      assert.equal(new URL(page.url()).searchParams.get('p.category'), 'electronics');
      await page.getByRole('button', {name: 'Business locations', exact: true}).click();
      await expect(page.getByRole('searchbox', {name: 'Search businesses', exact: true})).toHaveValue('Studio');

      // A retired type hint cannot reintroduce the old mixed-result list.
      await page.goto(`${base}/?view=search&industry=electronics&type=businesses`);
      await expect(page.getByRole('heading', {name: 'Products', exact: true, level: 2})).toBeVisible();
      await expect.poll(() => productIds(page)).toEqual(firstIds);
      await expect(page.locator('.discovery-pagination,.discovery-business-results')).toHaveCount(0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow');
      const audit = await new AxeBuilder({page}).include('.discovery-search-workspace').include('[data-search-scope="products"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(audit.violations, []);
      assert.deepEqual(errors, []);
      await page.screenshot({path: `${out}/category-${width}.png`, caret: 'initial'});
      evidence.push({width, firstPageCount: firstIds.length, appendedCount: twoPageIds.length, total: first.resultPage.totalItems, mapRetained: true, independentFilters: true, scrollRetained: true, legacyUrl: true, tileFixture: {id: MAP_TILE_FIXTURE_ID, fulfilled: tiles.servedCount(), uncontrolledRequests: tiles.externalCount(), providerAvailabilityTested: false}});
      console.log(`PASS category API batches, automatic append, independent filters, retained map/list and legacy URL ${width}px`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  fs.writeFileSync(`${out}/category-evidence.json`, JSON.stringify({evidence, providerAvailabilityTested: false}, null, 2) + '\n', {mode: 0o600});
  for (const fixture of tileFixtures) fixture.assertNoExternalRequests();
}
