// Finite source review for S197. This reads public creator players only and
// leaves every showroom and database unchanged. Frames require human review.
import fs from 'node:fs';
import {chromium} from '@playwright/test';

if (process.env.CI !== 'true') throw Error('Run only in the disposable CI browser.');
const out = '.local/bodycare-source-review';
fs.mkdirSync(out, {recursive: true});
const sources = [
  {businessId: 2, productIds: [8], ref: 'youtube:vGRYfQfKKRs', creator: 'WholeElise'},
  {businessId: 19, productIds: [73], ref: 'youtube:9PBKqll1Gc4', creator: 'Humblebee & Me'},
  {businessId: 19, productIds: [74], ref: 'youtube:qTEKYsju9gA', creator: 'Humblebee & Me'},
  {businessId: 22, productIds: [85], ref: 'youtube:2Npr6qckifk', creator: 'BioNatal'},
  {businessId: 23, productIds: [89], ref: 'youtube:4AmktmwCgPg', creator: 'Tiesta Tea'},
  {businessId: 24, productIds: [94], ref: 'tiktok:7574122408706100502', creator: 'TheCosmeticFormulator_'},
  {businessId: 25, productIds: [98], ref: 'youtube:eswRRAMcWbY', creator: 'Formula Botanica'},
  {businessId: 26, productIds: [101, 102, 103], ref: 'youtube:Icote6AoHVE', creator: 'Formula Botanica'},
  {businessId: 60, productIds: [238], ref: 'youtube:7NLMK1MUsEM', creator: 'Investisseurs & Partenaires / Sutura'},
];

const browser = await chromium.launch({channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const results = {browser: browser.version(), sources: []};
const save = () => fs.writeFileSync(out + '/results.json', JSON.stringify(results, null, 2));
async function capture(page, key, stage) {
  const screenshot = out + '/' + key + '-' + stage + '.jpg';
  await page.screenshot({path: screenshot, type: 'jpeg', quality: 52});
  const bytes = fs.readFileSync(screenshot);
  console.log(`S197_SOURCE_FRAME ${key} ${stage} ${bytes.toString('base64')}`);
  return screenshot;
}
async function videoState(page) {
  return page.locator('video').evaluateAll(nodes => nodes.map(v => ({
    time: v.currentTime, duration: v.duration, width: v.videoWidth, height: v.videoHeight,
    ready: v.readyState, paused: v.paused, error: v.error?.code ?? null,
  })));
}
async function waitForVideo(page) {
  await page.waitForFunction(() => {
    const v = document.querySelector('video');
    return !!v && v.readyState >= 2 && v.videoWidth > 0 && v.currentTime > 1;
  }, null, {timeout: 18000});
}
async function youtube(page, id, key) {
  for (const url of [
    `https://www.youtube.com/watch?v=${id}`,
    `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`,
  ]) {
    try {
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 25000});
      await page.locator('video').first().evaluate(v => v.play().catch(() => {})).catch(() => {});
      await page.locator('button.ytp-large-play-button').first().click({timeout: 3000}).catch(() => {});
      await waitForVideo(page);
      const start = await videoState(page);
      const first = await capture(page, key, 'first');
      await page.waitForTimeout(2500);
      const progress = await videoState(page);
      const second = await capture(page, key, 'second');
      if ((progress[0]?.time ?? 0) > (start[0]?.time ?? 0) + 1) return {url, start, progress, first, second};
    } catch (error) {
      console.log(`S197_SOURCE_ATTEMPT youtube:${id} ${url} ${String(error).slice(0, 250)}`);
    }
  }
  throw Error('No decoded moving YouTube frames in watch or embed player.');
}
async function tiktok(page, id, key) {
  const url = `https://www.tiktok.com/player/v1/${id}?autoplay=0&controls=1&rel=0`;
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30000});
  await page.getByRole('button', {name: 'Play video', exact: true}).click({timeout: 12000});
  await waitForVideo(page);
  const start = await videoState(page);
  const first = await capture(page, key, 'first');
  await page.waitForTimeout(2500);
  const progress = await videoState(page);
  const second = await capture(page, key, 'second');
  if ((progress[0]?.time ?? 0) <= (start[0]?.time ?? 0) + 1) throw Error('TikTok player did not advance.');
  return {url, start, progress, first, second};
}
try {
  for (const source of sources) {
    const key = source.ref.replace(':', '-');
    const context = await browser.newContext({viewport: {width: 900, height: 700}, serviceWorkers: 'block'});
    const page = await context.newPage();
    let result;
    try {
      const player = source.ref.startsWith('youtube:')
        ? await youtube(page, source.ref.slice(8), key)
        : await tiktok(page, source.ref.slice(7), key);
      result = {...source, status: 'decoded-moving-frames', player};
    } catch (error) {
      const frame = await capture(page, key, 'blocked').catch(() => null);
      result = {...source, status: 'blocked-or-static', error: String(error).slice(0, 800), frame};
    }
    results.sources.push(result);
    save();
    await context.close();
  }
} finally {
  save();
  await browser.close();
}
console.log('S197 source review completed; inspect retained frames and JSON before admitting a candidate.');
