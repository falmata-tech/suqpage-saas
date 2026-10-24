import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import type {MapShop} from '../packages/contracts/src';
import {mapGroupCapacity,mapGroupPickerLayout,MAP_NATIVE_MAX_ZOOM,MAP_MAX_ZOOM,MAP_GROUP_ROW_HEIGHT,MAP_GROUP_COMPACT_ROW_HEIGHT} from '../lib/map/map-clustering';
import {markerIndex,visibleMarkers,currentGroupMembers} from '../apps/mobile/src/map-markers';
import {shopCoordinate,nextMapZoom} from '../apps/mobile/src/native-map-model';

const shop=(id:number,patch:Partial<MapShop>={}):MapShop=>({id,handle:'fixture-'+id,name:'Business '+id,description:'',heroImagePath:'/owned-'+id+'.jpg',city:'Fixture city',region:'',latitude:9.03,longitude:38.75,locationMode:'storefront',...patch});
type Element={type:string|((props:Record<string,unknown>)=>Element);props:Record<string,unknown>&{children?:unknown}};
type Effect={deps:unknown[];cleanup?:()=>void};
type FocusTarget={focus:()=>void};
// Keep the test's native storage port structural: importing a native module's
// types here would inject React Native globals into the separate web typecheck.
type MapReturnContext={ids:number[];page:number;anchor:number|null;camera:{center:[number,number];zoom:number}};
// Actual native adapter/picker source through explicit native/SDK/lifecycle ports.
// This is not a native MapLibre renderer, browser, API or physical-device claim.
const bundled=build({entryPoints:['apps/mobile/src/MapGroupPicker.tsx','apps/mobile/src/MapMarker.tsx','apps/mobile/src/MarketMap.tsx','apps/mobile/src/map-return-session.ts'],outdir:'/tmp/suqpage-native-map-groups',write:false,bundle:true,format:'cjs',platform:'node',plugins:[{name:'native-map-group-ports',setup(b){
 b.onResolve({filter:/^(react(?:\/jsx-runtime)?|react-native|react-native-svg|react-native-safe-area-context|@maplibre\/maplibre-react-native|\.\/(runtime|ui|MapMarker|LoadingBar|overlay-visibility))$/},args=>({path:args.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
  a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],next=>fixture.states[i]=typeof next==='function'?next(fixture.states[i]):next];},useRef=initial=>{const i=fixture.cursor++;return fixture.states[i]||(fixture.states[i]={current:initial});},useMemo=fn=>fn(),useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))fixture.pending.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});},useImperativeHandle=(_ref,create)=>fixture.controls=create(),forwardRef=fn=>fn;export default {};`
  :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :a.path==='react-native'?`export const View='View',Text='Text',Pressable='Pressable',Modal='Modal',Platform={get OS(){return fixture.platform||'android';}},StyleSheet={create:value=>value,absoluteFill:{position:'absolute'}},useWindowDimensions=()=>fixture.dimensions;`
  :a.path==='react-native-safe-area-context'?`export const useSafeAreaInsets=()=>fixture.insets;`
  :a.path==='react-native-svg'?`export default 'Svg';export const Path='Path',Rect='Rect';`
  :a.path==='@maplibre/maplibre-react-native'?`export const Map='Map',Camera='Camera',Marker='Marker',GeoJSONSource='GeoJSONSource',Layer='Layer',TransformRequestManager={addHeader:value=>fixture.headers.push(value)};`
  :a.path==='./runtime'?`export const useApp=()=>({t:(key,values={})=>Object.entries(values).reduce((value,[name,replacement])=>value.replace('{'+name+'}',String(replacement)),key)});`
  :a.path==='./ui'?`export const Button='Button',Photo='Photo',Icon='Icon',colors={ink:'#222',muted:'#666',line:'#ddd'};`
  :a.path==='./overlay-visibility'?`export const registerOverlay=()=>{fixture.overlays++;return()=>fixture.overlays--;};`
  :a.path==='./MapMarker'?`export const MapMarker='MapMarker';`
  :`export default 'LoadingBar';`
 }));
}}]});
function nodes(value:unknown):Element[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return[];const node=value as Element;return[node,...nodes(node.props.children)];}
function text(value:unknown):string{if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'||typeof value==='number'?String(value):'';}
const style=(node:Element)=>Object.assign({},...[node.props.style].flat(Infinity).filter(Boolean)) as Record<string,unknown>;
const press=(node:Element)=>{assert.ok(node);assert.notEqual(node.props.disabled,true);(node.props.onPress as()=>void)();};
async function component(entry:string,options:{development?:boolean;mapFixture?:string}={}){
 const fixture={development:options.development??true,mapFixture:options.mapFixture,platform:'android' as 'android'|'ios'|'web',cursor:0,effectCursor:0,states:[] as unknown[],effects:[] as Effect[],pending:[] as Array<()=>void>,dimensions:{width:390,height:844,fontScale:1},insets:{top:0,bottom:0,left:0,right:0},overlays:0,headers:[] as unknown[],controls:null as unknown};
 const output=(await bundled).outputFiles.find(f=>f.path.endsWith('/'+entry+'.js'))!,module={exports:{} as {default?:(props:Record<string,unknown>)=>Element;MapMarker?:(props:Record<string,unknown>)=>Element}};
 vm.runInNewContext(output.text,{module,exports:module.exports,fixture,__DEV__:fixture.development,process:{env:{EXPO_PUBLIC_NATIVE_MAP_FIXTURE:fixture.mapFixture}},setTimeout:()=>1,clearTimeout:()=>{},requestAnimationFrame:(fn:()=>void)=>{fn();return 1;},cancelAnimationFrame:()=>{}});
 return{fixture,render:(props:Record<string,unknown>)=>{fixture.cursor=fixture.effectCursor=0;const render=module.exports.default||module.exports.MapMarker;assert.ok(render);const tree=nodes(render(props));for(const effect of fixture.pending.splice(0))effect();return tree;},unmount:()=>fixture.effects.forEach(e=>e.cleanup?.())};
}

test('FE-021 S153 explicit development fixture mounts native MapLibre with no remote resource sources and fails closed in release',async()=>{
 const app=await component('MarketMap',{development:true,mapFixture:'1'});const tree=app.render({shops:[shop(1)],onSelect(){}}),style=tree.find(n=>n.type==='Map')!.props.mapStyle as{sources:Record<string,unknown>;layers:Array<{type:string}>;metadata?:Record<string,string>};assert.deepEqual(Object.keys(style.sources),[]);assert.equal(style.layers.length,1);assert.equal(style.layers[0].type,'background');assert.equal(style.metadata?.['mirtpage:fixture'],'mirtpage-native-background-v1');assert.doesNotMatch(JSON.stringify(style),/https?:|tiles|glyphs|sprite/);assert.ok(tree.some(n=>n.type==='Marker'),'Real native marker path remains mounted');app.unmount();
 for(const development of[true,false])for(const mapFixture of['invalid','http://unsafe.example','true'])await assert.rejects(()=>component('MarketMap',{development,mapFixture}),/fixture/i);
 await assert.rejects(()=>component('MarketMap',{development:false,mapFixture:'1'}),/development|release/i);
 const ordinary=await component('MarketMap',{development:false});const regular=ordinary.render({shops:[],onSelect(){}}).find(n=>n.type==='Map')!.props.mapStyle;assert.match(JSON.stringify(regular),/https:\/\/tile\.openstreetmap\.org/);ordinary.unmount();
});

test('FE-021 S153 installed SDK consumes measured native marker hits through its own callback',async()=>{
 const base='node_modules/@maplibre/maplibre-react-native/';
 const android=readFileSync(base+'android/src/main/java/org/maplibre/reactnative/components/mapview/MLRNMapView.kt','utf8'),bounds=readFileSync(base+'android/src/main/java/org/maplibre/reactnative/components/annotations/markerview/MarkerViewManager.kt','utf8'),marker=readFileSync(base+'src/components/annotations/marker/Marker.tsx','utf8');
 assert.match(android,/hitMarker\.markerView\.onPress\(latLng, pressPoint\)\s+return true/);assert.match(bounds,/val \(w, h\) = v\.getContentSize\(\)/);assert.match(bounds,/RectF\(v\.x, v\.y, v\.x \+ w, v\.y \+ h\)/);assert.match(marker,/Platform\.OS === "ios"/);assert.match(marker,/<ViewAnnotation[\s\S]*?\{\.\.\.props\}/);
 const app=await component('MarketMap'),shops=[shop(1),shop(2),shop(3,{longitude:38.79}),shop(4,{longitude:38.79}),shop(5,{longitude:39.5})],opened:number[][]=[],selected:number[]=[],cameraCalls:unknown[]=[];
 const props={shops,onSelect:(s:MapShop)=>selected.push(s.id),onGroup:(rows:MapShop[])=>opened.push(Array.from(rows,s=>s.id))};let tree=app.render(props);(tree.find(n=>n.type==='Camera')!.props.ref as{current:unknown}).current={easeTo:(view:unknown)=>cameraCalls.push(view)};
 const settle=(zoom:number)=>{(tree.find(n=>n.type==='Map')!.props.onRegionDidChange as(e:unknown)=>void)({nativeEvent:{center:[38.75,9.03],zoom,bounds:[38,8,40,10]}});tree=app.render(props);};
 const sdkPress=(kind:string)=>{const host=tree.find(n=>n.type==='Marker'&&((n.props.children as Element).props.item as{kind:string}).kind===kind)!;assert.ok(host,'Fixture exposes '+kind);assert.equal(typeof host.props.onPress,'function','Android consumes the host hit; a child-only callback cannot repair '+kind);let stopped=0;(host.props.onPress as(e:{stopPropagation:()=>void})=>void)({stopPropagation:()=>stopped++});assert.equal(stopped,1);return host;};
 settle(5);sdkPress('aggregate');assert.equal(cameraCalls.length,1);assert.equal(opened.length,0);settle(12);const before=cameraCalls.length;sdkPress('cluster');assert.equal(opened.length,1);assert.equal(cameraCalls.length,before,'Terminal SDK press opens in place');sdkPress('shop');assert.deepEqual(selected,[5]);assert.equal(opened.length,1);app.unmount();
});

test('FE-021 S153 iOS counted SDK host remains targetable for its own annotation recognizer',async()=>{
 const annotation=readFileSync('node_modules/@maplibre/maplibre-react-native/ios/components/annotations/point-annotation/MLRNPointAnnotation.m','utf8');assert.match(annotation,/\[self addGestureRecognizer:customViewTap\]/);assert.match(annotation,/_handleTap:[\s\S]*?self\.reactOnPress\(\[self makeEventPayload\]\)/);
 const app=await component('MarketMap');app.fixture.platform='ios';const shops=[shop(1),shop(2)],groups:number[][]=[];const props={shops,onSelect(){throw Error('No isolatedshop');},onGroup:(rows:MapShop[])=>groups.push(Array.from(rows,s=>s.id))};let tree=app.render(props);(tree.find(n=>n.type==='Map')!.props.onRegionDidChange as(e:unknown)=>void)({nativeEvent:{center:[38.75,9.03],zoom:12,bounds:[38,8,40,10]}});tree=app.render(props);const host=tree.find(n=>n.type==='Marker')!;assert.equal(host.props.pointerEvents,'box-only','The iOS recognizer belongs to the SDK host; a box-none host with noninteractive children is not sufficient');assert.equal((host.props.children as Element).props.nativeMarker,true);let stopped=0;(host.props.onPress as(e:{stopPropagation:()=>void})=>void)({stopPropagation:()=>stopped++});assert.equal(stopped,1);assert.deepEqual(groups,[[1,2]]);app.unmount();
});

test('FE-053 native map registers only the canonical public User-Agent on the exact OSM tile host',async()=>{
 const app=await component('MarketMap');
 assert.deepEqual(JSON.parse(JSON.stringify(app.fixture.headers)),[{id:'suqpage-osm-client',match:'^https://tile\\.openstreetmap\\.org/',name:'User-Agent',value:'AfricMade/0.1 (+https://mirtpage.com)'}]);
 const header=app.fixture.headers[0] as{match:string;value:string};const match=new RegExp(header.match);
 assert.ok(match.test('https://tile.openstreetmap.org/9/314/208.png'));
 for(const target of['http://tile.openstreetmap.org/9/314/208.png','https://other.tile.openstreetmap.org/9/314/208.png','https://tile.openstreetmap.org.evil.test/9/314/208.png','https://tile.openstreetmap.org@evil.test/9/314/208.png','https://mirtpage.com/api/mobile/v1/market','https://sjeiiqxgscuqajpgddcc.supabase.co/auth/v1/user'])assert.equal(match.test(target),false);
 assert.doesNotMatch(header.value,/Bearer|cookie|token|key=/i);app.unmount();
});

test('FE-053 native group identities stay fixed across zoom for admitted screen capacities',()=>{
 const shops=Array.from({length:24},(_,i)=>shop(i+1,{isLive:i===1,isFeatured:i===2})),bounds:[number,number,number,number]=[-180,-85.051129,180,85.051129];
 const index=markerIndex([...shops,shops[0],shop(99,{latitude:NaN})]),terminalKeys=index.groups.map(group=>group.key);
 for(const zoom of [1,6,13,14,12,17.9,18,19,100]){
  const markers=visibleMarkers(index,shops,[{key:'legacy',city:'Fixture city',latitude:9.03,longitude:38.75,showroomIds:[1,2]}],bounds,zoom);
  if(zoom>=18){assert.equal(markers.length,8);assert.ok(markers.every(m=>m.kind==='cluster'&&m.count===3&&m.expansionZoom===undefined));assert.deepEqual(markers.map(m=>m.key),terminalKeys);}
  else assert.ok(markers.every(m=>m.kind==='aggregate'?m.expansionZoom!==undefined&&m.expansionZoom>Math.floor(zoom)&&m.expansionZoom<=MAP_MAX_ZOOM:m.expansionZoom===undefined),'Only actual outer aggregates expose a zoom target');
  assert.deepEqual(markers.flatMap(m=>m.shops?.map(s=>s.id)||[]).sort((a,b)=>a-b),shops.map(s=>s.id));
  for(const m of markers)assert.equal(m.presence,m.shops?.some(s=>s.isFeatured)?'featured':m.shops?.some(s=>s.isLive)?'live':'');
  assert.deepEqual(index.groups.map(group=>group.key),terminalKeys,'Outer clustering cannot change fixed terminal identities');
 }
 const changed=shops.slice(1).map(s=>({...s,isFeatured:false,isLive:s.id===2})),currentIndex=markerIndex(changed),current=visibleMarkers(currentIndex,changed,[],bounds,18);
 assert.ok(current.every(m=>m.count===2||m.count===3));assert.deepEqual(current.flatMap(m=>m.shops?.map(s=>s.id)||[]).sort((a,b)=>a-b),changed.map(s=>s.id));
 const first=visibleMarkers(index,shops,[],bounds,18)[0],ids=first.shops!.map(s=>s.id);
 assert.deepEqual(currentGroupMembers(index,shops,ids,18).map(s=>s.id),ids);
 assert.deepEqual(currentGroupMembers(index,shops,ids,6),[],'A current fixed group hidden inside an outer aggregate cannot be restored');
 assert.deepEqual(currentGroupMembers(currentIndex,changed,ids,18),[],'A subset or stale partition cannot restore a former group');
 assert.deepEqual(currentGroupMembers(index,shops,[ids[0],ids[1]],18),[],'An arbitrary current pair is not authority for part of a three-member group');
 const area=shop(71,{locationMode:'area'}),point=shopCoordinate(area)!,areaIndex=markerIndex([area]),areaMarker=visibleMarkers(areaIndex,[area],[],bounds,18)[0];assert.deepEqual(areaMarker.center,point,'City-only pin uses its canonical anchor without per-business offset');assert.equal(areaMarker.kind,'shop','A sole city-only business uses the shop glyph, never a numbered one-business circle');assert.equal(areaMarker.shop?.id,area.id);assert.equal(areaMarker.shops,undefined);
 const dense=Array.from({length:200},(_,i)=>shop(i+1)),denseMarkers=visibleMarkers(markerIndex(dense),dense,[],bounds,18);assert.equal(denseMarkers.length,67);assert.ok(denseMarkers.every(marker=>marker.count===2||marker.count===3));assert.equal(denseMarkers.reduce((sum,marker)=>sum+marker.count,0),200);
 for(const capacity of [1,2,3,4,6]){const adaptive=markerIndex(shops,capacity),atLow=visibleMarkers(adaptive,shops,[],bounds,2),atHigh=visibleMarkers(adaptive,shops,[],bounds,18);assert.equal(adaptive.capacity,capacity);assert.ok(atLow.every(m=>m.expansionZoom!==undefined));assert.ok(atHigh.every(m=>m.expansionZoom===undefined));assert.ok(atHigh.every(m=>m.count===1?m.kind==='shop':m.kind==='cluster'&&m.count<=capacity));assert.equal(atHigh.reduce((sum,m)=>sum+m.count,0),shops.length);}
 assert.equal(nextMapZoom(19,1),MAP_MAX_ZOOM);assert.equal(nextMapZoom(18,1,MAP_NATIVE_MAX_ZOOM),12);
});

test('FE-021/FE-053 a city-only singleton is a shop marker with a direct, accessible preview',async()=>{
 const app=await component('MarketMap'),shops=[shop(1,{locationMode:'area'}),shop(2)],opened:number[][]=[],selected:number[]=[];
 const props={shops,groupCapacity:1,onSelect:(s:MapShop)=>selected.push(s.id),onGroup:(members:MapShop[])=>opened.push(Array.from(members,s=>s.id))};let tree=app.render(props);(tree.find(n=>n.type==='Map')!.props.onRegionDidChange as(e:unknown)=>void)({nativeEvent:{center:[38.75,9.03],zoom:12,bounds:[38,8,40,10]}});tree=app.render(props);
 const pins=tree.filter(n=>n.type==='MapMarker'),city= pins.find(n=>(n.props.item as{shop?:MapShop}).shop?.id===1)!;assert.equal(pins.length,2);assert.equal((city.props.item as{kind:string}).kind,'shop');assert.match(String(city.props.label),/Business 1\. Fixture city\. Open page preview/);assert.doesNotMatch(String(city.props.label),/City only/);press(city);assert.deepEqual(selected,[1]);assert.deepEqual(opened,[]);app.unmount();
});

test('FE-021 Expo city-area singleton marker names the business without internal mode text',async()=>{
 const app=await component('MapMarker'),item=visibleMarkers(markerIndex([shop(71,{locationMode:'area'})]),[shop(71,{locationMode:'area'})],[],[-180,-85,180,85],18)[0];
 const tree=app.render({item,selected:false,label:'Addis Workshop. Addis Ababa. Open page preview',badge:'',nearby:'Nearby',onPress(){}});
 const labels=tree.filter(node=>node.type==='Text').map(node=>String(node.props.children));
 assert.ok(labels.includes('Business 71'),'The business name remains visible on its own shop pin.');
 assert.ok(!labels.includes('City only'),'Internal mode text must not appear on the marker.');app.unmount();
});

test('FE-053 S154/S160 native21 city-area pins expose groups at raw11 and terminal taps never move the camera',async()=>{
 const app=await component('MarketMap'),shops=Array.from({length:21},(_,i)=>shop(i+1,{locationMode:'area'})),groups:number[][]=[],calls:Array<{center:[number,number];zoom:number}>=[];
 // Snapshot each observation so assert's empty-array narrowing does not make
 // the mutable callback log never[] before the next controlled SDK event.
 const observedGroups=():number[][]=>groups.map(ids=>[...ids]);
 const props={shops,onSelect(){throw Error('An aggregate cannot select an individual shop');},onGroup:(rows:MapShop[])=>groups.push(Array.from(rows,s=>s.id))};let tree=app.render(props);const camera=tree.find(n=>n.type==='Camera')!;(camera.props.ref as{current:unknown}).current={easeTo:(view:{center:[number,number];zoom:number})=>calls.push(view)};
 const settle=(zoom:number)=>{(tree.find(n=>n.type==='Map')!.props.onRegionDidChange as(e:unknown)=>void)({nativeEvent:{center:[38.75,9.03],zoom,bounds:[38,8,40,10]}});tree=app.render(props);};
 settle(5);const aggregate=tree.find(n=>n.type==='MapMarker'&&(n.props.item as{kind:string}).kind==='aggregate')!;assert.ok(aggregate);const aggregateItem=aggregate.props.item as{expansionZoom:number;center:[number,number];count:number};assert.equal(aggregate.props.label,aggregateItem.count+' businesses. Zoom in.');press(aggregate);assert.equal(aggregateItem.count,21);assert.equal(calls.at(-1)!.zoom,11);assert.equal(calls.at(-1)!.zoom,aggregateItem.expansionZoom-1);assert.deepEqual(JSON.parse(JSON.stringify(calls.at(-1)!.center)),Array.from(aggregateItem.center));assert.deepEqual(observedGroups(),[]);
 settle(11);const cityMarkers=tree.filter(n=>n.type==='MapMarker');assert.equal(cityMarkers.length,7);assert.ok(cityMarkers.every(node=>!String(node.props.label).includes('City only')),'Map accessibility labels omit internal location modes');const terminal=cityMarkers.find(n=>(n.props.item as{kind:string}).kind==='cluster')!;assert.ok(terminal);const terminalItem=terminal.props.item as{expansionZoom?:number;shops:MapShop[]};assert.equal(terminalItem.expansionZoom,undefined);assert.ok(String(terminal.props.label).includes('View businesses.'));const terminalIds=Array.from(terminalItem.shops,s=>s.id);assert.deepEqual(currentGroupMembers(markerIndex(shops),shops,terminalIds,12).map(s=>s.id),terminalIds);const commands=calls.length;press(terminal);assert.equal(groups.length,1);assert.ok(groups[0].length<=3);assert.equal(calls.length,commands,'A separated terminal at native raw11 opens in place');
 settle(12);const ready=tree.find(n=>n.type==='MapMarker'&&(n.props.item as{kind:string}).kind==='cluster')!;assert.equal((ready.props.item as{expansionZoom?:number}).expansionZoom,undefined);press(ready);assert.equal(groups.length,2);assert.equal(calls.length,commands,'The same terminal remains a preview at maximum');app.unmount();
});

test('FE-053 native SDK controller caps gesture/programmatic zoom and group presses open current members without moving the camera',async()=>{
 const app=await component('MarketMap'),shops=[shop(1),shop(2)],selected:number[]=[],groups:number[][]=[],calls:unknown[]=[];
 const settled:number[]=[],views:unknown[]=[];const props={shops,groups:[],height:500,initialView:{center:[38.73,9.02],zoom:99},onSelect:(s:MapShop)=>selected.push(s.id),onGroup:(members:MapShop[])=>groups.push(Array.from(members,s=>s.id)),onZoomChange:(zoom:number)=>settled.push(zoom),onViewChange:(view:unknown)=>views.push(view)};let tree=app.render(props);
 const camera=tree.find(n=>n.type==='Camera')!;assert.equal(camera.props.maxZoom,12);assert.equal(camera.props.minZoom,1);assert.deepEqual(JSON.parse(JSON.stringify(camera.props.initialViewState)),{center:[38.73,9.02],zoom:12},'A remounted camera restores its public center with a clamped scale');(camera.props.ref as{current:unknown}).current={zoomTo:(...args:unknown[])=>calls.push(['zoom',...args]),easeTo:(...args:unknown[])=>calls.push(['ease',...args])};
 (tree.find(n=>n.type==='Map')!.props.onRegionDidChange as(e:unknown)=>void)({nativeEvent:{center:[38.75,9.03],zoom:99,bounds:[38,8,40,10]}});tree=app.render(props);const marker=tree.find(n=>n.type==='MapMarker')!;assert.equal((marker.props.item as{count:number}).count,2);assert.equal(marker.props.label,'2 businesses. View businesses.');press(marker);assert.deepEqual(groups,[[1,2]]);assert.deepEqual(calls,[],'Terminal circle taps at the district maximum never zoom/pan');
 const lastCall=()=>{const value=calls.at(-1);assert.ok(Array.isArray(value));return value as unknown[];};
 const controls=app.fixture.controls as{zoom:(direction:1|-1)=>void;focus:(s:MapShop)=>void;reset:()=>void};controls.zoom(1);assert.equal(lastCall()[1],12);controls.focus(shops[0]);assert.equal((lastCall()[1]as{zoom:number}).zoom,12);controls.reset();
 assert.deepEqual(settled,[12]);assert.deepEqual(JSON.parse(JSON.stringify(views)),[{center:[38.75,9.03],zoom:12}]);assert.deepEqual(selected,[]);assert.ok(JSON.stringify(app.fixture.headers).includes('openstreetmap'));assert.ok(!JSON.stringify(app.fixture.headers).includes('token'));app.unmount();
});

test('FE-053 fixed native fanout keeps separate counted circles without connecting geometry',async()=>{
 const shops=Array.from({length:12},(_,i)=>shop(i+1)),index=markerIndex(shops,6),markers=visibleMarkers(index,shops,[],[38,8,40,10],18);
 assert.equal(markers.length,2);assert.ok(markers.some(marker=>marker.center[0]!==marker.anchor[0]||marker.center[1]!==marker.anchor[1]),'The no-line check must exercise genuinely displaced circles');
 const app=await component('MarketMap'),props={shops,groupCapacity:6,onSelect(){},onGroup(){}};let tree=app.render(props);
 (tree.find(n=>n.type==='Map')!.props.onRegionDidChange as(e:unknown)=>void)({nativeEvent:{center:[38.75,9.03],zoom:12,bounds:[38,8,40,10]}});tree=app.render(props);
 assert.ok(!tree.some(n=>n.type==='GeoJSONSource'||n.type==='Layer'),'The actual native adapter renders no source/layer for connecting lines');assert.equal(tree.filter(n=>n.type==='Marker').length,2);assert.ok(tree.filter(n=>n.type==='MapMarker').every(n=>(n.props.item as{count:number}).count===6));
 assert.ok(tree.filter(n=>n.type==='Marker').every(n=>typeof n.props.onPress==='function'&&n.props.pointerEvents==='box-none'&&(n.props.children as Element).props.nativeMarker===true),'Counted native markers require SDK dispatch and an explicitly bounded child host');app.unmount();
});

test('FE-053 counted native marker keeps its anchor frame transparent with one48px circle target',async()=>{
 const app=await component('MapMarker'),item=visibleMarkers(markerIndex([shop(1),shop(2)]),[shop(1),shop(2)],[],[38,8,40,10],18)[0];let presses=0;
 const tree=app.render({item,selected:false,label:'2 businesses. View businesses.',badge:'Featured',nearby:'Nearby',onPress(){presses++;}}),action=tree.find(n=>n.type==='Pressable')!,hit=tree.find(n=>n.type==='View'&&n.props.pointerEvents==='auto')!;
 assert.equal(action.props.pointerEvents,'box-none');assert.equal(style(action).width,96);assert.equal(style(hit).width,48);assert.equal(style(hit).height,48);assert.equal(tree.filter(n=>n.type==='Pressable').length,1);assert.ok(tree.some(n=>n.type==='Text'&&n.props.pointerEvents==='none'),'Decorative badge cannot expand the hit area');press(action);assert.equal(presses,1);
 const neighboringHitX=56;assert.ok(Number(style(hit).width)<neighboringHitX,'Shared56px fanout leaves at least8px between actual48px targets');app.unmount();
});

test('FE-021 S153 native SDK group host is48dp with unchanged visual center and one accessible action; web frame remains unchanged',async()=>{
 const item=visibleMarkers(markerIndex([shop(1),shop(2)]),[shop(1),shop(2)],[],[38,8,40,10],18)[0];
 for(const kind of ['cluster','aggregate','nearby'] as const){
  const app=await component('MapMarker');let presses=0;const props={item:{...item,kind},selected:false,label:'2 businesses. View businesses.',badge:'Featured',nearby:'Nearby',onPress(){presses++;}};
  const web=app.render(props),native=app.render({...props,nativeMarker:true}),wa=web.find(n=>n.type==='Pressable')!,na=native.find(n=>n.type==='Pressable')!,wh=web.find(n=>n.type==='View'&&style(n).width===48)!,nh=native.find(n=>n.type==='View'&&style(n).width===48)!;
  assert.equal(style(wa).width,96);assert.equal(style(wa).paddingTop,13);assert.equal(wa.props.pointerEvents,'box-none');assert.equal(wh.props.pointerEvents,'auto');
  assert.equal(style(na).width,48);assert.equal(style(na).minHeight,48);assert.equal(style(na).paddingTop,0);assert.equal(style(na).paddingBottom,0);assert.equal(na.props.pointerEvents,'none');assert.equal(nh.props.pointerEvents,'none','No child physical hit route competes with SDK dispatch');assert.equal(style(nh).height,48);assert.equal(native.filter(n=>n.type==='Pressable').length,1);assert.equal(na.props.accessibilityRole,'button');assert.equal(na.props.accessibilityLabel,props.label);press(na);assert.equal(presses,1,'The sole accessible action delegates once');
  const wb=web.find(n=>n.type==='Text'&&n.props.pointerEvents==='none')!,nb=native.find(n=>n.type==='Text'&&n.props.pointerEvents==='none')!;
  assert.equal(-31+Number(style(wa).paddingTop)+24,-18+Number(style(na).paddingTop)+24,'Circle center stays at the same geographic pixel');assert.equal(-31+Number(style(wb).top),-18+Number(style(nb).top),'Badge pixels retain their old map position');
  const glyph=native.find(n=>n.type==='View'&&style(n).borderWidth===3)!;assert.equal(style(glyph).width,kind==='nearby'?58:46,'Legacy nearby artwork retains its visible size without enlarging48dp host');assert.ok(48<56,'Neighboring56dp fanout retains8dp between SDK hit frames');app.unmount();
 }
});

test('FE-053 adaptive picker shows every admitted phone/desktop member at once without pages',async()=>{
 for(const config of [{width:320,height:480,fontScale:1,count:3},{width:1440,height:1000,fontScale:1,count:6},{width:320,height:480,fontScale:2,count:1}]){
  const app=await component('MapGroupPicker');app.fixture.dimensions=config;const shops=Array.from({length:config.count},(_,i)=>shop(i+1));let visible=true;const selected:number[]=[],positions:unknown[]=[],focused:number[]=[];
  const props=()=>({visible,shops,initialPage:99,initialAnchor:shops.at(-1)!.id,onPositionChange:(position:unknown)=>positions.push(position),onSelect:(s:MapShop)=>{selected.push(s.id);visible=false;},onClose(){visible=false;}});
  let tree=app.render(props());tree=app.render(props());const cards=tree.filter(n=>n.type==='Pressable'&&/^map-group-business-\d+$/.test(String(n.props.testID)));assert.equal(cards.length,config.count);assert.equal(app.fixture.overlays,1);assert.ok(!tree.some(n=>n.props.accessibilityLabel==='Next'||n.props.accessibilityLabel==='Previous'||n.type==='ScrollView'||n.type==='FlatList'));assert.ok(!tree.some(n=>String(n.props.accessibilityLabel).includes('results')));assert.deepEqual(JSON.parse(JSON.stringify(positions[0])),{page:0,anchor:config.count});if(config.count===1)assert.ok(tree.some(n=>n.type==='Text'&&n.props.children==='1 business'));
  const card=cards.at(-1)!;(card.props.ref as(value:FocusTarget)=>void)({focus:()=>focused.push(config.count)});press(card);app.render(props());assert.deepEqual(selected,[config.count]);assert.equal(app.fixture.overlays,0);
  visible=true;tree=app.render(props());assert.deepEqual(focused,[config.count]);assert.equal(tree.filter(n=>n.type==='Photo').length,config.count);const close=tree.find(n=>n.props.accessibilityLabel==='Close business list')!;assert.ok(Number(style(close).width)>=48&&Number(style(close).height)>=48);press(close);tree=app.render(props());assert.equal(tree.length,0);assert.equal(app.fixture.overlays,0);app.unmount();
 }
});

test('FE-053 adaptive picker shares safe-area/font capacity and rejects oversized groups without truncating',async()=>{
 for(const dimensions of [{width:320,height:480,fontScale:1},{width:390,height:844,fontScale:1},{width:844,height:390,fontScale:1},{width:1440,height:1000,fontScale:1},{width:320,height:480,fontScale:2}]){
  const app=await component('MapGroupPicker');app.fixture.dimensions=dimensions;app.fixture.insets={top:24,bottom:20,left:0,right:0};const w=Math.min(700,dimensions.width-24),h=dimensions.height-24-20-24,count=mapGroupCapacity(w,h,dimensions.fontScale),shops=Array.from({length:count},(_,i)=>shop(i+1)),props={visible:true,shops,onSelect(){},onClose(){}};
  let tree=app.render(props);tree=app.render(props);const layout=mapGroupPickerLayout(w,h,dimensions.fontScale,count),cards=tree.filter(n=>n.type==='Pressable'&&/^map-group-business-\d+$/.test(String(n.props.testID)));assert.equal(layout.admitted,true);assert.equal(layout.paged,false);assert.equal(cards.length,count);assert.ok(count<=(w>=600?6:3));for(const card of cards)assert.equal(style(card).height,layout.rowHeight);assert.ok(!tree.some(n=>n.props.accessibilityLabel==='Next'||n.props.accessibilityLabel==='Previous'));const picker=tree.find(n=>n.props.testID==='map-group-picker')!;assert.equal(style(picker).width,w);assert.equal(style(picker).maxHeight,h);
  tree=app.render({...props,shops:[...shops,shop(count+1)]});assert.equal(tree.length,0,'Do not render a partial oversized selection');assert.equal(app.fixture.overlays,0,'Rejected selection cannot retain an invisible modal lock');
  tree=app.render({...props,shops:shops.map((s,i)=>i===0?{...s,name:'Fresh current name'}:s)});tree=app.render({...props,shops:shops.map((s,i)=>i===0?{...s,name:'Fresh current name'}:s)});assert.ok(tree.some(n=>String(n.props.accessibilityLabel).startsWith('Fresh current name.')));app.unmount();
 }
});

test('FE-053 map return cache binds public references to API/scope/expiry and tolerates denied storage without snapshots',async()=>{
 type Port={readMapReturnSession:(origin:string,scope:string)=>MapReturnContext|null;rememberMapReturnSession:(origin:string,scope:string,value:MapReturnContext)=>void;parseMapReturnSession:(raw:string|null,origin:string,scope:string,now?:number)=>MapReturnContext|null};
 const output=(await bundled).outputFiles.find(file=>file.path.endsWith('/map-return-session.js'))!,module={exports:{}as Port},storage=new Map<string,string>();let denied=false;
 vm.runInNewContext(output.text,{module,exports:module.exports,fixture:{platform:'web'},window:{sessionStorage:{getItem:(key:string)=>{if(denied)throw Error('Denied');return storage.get(key)||null;},setItem:(key:string,value:string)=>{if(denied)throw Error('Denied');storage.set(key,value);}}}});
 const origin='https://suqpage.example',scope='scope=businesses&b.q=table',value:MapReturnContext={ids:[1,2,2,5],page:1,anchor:5,camera:{center:[38.75,9.03],zoom:13}};
 module.exports.rememberMapReturnSession(origin,scope,Object.assign({},value,{privatePhone:'DO_NOT_PERSIST',name:'DO_NOT_PERSIST',token:'DO_NOT_PERSIST',shops:[{private:'DO_NOT_PERSIST'}]}));const raw=[...storage.values()][0];assert.ok(raw);assert.doesNotMatch(raw,/DO_NOT_PERSIST|privatePhone|token|shops/);assert.deepEqual(JSON.parse(JSON.stringify(module.exports.readMapReturnSession(origin,scope)?.ids)),[1,2,5]);
 assert.equal(module.exports.readMapReturnSession('https://foreign.example',scope),null);assert.equal(module.exports.readMapReturnSession(origin,scope+'&country=KE'),null);const stored=JSON.parse(raw)as{savedAt:number};assert.equal(module.exports.parseMapReturnSession(raw,origin,scope,stored.savedAt+2*60*60_000+1),null);assert.equal(module.exports.parseMapReturnSession(raw,origin,scope,stored.savedAt-1001),null);
 const legacy=module.exports.parseMapReturnSession(JSON.stringify({...JSON.parse(raw),ids:[1,2,3,4,5,6,7]}),origin,scope);assert.deepEqual(JSON.parse(JSON.stringify(legacy)),{...value,ids:[],page:0,anchor:null},'An oversized former group becomes camera-only return context');
 for(const patch of [{ids:[0]},{ids:Array.from({length:201},(_,i)=>i+1)},{page:-1},{camera:{center:[38.75,95],zoom:13}},{camera:{center:[38.75,9.03],zoom:19}}])assert.equal(module.exports.parseMapReturnSession(JSON.stringify({...JSON.parse(raw),...patch}),origin,scope),null);
 denied=true;module.exports.rememberMapReturnSession(origin,scope,{...value,page:2,anchor:2});assert.equal(module.exports.readMapReturnSession(origin,scope)?.page,0,'Legacy page metadata normalizes to0 with no paging; denied storage keeps the session');
});


test('FE-065 S130 map group rows keep location and full accessible merchant details within their unchanged text budget',async()=>{
 for(const dimensions of [{width:390,height:844,fontScale:1},{width:320,height:480,fontScale:1},{width:844,height:390,fontScale:1},{width:320,height:480,fontScale:2}]){
  const app=await component('MapGroupPicker');app.fixture.dimensions=dimensions;const w=Math.min(700,dimensions.width-24),h=dimensions.height-24,count=mapGroupCapacity(w,h,dimensions.fontScale),shops=Array.from({length:count},(_,i)=>shop(i+1,{name:'A long merchant business name '+i,description:'Full literal merchant description, with products and styles.',city:i?'':'',region:'Legacy city'}));let tree=app.render({visible:true,shops,onSelect(){},onClose(){}});tree=app.render({visible:true,shops,onSelect(){},onClose(){}});
  for(const value of shops){const card=tree.find(n=>n.props.testID==='map-group-business-'+value.id)!;assert.ok(card);assert.equal(card.props.accessibilityLabel,[value.name,value.description,'Legacy city'].join('. '));const texts=nodes(card).filter(n=>n.type==='Text'),location=texts.find(n=>n.props.testID==='map-group-location-'+value.id);assert.equal(location?.props.children,'Legacy city');assert.equal(location?.props.numberOfLines,1);const layout=mapGroupPickerLayout(w,h,dimensions.fontScale,count);assert.equal(style(card).height,layout.rowHeight);const name=texts.find(n=>n.props.children===value.name)!;assert.equal(name.props.numberOfLines,layout.compact?1:2);const contentBudget=layout.rowHeight-2*(layout.rowHeight<108?8:10)-2;const used=texts.reduce((height,node)=>height+Number(style(node).lineHeight)*dimensions.fontScale*Number(node.props.numberOfLines),0)+(texts.length-1)*4;assert.ok(used<=contentBudget,'No typography shrink or hidden row overflow: '+JSON.stringify({dimensions,used,contentBudget}));if(dimensions.fontScale===1)assert.ok(texts.some(n=>n.props.testID==='map-group-description-'+value.id));}
  assert.ok(!tree.some(n=>n.type==='ScrollView'||n.type==='FlatList'||n.props.accessibilityLabel==='Next'));app.unmount();
 }
});

test('FE-021 S164 city-area businesses show names and cities without internal mode text in the Expo group picker',async()=>{
 const app=await component('MapGroupPicker');app.fixture.dimensions={width:390,height:844,fontScale:1};
 const value=shop(77,{name:'Addis Workshop',description:'Made-to-order metal shelves and fixtures',city:'Addis Ababa',locationMode:'area'});
 let tree=app.render({visible:true,shops:[value],onSelect(){},onClose(){}});tree=app.render({visible:true,shops:[value],onSelect(){},onClose(){}});
 const card=tree.find(node=>node.props.testID==='map-group-business-77')!;
 assert.equal(card.props.accessibilityLabel,'Addis Workshop. Made-to-order metal shelves and fixtures. Addis Ababa');
 const location=nodes(card).find(node=>node.props.testID==='map-group-location-77');
 assert.equal(location?.props.children,'Addis Ababa');
 assert.equal(location?.props.numberOfLines,1,'The location stays in the existing one-line row.');
 app.unmount();
});
