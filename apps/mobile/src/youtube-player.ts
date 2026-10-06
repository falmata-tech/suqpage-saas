import {
  normalizeControlledYouTubeUrl,
  privacyEnhancedYouTubeEmbedUrl,
} from "../../../lib/youtube-provider";

export function youtubeId(ref: string): string | null {
  try {
    const managed = ref.startsWith("youtube:")
      ? ref
      : normalizeControlledYouTubeUrl(ref).managedRef;
    privacyEnhancedYouTubeEmbedUrl(managed);
    return managed.slice(8);
  } catch {
    return null;
  }
}
export type PlayerEvent = "ready" | "error";
export function playerEvent(raw: unknown): PlayerEvent | null {
  if (typeof raw !== "string" || raw.length > 160) return null;
  try {
    const event: unknown = JSON.parse(raw);
    if (!event || typeof event !== "object") return null;
    const data = event as Record<string, unknown>;
    return data.source === "suqpage-youtube" &&
      (data.event === "ready" || data.event === "error")
      ? data.event
      : null;
  } catch {
    return null;
  }
}
export function nativePlayerNavigation(url: string, origin: string): boolean {
  if (url === "about:blank") return true;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.username || u.password || u.port)
      return false;
    return (
      (u.origin === origin && u.pathname === "/") ||
      (["https://www.youtube-nocookie.com", "https://www.youtube.com"].includes(
        u.origin,
      ) &&
        /^\/embed\/[\w-]{11}$/.test(u.pathname))
    );
  } catch {
    return false;
  }
}
export function playerHtml(id: string, origin: string): string {
  if (!/^[\w-]{11}$/.test(id)) throw new Error("Invalid video");
  const u = new URL(origin);
  if (
    !["https:", "http:"].includes(u.protocol) ||
    u.origin !== origin ||
    u.username ||
    u.password
  )
    throw new Error("Invalid player origin");
  // Neither merchant HTML nor app credentials cross this boundary.
  const config = JSON.stringify({ id, origin }).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body,#player{margin:0;width:100%;height:100%;background:#000;overflow:hidden}iframe{border:0}</style></head><body><div id="player"></div><script>
  const config=${config};
  function send(event){const data=JSON.stringify({source:'suqpage-youtube',event});if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(data);}else{window.parent.postMessage(data,config.origin);}}
  window.onYouTubeIframeAPIReady=function(){new YT.Player('player',{host:'https://www.youtube-nocookie.com',videoId:config.id,width:'100%',height:'100%',playerVars:{playsinline:1,autoplay:0,controls:1,origin:config.origin,rel:0},events:{onReady:function(event){const frame=event.target.getIframe();frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');send('ready');},onError:function(){send('error');}}});};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=function(){send('error');};document.head.appendChild(script);
  </script></body></html>`;
}
export type PlayerProps = {
  id: string;
  height: number;
  onEvent: (event: PlayerEvent) => void;
};
