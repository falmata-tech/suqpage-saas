'use client';
import {useEffect,useRef} from 'react';
import {useRouter} from 'next/navigation';
import {startForegroundPoll} from '@/lib/foreground-poll';
export default function PublicShowroomRefresh({handle,revision}:{handle:string;revision:string}){
 const router=useRouter(),current=useRef(revision);current.current=revision;
 useEffect(()=>startForegroundPoll({
  active:()=>document.visibilityState==='visible',
  subscribe:changed=>{document.addEventListener('visibilitychange',changed);return()=>document.removeEventListener('visibilitychange',changed);},
  read:async signal=>{
   const response=await fetch(`/api/mobile/v1/shops/${encodeURIComponent(handle)}/revision`,{signal,cache:'no-store'});
   if(!response.ok)throw new Error('Public refresh unavailable.');
   const value:unknown=await response.json();
   if(!signal.aborted&&value&&typeof value==='object'&&'revision' in value&&typeof value.revision==='string'&&value.revision!==current.current)router.refresh();
  },
 }),[handle,router]);
 return null;
}
