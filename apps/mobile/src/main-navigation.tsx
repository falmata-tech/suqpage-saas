import React from 'react';
import {View,Text,Pressable} from 'react-native';
import {router,usePathname} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp,useLoad} from './runtime';
import {Icon,colors} from './ui';
import {useOwnerAlertCount} from './AttentionAlerts';
export default function MainNavigation(){
  const {t,session,ownerRequest}=useApp(),path=usePathname(),{bottom}=useSafeAreaInsets();
  const alerts=useOwnerAlertCount();
  const owner=useLoad(async()=>session?ownerRequest<{setupRequired:boolean}>('session'):null,[session?.user.id,path],true);
  const inquiry=path.startsWith('/owner/inquiries');
  const entries=[{label:'Market',icon:'map',active:path==='/'||path.startsWith('/shop/')||path==='/product',go:()=>router.navigate('/')},{label:'Featured',icon:'star',active:path==='/featured',go:()=>router.navigate('/featured')},{label:'Inquiries',icon:'chat',active:inquiry,go:()=>session?router.navigate({pathname:'/owner/[section]',params:{section:'inquiries'}}):router.navigate({pathname:'/account',params:{next:'inquiries'}})},{label:'Account',icon:'user',active:!inquiry&&(path==='/account'||path.startsWith('/owner/')),go:()=>router.navigate('/account')}];
  return <View accessibilityRole="tablist" style={{flexDirection:'row',borderTopWidth:1,borderColor:colors.line,backgroundColor:'white',paddingBottom:bottom}}>{entries.filter(item=>item.label!=='Inquiries'||Boolean(session&&owner.data&&!owner.data.setupRequired)).map(item=><Pressable key={item.label} accessibilityRole="tab" accessibilityLabel={t(item.label)} accessibilityState={{selected:item.active}} onPress={item.go} style={{flex:1,minHeight:60,alignItems:'center',justifyContent:'center',gap:4,borderTopWidth:3,borderColor:item.active?colors.brand:'transparent'}}><Icon name={item.icon} size={21} color={item.active?colors.brand:colors.muted}/>{item.label==='Account'&&Boolean(session&&alerts)&&<Text style={{position:'absolute',top:5,right:12,fontSize:10,color:'white',backgroundColor:colors.brand,borderRadius:10,paddingHorizontal:5}}>{alerts>99?'99+':alerts}</Text>}<Text style={{fontSize:11,fontWeight:'700',color:item.active?colors.brand:colors.muted}}>{t(item.label)}</Text></Pressable>)}</View>;
}
