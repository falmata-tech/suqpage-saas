import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {expect} from '@playwright/test';
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
 for(const requested of[1,2,3,6]){const index=mapClusterIndex(shops,requested),capacity=index.capacity,terminal=mapClusterMarkers(index,[-180,-85,180,85],MAP_MAX_ZOOM);
  assert.equal(capacity,Math.max(2,requested),'Dense groups retain the bounded two-card floor rather than overlapping named singles');
  const fixed=terminal.find(item=>item.kind==='cluster')!;assert.ok(fixed);assert.ok(fixed.count>=2&&fixed.count<=capacity);
  for(const zoom of[1,5,9]){assert.ok(mapClusterMarkers(index,[-180,-85,180,85],zoom).some(item=>item.kind==='aggregate'&&fixed.ids.every(id=>item.ids.includes(id))));assert.equal(currentMapGroup(index,shops,fixed.key,zoom),null,'A known terminal key enclosed in the current outer aggregate cannot open a picker');}
  for(const zoom of[10,11,13,18,99]){const exposed=mapClusterMarkers(index,[-180,-85,180,85],zoom).some(item=>item.kind==='cluster'&&item.key===fixed.key),group=currentMapGroup(index,shops,fixed.key,zoom);assert.equal(Boolean(group),exposed,'Only a currently represented terminal is modal authority');if(group){assert.equal(group.count,fixed.count);assert.deepEqual(group.showroomIds,fixed.ids);assert.equal(group.longitude,fixed.anchor[0]);}}
  assert.ok([10,11,12,13].some(zoom=>currentMapGroup(index,shops,fixed.key,zoom)),'The bounded current group becomes available within city-region zoom');
  const aggregate=mapClusterMarkers(index,[-180,-85,180,85],1).find(item=>item.kind==='aggregate');if(aggregate)assert.equal(currentMapGroup(index,shops,aggregate.key,18),null,'An aggregate is never modal membership authority');
  assert.equal(currentMapGroup(index,shops.filter(shop=>shop.id!==fixed.ids[0]),fixed.key,18),null);
 }
 const desktop=mapClusterIndex(shops,6),large=mapClusterMarkers(desktop,[-180,-85,180,85],18).find(group=>group.count>3)!;assert.ok(large);assert.equal(currentMapGroup(mapClusterIndex(shops,3),shops,large.key,18),null,'Resize cannot reinterpret an old key as a different group');
 assert.equal(mapGroupMembers({key:'old-large',count:11,showroomIds:shops.map(shop=>shop.id),city:'',region:'',latitude:9.03,longitude:38.75},shops),null);
 const singleton=mapClusterMarkers(mapClusterIndex(shops.slice(0,1),1),[-180,-85,180,85],MAP_MAX_ZOOM);assert.equal(singleton.length,1);assert.equal(singleton[0].kind,'shop');assert.equal(singleton[0].count,1);
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
test('FE-021 S181 admitted groups retain every card; only a bounded extreme two-card fallback scrolls',()=>{
 for(const[width,height,scale]of[[366,812,1],[760,868,1],[296,448,1],[820,358,1],[296,412,2]]){
  const viewport=mapGroupViewport(width,height,scale);assert.ok(viewport.capacity>=1&&viewport.capacity<=(width>=600?6:3));
  if(width===760)assert.equal(viewport.capacity,6);if(width===366)assert.equal(viewport.capacity,3);
  for(let count=1;count<=viewport.capacity;count++){const layout=mapGroupLayout(width,height,scale,count);assert.equal(layout.admitted,true);assert.equal(layout.pageSize,count);assert.equal(layout.paged,false);assert.ok(layout.rowHeight>=84);if(layout.needsScroll){assert.equal(viewport.capacity,2);assert.ok(count<=2);assert.ok(height-layout.chromeHeight>=48);}else if(scale===1)assert.equal(layout.needsScroll,false);}
  const rejected=mapGroupLayout(width,height,scale,viewport.capacity+1);assert.equal(rejected.admitted,false);assert.equal(rejected.pageSize,0);assert.equal(rejected.paged,false);
 }
 for(const[width,height,scale]of[[296,0,1],[0,296,1],[296,260,2]]){const viewport=mapGroupViewport(width,height,scale),layout=mapGroupLayout(width,height,scale,2);assert.equal(viewport.capacity,0);assert.equal(layout.admitted,false);assert.equal(layout.needsScroll,false);}
});

test('FE-021 S181 Back scrolls the selected card before restoring focus only in the bounded fallback',async()=>{
 for(const viewport of[mapGroupViewport(296,296,2),mapGroupViewport(366,812)]){
  const c=await component(),members=shops.slice(0,2),group={key:'cluster:1-2',count:2,showroomIds:[1,2],city:'Fixture city',region:'',latitude:9.03,longitude:38.75};let selected:number|null=null;
  const props=()=>({group,showrooms:members,viewport,featuredNowBusinessId:null,selectedShowroomId:selected,onSelect:(id:number)=>{selected=id;},onBack:()=>{selected=null;},onClose(){},onOpen(){}});
  let nodes=c.render('NearbyShowroomsViewer',props());c.effects();
  const needsScroll=mapGroupLayout(viewport.width,viewport.height,viewport.fontScale,2).needsScroll;
  assert.equal(nodes.find(node=>String(node.props.className).startsWith('nearby-showroom-viewer'))?.props['data-scrollable'],needsScroll);
  click(nodes.find(node=>node.props['data-showroom-id']===2));nodes=c.render('NearbyShowroomsViewer',props());c.effects();
  click(nodes.find(node=>node.props.className==='nearby-showroom-back'));nodes=c.render('NearbyShowroomsViewer',props());
  const events:string[]=[],list=nodes.find(node=>node.props.className==='nearby-showroom-grid')!;
  (list.props.ref as {current:unknown}).current={querySelector:(selector:string)=>{assert.match(selector,/2/);return{scrollIntoView:(options:unknown)=>{assert.equal((options as {block:string}).block,'nearest');assert.equal((options as {inline:string}).inline,'nearest');events.push('scroll');},focus:(options:unknown)=>{assert.equal((options as {preventScroll:boolean}).preventScroll,true);events.push('focus');}};}};
  c.effects();assert.deepEqual(events,needsScroll?['scroll','focus']:['focus']);assert.equal(list.props.tabIndex,needsScroll?0:undefined);
 }
});

test('FE-021 S181 real dialog keeps both fallback businesses reachable and restores the second card after Back',{timeout:30000},async()=>{
 const compiled=await build({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
  import React,{useState}from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';
  import{NearbyShowroomsViewer}from'./components/DiscoveryWorkspace';
  const root=createRoot(document.getElementById('root'));
  window.fixtureT=(text,values={})=>text.replace(/\\{([^}]+)\\}/g,(_,key)=>String(values[key]??key));
  function App({data}){const[selected,setSelected]=useState(null),[open,setOpen]=useState(true);return open?<NearbyShowroomsViewer group={{key:'cluster:'+data.members.map(s=>s.id).join('-'),count:data.members.length,showroomIds:data.members.map(s=>s.id),city:'Fixture city',region:'',latitude:9.03,longitude:38.75}} showrooms={data.members} viewport={data.viewport} featuredNowBusinessId={null} selectedShowroomId={selected} onSelect={setSelected} onBack={()=>setSelected(null)} onClose={()=>setOpen(false)} onOpen={()=>{}}/>:null;}
  window.mountPicker=data=>flushSync(()=>root.render(<App key={data.key} data={data}/>));
 `},bundle:true,write:false,outfile:'picker.js',platform:'browser',jsx:'automatic',loader:{'.module.css':'local-css'},plugins:[{name:'browser-framework-ports',setup(b){
  b.onResolve({filter:/^(?:next\/(?:image|link|navigation)|next-intl|@\/lib\/i18n\/ui|@\/components\/MarketplaceMap)$/},args=>({path:args.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',resolveDir:process.cwd(),contents:args.path==='@/lib/i18n/ui'?'export const useUiText=()=>window.fixtureT;':args.path==='next-intl'?"export const useLocale=()=> 'en';":args.path==='next/navigation'?'export const useRouter=()=>({}),useSearchParams=()=>new URLSearchParams();':args.path==='next/link'?"import React from'react';export default function Link({children,...props}){return <a {...props}>{children}</a>;}":args.path==='next/image'?"import React from'react';export default function Image(props){return <img {...props}/>;}":'export default ()=>null;'}));
 }}]});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:320,height:328}}),errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setContent('<div class="discovery-map-stage"><div class="discovery-floating-buttons"><button>Reset map</button></div></div><div id="root"></div>');
  await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+fs.readFileSync('app/discovery.css','utf8')+'\n'+compiled.outputFiles.find(file=>file.path.endsWith('.css'))!.text});
  await page.addScriptTag({content:compiled.outputFiles.find(file=>file.path.endsWith('.js'))!.text});
  await page.evaluate(()=>document.documentElement.style.fontSize='32px');
  await page.evaluate(data=>(window as unknown as{mountPicker:(data:unknown)=>void}).mountPicker(data),{key:'short',members:shops.slice(0,2),viewport:mapGroupViewport(296,296,2)});
  const dialog=page.getByRole('dialog'),list=page.getByRole('region',{name:'Choose a business',exact:true});
  await expect(dialog).toBeVisible();await expect(list).toBeVisible();
  const geometry=await list.evaluate(element=>({height:element.clientHeight,scroll:element.scrollHeight,overflow:getComputedStyle(element).overflowY}));
  assert.ok(geometry.height>=48&&geometry.scroll>geometry.height,JSON.stringify(geometry));assert.equal(geometry.overflow,'auto');
  await expect(list.getByRole('button')).toHaveCount(2);await list.focus();await page.keyboard.press('End');
  await expect.poll(()=>list.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
  await list.getByRole('button',{name:/^Business 2,/}).click();await expect(dialog.getByRole('heading',{name:'Business 2',exact:true})).toBeVisible();await expect(dialog).toHaveAccessibleName('Business 2');
  await dialog.getByRole('button',{name:'Back to businesses',exact:true}).click();
  const second=list.getByRole('button',{name:/^Business 2,/});await expect(second).toBeFocused();
  const intersection=await second.evaluate(element=>{const row=element.getBoundingClientRect(),body=element.parentElement!.getBoundingClientRect();return Math.min(row.bottom,body.bottom)-Math.max(row.top,body.top);});assert.ok(intersection>=44,String(intersection));
  const close=dialog.getByRole('button',{name:'Close business list',exact:true}),bounds=await close.boundingBox();assert.ok(bounds&&bounds.y>=0&&bounds.y+bounds.height<=328);await close.click();await expect(dialog).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.style.fontSize='16px');
  await page.evaluate(data=>(window as unknown as{mountPicker:(data:unknown)=>void}).mountPicker(data),{key:'normal',members:shops.slice(0,3),viewport:mapGroupViewport(366,812)});
  await expect(dialog).toBeVisible();const normal=page.locator('.nearby-showroom-grid');await expect(normal.getByRole('button')).toHaveCount(3);
  const ordinary=await normal.evaluate(element=>({height:element.clientHeight,scroll:element.scrollHeight,overflow:getComputedStyle(element).overflowY}));assert.ok(ordinary.scroll<=ordinary.height+1,JSON.stringify(ordinary));assert.equal(ordinary.overflow,'hidden');
  await dialog.getByRole('button',{name:'Close business list',exact:true}).click();assert.deepEqual(errors,[]);await page.close();
 }finally{await browser.close();}
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
