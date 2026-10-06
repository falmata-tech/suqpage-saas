import React, { useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ABOUT_STOREFRONT_SECTIONS, CUSTOMER_MAP_COPY } from "../../../../lib/storefront-copy";
import { Screen, Button, Icon, colors } from "../../src/ui";
import { useApp } from "../../src/runtime";

export default function About() {
  const { t } = useApp();
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  return <Screen scroll={false}><ScrollView ref={scroll} contentContainerStyle={s.page}>
    <Text accessibilityRole="header" style={s.heading}>{t("About Suqpage")}</Text>
    <View style={s.jumps}>{ABOUT_STOREFRONT_SECTIONS.map(section => <Button key={section.id} secondary label={t(section.label)} onPress={() => scroll.current?.scrollTo({y:positions.current[section.id] || 0, animated:false})} />)}</View>
    {ABOUT_STOREFRONT_SECTIONS.map(section => <View key={section.id} testID={`about-${section.id}`} onLayout={event => { positions.current[section.id] = event.nativeEvent.layout.y; }} style={[s.section, section.id === "businesses" && s.business]}>
      <Text style={s.eyebrow}>{t(section.label)}</Text>
      <Text accessibilityRole="header" style={s.title}>{t(section.title)}</Text>
      <Text style={s.intro}>{t(section.description)}</Text>
      <Button label={t(section.action)} icon="arrow" onPress={() => router.navigate(section.id === "customers" ? "/" : "/account")} />
      <View style={s.benefits}>{section.benefits.map(benefit => <View key={benefit.title} style={s.benefit}>
        <View style={s.icon}><Icon name={benefit.icon} size={21} color={colors.brand}/></View>
        <View style={{flex:1,gap:6}}><Text accessibilityRole="header" style={s.benefitTitle}>{t(benefit.title)}</Text><Text style={s.body}>{t(benefit.description)}</Text></View>
      </View>)}</View>
      {section.id === "customers" && <View style={s.mapNote}><Text style={s.benefitTitle}>{t(CUSTOMER_MAP_COPY.title)}</Text><Text style={s.body}>{t(CUSTOMER_MAP_COPY.description)}</Text><Button secondary icon="map" label={t("Explore the map")} onPress={() => router.navigate("/")} /></View>}
    </View>)}
  </ScrollView></Screen>;
}
const s = StyleSheet.create({
  page:{padding:16,paddingBottom:30,gap:18,maxWidth:780,width:"100%",alignSelf:"center"},
  heading:{fontSize:22,fontWeight:"700",color:colors.ink},
  jumps:{flexDirection:"row",flexWrap:"wrap",gap:8},
  section:{padding:22,gap:16,borderRadius:16,borderWidth:1,borderColor:colors.line,backgroundColor:"white"},
  business:{backgroundColor:colors.soft,borderColor:"#f1ded0"},
  eyebrow:{fontSize:12,fontWeight:"700",color:colors.brand},
  title:{fontSize:28,lineHeight:33,fontWeight:"800",color:colors.ink},
  intro:{fontSize:16,lineHeight:25,color:colors.muted},
  benefits:{gap:24,marginTop:10},
  benefit:{flexDirection:"row",gap:12},
  icon:{width:38,height:38,borderRadius:10,backgroundColor:"#fff4eb",borderWidth:1,borderColor:"#eeddd0",alignItems:"center",justifyContent:"center"},
  benefitTitle:{fontSize:16,lineHeight:22,fontWeight:"700",color:colors.ink},
  body:{fontSize:14,lineHeight:22,color:colors.muted},
  mapNote:{gap:8,borderTopWidth:1,borderColor:colors.line,paddingTop:16},
});
