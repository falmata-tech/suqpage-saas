import React, { useRef,useState,type KeyboardEvent } from "react";
import { View, Text, Pressable,ScrollView, StyleSheet,Platform } from "react-native";
import { router } from "expo-router";
import { ABOUT_STOREFRONT_SECTIONS, CUSTOMER_MAP_COPY } from "../../../../lib/storefront-copy";
import { Screen, Button, Icon, colors, useOpenLink } from "../../src/ui";
import { useApp } from "../../src/runtime";
import { createMarketNavigationIntent } from "../../src/incoming-link";

export default function About() {
  const { t } = useApp(),openLink=useOpenLink();
  const scroll = useRef<ScrollView>(null);
  const tabs=useRef<Array<View|null>>([]),[audience,setAudience]=useState<typeof ABOUT_STOREFRONT_SECTIONS[number]['id']>('customers');
  const section=ABOUT_STOREFRONT_SECTIONS.find(item=>item.id===audience)!;
  function select(index:number,focus=false){setAudience(ABOUT_STOREFRONT_SECTIONS[index].id);scroll.current?.scrollTo({y:0,animated:false});if(focus)tabs.current[index]?.focus();}
  function navigate(event:KeyboardEvent<HTMLElement>,index:number){const next=event.key==='Home'?0:event.key==='End'?ABOUT_STOREFRONT_SECTIONS.length-1:event.key==='ArrowRight'?(index+1)%ABOUT_STOREFRONT_SECTIONS.length:event.key==='ArrowLeft'?(index+ABOUT_STOREFRONT_SECTIONS.length-1)%ABOUT_STOREFRONT_SECTIONS.length:null;if(next!==null){event.preventDefault();select(next,true);}}
  return <Screen scroll={false}><ScrollView ref={scroll} contentContainerStyle={s.page}>
    <Text accessibilityRole="header" style={s.heading}>{t("About MirtPage")}</Text>
    <View style={s.tabs} accessibilityRole="tablist" accessibilityLabel={t('About MirtPage')}>{ABOUT_STOREFRONT_SECTIONS.map((item,index)=><Pressable key={item.id} ref={node=>{tabs.current[index]=node;}} nativeID={`about-tab-${item.id}`} accessibilityRole="tab" accessibilityState={{selected:audience===item.id}} aria-selected={audience===item.id} {...(Platform.OS==='web'?{tabIndex:audience===item.id?0:-1,'aria-controls':`about-panel-${item.id}`,onKeyDown:(event:KeyboardEvent<HTMLElement>)=>navigate(event,index)}:{})} onPress={()=>select(index)} style={[s.tab,audience===item.id&&s.selectedTab]}><Text style={s.tabText}>{t(item.label)}</Text></Pressable>)}</View>
    <View key={section.id} nativeID={`about-panel-${section.id}`} testID={`about-${section.id}`} role="tabpanel" aria-labelledby={`about-tab-${section.id}`} style={[s.section, section.id === "businesses" && s.business]}>
      <Text accessibilityRole="header" style={s.title}>{t(section.title)}</Text>
      <Text style={s.intro}>{t(section.description)}</Text>
      <Button label={t(section.action)} icon="arrow" onPress={() => router.navigate(section.id === "customers" ? "/" : "/account")} />
      <View style={s.benefits}>{section.benefits.map(benefit => <View key={benefit.title} style={s.benefit}>
        <View style={s.icon}><Icon name={benefit.icon} size={21} color={colors.brand}/></View>
        <View style={{flex:1,gap:6}}><Text accessibilityRole="header" style={s.benefitTitle}>{t(benefit.title)}</Text><Text style={s.body}>{t(benefit.description)}</Text></View>
      </View>)}</View>
      {section.id === "customers" && <View style={s.mapNote}><Text style={s.benefitTitle}>{t(CUSTOMER_MAP_COPY.title)}</Text><Text style={s.body}>{t(CUSTOMER_MAP_COPY.description)}</Text><Button secondary icon="map" label={t("Explore the map")} onPress={() => router.navigate(`/?view=map&_intent=${createMarketNavigationIntent()}`)} /></View>}
    </View>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}><Button secondary label={t('Privacy')} onPress={()=>void openLink('https://suqpage.com/privacy')}/><Button secondary label={t('Terms')} onPress={()=>void openLink('https://suqpage.com/terms')}/></View>
  </ScrollView></Screen>;
}
const s = StyleSheet.create({
  page:{padding:16,paddingBottom:30,gap:18,maxWidth:780,width:"100%",alignSelf:"center"},
  heading:{fontSize:22,fontWeight:"700",color:colors.ink},
  tabs:{flexDirection:'row',gap:8},
  tab:{flex:1,minWidth:48,minHeight:48,justifyContent:'center',alignItems:'center',padding:10,borderWidth:1,borderColor:colors.line,borderRadius:8,backgroundColor:'white'},
  selectedTab:{borderColor:colors.brand,backgroundColor:colors.soft},
  tabText:{fontSize:14,fontWeight:'700',textAlign:'center',color:colors.ink,flexShrink:1,width:'100%',minWidth:0},
  section:{padding:22,gap:16,borderRadius:16,borderWidth:1,borderColor:colors.line,backgroundColor:"white"},
  business:{backgroundColor:colors.soft,borderColor:"#f1ded0"},
  title:{fontSize:24,lineHeight:30,fontWeight:"700",color:colors.ink},
  intro:{fontSize:16,lineHeight:25,color:colors.muted},
  benefits:{gap:24,marginTop:10},
  benefit:{flexDirection:"row",gap:12},
  icon:{width:38,height:38,borderRadius:10,backgroundColor:"#fff4eb",borderWidth:1,borderColor:"#eeddd0",alignItems:"center",justifyContent:"center"},
  benefitTitle:{fontSize:16,lineHeight:22,fontWeight:"700",color:colors.ink},
  body:{fontSize:14,lineHeight:22,color:colors.muted},
  mapNote:{gap:8,borderTopWidth:1,borderColor:colors.line,paddingTop:16},
});
