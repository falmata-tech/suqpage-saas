import React from 'react';
import {Pressable,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {router,usePathname,useGlobalSearchParams} from 'expo-router';
import {publicInquiryPlacement} from '../../../lib/public-transport-placement';
import {storefrontAccent} from '../../../lib/storefront-accent';
import {overlayIsOpen} from './overlay-visibility';
import {useApp} from './runtime';
import {useQuoteInventory,useInquiryAccent} from './use-business-inquiry';
import {useBlockedBusinesses} from './blocked-businesses';
import {colors,Icon} from './ui';

/** Public navigation only; the composer rehydrates selections before handoff. */
export default function PublicActionDock({compact=false,hideInquiry=false,placement,horizontal=false}:{compact?:boolean;hideInquiry?:boolean;placement?:'market'|'shell';horizontal?:boolean}) {
  const {t}=useApp(),path=usePathname(),{width}=useWindowDimensions(),blocked=useBlockedBusinesses();
  const currentPlacement=publicInquiryPlacement(path,'native');
  const inventory=useQuoteInventory();
  const count=inventory.groups.filter(g=>!blocked.list.some(b=>b.id===g.id)).reduce((n,g)=>n+g.lines.length,0);
  const params=useGlobalSearchParams<{handle?:string}>();
  const handle=path.startsWith('/shop/')?path.slice('/shop/'.length):path==='/product'?params.handle:undefined;
  const accent=storefrontAccent(useInquiryAccent(handle));
  if(!blocked.ready||!currentPlacement||(placement&&placement!==currentPlacement)||count===0||hideInquiry)return null;
  return <View testID="public-action-dock" style={{width:Math.min(horizontal?244:compact?168:200,width-24),gap:8,flexDirection:horizontal?'row':'column'}}>
    {count>0&&!hideInquiry&&<Pressable testID="public-inquiry-list" accessibilityRole="button" accessibilityLabel={`${t('View inquiry list')} (${count})`} onPress={()=>{if(!overlayIsOpen())router.push('/inquiry');}} style={[d.inquiry,accent&&{backgroundColor:accent.accent,borderColor:accent.edge},compact&&{padding:8},horizontal&&{width:68,padding:8,flexShrink:0}]}>
      <Icon name="package" size={18} color={accent?.on||colors.brand}/>
      {!horizontal&&<Text style={[d.label,accent&&{color:accent.on},compact&&{fontSize:12}]}>{t('Inquiry list')}</Text>}
      <Text testID="inquiry-list-count" accessibilityElementsHidden style={[d.count,accent&&{backgroundColor:accent.on,color:accent.accent}]}>{count}</Text>
    </Pressable>}
  </View>;
}
const d=StyleSheet.create({
  inquiry:{minWidth:48,minHeight:48,flexDirection:'row',alignItems:'center',gap:6,padding:10,borderWidth:1,borderColor:colors.brand,borderRadius:7,backgroundColor:'white',boxShadow:'0 3px 12px #0002'},
  label:{flex:1,minWidth:0,fontSize:13,lineHeight:16,fontWeight:'700',color:colors.brand},
  count:{minWidth:20,paddingHorizontal:5,paddingVertical:2,borderRadius:12,backgroundColor:colors.brand,color:'white',fontSize:12,lineHeight:16,fontWeight:'700',textAlign:'center'},
});
