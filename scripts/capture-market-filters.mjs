import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';

const base = process.env.SUQPAGE_TEST_BASE_URL || 'http://127.0.0.1:3102';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const dir = '.local/market-filters-review';
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const evidence = [];
async function settleMedia(page) {
  if (await page.locator(".discovery-map-stage").count()) {
    await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({ timeout: 20000 });
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    const visible = [...document.images].filter(img => {
      const r = img.getBoundingClientRect();
      return r.width && r.height && r.top < innerHeight && r.bottom > 0;
    });
    await Promise.race([
      Promise.all(visible.map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }))),
      new Promise(resolve => setTimeout(resolve, 5000)),
    ]);
  });
}

try {
  for (const width of [320, 390, 1440]) for (const locale of ['en', 'am', 'om', 'so', 'ti']) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    await context.addCookies([{ name: 'suqpage-language', value: locale, url: base }]);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/?view=search`, { waitUntil: 'domcontentloaded' });
    const panel = page.locator('#discovery-search-panel');
    const products = panel.locator('input[value=products]');
    const businesses = panel.locator('input[value=businesses]');
    const list = panel.locator('.discovery-search-results');
    await expect(products).toBeChecked();
    await expect(businesses).toBeChecked();
    await expect(page.locator('.public-experience-head p')).toBeVisible();
    assert.equal(await panel.locator('.discovery-search-result-types, [role=tablist]').count(), 0);
    await expect(list.locator('a, button').first()).toBeVisible();
    assert.ok(await list.evaluate(el => el.clientHeight > 250), 'Collapsed filters leave room for results');
    const launcher = page.locator('.public-support-launcher');
    const panelBox = await panel.boundingBox(), launcherBox = await launcher.boundingBox();
    assert.ok(launcherBox.x >= panelBox.x + panelBox.width, 'Buying help must not cover results or pagination');
    await settleMedia(page);
    await page.screenshot({ path: `${dir}/results-${width}-${locale}.png` });
    const category = panel.locator('details summary');
    const place = panel.locator('#discovery-filter-fields select');
    await expect(category).toBeVisible();
    await expect(place).toBeVisible();
    const categoryBox = await category.boundingBox(), placeBox = await place.boundingBox();
    assert.ok(Math.abs(placeBox.y-categoryBox.y)<3 && placeBox.x>=categoryBox.x+categoryBox.width, 'Filters share a row without overlap');
    await category.click();
    const lastCategory = panel.locator('details button').last();
    await lastCategory.scrollIntoViewIfNeeded();
    await lastCategory.click();
    await expect(lastCategory).toHaveAttribute('aria-disabled','false');
    await lastCategory.press('Escape');
    await expect(panel.locator('details')).not.toHaveAttribute('open');
    await place.scrollIntoViewIfNeeded();
    assert.ok(await place.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    }), 'Location is reachable, not covered by another control');
    await settleMedia(page);
    await page.screenshot({ path: `${dir}/filters-${width}-${locale}.png` });
    await products.click();
    await expect(page).toHaveURL(/type=businesses/);
    await expect(panel.locator('input[value=products]')).not.toBeChecked();
    await expect(businesses).toBeDisabled();
    await expect(list.locator('.discovery-business-results button').first()).toBeVisible();
    await expect(list.locator('.discovery-product-results a')).toHaveCount(0);
    await products.click();
    await expect(products).toBeEnabled();
    await expect(products).toBeChecked();
    await businesses.click();
    await expect(page).toHaveURL(/type=products/);
    await expect(products).toBeDisabled();
    await expect(list.locator('.discovery-product-results a').first()).toBeVisible();
    await expect(list.locator('.discovery-business-results button')).toHaveCount(0);
    const next = panel.locator('.discovery-pagination a').last();
    await next.click();
    await expect(page).toHaveURL(/page=2/);
    assert.equal(new URL(page.url()).searchParams.get('type'), 'products');
    await businesses.click();
    await expect(businesses).toBeEnabled();
    await expect(businesses).toBeChecked();
    assert.equal(new URL(page.url()).searchParams.get('page'), null, 'Type change resets page');
    await page.goBack();
    await expect(page).toHaveURL(/page=2/);
    await expect(products).toBeChecked();
    await expect(businesses).not.toBeChecked();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    evidence.push({ width, locale, filters: true, pagination: true, history: true });
    console.log(`PASS ${width}px ${locale}: type filters, paging and history`);
    if (locale === 'en' && width !== 320) {
      await page.goto(`${base}/about`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'One link to everything you offer.' })).toBeVisible();
      await settleMedia(page);
    await page.screenshot({ path: `${dir}/about-${width}.png`, fullPage: true });
    }
    await context.close();
  }
  // Scope is retained on a type change, including a query that has no matches.
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/?view=search&industry=beauty-wellness&q=lotion`, { waitUntil: 'domcontentloaded' });
  const panel = page.locator('#discovery-search-panel');
  const place = panel.locator('select');
  const placeValue = await place.locator('option').nth(1).getAttribute('value');
  await place.selectOption(placeValue);
  await expect.poll(() => new URL(page.url()).searchParams.get('place')).toBe(placeValue);
  await panel.locator('input[value=products]').click();
  await expect(page).toHaveURL(/type=businesses/);
    await expect(panel.locator('input[value=products]')).not.toBeChecked();
  for (const [key, value] of Object.entries({ industry: 'beauty-wellness', q: 'lotion', place: placeValue })) {
    assert.equal(new URL(page.url()).searchParams.get(key), value);
  }
  const result = panel.locator('.discovery-search-results a, .discovery-search-results button, .discovery-search-empty').first();
  await result.scrollIntoViewIfNeeded();
  await expect(result).toBeInViewport();
  const mapButtons = await page.locator('.discovery-floating-buttons button').all();
  const buyingBox = await page.locator('.public-support-launcher').boundingBox();
  for (const button of mapButtons) {
    const r = await button.boundingBox();
    assert.ok(r.y + r.height <= buyingBox.y || r.x + r.width <= buyingBox.x, 'Map controls do not overlap buying help');
  }
  await settleMedia(page);
  await page.screenshot({ path: `${dir}/landscape.png` });
  evidence.push({ width: 844, height: 390, scopePreserved: true, resultsReachable: true });
  await context.close();
  fs.writeFileSync(`${dir}/verified.json`, JSON.stringify(evidence, null, 2));
  console.log('PASS: 15 locale/viewport combinations plus landscape; types, server pagination, history, filter reachability and scope.');
} finally { await browser.close(); }
