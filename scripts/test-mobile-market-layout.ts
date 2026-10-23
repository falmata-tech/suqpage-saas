import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import {createRequire} from 'node:module';
import { build } from "esbuild";
import {ABOUT_STOREFRONT_SECTIONS} from "../lib/storefront-copy";

type Element = { type: string | ((props: Record<string, unknown>) => Element); props: Record<string, unknown> & { children?: unknown } };
type Gesture = { dx: number; dy: number; vx: number };
type Handlers = {
  onMoveShouldSetPanResponder: (event: object, gesture: Gesture) => boolean;
  onMoveShouldSetPanResponderCapture: (event: object, gesture: Gesture) => boolean;
  onPanResponderGrant: () => void;
  onPanResponderMove: (event: object, gesture: Gesture) => void;
  onPanResponderRelease: (event: object, gesture: Gesture) => void;
  onPanResponderTerminate: () => void;
};
type Effect = { deps: unknown[]; cleanup?: () => void };

// Actual source components with controlled native/data ports. These checks do not
// claim Android, API, database, MapLibre or OS gesture integration coverage.
const bundled = build({ entryPoints: ["apps/mobile/app/(tabs)/index.tsx", "apps/mobile/app/(tabs)/about.tsx", "apps/mobile/src/MarketSearchControls.tsx"], outdir: "/tmp/suqpage-market-components", bundle: true, write: false, platform: "node", format: "cjs", define: {"process.env.EXPO_PUBLIC_API_ORIGIN": '"https://mirtpage.com"'}, plugins: [{
  name: "market-component-ports",
  setup(b) {
    b.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-native|react-native-safe-area-context|expo-router)$/ }, args => ({ path: args.path, namespace: "ports" }));
    b.onResolve({ filter: /(?:^|\/)(runtime|ui|chrome|blocked-businesses|MarketMap|MapGroupPicker|use-market-feed|PublicActionDock)$/ }, args => ({ path: args.path.split("/").at(-1)!, namespace: "ports" }));
    b.onLoad({ filter: /.*/, namespace: "ports" }, args => ({ loader: "js", contents:
      args.path === "react" ? `
        export const createContext=initial=>({Provider:'ContextProvider',initial}),useContext=context=>context.initial;export const useState=initial=>{const i=fixture.stateCursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return [fixture.states[i],value=>{fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value;}];};
        export const useRef=initial=>{const i=fixture.refCursor++;return fixture.refs[i]||(fixture.refs[i]={current:initial});};
        export const useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))fixture.pendingEffects.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});};
        export const useCallback=fn=>fn,useMemo=fn=>fn();export default {};
      ` : args.path === "react/jsx-runtime" ? `export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
        : args.path === "react-native" ? `
          export const View='View',Text='Text',Pressable='Pressable',FlatList='FlatList',TextInput='TextInput',ScrollView='ScrollView';
          export const Platform={get OS(){return fixture.platform;}},useWindowDimensions=()=>fixture.dimensions,StyleSheet={create:value=>value};
          export const Keyboard={dismiss:()=>fixture.keyboardDismissals++},BackHandler={addEventListener:(_,fn)=>{fixture.back=fn;return {remove(){if(fixture.back===fn)fixture.back=undefined;}}}},AccessibilityInfo={isReduceMotionEnabled:async()=>false,addEventListener:(_,fn)=>{fixture.reduce=fn;return {remove(){}}}};
          export const PanResponder={create:handlers=>{fixture.gesture=handlers;return {panHandlers:{onMoveShouldSetResponderCapture:handlers.onMoveShouldSetPanResponderCapture,onResponderMove:handlers.onPanResponderMove}}}};
          export const Animated={View:'AnimatedView',Value:class {constructor(value){this.value=value;this.listeners=new Map();fixture.values.push(this);}addListener(fn){const id=String(this.listeners.size);this.listeners.set(id,fn);return id;}removeListener(id){this.listeners.delete(id);}setValue(value){this.value=value;for(const fn of this.listeners.values())fn({value});}interpolate(options){return options;}},timing:(value,options)=>({start(){fixture.animations.push(options);value.setValue(options.toValue);},stop(){}})};
        ` : args.path === "react-native-safe-area-context" ? `export const useSafeAreaInsets=()=>({top:0,bottom:0,left:0,right:0});`
        : args.path === "expo-router" ? `import {useEffect} from 'react';export const router={push:path=>{fixture.routes.push(path);fixture.focused=false;},navigate:path=>fixture.routes.push(path)},useIsFocused=()=>fixture.focused,useLocalSearchParams=()=>fixture.params,useFocusEffect=create=>useEffect(()=>fixture.focused?create():undefined,[fixture.focused,create]);`
        : args.path === "runtime" ? `export const API='https://suqpage.example',useApp=()=>({t:fixture.t,locale:fixture.locale}),request=async()=>{throw Error('No API request expected in the component fixture');};`
        : args.path === "use-market-feed" ? `export const useMarketFeed=()=>fixture.feed;`
        : args.path === "blocked-businesses" ? `export const useBlockedBusinesses=()=>({ready:true,list:[]});`
        : args.path === "MarketMap" ? `export default 'MarketMap';`
        : args.path === "MapGroupPicker" ? `export default 'MapGroupPicker';`
        : args.path === "PublicActionDock" ? `export default 'PublicActionDock';`
        : args.path === "chrome" ? `export const BuyingLauncher='BuyingLauncher',IconButton='IconButton',Sheet='Sheet',CategoryArt='CategoryArt';`
        : `export const Screen='Screen',Copy='Copy',Photo='Photo',Status='Status',Icon='Icon',Button='Button',Field='Field',colors={ink:'#222',line:'#ddd',brand:'#c43a00',soft:'#fff1e9'},useOpenLink=()=>async()=>{};`,
    }));
  },
}] });

function fixture() {
  return {
    states: [] as unknown[], refs: [] as { current: unknown }[], effects: [] as Effect[], pendingEffects: [] as (() => void)[], stateCursor: 0, refCursor: 0, effectCursor: 0,
    values: [] as Array<{ value: number }>, animations: [] as Array<{ toValue: number; duration: number }>, gesture: undefined as Handlers | undefined,
    reduce: undefined as ((value: boolean) => void) | undefined, back: undefined as (() => boolean) | undefined,
    platform: 'android',dimensions:{width:390,height:844,fontScale:1},focused:true,params:{} as Record<string,string|string[]>,storage:new Map<string,string>(),storageDenied:false,storageWrites:[] as string[],
    browserListeners:new Map<string,()=>void>(),historyWrites:[] as Array<{state:unknown;url:string}>,historyState:{key:'framework-history-key'},locationSearch:'',locationPathname:'/',
    locale:'en',keyboardDismissals: 0, routes: [] as unknown[], t: (value: string) => value,
    feed: { batch: { data: { showrooms: [], categories: [], places: [], countries: [] }, items: [] as unknown[] }, loading: false, snapshotCurrent:true,initialLoading:false,displayedSnapshotKey:'scope=products',get updating():boolean{return this.loading;}, error: "", moreError: "", retry() {}, loadMore() {} },
  };
}

test('FE-074 native Market retains the displayed feed/scroll during criteria updates and gates old map membership',async()=>{
 const state=fixture(),render=await component('index',state),shops=[1,2].map(id=>({id,handle:'retained-'+id,name:'Business '+id,city:'Fixture city',countryCode:'ET',region:'',heroImagePath:'',description:'Description',latitude:9.03,longitude:38.75,locationMode:'storefront'}));
 Object.assign(state.feed.batch.data,{showrooms:shops});state.feed.batch.items=[{id:1,kind:'product'},{id:2,kind:'product'}];let tree=render();selectMode(tree,true);tree=render();const scrolled:unknown[]=[];
 const list=tree.find(node=>node.type==='FlatList')!;(list.props.ref as{current:unknown}).current={scrollToOffset:(value:unknown)=>scrolled.push(value)};
 state.feed.loading=true;state.feed.snapshotCurrent=false;(marketControls(tree).props.onChange as(value:Record<string,unknown>)=>void)({...marketControls(tree).props.value as Record<string,unknown>,query:'new criteria'});tree=render();
 assert.deepEqual(Array.from((tree.find(node=>node.type==='FlatList')!.props.data as Array<{id:number}>).map(item=>item.id)),[1,2]);assert.deepEqual(scrolled,[],'Typing cannot reset the retained feed scroll');
 const map=tree.find(node=>node.type==='MarketMap')!;(map.props.onGroup as(value:typeof shops)=>void)(shops);(map.props.onSelect as(value:typeof shops[number])=>void)(shops[0]);tree=render();assert.ok(!tree.some(node=>node.type==='MapGroupPicker'&&node.props.visible===true));assert.ok(!tree.some(node=>node.type==='Sheet'&&node.props.visible===true&&node.props.title==='Business'),'Old pins never become current-query preview authority');
 state.feed.loading=false;state.feed.snapshotCurrent=true;state.feed.displayedSnapshotKey='scope=products&q=new';tree=render();assert.equal(scrolled.length,1,'Only the committed new result key resets the list');
});
const nodes = (element: Element): Element[] => [element, ...[element.props.children].flat(Infinity).filter((value): value is Element => value !== null && typeof value === "object" && "props" in value).flatMap(nodes)];
function style(element: Element) { return Object.assign({}, ...[element.props.style].flat().filter(value => value && typeof value === "object")) as Record<string, unknown>; }
function resetHooks(state:ReturnType<typeof fixture>) {
  for(const effect of state.effects)effect?.cleanup?.();
  state.states=[];state.refs=[];state.effects=[];state.pendingEffects=[];
}
function pressAndroidBack(state:ReturnType<typeof fixture>) {
  assert.ok(state.back,'Focused Market registers its Android Back handler');
  return state.back();
}
const marketControls=(tree:Element[])=>tree.find(node=>typeof node.type==='function'&&node.type.name==='MarketSearchControls')!;
const selectMode=(tree:Element[],products:boolean)=>(tree.filter(node=>node.props.accessibilityRole==='tab')[products?1:0].props.onPress as ()=>void)();
async function component(name: "index" | "about" | "MarketSearchControls", state: ReturnType<typeof fixture>) {
  const output = (await bundled).outputFiles.find(file => file.path.endsWith(`/${name}.js`))!;
  const module = { exports: {} as { default: (props?: Record<string, unknown>) => Element } };
  const window={
    sessionStorage:{getItem:(key:string)=>{if(state.storageDenied)throw Error('Storage denied');return state.storage.get(key)||null;},setItem:(key:string,value:string)=>{if(state.storageDenied)throw Error('Storage denied');state.storageWrites.push(value);state.storage.set(key,value);}},
    history:{get state(){return state.historyState;},replaceState:(value:unknown,_title:string,url:string)=>{state.historyWrites.push({state:value,url});state.locationSearch=new URL(url,'https://suqpage.com').search;}},
    location:{get search(){return state.locationSearch;},get pathname(){return state.locationPathname;}},
    addEventListener:(name:string,listener:()=>void)=>state.browserListeners.set(name,listener),removeEventListener:(name:string,listener:()=>void)=>{if(state.browserListeners.get(name)===listener)state.browserListeners.delete(name);},
  };
  vm.runInNewContext(output.text, { module, exports: module.exports, fixture: state, window, document:{activeElement:null,querySelector:()=>null}, URLSearchParams, URL, Map, setTimeout, clearTimeout });
  return (props?: Record<string, unknown>) => {
    state.stateCursor = state.refCursor = state.effectCursor = 0;
    const tree = module.exports.default(props);
    for (const effect of state.pendingEffects.splice(0)) effect();
    return nodes(tree);
  };
}

test("FE-053 actual Market component preserves the mounted panes and follows only its dedicated handle", async () => {
  const state = fixture(), render = await component("index", state);
  let tree = render();
  const map = () => tree.find(node => node.type === "MarketMap")!;
  const handle = () => tree.find(node => node.type === "Pressable" && ["Map only", "View products"].includes(String(node.props.accessibilityLabel)))!;
  const controls = () => tree.filter(node => typeof node.type === "function" && node.type.name === "MarketSearchControls");
  assert.equal(controls().length, 1, "Only the active search toolbar is rendered");
  assert.equal(controls()[0].props.scope, "businesses");
  (controls()[0].props.onChange as (value: Record<string, unknown>) => void)({ ...(controls()[0].props.value as Record<string, unknown>), query: "Local workshop" });
  tree = render();
  assert.equal(map().props.height, 500, "No permanent70px spacer is subtracted from the map");
  assert.equal(style(tree.find(node => node.type === "AnimatedView" && style(node).left === 0)!).top, 0);
  assert.equal(style(tree.find(node=>node.type==='AnimatedView'&&style(node).left===0)!).pointerEvents,'auto');assert.equal(style(tree.find(node=>node.props.testID==='search-drawer')!).pointerEvents,'none');
  assert.ok(!tree.filter(node=>node.type==='AnimatedView').some(node=>Object.hasOwn(node.props,'pointerEvents')),'RNWeb pane hit testing uses supported style properties');
  assert.equal(style(handle()).minWidth, 48); assert.equal(style(handle()).minHeight, 48);
  const handleFrame=tree.find(node=>node.type==='AnimatedView'&&style(node).width===48&&style(node).height===48)!;
  assert.equal(style(handleFrame).left,16,"Handle remains inset from the screen edge");
  const travel=(style(handleFrame).transform as Array<{translateX:{outputRange:number[]}}>)[0].translateX.outputRange;
  assert.deepEqual(Array.from(travel),[310,0],"Products starts on the right and its handle travels to the left");
  assert.equal(typeof handleFrame.props.onMoveShouldSetResponderCapture,'function','The wrapper owns drag capture because Pressable overwrites supplied responder handlers');
  assert.ok(!('onResponderMove' in handle().props),'Pressable keeps its independent click/keyboard responder');
  const modes = tree.filter(node => node.props.accessibilityRole === "tab");
  assert.ok(modes.every(mode => style(mode).minHeight === 48));
  assert.deepEqual(modes.map(mode=>mode.props['aria-selected']),[true,false],"Browser selection aliases match the native state");
  assert.ok(tree.some(node => node.type === "Text" && node.props.accessibilityRole === "header" && node.props.children === "MirtPage Market"));
  const gesture = state.gesture!;
  assert.equal(gesture.onMoveShouldSetPanResponder({}, { dx: 5, dy: 0, vx: 0 }), false);
  assert.equal(gesture.onMoveShouldSetPanResponder({}, { dx: 20, dy: 30, vx: 0 }), false, "Vertical motion is not a pane swipe");
  assert.equal(gesture.onMoveShouldSetPanResponder({}, { dx: 20, dy: 1, vx: 0 }), true);
  assert.equal(gesture.onMoveShouldSetPanResponderCapture({}, { dx: 20, dy: 1, vx: 0 }), true, "The wrapper can take over a horizontal drag from the inner Pressable");
  assert.equal(nodes(handle()).find(node=>node.type==='Icon')!.props.name,'back','Initial handle points left to reveal Products');
  gesture.onPanResponderGrant();
  gesture.onPanResponderMove({}, { dx: -40, dy: 0, vx: 0 });
  gesture.onPanResponderRelease({}, { dx: -40, dy: 0, vx: 0 });
  tree=render();assert.equal(controls()[0].props.scope,'businesses','A drag under48px returns to the current selection');
  gesture.onPanResponderGrant();
  gesture.onPanResponderMove({}, { dx: -200, dy: 0, vx: 0 });
  assert.ok(state.values[0].value > 0.5 && state.values[0].value < 1, "Panels follow the finger before release");
  gesture.onPanResponderRelease({}, { dx: -200, dy: 0, vx: 0 });
  tree = render();
  assert.equal(controls()[0].props.scope, "products");
  assert.equal(style(tree.find(node=>node.props.testID==='search-drawer')!).pointerEvents,'auto');assert.equal(style(tree.find(node=>node.type==='AnimatedView'&&style(node).left===0)!).pointerEvents,'none');
  assert.equal((controls()[0].props.value as { query: string }).query, "", "Product criteria remain independent");
  (controls()[0].props.onChange as (value: Record<string, unknown>) => void)({ ...(controls()[0].props.value as Record<string, unknown>), query: "Chair" });
  tree = render();
  assert.equal(tree.filter(node => node.type === "MarketMap").length, 1, "Switching does not conditionally remove the map");
  assert.equal(tree.filter(node => node.type === "FlatList").length, 1, "The same list remains mounted when switching");
  assert.equal(state.values[0].value, 1);
  assert.equal(nodes(handle()).find(node=>node.type==='Icon')!.props.name,'arrow','Open Products handle points right to restore the map');
  state.gesture!.onPanResponderGrant();
  state.gesture!.onPanResponderMove({}, { dx: 220, dy: 0, vx: 0 });
  assert.ok(state.values[0].value < 0.5);
  state.gesture!.onPanResponderTerminate();
  tree = render();
  assert.equal(controls()[0].props.scope, "products", "Cancelled drag restores the selected pane");
  assert.equal(state.values[0].value, 1);
  assert.equal(state.back!(), true, "Android Back closes the product pane before leaving Market");
  tree = render();
  assert.equal((controls()[0].props.value as { query: string }).query, "Local workshop");
  (tree.filter(node => node.props.accessibilityRole === "tab")[1].props.onPress as () => void)();
  tree = render();
  assert.equal((controls()[0].props.value as { query: string }).query, "Chair", "Switching restores the product criteria");
  state.reduce!(true); tree = render();
  (handle().props.onPressIn as () => void)();
  (handle().props.onPress as () => void)();
  tree = render();
  assert.equal(controls()[0].props.scope, "businesses");
  assert.equal(state.animations.at(-1)?.duration, 0, "Reduced motion settles immediately");
  const stage=tree.find(node=>node.props.testID==='market-stage')!;
  (stage.props.onLayout as (event:{nativeEvent:{layout:{height:number}}})=>void)({nativeEvent:{layout:{height:340}}});
  tree=render();
  assert.equal(style(tree.find(node=>node.props.testID==='map-tools')!).flexDirection,'row','Intermediate heights also keep Reset map clear of the right-side handle');
  assert.equal(tree.find(node=>node.type==='PublicActionDock')!.props.compact,false,'Intermediate heights preserve the readable public action dock');
  assert.equal(tree.find(node=>node.type==='PublicActionDock')!.props.horizontal,false,'Ordinary public placement retains the labelled stack');
  (stage.props.onLayout as (event:{nativeEvent:{layout:{height:number}}})=>void)({nativeEvent:{layout:{height:204}}});
  tree=render();
  assert.equal(tree.find(node=>node.type==='PublicActionDock')!.props.compact,true,"A short map keeps the public action dock compact so it cannot cover the handle");
  assert.equal(tree.find(node=>node.type==='PublicActionDock')!.props.horizontal,true,'Only a short Market stage uses the compact single-row dock');
  const launcherFrame=tree.find(node=>node.type==='View'&&(node.props.children as Element)?.type==='PublicActionDock')!;
  assert.equal(style(launcherFrame).left,73,"A short-stage244px dock remains horizontally centered");
  (launcherFrame.props.onLayout as (event:{nativeEvent:{layout:{height:number}}})=>void)({nativeEvent:{layout:{height:56}}});tree=render();
  assert.equal((tree.find(node=>node.type==='FlatList')!.props.contentContainerStyle as {paddingBottom:number}).paddingBottom,92,'The last product action can scroll clear of the measured single-row dock');
  assert.equal(style(tree.find(node=>node.props.testID==='map-tools')!).flexDirection,'row','Short maps keep zoom controls above the right-side handle');
  assert.ok(!tree.some(node=>node.props.accessibilityLabel==='About MirtPage'||node.type==='Sheet'&&node.props.title==='About MirtPage'),'Market leaves its narrative on the dedicated About page');
});

test('FE-053 S153 inactive Market panes preserve native hiding and explicitly isolate installed Web controls',async()=>{
 const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{View,Pressable,Text}=require('react-native-web');
 for(const platform of['android','ios','web']){
  const state=fixture();state.platform=platform;const render=await component('index',state);let tree=render();
  for(const products of[false,true,false]){
   selectMode(tree,products);tree=render();
   const map=tree.find(node=>node.type==='AnimatedView'&&style(node).left===0)!,drawer=tree.find(node=>node.props.testID==='search-drawer')!;
   for(const[pane,hidden,label]of[[map,products,'Map control'],[drawer,!products,'Product control']] as const){
    assert.equal(pane.props.accessibilityElementsHidden,hidden);assert.equal(pane.props.importantForAccessibility,hidden?'no-hide-descendants':'auto');
    assert.equal(pane.props['aria-hidden'],hidden,'The installed Web adapter needs explicit hidden state');assert.equal(pane.props.inert,platform==='web'?hidden:undefined,'Only Web receives the DOM inert property');
    assert.equal(style(pane).pointerEvents,hidden?'none':'auto');
    if(platform==='web'){
     const markup=renderToStaticMarkup(React.createElement(View,{...pane.props,children:undefined,style:undefined},React.createElement(Pressable,{accessibilityRole:'button',onPress(){}},React.createElement(Text,null,label))));
     const wrapper=markup.slice(0,markup.indexOf('>')+1);assert.equal(wrapper.includes('aria-hidden="true"'),hidden,'Installed RNWeb omits false hidden state on the active pane');assert.equal(/\binert(?:="[^"]*")?(?=[\s>])/.test(wrapper),hidden,'Inert must block browser Tab traversal only while the pane is inactive');
     assert.ok(markup.includes('tabindex="0"'),'The regression contains a real normally keyboard-focusable descendant');
    }
   }
   const handle=tree.find(node=>node.type==='Pressable'&&['Map only','View products'].includes(String(node.props.accessibilityLabel)))!;
   assert.ok(handle);assert.ok(!nodes(map).includes(handle)&&!nodes(drawer).includes(handle),'The dedicated switch handle stays outside either inert subtree');
   assert.equal(tree.filter(node=>node.type==='MarketMap').length,1);assert.equal(tree.filter(node=>node.type==='FlatList').length,1,'Selection never unmounts the retained panes');
  }
 }
});

test("FE-065 actual native controls keep four balanced wrapping filters visible with48px targets", async () => {
  const state = fixture(), render = await component("MarketSearchControls", state);
  const tree = render({ scope: "products", value: { query: "chairs", categories: [], countries: ["ET"], cities: [], madeToOrder: false, page: 1 }, onChange() {}, metadata: { categories: [], countries: [], places: [] } });
  const row = tree.find(node => node.props.testID === "products-filters")!;
  assert.equal(row.type, "View");assert.equal(style(row).flexDirection,"row");
  assert.ok(!tree.some(node=>node.type==='ScrollView'),'The four choices do not require horizontal scrolling');
  const filters=nodes(row).filter(node=>node.type==='Pressable');assert.equal(filters.length,4);assert.deepEqual(filters.map(node=>style(node).flex),[1,1,1,1.5],'Custom wording receives room while each geographic control keeps48px');
  assert.ok(nodes(row).filter(node=>node.type==='Text'&&style(node).fontSize===12).every(node=>node.props.numberOfLines===undefined),'Words may wrap instead of clipping');
  assert.ok(!nodes(row).some(node=>node.props.accessibilityLabel==='Clear all'));
  assert.ok(nodes(tree.find(node=>node.props.testID==='products-search')!).some(node=>node.props.accessibilityLabel==='Clear all'),'Global reset lives beside search, separate from query-only clear');
  const buttons = tree.filter(node => node.type === "Pressable" && node.props.accessibilityRole === "button");
  for (const label of ["Category", "Country (1)", "City", "Clear all", "Clear search"]) assert.ok(buttons.some(button => button.props.accessibilityLabel === label), `${label} remains labeled and reachable`);
  assert.ok(!buttons.some(button => button.props.accessibilityLabel === "Type"));
  const madeToOrder=tree.find(node=>node.type==='Pressable'&&node.props.accessibilityRole==='checkbox'&&node.props.accessibilityLabel==='Made to order')!;
  assert.ok(madeToOrder,'Product supply is a direct labeled toggle');
  assert.equal(madeToOrder.props['aria-checked'],false);
  assert.equal((madeToOrder.props.accessibilityState as {checked:boolean}).checked,false);
  assert.ok(Number(style(madeToOrder).minHeight)>=48&&Number(style(madeToOrder).minWidth)>=48);
  assert.ok(buttons.every(button => Number(style(button).minHeight) >= 48));
  assert.ok(buttons.every(button => Number(style(button).width ?? style(button).minWidth) >= 48));
});

test('FE-065 S117 native detail Back and bare Market return retain both searches and the selected panel, including remount',async()=>{
  const state=fixture(),render=await component('index',state);
  let tree=render();
  const change=(value:Record<string,unknown>)=>(marketControls(tree).props.onChange as (value:Record<string,unknown>)=>void)({...marketControls(tree).props.value as object,...value});
  change({query:'Wood workshop',countries:['ET'],cities:['ET:Addis Ababa']});tree=render();
  selectMode(tree,true);tree=render();change({query:'Oak chair',countries:['KE'],cities:['KE:Nairobi'],madeToOrder:true});tree=render();
  const item={kind:'product',id:81,name:'Oak chair',handle:'sample-wood',businessName:'Sample Wood',description:'Made to order chair',offeringKind:'custom_product',availability:'available',image:''};
  state.feed.batch.items=[item];tree=render();
  const row=(tree.find(node=>node.type==='FlatList')!.props.renderItem as (value:{item:unknown})=>Element)({item});
  (nodes(row).find(node=>node.props.accessibilityLabel==='Oak chair')!.props.onPress as ()=>void)();
  tree=render();assert.equal(state.back,undefined,'A retained Market must release Android Back while a product is above it');
  assert.equal(marketControls(tree).props.scope,'products');assert.equal(state.routes.length,1);
  assert.equal((state.routes[0] as {pathname:string}).pathname,'/product');
  state.focused=true;state.params={};tree=render();tree=render();
  assert.equal(marketControls(tree).props.scope,'products','Detail Back and a bare Market destination keep Products selected');
  assert.equal((marketControls(tree).props.value as {query:string}).query,'Oak chair');
  assert.equal((tree.find(node=>node.type==='FlatList')!.props.data as unknown[])[0],item,'Ordinary returns retain already loaded cards');
  (nodes(row).find(node=>node.props.accessibilityRole==='link')!.props.onPress as ()=>void)();tree=render();
  assert.equal(state.back,undefined,'Business-source navigation also leaves Back to the active screen');
  assert.equal((state.routes[1] as {pathname:string}).pathname,'/shop/[handle]');
  state.focused=true;tree=render();selectMode(tree,false);tree=render();
  assert.equal((marketControls(tree).props.value as {query:string}).query,'Wood workshop');
  selectMode(tree,true);tree=render();resetHooks(state);tree=render();
  assert.equal(marketControls(tree).props.scope,'products','An app-session remount restores the selected panel');
  const restored=marketControls(tree).props.value as {query:string;countries:string[];cities:string[];madeToOrder:boolean};
  assert.equal(restored.query,'Oak chair');assert.deepEqual(Array.from(restored.countries),['KE']);assert.deepEqual(Array.from(restored.cities),['KE:Nairobi']);assert.equal(restored.madeToOrder,true);
  selectMode(tree,false);tree=render();assert.equal((marketControls(tree).props.value as {query:string}).query,'Wood workshop');
});

test('FE-065 S117 explicit native links take precedence on focus and active Market Back keeps its original behavior',async()=>{
  const state=fixture(),render=await component('index',state);let tree=render();
  selectMode(tree,true);tree=render();
  state.focused=false;state.params={view:'map','b.q':'New business','p.q':'Linked product'};tree=render();
  assert.equal(marketControls(tree).props.scope,'products','A blurred Market does not consume an incoming navigation');
  assert.equal(state.back,undefined);
  state.focused=true;tree=render();tree=render();
  assert.equal(marketControls(tree).props.scope,'businesses');assert.equal((marketControls(tree).props.value as {query:string}).query,'New business');
  selectMode(tree,true);tree=render();assert.equal((marketControls(tree).props.value as {query:string}).query,'Linked product');
  state.params={};tree=render();tree=render();assert.equal(marketControls(tree).props.scope,'products','Removing explicit URL criteria for ordinary Market navigation does not clear the selection');
  resetHooks(state);tree=render();assert.equal(marketControls(tree).props.scope,'products','Explicit navigation was persisted after restoration');
  assert.equal(pressAndroidBack(state),true,'Android Back closes Products only when Market is focused');tree=render();
  assert.equal(marketControls(tree).props.scope,'businesses');assert.equal(pressAndroidBack(state),false,'The map leaves Android Back available to navigation');
  state.params={q:'Legacy search'};tree=render();tree=render();
  assert.equal(marketControls(tree).props.scope,'products');assert.equal((marketControls(tree).props.value as {query:string}).query,'Legacy search');
});

test('FE-065 S117 each explicit About map action overrides Products while returning to the same old link preserves it',async()=>{
  const state=fixture();state.params={view:'map'};
  const render=await component('index',state);let tree=render();
  const aboutState=fixture(),renderAbout=await component('about',aboutState);
  const previousIntents=new Set<string>();
  for(let visit=0;visit<3;visit++){
    selectMode(tree,true);tree=render();state.focused=false;tree=render();
    state.focused=true;tree=render();tree=render();
    assert.equal(marketControls(tree).props.scope,'products','Detail Back with unchanged explicit parameters preserves the later manual choice');
    state.focused=false;tree=render();
    const about=renderAbout();
    (about.find(node=>node.type==='Button'&&node.props.label==='Explore the map')!.props.onPress as ()=>void)();
    const path=aboutState.routes.at(-1) as string,params=new URL(path,'https://suqpage.com').searchParams;
    assert.equal(params.get('view'),'map');assert.match(params.get('_intent')!,/^\d+$/);
    assert.ok(!previousIntents.has(params.get('_intent')!),'Every deliberate map action has a fresh navigation intent');previousIntents.add(params.get('_intent')!);
    state.params=Object.fromEntries(params);state.focused=true;tree=render();tree=render();
    assert.equal(marketControls(tree).props.scope,'businesses','Repeating Explore the map applies its explicit selection again');
  }
});

test('FE-065 S117 Expo browser session and history restore the panel without overwriting framework history state',async()=>{
  const state=fixture();state.platform='web';let render=await component('index',state),tree=render();
  selectMode(tree,true);tree=render();
  (marketControls(tree).props.onChange as (value:unknown)=>void)({...marketControls(tree).props.value as object,query:'Coffee table'});tree=render();
  assert.ok(state.historyWrites.length>0);assert.ok(state.historyWrites.every(write=>write.state===state.historyState),'URL updates retain Expo history metadata');
  assert.match(state.historyWrites.at(-1)!.url,/view=search/);
  state.focused=false;state.params={view:'map'};const writes=state.historyWrites.length,stored=state.storageWrites.length;tree=render();assert.equal(state.historyWrites.length,writes,'A background Market cannot rewrite another page URL');
  assert.equal(state.storageWrites.length,stored,'A background Market cannot replace remembered searches or panel');
  assert.equal(state.browserListeners.has('popstate'),false,'Expo Router owns browser history without a second raw listener');
  state.params={};state.focused=true;tree=render();tree=render();resetHooks(state);render=await component('index',state);tree=render();
  assert.equal(marketControls(tree).props.scope,'products','A browser reload uses this tab session rather than a fresh default');
  assert.equal((marketControls(tree).props.value as {query:string}).query,'Coffee table');
  state.locationSearch='?view=map&b.q=History+workshop&p.q=Saved+table';state.params={view:'map','b.q':'History workshop','p.q':'Saved table'};
  const beforeHistoryWrites=state.storageWrites.length;tree=render();
  assert.equal(state.storageWrites.length,beforeHistoryWrites,'Incoming history restoration runs before any default persistence');tree=render();
  assert.equal(marketControls(tree).props.scope,'businesses','An explicit history entry wins over remembered Products');
  assert.equal((marketControls(tree).props.value as {query:string}).query,'History workshop');
  selectMode(tree,true);tree=render();tree=render();assert.equal(marketControls(tree).props.scope,'products','The already-applied history parameters do not undo a later user switch');assert.equal((marketControls(tree).props.value as {query:string}).query,'Saved table');
});

test('FE-065 S117 Expo focus can precede its history transition without replaying an old Products entry',async()=>{
  const state=fixture();state.platform='web';state.params={view:'map','b.q':'nile','p.q':'aloe'};
  const render=await component('index',state);let tree=render();selectMode(tree,true);tree=render();
  state.focused=false;state.locationPathname='/about';tree=render();
  state.params={view:'map',_intent:'fresh-explicit-action'};state.focused=true;
  const writes=state.historyWrites.length;tree=render();tree=render();
  assert.equal(marketControls(tree).props.scope,'businesses');
  assert.equal(state.historyWrites.length,writes,'Focusing Market cannot replace the outgoing About history entry');
  state.locationPathname='/';state.locationSearch='?view=search&b.q=nile&p.q=aloe';
  assert.equal(state.browserListeners.has('popstate'),false,'Router-origin history.go events must not be consumed by a raw Market listener');
  tree=render();assert.equal(marketControls(tree).props.scope,'businesses','The stale intermediate browser entry cannot overwrite the explicit action');
  state.locationSearch='?view=map&_intent=fresh-explicit-action';tree=render();
  assert.equal(marketControls(tree).props.scope,'businesses');
  state.params={view:'search','b.q':'history business','p.q':'history product'};tree=render();tree=render();
  assert.equal(marketControls(tree).props.scope,'products','Actual user history delivered through Expo route parameters still restores its entry');
  assert.equal((marketControls(tree).props.value as {query:string}).query,'history product');
});

test('FE-065 S117 unavailable or invalid Expo session storage never blocks Market or ordinary in-memory returns',async()=>{
  const state=fixture();state.platform='web';state.storage.set('suqpage:mobile-market-workspace:v1','malformed');
  const render=await component('index',state);let tree=render();assert.equal(marketControls(tree).props.scope,'businesses');
  state.storageDenied=true;selectMode(tree,true);tree=render();resetHooks(state);tree=render();
  assert.equal(marketControls(tree).props.scope,'products','Storage-denied browsing still retains app-session selection');
});

test('FE-053 S127 Market group preview preserves map/selection and zoom controls reflect settled platform bounds',async()=>{
  const state=fixture(),render=await component('index',state),shops=[1,2,3].map(id=>({id,handle:'group-'+id,name:'Group business '+id,city:'Fixture city',countryCode:'ET',region:'',heroImagePath:'',description:'Description',latitude:9.03,longitude:38.75,locationMode:'storefront'}));
  Object.assign(state.feed.batch.data,{showrooms:shops});let tree=render();tree=render();
  const map=()=>tree.find(node=>node.type==='MarketMap')!,picker=()=>tree.find(node=>node.type==='MapGroupPicker')!;
  const cameraCalls:unknown[]=[];(map().props.ref as{current:unknown}).current={focus:(value:unknown)=>cameraCalls.push(value)};
  (map().props.onZoomChange as(value:number)=>void)(12);(map().props.onViewChange as(value:unknown)=>void)({center:[38.75,9.03],zoom:12});tree=render();(map().props.onGroup as(value:typeof shops)=>void)(shops);tree=render();assert.equal(picker().props.visible,true);assert.deepEqual(Array.from(picker().props.shops as typeof shops,shop=>shop.id),[1,2,3]);
  (picker().props.onSelect as(value:typeof shops[number])=>void)(shops[2]);tree=render();assert.equal(picker().props.visible,false);assert.ok(tree.some(node=>node.type==='Sheet'&&node.props.title==='Business'&&node.props.visible===true));assert.deepEqual(cameraCalls,[],'Picking a grouped business never pans or zooms');
  (tree.find(node=>node.type==='Button'&&node.props.label==='Back to businesses')!.props.onPress as()=>void)();tree=render();assert.equal(picker().props.visible,true);assert.deepEqual(cameraCalls,[]);
  (picker().props.onSelect as(value:typeof shops[number])=>void)(shops[2]);tree=render();(tree.find(node=>node.type==='Button'&&node.props.label==='Explore this business')!.props.onPress as()=>void)();tree=render();assert.equal(picker().props.visible,false,'Retained Market modal must not overlay the full business route');assert.equal(tree.find(node=>node.type==='Sheet'&&node.props.title==='Business')?.props.visible,false);assert.equal((state.routes.at(-1)as{pathname:string}).pathname,'/shop/[handle]');state.focused=true;tree=render();assert.equal(picker().props.visible,true,'Actual route return restores the group, without reopening individual detail');
  (map().props.onZoomChange as(value:number)=>void)(12);tree=render();assert.equal(tree.find(node=>node.type==='IconButton'&&node.props.label==='Zoom in')?.props.disabled,true);
  state.platform='web';tree=render();assert.equal(tree.find(node=>node.type==='IconButton'&&node.props.label==='Zoom in')?.props.disabled,false);(map().props.onZoomChange as(value:number)=>void)(13);tree=render();assert.equal(tree.find(node=>node.type==='IconButton'&&node.props.label==='Zoom in')?.props.disabled,true);
  (map().props.onZoomChange as(value:number)=>void)(1);tree=render();assert.equal(tree.find(node=>node.type==='IconButton'&&node.props.label==='Zoom out')?.props.disabled,true);
  assert.ok(tree.some(node=>node.type==='MapGroupPicker'&&node.props.visible===true),'S140 keeps a sole current terminal group open without a needless maximum zoom');
  Object.assign(state.feed.batch.data,{showrooms:shops.map((s,i)=>i===0?{...s,name:'Fresh eligible name'}:s)});(map().props.onZoomChange as(value:number)=>void)(13);(map().props.onViewChange as(value:unknown)=>void)({center:[38.75,9.03],zoom:13});tree=render();(map().props.onGroup as(value:typeof shops)=>void)(shops);tree=render();assert.equal((picker().props.shops as typeof shops)[0].name,'Fresh eligible name','Current scoped rows rehydrate fixed group identity without snapshots');
});

test('FE-053 S127 full business navigation restores scoped group context after Market remount',async()=>{
  const state=fixture(),render=await component('index',state),shops=[1,2,3].map(id=>({id,handle:'remount-'+id,name:'Remount business '+id,city:'Fixture city',region:'',heroImagePath:'',description:'',latitude:9.03,longitude:38.75,locationMode:'storefront'}));Object.assign(state.feed.batch.data,{showrooms:shops});
  let tree=render();tree=render();(tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void)({center:[37.6,9.1],zoom:12});(tree.find(n=>n.type==='MarketMap')!.props.onZoomChange as(value:number)=>void)(12);tree=render();(tree.find(n=>n.type==='MarketMap')!.props.onGroup as(value:typeof shops)=>void)(shops);tree=render();(tree.find(n=>n.type==='MapGroupPicker')!.props.onPositionChange as(value:unknown)=>void)({page:1,anchor:2});tree=render();(tree.find(n=>n.type==='MapGroupPicker')!.props.onSelect as(value:typeof shops[number])=>void)(shops[1]);tree=render();(tree.find(n=>n.type==='Button'&&n.props.label==='Explore this business')!.props.onPress as()=>void)();tree=render();assert.ok(!tree.some(n=>n.type==='MapGroupPicker'&&n.props.visible===true),'No off-route modal while the full business is open');
  resetHooks(state);state.focused=true;tree=render();tree=render();const picker=tree.find(n=>n.type==='MapGroupPicker');assert.equal(picker?.props.visible,true,'New Market screen must restore its saved current group after ordinary Back');assert.deepEqual(Array.from(picker!.props.shops as typeof shops,s=>s.id),[1,2,3]);assert.equal(picker!.props.initialPage,0);assert.equal(picker!.props.initialAnchor,2,'Restored selection identity chooses its containing page at the current capacity');assert.deepEqual(JSON.parse(JSON.stringify(tree.find(n=>n.type==='MarketMap')!.props.initialView)),{center:[37.60000000000002,9.1],zoom:12});
  Object.assign(state.feed.batch.data,{showrooms:shops.filter(shop=>shop.id!==2)});resetHooks(state);tree=render();tree=render();assert.ok(!tree.some(n=>n.type==='MapGroupPicker'&&n.props.visible===true),'A removed member or repartition invalidates the complete old group, while retaining camera context');
  const controls=marketControls(tree);(controls.props.onChange as(value:Record<string,unknown>)=>void)({...controls.props.value as Record<string,unknown>,query:'Different scope'});tree=render();tree=render();assert.ok(!tree.some(n=>n.type==='MapGroupPicker'&&n.props.visible===true),'Changing business filters clears the old group return context');
});

test('FE-053 S127 retained blurred map callbacks cannot overwrite the return camera',async()=>{
  const state=fixture();state.platform='web';
  const render=await component('index',state),shops=[1,2].map(id=>({id,handle:'blur-'+id,name:'Blur business '+id,city:'Fixture city',region:'',heroImagePath:'',description:'',latitude:9.03,longitude:38.75,locationMode:'storefront'}));
  Object.assign(state.feed.batch.data,{showrooms:shops});let tree=render();tree=render();
  const staleView=tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void;
  staleView({center:[37.6,9.1],zoom:13});(tree.find(n=>n.type==='MarketMap')!.props.onZoomChange as(value:number)=>void)(13);tree=render();
  (tree.find(n=>n.type==='MarketMap')!.props.onGroup as(value:typeof shops)=>void)(shops);tree=render();
  (tree.find(n=>n.type==='MapGroupPicker')!.props.onSelect as(value:typeof shops[number])=>void)(shops[0]);tree=render();
  (tree.find(n=>n.type==='Button'&&n.props.label==='Explore this business')!.props.onPress as()=>void)();tree=render();
  const writes=state.storageWrites.length;
  (tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void)({center:[39.70458984375,9.037],zoom:6});
  staleView({center:[39.715576171875,9.037],zoom:6});
  assert.equal(state.storageWrites.length,writes,'Neither current nor previously retained SDK callback may write while Market is blurred');
  resetHooks(state);state.focused=true;tree=render();tree=render();
  assert.deepEqual(JSON.parse(JSON.stringify(tree.find(n=>n.type==='MarketMap')!.props.initialView)),{center:[37.60000000000002,9.1],zoom:13},'Remount must recover the last visible camera, not a hidden-layout observation');
  (tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void)({center:[38.7,9.2],zoom:12});
  assert.ok(state.storageWrites.length>writes,'Visible route camera updates resume normally');
});

test('FE-053 adaptive Market passes one modal capacity to its map and clears invalid resized groups without moving camera',async()=>{
  const state=fixture();state.dimensions={width:1440,height:1000,fontScale:1};
  const shops=Array.from({length:6},(_,i)=>({id:i+1,handle:'capacity-'+i,name:'Capacity business '+i,city:'Fixture city',region:'',heroImagePath:'',description:'',latitude:9.03,longitude:38.75,locationMode:'storefront'}));Object.assign(state.feed.batch.data,{showrooms:shops});const render=await component('index',state);let tree=render();tree=render();
  assert.equal(tree.find(n=>n.type==='MarketMap')!.props.groupCapacity,6);
  (tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void)({center:[37.6,9.1],zoom:12});(tree.find(n=>n.type==='MarketMap')!.props.onZoomChange as(value:number)=>void)(12);tree=render();
  (tree.find(n=>n.type==='MarketMap')!.props.onGroup as(value:typeof shops)=>void)(shops);tree=render();assert.equal((tree.find(n=>n.type==='MapGroupPicker')!.props.shops as typeof shops).length,6);
  (tree.find(n=>n.type==='MapGroupPicker')!.props.onSelect as(value:typeof shops[number])=>void)(shops[2]);tree=render();assert.ok(tree.some(n=>n.type==='Sheet'&&n.props.title==='Business'&&n.props.visible===true));
  state.dimensions={width:320,height:480,fontScale:2};tree=render();tree=render();assert.equal(tree.find(n=>n.type==='MarketMap')!.props.groupCapacity,1);assert.ok(!tree.some(n=>n.type==='MapGroupPicker'&&n.props.visible===true));assert.ok(!tree.some(n=>n.type==='Sheet'&&n.props.title==='Business'&&n.props.visible===true),'Resize cannot leave a stale detail portal');assert.deepEqual(JSON.parse(JSON.stringify(tree.find(n=>n.type==='MarketMap')!.props.initialView)),{center:[37.6,9.1],zoom:12},'Capacity changes do not move the map');
  (tree.find(n=>n.type==='MarketMap')!.props.onGroup as(value:typeof shops)=>void)([shops[0]]);tree=render();assert.equal((tree.find(n=>n.type==='MapGroupPicker')!.props.shops as typeof shops).length,1,'A current forced single remains an admissible group');assert.equal(tree.find(n=>n.type==='MapGroupPicker')!.props.visible,true);
});

test('FE-053 S140 group picker and retained detail require a current terminal representation, while isolated preview remains available',async()=>{
  const state=fixture();state.platform='web';const shops=[1,2,3].map(id=>({id,handle:'maximum-'+id,name:'Maximum business '+id,city:'Fixture city',region:'',heroImagePath:'',description:'',latitude:id===3?10:9.03,longitude:id===3?40:38.75,locationMode:'storefront'}));Object.assign(state.feed.batch.data,{showrooms:shops});let render=await component('index',state),tree=render();tree=render();
  (tree.find(n=>n.type==='MarketMap')!.props.onGroup as(value:typeof shops)=>void)([shops[0],shops[2]]);tree=render();assert.ok(!tree.some(n=>n.type==='MapGroupPicker'&&n.props.visible===true),'A non-terminal set cannot open a modal merely because a stale marker callback fired');
  (tree.find(n=>n.type==='MarketMap')!.props.onZoomChange as(value:number)=>void)(13);(tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void)({center:[38.75,9.03],zoom:13});tree=render();(tree.find(n=>n.type==='MarketMap')!.props.onGroup as(value:typeof shops)=>void)(shops.slice(0,2));tree=render();assert.equal(tree.find(n=>n.type==='MapGroupPicker')!.props.visible,true);
  const key='suqpage:mobile-map-return:v1',saved=JSON.parse(state.storage.get(key)!);
  (tree.find(n=>n.type==='MapGroupPicker')!.props.onSelect as(value:typeof shops[number])=>void)(shops[0]);tree=render();assert.ok(tree.some(n=>n.type==='Sheet'&&n.props.title==='Business'&&n.props.visible===true));
  (tree.find(n=>n.type==='MarketMap')!.props.onZoomChange as(value:number)=>void)(12);(tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void)({center:[38.75,9.03],zoom:12});tree=render();assert.ok(tree.some(n=>n.type==='Sheet'&&n.props.title==='Business'&&n.props.visible===true),'Separated terminal detail stays available below maximum');
  (tree.find(n=>n.type==='MarketMap')!.props.onZoomChange as(value:number)=>void)(1);(tree.find(n=>n.type==='MarketMap')!.props.onViewChange as(value:unknown)=>void)({center:[38.75,9.03],zoom:1});tree=render();assert.ok(!tree.some(n=>(n.type==='MapGroupPicker'||n.type==='Sheet'&&n.props.title==='Business')&&n.props.visible===true),'A subgroup hidden inside an outer aggregate cannot retain its detail');tree=render();assert.deepEqual(JSON.parse(state.storage.get(key)!).ids,[]);
  state.storage.set(key,JSON.stringify({...saved,camera:{...saved.camera,zoom:1}}));resetHooks(state);render=await component('index',state);tree=render();tree=render();assert.ok(!tree.some(n=>n.type==='MapGroupPicker'&&n.props.visible===true),'Legacy cached IDs cannot bypass the current outer aggregate');
  (tree.find(n=>n.type==='MarketMap')!.props.onSelect as(value:typeof shops[number])=>void)(shops[2]);tree=render();assert.ok(tree.some(n=>n.type==='Sheet'&&n.props.title==='Business'&&n.props.visible===true),'An isolated shop keeps its existing preview behavior at every zoom');
});

test('FE-053 S127 short portrait and landscape keep48px map controls clear of the peek and transport dock',async()=>{
  type Box={x:number;y:number;width:number;height:number};
  const overlaps=(a:Box,b:Box)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  // Existing Chrome's320x480 stage was116px; its duplicated48px Market strip
  // is part of the short-height budget.844x390 has26px before that recovery.
  for(const viewport of [{width:320,height:480,baseStage:116},{width:844,height:390,baseStage:26}]){
    const state=fixture();state.dimensions={width:viewport.width,height:viewport.height,fontScale:1};
    const render=await component('index',state);let tree=render();
    const heading=tree.find(n=>n.type==='Text'&&n.props.accessibilityRole==='header'&&n.props.children==='MirtPage Market')!;
    assert.equal(style(heading).position,'absolute');assert.equal(style(heading).height,1,'The localized primary heading remains programmatic without a duplicate visual title row');
    const stageHeight=viewport.baseStage+48;
    (tree.find(n=>n.props.testID==='market-stage')!.props.onLayout as(event:{nativeEvent:{layout:{height:number}}})=>void)({nativeEvent:{layout:{height:stageHeight}}});tree=render();
    for(const products of [false,true]){
      selectMode(tree,products);tree=render();
      const paneWidth=viewport.width-16,tools=style(tree.find(n=>n.props.testID==='map-tools')!),buttons=tree.filter(n=>n.type==='IconButton'&&['Zoom in','Zoom out','Reset map'].includes(String(n.props.label)));
      assert.equal(buttons.length,3);assert.ok(buttons.every(n=>n.props.touchSize===48),'The actual map IconButtons request full48px pressable targets');
      assert.equal(tools.flexDirection,'row');const toolsWidth=3*48+2*Number(tools.gap),toolsX=tools.left===undefined?paneWidth-Number(tools.right)-toolsWidth:Number(tools.left);
      const toolBoxes=buttons.map((_,i)=>({x:toolsX+i*(48+Number(tools.gap)),y:Number(tools.top),width:48,height:48}));
      const peek=style(tree.find(n=>n.type==='AnimatedView'&&style(n).width===48&&style(n).height===48)!),travel=(peek.transform as Array<{translateX:{outputRange:number[]}}>)[0].translateX.outputRange;
      const peekBox={x:Number(peek.left)+travel[products?1:0],y:stageHeight/2+Number(peek.marginTop),width:Number(peek.width),height:Number(peek.height)};
      const dock=tree.find(n=>n.props.testID==='market-public-actions')!,placement=style(dock),action=tree.find(n=>n.type==='PublicActionDock')!;
      assert.equal(action.props.horizontal,false);assert.equal(action.props.compact,true);
      const dockBox={x:placement.left===undefined?viewport.width-Number(placement.right)-168:Number(placement.left),y:stageHeight-Number(placement.bottom)-48,width:168,height:48};
      for(const box of [...(products?[]:toolBoxes),peekBox,dockBox]){assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width&&box.y+box.height<=stageHeight,JSON.stringify({viewport,products,box}));assert.ok(box.width>=48&&box.height>=48);}
      assert.ok(!overlaps(peekBox,dockBox),'Dock cannot intercept the Products/Map handle');
      if(!products)for(const box of toolBoxes){assert.ok(!overlaps(box,peekBox),'Visible zoom/reset cannot be blocked by the peek');assert.ok(!overlaps(box,dockBox),'Transport cannot cover a visible map control');}
    }
  }
});

test('FE-053 Expo short-map toolbar clears its compiled right inset instead of intercepting empty map background',async()=>{
  type WebStyle=Record<string,unknown>;
  type WebStyleSheet=((styles:unknown)=>[string,Record<string,string|number>|null])&{create:<T extends Record<string,WebStyle>>(styles:T)=>T};
  // Use the installed web resolver, not the native fixture's Object.assign:
  // undefined does not clear a compiled RNWeb style whereas explicit auto does.
  const {StyleSheet}=createRequire(import.meta.url)('react-native-web') as {StyleSheet:WebStyleSheet};
  const rightOnly=StyleSheet.create({right:{right:12}}),rightClass=StyleSheet([rightOnly.right])[0];
  for(const dimensions of [{width:320,height:480,fontScale:1},{width:844,height:390,fontScale:1}]){
    const state=fixture();state.dimensions=dimensions;const render=await component('index',state);let tree=render();
    (tree.find(n=>n.props.testID==='market-stage')!.props.onLayout as(event:{nativeEvent:{layout:{height:number}}})=>void)({nativeEvent:{layout:{height:74}}});tree=render();
    const toolbar=tree.find(n=>n.props.testID==='map-tools')!,sourceStyles=toolbar.props.style as unknown[];
    assert.ok(sourceStyles[0]&&typeof sourceStyles[0]==='object');
    const compiled=StyleSheet.create({toolbar:sourceStyles[0] as WebStyle});
    const [classes,inline]=StyleSheet([compiled.toolbar,...sourceStyles.slice(1)]);
    assert.equal(inline?.left,'12px');assert.equal(inline?.right,'auto','A short toolbar must shrink to its actual buttons instead of stretching across the map');
    assert.ok(!classes.split(' ').includes(rightClass),'No inherited right12 class may intercept the blank map beside the buttons');
    assert.equal(tree.filter(n=>n.type==='IconButton'&&['Zoom in','Zoom out','Reset map'].includes(String(n.props.label))).length,3);
  }
});

test('FE-065 S143 actual Market keeps only compact centered modes and one non-layout heading without an empty status row',async()=>{
  for(const width of [320,390,844,1440]){
    const state=fixture();state.dimensions={width,height:width===844?390:844,fontScale:1};
    const render=await component('index',state);let tree=render();
    const headings=tree.filter(n=>n.type==='Text'&&n.props.accessibilityRole==='header'&&n.props.children==='MirtPage Market');
    assert.equal(headings.length,1);assert.equal(style(headings[0]).position,'absolute');assert.equal(style(headings[0]).width,1);assert.equal(style(headings[0]).height,1);
    const row=tree.find(n=>n.props.testID==='market-mode-row')!,children=nodes(row).filter(node=>node.props.accessibilityRole==='tablist');
    assert.equal(children.length,1);assert.equal(style(row).justifyContent,'center');assert.equal(style(row).paddingBottom,undefined);assert.equal(style(children[0]).padding,undefined);assert.equal(style(children[0]).width,undefined,'The switch uses its needed width rather than a framed full-width bar');
    const tabs=nodes(row).filter(n=>n.props.accessibilityRole==='tab');assert.deepEqual(tabs.map(n=>nodes(n).find(c=>c.type==='Text')!.props.children),['Business locations','Product listings']);
    assert.ok(tabs.every(n=>Number(style(n).minHeight)>=48));assert.equal(nodes(row).filter(n=>n.type==='Icon'&&['map','package'].includes(String(n.props.name))).length,width<=360?0:2,'Only decorative mode icons disappear on the smallest phones');
    assert.equal(tree.filter(n=>n.type==='Status').length,0,'A settled empty status does not allocate a toolbar gap');
    state.feed.loading=true;tree=render();assert.equal(tree.filter(n=>n.type==='Status'&&n.props.refreshing===true).length,1,'Actual loading remains visible');
    state.feed.loading=false;state.feed.error='Unable to connect';tree=render();assert.equal(tree.filter(n=>n.type==='Status'&&n.props.error==='Unable to connect').length,1,'The same bounded error/retry remains reachable');
    assert.ok(!tree.some(n=>n.props.accessibilityLabel==='About MirtPage'||n.type==='Icon'&&n.props.name==='info'||n.type==='Sheet'&&n.props.title==='About MirtPage'));
  }
});

test('FE-052 S143 native About selects one audience and preserves its deliberate Market/account routes',async()=>{
 const state=fixture(),render=await component('about',state);let tree=render();
 const tabs=()=>tree.filter(node=>node.props.accessibilityRole==='tab');
 assert.equal(tabs().length,2);assert.deepEqual(tabs().map(node=>(node.props.accessibilityState as {selected:boolean}).selected),[true,false]);assert.ok(tabs().every(node=>Number(style(node).minHeight)>=48));
 assert.ok(tree.some(node=>node.props.testID==='about-customers'));assert.ok(!tree.some(node=>node.props.testID==='about-businesses'));
 (tabs()[1].props.onPress as()=>void)();tree=render();assert.deepEqual(tabs().map(node=>(node.props.accessibilityState as {selected:boolean}).selected),[false,true]);assert.ok(!tree.some(node=>node.props.testID==='about-customers'));assert.ok(tree.some(node=>node.props.testID==='about-businesses'));
 (tree.find(node=>node.type==='Button'&&node.props.label===ABOUT_STOREFRONT_SECTIONS[1].action)!.props.onPress as()=>void)();assert.equal(state.routes.at(-1),'/account');
 (tabs()[0].props.onPress as()=>void)();tree=render();(tree.find(node=>node.type==='Button'&&node.props.label===ABOUT_STOREFRONT_SECTIONS[0].action)!.props.onPress as()=>void)();assert.equal(state.routes.at(-1),'/');assert.ok(tree.some(node=>node.type==='Button'&&node.props.label==='Explore the map'));
});

test('FE-065 S128 native controls share a measured wide row and retain visible wrapping phone/enlarged filters',async()=>{
  for(const dimensions of [{width:844,height:390,fontScale:1},{width:1440,height:1000,fontScale:1},{width:390,height:844,fontScale:1},{width:320,height:480,fontScale:1},{width:844,height:390,fontScale:2}]){
    for(const scope of ['businesses','products'] as const){
      const state=fixture();state.dimensions=dimensions;const render=await component('MarketSearchControls',state);
      const props={scope,value:{query:'chairs',categories:['furniture'],countries:['ET'],cities:['ET:Addis Ababa'],madeToOrder:true,page:1},onChange(){},metadata:{categories:[],countries:[],places:[]}};
      let tree=render(props),root=tree.find(n=>n.props.testID===scope+'-controls')!,search=tree.find(n=>n.props.testID===scope+'-search')!,filters=tree.find(n=>n.props.testID===scope+'-filters')!;
      const wide=dimensions.width-24>=760&&dimensions.fontScale<=1.3;
      assert.equal(style(root).flexDirection,wide?'row':undefined);assert.equal(style(search).minWidth,wide?220:undefined);assert.equal(style(filters).minWidth,wide?(scope==='products'?398:264):undefined);
      const choices=nodes(filters).filter(n=>n.type==='Pressable');assert.equal(choices.length,scope==='products'?4:3);
      for(const label of ['Category (1)','Country (1)','City (1)',...(scope==='products'?['Made to order']:[])])assert.ok(choices.some(n=>n.props.accessibilityLabel===label),'Every labeled filter stays in the row: '+label);
      assert.ok(choices.every(n=>Number(style(n).minHeight)>=48&&Number(style(n).minWidth)>=48));assert.ok(!tree.some(n=>n.type==='ScrollView'),'No hidden or scrolling filter menu replaces choices');
      if(dimensions.fontScale>1.3){assert.equal(style(filters).flexWrap,'wrap');assert.ok(choices.every(n=>style(n).flexBasis==='45%'),'Large native text can wrap into honest full-width cells');}
      if(wide){
        (root.props.onLayout as(event:{nativeEvent:{layout:{width:number}}})=>void)({nativeEvent:{layout:{width:700}}});tree=render(props);assert.equal(style(tree.find(n=>n.props.testID===scope+'-controls')!).flexDirection,undefined,'Actual content width controls layout, not screen width alone');
        (tree.find(n=>n.props.testID===scope+'-controls')!.props.onLayout as(event:{nativeEvent:{layout:{width:number}}})=>void)({nativeEvent:{layout:{width:760}}});tree=render(props);assert.equal(style(tree.find(n=>n.props.testID===scope+'-controls')!).flexDirection,'row');
      }
    }
  }
});

test('FE-065 S128 actual RNWeb View receives no raw idle status text while loading and error content remain',async()=>{
  const require=createRequire(import.meta.url);
  const React=require('react') as {createElement:(type:unknown,props:unknown,...children:unknown[])=>unknown};
  const {renderToString}=require('react-dom/server') as {renderToString:(element:unknown)=>string};
  const {View}=require('react-native-web') as {View:unknown};
  for(const products of [false,true])for(const status of [{loading:false,error:''},{loading:true,error:''},{loading:false,error:'Unable to connect'}]){
    const state=fixture();state.feed.loading=status.loading;state.feed.error=status.error;
    const render=await component('index',state);let tree=render();selectMode(tree,products);tree=render();
    const controls=tree.find(n=>n.type==='View'&&[n.props.children].flat().some(child=>child&&typeof child==='object'&&'type'in child&&typeof child.type==='function'&&child.type.name==='MarketSearchControls'))!;
    const children=[controls.props.children].flat(),reported:string[]=[],originalError=console.error;
    try{
      console.error=(...values:unknown[])=>reported.push(values.map(String).join(' '));
      renderToString(React.createElement(View,null,...children.map((child,index)=>child&&typeof child==='object'?React.createElement('span',{key:index}):child)));
    }finally{console.error=originalError;}
    assert.deepEqual(reported.filter(message=>message.includes('Unexpected text node')),[],'Actual RNWeb must not emit a LogBox warning for the settled empty error');
    assert.ok(children.every(child=>typeof child!=='string'&&typeof child!=='number'),'Conditional status cannot leak a falsy text primitive under View');
    const list=tree.find(node=>node.type==='FlatList')!;const header=nodes(list.props.ListHeaderComponent as Element);const statuses=[...tree,...header].filter(n=>n.type==='Status');assert.equal(statuses.length,status.loading||status.error?1:0);
    if(status.loading)assert.equal(statuses[0].props.refreshing,true,'Pending read feedback stays local to the map overlay or product header');
    if(status.error){assert.equal(statuses[0].props.error,status.error);assert.equal(typeof statuses[0].props.retry,'function');}
  }
});


test('FE-065 S130 product results keep the excerpt and separate48px business route with same-row city/legacy fallback',async()=>{
 const state=fixture(),render=await component('index',state);const tree=render(),feed=tree.find(n=>n.type==='FlatList')!;
 for(const fields of [{city:'Addis Ababa',region:'Oromia'},{city:' ',region:'Oromia'},{}]){
  const item={id:81,name:'Woven chair',handle:'woven',businessName:'Woven business',kind:'product',description:'Merchant description stays two lines',image:'',...fields};const row=nodes((feed.props.renderItem as(value:{item:unknown})=>Element)({item}));
  assert.equal(row.find(n=>n.props.children===item.description)?.props.numberOfLines,2);const location=row.find(n=>n.props.testID==='product-result-location-81');assert.equal(location?.props.children,fields.city?.trim()||fields.region);const business=row.find(n=>n.props.accessibilityRole==='link')!;assert.ok(Number(style(business).minHeight)>=48);
  (row.find(n=>n.props.accessibilityLabel===item.name)!.props.onPress as()=>void)();(business.props.onPress as()=>void)();assert.equal((state.routes.at(-2)as{pathname:string}).pathname,'/product');assert.equal((state.routes.at(-1)as{pathname:string}).pathname,'/shop/[handle]');
 }
});

test('FE-065 S130 selected business country uses the current locale without dangling or duplicate separators',async()=>{
 const state=fixture();state.locale='am';const render=await component('index',state);let tree=render();
 const choose=(shop:Record<string,unknown>)=>{Object.assign(state.feed.batch.data,{showrooms:[shop]});tree=render();(tree.find(n=>n.type==='MarketMap')!.props.onSelect as(value:unknown)=>void)(shop);tree=render();return tree.find(n=>n.type==='Sheet'&&n.props.title==='Business')!;};
 const base={id:1,handle:'location',name:'Location business',heroImagePath:'',description:'A useful full description',city:'Addis Ababa',region:'Legacy region',countryCode:'ET',latitude:9.03,longitude:38.75,locationMode:'storefront'};
 let sheet=choose(base);const expected=new Intl.DisplayNames(['am'],{type:'region'}).of('ET');assert.ok(nodes(sheet).some(n=>n.type==='Copy'&&n.props.children==='Addis Ababa · '+expected));assert.ok(nodes(sheet).some(n=>n.props.children===base.description));
 sheet=choose({...base,city:'',region:'',countryCode:''});assert.ok(!nodes(sheet).some(n=>n.type==='Copy'&&n.props.muted===true),'Missing location adds no empty separator line');
 sheet=choose({...base,city:'Nairobi',region:'Nairobi',countryCode:''});assert.ok(nodes(sheet).some(n=>n.type==='Copy'&&n.props.children==='Nairobi'));assert.ok(!nodes(sheet).some(n=>String(n.props.children).includes('Nairobi · Nairobi')));
});
