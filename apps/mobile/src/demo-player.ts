import { productVideo, productVideoWatchUrl } from "../../../lib/video/product-video";
import type { PlayerEvent } from "./youtube-player";

/** The WebView may load only its packaged first-party MP4, never a merchant URL. */
export function demoPlayerNavigation(input: string, origin: string, id: string): boolean {
  if (input === "about:blank") return true;
  try {
    const url = new URL(input);
    const base = new URL(origin);
    return url.origin === base.origin && !url.username && !url.password &&
      !url.search && !url.hash &&
      (url.pathname === "/" || url.pathname === productVideoWatchUrl(`demo:${id}`));
  } catch { return false; }
}

export function demoPlayerEvent(raw: unknown): PlayerEvent | null {
  if (typeof raw !== "string" || raw.length > 160) return null;
  try {
    const message: unknown = JSON.parse(raw);
    if (!message || typeof message !== "object") return null;
    const value = message as Record<string, unknown>;
    return value.source === "africmade-demo-video" && (value.event === "ready" || value.event === "error")
      ? value.event : null;
  } catch { return null; }
}

export function demoPlayerHtml(id: string, origin: string): string {
  const video = productVideo(`demo:${id}`);
  if (video.provider !== "demo") throw new Error("Invalid demo video.");
  const base = new URL(origin);
  if (!["http:", "https:"].includes(base.protocol) || base.origin !== origin || base.username || base.password)
    throw new Error("Invalid player origin.");
  const source = JSON.stringify(origin + productVideoWatchUrl(video.managedRef)).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;background:#202428;overflow:hidden}video{width:100%;height:100%;object-fit:contain}</style></head><body><video id="player" controls autoplay playsinline preload="metadata"></video><script>
    const player=document.getElementById('player');
    function send(event){window.ReactNativeWebView?.postMessage(JSON.stringify({source:'africmade-demo-video',event}));}
    player.addEventListener('canplay',()=>send('ready'));
    player.addEventListener('playing',()=>send('ready'));
    player.addEventListener('error',()=>send('error'));
    player.src=${source};
  </script></body></html>`;
}
