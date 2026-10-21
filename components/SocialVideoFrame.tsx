'use client';
import {useEffect,useRef,useState} from 'react';
import {productVideoEmbedUrl,productVideo,tikTokPlayerEvent} from '@/lib/video/product-video';
import {useUiText} from '@/lib/i18n/ui';
import LoadingBar from './LoadingBar';

export default function SocialVideoFrame({video,title,poster}:{video:string;title:string;poster?:string}) {
  const t=useUiText(),frame=useRef<HTMLIFrameElement>(null);
  const provider=productVideo(video).provider;
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading'),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    setState('loading');
    const timer=setTimeout(()=>setState(current=>current==='loading'?'error':current),20000);
    function message(event:MessageEvent){
      if(event.origin!==(provider==='facebook'?'https://www.facebook.com':provider==='instagram'?'https://www.instagram.com':'https://www.tiktok.com')||event.source!==frame.current?.contentWindow)return;
      const value=tikTokPlayerEvent(event.data);if(value)setState(current=>value==='ready'&&current==='error'?current:value);
    }
    window.addEventListener('message',message);
    return()=>{clearTimeout(timer);window.removeEventListener('message',message);};
  },[video,attempt,provider]);
  if(state==='error')return <div style={{height:'100%',display:'grid',placeContent:'center',gap:12,padding:20}}><p role="status">{t('Video unavailable')}</p><button className="btn secondary" onClick={()=>{setState('loading');setAttempt(n=>n+1);}}>{t('Try again')}</button></div>;
  return <div style={{position:'relative',height:'100%',width:'100%',background:'#202428',overflow:'hidden',display:'grid',placeItems:'center'}}>
    {(provider==='tiktok'||provider==='instagram')&&poster&&<img src={poster} alt="" aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(18px)',opacity:.45,transform:'scale(1.1)'}}/>}
    <div style={(provider==='tiktok'||provider==='instagram')?{height:'100%',aspectRatio:'9/16',maxWidth:'100%',zIndex:1}:{height:'100%',width:'100%',zIndex:1}}>
    <iframe key={video+attempt} ref={frame} src={productVideoEmbedUrl(video)} title={title} style={{display:'block',width:'100%',height:'100%',border:0}} allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="strict-origin-when-cross-origin" onLoad={()=>setState(current=>current==='error'?current:'ready')} onError={()=>setState('error')}/></div>
    {state==='loading'&&<div style={{position:'absolute',top:4,left:8,right:8,pointerEvents:'none'}}><LoadingBar label={t('Loading video…')}/></div>}
  </div>;
}
