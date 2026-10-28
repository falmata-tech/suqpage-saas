import React,{useEffect,useRef,useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,Platform,useWindowDimensions} from 'react-native';
import type {Market} from '@africmade/contracts';
import {emptyMarketSearch,hasMarketCriteria,type MarketScope,type MarketSearch} from '../../../lib/market-search';
import {countryName} from '../../../lib/countries';
import {useApp} from './runtime';
import {Sheet,CategoryArt} from './chrome';
import {Icon,Button,Field,Copy,colors} from './ui';
type OptionPicker='category'|'country'|'city';
type Picker=''|'filters'|OptionPicker;
const checkboxKeyboard=(toggle:()=>void)=>Platform.OS==='web'?{onKeyDown:(event:{key:string;repeat?:boolean;preventDefault:()=>void})=>{if(event.key===' '||event.key==='Spacebar'){event.preventDefault();if(!event.repeat)toggle();}}}:{};
export default function MarketSearchControls({scope,value,onChange,metadata,active=true}:{scope:MarketScope;value:MarketSearch;onChange:(value:MarketSearch)=>void;metadata:Pick<Market,'categories'|'countries'|'places'>|null;active?:boolean}) {
 const {t,locale}=useApp(),{width,fontScale}=useWindowDimensions();const [contentWidth,setContentWidth]=useState(Math.max(0,width-24)),[picker,setPicker]=useState<Picker>(''),[text,setText]=useState('');
 const trigger=useRef<View>(null),choiceTriggers=useRef<Partial<Record<OptionPicker,View|null>>>({}),returnTrigger=useRef<'filters'|OptionPicker>('filters'),restoreFocus=useRef(false),lastScope=useRef(scope);
 const enlarged=fontScale>1.3,wide=contentWidth>=760&&!enlarged,ready=metadata!==null;
 const count=value.categories.length+value.countries.length+value.cities.length+(scope==='products'&&value.madeToOrder?1:0);
 const change=(patch:Partial<MarketSearch>)=>onChange({...value,...patch,page:1});
 const title=picker==='filters'?'Filters':picker==='category'?'Categories':picker==='country'?'Country':'City';
 const choices=picker==='category'?(metadata?.categories||[]).map(c=>({...c,label:t(c.label)}))
  :picker==='country'?(metadata?.countries||[]).map(c=>({key:c.code,label:countryName(c.code,locale)}))
  :picker==='city'?(metadata?.places||[]).filter(c=>c.countryCode&&value.countries.includes(c.countryCode)).map(c=>({...c,label:`${c.label} · ${countryName(c.countryCode!,locale)}`})):[];
 const selected=picker==='category'?value.categories:picker==='country'?value.countries:value.cities;
 const visibleChoices=choices.filter(c=>c.label.toLocaleLowerCase().includes(text.toLocaleLowerCase()));
 useEffect(()=>{
  if(!picker&&restoreFocus.current){
   restoreFocus.current=false;if(!active||!ready||lastScope.current!==scope)return;
   const previous=returnTrigger.current,direct=previous!=='filters'&&(previous!=='city'||value.countries.length>0)?choiceTriggers.current[previous]:null;
   (wide?direct||choiceTriggers.current.category:trigger.current)?.focus();
  }
 },[picker]);
 useEffect(()=>{if(lastScope.current!==scope||!active||!ready){lastScope.current=scope;setPicker('');setText('');restoreFocus.current=false;}},[scope,active,ready]);
 function close(){restoreFocus.current=true;setPicker('');}
 function openChoice(next:OptionPicker){if(!ready)return;if(!picker)returnTrigger.current=next;setText('');setPicker(next);}
 function choose(key:string){const next=selected.includes(key)?selected.filter(k=>k!==key):[...selected,key].slice(0,16);
  if(picker==='category')change({categories:next});else if(picker==='country')change({countries:next,cities:value.cities.filter(c=>next.includes(c.split(':')[0]))});else if(picker==='city')change({cities:next});
 }
 const overview=picker==='filters';
 function renderFilters(overview:boolean){return <View testID={`${scope}-filters`} style={[s.filters,wide&&s.wideFilters,wide&&!overview&&{minWidth:scope==='products'?398:264},overview&&s.overviewFilters]}>
  {([{key:'category',label:'Category',count:value.categories.length,icon:'grid'},{key:'country',label:'Country',count:value.countries.length,icon:'globe'},{key:'city',label:'City',count:value.cities.length,icon:'pin'}] as const).map(f=><Pressable key={f.key} ref={node=>{if(!overview)choiceTriggers.current[f.key]=node;}} accessibilityRole="button" accessibilityLabel={t(f.label)+(f.count?` (${f.count})`:'')} accessibilityState={{disabled:!ready||f.key==='city'&&!value.countries.length,selected:f.count>0}} aria-expanded={picker===f.key} aria-disabled={!ready||f.key==='city'&&!value.countries.length} disabled={!ready||f.key==='city'&&!value.countries.length} onPress={()=>openChoice(f.key)} style={[s.filter,wide&&!overview&&s.wideGeo,overview&&s.overviewChoice,f.count>0&&s.active,(!ready||f.key==='city'&&!value.countries.length)&&{opacity:.65}]}>
   {(overview||wide)&&<Icon name={f.icon} size={overview?18:14}/>}<Text style={[s.filterText,overview&&s.overviewText]}>{t(f.label)}</Text>{f.count>0?<Text style={s.count} testID={`${scope}-${f.key}-count`}>{f.count}</Text>:<Icon name="down" size={11}/>}</Pressable>)}
  {scope==='products'&&<Pressable accessibilityRole="checkbox" accessibilityLabel={t('Made to order')} accessibilityState={{checked:value.madeToOrder}} aria-checked={value.madeToOrder} onPress={()=>change({madeToOrder:!value.madeToOrder})} {...checkboxKeyboard(()=>change({madeToOrder:!value.madeToOrder}))} style={[s.filter,s.customFilter,wide&&!overview&&s.wideCustom,overview&&s.overviewChoice,value.madeToOrder&&s.active]}><Icon name={value.madeToOrder?'check':'package'} size={overview?18:14}/><Text style={[s.filterText,overview&&s.overviewText]}>{t('Made to order')}</Text></Pressable>}
 </View>;}
 return <View testID={`${scope}-controls`} onLayout={event=>setContentWidth(event.nativeEvent.layout.width)} style={[s.controls,wide&&s.wideControls]}>
  <View testID={`${scope}-search`} style={[s.search,wide&&s.wideSearch]}><Icon name="search" size={18}/><TextInput accessibilityLabel={t(scope==='businesses'?'Search businesses':'Search products')} placeholder={t(scope==='businesses'?'Search businesses':'Search products')} placeholderTextColor={colors.muted} value={value.query} maxLength={80} onChangeText={query=>change({query})} style={s.input} returnKeyType="search"/>
   {Boolean(value.query)&&<Pressable accessibilityRole="button" accessibilityLabel={t('Clear search')} onPress={()=>change({query:''})} style={s.clearQuery}><Icon name="close" size={17}/></Pressable>}
   {wide&&hasMarketCriteria(value)&&<Pressable accessibilityRole="button" accessibilityLabel={t('Clear all')} onPress={()=>onChange(emptyMarketSearch())} style={s.clear}><Text style={s.clearText}>{t('Clear')}</Text></Pressable>}
  </View>
  {wide?renderFilters(false):<Pressable ref={trigger} testID={`${scope}-filter-trigger`} accessibilityRole="button" accessibilityLabel={count?t('Filters, {count} selected',{count}):t('Filters')} accessibilityState={{expanded:Boolean(picker),disabled:!ready}} aria-expanded={Boolean(picker)} disabled={!ready} onPress={()=>{if(!ready)return;returnTrigger.current='filters';setPicker('filters');}} style={[s.filterTrigger,count>0&&s.active,!ready&&{opacity:.65}]}><Text style={s.triggerText}>{t('Filters')}</Text>{count>0?<Text testID={`${scope}-filter-count`} style={s.count}>{count}</Text>:<Icon name="down" size={12}/>}</Pressable>}
  <Sheet visible={active&&ready&&Boolean(picker)} title={t(title)} onClose={close}>
   {overview?<>{renderFilters(true)}<View style={s.actions}><Button secondary label={t('Clear all')} disabled={!hasMarketCriteria(value)} onPress={()=>onChange(emptyMarketSearch())}/><Button label={t('Done')} onPress={close}/></View></>:<>
    <Button secondary label={t('Back to filters')} onPress={()=>{setText('');setPicker('filters');}}/>
    {choices.length>8&&<Field label={t('Filter options')} placeholder={t('Search')} value={text} onChangeText={setText}/>}
    {visibleChoices.map(c=><Pressable key={c.key} accessibilityRole="checkbox" accessibilityState={{checked:selected.includes(c.key)}} aria-checked={selected.includes(c.key)} onPress={()=>choose(c.key)} {...checkboxKeyboard(()=>choose(c.key))} style={s.option}>{picker==='category'&&<CategoryArt name={c.key} size={26}/>}<Text style={s.optionText}>{c.label}</Text>{selected.includes(c.key)&&<Icon name="check" color={colors.brand}/>}</Pressable>)}
    {!visibleChoices.length&&<Copy>{t('No matches found')}</Copy>}
    <View style={s.actions}><Button secondary label={t('Clear')} onPress={()=>{if(picker==='category')change({categories:[]});else if(picker==='country')change({countries:[],cities:[]});else change({cities:[]});}}/><Button label={t('Done')} onPress={close}/></View>
   </>}
  </Sheet>
 </View>;
}
const s=StyleSheet.create({
 controls:{flexDirection:'row',alignItems:'stretch',gap:6},wideControls:{gap:8},search:{flex:1,minWidth:0,flexDirection:'row',alignItems:'center',minHeight:44,paddingLeft:10,backgroundColor:'white',borderWidth:1,borderColor:colors.line,borderRadius:9},wideSearch:{minWidth:220},input:{flex:1,minWidth:0,minHeight:44,padding:7,fontSize:16,color:colors.ink},clearQuery:{minHeight:44,width:44,alignItems:'center',justifyContent:'center'},
 filterTrigger:{minWidth:72,maxWidth:144,minHeight:44,flexShrink:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingHorizontal:9,paddingVertical:5,borderRadius:9,borderWidth:1,borderColor:colors.line,backgroundColor:'white'},triggerText:{flexShrink:1,fontSize:13,lineHeight:18,textAlign:'center',fontWeight:'700',color:colors.ink},
 filters:{flexDirection:'row',gap:6,alignItems:'stretch'},wideFilters:{flex:2},wideGeo:{minWidth:84},wideCustom:{minWidth:128},filter:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:3,minWidth:44,minHeight:44,paddingHorizontal:4,paddingVertical:5,borderRadius:8,borderWidth:1,borderColor:colors.line,backgroundColor:'white'},customFilter:{flex:1.5,paddingHorizontal:2},active:{borderColor:colors.brand,backgroundColor:colors.soft},filterText:{flexShrink:1,minWidth:0,maxWidth:'100%',fontSize:12,lineHeight:16,textAlign:'center',fontWeight:'600',color:colors.ink},count:{fontSize:10,fontWeight:'700',color:'white',backgroundColor:colors.brand,minWidth:16,textAlign:'center',borderRadius:8,paddingHorizontal:3,lineHeight:16},
 // A zero flex basis collapses the overview while its rows overflow into actions.
 overviewFilters:{flexDirection:'column',gap:8,flex:undefined,flexGrow:0,flexShrink:0,flexBasis:'auto'},overviewChoice:{flex:undefined,flexGrow:0,flexShrink:0,flexBasis:'auto',minHeight:48,paddingHorizontal:12,paddingVertical:10,gap:10,justifyContent:'flex-start'},overviewText:{flex:1,textAlign:'left',fontSize:14,lineHeight:20},actions:{flexDirection:'row',gap:10},clear:{paddingHorizontal:9,minWidth:44,minHeight:44,justifyContent:'center',flexShrink:0},clearText:{color:colors.brand,fontSize:12,lineHeight:16,textAlign:'center'},option:{minHeight:48,flexDirection:'row',alignItems:'center',gap:10,padding:8},optionText:{flex:1,fontSize:15,color:colors.ink},
});
