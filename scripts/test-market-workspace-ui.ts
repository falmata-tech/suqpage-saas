import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import {build} from 'esbuild';
import {chromium,type Browser,type BrowserContext,type Page} from 'playwright';
import {expect} from '@playwright/test';
import {emptyMarketWorkspace,serializeMarketWorkspaceSnapshot,type MarketWorkspaceState} from '../lib/market-workspace';
import {normalizeMarketSearch} from '../lib/market-search';

// Actual React, DiscoveryWorkspace, controls, storage and feed hooks. Only router,
// translation, map rendering and HTTP data ports are controlled; not device/API proof.
const KEY='suqpage:market-workspace:v1',RETURN_KEY='suqpage:last-marketplace-url:v1';
const bundle=build({stdin:{loader:'jsx',resolveDir:process.cwd(),contents:`
 import React,{useEffect,useState,Fragment} from 'react';import {createRoot} from 'react-dom/client';
 import Workspace from './components/DiscoveryWorkspace';import {marketWorkspaceFromParams} from './lib/market-workspace';
 const f=window.fixture;
 const replace=history.replaceState.bind(history);history.replaceState=(...args)=>{replace(...args);queueMicrotask(()=>window.dispatchEvent(new Event('fixture-navigation')));};
 f.go=href=>{history.pushState({framework:'fixture-router',entry:++f.entry},'',href);window.dispatchEvent(new Event('fixture-navigation'));};
 f.goSilent=href=>history.pushState({framework:'fixture-router',entry:++f.entry},'',href);
 f.flush=()=>window.dispatchEvent(new Event('fixture-navigation'));
 window.fetch=async(url,options={})=>{f.requests.push(String(url));const business=new URL(String(url),location.href).searchParams.get('scope')==='businesses';if(f.holdBusiness&&business)await new Promise((resolve,reject)=>{f.pendingReads.push(resolve);options.signal?.addEventListener('abort',()=>{f.abortedReads++;if(!f.ignoreAbort)reject(new DOMException('Aborted','AbortError'));},{once:true});});return new Response(JSON.stringify(f.fullData||f.data),{status:business&&f.failBusiness?503:200,headers:{'content-type':'application/json'}});};
 function App(){const[revision,setRevision]=useState(0);useEffect(()=>{const update=()=>setRevision(n=>n+1);window.addEventListener('fixture-navigation',update);window.addEventListener('popstate',update);return()=>{window.removeEventListener('fixture-navigation',update);window.removeEventListener('popstate',update);};},[]);
  const path=location.pathname,state=marketWorkspaceFromParams(new URLSearchParams(location.search)),server=f.serverParams?marketWorkspaceFromParams(new URLSearchParams(f.serverParams)):state;
  return <Fragment><nav><button onClick={()=>f.go('/about')}>Open About</button><button onClick={()=>f.go('/featured')}>Open Featured</button><button onClick={()=>f.go('/')}>Return Market</button><button onClick={()=>history.back()}>Browser Back</button></nav>
   {path==='/'?<Workspace discovery={f.data} productDiscovery={f.data} initialBusiness={server.business} initialProduct={server.product} view={state.mode==='products'?'search':'map'}/>:<section><h1>{path}</h1>{path==='/featured'&&<button onClick={()=>{sessionStorage.setItem('${RETURN_KEY}','/featured?day=2');f.go('/@fixture-shop');}}>Open Featured showroom</button>}</section>}
  </Fragment>;
 }
 createRoot(document.getElementById('root')).render(<App/>);
`},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',plugins:[{name:'market-navigation-ports',setup(b){
 b.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'css'}));
 b.onLoad({filter:/.*/,namespace:'css'},()=>({loader:'js',contents:'export default new Proxy({}, {get:(_,key)=>String(key)});'}));
 b.onResolve({filter:/^(?:next\/(?:navigation|link|image)|next-intl|@\/lib\/i18n\/ui|@\/components\/MarketplaceMap)$/},args=>({path:args.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',resolveDir:process.cwd(),contents:
  args.path==='@/lib/i18n/ui'?`const t=(value,values={})=>value.replace(/\{([^}]+)\}/g,(_,key)=>String(values[key]??'{'+key+'}'));export const useUiText=()=>t;`
  :args.path==='next-intl'?`export const useLocale=()=>'en';`
  :args.path==='next/navigation'?`import {useEffect,useState} from 'react';export const useRouter=()=>({push:href=>window.fixture.go(href),replace:href=>window.fixture.go(href),back:()=>history.back()});export function useSearchParams(){const[value,setValue]=useState(()=>location.search);useEffect(()=>{const update=()=>setValue(location.search);window.addEventListener('fixture-navigation',update);window.addEventListener('popstate',update);return()=>{window.removeEventListener('fixture-navigation',update);window.removeEventListener('popstate',update);};},[]);return new URLSearchParams(value);}`
  :args.path==='next/link'?`export default function Link({href,children,onClick,...props}){return <a {...props} href={href} onClick={event=>{onClick?.(event);event.preventDefault();window.fixture.go(href);}}>{children}</a>;}`
  :args.path==='next/image'?`export default function Image({src,alt,...props}){return <img {...props} src={src} alt={alt}/>;}`
  :`import React,{forwardRef,useEffect,useImperativeHandle} from 'react';export default forwardRef(function Map(p,ref){useImperativeHandle(ref,()=>({centerAt(){},zoomIn(){},zoomOut(){},reset(){}}));useEffect(()=>{if(window.fixture.initialSdkView&&p.showrooms.length)p.onViewChange({center:[9.145,40.4897],zoom:5});},[p.showrooms]);return <div data-fixture-map data-view={JSON.stringify(p.requestedView)} data-fixture-shops={p.showrooms.length}><button onClick={()=>p.onViewChange({center:[1.25,36.75],zoom:11})}>Move fixture map</button><button onClick={()=>p.onViewChange(p.requestedView||{center:[9.03,38.75],zoom:18})}>Commit current fixture map</button></div>;});`}));
 }}]});

type Fixture={go:(href:string)=>void;goSilent:(href:string)=>void;flush:()=>void;writes:Array<{key:string;value:string}>;requests:string[];pendingReads:Array<()=>void>;abortedReads:number;holdBusiness:boolean;failBusiness?:boolean};
let browser:Browser|undefined;
after(async()=>{await browser?.close();});

async function boot(t:{after:(fn:()=>Promise<void>)=>void},options:{url?:string;memory?:string;blocked?:boolean;serverParams?:string;withShops?:boolean;holdBusiness?:boolean;ignoreAbort?:boolean;initialSdkView?:boolean;discoveryMemory?:string}={}){
 const compiled=await bundle;
 browser??=await chromium.launch({headless:true});const context:BrowserContext=await browser.newContext();t.after(()=>context.close());
 const page=await context.newPage(),errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://market.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
 await page.goto('http://market.fixture'+(options.url||'/'));
 await page.evaluate(({key,memory,blocked,serverParams,withShops,holdBusiness,ignoreAbort,initialSdkView,discoveryMemory})=>{
  const data={showrooms:[],nearbyGroups:[],searchBusinesses:[],searchOrder:[],industries:[],places:[],countries:[],total:0,resultCounts:{businesses:0,products:1},resultPage:{page:1,totalPages:1,totalItems:1,firstItem:1,lastItem:1},featuredNowBusinessId:null,
   searchProducts:[{id:101,name:'Fixture cup',description:'A real React fixture product.',categoryName:'Cups',businessHandle:'fixture-shop',businessName:'Fixture Shop',city:'Addis Ababa',region:'Addis Ababa',primaryIndustryKey:'home',imagePath:'',offeringKind:'standard_product',availability:'available'}]};
  const shops=Array.from({length:2},(_,index)=>({id:index+1,handle:'fixture-'+(index+1),name:'Fixture Business '+(index+1),tagline:'Physical products',description:'',logoPath:'',heroImagePath:'',city:'Fixture city',zone:'',region:'',latitude:9.03,longitude:38.75,fallbackStyle:'workshop',sponsored:false,productionScale:'workshop',isLive:false,livePlatform:'',liveUrl:'',primaryIndustryKey:'textiles',primaryIndustryLabel:'Textiles',primaryIndustryShortLabel:'Textiles',locationMode:'storefront'}));
  const f={writes:[] as Array<{key:string;value:string}>,requests:[] as string[],data,fullData:withShops?{...data,showrooms:shops}:null,entry:1,serverParams,holdBusiness:Boolean(holdBusiness),ignoreAbort:Boolean(ignoreAbort),initialSdkView:Boolean(initialSdkView),pendingReads:[],abortedReads:0};(window as unknown as {fixture:unknown}).fixture=f;
  history.replaceState({framework:'fixture-router',entry:1},'',location.href);
  if(memory)sessionStorage.setItem(key,memory);
  if(discoveryMemory)sessionStorage.setItem('suqpage:discovery-navigation:v2',discoveryMemory);
  const write=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){f.writes.push({key,value});return write.call(this,key,value);};
  if(blocked)Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('Storage blocked','SecurityError');}});
 },{key:KEY,memory:options.memory,blocked:options.blocked,serverParams:options.serverParams,withShops:options.withShops,holdBusiness:options.holdBusiness,ignoreAbort:options.ignoreAbort,initialSdkView:options.initialSdkView,discoveryMemory:options.discoveryMemory});
 await page.addScriptTag({content:compiled.outputFiles[0].text});
 await expect(page.getByRole('button',{name:'Products',exact:true})).toBeEnabled();
 return {page,errors};
}
const go=(page:Page,href:string)=>page.evaluate(href=>(window as unknown as {fixture:Fixture}).fixture.go(href),href);
const savedWrites=(page:Page)=>page.evaluate(key=>(window as unknown as {fixture:Fixture}).fixture.writes.filter(write=>write.key===key).map(write=>JSON.parse(write.value).params as string),KEY);
const remembered:MarketWorkspaceState={mode:'products',business:normalizeMarketSearch({q:'Workshop'}),product:normalizeMarketSearch({q:'Cup',country:['ET'],madeToOrder:true})};

test('FE-065 actual web workspace restores before its first write and keeps map/source return separate',async t=>{
 const {page,errors}=await boot(t,{memory:serializeMarketWorkspaceSnapshot(remembered)});
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await expect(page.getByRole('button',{name:'Made to order',exact:true})).toHaveAttribute('aria-pressed','true');
 const writes=await savedWrites(page);assert.ok(writes.length);assert.ok(writes.every(params=>new URLSearchParams(params).get('view')==='search'),'No default-map write precedes restoration');
 await page.getByRole('button',{name:'Businesses',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.requests.some(url=>new URL(url,location.href).searchParams.get('q')==='Workshop'))).toBe(true);await expect(page.locator('.suqpage-loading')).toHaveCount(0);
 await page.getByRole('button',{name:'Move fixture map',exact:true}).click();
 await page.getByRole('button',{name:'Products',exact:true}).click();await page.getByRole('button',{name:'Open Featured',exact:true}).click();
 await page.getByRole('button',{name:'Open Featured showroom',exact:true}).click();
 assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),RETURN_KEY),'/featured?day=2');
 await page.getByRole('button',{name:'Return Market',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await page.getByRole('button',{name:'Businesses',exact:true}).click();await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-view',JSON.stringify({center:[1.25,36.75],zoom:11}));
 assert.deepEqual(errors,[]);
});

test('FE-065 actual web Products survives detail Back and About to bare Market',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search&p.q=Cup&b.q=Workshop'});
 await page.locator('a.discovery-product-link').click();await expect(page).toHaveURL(/\/@fixture-shop\?product=101/);
 await page.getByRole('button',{name:'Browser Back',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await page.getByRole('link',{name:'From Fixture Shop',exact:true}).click();await expect(page.getByRole('heading',{name:'/@fixture-shop',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Browser Back',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await page.getByRole('button',{name:'Open About',exact:true}).click();await page.getByRole('button',{name:'Return Market',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await page.getByRole('button',{name:'Businesses',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');
 await page.getByRole('button',{name:'Open About',exact:true}).click();await page.getByRole('button',{name:'Return Market',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');assert.deepEqual(errors,[]);
});

test('FE-065 reused web route honors explicit URL/history and retains router metadata',async t=>{
 const {page,errors}=await boot(t,{memory:serializeMarketWorkspaceSnapshot(remembered)});
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await go(page,'/?view=map&b.q=Explicit+shop&p.q=Explicit+item');
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Explicit shop');
 assert.equal(await page.evaluate(()=>history.state.framework),'fixture-router');
 await page.getByRole('button',{name:'Products',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Explicit item');
 await go(page,'/?view=map');await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('');
 await page.getByRole('button',{name:'Browser Back',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Explicit item');
 await go(page,'/?q=Legacy');await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Legacy');
 assert.deepEqual(errors,[]);
});

test('FE-065 unavailable or expired browser memory safely opens default Businesses',async t=>{
 for(const options of [{blocked:true},{memory:serializeMarketWorkspaceSnapshot(remembered,1)}]){
  const {page,errors}=await boot(t,options);
  await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('');
  await page.getByRole('button',{name:'Products',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('');
  assert.equal(await page.evaluate(()=>history.state.framework),'fixture-router');assert.deepEqual(errors,[]);
 }
});

test('FE-065 queued router state cannot let local persistence overwrite incoming navigation',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search&p.q=Cup'});
 await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.goSilent('/?view=map&b.q=External&p.q=Preserved'));
 await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('Pending local edit');
 assert.equal(new URL(page.url()).search,'?view=map&b.q=External&p.q=Preserved');
 await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.flush());
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('External');
 await page.getByRole('button',{name:'Products',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Preserved');
 assert.ok((await savedWrites(page)).every(params=>!params.includes('Pending')));assert.deepEqual(errors,[]);
});

test('FE-065 S143 no information overlay and ordinary About return preserve both unsent queries',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map&b.q=Workshop&p.q=Cup'});
 await expect(page.getByRole('heading',{name:'MirtPage Market',exact:true})).toHaveClass('sr-only');
 const businesses=page.getByRole('button',{name:'Businesses',exact:true}),products=page.getByRole('button',{name:'Products',exact:true});
 await expect(businesses).toHaveAttribute('aria-pressed','true');await expect(products).toBeVisible();
 await expect(page.getByRole('button',{name:'About MirtPage',exact:true})).toHaveCount(0);await expect(page.locator('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Open About',exact:true}).click();await expect(page.getByRole('heading',{name:'/about',exact:true})).toBeVisible();await page.getByRole('button',{name:'Return Market',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');await products.click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');await businesses.click();await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');assert.deepEqual(errors,[]);
});

const DISCOVERY_KEY='suqpage:discovery-navigation:v2';
const releaseBusinessReads=(page:Page)=>page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.holdBusiness=false;f.pendingReads.splice(0).forEach(release=>release());});

test('FE-065 S128 cached Addis return fences the initial SDK view until the cleared-scope preview and camera restoration commits',async t=>{
 const discoveryMemory=JSON.stringify({scope:'scope=businesses',activeNearbyGroupKey:'cluster:1-2',selectedShowroomId:1,mapView:{center:[9.03,38.75],zoom:18},updatedAt:Date.now()});
 const {page,errors}=await boot(t,{url:'/?view=map',serverParams:'view=map&b.q=Addis',withShops:true,holdBusiness:true,initialSdkView:true,discoveryMemory});
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','0');
 await page.getByRole('button',{name:'Commit current fixture map',exact:true}).click();
 assert.deepEqual(await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DISCOVERY_KEY),JSON.parse(discoveryMemory),'A pending projection cannot invalidate or overwrite still-unvalidated saved group/selection/camera');
 await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.failBusiness=true);await releaseBusinessReads(page);await expect(page.getByRole('alert')).toContainText('Search is unavailable. Try again.');await expect(page.locator('.suqpage-loading')).toHaveCount(0);
 assert.deepEqual(await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DISCOVERY_KEY),JSON.parse(discoveryMemory),'A failed current read preserves the unvalidated return context for Retry');
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.failBusiness=false;f.holdBusiness=true;});await page.getByRole('button',{name:'Try again',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);await releaseBusinessReads(page);
 const back=page.getByRole('button',{name:'Back to businesses',exact:true});await expect(back).toBeVisible();
 await expect(page.locator('.suqpage-loading')).toHaveCount(0);await expect(page.getByRole('heading',{name:'Fixture Business 1',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Open page',exact:true}).click();await expect(page).toHaveURL(/\/@fixture-1/);
 await page.getByRole('button',{name:'Browser Back',exact:true}).click();await expect(back).toBeVisible();await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 const restored=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DISCOVERY_KEY);assert.equal(restored.activeNearbyGroupKey,'cluster:1-2');assert.equal(restored.selectedShowroomId,1);assert.deepEqual(restored.mapView,{center:[9.03,38.75],zoom:18});assert.deepEqual(errors,[]);
});

test('FE-065 S128 aborting a pending search back to its resolved key clears the loading state',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map&b.q=Addis',serverParams:'view=map&b.q=Addis',holdBusiness:true,ignoreAbort:true,withShops:true});
 const search=page.getByRole('searchbox',{name:'Search businesses',exact:true});await search.fill('Other');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);
 await expect(page.locator('.suqpage-loading')).toHaveCount(1);await search.fill('Addis');await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.abortedReads)).toBe(1);
 await expect(page.locator('.suqpage-loading')).toHaveCount(0);const saved=await page.evaluate(key=>sessionStorage.getItem(key),DISCOVERY_KEY);await releaseBusinessReads(page);await page.waitForTimeout(50);await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','0');assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),DISCOVERY_KEY),saved,'A late aborted response cannot replace the cached projection or write return memory');assert.deepEqual(errors,[]);
});
