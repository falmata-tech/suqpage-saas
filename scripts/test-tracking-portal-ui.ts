import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium,type Browser,type Page} from 'playwright';
import {clearTransportDraft,rememberTransportDraft,takeTransportDraft,trackingReturnHref} from '../lib/tracking-navigation';
import type {TrackingShipment} from '../lib/tracking-contract';

const require=createRequire(import.meta.url);
const reference=(letter:string)=>'SHP-'+letter.repeat(20);
const a=reference('A'),b=reference('B'),c=reference('C');
const shipment=(ref=a):TrackingShipment=>({reference:ref,label:'Shipment '+ref.slice(-1),version:1,legs:[{id:'00000000-0000-4000-8000-000000000001',providerName:'Provider '+ref.slice(-1),origin:'Place A',destination:'Place B',method:'truck'}]});
const summary=(ref:string)=>({...shipment(ref),legs:undefined,firstOrigin:'Place A',lastDestination:'Place B',legCount:1});
type Call={url:string;method:string;body:Record<string,unknown>|null;headers:Record<string,string>;aborted:boolean};
type Fixture={calls:Call[];mount:(reference?:string)=>void;resolve:(index:number,status:number,body:unknown,headers?:Record<string,string>)=>void;activity:(hidden:boolean,focused:boolean)=>void};
let browser:Browser|undefined;after(async()=>{await browser?.close();});
async function boot(ref?:string){
 browser??=await chromium.launch({headless:true,timeout:20000});const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors:string[]=[];page.setDefaultTimeout(3000);page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://localhost:45679/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://localhost:45679/tracking');await page.clock.install({time:new Date('2026-10-17T12:00:00Z')});
 await page.addScriptTag({content:`window.fixture={calls:[],hidden:false,focused:true};const pending=new Map();window.fixture.resolve=(index,status,body,headers={})=>{const item=pending.get(index);if(!item)return;pending.delete(index);item.resolve(new Response(status===304?null:JSON.stringify(body),{status,headers:{'content-type':'application/json',...headers}}));};window.fixture.activity=(hidden,focused)=>{window.fixture.hidden=hidden;window.fixture.focused=focused;document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event(focused?'focus':'blur'));};Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.fixture.hidden});Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>window.fixture.focused});window.fetch=(url,options={})=>new Promise((resolve,reject)=>{const call={url:String(url),method:options.method||'GET',body:options.body?JSON.parse(options.body):null,headers:Object.fromEntries(new Headers(options.headers)),aborted:false};const index=window.fixture.calls.push(call)-1;pending.set(index,{resolve,reject});const abort=()=>{call.aborted=true;pending.delete(index);reject(new DOMException('Aborted','AbortError'));};if(options.signal?.aborted)abort();else options.signal?.addEventListener('abort',abort,{once:true});});`});
 const output=await build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`import React from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import{NextIntlClientProvider}from'next-intl';import Portal from'./components/TrackingPortal';const root=createRoot(document.getElementById('root'));let serial=0;window.fixture.mount=reference=>flushSync(()=>root.render(<NextIntlClientProvider locale='en' timeZone='Africa/Addis_Ababa' messages={{}}><Portal key={++serial} reference={reference} returnHref='/dashboard/transport?new=1'/></NextIntlClientProvider>));`},bundle:true,write:false,format:'iife',platform:'browser',outdir:'/virtual',plugins:[{name:'tracking-portal-ui-ports',setup(build){
  build.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));build.onResolve({filter:/^next\/link$/},args=>({path:args.path,namespace:'ports'}));build.onLoad({filter:/.*/,namespace:'ports'},()=>({loader:'jsx',contents:`import React from'react';export default props=><a {...props}/>;`}));
 }}]});
 await page.addStyleTag({content:'*{box-sizing:border-box}body{margin:0;font:16px Arial}'+output.outputFiles.find(file=>file.path.endsWith('.css'))!.text});await page.addScriptTag({content:output.outputFiles.find(file=>file.path.endsWith('.js'))!.text});
 const mount=(value?:string)=>page.evaluate(value=>(window as unknown as{fixture:Fixture}).fixture.mount(value),value);await mount(ref);
 return{page,mount,close:async()=>{await context.close();assert.deepEqual(errors,[]);}};
}
async function calls(page:Page){return page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.calls);}
async function count(page:Page,n:number){await page.waitForFunction(n=>(window as unknown as{fixture:Fixture}).fixture.calls.length>=n,n);return(await calls(page))[n-1];}
async function resolve(page:Page,index:number,status:number,body:unknown,headers?:Record<string,string>){await page.evaluate(({index,status,body,headers})=>(window as unknown as{fixture:Fixture}).fixture.resolve(index,status,body,headers),{index,status,body,headers});}
async function session(page:Page,authenticated:boolean){await count(page,1);await resolve(page,0,authenticated?200:401,authenticated?{expiresAt:1_900_000_000_000}:{error:'Verify your email to open your shipments.'});}

test('FE-069 actual portal email/code/cooldown/error/empty/logout flow uses only tracking credentials and retains useful input',{timeout:60000},async()=>{
 const{page,close}=await boot();try{
  await session(page,false);await page.getByLabel('Email',{exact:true}).fill('recipient+fixture@example.test');await page.getByRole('button',{name:'Send code',exact:true}).click();await count(page,2);assert.deepEqual((await calls(page))[1].body,{email:'recipient+fixture@example.test',locale:'en'});await resolve(page,1,200,{challengeId:'a'.repeat(32),resendAfter:60});await page.getByLabel('Verification code',{exact:true}).fill('123456');assert.equal(await page.getByRole('button',{name:/Resend code in/}).isDisabled(),true);await page.getByRole('button',{name:'Verify code',exact:true}).click();await count(page,3);await resolve(page,2,400,{error:'That code is invalid or expired.'});await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Verification code',{exact:true}).inputValue(),'123456');assert.ok((await page.locator('body').innerText()).includes('recipient+fixture@example.test'));
  await page.clock.fastForward(60_000);assert.equal(await page.getByRole('button',{name:'Resend code',exact:true}).isEnabled(),true);await page.getByRole('button',{name:'Verify code',exact:true}).click();await count(page,4);await resolve(page,3,200,{verified:true});await count(page,5);await resolve(page,4,200,{shipments:[],nextCursor:null});await page.getByText('No shipments yet. Your transport agent can add a plan for this email.',{exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:'Back to transport chat',exact:true}).getAttribute('href'),'/dashboard/transport?new=1');
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await count(page,6);assert.equal((await calls(page))[5].url,'/api/tracking/logout');await resolve(page,5,200,{signedOut:true});await page.getByLabel('Email',{exact:true}).waitFor();assert.equal(await page.getByLabel('Email',{exact:true}).inputValue(),'');assert.equal(await page.getByLabel('Verification code',{exact:true}).count(),0);assert.ok((await calls(page)).every(call=>call.url.startsWith('/api/tracking/')&&!call.url.includes('recipient+')&&!call.url.includes('123456')));
 }finally{await close();}
});

test('FE-069 actual portal Back retains loaded pages and two rapid direct-detail Back clicks cannot strand loading',{timeout:60000},async()=>{
 const{page,mount,close}=await boot();try{
  await session(page,true);await count(page,2);await resolve(page,1,200,{shipments:[summary(a),summary(b)],nextCursor:'22'});await page.getByRole('button',{name:'Load more',exact:true}).click();await count(page,3);assert.equal((await calls(page))[2].url,'/api/tracking/shipments?cursor=22');await resolve(page,2,200,{shipments:[summary(c)],nextCursor:'11'});await page.getByRole('button',{name:/Shipment C/}).click();await count(page,4);await resolve(page,3,200,shipment(c),{etag:'"c1"'});await page.getByText('Provider C',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Back to shipments',exact:true}).click();if((await calls(page)).length>4)await resolve(page,4,200,{shipments:[summary(a),summary(b)],nextCursor:'22'});await page.getByRole('heading',{name:'Your shipments',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:/Shipment C/}).count(),1,'Detail Back keeps previously loaded shipment pages');assert.equal(await page.getByRole('button',{name:'Load more',exact:true}).count(),1);
  await mount(a);let next=(await calls(page)).length-1;await resolve(page,next,200,{expiresAt:1_900_000_000_000});await count(page,next+2);await resolve(page,next+1,200,shipment(a),{etag:'"a1"'});await page.getByText('Provider A',{exact:true}).waitFor();const before=(await calls(page)).length;
  await page.getByRole('button',{name:'Back to shipments',exact:true}).evaluate(button=>{(button as HTMLButtonElement).click();(button as HTMLButtonElement).click();});await count(page,before+1);await resolve(page,before,200,{shipments:[summary(a)],nextCursor:null});await page.getByRole('heading',{name:'Your shipments',exact:true}).waitFor();assert.equal((await calls(page)).length,before+1,'Only one direct-detail list read is needed');
 }finally{await close();}
});

test('FE-069 actual detail poll resumes promptly after abort, handles304 and clears private content on401/404',{timeout:60000},async()=>{
 const{page,mount,close}=await boot(a);try{
  await session(page,true);await count(page,2);
  await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.activity(true,false);f.activity(false,true);});await count(page,3);assert.equal((await calls(page))[1].aborted,true);await resolve(page,2,200,shipment(a),{etag:'"a1"'});await page.getByText('Provider A',{exact:true}).waitFor();
  await page.clock.fastForward(5000);await count(page,4);assert.equal((await calls(page))[3].headers['if-none-match'],'"a1"');await resolve(page,3,304,null,{etag:'"a1"'});assert.equal(await page.getByText('Provider A',{exact:true}).count(),1);
  await page.clock.fastForward(5000);await count(page,5);await resolve(page,4,404,{error:'Shipment was not found.'});await page.getByText('This shipment is unavailable.',{exact:true}).waitFor();assert.equal(await page.getByText('Provider A',{exact:true}).count(),0);
  await mount(b);let n=(await calls(page)).length-1;await resolve(page,n,200,{expiresAt:1_900_000_000_000});await count(page,n+2);await resolve(page,n+1,304,null);await page.getByRole('alert').waitFor();assert.equal(await page.getByText('Provider B',{exact:true}).count(),0);await page.clock.fastForward(10000);await count(page,n+3);assert.equal((await calls(page))[n+2].headers['if-none-match'],undefined);await resolve(page,n+2,200,shipment(b),{etag:'"b1"'});await page.getByText('Provider B',{exact:true}).waitFor();await page.clock.fastForward(5000);await count(page,n+4);await resolve(page,n+3,401,{error:'Verify your email.'});await page.getByLabel('Email',{exact:true}).waitFor();assert.equal(await page.getByText('Provider B',{exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Sign out',exact:true}).count(),0);
 }finally{await close();}
});

test('FE-069 direct-detail rapid Back keeps one authoritative list read and no stale loading state',{timeout:30000},async()=>{
 const{page,close}=await boot(a);try{
  await session(page,true);await count(page,2);await resolve(page,1,200,shipment(a),{etag:'"a1"'});await page.getByText('Provider A',{exact:true}).waitFor();await page.getByRole('button',{name:'Back to shipments',exact:true}).evaluate(button=>{(button as HTMLButtonElement).click();(button as HTMLButtonElement).click();});await count(page,3);await resolve(page,2,200,{shipments:[summary(a)],nextCursor:null});await page.getByRole('heading',{name:'Your shipments',exact:true}).waitFor();assert.equal((await calls(page)).length,3);
 }finally{await close();}
});

test('FE-069 cold304 cannot pretend a shipment body exists and retries without a conditional tag',{timeout:30000},async()=>{
 const{page,close}=await boot(a);try{
  await session(page,true);await count(page,2);await resolve(page,1,304,null);await page.getByRole('alert').waitFor();await page.clock.fastForward(10000);await count(page,3);assert.equal((await calls(page))[2].headers['if-none-match'],undefined);await resolve(page,2,200,shipment(a),{etag:'"a1"'});await page.getByText('Provider A',{exact:true}).waitFor();
 }finally{await close();}
});

test('FE-069 transport return hints and draft memory are bounded, ephemeral and purpose-separated',()=>{
 assert.equal(trackingReturnHref('/dashboard/transport?conversation=12'),'/dashboard/transport?conversation=12');for(const invalid of['https://foreign.test','//foreign.test','/dashboard','/dashboard/transport?conversation=0','/dashboard/transport?new=1&email=x'])assert.equal(trackingReturnHref(invalid),'/?chat=transport');
 clearTransportDraft('fixture');rememberTransportDraft('fixture',{origin:'A'},1000);assert.deepEqual(takeTransportDraft('fixture',1001),{origin:'A'});assert.equal(takeTransportDraft('fixture',601000),undefined);for(let i=0;i<17;i++)rememberTransportDraft('fixture-'+i,{i},2000);assert.equal(takeTransportDraft('fixture-0',2001),undefined);assert.deepEqual(takeTransportDraft('fixture-16',2001),{i:16});for(let i=0;i<17;i++)clearTransportDraft('fixture-'+i);
});
