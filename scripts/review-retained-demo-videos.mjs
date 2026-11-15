// Finite FE-061 source review. It reads four retained public videos in Chrome;
// it has no application API, database, provider credential or media-write path.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {createServer} from 'node:http';

const candidates = [
  {id: 'a2c1vNB-Bpg', creator: 'verify in official player', source: 'https://www.youtube.com/watch?v=a2c1vNB-Bpg', fit: 'Green Terrace 5, Bora 27, Mulu 29, Sofi 31, Rift Seed 33: only matching farm/orchard/seed forms'},
  {id: 'ftMC5TSJSBg', creator: 'verify in official player', source: 'https://www.youtube.com/watch?v=ftMC5TSJSBg', fit: 'Rift Mill 7, Laga Mill 28, Wabi Flour 32: only matching grain/flour forms'},
  {id: 'gkqKw1n6VQg', creator: 'verify in official player', source: 'https://www.youtube.com/watch?v=gkqKw1n6VQg', fit: 'Blue Nile Apiary 6: honey extraction, exclude beeswax candles'},
  {id: '2H4PO4yVIsI', creator: 'verify in official player', source: 'https://www.youtube.com/watch?v=2H4PO4yVIsI', fit: 'Tena Pasta 61: production, exact pasta shapes to inspect'},
];
const watchUrl = id => `https://www.youtube.com/watch?v=${id}`;
const out = '.local/retained-video-review';

function preflight() {
  assert.equal(candidates.length, 4, 'The review is a finite four-video probe.');
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
  scope: 'Four retained demo refs, read-only source playback; no application or provider writes',
  visualVerdict: 'pending human frame review',
  candidates: [],
};
const save = () => fs.writeFileSync(`${out}/review.json`, JSON.stringify(review, null, 2) + '\n', {mode: 0o600});
save();

async function playExactVideo(page, player, candidate, prefix, receiptPart) {
  const playerUrl = new URL(player.url());
  if (prefix === 'embed') {
    assert.ok(['www.youtube-nocookie.com', 'www.youtube.com'].includes(playerUrl.hostname));
    assert.equal(playerUrl.pathname, `/embed/${candidate.id}`);
  } else {
    assert.equal(playerUrl.hostname, 'www.youtube.com');
    assert.equal(playerUrl.searchParams.get('v'), candidate.id);
  }
  const video = player.locator('video.html5-main-video').first();
  await video.waitFor({state: 'attached', timeout: 25000});
  const result = {playAttempts: []};
  receiptPart.playAttempts = result.playAttempts;
  const state = () => video.evaluate(element => ({
    time: element.currentTime, duration: element.duration,
    ready: element.readyState, width: element.videoWidth,
    height: element.videoHeight, paused: element.paused,
    adShowing: !!document.querySelector('.ad-showing'),
  }));
  const deadline = Date.now() + 45000;
  const maxPlayAttempts = prefix === 'embed' ? 1 : 2;
  let nextPlayAttemptAt = 0;
  while (Date.now() < deadline) {
    const current = await state();
    receiptPart.lastObserved = current;
    // The video element can attach before the poster's Play control appears.
    // Retry only while visibly paused, with a bounded gap and retained outcome.
    if (current.paused && !current.adShowing && result.playAttempts.length < maxPlayAttempts
      && Date.now() >= nextPlayAttemptAt) {
      for (const selector of ['.ytp-large-play-button', '.ytp-play-button', '.ytp-cued-thumbnail-overlay']) {
        // The player can retain an earlier hidden control before showing the
        // poster. Select the visible match, not the first DOM match.
        const button = player.locator(`${selector}:visible`).first();
        if (!await button.count()) continue;
        const attempt = {selector, result: 'failed'};
        result.playAttempts.push(attempt);
        nextPlayAttemptAt = Date.now() + 5000;
        try {
          await button.click({timeout: 5000});
          attempt.result = 'clicked';
        } catch (error) {
          attempt.failure = String(error).split('\n')[0].slice(0, 200);
        }
        break;
      }
    }
    const identity = await player.evaluate(() => {
      const movie = document.querySelector('#movie_player');
      const data = typeof movie?.getVideoData === 'function' ? movie.getVideoData() : null;
      const url = typeof movie?.getVideoUrl === 'function' ? movie.getVideoUrl() : null;
      const initial = window.ytInitialPlayerResponse?.videoDetails;
      return {dataId: data?.video_id, url, initialId: initial?.videoId,
        title: data?.title ?? initial?.title, author: data?.author ?? initial?.author};
    });
    let urlId;
    if (identity.url) {
      try { urlId = new URL(identity.url).searchParams.get('v'); } catch { /* An unavailable player URL is not identity evidence. */ }
    }
    const ids = [identity.dataId, identity.initialId, urlId].filter(Boolean);
    assert.ok(ids.every(id => id === candidate.id), 'The official player reports another video ID.');
    if (ids.length && !current.adShowing && current.ready >= 2 && current.width > 0 && current.height > 0 && current.time >= 1.5 && !current.paused) {
      result.player = {videoId: candidate.id, identitySources: {
        playerData: identity.dataId === candidate.id,
        playerUrl: urlId === candidate.id,
        initialResponse: identity.initialId === candidate.id,
      }, title: identity.title, author: identity.author};
      result.start = current;
      break;
    }
    await page.waitForTimeout(500);
  }
  assert.ok(result.start, 'The exact player ID did not decode and advance beyond 1.5 seconds.');
  await page.screenshot({path: `${out}/${candidate.id}-${prefix}-start.png`, animations: 'disabled'});
  while (Date.now() < deadline) {
    const current = await state();
    if (!current.adShowing && current.time >= result.start.time + 2 && !current.paused) {
      result.progress = current;
      break;
    }
    await page.waitForTimeout(500);
  }
  assert.ok(result.progress, 'The exact video did not advance by two more seconds.');
  await page.screenshot({path: `${out}/${candidate.id}-${prefix}-progress.png`, animations: 'disabled'});
  if (prefix === 'watch' && Number.isFinite(result.start.duration) && result.start.duration > 15) {
    for (const [label, fraction] of [['middle', 0.5], ['late', 0.85]]) {
      const target = Math.min(result.start.duration - 3, result.start.duration * fraction);
      await video.evaluate((element, seconds) => { element.currentTime = seconds; }, target);
      const seekDeadline = Date.now() + 20000;
      let sampled;
      while (Date.now() < seekDeadline) {
        const current = await state();
        if (!current.adShowing && current.ready >= 2 && current.width > 0
          && current.time >= target + 0.5 && !current.paused) {
          sampled = current;
          break;
        }
        await page.waitForTimeout(500);
      }
      assert.ok(sampled, `The ${label} source sample did not decode and advance after seeking.`);
      result[label] = sampled;
      await page.screenshot({path: `${out}/${candidate.id}-${prefix}-${label}.png`, animations: 'disabled'});
    }
  }
  return result;
}

const server = createServer((request, response) => {
  const id = new URL(request.url ?? '/', 'http://127.0.0.1').searchParams.get('id');
  if (!candidates.some(candidate => candidate.id === id)) {
    response.writeHead(404).end();
    return;
  }
  const embed = `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  response.writeHead(200, {'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store', 'referrer-policy': 'strict-origin-when-cross-origin'});
  response.end(`<html><body style="margin:0;background:#202428"><iframe title="Exact creator video" src="${embed}" style="border:0;width:100vw;height:100vh" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" referrerpolicy="strict-origin-when-cross-origin"></iframe></body></html>`);
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const localPage = `http://127.0.0.1:${server.address().port}/`;
let browser;
try {
  browser = await chromium.launch({channel: 'chrome'});
  let consecutiveUnverified = 0;
  for (const candidate of candidates) {
    if (consecutiveUnverified >= 2) {
      review.candidates.push({id: candidate.id, result: 'skipped_after_two_unverified', visualVerdict: 'unqualified'});
      save();
      continue;
    }
    const context = await browser.newContext({viewport: {width: 1280, height: 850}, serviceWorkers: 'block'});
    const page = await context.newPage();
    const receipt = {
      creator: candidate.creator, creatorSource: candidate.source,
      watchUrl: watchUrl(candidate.id), intendedDemoFit: candidate.fit,
      watch: {result: 'failed'}, embed: {result: 'failed'},
      result: 'failed', visualVerdict: 'unqualified',
    };
    review.candidates.push(receipt);
    save();
    try {
      try {
        await page.goto(receipt.watchUrl, {waitUntil: 'domcontentloaded', timeout: 45000});
        const reject = page.getByRole('button', {name: /reject all/i}).first();
        if (await reject.isVisible().catch(() => false)) await reject.click({timeout: 5000});
        Object.assign(receipt.watch, await playExactVideo(page, page, candidate, 'watch', receipt.watch), {result: 'decoded_playback'});
      } catch (error) {
        receipt.watch.failure = String(error).split('\n')[0].slice(0, 400);
        receipt.watch.visibleText = (await page.locator('body').innerText().catch(() => '')).slice(0, 500);
        await page.screenshot({path: `${out}/${candidate.id}-watch-failure.png`, animations: 'disabled'}).catch(() => {});
      }
      save();
      try {
        await page.goto(`${localPage}?id=${candidate.id}`, {waitUntil: 'domcontentloaded', timeout: 15000});
        const deadline = Date.now() + 30000;
        let frame;
        while (Date.now() < deadline) {
          frame = page.frames().find(item => {
            try {
              const url = new URL(item.url());
              return ['www.youtube-nocookie.com', 'www.youtube.com'].includes(url.hostname)
                && url.pathname === `/embed/${candidate.id}`;
            } catch { return false; }
          });
          if (frame) break;
          await page.waitForTimeout(500);
        }
        assert.ok(frame, 'The official no-cookie embed did not load the exact ID.');
        receipt.embed.playerUrl = frame.url();
        Object.assign(receipt.embed, await playExactVideo(page, frame, candidate, 'embed', receipt.embed), {result: 'decoded_playback'});
        receipt.result = 'decoded_playback';
        receipt.visualVerdict = 'pending human frame review';
      } catch (error) {
        receipt.embed.failure = String(error).split('\n')[0].slice(0, 400);
        receipt.embed.visibleText = (await page.locator('body').innerText().catch(() => '')).slice(0, 500);
        receipt.embed.frameText = (await Promise.all(page.frames().filter(item => item.url().includes(`/embed/${candidate.id}`))
          .map(item => item.locator('body').innerText().catch(() => '')))).join(' ').slice(0, 500);
        await page.screenshot({path: `${out}/${candidate.id}-embed-failure.png`, animations: 'disabled'}).catch(() => {});
      }
    } finally {
      if (receipt.watch.result !== 'decoded_playback' && receipt.embed.result !== 'decoded_playback') consecutiveUnverified++;
      else consecutiveUnverified = 0;
      save();
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  save();
}
assert.ok(review.candidates.every(candidate => candidate.embed.result === 'decoded_playback'),
  'At least one retained official no-cookie embed lacks decoded playback; inspect retained attempts.');
