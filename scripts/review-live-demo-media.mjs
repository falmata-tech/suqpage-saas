// Finite evidence branch only. No production target, hosted credentials, media
// mutations or provider fixtures. A moving player still needs human visual review.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium, expect} from '@playwright/test';

const out = '.local/live-media-review';
fs.mkdirSync(out, {recursive: true});
const fixture = JSON.parse(fs.readFileSync('.local/native-qa/fixture.json', 'utf8'));
const source = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
assert.equal(process.env.AFRICMADE_NATIVE_QA, '1');
assert.equal(fixture.source, source);
assert.equal(fixture.handle, 'demo-liya-soap-kitchen');
assert.equal(fixture.externalVideo?.ref, 'tiktok:7703762862484851981');
const base = 'http://127.0.0.1:3000';
const api = await fetch(base + '/api/mobile/v1/shops/' + fixture.handle);
assert.equal(api.status, 200);
const shop = await api.json();
assert.equal(shop.id, fixture.businessId);
assert.ok(shop.isDemo && shop.products.length === 4);
const product = shop.products.find(p => p.id === fixture.productId);
assert.ok(product);
const mediaIndex = product.media.findIndex(m => m.kind === 'video' && m.ref === fixture.externalVideo.ref);
assert.ok(mediaIndex >= 0);
const browser = await chromium.launch();
const results = {source, dataTarget: 'disposable-local-postgres', app: [], creators: [], visualVerdict: 'pending-agent-review'};
const write = () => fs.writeFileSync(out + '/review.json', JSON.stringify(results, null, 2));
const videoState = frame => frame.locator('video').evaluateAll(nodes => nodes.map(v => ({
  time: v.currentTime, duration: v.duration, width: v.videoWidth, height: v.videoHeight,
  ready: v.readyState, paused: v.paused,
})));
async function waitServer(url) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url, {signal: AbortSignal.timeout(5000)})).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw Error('Isolated Expo preview did not become ready.');
}
async function actualTikTok(page, label) {
  await expect.poll(() => page.frames().filter(f => f.url().startsWith('https://www.tiktok.com/player/v1/7703762862484851981')).length, {timeout: 30000}).toBe(1);
  const frame = page.frames().find(f => f.url().startsWith('https://www.tiktok.com/player/v1/7703762862484851981'));
  await frame.getByRole('button', {name: 'Play video', exact: true}).click({timeout: 30000});
  await expect.poll(async () => (await videoState(frame)).some(v => v.ready >= 2 && v.width > 0 && v.time > 1), {timeout: 40000}).toBe(true);
  const start = await videoState(frame);
  await page.screenshot({path: out + '/' + label + '-start.png'});
  await expect.poll(async () => (await videoState(frame))[0]?.time ?? 0, {timeout: 20000}).toBeGreaterThan(start[0].time + 2);
  const progress = await videoState(frame);
  await page.screenshot({path: out + '/' + label + '-progress.png'});
  return {start, progress};
}
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({viewport: {width, height: 900}, serviceWorkers: 'block'});
    const page = await context.newPage();
    try {
      await page.goto(base + '/@' + fixture.handle + '?product=' + fixture.productId, {timeout: 90000});
      const gallery = page.getByRole('region', {name: 'Photos and videos', exact: true});
      await gallery.getByRole('button', {name: 'Video ' + (mediaIndex + 1), exact: true}).click();
      await gallery.getByRole('button', {name: 'Play video ' + (mediaIndex + 1), exact: true}).click();
      await gallery.scrollIntoViewIfNeeded();
      const playback = await actualTikTok(page, 'web-' + width);
      assert.equal(context.pages().length, 1, 'Inline playback must not open another tab.');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await gallery.getByRole('button', {name: 'Photo 1', exact: true}).click();
      await expect(gallery.locator('iframe')).toHaveCount(0);
      results.app.push({surface: 'web', width, result: 'playback-and-unmount-observed', ...playback});
    } catch (error) {
      await page.screenshot({path: out + '/web-' + width + '-failure.png'}).catch(() => {});
      results.app.push({surface: 'web', width, result: 'failed', error: String(error).slice(0, 1000)});
    } finally { write(); await context.close(); }
  }
  await waitServer('http://localhost:8082');
  const context = await browser.newContext({viewport: {width: 390, height: 844}, serviceWorkers: 'block'});
  const page = await context.newPage();
  try {
    // Transport proxy only: the emulator-local origin remains pinned in the app;
    // the real loopback API handles each request and supplies its real response.
    await context.route('http://10.0.2.2:3000/**', async route => {
      const url = new URL(route.request().url());
      assert.equal(url.origin, 'http://10.0.2.2:3000');
      const response = await route.fetch({url: base + url.pathname + url.search});
      await route.fulfill({response});
    });
    await page.goto('http://localhost:8082/product?handle=' + fixture.handle + '&id=' + fixture.productId, {timeout: 120000});
    await page.getByRole('button', {name: 'Video ' + (mediaIndex + 1), exact: true}).click({timeout: 90000});
    await page.getByRole('button', {name: 'Watch video', exact: true}).click();
    const playback = await actualTikTok(page, 'expo-390');
    await page.getByRole('button', {name: 'Photo 1', exact: true}).click();
    await expect(page.locator('iframe')).toHaveCount(0);
    assert.equal(context.pages().length, 1);
    results.app.push({surface: 'Expo web', width: 390, result: 'playback-and-unmount-observed', ...playback});
  } catch (error) {
    await page.screenshot({path: out + '/expo-390-failure.png'}).catch(() => {});
    results.app.push({surface: 'Expo web', width: 390, result: 'failed', error: String(error).slice(0, 1000)});
  } finally { write(); await context.close(); }

  const candidates = [
    ['22iNfILuO4U', 'Sabahar PLC', 'Ethiopian woven textiles'],
    ['gos07cabE6w', 'Corter Leather', 'Leather purse cutting and stitching'],
    ['_5kQaug4IwI', 'Azizi Life', 'Rwandan basket weaving'],
    ['kuwfg34ZMyM', 'SiRUBA / KAULIN', 'Garment sewing process'],
    ['URAfSJzqVww', 'Acme Corrugated Box', 'Corrugated packaging factory'],
    ['rm2fV4BrQ7k', 'TRUMPF', 'Sheet metal rack fabrication'],
    ['5EUOdQE0LmU', 'Masa', 'Concrete blocks and pavers'],
    ['G0rZDzPbjw0', 'JLCPCB', 'Electronics manufacturing'],
    ['4eni7vRYWn8', 'Bramble Berry', 'Botanical oil blending'],
    ['NJMPGgcDylY', 'Existing reviewed example', 'Ceramic production'],
    ['gkqKw1n6VQg', 'Existing reviewed example', 'Honey extraction'],
    ['2H4PO4yVIsI', 'Existing reviewed example', 'Pasta production'],
    ['a2c1vNB-Bpg', 'Owner-liked existing example', 'Farm tour'],
    ['ftMC5TSJSBg', 'Owner-liked existing example', 'Grain milling'],
  ];
  let consecutiveStalls = 0;
  for (const [id, creator, subject] of candidates) {
    const page = await browser.newPage({viewport: {width: 1120, height: 720}});
    const record = {ref: 'youtube:' + id, creator, subject, result: 'unverified'};
    try {
      await page.goto('https://www.youtube-nocookie.com/embed/' + id + '?autoplay=0&rel=0', {timeout: 30000});
      const text = await page.locator('body').innerText();
      if (/verify you are human|not a bot|unusual traffic|automated queries/i.test(text)) {
        record.result = 'provider-verification-block';
        await page.screenshot({path: out + '/source-' + id + '-block.png'});
        results.creators.push(record); write(); break;
      }
      await page.getByRole('button', {name: /Play/}).first().click({timeout: 10000});
      await expect.poll(async () => (await videoState(page)).some(v => v.width > 0 && v.time > 1), {timeout: 25000}).toBe(true);
      record.start = await videoState(page);
      await page.screenshot({path: out + '/source-' + id + '-start.png'});
      await page.getByRole('slider', {name: 'Seek slider', exact: true}).press('5');
      await expect.poll(async () => (await videoState(page))[0]?.time ?? 0, {timeout: 15000}).toBeGreaterThan(record.start[0].duration * .4);
      await page.waitForTimeout(1500);
      record.middle = await videoState(page);
      await page.screenshot({path: out + '/source-' + id + '-middle.png'});
      record.result = 'decoded-frames-awaiting-visual-review';
      consecutiveStalls = 0;
    } catch (error) {
      record.error = String(error).slice(0, 700);
      record.result = 'unverified-in-review-runner';
      await page.screenshot({path: out + '/source-' + id + '-failure.png'}).catch(() => {});
      if (++consecutiveStalls >= 2) { results.creators.push(record); write(); await page.close(); break; }
    } finally { if (!page.isClosed()) await page.close(); }
    results.creators.push(record); write();
  }
  assert.equal(results.app.length, 3);
  assert.ok(results.app.every(r => r.result === 'playback-and-unmount-observed'), 'Inspect retained actual-player app evidence.');
} finally { write(); await browser.close(); }
