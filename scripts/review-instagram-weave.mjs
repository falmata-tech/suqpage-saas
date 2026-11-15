// Finite product-208 source-fit evidence only. No hosted target or real merchant.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium, expect} from '@playwright/test';

const target = new URL(process.env.SUQPAGE_TEST_POSTGRES_URL || '');
assert.equal(process.env.CI, 'true');
assert.equal(process.env.GITHUB_EVENT_NAME, 'pull_request');
assert.equal(process.env.AFRICMADE_NATIVE_QA, '1');
assert.ok(['postgres:', 'postgresql:'].includes(target.protocol));
assert.ok(['127.0.0.1', 'localhost'].includes(target.hostname));
assert.equal(target.pathname, '/suqpage_native_qa');
assert.equal(process.env.EXPO_PUBLIC_API_ORIGIN, 'http://10.0.2.2:3000');
assert.equal(process.env.EXPO_PUBLIC_NATIVE_MAP_FIXTURE, '1');
if (process.argv[2] === '--preflight') {
  assert.equal(process.argv.length, 3);
  console.log('PASS finite weaving review has an isolated local target.');
  process.exit(0);
}
assert.equal(process.argv.length, 2);
const out = '.local/instagram-weave-review';
fs.mkdirSync(out, {recursive: true});
const fixture = JSON.parse(fs.readFileSync(out + '/fixture.json', 'utf8'));
const source = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
assert.equal(fixture.source, source);
assert.equal(fixture.handle, 'demo-liya-textile-house');
assert.equal(fixture.businessId, 52);
assert.equal(fixture.productId, 208);
assert.equal(fixture.videoRef, 'instagram:ConpKe_AEa4');
assert.equal(fixture.storyUnchanged, true);
assert.deepEqual(fixture.otherProductsUnchanged, [205, 206, 207]);
const base = 'http://127.0.0.1:3000';
const api = await fetch(base + '/api/mobile/v1/shops/' + fixture.handle, {signal: AbortSignal.timeout(10000)});
assert.equal(api.status, 200);
const shop = await api.json();
assert.equal(shop.id, fixture.businessId);
assert.ok(shop.isDemo && shop.products.length === 4);
const product = shop.products.find(p => p.id === fixture.productId);
assert.ok(product);
assert.equal(product.name, 'Custom Color Weave Run');
assert.equal(shop.name, 'Liya Textile House');
const mediaIndex = product.media.findIndex(m => m.kind === 'video' && m.ref === fixture.videoRef);
assert.ok(mediaIndex >= 0);
const browser = await chromium.launch({channel: 'chrome'});
const results = {source, candidate: fixture.videoRef, target: {businessId: 52, productId: 208},
  primarySource: 'https://thornegge.wordpress.com/weaving/lias-weaving-process/',
  attribution: 'Lia de Thornegge @lia.me.fecit Instagram Reel; third-party weaving example, not Liya Textile House footage',
  browser: {name: 'Google Chrome', version: browser.version(), mode: 'headless-managed-runner'},
  dataTarget: 'disposable-local-postgres', app: [], visualVerdict: 'pending-artifact-review',
  productionMediaChanged: false, installedAndroidVerdict: 'not-tested'};
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
const embedPrefix = 'https://www.instagram.com/reel/ConpKe_AEa4/embed/';
async function actualInstagram(page, label, stage) {
  await expect.poll(() => page.frames().filter(f => f.url().startsWith(embedPrefix)).length,
    {timeout: 30000}).toBe(1);
  const frame = page.frames().find(f => f.url().startsWith(embedPrefix));
  await expect.poll(async () => /lia\.me\.fecit/i.test(await frame.locator('body').innerText()),
    {timeout: 20000}).toBe(true);
  await page.screenshot({path: out + '/' + label + '-loaded.png'});
  const play = frame.getByRole('button', {name: /play/i});
  if (await play.count()) await play.first().click({timeout: 10000});
  else if (await frame.locator('video').count()) await frame.locator('video').first().click({timeout: 10000});
  else {
    const body = await frame.locator('body').boundingBox();
    assert.ok(body, 'Instagram player body must be visible.');
    await frame.locator('body').click({position: {x: body.width / 2, y: body.height / 2}, timeout: 10000});
  }
  await expect.poll(async () => (await videoState(frame)).some(v => v.ready >= 2 && v.width > 0 && v.height > 0 && v.time > 1),
    {timeout: 40000}).toBe(true);
  const start = await videoState(frame);
  await page.screenshot({path: out + '/' + label + '-start.png'});
  await expect.poll(async () => (await videoState(frame))[0]?.time ?? 0, {timeout: 20000})
    .toBeGreaterThan(start[0].time + 2);
  const progress = await videoState(frame);
  const frameBox = await (await frame.frameElement()).boundingBox();
  assert.ok(frameBox && Math.abs(frameBox.width / frameBox.height - 9 / 16) < .02,
    'The exact Instagram iframe must retain its portrait ratio.');
  let stageBox = null;
  if (stage) {
    stageBox = await stage.boundingBox();
    assert.ok(stageBox, 'The active product stage remains visible.');
    assert.ok(frameBox.x >= stageBox.x - .5 && frameBox.x + frameBox.width <= stageBox.x + stageBox.width + .5,
      'The player must fit horizontally inside the product stage.');
    assert.ok(frameBox.y >= stageBox.y - .5 && frameBox.y + frameBox.height <= stageBox.y + stageBox.height + .5,
      'The player must fit vertically inside the product stage.');
    const viewport = page.viewportSize();
    if (label.startsWith('web-')) {
      const height = Math.min(viewport.height * .7, 680);
      assert.ok(stageBox.height >= height - 1 && stageBox.height <= height + 1,
        'The web product stage must use the bounded portrait height.');
    }
  }
  await page.screenshot({path: out + '/' + label + '-progress.png'});
  return {start, progress, frameBox, stageBox, creatorVisible: true};
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
      const playback = await actualInstagram(page, 'web-' + width,
        gallery.getByLabel('Media ' + (mediaIndex + 1) + ' of ' + product.media.length, {exact: true}));
      assert.equal(context.pages().length, 1, 'Inline playback must not open another tab.');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await gallery.getByRole('button', {name: 'Photo 1', exact: true}).click();
      await expect(gallery.locator('iframe')).toHaveCount(0);
      await page.reload({timeout: 90000});
      await gallery.getByRole('button', {name: 'Video ' + (mediaIndex + 1), exact: true}).click();
      await gallery.getByRole('button', {name: 'Play video ' + (mediaIndex + 1), exact: true}).click();
      await expect.poll(() => page.frames().filter(f => f.url().startsWith(embedPrefix)).length,
        {timeout: 30000}).toBe(1);
      await gallery.getByRole('button', {name: 'Photo 1', exact: true}).click();
      await expect(gallery.locator('iframe')).toHaveCount(0);
      results.app.push({surface: 'web', width, result: 'playback-reload-unmount-observed', ...playback});
    } catch (error) {
      await page.screenshot({path: out + '/web-' + width + '-failure.png'}).catch(() => {});
      results.app.push({surface: 'web', width, result: 'failed', error: String(error).slice(0, 1000)});
    } finally { write(); await context.close(); }
  }
  await waitServer('http://localhost:8082');
  const context = await browser.newContext({viewport: {width: 390, height: 844}, serviceWorkers: 'block'});
  const page = await context.newPage();
  try {
    // The disposable runner binds the emulator address on loopback. The app
    // reaches the actual API directly; no application response is intercepted.
    await page.goto('http://localhost:8082/product?handle=' + fixture.handle + '&id=' + fixture.productId, {timeout: 120000});
    await page.getByRole('button', {name: 'Video ' + (mediaIndex + 1), exact: true}).click({timeout: 90000});
    await page.getByRole('button', {name: 'Watch video', exact: true}).click();
    const playback = await actualInstagram(page, 'expo-390');
    await page.getByRole('button', {name: 'Photo 1', exact: true}).click();
    await expect(page.locator('iframe')).toHaveCount(0);
    assert.equal(context.pages().length, 1);
    await page.reload({timeout: 90000});
    await page.getByRole('button', {name: 'Video ' + (mediaIndex + 1), exact: true}).click({timeout: 90000});
    await page.getByRole('button', {name: 'Watch video', exact: true}).click();
    await expect.poll(() => page.frames().filter(f => f.url().startsWith(embedPrefix)).length,
      {timeout: 30000}).toBe(1);
    await page.getByRole('button', {name: 'Photo 1', exact: true}).click();
    await expect(page.locator('iframe')).toHaveCount(0);
    results.app.push({surface: 'Expo web', width: 390, result: 'playback-reload-unmount-observed', ...playback});
  } catch (error) {
    await page.screenshot({path: out + '/expo-390-failure.png'}).catch(() => {});
    results.app.push({surface: 'Expo web', width: 390, result: 'failed', error: String(error).slice(0, 1000)});
  } finally { write(); await context.close(); }

  assert.equal(results.app.length, 3);
  assert.ok(results.app.every(r => r.result === 'playback-reload-unmount-observed'), 'Inspect retained actual-player app evidence.');
} finally { write(); await browser.close(); }
