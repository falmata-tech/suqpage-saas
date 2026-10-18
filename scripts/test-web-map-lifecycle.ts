import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium,type Page} from 'playwright';
import type {Map as LeafletMap} from 'leaflet';
import type {DiscoveryShowroom} from '../lib/discovery';

// Installed Leaflet, actual React and the production web adapter/markers. Only
// translations and external tiles are controlled; no database/provider/device proof.
const require=createRequire(process.cwd()+'/package.json');
const bundle=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import * as L from 'leaflet';import Map from './components/MarketplaceMap';
 const f=window.fixture,removed=new WeakSet(),invalidate=L.Map.prototype.invalidateSize,remove=L.Map.prototype.remove;
 L.Map.include({invalidateSize(...args){if(removed.has(this))f.lateInvalidates++;return invalidate.apply(this,args);},remove(...args){const result=remove.apply(this,args);removed.add(this);return result;}});
 L.Map.addInitHook(function(){f.maps.push(this);if(f.fastUnmount){f.fastUnmount=false;queueMicrotask(()=>f.unmount());}});
 const root=createRoot(document.getElementById('root')),controls=React.createRef();f.controls=controls;
 f.mount=(shop,fast=false,zoom=14,selected=null,capacity=3,view)=>{const shops=Array.isArray(shop)?shop:[shop];f.fastUnmount=fast;flushSync(()=>root.render(<Map ref={controls} showrooms={shops} groupCapacity={capacity} featuredNowBusinessId={null} selectedShowroomId={selected} requestedView={view||{center:[shops[0].latitude,shops[0].longitude],zoom}} onViewChange={view=>f.views.push(view)} onOpenNearbyGroup={group=>f.openedGroups.push(group.key)} onSelectShowroom={shop=>{f.selected.push(shop.id);if(f.focusOnSelect)controls.current?.centerAt(shop.latitude,shop.longitude,14);}} onError={()=>{f.mapErrors++;}}/>));};
 const fractional=L.CRS.EPSG3857.pointToLatLng(L.point(41363957.584632345,31755378.063858584),18);f.fractionalView={center:[fractional.lat,fractional.lng],zoom:18};
 f.polylineCount=()=>{let count=0;f.maps[0].eachLayer(layer=>{if(layer instanceof L.Polyline)count++;});return count;};
 f.unmount=()=>flushSync(()=>root.render(null));
`},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',define:{'process.env.NEXT_PUBLIC_SUQPAGE_MAP_PROVIDER':'"osm-standard"'},plugins:[{name:'web-map-lifecycle-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx(?:-dev)?-runtime)?|react-dom(?:\/client)?)$/},args=>({path:require.resolve(args.path)}));
 b.onResolve({filter:/^@\/lib\/i18n\/ui$/},args=>({path:args.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},()=>({loader:'js',contents:'const t=(value,values={})=>value.replace(/\\{([^}]+)\\}/g,(_,key)=>String(values[key]??key));export const useUiText=()=>t;'}));
 }}]});

const shop:DiscoveryShowroom={id:21,handle:'fixture-shop',name:'Original shop',tagline:'',description:'',logoPath:'',heroImagePath:'',city:'Fixture city',zone:'',region:'',latitude:9.03,longitude:39.7,fallbackStyle:'workshop',sponsored:false,productionScale:'workshop',isLive:false,livePlatform:'',liveUrl:'',primaryIndustryKey:'textiles',primaryIndustryLabel:'Textiles',primaryIndustryShortLabel:'Textiles',locationMode:'storefront'};
type MapProbe=LeafletMap&{_loaded:boolean;_animatingZoom?:boolean;_zoomAnimated?:boolean};
type CameraView={center:[number,number];zoom:number};
type Probe={polylineCount:()=>number;openedGroups:string[];maps:MapProbe[];selected:number[];lateInvalidates:number;mapErrors:number;focusOnSelect?:boolean;fractionalView:CameraView;views:CameraView[];mount:(shop:DiscoveryShowroom|DiscoveryShowroom[],fast?:boolean,zoom?:number,selected?:number|null,capacity?:number,view?:CameraView)=>void;unmount:()=>void;controls:{current:{reset:()=>void}}};

async function boot(channel?:'chrome'){
 const compiled=await bundle,browser=await chromium.launch({channel,headless:true,timeout:20000}),errors:string[]=[];
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',error=>errors.push(error.stack||error.message));
 page.setDefaultTimeout(8000);
 await page.route('https://**',route=>route.abort('blockedbyclient'));
 await page.setContent('<main id="root"></main>');
 await page.addStyleTag({path:require.resolve('leaflet/dist/leaflet.css')});
 await page.addStyleTag({content:'.discovery-map{width:390px;height:500px}'});
 await page.addScriptTag({content:'window.fixture={maps:[],openedGroups:[],selected:[],views:[],lateInvalidates:0,mapErrors:0,fastUnmount:false};'});
 await page.addScriptTag({content:compiled.outputFiles[0].text});
 return {browser,page,errors};
}
const mount=(page:Page,value:DiscoveryShowroom,fast=false)=>page.evaluate(({value,fast})=>(window as unknown as {fixture:Probe}).fixture.mount(value,fast),{value,fast});

test('FE-065 web map cancels its startup resize when navigation immediately unmounts it',{timeout:30000},async()=>{
 const {browser,page,errors}=await boot();
 try{
  await mount(page,shop,true);await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps.length===1||(window as unknown as {fixture:Probe}).fixture.mapErrors>0);
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.mapErrors),0,'Map initialization failed: '+errors.join('\n'));
  await page.waitForTimeout(260);
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.lateInvalidates),0,'Owned120ms startup resize must not reach a removed map');
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.mapErrors),0);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-065 web map keeps live pan/resize/selection but detaches delayed moveend before destruction',{timeout:30000},async()=>{
 const {browser,page,errors}=await boot();
 try{
  await mount(page,shop);await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps[0]?._loaded||(window as unknown as {fixture:Probe}).fixture.mapErrors>0);
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.mapErrors),0,'Map initialization failed: '+errors.join('\n'));
  await page.getByRole('button',{name:/^Original shop,/}).click();
  await mount(page,{...shop,id:22,name:'Updated shop'});await page.getByRole('button',{name:/^Updated shop,/}).waitFor();
  assert.equal(await page.getByRole('button',{name:/^Original shop,/}).count(),0);
  await page.evaluate(()=>{const m=(window as unknown as {fixture:Probe}).fixture.maps[0];m.panTo([9.032,39.702],{animate:false});m.getContainer().style.height='350px';m.invalidateSize({debounceMoveend:true});});
  await page.waitForTimeout(260);await page.getByRole('button',{name:/^Updated shop,/}).click();
  assert.deepEqual(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.selected),[21,22]);
  assert.equal(await page.locator('.discovery-map').getAttribute('data-map-marker-count'),'1');
  const view=await page.evaluate(()=>{const m=(window as unknown as {fixture:Probe}).fixture.maps[0],center=m.getCenter();return {latitude:center.lat,longitude:center.lng,zoom:m.getZoom()};});
  assert.ok(Math.abs(view.latitude-9.032)<.01&&Math.abs(view.longitude-39.702)<.01);assert.equal(view.zoom,14);
  await page.evaluate(()=>{const f=(window as unknown as {fixture:Probe}).fixture,m=f.maps[0];m.getContainer().style.height='280px';m.invalidateSize({debounceMoveend:true});f.unmount();});
  await page.waitForTimeout(260);assert.deepEqual(errors,[],'No delayed SDK event may read a destroyed pane');
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.maps[0].listens('moveend')),false,'Owned render/commit listener is detached');
  await mount(page,{...shop,id:23,name:'Remounted shop'});await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps[1]?._loaded);
  const before=await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.views.length);
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.maps[0].fire('moveend'));
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.views.length),before,'An old instance cannot commit into the replacement');
  await page.getByRole('button',{name:/^Remounted shop,/}).click();assert.deepEqual(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.selected),[21,22,23]);
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.unmount());await page.waitForTimeout(260);
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.lateInvalidates),0);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-065 phone marker animated zoom can be left immediately without a late SDK transition error',{timeout:30000},async()=>{
 const {browser,page,errors}=await boot();
 try{
  await page.evaluate(shop=>{const f=(window as unknown as {fixture:Probe}).fixture;f.focusOnSelect=true;f.mount(shop,false,11);},shop);
  await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps[0]?._loaded);
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.maps[0]._zoomAnimated),true,'Actual Leaflet CSS zoom animation must be enabled');
  await page.getByRole('button',{name:/^Original shop,/}).click();
  await page.waitForFunction(()=>(window as unknown as {fixture:Probe}).fixture.maps[0]._animatingZoom===true);
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.unmount());
  await page.waitForTimeout(350);
  assert.deepEqual(errors,[],'The SDK250ms zoom fallback must not move a destroyed pane');
  await page.evaluate(shop=>(window as unknown as {fixture:Probe}).fixture.mount({...shop,id:24,name:'Returned shop'},false,11),shop);
  await page.getByRole('button',{name:/^Returned shop,/}).click();
  await page.waitForFunction(()=>{const m=(window as unknown as {fixture:Probe}).fixture.maps[1];return m.getZoom()===14&&!m._animatingZoom;});
  assert.deepEqual(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.selected),[21,24]);
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.controls.current.reset());
  await page.waitForFunction(()=>{const m=(window as unknown as {fixture:Probe}).fixture.maps[1];return m.getZoom()<14&&!m._animatingZoom;});
  await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.unmount());await page.waitForTimeout(350);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});


test('FE-021 S127 marker reprojection preserves the current trigger focus without claiming external modal focus',{timeout:30000},async()=>{
 const {browser,page,errors}=await boot();
 try{
  const cohort=[shop,{...shop,id:22,name:'Second fixture shop'}];
  await page.evaluate(shops=>(window as unknown as {fixture:Probe}).fixture.mount(shops,false,18),cohort);
  const marker=page.getByRole('button',{name:'2 businesses. View businesses.',exact:true});await marker.waitFor();await marker.focus();await expectFocus();
  const previous=await marker.elementHandle();
  await page.evaluate(shops=>(window as unknown as {fixture:Probe}).fixture.mount(shops,false,18,21),cohort);
  await expectFocus();assert.equal(await previous!.evaluate(element=>element.isConnected),false,'The original focused icon must really have been replaced');
  await page.evaluate(()=>{const button=document.createElement('button');button.id='external-modal-control';button.textContent='External dialog control';document.body.append(button);button.focus();});
  await page.evaluate(shops=>(window as unknown as {fixture:Probe}).fixture.mount(shops,false,18,null),cohort);
  assert.equal(await page.locator('#external-modal-control').evaluate(element=>document.activeElement===element),true,'Marker refresh must never steal focus from a dialog/control');
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.maps[0].getZoom()),18);assert.deepEqual(errors,[]);
  async function expectFocus(){await page.waitForFunction(()=>{const marker=document.querySelector('.leaflet-marker-icon:has([data-map-group-key])');return Boolean(marker&&document.activeElement===marker);});}
 }finally{await browser.close();}
});


test('FE-021 revised S127 focusing and activating an edge counted group never pans or zooms the map',{timeout:30000},async()=>{
 const {browser,page,errors}=await boot();
 try{
  const cohort=[shop,...[22,23,24].map(id=>({...shop,id,name:'Fixture shop '+id}))];await page.evaluate(shops=>(window as unknown as {fixture:Probe}).fixture.mount(shops,false,18,null,2),cohort);
  const markers=page.getByRole('button',{name:'2 businesses. View businesses.',exact:true});await page.waitForFunction(()=>document.querySelectorAll('.mp-map-cluster').length===2);assert.equal(await markers.count(),2);const marker=markers.first();await marker.waitFor();assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.polylineCount()),0,'Four co-located shops must render two independent2-count circles without connecting lines');
  await page.evaluate(()=>{const button=document.createElement('button');button.id='outside-map';document.body.append(button);button.focus();const map=(window as unknown as {fixture:Probe}).fixture.maps[0];map.panBy([map.getSize().x/2-8,0],{animate:false});});
  const view=()=>page.evaluate(()=>{const map=(window as unknown as {fixture:Probe}).fixture.maps[0],center=map.getCenter();return{center:[center.lat,center.lng],zoom:map.getZoom()};});
  const before=await view();await marker.focus();await page.waitForTimeout(350);assert.deepEqual(await view(),before,'SDK focus auto-pan must be disabled only for counted groups');
  await marker.press('Enter');assert.equal((await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.openedGroups)).length,1);assert.deepEqual(await view(),before);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-021 S140 outer aggregates expand while exposed terminal circles open below maximum without camera changes',{timeout:30000},async()=>{
 const {browser,page,errors}=await boot();
 try{
  const cohort=Array.from({length:12},(_,index)=>({...shop,id:index+21,name:'Hierarchy fixture shop '+index}));
  const mountAtOverview=()=>page.evaluate(shops=>(window as unknown as {fixture:Probe}).fixture.mount(shops,false,5,null,3),cohort);
  await mountAtOverview();
  const aggregate=page.getByRole('button',{name:'12 businesses. Zoom in.',exact:true});await aggregate.waitFor();
  assert.equal(await aggregate.locator('[data-map-group-kind="aggregate"]').count(),1);
  await aggregate.click();await expandedWithoutOpening();
  await mountAtOverview();await page.waitForFunction(()=>document.querySelector('.discovery-map')?.getAttribute('data-map-zoom')==='5');
  await aggregate.press('Enter');await expandedWithoutOpening();
  await page.evaluate(shops=>(window as unknown as {fixture:Probe}).fixture.mount(shops,false,14,null,3),cohort.slice(0,2));
  await page.waitForFunction(()=>{const map=(window as unknown as {fixture:Probe}).fixture.maps[0];return map.getZoom()===14&&!map._animatingZoom;});
  const smallCircle=page.getByRole('button',{name:'2 businesses. View businesses.',exact:true});await smallCircle.waitFor();assert.equal(await smallCircle.locator('[data-map-group-kind="cluster"]').count(),1);
  const oneGroupView=await view();assert.equal(oneGroupView.zoom,14);await smallCircle.press('Enter');assert.deepEqual(await view(),oneGroupView);assert.equal((await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.openedGroups)).length,1,'A final circle below max opens immediately');
  await smallCircle.click();assert.deepEqual(await view(),oneGroupView);assert.equal((await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.openedGroups)).length,2,'Pointer activation has the same in-place behavior');
  await page.evaluate(shops=>(window as unknown as {fixture:Probe}).fixture.mount(shops,false,18,null,3),cohort);
  await page.evaluate(()=>{const f=(window as unknown as {fixture:Probe}).fixture;f.maps[0].setView([9.03,39.7],18,{animate:false});});
  await page.waitForFunction(()=>document.querySelector('.discovery-map')?.getAttribute('data-map-zoom')==='18');
  await page.waitForFunction(()=>document.querySelectorAll('[data-map-group-kind="cluster"]').length===4);
  assert.equal(await page.locator('[data-map-group-kind="aggregate"]').count(),0);
  assert.equal(await page.locator('[data-map-group-kind="cluster"]').count(),4);
  const before=await view(),terminal=page.getByRole('button',{name:'3 businesses. View businesses.',exact:true}).first();await terminal.press('Enter');
  assert.equal((await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.openedGroups)).length,3);
  assert.deepEqual(await view(),before,'Only outer aggregates change the camera');
  assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.polylineCount()),0);assert.deepEqual(errors,[]);
  async function view(){return page.evaluate(()=>{const map=(window as unknown as {fixture:Probe}).fixture.maps[0],center=map.getCenter();return{center:[center.lat,center.lng],zoom:map.getZoom()};});}
  async function expandedWithoutOpening(){
   await page.waitForFunction(()=>{const map=(window as unknown as {fixture:Probe}).fixture.maps[0];return map.getZoom()>5&&!map._animatingZoom;});
   assert.deepEqual(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.openedGroups),[],'An outer aggregate must never open a picker');
   assert.deepEqual(await page.evaluate(()=>(window as unknown as {fixture:Probe}).fixture.selected),[]);
   assert.ok((await view()).zoom<=18);
  }
 }finally{await browser.close();}
});

test('FE-065 S128 web container resize preserves max-zoom camera and commits only its corrected view',{timeout:30000},async()=>{
 const {browser,page,errors}=await boot('chrome');
 try{
  await page.evaluate(shop=>(window as unknown as{fixture:Probe}).fixture.mount(shop,false,18),shop);
  await page.getByRole('button',{name:/^Original shop,/}).waitFor();await page.waitForTimeout(220);
  const before=await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture,map=f.maps[0];f.views=[];const center=map.getCenter(),point=map.project(center,map.getZoom());return{point:{x:point.x,y:point.y},center:{lat:center.lat,lng:center.lng},zoom:map.getZoom()};});
  await page.locator('.discovery-map').evaluate(el=>{(el as HTMLElement).style.height='554px';});
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].getSize().y===554);
  const resized=await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture,map=f.maps[0],point=map.project(map.getCenter(),map.getZoom());return{point:{x:point.x,y:point.y},zoom:map.getZoom(),commits:f.views.map(view=>{const p=map.project([view.center[0],view.center[1]],view.zoom);return{x:p.x,y:p.y,zoom:view.zoom};})};});
  assert.equal(resized.zoom,18);assert.ok(Math.abs(resized.point.x-before.point.x)<=.5&&Math.abs(resized.point.y-before.point.y)<=.5,'A54px loading-row change must not move the real SDK camera by27px');
  assert.equal(resized.commits.length,1,'Only one final corrected camera is published per container resize');
  assert.ok(resized.commits.every(point=>point.zoom===18&&Math.abs(point.x-before.point.x)<=.5&&Math.abs(point.y-before.point.y)<=.5),'Intermediate SDK resize/pan events cannot corrupt saved navigation state');
  await page.evaluate(()=>{(window as unknown as{fixture:Probe}).fixture.views=[];});
  await page.locator('.discovery-map').evaluate(el=>{(el as HTMLElement).style.height='0px';});await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].getSize().y),554,'Hidden zero-size geometry cannot invalidate the last valid viewport');
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.views.length),0,'A hidden map publishes no new camera');
  await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture;f.maps[0].getContainer().style.height='500px';f.unmount();});await page.waitForTimeout(260);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.lateInvalidates),0);assert.deepEqual(errors,[],'Pending container work is cancelled before SDK destruction');
 }finally{await browser.close();}
});

test('FE-065 S136 actual web Leaflet keeps fractional resize intent through remounts and accepts genuine pan/zoom',{timeout:60000},async()=>{
 const{browser,page,errors}=await boot('chrome');
 try{
  await page.addStyleTag({content:'.discovery-map{width:372px;height:300px}'});
  const initial=await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.fractionalView);
  let saved=initial;
  const original={x:41363957.584632345,y:31755378.063858584};
  for(let cycle=0;cycle<3;cycle++){
   await page.evaluate(({shop,view})=>{const f=(window as unknown as{fixture:Probe}).fixture;f.mount(shop,false,18,null,3,view);},{shop,view:saved});
   await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps.at(-1)?._loaded);
   await page.waitForTimeout(220);
   for(const[width,height]of[[373,301],[373,302],[372,300]]){
    await page.evaluate(({width,height})=>{const f=(window as unknown as{fixture:Probe}).fixture;f.views=[];const element=f.maps.at(-1)!.getContainer();element.style.width=width+'px';element.style.height=height+'px';},{width,height});
    await page.waitForFunction(({width,height})=>{const f=(window as unknown as{fixture:Probe}).fixture,m=f.maps.at(-1)!;return m.getSize().x===width&&m.getSize().y===height&&f.views.length>0;},{width,height});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const state=await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture,m=f.maps.at(-1)!,actual=m.getCenter(),point=m.project(actual,m.getZoom()),view=f.views.at(-1)!,persisted=m.project(view.center,view.zoom);return{point:{x:point.x,y:point.y},persisted:{x:persisted.x,y:persisted.y},commits:f.views.length,view,precise:m.getContainer().dataset.mapCenterPrecise,actual:[actual.lat,actual.lng]};});
    assert.ok(Math.abs(state.point.x-original.x)<=.5&&Math.abs(state.point.y-original.y)<=.5,'Raw installed SDK retains its independent half-pixel contract '+JSON.stringify(state));
    assert.ok(Math.abs(state.persisted.x-original.x)<1e-7&&Math.abs(state.persisted.y-original.y)<1e-7,'Saved geographical intent must not compound the SDK rounding');
    assert.equal(state.commits,1,'Only the final corrected view is published once per owned size transition');
    assert.deepEqual(state.precise!.split(',').map(Number),state.actual,'Precision diagnostics contain the independently observed SDK center');
    saved=state.view;
   }
   await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.unmount());
  }
  await page.evaluate(({shop,view})=>(window as unknown as{fixture:Probe}).fixture.mount(shop,false,18,null,3,view),{shop,view:saved});
  await page.waitForFunction(()=>(window as unknown as{fixture:Probe}).fixture.maps.at(-1)?._loaded);await page.waitForTimeout(220);
  const panned=await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture,m=f.maps.at(-1)!;f.views=[];m.panBy([17,-9],{animate:false});const center=m.getCenter(),view=f.views.at(-1)!;return{actual:[center.lat,center.lng],view};});
  assert.deepEqual(panned.view.center,panned.actual,'Genuine public SDK pan replaces the old resize intent');
  const zoomed=await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture,m=f.maps.at(-1)!;m.setZoom(17,{animate:false});const center=m.getCenter();return{actual:[center.lat,center.lng],view:f.views.at(-1)!};});
  assert.equal(zoomed.view.zoom,17);assert.deepEqual(zoomed.view.center,zoomed.actual,'Genuine public SDK zoom publishes its current center');
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.unmount());await page.waitForTimeout(260);
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.lateInvalidates),0);
 }finally{await browser.close();}
});
