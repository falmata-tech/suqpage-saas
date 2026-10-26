import React from 'react';
import {Pressable,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {router,useGlobalSearchParams,usePathname} from 'expo-router';
import type {Shop} from '@suqpage/contracts';
import {publicTransportPlacement} from '../../../lib/public-transport-placement';
import {storefrontAccent} from '../../../lib/storefront-accent';
import {BuyingLauncher} from './chrome';
import {overlayIsOpen} from './overlay-visibility';
import {request,useApp,useLoad} from './runtime';
import {useBusinessInquiry} from './use-business-inquiry';
import {useBlockedBusinesses} from './blocked-businesses';
import {colors,Icon} from './ui';

/** Public navigation only; the composer rehydrates selections before handoff. */
export default function PublicActionDock({compact=false,hideInquiry=false,placement,horizontal=false}:{compact?:boolean;hideInquiry?:boolean;placement?:'market'|'shell';horizontal?:boolean}) {
  const {t}=useApp(),path=usePathname(),params=useGlobalSearchParams<{handle?:string|string[]}>(),{width}=useWindowDimensions(),blocked=useBlockedBusinesses();
  const currentPlacement=publicTransportPlacement(path,'native');
  const active=Boolean(currentPlacement&&(!placement||placement===currentPlacement));
  const handle=active?(path.startsWith('/shop/')?path.slice('/shop/'.length):path==='/product'?(Array.isArray(params.handle)?params.handle[0]:params.handle)||'':''):'';
  const load=useLoad(()=>handle?request<Shop>('shops/'+encodeURIComponent(handle)):Promise.resolve(null),[handle]);
  const shop=handle&&blocked.ready&&load.data?.handle===handle&&!blocked.list.some(item=>item.id===load.data!.id)?load.data:null;
  const inquiry=useBusinessInquiry(shop),count=inquiry.items.length,accent=storefrontAccent(shop?.accentColor);
  if(!currentPlacement||(placement&&placement!==currentPlacement))return null;
  return <View testID="public-action-dock" style={{width:Math.min(horizontal?244:compact?168:200,width-24),gap:8,flexDirection:horizontal?'row':'column'}}>
    {shop&&count>0&&!hideInquiry&&<Pressable testID="public-inquiry-list" accessibilityRole="button" accessibilityLabel={`${t('View inquiry list')} (${count})`} onPress={()=>{if(!overlayIsOpen())router.push({pathname:'/inquiry',params:{handle:shop.handle}});}} style={[d.inquiry,accent&&{backgroundColor:accent.accent,borderColor:accent.edge},compact&&{padding:8},horizontal&&{width:68,padding:8,flexShrink:0}]}>
      <Icon name="package" size={18} color={accent?.on||colors.brand}/>
      {!horizontal&&<Text style={[d.label,accent&&{color:accent.on},compact&&{fontSize:12}]}>{t('Inquiry list')}</Text>}
      <Text testID="inquiry-list-count" accessibilityElementsHidden style={[d.count,accent&&{backgroundColor:accent.on,color:accent.accent}]}>{count}</Text>
    </Pressable>}
    <View style={horizontal?{flex:1}:undefined}><BuyingLauncher compact={compact}/></View>
  </View>;
}
const d=StyleSheet.create({
  inquiry:{minWidth:48,minHeight:48,flexDirection:'row',alignItems:'center',gap:6,padding:10,borderWidth:1,borderColor:colors.brand,borderRadius:7,backgroundColor:'white',boxShadow:'0 3px 12px #0002'},
  label:{flex:1,minWidth:0,fontSize:13,lineHeight:16,fontWeight:'700',color:colors.brand},
  count:{minWidth:20,paddingHorizontal:5,paddingVertical:2,borderRadius:12,backgroundColor:colors.brand,color:'white',fontSize:12,lineHeight:16,fontWeight:'700',textAlign:'center'},
});
