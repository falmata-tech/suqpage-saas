import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium} from 'playwright';

// React and ReactDOM must come from the matching installed native pair. The
// application adapter and installed Leaflet/marker indexing are real; only
// localization and marker glyph rendering are ports. No API/database/device or
// tile-provider rendering coverage is claimed by this isolated lifecycle check.
const nativeRequire=createRequire(process.cwd()+'/apps/mobile/package.json');
const bundled=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import * as L from 'leaflet';import MarketMap from './apps/mobile/src/MarketMap.web';
 import {markerIndex,currentGroupMembers} from './apps/mobile/src/map-markers';
 L.Map.addInitHook(function(){window.fixture.maps.push(this);});
 const root=createRoot(document.getElementById('root')),controls=React.createRef();
 window.fixture.mount=shop=>flushSync(()=>root.render(<MarketMap ref={controls} shops={[shop]} height={500} onSelect={value=>window.fixture.selected.push(value.id)}/>));
 function CallbackFreshness({shops,capacity=3}){
  const [zoom,setZoom]=React.useState(6),[generation,setGeneration]=React.useState(0);
  const index=React.useMemo(()=>markerIndex(shops,capacity),[shops,capacity]);
  window.fixture.replaceHandlers=()=>flushSync(()=>setGeneration(value=>value+1));
  return <><output id="parent-zoom">{zoom}</output><MarketMap shops={shops} groupCapacity={capacity} height={500} onZoomChange={setZoom}
    onGroup={members=>{window.fixture.groupAttempts.push({zoom,generation});if(currentGroupMembers(index,shops,members.map(value=>value.id),zoom).length)window.fixture.openedGroups.push({ids:members.map(value=>value.id),generation});}}
    onSelect={value=>window.fixture.selectedHandlers.push({id:value.id,zoom,generation})}/></>;
 }
 window.fixture.mountFreshness=(shops,capacity)=>flushSync(()=>root.render(<CallbackFreshness shops={shops} capacity={capacity}/>));
 window.fixture.mountFlex=shop=>flushSync(()=>root.render(<MarketMap shops={[shop]} height={100} onSelect={value=>window.fixture.selected.push(value.id)} onViewChange={value=>window.fixture.viewpoints.push(value)}/>));
 const fractional=L.CRS.EPSG3857.pointToLatLng(L.point(1292623.674519761,992355.5644955807),13);window.fixture.fractionalView={center:[fractional.lng,fractional.lat],zoom:13};
 window.fixture.mountCamera=view=>flushSync(()=>root.render(<MarketMap shops={[]} height={300} initialView={view} onSelect={()=>{}} onViewChange={value=>window.fixture.viewpoints.push(value)}/>));
 window.fixture.unmount=()=>flushSync(()=>root.render(null));window.fixture.controls=controls;
`},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NEXT_PUBLIC_SUQPAGE_MAP_PROVIDER':'"osm-standard"'},plugins:[{name:'map-lifecycle-ports',setup(builder){
 builder.onResolve({filter:/^(?:react(?:\/jsx(?:-dev)?-runtime)?|react-dom(?:\/client)?)$/},args=>({path:nativeRequire.resolve(args.path)}));
 builder.onResolve({filter:/\.\/(?:runtime|MapMarker)$/},args=>({path:args.path,namespace:'ports'}));
 builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',contents:args.path==='./runtime'?`const t=(key,values={})=>Object.entries(values).reduce((text,[name,value])=>text.replace('{'+name+'}',String(value)),key);export const useApp=()=>({t});`:`import React,{useEffect} from 'react';export function MapMarker({item,onPress,label}){useEffect(()=>()=>{window.fixture.markerUnmounts++;},[]);return <button aria-label={item.shop?undefined:label} style={{pointerEvents:'auto'}} onClick={onPress}>{item.shop?.name||item.kind}</button>;}`}));
}}]});

test('FE-053 actual native-web map detaches delayed resize listeners on unmount and preserves mounted markers/pan/resize',{timeout:60000},async()=>{
 const browser=await chromium.launch({headless:true,timeout:20000}),errors:string[]=[];
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**',route=>route.abort('blockedbyclient'));
  await page.setContent('<main id="root" style="width:390px;height:500px"></main>');
  await page.addStyleTag({path:nativeRequire.resolve('leaflet/dist/leaflet.css')});
  await page.addScriptTag({content:`window.fixture={maps:[],selected:[],markerUnmounts:0};`});
  await page.addScriptTag({content:(await bundled).outputFiles[0].text});
  const shop={id:21,handle:'fixture-shop',name:'Original shop',description:'',heroImagePath:'',city:'Fixture city',region:'',latitude:9.03,longitude:39.7,locationMode:'storefront'};
  // The installed SDK is intentionally exposed only to this isolated test page.
  type MapProbe={_loaded:boolean;getContainer:()=>HTMLElement;invalidateSize:(options:{debounceMoveend:boolean})=>void;panTo:(point:number[],options:{animate:boolean})=>void;getCenter:()=>{lat:number;lng:number};getZoom:()=>number;fire:(event:string)=>void;listens:(event:string)=>boolean};
  type Probe={maps:MapProbe[];selected:number[];markerUnmounts:number;mount:(value:typeof shop)=>void;unmount:()=>void;controls:{current:{zoom:(direction:number)=>void;reset:()=>void}}};
  await page.evaluate(shop=>(window as unknown as{fixture:Probe}).fixture.mount(shop),shop);
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps[0]?._loaded);
  await page.getByRole('button',{name:'Original shop',exact:true}).click();assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.selected),[21]);
  await page.evaluate(shop=>(window as unknown as{fixture:Probe}).fixture.mount({...shop,id:22,name:'Updated shop'}),shop);
  await page.getByRole('button',{name:'Updated shop',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Original shop',exact:true}).count(),0);
  await page.evaluate(()=>{const map=(window as unknown as{fixture:Probe}).fixture.maps[0];map.panTo([9.05,39.72],{animate:false});map.getContainer().style.height='350px';map.invalidateSize({debounceMoveend:true});});
  await page.waitForTimeout(260);
  await page.getByRole('button',{name:'Updated shop',exact:true}).click();assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.selected),[21,22]);
  assert.ok(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].getContainer().dataset.mapMarkerCount==='1'),'Mounted pan/resize still renders current markers');
  await page.evaluate(()=>{const fixture=(window as unknown as{fixture:Probe}).fixture,map=fixture.maps[0];map.getContainer().style.height='280px';map.invalidateSize({debounceMoveend:true});fixture.unmount();});
  await page.waitForTimeout(260);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].listens('moveend')),false,'Application render listener is removed before SDK destruction');
  assert.ok(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.markerUnmounts>0),'Owned marker React roots are cleaned');
  await page.evaluate(shop=>(window as unknown as{fixture:Probe}).fixture.mount({...shop,id:23,name:'Remounted shop'}),shop);
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps[1]?._loaded);
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].fire('moveend'));
  await page.getByRole('button',{name:'Remounted shop',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.selected),[21,22,23]);
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.unmount());await page.waitForTimeout(260);
 }finally{await browser.close();}
 assert.deepEqual(errors,[],'No stale resize/move callback may render a destroyed map');
});

test('FE-053 actual Expo-browser animated zoom can be left immediately without a late SDK transition error',{timeout:30000},async()=>{
 const compiled=await bundled,browser=await chromium.launch({headless:true,timeout:20000}),errors:string[]=[];
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.stack||error.message));
  await page.route('https://**',route=>route.abort('blockedbyclient'));
  await page.setContent('<main id="root" style="width:390px;height:500px"></main>');
  await page.addStyleTag({path:nativeRequire.resolve('leaflet/dist/leaflet.css')});
  await page.addScriptTag({content:'window.fixture={maps:[],selected:[],markerUnmounts:0};'});
  await page.addScriptTag({content:compiled.outputFiles[0].text});
  const shop={id:31,handle:'zoom-fixture',name:'Zoom fixture',description:'',heroImagePath:'',city:'Fixture city',region:'',latitude:9.03,longitude:39.7,locationMode:'storefront'};
  type MapProbe={_loaded:boolean;_animatingZoom?:boolean;_zoomAnimated?:boolean;getZoom:()=>number};
  type Probe={maps:MapProbe[];selected:number[];mount:(value:typeof shop)=>void;unmount:()=>void;controls:{current:{zoom:(direction:number)=>void;reset:()=>void}}};
  await page.evaluate(shop=>(window as unknown as {fixture:Probe}).fixture.mount(shop),shop);
  await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps[0]?._loaded);
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.maps[0]._zoomAnimated),true,'Actual installed Leaflet CSS animations are enabled');
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.controls.current.zoom(1));
  await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps[0]._animatingZoom===true);
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.unmount());await page.waitForTimeout(350);
  assert.deepEqual(errors,[],'The SDK250ms zoom completion cannot move a destroyed Expo-browser pane');
  await page.evaluate(shop=>(window as unknown as {fixture:Probe}).fixture.mount({...shop,id:32,name:'Returned zoom fixture'}),shop);
  await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps[1]?._loaded);
  const initial=await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.maps[1].getZoom());
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.controls.current.zoom(1));
  await page.waitForFunction(initial=>{const m=(window as unknown as {fixture:Probe}).fixture.maps[1];return m.getZoom()===initial+1&&!m._animatingZoom;},initial);
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.controls.current.reset());
  await page.waitForFunction(initial=>{const m=(window as unknown as {fixture:Probe}).fixture.maps[1];return m.getZoom()===initial&&!m._animatingZoom;},initial);
  await page.getByRole('button',{name:'Returned zoom fixture',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.selected),[32]);
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.unmount());await page.waitForTimeout(350);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-053 S140 actual Expo Leaflet opens exposed groups below maximum with current callbacks and no camera move',{timeout:45000},async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.stack||error.message));
  await page.route('https://**',route=>route.abort('blockedbyclient'));
  await page.setContent('<main id="root" style="width:390px;height:600px"></main>');
  await page.addStyleTag({path:nativeRequire.resolve('leaflet/dist/leaflet.css')});
  await page.addScriptTag({content:'window.fixture={maps:[],selected:[],markerUnmounts:0,groupAttempts:[],openedGroups:[],selectedHandlers:[]};'});
  await page.addScriptTag({content:(await bundled).outputFiles[0].text});
  const base={handle:'freshness',description:'',heroImagePath:'',city:'Fixture city',region:'',latitude:9.03,longitude:39.7,locationMode:'storefront'},shops=[{...base,id:41,name:'Group one'},{...base,id:42,name:'Group two'},{...base,id:43,name:'Isolated freshness',latitude:9.1,longitude:39.8}];
  type Probe={maps:Array<{_loaded:boolean;getZoom:()=>number;getCenter:()=>{lat:number;lng:number};setView:(center:number[],zoom:number,options:{animate:boolean})=>void;panTo:(center:number[],options:{animate:boolean})=>void}>;mountFreshness:(rows:typeof shops)=>void;replaceHandlers:()=>void;groupAttempts:Array<{zoom:number;generation:number}>;openedGroups:Array<{ids:number[];generation:number}>;selectedHandlers:Array<{id:number;zoom:number;generation:number}>;unmount:()=>void};
  await page.evaluate(rows=>(window as unknown as{fixture:Probe}).fixture.mountFreshness(rows),shops);
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps[0]?._loaded);
  await page.waitForFunction(()=>Boolean(document.querySelector('.leaflet-container[data-map-zoom]')));
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].setView([9.03,39.7],12,{animate:false}));
  await page.waitForFunction(()=>document.getElementById('parent-zoom')?.textContent==='12').catch(async error=>{
   console.error('S140 Expo controlled fixture diagnosis',await page.evaluate(()=>{const map=(window as unknown as{fixture:Probe}).fixture.maps[0];return{sdkZoom:map.getZoom(),sdkCenter:map.getCenter(),parentZoom:document.getElementById('parent-zoom')?.textContent,mapZoom:document.querySelector<HTMLElement>('.leaflet-container')?.dataset.mapZoom};}),errors);throw error;
  });
  const view=()=>page.evaluate(()=>{const map=(window as unknown as{fixture:Probe}).fixture.maps[0],center=map.getCenter();return{zoom:map.getZoom(),center:[center.lat,center.lng]};});const before=await view();
  await page.getByRole('button',{name:'2 businesses. View businesses.',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.groupAttempts),[{zoom:12,generation:0}],'The first click after SDK zoom must reach the current parent callback');
  assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.openedGroups),[{ids:[41,42],generation:0}]);
  assert.deepEqual(await view(),before,'Opening an already exposed final group cannot change the raw SDK camera');
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].panTo([9.1,39.8],{animate:false}));
  await page.getByRole('button',{name:'Isolated freshness',exact:true}).waitFor();
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.replaceHandlers());
  await page.getByRole('button',{name:'Isolated freshness',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.selectedHandlers),[{id:43,zoom:12,generation:1}],'A retained marker must dispatch the replaced current selection callback');
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.unmount());
 }finally{await browser.close();}
 assert.deepEqual(errors,[]);
});

test('FE-021 S154 actual Expo Leaflet21 area businesses reach fitting city groups at phone and desktop widths',{timeout:45000},async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
 try{for(const[width,capacity,expected]of[[390,3,7],[1440,6,4]]){
  const page=await browser.newPage({viewport:{width,height:844}});page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.stack||error.message));
  await page.route('https://**',route=>route.abort('blockedbyclient'));
  await page.setContent('<main id="root" style="width:'+width+'px;height:600px"></main>');
  await page.addStyleTag({path:nativeRequire.resolve('leaflet/dist/leaflet.css')});
  await page.addScriptTag({content:'window.fixture={maps:[],selected:[],markerUnmounts:0,groupAttempts:[],openedGroups:[],selectedHandlers:[]};'});await page.addScriptTag({content:(await bundled).outputFiles[0].text});
  const shops=Array.from({length:21},(_,i)=>({id:i+1,handle:'city-'+i,name:'City business '+i,description:'',heroImagePath:'',city:'Addis Ababa',region:'',latitude:9.03,longitude:38.75,locationMode:'area'}));
  type Probe={maps:Array<{_loaded:boolean;getZoom:()=>number;getCenter:()=>{lat:number;lng:number};setView:(center:number[],zoom:number,options:{animate:boolean})=>void}>;mountFreshness:(rows:typeof shops,capacity:number)=>void;openedGroups:Array<{ids:number[]}>;unmount:()=>void};
  await page.evaluate(({shops,capacity})=>(window as unknown as{fixture:Probe}).fixture.mountFreshness(shops,capacity),{shops,capacity});
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps[0]?._loaded);
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].setView([9.03,38.75],6,{animate:false}));
  await page.getByRole('button',{name:'21 businesses. Zoom in.',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('parent-zoom')?.textContent==='12');
  const buttons=page.getByRole('button',{name:/businesses\. View businesses\./});await buttons.nth(expected-1).waitFor();assert.equal(await buttons.count(),expected);
  const before=await page.evaluate(()=>{const m=(window as unknown as{fixture:Probe}).fixture.maps[0];return{zoom:m.getZoom(),center:m.getCenter()};});
  for(let i=0;i<expected;i++){const button=buttons.nth(i);assert.equal(await button.evaluate(el=>{const r=el.getBoundingClientRect();return el===document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);}),true,'Each current circle has its own exposed pointer target');await button.click();}
  const opened=await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.openedGroups);assert.deepEqual(opened.flatMap(item=>item.ids).sort((a,b)=>a-b),shops.map(item=>item.id));assert.ok(opened.every(item=>item.ids.length<=capacity));
  assert.deepEqual(await page.evaluate(()=>{const m=(window as unknown as{fixture:Probe}).fixture.maps[0];return{zoom:m.getZoom(),center:m.getCenter()};}),before,'Every terminal click opens in place');
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.unmount());await page.close();
 }}finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-053 actual Expo Leaflet observes initial zero-width flex layout without window resize and cleans pending container work',{timeout:45000},async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
 try{
  const page=await browser.newPage({viewport:{width:844,height:390}});page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.stack||error.message));
  await page.route('https://**',route=>route.abort('blockedbyclient'));
  await page.setContent('<main id="root" style="width:0px;height:74px"></main>');
  await page.addStyleTag({path:nativeRequire.resolve('leaflet/dist/leaflet.css')});
  await page.addScriptTag({content:`window.fixture={maps:[],selected:[],markerUnmounts:0,viewpoints:[],windowResizes:0,observerDisconnects:0};window.addEventListener('resize',()=>window.fixture.windowResizes++);const NativeResizeObserver=window.ResizeObserver;window.ResizeObserver=class extends NativeResizeObserver{disconnect(){window.fixture.observerDisconnects++;super.disconnect();}};`});
  await page.addScriptTag({content:(await bundled).outputFiles[0].text});
  const shop={id:51,handle:'flex-fixture',name:'Visible flex shop',description:'',heroImagePath:'',city:'Fixture city',region:'',latitude:9.03,longitude:39.71,locationMode:'storefront'};
  type Point={x:number;y:number};
  type MapProbe={_loaded:boolean;getContainer:()=>HTMLElement;getSize:()=>Point;getCenter:()=>{lat:number;lng:number};getZoom:()=>number;project:(center:{lat:number;lng:number},zoom:number)=>Point;panTo:(center:number[],options:{animate:boolean})=>void;listens:(event:string)=>boolean};
  type Probe={maps:MapProbe[];selected:number[];windowResizes:number;observerDisconnects:number;mountFlex:(value:typeof shop)=>void;unmount:()=>void};
  await page.evaluate(value=>(window as unknown as{fixture:Probe}).fixture.mountFlex(value),shop);
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps[0]?._loaded);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].getSize().x),0,'The installed SDK really initialized before its flex width existed');
  assert.equal(await page.locator('.leaflet-container').getAttribute('data-map-marker-count'),'0');
  await page.evaluate(()=>{document.getElementById('root')!.style.width='827px';});
  await page.waitForFunction(()=>{const map=(window as unknown as{fixture:Probe}).fixture.maps[0];return map.getSize().x===827&&map.getContainer().dataset.mapMarkerCount==='1';});
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.windowResizes),0,'Container layout alone recovers current markers; no window/height-prop event is supplied');
  await page.getByRole('button',{name:'Visible flex shop',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.selected),[51]);
  const before=await page.evaluate(()=>{const map=(window as unknown as{fixture:Probe}).fixture.maps[0];map.panTo([9.04,39.72],{animate:false});return map.project(map.getCenter(),map.getZoom());});
  await page.evaluate(()=>{const root=document.getElementById('root')!;root.style.width='826px';root.style.width='827px';root.style.width='828px';});
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].getSize().x===828);
  const after=await page.evaluate(()=>{const map=(window as unknown as{fixture:Probe}).fixture.maps[0];return map.project(map.getCenter(),map.getZoom());});
  assert.ok(Math.abs(after.x-before.x)<=.5&&Math.abs(after.y-before.y)<=.5,'Container resize preserves the current geographic camera within SDK pixel quantization');
  await page.evaluate(()=>{document.getElementById('root')!.style.width='0px';});await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].getSize().x),828,'Hidden zero-size layout cannot corrupt the last valid SDK geometry');
  await page.evaluate(()=>{document.getElementById('root')!.style.width='827px';(window as unknown as{fixture:Probe}).fixture.unmount();});
  await page.waitForTimeout(260);
  assert.ok(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.observerDisconnects>0),'Owned container observer disconnects on unmount');
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].listens('moveend')),false);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.windowResizes),0);
 }finally{await browser.close();}
 assert.deepEqual(errors,[],'No observer/frame callback may render a removed SDK instance');
});

test('FE-065 S136 actual Expo Leaflet saves exact fractional intent while raw resized/remounted SDK stays within half a pixel',{timeout:60000},async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.stack||error.message));
  await page.route('https://**',route=>route.abort('blockedbyclient'));
  await page.setContent('<main id="root" style="width:372px;height:300px"></main>');
  await page.addStyleTag({path:nativeRequire.resolve('leaflet/dist/leaflet.css')});
  await page.addScriptTag({content:'window.fixture={maps:[],selected:[],markerUnmounts:0,viewpoints:[]};'});await page.addScriptTag({content:(await bundled).outputFiles[0].text});
  type View={center:[number,number];zoom:number};
  type CameraMap=import('leaflet').Map&{_loaded:boolean};
  type CameraProbe={maps:CameraMap[];fractionalView:View;viewpoints:View[];mountCamera:(view:View)=>void;unmount:()=>void};
  let saved=await page.evaluate(()=>(window as unknown as{fixture:CameraProbe}).fixture.fractionalView);
  const original={x:1292623.674519761,y:992355.5644955807};
  for(let cycle=0;cycle<3;cycle++){
   await page.evaluate(view=>(window as unknown as{fixture:CameraProbe}).fixture.mountCamera(view),saved);
   await page.waitForFunction(()=>(window as unknown as{fixture:CameraProbe}).fixture.maps.at(-1)?._loaded);await page.waitForTimeout(80);
   for(const[width,height]of[[373,301],[373,302],[372,300]]){
    await page.evaluate(({width,height})=>{const f=(window as unknown as{fixture:CameraProbe}).fixture;f.viewpoints=[];const element=f.maps.at(-1)!.getContainer();element.style.width=width+'px';element.style.height=height+'px';},{width,height});
    await page.waitForFunction(({width,height})=>{const f=(window as unknown as{fixture:CameraProbe}).fixture,m=f.maps.at(-1)!;return m.getSize().x===width&&m.getSize().y===height&&f.viewpoints.length>0;},{width,height});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const state=await page.evaluate(()=>{const f=(window as unknown as{fixture:CameraProbe}).fixture,m=f.maps.at(-1)!,actual=m.getCenter(),point=m.project(actual,m.getZoom()),view=f.viewpoints.at(-1)!,persisted=m.project([view.center[1],view.center[0]],view.zoom);return{point:{x:point.x,y:point.y},persisted:{x:persisted.x,y:persisted.y},commits:f.viewpoints.length,view,precise:m.getContainer().dataset.mapCenterPrecise,actual:[actual.lat,actual.lng]};});
    assert.ok(Math.abs(state.point.x-original.x)<=.5&&Math.abs(state.point.y-original.y)<=.5,'Raw installed SDK obeys the original half-pixel contract '+JSON.stringify(state));
    assert.ok(Math.abs(state.persisted.x-original.x)<1e-7&&Math.abs(state.persisted.y-original.y)<1e-7,'Expo navigation must save geographical intent instead of each quantized center');
    assert.equal(state.commits,1,'One final camera publication per observed container resize');
    assert.deepEqual(state.precise!.split(',').map(Number),state.actual,'Independent precision diagnostic is the raw SDK center');saved=state.view;
   }
   await page.evaluate(()=>(window as unknown as{fixture:CameraProbe}).fixture.unmount());
  }
  await page.evaluate(view=>(window as unknown as{fixture:CameraProbe}).fixture.mountCamera(view),saved);
  await page.waitForFunction(()=>(window as unknown as{fixture:CameraProbe}).fixture.maps.at(-1)?._loaded);await page.waitForTimeout(80);
  const panned=await page.evaluate(()=>{const f=(window as unknown as{fixture:CameraProbe}).fixture,m=f.maps.at(-1)!;f.viewpoints=[];m.panBy([17,-9],{animate:false});const actual=m.getCenter();return{actual:[actual.lng,actual.lat],view:f.viewpoints.at(-1)!};});
  assert.deepEqual(panned.view.center,panned.actual,'Genuine SDK pan replaces the previous resize-only intent');
  const zoomed=await page.evaluate(()=>{const f=(window as unknown as{fixture:CameraProbe}).fixture,m=f.maps.at(-1)!;m.setZoom(12,{animate:false});const actual=m.getCenter();return{actual:[actual.lng,actual.lat],view:f.viewpoints.at(-1)!};});
  assert.equal(zoomed.view.zoom,12);assert.deepEqual(zoomed.view.center,zoomed.actual);
  await page.evaluate(()=>(window as unknown as{fixture:CameraProbe}).fixture.unmount());await page.waitForTimeout(260);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
