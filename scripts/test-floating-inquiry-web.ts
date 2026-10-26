import {TRANSPORT_COPY} from '../lib/i18n/transport-copy';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {build} from 'esbuild';
import {chromium,type Page} from 'playwright';
import type {Catalog,Product,Business} from '../lib/types';
import type {PublicContacts} from '../lib/business-profile-contacts';
import {accentContrast,storefrontAccent} from '../lib/storefront-accent';

// Real React, ShowroomApp state, InquiryDrawer, dock/portal, PublicSupportChat,
// localStorage and selection/message contracts. Presentation, navigation,
// clipboard and network ports are controlled; this is not an API/device test.
const require=createRequire(import.meta.url);
const bundled=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React,{useLayoutEffect} from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import InquiryReadMarker from './components/InquiryReadMarker';
 import ShowroomApp from './components/showroom/ShowroomApp';import PublicSupportChat from './components/PublicSupportChat';
 import {PublicActionDockProvider} from './components/PublicActionDock';
 const root=createRoot(document.getElementById('root')),f=window.fixture;
 const originalPush=history.pushState.bind(history);history.pushState=(...args)=>{originalPush(...args);window.dispatchEvent(new Event('fixture-navigation'));};
 f.pendingReceipts=[];f.deferReceipt=false;f.inquiryBodies=[];f.inquiryFailure=false;f.reads=0;
 const response=(url,ok=true)=>new Response(JSON.stringify(String(url).includes('/api/attention')?{unread:0}:{conversation:f.receipt||null}),{status:ok?200:503,headers:{'content-type':'application/json'}});
 f.releaseReceipt=(ok=true)=>{const pending=f.pendingReceipts.shift();if(!pending)throw new Error('No held receipt GET');pending.resolve(response(pending.url,ok));};
 window.fetch=async(url,init)=>{f.network.push({url:String(url),method:init?.method||'GET'});if(String(url).endsWith('/api/inquiries/77/read')&&init?.method==='POST'){f.reads++;return new Response(JSON.stringify({readAt:'2026-10-21T00:00:00Z'}),{status:200});}if(String(url).includes('/api/inquiries')&&init?.method==='POST'){f.inquiryBodies.push(JSON.parse(init.body));return new Response(JSON.stringify(f.inquiryFailure?{error:'Temporary inquiry failure'}:{inquiryId:77,duplicate:f.inquiryBodies.length>1,status:'received'}),{status:f.inquiryFailure?503:201,headers:{'content-type':'application/json'}});}if(f.deferReceipt&&String(url).includes('/api/public-support')&&(!init?.method||init.method==='GET'))return new Promise((resolve,reject)=>{const pending={url,resolve};f.pendingReceipts.push(pending);init?.signal?.addEventListener('abort',()=>{f.pendingReceipts=f.pendingReceipts.filter(item=>item!==pending);reject(new DOMException('Aborted','AbortError'));},{once:true});});return response(url);};
 function Stage({catalog,preview=false,contacts={whatsapp:'+447700900123'},accentColor}){
  useLayoutEffect(()=>{
   f.commits.push({handle:catalog?.business.handle||null,actions:[...document.querySelectorAll('[data-inquiry-floating]')].map(el=>({tag:el.tagName,href:el.getAttribute('href'),label:el.getAttribute('aria-label'),count:el.querySelector('b')?.textContent})),dialogs:[...document.querySelectorAll('[role=dialog]')].map(el=>el.textContent)});
   if(catalog&&f.contactDuringLayout===catalog.business.handle){f.contactDuringLayout=null;document.querySelector('[data-profile-contact]')?.click();}
  },[catalog]);
  return <PublicActionDockProvider enabled={!preview} transport={<PublicSupportChat/>}>{catalog?<ShowroomApp catalog={catalog} withinPublicApp businessProfile={{template:'profile-v1',coverStyle:'blended',about:'A real showroom description.',introduction:'',heroImage:'',videoUrl:'',contacts,accentColor}} previewMode={preview}/>:<section><h1>Public browse</h1></section>}</PublicActionDockProvider>;
 }
 f.mountRead=(hidden,readAt)=>flushSync(()=>root.render(<div style={{display:hidden?'none':'block'}}><InquiryReadMarker inquiryId={77} businessId={1} readAt={readAt}/></div>));
 f.mount=(catalog,preview=false,contacts,accentColor)=>flushSync(()=>root.render(<Stage catalog={catalog} preview={preview} contacts={contacts} accentColor={accentColor}/>));
`},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',plugins:[{name:'floating-inquiry-ports',setup(builder){
 builder.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));
 builder.onResolve({filter:/\.css$/},args=>({path:resolve(args.resolveDir,args.path),namespace:'css'}));builder.onLoad({filter:/.*/,namespace:'css'},args=>({loader:'js',contents:(args.path.endsWith('/PublicActionDock.module.css')?`const style=document.createElement('style');style.textContent=${JSON.stringify(readFileSync(args.path,'utf8').replace(/:global\(([^)]+)\)/g,'$1'))};document.head.append(style);`:'')+'export default new Proxy({}, {get:(_,key)=>String(key)});'}));
 builder.onResolve({filter:/^(?:next\/(?:navigation|link)|@\/lib\/(?:i18n\/ui|browser-clipboard|showroom-bank-release|showroom-composition-v2|showroom-content-blocks|showroom-chapters|showroom-manifests|product-detail-patterns)|@\/components\/(?:LanguageSelector|SuqpageBrand)|\.\/(?:BusinessProfile|ProductPage|designs|BuyingConversation)|\.\.\/(?:SocialVideoFrame|PublicBusinessSafety)|\.\/bank\/(?:CompositionShowroom|tokens))$/},args=>({path:args.path,namespace:'ports'}));
 builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',contents:
  args.path==='@/lib/i18n/ui'?`const t=(source,values={})=>source.replace(/\\{([^}]+)\\}/g,(_,key)=>String(values[key]??'{'+key+'}'));export const useUiText=()=>t;`
  :args.path==='next/navigation'?`import {useMemo,useSyncExternalStore} from 'react';const router={push:value=>history.pushState(null,'',value),back:()=>history.back(),refresh:()=>{}};export const useRouter=()=>router;const subscribe=update=>{window.addEventListener('fixture-navigation',update);window.addEventListener('popstate',update);return()=>{window.removeEventListener('fixture-navigation',update);window.removeEventListener('popstate',update);};};export const usePathname=()=>useSyncExternalStore(subscribe,()=>location.pathname);export function useSearchParams(){const value=useSyncExternalStore(subscribe,()=>location.search);return useMemo(()=>new URLSearchParams(value),[value]);}`
  :args.path==='next/link'?`export default function Link({href,children,...props}){return <a href={href} {...props} onClick={event=>{event.preventDefault();history.pushState(null,'',href);}}>{children}</a>;}`
  :args.path==='@/lib/browser-clipboard'?`export async function copyBrowserText(message){window.fixture.copied.push(message);return window.fixture.copyAllowed;}export async function openCopiedBrowserLink(message,href,external){window.fixture.copied.push(message);window.fixture.handoffs.push({message,href,external});return {copied:window.fixture.copyAllowed,opened:window.fixture.openAllowed};}`
  :args.path==='./BusinessProfile'?`export default function Profile(p){return <section data-business-profile><h1>{p.catalog.business.name}</h1><a data-profile-contact href='#contact' onClick={event=>{event.preventDefault();void p.onContact?.(event,{kind:'whatsapp',href:'https://wa.me/447700900123',external:true,label:'WhatsApp'});}}>Contact shop</a>{p.productDetail||<div>{p.products.map(product=><article key={product.id}><h2>{product.name}</h2><button onClick={()=>p.addProduct(product)}>Save {product.name}</button><button onClick={()=>p.openProduct(product)}>Details {product.name}</button></article>)}</div>}</section>;}`
  :args.path==='./ProductPage'?`import {useState} from 'react';export default function Detail(p){const[options,setOptions]=useState(()=>Object.fromEntries((p.product?.option_groups||[]).map(g=>[g.name,g.values[0]?.value||''])));return <section data-fixture-detail>{p.product?<><h2>{p.product.name}</h2>{(p.product.option_groups||[]).map(g=><div key={g.id}><label htmlFor={'fixture-option-'+g.id}>{g.name}</label><select id={'fixture-option-'+g.id} value={options[g.name]} onChange={event=>setOptions({...options,[g.name]:event.target.value})}>{g.values.map(v=><option key={v.id}>{v.value}</option>)}</select></div>)}<button disabled={!p.ready} onClick={()=>p.onAdd(options)}>Save current product</button><button disabled={!p.ready} onClick={()=>p.onInquire(options)}>Inquire directly</button></>:<p>Item unavailable</p>}<button onClick={p.onBack}>Back to products</button></section>;}`
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
  :args.path==='./BuyingConversation'?`export default function Recovered({initial}){return <p>Recovered {initial.publicRef}</p>;}`
  :`export default ()=>null;`}));
}}]});

type Saved={productId:number;quantity:string;options:Record<string,string>};
type Fixture={reads:number;mountRead:(hidden:boolean,readAt:string|null)=>void;inquiryBodies:Array<{businessId:number;customerName:string;contact:string;note:string;items:Array<{productId:number}>;idempotencyKey:string}>;inquiryFailure:boolean;mount:(catalog:Catalog|null,preview?:boolean,contacts?:PublicContacts,accentColor?:string)=>void;copied:string[];handoffs:Array<{message:string;href:string;external:boolean}>;network:Array<{url:string;method:string}>;commits:Array<{handle:string|null;actions:Array<{tag:string;href:string|null;label:string|null;count:string|null}>;dialogs:string[]}>;contactDuringLayout:string|null;receipt:unknown;deferReceipt:boolean;pendingReceipts:unknown[];releaseReceipt:(ok?:boolean)=>void;copyAllowed:boolean;openAllowed:boolean};
const business=(id:number,handle:string,name:string):Business=>({id,handle,name,design_key:'novatech',design_manifest_json:'{}',content_blocks_json:'{}',tagline:'',description:'',logo_path:'',hero_title:'',hero_subtitle:'',hero_image_path:'',contact_email:'private-owner@example.test',public_email:'',public_phone:'',whatsapp:'',telegram:'',tiktok:'',process_video_ref:'',is_live:0,live_platform:'',live_url:'',status:'active',site_title:'',site_description:'',favicon_path:'',content_version:1});
const product=(id:number,businessId:number,name:string,patch:Partial<Product>={}):Product=>({id,business_id:businessId,collection_id:null,category_id:null,name,slug:'product-'+id,eyebrow:'',description:'A physical fixture product.',image_path:'',video_ref:'',price_minor:null,currency:'ETB',quantity_unit:'piece',highlights_json:'[]',highlights:[],availability:'available',offering_kind:'standard_product',quantity_mode:'optional',capacity_summary:'',minimum_order_summary:'',lead_time_summary:'',is_published:1,sort_order:id,option_groups:[],...patch});
const a:Catalog={business:business(1,'fixture-shop-a','Fixture shop A'),collections:[],categories:[],products:[product(101,1,'Saved cup'),product(102,1,'Direct plate'),product(103,1,'Retired repair',{offering_kind:'service'}),product(104,1,'Private bowl',{is_published:0}),product(105,1,'Unavailable bowl',{availability:'unavailable'}),product(106,2,'Foreign tenant item'),product(107,1,'Variant scarf',{option_groups:[{id:71,product_id:107,name:'Color',position:0,values:[{id:72,option_group_id:71,value:'Blue'},{id:73,option_group_id:71,value:'Red'}]}]})]};
const b:Catalog={business:business(2,'fixture-shop-b','Fixture shop B'),collections:[],categories:[],products:[product(201,2,'Shop B vase')]};
const key=(catalog:Catalog)=>'suqpage-cart:'+catalog.business.handle;

async function boot(page:Page,catalog=a,initial?:Saved[],preview=false,receipt:unknown=null,contacts?:PublicContacts){
 page.setDefaultTimeout(8000);
 const bootErrors:string[]=[];page.on('pageerror',error=>bootErrors.push(error.message));
 await page.route('http://suqpage.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<main id="root"></main>'}));
 await page.goto('http://suqpage.fixture/@'+catalog.business.handle);
 if(initial)await page.evaluate(({key,initial})=>localStorage.setItem(key,JSON.stringify(initial)),{key:key(catalog),initial});
 await page.evaluate(receipt=>{(window as unknown as{fixture:unknown}).fixture={copied:[],handoffs:[],network:[],commits:[],contactDuringLayout:null,copyAllowed:true,openAllowed:true,receipt};},receipt);
 await page.addScriptTag({content:(await bundled).outputFiles[0].text});
 await page.evaluate(({catalog,preview,contacts})=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog,preview,contacts),{catalog,preview,contacts});
 try{await page.getByRole('heading',{name:catalog.business.name,exact:true}).waitFor();}catch(error){throw new Error(`Fixture render failed: ${bootErrors.join('; ')}; body=${(await page.locator('body').textContent())?.slice(0,1200)}`,{cause:error});}
 await page.waitForFunction(()=>!document.querySelector('[data-public-action-dock] button[disabled]'));
}
const floating=(page:Page)=>page.locator('[data-inquiry-floating]:visible');
const currentAction=(page:Page)=>page.locator('button[data-inquiry-floating]');
const fallback=(page:Page)=>page.locator('a[data-inquiry-floating]:visible');
const composer=(page:Page)=>page.getByRole('dialog',{name:'Business inquiry',exact:true});
const saved=(page:Page,catalog=a)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]') as Saved[],key(catalog));
async function count(page:Page,value:number){await page.waitForFunction(value=>{const actions=[...document.querySelectorAll('[data-inquiry-floating]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');return value===0?actions.length===0:actions.length===1&&actions[0].querySelector('b')?.textContent===String(value);},value);}
async function noAutomaticSend(page:Page){const ports=await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;return{network:f.network,handoffs:f.handoffs,copied:f.copied};});assert.ok(ports.network.every(r=>r.method==='GET'),'Opening/adding is never a server send');return ports;}
async function floatingFocus(page:Page){try{await page.waitForFunction(()=>document.activeElement?.matches('[data-inquiry-floating]'),undefined,{timeout:3000});}catch(error){throw new Error(`Floating focus was not restored: ${await page.evaluate(()=>JSON.stringify({active:{tag:document.activeElement?.tagName,label:document.activeElement?.getAttribute('aria-label')},actions:[...document.querySelectorAll('[data-inquiry-floating]')].map(el=>({tag:el.tagName,label:el.getAttribute('aria-label'),inert:Boolean(el.closest('[inert]')),visible:el.getClientRects().length>0}))}))}`,{cause:error});}}

test('FE-054 floating inquiry keeps the current Page accent through its portal, extremes and business switches',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 const cssHex=(value:string)=>'#'+value.match(/\d+/g)!.slice(0,3).map(value=>Number(value).toString(16).padStart(2,'0')).join('').toUpperCase();
 try{const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',error=>errors.push(error.message));
  await boot(page,a,[{productId:101,quantity:'3 boxes',options:{}}]);await count(page,1);await page.mouse.move(0,0);
  const transport=page.locator('.public-support-launcher button');
  const transportBefore=await transport.evaluate(el=>({style:el.getAttribute('style'),color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
  for(const accentColor of [undefined,'#087F75','#B6FF00','#FFFFFF','#000000','invalid','']){
   await page.evaluate(({catalog,accentColor})=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog,false,undefined,accentColor),{catalog:a,accentColor});await count(page,1);
   const actual=await currentAction(page).evaluate(el=>{const s=getComputedStyle(el),b=getComputedStyle(el.querySelector('b')!),icon=getComputedStyle(el.querySelector('svg')!);return{background:s.backgroundColor,color:s.color,border:s.borderTopColor,badge:b.backgroundColor,badgeColor:b.color,icon:icon.color,height:el.getBoundingClientRect().height,portalled:!el.closest('[data-business-profile]')};});
   const palette=storefrontAccent(accentColor);
   assert.equal(cssHex(actual.background),palette?.accent||'#FFFFFF');assert.equal(cssHex(actual.color),palette?.on||'#A43107');assert.equal(cssHex(actual.icon),cssHex(actual.color));assert.equal(cssHex(actual.border),palette?.edge||'#EAD3C5');
   assert.equal(cssHex(actual.badge),palette?.on||'#B83200');assert.equal(cssHex(actual.badgeColor),palette?.accent||'#FFFFFF');assert.ok(accentContrast(cssHex(actual.color),cssHex(actual.background))>=4.5);assert.ok(accentContrast(cssHex(actual.badgeColor),cssHex(actual.badge))>=4.5);
   assert.ok(actual.portalled,'Saved Page colors reach the actual shell portal');assert.ok(actual.height>=48);assert.deepEqual(await transport.evaluate(el=>({style:el.getAttribute('style'),color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor})),transportBefore,'Merchant accent never recolors transport');
  }
  await page.evaluate(({catalog,key})=>{localStorage.setItem(key,JSON.stringify([{productId:201,quantity:'1 vase',options:{}}]));history.pushState(null,'','/@'+catalog.business.handle);(window as unknown as{fixture:Fixture}).fixture.mount(catalog,false,undefined,'#7900FF');},{catalog:b,key:key(b)});await count(page,1);
  assert.equal(cssHex(await currentAction(page).evaluate(el=>getComputedStyle(el).backgroundColor)),'#7900FF');await floating(page).click();await composer(page).waitFor();assert.match(await composer(page).textContent()||'',/Shop B vase/);assert.doesNotMatch(await composer(page).textContent()||'',/Saved cup/);await page.keyboard.press('Escape');await floatingFocus(page);
  await page.evaluate(catalog=>{history.pushState(null,'','/@'+catalog.business.handle);(window as unknown as{fixture:Fixture}).fixture.mount(catalog);},a);await count(page,1);await page.mouse.move(0,0);assert.equal(cssHex(await currentAction(page).evaluate(el=>getComputedStyle(el).backgroundColor)),'#FFFFFF','A default Page does not inherit B color');assert.equal((await saved(page,a))[0].quantity,'3 boxes');
  await noAutomaticSend(page);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-075 equal phone choices preserve approved contacts and copied drafts through opener failures',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 try{
  const page=await browser.newPage({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});page.on('pageerror',error=>errors.push(error.message));
  const contacts={phone:'+447700900123',whatsapp:'+447700900123',telegram:'+447700900123',tiktok:'fixture_shop',instagram:'fixture_shop',facebook:'fixture_shop'};
  for(const demo of [false,true]){
   const catalog:Catalog={...a,business:{...a.business,is_demo:demo?1:0,approvedDemoContactMethods:demo?['phone','whatsapp','telegram']:undefined}};
   await boot(page,catalog,[{productId:101,quantity:'3 boxes',options:{}}],false,null,contacts);await floating(page).click();await composer(page).waitFor();assert.equal(await composer(page).getByLabel('Your message',{exact:true}).count(),0,'The phone channel chooser has no editable custom message');
   for(const label of ['TikTok','Instagram','Facebook'])assert.equal(await composer(page).getByRole('link',{name:new RegExp(label)}).count(),0,'Profile accounts are outside the inquiry composer');
   for(const label of ['WhatsApp','Telegram','SMS']){
    await composer(page).getByRole('link',{name:new RegExp(label==='SMS'?'^SMS$':'Send on '+label)}).click();
    const ports=await noAutomaticSend(page),handoff=ports.handoffs.at(-1)!;assert.match(handoff.message,/Saved cup[\s\S]*3 boxes/);
    assert.ok(!handoff.message.includes('private-owner@example.test'));
    const url=new URL(handoff.href);assert.equal(url.searchParams.get(label==='SMS'?'body':'text'),handoff.message);
    if(label==='Telegram')assert.equal(url.pathname,'/+447700900123');
    assert.equal(ports.copied.at(-1),handoff.message,'Every channel copies without a prior manual-copy action');
   }
   await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.copyAllowed=false;f.openAllowed=false;});
   await composer(page).getByRole('link',{name:/Send on WhatsApp/}).click();
   await composer(page).getByRole('textbox',{name:'Copy message',exact:true}).waitFor();
   await composer(page).getByRole('alert').filter({hasText:'Could not open the social app.'}).waitFor();
   assert.equal(await composer(page).getByLabel('Your message',{exact:true}).count(),0,'External handoff never exposes the Inbox editor');
   assert.equal(await composer(page).getByRole('link',{name:'WhatsApp ↗',exact:true}).count(),1);
   await page.keyboard.press('Escape');
  }
  const residual:Catalog={...a,business:{...a.business,is_demo:1,approvedDemoContactMethods:['phone']}};
  await boot(page,residual,[{productId:101,quantity:'',options:{}}],false,null,contacts);await floating(page).click();
  assert.equal(await composer(page).getByRole('link',{name:'Send on WhatsApp',exact:true}).count(),0);
  assert.equal(await composer(page).getByRole('link',{name:'Send on Telegram',exact:true}).count(),0);
  assert.equal(await composer(page).getByRole('link',{name:'SMS',exact:true}).count(),1);
  await composer(page).getByRole('button',{name:'Copy message',exact:true}).click();
  const ports=await noAutomaticSend(page);assert.equal(ports.handoffs.length,0,'Reserved or unapproved demo contacts never open');assert.equal(ports.copied.length,1);
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-041 S113 saved inquiry count and direct composition stay independent, private and deliberately sent',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 try{const page=await browser.newPage({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});page.on('pageerror',error=>errors.push(error.message));await boot(page);await count(page,0);
  await page.getByRole('button',{name:'Save Saved cup',exact:true}).click();await count(page,1);assert.match(await floating(page).getAttribute('aria-label')||'',/1 item/);
  await page.getByRole('button',{name:'Save Saved cup',exact:true}).click();await count(page,1);assert.equal((await saved(page)).length,1);
  const original=await saved(page);let ports=await noAutomaticSend(page);assert.deepEqual(ports.copied,[]);assert.deepEqual(ports.handoffs,[]);
  await page.getByRole('button',{name:'Details Direct plate',exact:true}).click();await page.getByRole('button',{name:'Inquire directly',exact:true}).click();await composer(page).waitFor();
  assert.equal(await page.locator('[data-public-action-dock]').getAttribute('inert'),'');assert.equal(await page.locator('[data-public-action-dock]').getAttribute('aria-hidden'),'true');
  assert.ok((await composer(page).textContent())?.includes('Direct plate'));assert.ok(!(await composer(page).textContent())?.includes('Saved cup'));
  await composer(page).getByText('Add quantity (optional)',{exact:true}).click();await composer(page).getByLabel('Quantity',{exact:true}).fill(' 7  boxes ');
  await composer(page).getByRole('button',{name:'Copy message',exact:true}).click();
  let last=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.copied.at(-1)!);assert.ok(last.includes('Direct plate')&&last.includes('Quantity: 7 boxes'));assert.ok(!last.includes('Saved cup')&&!last.includes('private-owner@example.test'));assert.deepEqual(await saved(page),original);
  await page.keyboard.press('Escape');await composer(page).waitFor({state:'hidden'});await count(page,1);
  await floating(page).click();await composer(page).waitFor();assert.ok((await composer(page).textContent())?.includes('Saved cup'));assert.ok(!(await composer(page).textContent())?.includes('Direct plate'));
  await composer(page).getByRole('button',{name:'Copy message',exact:true}).click();last=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.copied.at(-1)!);assert.ok(last.includes('Saved cup')&&!last.includes('Direct plate')&&!last.includes('private-owner@example.test'));
  await composer(page).getByRole('link',{name:/Send on WhatsApp/}).click();ports=await noAutomaticSend(page);assert.equal(ports.handoffs.length,1,'External preparation only follows the explicit social tap');assert.equal(new URL(ports.handoffs[0].href).searchParams.get('text'),last);
  await page.keyboard.press('Escape');await composer(page).waitFor({state:'hidden'});await floatingFocus(page);
  await floating(page).click();await composer(page).getByRole('button',{name:'Remove Saved cup from inquiry',exact:true}).click();assert.match(await composer(page).textContent()||'',/Send to AfricMade Inbox/);await page.keyboard.press('Escape');await count(page,0);assert.deepEqual(await saved(page),[]);await page.waitForFunction(()=>document.activeElement?.matches('[data-profile-contact]'));
  await page.evaluate(catalog=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog,true),a);await count(page,0);assert.equal(await page.locator('[data-public-action-dock]').count(),0,'Private preview creates no public action stack');
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-041 S113 canonical refresh preserves the remaining selection identity and never substitutes a saved group for an invalid direct product',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 try{const page=await browser.newPage({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});page.on('pageerror',error=>errors.push(error.message));await boot(page,a,[{productId:101,quantity:'cup quantity',options:{}},{productId:102,quantity:'plate quantity',options:{}}]);await count(page,2);await floating(page).click();await composer(page).waitFor();
  const withoutCup:Catalog={...a,products:a.products.map(product=>product.id===101?{...product,availability:'unavailable'}:product)};
  await page.evaluate(catalog=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog),withoutCup);await composer(page).getByRole('heading',{name:'Direct plate',exact:true}).waitFor();assert.equal(await composer(page).getByRole('heading',{name:'Saved cup',exact:true}).count(),0);
  await composer(page).getByText('Quantity: plate quantity',{exact:true}).click();await composer(page).getByLabel('Quantity',{exact:true}).fill('new plate quantity');await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)||'[]').some((item:Saved)=>item.productId===102&&item.quantity==='new plate quantity'),key(a));
  await composer(page).getByRole('button',{name:'Copy message',exact:true}).click();let ports=await noAutomaticSend(page);assert.match(ports.copied.at(-1)||'',/Direct plate[\s\S]*new plate quantity/);assert.ok(!ports.copied.at(-1)?.includes('Saved cup'));
  await composer(page).getByRole('button',{name:'Remove Direct plate from inquiry',exact:true}).click();await page.keyboard.press('Escape');await count(page,0);assert.deepEqual(await saved(page),[]);
  await boot(page,a,[{productId:101,quantity:'',options:{}}]);await page.getByRole('button',{name:'Details Direct plate',exact:true}).click();await page.getByRole('button',{name:'Inquire directly',exact:true}).click();await composer(page).waitFor();
  const withoutPlate:Catalog={...a,products:a.products.map(product=>product.id===102?{...product,availability:'unavailable'}:product)};
  await page.evaluate(catalog=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog),withoutPlate);assert.match(await composer(page).textContent()||'',/This product is not available for inquiry/);assert.ok(!(await composer(page).textContent())?.includes('Saved cup'));assert.equal(await composer(page).getByRole('button',{name:'Copy message',exact:true}).count(),0,'An unavailable direct target cannot silently fall back to the saved group');assert.deepEqual(await saved(page),[{productId:101,quantity:'',options:{}}]);
  await noAutomaticSend(page);
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-041 S113 saved variants persist, prune against authority and never leak across a reused showroom',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 try{const page=await browser.newPage({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});page.on('pageerror',error=>errors.push(error.message));await boot(page);
  await page.getByRole('button',{name:'Details Variant scarf',exact:true}).click();await page.getByRole('button',{name:'Save current product',exact:true}).click();await count(page,1);await page.getByLabel('Color',{exact:true}).selectOption('Red');await page.getByRole('button',{name:'Save current product',exact:true}).click();await count(page,2);await page.getByRole('button',{name:'Save current product',exact:true}).click();await count(page,2);
  assert.deepEqual((await saved(page)).map(item=>item.options.Color),['Blue','Red']);assert.ok((await saved(page)).every(item=>Object.keys(item).sort().join(',')==='options,productId,quantity'),'Storage contains references/options, not product/contact snapshots');
  await boot(page);await count(page,2);await floating(page).click();await composer(page).getByRole('button',{name:'Clear inquiry list',exact:true}).click();await page.keyboard.press('Escape');await count(page,0);
  const invalid:Saved[]=[{productId:103,quantity:'',options:{}},{productId:104,quantity:'',options:{}},{productId:105,quantity:'',options:{}},{productId:106,quantity:'',options:{}},{productId:107,quantity:'2',options:{Color:'Purple'}},{productId:107,quantity:'3',options:{Color:'Blue'}},{productId:107,quantity:'duplicate',options:{Color:'Blue'}}];
  await boot(page,a,invalid);await count(page,1);assert.deepEqual(await saved(page),[{productId:107,quantity:'3',options:{Color:'Blue'}}]);
  const beforeA=await saved(page);await page.evaluate(({key,items})=>localStorage.setItem(key,JSON.stringify(items)),{key:key(b),items:[{productId:201,quantity:'4',options:{}}]});
  await page.getByRole('button',{name:'Details Direct plate',exact:true}).click();await page.getByRole('button',{name:'Inquire directly',exact:true}).click();await composer(page).waitFor();
  const copiesBefore=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.copied.length);
  await page.evaluate(catalog=>{const f=(window as unknown as{fixture:Fixture}).fixture;history.pushState(null,'','/@'+catalog.business.handle);f.contactDuringLayout=catalog.business.handle;f.mount(catalog);},b);
  await count(page,1);await composer(page).waitFor({state:'hidden'});
  const switched=await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;return{commit:f.commits.findLast(c=>c.handle==='fixture-shop-b'),copies:f.copied.length};});
  assert.equal(switched.commit?.actions.length,0,'During B hydration no A cart or fallback is rendered');assert.ok(switched.commit?.dialogs.every(text=>!text.includes('Direct plate')&&!text.includes('Variant scarf')));assert.equal(switched.copies,copiesBefore,'A contact tapped during B hydration cannot prepare A selections for B');assert.deepEqual(await saved(page,a),beforeA);
  await floating(page).click();await composer(page).getByRole('button',{name:'Copy message',exact:true}).click();const message=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.copied.at(-1)!);assert.ok(message.includes('Fixture shop B')&&message.includes('Shop B vase'));assert.ok(!message.includes('Variant scarf')&&!message.includes('Direct plate')&&!message.includes('private-owner@example.test'));
  await noAutomaticSend(page);
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-036 S113 transport opens in one action without sending and keeps the same unsent intake across showrooms',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 try{const page=await browser.newPage({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});page.on('pageerror',error=>errors.push(error.message));await boot(page,a,[{productId:101,quantity:'',options:{}}]);await count(page,1);
  const order=await page.locator('[data-public-action-dock] button').evaluateAll(buttons=>buttons.map(button=>button.textContent));assert.match(order[0]||'',/Inquiry list/);assert.ok((order[1]||'').includes(TRANSPORT_COPY.launcherTitle));assert.ok((order[1]||'').includes(TRANSPORT_COPY.launcherSubtitle));
  await page.getByRole('button',{name:`${TRANSPORT_COPY.launcherTitle} · ${TRANSPORT_COPY.launcherSubtitle}`,exact:true}).click();const transport=page.locator('dialog[open]');await transport.getByLabel('From',{exact:true}).waitFor();await transport.getByLabel('Name',{exact:true}).fill('Unsent fixture name');await transport.getByLabel('From',{exact:true}).fill('Town A');await transport.getByLabel('To',{exact:true}).fill('Town B');
  let ports=await noAutomaticSend(page);assert.deepEqual(ports.handoffs,[]);assert.deepEqual(ports.copied,[]);await transport.getByRole('button',{name:'Close',exact:true}).click();
  await page.evaluate(()=>history.pushState(null,'','/tracking?reference=SHP-FIXTURE'));await transport.waitFor({state:'hidden'});
  await page.evaluate(()=>history.pushState(null,'','/?chat=other'));await transport.waitFor({state:'hidden'});
  await page.evaluate(()=>history.pushState(null,'','/?chat=transport'));await transport.waitFor();await transport.getByLabel('From',{exact:true}).waitFor();
  assert.equal(await transport.getByLabel('From',{exact:true}).inputValue(),'Town A','The Tracking return opens the same unsent draft from the current route');
  await transport.getByRole('button',{name:'Close',exact:true}).click();
  await page.evaluate(()=>history.pushState(null,'','/@fixture-shop-a?chat=other'));await transport.waitFor({state:'hidden'});
  await page.evaluate(catalog=>{history.pushState(null,'','/@'+catalog.business.handle);(window as unknown as{fixture:Fixture}).fixture.mount(catalog);},b);await count(page,0);assert.equal(await currentAction(page).count(),0,'Empty B does not pretend to own A selections');assert.equal(await fallback(page).count(),0);await page.getByRole('button',{name:`${TRANSPORT_COPY.launcherTitle} · ${TRANSPORT_COPY.launcherSubtitle}`,exact:true}).click();await transport.getByLabel('Name',{exact:true}).waitFor();assert.equal(await transport.getByLabel('Name',{exact:true}).inputValue(),'Unsent fixture name');assert.equal(await transport.getByLabel('From',{exact:true}).inputValue(),'Town A');assert.equal(await transport.getByLabel('To',{exact:true}).inputValue(),'Town B');ports=await noAutomaticSend(page);assert.deepEqual(ports.handoffs,[]);assert.deepEqual(ports.copied,[]);
  await transport.getByRole('button',{name:'Close',exact:true}).click();await page.evaluate(()=>{(window as unknown as{fixture:Fixture}).fixture.receipt={publicRef:'SUP-FIXTURE-RECOVERED',status:'open',messages:[]};});await page.getByRole('button',{name:`${TRANSPORT_COPY.launcherTitle} · ${TRANSPORT_COPY.launcherSubtitle}`,exact:true}).click();await page.getByText('Recovered SUP-FIXTURE-RECOVERED',{exact:true}).waitFor();assert.equal(await transport.getByLabel('From',{exact:true}).count(),0,'Existing session recovery is opened, not silently replaced');await noAutomaticSend(page);
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-041 S118 public navigation hides carts while each business retains its independent saved group',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 try{const page=await browser.newPage({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});page.on('pageerror',error=>errors.push(error.message));await boot(page,a,[{productId:101,quantity:'2',options:{}}]);await count(page,1);
  for(const path of ['/','/featured','/about']){await page.evaluate(path=>{history.pushState(null,'',path);(window as unknown as{fixture:Fixture}).fixture.mount(null);},path);await page.getByRole('heading',{name:'Public browse',exact:true}).waitFor();await count(page,0);assert.equal(await fallback(page).count(),0);assert.equal(await page.getByRole('button',{name:`${TRANSPORT_COPY.launcherTitle} · ${TRANSPORT_COPY.launcherSubtitle}`,exact:true}).count(),1);}
  await page.evaluate(catalog=>{history.pushState(null,'','/@'+catalog.business.handle);(window as unknown as{fixture:Fixture}).fixture.mount(catalog);},b);await page.getByRole('heading',{name:b.business.name,exact:true}).waitFor();await count(page,0);assert.deepEqual(await saved(page,b),[]);
  await page.getByRole('button',{name:'Save Shop B vase',exact:true}).click();await count(page,1);assert.deepEqual(await saved(page,a),[{productId:101,quantity:'2',options:{}}]);assert.equal((await saved(page,b))[0].productId,201);
  const canonical:Catalog={...a,products:a.products.map(product=>product.id===101?{...product,name:'Canonical current cup'}:product)};
  await page.evaluate(catalog=>{history.pushState(null,'','/@'+catalog.business.handle+'?inquiry=list');(window as unknown as{fixture:Fixture}).fixture.mount(catalog);},canonical);await composer(page).waitFor();
  assert.match(await composer(page).textContent()||'',/Canonical current cup/);assert.ok(!(await composer(page).textContent())?.includes('Shop B vase'));assert.equal(new URL(page.url()).searchParams.has('inquiry'),false,'The consumed one-action restoration cannot reopen on ordinary rerender');
  let ports=await noAutomaticSend(page);assert.deepEqual(ports.copied,[]);assert.deepEqual(ports.handoffs,[]);
  await composer(page).getByRole('button',{name:'Copy message',exact:true}).click();ports=await noAutomaticSend(page);assert.match(ports.copied.at(-1)||'',/Canonical current cup/);assert.ok(!ports.copied.at(-1)?.includes('Saved cup'));assert.equal(ports.handoffs.length,0);
  await page.keyboard.press('Escape');await composer(page).waitFor({state:'hidden'});await count(page,1);await floatingFocus(page);assert.equal(await currentAction(page).count(),1);assert.equal(await fallback(page).count(),0,'The current shop has one floating action and no fallback');assert.equal((await saved(page,b))[0].productId,201);
  await page.evaluate(catalog=>(window as unknown as{fixture:Fixture}).fixture.mount(catalog),{...canonical});assert.equal(await composer(page).count(),0);await noAutomaticSend(page);
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-036 S113 transport session refresh shows loading until settlement and retry preserves the unsent draft',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000}),errors:string[]=[];
 try{const page=await browser.newPage({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});page.on('pageerror',error=>errors.push(error.message));await boot(page);
  // The closed dialog already contains its intake only after prefetch succeeded.
  await page.locator('dialog').getByLabel('From',{exact:true}).waitFor({state:'attached'});
  await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.deferReceipt=true);
  await page.getByRole('button',{name:`${TRANSPORT_COPY.launcherTitle} · ${TRANSPORT_COPY.launcherSubtitle}`,exact:true}).click();const transport=page.locator('dialog[open]');
  async function pendingLoading(){
   await page.waitForFunction(()=>(window as unknown as{fixture:Fixture}).fixture.pendingReceipts.length===1);
   await transport.getByRole('status').waitFor();assert.equal(await transport.locator('.suqpage-loading-track i').count(),1,'The real themed horizontal loading component is rendered');
   assert.equal(await transport.getByRole('button',{name:'Retry',exact:true}).count(),0,'An outstanding authoritative GET is not a connection failure');assert.equal(await transport.getByRole('alert').count(),0);assert.equal(await transport.getByLabel('From',{exact:true}).count(),0,'Intake waits for fresh session authority');
  }
  await pendingLoading();await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.releaseReceipt());await transport.getByLabel('From',{exact:true}).waitFor();assert.equal(await transport.getByRole('status').count(),0);
  await transport.getByLabel('From',{exact:true}).fill('Unsent origin');await transport.getByLabel('To',{exact:true}).fill('Unsent destination');await transport.getByLabel('Name',{exact:true}).fill('Unsent person');await transport.getByLabel('Phone',{exact:true}).fill('+447700900123');await transport.getByLabel('Goods or transport details (optional)',{exact:true}).fill('Unsent goods');
  await transport.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:`${TRANSPORT_COPY.launcherTitle} · ${TRANSPORT_COPY.launcherSubtitle}`,exact:true}).click();await pendingLoading();await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.releaseReceipt(false));
  await transport.getByRole('button',{name:'Retry',exact:true}).waitFor();assert.match(await transport.getByRole('alert').textContent()||'',/temporarily unavailable/);assert.equal(await transport.getByRole('status').count(),0);assert.equal(await transport.getByLabel('Name',{exact:true}).inputValue(),'Unsent person');assert.equal(await transport.getByRole('button',{name:'Start chat',exact:true}).isDisabled(),true,'A failed session refresh cannot submit stale intake');
  await transport.getByRole('button',{name:'Retry',exact:true}).click();await pendingLoading();await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.releaseReceipt());await transport.getByLabel('From',{exact:true}).waitFor();
  assert.equal(await transport.getByLabel('From',{exact:true}).inputValue(),'Unsent origin');assert.equal(await transport.getByLabel('To',{exact:true}).inputValue(),'Unsent destination');assert.equal(await transport.getByLabel('Name',{exact:true}).inputValue(),'Unsent person');assert.equal(await transport.getByLabel('Phone',{exact:true}).inputValue(),'+447700900123');assert.equal(await transport.getByLabel('Goods or transport details (optional)',{exact:true}).inputValue(),'Unsent goods');assert.equal(await transport.getByRole('alert').count(),0);assert.equal(await transport.getByRole('button',{name:'Retry',exact:true}).count(),0);await transport.getByTestId('transport-provider-toggle').click();await transport.getByTestId('transport-provider-option').click();assert.equal(await transport.getByRole('button',{name:'Start chat',exact:true}).isEnabled(),true);
  const ports=await noAutomaticSend(page);assert.equal(ports.network.filter(call=>call.url.includes('/api/public-support')).length,4,'One prefetch, two opens and one explicit retry each perform a single GET');assert.deepEqual(ports.copied,[]);assert.deepEqual(ports.handoffs,[]);
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});


test('FE-075 desktop offers copy-or-Inbox, edits only inside Inbox, and retains failed custom draft',{timeout:60000},async()=>{
 const browser=await chromium.launch({timeout:20000});try{
  const page=await browser.newPage();await boot(page,a,[{productId:101,quantity:'3 boxes',options:{}}],false,null,{whatsapp:'+447700900123',telegram:'+447700900123',phone:'+447700900123'});
  await page.evaluate(({key,items})=>localStorage.setItem(key,JSON.stringify(items)),{key:key(b),items:[{productId:201,quantity:'other business',options:{}}]});
  await floating(page).click();await composer(page).waitFor();assert.equal(await composer(page).getByLabel('Your message',{exact:true}).count(),0,'Desktop channel chooser has no editable message');assert.equal(await composer(page).locator('a[href^="sms:"],a[href*="wa.me"],a[href*="t.me"]').count(),0,'Desktop has no app-opening contact links');
  assert.equal(await composer(page).getByText('+447700900123',{exact:true}).count(),2,'Desktop shows each approved WhatsApp and Telegram identity');assert.equal(await composer(page).getByRole('button',{name:/Copy contact WhatsApp/}).count(),1);assert.equal(await composer(page).getByRole('button',{name:/Copy contact Telegram/}).count(),1);
  await composer(page).getByRole('button',{name:/Copy contact WhatsApp/}).click();assert.equal(await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.copied.at(-1)),'+447700900123','Desktop can copy the visible WhatsApp identity');assert.equal(await composer(page).getByRole('button',{name:/Copied WhatsApp/}).count(),1,'Copy confirmation remains visible inside the modal');
  await composer(page).getByRole('button',{name:'Copy message',exact:true}).click();let copied=await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.copied.at(-1)!);assert.match(copied,/Saved cup[\s\S]*3 boxes/);assert.equal(await composer(page).getByRole('button',{name:'Send to AfricMade Inbox',exact:true}).count(),1,'The only send option is AfricMade Inbox');
  await composer(page).getByRole('button',{name:'Send to AfricMade Inbox',exact:true}).click();
  assert.match(await composer(page).getByLabel('Your message',{exact:true}).inputValue(),/Saved cup[\s\S]*3 boxes/);await composer(page).getByLabel('Your name',{exact:true}).fill('Aster Wako');await composer(page).getByLabel('Phone number',{exact:true}).fill('+251911123456');await composer(page).getByLabel('Your message',{exact:true}).fill('Please contact me about the selected cup.');
  assert.equal((await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.inquiryBodies)).length,0);
  await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.inquiryFailure=true);
  await composer(page).getByRole('button',{name:'Send inquiry',exact:true}).click();await composer(page).getByRole('alert').filter({hasText:'Temporary inquiry failure'}).waitFor();assert.equal((await saved(page)).length,1);assert.equal(await composer(page).getByLabel('Your name',{exact:true}).inputValue(),'Aster Wako');
  await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.inquiryFailure=false);
  await composer(page).getByRole('button',{name:'Send inquiry',exact:true}).click();await composer(page).getByRole('status').filter({hasText:'Inquiry sent to the business.'}).waitFor();
  const bodies=await page.evaluate(()=>(window as unknown as {fixture:Fixture}).fixture.inquiryBodies);assert.equal(bodies.length,2);assert.equal(bodies[0].idempotencyKey,bodies[1].idempotencyKey);assert.equal(bodies[0].businessId,1);assert.deepEqual(bodies[0].items.map(i=>i.productId),[101]);assert.equal(bodies[0].note,'Please contact me about the selected cup.');assert.deepEqual(await saved(page),[]);assert.equal((await saved(page,b)).length,1);
  const storage=await page.evaluate(()=>Object.values(localStorage).join(' '));assert.ok(!storage.includes('Aster Wako')&&!storage.includes('251911123456'));
 }finally{await browser.close();}
});


test('FE-075 actual read marker requires visible focused detail and never marks a hidden pane or already-read inquiry',{timeout:30000},async()=>{
 const browser=await chromium.launch({timeout:20000});try{
  const page=await browser.newPage();await boot(page);await page.bringToFront();assert.equal(await page.evaluate(()=>document.hasFocus()),true);
  await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.mountRead(true,null));await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.reads),0);
  await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.mountRead(false,null));await page.waitForFunction(()=>(window as unknown as{fixture:Fixture}).fixture.reads===1);
  await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.reads),1);
  await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.mountRead(false,'2026-10-21T00:00:00Z'));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.reads),1);
 }finally{await browser.close();}
});

test('FE-075 phone detail hides list tools while desktop retains the list/detail workspace',{timeout:30000},async()=>{
 const css=readFileSync('app/dashboard/inquiries/inquiries.css','utf8'),base=css.slice(0,css.indexOf('\n@media(max-width:700px){.inquiry-workspace'));
 const markup=(style:string,focused:boolean)=>`<style>body{margin:0;padding:12px}*{box-sizing:border-box}${style}</style><main class="inquiry-workspace" data-detail-open="${focused}"><div class="dashboard-head"><h1>Inbox</h1><p>Customer inquiries and details</p></div><div class="inquiry-inbox-tools"><input type="search" aria-label="Search inquiries"/><button>Apply</button></div><div class="inquiry-inbox" data-detail-open="${focused}"><div class="inquiry-inbox-list"><a>Customer A</a></div><section class="inquiry-inbox-detail"><a class="inquiry-back">Back to inbox</a><h2>Customer A</h2><p>Selected products and customer message</p></section></div></main>`;
 const browser=await chromium.launch({timeout:20000});try{const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent(markup(css,false));assert.equal(await page.getByRole('searchbox').isVisible(),true);
  await page.setContent(markup(css,true));assert.equal(await page.getByRole('searchbox').isVisible(),false);assert.equal(await page.locator('.inquiry-back').isVisible(),true);assert.equal(await page.locator('.inquiry-inbox-list').isVisible(),false);
  await page.setViewportSize({width:1440,height:900});assert.equal(await page.getByRole('searchbox').isVisible(),true);assert.equal(await page.locator('.inquiry-inbox-list').isVisible(),true);
  await page.setViewportSize({width:390,height:844});await page.setContent(markup(base,true));assert.equal(await page.getByRole('searchbox').isVisible(),true,'Negative control: original CSS leaves the clutter visible');
 }finally{await browser.close();}
});
