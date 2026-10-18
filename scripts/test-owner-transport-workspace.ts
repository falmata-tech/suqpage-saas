import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium,type Browser,type Page} from 'playwright';
import {renderToStaticMarkup} from 'react-dom/server';
import type {ReactElement} from 'react';
import type {OwnerTransportState,OwnerTransportConversation} from '../lib/owner-transport-contract';
import {rememberTransportDraft,takeTransportDraft,clearTransportDraft,trackingReturnHref} from '../lib/tracking-navigation';

const require=createRequire(import.meta.url);
const initial:OwnerTransportState={conversation:null,defaults:{name:'Private owner name',phone:'+12025550123'}};
const conversation:OwnerTransportConversation={id:71,publicRef:'SUP-OWNER-71',subject:'Town A → Town B',category:'shipment_observation',status:'open',assignedUserName:'Transport agent',agentJoined:true,resolvedAt:null,messages:[]};
type HttpCall={id:number;url:string;body:Record<string,unknown>;aborted:boolean};
type Fixture={mount:(initial:OwnerTransportState|null,scope?:string)=>void;calls:HttpCall[];routes:string[];resolve:(id:number,status:number,body:unknown)=>void;receipt:{endpoint:string;conversationId:number;showAlerts:boolean;active:boolean;initial:OwnerTransportConversation}|null};
// Actual installed React/DOM, workspace, shared intake and English i18n provider.
// Only HTTP/navigation and the already-tested conversation child are substituted;
// styles are omitted. This does not prove DB/auth/provider/device behavior.
const bundled=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';import {NextIntlClientProvider} from 'next-intl';
 import Workspace from './components/OwnerTransportWorkspace';
 const root=createRoot(document.getElementById('root'));let serial=0;
 window.fixture.mount=(initial,scope='fixture-owner')=>flushSync(()=>root.render(initial?<NextIntlClientProvider locale='en' timeZone='Africa/Addis_Ababa' messages={{}}><Workspace key={++serial} initial={initial} draftScope={scope}/></NextIntlClientProvider>:null));
`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'owner-workspace-ports',setup(b){
 b.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},a=>({path:require.resolve(a.path)}));
 b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({loader:'js',contents:'export default new Proxy({}, {get:(_,key)=>String(key)});'}));
 b.onResolve({filter:/^(?:next\/(?:link|navigation)|\.\/BuyingConversation)$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
  a.path==='next/link'?`import React from 'react';export default props=><a {...props} onClick={event=>{event.preventDefault();props.onClick?.(event);window.fixture.routes.push(props.href);}}/>;`
  :a.path==='next/navigation'?`export const useRouter=()=>({push:route=>window.fixture.routes.push(route)});`
  :`import React from 'react';export default props=>{window.fixture.receipt=props;return <section data-owner-receipt><p>{props.initial.publicRef}</p><button type='button' onClick={props.onAnother}>Next owner request</button></section>;};`
 }));
}}]});
let browser:Browser|undefined;
after(async()=>{await browser?.close();});
async function boot(){
 browser??=await chromium.launch({channel:'chrome',headless:true,timeout:20000});const context=await browser.newContext(),page=await context.newPage(),errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://localhost:45679/**',route=>route.fulfill({contentType:'text/html',body:'<main id="root"></main>'}));await page.goto('http://localhost:45679/dashboard/transport?new=1');
 await page.addScriptTag({content:`const pending=new Map();let serial=0;window.fixture={calls:[],routes:[],receipt:null,resolve:(id,status,body)=>{const response=pending.get(id);if(!response)throw Error('Missing controlled response '+id);pending.delete(id);response(new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}}));}};window.fetch=(url,options={})=>new Promise(resolve=>{const call={id:++serial,url:String(url),body:JSON.parse(options.body||'{}'),aborted:Boolean(options.signal?.aborted)};window.fixture.calls.push(call);options.signal?.addEventListener('abort',()=>{call.aborted=true;});pending.set(call.id,resolve);});`});
 await page.addScriptTag({content:(await bundled).outputFiles[0].text});
 const mount=(state:OwnerTransportState|null=initial,scope='fixture-owner')=>page.evaluate(({state,scope})=>(window as unknown as{fixture:Fixture}).fixture.mount(state,scope),{state,scope});
 await mount();return{page,mount,close:async()=>{await context.close();assert.deepEqual(errors,[],'Actual React rendering has no uncaught exceptions');}};
}
async function calls(page:Page){return page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.calls);}
async function pending(page:Page,count:number){await page.waitForFunction(count=>(window as unknown as{fixture:Fixture}).fixture.calls.length===count,count);return(await calls(page)).at(-1)!;}
async function respond(page:Page,id:number,status:number,body:unknown){await page.evaluate(({id,status,body})=>(window as unknown as{fixture:Fixture}).fixture.resolve(id,status,body),{id,status,body});}
async function fill(page:Page){await page.getByLabel('Name',{exact:true}).fill('Dispatch contact');await page.getByLabel('Phone',{exact:true}).fill('+12025550199');await page.getByLabel('From',{exact:true}).fill('Town A');await page.getByLabel('To',{exact:true}).fill('Town B');await page.getByLabel('Goods or transport details (optional)',{exact:true}).fill('Two boxes');}

test('FE-019 actual owner workspace keeps private defaults editable, validates paired fields and retains failed start/key',{timeout:90000},async()=>{
 const{page,close}=await boot();try{
  assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),initial.defaults.name);assert.equal(await page.getByLabel('Phone',{exact:true}).inputValue(),initial.defaults.phone);assert.equal(await page.getByLabel('From',{exact:true}).inputValue(),'');assert.equal(await page.getByLabel('To',{exact:true}).inputValue(),'');assert.deepEqual(await calls(page),[],'Opening private intake never starts a request');
  assert.equal(await page.getByRole('button',{name:'Start chat',exact:true}).isDisabled(),true);for(const label of ['From','To','Name','Phone'])assert.equal(await page.getByLabel(label,{exact:true}).getAttribute('required'),'');
  await fill(page);await page.evaluate(()=>{const form=document.querySelector('form')!;form.requestSubmit();form.requestSubmit();});const first=await pending(page,1);assert.equal(first.url,'/api/owner-transport');assert.equal(first.body.name,'Dispatch contact');assert.equal(first.body.action,'start');
  for(const label of ['From','To','Name','Phone','Goods or transport details (optional)'])assert.equal(await page.getByLabel(label,{exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'Sending…',exact:true}).isDisabled(),true);
  await respond(page,first.id,503,{error:'Unable to connect. Please try again.'});await page.getByRole('alert').getByText('Unable to connect. Please try again.',{exact:true}).waitFor();assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),'Dispatch contact');assert.equal(await page.getByLabel('From',{exact:true}).inputValue(),'Town A');assert.equal(await page.getByLabel('Goods or transport details (optional)',{exact:true}).inputValue(),'Two boxes');
  await page.getByRole('button',{name:'Start chat',exact:true}).click();const retry=await pending(page,2);assert.deepEqual(retry.body,first.body,'Identical failed-start intake retains its idempotency key');await respond(page,retry.id,503,{error:'Unable to connect. Please try again.'});await page.getByRole('button',{name:'Start chat',exact:true}).waitFor();await page.getByLabel('To',{exact:true}).fill('Town C');await page.getByRole('button',{name:'Start chat',exact:true}).click();const changed=await pending(page,3);assert.notEqual(changed.body.idempotencyKey,first.body.idempotencyKey,'An edited intake is a new logical attempt');
  await respond(page,changed.id,200,{conversation,defaults:initial.defaults});await page.locator('[data-owner-receipt]').waitFor();const receipt=await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.receipt!);assert.equal(receipt.endpoint,'/api/owner-transport?conversation=71');assert.equal(receipt.conversationId,71);assert.equal(receipt.showAlerts,false);assert.equal(receipt.active,true);assert.equal(receipt.initial.publicRef,conversation.publicRef);assert.equal(new URL(page.url()).search,'?conversation=71');assert.ok(!page.url().includes('Private')&&!page.url().includes('120255')&&!page.url().includes('Town'));
  const tracking=page.getByRole('link',{name:'Tracking',exact:true});assert.equal(await tracking.count(),1);assert.equal(new URL((await tracking.getAttribute('href'))!,'http://localhost:45679').searchParams.get('return'),'/dashboard/transport?conversation=71','After Start, Tracking returns to the newly created current chat rather than another intake');
  assert.ok((await calls(page)).every(call=>call.url==='/api/owner-transport'),'No guest recovery, guest attention or support endpoint is used');await page.getByRole('button',{name:'Next owner request',exact:true}).click();assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.routes),['/dashboard/transport?new=1']);
 }finally{await close();}
});

test('FE-019 actual owner workspace rejects malformed receipts and opens a recovered canonical chat without an intake/send',{timeout:60000},async()=>{
 const{page,mount,close}=await boot();try{
  await fill(page);await page.getByRole('button',{name:'Start chat',exact:true}).click();const first=await pending(page,1);await respond(page,first.id,200,{conversation:{...conversation,id:0}});await page.getByRole('alert').getByText('Message could not be sent.',{exact:true}).waitFor();assert.equal(new URL(page.url()).search,'?new=1');assert.equal(await page.getByLabel('From',{exact:true}).inputValue(),'Town A');
  await mount({conversation,defaults:initial.defaults});await page.locator('[data-owner-receipt]').waitFor();assert.equal(await page.locator('form').count(),0);assert.equal((await calls(page)).length,1,'Recovering an owned receipt does not send or create another request');assert.equal(await page.getByRole('link',{name:'Chat history',exact:true}).getAttribute('href'),'/dashboard/transport/history');assert.equal(await page.getByRole('link',{name:'Back to account',exact:true}).getAttribute('href'),'/dashboard/profile');
 }finally{await close();}
});

test('FE-019 actual owner workspace aborts unmounted pending starts and ignores late success/failure before URL or state writes',{timeout:60000},async()=>{
 const{page,mount,close}=await boot();try{for(const status of [200,503]){
  await mount();await fill(page);await page.getByRole('button',{name:'Start chat',exact:true}).click();const request=await pending(page,status===200?1:2);const url=page.url();await mount(null);assert.equal((await calls(page)).at(-1)?.aborted,true,'Unmount aborts the exact in-flight owner request');await respond(page,request.id,status,status===200?{conversation,defaults:initial.defaults}:{error:'Late failure'});await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));assert.equal(page.url(),url);assert.equal(await page.locator('#root').innerHTML(),'');
 }}finally{await close();}
});

test('FE-069 actual owner intake Tracking handoff survives remount only for the same account and successful start clears it',{timeout:60000},async()=>{
 const{page,mount,close}=await boot();try{
  await fill(page);const tracking=page.getByRole('link',{name:'Tracking',exact:true}),href=await tracking.getAttribute('href');assert.ok(href);const target=new URL(href,'http://localhost:45679');assert.equal(target.pathname,'/tracking');assert.equal(target.searchParams.get('return'),'/dashboard/transport?new=1');assert.ok(!href.includes('Dispatch')&&!href.includes('120255')&&!href.includes('Town'));
  await tracking.click();await mount(null);await mount(initial,'fixture-owner');for(const[label,value]of[['Name','Dispatch contact'],['Phone','+12025550199'],['From','Town A'],['To','Town B'],['Goods or transport details (optional)','Two boxes']])assert.equal(await page.getByLabel(label,{exact:true}).inputValue(),value);assert.deepEqual(await calls(page),[],'Tracking navigation never creates a chat or invokes recipient Auth');
  await mount(initial,'different-owner');assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),initial.defaults.name);assert.equal(await page.getByLabel('From',{exact:true}).inputValue(),'');assert.equal(await page.getByLabel('Goods or transport details (optional)',{exact:true}).inputValue(),'');
  await mount(initial,'fixture-owner');await page.getByRole('button',{name:'Start chat',exact:true}).click();const request=await pending(page,1);await respond(page,request.id,200,{conversation,defaults:initial.defaults});await page.locator('[data-owner-receipt]').waitFor();await mount(initial,'fixture-owner');assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),initial.defaults.name);assert.equal(await page.getByLabel('From',{exact:true}).inputValue(),'');assert.equal(await page.getByLabel('Goods or transport details (optional)',{exact:true}).inputValue(),'');
 }finally{await close();}
});

test('FE-069 transport return cache is memory-only, bounded, expires and admits only local transport destinations',()=>{
 const key='tracking-owner-cache-fixture';rememberTransportDraft(key,{message:'Unsent'},1000);assert.deepEqual(takeTransportDraft(key,1001),{message:'Unsent'});assert.equal(takeTransportDraft(key,601000),undefined);
 for(let index=0;index<17;index++)rememberTransportDraft(key+index,{index},2000);assert.equal(takeTransportDraft(key+'0',2001),undefined);assert.deepEqual(takeTransportDraft(key+'16',2001),{index:16});clearTransportDraft(key+'16');assert.equal(takeTransportDraft(key+'16',2001),undefined);
 for(const path of ['/dashboard/transport','/dashboard/transport?new=1','/dashboard/transport?conversation=71'])assert.equal(trackingReturnHref(path),path);
 for(const path of ['https://evil.test/dashboard/transport','//evil.test','/dashboard/admin','/dashboard/transport?conversation=71&email=secret','/dashboard/transport?conversation=0','/dashboard/transport#secret','/dashboard/transport?new=1%0A'])assert.equal(trackingReturnHref(path),'/?chat=transport');
});

async function serverPage(entry:string){
 const fixture={actor:{id:7,access_role:'client',business_id:18 as number|null},reads:[] as Array<{actor:unknown;query:unknown}>,businessReads:[] as number[],result:initial as unknown};
 const output=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'cjs',external:['react','react/jsx-runtime'],plugins:[{name:'owner-page-ports',setup(b){
  b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default {};'}));
  b.onResolve({filter:/^(?:next\/(?:navigation|link)|@\/lib\/(?:auth|catalog-runtime|owner-transport|support|i18n\/server)|@\/components\/(?:DashboardShell|OwnerTransportWorkspace|PaginationNav))$/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});},notFound=()=>{throw Object.assign(Error('not found'),{code:'not_found'});};`:a.path==='next/link'?`import React from 'react';export default props=><a {...props}/>;`:a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`:a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async id=>{fixture.businessReads.push(id);return{id,name:'Owner business'};};`:a.path==='@/lib/owner-transport'?`export const readOwnerTransport=async(actor,query)=>{fixture.reads.push({actor,query});return fixture.result;};`:a.path==='@/lib/support'?`export class SupportError extends Error{constructor(message,code){super(message);this.code=code;}}`:a.path==='@/lib/i18n/server'?`export const getUiText=async()=>key=>key;`:a.path==='@/components/DashboardShell'?`import React from 'react';export default props=><main>{props.children}</main>;`:a.path==='@/components/OwnerTransportWorkspace'?`import React from 'react';export default props=><section data-owner-view>{props.initial.conversation?.publicRef||'Owner intake'}</section>;`:`export default ()=>null;`}));
 }}]});
 const module={exports:{} as{default:(props:{searchParams:Promise<Record<string,string>>})=>Promise<ReactElement>}};vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,fixture,require});return{fixture,render:async(query:Record<string,string>={})=>renderToStaticMarkup(await module.exports.default({searchParams:Promise.resolve(query)}))};
}

test('FE-019 owner server pages guard staff/unlinked accounts before reads and history links carry only canonical IDs',async()=>{
 for(const entry of ['app/dashboard/transport/page.tsx','app/dashboard/transport/history/page.tsx']){const{fixture,render}=await serverPage(entry);for(const role of ['team_member','platform_admin','operations_manager']){fixture.actor.access_role=role;await assert.rejects(render(),error=>(error as{url?:string}).url==='/dashboard');}fixture.actor.access_role='client';fixture.actor.business_id=null;await assert.rejects(render(),error=>(error as{url?:string}).url==='/dashboard');assert.deepEqual(fixture.reads,[]);assert.deepEqual(fixture.businessReads,[]);}
 const{fixture,render}=await serverPage('app/dashboard/transport/history/page.tsx');fixture.result={items:[{id:71,publicRef:'SUP-OWNER-71',subject:'Town A → Town B',status:'closed',resolvedAt:null,unread:true}],page:2,pages:3,total:31,firstItem:11,lastItem:20};const html=await render({page:'2'});assert.match(html,/href="\/dashboard\/transport\?conversation=71"/);assert.match(html,/SUP-OWNER-71/);assert.match(html,/Chat ended/);assert.doesNotMatch(html,/Private owner name|12025550123|guest|token/);assert.deepEqual(fixture.businessReads,[18]);assert.deepEqual(JSON.parse(JSON.stringify(fixture.reads[0].query)),{page:'2',history:'1'});
});

test('FE-019 retained support route redirects only authorized owner transport and preserves staff callback summary',async()=>{
 const fixture={actor:{id:7,access_role:'client',business_id:18 as number|null,role:'client',staff_queue_scope:null as string|null},reads:[] as number[],businessReads:[] as number[],thread:{conversation:{id:71,publicRef:'SUP-OWNER-71',subject:'Town A → Town B',participantKind:'client',assistanceCategory:'shipment_observation',businessName:'Owner shop',requesterLabel:'Dispatch contact',requestSummary:'From: Town A\nTo: Town B\nTwo boxes',visitorPhone:'+12025550199',visitorEmail:null,status:'open',assignedUserId:17,assignedUserName:'Assigned agent',resolvedAt:null,idleEndedAt:null},messages:[]}};
 const output=await build({entryPoints:['app/dashboard/support/[id]/page.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime','lucide-react'],plugins:[{name:'support-route-ports',setup(b){
  b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default {};'}));
  b.onResolve({filter:/^(?:next\/(?:link|navigation)|@\/lib\/(?:auth|catalog-runtime|support|support-video-requests|i18n\/server)|@\/app\/support-actions|@\/components\/(?:DashboardShell|TransportHandoffForm|SupportThreadRefresh|SupportAssignmentPicker|ChatReadObserver|SupportNavigationFields|SupportInboxRedirect|SupportJoinButton))$/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
   a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});};`
   :a.path==='next/link'?`import React from'react';export default props=><a {...props}/>;`
   :a.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`
   :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async id=>{fixture.businessReads.push(id);return{id,name:'Owner shop'};};`
   :a.path==='@/lib/support'?`export const getSupportConversation=async(user,id)=>{fixture.reads.push(id);return fixture.thread;},getSupportIdleEndEvidence=async()=>null,getTransportHandoff=async()=>null,getSupportAssignmentHistory=async()=>[],listSupportAgentWorkloads=async()=>[];export class SupportError extends Error{};`
   :a.path==='@/lib/support-video-requests'?`export const getVideoRequest=async()=>null;`
   :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>(source,values={})=>source.replace(/\\{([^}]+)\\}/g,(_,key)=>String(values[key]??'{'+key+'}'));`
   :a.path==='@/app/support-actions'?`export const reviewVideoRequestAction=async()=>{},joinSupportConversationAction=async()=>{},claimSupportConversationAction=async()=>{},closeSupportConversationAction=async()=>{},postSupportMessageAction=async()=>{},reassignSupportConversationAction=async()=>{},reopenSupportConversationAction=async()=>{};`
   :a.path==='@/components/DashboardShell'?`import React from'react';export default props=><main>{props.children}</main>;`
   :`export default()=>null;`
  }));
 }}]});
 const module={exports:{} as{default:(props:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string>>})=>Promise<ReactElement>}};vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,fixture,require,URLSearchParams});const render=async()=>renderToStaticMarkup(await module.exports.default({params:Promise.resolve({id:'71'}),searchParams:Promise.resolve({})}));
 await assert.rejects(render(),error=>(error as{url?:string}).url==='/dashboard/transport?conversation=71');assert.deepEqual(fixture.reads,[71],'The old link classifies only after the authorized support read');assert.deepEqual(fixture.businessReads,[],'Owner transport redirects before reading/rendering additional private workspace data');
 fixture.actor={...fixture.actor,id:17,access_role:'team_member',business_id:null,role:'staff',staff_queue_scope:'transport'};let html=await render();assert.match(html,/Request summary/);assert.match(html,/Dispatch contact/);assert.match(html,/From: Town A/);assert.match(html,/To: Town B/);assert.match(html,/href="tel:\+12025550199"/,'Staff callback summary retains the explicitly supplied transport phone');assert.doesNotMatch(html,/Email unavailable for this older conversation/);
 fixture.thread.conversation.participantKind='visitor';html=await render();assert.match(html,/Request summary/);assert.match(html,/href="tel:\+12025550199"/,'Visitor transport summary remains intact');
 fixture.actor={...fixture.actor,id:7,access_role:'client',business_id:18,role:'client',staff_queue_scope:null};fixture.thread.conversation.participantKind='client';fixture.thread.conversation.assistanceCategory='general';html=await render();assert.match(html,/support-reply-attachment/,'Technical owner support keeps its own attachment workflow');assert.doesNotMatch(html,/Request summary|tel:\+12025550199/,'Private technical support does not render callback-only transport contacts');
});
