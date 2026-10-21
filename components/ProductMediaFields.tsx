'use client';
import {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Trash2, Play} from 'lucide-react';
import type {Product} from '@/lib/types';
import {productMedia, MAX_PRODUCT_IMAGES, MAX_PRODUCT_UPLOAD_BYTES} from '@/lib/product-media';

import {productVideoWatchUrl} from '@/lib/video/product-video';
import {useUiText} from '@/lib/i18n/ui';

type Entry = {id: string; kind:'image'; ref:string} | {id:string; kind:'upload'; file:File; preview:string} | {id:string; kind:'video'; url:string};
export default function ProductMediaFields({product,exampleVideoRef,staffMode=false,onFiles,onCover}:{product?:Product;exampleVideoRef?:string;staffMode?:boolean;onFiles:(files:File[])=>void;onCover:(value:string)=>void}) {
  const t=useUiText();
  const [entries,setEntries]=useState<Entry[]>(()=>product?productMedia(product).map((item,index)=>item.kind==='image'?{kind:"image",ref:item.ref,id:String(index)}:{kind:'video',url:productVideoWatchUrl(item.ref),id:String(index)}):exampleVideoRef?[{id:'example',kind:'video',url:productVideoWatchUrl(exampleVideoRef)}]:[]);
  const [error,setError]=useState('');
  const [videoInput,setVideoInput]=useState('');
  const live=useRef(entries);live.current=entries;
  useEffect(()=>()=>{for(const item of live.current)if(item.kind==='upload')URL.revokeObjectURL(item.preview);},[]);
  function update(next:Entry[]) {
    for(const item of entries)if(item.kind==='upload'&&!next.some(entry=>entry.id===item.id))URL.revokeObjectURL(item.preview);
    setEntries(next);setError('');onFiles(next.flatMap(item=>item.kind==='upload'?[item.file]:[]));
    const cover=next.find(item=>item.kind!=='video');onCover(cover?.kind==='image'?cover.ref:cover?.kind==='upload'?cover.preview:'');
  }
  function move(index:number,direction:number) {const next=[...entries];[next[index],next[index+direction]]=[next[index+direction],next[index]];update(next);}
  let uploadIndex=0;
  const order=entries.map(item=>item.kind==='upload'?{kind:'upload',index:uploadIndex++}:item.kind==='image'?{kind:'image',ref:item.ref}:{kind:'video',url:item.url});
  return <div className="field full product-media-editor">
    <label htmlFor="product-images">{t('Photos and videos')}</label>
    <input type="hidden" name="mediaOrder" value={JSON.stringify(order)} />
    <div className="product-media-entries">
      {entries.map((item,index)=><div className="product-media-entry" key={item.id}>
        {item.kind==='video'?<label className="product-media-video"><span><Play size={16} aria-hidden="true" />{t('Video')}</span><input type="url" required maxLength={500} value={item.url} aria-label={t('Video link {number}',{number:index+1})} onChange={event=>update(entries.map(entry=>entry.id===item.id?{...item,url:event.target.value}:entry))} /></label>
          : <img src={item.kind==='image'?item.ref:item.preview} alt={t('Photo {number}',{number:index+1})} />}
        <div className="product-media-entry-actions">
          <button type="button" disabled={index===0} onClick={()=>move(index,-1)} aria-label={t('Move media left')}><ArrowLeft size={18} aria-hidden="true" /></button>
          <button type="button" disabled={index===entries.length-1} onClick={()=>move(index,1)} aria-label={t('Move media right')}><ArrowRight size={18} aria-hidden="true" /></button>
          <button type="button" onClick={()=>update(entries.filter(entry=>entry.id!==item.id))} aria-label={t('Remove media {number}',{number:index+1})}><Trash2 size={18} aria-hidden="true" /></button>
        </div>
      </div>)}
    </div>
    <label htmlFor="product-images">{t('Add photos')}</label>
    <input id="product-images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event=>{
      const files=Array.from(event.target.files||[]);event.target.value='';
      if(entries.filter(item=>item.kind!=='video').length+files.length>MAX_PRODUCT_IMAGES){setError('Use up to 8 photos and 4 videos.');return;}
      const bytes=entries.reduce((sum,item)=>sum+(item.kind==='upload'?item.file.size:0),0)+files.reduce((sum,file)=>sum+file.size,0);
      if(bytes>MAX_PRODUCT_UPLOAD_BYTES){setError('Choose photos totaling 5 MB or less.');return;}
      update([...entries,...files.map(file=>({id:crypto.randomUUID(),kind:'upload' as const,file,preview:URL.createObjectURL(file)}))]);
    }} />
    <small>{t('Up to 8 photos and 4 videos. Photos: 5 MB total per save.')}</small>
    <p>{t("TikTok, YouTube, Facebook videos or Instagram Reels")}</p>
    <label htmlFor="product-video-link">{t('Video link')}</label><input id="product-video-link" type="url" maxLength={500} value={videoInput} onChange={event=>setVideoInput(event.target.value)}/>
    <button type="button" className="btn secondary" disabled={!videoInput.trim()||entries.filter(item=>item.kind==='video').length>=4} onClick={()=>{update([...entries,{id:crypto.randomUUID(),kind:'video',url:videoInput.trim()}]);setVideoInput('');}}><Play size={16} aria-hidden="true"/>{t('Add video')}</button>
    {error?<p role="alert" className="error">{t(error)}</p>:null}
  </div>;
}
