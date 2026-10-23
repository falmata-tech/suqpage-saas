import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {build} from 'esbuild';
import {mapClusterIndex,MAP_CITY_ZOOM,MAP_MAX_ZOOM,mapClusterMarkers} from '../lib/map/map-clustering';
import {currentMapGroup,mapGroupMembers,mapGroupLayout,mapGroupViewport} from '../components/map-group-view';
import type {DiscoveryShowroom} from '../lib/discovery';

type Node={type:string|((props:Record<string,unknown>)=>unknown);props:Record<string,unknown>&{children?:unknown}};
const shops:DiscoveryShowroom[]=Array.from({length:11},(_,index)=>({id:index+1,handle:'fixture-'+(index+1),name:'Business '+(index+1),tagline:'Physical products',description:'',logoPath:'',heroImagePath:'',city:'Fixture city',zone:'',region:'',latitude:9.03,longitude:38.75,fallbackStyle:'workshop',sponsored:false,productionScale:'workshop',isLive:false,livePlatform:'',liveUrl:'',primaryIndustryKey:'textiles',primaryIndustryLabel:'Textiles',primaryIndustryShortLabel:'Textiles',locationMode:'storefront'}));
const tree=(value:unknown):Node[]=>{if(Array.isArray(value))return value.flatMap(tree);if(!value||typeof value!=='object')return[];const node=value as Node;return[node,...tree(node.props?.children)];};
const click=(node:Node|undefined)=>{assert.ok(node);(node.props.onClick as()=>void)();};
const bundled=build({entryPoints:['components/DiscoveryWorkspace.tsx'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'controlled-renderer-ports',setup(b){
 b.onLoad({filter:/components\/DiscoveryWorkspace\.tsx$/},async a=>({loader:'tsx',contents:fs.readFileSync(a.path,'utf8')+'\nexport {MapPreviewDialog};'}));
 b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|next\/(?:image|link|navigation)|lucide-react|@\/lib\/(?:i18n\/ui|use-market-feed|market-search|market-workspace|platform-state|product-inquiry|live-showroom|offerings)|\.\/(?:MarketSearchControls|LoadingBar|CategoryChooser|useBlockedBusinesses)|@\/components\/MarketplaceMap)$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
 a.path==='react'?`const slot=initial=>{const index=fixture.cursor++;if(!(index in fixture.slots))fixture.slots[index]=typeof initial==='function'?initial():initial;return index;};export const useState=initial=>{const index=slot(initial);return[fixture.slots[index],value=>{fixture.slots[index]=typeof value==='function'?value(fixture.slots[index]):value;}];};export const useRef=initial=>fixture.slots[slot(()=>({current:initial}))];export const useEffect=(fn,deps)=>{const index=fixture.cursor++,prior=fixture.dependencies[index];if(!prior||!deps||deps.some((value,i)=>!Object.is(value,prior[i]))){fixture.dependencies[index]=deps;fixture.effects.push(fn);}};export const useLayoutEffect=()=>{},useMemo=fn=>fn(),useTransition=()=>[false,fn=>fn()];`
 :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
 :a.path==='next/navigation'?`export const useRouter=()=>({}),useSearchParams=()=>new URLSearchParams();`
 :a.path==='@/lib/i18n/ui'?`export const useUiText=()=>((key,values={})=>key.replace(/\\{([^}]+)\\}/g,(_,name)=>String(values[name]??name)));`
 :a.path==='lucide-react'?`export const Info='Info',ArrowLeft='ArrowLeft',ArrowRight='ArrowRight',ChevronLeft='ChevronLeft',ChevronRight='ChevronRight',Crosshair='Crosshair',LocateFixed='LocateFixed',Map='Map',Minus='Minus',Package='Package',Plus='Plus',Search='Search',X='X',MapPin='MapPin',PanelLeftOpen='PanelLeftOpen',PanelLeftClose='PanelLeftClose';`
 :a.path==='@/lib/live-showroom'?`export const LIVE_PLATFORM_LABELS={};`
 :a.path==='@/lib/market-search'?`export const emptyMarketSearch=()=>({}),marketSearchParams=()=>new URLSearchParams(),marketWorkspaceParams=()=>new URLSearchParams(),MarketSearchError=Error;`
 :a.path==='@/lib/market-workspace'?`export const hasExplicitMarketIntent=()=>false,marketWorkspaceFromParams=()=>({}),parseMarketWorkspaceSnapshot=()=>null,serializeMarketWorkspaceSnapshot=()=>'';`
 :a.path==='@/lib/platform-state'?`export const readPlatformState=()=>null;`
 :a.path==='./useBlockedBusinesses'?`export const useBlockedBusinesses=()=>({list:[],save:async()=>{throw new Error('Preference writes are outside the helper renderer scope');}});`
 :a.path==='@/lib/use-market-feed'?`export const useMarketFeed=()=>({});`
 :a.path==='@/lib/product-inquiry'?`export const productHref=()=>'';`
 :a.path==='@/lib/offerings'?`export const productSupplyLabel=()=>'';`
 :`export default '${a.path}';`
 }));
 }}]});
async function component(){const fixture={slots:[] as unknown[],cursor:0,dependencies:[] as unknown[][],effects:[] as Array<()=>void|(()=>void)>};const module={exports:{} as {default:(props:Record<string,unknown>)=>Node;NearbyShowroomsViewer:(props:Record<string,unknown>)=>Node;MapPreviewDialog:(props:Record<string,unknown>)=>Node}};const globals:Record<string,unknown>={module,exports:module.exports,fixture,URLSearchParams};vm.runInNewContext((await bundled).outputFiles[0].text,globals);return{fixture,module,globals,render:(name:keyof typeof module.exports,props:Record<string,unknown>)=>{fixture.cursor=0;return tree(module.exports[name](props));},effects:()=>{const effects=fixture.effects.splice(0);return effects.map(effect=>effect());}};}

test('FE-021 current terminal authority rejects enclosed aggregate, foreign member and stale resize keys',()=>{
 for(const capacity of[1,3,6]){const index=mapClusterIndex(shops,capacity),terminal=mapClusterMarkers(index,[-180,-85,180,85],MAP_MAX_ZOOM);
  if(capacity===1){assert.ok(terminal.every(item=>item.kind==='shop'&&item.count===1),'A one-business final marker is a shop icon, not a numbered one-circle');continue;}
  const fixed=terminal.find(item=>item.kind==='cluster')!;assert.ok(fixed);assert.ok(fixed.count>=2&&fixed.count<=capacity);
  for(const zoom of[1,5,11]){assert.ok(mapClusterMarkers(index,[-180,-85,180,85],zoom).some(item=>item.kind==='aggregate'&&fixed.ids.every(id=>item.ids.includes(id))));assert.equal(currentMapGroup(index,shops,fixed.key,zoom),null,'A known terminal key enclosed in the current outer aggregate cannot open a picker');}
  for(const zoom of[18,99]){const group=currentMapGroup(index,shops,fixed.key,zoom)!;assert.ok(group);assert.equal(group.count,fixed.count);assert.deepEqual(group.showroomIds,fixed.ids);assert.equal(group.longitude,fixed.anchor[0]);}
  const aggregate=mapClusterMarkers(index,[-180,-85,180,85],1).find(item=>item.kind==='aggregate');if(aggregate)assert.equal(currentMapGroup(index,shops,aggregate.key,18),null,'An aggregate is never modal membership authority');
  assert.equal(currentMapGroup(index,shops.filter(shop=>shop.id!==fixed.ids[0]),fixed.key,18),null);
 }
 const desktop=mapClusterIndex(shops,6),large=mapClusterMarkers(desktop,[-180,-85,180,85],18).find(group=>group.count>3)!;assert.ok(large);assert.equal(currentMapGroup(mapClusterIndex(shops,3),shops,large.key,18),null,'Resize cannot reinterpret an old key as a different group');
 assert.equal(mapGroupMembers({key:'old-large',count:11,showroomIds:shops.map(shop=>shop.id),city:'',region:'',latitude:9.03,longitude:38.75},shops),null);
});
test('FE-021 S140 separated current groups admit all cards below maximum without trusting hidden or changed keys',()=>{
 const source=shops.slice(0,6).map((shop,index)=>({...shop,longitude:index<3?38.75:38.77})),index=mapClusterIndex(source,3);
 const outer=mapClusterMarkers(index,[-180,-85,180,85],6)[0];assert.equal(outer.kind,'aggregate');assert.ok(outer.expansionZoom!==undefined&&outer.expansionZoom<MAP_CITY_ZOOM,'Regional aggregates separate before final city-scale groups open their previews');
 for(const fixed of index.groups)assert.equal(currentMapGroup(index,source,fixed.key,6),null);
 for(const item of mapClusterMarkers(index,[-180,-85,180,85],13)){
  const group=currentMapGroup(index,source,item.key,13);assert.ok(group);assert.deepEqual(group.showroomIds,item.ids);assert.equal(group.count,3);
  assert.equal(currentMapGroup(mapClusterIndex(source,6),source,item.key,13),null,'A viewport repartition cannot restore the old subset');
  assert.equal(currentMapGroup(index,source.filter(shop=>shop.id!==item.ids[0]),item.key,13),null,'Every current product-facing business row must still exist');
 }
 assert.equal(currentMapGroup(index,source,outer.key,13),null,'An old aggregate key is never interpreted as a final group');
 const only=source.slice(0,3),single=mapClusterIndex(only);assert.deepEqual(currentMapGroup(single,only,'cluster:1-2-3',6)?.showroomIds,[1,2,3]);
});
test('FE-021 adaptive S127 admitted viewport capacity always renders every card with no paging or truncation',()=>{
 for(const[width,height,scale]of[[366,812,1],[760,868,1],[296,448,1],[820,358,1],[296,412,2]]){
  const viewport=mapGroupViewport(width,height,scale);assert.ok(viewport.capacity>=1&&viewport.capacity<=(width>=600?6:3));
  if(width===760)assert.equal(viewport.capacity,6);if(width===366)assert.equal(viewport.capacity,3);
  for(let count=1;count<=viewport.capacity;count++){const layout=mapGroupLayout(width,height,scale,count);assert.equal(layout.admitted,true);assert.equal(layout.pageSize,count);assert.equal(layout.paged,false);assert.ok(layout.rowHeight>=84);}
  const rejected=mapGroupLayout(width,height,scale,viewport.capacity+1);assert.equal(rejected.admitted,false);assert.equal(rejected.pageSize,0);assert.equal(rejected.paged,false);
 }
});
test('FE-021 adaptive S127 actual modal shows desktop6 together, detail Back and phone-resize dismissal without Next',async()=>{
 const c=await component();let selected:number|null=null,closed=0;const members=shops.slice(0,6),group={key:'cluster:1-2-3-4-5-6',count:6,showroomIds:members.map(shop=>shop.id),city:'Fixture city',region:'',latitude:9.03,longitude:38.75};let viewport=mapGroupViewport(760,868);
 const props=()=>({group,showrooms:members,viewport,featuredNowBusinessId:2,selectedShowroomId:selected,onSelect:(id:number)=>{selected=id;},onBack:()=>{selected=null;},onClose:()=>{closed++;},onOpen:()=>{}});
 const render=()=>{let value=c.render('NearbyShowroomsViewer',props());c.effects();return c.render('NearbyShowroomsViewer',props());};let nodes=render();const cards=()=>nodes.filter(node=>node.type==='button'&&node.props['data-showroom-id']);assert.deepEqual(cards().map(node=>node.props['data-showroom-id']),[1,2,3,4,5,6]);assert.equal(nodes.some(node=>['Next','Previous'].includes(String(node.props['aria-label']))),false);
 click(cards()[4]);nodes=render();assert.equal(selected,5);assert.ok(nodes.some(node=>node.props.className==='nearby-showroom-back'));click(nodes.find(node=>node.props.className==='nearby-showroom-back'));nodes=render();assert.deepEqual(cards().map(node=>node.props['data-showroom-id']),[1,2,3,4,5,6]);
 viewport=mapGroupViewport(296,448);nodes=render();assert.deepEqual(nodes,[]);assert.equal(closed,1,'An old desktop group closes instead of losing phone cards');
});
test('FE-021 S164 city-area map preview names each business and city without internal mode text',async()=>{
 const c=await component(),members=shops.slice(0,2).map(shop=>({...shop,locationMode:'area' as const})),group={key:'city:fixture',count:2,showroomIds:members.map(shop=>shop.id),city:'Fixture city',region:'',latitude:9.03,longitude:38.75};
 const nodes=c.render('NearbyShowroomsViewer',{group,showrooms:members,viewport:mapGroupViewport(390,844),featuredNowBusinessId:null,selectedShowroomId:null,onSelect(){},onBack(){},onClose(){},onOpen(){}});
 for(const member of members){
  const card=nodes.find(node=>node.type==='button'&&node.props['data-showroom-id']===member.id)!;assert.ok(card);
  assert.match(String(card.props['aria-label']),new RegExp(`${member.name}.*Fixture city`));
  assert.doesNotMatch(String(card.props['aria-label']),/City only/,'Accessible names must not expose internal mode text');
  const location=tree(card).find(node=>node.props.className==='nearby-showroom-location');assert.equal(location?.props.children,'Fixture city');
 }
});
test('FE-021 adaptive S127 actual modal rejects oversized or stale group content rather than showing extra cards',async()=>{
 for(const group of[{key:'old-large',count:11,showroomIds:shops.map(shop=>shop.id)},{key:'missing-current',count:2,showroomIds:[1,999]},{key:'duplicate',count:2,showroomIds:[1,1]}]){
  const c=await component();let dismissed=0,selected=0;
  const nodes=c.render('NearbyShowroomsViewer',{group:{...group,city:'',region:'',latitude:9.03,longitude:38.75},showrooms:shops,featuredNowBusinessId:null,selectedShowroomId:null,onSelect:()=>{selected++;},onBack:()=>{},onClose:()=>{dismissed++;},onOpen:()=>{}});c.effects();
  assert.deepEqual(nodes,[],'Invalid current membership must never render a modal or silently trim to3');assert.equal(dismissed,1);assert.equal(selected,0);
 }
});
test('FE-021 S127 actual modal restores a recreated current group trigger, falling back to a visible map control',async()=>{
 for(const markerPresent of [true,false]){
  const c=await component();let focused='',shown=0,closed=0;
  class Element{isConnected=false;getClientRects(){return[{}];}focus(){focused='old';}}
  const current={getClientRects:()=>[{}],focus:()=>{focused='group';}},fallback={getClientRects:()=>[{}],closest:()=>null,focus:()=>{focused='map-control';}};
  const body={style:{overflow:'auto'}},document={activeElement:new Element(),body,querySelectorAll:(selector:string)=>selector.includes('[data-map-group-key]')?(markerPresent?[{dataset:{mapGroupKey:'cluster:1-2'},closest:()=>current}]:[]):[fallback]};
  // The production effect reads global document at invocation time; these narrow
  // ports model replaced nodes, not browser focus or dialog geometry.
  const context={module:{exports:{} as Record<string,(props:Record<string,unknown>)=>Node>},exports:{},fixture:c.fixture,URLSearchParams,document,HTMLElement:Element};context.exports=context.module.exports;
  vm.runInNewContext((await bundled).outputFiles[0].text,context);
  c.fixture.cursor=0;c.fixture.slots=[];c.fixture.dependencies=[];c.fixture.effects=[];context.module.exports.MapPreviewDialog({labelledBy:'title',onClose:()=>{},children:null,restoreGroupKey:'cluster:1-2'});
  (c.fixture.slots[0] as {current:unknown}).current={showModal:()=>{shown++;},close:()=>{closed++;}};
  const cleanup=c.effects()[0];assert.equal(shown,1);assert.equal(body.style.overflow,'hidden');assert.equal(typeof cleanup,'function');(cleanup as()=>void)();assert.equal(closed,1);assert.equal(body.style.overflow,'auto');assert.equal(focused,markerPresent?'group':'map-control');
 }
});

test('FE-058 S127 actual outer map controls visibly disable futile zoom at each supported bound',async()=>{
 const c=await component(),discovery={showrooms:[],searchProducts:[],searchOrder:[],searchBusinesses:[],nearbyGroups:[],featuredNowBusinessId:null,resultCounts:{businesses:0,products:0},resultPage:{page:1,totalPages:1,totalItems:0}},search={countries:[],cities:[],query:''};
 const render=()=>c.render('default',{discovery,initialBusiness:search,initialProduct:search});
 let nodes=render();assert.equal(nodes.find(node=>node.props['aria-label']==='Zoom in')?.props.disabled,false);assert.equal(nodes.find(node=>node.props['aria-label']==='Zoom out')?.props.disabled,false);
 const zoomSlot=c.fixture.slots.findIndex(value=>value===5);assert.ok(zoomSlot>=0);c.fixture.slots[zoomSlot]=18;nodes=render();assert.equal(nodes.find(node=>node.props['aria-label']==='Zoom in')?.props.disabled,true);assert.equal(nodes.find(node=>node.props['aria-label']==='Zoom out')?.props.disabled,false);
 c.fixture.slots[zoomSlot]=1;nodes=render();assert.equal(nodes.find(node=>node.props['aria-label']==='Zoom out')?.props.disabled,true);assert.equal(nodes.find(node=>node.props['aria-label']==='Zoom in')?.props.disabled,false);
});
