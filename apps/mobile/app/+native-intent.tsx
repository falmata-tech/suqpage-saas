import { createMarketNavigationIntent, incomingSuqpagePath } from '../src/incoming-link';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  const target = incomingSuqpagePath(path);
  if (target === '/' || target.startsWith('/?')) {
    const url = new URL(target, 'https://suqpage.com');
    url.searchParams.set('_intent', createMarketNavigationIntent());
    return `/${url.search}`;
  }
  return target;
}
