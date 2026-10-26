import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {PUBLIC_SITE_FOOTER} from '../../../lib/public-site-footer';
import {PUBLIC_ORIGIN} from './public-origin';
import {useApp} from './runtime';
import {colors,useOpenLink} from './ui';

type FooterLink=typeof PUBLIC_SITE_FOOTER.utilities[number]|typeof PUBLIC_SITE_FOOTER.legal[number];

export default function PublicSiteFooter(){
  const {t}=useApp(),openLink=useOpenLink();
  function open(link:FooterLink){
    if(link.href==='/showrooms'||link.href==='/privacy'||link.href==='/terms')void openLink(PUBLIC_ORIGIN+link.href);
    else router.navigate(link.href);
  }
  return <View testID="public-site-footer" style={s.footer}>
    <View testID="public-footer-utilities" accessibilityLabel={t('Explore AfricMade')} style={[s.links,s.utilities]}>
      {PUBLIC_SITE_FOOTER.utilities.map(link=><Pressable key={link.href} accessibilityRole="link" accessibilityLabel={t(link.label)} onPress={()=>open(link)} style={s.link}><Text style={[s.label,s.utilityLabel]}>{t(link.label)}</Text></Pressable>)}
    </View>
    <View testID="public-footer-legal" accessibilityLabel={t('Information')} style={s.links}>
      {PUBLIC_SITE_FOOTER.legal.map(link=><Pressable key={link.href} accessibilityRole="link" accessibilityLabel={t(link.label)} onPress={()=>open(link)} style={s.link}><Text style={s.label}>{t(link.label)}</Text></Pressable>)}
    </View>
    <View style={s.company}><Text style={s.companyText}>{t(PUBLIC_SITE_FOOTER.location)}</Text><Text style={s.companyText}>© {new Date().getFullYear()} {PUBLIC_SITE_FOOTER.company}</Text></View>
  </View>;
}

const s=StyleSheet.create({
  footer:{width:'100%',minWidth:0,borderTopWidth:1,borderColor:colors.line,paddingTop:24,marginTop:24},
  links:{flexDirection:'row',flexWrap:'wrap',columnGap:24,rowGap:4,alignItems:'flex-start'},
  utilities:{marginBottom:12},
  link:{minHeight:44,minWidth:44,maxWidth:'100%',paddingVertical:8,justifyContent:'center'},
  label:{fontSize:13,lineHeight:20,color:colors.muted,flexShrink:1},
  utilityLabel:{fontSize:14,fontWeight:'600'},
  company:{gap:5,marginTop:16},
  companyText:{fontSize:12,lineHeight:18,color:colors.muted},
});
