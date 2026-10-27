import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium,type Page} from 'playwright';
import {supportIdlePresentation} from '../lib/support-idle-contract';

const require=createRequire(import.meta.url),warning='This chat will end soon. Send a message to keep it open.',ended='This chat ended because we did not hear back. Your messages are saved.';
type Snapshot={publicRef:string;category:string;status:'open'|'waiting'|'closed';assignedUserName:null;messages:unknown[];idleWarningAt?:number|null;idleEndsAt?:number|null;idleEndedAt?:number|null;resolvedAt?:number|null};
const view=(extra:Partial<Snapshot>={}):Snapshot=>({publicRef:'LOCAL-IDLE',category:'shipment_observation',status:'open',assignedUserName:null,messages:[],...extra});
type Pending={id:number;path:string;method:'GET'|'POST';body?:{action?:string;publicRef?:string;idempotencyKey?:string}};
type Fixture={pending:Pending[];hidden:boolean;appState:string;mount:(kind:string,id?:string)=>void;resolve:(id:number,snapshot:Snapshot)=>void;reject:(id:number)=>void;blur:()=>void;focus:()=>void;storage:string[]};

const bundle=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
 import Web from './components/BuyingConversation';import Native from './apps/mobile/app/buying';import {OwnerChat} from './apps/mobile/src/owner-inbox';
 const root=createRoot(document.getElementById('root'));
 window.fixture.mount=(kind,id='1')=>flushSync(()=>root.render(kind==='web'?<Web key={kind} initial={window.fixture.seed} active onAnother={()=>{}}/>:kind==='native'?<Native key={kind}/>:kind==='owner'?<OwnerChat key={kind+id} id={id}/>:null));
`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'idle-ui-ports',setup(builder){
 builder.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));
 builder.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'css-port'}));builder.onLoad({filter:/.*/,namespace:'css-port'},()=>({loader:'js',contents:'export default {};'}));
 builder.onResolve({filter:/^(?:@\/lib\/i18n\/ui|next-intl|react-native|expo-router|expo-crypto|\.\.\/src\/(runtime|ui|ChatReadSentinel|AttentionAlerts|TransportPlanView|TransportCoordinator)|\.\/(runtime|ui|owner-forms|support-files|ChatReadSentinel|ChatReadObserver|AttentionAlerts))$/},args=>({path:args.path,namespace:'ports'}));
 builder.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'jsx',resolveDir:process.cwd(),contents:
  args.path==='@/lib/i18n/ui'?`export const useUiText=()=>window.fixture.t;`:
  args.path==='next-intl'?`export const useLocale=()=> 'en';`:
  args.path==='react-native'?`import React from 'react';const style=value=>Object.assign({},...[value].flat(Infinity).filter(Boolean));
   export const AppState={get currentState(){return window.fixture.appState;}},View=({children,style:s})=><div style={style(s)}>{children}</div>,ScrollView=View,Text=({children,style:s})=><span style={style(s)}>{children}</span>,Pressable=({children,onPress,accessibilityLabel,disabled,style:s})=><button type='button' aria-label={accessibilityLabel} disabled={disabled} style={style(s)} onClick={onPress}>{children}</button>,StyleSheet={create:v=>v},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`:
  args.path==='expo-router'?`export const router={push:()=>{},replace:()=>{}};import {useEffect} from 'react';
          // Every focus hook owns its cleanup; route focus/blur fans out to all mounted subscriptions.
          const subscriptions=new Set();let focused=true;
          const stop=entry=>{entry.cleanup?.();entry.cleanup=undefined;};
          const blur=()=>{focused=false;for(const entry of subscriptions)stop(entry);};
          const focus=()=>{if(focused)return;focused=true;for(const entry of subscriptions)entry.cleanup=entry.run()||undefined;};
          export const useFocusEffect=fn=>useEffect(()=>{const entry={run:fn,cleanup:undefined};subscriptions.add(entry);window.fixture.blur=blur;window.fixture.focus=focus;if(focused)entry.cleanup=fn()||undefined;return()=>{subscriptions.delete(entry);stop(entry);};},[fn]);`:
  args.path==='expo-crypto'?`export const randomUUID=()=>crypto.randomUUID();`:
  /(?:^\.\/|src\/)runtime$/.test(args.path)?`
   export const transportStorageKey='suqpage-transport';export const useApp=()=>({t:window.fixture.t,locale:'en',ownerRequest:window.fixture.call});export const useLoad=()=>{throw Error('Owner chat must have one authoritative loader');};
   export const request=(path,options={})=>window.fixture.call(path,options.body);export const secure={getItem:async()=> 'local-token',setItem:async()=>window.fixture.storage.push('set'),removeItem:async()=>window.fixture.storage.push('remove')};export class ApiFailure extends Error{};
  `:
  /(?:^\.\/|src\/)ui$/.test(args.path)?`
   import React from 'react';export const Screen=({children})=><main>{children}</main>,Card=({children})=><section>{children}</section>,Copy=({children})=><p>{children}</p>,Icon=()=>null,colors={},s={};export const Chip=()=>null,openLink=()=>{},useOpenLink=()=>()=>{};
   export const Field=({label,onChangeText,editable,...props})=><label>{label}<textarea aria-label={label} disabled={editable===false} {...props} onChange={e=>onChangeText(e.target.value)}/></label>;
   export const Button=({label,onPress,disabled,secondary=false})=><button disabled={disabled} data-secondary={secondary} onClick={onPress}>{label}</button>;export const Status=({loading,error})=><div role='status'>{loading?'Loading':''}{error}</div>;
  `:
  args.path==='./owner-forms'?`
   import React,{useState} from 'react';export const useAction=()=>{const[busy,setBusy]=useState(false),[error,setError]=useState('');return{busy,error,run:async fn=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e.message);}finally{setBusy(false);}}};};export const ActionStatus=({state})=><div role='alert'>{state.error}</div>;
  `:
  args.path==='./support-files'?`export const Attachment=()=>null,pickSupportFile=async()=>null,supportReplyForm=async()=>new FormData();`:
  args.path==='./ChatReadObserver'?`export const useVisibleChatRead=()=>{};`:
  /TransportPlanView$/.test(args.path)?`export const TransportPlanSummary=()=>null;export default()=>null;`:/AttentionAlerts$/.test(args.path)?`export const TransportAlerts=()=>null;export default ()=>null;`: /ChatReadSentinel$/.test(args.path)?`export const ChatReadTranscript=({children})=>children;export default ()=>null;`:`export default ()=>null;`
 }));
}}]});
const setup=`
 let serial=0;const responses=new Map();window.fixture={pending:[],hidden:false,appState:'active',storage:[],t:v=>v,seed:null,blur:()=>{},focus:()=>{},
 call:(path,body)=>new Promise((resolve,reject)=>{const id=++serial;window.fixture.pending.push({id,path,method:body?'POST':'GET',body});responses.set(id,{resolve,reject});}),
 resolve:(id,snapshot)=>{const item=responses.get(id);if(!item)throw Error('Missing request '+id);responses.delete(id);window.fixture.pending=window.fixture.pending.filter(v=>v.id!==id);item.resolve({conversation:snapshot,messages:snapshot.messages});},
 reject:id=>{const item=responses.get(id);responses.delete(id);window.fixture.pending=window.fixture.pending.filter(v=>v.id!==id);item.reject(Error('fixture unavailable'));}};
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.fixture.hidden});
 window.fetch=async(path,options={})=>({ok:true,json:async()=>window.fixture.call(String(path),options.body?JSON.parse(options.body):undefined)});
`;
async function boot(page:Page,kind:string,seed:Snapshot){
 const fixed=Date.now();await page.clock.install({time:fixed});await page.clock.pauseAt(fixed+1000);await page.route('http://localhost:45679/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://localhost:45679');await page.addScriptTag({content:setup});await page.evaluate(seed=>{(window as unknown as{fixture:Fixture&{seed:Snapshot}}).fixture.seed=seed;},seed);await page.addScriptTag({content:(await bundle).outputFiles[0].text});await page.evaluate(kind=>(window as unknown as{fixture:Fixture}).fixture.mount(kind),kind);
}
async function pending(page:Page,method='GET'){
 await page.waitForFunction(method=>(window as unknown as{fixture:Fixture}).fixture.pending.some(v=>v.method===method),method);return page.evaluate(method=>(window as unknown as{fixture:Fixture}).fixture.pending.filter(v=>v.method===method),method);
}
async function resolve(page:Page,id:number,snapshot:Snapshot){await page.evaluate(({id,snapshot})=>(window as unknown as{fixture:Fixture}).fixture.resolve(id,snapshot),{id,snapshot});}
async function reject(page:Page,id:number){await page.evaluate(id=>(window as unknown as{fixture:Fixture}).fixture.reject(id),id);}

test('FE-019 idle presentation trusts valid server deadlines and never treats waiting/manual/resolved as auto-ended',()=>{
 assert.deepEqual(supportIdlePresentation(view({idleWarningAt:100,idleEndsAt:200}),99),{warning:false,autoEnded:false});
 assert.deepEqual(supportIdlePresentation(view({idleWarningAt:100,idleEndsAt:200}),100),{warning:true,autoEnded:false});
 assert.equal(supportIdlePresentation(view({idleWarningAt:100,idleEndsAt:200}),250).warning,true,'Past server deadline still cannot authorize a client close');
 for(const snapshot of [view(),view({status:'waiting',idleWarningAt:100,idleEndsAt:200}),view({idleWarningAt:NaN,idleEndsAt:200}),view({idleWarningAt:200,idleEndsAt:100})])assert.deepEqual(supportIdlePresentation(snapshot,300),{warning:false,autoEnded:false});
 assert.equal(supportIdlePresentation(view({status:'closed',idleEndedAt:200}),300).autoEnded,true);
 assert.equal(supportIdlePresentation(view({status:'closed',idleEndedAt:200,resolvedAt:250}),300).autoEnded,false);
 assert.equal(supportIdlePresentation(view({status:'closed'}),300).autoEnded,false);
});

test('FE-019 actual web/native guest chats warn, retain drafts across automatic ending and failed explicit Resume, and slow hidden/closed reads', {timeout:90000},async()=>{
 const browser=await chromium.launch({timeout:20000});const errors:string[]=[];
 try{for(const kind of ['web','native']){
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));const now=Date.now(),open=view({idleWarningAt:now-100,idleEndsAt:now+300000});await boot(page,kind,open);await resolve(page,(await pending(page))[0].id,open);await page.getByText(warning,{exact:true}).waitFor();
  const field=page.getByLabel(kind==='web'?'Reply':'Message',{exact:true});await field.fill('Keep this draft');
  await page.clock.fastForward(5000);const old=(await pending(page))[0];await page.clock.fastForward(60000);assert.equal((await pending(page)).length,1,'One in-flight read even beyond a deadline');
  await resolve(page,old.id,view({status:'closed',idleEndedAt:now}));await page.getByText(ended,{exact:true}).waitFor();assert.equal((await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pending)).filter(v=>v.method==='POST').length,0,'Client deadline never writes close');
  assert.equal(await page.getByRole('button',{name:'Send another request',exact:true}).getAttribute('data-secondary'),'true','A new request stays secondary while Resume is available');
  await page.clock.fastForward(29999);assert.equal((await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pending)).length,0);await page.clock.fastForward(1);const stale=(await pending(page))[0];
  await page.getByRole('button',{name:'Resume chat',exact:true}).click();const first=(await pending(page,'POST'))[0];assert.equal(first.body?.action,'resume');assert.equal(first.body?.publicRef,'LOCAL-IDLE');assert.equal(await page.getByRole('button',{name:'Resuming…',exact:true}).isDisabled(),true);
  await reject(page,first.id);await page.getByRole('button',{name:'Resume chat',exact:true}).waitFor();await page.getByText('Support could not be updated.',{exact:true}).or(page.getByText('fixture unavailable',{exact:true})).waitFor();
  await page.getByRole('button',{name:'Resume chat',exact:true}).click();const second=(await pending(page,'POST'))[0];await resolve(page,second.id,view());await field.waitFor();assert.equal(await field.inputValue(),'Keep this draft');await resolve(page,stale.id,view({status:'closed',idleEndedAt:now}));assert.equal(await page.getByRole('button',{name:'Resume chat',exact:true}).count(),0,'A delayed pre-resume read cannot close the resumed view');
  await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.hidden=true;f.appState='background';});await page.clock.fastForward(60000);assert.equal((await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pending)).length,0,'Hidden/inactive views do not fetch');
  assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.storage),[],'Resume must not extend/rewrite the original recovery token');await page.close();
  const resumed=await browser.newPage();resumed.on('pageerror',e=>errors.push(e.message));const closed=view({status:'closed',idleEndedAt:now});await boot(resumed,kind,closed);await resolve(resumed,(await pending(resumed))[0].id,closed);await resumed.getByRole('button',{name:'Resume chat',exact:true}).click();await resolve(resumed,(await pending(resumed,'POST'))[0].id,view());await resumed.getByLabel(kind==='web'?'Reply':'Message',{exact:true}).waitFor();await resumed.clock.fastForward(4999);assert.equal((await resumed.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pending)).length,0);await resumed.clock.fastForward(1);await resolve(resumed,(await pending(resumed))[0].id,view());await resumed.close();
 }}finally{await browser.close();}assert.deepEqual(errors,[]);
});

test('FE-019 actual native owner chat fences earlier reads and keeps its draft through automatic ending and explicit reopen', {timeout:90000},async()=>{
 const browser=await chromium.launch({timeout:20000});const errors:string[]=[];
 try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));const now=Date.now(),open=view({idleWarningAt:now-100,idleEndsAt:now+3600000});await boot(page,'owner',open);await resolve(page,(await pending(page))[0].id,open);await page.getByText(warning,{exact:true}).waitFor();await page.getByLabel('Message',{exact:true}).fill('Owner draft kept');
  await page.clock.fastForward(5000);const stale=(await pending(page))[0];await page.getByRole('button',{name:'End chat',exact:true}).click();const close=(await pending(page,'POST'))[0];assert.equal(close.body?.action,'close');await reject(page,close.id);await page.getByText('fixture unavailable',{exact:true}).waitFor();await resolve(page,stale.id,view({status:'closed'}));
  await page.clock.fastForward(5000);await resolve(page,(await pending(page))[0].id,view({status:'closed',idleEndedAt:now}));await page.getByText(ended,{exact:true}).waitFor();await page.clock.fastForward(29999);assert.equal((await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pending)).length,0);await page.clock.fastForward(1);const older=(await pending(page))[0];
  await page.getByRole('button',{name:'Resume chat',exact:true}).click();const resume=(await pending(page,'POST'))[0];assert.equal(resume.body?.action,'reopen');await resolve(page,resume.id,view());
  await page.getByRole('button',{name:'Resume chat',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Resume chat',exact:true}).isDisabled(),true);await page.clock.runFor(32);
  // The refreshed loop has committed while its predecessor still owns the read.
  await resolve(page,older.id,view({status:'closed',idleEndedAt:now}));await page.clock.fastForward(5000);await resolve(page,(await pending(page))[0].id,view());await page.getByLabel('Message',{exact:true}).waitFor();assert.equal(await page.getByLabel('Message',{exact:true}).inputValue(),'Owner draft kept');
  await page.evaluate(()=>{const f=(window as unknown as{fixture:Fixture}).fixture;f.hidden=true;f.appState='background';});await page.clock.fastForward(60000);assert.equal((await page.evaluate(()=>(window as unknown as{fixture:Fixture}).fixture.pending)).length,0);await page.close();
 }finally{await browser.close();}assert.deepEqual(errors,[]);
});
