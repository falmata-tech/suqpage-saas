import React,{createContext,useCallback,useContext,useEffect,useRef,type ReactNode,type RefObject} from 'react';
import {AppState,Keyboard,Platform,View,useWindowDimensions} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {overlayGeneration,overlayIsOpen} from './overlay-visibility';
import {chatReadBounds} from './chat-read-viewport';

type Register=(id:number,ref:RefObject<View|null>)=>()=>void;
const Transcript=createContext<Register|null>(null);

/** One measurement batch and acknowledgement at a time for the whole transcript. */
export function ChatReadTranscript({identity,active=true,onRead,children}:{identity:string;active?:boolean;onRead:(id:number)=>Promise<void>;children:ReactNode}){
  const footers=useRef(new Map<number,RefObject<View|null>>()),callback=useRef(onRead);
  const current=useRef({identity,active});
  const keyboardTop=useRef<number|undefined>(undefined);
  callback.current=onRead;current.current={identity,active};
  const {height}=useWindowDimensions(),insets=useSafeAreaInsets();
  const register=useCallback<Register>((id,ref)=>{
    footers.current.set(id,ref);
    return()=>{if(footers.current.get(id)===ref)footers.current.delete(id);};
  },[]);
  useEffect(()=>{
    if(Platform.OS==='web')return;
    const show=Keyboard.addListener('keyboardDidShow',event=>{keyboardTop.current=event.endCoordinates.screenY;});
    const hide=Keyboard.addListener('keyboardDidHide',()=>{keyboardTop.current=undefined;});
    return()=>{show.remove();hide.remove();};
  },[]);
  useFocusEffect(useCallback(()=>{
    let stopped=false,busy=false,seen=0,generation=0;
    function eligible(){
      return !stopped&&current.current.active&&current.current.identity===identity&&!overlayIsOpen()
        &&(AppState.currentState===null||AppState.currentState==='active')
        &&(Platform.OS!=='web'||(!document.hidden&&document.hasFocus()));
    }
    function check(){
      const batch=++generation;
      if(busy||!eligible())return;
      const candidates=[...footers.current].filter(([id,ref])=>id>seen&&ref.current);
      if(!candidates.length)return;
      const overlay=overlayGeneration();let remaining=candidates.length,highest=0;
      const valid=()=>batch===generation&&overlay===overlayGeneration()&&eligible();
      for(const [id,ref] of candidates){
        const measuredNode=ref.current!;
        measuredNode.measureInWindow((_x,y,_width,h)=>{
          if(!valid())return;
          const viewport=Platform.OS==='web'?window.visualViewport:undefined;
          const {upper,lower}=chatReadBounds({height,topInset:insets.top,bottomInset:insets.bottom,keyboardTop:keyboardTop.current,visibleTop:viewport?.offsetTop,visibleHeight:viewport?.height});
          if(footers.current.get(id)===ref&&ref.current===measuredNode&&h>0&&y>=upper&&y+h<=lower)highest=Math.max(highest,id);
          if(--remaining!==0||!highest||busy||!valid())return;
          busy=true;
          void callback.current(highest).then(()=>{if(!stopped)seen=Math.max(seen,highest);}).catch(()=>{/* Retry visible failures without inventing Read. */}).finally(()=>{busy=false;});
        });
      }
    }
    // A focus round trip invalidates delayed measurements even when active again.
    const invalidate=()=>{generation++;};
    const appState=AppState.addEventListener('change',invalidate);
    if(Platform.OS==='web'){window.addEventListener('blur',invalidate);window.addEventListener('focus',invalidate);document.addEventListener('visibilitychange',invalidate);}
    const timer=setInterval(check,1000);check();
    return()=>{stopped=true;generation++;clearInterval(timer);appState.remove();if(Platform.OS==='web'){window.removeEventListener('blur',invalidate);window.removeEventListener('focus',invalidate);document.removeEventListener('visibilitychange',invalidate);}};
  },[identity,active,height,insets.bottom,insets.top]));
  return <Transcript.Provider value={register}>{children}</Transcript.Provider>;
}

/** A lightweight footer; the transcript owns focus, timers and network work. */
export default function ChatReadSentinel({messageId}:{messageId:number}){
  const ref=useRef<View>(null),register=useContext(Transcript);
  useEffect(()=>register?.(messageId,ref),[register,messageId]);
  return <View ref={ref} collapsable={false} style={{height:2,width:'100%'}}/>;
}
