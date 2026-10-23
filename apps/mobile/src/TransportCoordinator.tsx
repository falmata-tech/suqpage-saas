import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet,Image} from 'react-native';
import {TRANSPORT_COORDINATOR,type TransportCoordinator as Coordinator} from '../../../lib/transport-coordinator';
import {LOGISTICS_PROVIDER_COPY} from '../../../lib/i18n/transport-copy';
import {useApp} from './runtime';
import {Copy,Icon,colors} from './ui';

/** The current provider remains a choice and uses its supplied navy/blue wordmark. */
export default function TransportCoordinator({selection=false,compact=false,selectedId=null,onSelect}:{selection?:boolean;compact?:boolean;selectedId?:Coordinator['id']|null;onSelect?:(id:Coordinator['id'])=>void}) {
  const {t}=useApp(),[open,setOpen]=useState(false);
  const selected=selectedId===TRANSPORT_COORDINATOR.id;
  const logo=(small=false)=><Image source={require('../assets/brands/sharedtrucks-logistics.png')} resizeMode="contain" accessible accessibilityLabel={TRANSPORT_COORDINATOR.name} style={[styles.logo,small&&styles.smallLogo]}/>;
  const badge=<Text style={styles.type}>{t(LOGISTICS_PROVIDER_COPY.freightBrokerage)}</Text>;
  if(selection)return <View style={styles.selector} testID="transport-coordinator">
    <Pressable testID="transport-provider-toggle" accessibilityRole="button" accessibilityLabel={selected?`${t(LOGISTICS_PROVIDER_COPY.label)}: ${TRANSPORT_COORDINATOR.name}, ${t(LOGISTICS_PROVIDER_COPY.freightBrokerage)}`:t(LOGISTICS_PROVIDER_COPY.choose)} accessibilityState={{expanded:open}} aria-expanded={open} onPress={()=>setOpen(value=>!value)} style={({pressed})=>[styles.trigger,pressed&&styles.pressed]}>
      <View style={styles.identity}><Text style={styles.label}>{t(LOGISTICS_PROVIDER_COPY.label)}</Text>{selected?logo():<Text style={styles.name}>{t(LOGISTICS_PROVIDER_COPY.choose)}</Text>}{selected&&<>{badge}<Text style={styles.description}>{t(LOGISTICS_PROVIDER_COPY.description)}</Text></>}</View>
      {selected&&<Icon name="check" size={18} color="#176b4c"/>}<Icon name="down" size={18} color={colors.muted}/>
    </Pressable>
    {open&&<View testID="transport-provider-options" style={styles.options}>
      <Pressable testID="transport-provider-option" accessibilityRole="button" accessibilityState={{selected}} onPress={()=>{onSelect?.(TRANSPORT_COORDINATOR.id);setOpen(false);}} style={styles.option}>
        {logo(true)}<View style={styles.optionText}>{badge}<Text style={styles.description}>{t(LOGISTICS_PROVIDER_COPY.description)}</Text></View>{selected&&<Icon name="check" size={18} color="#176b4c"/>}
      </Pressable>
      <Text style={styles.availability}>{t(LOGISTICS_PROVIDER_COPY.availability)}</Text>
    </View>}
  </View>;
  return <View style={[styles.company,compact&&styles.compact]} testID="transport-coordinator">
    {logo(compact)}
    <View style={styles.text}>{!compact&&<Copy muted>{t('Arranging company')}</Copy>}{badge}</View>
  </View>;
}
const styles=StyleSheet.create({
  selector:{marginHorizontal:14,marginVertical:8,borderWidth:1,borderColor:'#cbd6e2',borderRadius:14,backgroundColor:'white',overflow:'hidden'},
  trigger:{minHeight:76,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:12,paddingVertical:10,backgroundColor:'white'},
  pressed:{backgroundColor:'#f4f8fc'},
  identity:{flex:1,minWidth:0},
  label:{fontSize:11,lineHeight:15,color:colors.muted},
  name:{fontSize:14,lineHeight:19,fontWeight:'700',color:colors.ink},
  description:{marginTop:2,fontSize:11,lineHeight:15,color:colors.muted},
  type:{alignSelf:'flex-start',marginTop:4,paddingHorizontal:8,paddingVertical:3,borderWidth:1,borderColor:'#bfd0e1',borderRadius:12,backgroundColor:'#eff5fb',fontSize:11,lineHeight:15,fontWeight:'700',color:'#183a60'},
  logo:{width:158,height:38,alignSelf:'flex-start',backgroundColor:'white'},
  smallLogo:{width:112,height:27},
  options:{padding:9,borderTopWidth:1,borderTopColor:'#dce5ee',backgroundColor:'#f4f8fc'},
  option:{minHeight:62,flexDirection:'row',alignItems:'center',gap:9,padding:8,borderWidth:1,borderColor:'#cbd6e2',borderRadius:10,backgroundColor:'white'},
  optionText:{flex:1,minWidth:0},
  availability:{marginTop:6,marginHorizontal:2,fontSize:11,lineHeight:15,color:colors.muted},
  company:{flexDirection:'row',alignItems:'center',gap:9,padding:8,marginHorizontal:14,marginVertical:8,borderWidth:1,borderColor:'#cbd6e2',borderRadius:12,backgroundColor:'white'},
  text:{flex:1,minWidth:0},
  compact:{margin:0,paddingVertical:3,paddingHorizontal:0,borderWidth:0,backgroundColor:'transparent'},
});
