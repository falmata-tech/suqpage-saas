import React,{useEffect,useMemo,useRef} from 'react';
import {socialPlayerHtml,socialPlayerEvent} from './social-player';
import type {PlayerProps} from './youtube-player';

export default function SocialVideoFrame({id,height,onEvent,videoRef}:PlayerProps){
  const frame=useRef<HTMLIFrameElement>(null),callback=useRef(onEvent);callback.current=onEvent;
  const origin=window.location.origin,html=useMemo(()=>socialPlayerHtml(videoRef||`tiktok:${id}`,origin),[id,videoRef,origin]);
  useEffect(()=>{function message(event:MessageEvent){if(event.source!==frame.current?.contentWindow||event.origin!==origin)return;const value=socialPlayerEvent(event.data);if(value)callback.current(value);}window.addEventListener('message',message);return()=>window.removeEventListener('message',message);},[origin]);
  return <iframe ref={frame} title={videoRef?.startsWith("facebook:")?"Facebook video":videoRef?.startsWith("instagram:")?"Instagram video":"TikTok video"} srcDoc={html} sandbox="allow-scripts allow-same-origin allow-presentation" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={()=>callback.current('error')} style={{display:'block',width:'100%',height,border:0,background:'#202428'}}/>;
}
