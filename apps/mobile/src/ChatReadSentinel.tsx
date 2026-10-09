import React,{useCallback,useEffect,useRef} from 'react';
import {AppState,Keyboard,Platform,View,useWindowDimensions} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {overlayIsOpen} from './overlay-visibility';
import {chatReadBounds} from './chat-read-viewport';

/** Confirm a peer message only after its footer enters an active, uncovered chat. */
export default function ChatReadSentinel({messageId,onRead}:{messageId:number;onRead:(id:number)=>Promise<void>}){
  const ref=useRef<View>(null),callback=useRef(onRead),seen=useRef(0),busy=useRef(false);
  const keyboardTop=useRef<number|undefined>(undefined);
  callback.current=onRead;const {height}=useWindowDimensions(),insets=useSafeAreaInsets();
  useEffect(()=>{
    if(Platform.OS==='web')return;
    const show=Keyboard.addListener('keyboardDidShow',event=>{keyboardTop.current=event.endCoordinates.screenY;});
    const hide=Keyboard.addListener('keyboardDidHide',()=>{keyboardTop.current=undefined;});
    return()=>{show.remove();hide.remove();};
  },[]);
  useFocusEffect(useCallback(()=>{
    let stopped=false;
    function check(){
      if(stopped||busy.current||seen.current>=messageId||overlayIsOpen()||!(AppState.currentState===null||AppState.currentState==='active'))return;
      if(Platform.OS==='web'&&(document.hidden||!document.hasFocus()))return;
      ref.current?.measureInWindow((_x,y,_width,h)=>{
        const viewport=Platform.OS==='web'?window.visualViewport:undefined;
        const {upper,lower}=chatReadBounds({height,topInset:insets.top,bottomInset:insets.bottom,keyboardTop:keyboardTop.current,visibleTop:viewport?.offsetTop,visibleHeight:viewport?.height});
        if(stopped||overlayIsOpen()||y<upper||y+h>lower||h<=0)return;
        busy.current=true;
        void callback.current(messageId).then(()=>{seen.current=messageId;}).catch(()=>{/* Retry when visible; do not invent Read. */}).finally(()=>{busy.current=false;});
      });
    }
    const timer=setInterval(check,1000);check();
    return()=>{stopped=true;clearInterval(timer);};
  },[messageId,height,insets.bottom,insets.top]));
  return <View ref={ref} collapsable={false} style={{height:2,width:'100%'}}/>;
}
