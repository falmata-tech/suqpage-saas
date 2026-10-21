import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {chromium,type Page,type Route} from 'playwright';
import {expect} from '@playwright/test';
import {createUiText,type UiMessages} from '../lib/i18n/core';
import type {BlockedBusiness} from '../lib/catalog-safety';

const business:BlockedBusiness={id:7,handle:'fixture-safety-shop',name:'Literal merchant ሱቅ'};
const storageKey='suqpage-blocked-businesses-v1';
const bundled=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import Safety from './components/PublicBusinessSafety';
 import {PublicActionDockProvider,InquiryFloatingAction} from './components/PublicActionDock';
 const f=window.fixture,content=<Safety business={f.business} productId={f.productId} disabled={f.disabled}><section data-public-catalog className={f.docked?'runtime-root':undefined} style={f.docked?{minHeight:1800}:undefined}><h1>Merchant catalog</h1><a href='#contact'>Configured merchant contact</a></section>{f.docked&&f.inquiryCount>0&&<InquiryFloatingAction handle={f.business.handle} count={f.inquiryCount} onOpen={()=>{}}/>}</Safety>;
 createRoot(document.getElementById('root')).render(f.docked?<PublicActionDockProvider enabled transport={<button data-fixture-transport style={{width:'100%',height:f.dockHeight,minHeight:48}}>Controlled transport geometry</button>}><div className='public-app-shell public-app-shell-showroom'><header className='public-app-header'/><aside className='public-app-rail'/><main className='public-app-main public-app-showroom-main'>{content}</main></div></PublicActionDockProvider>:content);
`},bundle:true,write:false,outfile:'listing-options.js',jsx:'automatic',loader:{'.module.css':'local-css'},plugins:[{name:'listing-options-ports',setup(builder){
  builder.onResolve({filter:/^(?:@\/lib\/i18n\/ui|next\/navigation)$/},args=>({path:args.path,namespace:'ports'}));
  builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',resolveDir:process.cwd(),contents:args.path==='@/lib/i18n/ui'
    ?`import {createUiText} from ${JSON.stringify(process.cwd()+'/lib/i18n/core.ts')};export const useUiText=()=>createUiText(window.fixture.messages);`
    :`export const useRouter=()=>({refresh:()=>window.fixture.refreshes++});`}));
}}]});
type RecordedRequest={method:string;path:string;body:Record<string,unknown>;authorized:boolean};
type Transport={requests:RecordedRequest[];failPreferences:boolean;failReports:boolean;deferReport:boolean;pendingReports:Route[]};
const observedRequests=(transport:Transport):readonly RecordedRequest[]=>transport.requests.slice();
async function boot(page:Page,{productId,blocked=false,disabled=false,messages={},docked=false,dockHeight=88,inquiryCount=0}:{productId?:number;blocked?:boolean;disabled?:boolean;messages?:UiMessages;docked?:boolean;dockHeight?:number;inquiryCount?:number}={}){
  page.setDefaultTimeout(8000);
  const transport:Transport={requests:[],failPreferences:false,failReports:false,deferReport:false,pendingReports:[]};
  await page.route('https://suqpage.fixture/**',async route=>{
    const request=route.request(),path=new URL(request.url()).pathname;
    if(!path.startsWith('/api/catalog/')){await route.fulfill({contentType:'text/html',body:'<main id="root"></main>'});return;}
    transport.requests.push({method:request.method(),path,body:request.postDataJSON() as Record<string,unknown>,authorized:Boolean(request.headers().authorization)});
    if(path==='/api/catalog/preferences')await route.fulfill({status:transport.failPreferences?503:200,contentType:'application/json',body:JSON.stringify({saved:!transport.failPreferences})});
    else if(path==='/api/catalog/reports'){
      if(transport.deferReport){transport.pendingReports.push(route);return;}
      await route.fulfill({status:transport.failReports?503:200,contentType:'application/json',body:JSON.stringify(transport.failReports?{error:'Report could not be saved.'}:{receipt:'fixture-report',duplicate:false})});
    }else throw new Error('Unexpected fixture route '+path);
  });
  await page.goto('https://suqpage.fixture/');
  assert.ok(await page.evaluate(()=>isSecureContext&&typeof crypto.randomUUID==='function'&&/^[0-9a-f-]{36}$/i.test(crypto.randomUUID())), 'Fixture supplies the secure browser nonce API used by production HTTPS and localhost');
  await page.evaluate(({business,productId,blocked,disabled,messages,docked,dockHeight,inquiryCount,key})=>{
    localStorage.setItem(key,JSON.stringify(blocked?[business]:[]));
    (window as unknown as{fixture:unknown}).fixture={business,productId,disabled,messages,docked,dockHeight,inquiryCount,refreshes:0};
  },{business,productId,blocked,disabled,messages,docked,dockHeight,inquiryCount,key:storageKey});
  const bundle=await bundled;
  await page.addStyleTag({content:readFileSync('app/globals.css','utf8')+'\n'+(docked?readFileSync('app/landing.css','utf8'):'')+'\n'+bundle.outputFiles.find(file=>file.path.endsWith('.css'))!.text+'\nbody{margin:0}'});
  await page.addScriptTag({content:bundle.outputFiles.find(file=>file.path.endsWith('.js'))!.text});
  return transport;
}
const preferences=(page:Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]') as BlockedBusiness[],storageKey);

test('FE-063 S134 one anonymous launcher opens the same dialog for report/cancel and preserves honest retry/idempotency',{timeout:60000},async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
  try{const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',error=>errors.push(error.message));const transport=await boot(page,{productId:42});
    const launcher=page.getByRole('button',{name:'Listing options',exact:true});await launcher.waitFor();
    assert.equal(await page.getByRole('button').count(),1,'No exposed Report/Block/list footer actions');
    await launcher.click();const options=page.getByRole('dialog',{name:'Listing options',exact:true});
    await expect(options).toBeVisible();assert.equal(await page.locator('dialog:modal').count(),1);
    assert.equal(await options.getByRole('link',{name:'Blocked businesses',exact:true}).getAttribute('href'),'/blocked-businesses');
    await page.evaluate(()=>{(window as unknown as{originalDialog:Element|null}).originalDialog=document.querySelector('dialog');});
    await options.getByRole('button',{name:'Report product',exact:true}).click();const report=page.getByRole('dialog',{name:'Report product',exact:true});
    assert.ok(await page.evaluate(()=>(window as unknown as{originalDialog:Element|null}).originalDialog===document.querySelector('dialog')),'Report reuses the same dialog node');
    assert.equal(await page.locator('dialog:modal').count(),1,'Report does not stack a second modal');await expect(report.getByLabel('Reason',{exact:true})).toBeFocused();
    await report.getByLabel('Details (optional)',{exact:true}).fill('Unsubmitted visitor text');
    await report.getByRole('button',{name:'Cancel',exact:true}).click();await expect(report).not.toBeVisible();await expect(launcher).toBeFocused();
    assert.deepEqual(observedRequests(transport),[],'Cancel sends neither a report nor a preference mutation');assert.deepEqual(await preferences(page),[]);
    await launcher.click();await page.getByRole('dialog',{name:'Listing options',exact:true}).getByRole('button',{name:'Report product',exact:true}).click();
    await report.getByLabel('Reason',{exact:true}).selectOption('Prohibited goods');await report.getByLabel('Details (optional)',{exact:true}).fill('A literal visitor report.');
    transport.failReports=true;await report.getByRole('button',{name:'Send report',exact:true}).click();
    await expect(report.getByRole('alert')).toHaveText('Report could not be saved.');await expect(report.getByLabel('Details (optional)',{exact:true})).toHaveValue('A literal visitor report.');
    assert.equal(await page.getByRole('status').count(),0,'Failure never claims report receipt');
    const first=transport.requests.at(-1)!;assert.deepEqual(Object.keys(first.body).sort(),['businessId','details','idempotencyKey','productId','reason']);
    assert.equal(first.body.businessId,7);assert.equal(first.body.productId,42);assert.equal(first.authorized,false,'Anonymous reporting needs no account credentials');
    transport.failReports=false;transport.deferReport=true;await report.getByRole('button',{name:'Send report',exact:true}).click();
    await expect(report.getByRole('button',{name:'Sending…',exact:true})).toBeDisabled();
    await expect.poll(()=>transport.pendingReports.length).toBe(1);assert.equal(await page.getByRole('status').count(),0,'Receipt waits for persistence acknowledgement');
    assert.deepEqual(transport.requests.at(-1)!.body,first.body,'Unchanged retry preserves the exact request key and report fields');
    await transport.pendingReports.shift()!.fulfill({status:200,contentType:'application/json',body:JSON.stringify({receipt:'fixture-report',duplicate:false})});
    await expect(page.getByRole('status')).toHaveText('Report received.');await expect(report).not.toBeVisible();assert.deepEqual(await preferences(page),[]);
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('FE-063 S134 block/unblock failures retain content and retryable recovery with existing device preferences',{timeout:60000},async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
  try{const page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));const transport=await boot(page,{productId:undefined});
    const launcher=page.getByRole('button',{name:'Listing options',exact:true});await launcher.click();const options=page.getByRole('dialog',{name:'Listing options',exact:true});
    transport.failPreferences=true;await options.getByRole('button',{name:'Block business',exact:true}).click();await expect(options.getByRole('alert')).toHaveText('Could not save blocked businesses. Try again.');
    await expect(page.locator('[data-public-catalog]')).toBeVisible();assert.deepEqual(await preferences(page),[],'Failed save does not hide content or claim a stored block');
    transport.failPreferences=false;await options.getByRole('button',{name:'Block business',exact:true}).click();await expect(options).not.toBeVisible();
    await expect(page.getByRole('heading',{name:'Business blocked.',exact:true})).toBeVisible();assert.equal(await page.locator('[data-public-catalog]').count(),0);
    assert.deepEqual(await preferences(page),[business]);assert.deepEqual(transport.requests.at(-1)!.body,{blockedIds:[business.id]});
    transport.failPreferences=true;await page.getByRole('button',{name:'Unblock business',exact:true}).click();await expect(page.getByRole('alert')).toHaveText('Could not save blocked businesses. Try again.');
    await expect(page.getByRole('heading',{name:'Business blocked.',exact:true})).toBeVisible();assert.deepEqual(await preferences(page),[business]);
    await launcher.click();await expect(options.getByRole('button',{name:'Unblock business',exact:true})).toBeVisible();assert.equal(await options.getByRole('button',{name:'Report business',exact:true}).count(),0,'Blocked content does not expose report controls for invisible content');
    await options.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await preferences(page),[business],'Cancel leaves the existing block untouched');
    transport.failPreferences=false;await page.getByRole('button',{name:'Unblock business',exact:true}).click();await expect(page.locator('[data-public-catalog]')).toBeVisible();assert.deepEqual(await preferences(page),[]);
    assert.ok(transport.requests.every(request=>request.method==='POST'&&request.path==='/api/catalog/preferences'&&!request.authorized),'Only existing anonymous preference commands are issued');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('FE-063 S134 active-language options are bounded with48px controls and owner previews stay unaffected',{timeout:120000},async context=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
  try{for(const[width,height]of[[320,480],[390,844],[1440,1000]])for(const locale of['en','am','om']){
    const messages:UiMessages=locale==='en'?{}:JSON.parse(readFileSync('lib/i18n/messages/'+locale+'.json','utf8')),t=createUiText(messages);
    const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',error=>errors.push(error.message));const transport=await boot(page,{messages,productId:42});
    const launcher=page.getByRole('button',{name:t('Listing options'),exact:true});await launcher.waitFor();const target=await launcher.boundingBox();assert.ok(target&&target.width>=48&&target.height>=48);
    await launcher.click();const options=page.getByRole('dialog',{name:t('Listing options'),exact:true});await expect(options).toBeVisible();
    const bounds=await options.boundingBox();assert.ok(bounds&&bounds.width<=Math.min(480,width-32)+1&&bounds.height<=height-40+1,'Dialog stays within the viewport');
    for(const control of await options.locator('button,a').all()){const box=await control.boundingBox();assert.ok(box&&box.width>=48&&box.height>=48,'Visible options have48px targets');}
    await options.getByRole('button',{name:t('Report product'),exact:true}).click();const report=page.getByRole('dialog',{name:t('Report product'),exact:true});await expect(report).toBeVisible();
    const reportBounds=await report.boundingBox();assert.ok(reportBounds&&reportBounds.width<=width-32+1&&reportBounds.height<=height-40+1);
    assert.equal(await page.locator('dialog:modal').count(),1);await page.keyboard.press('Escape');await expect(report).not.toBeVisible();
    assert.deepEqual(observedRequests(transport),[]);assert.deepEqual(await preferences(page),[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.close();context.diagnostic(`PASS ${locale} ${width}×${height}`);
  }
    const preview=await browser.newPage();preview.on('pageerror',error=>errors.push(error.message));const transport=await boot(preview,{blocked:true,disabled:true});
    await expect(preview.locator('[data-public-catalog]')).toBeVisible();assert.equal(await preview.getByRole('button').count(),0);assert.equal(await preview.locator('dialog').count(),0);assert.deepEqual(observedRequests(transport),[],'Private previews neither block their content nor expose public safety commands');
    await preview.close();assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('FE-063 S134 maximum-scroll Listing options clears the measured fixed dock and remains fully clickable',{timeout:120000},async context=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,timeout:20000}),errors:string[]=[];
  try{for(const[width,height]of[[320,480],[390,844],[700,800],[844,390],[1440,1000]])for(const inquiryCount of[0,2]){
    const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',error=>errors.push(error.message));const transport=await boot(page,{docked:true,dockHeight:inquiryCount?104:88,inquiryCount});
    const launcher=page.getByRole('button',{name:'Listing options',exact:true});await launcher.waitFor();
    await page.waitForFunction(()=>{
      const button=Array.from(document.querySelectorAll('button')).find(button=>button.textContent?.trim()==='Listing options'),dock=document.querySelector('[data-public-action-dock]');
      return Boolean(button&&dock&&parseFloat(getComputedStyle(button).getPropertyValue('--public-action-clearance'))===Math.ceil(dock.getBoundingClientRect().height)+24);
    });
    await page.evaluate(async()=>{
      const main=document.querySelector<HTMLElement>('.public-app-showroom-main')!;main.scrollTo({top:main.scrollHeight,behavior:'instant'});
      window.scrollTo({top:document.scrollingElement!.scrollHeight,behavior:'instant'});
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    const geometry=await launcher.evaluate(element=>{
      const box=element.getBoundingClientRect(),dock=document.querySelector('[data-public-action-dock]')!.getBoundingClientRect(),main=document.querySelector<HTMLElement>('.public-app-showroom-main')!;
      const points=[[box.left+4,box.top+4],[box.right-4,box.top+4],[(box.left+box.right)/2,(box.top+box.bottom)/2],[box.left+4,box.bottom-4],[box.right-4,box.bottom-4]];
      return{button:{left:box.left,right:box.right,top:box.top,bottom:box.bottom,width:box.width,height:box.height},dock:{left:dock.left,right:dock.right,top:dock.top,bottom:dock.bottom},
        overlap:Math.max(0,Math.min(box.right,dock.right)-Math.max(box.left,dock.left))*Math.max(0,Math.min(box.bottom,dock.bottom)-Math.max(box.top,dock.top)),
        hits:points.map(([x,y])=>element===document.elementFromPoint(x,y)||element.contains(document.elementFromPoint(x,y))),
        scroll:{top:main.scrollTop,maximum:main.scrollHeight-main.clientHeight,mode:getComputedStyle(main).overflowY,window:window.scrollY,windowMaximum:document.scrollingElement!.scrollHeight-innerHeight},clearance:getComputedStyle(element).getPropertyValue('--public-action-clearance')};
    });
    const state=JSON.stringify({width,height,inquiryCount,geometry});
    if(['auto','scroll'].includes(geometry.scroll.mode))assert.ok(Math.abs(geometry.scroll.top-geometry.scroll.maximum)<=1,'Actual scroll container is at its maximum '+state);
    else assert.ok(Math.abs(geometry.scroll.window-geometry.scroll.windowMaximum)<=1,'Actual page is at its maximum '+state);
    assert.ok(geometry.button.width>=48&&geometry.button.height>=48,state);assert.ok(geometry.button.top>=0&&geometry.button.bottom<=height,state);assert.equal(geometry.overlap,0,'Entire target clears dock at actual maximum scroll '+state);assert.ok(geometry.hits.every(Boolean),'Every sampled hit point reaches the actual action '+state);
    await launcher.click();const options=page.getByRole('dialog',{name:'Listing options',exact:true});await expect(options).toBeVisible();await options.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(observedRequests(transport),[]);
    await page.close();context.diagnostic(`PASS ${width}×${height} inquiryCount=${inquiryCount}`);
  }assert.deepEqual(errors,[]);}finally{await browser.close();}
});
