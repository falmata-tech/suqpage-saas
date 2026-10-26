import React from 'react';
import {View,Text,Pressable} from 'react-native';
import {router,usePathname} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from './runtime';
import {Icon,colors} from './ui';
import {useOwnerAlertCount} from './AttentionAlerts';
import {useOwnerNavigation} from './owner-edit-navigation';
export default function MainNavigation(){
  const {t,session}=useApp(),path=usePathname(),{bottom}=useSafeAreaInsets();
  const navigate=useOwnerNavigation();
  const alerts=useOwnerAlertCount();
  if(path==='/buying')return null;
  const entries=[{label:'Market',icon:'shop',active:path==='/'||path.startsWith('/shop/')||path==='/product',go:()=>router.navigate('/')},{label:'Featured',icon:'star',active:path==='/featured',go:()=>router.navigate('/featured')},{label:'About',icon:'info',active:path==='/about',go:()=>router.navigate('/about')},{label:session?'Account':'Login',icon:'user',active:(path==='/account'||path.startsWith('/owner/')),go:()=>router.navigate('/account')}];
  return <View accessibilityRole="tablist" style={{flexDirection:'row',borderTopWidth:1,borderColor:colors.line,backgroundColor:'white',paddingBottom:bottom}}>{entries.map(item=><Pressable key={item.label} accessibilityRole="tab" accessibilityLabel={t(item.label)} accessibilityState={{selected:item.active}} aria-selected={item.active} onPress={()=>navigate(item.go)} style={{flex:1,minHeight:60,alignItems:'center',justifyContent:'center',gap:4,borderTopWidth:3,borderColor:item.active?colors.brand:'transparent'}}><Icon name={item.icon} size={21} color={item.active?colors.brand:colors.muted}/>{item.icon==='user'&&Boolean(session&&alerts)&&<Text style={{position:'absolute',top:5,right:12,fontSize:10,color:'white',backgroundColor:colors.brand,borderRadius:10,paddingHorizontal:5}}>{alerts>99?'99+':alerts}</Text>}<Text style={{fontSize:10,fontWeight:'700',textAlign:'center',width:'100%',paddingHorizontal:2,color:item.active?colors.brand:colors.muted}}>{t(item.label)}</Text></Pressable>)}</View>;
}
