// Read the same public endpoint as the shop client. No database or deployment credentials.
import type {Shop} from '../packages/contracts/src';
import {demoProcessVideoFor} from '../lib/demo-process-videos';
import {PUBLISHED_DEMO_VIDEO_TARGETS} from '../lib/published-demo-video-targets';
import {SEEDED_MARKETPLACE_PROFILES} from '../lib/marketplace-seed';
import {normalizeProductVideoUrl} from '../lib/video/product-video';

async function main() {
  const origin = new URL(process.argv[2] ?? 'https://africmade.com');
  if (origin.origin !== 'https://africmade.com' && !['127.0.0.1', 'localhost'].includes(origin.hostname)) {
    throw new Error('Choose the published AfricMade origin or a local preview.');
  }
  type Target = {handle: string; ref: string; id?: number; products?: readonly (readonly [number, string])[]};
  const targets: Target[] = origin.origin === 'https://africmade.com'
    ? PUBLISHED_DEMO_VIDEO_TARGETS.map(([id,handle,ref,products]) => ({id, handle, ref, products}))
    : Object.keys(SEEDED_MARKETPLACE_PROFILES).flatMap(handle => {
       const {ref} = demoProcessVideoFor(handle);
       return ref ? [{handle, ref}] : [];
     });
  if (targets.length !== 66) throw new Error('The reviewed 66-showroom inventory changed.');
  let stories = 0, products = 0, passed = 0;
  async function check({handle, ref: expected, id, products: identities}: Target) {
    const url = new URL('/api/mobile/v1/shops/' + encodeURIComponent(handle), origin);
    const response = await fetch(url, {redirect: 'error', signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const shop: Shop = await response.json();
    if (shop.handle !== handle || !shop.isDemo || (id && shop.id !== id) ||
        (identities && identities.some(([productId, name]) => !shop.products.some(item => item.id === productId && item.name === name)))) {
      throw new Error('Demo identity mismatch');
    }
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
  for (let i = 0; i < targets.length; i += 3) {
    await Promise.all(targets.slice(i, i + 3).map(target => check(target).catch(error => console.error(target.handle, error.message))));
  }
  console.log(origin.origin, 'matched selected social video — stories', stories + '/66, products', products + '/264, complete showrooms', passed + '/66');
  if (passed !== targets.length) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
