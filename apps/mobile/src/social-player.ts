import {productVideoEmbedUrl,productVideo} from '../../../lib/video/product-video';
import {apiOrigin} from '@suqpage/contracts';
import type {PlayerEvent} from './youtube-player';

export function socialPlayerNavigation(input:string,origin:string):boolean {
  if(input==='about:blank')return true;
  try {
    if(apiOrigin(origin)!==origin)return false;
    const url=new URL(input);
    if(url.origin===origin&&url.pathname==='/'&&!url.username&&!url.password&&!url.search&&!url.hash)return true;
    return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&
      ((url.origin==='https://www.instagram.com'&&/^\/(?:reel|p)\/[A-Za-z0-9_-]{5,20}\/embed\/?$/.test(url.pathname))||(url.origin==='https://www.tiktok.com'&&/^\/player\/v1\/[1-9]\d{16,19}$/.test(url.pathname))||(url.origin==='https://www.facebook.com'&&url.pathname==='/plugins/video.php'&&(/^https:\/\/www.facebook.com\/watch\/\?v=[1-9]\d{4,24}$/.test(url.searchParams.get('href')||''))));
  }catch{return false;}
}
export function socialPlayerEvent(raw:unknown):PlayerEvent|null {
  if(typeof raw!=='string'||raw.length>160)return null;
  try {const message:unknown=JSON.parse(raw);if(!message||typeof message!=='object')return null;const value=message as Record<string,unknown>;return value.source==='suqpage-social-video'&&(value.event==='ready'||value.event==='error')?value.event:null;}catch{return null;}
}
export function socialPlayerHtml(ref:string,origin:string):string {
  const video=productVideo(ref);if(video.provider==='youtube')throw new Error('Invalid social video');
  const base=new URL(origin);
  if(!['http:','https:'].includes(base.protocol)||base.origin!==origin||base.username||base.password)throw new Error('Invalid player origin');
  const config=JSON.stringify({url:productVideoEmbedUrl(ref),origin,providerOrigin:video.provider==='facebook'?'https://www.facebook.com':video.provider==='instagram'?'https://www.instagram.com':'https://www.tiktok.com'}).replace(/</g,'\\u003c');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;height:100%;width:100%;background:#202428;overflow:hidden}iframe{height:100%;width:100%;border:0}</style></head><body><iframe id="player" title="${video.provider==='facebook'?'Facebook':video.provider==='instagram'?'Instagram':'TikTok'} video" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe><script>
  const config=${config},frame=document.getElementById('player');
  function send(event){const data=JSON.stringify({source:'suqpage-social-video',event});if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(data);}else{window.parent.postMessage(data,config.origin);}}
  window.addEventListener('message',function(e){if(e.origin!==config.providerOrigin||e.source!==frame.contentWindow||!e.data||e.data['x-tiktok-player']!==true)return;if(e.data.type==='onPlayerReady'||(e.data.type==='onStateChange'&&[0,1,2].includes(e.data.value)))send('ready');if(e.data.type==='onPlayerError'&&e.data.value&&e.data.value.errorCode===3002)send('ready');else if(e.data.type==='onPlayerError'||e.data.type==='onError')send('error');});
  frame.onload=function(){send('ready');};frame.onerror=function(){send('error');};frame.src=config.url;
  </script></body></html>`;
}
