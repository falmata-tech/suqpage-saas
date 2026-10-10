'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {blockedBusinesses,type BlockedBusiness} from '@/lib/catalog-safety';
const key='suqpage-blocked-businesses-v1';
const empty:BlockedBusiness[]=[];let value=empty,initialized=false;
const listeners=new Set<()=>void>();
const subscribe=(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f);};};
function load(){try{value=blockedBusinesses(JSON.parse(localStorage.getItem(key)||'[]'));}catch{value=[];}listeners.forEach(f=>f());}
export function useBlockedBusinesses(){
  useEffect(()=>{if(!initialized){initialized=true;load();}window.addEventListener('storage',load);return()=>window.removeEventListener('storage',load);},[]);
  const list=useSyncExternalStore(subscribe,()=>value,()=>empty);
  async function save(next:BlockedBusiness[]){
    next=blockedBusinesses(next);
    const r=await fetch('/api/catalog/preferences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({blockedIds:next.map(v=>v.id)})});
    if(!r.ok)throw Error('Could not save blocked businesses. Try again.');
    localStorage.setItem(key,JSON.stringify(next));value=next;listeners.forEach(f=>f());
  }
  return {list,save};
}
