import {useCallback,useState} from 'react';
import {useFocusEffect} from 'expo-router';
import {AppState} from 'react-native';
import {secure,request,transportStorageKey} from './runtime';

/** Map badge needs only scoped attention, never a background transcript read. */
export function useTransportUnread(){
  const [count,setCount]=useState(0);
  useFocusEffect(useCallback(()=>{
    let stopped=false,timer:ReturnType<typeof setTimeout>,failures=0;
    async function poll(){
      if(stopped)return;
      if(AppState.currentState===null||AppState.currentState==='active')try{
        const token=await secure.getItem(transportStorageKey);
        if(!token){setCount(0);return;}
        const feed=await request<{unread:number}>('transport/attention',{buyingToken:token});
        if(!stopped)setCount(feed.unread);failures=0;
      }catch{failures++;}
      if(!stopped)timer=setTimeout(poll,Math.min(30000,5000*2**Math.min(failures,3)));
    }
    void poll();return()=>{stopped=true;clearTimeout(timer);};
  },[]));return count;
}
