import assert from 'node:assert/strict';

export const MAP_TILE_FIXTURE_ID = 'suqpage-synthetic-grid-v1';
const fixtureHeader = 'x-suqpage-map-tile-fixture';
const tilePattern = /^https?:\/\/(?:[a-z0-9-]+\.)?tile\.openstreetmap\.org(?::\d+)?\//i;
const tile = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#f5f2e8"/><path d="M0 64H256M0 192H256M64 0V256M192 0V256" stroke="#dedbd2" stroke-width="2"/></svg>';

/** Install before navigation, after other context routes. Never contacts a tile provider. */
export async function installMapTileFixture(context) {
  assert.equal(context.serviceWorkers().length, 0, 'Install map fixtures in a fresh context with serviceWorkers: block.');
  const seen = new Set(), intercepted = new Set(), uncontrolled = new Set();
  let served = 0, failures = 0;
  const isTile = request => tilePattern.test(request.url());
  context.on('request', request => { if (isTile(request)) seen.add(request); });
  context.on('response', response => {
    if (isTile(response.request()) && response.headers()[fixtureHeader] !== MAP_TILE_FIXTURE_ID) {
      uncontrolled.add(response.request());
    }
  });
  const finished = request => {
    if (isTile(request) && !intercepted.has(request)) uncontrolled.add(request);
  };
  context.on('requestfinished', finished);
  context.on('requestfailed', finished);
  await context.route(tilePattern, async route => {
    const request = route.request();
    seen.add(request);
    intercepted.add(request);
    try {
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        headers: { [fixtureHeader]: MAP_TILE_FIXTURE_ID, 'cache-control': 'public, max-age=604800', 'access-control-allow-origin': '*' },
        body: tile,
      });
      served += 1;
    } catch {
      failures += 1;
      // A fixture failure must never fall through to the public provider.
      try { await route.abort(); } catch { /* A closing page may already have cancelled it. */ }
    }
  });
  const externalCount = () => new Set([...uncontrolled, ...[...seen].filter(request => !intercepted.has(request))]).size;
  return Object.freeze({
    fixtureId: MAP_TILE_FIXTURE_ID,
    servedCount: () => served,
    externalCount,
    assertNoExternalRequests() {
      assert.equal(externalCount(), 0, 'Map review received uncontrolled public tile requests.');
      assert.equal(failures, 0, 'Map tile fixture fulfillment failed; no public fallback was attempted.');
    },
  });
}
