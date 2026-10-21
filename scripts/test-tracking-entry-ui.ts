import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const require=createRequire(import.meta.url);
// Real shell + real conversation + real intake. Only HTTP/router, translation,
// alerts/read observation are ports; no live account/chat/shipment is touched.
const bundled=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';
 import Public from'./components/PublicSupportChat';import Owner from'./components/OwnerTransportWorkspace';
 const root=createRoot(document.getElementById('root'));let serial=0;
 window.fixture={calls:[],routes:[],kind:'public',state:'intake',receipt:null};const f=window.fixture;
 const receipt={id:71,publicRef:'SUP-ENTRY-71',category:'shipment_observation',subject:'Literal route',status:'open',assignedUserName:null,agentJoined:false,resolvedAt:null,messages:[],transportPlan:{version:1,legs:[{id:'old-leg',providerName:'LEGACY PRIVATE PROVIDER',origin:'Old origin',destination:'Old destination',method:'truck'}]}};
 f.mount=(kind,state)=>{f.kind=kind;f.state=state;f.receipt=state==='intake'?null:{...receipt,status:state==='ended'?'closed':'open'};flushSync(()=>root.render(kind==='public'?<Public key={++serial}/>:<Owner key={++serial} draftScope='entry-owner' initial={{conversation:f.receipt,defaults:{name:'Editable owner',phone:'12025550123'}}}/>));};
 f.unmount=()=>flushSync(()=>root.render(null));
 window.fetch=async(url,options={})=>{f.calls.push({url:String(url),method:options.method||'GET',body:options.body});if(options.method&&options.method!=='GET')throw Error('Unexpected chat command');return new Response(JSON.stringify(String(url).startsWith('/api/attention')?{unread:0}:{conversation:f.receipt}),{headers:{'content-type':'application/json'}});};
`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'tracking-entry-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx(?:-dev)?-runtime)?|react-dom(?:\/client)?)$/},a=>({path:require.resolve(a.path)}));
 b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));
 b.onLoad({filter:/.*/,namespace:'css'},a=>{const css=readFileSync('components/'+a.path.split('/').at(-1),'utf8'),classes=Object.fromEntries([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(match=>[match[1],match[1]]));return{loader:'js',contents:`const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);export default ${JSON.stringify(classes)};`};});
 b.onResolve({filter:/^(?:next\/(?:link|navigation)|@\/lib\/i18n\/ui|\.\/(?:AttentionAlerts|ChatReadObserver))$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:a.path==='next/link'?`import React from'react';export default({children,href,onClick,...props})=><a {...props} href={href} onClick={event=>{event.preventDefault();onClick?.(event);window.fixture.routes.push(href);}}>{children}</a>;`
 :a.path==='next/navigation'?`const search=new URLSearchParams();export const usePathname=()=>'/';export const useSearchParams=()=>search;export const useRouter=()=>({push:url=>window.fixture.routes.push(url)});`
 :a.path==='@/lib/i18n/ui'?`export const useUiText=()=>((key,values={})=>key.replace(/\\{([^}]+)\\}/g,(_,name)=>String(values[name]??name)));`
 :a.path==='./ChatReadObserver'?`export const useVisibleChatRead=()=>{};`:`export default()=>null;`}));
 }}]});
type Fixture={mount:(kind:'public'|'owner',state:'intake'|'recovered'|'ended')=>void;unmount:()=>void;routes:string[];calls:Array<{url:string;method:string;body?:string}>};

test('FE-069 S141 one shell-owned Tracking entry across public/owner intake, recovered and ended chat',{timeout:120000},async t=>{
 const browser=await chromium.launch({channel:process.env.SUQPAGE_BROWSER_CHANNEL||undefined,headless:true,timeout:20000});
 try{for(const kind of ['public','owner']as const)for(const state of ['intake','recovered','ended']as const)await t.test(kind+' '+state,async()=>{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors:string[]=[];page.setDefaultTimeout(6000);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  try{
   await page.route('**/*',route=>route.request().url()==='http://localhost:41841/'?route.fulfill({contentType:'text/html',body:'<!doctype html><style>*{box-sizing:border-box}body{margin:0}button,input,textarea{font:inherit}</style><main id="root"></main>'}):route.abort('blockedbyclient'));
   await page.goto('http://localhost:41841/');await page.addScriptTag({content:(await bundled).outputFiles[0].text});
   const mount=()=>page.evaluate(({kind,state})=>(window as unknown as{fixture:Fixture}).fixture.mount(kind,state),{kind,state});await mount();
   const launcher=page.getByRole('button',{name:/Want help with transport\/shipping\?/});if(kind==='public')await launcher.click();
   const tracking=page.getByRole('link',{name:/^Shipment tracking(?: →)?$/});await tracking.waitFor();
   assert.equal(await tracking.count(),1,'The real nested conversation must never add a second Tracking entry');
   assert.ok((await tracking.boundingBox())!.height>=48,'The single quiet entry remains a48px target');
   const href=await tracking.getAttribute('href');assert.ok(href);const destination=new URL(href,'http://localhost:41841');assert.equal(destination.pathname,'/tracking');
   assert.equal(destination.searchParams.get('return'),kind==='public'?null:'/dashboard/transport'+(state==='intake'?'?new=1':'?conversation=71'));
   const draft=state==='intake'?page.getByLabel('From',{exact:true}):state==='recovered'?page.getByLabel('Reply',{exact:true}):null;
   if(draft)await draft.fill('Unsent route text');
   assert.equal(await page.getByText('LEGACY PRIVATE PROVIDER',{exact:true}).count(),0,'Chat is not a shipment reader');
   assert.equal(await page.getByRole('textbox',{name:'Email',exact:true}).count(),0,'Ordinary chat has no tracking-email requirement');
   await tracking.click();assert.equal((await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.routes)).at(-1),href);
   if(kind==='public'){await page.getByRole('dialog').waitFor({state:'hidden'});await launcher.click();}
   else{await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.unmount());await mount();}
   await tracking.waitFor();assert.equal(await tracking.count(),1);if(draft)assert.equal(await draft.inputValue(),'Unsent route text','Tracking return preserves the current chat/intake draft');
   const calls=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.calls);
   assert.ok(calls.every(call=>call.method==='GET'&&!call.body),'Opening/returning from Tracking neither creates nor sends a chat');assert.ok(calls.every(call=>!call.url.includes('/tracking')&&!call.url.includes('transport-plan')),'Chat never obtains recipient authority or legacy plans');
   await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.unmount());assert.deepEqual(errors,[]);
  }finally{await page.close();}
 });}finally{await browser.close();}
});
