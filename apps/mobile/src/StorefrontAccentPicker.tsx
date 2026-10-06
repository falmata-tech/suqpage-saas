import React, { useId, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet, type GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useApp } from "./runtime";
import { Button, colors } from "./ui";
import { ACCENT_PRESETS, storefrontAccent } from "../../../lib/storefront-accent";
import { hexToHsv, hsvToHex, type HsvColor } from "../../../lib/visual-color";
function ColorStrip({ label, value, stops, disabled, change }: { label: string; value: number; stops: string[]; disabled: boolean; change: (value: number) => void }) {
  const id = useId().replace(/[^a-z0-9]/gi, '');
  const [width, setWidth] = useState(1);
  const select = (e: GestureResponderEvent) => change(Math.max(0, Math.min(1, e.nativeEvent.locationX / width)));
  return <View style={{ gap: 3 }}>
    <Text style={{ color: colors.ink, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={label+' −'} disabled={disabled} onPress={() => change(Math.max(0,value-.05))} style={s.adjust}><Text style={s.sign}>−</Text></Pressable>
      <View accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min:0, max:100, now:Math.round(value*100) }} accessibilityState={{ disabled }} accessibilityActions={[{name:'increment'},{name:'decrement'}]} onAccessibilityAction={e => !disabled && change(Math.max(0,Math.min(1,value+(e.nativeEvent.actionName==='increment'?.05:-.05))))}
        onLayout={e => setWidth(e.nativeEvent.layout.width)} onStartShouldSetResponder={() => !disabled} onMoveShouldSetResponder={() => !disabled} onResponderGrant={select} onResponderMove={select} style={{ height:44, flex:1, justifyContent:'center' }}>
        <Svg width="100%" height={28} pointerEvents="none"><Defs><LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">{stops.map((color,i)=><Stop key={i} offset={i/(stops.length-1)} stopColor={color}/>)}</LinearGradient></Defs><Rect width="100%" height={28} rx={8} fill={`url(#${id})`}/></Svg>
        <View pointerEvents="none" style={{ position:'absolute',left:Math.max(0,Math.min(width-14,value*width-7)),width:14,height:36,borderWidth:2,borderColor:'#222',borderRadius:8,backgroundColor:'#ffffffaa' }}/>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={label+' +'} disabled={disabled} onPress={() => change(Math.min(1,value+.05))} style={s.adjust}><Text style={s.sign}>+</Text></Pressable>
    </View>
  </View>;
}
export default function StorefrontAccentPicker({ value, onChange, disabled = false, onClose }: { value: string; onChange: (value: string) => void; disabled?: boolean; onClose: () => void }) {
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const [hsv, setHsv] = useState(() => hexToHsv(value || '#087F75'));
  const change = (next: HsvColor) => { setHsv(next); onChange(hsvToHex(next)); };
  return <Modal transparent animationType="none" onRequestClose={onClose}>
    <View style={s.overlay}><View style={s.sheet} accessibilityViewIsModal><ScrollView contentContainerStyle={{ padding:14, paddingBottom:Math.max(24,insets.bottom+10), gap:5 }}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Text style={{fontSize:18,fontWeight:'700',color:colors.ink}}>{t('Page color')}</Text><Button secondary label={t('Done')} onPress={onClose}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{flexDirection:'row',gap:7,padding:3}}>
        <Pressable accessibilityRole="button" accessibilityState={{selected:!value,disabled}} disabled={disabled} onPress={()=>onChange('')} style={[s.adjust,{paddingHorizontal:10,borderWidth:!value?2:1}]}><Text>{t('Default')}</Text></Pressable>
        {ACCENT_PRESETS.map(color=><Pressable key={color} accessibilityRole="button" accessibilityLabel={t('Choose color {color}',{color})} accessibilityState={{selected:value===color,disabled}} disabled={disabled} onPress={()=>{setHsv(hexToHsv(color));onChange(color);}} style={[s.adjust,{borderRadius:22,backgroundColor:color,borderWidth:value===color?3:1}]}><Text style={{color:storefrontAccent(color)!.on,fontSize:20}}>{value===color?'✓':''}</Text></Pressable>)}
      </ScrollView>
      <ColorStrip label={t('Color')} value={hsv.hue/360} disabled={disabled} stops={['#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF','#FF0000']} change={hue=>change({...hsv,hue:hue*360})}/>
      <ColorStrip label={t('Color strength')} value={hsv.saturation} disabled={disabled} stops={['#FFFFFF',hsvToHex({...hsv,saturation:1,brightness:1})]} change={saturation=>change({...hsv,saturation})}/>
      <ColorStrip label={t('Brightness')} value={hsv.brightness} disabled={disabled} stops={['#000000',hsvToHex({...hsv,brightness:1})]} change={brightness=>change({...hsv,brightness})}/>
    </ScrollView></View></View>
  </Modal>;
}
const s=StyleSheet.create({overlay:{flex:1,justifyContent:'flex-end',backgroundColor:'#00000012'},sheet:{maxHeight:'70%',backgroundColor:'white',borderTopLeftRadius:18,borderTopRightRadius:18,borderWidth:1,borderColor:colors.line},adjust:{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#8b9698',borderRadius:8,backgroundColor:'white'},sign:{fontSize:22,color:colors.ink}});
