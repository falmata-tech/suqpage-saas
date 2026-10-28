import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {after,test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
import {chromium,type Browser,type BrowserContext,type Page} from 'playwright';
import {expect} from '@playwright/test';
import {emptyMarketWorkspace,serializeMarketWorkspaceSnapshot,type MarketWorkspaceState} from '../lib/market-workspace';
import {normalizeMarketSearch} from '../lib/market-search';
import {discoveryLocationLabel} from '../lib/discovery-contract';
import {createUiText,type UiMessages} from '../lib/i18n/core';

// Actual React, DiscoveryWorkspace, controls, storage and feed hooks. Only router,
// translation, map rendering and HTTP data ports are controlled; not device/API proof.
const KEY='suqpage:market-workspace:v1',RETURN_KEY='suqpage:last-marketplace-url:v1';
const compileWorkspace=(realStyles=false,render:'client'|'server'|'hydrate'='client')=>build({stdin:{loader:'jsx',resolveDir:process.cwd(),contents:`
 import React,{useEffect,useState,Fragment,Activity} from 'react';import {${render==='server'?'renderToString':render==='hydrate'?'hydrateRoot':'createRoot'}} from '${render==='server'?'react-dom/server':'react-dom/client'}';
 import Workspace from './components/DiscoveryWorkspace';import {marketWorkspaceFromParams} from './lib/market-workspace';
 import {useBlockedBusinesses} from './components/useBlockedBusinesses';
 const f=window.fixture;
 const replace=history.replaceState.bind(history);history.replaceState=(...args)=>{replace(...args);queueMicrotask(()=>window.dispatchEvent(new Event('fixture-navigation')));};
 f.go=href=>{history.pushState({framework:'fixture-router',entry:++f.entry},'',href);window.dispatchEvent(new Event('fixture-navigation'));};
 f.goSilent=href=>history.pushState({framework:'fixture-router',entry:++f.entry},'',href);
 f.flush=()=>window.dispatchEvent(new Event('fixture-navigation'));
 window.fetch=async(url,options={})=>{
  f.requests.push(String(url));const parsed=new URL(String(url),location.href);
  if(parsed.pathname==='/api/catalog/preferences'){
   f.excluded=JSON.parse(options.body).blockedIds;return Response.json({ok:true});
  }
  const business=parsed.searchParams.get('scope')==='businesses',page=Number(parsed.searchParams.get('page')||1);
  const source=(!business&&page===2&&f.pageTwo)||(!business&&f.nextProducts)||f.fullData||f.data;
  // Capture server authority when the request starts, before a controlled delay.
  // Ignoring AbortSignal must still never let an old exclusion response win.
  const excluded=[...f.excluded];let data=structuredClone(source);
  if(f.enforceExclusions){
   data={...data,showrooms:data.showrooms.filter(v=>!excluded.includes(v.id)),searchProducts:data.searchProducts.filter(v=>!excluded.includes(v.businessId))};
   if(!data.searchProducts.length)data.resultPage={page:1,totalPages:1,totalItems:0,firstItem:0,lastItem:0};
  }
  f.reads.push({scope:business?'businesses':'products',page,excluded});
  if((f.holdBusiness&&business)||(f.holdProducts&&!business))await new Promise((resolve,reject)=>{(business?f.pendingReads:f.pendingProductReads).push(resolve);options.signal?.addEventListener('abort',()=>{f.abortedReads++;if(!f.ignoreAbort)reject(new DOMException('Aborted','AbortError'));},{once:true});});
  return new Response(JSON.stringify(data),{status:(business&&f.failBusiness)||(!business&&f.failProducts)?503:200,headers:{'content-type':'application/json'}});
 };
 function App(){const[revision,setRevision]=useState(0),[preferencesReady,setPreferencesReady]=useState(!f.deferWorkspace),preferences=useBlockedBusinesses();
  f.saveExclusions=ids=>preferences.save(ids.map(id=>({id,handle:'fixture-'+id,name:'Fixture Business '+id})));
  useEffect(()=>{setPreferencesReady(true);},[]);
  useEffect(()=>{const update=()=>setRevision(n=>n+1);window.addEventListener('fixture-navigation',update);window.addEventListener('popstate',update);return()=>{window.removeEventListener('fixture-navigation',update);window.removeEventListener('popstate',update);};},[]);
  const path=location.pathname,state=marketWorkspaceFromParams(new URLSearchParams(location.search)),server=f.serverParams?marketWorkspaceFromParams(new URLSearchParams(f.serverParams)):state;
  return <Fragment><nav><button onClick={()=>f.go('/about')}>Open About</button><button onClick={()=>f.go('/featured')}>Open Featured</button><button onClick={()=>f.go('/')}>Return Market</button><button onClick={()=>history.back()}>Browser Back</button></nav>
   {path==='/'?preferencesReady&&<Activity mode={f.hidden?'hidden':'visible'}><Workspace discovery={f.data} productDiscovery={f.data} initialExclusions={f.initialExclusions??undefined} initialBusiness={server.business} initialProduct={server.product} view={state.mode==='products'?'search':'map'}/></Activity>:<section><h1>{path}</h1>{path==='/featured'&&<button onClick={()=>{sessionStorage.setItem('${RETURN_KEY}','/featured?day=2');f.go('/@fixture-shop');}}>Open Featured showroom</button>}</section>}
  </Fragment>;
 }
 ${render==='server'?'export const renderWorkspace=()=>renderToString(<App/>);':render==='hydrate'?"hydrateRoot(document.getElementById('root'),<App/>,{onRecoverableError:error=>window.fixture.hydrationErrors.push(error.message)});":"createRoot(document.getElementById('root')).render(<App/>);"}
`},bundle:true,write:false,outfile:'workspace.js',format:render==='server'?'cjs':'iife',platform:render==='server'?'node':'browser',external:render==='server'?['react','react-dom/server']:[],jsx:'automatic',loader:{'.module.css':'local-css'},plugins:[{name:'market-navigation-ports',setup(b){
 if(!realStyles)b.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'css'}));
 b.onLoad({filter:/.*/,namespace:'css'},()=>({loader:'js',contents:'export default new Proxy({}, {get:(_,key)=>String(key)});'}));
 b.onResolve({filter:/^(?:next\/(?:navigation|link|image)|next-intl|@\/lib\/i18n\/ui|@\/components\/MarketplaceMap)$/},args=>({path:args.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',resolveDir:process.cwd(),contents:
  args.path==='@/lib/i18n/ui'?`import {createUiText} from './lib/i18n/core';const t=createUiText(window.fixture.messages);export const useUiText=()=>t;`
  :args.path==='next-intl'?`export const useLocale=()=>window.fixture.locale;`
  :args.path==='next/navigation'?`import {useEffect,useState} from 'react';export const useRouter=()=>({push:href=>window.fixture.go(href),replace:href=>window.fixture.go(href),back:()=>history.back()});export function useSearchParams(){const[value,setValue]=useState(()=>location.search);useEffect(()=>{const update=()=>setValue(location.search);window.addEventListener('fixture-navigation',update);window.addEventListener('popstate',update);return()=>{window.removeEventListener('fixture-navigation',update);window.removeEventListener('popstate',update);};},[]);return new URLSearchParams(value);}`
  :args.path==='next/link'?`export default function Link({href,children,onClick,...props}){return <a {...props} href={href} onClick={event=>{onClick?.(event);event.preventDefault();window.fixture.go(href);}}>{children}</a>;}`
  :args.path==='next/image'?`export default function Image({src,alt,...props}){return <img {...props} src={src} alt={alt}/>;}`
  :`import React,{forwardRef,useEffect,useImperativeHandle} from 'react';export default forwardRef(function Map(p,ref){useImperativeHandle(ref,()=>({centerAt(){},zoomIn(){},zoomOut(){},reset(){}}));useEffect(()=>{if(window.fixture.initialSdkView&&p.showrooms.length)p.onViewChange({center:[9.145,40.4897],zoom:5});},[p.showrooms]);useEffect(()=>{window.fixture.currentSelect=()=>p.showrooms[0]&&p.onSelectShowroom(p.showrooms[0]);window.fixture.currentOpenGroup=()=>p.onOpenNearbyGroup({key:'cluster:1-2'});});return <div data-fixture-map data-view={JSON.stringify(p.requestedView)} data-fixture-shops={p.showrooms.length}><button onClick={()=>p.onViewChange({center:[1.25,36.75],zoom:11})}>Move fixture map</button><button onClick={()=>p.onViewChange(p.requestedView||{center:[9.03,38.75],zoom:18})}>Commit current fixture map</button></div>;});`}));
 }}]});
const bundle=compileWorkspace();
let styledBundle:ReturnType<typeof compileWorkspace>|undefined;
let serverBundle:ReturnType<typeof compileWorkspace>|undefined,hydrationBundle:ReturnType<typeof compileWorkspace>|undefined;

type Fixture={go:(href:string)=>void;goSilent:(href:string)=>void;flush:()=>void;writes:Array<{key:string;value:string}>;requests:string[];reads:Array<{scope:string;page:number;excluded:number[]}>;saveExclusions:(ids:number[])=>Promise<void>;currentSelect:()=>void;currentOpenGroup:()=>void;staleSelect:()=>void;staleOpenGroup:()=>void;pendingReads:Array<()=>void>;abortedReads:number;holdBusiness:boolean;holdProducts?:boolean;pendingProductReads:Array<()=>void>;failBusiness?:boolean;failProducts?:boolean};
let browser:Browser|undefined;
after(async()=>{await browser?.close();});

async function boot(t:{after:(fn:()=>Promise<void>)=>void},options:{url?:string;memory?:string;blocked?:boolean;serverParams?:string;withShops?:boolean;holdBusiness?:boolean;holdProducts?:boolean;ignoreAbort?:boolean;initialSdkView?:boolean;discoveryMemory?:string;seedShops?:boolean;excluded?:number[];initialExclusions?:number[]|null;enforceExclusions?:boolean;productPages?:boolean;deferWorkspace?:boolean;realStyles?:boolean;width?:number;hydrate?:boolean;filterChoices?:boolean;locale?:'en'|'am'|'om'}={}){
 const compiled=await(options.hydrate?(hydrationBundle??=compileWorkspace(false,'hydrate')):options.realStyles?(styledBundle??=compileWorkspace(true)):bundle);
 browser??=await chromium.launch({channel:'chrome',headless:true});const context:BrowserContext=await browser.newContext({viewport:{width:options.width||1280,height:900}});t.after(()=>context.close());
 const page=await context.newPage(),errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://market.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
 await page.goto('http://market.fixture'+(options.url||'/'));
 const locale=options.locale||'en',messages:UiMessages=locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8'));
 const text=createUiText(messages);
 await page.evaluate(({key,memory,blocked,serverParams,withShops,holdBusiness,holdProducts,ignoreAbort,initialSdkView,discoveryMemory,seedShops,excluded=[],initialExclusions=[],enforceExclusions=false,productPages=false,deferWorkspace=false,filterChoices=false,locale,messages})=>{
  const data={showrooms:[],nearbyGroups:[],searchBusinesses:[],searchOrder:[],industries:filterChoices?[{key:'textiles',shortLabel:'Textiles'},{key:'home',shortLabel:'Furniture'}]:[],places:filterChoices?[{key:'ET:addis',city:'Addis Ababa',countryCode:'ET'},{key:'KE:nairobi',city:'Nairobi',countryCode:'KE'}]:[],countries:filterChoices?[{code:'ET'},{code:'KE'}]:[],total:0,resultCounts:{businesses:0,products:1},resultPage:{page:1,totalPages:1,totalItems:1,firstItem:1,lastItem:1},featuredNowBusinessId:null,
   searchProducts:[{id:101,businessId:1,name:'Fixture cup',description:'A real React fixture product.',categoryName:'Cups',businessHandle:'fixture-shop',businessName:'Fixture Shop',city:'Addis Ababa',region:'Addis Ababa',primaryIndustryKey:'home',imagePath:'',offeringKind:'standard_product',availability:'available'}]};
  const shops=Array.from({length:2},(_,index)=>({id:index+1,handle:'fixture-'+(index+1),name:'Fixture Business '+(index+1),tagline:'Physical products',description:'',logoPath:'',heroImagePath:'',city:'Fixture city',zone:'',region:'',latitude:9.03,longitude:38.75,fallbackStyle:'workshop',sponsored:false,productionScale:'workshop',isLive:false,livePlatform:'',liveUrl:'',primaryIndustryKey:'textiles',primaryIndustryLabel:'Textiles',primaryIndustryShortLabel:'Textiles',locationMode:'storefront'}));
  if(productPages)data.resultPage={page:1,totalPages:2,totalItems:2,firstItem:1,lastItem:1};
  const initialData=seedShops?{...data,showrooms:shops}:data;
  const f={writes:[] as Array<{key:string;value:string}>,requests:[] as string[],reads:[],hydrationErrors:[] as string[],locale,messages,data:initialExclusions?.length?{...initialData,showrooms:initialData.showrooms.filter(v=>!initialExclusions.includes(v.id)),searchProducts:initialData.searchProducts.filter(v=>!initialExclusions.includes(v.businessId))}:initialData,fullData:withShops?{...data,showrooms:shops}:null,pageTwo:productPages?{...data,resultPage:{page:2,totalPages:2,totalItems:2,firstItem:2,lastItem:2},searchProducts:[{...data.searchProducts[0],id:102,name:'Old page cup'}]}:null,excluded,initialExclusions,enforceExclusions,deferWorkspace,entry:1,serverParams,holdBusiness:Boolean(holdBusiness),holdProducts:Boolean(holdProducts),ignoreAbort:Boolean(ignoreAbort),initialSdkView:Boolean(initialSdkView),pendingReads:[],pendingProductReads:[],abortedReads:0};(window as unknown as {fixture:unknown}).fixture=f;
  localStorage.setItem('suqpage-blocked-businesses-v1',JSON.stringify(excluded.map(id=>({id,handle:'fixture-'+id,name:'Fixture Business '+id}))));
  history.replaceState({framework:'fixture-router',entry:1},'',location.href);
  if(memory)sessionStorage.setItem(key,memory);
  if(discoveryMemory)sessionStorage.setItem('suqpage:discovery-navigation:v2',discoveryMemory);
  const write=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){f.writes.push({key,value});return write.call(this,key,value);};
  if(blocked)Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('Storage blocked','SecurityError');}});
 },{key:KEY,memory:options.memory,blocked:options.blocked,serverParams:options.serverParams,withShops:options.withShops,holdBusiness:options.holdBusiness,holdProducts:options.holdProducts,ignoreAbort:options.ignoreAbort,initialSdkView:options.initialSdkView,discoveryMemory:options.discoveryMemory,seedShops:options.seedShops,excluded:options.excluded,initialExclusions:options.initialExclusions,enforceExclusions:options.enforceExclusions,productPages:options.productPages,deferWorkspace:options.deferWorkspace,filterChoices:options.filterChoices,locale,messages});
 if(options.realStyles){
  for(const file of ['app/globals.css','app/landing.css','app/discovery.css'])await page.addStyleTag({content:fs.readFileSync(file,'utf8')});
  await page.addStyleTag({content:compiled.outputFiles.find(file=>file.path.endsWith('.css'))!.text});
  await page.addStyleTag({content:'#root>nav{display:none}#root{height:900px}'});
 }
 const hydrate=async()=>{await page.addScriptTag({content:compiled.outputFiles.find(file=>file.path.endsWith('.js'))!.text});};
 if(options.hydrate){
  const server=await(serverBundle??=compileWorkspace(false,'server')),fixture=await page.evaluate(()=>(window as unknown as{fixture:unknown}).fixture);
  const module={exports:{} as {renderWorkspace:()=>string}},location=new URL(page.url());
  // Only navigation/HTTP/map ports are controlled. The Node server renderer and
  // browser hydrator execute the same real React workspace and search controls.
  vm.runInNewContext(server.outputFiles.find(file=>file.path.endsWith('.js'))!.text,{module,exports:module.exports,require:createRequire(import.meta.url),console,URL,URLSearchParams,window:{fixture},location,history:{replaceState(){},pushState(){},back(){}}});
  await page.locator('#root').evaluate((element,html)=>{element.innerHTML=html;},module.exports.renderWorkspace());
 }else{
  await hydrate();await expect(page.getByRole('button',{name:text('Product listings'),exact:true})).toBeEnabled();
 }
 return {page,errors,hydrate};
}
const go=(page:Page,href:string)=>page.evaluate(href=>(window as unknown as {fixture:Fixture}).fixture.go(href),href);
const savedWrites=(page:Page)=>page.evaluate(key=>(window as unknown as {fixture:Fixture}).fixture.writes.filter(write=>write.key===key).map(write=>JSON.parse(write.value).params as string),KEY);
const remembered:MarketWorkspaceState={mode:'products',business:normalizeMarketSearch({q:'Workshop'}),product:normalizeMarketSearch({q:'Cup',country:['ET'],madeToOrder:true})};

for(const width of[1440,390])test(`FE-042 S25 / FE-065 server controls wait for restoration and preserve first editable typing at ${width}px`,async t=>{
 const {page,errors,hydrate}=await boot(t,{url:'/?view=search&p.q=Server+cup&p.category=beauty-wellness',width,hydrate:true});
 const input=page.getByRole('searchbox',{name:'Search products',exact:true});
 await expect(input).toBeDisabled();
 for(const name of['Clear search','Clear all',/^Category\s*1$/,'Country','City','Made to order'])await expect(page.getByRole('button',{name,exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'Product listings',exact:true})).toBeDisabled();
 assert.equal(await input.inputValue(),'Server cup');
 await hydrate();
 // fill waits only for actual editability, with no separate readiness delay.
 await input.fill('First editable cup');
 await expect(input).toHaveValue('First editable cup');
 await expect(page).toHaveURL(url=>url.searchParams.get('p.q')==='First editable cup');
 assert.deepEqual(new URL(page.url()).searchParams.getAll('p.category'),['beauty-wellness']);
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.requests.some(url=>{const params=new URL(url,location.href).searchParams;return params.get('scope')==='products'&&params.get('q')==='First editable cup'&&params.getAll('category').join(',')==='beauty-wellness';}))).toBe(true);
 await expect(page.getByRole('button',{name:/^Category\s*1$/,exact:true})).toBeEnabled();
 await expect(page.getByRole('button',{name:'City',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'Product listings',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Clear search',exact:true}).click();await expect(input).toHaveValue('');
 await expect(page).toHaveURL(url=>!url.searchParams.has('p.q')&&url.searchParams.get('p.category')==='beauty-wellness');
 assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:{hydrationErrors:string[]}}).fixture.hydrationErrors),[]);
 assert.deepEqual(errors,[]);
});

for(const locale of['en','am','om'] as const)for(const width of[320,390])test(`FE-065 S180 selected phone filter words and counts fit ${locale} at ${width}px`,async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search&p.category=beauty-wellness',realStyles:true,width,locale});
 const text=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
 await page.getByRole('button',{name:text('Filters, {count} selected',{count:1}),exact:true}).click();
 const filters=page.locator('[data-filter-menu]'),buttons=filters.locator(':scope>button');
 await expect(buttons).toHaveCount(4);
 for(const [index,label] of['Category','Country','City','Made to order'].entries())await expect(buttons.nth(index).locator('span')).toHaveText(text(label));
 await expect(buttons.first().locator('b')).toHaveText('1');
 const geometry=await buttons.evaluateAll(elements=>elements.map(element=>{
  const span=element.querySelector('span')!,node=span.firstChild!,label=span.textContent!,rect=element.getBoundingClientRect(),labelRect=span.getBoundingClientRect(),badge=element.querySelector('b')?.getBoundingClientRect();
  const words=Array.from(label.matchAll(/\S+/gu),match=>{const range=document.createRange();range.setStart(node,match.index!);range.setEnd(node,match.index!+match[0].length);return{word:match[0],lines:new Set(Array.from(range.getClientRects(),r=>Math.round(r.top))).size};});
  return{label,words,height:rect.height,left:rect.left,right:rect.right,fontSize:parseFloat(getComputedStyle(element).fontSize),fits:element.scrollWidth<=element.clientWidth+1,labelFits:labelRect.left>=rect.left&&labelRect.right<=rect.right,badgeFits:!badge||badge.left>=labelRect.right&&badge.right<=rect.right};
 }));
 for(const item of geometry){
  assert.ok(item.height>=44&&item.fontSize>=13,JSON.stringify(item));
  assert.ok(item.left>=0&&item.right<=width&&item.fits&&item.labelFits&&item.badgeFits,JSON.stringify(item));
  for(const word of item.words)assert.equal(word.lines,1,JSON.stringify(item));
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
});

for(const width of[320,390])test(`FE-065 S181 compact filters keep one dialog, country prerequisites, scope and focus at ${width}px`,async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map&b.q=Wood&p.q=Cup',realStyles:true,width,filterChoices:true});
 const trigger=(scope:string)=>page.locator(`[data-search-scope="${scope}"]>button`),dialog=page.getByRole('dialog');
 await expect(trigger('businesses')).toHaveAttribute('aria-label','Filters, 0 selected');
 await expect(page.getByRole('button',{name:'Category',exact:true})).toBeHidden();
 await trigger('businesses').click();await expect(dialog).toHaveCount(1);
 await dialog.evaluate(element=>element.addEventListener('close',()=>element.setAttribute('data-observed-close','true')));
 await expect(dialog.getByRole('button',{name:'City',exact:true})).toBeDisabled();
 await expect(dialog.getByRole('button',{name:'Made to order',exact:true})).toHaveCount(0);
 await dialog.getByRole('button',{name:'Category',exact:true}).click();
 await expect(dialog.getByRole('heading',{name:'Categories',exact:true})).toBeVisible();
 await dialog.getByRole('checkbox',{name:'Textiles',exact:true}).check();
 await page.getByRole('button',{name:'Back to filters',exact:true}).click();
 await dialog.locator('[data-filter-menu]>button').nth(1).click();
 await dialog.getByRole('checkbox').nth(0).check();
 await page.getByRole('button',{name:'Back to filters',exact:true}).click();
 await expect(dialog.getByRole('button',{name:'City',exact:true})).toBeEnabled();
 await dialog.getByRole('button',{name:'City',exact:true}).click();await dialog.getByRole('checkbox').first().check();
 await page.getByRole('button',{name:'Back to filters',exact:true}).click();
 await expect(dialog).not.toHaveAttribute('data-observed-close','true');
 await expect(trigger('businesses')).toHaveAttribute('aria-label','Filters, 3 selected');
 await dialog.locator('[data-filter-menu]>button').nth(1).click();
 await dialog.getByRole('checkbox').nth(0).uncheck();await dialog.getByRole('checkbox').nth(1).check();
 await expect(page).toHaveURL(url=>url.searchParams.getAll('b.country').join(',')==='KE'&&!url.searchParams.has('b.city'));
 await expect(trigger('businesses')).toHaveAttribute('aria-label','Filters, 2 selected');
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger('businesses')).toBeFocused();
 await page.getByRole('button',{name:'Product listings',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await expect(trigger('products')).toHaveAttribute('aria-label','Filters, 0 selected');
 await trigger('products').click();await dialog.getByRole('button',{name:'Made to order',exact:true}).click();
 await expect(trigger('products')).toHaveAttribute('aria-label','Filters, 1 selected');
 await dialog.getByRole('button',{name:'Clear all',exact:true}).click();
 await expect(trigger('products')).toHaveAttribute('aria-label','Filters, 0 selected');
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('');
 await expect(page).toHaveURL(url=>url.searchParams.get('b.q')==='Wood'&&url.searchParams.get('b.category')==='textiles'&&url.searchParams.get('b.country')==='KE'&&!url.searchParams.has('p.q')&&!url.searchParams.has('p.madeToOrder'));
 await dialog.getByRole('button',{name:'Done',exact:true}).click();await expect(trigger('products')).toBeFocused();
 await page.getByRole('button',{name:'Business locations',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Wood');
 await expect(trigger('businesses')).toHaveAttribute('aria-label','Filters, 2 selected');
 assert.deepEqual(errors,[]);
});

for(const width of[320,390])test(`FE-065 S181 phone drawer uses full-width travel and retains saved camera on drag return at ${width}px`,async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map',realStyles:true,width,withShops:true,seedShops:true});
 const viewport=page.locator('[data-dragging]'),panel=page.locator('#discovery-search-panel'),map=page.locator('.discovery-map-shell');
 await page.getByRole('button',{name:'Move fixture map',exact:true}).click();
 const savedView=()=>page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)||'null')?.mapView,DISCOVERY_KEY);
 const expectedView={center:[1.25,36.75],zoom:11};await expect.poll(savedView).toEqual(expectedView);
 const mountedMap=await page.locator('[data-fixture-map]').elementHandle();assert.ok(mountedMap);
 const bounds=await viewport.boundingBox();assert.ok(bounds);
 assert.ok(Math.abs((await map.boundingBox())!.width-bounds.width)<=1);
 const handle=await page.getByRole('button',{name:'View products',exact:true}).boundingBox();assert.ok(handle);
 await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();
 await page.mouse.move(handle.x+handle.width/2-bounds.width*.4,handle.y+handle.height/2,{steps:6});
 const travel=await panel.evaluate(element=>new DOMMatrix(getComputedStyle(element).transform).m41);
 assert.ok(Math.abs(travel-bounds.width*.6)<=1,JSON.stringify({travel,width:bounds.width}));
 await page.mouse.up();await expect(page.getByRole('button',{name:'Product listings',exact:true})).toHaveAttribute('aria-pressed','true');
 assert.ok(Math.abs((await panel.boundingBox())!.width-bounds.width)<=1);
 const back=await page.getByRole('button',{name:'Map only',exact:true}).boundingBox();assert.ok(back);
 await page.mouse.move(back.x+back.width/2,back.y+back.height/2);await page.mouse.down();
 await page.mouse.move(back.x+back.width/2+bounds.width*.7,back.y+back.height/2,{steps:6});await page.mouse.up();
 await expect(page.getByRole('button',{name:'Business locations',exact:true})).toHaveAttribute('aria-pressed','true');
 assert.deepEqual(await savedView(),expectedView);assert.equal(await mountedMap.evaluate(element=>element.isConnected),true);
 assert.ok(Math.abs((await map.boundingBox())!.width-bounds.width)<=1);assert.deepEqual(errors,[]);
});

test('FE-065 S181 closing a compact filter after widening restores a visible filter control',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map',realStyles:true,width:390});
 await page.getByRole('button',{name:'Filters, 0 selected',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.setViewportSize({width:1440,height:900});await page.getByRole('dialog').getByRole('button',{name:'Done',exact:true}).click();
 await expect(page.getByRole('button',{name:'Category',exact:true})).toBeFocused();assert.deepEqual(errors,[]);
});

test('FE-065 S153 location text keeps literal city/legacy fallback and removes only equivalent labels',()=>{
 const label=discoveryLocationLabel;
 assert.equal(label([' Addis Ababa ','addis ababa','ADDIS ABABA']),'Addis Ababa');
 assert.equal(label(['Bahir Dar',' Bahir Dar ','Amhara']),'Bahir Dar · Amhara');
 assert.equal(label(['','Oromia']),'Oromia');assert.equal(label([' ','']),'');
 assert.equal(label(['Adama','Oromia']),'Adama · Oromia');
 assert.equal(label(['Café','Cafe\u0301','North']),'Café · North');
 assert.equal(label(['Addis Ababa','Addis Ababa urban']),'Addis Ababa · Addis Ababa urban');
 assert.equal(label(['München','Munich']),'München · Munich','Do not infer aliases, countries or other geographic identity');
});

test('FE-065 S153 actual map preview deduplicates literal city and region',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map',withShops:true});
 await page.evaluate(()=>{const f=(window as unknown as{fixture:{fullData:{showrooms:Array<{city:string;region:string}>}}}).fixture;Object.assign(f.fullData.showrooms[0],{city:'Addis Ababa',region:'addis ababa'});});
 await page.getByRole('searchbox',{name:'Search businesses',exact:true}).fill('Addis');
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.currentSelect());
 await expect(page.locator('.discovery-preview-copy small')).toHaveText('Addis Ababa');assert.deepEqual(errors,[]);
});

for(const width of[1440,390])test(`FE-065 S153 actual product category and city are visible with production CSS at ${width}px`,async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search',realStyles:true,width});
 const card=page.locator('.discovery-product-card').first(),group=card.locator('.discovery-product-result-copy small'),location=card.locator('.discovery-product-result-copy em');
 await expect(group).toHaveText('Cups');await expect(location).toContainText('Addis Ababa');
 for(const field of[group,location]){
  await expect(field).toBeVisible();
  const geometry=await field.evaluate(element=>{const r=element.getBoundingClientRect(),style=getComputedStyle(element);return{display:style.display,width:r.width,height:r.height,right:r.right,fontSize:parseFloat(style.fontSize)};});
  assert.notEqual(geometry.display,'none');assert.ok(geometry.width>0&&geometry.height>=12,JSON.stringify(geometry));assert.ok(geometry.fontSize>=11,JSON.stringify(geometry));assert.ok(geometry.right<=width,JSON.stringify(geometry));
 }
 await expect(location).toHaveText('Addis Ababa');
 await expect(card.locator('.discovery-product-result-copy p')).toBeVisible();await expect(card.getByRole('link',{name:'From Fixture Shop',exact:true})).toBeVisible();
 // Authored long labels must remain readable, without pushing the card wider.
 await page.evaluate(()=>{const f=(window as unknown as{fixture:{data:{searchProducts:Array<{categoryName:string;city:string;region:string}>}}}).fixture;Object.assign(f.data.searchProducts[0],{categoryName:'LongUnbrokenMerchantCollectionName'.repeat(3),city:'LongUnbrokenMerchantCityName'.repeat(3),region:''});});
 await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('Long');await expect(group).toContainText('LongUnbrokenMerchantCollectionName');
 for(const field of[group,location]){const bounds=await field.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));assert.ok(bounds.scroll<=bounds.width+1,JSON.stringify(bounds));}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
});

test('FE-065 S157 empty exact-pin map offers a one-tap path to product listings at phone width',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map&b.q=No+mapped+shops&p.q=Cup',realStyles:true,width:390});
 await expect(page.getByText('No businesses with public map locations match these filters.',{exact:true})).toBeVisible();
 const next=page.getByRole('button',{name:'Browse product listings',exact:true});await expect(next).toBeVisible();
 const bounds=await next.evaluate(element=>{const rect=element.getBoundingClientRect();return{height:rect.height,right:rect.right,viewport:innerWidth};});
 assert.ok(bounds.height>=44,JSON.stringify(bounds));assert.ok(bounds.right<=bounds.viewport,JSON.stringify(bounds));
 await next.click();
 await expect(page.getByRole('button',{name:'Product listings',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 assert.deepEqual(errors,[]);
});

test('FE-065 actual web workspace restores before its first write and keeps map/source return separate',async t=>{
 const {page,errors}=await boot(t,{memory:serializeMarketWorkspaceSnapshot(remembered)});
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await expect(page.getByRole('button',{name:'Made to order',exact:true})).toHaveAttribute('aria-pressed','true');
 const writes=await savedWrites(page);assert.ok(writes.length);assert.ok(writes.every(params=>new URLSearchParams(params).get('view')==='search'),'No default-map write precedes restoration');
 await page.getByRole('button',{name:'Business locations',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.requests.some(url=>new URL(url,location.href).searchParams.get('q')==='Workshop'))).toBe(true);await expect(page.locator('.africmade-loading')).toHaveCount(0);
 await page.getByRole('button',{name:'Move fixture map',exact:true}).click();
 await page.getByRole('button',{name:'Product listings',exact:true}).click();await page.getByRole('button',{name:'Open Featured',exact:true}).click();
 await page.getByRole('button',{name:'Open Featured showroom',exact:true}).click();
 assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),RETURN_KEY),'/featured?day=2');
 await page.getByRole('button',{name:'Return Market',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await page.getByRole('button',{name:'Business locations',exact:true}).click();await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-view',JSON.stringify({center:[1.25,36.75],zoom:11}));
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
 await page.getByRole('button',{name:'Business locations',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');
 await page.getByRole('button',{name:'Open About',exact:true}).click();await page.getByRole('button',{name:'Return Market',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Workshop');assert.deepEqual(errors,[]);
});

test('FE-065 reused web route honors explicit URL/history and retains router metadata',async t=>{
 const {page,errors}=await boot(t,{memory:serializeMarketWorkspaceSnapshot(remembered)});
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await go(page,'/?view=map&b.q=Explicit+shop&p.q=Explicit+item');
 await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('Explicit shop');
 assert.equal(await page.evaluate(()=>history.state.framework),'fixture-router');
 await page.getByRole('button',{name:'Product listings',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Explicit item');
 await go(page,'/?view=map');await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('');
 await page.getByRole('button',{name:'Browser Back',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Explicit item');
 await go(page,'/?q=Legacy');await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Legacy');
 assert.deepEqual(errors,[]);
});

test('FE-065 unavailable or expired browser memory safely opens default Businesses',async t=>{
 for(const options of [{blocked:true},{memory:serializeMarketWorkspaceSnapshot(remembered,1)}]){
  const {page,errors}=await boot(t,options);
  await expect(page.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveValue('');
  await page.getByRole('button',{name:'Product listings',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('');
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
 await page.getByRole('button',{name:'Product listings',exact:true}).click();
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Preserved');
 assert.ok((await savedWrites(page)).every(params=>!params.includes('Pending')));assert.deepEqual(errors,[]);
});

test('FE-065 S143 no information overlay and ordinary About return preserve both unsent queries',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map&b.q=Workshop&p.q=Cup'});
 await expect(page.getByRole('heading',{name:'AfricMade Market',exact:true})).toHaveClass('sr-only');
 const businesses=page.getByRole('button',{name:'Business locations',exact:true}),products=page.getByRole('button',{name:'Product listings',exact:true});
 await expect(businesses).toHaveAttribute('aria-pressed','true');await expect(products).toBeVisible();
 await expect(page.getByRole('button',{name:'About AfricMade',exact:true})).toHaveCount(0);await expect(page.locator('dialog')).toHaveCount(0);
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
 await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.failBusiness=true);await releaseBusinessReads(page);await expect(page.getByRole('alert')).toContainText('Search is unavailable. Try again.');await expect(page.locator('.africmade-loading')).toHaveCount(0);
 assert.deepEqual(await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DISCOVERY_KEY),JSON.parse(discoveryMemory),'A failed current read preserves the unvalidated return context for Retry');
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.failBusiness=false;f.holdBusiness=true;});await page.getByRole('button',{name:'Try again',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);await releaseBusinessReads(page);
 const back=page.getByRole('button',{name:'Back to businesses',exact:true});await expect(back).toBeVisible();
 await expect(page.locator('.africmade-loading')).toHaveCount(0);await expect(page.getByRole('heading',{name:'Fixture Business 1',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Open page',exact:true}).click();await expect(page).toHaveURL(/\/@fixture-1/);
 await page.getByRole('button',{name:'Browser Back',exact:true}).click();await expect(back).toBeVisible();await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 const restored=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DISCOVERY_KEY);assert.equal(restored.activeNearbyGroupKey,'cluster:1-2');assert.equal(restored.selectedShowroomId,1);assert.deepEqual(restored.mapView,{center:[9.03,38.75],zoom:18});assert.deepEqual(errors,[]);
});

test('FE-065 S128 aborting a pending search back to its resolved key clears the loading state',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map&b.q=Addis',serverParams:'view=map&b.q=Addis',holdBusiness:true,ignoreAbort:true,withShops:true});
 const search=page.getByRole('searchbox',{name:'Search businesses',exact:true});await search.fill('Other');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);
 await expect(page.getByRole('status').filter({hasText:'Updating Market results'})).toHaveCount(1);await search.fill('Addis');await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.abortedReads)).toBe(1);
 await expect(page.locator('.africmade-loading')).toHaveCount(0);const saved=await page.evaluate(key=>sessionStorage.getItem(key),DISCOVERY_KEY);await releaseBusinessReads(page);await page.waitForTimeout(50);await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','0');assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),DISCOVERY_KEY),saved,'A late aborted response cannot replace the cached projection or write return memory');assert.deepEqual(errors,[]);
});

test('FE-074 web product updates retain canonical cards and scroll until a matching snapshot settles',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search'});
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 await page.evaluate(()=>{
  const f=(window as unknown as{fixture:Fixture&{scrolls:number;nextProducts:unknown;data:{searchProducts:Array<Record<string,unknown>>}}}).fixture;
  f.holdProducts=true;f.scrolls=0;
  const scroll=Element.prototype.scrollTo;Element.prototype.scrollTo=function(options?:ScrollToOptions|number,y?:number){if(this.classList.contains('discovery-search-results'))f.scrolls++;Reflect.apply(scroll,this,typeof options==='number'?[options,y??0]:[options]);};
  f.nextProducts={...f.data,searchProducts:[{...f.data.searchProducts[0],id:202,name:'Matched new product'}]};
 });
 await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('New collection');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingProductReads.length)).toBe(1);
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 await expect(page.locator('.discovery-product-link')).toHaveAttribute('href',/@fixture-shop\?product=101/);
 await expect(page.locator('.discovery-search-workspace')).toHaveAttribute('data-snapshot-current','false');
 await expect(page.getByRole('status').filter({hasText:'Updating Market results'})).toHaveCount(1);
 await expect(page.locator('.africmade-loading')).toHaveCount(0);
 await expect(page.getByText("You've seen all the results.",{exact:true})).toHaveCount(0);
 assert.equal(await page.evaluate(()=>(window as unknown as{fixture:{scrolls:number}}).fixture.scrolls),0,'Typing does not reset the displayed result list');
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.holdProducts=false;f.pendingProductReads.splice(0).forEach(release=>release());});
 await expect(page.locator('.discovery-product-link')).toHaveAttribute('href',/@fixture-shop\?product=202/);
 await expect(page.locator('.discovery-search-workspace')).toHaveAttribute('data-snapshot-current','true');
 assert.equal(await page.evaluate(()=>(window as unknown as{fixture:{scrolls:number}}).fixture.scrolls),1,'Only admission of the new snapshot resets scroll');
 assert.deepEqual(errors,[]);
});

test('FE-074 web business updates retain markers but cannot persist them as new-criteria membership',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map',withShops:true,seedShops:true,holdBusiness:true});
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 await page.getByRole('button',{name:'Move fixture map',exact:true}).click();
 const before=await page.evaluate(key=>sessionStorage.getItem(key),DISCOVERY_KEY);
 await page.getByRole('searchbox',{name:'Search businesses',exact:true}).fill('Different businesses');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 await expect(page.locator('.discovery-map-shell')).toHaveAttribute('data-snapshot-current','false');
 await page.getByRole('button',{name:'Move fixture map',exact:true}).click();
 assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),DISCOVERY_KEY),before,'A stale map snapshot cannot become the new filter scope in return memory');
 await releaseBusinessReads(page);await expect(page.locator('.discovery-map-shell')).toHaveAttribute('data-snapshot-current','true');
 assert.deepEqual(errors,[]);
});

test('FE-074 failed web product updates retain useful cards and retry without stale completion claims',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search'});
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.failProducts=true);
 await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('Unavailable query');
 await expect(page.getByRole('alert')).toContainText('Search is unavailable. Try again.');
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 await expect(page.locator('.discovery-search-workspace')).toHaveAttribute('data-snapshot-current','false');
 await expect(page.getByText("You've seen all the results.",{exact:true})).toHaveCount(0);
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.failProducts=false;f.holdProducts=true;});
 await page.getByRole('button',{name:'Try again',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingProductReads.length)).toBe(1);
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.holdProducts=false;f.pendingProductReads.splice(0).forEach(release=>release());});
 await expect(page.locator('.discovery-search-workspace')).toHaveAttribute('data-snapshot-current','true');
 await expect(page.getByRole('alert')).toHaveCount(0);assert.deepEqual(errors,[]);
});

test('FE-074 preserved React Activity reconnect cannot reset an unchanged product snapshot',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search'});
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 await page.evaluate(()=>{
  const f=(window as unknown as{fixture:Fixture&{scrolls:number;hidden:boolean}}).fixture;f.scrolls=0;
  const scroll=Element.prototype.scrollTo;Element.prototype.scrollTo=function(options?:ScrollToOptions|number,y?:number){if(this.classList.contains('discovery-search-results'))f.scrolls++;Reflect.apply(scroll,this,typeof options==='number'?[options,y??0]:[options]);};
  f.hidden=true;f.flush();
 });
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toBeHidden();
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture&{hidden:boolean}}).fixture;f.hidden=false;f.flush();});
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toBeVisible();
 assert.equal(await page.evaluate(()=>(window as unknown as{fixture:{scrolls:number}}).fixture.scrolls),0,'Same snapshot reconnect never scrolls retained content');
 assert.deepEqual(errors,[]);
});

test('FE-074 queued old map callbacks cannot open membership after new criteria start',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=map',withShops:true,seedShops:true,holdBusiness:true});
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 await page.getByRole('button',{name:'Move fixture map',exact:true}).click();
 await page.evaluate(()=>{const f=(window as unknown as{fixture:{currentSelect:()=>void;staleSelect:()=>void}}).fixture;f.staleSelect=f.currentSelect;});
 await page.getByRole('searchbox',{name:'Search businesses',exact:true}).fill('Different businesses');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);
 await page.evaluate(()=>(window as unknown as{fixture:{staleSelect:()=>void}}).fixture.staleSelect());
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await releaseBusinessReads(page);assert.deepEqual(errors,[]);
});

const exclude=(page:Page,ids:number[])=>page.evaluate(ids=>(window as unknown as{fixture:Fixture}).fixture.saveExclusions(ids),ids);
const fixtureReads=(page:Page)=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.reads);

test('FE-065 web exclusions invalidate both same-query collections and unblock refetches without reordering churn',async t=>{
 const {page,errors}=await boot(t,{url:'/?view=search&p.q=Cup&b.q=Workshop',withShops:true,seedShops:true,enforceExclusions:true,deferWorkspace:true});
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 assert.deepEqual(await fixtureReads(page),[],'Matching server initial scope needs no extra GET');
 await exclude(page,[1]);
 await expect(page.locator('.discovery-product-card')).toHaveCount(0);
 await expect.poll(async()=>(await fixtureReads(page)).length).toBe(2);
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','1');
 assert.ok((await fixtureReads(page)).every(read=>read.page===1&&read.excluded.join(',')==='1'));
 await expect(page.getByRole('searchbox',{name:'Search products',exact:true})).toHaveValue('Cup');
 await exclude(page,[1,2]);await expect.poll(async()=>(await fixtureReads(page)).length).toBe(4);
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','0');
 await exclude(page,[2,1]);await page.waitForTimeout(300);
 assert.equal((await fixtureReads(page)).length,4,'Only canonical membership, not preference order, changes feed authority');
 await exclude(page,[]);await expect.poll(async()=>(await fixtureReads(page)).length).toBe(6);
 await expect(page.locator('.discovery-product-card')).toHaveCount(1);
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 assert.deepEqual((await fixtureReads(page)).slice(-2).map(read=>read.excluded),[[],[]]);
 assert.deepEqual(errors,[]);
});

test('FE-065 web exclusions reject old query/page responses and queued map/group callbacks',async t=>{
 const discoveryMemory=JSON.stringify({scope:'scope=businesses',activeNearbyGroupKey:null,selectedShowroomId:null,mapView:{center:[9.03,38.75],zoom:18},updatedAt:Date.now()});
 const {page,errors}=await boot(t,{url:'/?view=map',withShops:true,seedShops:true,enforceExclusions:true,holdBusiness:true,holdProducts:true,ignoreAbort:true,productPages:true,discoveryMemory,deferWorkspace:true});
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','2');
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.staleSelect=f.currentSelect;f.staleOpenGroup=f.currentOpenGroup;f.currentOpenGroup();});
 await expect(page.getByRole('dialog')).toHaveCount(1);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('searchbox',{name:'Search businesses',exact:true}).fill('Pending query');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(1);
 await page.getByRole('button',{name:'Product listings',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingProductReads.length)).toBe(1);
 await exclude(page,[1]);
 await expect(page.locator('.discovery-product-card')).toHaveCount(0);await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','0');
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReads.length)).toBe(2);
 await expect.poll(()=>page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pendingProductReads.length)).toBe(2);
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.pendingReads.shift()!();f.pendingProductReads.shift()!();f.staleSelect();f.staleOpenGroup();});
 await expect(page.locator('.discovery-product-card')).toHaveCount(0);await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','0');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.holdBusiness=false;f.holdProducts=false;f.pendingReads.splice(0).forEach(release=>release());f.pendingProductReads.splice(0).forEach(release=>release());});
 await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','1');await expect(page.locator('.discovery-product-card')).toHaveCount(0);
 await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.staleSelect();f.staleOpenGroup();});await expect(page.getByRole('dialog')).toHaveCount(0);
 assert.deepEqual((await fixtureReads(page)).filter(read=>read.scope==='products').map(read=>[read.page,read.excluded]),[[2,[]],[1,[1]]],'An old product page cannot become the new exclusion scope cursor');
 assert.deepEqual(errors,[]);
});

test('FE-065 web exclusions admit matching initial source but reject cached mismatched or unproven source',async t=>{
 const matching=await boot(t,{url:'/?view=search',withShops:true,seedShops:true,enforceExclusions:true,excluded:[1],initialExclusions:[1],deferWorkspace:true});
 await expect(matching.page.locator('.discovery-product-card')).toHaveCount(0);await expect(matching.page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','1');
 await matching.page.waitForTimeout(300);assert.deepEqual(await fixtureReads(matching.page),[],'Explicitly matching initial authority remains usable without a GET');assert.deepEqual(matching.errors,[]);
 for(const initialExclusions of [[],null]){
  const {page,errors}=await boot(t,{url:'/?view=search',withShops:true,seedShops:true,enforceExclusions:true,excluded:[1],initialExclusions,holdBusiness:true,holdProducts:true,deferWorkspace:true});
  await expect(page.locator('.discovery-product-card')).toHaveCount(0);await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','0');
  await expect.poll(async()=>(await fixtureReads(page)).length).toBe(2);
  await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.holdBusiness=false;f.holdProducts=false;f.pendingReads.splice(0).forEach(release=>release());f.pendingProductReads.splice(0).forEach(release=>release());});
  await expect(page.locator('[data-fixture-map]')).toHaveAttribute('data-fixture-shops','1');await expect(page.locator('.discovery-product-card')).toHaveCount(0);assert.deepEqual(errors,[]);
 }
});
