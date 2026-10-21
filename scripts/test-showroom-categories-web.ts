import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {chromium,type Page} from 'playwright';
import {expect} from '@playwright/test';
import type {Catalog} from '../lib/types';
import type {UiMessages} from '../lib/i18n/core';
import {createUiText} from '../lib/i18n/core';
import {storefrontAccent} from '../lib/storefront-accent';
import {categoryCatalog,categoryProfile,categoryName,longCategoryName} from './testing/showroom-category-fixture';

// Real ShowroomApp, BusinessProfile, ProductPage, dock, filters and storage with
// production CSS. Auth/network/navigation/clipboard are controlled ports; this
// fixture is not an app/API/database/device workflow certification.
const require=createRequire(import.meta.url);
const bundled=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import ShowroomApp from './components/showroom/ShowroomApp';import {PublicActionDockProvider} from './components/PublicActionDock';
 const f=window.fixture,root=createRoot(document.getElementById('root'));
 const originalPush=history.pushState.bind(history);history.pushState=(...args)=>{originalPush(...args);dispatchEvent(new Event('fixture-navigation'));};
 f.mount=catalog=>flushSync(()=>root.render(<PublicActionDockProvider enabled transport={null}><ShowroomApp catalog={catalog} businessProfile={f.profile} withinPublicApp/></PublicActionDockProvider>));
`},bundle:true,write:false,outfile:'showroom-categories.js',platform:'browser',jsx:'automatic',loader:{'.module.css':'local-css'},plugins:[{name:'showroom-category-ports',setup(builder){
  builder.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));
  builder.onResolve({filter:/^(?:next\/(?:navigation|link)|@\/lib\/(?:i18n\/ui|browser-clipboard|showroom-bank-release|showroom-composition-v2|showroom-content-blocks|showroom-chapters|showroom-manifests|product-detail-patterns)|@\/components\/(?:LanguageSelector|SuqpageBrand)|\.\/designs|\.\.\/PublicBusinessSafety|\.\/bank\/(?:CompositionShowroom|tokens))$/},args=>({path:args.path,namespace:'ports'}));
  builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',resolveDir:process.cwd(),contents:
   args.path==='@/lib/i18n/ui'?`import {createUiText} from ${JSON.stringify(process.cwd()+'/lib/i18n/core.ts')};export const useUiText=()=>createUiText(window.fixture.messages);`
   :args.path==='next/navigation'?`import {useEffect,useState} from 'react';const router={push:value=>history.pushState(null,'',value),back:()=>history.back()};export const useRouter=()=>router;export function useSearchParams(){const[value,setValue]=useState(()=>new URLSearchParams(location.search));useEffect(()=>{const update=()=>setValue(new URLSearchParams(location.search));window.addEventListener('fixture-navigation',update);return()=>window.removeEventListener('fixture-navigation',update);},[]);return value;}`
   :args.path==='next/link'?`export default function Link({href,children,...props}){return <a href={href} {...props} onClick={event=>{event.preventDefault();history.pushState(null,'',href);}}>{children}</a>;}`
   :args.path==='@/lib/browser-clipboard'?`export async function copyBrowserText(){return true;}export async function openCopiedBrowserLink(){return {copied:true,opened:false};}`
   :args.path==='./designs'?`export const AlHayaDesign=()=>null,HomeVibeDesign=()=>null,NovaTechDesign=()=>null,UsaShopDesign=()=>null;`
   :args.path==='./bank/CompositionShowroom'?`export const CompositionShowroom=()=>null,InvalidComposition=()=>null;`
   :args.path==='./bank/tokens'?`export const showroomTokenVariables=()=>({});`
   :args.path==='@/lib/showroom-bank-release'?`export const SHOWROOM_COMPONENT_BANK_LATEST={};`
   :args.path==='@/lib/showroom-composition-v2'?`export const parseShowroomDesignProposalV2=value=>value;`
   :args.path==='@/lib/showroom-content-blocks'?`export const parseShowroomContentBlocks=value=>value;`
   :args.path==='@/lib/showroom-chapters'?`export const canonicalizeShowroomChapters=value=>value;`
   :args.path==='@/lib/showroom-manifests'?`export const parsePublishedDesignManifest=()=>null;`
   :args.path==='@/lib/product-detail-patterns'?`export const normalizeProductDetailPattern=()=> 'editorial';`
   :args.path==='../PublicBusinessSafety'?`export default function Safety({children}){return children;}`
   :`export default ()=>null;`}));
}}]});
type Fixture={messages:UiMessages;profile:typeof categoryProfile;mount:(catalog:Catalog)=>void};
async function boot(page:Page,catalog=categoryCatalog,messages:UiMessages={}){
  page.setDefaultTimeout(10000);
  await page.route('http://suqpage.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<main id="root"></main>'}));
  await page.goto('http://suqpage.fixture/@'+catalog.business.handle);
  await page.addStyleTag({content:readFileSync('app/globals.css','utf8')+'\n'+(await bundled).outputFiles.find(file=>file.path.endsWith('.css'))!.text+'\nbody{margin:0}'});
  await page.evaluate(value=>{(window as unknown as{fixture:Fixture}).fixture=value as Fixture;},{messages,profile:categoryProfile});
  await page.addScriptTag({content:(await bundled).outputFiles.find(file=>file.path.endsWith('.js'))!.text});
  await page.evaluate(catalog=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog),catalog);
  await page.getByRole('heading',{name:catalog.business.name,exact:true}).waitFor();
}
const categories=(page:Page)=>page.getByRole('group',{name:'Product category',exact:true});
const cards=(page:Page)=>page.locator('[data-business-profile] article:not([data-product-page])');
const selected=(page:Page)=>categories(page).getByRole('button',{pressed:true});
const saved=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('suqpage-cart:fixture-category-shop')||'[]') as Array<{productId:number}>);

test('FE-041 S131 actual web chips intersect search, preserve counts/Add/details/Back and retain literal affiliation',{timeout:60000},async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
  try{const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',error=>errors.push(error.message));await boot(page);
    const group=categories(page),all=group.getByRole('button',{name:'All 6',exact:true}),first=group.getByRole('button',{name:categoryName+' 2',exact:true});
    await expect(all).toHaveAttribute('aria-pressed','true');assert.equal(await group.getByRole('button').count(),3);assert.equal(await cards(page).count(),6);
    assert.deepEqual(await page.locator('[data-product-category]').allTextContents(),[categoryName,categoryName,longCategoryName]);
    await first.click();assert.equal(await cards(page).count(),2);await expect(first).toHaveAttribute('aria-pressed','true');
    const search=page.getByRole('searchbox');await search.fill('oak');assert.equal(await cards(page).count(),1);
    await expect(first,'Category counts reflect whole visible membership, not filtered inventory').toHaveText(categoryName+'2');
    await all.click();await expect(search).toHaveValue('oak');assert.equal(await cards(page).count(),1,'All resets only category');
    await first.click();await page.getByRole('button',{name:'Clear product search',exact:true}).click();await expect(first).toHaveAttribute('aria-pressed','true');assert.equal(await cards(page).count(),2);
    await cards(page).first().getByRole('button',{name:'Add to inquiry list: Oak table',exact:true}).click();
    await expect(cards(page).first().getByRole('button',{name:'Added to inquiry list: Oak table',exact:true})).toBeDisabled();
    assert.deepEqual((await saved(page)).map(item=>item.productId),[101]);
    await cards(page).first().getByRole('heading',{name:'Oak table',exact:true}).getByRole('link').click();
    await page.locator('[data-product-page]').waitFor();await expect(page.getByRole('heading',{name:'Oak table',exact:true})).toBeVisible();
    await page.getByRole('link',{name:'Back to products',exact:true}).click();await expect(first).toHaveAttribute('aria-pressed','true');assert.equal(await cards(page).count(),2);
    assert.deepEqual((await saved(page)).map(item=>item.productId),[101],'Details and Back preserve the per-business inquiry list');
    await all.click();await page.getByRole('searchbox').fill(categoryName);assert.equal(await cards(page).count(),2,'Literal canonical category names participate in search');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('FE-041 S131 authoritative category removal resets only selection and inactive/foreign names never appear in details',{timeout:60000},async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
  try{const page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await boot(page);
    await categories(page).getByRole('button',{name:categoryName+' 2',exact:true}).click();await page.getByRole('searchbox').fill('oak');
    await page.evaluate(catalog=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog),{...categoryCatalog,categories:categoryCatalog.categories.filter(category=>category.id!==10)});
    await expect(selected(page)).toHaveText('All6');await expect(page.getByRole('searchbox')).toHaveValue('oak');assert.equal(await cards(page).count(),1);
    assert.equal(await page.locator('[data-product-category]').count(),0,'Removed affiliation disappears immediately');
    await page.getByRole('button',{name:'Clear product search',exact:true}).click();
    for(const name of['Inactive-category box','Foreign-category bowl']){
      await page.getByRole('heading',{name,exact:true}).getByRole('link').click();
      assert.ok(!(await page.locator('[data-product-page]').textContent())?.includes('FORGED'),'Details do not revive raw hydrated affiliation');
      await page.getByRole('link',{name:'Back to products',exact:true}).click();
    }
    await page.evaluate(catalog=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog),{...categoryCatalog,categories:[]});
    assert.equal(await page.locator('[data-showroom-categories]').count(),0);assert.equal(await cards(page).count(),6,'No usable categories leaves an ordinary flat grid');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('FE-041 S131 wrapping chips keep literal long names, accent selection and48px keyboard targets at phone/landscape/desktop',{timeout:120000},async context=>{
  let stage='browser launch';context.after(()=>{if(stage!=='complete')context.diagnostic('Last fixture stage: '+stage);});
  const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
  try{for(const[width,height]of[[320,480],[390,844],[844,390],[1440,1000]])for(const locale of['en','am','om']){
    stage=`${locale} ${width}×${height} boot`;
    const messages:UiMessages=locale==='en'?{}:JSON.parse(readFileSync('lib/i18n/messages/'+locale+'.json','utf8')),t=createUiText(messages);
    const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',error=>errors.push(error.message));await boot(page,categoryCatalog,messages);
    stage=`${locale} ${width}×${height} assertions`;
    const group=page.getByRole('group',{name:t('Product category'),exact:true}),buttons=group.getByRole('button');
    for(const button of await buttons.all()){
      const bounds=await button.boundingBox();assert.ok(bounds&&bounds.width>=48&&bounds.height>=48,JSON.stringify({width,locale,bounds}));
      const unclipped=await button.evaluate(element=>element.scrollWidth<=element.clientWidth+1&&element.scrollHeight<=element.clientHeight+1);assert.ok(unclipped,'Long names wrap without clipping');
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal-only category rail or page overflow');
    const first=buttons.nth(1);await first.focus();await page.keyboard.press('Space');await expect(first).toHaveAttribute('aria-pressed','true');
    assert.equal(await group.getByRole('button',{pressed:true}).count(),1,'Selection remains exclusive');
    const colors=await first.evaluate(element=>({text:getComputedStyle(element).color,background:getComputedStyle(element).backgroundColor,border:getComputedStyle(element).borderColor}));
    const accent=storefrontAccent(categoryProfile.accentColor)!,rgb=(hex:string)=>'rgb('+[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)).join(', ')+')';
    assert.deepEqual(colors,{text:rgb(accent.ink),background:rgb(accent.soft),border:rgb(accent.edge)},'Selected chip uses the existing merchant contrast-safe accent');
    assert.equal(await page.locator('[data-product-category]').first().textContent(),categoryName,'Merchant category names stay literal in every UI language');
    await page.close();context.diagnostic(`PASS ${locale} ${width}×${height}`);
  }assert.deepEqual(errors,[]);stage='complete';}finally{await browser.close();}
});
