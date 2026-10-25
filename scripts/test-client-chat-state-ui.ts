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
const root=createRoot(document.getElementById('root'));window.qa={mount:kind=>root.render(kind==='web'||kind==='web-transport'?<Web key={kind} initial={fixture.snapshot} active onAnother={()=>{}} endpoint={kind==='web-transport'?'/api/public-support?channel=transport':undefined} showAlerts={false}/>:kind==='native-visitor'?<Native key={kind}/>:kind==='native-owner'?<Native key={kind} owner/>:kind==='support'?<OwnerChat key={kind} id="71"/>:kind==='support-list'?<SupportList key={kind}/>:<History key={kind}/>),reset:()=>root.render(null),set:patch=>Object.assign(fixture.snapshot,patch),list:items=>{fixture.list=items;},calls:()=>fixture.calls};
`;
const ui=String.raw`
import React from'react';export const colors={},s={row:{},wrap:{}},Icon=()=>null;
export const Screen=({children})=><main>{children}</main>,Copy=({children,heading})=>heading?<h1>{children}</h1>:<p>{children}</p>,Card=({children})=><section>{children}</section>;
export const Field=({label,value,onChangeText,editable=true})=><label>{label}<textarea aria-label={label} value={value||''} disabled={!editable} onChange={event=>onChangeText(event.target.value)}/></label>;
export const Button=({label,onPress,disabled})=><button disabled={disabled} onClick={onPress}>{label}</button>,Chip=Button,Status=({loading,error})=><div>{loading?<span role="progressbar">Loading</span>:null}{error?<span role="alert">{error}</span>:null}</div>,openLink=()=>{throw Error('Unexpected external link');};
`;
const runtime=String.raw`
import{useEffect,useState}from'react';export const transportStorageKey='suqpage-transport';export const useApp=()=>({t:window.fixture.t,locale:'en',session:window.fixture.session,ownerRequest:window.fixture.call});
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
  b.onResolve({filter:/^(?:@\/lib\/i18n\/ui|next-intl|react-native|expo-router|expo-crypto|(?:\.\/|\.\.\/src\/)(?:runtime|ui|ChatReadSentinel|AttentionAlerts|TransportPlanView|TransportCoordinator|owner-forms|support-files)|\.\/ChatReadObserver)$/},a=>({path:a.path.startsWith('../src/')?'./'+a.path.split('/').at(-1):a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:a.path==='@/lib/i18n/ui'?`export const useUiText=()=>window.fixture.t;`
    :a.path==='next-intl'?`export const useLocale=()=> 'en';`
    :a.path==='react-native'?`import React from'react';export const AppState={currentState:'active'},View=({children})=><div>{children}</div>,ScrollView=View,Text=({children})=><span>{children}</span>,Pressable=({children,onPress,accessibilityLabel,disabled})=><button type='button' aria-label={accessibilityLabel} disabled={disabled} onClick={onPress}>{children}</button>,StyleSheet={create:value=>value},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
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
 const browser=await chromium.launch({channel:'chrome',headless:true});const errors:string[]=[];try{
  const code=(await bundled).outputFiles[0].text;
  async function page(kind:string,items?:Snapshot[]){const p=await browser.newPage();p.on('pageerror',error=>errors.push(error.message));await p.route('http://localhost:45893/**',route=>route.fulfill({contentType:'text/html',body:'<style>*{box-sizing:border-box}body{margin:0}</style><div id="root"></div>'}));await p.goto('http://localhost:45893/');await p.addScriptTag({content:code});if(items)await p.evaluate(items=>(window as unknown as{qa:{list:(items:Snapshot[])=>void}}).qa.list(items),items);await p.evaluate(kind=>(window as unknown as{qa:{mount:(kind:string)=>void}}).qa.mount(kind),kind);return p;}
  for(const kind of ['web','native-visitor','native-owner','support'])await t.test(kind+' hides internal routing and updates response/presence separately',async()=>{const p=await page(kind);try{
    await expect(p.getByText(kind.startsWith('native')?'Waiting for a live agent at SharedTrucks Logistics':'Waiting for our team',{exact:true})).toBeVisible();await expect(p.getByText('SUP-FIXTURE-71',{exact:true})).toBeVisible();assert.doesNotMatch(await p.locator('body').innerText(),/Internal assignee|Assigned to|Overdue|123456|Chat connected/);
    if(kind.startsWith('native'))await expect(p.getByText(/Live chat wait: 03:\d\d left/)).toBeVisible();
    const input=p.getByRole('textbox',{name:kind==='web'?'Reply':'Message',exact:true});await input.fill('Unsaved participant reply');
    await patch(p,{status:'open',replyState:'overdue',agentJoined:false,assignedUserName:'Reassigned internally'});await expect.poll(async()=>(await calls(p)).length).toBeGreaterThan(1);await expect(input).toHaveValue('Unsaved participant reply');assert.doesNotMatch(await p.locator('body').innerText(),/Reassigned internally|Assigned to|Overdue|123456/);
    await patch(p,{status:'open',replyState:'needs_reply',agentJoined:true,assignedUserName:'Joined agent'});await expect(p.getByText('Joined agent joined your chat',{exact:true})).toBeVisible();await expect(p.getByText('Waiting for our team',{exact:true})).toBeVisible();await expect(input).toHaveValue('Unsaved participant reply');
    if(kind.startsWith('native'))await expect(p.getByText(/Live chat wait:/)).toHaveCount(0);
    await patch(p,{status:'open',replyState:'waiting_customer',agentJoined:true,assignedUserName:'Joined agent'});await expect(p.getByText('Waiting for your reply',{exact:true})).toBeVisible();await expect(input).toHaveValue('Unsaved participant reply');
    await patch(p,{status:'closed',replyState:null,agentJoined:true,assignedUserName:'Historical agent',resolvedAt:null});await expect(p.getByText('Chat ended',{exact:true})).toBeVisible();await expect(p.getByText('Waiting for your reply',{exact:true})).toHaveCount(0);assert.doesNotMatch(await p.locator('body').innerText(),/Historical agent|joined your chat|Assigned to/);if(kind==='web')await expect(p.getByText('Our team can still follow up by phone.',{exact:true})).toBeVisible();else if(kind.startsWith('native'))await expect(p.getByText('Our team can still follow up by phone.',{exact:true})).toHaveCount(0);
    await patch(p,{status:'closed',resolvedAt:456});
    if(kind!=='support'){
      await p.evaluate(()=>(window as unknown as{qa:{reset:()=>void}}).qa.reset());
      await expect(p.getByText('Chat ended',{exact:true})).toHaveCount(0);
      await p.evaluate(kind=>(window as unknown as{qa:{mount:(kind:string)=>void}}).qa.mount(kind),kind);
    }
    await expect(p.getByText('Resolved',{exact:true})).toBeVisible();await expect(p.getByText('Chat ended',{exact:true})).toHaveCount(0);await expect(p.getByText('Our team can still follow up by phone.',{exact:true})).toHaveCount(0);assert.equal((await calls(p)).filter(item=>item.body).length,0,'Observing status never sends, joins or acknowledges through controlled read ports');
   }finally{await p.close();}});
  for(const kind of ['native-visitor','web-transport'])await t.test(kind+' hands off from countdown to provider-named contact choice at the server deadline',async()=>{
   const p=await page(kind);try{
    await expect(p.getByText(/Live chat wait: 03:\d\d left/)).toBeVisible();
    const now=Date.now();await patch(p,{status:'open',transportWaitStartedAt:now-210_000,serverNow:now,agentJoined:false} as Snapshot);
    await expect(p.getByText('All live agents at SharedTrucks Logistics are busy helping other customers right now.',{exact:true})).toBeVisible();
    await expect(p.getByText(/Live chat wait:/)).toHaveCount(0);
    await expect(p.getByRole('button',{name:'Try again later',exact:true})).toBeVisible();
    await expect(p.getByRole('button',{name:'Send contact details',exact:true})).toBeVisible();
    assert.equal((await calls(p)).filter(item=>item.body).length,0,'Deadline handoff never silently sends contact details');
   }finally{await p.close();}
  });
  const items:Snapshot[]=[{id:1,subject:'Assigned internally',publicRef:'SUP-1',status:'open',replyState:'needs_reply',assignedUserName:'Hidden agent',agentJoined:false},{id:2,subject:'Internal urgent',publicRef:'SUP-2',status:'open',replyState:'overdue'},{id:3,subject:'Reply requested',publicRef:'SUP-3',status:'open',replyState:'waiting_customer'},{id:4,subject:'Ended request',publicRef:'SUP-4',status:'closed',resolvedAt:null},{id:5,subject:'Resolved request',publicRef:'SUP-5',status:'closed',resolvedAt:123}];
  for(const kind of ['support-list','history']){
   await t.test(kind+' explains empty history without unusable pagination',async()=>{const p=await page(kind,[]);try{await expect(p.getByText(kind==='support-list'?'No support conversations yet.':'No conversations yet.',{exact:true})).toBeVisible();for(const label of['Previous','Next'])await expect(p.getByRole('button',{name:label,exact:true})).toHaveCount(0);if(kind==='support-list'){await p.getByRole('textbox',{name:'Subject',exact:true}).fill('Unsaved support subject');await p.getByRole('textbox',{name:'How can we help?',exact:true}).fill('Unsaved support message');await expect(p.getByRole('button',{name:'Start chat',exact:true})).toBeEnabled();}assert.equal((await calls(p)).filter(item=>item.body).length,0);}finally{await p.close();}});
   await t.test(kind+' distinguishes response/ended/resolved without raw live or staff urgency',async()=>{const p=await page(kind,items);try{await expect(p.getByText('Waiting for our team',{exact:true})).toHaveCount(2);await expect(p.getByText('Waiting for your reply',{exact:true})).toHaveCount(1);await expect(p.getByText('Chat ended',{exact:true})).toHaveCount(1);await expect(p.getByText('Resolved',{exact:true})).toHaveCount(1);for(const label of['Previous','Next'])await expect(p.getByRole('button',{name:label,exact:true})).toHaveCount(0);assert.doesNotMatch(await p.locator('body').innerText(),/Hidden agent|Assigned to|Overdue|Live chat/);assert.equal((await calls(p)).filter(item=>item.body).length,0);}finally{await p.close();}});
  }
  await t.test('actual client CSS wraps a long accepted identity at320px without hiding its reference or actions',async()=>{const p=await page('web');try{
    await p.setViewportSize({width:320,height:568});const name='Long accepted staff identity with a clearly distinguishable name';await patch(p,{status:'open',replyState:'needs_reply',agentJoined:true,assignedUserName:name});await expect(p.getByText(name+' joined your chat',{exact:true})).toBeVisible();
    const metrics=await p.locator('.status').evaluate(element=>({width:element.clientWidth,scrollWidth:element.scrollWidth,connectionHeight:element.querySelector('.connection')!.getBoundingClientRect().height,right:element.getBoundingClientRect().right}));assert.ok(metrics.scrollWidth<=metrics.width+1,'The joined identity wraps inside its actual grid column');assert.ok(metrics.connectionHeight>20,'Long joined text uses multiple lines instead of overflowing');assert.ok(metrics.right<=320);await expect(p.getByText('SUP-FIXTURE-71',{exact:true})).toBeVisible();await expect(p.getByRole('button',{name:'End chat',exact:true})).toBeVisible();
  }finally{await p.close();}});
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

// Actual Buying + UI primitives + Alerts trigger render through installed
// RNWeb. Only route/data/device/media ports are controlled. This qualifies
// browser geometry, not physical Android keyboard or ordinary API delivery.
test('FE-019 N12 installed RNWeb transport keeps compact utilities and one reachable End above messages',{timeout:60000},async()=>{
 const nativeRequire=createRequire(process.cwd()+'/apps/mobile/package.json');
 const compiled=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
  import React from'react';import{createRoot}from'react-dom/client';import Buying from'./apps/mobile/app/buying';
  import{createUiText}from'./lib/i18n/core';import am from'./lib/i18n/messages/am.json';import om from'./lib/i18n/messages/om.json';
  const root=createRoot(document.getElementById('root'));let key=0;
  const fixture=window.fixture={snapshot:null,session:null,locale:'en',t:s=>s,routes:[],calls:[]};
  fixture.call=async(path,body)=>{fixture.calls.push({path,body:body||null});if(body)throw Error('No fixture writes admitted');if(path==='transport/attention')return{items:[],unread:0,latestId:0,enabled:{web:false},preferences:{soundEnabled:false},push:{web:{available:false}}};return{conversation:fixture.snapshot,defaults:{name:'Fixture owner',phone:'+12025550123'}};};
  window.qa={render:(locale,owner,joined=false)=>{fixture.locale=locale;fixture.t=createUiText(locale==='am'?am:locale==='om'?om:{});fixture.session=owner?{user:{id:'fixture-owner'}}:null;fixture.snapshot={id:71,publicRef:'SUP-LAYOUT-71',subject:'Fixture request',category:'shipment_observation',status:'open',agentJoined:joined,assignedUserName:joined?'Accepted agent with a long readable identity':null,replyState:'needs_reply',messages:[{id:1,sender:'visitor',senderName:'Visitor',body:'Fixture initial transport request.',createdAt:1,read:false}]};root.render(<div style={{height:'100dvh',display:'flex',flexDirection:'column'}}><header style={{height:52,flexShrink:0}}>Header</header><div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column'}}><Buying key={++key} owner={owner}/></div><nav style={{height:60,flexShrink:0}}>Navigation</nav></div>);},label:key=>fixture.t(key)};
 `},bundle:true,write:false,format:'iife',platform:'browser',loader:{'.png':'dataurl'},plugins:[{name:'transport-layout-installed-web-ports',setup(b){
  b.onResolve({filter:/^(react(?:\/.*)?|react-dom(?:\/.*)?)$/},a=>({path:nativeRequire.resolve(a.path)}));
  b.onResolve({filter:/^react-native$/},()=>({path:nativeRequire.resolve('react-native-web')}));
  b.onResolve({filter:/^(?:expo-router|expo-crypto|expo-file-system|react-native-svg)$/},a=>({path:a.path,namespace:'layout-port'}));
  b.onResolve({filter:/(?:^|\/)(runtime|ChatReadSentinel|attention-platform|chrome|open-link|LoadingBar)$/},a=>({path:a.path.split('/').at(-1)!,namespace:'layout-port'}));
  b.onLoad({filter:/.*/,namespace:'layout-port'},a=>({loader:'jsx',contents:
   a.path==='runtime'?`export const transportStorageKey='synthetic-layout',API='http://fixture.invalid',auth=null,mediaUrl=()=>'';export const useApp=()=>({t:window.fixture.t,locale:window.fixture.locale,session:window.fixture.session,ownerRequest:window.fixture.call});export const request=(path,options={})=>window.fixture.call(path,options.body);export const secure={getItem:async()=> 'synthetic-layout-token',setItem:async()=>{throw Error('Unexpected credential write');},removeItem:async()=>{throw Error('Unexpected credential deletion');}};export class ApiFailure extends Error{};`
   :a.path==='expo-router'?`import{useEffect}from'react';export const useFocusEffect=effect=>useEffect(effect,[effect]),usePathname=()=>'/buying',useGlobalSearchParams=()=>({}),router={push:path=>window.fixture.routes.push(path),replace:path=>window.fixture.routes.push(path)};`
   :a.path==='expo-crypto'?`export const randomUUID=()=> 'synthetic-layout-key';`
   :a.path==='expo-file-system'?`export class File{};export const Paths={};`
   :a.path==='react-native-svg'?`import React from'react';export default({children,...props})=><svg {...props}>{children}</svg>;export const Path=props=><path {...props}/>,SvgUri=()=>null;`
   :a.path==='ChatReadSentinel'?`export const ChatReadTranscript=({children})=>children;export default()=>null;`
   :a.path==='attention-platform'?`export const attentionRoute=()=>{},listenToAttentionTap=()=>()=>{},notificationDevice=async()=>{throw Error('No notification request admitted');};`
   :a.path==='chrome'?`export const Sheet=()=>null;`
   :a.path==='open-link'?`export const openLink=()=>{throw Error('No external navigation admitted');};`
   :`export default()=>null;`
  }));
 }}]});
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage(),errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',route=>route.abort('blockedbyclient'));
  await page.setContent('<style>html,body{margin:0}*{box-sizing:border-box}</style><div id="root"></div>');await page.addScriptTag({content:compiled.outputFiles[0].text});
  type QA={render:(locale:string,owner:boolean,joined?:boolean)=>void;label:(key:string)=>string};
  for(const locale of['en','am','om'])for(const owner of[false,true])for(const viewport of[{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.evaluate(({locale,owner})=>(window as unknown as{qa:QA}).qa.render(locale,owner),{locale,owner});
   const labels=await page.evaluate(()=>(['End chat','Shipment records','Alerts','Back to account','Chat history','Send reply','Message'].map(key=>(window as unknown as{qa:QA}).qa.label(key))));
   const end=page.getByRole('button',{name:labels[0],exact:true}),message=page.getByText('Fixture initial transport request.',{exact:true});await expect(message).toBeVisible();await expect(end).toHaveCount(1);
   const endBox=await end.boundingBox(),bodyBox=await message.boundingBox();assert.ok(endBox&&bodyBox);assert.ok(endBox.y+endBox.height<=bodyBox.y,`End must be reachable near current status, before even the initial transcript: ${JSON.stringify({locale,owner,viewport,endBox,bodyBox})}`);
   if(process.env.MIRTPAGE_CHAT_REVIEW_DIR&&locale==='en'&&!owner&&(viewport.width===844||viewport.width===320))await page.screenshot({path:`${process.env.MIRTPAGE_CHAT_REVIEW_DIR}/native-chat-${viewport.width}.png`});
   if(process.env.MIRTPAGE_CHAT_REVIEW_DIR&&locale==='om'&&!owner&&viewport.width===390)await page.screenshot({path:`${process.env.MIRTPAGE_CHAT_REVIEW_DIR}/native-chat-om-390.png`});
   if(locale==='en'&&!owner&&viewport.width===390)assert.ok(endBox.y-52<=180,`Chat controls start within180px of the content origin while the short transcript remains bottom-aligned; actual=${endBox.y-52}`);
   for(const label of[labels[0],labels[1],...(owner?[labels[3],labels[4]]:[labels[2]])]){
    const action=page.getByRole('button',{name:label,exact:true});await expect(action).toHaveCount(1);const box=await action.boundingBox();assert.ok(box&&box.width>=48&&box.height>=48);assert.ok(box.x>=0&&box.x+box.width<=viewport.width+1);assert.ok(await action.evaluate(n=>n.scrollWidth<=n.clientWidth+1),'Localized utility text must wrap inside its control');
   }
   assert.equal(await page.evaluate(()=>Array.from(document.querySelectorAll('div')).filter(n=>getComputedStyle(n).overflowY==='auto'&&n.clientHeight>0).length),1,'Only the existing Screen owns scrolling');
   const field=page.getByRole('textbox',{name:labels[6],exact:true});await field.fill('Preserved draft');const send=page.getByRole('button',{name:labels[5],exact:true});await send.scrollIntoViewIfNeeded();const sendBox=await send.boundingBox();assert.ok(sendBox&&sendBox.y+sendBox.height<=viewport.height-60+1,`The full Send action can scroll above persistent navigation: ${JSON.stringify({locale,owner,viewport,sendBox})}`);const overflow=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,items:[...document.querySelectorAll('*')].filter(n=>n.getBoundingClientRect().right>innerWidth+1).slice(0,5).map(n=>({tag:n.tagName,text:n.textContent?.slice(0,40),right:n.getBoundingClientRect().right}))}));assert.ok(overflow.scrollWidth<=overflow.innerWidth,`No page-wide horizontal overflow: ${JSON.stringify({locale,owner,viewport,overflow})}`);
   assert.equal(await field.inputValue(),'Preserved draft');
  }
  await page.setViewportSize({width:320,height:568});
  await page.evaluate(()=>(window as unknown as{qa:QA}).qa.render('om',true,true));await expect(page.getByText('Accepted agent with a long readable identity joined your chat',{exact:true})).toHaveCount(0);
  const joined=await page.evaluate(()=>(window as unknown as{qa:QA}).qa.label('{value1} joined your chat'));
  await expect(page.getByText(joined.replace('{value1}','Accepted agent with a long readable identity'),{exact:true})).toBeVisible();await page.locator('span').evaluateAll(nodes=>nodes.forEach(node=>{const style=getComputedStyle(node);node.style.fontSize=(parseFloat(style.fontSize)*2)+'px';node.style.lineHeight=((parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.4)*2)+'px';}));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Enlarged browser text keeps long translated controls inside the page');
  assert.deepEqual(errors,[]);
 }finally{await page.close();await browser.close();}
});
