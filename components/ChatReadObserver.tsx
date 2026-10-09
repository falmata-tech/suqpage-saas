"use client";
import { useEffect, useRef, type RefObject } from 'react';

export function peerFooterVisible(node:HTMLElement){
  const top=Array.from(document.querySelectorAll('dialog[open]')).at(-1)||Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).at(-1);
  if(top&&!top.contains(node))return false;
  const rect=node.getBoundingClientRect();let upper=0,lower=window.visualViewport?.height??innerHeight;
  if(!top){
    const header=document.querySelector('.workspace-mobile-header')?.getBoundingClientRect();if(header?.height)upper=Math.max(0,header.bottom);
    for(const nav of document.querySelectorAll('.public-mobile-tabs,.workspace-mobile-tabs')){const r=nav.getBoundingClientRect();if(r.height&&r.top>=0&&r.top<lower)lower=r.top;}
  }
  return rect.height>0&&rect.top>=upper&&rect.bottom<=lower;
}

export function useVisibleChatRead(root: RefObject<HTMLElement | null>, active: boolean, acknowledge: (messageId:number)=>Promise<void>, identity:string) {
  const lastAck=useRef(0),pending=useRef(false),callback=useRef(acknowledge);
  callback.current=acknowledge;
  useEffect(()=>{lastAck.current=0;},[identity]);
  useEffect(()=>{
    if(!active||!root.current)return;
    const node=root.current,visible=new Set<number>();let stopped=false;
    async function mark(){
      if(stopped||document.hidden||!document.hasFocus()||pending.current||!visible.size)return;
      const admitted=[...node.querySelectorAll<HTMLElement>('[data-read-message-id]')].filter(el=>visible.has(Number(el.dataset.readMessageId))&&peerFooterVisible(el)).map(el=>Number(el.dataset.readMessageId));
      if(!admitted.length)return;const id=Math.max(...admitted);if(id<=lastAck.current)return;
      pending.current=true;
      try{await callback.current(id);if(!stopped)lastAck.current=Math.max(lastAck.current,id);}catch{/* Receipt stays unconfirmed; next visible refresh retries. */}finally{pending.current=false;}
    }
    const observer=new IntersectionObserver(entries=>{
      for(const e of entries){const id=Number((e.target as HTMLElement).dataset.readMessageId);if(e.isIntersecting&&e.intersectionRatio>=.8)visible.add(id);else visible.delete(id);}void mark();
    },{threshold:.8});
    function scan(){observer.disconnect();visible.clear();node.querySelectorAll('[data-read-message-id]').forEach(el=>observer.observe(el));}
    scan();const mutation=new MutationObserver(scan);mutation.observe(node,{childList:true,subtree:true});
    const resume=()=>void mark();window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);const timer=setInterval(resume,3000);
    return()=>{stopped=true;observer.disconnect();mutation.disconnect();clearInterval(timer);window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',resume);};
  },[root,active,identity]);
}
export default function ChatReadObserver({conversationId,canRead}:{conversationId:number;canRead:boolean}){
  const root=useRef<HTMLElement|null>(null);
  useEffect(()=>{root.current=document.querySelector('.support-thread');},[conversationId]);
  useVisibleChatRead(root,canRead,async messageId=>{
    const response=await fetch(`/api/support/${conversationId}/read`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messageId}),signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('read');
  },String(conversationId));return null;
}
