import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { installMapTileFixture, MAP_TILE_FIXTURE_ID } from './testing/map-tile-fixture.mjs';

class FixtureContext extends EventEmitter {
  routePattern = null;
  routeHandler = null;
  workers = [];
  serviceWorkers() { return this.workers; }
  async route(pattern, handler) { this.routePattern = pattern; this.routeHandler = handler; }
  async request(url, { bypass = false, fail = false } = {}) {
    const request = { url: () => url };
    this.emit('request', request);
    let body, aborted = false;
    if (!bypass && this.routePattern.test(url)) {
      await this.routeHandler({
        request: () => request,
        fulfill: async input => {
          if (fail) throw new Error('closed page');
          body = input;
          this.emit('response', { request: () => request, headers: () => input.headers });
          this.emit('requestfinished', request);
        },
        abort: async () => { aborted = true; this.emit('requestfailed', request); },
      });
    } else {
      // A later catch-all route or service worker must not silently bypass the fixture.
      this.emit('response', { request: () => request, headers: () => ({}) });
      this.emit('requestfinished', request);
    }
    return { body, aborted };
  }
}

test('public tile requests are fulfilled locally, with CORS and no request continuation', async () => {
  const context = new FixtureContext(), tiles = await installMapTileFixture(context);
  for (const url of ['https://tile.openstreetmap.org/18/12/34.png', 'https://a.tile.openstreetmap.org/1/0/0.png']) {
    const { body, aborted } = await context.request(url);
    assert.equal(body.status, 200);
    assert.equal(body.contentType, 'image/svg+xml');
    assert.equal(body.headers['access-control-allow-origin'], '*');
    assert.equal(body.headers['cache-control'], 'public, max-age=604800');
    assert.equal(body.headers['x-suqpage-map-tile-fixture'], MAP_TILE_FIXTURE_ID);
    assert.match(body.body, /^<svg/);
    assert.equal(aborted, false);
  }
  await context.request('http://localhost:3102/api/discovery/businesses');
  assert.equal(tiles.servedCount(), 2);
  assert.equal(tiles.externalCount(), 0);
  tiles.assertNoExternalRequests();
});

test('a tile response bypassing the fixture fails the guard without reporting false fixture coverage', async () => {
  const context = new FixtureContext(), tiles = await installMapTileFixture(context);
  await context.request('https://tile.openstreetmap.org/18/12/34.png', { bypass: true });
  assert.equal(tiles.servedCount(), 0);
  assert.equal(tiles.externalCount(), 1);
  assert.throws(() => tiles.assertNoExternalRequests(), /uncontrolled public tile requests/);
});

test('fixture fulfillment failure aborts rather than reaching the provider', async () => {
  const context = new FixtureContext(), tiles = await installMapTileFixture(context);
  const { aborted } = await context.request('https://tile.openstreetmap.org/18/12/34.png', { fail: true });
  assert.equal(aborted, true);
  assert.equal(tiles.servedCount(), 0);
  assert.throws(() => tiles.assertNoExternalRequests(), /fulfillment failed/);
});

test('an already running service worker prevents an unsupported fixture guarantee', async () => {
  const context = new FixtureContext(); context.workers.push({});
  await assert.rejects(() => installMapTileFixture(context), /fresh context with serviceWorkers: block/);
  assert.equal(context.routeHandler, null);
});

test('legacy actual-tiles automation flags refuse before browser launch', () => {
  for (const path of ['scripts/capture-map-marker-contrast.mjs', 'scripts/capture-purchase-chat-and-products.mjs']) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', path, '--actual-tiles'], { encoding: 'utf8', timeout: 10_000 });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Automated reviews must use local tile fixtures/);
    assert.doesNotMatch(result.stderr, /browserType\.launch|Executable doesn't exist|Target page, context or browser has been closed/);
  }
});
