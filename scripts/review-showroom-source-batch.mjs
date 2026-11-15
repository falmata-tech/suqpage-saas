// Disposable source review. No app or hosted database writes. Each decoded
// frame still needs a human visual and business-fit decision before admission.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '@playwright/test';

assert.equal(process.env.CI, 'true');
const input = JSON.parse(fs.readFileSync('scripts/qa/s197-showroom-source-batch.json', 'utf8'));
assert.ok(Array.isArray(input) && input.length > 0 && input.length <= 24);
assert.equal(new Set(input.map(x => x.ref)).size, input.length);
for (const row of input) {
  assert.match(row.ref, /^tiktok:\d{16,20}$/);
  assert.match(row.creator, /^[a-zA-Z0-9_.-]{2,40}$/);
  assert.ok(typeof row.purpose === 'string' && row.purpose.length < 100);
}
const out = '.local/s197-showroom-source-batch';
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch({channel: 'chrome'});
const report = {source: process.env.S197_SOURCE_SHA || process.env.GITHUB_SHA, browserVersion: browser.version(),
  target: 'public original TikTok player, source-only', visualVerdict: 'pending-human-review', candidates: []};
const save = () => fs.writeFileSync(out + '/report.json', JSON.stringify(report, null, 2));
const state = video => video.evaluate(v => ({time: v.currentTime, duration: v.duration,
  width: v.videoWidth, height: v.videoHeight, ready: v.readyState, paused: v.paused}));
try {
  for (const row of input) {
    const id = row.ref.split(':')[1];
    const result = {ref: row.ref, creator: row.creator, purpose: row.purpose,
      playerUrl: `https://www.tiktok.com/player/v1/${id}`, status: 'failed', frames: []};
    report.candidates.push(result);
    const context = await browser.newContext({viewport: {width: 1000, height: 800}, serviceWorkers: 'block'});
    const page = await context.newPage();
    try {
      const response = await page.goto(result.playerUrl, {waitUntil: 'domcontentloaded', timeout: 25000});
      result.httpStatus = response?.status() ?? null;
      const video = page.locator('video').first();
      await page.screenshot({path: `${out}/${id}-initial.png`});
      const play = page.getByRole('button', {name: /Play video|Play/i}).first();
      if (await play.isVisible({timeout: 10000}).catch(() => false)) {
        await play.click({timeout: 10000}).catch(() => {});
      }
      const deadline = Date.now() + 25000;
      let fallbackClicked = false;
      let samples = [];
      while (Date.now() < deadline) {
        samples = await page.locator('video').evaluateAll(nodes => nodes.map(v => ({
          time: v.currentTime, duration: v.duration, width: v.videoWidth,
          height: v.videoHeight, ready: v.readyState, paused: v.paused})));
        if (samples.some(s => s.ready >= 2 && s.width > 0 && s.time > 1)) break;
        if (!fallbackClicked && Date.now() > deadline - 17000) {
          fallbackClicked = true;
          await page.mouse.click(500, 370).catch(() => {});
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      result.samples = samples;
      assert.ok(samples.some(s => s.ready >= 2 && s.width > 0 && s.time > 1), 'No decoded advancing video element');
      const start = await state(video);
      assert.ok(Number.isFinite(start.duration) && start.duration > 1 && start.duration < 360);
      result.start = start;
      result.status = 'decoded-progress';
      for (const [label, fraction] of [['start', .1], ['middle', .4], ['late', .7]]) {
        await video.evaluate((v, f) => { v.currentTime = Math.min(v.duration - .3, Math.max(.3, v.duration * f)); }, fraction);
        const frameDeadline = Date.now() + 10000;
        while ((await state(video)).ready < 2 && Date.now() < frameDeadline) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        assert.ok((await state(video)).ready >= 2, `${label} frame did not decode`);
        const snapshot = await state(video);
        const filename = `${id}-${label}.png`;
        await page.screenshot({path: `${out}/${filename}`});
        result.frames.push({file: filename, ...snapshot});
      }
      result.visibleText = (await page.locator('body').innerText().catch(() => '')).slice(0, 500);
      result.status = 'decoded-three-frames';
    } catch (error) {
      result.error = String(error).slice(0, 700);
      await page.screenshot({path: `${out}/${id}-failure.png`}).catch(() => {});
    } finally {
      save();
      await context.close();
    }
  }
} finally { save(); await browser.close(); }
console.log(JSON.stringify(report.candidates.map(({ref,status,start,error}) => ({ref,status,duration:start?.duration,error})), null, 2));
