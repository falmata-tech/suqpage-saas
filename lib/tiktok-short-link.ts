import { normalizeProductVideoUrl } from './video/product-video';

export interface TikTokRedirectResponse { status: number; location: string | null }
export type TikTokRedirectPort = (url: string, signal: AbortSignal) => Promise<TikTokRedirectResponse>;
const hosts = new Set(['www.tiktok.com','tiktok.com','vm.tiktok.com','vt.tiktok.com']);
function allowed(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !hosts.has(url.hostname)) throw new Error('Use a supported video link.');
  return url;
}
const fetchRedirect: TikTokRedirectPort = async (url,signal) => {
  const response = await fetch(url,{redirect:'manual',signal,headers:{Accept:'text/html'}});
  // Only status/Location are used; do not read provider markup or video content.
  await response.body?.cancel();
  return {status:response.status,location:response.headers.get('location')};
};

export async function resolveProductVideoUrl(input: unknown, port: TikTokRedirectPort = fetchRedirect): Promise<string> {
  try { return normalizeProductVideoUrl(input).managedRef; } catch { /* A bounded TikTok share link may still be valid. */ }
  if (typeof input !== 'string' || input.length > 500) throw new Error('Use a supported video link.');
  let url = allowed(input.trim());
  if (!(['vm.tiktok.com','vt.tiktok.com'].includes(url.hostname) ? /^\/[A-Za-z0-9]+\/?$/ : /^\/t\/[A-Za-z0-9]+\/?$/).test(url.pathname)) throw new Error('Use a supported video link.');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Use a supported video link.'));},5000);});
  try {
    return await Promise.race([(async()=>{
      for (let count=0;count<4;count++) {
        const response = await port(url.href,controller.signal);
        if (![301,302,303,307,308].includes(response.status) || !response.location) throw new Error('Use a supported video link.');
        url = allowed(new URL(response.location,url).href);
        try { return normalizeProductVideoUrl(url.href).managedRef; } catch { /* Follow only another recognized short link. */ }
        if (!(['vm.tiktok.com','vt.tiktok.com'].includes(url.hostname) ? /^\/[A-Za-z0-9]+\/?$/ : /^\/t\/[A-Za-z0-9]+\/?$/).test(url.pathname)) throw new Error('Use a supported video link.');
      }
      throw new Error('Use a supported video link.');
    })(),timeout]);
  } finally { if(timer)clearTimeout(timer);controller.abort(); }
}
