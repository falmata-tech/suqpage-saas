import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {createUiText,enabledLocales,type UiMessages} from '../lib/i18n/core';

import {MARKET_STOREFRONT_COPY} from '../lib/storefront-copy';

// Production CSS and authored locales with structural shell/control ports.
// Actual React state and running-app/API workflows are separate evidence.
test('FE-065 S132 visible landing copy retains compact controls and a reachable map on short screens',{timeout:60000},async()=>{
 const compiled=await build({stdin:{resolveDir:process.cwd(),loader:'js',contents:`import market from './components/IndependentMarket.module.css';import dock from './components/PublicActionDock.module.css';window.layoutClasses={market,dock};`},bundle:true,write:false,outfile:'layout.js',loader:{'.module.css':'local-css'}});
 const css=compiled.outputFiles.find(file=>file.path.endsWith('.css'))!.text,js=compiled.outputFiles.find(file=>file.path.endsWith('.js'))!.text;
 const browser=await chromium.launch({headless:true});
 try{for(const[width,height]of[[1440,1000],[390,844],[320,480],[844,390]])for(const locale of enabledLocales)for(const scope of['businesses','products']){
  const page=await browser.newPage({viewport:{width,height}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const t=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')) as UiMessages),labels=Object.fromEntries(['Suqpage Market','Businesses','Products','About Suqpage','Category','Country','City','Made to order','Search businesses','Search products'].map(key=>[key,t(key)]));Object.assign(labels,{headline:t(MARKET_STOREFRONT_COPY.title),description:t(MARKET_STOREFRONT_COPY.description)});
  await page.setContent('<div id="root"></div>');await page.addScriptTag({content:'window.__name=value=>value;'});await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+fs.readFileSync('app/discovery.css','utf8')+'\n'+fs.readFileSync('app/landing.css','utf8')+'\n'+css});await page.addScriptTag({content:js});
  await page.evaluate(({labels,scope})=>{const{market:m,dock:d}=(window as unknown as{layoutClasses:{market:Record<string,string>;dock:Record<string,string>}}).layoutClasses;document.querySelector('#root')!.innerHTML=`<div class="${d.scope}"><div class="public-app-shell"><header class="public-app-header">Suqpage</header><main class="public-app-main"><div class="public-experience public-market-experience"><header class="market-landing-introduction"><h1>${labels.headline}</h1><p>${labels.description}</p></header><section class="discovery discovery-marketplace"><h2 class="sr-only">${labels['Suqpage Market']}</h2><div class="discovery-workbench discovery-drawer-workbench ${m.stage}" data-panel-open="false"><div class="${m.modeBar}"><nav class="${m.switch}" data-layout-modes><button><svg width="17" height="17"></svg><span>${labels.Businesses}</span></button><button><svg width="17" height="17"></svg><span>${labels.Products}</span></button></nav></div><div class="${m.activeControls}"><div class="${m.controls}" data-search-scope="${scope}" data-layout-controls><form class="${m.search}" data-layout-search><input type="search" aria-label="${labels[scope==='businesses'?'Search businesses':'Search products']}"></form><div class="${m.filters}" data-layout-filters><button><span>${labels.Category}</span></button><button><span>${labels.Country}</span></button><button><span>${labels.City}</span></button>${scope==='products'?`<button><span>${labels['Made to order']}</span></button>`:''}</div></div></div><div class="${m.viewport}" data-layout-viewport><aside class="${m.panel}" data-open="false" inert><div class="${m.panelBody}">Products</div></aside><button class="${m.peek}" data-side="products">View products</button><div class="discovery-map-shell ${m.mapPanel}" data-open="true"><div class="discovery-map-stage"><div class="discovery-floating-tools"><div class="discovery-floating-buttons"><button>Near me</button><button>Zoom in</button><button>Zoom out</button><button>Reset map</button></div></div><div class="discovery-map" style="height:100%"></div></div></div></div></div></section></div></main><nav class="public-mobile-tabs"><a>Market</a><a>Featured</a><a>About</a><a>Login</a></nav></div><div class="${d.dock}" data-public-action-dock><div class="${d.inquirySlot}"></div><div class="public-support-launcher"><button style="min-height:48px;width:100%">Transport chat</button></div></div></div>`;},{labels,scope});
  const measure=()=>page.evaluate(()=>{const box=(e:Element)=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};},map=box(document.querySelector('.discovery-map')!),viewport=box(document.querySelector('[data-layout-viewport]')!),modes=box(document.querySelector('[data-layout-modes]')!),stage=box(document.querySelector('.discovery-workbench')!);return{map,viewport,modes,stage,search:box(document.querySelector('[data-layout-search]')!),filters:box(document.querySelector('[data-layout-filters]')!),heading:box(document.querySelector('h1')!),introduction:box(document.querySelector('.market-landing-introduction')!),description:box(document.querySelector('.market-landing-introduction p')!),background:getComputedStyle(document.querySelector('.public-app-main')!).backgroundImage,documentWidth:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('[data-layout-modes] button,[data-layout-filters] button,button[aria-label]')].map(box),labels:[...document.querySelectorAll('[data-layout-modes] span,[data-layout-filters] span')].map(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,height:el.clientHeight,scrollHeight:el.scrollHeight}))};});
  const g=await measure(),styles=await page.evaluate(()=>Object.fromEntries(['[data-layout-search]','[data-layout-filters]','[data-layout-controls]'].map(selector=>{const s=getComputedStyle(document.querySelector(selector)!);return[selector,{minHeight:s.minHeight,height:s.height,margin:s.margin,padding:s.padding,alignSelf:s.alignSelf,alignItems:s.alignItems,gridTemplateRows:s.gridTemplateRows}];}))),context=JSON.stringify({width,height,locale,scope,geometry:g,styles});assert.ok(g.documentWidth<=width+1,context);assert.ok(g.heading.height>16&&g.description.height>12,'Web landing headline and supporting copy stay visible');assert.equal(g.background,'none','Market uses a plain background');assert.ok(Math.abs(g.modes.x+g.modes.width/2-(g.stage.x+g.stage.width/2))<=1,context);
  assert.ok(g.modes.height<=52,context);assert.ok(Math.abs(g.modes.x+g.modes.width/2-(g.stage.x+g.stage.width/2))<=1,context);assert.equal(await page.getByRole('button',{name:labels['About Suqpage'],exact:true}).count(),0);
  if(width===1440)assert.ok(g.map.y<=200+g.introduction.height,context);if(width===390||width===320)assert.ok(g.map.y<=240+g.introduction.height,context);assert.ok(g.map.height>=120,context);assert.ok(Math.abs(g.map.height-g.viewport.height)<=1,context);assert.ok(Math.abs(g.map.bottom-g.viewport.bottom)<=1,context);
  if(width===1440||width===844){assert.ok(Math.abs(g.search.y-g.filters.y)<=1,context);assert.ok(g.search.width>=220,context);}else assert.ok(g.filters.y>=g.search.bottom-1,context);
  for(const r of g.buttons)assert.ok(r.width>=47.5&&r.height>=47.5,context);for(const label of g.labels)assert.ok(label.scrollWidth<=label.width+1&&label.scrollHeight<=label.height+1,context);
  if(locale==='en'&&scope==='products'&&(width===320||width===844)){await page.evaluate(()=>document.documentElement.style.fontSize='24px');const enlarged=await measure();assert.ok(enlarged.documentWidth<=width+1,JSON.stringify(enlarged));assert.ok(enlarged.filters.y>=enlarged.search.bottom-1,'Enlarged text honestly returns to stacked controls');for(const label of enlarged.labels)assert.ok(label.scrollWidth<=label.width+1&&label.scrollHeight<=label.height+1,JSON.stringify(enlarged));}
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
   return <section className={styles.activeControls} style={{width:fixture.width+24,boxSizing:'border-box'}}><Controls scope="products" value={value} onChange={setValue} metadata={{places:[],countries:[],industries:[]}}/></section>;}
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
   const form=root.querySelector('form')!,filters=form.nextElementSibling!,box=(element:Element)=>{const r=element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   return{root:box(root),form:box(form),filters:box(filters),counts:[...filters.querySelectorAll('b')].map(e=>e.textContent),buttons:[...root.querySelectorAll('button')].map(box),labels:[...filters.querySelectorAll('span')].map(e=>({text:e.textContent,width:e.clientWidth,scrollWidth:e.scrollWidth,height:e.clientHeight,scrollHeight:e.scrollHeight})),icons:[...filters.querySelectorAll('svg')].map(e=>getComputedStyle(e).display),overflow:root.scrollWidth>root.clientWidth};
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
