import {useEffect,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {useIsFocused} from 'expo-router';
import type {Shop} from '@africmade/contracts';
import {request,useLoad} from './runtime';
import {startForegroundPoll} from '../../../lib/foreground-poll';

/** Only public shop reads opt into recurring refresh. Owner/private resources
 * retain their existing command/focus authority and never inherit this poll. */
export function usePublicShop(handle:string){
 const load=useLoad(()=>handle?request<Shop>('shops/'+encodeURIComponent(handle)):Promise.resolve(null),[handle]);
 const focused=useIsFocused(),latest=useRef(load);latest.current=load;
 const [failure,setFailure]=useState({handle,message:''});
 useEffect(()=>{
  if(!handle||!focused)return;
  setFailure({handle,message:''});
  return startForegroundPoll({
   active:()=>AppState.currentState==='active',
   subscribe:changed=>{const listener=AppState.addEventListener('change',changed);return()=>listener.remove();},
   onError:error=>{
    if(error&&typeof error==='object'&&'status' in error&&[401,403,404].includes(Number(error.status)))latest.current.setData(null);
    setFailure({handle,message:error instanceof Error?error.message:'Please try again.'});
   },
   read:async signal=>{
    const before=latest.current;
    if(before.loading||!before.data)return;
    const revision=await request<{revision:string}>('shops/'+encodeURIComponent(handle)+'/revision',{signal});
    if(signal.aborted||latest.current.loading||before.data!==latest.current.data)return;
    if(revision.revision!==before.data.publicRevision){
     const fresh=await request<Shop>('shops/'+encodeURIComponent(handle),{signal});
     if(signal.aborted||latest.current.loading||before.data!==latest.current.data)return;
     latest.current.setData(fresh);
    }
    setFailure({handle,message:''});
   },
  });
 },[handle,focused]);
 return {...load,error:load.error||(failure.handle===handle?failure.message:''),reload:()=>{setFailure({handle,message:''});load.reload();}};
}
