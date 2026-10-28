import { createMarketNavigationIntent, incomingAfricMadePath } from '../src/incoming-link';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  const target = incomingAfricMadePath(path);
  if (target === '/' || target.startsWith('/?')) {
    const url = new URL(target, 'https://africmade.com');
    url.searchParams.set('_intent', createMarketNavigationIntent());
    return `/${url.search}`;
  }
  return target;
}
