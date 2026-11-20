// Read the same public endpoint as the shop client. No database or deployment credentials.
import type {Shop} from '../packages/contracts/src';
import {demoProcessVideoFor} from '../lib/demo-process-videos';
import {SEEDED_MARKETPLACE_PROFILES} from '../lib/marketplace-seed';
import {normalizeProductVideoUrl} from '../lib/video/product-video';

async function main() {
  const origin = new URL(process.argv[2] ?? 'https://africmade.com');
  if (origin.origin !== 'https://africmade.com' && !['127.0.0.1', 'localhost'].includes(origin.hostname)) {
    throw new Error('Choose the published AfricMade origin or a local preview.');
  }
  const handles = Object.keys(SEEDED_MARKETPLACE_PROFILES).filter(handle => demoProcessVideoFor(handle).ref);
  if (handles.length !== 66) throw new Error('The reviewed 66-showroom inventory changed.');
  let stories = 0, products = 0, passed = 0;
  async function check(handle: string) {
    const url = new URL('/api/mobile/v1/shops/' + encodeURIComponent(handle), origin);
    const response = await fetch(url, {redirect: 'error', signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const shop: Shop = await response.json();
    if (shop.handle !== handle || !shop.isDemo) throw new Error('Demo identity mismatch');
    const expected = demoProcessVideoFor(handle).ref;
    const storyMatches = normalizeProductVideoUrl(shop.videoUrl).managedRef === expected;
    const matchingProducts = shop.products.filter(product => {
      const videos = product.media.filter(media => media.kind === 'video');
      return videos.length === 1 && videos[0].ref === expected;
    }).length;
    if (storyMatches) stories++;
    products += matchingProducts;
    if (storyMatches && shop.products.length === 4 && new Set(shop.products.map(p => p.id)).size === 4 && matchingProducts === 4) passed++;
    else console.error(handle, 'story matches:', storyMatches, 'products matching:', matchingProducts, 'of', shop.products.length);
  }
  for (let i = 0; i < handles.length; i += 3) {
    await Promise.all(handles.slice(i, i + 3).map(handle => check(handle).catch(error => console.error(handle, error.message))));
  }
  console.log(origin.origin, 'matched selected social video — stories', stories + '/66, products', products + '/264, complete showrooms', passed + '/66');
  if (passed !== handles.length) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
