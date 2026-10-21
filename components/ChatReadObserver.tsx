"use client";
import { useEffect, useRef, type RefObject } from 'react';

export function peerFooterVisible(node:HTMLElement){
  const top=Array.from(document.querySelectorAll('dialog[open]')).at(-1)||Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).at(-1);
  if(top&&!top.contains(node))return false;
  const rect=node.getBoundingClientRect(),viewport=window.visualViewport;
  let upper=viewport?.offsetTop??0,lower=upper+(viewport?.height??innerHeight);
  let left=viewport?.offsetLeft??0,right=left+(viewport?.width??innerWidth);
  if(!top){
    const header=document.querySelector('.workspace-mobile-header')?.getBoundingClientRect();if(header?.height)upper=Math.max(upper,header.bottom);
    for(const nav of document.querySelectorAll('.public-mobile-tabs,.workspace-mobile-tabs')){const r=nav.getBoundingClientRect();if(r.height&&r.top>=0&&r.top<lower)lower=r.top;}
  }
  // Recheck live clipping bounds: an intersection can predate a scroll/resize.
  for(let parent=node.parentElement;parent;parent=parent.parentElement){
    const style=getComputedStyle(parent),bounds=parent.getBoundingClientRect();
    if(/^(auto|scroll|hidden|clip)$/.test(style.overflowY)){upper=Math.max(upper,bounds.top+parent.clientTop);lower=Math.min(lower,bounds.top+parent.clientTop+parent.clientHeight);}
    if(/^(auto|scroll|hidden|clip)$/.test(style.overflowX)){left=Math.max(left,bounds.left+parent.clientLeft);right=Math.min(right,bounds.left+parent.clientLeft+parent.clientWidth);}
  }
  return rect.height>0&&rect.width>0&&rect.top>=upper&&rect.bottom<=lower&&rect.left>=left&&rect.right<=right;
}

export function useVisibleChatRead(root: RefObject<HTMLElement | null>, active: boolean, acknowledge: (messageId:number)=>Promise<void>, identity:string) {
  const callback=useRef(acknowledge),current=useRef({identity,active});
  callback.current=acknowledge;current.current={identity,active};
  useEffect(()=>{
    if(!active||!root.current)return;
    const node=root.current,visible=new Set<number>();let stopped=false,pending=false,lastAck=0;
    async function mark(){
      if(stopped||current.current.identity!==identity||!current.current.active||document.hidden||!document.hasFocus()||pending||!visible.size)return;
      const admitted=[...node.querySelectorAll<HTMLElement>('[data-read-message-id]')].filter(el=>visible.has(Number(el.dataset.readMessageId))&&peerFooterVisible(el)).map(el=>Number(el.dataset.readMessageId));
      if(!admitted.length)return;const id=Math.max(...admitted);if(id<=lastAck)return;
      pending=true;
      try{await callback.current(id);if(!stopped)lastAck=Math.max(lastAck,id);}catch{/* Receipt stays unconfirmed; next visible refresh retries. */}finally{pending=false;}
    }
    const observer=new IntersectionObserver(entries=>{
      for(const e of entries){const id=Number((e.target as HTMLElement).dataset.readMessageId);if(e.isIntersecting&&e.intersectionRatio>=.8)visible.add(id);else visible.delete(id);}void mark();
    },{threshold:.8});
    function scan(){observer.disconnect();visible.clear();node.querySelectorAll('[data-read-message-id]').forEach(el=>observer.observe(el));}
    scan();const mutation=new MutationObserver(scan);mutation.observe(node,{childList:true,subtree:true});
    const resume=()=>void mark();window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);window.addEventListener('scroll',resume,true);window.addEventListener('resize',resume);window.visualViewport?.addEventListener('scroll',resume);window.visualViewport?.addEventListener('resize',resume);const timer=setInterval(resume,3000);
    return()=>{stopped=true;observer.disconnect();mutation.disconnect();clearInterval(timer);window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',resume);window.removeEventListener('scroll',resume,true);window.removeEventListener('resize',resume);window.visualViewport?.removeEventListener('scroll',resume);window.visualViewport?.removeEventListener('resize',resume);};
  },[root,active,identity]);
}
export default function ChatReadObserver({conversationId,canRead,receiptEpoch=''}:{conversationId:number;canRead:boolean;receiptEpoch?:string}){
  const root=useRef<HTMLElement|null>(null);
  useEffect(()=>{root.current=document.querySelector('.support-thread');},[conversationId]);
  useVisibleChatRead(root,canRead,async messageId=>{
    const response=await fetch(`/api/support/${conversationId}/read`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messageId}),signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('read');
  },`${conversationId}:${receiptEpoch}`);return null;
}
