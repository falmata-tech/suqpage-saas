import {useEffect,useState} from 'react';
import {AppState} from 'react-native';
export function useAppForeground(){
 const [active,setActive]=useState(AppState.currentState==='active');
 useEffect(()=>{setActive(AppState.currentState==='active');const listener=AppState.addEventListener('change',state=>setActive(state==='active'));return()=>listener.remove();},[]);
 return active;
}
