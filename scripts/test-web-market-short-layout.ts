import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {createUiText,enabledLocales,type UiMessages} from '../lib/i18n/core';
import {MARKET_COMPACT_COPY,MARKET_STOREFRONT_COPY} from '../lib/storefront-copy';

test('FE-065 S181 short enlarged discovery preserves a usable map and contained real header',{timeout:60000},async()=>{
 const compiled=await build({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
  import React,{useState}from'react';import{createRoot}from'react-dom/client';
  import Brand from './components/AfricMadeBrand';import Language from './components/LanguageSelector';
  import Controls from './components/MarketSearchControls';import styles from './components/IndependentMarket.module.css';
  import{emptyMarketSearch}from'./lib/market-search';import{createUiText}from'./lib/i18n/core';
  const f=window.fixture;window.fixtureT=createUiText(f.catalog);
  function App(){const[value,setValue]=useState(emptyMarketSearch());return <div className="public-app-shell">
   <header className="public-app-header"><Brand className="public-app-brand"/><Language/></header>
   <main className="public-app-main"><div className="public-experience public-market-experience">
    <header className="market-landing-introduction"><h1><span className="market-landing-compact-title">{window.fixtureT('Discover African farmers, manufacturers, and artisans in one place.')}</span></h1></header>
    <section className="discovery discovery-marketplace"><div className={'discovery-workbench discovery-drawer-workbench '+styles.stage}>
     <div className={styles.modeBar}><nav className={styles.switch}><button><span>{window.fixtureT('Business locations')}</span></button><button><span>{window.fixtureT('Product listings')}</span></button></nav></div>
     <div className={styles.activeControls}><Controls ready={true} scope="businesses" value={value} onChange={setValue} metadata={{places:[],countries:[],industries:[]}}/></div>
     <div className={styles.viewport} data-layout-map-viewport><div className={'discovery-map-shell '+styles.mapPanel} data-open="true"><div className="discovery-map-stage"><div className="discovery-map" style={{height:'100%'}}><button data-layout-map-target style={{position:'absolute',top:'50%',left:'50%',minWidth:48,minHeight:48}}>2</button></div></div></div></div>
    </div></section>
   </div></main><nav className="public-mobile-tabs"><a>Market</a><a>Featured</a><a>About</a><a>Login</a></nav>
  </div>;}
  createRoot(document.getElementById('root')).render(<App/>);
 `},bundle:true,write:false,outfile:'short.js',platform:'browser',jsx:'automatic',loader:{'.module.css':'local-css'},plugins:[{name:'header-locale-context-ports',setup(b){
  b.onResolve({filter:/^(?:next-intl|next\/navigation|next\/link|@\/lib\/i18n\/ui)$/},args=>({path:args.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',resolveDir:process.cwd(),contents:args.path==='next-intl'?'export const useLocale=()=>window.fixture.locale;':args.path==='next/navigation'?'export const useRouter=()=>({refresh(){}});':args.path==='next/link'?"import React from'react';export default function Link(props){return <a {...props}/>;}":'export const useUiText=()=>window.fixtureT;'}));
 }}]});
 const css=compiled.outputFiles.find(file=>file.path.endsWith('.css'))!.text,js=compiled.outputFiles.find(file=>file.path.endsWith('.js'))!.text;
 const browser=await chromium.launch({headless:true}),failures:unknown[]=[];
 try{for(const locale of ['en','am','om'])for(const[height,fontSize]of[[568,16],[420,32]]){
  const page=await browser.newPage({viewport:{width:320,height}});
  await page.setContent('<div id="root"></div>');await page.addScriptTag({content:'window.__name=value=>value;'});
  await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+fs.readFileSync('app/discovery.css','utf8')+'\n'+fs.readFileSync('app/landing.css','utf8')+'\n'+css});
  const catalog=locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')) as UiMessages;
  await page.evaluate(fixture=>{(window as unknown as{fixture:unknown}).fixture=fixture;document.documentElement.style.fontSize=fixture.fontSize+'px';},{locale,catalog,fontSize});await page.addScriptTag({content:js});
  await page.locator('.language-selector select:not(:disabled)').waitFor();
  const geometry=await page.evaluate(()=>{
   const box=(e:Element)=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   const header=document.querySelector('.public-app-header')!,brand=header.querySelector('.africmade-brand')!,language=header.querySelector('.language-selector')!,select=language.querySelector('select')!;
   const introduction=document.querySelector('.market-landing-introduction')!,market=document.querySelector('.public-market-experience')!,map=document.querySelector('.discovery-map')!;
   const selectedText=select.selectedOptions[0].text,style=getComputedStyle(select),context=document.createElement('canvas').getContext('2d')!;
   context.font=style.font;const selectedTextWidth=context.measureText(selectedText).width;
   const selectedRequiredWidth=selectedTextWidth+parseFloat(style.paddingLeft)+parseFloat(style.paddingRight)+parseFloat(style.borderLeftWidth)+parseFloat(style.borderRightWidth);
   return{header:box(header),brand:box(brand),language:box(language),select:box(select),selectedText,selectedTextWidth,selectedRequiredWidth,selectedFont:style.font,introduction:box(introduction),heading:box(introduction.querySelector('h1')!),map:box(map),market:{...box(market),clientHeight:market.clientHeight,scrollHeight:market.scrollHeight,overflowY:getComputedStyle(market).overflowY},documentWidth:document.documentElement.scrollWidth};
  });
  const issues:string[]=[];
  if(geometry.language.right>geometry.header.right-10||geometry.select.right>geometry.header.right-10)issues.push('Language selector extends beyond padded header');
  if(geometry.brand.right+4>geometry.language.x)issues.push('Brand and language overlap');
  if(geometry.select.height<44)issues.push('Language target is shorter than44px');
  if(geometry.selectedRequiredWidth>geometry.select.width+1)issues.push('Selected language name is clipped inside native select');
  if(geometry.heading.y<geometry.header.bottom-1)issues.push('Heading is clipped by sticky header');
  if(geometry.map.height<240)issues.push('Map compressed below usable240px');
  if(fontSize===32&&!(geometry.market.scrollHeight>geometry.market.clientHeight&&['auto','scroll'].includes(geometry.market.overflowY)))issues.push('Short enlarged market cannot scroll to content');
  if(geometry.documentWidth>321)issues.push('Page overflows horizontally');
  if(issues.length)failures.push({locale,height,fontSize,issues,geometry});
  if(!issues.length){await page.locator('[data-layout-map-target]').scrollIntoViewIfNeeded();await page.locator('[data-layout-map-target]').click();}
  await page.close();
 }}finally{await browser.close();}
 assert.deepEqual(failures,[],'Real header/map geometry: '+JSON.stringify(failures));
});

// Production CSS/authored locales with structural shell/map/control ports.
// Actual React state and running-app/API workflows are separate evidence.
test('FE-065 S181 phone map leads with short copy, one control row and inset attribution',{timeout:60000},async()=>{
 const compiled=await build({stdin:{resolveDir:process.cwd(),loader:'js',contents:`import market from './components/IndependentMarket.module.css';import dock from './components/PublicActionDock.module.css';window.layoutClasses={market,dock};`},bundle:true,write:false,outfile:'layout.js',loader:{'.module.css':'local-css'}});
 const css=compiled.outputFiles.find(file=>file.path.endsWith('.css'))!.text,js=compiled.outputFiles.find(file=>file.path.endsWith('.js'))!.text;
 const browser=await chromium.launch({headless:true});
 try{for(const[width,height]of[[1440,1000],[390,844],[320,568],[320,480],[844,390]])for(const locale of enabledLocales)for(const scope of['businesses','products']){
  const page=await browser.newPage({viewport:{width,height}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const t=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')) as UiMessages);
  const labels=Object.fromEntries(['AfricMade Market','Business locations','Product listings','Category','Country','City','Made to order','Search businesses','Search products','Filters'].map(key=>[key,t(key)]));
  Object.assign(labels,{headline:t(MARKET_STOREFRONT_COPY.title),compact:t(MARKET_COMPACT_COPY.title),description:t(MARKET_STOREFRONT_COPY.description)});
  await page.setContent('<div id="root"></div>');await page.addScriptTag({content:'window.__name=value=>value;'});
  await page.addStyleTag({content:fs.readFileSync('node_modules/leaflet/dist/leaflet.css','utf8')+'\n'+fs.readFileSync('app/globals.css','utf8')+'\n'+fs.readFileSync('app/discovery.css','utf8')+'\n'+fs.readFileSync('app/landing.css','utf8')+'\n'+css});await page.addScriptTag({content:js});
  await page.evaluate(({labels,scope})=>{
   const{market:m,dock:d}=(window as unknown as{layoutClasses:{market:Record<string,string>;dock:Record<string,string>}}).layoutClasses;
   document.querySelector('#root')!.innerHTML=`<div class="${d.scope}"><div class="public-app-shell"><header class="public-app-header">AfricMade</header><main class="public-app-main"><div class="public-experience public-market-experience"><header class="market-landing-introduction"><h1><span class="market-landing-full-title">${labels.headline}</span><span class="market-landing-compact-title">${labels.compact}</span></h1><p>${labels.description}</p></header><section class="discovery discovery-marketplace"><h2 class="sr-only">${labels['AfricMade Market']}</h2><div class="discovery-workbench discovery-drawer-workbench ${m.stage}" data-panel-open="false"><div class="${m.modeBar}"><nav class="${m.switch}" data-layout-modes><button><svg width="17" height="17"></svg><span>${labels['Business locations']}</span></button><button><svg width="17" height="17"></svg><span>${labels['Product listings']}</span></button></nav></div><div class="${m.activeControls}"><div class="${m.controls}" data-search-scope="${scope}" data-layout-controls><form class="${m.search}" data-layout-search><input type="search" aria-label="${labels[scope==='businesses'?'Search businesses':'Search products']}"></form><button class="${m.compactFilters}" data-layout-compact><svg width="16" height="16"></svg><span>${labels.Filters}</span></button><div class="${m.filters}" data-layout-filters><button><span>${labels.Category}</span></button><button><span>${labels.Country}</span></button><button><span>${labels.City}</span></button>${scope==='products'?`<button><span>${labels['Made to order']}</span></button>`:''}</div></div></div><div class="${m.viewport}" data-layout-viewport><aside class="${m.panel}" data-open="false" inert><div class="${m.panelBody}">Products</div></aside><button class="${m.peek}" data-side="products">View products</button><div class="discovery-map-shell ${m.mapPanel}" data-open="true"><div class="discovery-map-stage"><div class="discovery-floating-tools"><div class="discovery-floating-buttons"><button>Near me</button><button>Zoom in</button><button>Zoom out</button><button>Reset map</button></div></div><div class="discovery-map leaflet-container" style="height:100%"><div class="leaflet-control-container"><div class="leaflet-bottom leaflet-left"><div class="leaflet-control-attribution leaflet-control"><a href="https://leafletjs.com">Leaflet</a> | © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a></div></div></div></div></div></div></div></div></section></div></main><nav class="public-mobile-tabs"><a>Market</a><a>Featured</a><a>About</a><a>Login</a></nav></div><div class="${d.dock}" data-public-action-dock><div class="${d.inquirySlot}"></div><div class="public-support-launcher"><button style="min-height:60px;width:200px;max-width:100%">Need Transport?</button></div></div></div>`;
  },{labels,scope});
  const measure=()=>page.evaluate(()=>{
   const box=(e:Element)=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
   const compact=document.querySelector('[data-layout-compact]')!,direct=document.querySelector('[data-layout-filters]')!,active=compact.getClientRects().length?compact:direct;
   const map=box(document.querySelector('.discovery-map')!),viewport=box(document.querySelector('[data-layout-viewport]')!),navigation=box(document.querySelector('.public-mobile-tabs')!);
   const attribution=document.querySelector('.leaflet-control-attribution')!;
   return{map,viewport,navigation,modes:box(document.querySelector('[data-layout-modes]')!),stage:box(document.querySelector('.discovery-workbench')!),search:box(document.querySelector('[data-layout-search]')!),filters:box(active),compact:Boolean(compact.getClientRects().length),heading:box(document.querySelector('h1')!),introduction:box(document.querySelector('.market-landing-introduction')!),description:box(document.querySelector('.market-landing-introduction p')!),attribution:box(attribution),attributionFont:parseFloat(getComputedStyle(attribution).fontSize),dock:box(document.querySelector('[data-public-action-dock]')!),inputFont:parseFloat(getComputedStyle(document.querySelector('input')!).fontSize),background:getComputedStyle(document.querySelector('.public-app-main')!).backgroundImage,documentWidth:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('[data-layout-modes] button,[data-layout-filters] button,[data-layout-compact],button[aria-label]')].filter(e=>e.getClientRects().length).map(box),labels:[...document.querySelectorAll('[data-layout-modes] span,[data-layout-filters] span,[data-layout-compact]>span')].filter(e=>e.getClientRects().length).map(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,height:el.clientHeight,scrollHeight:el.scrollHeight}))};
  });
  let g=await measure();
  // A minimum usable canvas can require scrolling on short screens. Inspect
  // attribution after the user brings that canvas into the visible workspace.
  if(width<=760&&g.map.bottom>g.navigation.y){await page.locator('.discovery-map').scrollIntoViewIfNeeded();g=await measure();}
  const context=JSON.stringify({width,height,locale,scope,geometry:g});
  assert.ok(g.documentWidth<=width+1,context);assert.ok(g.heading.height>16,context);assert.equal(g.background,'none');assert.equal(await page.locator('h1').count(),1);
  if(width<=760){
   assert.equal(g.description.height,0,'Phone narrative is concise rather than another paragraph');assert.equal(g.compact,true);assert.ok(g.inputFont>=16,context);
   assert.ok(Math.abs(g.map.width-g.viewport.width)<=1,context);assert.ok(Math.abs(g.search.y-g.filters.y)<=1,context);
   const visibleHeight=Math.max(0,Math.min(g.map.bottom,g.navigation.y,height)-Math.max(g.map.y,0));
   if(width===390)assert.ok(visibleHeight/height>=.6,context);if(width===320&&height===568)assert.ok(visibleHeight/height>=.5,context);
   assert.ok(g.attributionFont>=10,context);assert.ok(g.attribution.x>=g.map.x&&g.attribution.bottom<=g.map.bottom+1,context);
   assert.ok(g.attribution.right<=g.dock.x-2||g.attribution.bottom<=g.dock.y,context);
  }else{
   assert.ok(g.description.height>12,'Desktop retains the full explanation');assert.equal(g.compact,false);assert.ok(Math.abs(g.search.y-g.filters.y)<=1,context);assert.ok(g.search.width>=220,context);
  }
  assert.ok(g.modes.height<=52,context);assert.ok(Math.abs(g.modes.x+g.modes.width/2-(g.stage.x+g.stage.width/2))<=1,context);
  assert.ok(g.map.height>=120,context);assert.ok(Math.abs(g.map.height-g.viewport.height)<=1,context);assert.ok(Math.abs(g.map.bottom-g.viewport.bottom)<=1,context);
  const targetFloor=width<=760?43.5:47.5;for(const r of g.buttons)assert.ok(r.width>=targetFloor&&r.height>=targetFloor,context);for(const label of g.labels)assert.ok(label.scrollWidth<=label.width+1&&label.scrollHeight<=label.height+1,context);
  if(locale==='en'&&scope==='products'&&(width===320||width===844)){
   await page.evaluate(()=>document.documentElement.style.fontSize='24px');const enlarged=await measure();assert.ok(enlarged.documentWidth<=width+1,JSON.stringify(enlarged));
   assert.ok(enlarged.filters.y>=enlarged.search.bottom-1,'Enlarged text returns to stacked, reachable controls');for(const label of enlarged.labels)assert.ok(label.scrollWidth<=label.width+1&&label.scrollHeight<=label.height+1,JSON.stringify(enlarged));
  }
  assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close();}
});

// Real React MarketSearchControls, actual CSS and five authored catalogs. Only
// locale/context ports and the public metadata input are controlled, not controls.
test('FE-065 real populated controls fit578px and606px with every active language',{timeout:30000},async()=>{
 const compiled=await build({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
  import React,{useState} from 'react';import{createRoot}from'react-dom/client';
  import Controls from './components/MarketSearchControls';import styles from './components/IndependentMarket.module.css';
  import{createUiText}from'./lib/i18n/core';import{emptyMarketSearch}from'./lib/market-search';
  const fixture=window.fixture;window.fixtureT=createUiText(fixture.catalog);
  function App(){const[value,setValue]=useState({...emptyMarketSearch(),query:'Cup',categories:['home','textiles'],countries:['ET'],cities:['ET:addis'],madeToOrder:true});
   return <section className={styles.activeControls} style={{width:fixture.width+24,boxSizing:'border-box'}}><Controls ready={true} scope="products" value={value} onChange={setValue} metadata={{places:[],countries:[],industries:[]}}/></section>;}
  createRoot(document.getElementById('root')).render(<App/>);
 `},bundle:true,write:false,outfile:'controls.js',platform:'browser',jsx:'automatic',loader:{'.module.css':'local-css'},plugins:[{name:'locale-context-ports',setup(b){
  b.onResolve({filter:/^(?:next-intl|@\/lib\/i18n\/ui)$/},args=>({path:args.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:args.path==='next-intl'?'export const useLocale=()=>window.fixture.locale;':'export const useUiText=()=>window.fixtureT;'}));
 }}]});
 const css=compiled.outputFiles.find(file=>file.path.endsWith('.css'))!.text,js=compiled.outputFiles.find(file=>file.path.endsWith('.js'))!.text;
 const browser=await chromium.launch({headless:true});
 try{for(const width of[578,606])for(const locale of enabledLocales){
  const page=await browser.newPage({viewport:{width:844,height:390}}),errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setContent('<div id="root"></div>');await page.addScriptTag({content:'window.__name=value=>value;'});await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+css});
  const catalog=locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')) as UiMessages;
  await page.evaluate(fixture=>{(window as unknown as{fixture:unknown}).fixture=fixture;},{locale,catalog,width});await page.addScriptTag({content:js});
  await page.locator('[data-search-scope="products"]').waitFor();
  const geometry=await page.locator('[data-search-scope="products"]').evaluate(root=>{
   const form=root.querySelector('form')!,filters=root.querySelector('[data-inline-filters]')!,box=(element:Element)=>{const r=element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   return{root:box(root),form:box(form),filters:box(filters),counts:[...filters.querySelectorAll('b')].map(e=>e.textContent),buttons:[...root.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(box),labels:[...filters.querySelectorAll('span')].map(e=>({text:e.textContent,width:e.clientWidth,scrollWidth:e.scrollWidth,height:e.clientHeight,scrollHeight:e.scrollHeight})),icons:[...filters.querySelectorAll('svg')].map(e=>getComputedStyle(e).display),overflow:root.scrollWidth>root.clientWidth};
  });
  const context=JSON.stringify({locale,width,geometry});assert.ok(Math.abs(geometry.root.width-width)<1,context);assert.ok(Math.abs(geometry.form.y-geometry.filters.y)<1,context);assert.ok(geometry.form.width>=220,context);assert.equal(geometry.overflow,false,context);assert.ok(geometry.filters.right<=geometry.root.right+1,context);
  assert.deepEqual(geometry.counts,['2','1','1']);assert.ok(geometry.icons.every(display=>display==='none'),context);
  for(const button of geometry.buttons)assert.ok(button.width>=47.5&&button.height>=47.5,context);
  const t=createUiText(catalog);assert.deepEqual(geometry.labels.map(label=>label.text),['Category','Country','City','Made to order'].map(key=>t(key)));
  for(const label of geometry.labels)assert.ok(label.width>0&&label.scrollWidth<=label.width+1&&label.scrollHeight<=label.height+1,context);
  await page.getByRole('button',{name:t('Made to order'),exact:true}).click();assert.equal(await page.getByRole('button',{name:t('Made to order'),exact:true}).getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);await page.close();
 }}finally{await browser.close();}
});
