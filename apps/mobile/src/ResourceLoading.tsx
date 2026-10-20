import React,{useState} from 'react';
import {View,Text,StyleSheet,useWindowDimensions} from 'react-native';
import {useApp} from './runtime';
import {Status,colors} from './ui';
import {catalogCardStyle,CATALOG_CARD_GAP} from './catalog-card-layout';

type Variant='featured'|'showroom'|'product'|'profile'|'editor'|'list'|'rows'|'thread'|'search';
function Block({height,width='100%'}:{height:number;width?:number|`${number}%`}){return <View style={{height,width,borderRadius:5,backgroundColor:colors.line}}/>;}
function Lines(){return <View style={{gap:8}}><Block height={18} width="74%"/><Block height={12}/><Block height={12} width="86%"/></View>;}

/** Static silhouettes only: never focusable, editable, or exposed as fake records. */
export function ResourceSkeleton({variant}:{variant:Variant}){
  const{t}=useApp(),{fontScale}=useWindowDimensions(),[width,setWidth]=useState(0);
  const productCards=(imageHeight:number)=> <View testID="resource-skeleton-grid" onLayout={event=>{const next=event.nativeEvent.layout.width;if(Number.isFinite(next)&&next>0)setWidth(next);}} style={styles.grid}>{[0,1,2,3].map(index=><View key={index} testID="resource-skeleton-card" style={[styles.card,catalogCardStyle(width,fontScale)]}><Block height={imageHeight}/><View style={styles.inset}><Lines/><Block height={20} width="38%"/>{variant==='showroom'&&<Block height={48}/>}</View></View>)}</View>;
  return <View testID={`resource-skeleton-${variant}`} style={{gap:12}}>
    <Text accessibilityRole="text" accessibilityLiveRegion="polite" style={styles.status}>{t('Loading…')}</Text>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={{gap:16}}>
      {variant==='featured'?<><Block height={22} width="68%"/><View testID="resource-skeleton-featured-categories" style={{flexDirection:'row',gap:8,overflow:'hidden',maxWidth:'100%',pointerEvents:'none'}}>{[0,1,2,3].map(index=><View key={index} testID="resource-skeleton-featured-category" style={{width:176,minHeight:96,flexShrink:0,padding:10,gap:8,justifyContent:'space-between',borderWidth:1,borderColor:colors.line,borderRadius:6}}><View testID="resource-skeleton-featured-category-heading" style={{flexDirection:'row',alignItems:'center',gap:8}}><View testID="resource-skeleton-featured-category-art"><Block height={32} width={32}/></View><View testID="resource-skeleton-featured-category-name" style={{flex:1,minWidth:0,gap:4}}><Block height={14}/><Block height={14} width="82%"/></View></View><View testID="resource-skeleton-featured-category-schedule"><Block height={12} width="86%"/></View></View>)}</View>{productCards(145)}</>
      :variant==='showroom'?<><Block height={210}/><View style={{padding:18,gap:16}}><Block height={13} width="42%"/><Block height={31} width="76%"/><Lines/><Block height={24} width="38%"/><Block height={48}/>{productCards(160)}</View></>
      :variant==='product'?<><Block height={270}/><Block height={31} width="78%"/><Block height={16} width="52%"/><Block height={20} width="38%"/><Lines/><Block height={48}/><Block height={48}/></>
      :variant==='profile'?<><Block height={31} width="40%"/><View style={styles.panel}><View style={{flexDirection:'row',gap:12}}><Block height={48} width={48}/><View style={{flex:1,gap:10}}><Block height={22} width="80%"/><Block height={16} width="54%"/></View></View><Block height={16} width="60%"/></View><View style={{flexDirection:'row',gap:8}}>{[0,1,2].map(index=><View key={index} style={[styles.panel,{flex:1}]}><Block height={24} width="48%"/><Block height={12}/></View>)}</View><View style={styles.panel}>{[0,1,2,3,4,5].map(index=><View key={index} style={{height:64,justifyContent:'center',gap:7}}><Block height={17} width="55%"/><Block height={12} width="84%"/></View>)}</View></>
      :variant==='search'?<>{[0,1,2,3].map(index=><View key={index} style={[styles.panel,{flexDirection:'row',gap:12}]}><Block height={98} width={78}/><View style={{flex:1,gap:10}}><Lines/><Block height={12} width="60%"/></View></View>)}</>
      :variant==='list'?<><Block height={31} width="42%"/><Block height={48}/>{[0,1].map(index=><View key={index} style={styles.panel}><Block height={150}/><Lines/><Block height={48}/></View>)}</>
      :variant==='rows'?<>{[0,1,2].map(index=><View key={index} style={styles.panel}><Lines/></View>)}</>
      :variant==='thread'?<><Block height={24} width="65%"/><View style={{gap:16,minHeight:260,padding:12,backgroundColor:colors.background}}>{[0,1,2].map(index=><View key={index} style={[styles.panel,{width:'78%',alignSelf:index%2?'flex-end':'flex-start'}]}><Block height={12} width="42%"/><Block height={16}/><Block height={12} width="64%"/></View>)}</View><Block height={90}/><Block height={48}/></>
      :<><Block height={31} width="58%"/>{[0,1,2].map(index=><View key={index} style={{gap:8}}><Block height={15} width="38%"/><Block height={48}/></View>)}<Block height={105}/><Block height={48}/></>}
    </View>
  </View>;
}

export default function ResourceLoading({load,variant}:{load:{data:unknown;loading?:boolean;initialLoading?:boolean;error?:string;reload:()=>void};variant:Variant}){
  const initial=load.initialLoading??Boolean(load.loading&&load.data==null);
  return initial?<ResourceSkeleton variant={variant}/>:<View style={{minHeight:18}}><Status loading={false} refreshing={Boolean(load.loading)} error={load.error} retry={load.reload}/></View>;
}
const styles=StyleSheet.create({
  status:{fontSize:12,lineHeight:18,color:colors.muted},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:CATALOG_CARD_GAP},
  card:{overflow:'hidden',borderRadius:7,borderWidth:1,borderColor:colors.line,backgroundColor:'white'},
  panel:{padding:16,gap:12,borderWidth:1,borderColor:colors.line,borderRadius:8,backgroundColor:'white'},
  inset:{padding:10,gap:10},
});
