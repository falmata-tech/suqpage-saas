import React from 'react';
import {View,StyleSheet} from 'react-native';
import type {TransportMethod,TransportPlan} from '@suqpage/contracts';
import {useApp} from './runtime';
import {Button,Card,Copy,colors} from './ui';

const methods:Record<TransportMethod,string>={air:'Air',truck:'Truck',van:'Van',car:'Car',motorcycle:'Motorcycle'};
export function TransportPlanSummary({plan,onPress}:{plan:TransportPlan;onPress:()=>void}){
 const{t}=useApp();
 return <Card><View testID="transport-plan-summary" style={s.summary}>
  <View style={{flex:1,minWidth:120,gap:4}}><Copy heading>{t('Transport plan')}</Copy><Copy muted>{plan.legs.length===1?t('1 transport stage'):t('{count} transport stages',{count:plan.legs.length})}</Copy></View>
  <View style={{maxWidth:'100%'}}><Button secondary wrapLabel label={t('View transport plan')} onPress={onPress}/></View>
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
  </View>)}
 </View>;
}
const s=StyleSheet.create({summary:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:12},leg:{padding:16,gap:12,borderWidth:1,borderColor:colors.line,borderRadius:12,backgroundColor:'white'},route:{flexDirection:'row',flexWrap:'wrap',gap:16},place:{flexGrow:1,flexBasis:120,minWidth:0,gap:4}});
