import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
import ts from 'typescript';
import {getImageProps} from 'next/image';

// Actual Featured, preview and sponsor components, timing hook and production CSS.
// Only Next navigation/image and translation ports are controlled. This geometry
// fixture does not claim to exercise a server catalog or installed Android.
const compiled=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React from 'react';import{createRoot}from'react-dom/client';
 import Featured from './components/FeaturedShowroomsWorkspace';
 import{DEFAULT_FEATURED_PROGRAM_POLICY}from'./lib/featured-program';
 const params=new URLSearchParams(location.search),count=Number(params.get('sponsors'));
 const images=params.has('images')?['/uploads/seed/fixture-public.webp','/media/product-private-fixture.webp','/api/page-media/fixture']:[];
 const name='A very long business name '+ 'LongUnbrokenBusinessIdentity'.repeat(5);
 const booths=Array.from({length:6},(_,i)=>({slot:i+1,reference:'Booth '+(i+1),revealed:true,showroom:{id:i+1,handle:'fixture-'+(i+1),name:name+' '+(i+1),tagline:'Products for a local business',description:'A bounded fixture',logoPath:'',heroImagePath:images.length?images[i%images.length]:'',city:'Addis Ababa',zone:'Fixture zone',region:'Fixture region',latitude:9,longitude:38,fallbackStyle:'',sponsored:false,productionScale:'workshop',isLive:false,livePlatform:'',liveUrl:'',primaryIndustryKey:'retail',primaryIndustryLabel:'Retail',primaryIndustryShortLabel:'Retail'}}));
 const featured={mode:'featured',title:'Daily Featured',industryCode:'retail',industryLabel:'Retail',industryIcon:'store',selectedWeekday:2,isToday:false,dayLabel:'Tuesday',dateLabel:'20 October',boothCount:6,booths,schedule:Array.from({length:7},(_,i)=>({weekday:i,dayLabel:'Day '+i,dateIso:'2026-10-20',dateLabel:'20 Oct',mode:'featured',industryKey:'retail',industryLabel:'Retail',industryIcon:'store',isToday:false})),programPolicy:DEFAULT_FEATURED_PROGRAM_POLICY,scheduleMode:'automatic'};
 const sponsors=Array.from({length:count},(_,i)=>({id:'sponsor-'+(i+1),kind:'showroom',handle:'sponsor-'+(i+1),name:'Sponsored '+name+' '+(i+1),details:'Organized products from this business',imagePath:'',href:'/@sponsor-'+(i+1),actionLabel:'Open page',position:i}));
 createRoot(document.getElementById('root')!).render(<div className="public-app-shell"><div className="public-app-header"/><aside className="public-app-rail"/><main className="public-app-main"><div className="public-experience public-featured-experience"><Featured discovery={{featured,featuredNowBusinessId:null}} sponsoredShowrooms={sponsors}/></div></main></div>);
`},outfile:'/tmp/mirtpage-featured-layout.js',bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',define:{'process.env.NEXT_PUBLIC_SUQPAGE_TIKTOK_URL':'""','process.env.NEXT_PUBLIC_SUQPAGE_YOUTUBE_URL':'""'},plugins:[{name:'next-and-text-ports',setup(b){
 b.onResolve({filter:/^(?:next\/(?:image|link|navigation)|@\/lib\/i18n\/ui)$/},a=>({path:a.path,namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({resolveDir:process.cwd(),loader:'jsx',contents:
  a.path==='next/navigation'?`export const useRouter=()=>({refresh(){},replace(){}});`
  :a.path==='@/lib/i18n/ui'?`export const useUiText=()=> (value,args={})=>value.replace(/\{([^}]+)\}/g,(_,key)=>args[key]??key);`
  :a.path==='next/link'?`import React from'react';export default function Link(props){return <a {...props}/>;}`
  :`import React from'react';export default function Image({unoptimized,sizes,...props}){return <img {...props} data-image-source={props.src} data-image-unoptimized={String(Boolean(unoptimized))} src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'%3E%3Cpath fill='%23ccc' d='M0 0h4v3H0z'/%3E%3C/svg%3E"/>;}`
 }));
}}]});

let browser:Browser|undefined;after(async()=>{await browser?.close();});
for(const sponsors of [0,1,5])test(`FE-021/024 S151 ${sponsors} sponsors stay separate from container-sized Featured cards`,async t=>{
 const bundle=await compiled;browser??=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({reducedMotion:'reduce'});t.after(()=>context.close());
 const page=await context.newPage();page.setDefaultTimeout(10000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://featured.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
 await page.goto('http://featured.fixture/?sponsors='+sponsors);
 for(const file of ['app/globals.css','app/landing.css','app/discovery.css','app/navigation.css'])await page.addStyleTag({content:fs.readFileSync(file,'utf8')});
 await page.addStyleTag({content:bundle.outputFiles.find(file=>file.path.endsWith('.css'))!.text});
 await page.addScriptTag({content:bundle.outputFiles.find(file=>file.path.endsWith('.js'))!.text});
 try{await page.locator('.featured-card:not([disabled])').first().waitFor();}catch(error){assert.deepEqual(errors,[],'Actual component render errors');throw error;}
 for(const width of [1440,1100,1024,900,768,621,620,390,320]){
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  const geometry=await page.evaluate(()=>{
   const gallery=document.querySelector<HTMLElement>('.featured-gallery')!;const g=gallery.getBoundingClientRect();
   const sponsor=document.querySelector<HTMLElement>('#featured-sponsors');const s=sponsor?.getBoundingClientRect();
   const cards=[...gallery.querySelectorAll<HTMLElement>('.featured-card')].map(node=>{const r=node.getBoundingClientRect();return{id:node.dataset.businessId,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};});
   const visibleTargets=[...document.querySelectorAll<HTMLElement>('.featured-card,#featured-sponsors button,#featured-sponsors a')].filter(node=>{const r=node.getBoundingClientRect();return r.y>=0&&r.bottom<=innerHeight&&r.x>=0&&r.right<=innerWidth;});
   return{gallery:{x:g.x,right:g.right,width:g.width},sponsor:s?{x:s.x,y:s.y,right:s.right,bottom:s.bottom}:null,cards,tracks:getComputedStyle(gallery).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth+1,covered:visibleTargets.filter(node=>{const r=node.getBoundingClientRect();return !node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}).map(node=>node.getAttribute('aria-label')||node.dataset.businessId||node.tagName)};
  });
  assert.equal(geometry.cards.length,6);assert.deepEqual(geometry.cards.map(card=>card.id),['1','2','3','4','5','6']);
  assert.equal(geometry.overflow,false,`${width}px document overflow`);assert.deepEqual(geometry.covered,[],`${width}px a visible action is covered`);
  assert.ok(geometry.tracks>=1&&geometry.tracks<=3,`${width}px keeps a bounded column count`);
  if(width<=620)assert.equal(geometry.tracks,2,'Compact phone columns remain intact');
  for(const card of geometry.cards){
   assert.ok(card.x>=geometry.gallery.x-.5&&card.right<=geometry.gallery.right+.5,`${width}px card ${card.id} escaped actual gallery content width ${geometry.gallery.width}`);
   assert.ok(card.width>100&&card.height>=220,'Cards retain usable nonzero geometry');
   if(geometry.sponsor){const s=geometry.sponsor;assert.ok(Math.min(card.right,s.right)-Math.max(card.x,s.x)<=.5||Math.min(card.bottom,s.bottom)-Math.max(card.y,s.y)<=.5,`${width}px card ${card.id} intersects sponsor`);}
  }
  assert.equal(Boolean(geometry.sponsor),sponsors>0);
  if(sponsors>1){const order=geometry.cards.map(card=>card.id);const current=await page.locator('[data-sponsor-id]').getAttribute('data-sponsor-id');await page.getByRole('button',{name:'Next sponsor',exact:true}).click();await page.locator(`[data-sponsor-id]:not([data-sponsor-id="${current}"])`).waitFor();assert.deepEqual(await page.locator('.featured-card').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-business-id'))),order);}
 }
 await page.locator('.featured-card').first().click();await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('dialog').getByRole('link',{name:/Open page/}).getAttribute('href'),'/@fixture-1?ref=featured');await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});
 assert.deepEqual(errors,[]);
});

test('FE-021/DEP-049 both actual cover renderers preserve private URLs and the optimizer bypass flag',async t=>{
 const bundle=await compiled;browser??=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({reducedMotion:'reduce'});t.after(()=>context.close());const page=await context.newPage();
 await context.route('http://featured.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://featured.fixture/?sponsors=0&images=1');
 await page.addScriptTag({content:bundle.outputFiles.find(file=>file.path.endsWith('.js'))!.text});await page.locator('.featured-card img').first().waitFor();
 const inputs=await page.locator('.featured-card img').evaluateAll(images=>images.map(image=>({source:image.getAttribute('data-image-source'),bypass:image.getAttribute('data-image-unoptimized')})));
 assert.deepEqual(inputs,[0,1].flatMap(()=>[
  {source:'/uploads/seed/fixture-public.webp',bypass:'false'},
  {source:'/media/product-private-fixture.webp',bypass:'true'},
  {source:'/api/page-media/fixture',bypass:'true'},
 ]));
 // Compile the actual non-exported Market image function, selected by its TS
 // declaration rather than duplicating its conditional in a test renderer.
 const source=ts.createSourceFile('DiscoveryWorkspace.tsx',fs.readFileSync('components/DiscoveryWorkspace.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const renderer=source.statements.find((node):node is ts.FunctionDeclaration=>ts.isFunctionDeclaration(node)&&node.name?.text==='ShowroomImage');assert.ok(renderer);
 const market=await build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
  import React,{useState}from'react';import{createRoot}from'react-dom/client';
  function Image({unoptimized,sizes,...props}){return <img data-image-source={props.src} data-image-unoptimized={String(Boolean(unoptimized))} alt=""/>;}
  ${renderer.getText(source)}
  createRoot(document.getElementById('root')!).render(<>{['/uploads/seed/fixture-public.webp','/media/product-private-fixture.webp','/api/page-media/fixture'].map((heroImagePath,id)=><ShowroomImage key={id} showroom={{heroImagePath,name:'Business',fallbackStyle:''}}/>)}</>);
 `},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic'});
 const marketPage=await context.newPage();await marketPage.goto('http://featured.fixture/market-images');await marketPage.addScriptTag({content:market.outputFiles[0].text});await marketPage.locator('[data-image-source]').first().waitFor({state:'attached'});
 assert.deepEqual(await marketPage.locator('[data-image-source]').evaluateAll(images=>images.map(image=>({source:image.getAttribute('data-image-source'),bypass:image.getAttribute('data-image-unoptimized')}))),inputs.slice(0,3));
 for(const input of inputs.slice(0,3)){
  assert.ok(input.source);
  const {props}=getImageProps({src:input.source,alt:'',width:480,height:300,unoptimized:input.bypass==='true'});
  if(input.bypass==='true'){
   assert.equal(props.src,input.source,'Actual Next preserves the original revocable media URL');
   assert.equal(props.srcSet,undefined,'Actual Next emits no optimized variants for revocable media');
  }else assert.ok(props.src.startsWith('/_next/image?'),'Public static media retains responsive optimization');
 }
 // Controlled Image ports report production inputs, not Next/CDN output;
 // extracted Market renderer evidence is narrower than a full Market workflow.
});
