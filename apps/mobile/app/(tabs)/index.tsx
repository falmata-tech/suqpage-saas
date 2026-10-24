import MarketSearchControls from '../../src/MarketSearchControls';
import ProductSupply from '../../src/ProductSupply';
import {marketSearchParams,marketWorkspaceParams,type MarketScope,type MarketSearch} from '../../../../lib/market-search';
import {emptyMarketWorkspace,hasExplicitMarketIntent,marketWorkspaceFromParams} from '../../../../lib/market-workspace';
import {useMarketFeed,type MarketBatch} from '../../../../lib/use-market-feed';
import {countryName} from '../../../../lib/countries';
import {MAP_MAX_ZOOM,MAP_NATIVE_MAX_ZOOM,mapGroupCapacity} from '../../../../lib/map/map-clustering';
import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {View,Text,Pressable,FlatList,Animated,Platform,Keyboard,BackHandler,AccessibilityInfo,useWindowDimensions,StyleSheet,PanResponder} from 'react-native';
import {router,useFocusEffect,useIsFocused,useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {readMarketSession,rememberMarketSession} from '../../src/market-session';
import type {Market,MapShop,SearchItem} from '@suqpage/contracts';
import {API,request,useApp} from '../../src/runtime';
import {Screen,Copy,Photo,Status,Icon,colors,Button,useOpenLink} from '../../src/ui';
import {IconButton,Sheet} from '../../src/chrome';
import PublicActionDock from '../../src/PublicActionDock';
import MarketMap from '../../src/MarketMap';
import MapGroupPicker,{type MapGroupPosition} from '../../src/MapGroupPicker';
import {readMapReturnSession,rememberMapReturnSession} from '../../src/map-return-session';
import {initialMapView} from '../../src/native-map-model';
import {markerIndex,currentGroupMembers} from '../../src/map-markers';
import {ResourceSkeleton} from '../../src/ResourceLoading';
import {useBlockedBusinesses} from '../../src/blocked-businesses';
import type {MapControls,MapViewpoint} from '../../src/map-contract';
import {MARKET_STOREFRONT_COPY} from '../../../../lib/storefront-copy';
const EMPTY_SHOPS:MapShop[]=[];
const PANEL_EDGE=16;
const horizontalHandleMove=({dx,dy}:{dx:number;dy:number})=>Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*1.3;
async function loadBatch(params:string,signal:AbortSignal):Promise<MarketBatch<Market,SearchItem>> {
 const data=await request<Market>('market?'+params,{signal});
 return {data,items:data.items,page:data.page,pages:data.pages,total:data.total};
}
function useIndependentMarket(scope:MarketScope,value:MarketSearch,excluded:string) {
 const key=marketSearchParams(scope,value).toString()+(excluded?'&exclude='+excluded:'');
 return useMarketFeed(key,loadBatch,undefined,{scopeKey:JSON.stringify([API,scope,excluded])});
}
export default function MarketScreen() {
 const blocked=useBlockedBusinesses(),{t,locale}=useApp(),openLink=useOpenLink(),{width,height:viewportHeight,fontScale}=useWindowDimensions(),insets=useSafeAreaInsets(),focused=useIsFocused();
 const groupCapacity=mapGroupCapacity(Math.max(0,Math.min(700,width-insets.left-insets.right-24)),Math.max(0,viewportHeight-insets.top-insets.bottom-24),fontScale);
 const mapRouteFocused=useRef(focused);mapRouteFocused.current=focused;
 const incomingParams=useLocalSearchParams<Record<string,string|string[]>>(),incomingKey=JSON.stringify(incomingParams);
 const incoming=useMemo(()=>{const params=new URLSearchParams();for(const[key,value]of Object.entries(incomingParams))for(const item of Array.isArray(value)?value:[value])params.append(key,item);return params;},[incomingKey]);
 const initial=useRef<ReturnType<typeof emptyMarketWorkspace>|null>(null);
 if(!initial.current)initial.current=hasExplicitMarketIntent(incoming)?marketWorkspaceFromParams(incoming):readMarketSession()||emptyMarketWorkspace();
 const [businessSearch,setBusinessSearch]=useState(initial.current.business),[productSearch,setProductSearch]=useState(initial.current.product),[panel,setPanel]=useState(initial.current.mode==='products');
 const businessScope=marketSearchParams('businesses',businessSearch).toString(),previousBusinessScope=useRef(businessScope);
 const [returned]=useState(()=>readMapReturnSession(API,businessScope));
 const [appliedIncomingKey,setAppliedIncomingKey]=useState(incomingKey);
 const [stageHeight,setStageHeight]=useState(500),[selected,setSelected]=useState<MapShop|null>(null),[nearbyIds,setNearbyIds]=useState<number[]>(returned?.ids||[]),[reduced,setReduced]=useState(false);
 const [pickerPosition,setPickerPosition]=useState<MapGroupPosition>({page:returned?.page||0,anchor:returned?.anchor??null});
 const camera=useRef<MapViewpoint>(returned?{center:returned.camera.center,zoom:Platform.OS==='web'?returned.camera.zoom:Math.max(1,returned.camera.zoom-1)}:initialMapView);
 const groupTrigger=useRef<{focus?:()=>void;isConnected?:boolean}|null>(null);
 const [dockHeight,setDockHeight]=useState(48);
 const [mapZoom,setMapZoom]=useState(camera.current.zoom);
 const map=useRef<MapControls>(null),results=useRef<FlatList<SearchItem>>(null),progress=useRef(new Animated.Value(panel?1:0)).current;
 const panelState=useRef(panel),progressValue=useRef(panel?1:0),dragStart=useRef(0),dragOrigin=useRef(panel),dragged=useRef(false),animation=useRef<Animated.CompositeAnimation|null>(null);
 panelState.current=panel;
 const animatePanel=useCallback((next:boolean)=>{animation.current?.stop();animation.current=Animated.timing(progress,{toValue:next?1:0,duration:reduced?0:240,useNativeDriver:Platform.OS!=='web'});animation.current.start();},[progress,reduced]);
 const settlePanel=useCallback((next:boolean)=>{Keyboard.dismiss();setPanel(next);if(next===panelState.current)animatePanel(next);},[animatePanel]);
 const handleGesture=useMemo(()=>PanResponder.create({
  onMoveShouldSetPanResponder:(_,g)=>horizontalHandleMove(g),
  onMoveShouldSetPanResponderCapture:(_,g)=>horizontalHandleMove(g),
  onPanResponderGrant:()=>{dragged.current=true;dragOrigin.current=panelState.current;dragStart.current=progressValue.current;animation.current?.stop();Keyboard.dismiss();},
  onPanResponderMove:(_,g)=>progress.setValue(Math.max(0,Math.min(1,dragStart.current-g.dx/Math.max(1,width-PANEL_EDGE*2)))),
  onPanResponderRelease:(_,g)=>settlePanel(Math.abs(g.dx)>=48?g.dx<0:dragOrigin.current),
  onPanResponderTerminate:()=>settlePanel(dragOrigin.current),
  onPanResponderTerminationRequest:()=>true,
 }),[progress,settlePanel,width]);
 const excluded=blocked.list.map(v=>v.id).join(','),businesses=useIndependentMarket('businesses',businessSearch,excluded),products=useIndependentMarket('products',productSearch,excluded);
 const businessData=businesses.batch?.data,productData=products.batch?.data;
 const shops=useMemo(()=>blocked.ready?businessData?.showrooms.filter(s=>!blocked.list.some(b=>b.id===s.id))||EMPTY_SHOPS:EMPTY_SHOPS,[blocked.ready,businessData?.showrooms,blocked.list]);
 const currentMapIndex=useMemo(()=>markerIndex(shops,groupCapacity),[shops,groupCapacity]);
 const nearby=useMemo(()=>currentGroupMembers(currentMapIndex,shops,nearbyIds,mapZoom+(Platform.OS==='web'?0:1)),[currentMapIndex,nearbyIds,shops,mapZoom]);
 const mapReady=businesses.snapshotCurrent&&!businesses.loading&&!businesses.error;
 const selectedShop=mapReady&&selected&&(!nearbyIds.length||nearby.length>0)?shops.find(shop=>shop.id===selected.id)||null:null;
 const selectedLocation=selectedShop?[selectedShop.city.trim(),(selectedShop.countryCode?countryName(selectedShop.countryCode,locale):'')||selectedShop.region.trim()].filter((value,index,values)=>value&&values.indexOf(value)===index).join(' · '):'';
 useFocusEffect(useCallback(()=>{
  if(appliedIncomingKey===incomingKey)return;
  if(hasExplicitMarketIntent(incoming)){const next=marketWorkspaceFromParams(incoming);setBusinessSearch(next.business);setProductSearch(next.product);setPanel(next.mode==='products');}
  setAppliedIncomingKey(incomingKey);
 },[incomingKey,appliedIncomingKey]));
 useFocusEffect(useCallback(()=>{
  // Apply explicit navigation before persisting; a bare Market return retains
  // the existing independent searches, loaded feed and mounted map.
  if(appliedIncomingKey!==incomingKey)return;
  const state={mode:panel?'products' as const:'businesses' as const,business:businessSearch,product:productSearch};
  rememberMarketSession(state);
  // Expo can focus this tab before its asynchronous history transition finishes.
  // Never replace the outgoing page's URL during that interval.
  if(Platform.OS==='web'&&window.location.pathname==='/'){const params=marketWorkspaceParams(state.mode,businessSearch,productSearch);window.history.replaceState(window.history.state,'','/?'+params.toString());}
 },[businessSearch,productSearch,panel,incomingKey,appliedIncomingKey]));
 // Expo Router owns browser Back/Forward and updates local route params. A raw
 // popstate listener would also consume the stale intermediate entry emitted by
 // the router's own history.go, which its navigation adapter deliberately ignores.
 useEffect(()=>{if(previousBusinessScope.current===businessScope)return;previousBusinessScope.current=businessScope;setSelected(null);setNearbyIds([]);setPickerPosition({page:0,anchor:null});saveReturn([],{page:0,anchor:null});},[businessScope]);
 useEffect(()=>{if(!blocked.ready||businesses.loading||!businessData||!nearbyIds.length||nearby.length)return;setSelected(null);setNearbyIds([]);setPickerPosition({page:0,anchor:null});saveReturn([],{page:0,anchor:null});},[blocked.ready,businesses.loading,businessData,nearbyIds,nearby.length]);
 useEffect(()=>{results.current?.scrollToOffset({offset:0,animated:false});},[products.displayedSnapshotKey]);
 useEffect(()=>{void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>sub.remove();},[]);
 useEffect(()=>{const id=progress.addListener(({value})=>{progressValue.current=value;});return()=>progress.removeListener(id);},[progress]);
 useEffect(()=>{animatePanel(panel);return()=>animation.current?.stop();},[panel,animatePanel]);
 useFocusEffect(useCallback(()=>{if(Platform.OS==='web')return;const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(panel){setPanel(false);Keyboard.dismiss();return true;}return false;});return()=>sub.remove();},[panel]));
 function chooseBusiness(shop:MapShop){if(!mapReady)return;map.current?.focus(shop);setSelected(shop);}
 function saveReturn(ids=nearbyIds,position=pickerPosition){const [longitude,latitude]=camera.current.center;rememberMapReturnSession(API,businessScope,{ids,page:position.page,anchor:position.anchor,camera:{center:[((longitude+180)%360+360)%360-180,latitude],zoom:Math.max(1,Math.min(MAP_MAX_ZOOM,camera.current.zoom+(Platform.OS==='web'?0:1)))}});}
 function rememberView(view:MapViewpoint){if(!mapRouteFocused.current)return;camera.current=view;if(mapReady)saveReturn(previousBusinessScope.current===businessScope?nearbyIds:[],previousBusinessScope.current===businessScope?pickerPosition:{page:0,anchor:null});}
 function rememberPosition(position:MapGroupPosition){if(!mapReady)return;setPickerPosition(position);saveReturn(nearbyIds,position);}
 function openGroup(members:MapShop[]){if(!mapReady)return;const ids=[...new Set(members.map(shop=>shop.id))].sort((a,b)=>a-b);if(!currentGroupMembers(currentMapIndex,shops,ids,camera.current.zoom+(Platform.OS==='web'?0:1)).length)return;if(Platform.OS==='web')groupTrigger.current=document.activeElement as HTMLElement|null;setSelected(null);setNearbyIds(ids);setPickerPosition({page:0,anchor:null});saveReturn(ids,{page:0,anchor:null});}
 function closeGroup(){const ids=nearbyIds.join(',');setSelected(null);setNearbyIds([]);setPickerPosition({page:0,anchor:null});saveReturn([],{page:0,anchor:null});if(Platform.OS==='web')requestAnimationFrame(()=>requestAnimationFrame(()=>{const trigger=groupTrigger.current;if(trigger?.isConnected)trigger.focus?.();else document.querySelector<HTMLElement>(`[data-map-group-ids="${ids}"] [role="button"]`)?.focus();}));}
 function loadMore(){if(panel&&!products.moreError)products.loadMore();}
 const drawerWidth=width-PANEL_EDGE,items=blocked.ready?(products.batch?.items||[]).filter(i=>i.kind==='product'):[];
 return <Screen scroll={false}>
  <Text accessibilityRole="header" style={m.programmaticTitle}>{t('AfricMade Market')}</Text>
  <View testID="market-introduction" style={m.intro}>
   <Text accessibilityRole="header" style={m.introTitle}>{t(MARKET_STOREFRONT_COPY.title)}</Text>
   <Text style={m.introDescription}>{t(MARKET_STOREFRONT_COPY.description)}</Text>
  </View>
  <View testID="market-mode-row" style={m.modeRow}><View style={m.modeSwitch} accessibilityRole="tablist" accessibilityLabel={t('Search for')}>{[{key:'businesses',label:'Business locations',icon:'map'},{key:'products',label:'Product listings',icon:'package'}].map(mode=><Pressable key={mode.key} accessibilityRole="tab" accessibilityState={{selected:panel===(mode.key==='products')}} aria-selected={panel===(mode.key==='products')} onPress={()=>settlePanel(mode.key==='products')} style={[m.modeButton,panel===(mode.key==='products')&&m.activeMode]}>{width>360&&<Icon name={mode.icon} size={16}/>}<Text style={m.modeText}>{t(mode.label)}</Text></Pressable>)}</View></View>
  <View style={m.activeControls}><MarketSearchControls scope={panel?'products':'businesses'} value={panel?productSearch:businessSearch} onChange={panel?setProductSearch:setBusinessSearch} metadata={(panel?productData:businessData)||null}/>{Boolean(panel?products.error:businesses.error)&&<Status error={panel?products.error:businesses.error} retry={panel?products.retry:businesses.retry}/>}</View>
  <View testID="market-stage" style={m.stage} onLayout={e=>setStageHeight(e.nativeEvent.layout.height)}>
   <Animated.View aria-hidden={panel} {...(Platform.OS==='web'?{inert:panel}:{})} accessibilityElementsHidden={panel} importantForAccessibility={panel?'no-hide-descendants':'auto'} style={[m.mapPanel,{pointerEvents:panel?'none':'auto',width:drawerWidth,zIndex:panel?1:8,transform:[{translateX:progress.interpolate({inputRange:[0,1],outputRange:[0,-(width-PANEL_EDGE*2)]})}]}]}>
    <MarketMap ref={map} height={Math.max(100,stageHeight)} shops={shops} groupCapacity={groupCapacity} onSelect={chooseBusiness} groups={blocked.ready?businessData?.nearbyGroups:[]} selectedId={selectedShop?.id} onGroup={openGroup} onZoomChange={setMapZoom} initialView={camera.current} onViewChange={rememberView}/>
    {!panel&&businesses.loading&&<View testID="map-updating" style={[m.updating,stageHeight<180&&{left:'auto',right:12}]}><Status refreshing/></View>}
    <View testID="map-tools" style={[m.mapTools,stageHeight<380&&{flexDirection:'row'},stageHeight<180&&{left:12,right:'auto',top:8}]}><IconButton touchSize={48} label={t('Zoom in')} icon="plus" disabled={mapZoom>=(Platform.OS==='web'?MAP_MAX_ZOOM:MAP_NATIVE_MAX_ZOOM)} onPress={()=>map.current?.zoom(1)}/><IconButton touchSize={48} label={t('Zoom out')} icon="minus" disabled={mapZoom<=1} onPress={()=>map.current?.zoom(-1)}/><IconButton touchSize={48} label={t('Reset map')} icon="target" onPress={()=>map.current?.reset()}/></View>
    {!businesses.loading&&!businesses.error&&shops.length===0&&<View accessibilityRole="summary" style={m.mapHint}><Text style={m.small}>{t('No businesses with public map locations match these filters.')}</Text><Pressable accessibilityRole="button" onPress={()=>settlePanel(true)} style={m.mapHintAction}><Text style={m.mapHintActionText}>{t('Browse product listings')}</Text></Pressable></View>}
    {(businessData?.total||0)>shops.length&&<View style={m.mapLimit}><Text style={m.small}>{t('Showing {count} businesses. Search or filter to see more.',{count:shops.length})}</Text></View>}
   </Animated.View>
   <Animated.View testID="search-drawer" aria-hidden={!panel} {...(Platform.OS==='web'?{inert:!panel}:{})} accessibilityElementsHidden={!panel} importantForAccessibility={panel?'auto':'no-hide-descendants'} style={[m.drawer,{pointerEvents:panel?'auto':'none',zIndex:panel?8:1,width:drawerWidth,transform:[{translateX:progress.interpolate({inputRange:[0,1],outputRange:[width-PANEL_EDGE*2,0]})}]}]}>
    <FlatList ref={results} testID="product-feed" data={items} keyExtractor={item=>String(item.id)} keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:12,gap:12,paddingBottom:dockHeight+36}} initialNumToRender={6} windowSize={5} maxToRenderPerBatch={6} onEndReached={loadMore} onEndReachedThreshold={0.3}
     ListHeaderComponent={<View style={{minHeight:24,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}><Text accessibilityRole="header" style={{fontSize:16,fontWeight:'700',color:colors.ink}}>{t('Products')}</Text>{panel&&products.updating&&<Status refreshing/>}</View>}
     ListEmptyComponent={products.initialLoading?<ResourceSkeleton variant="search"/>:!products.loading&&!products.error?<View style={{paddingVertical:24,gap:10}}><Copy big>{t('No matches found')}</Copy><Copy muted>{t('Try another product, category or city.')}</Copy></View>:null}
     renderItem={({item})=><View testID={`market-product-${item.id}`} style={m.result}><Pressable accessibilityRole="button" accessibilityLabel={item.name} onPress={()=>router.push({pathname:'/product',params:{handle:item.handle,id:item.id}})} style={m.resultProduct}><View style={{width:78}}><Photo refPath={item.image} height={98}/></View><View style={{flex:1,gap:5,paddingVertical:7}}><Text numberOfLines={2} style={m.resultName}>{item.name}</Text><ProductSupply kind={item.offeringKind} availability={item.availability}/><Text numberOfLines={2} style={m.small}>{item.description}</Text>{Boolean(item.city?.trim()||item.region?.trim())&&<Text testID={`product-result-location-${item.id}`} numberOfLines={1} style={m.small}>{item.city?.trim()||item.region?.trim()}</Text>}</View></Pressable><Pressable accessibilityRole="link" onPress={()=>router.push({pathname:'/shop/[handle]',params:{handle:item.handle}})} style={m.resultBusiness}><Text style={m.resultBusinessName}>{t('From {business}',{business:item.businessName})}</Text></Pressable></View>}
     ListFooterComponent={<View style={{paddingVertical:10}}><Status refreshing={products.loadingMore} error={products.moreError} retry={products.loadMore}/>{products.hasMore&&!products.loadingMore&&!products.moreError?<Button secondary label={t('Load more')} onPress={products.loadMore}/>:items.length>0&&products.snapshotCurrent&&!products.loading&&!products.error&&!products.hasMore?<Text accessibilityLiveRegion="polite" style={m.small}>{t("You've seen all the results.")}</Text>:null}</View>}/>
   </Animated.View>
   {/* Pressable owns its responder handlers; the wrapper takes over handle drags. */}
   <Animated.View {...handleGesture.panHandlers} style={[m.panelPeek,{transform:[{translateX:progress.interpolate({inputRange:[0,1],outputRange:[width-80,0]})}]}]}><Pressable accessibilityRole="button" accessibilityLabel={t(panel?'Map only':'View products')} onPressIn={()=>{dragged.current=false;}} onPress={()=>{if(!dragged.current)settlePanel(!panel);dragged.current=false;}} style={m.handleButton}><View style={m.grip}/><Icon name={panel?'arrow':'back'} size={18}/></Pressable></Animated.View>
   <View testID="market-public-actions" onLayout={event=>setDockHeight(Math.max(48,Math.ceil(event.nativeEvent.layout.height)))} style={[m.buying,stageHeight<180?width>=600?{right:80,bottom:8}:panel?{right:12,bottom:8}:{left:12,bottom:8}:stageHeight<320?{left:Math.max(16,(width-Math.min(244,width-24))/2),bottom:24}:{right:panel?7:12,bottom:24}]}><PublicActionDock placement="market" horizontal={stageHeight>=180&&stageHeight<320} compact={panel||stageHeight<320}/></View>
  </View>
  <Pressable accessibilityRole="link" onPress={()=>void openLink('https://www.openstreetmap.org/copyright')} style={{backgroundColor:'white',padding:5}}><Text style={{textAlign:'right',fontSize:11,color:colors.ink}}>© OpenStreetMap contributors</Text></Pressable>
  {nearby.length>0&&<MapGroupPicker visible={focused&&mapReady&&!selectedShop} shops={nearby} initialPage={pickerPosition.page} initialAnchor={pickerPosition.anchor} onPositionChange={rememberPosition} onClose={closeGroup} onSelect={shop=>{if(mapReady){rememberPosition({...pickerPosition,anchor:shop.id});setSelected(shop);}}}/>}
  <Sheet visible={focused&&Boolean(selectedShop)} title={t('Business')} onClose={()=>nearbyIds.length?closeGroup():setSelected(null)}>{selectedShop&&<>{nearby.length>0&&<Button secondary label={t('Back to businesses')} onPress={()=>setSelected(null)}/>}<Photo refPath={selectedShop.heroImagePath} height={180}/><Copy big>{selectedShop.name}</Copy>{Boolean(selectedLocation)&&<Copy muted>{selectedLocation}</Copy>}<Copy>{selectedShop.description}</Copy><Button label={t('Explore this business')} onPress={()=>{const handle=selectedShop.handle;saveReturn();setSelected(null);router.push({pathname:'/shop/[handle]',params:{handle}});}}/></>}</Sheet>
 </Screen>;
}
const m=StyleSheet.create({
 programmaticTitle:{position:'absolute',width:1,height:1,overflow:'hidden',color:'transparent'},
 intro:{paddingHorizontal:16,paddingTop:8,paddingBottom:9,gap:3,backgroundColor:'white'},
 introTitle:{fontSize:20,lineHeight:25,fontWeight:'800',color:colors.ink},
 introDescription:{fontSize:13,lineHeight:18,color:colors.muted},
 modeRow:{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingHorizontal:12,backgroundColor:'white'},
 modeSwitch:{maxWidth:'100%',flexShrink:1,flexDirection:'row',gap:2,backgroundColor:'#f5f7f6',borderWidth:1,borderColor:colors.line,borderRadius:10},
 modeButton:{flexShrink:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,minWidth:48,minHeight:48,paddingHorizontal:12,borderRadius:8},activeMode:{backgroundColor:colors.soft},modeText:{fontSize:12,fontWeight:'700',color:colors.ink,flexShrink:1,textAlign:'center'},
 updating:{pointerEvents:'none',position:'absolute',top:12,left:12,backgroundColor:'white',padding:6,borderRadius:5},
 activeControls:{paddingHorizontal:12,paddingBottom:8,gap:7,backgroundColor:'white',borderBottomWidth:1,borderColor:colors.line},
 mapPanel:{position:'absolute',left:0,top:0,bottom:0,overflow:'hidden',borderRightWidth:1,borderColor:colors.line,borderTopRightRadius:14,backgroundColor:'#dfe9e8'},
 mapTools:{position:'absolute',right:12,top:12,gap:7},mapHint:{position:'absolute',top:12,left:12,right:70,backgroundColor:'#fffffff5',padding:10,borderRadius:10,borderWidth:1,borderColor:colors.line,gap:7},mapHintAction:{alignSelf:'flex-start',minHeight:44,justifyContent:'center',paddingHorizontal:12,borderRadius:8,backgroundColor:colors.brand},mapHintActionText:{color:'white',fontWeight:'700',fontSize:12},mapLimit:{position:'absolute',left:12,bottom:100,right:65,padding:8,borderRadius:8,backgroundColor:'white'},
 drawer:{position:'absolute',left:PANEL_EDGE,top:0,bottom:0,backgroundColor:'white',borderLeftWidth:1,borderColor:colors.line,boxShadow:'-4px 0 14px #0002'},
 panelPeek:{position:'absolute',zIndex:11,left:PANEL_EDGE,top:'50%',marginTop:-24,height:48,width:48,backgroundColor:'#fffaf6',borderWidth:1,borderColor:colors.line,borderRadius:14,boxShadow:'0 3px 12px #20353726'},handleButton:{minWidth:48,minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
 grip:{width:3,height:18,borderRadius:2,backgroundColor:'#d5a48b'},
 buying:{position:'absolute',zIndex:14},
  stage: {
    flex: 1,
    minHeight: 0,
    backgroundColor: "#dfe9e8",
    overflow: "hidden",
  },
  small: { fontSize: 12, lineHeight: 17, color: colors.muted },
  count: { fontSize: 12, color: colors.muted, paddingTop: 4 },
  resultProduct: { flexDirection: "row", gap: 10, paddingRight: 8 },
  resultBusiness: { marginLeft: 88, minHeight: 48, justifyContent: "center", paddingVertical: 4, paddingRight: 8 },
  resultBusinessName: { color: colors.brand, fontSize: 12, lineHeight: 18, fontWeight: "700", textDecorationLine: "underline" },
  result: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    overflow: "hidden",
    minHeight: 94,
  },
  resultName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: colors.ink,
  },
});
