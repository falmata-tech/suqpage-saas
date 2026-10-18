import React,{useEffect,useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import {useApp,request} from './runtime';
import {Field,Copy,Button,colors,useOpenLink} from './ui';
import LoadingBar from './LoadingBar';
import type {KnownPlace} from '../../../lib/place-search';

export default function CitySelector({onSelect,countryCode="ET",initialPlace=null}:{countryCode?:string;initialPlace?:KnownPlace|null;onSelect:(place:KnownPlace|null)=>void}){
 const {t}=useApp(),openLink=useOpenLink();
 const [text,setText]=useState(initialPlace?.name||''),[selected,setSelected]=useState<KnownPlace|null>(initialPlace),[places,setPlaces]=useState<KnownPlace[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  setPlaces([]);setError('');if(!countryCode||selected||text.trim().length<2){setBusy(false);return;}
  const controller=new AbortController();setBusy(true);
  const timer=setTimeout(()=>{void request<{places:KnownPlace[]}>('places?q='+encodeURIComponent(text)+"&country="+countryCode,{signal:controller.signal}).then(value=>{if(!controller.signal.aborted)setPlaces(value.places);}).catch(()=>{if(!controller.signal.aborted)setError('City search is unavailable. Try again.');}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});},200);
  return()=>{clearTimeout(timer);controller.abort();};
 },[text,selected,attempt,countryCode]);
 return <View style={{gap:8}}>
  <Field label={t('Business city')} placeholder={t('Search a city or town')} value={text} maxLength={80} onChangeText={value=>{setText(value);setSelected(null);onSelect(null);}} autoCorrect={false} editable={Boolean(countryCode)}/>
  {busy&&<LoadingBar label={t('Loading…')}/>}
  {selected?<Copy muted>{selected.region}</Copy>:places.map(place=><Pressable key={place.id} accessibilityRole="button" accessibilityLabel={`${place.name}, ${place.region}`} onPress={()=>{setSelected(place);setText(place.name);onSelect(place);}} style={{padding:12,borderWidth:1,borderColor:colors.line,borderRadius:8,backgroundColor:'white'}}><Text style={{fontSize:15,fontWeight:'700',color:colors.ink}}>{place.name}{place.localName&&place.localName!==place.name?' · '+place.localName:''}</Text><Text style={{fontSize:13,color:colors.muted}}>{place.region}</Text></Pressable>)}
  {!selected&&!busy&&!error&&text.trim().length>=2&&!places.length&&<Copy muted>{t('No matching city. Try another name.')}</Copy>}
  {Boolean(error)&&<><Copy>{t(error)}</Copy><Button secondary label={t('Try again')} onPress={()=>setAttempt(n=>n+1)}/></>}
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><Text style={{fontSize:11,color:colors.muted}}>{t('Place data ©')}</Text><Pressable accessibilityRole="link" onPress={()=>void openLink('https://www.openstreetmap.org/copyright')}><Text style={{fontSize:11,color:colors.muted}}>OpenStreetMap</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>void openLink('https://www.geonames.org/about.html')}><Text style={{fontSize:11,color:colors.muted}}>GeoNames</Text></Pressable></View>
 </View>;
}
