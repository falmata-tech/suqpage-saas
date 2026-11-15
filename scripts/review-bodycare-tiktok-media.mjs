// Read-only source review in a disposable CI browser. Human frame review and
// contained showroom playback remain separate admission gates.
import fs from 'node:fs';
import {chromium} from '@playwright/test';

if (process.env.CI !== 'true') throw Error('Run in disposable CI only.');
const out = '.local/bodycare-tiktok-review';
fs.mkdirSync(out, {recursive: true});
const sources = [
  {businessId: 2, productIds: [], id: '7385295717197221138', creator: 'Wildwood Botanical', subject: 'natural skincare order: bars, body oil, facial oil, body butter'},
  {businessId: 2, productIds: [7], id: '7407311566867025170', creator: 'Wildwood Botanical', subject: 'clay mask preparation'},
  {businessId: 24, productIds: [93], id: '7341581291722198315', creator: 'Hippie Chemist LLC', subject: 'making body wash at an event'},
  {businessId: 60, productIds: [237], id: '7052286003108695302', creator: 'Cheeky Wipes', subject: 'reusable cloth wipes, subject requires frame confirmation'},
  {businessId: 21, productIds: [82], id: '7157563218557160705', creator: 'Wildwood Botanical', subject: 'orange patchouli soap making part one'},
  {businessId: 21, productIds: [84], id: '7279907164385201410', creator: 'Wildwood Botanical', subject: 'soap thins and market minis, wrapping unconfirmed'},
];
const browser = await chromium.launch({channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const result = {browser: browser.version(), sources: []};
const save = () => fs.writeFileSync(`${out}/results.json`, JSON.stringify(result, null, 2));
const state = async page => page.locator('video').evaluateAll(nodes => nodes.map(v => ({
  time: v.currentTime, duration: v.duration, width: v.videoWidth,
  height: v.videoHeight, ready: v.readyState, paused: v.paused,
  error: v.error?.code ?? null,
})));
async function frame(page, id, stage) {
  const path = `${out}/tiktok-${id}-${stage}.jpg`;
  await page.screenshot({path, type: 'jpeg', quality: 52, timeout: 8000});
  console.log(`S197_SOURCE_FRAME tiktok-${id} ${stage} ${fs.readFileSync(path).toString('base64')}`);
  return path;
}
try {
  for (const source of sources) {
    const context = await browser.newContext({viewport: {width: 900, height: 700}, serviceWorkers: 'block'});
    const page = await context.newPage();
    const url = `https://www.tiktok.com/player/v1/${source.id}?autoplay=0&controls=1&rel=0`;
    let item;
    try {
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 25000});
      await page.getByRole('button', {name: 'Play video', exact: true}).click({timeout: 10000});
      await page.waitForFunction(() => {
        const v = document.querySelector('video');
        return !!v && v.readyState >= 2 && v.videoWidth > 0 && v.currentTime > 1;
      }, null, {timeout: 18000});
      const firstState = await state(page);
      const first = await frame(page, source.id, 'first');
      await page.waitForTimeout(2500);
      const secondState = await state(page);
      const second = await frame(page, source.id, 'second');
      if ((secondState[0]?.time ?? 0) <= (firstState[0]?.time ?? 0) + 1) throw Error('Video did not advance.');
      item = {...source, ref: `tiktok:${source.id}`, status: 'decoded-moving-frames', url, firstState, secondState, first, second};
    } catch (error) {
      const blocked = await frame(page, source.id, 'blocked').catch(() => null);
      item = {...source, ref: `tiktok:${source.id}`, status: 'blocked-or-static', url, error: String(error).slice(0, 700), blocked};
    }
    result.sources.push(item);
    save();
    await context.close();
  }
} finally {
  save();
  await browser.close();
}
console.log('S197 TikTok source review complete. Inspect frames before admitting clips.');
