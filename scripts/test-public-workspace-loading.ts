import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';

// Real public fallback components and CSS. Only the translation port is controlled;
// this checks initial geometry/accessibility, not server-streaming or API timing.
const compiled=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React from 'react';import{createRoot}from'react-dom/client';
 import Loading from './components/PublicWorkspaceLoading';
 createRoot(document.getElementById('root')!).render(<Loading variant={new URLSearchParams(location.search).get('variant') as 'market'|'featured'|'page'}/>);
`},outfile:'/tmp/mirtpage-public-skeleton.js',bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',plugins:[{name:'translation-only',setup(b){
 b.onResolve({filter:/^@\/lib\/i18n\/ui$/},()=>({path:'text',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const useUiText=()=>value=>value;',loader:'js'}));
}}]});
let browser:Browser|undefined;after(async()=>{await browser?.close();});
for(const variant of ['market','featured','page'] as const)test(`FE-074/036 ${variant} initial skeleton uses real slots, one status and no false actions`,async t=>{
 const bundle=await compiled;browser??=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({reducedMotion:'reduce'});t.after(()=>context.close());
 const page=await context.newPage();await page.route('http://loading.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
 await page.goto('http://loading.fixture/?variant='+variant);
 await page.addStyleTag({content:'*{box-sizing:border-box}body{margin:0}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}@media(min-width:761px){#root{width:calc(100% - 244px);margin-left:244px}}'});
 for(const file of ['app/globals.css','app/landing.css','app/discovery.css','app/navigation.css'])await page.addStyleTag({content:fs.readFileSync(file,'utf8')});
 await page.addStyleTag({content:bundle.outputFiles.find(file=>file.path.endsWith('.css'))!.text});
 await page.addScriptTag({content:bundle.outputFiles.find(file=>file.path.endsWith('.js'))!.text});
 for(const width of [1440,1100,1024,768,390,320]){
  await page.setViewportSize({width,height:844});
  assert.equal(await page.locator('[role=status] > .sr-only').textContent(),variant==='featured'?'Loading Daily Featured':'Loading…','Initial status uses an existing translated message');
  const result=await page.evaluate(()=>({status:document.querySelectorAll('[role=status]').length,busy:document.querySelector('[role=status]')?.getAttribute('aria-busy'),actions:document.querySelectorAll('button,a,input,main').length,overflow:document.documentElement.scrollWidth>innerWidth+1,animations:[...document.querySelectorAll('[aria-hidden=true] i')].map(element=>getComputedStyle(element).animationName),blocks:[...document.querySelectorAll('[aria-hidden=true] i')].filter(element=>element.getClientRects().length).map(element=>({width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height})),map:[...document.querySelectorAll('[data-loading-layout=market]>div')].at(-1)?.getBoundingClientRect().height,columns:(()=>{const grid=document.querySelector('[data-loading-layout=featured] [class*=galleryWrap]>[class*=gallery]');return grid?getComputedStyle(grid).gridTemplateColumns.split(' ').length:0;})(),cardsFit:[...document.querySelectorAll('[data-loading-layout=featured] [class*=gallery]>[class*=card]')].every(element=>{const card=element.getBoundingClientRect(),grid=element.parentElement!.getBoundingClientRect();return card.left>=grid.left-1&&card.right<=grid.right+1;}),media:[...document.querySelectorAll('[data-loading-layout=featured] [class*=media]')].map(element=>element.getBoundingClientRect().height)}));
  assert.equal(result.status,1);assert.equal(result.busy,'true');assert.equal(result.actions,0);assert.equal(result.overflow,false,`${variant} ${width}px horizontal overflow`);assert.ok(result.blocks.every(block=>block.width>0&&block.height>0),'Every intended placeholder has nonzero visible geometry');assert.ok(result.animations.every(name=>name==='none'),'Reduced motion removes shimmer');
  if(variant==='market')assert.ok((result.map||0)>=180,'Initial map retains the main content area');
  if(variant==='featured')assert.equal(result.columns,({1440:3,1100:2,1024:2,768:1,390:2,320:2} as Record<number,number>)[width],'Featured skeleton columns follow its available gallery width');
  if(variant==='featured')assert.equal(result.cardsFit,true,'Featured skeleton cards stay within the gallery beside sponsors');
  if(variant==='featured')assert.ok(result.media.every(height=>height===(width<=620?132:154)),'Featured image slots match current card breakpoint');
  if(variant==='featured'){
   const categories=await page.locator('[data-loading-layout=featured] [class*=week]').evaluate(week=>({overflow:getComputedStyle(week).overflowX,tiles:[...week.children].map(tile=>{
    const rect=tile.getBoundingClientRect(),art=tile.querySelector('[class*=categoryArt]')!.getBoundingClientRect();
    return{width:rect.width,height:rect.height,artWidth:art.width,artHeight:art.height,nameLines:tile.querySelectorAll('[class*=copy] > i').length,dateSlots:tile.querySelectorAll('[class*=categoryDate]').length};
   })}));
   assert.equal(categories.overflow,'hidden','Inert category placeholders clip horizontally without adding controls');
   assert.equal(categories.tiles.length,7);
   for(const tile of categories.tiles){assert.ok(tile.width>=176&&tile.height>=92,'Category silhouettes match the readable live tile bounds');assert.equal(tile.artWidth,32);assert.equal(tile.artHeight,32);assert.equal(tile.nameLines,2);assert.equal(tile.dateSlots,1);}
  }
 }
});
