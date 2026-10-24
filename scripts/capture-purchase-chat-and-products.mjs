import assert from 'node:assert/strict';
import {TRANSPORT_COPY} from '../lib/i18n/transport-copy.ts';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
import { createUiText, languageNames } from '../lib/i18n/core.ts';
if (process.argv.includes('--actual-tiles')) throw new Error('Automated reviews must use local tile fixtures. Run any real provider smoke check separately by hand.');

// FE-019 / FE-030 / FE-049: local, read-only UI review. Never submit a chat.
const out = process.env.SUQPAGE_CAPTURE_DIR || '.local/transport-purchase-review/entry';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const records = [];
try {
  const clients = process.argv.includes('--native') ? [true] : process.argv.includes('--web') ? [false] : [false, true];
  for (const native of clients) {
    const states = [...(native ? [390, 320] : [1440, 390, 320]).map(width => [width, 'en']),
      ...['am', 'om', 'so', 'ti'].map(locale => [320, locale])];
    for (const [width, locale] of states) {
      const t = createUiText(locale === 'en' ? {} : JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`, 'utf8')));
      const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 } });
      await context.route('https://tile.openstreetmap.org/**', route => route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=', 'base64') }));
      const page = await context.newPage();
      page.setDefaultTimeout(25000);
      page.setDefaultNavigationTimeout(60000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const base = native ? 'http://localhost:8082' : 'http://127.0.0.1:3102';
      if (!native) await context.addCookies([{ name: 'suqpage-language', value: locale, url: base }]);
      await page.goto(base + '/?view=map', { waitUntil: 'domcontentloaded' });
      if (native && locale !== 'en') {
        await page.getByRole('button', { name: 'Language', exact: true }).click();
        await page.getByRole('radio', { name: languageNames[locale], exact: true }).click();
        if(await page.getByRole('button', { name: t('Close'), exact: true }).last().isVisible()) await page.getByRole('button', { name: t('Close'), exact: true }).last().click();
      }
      const map = page.locator('.leaflet-container');
      await expect.poll(async () => Number(await map.getAttribute('data-map-marker-count')), { timeout: 25000 }).toBeGreaterThan(0);
      const opener = page.getByRole('button', { name: t('View products'), exact: true });
      await expect(opener).toBeVisible();
      await expect(opener.getByText(t('View products'), { exact: true })).toBeVisible();
      const search = native ? page.getByRole('textbox', { name: t('Search'), exact: true }) : page.locator('#discovery-search');
      const category = native ? page.getByRole('button', { name: `${t('Category')}: ${t('All categories')}`, exact: true }) : page.getByLabel(t('Filter by category'), { exact: true });
      const location = native ? page.getByRole('button', { name: `${t('Region or city')}: ${t('All Ethiopia')}`, exact: true }) : page.locator('.discovery-location-menu > summary');
      const boxes = await Promise.all([opener, search, category, location].map(control => control.boundingBox()));
      assert.ok(boxes.every(Boolean));
      for (let i = 1; i < boxes.length; i++) {
        assert.ok(Math.abs(boxes[i].y - boxes[0].y) < 4, 'One horizontal toolbar');
        assert.ok(boxes[i].x >= boxes[i - 1].x + boxes[i - 1].width - 1, 'No overlapping controls');
      }
      assert.ok(boxes[0].height >= 44 && boxes[0].width >= 44);
      const launcherName = native ? t(TRANSPORT_COPY.launcherTitle) : `${t(TRANSPORT_COPY.launcherTitle)} · ${t('Live chat')}`;
      const launcher = page.getByRole('button', { name: launcherName, exact: true });
      await expect(launcher).toBeVisible();
      await expect(launcher.getByText(t(TRANSPORT_COPY.launcherTitle), { exact: true })).toBeVisible();
      const bounds = await launcher.boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1 && bounds.height >= 48, 'Labeled launcher stays inside the phone');
      async function shot(state) {
        await page.evaluate(() => document.fonts.ready);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: `${out}/${native ? 'mobile' : 'web'}-${width}-${locale}-${state}.png`, style: 'nextjs-portal { visibility:hidden }' });
      }
      await shot('closed');
      await launcher.click();
      if (!native) await expect(page.getByText(t(TRANSPORT_COPY.title), { exact: true })).toBeVisible();
      await expect(page.getByText(t(TRANSPORT_COPY.invitation), { exact: true })).toBeVisible();
      await expect(page.getByText(t(TRANSPORT_COPY.description), { exact: true })).toBeVisible();
      const start = page.getByRole('button', { name: t('Start chat'), exact: true });
      await expect(start).toBeVisible();
      await shot('intake');
      await start.scrollIntoViewIfNeeded();
      const startBounds = await start.boundingBox();
      assert.ok(startBounds && startBounds.y >= 0 && startBounds.y + startBounds.height <= page.viewportSize().height + 1, 'Start chat remains reachable after the translated introduction');
      if (native) await page.getByRole('button', { name: t('Back'), exact: true }).click();
      else await page.getByRole('dialog').getByRole('button', { name: t('Close'), exact: true }).click();
      await expect(opener).toBeVisible();
      await search.fill('lotion');
      const before = page.url();
      await opener.click();
      await expect(page.getByRole('heading', { name: t('Products & services'), exact: true })).toBeVisible();
      const closer = page.getByRole('button', { name: t('Hide products'), exact: true });
      await expect(closer).toHaveAttribute('aria-expanded', 'true');
      await expect(search).toHaveValue('lotion');
      const scope = value => { const url = new URL(value); url.searchParams.delete('view'); return url.href; };
      assert.equal(scope(page.url()), scope(before), 'Opening results changes only panel view, not search/filter scope');
      if (width <= 390) {
        const compact = page.getByRole('button', { name: launcherName, exact: true });
        await expect(compact).toBeVisible();
        const small = await compact.boundingBox();
        assert.ok(small && small.width <= 48, 'Open results retain compact chat control');
      }
      await shot('open');
      await closer.click();
      await expect(opener).toHaveAttribute('aria-expanded', 'false');
      await expect(search).toHaveValue('lotion');
      if (!native) await expect(opener).toBeFocused();
      assert.deepEqual(errors, []);
      records.push({ client: native ? 'Expo browser' : 'web', width, locale, passed: true });
      await context.close();
      console.log(`PASS ${native ? 'mobile' : 'web'} ${width} ${locale}`);
    }
  }
  fs.writeFileSync(out + (process.argv.includes('--native') ? '/native-verified.json' : process.argv.includes('--web') ? '/web-verified.json' : '/verified.json'), JSON.stringify({ records, screenshots: records.length * 3, tiles: 'controlled fixture, actual application/catalog; provider availability not tested', native: 'browser preview; not installed APK', messagesSubmitted: 0 }, null, 2));
} finally { await browser.close(); }
