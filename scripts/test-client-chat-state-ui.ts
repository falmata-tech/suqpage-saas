import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {chromium,expect,type Page} from '@playwright/test';
import {clientChatPresentation,type ClientChatSnapshot} from '../lib/support-client-state';

test('FE-019/FE-053 client response state hides internal assignment/urgency and distinguishes terminal history',()=>{
  for(const status of ['waiting','open'])for(const replyState of [undefined,null,'needs_reply','overdue'] as const){
    const result=clientChatPresentation({status,replyState,assignedUserName:'Internal assignee',agentJoined:false});
    assert.equal(result.statusKey,'Waiting for our team');assert.equal(result.joined,null);assert.equal(result.awaitingTeam,true);
    assert.doesNotMatch(JSON.stringify(result),/Internal assignee|Assigned|Overdue|10|minut|DueAt/);
  }
  assert.equal(clientChatPresentation({status:'open',replyState:'waiting_customer'}).statusKey,'Waiting for your reply');
  const joined=clientChatPresentation({status:'open',replyState:'overdue',agentJoined:true,assignedUserName:'Accepted agent'});
  assert.equal(joined.statusKey,'Waiting for our team');assert.deepEqual(joined.joined,{key:'{value1} joined your chat',values:{value1:'Accepted agent'}});
  assert.equal(clientChatPresentation({status:'open',agentJoined:true}).joined?.key,'An agent joined your chat');
  for(const replyState of ['needs_reply','overdue','waiting_customer'] as const){
    const ended=clientChatPresentation({status:'closed',replyState,agentJoined:true,assignedUserName:'Historical agent'});
    assert.equal(ended.statusKey,'Chat ended');assert.equal(ended.joined,null);assert.equal(ended.awaitingTeam,false);
    for(const resolvedAt of [0,123])assert.equal(clientChatPresentation({status:'closed',replyState,resolvedAt}).statusKey,'Resolved');
  }
});

const require=createRequire(import.meta.url);
// Real React and the actual client views run together. Only HTTP, native DOM,
// focus/read-observer/storage ports and polling time are controlled. No app API,
// database, provider, device or real-time deadline claim is made by this suite.
const entry=String.raw`
import React from'react';import{createRoot}from'react-dom/client';
import Web from'./components/BuyingConversation';import Native from'./apps/mobile/app/buying';
import{OwnerChat,SupportList}from'./apps/mobile/src/owner-inbox';
import History from'./apps/mobile/src/OwnerTransportHistory';
const actualTimeout=window.setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>actualTimeout(fn,ms===5000||ms===30000?40:ms,...args);
const snapshot={id:71,subject:'Fixture request',publicRef:'SUP-FIXTURE-71',status:'open',category:'shipment_observation',assistanceCategory:'general',assignedUserName:'Internal assignee',agentJoined:false,replyState:'needs_reply',staffReplyDueAt:123456,resolvedAt:null,messages:[]};
const fixture=window.fixture={snapshot,list:[],calls:[],routes:[],session:{user:{id:'fixture-owner'}},t:(key,values={})=>key.replace(/\{(\w+)\}/g,(_,key)=>values[key]||'')};
fixture.call=async(path,options={})=>{fixture.calls.push({path,body:options.body||null});if(options.body)throw Error('Unexpected customer write');const current=structuredClone(fixture.snapshot);if(path.includes('history=1')||path.startsWith('owner/support?'))return{items:structuredClone(fixture.list),page:1,pages:1,total:fixture.list.length};if(path.startsWith('owner/support/'))return{conversation:current,messages:current.messages};return{conversation:current,defaults:{name:'Private owner',phone:'+12025550123'}};};
window.fetch=async(path,options={})=>({ok:true,json:async()=>fixture.call(String(path),{body:options.body?JSON.parse(options.body):null})});
const root=createRoot(document.getElementById('root'));window.qa={mount:kind=>root.render(kind==='web'?<Web key={kind} initial={fixture.snapshot} active onAnother={()=>{}} showAlerts={false}/>:kind==='native-visitor'?<Native key={kind}/>:kind==='native-owner'?<Native key={kind} owner/>:kind==='support'?<OwnerChat key={kind} id="71"/>:kind==='support-list'?<SupportList key={kind}/>:<History key={kind}/>),set:patch=>Object.assign(fixture.snapshot,patch),list:items=>{fixture.list=items;},calls:()=>fixture.calls};
`;
const ui=String.raw`
import React from'react';export const colors={},s={row:{},wrap:{}};
export const Screen=({children})=><main>{children}</main>,Copy=({children,heading})=>heading?<h1>{children}</h1>:<p>{children}</p>,Card=({children})=><section>{children}</section>;
export const Field=({label,value,onChangeText,editable=true})=><label>{label}<textarea aria-label={label} value={value||''} disabled={!editable} onChange={event=>onChangeText(event.target.value)}/></label>;
export const Button=({label,onPress,disabled})=><button disabled={disabled} onClick={onPress}>{label}</button>,Chip=Button,Status=({loading,error})=><div>{loading?<span role="progressbar">Loading</span>:null}{error?<span role="alert">{error}</span>:null}</div>,openLink=()=>{throw Error('Unexpected external link');};
`;
const runtime=String.raw`
import{useEffect,useState}from'react';export const useApp=()=>({t:window.fixture.t,locale:'en',session:window.fixture.session,ownerRequest:window.fixture.call});
export const request=(path,options)=>window.fixture.call(path,options),secure={getItem:async()=> 'controlled-visitor-token',setItem:async()=>{throw Error('Unexpected storage write');},removeItem:async()=>{throw Error('Unexpected storage deletion');}};
export class ApiFailure extends Error{};
export function useLoad(load,deps=[]){const[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);useEffect(()=>{let active=true;load().then(value=>{if(active){setData(value);setLoading(false);}}).catch(error=>{if(active){setError(error.message);setLoading(false);}});return()=>{active=false;};},[...deps,revision]);return{data,error,loading,reload:()=>setRevision(value=>value+1)};}
`;
const bundled=build({stdin:{contents:entry,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'client-state-view-ports',setup(b){
  b.onResolve({filter:/^react(?:\/.*)?$/},a=>({path:require.resolve(a.path)}));
  b.onResolve({filter:/\.css$/},a=>({path:a.path,namespace:'css-port'}));b.onLoad({filter:/.*/,namespace:'css-port'},()=>{
    const css=readFileSync('components/BuyingConversation.module.css','utf8');
    const classes=Object.fromEntries([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(match=>[match[1],match[1]]));
    return{loader:'js',contents:`const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);export default ${JSON.stringify(classes)};`};
  });
  b.onResolve({filter:/^(?:@\/lib\/i18n\/ui|react-native|expo-router|expo-crypto|(?:\.\/|\.\.\/src\/)(?:runtime|ui|ChatReadSentinel|AttentionAlerts|TransportPlanView|owner-forms|support-files)|\.\/ChatReadObserver)$/},a=>({path:a.path.startsWith('../src/')?'./'+a.path.split('/').at(-1):a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:a.path==='@/lib/i18n/ui'?`export const useUiText=()=>window.fixture.t;`
    :a.path==='react-native'?`import React from'react';export const AppState={currentState:'active'},View=({children})=><div>{children}</div>,StyleSheet={create:value=>value};`
    :a.path==='expo-router'?`import{useEffect}from'react';export const useFocusEffect=fn=>useEffect(fn,[fn]),router={push:route=>window.fixture.routes.push(route),replace:route=>window.fixture.routes.push(route)};`
    :a.path==='expo-crypto'?`export const randomUUID=()=> 'controlled-key';`
    :a.path==='./runtime'?runtime:a.path==='./ui'?ui
    :a.path==='./ChatReadObserver'?`export const useVisibleChatRead=()=>{};`
    :a.path==='./TransportPlanView'?`export const TransportPlanSummary=()=>null;export default()=>null;`
    :a.path==='./AttentionAlerts'?`export const TransportAlerts=()=>null;export default()=>null;`
    :a.path==='./owner-forms'?`export const ActionStatus=()=>null,useAction=()=>({busy:false,run:async fn=>fn()});`
    :a.path==='./support-files'?`export const Attachment=()=>null,pickSupportFile=()=>{throw Error('Unexpected file action');},supportReplyForm=()=>{throw Error('Unexpected file action');};`
    :`export const ChatReadTranscript=({children})=>children;export default()=>null;` }));
}}]});
type Snapshot=ClientChatSnapshot&{publicRef?:string;subject?:string;unread?:boolean;id?:number};
async function patch(page:Page,value:Snapshot){await page.evaluate(value=>(window as unknown as{qa:{set:(value:Snapshot)=>void}}).qa.set(value),value);}
const calls=(page:Page)=>page.evaluate(()=>(window as unknown as{fixture:{calls:Array<{body:unknown}>}}).fixture.calls);

test('FE-019/FE-053 actual customer React views preserve drafts through explicit join/response/terminal snapshots',{timeout:60000},async t=>{
 const browser=await chromium.launch({headless:true});const errors:string[]=[];try{
  const code=(await bundled).outputFiles[0].text;
  async function page(kind:string,items?:Snapshot[]){const p=await browser.newPage();p.on('pageerror',error=>errors.push(error.message));await p.route('http://localhost:45893/**',route=>route.fulfill({contentType:'text/html',body:'<style>*{box-sizing:border-box}body{margin:0}</style><div id="root"></div>'}));await p.goto('http://localhost:45893/');await p.addScriptTag({content:code});if(items)await p.evaluate(items=>(window as unknown as{qa:{list:(items:Snapshot[])=>void}}).qa.list(items),items);await p.evaluate(kind=>(window as unknown as{qa:{mount:(kind:string)=>void}}).qa.mount(kind),kind);return p;}
  for(const kind of ['web','native-visitor','native-owner','support'])await t.test(kind+' hides internal routing and updates response/presence separately',async()=>{const p=await page(kind);try{
    await expect(p.getByText('Waiting for our team',{exact:true})).toBeVisible();await expect(p.getByText('SUP-FIXTURE-71',{exact:true})).toBeVisible();assert.doesNotMatch(await p.locator('body').innerText(),/Internal assignee|Assigned to|Overdue|123456|Chat connected/);
    const input=p.getByRole('textbox',{name:kind==='web'?'Reply':'Message',exact:true});await input.fill('Unsaved participant reply');
    await patch(p,{status:'open',replyState:'overdue',agentJoined:false,assignedUserName:'Reassigned internally'});await expect.poll(async()=>(await calls(p)).length).toBeGreaterThan(1);await expect(input).toHaveValue('Unsaved participant reply');assert.doesNotMatch(await p.locator('body').innerText(),/Reassigned internally|Assigned to|Overdue|123456/);
    await patch(p,{status:'open',replyState:'needs_reply',agentJoined:true,assignedUserName:'Joined agent'});await expect(p.getByText('Joined agent joined your chat',{exact:true})).toBeVisible();await expect(p.getByText('Waiting for our team',{exact:true})).toBeVisible();await expect(input).toHaveValue('Unsaved participant reply');
    await patch(p,{status:'open',replyState:'waiting_customer',agentJoined:true,assignedUserName:'Joined agent'});await expect(p.getByText('Waiting for your reply',{exact:true})).toBeVisible();await expect(input).toHaveValue('Unsaved participant reply');
    await patch(p,{status:'closed',replyState:null,agentJoined:true,assignedUserName:'Historical agent',resolvedAt:null});await expect(p.getByText('Chat ended',{exact:true})).toBeVisible();await expect(p.getByText('Waiting for your reply',{exact:true})).toHaveCount(0);assert.doesNotMatch(await p.locator('body').innerText(),/Historical agent|joined your chat|Assigned to/);if(kind!=='support')await expect(p.getByText('Our team can still follow up by phone.',{exact:true})).toBeVisible();
    await patch(p,{status:'closed',resolvedAt:456});await expect(p.getByText('Resolved',{exact:true})).toBeVisible();await expect(p.getByText('Chat ended',{exact:true})).toHaveCount(0);await expect(p.getByText('Our team can still follow up by phone.',{exact:true})).toHaveCount(0);assert.equal((await calls(p)).filter(item=>item.body).length,0,'Observing status never sends, joins or acknowledges through controlled read ports');
   }finally{await p.close();}});
  const items:Snapshot[]=[{id:1,subject:'Assigned internally',publicRef:'SUP-1',status:'open',replyState:'needs_reply',assignedUserName:'Hidden agent',agentJoined:false},{id:2,subject:'Internal urgent',publicRef:'SUP-2',status:'open',replyState:'overdue'},{id:3,subject:'Reply requested',publicRef:'SUP-3',status:'open',replyState:'waiting_customer'},{id:4,subject:'Ended request',publicRef:'SUP-4',status:'closed',resolvedAt:null},{id:5,subject:'Resolved request',publicRef:'SUP-5',status:'closed',resolvedAt:123}];
  for(const kind of ['support-list','history'])await t.test(kind+' distinguishes response/ended/resolved without raw live or staff urgency',async()=>{const p=await page(kind,items);try{await expect(p.getByText('Waiting for our team',{exact:true})).toHaveCount(2);await expect(p.getByText('Waiting for your reply',{exact:true})).toHaveCount(1);await expect(p.getByText('Chat ended',{exact:true})).toHaveCount(1);await expect(p.getByText('Resolved',{exact:true})).toHaveCount(1);assert.doesNotMatch(await p.locator('body').innerText(),/Hidden agent|Assigned to|Overdue|Live chat/);assert.equal((await calls(p)).filter(item=>item.body).length,0);}finally{await p.close();}});
  await t.test('actual client CSS wraps a long accepted identity at320px without hiding its reference or actions',async()=>{const p=await page('web');try{
    await p.setViewportSize({width:320,height:568});const name='Long accepted staff identity with a clearly distinguishable name';await patch(p,{status:'open',replyState:'needs_reply',agentJoined:true,assignedUserName:name});await expect(p.getByText(name+' joined your chat',{exact:true})).toBeVisible();
    const metrics=await p.locator('.status').evaluate(element=>({width:element.clientWidth,scrollWidth:element.scrollWidth,connectionHeight:element.querySelector('.connection')!.getBoundingClientRect().height,right:element.getBoundingClientRect().right}));assert.ok(metrics.scrollWidth<=metrics.width+1,'The joined identity wraps inside its actual grid column');assert.ok(metrics.connectionHeight>20,'Long joined text uses multiple lines instead of overflowing');assert.ok(metrics.right<=320);await expect(p.getByText('SUP-FIXTURE-71',{exact:true})).toBeVisible();await expect(p.getByRole('button',{name:'End chat',exact:true})).toBeVisible();
  }finally{await p.close();}});
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
