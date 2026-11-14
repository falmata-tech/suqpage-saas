// Finite FE-061 source review. It reads two public creator videos in Chrome;
// it has no application API, database, provider credential or media-write path.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const candidates = [
  {id: 'xqH2qBNsOYM', creator: 'Acme Corrugated Box', source: 'https://www.acmebox.com/about-us/our-videos/', fit: 'Omo Packaging: corrugated cartons and dividers'},
  {id: 'kuwfg34ZMyM', creator: 'SiRUBA', source: 'https://siruba.com/polo/', fit: 'Meda Uniform Works: service polo sewing'},
];
const watchUrl = id => `https://www.youtube.com/watch?v=${id}`;
const out = '.local/primary-video-review';

function preflight() {
  assert.equal(candidates.length, 2, 'The review is a finite two-video probe.');
  assert.equal(new Set(candidates.map(candidate => candidate.id)).size, candidates.length);
  for (const candidate of candidates) {
    assert.match(candidate.id, /^[a-zA-Z0-9_-]{11}$/);
    assert.equal(new URL(candidate.source).protocol, 'https:');
    assert.ok(candidate.creator && candidate.fit);
    assert.equal(new URL(watchUrl(candidate.id)).hostname, 'www.youtube.com');
  }
  assert.equal(process.argv.length, process.argv[2] === '--preflight' ? 3 : 2);
}

preflight();
if (process.argv[2] === '--preflight') {
  console.log('PASS finite public-source shortlist and offline target shape.');
  process.exit(0);
}
assert.equal(process.env.CI, 'true');
assert.equal(process.env.GITHUB_ACTIONS, 'true');
assert.equal(process.env.GITHUB_EVENT_NAME, 'pull_request');
const {chromium} = await import('@playwright/test');
const source = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
assert.equal(source, process.env.GITHUB_SHA_HEAD, 'Review the exact PR head.');
fs.mkdirSync(out, {recursive: true, mode: 0o700});
const review = {
  source,
  run: process.env.GITHUB_RUN_ID,
  browser: 'Google Chrome on GitHub hosted runner',
  scope: 'Two official-source candidates; no application or provider writes',
  visualVerdict: 'pending human frame review',
  candidates: [],
};
const save = () => fs.writeFileSync(`${out}/review.json`, JSON.stringify(review, null, 2) + '\n', {mode: 0o600});
save();

const browser = await chromium.launch({channel: 'chrome'});
try {
  for (const candidate of candidates) {
    const context = await browser.newContext({viewport: {width: 1280, height: 850}, serviceWorkers: 'block'});
    const page = await context.newPage();
    const receipt = {
      creator: candidate.creator, creatorSource: candidate.source,
      watchUrl: watchUrl(candidate.id), intendedDemoFit: candidate.fit,
      result: 'failed', visualVerdict: 'unqualified',
    };
    review.candidates.push(receipt);
    save();
    try {
      await page.goto(receipt.watchUrl, {waitUntil: 'domcontentloaded', timeout: 45000});
      const reject = page.getByRole('button', {name: /reject all/i}).first();
      if (await reject.isVisible().catch(() => false)) await reject.click({timeout: 5000});
      const video = page.locator('video.html5-main-video').first();
      await video.waitFor({state: 'attached', timeout: 25000});
      const details = await page.evaluate(() => window.ytInitialPlayerResponse?.videoDetails);
      assert.equal(details?.videoId, candidate.id, 'The player must identify the exact creator video.');
      receipt.player = {videoId: details.videoId, title: details.title, author: details.author};
      if (await video.evaluate(element => element.paused)) {
        for (const selector of ['.ytp-large-play-button', '.ytp-play-button']) {
          const button = page.locator(selector).first();
          if (await button.isVisible().catch(() => false)) {
            await button.click({timeout: 5000}).catch(() => {});
            break;
          }
        }
      }
      const state = () => video.evaluate(element => ({
        time: element.currentTime, duration: element.duration,
        ready: element.readyState, width: element.videoWidth,
        height: element.videoHeight, paused: element.paused,
        adShowing: !!document.querySelector('.ad-showing'),
      }));
      const deadline = Date.now() + 45000;
      let start;
      while (Date.now() < deadline) {
        const current = await state();
        if (!current.adShowing && current.ready >= 2 && current.width > 0 && current.height > 0 && current.time >= 1.5 && !current.paused) {
          start = current;
          break;
        }
        await page.waitForTimeout(500);
      }
      assert.ok(start, 'The exact video did not decode and advance beyond 1.5 seconds.');
      receipt.start = start;
      await page.screenshot({path: `${out}/${candidate.id}-start.png`, animations: 'disabled'});
      let progress;
      while (Date.now() < deadline) {
        const current = await state();
        if (!current.adShowing && current.time >= start.time + 2 && !current.paused) {
          progress = current;
          break;
        }
        await page.waitForTimeout(500);
      }
      assert.ok(progress, 'The exact video did not advance by two more seconds.');
      receipt.progress = progress;
      await page.screenshot({path: `${out}/${candidate.id}-progress.png`, animations: 'disabled'});
      receipt.result = 'decoded_playback';
      receipt.visualVerdict = 'pending human frame review';
    } catch (error) {
      receipt.failure = String(error).split('\n')[0].slice(0, 400);
      await page.screenshot({path: `${out}/${candidate.id}-failure.png`, animations: 'disabled'}).catch(() => {});
    } finally {
      save();
      await context.close();
    }
  }
} finally {
  await browser.close();
  save();
}
assert.ok(review.candidates.every(candidate => candidate.result === 'decoded_playback'),
  'At least one official candidate lacks decoded playback; inspect the retained review.');
