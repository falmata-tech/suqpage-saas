import { controlledYouTubeWatchUrl, normalizeControlledYouTubeUrl, privacyEnhancedYouTubeEmbedUrl } from '../youtube-provider';

export type ProductVideo = { provider: 'youtube' | 'tiktok' | 'facebook' | 'instagram'; providerId: string; managedRef: string };
const tikTokId = /^[1-9]\d{16,19}$/;

export function productVideo(ref: string): ProductVideo {
  if (/^youtube:[A-Za-z0-9_-]{11}$/.test(ref)) return {provider:'youtube',providerId:ref.slice(8),managedRef:ref};
  if (ref.startsWith('tiktok:') && tikTokId.test(ref.slice(7))) return {provider:'tiktok',providerId:ref.slice(7),managedRef:ref};
  if (/^facebook:[1-9]\d{4,24}$/.test(ref)) return {provider:'facebook',providerId:ref.slice(9),managedRef:ref};
  if (/^instagram:[A-Za-z0-9_-]{5,20}$/.test(ref))return {provider:'instagram',providerId:ref.slice(10),managedRef:ref};
  throw new Error('Use a supported video link.');
}

export function normalizeProductVideoUrl(input: unknown): ProductVideo {
  if (typeof input !== 'string' || input.length > 500) throw new Error('Use a supported video link.');
  const url = new URL(input.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Use a supported video link.');
  if (['www.tiktok.com','tiktok.com'].includes(url.hostname)) {
    const match = /^(?:\/@[A-Za-z0-9_.]{1,24}\/video\/|\/player\/v1\/)([1-9]\d{16,19})\/?$/.exec(url.pathname);
    if (!match) throw new Error('Use a supported video link.');
    return productVideo(`tiktok:${match[1]}`);
  }
  if(['www.facebook.com','facebook.com','m.facebook.com'].includes(url.hostname)) {
    const match=/^\/(?:[^/]+\/videos\/|reel\/)([1-9]\d{4,24})\/?$/.exec(url.pathname);
    const id=match?.[1]||((url.pathname==='/watch/'||url.pathname==='/watch'||url.pathname==='/video.php')&&url.searchParams.getAll('v').length===1?url.searchParams.get('v'):null);
    if(!id||!/^[1-9]\d{4,24}$/.test(id))throw new Error('Use a supported video link.');
    return productVideo(`facebook:${id}`);
  }
  if(['www.instagram.com','instagram.com'].includes(url.hostname)) {
    const match=/^\/reel\/([A-Za-z0-9_-]{5,20})\/?$/.exec(url.pathname);
    if(!match)throw new Error('Use a supported video link.');return productVideo(`instagram:${match[1]}`);
  }
  return normalizeControlledYouTubeUrl(input);
}

export function productVideoEmbedUrl(ref: string): string {
  const video = productVideo(ref);
  if(video.provider==='instagram')return `https://www.instagram.com/reel/${video.providerId}/embed/`;
  if(video.provider==='facebook')return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(productVideoWatchUrl(ref))}&show_text=false&autoplay=false`;
  return video.provider === 'youtube' ? privacyEnhancedYouTubeEmbedUrl(ref)
    : `https://www.tiktok.com/player/v1/${video.providerId}?autoplay=0&controls=1&rel=0`;
}

export function productVideoWatchUrl(ref: string): string {
  const video = productVideo(ref);
  if(video.provider==='instagram')return `https://www.instagram.com/reel/${video.providerId}/`;
  if(video.provider==='facebook')return `https://www.facebook.com/watch/?v=${video.providerId}`;
  return video.provider === 'youtube' ? controlledYouTubeWatchUrl(ref)
    : `https://www.tiktok.com/player/v1/${video.providerId}`;
}

export type TikTokPlayerEvent = 'ready' | 'error';
export function tikTokPlayerEvent(input: unknown): TikTokPlayerEvent | null {
  if (!input || typeof input !== 'object') return null;
  const message = input as Record<string, unknown>;
  if (message['x-tiktok-player'] !== true) return null;
  if (message.type === 'onPlayerReady') return 'ready';
  if(message.type==='onStateChange'&&typeof message.value==='number'&&[0,1,2].includes(message.value))return 'ready';
  if(message.type==='onPlayerError'&&message.value&&typeof message.value==='object'&&(message.value as Record<string,unknown>).errorCode===3002)return 'ready';
  if (message.type === 'onPlayerError' || message.type === 'onError') return 'error';
  return null;
}
