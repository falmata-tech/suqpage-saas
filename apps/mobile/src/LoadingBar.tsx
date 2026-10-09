import React,{useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,AppState,Easing,Platform,Text,View} from 'react-native';
import {useApp} from './runtime';
export default function LoadingBar({color='#c23806',track='#fff0e8',label}:{color?:string;track?:string;label?:string}){
  const {t}=useApp(),motion=useRef(new Animated.Value(0)).current;
  const [width,setWidth]=useState(200),[reduce,setReduce]=useState(false),[active,setActive]=useState(AppState.currentState!=='background');
  useEffect(()=>{
    let live=true;
    const media=Platform.OS==='web'?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
    if(media){setReduce(media.matches);const change=()=>setReduce(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);}
    AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(live)setReduce(v);});
    const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);return()=>{live=false;sub.remove();};
  },[]);
  useEffect(()=>{const sub=AppState.addEventListener('change',state=>setActive(state==='active'));return()=>sub.remove();},[]);
  useEffect(()=>{motion.setValue(0);if(reduce||!active)return;const animation=Animated.loop(Animated.timing(motion,{toValue:1,duration:1500,easing:Easing.linear,useNativeDriver:Platform.OS!=='web'}));animation.start();return()=>animation.stop();},[reduce,active,motion]);
  return <View accessibilityRole="progressbar" accessibilityLabel={label||t('Loading…')} style={{gap:7,paddingVertical:12}}><Text style={{fontSize:12,color:'#63737a'}}>{label||t('Loading…')}</Text><View onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={{height:6,borderRadius:6,overflow:'hidden',backgroundColor:track}}><Animated.View style={{height:6,width:'35%',borderRadius:6,backgroundColor:color,transform:[{translateX:reduce?width*.32:motion.interpolate({inputRange:[0,1],outputRange:[-width*.35,width]})}]}}/></View></View>;
}
