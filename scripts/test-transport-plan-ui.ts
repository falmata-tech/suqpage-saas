import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {build} from 'esbuild';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement,type ReactElement} from 'react';
import {chromium,type Browser,type Page} from 'playwright';
import type {TransportPlan} from '@suqpage/contracts';
import {TransportPlanError} from '../lib/transport-plan-contract';
import {supportTransportPlanHref,workspaceActiveHref} from '../lib/support-navigation';
import type {OwnerEditResult} from '../lib/owner-edit-contract';

const require=createRequire(import.meta.url);
const plan:TransportPlan={version:4,legs:[
  {id:'11111111-1111-4111-8111-111111111111',providerName:'First provider',method:'truck',origin:'Place A',destination:'Place B'},
  {id:'22222222-2222-4222-8222-222222222222',providerName:'Second provider',method:'air',origin:'Place B',destination:'Place C'},
]};
const token='a'.repeat(64),sharePath='/transport-plan#'+token;
const origin={queue:'transport' as const,status:'history',q:'saved search',page:'2'};
const readHref=supportTransportPlanHref(71,origin);

test('FE-068 plan links retain only bounded inbox context and keep Transport active',()=>{
 assert.equal(readHref,'/dashboard/support/71/plan?queue=transport&status=history&q=saved+search&page=2');
 assert.equal(supportTransportPlanHref(71,{...origin,page:'9999999',status:'foreign'},{edit:true}),'/dashboard/support/71/plan?queue=transport&q=saved+search&edit=1');
 assert.throws(()=>supportTransportPlanHref(0,origin));
 const items=[{href:'/dashboard/support?queue=support'},{href:'/dashboard/support?queue=transport'}];
 assert.equal(workspaceActiveHref(items,'/dashboard/support/71/plan',new URLSearchParams(), 'transport'),items[1].href);
});

async function actionFixture(){
 const state={actor:{id:9,business_id:null,access_role:'team_member'},calls:[] as Array<{kind:string;actor:unknown;input:unknown}>,failure:null as Error|null,revalidated:[] as string[],authCalls:0,authFailure:null as Error|null};
 const output=await build({entryPoints:['app/dashboard/support/[id]/plan/actions.ts'],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',plugins:[{name:'plan-action-ports',setup(b){
  b.onResolve({filter:/^(?:next\/(?:cache|navigation)|@\/lib\/(?:auth|transport-plan(?:-contract)?))$/},a=>({path:a.path,external:true}));
 }}]});
 const ports:Record<string,unknown>={
  'next/cache':{revalidatePath:(path:string)=>state.revalidated.push(path)},
  'next/navigation':{redirect:(url:string)=>{throw Object.assign(new Error('redirect'),{url});}},
  '@/lib/auth':{requireUser:async()=>{state.authCalls++;if(state.authFailure)throw state.authFailure;return state.actor;}},
  '@/lib/transport-plan-contract':{TransportPlanError},
  '@/lib/transport-plan':{saveTransportPlan:async(actor:unknown,input:unknown)=>{state.calls.push({kind:'save',actor,input});if(state.failure)throw state.failure;return{plan,sharePath};},replaceTransportPlanLink:async(actor:unknown,input:unknown)=>{state.calls.push({kind:'replace',actor,input});if(state.failure)throw state.failure;return{plan,sharePath};}},
 };
 const module={exports:{} as{saveTransportPlanAction:(form:FormData)=>Promise<OwnerEditResult>;replaceTransportPlanLinkAction:(form:FormData)=>Promise<OwnerEditResult>}};
 vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,require:(name:string)=>ports[name]||require(name),FormData,URLSearchParams,Set,JSON,Number,Error});
 const form=(save=true)=>{
  const data=new FormData();for(const[key,value]of Object.entries({conversationId:'71',publicRef:'SUP-PLAN-71',expectedVersion:'4',nav_queue:'transport',nav_status:'history',nav_q:'saved search',nav_page:'2'}))data.set(key,value);
  if(save)data.set('legs',JSON.stringify(plan.legs));return data;
 };
 return{state,actions:module.exports,form};
}

test('FE-069 S141 stale chat-plan save/replace actions authenticate but never mutate or redirect historical plans',async()=>{
 const{state,actions,form}=await actionFixture();
 const expected={error:'Create shipment plans from Tracking.'};
 for(const action of[actions.saveTransportPlanAction,actions.replaceTransportPlanLinkAction]){
  for(const data of[form(),new FormData(),(()=>{const value=form();value.set('legs','{');value.append('conversationId','72');return value;})()]){
   const before=[...data.entries()];assert.deepEqual(JSON.parse(JSON.stringify(await action(data))),expected);assert.deepEqual([...data.entries()],before);
  }
 }
 assert.equal(state.authCalls,6,'Every stale mutation endpoint still authenticates');assert.deepEqual(state.calls,[]);assert.deepEqual(state.revalidated,[]);
 state.authFailure=Object.assign(Error('authentication required'),{url:'/login'});
 await assert.rejects(actions.saveTransportPlanAction(form()),error=>error===state.authFailure);await assert.rejects(actions.replaceTransportPlanLinkAction(form(false)),error=>error===state.authFailure);assert.deepEqual(state.calls,[]);
});

async function pageFixture(){
 const state={actor:{id:9,business_id:null,access_role:'team_member',staff_queue_scope:'transport'},reads:[] as string[],category:'shipment_observation',status:'closed',saved:{plan,sharePath} as{plan:TransportPlan|null;sharePath:string|null},failure:null as Error|null};
 const output=await build({entryPoints:['app/dashboard/support/[id]/plan/page.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],plugins:[{name:'plan-page-ports',setup(b){
  b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default {};'}));
  b.onResolve({filter:/^(?:next\/(?:link|navigation)$|@\/lib\/(?:auth|catalog-runtime|i18n\/server|support|transport-plan)$|@\/components\/)/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
   a.path==='next/link'?`import React from'react';export default props=><a {...props}/>;`
   :a.path==='next/navigation'?`export const redirect=url=>{throw Object.assign(Error('redirect'),{url});},notFound=()=>{throw Object.assign(Error('not found'),{code:'not_found'});};`
   :a.path==='@/lib/auth'?`export const requireUser=async()=>state.actor;`
   :a.path==='@/lib/i18n/server'?`export const getUiText=async()=>key=>key;`
   :a.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async()=>null;`
   :a.path==='@/lib/support'?`export class SupportError extends Error{};export const getSupportConversation=async()=>{state.reads.push('conversation');return{conversation:{publicRef:'SUP-PLAN-71',assistanceCategory:state.category,status:state.status,resolvedAt:null}};};`
   :a.path==='@/lib/transport-plan'?`export const TransportPlanError=PlanError,readStaffTransportPlan=async()=>{state.reads.push('plan');if(state.failure)throw state.failure;return state.saved;};`
   :a.path.endsWith('DashboardShell')?`import React from'react';export default props=><main data-queue={props.supportQueue}>{props.children}</main>;`
   :a.path.endsWith('TransportPlanEditor')?`import React from'react';export default props=><section data-editor data-version={props.plan?.version||0} data-cancel={props.cancelHref}/>;`
   :a.path.endsWith('TransportPlanReadView')?`import React from'react';export default props=><section data-read>{props.plan.legs.map(leg=><p key={leg.id}>{leg.providerName}</p>)}</section>;`
   :`import React from'react';export default()=> <section data-link-actions/>;`
  }));
 }}]});
 const module={exports:{} as{default:(props:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string>>})=>Promise<ReactElement>}};
 vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,require,state,PlanError:TransportPlanError,URLSearchParams,Number});
 return{state,render:async(query:Record<string,string>={},id='71')=>renderToStaticMarkup(await module.exports.default({params:Promise.resolve({id}),searchParams:Promise.resolve({...origin,...query})}))};
}

test('FE-069 S142 obsolete case-plan route redirects eligible staff uniformly without loading historical data',async()=>{
 const{state,render}=await pageFixture();
 const queries:Record<string,string>[]=[{},{edit:'1'}];
 for(const id of ['71','bad','0'])for(const query of queries)await assert.rejects(render(query,id),error=>(error as{url?:string}).url==='/dashboard/tracking');
 assert.deepEqual(state.reads,[],'No conversation, plan or capability is read by the obsolete route');
 for(const role of ['client','team_member']){state.actor.access_role=role;state.actor.staff_queue_scope='support';await assert.rejects(render(),error=>(error as{url?:string}).url==='/dashboard');}
 for(const role of ['platform_admin','operations_manager']){state.actor.access_role=role;await assert.rejects(render(),error=>(error as{url?:string}).url==='/dashboard/tracking');}
 assert.deepEqual(state.reads,[]);
});

test('FE-068 shared actual read view preserves literal ordered stages/methods without editing or invented progress',async()=>{
 const output=await build({entryPoints:['components/TransportPlanReadView.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime','lucide-react'],plugins:[{name:'plan-read-view-ports',setup(b){
  b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default {};'}));
  b.onResolve({filter:/^@\/lib\/i18n\/ui$/},a=>({path:a.path,namespace:'ports'}));b.onLoad({filter:/.*/,namespace:'ports'},()=>({contents:`export const useUiText=()=>(key,values={})=>key.replace(/\\{([^}]+)\\}/g,(_,name)=>String(values[name]??'{'+name+'}'));`}));
 }}]});
 const module={exports:{} as{default:(props:{plan:TransportPlan})=>ReactElement}};vm.runInNewContext(output.outputFiles[0].text,{module,exports:module.exports,require});
 const methods=['air','truck','van','car','motorcycle'] as const;
 const sample:TransportPlan={version:1,legs:methods.map((method,index)=>({...plan.legs[0],id:String(index),method,providerName:index<2?'Same literal provider':'Provider '+index,origin:'Origin '+index,destination:'Destination '+index}))};
 const html=renderToStaticMarkup(createElement(module.exports.default,{plan:sample}));
 assert.match(html,/5 transport stages/);assert.equal((html.match(/Same literal provider/g)||[]).length,2,'Stages are not deduplicated into an invented provider total');
 for(const label of ['Air','Truck','Van','Car','Motorcycle','Origin 4','Destination 4'])assert.ok(html.includes(label),label);
 assert.ok(html.indexOf('Origin 0')<html.indexOf('Origin 4'));assert.doesNotMatch(html,/<button|<input|<form|ETA|current provider|completed/i);
});

type Call={kind:'save'|'replace';data:Record<string,string>};
type Fixture={calls:Call[];routes:string[];copied:string[];mount:(kind:'editor'|'links',value:TransportPlan|null)=>void;settle:(result:{error:string})=>void;reject:()=>void};
let browser:Browser|undefined;
after(async()=>{await browser?.close();});
const browserBundle=()=>build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import{NextIntlClientProvider}from'next-intl';
 import Editor from'./components/TransportPlanEditor';import Links from'./components/TransportPlanLinkActions';import styles from'./components/TransportPlanStaff.module.css';
 const root=createRoot(document.getElementById('root'));let serial=0;
 window.fixture.mount=(kind,plan)=>flushSync(()=>root.render(<NextIntlClientProvider locale='en' timeZone='Africa/Addis_Ababa' messages={{}}><main className={styles.workspace} key={++serial}>{kind==='editor'?<Editor conversationId={71} publicRef='SUP-PLAN-71' plan={plan} navigation={${JSON.stringify(origin)}} cancelHref=${JSON.stringify(readHref)}/>:<Links conversationId={71} publicRef='SUP-PLAN-71' version={4} sharePath=${JSON.stringify(sharePath)} navigation={${JSON.stringify(origin)}}/>}</main></NextIntlClientProvider>));
`},bundle:true,write:false,format:'iife',platform:'browser',outdir:'/virtual',plugins:[{name:'plan-browser-ports',setup(b){
 b.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},a=>({path:require.resolve(a.path)}));
 b.onResolve({filter:/^(?:next\/navigation|@\/app\/dashboard\/support\/\[id\]\/plan\/actions)$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({contents:a.path==='next/navigation'?`export const useRouter=()=>({push:href=>window.fixture.routes.push(href)}),unstable_rethrow=error=>{if(error?.digest)throw error;};`:`const call=(kind,data)=>new Promise((resolve,reject)=>{window.fixture.calls.push({kind,data:Object.fromEntries(data)});window.fixture.settle=resolve;window.fixture.reject=()=>reject(Error('private network failure'));});export const saveTransportPlanAction=data=>call('save',data),replaceTransportPlanLinkAction=data=>call('replace',data);`}));
}}]});
async function boot(width=390){
 browser??=await chromium.launch({headless:true,timeout:20000});
 const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage(),errors:string[]=[];page.setDefaultTimeout(5000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://localhost:45679/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://localhost:45679/dashboard/support/71/plan?edit=1');
 await page.addScriptTag({content:`window.fixture={calls:[],routes:[],copied:[]};Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.fixture.copied.push(text)}});`});
 const bundle=await browserBundle();await page.addStyleTag({content:'*{box-sizing:border-box}body{margin:0;padding:16px;font:16px Arial;color:#202428}button,a{cursor:pointer}.btn{border:1px solid #b7c4c4;border-radius:8px;background:white;color:inherit;text-decoration:none} .brand{background:#b83200;color:white}'+bundle.outputFiles.find(file=>file.path.endsWith('.css'))!.text});await page.addScriptTag({content:bundle.outputFiles.find(file=>file.path.endsWith('.js'))!.text});
 const mount=(kind:'editor'|'links',value:TransportPlan|null=plan)=>page.evaluate(({kind,value})=>(window as unknown as{fixture:Fixture}).fixture.mount(kind,value),{kind,value});
 return{page,mount,close:async()=>{await context.close();assert.deepEqual(errors,[],'Actual source React/DOM has no uncaught exceptions');}};
}
async function calls(page:Page){return page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.calls);}
async function settle(page:Page,error:string){await page.evaluate(error=>(window as unknown as{fixture:Fixture}).fixture.settle({error}),error);}

test('FE-068 actual editor preserves stable identities/order/drafts, focuses deletion, bounds legs and guards dirty Cancel',{timeout:90000},async()=>{
 const{page,mount,close}=await boot();try{
  await mount('editor');assert.equal(await page.getByLabel('Provider name',{exact:true}).first().inputValue(),'First provider');
  assert.deepEqual(await page.getByLabel('Transport method',{exact:true}).first().locator('option:not([value=""])').allTextContents(),['Air','Truck','Van','Car','Motorcycle']);
  assert.equal(await page.getByRole('button',{name:'Move up: Leg 1',exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'Move down: Leg 2',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'Move down: Leg 1',exact:true}).click();assert.equal(await page.getByLabel('Provider name',{exact:true}).first().inputValue(),'Second provider');
  await page.getByRole('button',{name:'Add leg',exact:true}).click();assert.equal(await page.getByLabel('Provider name',{exact:true}).nth(2).evaluate(node=>node===document.activeElement),true);
  assert.equal(await page.getByLabel('Provider name',{exact:true}).nth(2).inputValue(),'','Private intake is never used as an implicit public provider');
  await page.getByRole('button',{name:'Remove leg: Leg 2',exact:true}).click();assert.equal(await page.getByLabel('Provider name',{exact:true}).nth(1).evaluate(node=>node===document.activeElement),true);
  await page.getByLabel('Provider name',{exact:true}).nth(1).fill('Third provider');await page.getByLabel('Transport method',{exact:true}).nth(1).selectOption('van');await page.getByLabel('From',{exact:true}).nth(1).fill('Place C');await page.getByLabel('To',{exact:true}).nth(1).fill('Place D');
  await page.getByRole('button',{name:'Save plan',exact:true}).click();let saved=(await calls(page))[0];assert.equal(saved.kind,'save');assert.equal(saved.data.expectedVersion,'4');const legs=JSON.parse(saved.data.legs);assert.deepEqual(legs.map((leg:{id:string|null})=>leg.id),[plan.legs[1].id,null]);assert.equal(legs[1].method,'van');
  assert.equal(await page.getByRole('button',{name:'Saving…',exact:true}).isDisabled(),true);await page.evaluate(()=>{document.querySelector('form')!.requestSubmit();});assert.equal((await calls(page)).length,1,'Pending guard rejects repeated submission');
  await settle(page,'This transport plan changed. Reload before saving.');await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Provider name',{exact:true}).nth(1).inputValue(),'Third provider');assert.equal(await page.getByRole('alert').evaluate(node=>node===document.activeElement),true);
  await page.getByRole('button',{name:'Save plan',exact:true}).click();await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.reject());await page.getByRole('alert').getByText('Unable to connect. Please try again.',{exact:true}).waitFor();assert.equal(await page.getByLabel('To',{exact:true}).nth(1).inputValue(),'Place D');assert.deepEqual((await calls(page))[1].data,saved.data);
  await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('dialog',{name:'Unsaved changes',exact:true}).waitFor();await page.getByRole('button',{name:'Keep editing',exact:true}).click();assert.equal(await page.getByLabel('Provider name',{exact:true}).nth(1).inputValue(),'Third provider');assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.routes),[]);
  await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByRole('button',{name:'Discard changes',exact:true}).click();assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.routes),[readHref]);
  await mount('editor',null);assert.equal(await page.getByRole('button',{name:'Remove leg: Leg 1',exact:true}).isDisabled(),true);for(let i=1;i<12;i++)await page.getByRole('button',{name:'Add leg',exact:true}).click();assert.equal(await page.locator('[data-transport-leg]').count(),12);assert.equal(await page.getByRole('button',{name:'Add leg',exact:true}).isDisabled(),true);
 }finally{await close();}
});

test('FE-068 actual plan link controls copy only on click and require explicit confirmation before version-fenced replacement',{timeout:60000},async()=>{
 const{page,mount,close}=await boot();try{
  await mount('links');assert.deepEqual(await calls(page),[]);assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.copied),[]);
  await page.getByRole('button',{name:'Copy plan link',exact:true}).click();assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.copied),['http://localhost:45679'+sharePath]);assert.deepEqual(await calls(page),[],'Copy never rotates, saves or sends');
  await page.getByRole('button',{name:'Replace plan link',exact:true}).click();await page.getByRole('dialog',{name:'Replace this plan link?',exact:true}).waitFor();assert.deepEqual(await calls(page),[]);await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Replace plan link',exact:true}).evaluate(node=>node===document.activeElement),true);
  await page.getByRole('button',{name:'Replace plan link',exact:true}).click();await page.getByRole('button',{name:'Replace link',exact:true}).click();assert.equal((await calls(page)).length,1);assert.equal((await calls(page))[0].kind,'replace');assert.equal((await calls(page))[0].data.expectedVersion,'4');assert.ok(!('legs'in(await calls(page))[0].data));
  await page.locator('dialog form').evaluate(form=>(form as HTMLFormElement).requestSubmit());assert.equal((await calls(page)).length,1,'Confirmed replacement remains single-flight');await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').isVisible(),true,'Pending replacement cannot be dismissed as if cancelled');
  await settle(page,'This transport plan changed. Reload before saving.');await page.getByRole('alert').waitFor();assert.equal(await page.getByRole('dialog').isVisible(),true);await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.addScriptTag({content:`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});`});await page.getByRole('button',{name:'Copy plan link',exact:true}).click();assert.equal(await page.getByLabel('Select and copy the link below.',{exact:true}).inputValue(),'http://localhost:45679'+sharePath);assert.equal((await calls(page)).length,1);
 }finally{await close();}
});

test('FE-068 actual staff editor keeps labelled 48px controls and balanced From/To pairs on desktop and phone',{timeout:60000},async()=>{
 const{page,mount,close}=await boot(1440);try{
  await mount('editor');for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:844});
   const from=await page.getByLabel('From',{exact:true}).first().boundingBox(),to=await page.getByLabel('To',{exact:true}).first().boundingBox();assert.ok(from&&to);
   if(width>600){assert.ok(Math.abs(from.y-to.y)<1);assert.ok(Math.abs(from.width-to.width)<1);}else{assert.ok(to.y>from.y+from.height);assert.ok(Math.abs(from.x-to.x)<1);}
   const geometry=await page.locator('button,input:not([type=hidden]),select').evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length).map(node=>{const box=node.getBoundingClientRect();return{height:box.height,left:box.left,right:box.right};}));
   assert.ok(geometry.every(box=>box.height>=48&&box.left>=0&&box.right<=width),JSON.stringify({width,geometry}));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  }
 }finally{await close();}
});
