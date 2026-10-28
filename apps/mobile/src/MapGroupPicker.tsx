import React,{useEffect,useRef} from 'react';
import {Modal,Pressable,ScrollView,Text,View,StyleSheet,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {MapShop} from '@africmade/contracts';
import {mapGroupPickerLayout,MAP_GROUP_ROW_HEIGHT,MAP_GROUP_ROW_GAP} from '../../../lib/map/map-clustering';
import {useApp} from './runtime';
import {Photo,Icon,colors} from './ui';
import {registerOverlay} from './overlay-visibility';

/** Ordinary groups fit together; only the two-business accessibility fallback scrolls. */
export type MapGroupPosition={page:number;anchor:number|null};
export default function MapGroupPicker({visible,shops,onSelect,onClose,initialAnchor=null,onPositionChange}:{visible:boolean;shops:MapShop[];onSelect:(shop:MapShop)=>void;onClose:()=>void;initialPage?:number;initialAnchor?:number|null;onPositionChange?:(position:MapGroupPosition)=>void}){
 const {t}=useApp(),{width,height,fontScale}=useWindowDimensions(),insets=useSafeAreaInsets();
 const key=shops.map(shop=>shop.id).join(','),scale=Math.max(1,fontScale||1);
 const lastSelected=useRef<number|null>(initialAnchor),rows=useRef(new Map<number,{focus?:()=>void}>()),scroll=useRef<ScrollView>(null),positionChange=useRef(onPositionChange);positionChange.current=onPositionChange;
 const availableWidth=Math.max(0,Math.min(700,width-insets.left-insets.right-24)),availableHeight=Math.max(0,height-insets.top-insets.bottom-24);
 const {rowHeight,compact,admitted,capacity,chromeHeight,needsScroll}=mapGroupPickerLayout(availableWidth,availableHeight,scale,shops.length),open=visible&&admitted&&shops.length>0,columns=availableWidth>=600?2:1;
 useEffect(()=>{if(!shops.some(shop=>shop.id===lastSelected.current))lastSelected.current=null;},[key]);
 useEffect(()=>{if(open)positionChange.current?.({page:0,anchor:lastSelected.current});},[open,key]);
 useEffect(()=>{if(open)return registerOverlay();},[open]);
 function restoreAnchor(){
  const id=lastSelected.current;if(id===null)return;
  if(needsScroll){const index=shops.findIndex(shop=>shop.id===id);if(index<0||!scroll.current)return;scroll.current.scrollTo({y:Math.floor(index/columns)*(rowHeight+MAP_GROUP_ROW_GAP),animated:false});}
  rows.current.get(id)?.focus?.();
 }
 useEffect(()=>{if(!open||needsScroll)return;const timer=requestAnimationFrame(restoreAnchor);return()=>cancelAnimationFrame(timer);},[open,key,capacity,rowHeight,needsScroll]);
 const nameLines=compact?1:2,textHeight=rowHeight-2*(rowHeight<MAP_GROUP_ROW_HEIGHT?8:10)-2;
 if(!open)return null;
 const renderRows=()=><View testID="map-group-rows" style={s.rows}>{shops.map(shop=>{const location=shop.city.trim()||shop.region.trim(),description=shop.description.trim(),showDescription=Boolean(description)&&nameLines*19*scale+(location?17*scale+4:0)+16*scale+4<=textHeight;return <Pressable key={shop.id} testID={`map-group-business-${shop.id}`} ref={value=>{if(value)rows.current.set(shop.id,value);else rows.current.delete(shop.id);}} accessibilityRole="button" accessibilityLabel={[shop.name,description,location].filter(Boolean).join('. ')} onPress={()=>{lastSelected.current=shop.id;positionChange.current?.({page:0,anchor:shop.id});onSelect(shop);}} style={[s.card,rowHeight<MAP_GROUP_ROW_HEIGHT&&{padding:8},{height:rowHeight,width:columns===2?'48.5%':'100%'}]}>
   <View style={[s.image,rowHeight<MAP_GROUP_ROW_HEIGHT&&{width:64,height:64}]}><Photo refPath={shop.heroImagePath} height={rowHeight<MAP_GROUP_ROW_HEIGHT?64:76}/></View><View style={s.identity}><Text numberOfLines={nameLines} style={s.name}>{shop.name}</Text>{showDescription&&<Text testID={`map-group-description-${shop.id}`} numberOfLines={1} style={s.description}>{description}</Text>}{Boolean(location)&&<Text testID={`map-group-location-${shop.id}`} numberOfLines={1} style={s.city}>{location}</Text>}</View>
  </Pressable>;})}</View>;
 return <Modal visible transparent animationType="none" onRequestClose={onClose}>
  <View style={[s.backdrop,{paddingTop:insets.top+12,paddingBottom:insets.bottom+12,paddingLeft:insets.left+12,paddingRight:insets.right+12}]}>
   <Pressable accessible={false} onPress={onClose} style={StyleSheet.absoluteFill}/>
   <View accessibilityViewIsModal testID="map-group-picker" style={[s.picker,{width:availableWidth,maxHeight:availableHeight}]}>
    <View style={s.heading}><Text accessibilityRole="header" numberOfLines={2} style={s.title}>{t('Choose a business')}</Text><Pressable accessibilityRole="button" accessibilityLabel={t('Close business list')} onPress={onClose} style={s.close}><Icon name="close" size={20}/></Pressable></View>
    <View style={s.summary}><Text style={s.count}>{shops.length===1?t('1 business'):t('{count} businesses',{count:shops.length})}</Text></View>
    {needsScroll?<ScrollView ref={scroll} testID="map-group-scroll" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator onContentSizeChange={restoreAnchor} style={[s.scroll,{maxHeight:Math.max(0,availableHeight-chromeHeight)}]}>{renderRows()}</ScrollView>:renderRows()}
   </View>
  </View>
 </Modal>;
}
const s=StyleSheet.create({
 backdrop:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#13232d70'},
 picker:{padding:10,gap:8,borderRadius:14,backgroundColor:'white'},heading:{flexDirection:'row',alignItems:'center',gap:10,minHeight:48},
 title:{flex:1,minWidth:0,fontSize:18,lineHeight:24,fontWeight:'800',color:colors.ink},
 close:{width:48,height:48,borderWidth:1,borderColor:colors.line,borderRadius:7,justifyContent:'center',alignItems:'center'},
 summary:{flexDirection:'row',alignItems:'center',gap:8},count:{flex:1,minWidth:0,fontSize:13,lineHeight:18,fontWeight:'700',color:colors.ink},
 scroll:{minHeight:0,flexShrink:1},rows:{flexDirection:'row',flexWrap:'wrap',gap:MAP_GROUP_ROW_GAP},card:{minHeight:48,flexDirection:'row',alignItems:'center',gap:12,padding:10,borderWidth:1,borderColor:colors.line,borderRadius:9},
 image:{width:76,height:76,overflow:'hidden',borderRadius:6},identity:{flex:1,minWidth:0,gap:4},name:{fontSize:14,lineHeight:19,fontWeight:'700',color:colors.ink},description:{fontSize:12,lineHeight:16,color:colors.muted},city:{fontSize:12,lineHeight:17,color:colors.muted},
});
