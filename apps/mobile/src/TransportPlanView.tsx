import React,{useEffect,useRef,useState} from 'react';
import {Platform,View,StyleSheet} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type {TransportMethod,TransportPlan,TransportPlanLeg} from '@africmade/contracts';
import {trackingProviderUrl} from '../../../lib/tracking-contract';
import {copyBrowserText} from '../../../lib/browser-clipboard';
import {useApp} from './runtime';
import {Button,Card,Copy,colors} from './ui';
import {openLink} from './open-link';

const methods:Record<TransportMethod,string>={air:'Air',truck:'Truck',van:'Van',car:'Car',motorcycle:'Motorcycle'};
type TrackableLeg=TransportPlanLeg&{trackingUrl?:string;trackingCode?:string};
function ProviderTrackingDetails({leg}:{leg:TrackableLeg}){
 const{t}=useApp(),[notice,setNotice]=useState(''),identity=useRef('');identity.current=JSON.stringify([leg.id,leg.trackingUrl,leg.trackingCode]);
 const code=typeof leg.trackingCode==='string'?leg.trackingCode:'';let url='';try{url=trackingProviderUrl(leg.trackingUrl);}catch{/* Invalid destinations stay inert. */}
 useEffect(()=>{identity.current=JSON.stringify([leg.id,leg.trackingUrl,leg.trackingCode]);setNotice('');return()=>{identity.current='';};},[leg.id,leg.trackingUrl,leg.trackingCode]);
 if(!url&&!code)return null;
 return <View style={s.providerTracking}>
  {code&&<><Copy muted>{t('Tracking code')}</Copy><Copy selectable>{code}</Copy><Button secondary wrapLabel label={t('Copy code')} onPress={async()=>{const current=identity.current;let copied=false;try{copied=Platform.OS==='web'?await copyBrowserText(code):await Clipboard.setStringAsync(code);}catch{/* Offer selectable text when copying is unavailable. */}if(current&&current===identity.current)setNotice(copied?'Copied':'Could not copy. Select the code above and copy it.');}}/></>}
  {url&&<Button secondary wrapLabel label={t('Open provider tracking')} onPress={async()=>{
   const current=identity.current;
   try{const destination=trackingProviderUrl(leg.trackingUrl);if(!destination)return;await openLink(destination);}
   catch{if(current&&current===identity.current)setNotice('Could not open link');}
  }}/>}
  {url&&<Copy muted>{t('Opens the provider’s website.')}</Copy>}
  {Boolean(notice)&&<View accessibilityLiveRegion="polite"><Copy>{t(notice)}</Copy></View>}
 </View>;
}
export function TransportPlanSummary({plan,onPress}:{plan:TransportPlan;onPress:()=>void}){
 const{t}=useApp();
 return <Card><View testID="transport-plan-summary" style={s.summary}>
  <View style={{flex:1,minWidth:120,gap:4}}><Copy heading>{t('Shipment record')}</Copy><Copy muted>{plan.legs.length===1?t('1 transport stage'):t('{count} transport stages',{count:plan.legs.length})}</Copy></View>
  <View style={{maxWidth:'100%'}}><Button secondary wrapLabel label={t('View shipment record')} onPress={onPress}/></View>
 </View></Card>;
}

/** Only the public ordered read model belongs here; no chat/contact capability. */
export default function TransportPlanView({plan}:{plan:TransportPlan}){
 const{t}=useApp();
 return <View testID="transport-plan-read" style={{gap:16}}>
  <Copy muted>{plan.legs.length===1?t('1 transport stage'):t('{count} transport stages',{count:plan.legs.length})}</Copy>
  <Copy>{t('Providers in travel order')}</Copy>
  {plan.legs.map((leg,index)=><View key={leg.id} testID={`transport-plan-leg-${leg.id}`} style={s.leg}>
   <Copy heading>{t('Stage {number}',{number:index+1})}</Copy>
   <View style={{gap:4}}><Copy muted>{t('Provider')}</Copy><Copy big>{leg.providerName}</Copy></View>
   <Copy>{t(methods[leg.method])}</Copy>
   <View style={s.route}><View style={s.place}><Copy muted>{t('From')}</Copy><Copy>{leg.origin}</Copy></View><View style={s.place}><Copy muted>{t('To')}</Copy><Copy>{leg.destination}</Copy></View></View>
   <ProviderTrackingDetails leg={leg}/>
  </View>)}
 </View>;
}
const s=StyleSheet.create({summary:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:12},leg:{padding:16,gap:12,borderWidth:1,borderColor:colors.line,borderRadius:12,backgroundColor:'white'},route:{flexDirection:'row',flexWrap:'wrap',gap:16},place:{flexGrow:1,flexBasis:120,minWidth:0,gap:4},providerTracking:{borderTopWidth:1,borderTopColor:colors.line,paddingTop:12,gap:10}});
