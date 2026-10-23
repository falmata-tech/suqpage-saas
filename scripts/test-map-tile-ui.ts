import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {chromium,type Page,type Route} from 'playwright';
import type {Map as LeafletMap} from 'leaflet';
import {MAP_MAX_ZOOM} from '../lib/map/map-clustering';

// Actual React, installed Leaflet and production browser adapters/loader. Only
// translations, the Expo marker glyph and ALL external HTTP are fixture ports.
// No request reaches OSM, and this is not native MapLibre/provider availability proof.
const rootRequire=createRequire(process.cwd()+'/package.json');
const nativeRequire=createRequire(process.cwd()+'/apps/mobile/package.json');
type Adapter='web'|'expo';
type TileRequest={url:string;cache:RequestCache|undefined;credentials:RequestCredentials|undefined;referrerPolicy:ReferrerPolicy|undefined;method:string|undefined;mode:RequestMode|undefined;headers:string[];signal:AbortSignal|null|undefined};
type Probe={maps:LeafletMap[];selected:number[];errors:number;created:string[];revoked:string[];expectedURLs:string[];requests:TileRequest[];mount:()=>void;unmount:()=>void;redraw:()=>void;rasterCount:()=>number};
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#dcebd7"/><path d="M0 128H256" stroke="#fff" stroke-width="6"/></svg>';
const deniedPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7WQAAAAASUVORK5CYII=','base64');
const tileURL=/^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/;
const baseZoom=MAP_MAX_ZOOM-2;
const sortedURLs=(values:readonly {url:string}[])=>[...new Set(values.map(value=>value.url))].sort();

async function bundle(adapter:Adapter){
 const resolver=adapter==='web'?rootRequire:nativeRequire;
 const component=adapter==='web'?'./components/MarketplaceMap':'./apps/mobile/src/MarketMap.web';
 const mount=adapter==='web'?`<Map showrooms={[shop]} groupCapacity={3} featuredNowBusinessId={null} selectedShowroomId={null} requestedView={{center:[9.03,39.7],zoom:${baseZoom}}} onViewChange={()=>{}} onOpenNearbyGroup={()=>{}} onSelectShowroom={value=>f.selected.push(value.id)} onError={()=>f.errors++}/>`:`<Map shops={[shop]} height={500} initialView={{center:[39.7,9.03],zoom:${baseZoom}}} onSelect={value=>f.selected.push(value.id)}/>`;
 const compiled=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
  import React from 'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import * as L from'leaflet';import Map from '${component}';
  const f=window.fixture;L.Map.addInitHook(function(){f.maps.push(this);});
  const addTile=L.GridLayer.prototype._addTile;
  L.GridLayer.include({_addTile(coords,container){const create=this.createTile;this.createTile=function(point,done){f.expectedURLs.push('https://tile.openstreetmap.org/'+point.z+'/'+point.x+'/'+point.y+'.png');return create.call(this,point,done);};try{return addTile.call(this,coords,container);}finally{this.createTile=create;}}});
  const root=createRoot(document.getElementById('root'));
  const shop={id:21,handle:'fixture-shop',name:'Original shop',tagline:'',description:'',logoPath:'',heroImagePath:'',city:'Fixture city',zone:'',region:'',latitude:9.03,longitude:39.7,fallbackStyle:'workshop',sponsored:false,productionScale:'workshop',isLive:false,livePlatform:'',liveUrl:'',primaryIndustryKey:'textiles',primaryIndustryLabel:'Textiles',primaryIndustryShortLabel:'Textiles',locationMode:'storefront'};
  f.mount=()=>flushSync(()=>root.render(${mount}));f.unmount=()=>flushSync(()=>root.render(null));
  f.redraw=()=>f.maps[0].eachLayer(layer=>{if(layer instanceof L.GridLayer)layer.redraw();});
  f.rasterCount=()=>{let count=0;f.maps[0].eachLayer(layer=>{if(layer instanceof L.GridLayer)count++;});return count;};
 `},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',define:{'process.env.NEXT_PUBLIC_SUQPAGE_MAP_PROVIDER':'"osm-standard"'},plugins:[{name:'tile-ui-ports',setup(b){
  b.onResolve({filter:/^(?:react(?:\/jsx(?:-dev)?-runtime)?|react-dom(?:\/client)?)$/},args=>({path:resolver.resolve(args.path)}));
  b.onResolve({filter:/^(?:@\/lib\/i18n\/ui|\.\/(?:runtime|MapMarker))$/},args=>({path:args.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',contents:args.path==='./MapMarker'?`import React from'react';export function MapMarker({item,onPress}){return <button style={{pointerEvents:'auto'}} onClick={onPress}>{item.shop?.name||item.kind}</button>;}`:`const t=(key,values={})=>key.replace(/\\{([^}]+)\\}/g,(_,name)=>String(values[name]??name));export const useUiText=()=>t;export const useApp=()=>({t});`}));
 }}]});
 return compiled.outputFiles[0].text;
}

async function camera(page:Page){return page.evaluate(()=>{const map=(window as unknown as{fixture:Probe}).fixture.maps[0],center=map.getCenter();return{lat:center.lat,lng:center.lng,zoom:map.getZoom()};});}
async function requests(page:Page){return page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.requests.map(({signal,...request})=>({...request,aborted:signal?.aborted||false})));}

for(const adapter of ['web','expo'] as const)test(`FE-021/FE-053 S139 ${adapter}: HTTP-status raster failure and deliberate retry preserve the actual map and markers`,{timeout:65000},async()=>{
 const compiled=await bundle(adapter),browser=await chromium.launch({channel:process.env.SUQPAGE_BROWSER_CHANNEL||undefined,headless:true,timeout:20000});
 const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(8000);
 const errors:string[]=[],unexpectedRequests:string[]=[],expected403:string[]=[],referrers:Array<string|undefined>=[],held:Route[]=[];
 async function waitHeld(after:number){const until=Date.now()+3000;while(held.length<=after){assert.ok(Date.now()<until,'Pending tile fixture was not reached');await new Promise(resolve=>setTimeout(resolve,10));}}
 let mode:'ok'|'blocked'|'hold'='ok',expectedTeardown=false;
 page.on('pageerror',error=>errors.push(error.stack||error.message));
 page.on('crash',()=>errors.push('Unexpected page crash'));
 page.on('close',()=>{if(!expectedTeardown)errors.push('Unexpected page close');});
 browser.on('disconnected',()=>{if(!expectedTeardown)errors.push('Unexpected browser disconnect');});
 page.on('console',message=>{if(message.type()==='error'){
  const url=message.location().url;
  if(tileURL.test(url)&&message.text()==='Failed to load resource: the server responded with a status of 403 (Forbidden)')expected403.push(url);
  else errors.push(message.text());
 }});
 const leafletCSS=await readFile(rootRequire.resolve('leaflet/dist/leaflet.css'),'utf8');
 await page.route('**/*',async route=>{
  const url=route.request().url();
  if(url==='http://localhost:41739/tile-fixture')return route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="referrer" content="no-referrer"><main id="root"></main>'});
  if(url==='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css')return route.fulfill({contentType:'text/css',body:leafletCSS});
  if(tileURL.test(url)){
   referrers.push(route.request().headers().referer);
   if(mode==='hold'){held.push(route);return;}
   return route.fulfill({status:mode==='blocked'?403:200,headers:{'access-control-allow-origin':'*','cache-control':'public, max-age=3600'},contentType:mode==='blocked'?'image/png':'image/svg+xml',body:mode==='blocked'?deniedPng:svg});
  }
  unexpectedRequests.push(url);return route.abort('blockedbyclient');
 });
 try{
  await page.goto('http://localhost:41739/tile-fixture');
  await page.addStyleTag({content:leafletCSS});
  if(adapter==='web')await page.addStyleTag({path:'app/discovery.css'});
  await page.addStyleTag({content:'body{margin:0}#root{position:relative;width:390px;height:500px}.discovery-map{width:390px;height:500px}'});
  await page.addScriptTag({content:`
   window.fixture={maps:[],selected:[],errors:0,created:[],revoked:[],expectedURLs:[],requests:[]};
   const f=window.fixture,send=window.fetch.bind(window),create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
   window.fetch=(url,init)=>{f.requests.push({url:String(url),cache:init?.cache,credentials:init?.credentials,referrerPolicy:init?.referrerPolicy,method:init?.method,mode:init?.mode,headers:Array.from(new Headers(init?.headers).keys()),signal:init?.signal});return send(url,init);};
   URL.createObjectURL=blob=>{const url=create(blob);f.created.push(url);return url;};URL.revokeObjectURL=url=>{f.revoked.push(url);revoke(url);};
  `});
  await page.addScriptTag({content:compiled});
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.mount());
  const map=page.locator('.leaflet-container');
  await page.waitForFunction(()=>document.querySelector('.leaflet-container')?.getAttribute('data-tile-status')==='ready');
  await page.waitForFunction(()=>{const images=[...document.querySelectorAll<HTMLImageElement>('.leaflet-tile-pane img')];return images.length>0&&images.every(image=>image.complete&&image.naturalWidth===256&&image.src.startsWith('blob:'));});
  const marker=page.getByRole('button',{name:adapter==='web'?/^Original shop,/: 'Original shop',exact:adapter==='expo'});
  await marker.waitFor();await page.waitForTimeout(200); // settles the owned startup size observer, not a synthetic success.
  // Exercise the actual SDK's old/new zoom tile lifecycle with HTTP still
  // pending. TileLayer's private image-cancellation hook must not overwrite
  // the custom asynchronous loader's completion handlers or orphan a timer.
  const rapidHeld=held.length;mode='hold';await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.redraw());await waitHeld(rapidHeld);
  await page.evaluate(({middle,highest})=>{const m=(window as unknown as{fixture:Probe}).fixture.maps[0];m.setZoom(middle,{animate:false});m.setZoom(highest,{animate:false});},{middle:MAP_MAX_ZOOM-1,highest:MAP_MAX_ZOOM});
  mode='ok';await Promise.all(held.splice(0).map(route=>route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'image/svg+xml',body:svg}).catch(error=>{if(!/closed|handled|canceled/i.test(String(error)))throw error;})));
  await page.waitForFunction(()=>document.querySelector('.leaflet-container')?.getAttribute('data-tile-status')==='ready');
  await page.waitForTimeout(10_100); // the real loader deadline, not an injected short clock.
  assert.equal(await map.getAttribute('data-tile-status'),'ready','Rapid pending-tile zoom cannot later trip a stale ten-second failure timer');
  assert.equal(await page.getByRole('button',{name:'Retry map',exact:true}).count(),0);
  assert.deepEqual(await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture;return f.requests.map(value=>value.url).filter(url=>!f.expectedURLs.includes(url));}),[],'Every request URL must use its own actual createTile coordinates, including the original zoom');
  await page.evaluate(zoom=>{const m=(window as unknown as{fixture:Probe}).fixture.maps[0];m.setView([9.03,39.7],zoom,{animate:false});},baseZoom);
  await page.waitForFunction(expected=>document.querySelector('.leaflet-container')?.getAttribute('data-tile-status')==='ready'&&document.querySelector('.leaflet-container')?.getAttribute('data-map-zoom')===expected,String(baseZoom));
  const originalCamera=await camera(page);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps.length),1);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.rasterCount()),1);
  assert.deepEqual(await page.evaluate(()=>{const f=(window as unknown as{fixture:Probe}).fixture;return[...f.created].sort().map(url=>({url,revoked:f.revoked.includes(url)}));}),await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.created.map(url=>({url,revoked:true})).sort((a,b)=>a.url.localeCompare(b.url))),'Successful image decode releases every object URL');
  for(const request of await requests(page))assert.deepEqual({cache:request.cache,credentials:request.credentials,referrerPolicy:request.referrerPolicy,method:request.method,mode:request.mode,headers:request.headers},{cache:'default',credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin',method:'GET',mode:'cors',headers:[]});
  assert.ok(referrers.length>0&&referrers.every(value=>value==='http://localhost:41739/'),'Even a private-page no-referrer default is overridden with only the public origin on tile fetches');

  const beforeBlocked=(await requests(page)).length,createdBeforeFailure=await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.created.length);
  mode='blocked';await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.redraw());
  await page.getByRole('status').filter({hasText:'Map background is unavailable.'}).waitFor();
  assert.equal(await map.getAttribute('data-tile-status'),'degraded');
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.rasterCount()),0,'Only raster is removed after a denied but decodable PNG');
  assert.equal(await page.locator('.leaflet-tile-pane img').count(),0,'The provider denial image must never form a collage');
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.created.length),createdBeforeFailure,'HTTP403 never reaches blob decoding');
  assert.deepEqual(await camera(page),originalCamera,'Failure preserves the actual SDK camera');
  await marker.click();assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.selected),[21]);
  const failedRequests=await requests(page),blockedURLs=sortedURLs(failedRequests.slice(beforeBlocked));
  assert.ok(blockedURLs.length>0);
  await page.evaluate(()=>{const m=(window as unknown as{fixture:Probe}).fixture.maps[0];m.panBy([8,0],{animate:false});m.panBy([-8,0],{animate:false});});
  await page.waitForTimeout(320);
  assert.equal((await requests(page)).length,failedRequests.length,'Panning a degraded map cannot restart tile requests');
  const beforeRetryCamera=await camera(page);
  const retry=page.getByRole('button',{name:'Retry map',exact:true});
  assert.ok((await retry.boundingBox())!.height>=48,'Actual Retry control retains its48px target');
  mode='ok';const retryStart=(await requests(page)).length,expectedRetryStart=await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.expectedURLs.length);await retry.click();
  await page.waitForFunction(()=>document.querySelector('.leaflet-container')?.getAttribute('data-tile-status')==='ready');
  await page.waitForFunction(()=>[...document.querySelectorAll<HTMLImageElement>('.leaflet-tile-pane img')].some(image=>image.complete&&image.naturalWidth===256));
  const retryURLs=sortedURLs((await requests(page)).slice(retryStart));
  const expectedRetryURLs=await page.evaluate(start=>[...new Set((window as unknown as{fixture:Probe}).fixture.expectedURLs.slice(start))].sort(),expectedRetryStart);
  assert.deepEqual(retryURLs,expectedRetryURLs,'Explicit retry uses the current grid coordinates without cache busting after marker selection');
  assert.ok(retryURLs.every(url=>tileURL.test(url)),'Retry keeps exact provider tile paths');
  assert.equal(await page.getByRole('button',{name:'Retry map',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps.length),1,'Retry never creates a replacement Map');
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.rasterCount()),1);
  assert.deepEqual(await camera(page),beforeRetryCamera,'Retry preserves the actual camera after deliberate pan');
  await marker.click();assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.selected),[21,21]);

  mode='hold';const pendingStart=(await requests(page)).length,pendingHeld=held.length;await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.redraw());
  await page.waitForFunction(start=>(window as unknown as{fixture:Probe}).fixture.requests.length>start,pendingStart);
  await waitHeld(pendingHeld);
  assert.ok(held.length>0,'Unmount exercises an actual intercepted pending HTTP response');
  const beforeUnmount=await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.created.length);
  await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.unmount());
  assert.ok((await requests(page)).slice(pendingStart).every(request=>request.aborted),'Unmount aborts every owned pending tile fetch');
  // Complete already-intercepted HTTP only after teardown. It must not decode,
  // recreate raster or update a removed React/map instance.
  await Promise.all(held.map(async route=>{await route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'image/svg+xml',body:svg}).catch(error=>{if(!/closed|handled|canceled/i.test(String(error)))throw error;});}));
  await page.waitForTimeout(260);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.created.length),beforeUnmount,'Late completion cannot allocate a stale blob');
  assert.equal(await page.locator('.leaflet-container').count(),0);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.maps[0].listens('moveend')),false);
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Probe}).fixture.errors),0);
  for(const request of await requests(page))assert.deepEqual({cache:request.cache,credentials:request.credentials,referrerPolicy:request.referrerPolicy,method:request.method,mode:request.mode,headers:request.headers},{cache:'default',credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin',method:'GET',mode:'cors',headers:[]},'Retry and teardown requests retain the same compliant transport policy');
  assert.ok(referrers.every(value=>value==='http://localhost:41739/'));
  assert.deepEqual(unexpectedRequests,[],'Every HTTP request is explicitly intercepted before external network');
  assert.deepEqual(errors,[]);
  assert.ok(expected403.length>0,'The planned403PNG actually exercised the browser HTTP failure path');
 }finally{expectedTeardown=true;await browser.close();}
});
