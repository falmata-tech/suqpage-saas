'use client';
import {useEffect,useRef,useState} from 'react';
import {productVideoEmbedUrl,productVideo,tikTokPlayerEvent} from '@/lib/video/product-video';
import {useUiText} from '@/lib/i18n/ui';
import LoadingBar from './LoadingBar';

export default function SocialVideoFrame({video,title,poster}:{video:string;title:string;poster?:string}) {
  const t=useUiText(),frame=useRef<HTMLIFrameElement>(null);
  const provider=productVideo(video).provider;
  if(provider==='demo')throw new Error('Use the first-party demo player.');
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
  return <div style={{position:'relative',height:'100%',width:'100%',containerType:'size',background:'#202428',overflow:'hidden',display:'grid',placeItems:'center'}}>
    {poster&&(state==='loading'||provider==='tiktok'||provider==='instagram')&&<img src={poster} alt="" aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:state==='loading'?undefined:'blur(18px)',opacity:state==='loading'?1:.45,transform:state==='loading'?undefined:'scale(1.1)'}}/>}
    <div style={(provider==='tiktok'||provider==='instagram')?{position:'relative',width:'min(100%, 56.25cqh)',aspectRatio:'9/16',zIndex:1}:{position:'relative',height:'100%',width:'100%',zIndex:1}}>
    <iframe key={video+attempt} ref={frame} src={productVideoEmbedUrl(video)} title={title} style={{display:'block',width:'100%',height:'100%',border:0,visibility:state==='loading'&&poster?'hidden':undefined}} allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="strict-origin-when-cross-origin" onLoad={()=>setState(current=>current==='error'?current:'ready')} onError={()=>setState('error')}/></div>
    {state==='loading'&&<div style={{position:'absolute',top:4,left:8,right:8,pointerEvents:'none'}}><LoadingBar label={t('Loading video…')}/></div>}
  </div>;
}
