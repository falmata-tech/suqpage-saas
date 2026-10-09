'use client';
import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,ImageOff,Play} from 'lucide-react';
import type {ProductMedia} from '@/lib/product-media';
import {productVideoEmbedUrl} from '@/lib/video/product-video';
import SocialVideoFrame from '../SocialVideoFrame';
import {useUiText} from '@/lib/i18n/ui';
import styles from './ProductPage.module.css';

export default function ProductMediaGallery({items,name}:{items:ProductMedia[];name:string}) {
  const t=useUiText();const track=useRef<HTMLDivElement>(null);const thumbs=useRef<HTMLDivElement>(null);
  const [active,setActive]=useState(0);const [playing,setPlaying]=useState<number|null>(null);const [failed,setFailed]=useState<string[]>([]);
  const [ready,setReady]=useState(false);const activeRef=useRef(active);activeRef.current=active;
  useEffect(()=>{setReady(true);const element=track.current;if(!element)return;let width=element.clientWidth;const observer=new ResizeObserver(()=>{if(element.clientWidth!==width){width=element.clientWidth;element.scrollTo({left:activeRef.current*width,behavior:'instant'});}});observer.observe(element);return()=>observer.disconnect();},[]);
  const cover=items.find(item=>item.kind==='image')?.ref;
  function select(index:number) {
    if(index<0||index>=items.length)return;
    setPlaying(null);setActive(index);
    track.current?.scrollTo({left:index*track.current.clientWidth,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    thumbs.current?.children[index]?.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  if(!items.length)return <div className={styles.stage}><div className={styles.placeholder}><ImageOff size={32} aria-hidden="true" /><span>{t('No photo yet')}</span></div></div>;
  return <section className={styles.gallery} aria-label={t('Photos and videos')}>
    <div className={styles.galleryViewer}>
      <div className={styles.galleryTrack} ref={track} tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();select(active+(event.key==='ArrowLeft'?-1:1));}}} onScroll={()=>{
        if(!track.current)return;const index=Math.min(items.length-1,Math.round(track.current.scrollLeft/track.current.clientWidth));
        if(index!==active){setActive(index);setPlaying(null);}
      }}>
        {items.map((item,index)=><div className={styles.gallerySlide} inert={index!==active} key={`${item.kind}:${item.ref}`} aria-label={t('Media {number} of {total}',{number:index+1,total:items.length})}>
          {item.kind==='image' ? failed.includes(item.ref)?<div className={styles.placeholder}><ImageOff aria-hidden="true" /><span>{t('Photo unavailable')}</span></div>:<img src={item.ref} alt={`${name} — ${t('Photo {number}',{number:index+1})}`} loading={index===0?'eager':'lazy'} draggable={false} onError={()=>setFailed(current=>[...current,item.ref])} />
          : playing===index&&active===index ? !item.ref.startsWith('youtube:') ? <SocialVideoFrame poster={cover} video={item.ref} title={t('{value1} video',{value1:name})}/> : <iframe src={`${productVideoEmbedUrl(item.ref)}?autoplay=1`} title={t('{value1} video',{value1:name})} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          : <div className={styles.galleryVideoPoster}>{cover&&!failed.includes(cover)?<img src={cover} alt="" loading="lazy" onError={()=>setFailed(current=>[...current,cover])}/>:null}<button type="button" disabled={!ready} onClick={()=>setPlaying(index)} aria-label={t('Play video {number}',{number:index+1})}><Play aria-hidden="true" /><span>{t('Play video')}</span></button></div>}
        </div>)}
      </div>
      {items.length>1?<div className={styles.galleryArrows}><button type="button" disabled={!ready||active===0} onClick={()=>select(active-1)} aria-label={t('Previous media')}><ChevronLeft aria-hidden="true" /></button><button type="button" disabled={!ready||active===items.length-1} onClick={()=>select(active+1)} aria-label={t('Next media')}><ChevronRight aria-hidden="true" /></button></div>:null}
    </div>
    {items.length>1?<><div className={styles.galleryThumbs} ref={thumbs}>{items.map((item,index)=><button type="button" key={`${item.kind}:${item.ref}`} disabled={!ready} aria-pressed={active===index} aria-label={t(item.kind==='image'?'Photo {number}':'Video {number}',{number:index+1})} onClick={()=>select(index)}>
      {item.kind==='image'&&!failed.includes(item.ref)?<img src={item.ref} alt="" loading="lazy" onError={()=>setFailed(current=>[...current,item.ref])}/>:item.kind==='video'?<Play aria-hidden="true" />:<ImageOff aria-hidden="true" />}
    </button>)}</div><p className="sr-only" aria-live="polite">{t('Media {number} of {total}',{number:active+1,total:items.length})}</p></>:null}
  </section>;
}
