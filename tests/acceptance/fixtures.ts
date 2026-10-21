import {test as base, expect, type BrowserContext} from '@playwright/test';
import {createRequire} from 'node:module';
import path from 'node:path';

type MapTileFixture = {
  fixtureId: string;
  servedCount(): number;
  externalCount(): number;
  assertNoExternalRequests(): void;
};
const {installMapTileFixture} = createRequire(path.resolve('package.json'))('./scripts/testing/map-tile-fixture.mjs') as {
  installMapTileFixture(context: BrowserContext): Promise<MapTileFixture>;
};

// S139: every direct browser test receives synthetic tiles before navigation.
// Override page rather than an automatic context fixture so request-only release
// smoke tests keep their existing browser-free execution contract.
export const test = base.extend({
  serviceWorkers: 'block',
  page: async ({page, context}, use, testInfo) => {
    const tiles = await installMapTileFixture(context);
    try {
      await use(page);
    } finally {
      await testInfo.attach('synthetic-map-tiles', {
        body: Buffer.from(JSON.stringify({
          fixtureId: tiles.fixtureId,
          fulfilled: tiles.servedCount(),
          uncontrolledRequests: tiles.externalCount(),
          providerAvailabilityTested: false,
        })),
        contentType: 'application/json',
      });
      tiles.assertNoExternalRequests();
    }
  },
});

export {expect};
