import { incomingSuqpagePath } from '../src/incoming-link';

let marketIntent = 0;
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  const target = incomingSuqpagePath(path);
  if (target === '/' || target.startsWith('/?')) {
    const url = new URL(target, 'https://suqpage.com');
    url.searchParams.set('_intent', String(++marketIntent));
    return `/${url.search}`;
  }
  return target;
}
