import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
import type {OwnerTransportState,OwnerTransportConversation} from '../lib/owner-transport-contract';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';

type Element={type:string|((props:Record<string,unknown>)=>unknown);props:Record<string,unknown>&{children?:unknown}};
type Effect={deps:unknown[];cleanup?:()=>void};
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(error:Error)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
const response=(conversation:OwnerTransportConversation|null=null):OwnerTransportState=>({conversation,defaults:{name:'Private owner name',phone:'+12025550123'}});
const chat=(patch:Partial<OwnerTransportConversation>={}):OwnerTransportConversation=>({id:71,publicRef:'SUP-OWNER-71',subject:'Town A → Town B',category:'shipment_observation',status:'open',assignedUserName:'Transport agent',agentJoined:true,resolvedAt:null,messages:[],...patch});
// Real shared native screen/controller with controlled native, lifecycle, router
// and authenticated I/O ports. No HTTP/database/device operation is performed.
const bundle=build({entryPoints:['apps/mobile/app/buying.tsx','apps/mobile/src/OwnerTransportHistory.tsx','apps/mobile/src/owner-inbox.tsx'],outdir:'/tmp/suqpage-owner-transport-ui',bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'owner-transport-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|expo-crypto|(?:\.\/|\.\.\/src\/)(?:runtime|ui|ChatReadSentinel|AttentionAlerts|TransportPlanView|owner-forms|support-files))$/},a=>({path:a.path.startsWith('../src/')?'./'+a.path.split('/').at(-1):a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
  a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],value=>{fixture.updates++;fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value;}];},useRef=initial=>{const i=fixture.cursor++;return fixture.states[i]||(fixture.states[i]={current:initial});},useCallback=fn=>fn,useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))fixture.pending.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});};export default {};`
  :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :a.path==='react-native'?`export const AppState={currentState:'active'},View='View',Text='Text',StyleSheet={create:value=>value},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
  :a.path==='expo-router'?`export const useFocusEffect=fn=>{fixture.focus=fn;},router={push:route=>fixture.routes.push({kind:'push',route}),replace:route=>fixture.routes.push({kind:'replace',route})};`
  :a.path==='expo-crypto'?`export const randomUUID=()=> 'owner-request-'+fixture.keys++;`
  :a.path==='./runtime'?`export const useApp=()=>({t:(key,values={})=>key.replace(/\\{(\\w+)\\}/g,(_,name)=>String(values[name]??'')),locale:'en',session:fixture.session,ownerRequest:fixture.ownerRequest}),secure={getItem:()=>{throw Error('Owner must not read guest storage');},setItem:()=>{throw Error('Owner must not write guest storage');},removeItem:()=>{throw Error('Owner must not remove guest storage');}},request=()=>{throw Error('Owner must not use guest HTTP');},useLoad=fn=>{fixture.loaders.push(fn);return fixture.history;};export class ApiFailure extends Error{constructor(message,status,code){super(message);this.status=status;this.code=code;}};`
  :a.path==='./ui'?`export const Screen='Screen',Copy='Copy',Card='Card',Field='Field',Button='Button',Chip='Chip',Status='Status',colors={},s={row:{}},openLink=()=>{throw Error('Unexpected external link');};`
  :a.path==='./TransportPlanView'?`export const TransportPlanSummary='TransportPlanSummary';export default 'TransportPlanView';`
  :a.path==='./AttentionAlerts'?`export const TransportAlerts='TransportAlerts';`
  :a.path==='./owner-forms'?`export const ActionStatus='ActionStatus',useAction=()=>({busy:false,error:'',run:async fn=>fn()});`
  :a.path==='./support-files'?`export const Attachment='Attachment',pickSupportFile=()=>{throw Error('Unexpected attachment');},supportReplyForm=()=>{throw Error('Unexpected attachment');};`
  :`export const ChatReadTranscript='ChatReadTranscript';export default 'ChatReadSentinel';`
 }));
}}]});
function nodes(value:unknown):Element[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return[];const node=value as Element;return[node,...nodes(node.props.children)];}
function text(value:unknown):string{if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'?value:'';}
const button=(tree:Element[],label:string)=>{const node=tree.find(node=>node.type==='Button'&&node.props.label===label);assert.ok(node,label);return node;};
const field=(tree:Element[],label:string)=>{const node=tree.find(node=>node.type==='Field'&&node.props.label===label);assert.ok(node,label);return node;};
const press=(node:Element)=>(node.props.onPress as()=>void)();
const change=(node:Element,value:string)=>(node.props.onChangeText as(value:string)=>void)(value);
function commandBody(value:unknown):Record<string,unknown>{assert.ok(value&&typeof value==='object'&&!Array.isArray(value),'A command must be an object');return value as Record<string,unknown>;}
async function settle(){await new Promise<void>(resolve=>setImmediate(resolve));}
async function screen(entry='buying'){
 const fixture={states:[] as unknown[],cursor:0,effectCursor:0,effects:[] as Effect[],pending:[] as Array<()=>void>,updates:0,keys:0,session:{user:{id:'owner-A'}} as {user:{id:string}}|null,focus:undefined as (()=>(()=>void)|undefined)|undefined,routes:[] as unknown[],calls:[] as Array<{path:string;body?:unknown}>,responses:[] as Array<Promise<unknown>>,ownerRequest:undefined as unknown as(path:string,body?:unknown)=>Promise<unknown>,loaders:[] as Array<()=>Promise<unknown>>,history:{data:null as unknown,error:'',loading:false,reload(){}}};
 fixture.ownerRequest=(path,body)=>{fixture.calls.push({path,body});const result=fixture.responses.shift();if(!result)throw Error('Unexpected owner request '+path);return result;};
 const output=(await bundle).outputFiles.find(file=>file.path.endsWith('/'+entry+'.js'))!,module={exports:{} as Record<string,(props:Record<string,unknown>)=>Element>};
 vm.runInNewContext(output.text,{module,exports:module.exports,fixture,AbortController,setTimeout:()=>1,clearTimeout:()=>{}});
 const render=(props:Record<string,unknown>={owner:true},name='default')=>{fixture.cursor=fixture.effectCursor=0;const tree=nodes(module.exports[name](props));for(const effect of fixture.pending.splice(0))effect();return tree;};
 return{fixture,render,unmount:()=>fixture.effects.forEach(effect=>effect.cleanup?.())};
}

test('FE-053 owner transport uses private editable defaults and exact paired visitor form without guest ports',async()=>{
 const{fixture,render,unmount}=await screen();fixture.responses.push(Promise.resolve(response()));render();await settle();let tree=render();fixture.focus!();
 assert.deepEqual(fixture.calls,[{path:'owner/transport',body:undefined}]);assert.equal(tree.filter(node=>node.type==='Screen').length,1);assert.ok(!tree.some(node=>node.type==='TransportAlerts'));assert.equal(field(tree,'Name').props.value,'Private owner name');assert.equal(field(tree,'Phone').props.value,'+12025550123');assert.equal(field(tree,'From').props.value,'');assert.equal(field(tree,'To').props.value,'');
 change(field(tree,'Name'),'Dispatch contact');change(field(tree,'Phone'),'+12025550199');change(field(tree,'From'),'Town A');change(field(tree,'To'),'Town B');change(field(tree,'Goods or transport details (optional)'),'Two boxes');tree=render();
 const failed=deferred<OwnerTransportState>();fixture.responses.push(failed.promise);press(button(tree,'Start chat'));failed.reject(Error('Unable to connect. Please try again.'));await settle();tree=render();assert.equal(field(tree,'From').props.value,'Town A');assert.equal(field(tree,'Name').props.value,'Dispatch contact');
 fixture.responses.push(Promise.resolve(response(chat())));press(button(tree,'Start chat'));await settle();tree=render();assert.deepEqual(fixture.calls[1],fixture.calls[2],'The exact failed-start intake and idempotency key are retried');
 const body=commandBody(fixture.calls[2].body);assert.deepEqual(Object.keys(body).sort(),['action','destination','idempotencyKey','message','name','origin','phone']);assert.equal(body.name,'Dispatch contact');assert.equal(body.action,'start');assert.ok(!tree.some(node=>node.type==='TransportAlerts'));assert.ok(button(tree,'Send reply'));unmount();
});

test('FE-053 owner exact history chat commands carry ID/ref and preserve End/Resume history',async()=>{
 const{fixture,render,unmount}=await screen();const current=chat({messages:[{id:9,sender:'staff',senderName:'Agent',body:'Public reply',createdAt:1}]});fixture.responses.push(Promise.resolve(response(current)));render({owner:true,conversationId:'71'});await settle();let tree=render({owner:true,conversationId:'71'});assert.equal(fixture.calls[0].path,'owner/transport?conversation=71');
 fixture.responses.push(Promise.resolve(response(current)));const stop=fixture.focus!();await settle();tree=render({owner:true,conversationId:'71'});
 fixture.responses.push(Promise.resolve(response(current)));const sentinel=tree.find(node=>node.type==='ChatReadTranscript')!;await(sentinel.props.onRead as(id:number)=>Promise<void>)(9);assert.deepEqual(JSON.parse(JSON.stringify(fixture.calls.at(-1)?.body)),{action:'read',conversationId:71,messageId:9,publicRef:'SUP-OWNER-71'});
 change(field(tree,'Message'),'Owner response');tree=render({owner:true,conversationId:'71'});fixture.responses.push(Promise.resolve(response(current)));press(button(tree,'Send reply'));await settle();const sent=commandBody(fixture.calls.at(-1)?.body);assert.equal(typeof sent.idempotencyKey,'string');assert.deepEqual({...sent,idempotencyKey:undefined},{action:'message',conversationId:71,publicRef:'SUP-OWNER-71',message:'Owner response',idempotencyKey:undefined});
 const ended=chat({status:'closed',idleEndedAt:123});tree=render({owner:true,conversationId:'71'});fixture.responses.push(Promise.resolve(response(ended)));press(button(tree,'End chat'));await settle();tree=render({owner:true,conversationId:'71'});assert.deepEqual(JSON.parse(JSON.stringify(fixture.calls.at(-1)?.body)),{action:'close',conversationId:71,publicRef:'SUP-OWNER-71'});
 fixture.responses.push(Promise.resolve(response(current)));press(button(tree,'Resume chat'));await settle();assert.deepEqual(JSON.parse(JSON.stringify(fixture.calls.at(-1)?.body)),{action:'resume',conversationId:71,publicRef:'SUP-OWNER-71'});stop?.();unmount();
});

test('FE-053 owner session switch and unmount fence previous authenticated completions and private defaults',async()=>{
 const{fixture,render,unmount}=await screen(),a=deferred<OwnerTransportState>(),b=deferred<OwnerTransportState>();fixture.responses.push(a.promise);render();fixture.session={user:{id:'owner-B'}};fixture.responses.push(b.promise);let tree=render();assert.ok(!JSON.stringify(tree).includes('Private owner name'));
 a.resolve(response(chat({subject:'OLD OWNER PRIVATE'})));await settle();tree=render();assert.ok(!JSON.stringify(tree).includes('OLD OWNER PRIVATE'));b.resolve({conversation:null,defaults:{name:'Owner B',phone:'+12025550188'}});await settle();tree=render();assert.equal(field(tree,'Name').props.value,'Owner B');assert.ok(!JSON.stringify(tree).includes('Private owner name'));
 fixture.session=null;tree=render();assert.ok(!JSON.stringify(tree).includes('Owner B'));assert.ok(!tree.some(node=>node.type==='Field'));unmount();
 const late=await screen(),pending=deferred<OwnerTransportState>();late.fixture.responses.push(pending.promise);late.render();late.unmount();const updates=late.fixture.updates;pending.resolve(response(chat()));await settle();assert.equal(late.fixture.updates,updates);
});

test('FE-053 retained handlers and pending commands cannot send or publish previous-account intake after account change',async()=>{
 const{fixture,render,unmount}=await screen();fixture.responses.push(Promise.resolve(response()));render();await settle();let tree=render();fixture.focus!();change(field(tree,'From'),'PRIVATE A PICKUP');change(field(tree,'To'),'PRIVATE A DESTINATION');tree=render();const staleStart=button(tree,'Start chat');
 const command=deferred<OwnerTransportState>();fixture.responses.push(command.promise);press(staleStart);assert.equal(fixture.calls.length,2);
 fixture.session={user:{id:'owner-B'}};fixture.responses.push(Promise.resolve({conversation:null,defaults:{name:'Private B',phone:'+12025550188'}}));tree=render();const before=fixture.calls.length;press(staleStart);assert.equal(fixture.calls.length,before,'A retained A callback cannot issue a request using the new authenticated session');await settle();tree=render();
 command.resolve(response(chat({subject:'PRIVATE A TRANSPORT',messages:[{id:1,sender:'visitor',senderName:'A',body:'PRIVATE A BODY',createdAt:1}]})));await settle();tree=render();assert.equal(field(tree,'Name').props.value,'Private B');assert.equal(field(tree,'From').props.value,'');assert.ok(!JSON.stringify(tree).includes('PRIVATE A'));assert.equal(button(tree,'Start chat').props.disabled,true);unmount();
});

test('FE-053 private editable contact defaults are not reapplied over typed fields on refreshed intake',async()=>{
 const{fixture,render,unmount}=await screen();fixture.responses.push(Promise.resolve(response()));render();await settle();let tree=render();change(field(tree,'Name'),'Chosen dispatch contact');change(field(tree,'Phone'),'');change(field(tree,'From'),'Town X');
 fixture.responses.push(Promise.resolve(response()));render({owner:true,newIntake:true});await settle();tree=render({owner:true,newIntake:true});assert.equal(field(tree,'Name').props.value,'Chosen dispatch contact');assert.equal(field(tree,'Phone').props.value,'','An intentionally cleared editable contact is not overwritten');assert.equal(field(tree,'From').props.value,'Town X');unmount();
});

test('FE-053 owner transport read failure blocks intake, offers retry and never deletes guest recovery',async()=>{
 const{fixture,render,unmount}=await screen();fixture.responses.push(Promise.reject(Error('Unable to connect. Please try again.')));render({owner:true,newIntake:true});await settle();let tree=render({owner:true,newIntake:true});assert.ok(!tree.some(node=>node.type==='Field'));assert.ok(button(tree,'Try again'));
 fixture.responses.push(Promise.resolve(response()));press(button(tree,'Try again'));render({owner:true,newIntake:true});await settle();tree=render({owner:true,newIntake:true});assert.equal(fixture.calls.length,2);assert.ok(fixture.calls.every(call=>call.path==='owner/transport?new=1'));assert.ok(button(tree,'Start chat'));press(button(tree,'Chat history'));assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{kind:'push',route:{pathname:'/owner/[section]',params:{section:'transport-history',returnTo:'profile'}}});unmount();
});

test('FE-053 native owner transport history is bounded and opens exact authenticated cases',async()=>{
 const{fixture,render}=await screen('OwnerTransportHistory');fixture.history.data={items:[{id:71,publicRef:'SUP-OWNER-71',subject:'Town A → Town B',status:'closed'}],page:1,pages:2,total:21};fixture.responses.push(Promise.resolve(fixture.history.data));let tree=render();await fixture.loaders.at(-1)!();assert.equal(fixture.calls[0].path,'owner/transport?history=1&page=1');press(button(tree,'Open'));assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{kind:'push',route:{pathname:'/owner/[section]',params:{section:'transport',id:'71',returnTo:'profile'}}});assert.equal(button(tree,'Previous').props.disabled,true);press(button(tree,'Next'));tree=render();fixture.responses.push(Promise.resolve(fixture.history.data));await fixture.loaders.at(-1)!();assert.equal(fixture.calls.at(-1)?.path,'owner/transport?history=1&page=2');assert.equal(button(tree,'Previous').props.disabled,false);assert.ok(!text(tree).includes('guest'));
});

test('FE-053 native history distinguishes ended/resolved/response-turn cases and their unread state',async()=>{
 const{fixture,render}=await screen('OwnerTransportHistory');fixture.history.data={items:[{id:71,publicRef:'SUP-71',subject:'Ended route',status:'closed',resolvedAt:null,unread:true},{id:72,publicRef:'SUP-72',subject:'Resolved route',status:'closed',resolvedAt:123,unread:false},{id:73,publicRef:'SUP-73',subject:'Waiting route',status:'waiting',resolvedAt:null,unread:false,assignedUserName:'Internal agent',agentJoined:false},{id:74,publicRef:'SUP-74',subject:'Reply requested',status:'open',replyState:'waiting_customer',resolvedAt:null,unread:false}],page:1,pages:1,total:4};
 const cards=render().filter(node=>node.type==='Card');assert.equal(cards.length,4);assert.ok(text(cards[0]).includes('Chat ended')&&text(cards[0]).includes('New'));assert.ok(!text(cards[0]).includes('Resolved'));assert.ok(text(cards[1]).includes('Resolved')&&!text(cards[1]).includes('Chat ended')&&!text(cards[1]).includes('New'));assert.ok(text(cards[2]).includes('Waiting for our team'));assert.ok(!text(cards[2]).includes('Internal agent'));assert.ok(text(cards[3]).includes('Waiting for your reply'));assert.ok(!text(cards[3]).includes('Live chat'));
});

test('FE-053 owner transport history explains a successfully loaded empty list without masking loading or failure',async()=>{
 const{fixture,render}=await screen('OwnerTransportHistory');
 fixture.history.data={items:[],page:1,pages:1,total:0};
 assert.ok(text(render()).includes('No conversations yet.'));
 fixture.history.loading=true;assert.ok(!text(render()).includes('No conversations yet.'));
 fixture.history.loading=false;fixture.history.error='Unable to connect. Please try again.';assert.ok(!text(render()).includes('No conversations yet.'));
 fixture.history.error='';fixture.history.data=null;assert.ok(!text(render()).includes('No conversations yet.'));
 fixture.history.data={items:[{id:71,publicRef:'SUP-OWNER-71',subject:'Town A → Town B',status:'closed'}],page:1,pages:1,total:1};assert.ok(!text(render()).includes('No conversations yet.'));
});

test('FE-053 old owner-chat notifications classify authorized transport before exposing transcript or redirecting',async()=>{
 const{fixture,render,unmount}=await screen('owner-inbox');let tree=render({id:'71'},'OwnerChat');assert.ok(!JSON.stringify(tree).includes('PRIVATE NOTE'));
 fixture.responses.push(Promise.resolve({conversation:{publicRef:'SUP-OWNER-71',subject:'Transport route',status:'open',assistanceCategory:'shipment_observation'},messages:[{body:'PRIVATE NOTE'}]}));const stop=fixture.focus!();await settle();tree=render({id:'71'},'OwnerChat');assert.deepEqual(JSON.parse(JSON.stringify(fixture.routes.at(-1))),{kind:'replace',route:{pathname:'/owner/[section]',params:{section:'transport',id:'71',returnTo:'profile'}}});assert.ok(!JSON.stringify(tree).includes('PRIVATE NOTE'));assert.equal(fixture.calls[0].path,'owner/support/71');stop?.();unmount();
 const technical=await screen('owner-inbox');technical.render({id:'72'},'OwnerChat');technical.fixture.responses.push(Promise.resolve({conversation:{publicRef:'SUP-TECH-72',subject:'Technical case',status:'open',assistanceCategory:'general'},messages:[]}));const release=technical.fixture.focus!();await settle();technical.render({id:'72'},'OwnerChat');assert.deepEqual(technical.fixture.routes,[],'Technical Support keeps its current route');release?.();technical.unmount();
});

test('FE-053 technical owner chat preserves reference, hides routing and distinguishes accepted join/reply/terminal snapshots',async()=>{
 const h=await screen('owner-inbox'),props={id:'81'};let stop:(()=>void)|undefined;
 const base={publicRef:'SUP-TECH-81',subject:'Existing technical support',status:'waiting',assistanceCategory:'general',assignedUserName:null as string|null,agentJoined:false,replyState:'needs_reply' as 'needs_reply'|'overdue'|'waiting_customer'|null,resolvedAt:null as number|null};
 async function snapshot(patch:Partial<typeof base>){
  stop?.();h.fixture.responses.push(Promise.resolve({conversation:{...base,...patch},messages:[]}));
  h.render(props,'OwnerChat');stop=h.fixture.focus!();await settle();return h.render(props,'OwnerChat');
 }
 let tree=await snapshot({});assert.ok(text(tree).includes('Waiting for our team'));assert.ok(text(tree).includes('SUP-TECH-81'));
 tree=await snapshot({status:'open',assignedUserName:'Current support agent'});assert.ok(!text(tree).includes('Current support agent'));assert.ok(!text(tree).includes('joined your chat'));assert.ok(text(tree).includes('Waiting for our team'));assert.ok(text(tree).includes('SUP-TECH-81'));
 tree=await snapshot({status:'open',assignedUserName:'Current support agent',agentJoined:true});assert.ok(text(tree).includes('Current support agent joined your chat'));assert.ok(!text(tree).includes('Assigned to'));
 tree=await snapshot({status:'open',assignedUserName:'Current support agent',agentJoined:true,replyState:'waiting_customer'});assert.ok(text(tree).includes('Waiting for your reply'));assert.ok(text(tree).includes('Current support agent joined your chat'));
 tree=await snapshot({status:'closed',assignedUserName:'Historical support agent',agentJoined:true});assert.ok(text(tree).includes('Chat ended'));assert.ok(!text(tree).includes('joined your chat'),'Closed history must not announce a live joined agent');
 tree=await snapshot({status:'closed',resolvedAt:123});assert.ok(text(tree).includes('Resolved'));assert.ok(!text(tree).includes('Chat ended'));assert.ok(h.fixture.calls.every(call=>!call.body),'Observing snapshots never sends or assigns');stop?.();h.unmount();
});

test('FE-053 actual React native controller retains exact retry keys, renews edited attempts and fences unmounted handlers',{timeout:60000},async()=>{
 const require=createRequire(import.meta.url);
 const output=await build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`import React from 'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import Native from './apps/mobile/app/buying';const root=createRoot(document.getElementById('root'));window.fixture.mount=visible=>flushSync(()=>root.render(visible?<Native owner/>:null));`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'native-owner-react-ports',setup(b){
  b.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},a=>({path:require.resolve(a.path)}));
  b.onResolve({filter:/^(?:react-native|expo-router|expo-crypto|\.\.\/src\/(?:runtime|ui|ChatReadSentinel|AttentionAlerts|TransportPlanView))$/},a=>({path:a.path,namespace:'ports'}));
  b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:
   a.path==='react-native'?`import React from'react';export const AppState={currentState:'active'},View=({style,children})=><div style={Object.assign({},...[style].flat(Infinity).filter(value=>value&&typeof value==='object'))}>{children}</div>,StyleSheet={create:value=>value};`
   :a.path==='expo-router'?`import{useEffect}from'react';export const useFocusEffect=fn=>useEffect(fn,[fn]),router={push:path=>window.fixture.routes.push(path),replace:path=>window.fixture.routes.push(path)};`
   :a.path==='expo-crypto'?`export const randomUUID=()=>crypto.randomUUID();`
   :a.path==='../src/runtime'?`export const useApp=()=>({t:key=>key,locale:'en',session:{user:{id:'owner-A'}},ownerRequest:window.fixture.ownerRequest});export const secure={getItem:()=>{window.fixture.forbidden++;throw Error('Guest storage');},setItem:()=>{window.fixture.forbidden++;throw Error('Guest storage');},removeItem:()=>{window.fixture.forbidden++;throw Error('Guest storage');}},request=()=>{window.fixture.forbidden++;throw Error('Guest HTTP');};export class ApiFailure extends Error{};`
   :a.path==='../src/ui'?`import React from'react';export const Screen=props=><main>{props.children}</main>,Copy=props=><p>{props.children}</p>,Card=props=><section>{props.children}</section>,colors={};export const Field=({label,value,onChangeText,multiline,disabled,maxLength,placeholder})=><label>{label}{multiline?<textarea aria-label={label} value={value} disabled={disabled} maxLength={maxLength} placeholder={placeholder} onChange={e=>onChangeText(e.target.value)}/>:<input aria-label={label} value={value} disabled={disabled} maxLength={maxLength} placeholder={placeholder} onChange={e=>onChangeText(e.target.value)}/>}</label>;export const Button=({label,onPress,disabled})=>{window.fixture.handlers[label]=onPress;return<button disabled={disabled} onClick={onPress}>{label}</button>;};export const Status=({error,loading})=><div role='status'>{loading?'Loading':''}{error}</div>;`
   :a.path==='../src/TransportPlanView'?`export const TransportPlanSummary=()=>null;export default()=>null;`
   :a.path==='../src/AttentionAlerts'?`import React from'react';export const TransportAlerts=()=> <div data-guest-alerts/>;`
   :`export const ChatReadTranscript=({children})=>children;export default()=>null;`
  }));
 }}]});
 const browser=await chromium.launch({headless:true,timeout:20000}),errors:string[]=[];
 type Actual={calls:Array<{path:string;body?:Record<string,unknown>}>;routes:unknown[];forbidden:number;mount:(visible:boolean)=>void;resolve:(status:number,data:OwnerTransportState)=>void;handlers:Record<string,()=>void>};
 try{const page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await page.route('http://localhost:45680/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://localhost:45680/');assert.equal(await page.evaluate(()=>typeof crypto.randomUUID),'function','Expo crypto test port needs a secure localhost context');await page.addScriptTag({content:`window.fixture={calls:[],routes:[],forbidden:0,handlers:{},state:${JSON.stringify(response())}};let complete;window.fixture.ownerRequest=(path,body)=>{window.fixture.calls.push({path,body});if(!body)return Promise.resolve(window.fixture.state);return new Promise((resolve,reject)=>{complete={resolve,reject};});};window.fixture.resolve=(status,data)=>{if(status===200){window.fixture.state=data;complete.resolve(data);}else complete.reject(Error('Unable to connect. Please try again.'));};`});await page.addScriptTag({content:output.outputFiles[0].text});await page.evaluate(()=>(window as unknown as{fixture:Actual}).fixture.mount(true));await page.getByLabel('Name',{exact:true}).waitFor({timeout:5000}).catch(error=>{assert.deepEqual(errors,[],'Startup runtime errors');throw error;});await page.getByLabel('From',{exact:true}).fill('Town A');await page.getByLabel('To',{exact:true}).fill('Town B');
  const posts=()=>page.evaluate(()=>(window as unknown as{fixture:Actual}).fixture.calls.filter(call=>call.body));
  const fail=()=>page.evaluate(()=>(window as unknown as{fixture:Actual}).fixture.resolve(503,{} as OwnerTransportState));
  const send=async(label:string,count:number)=>{await page.getByRole('button',{name:label,exact:true}).click();await page.waitForFunction(count=>(window as unknown as{fixture:Actual}).fixture.calls.filter(call=>call.body).length===count,count);return(await posts()).at(-1)!.body!;};
  const first=await send('Start chat',1);await fail();await page.getByRole('button',{name:'Start chat',exact:true}).waitFor();const retry=await send('Start chat',2);assert.deepEqual(retry,first);await fail();await page.getByLabel('To',{exact:true}).fill('Town C');const changed=await send('Start chat',3);assert.notEqual(changed.idempotencyKey,first.idempotencyKey);assert.equal(changed.destination,'Town C');await page.evaluate(data=>(window as unknown as{fixture:Actual}).fixture.resolve(200,data),response(chat()));await page.getByRole('button',{name:'Send reply',exact:true}).waitFor();
  await page.getByLabel('Message',{exact:true}).fill('First reply');const original=await send('Send reply',4);await fail();const repeated=await send('Send reply',5);assert.deepEqual(repeated,original);await fail();await page.getByLabel('Message',{exact:true}).fill('Changed reply');const edited=await send('Send reply',6);assert.notEqual(edited.idempotencyKey,original.idempotencyKey);assert.equal(edited.conversationId,71);assert.equal(edited.publicRef,'SUP-OWNER-71');assert.equal(edited.message,'Changed reply');
  await page.evaluate(()=>(window as unknown as{fixture:Actual}).fixture.mount(false));await page.evaluate(()=>{const f=(window as unknown as{fixture:Actual}).fixture;f.handlers['Start chat']();f.handlers['Send reply']();f.handlers['Start another chat']?.();});assert.equal((await posts()).length,6,'Retained owner handlers do not issue requests after unmount');await page.evaluate(data=>(window as unknown as{fixture:Actual}).fixture.resolve(200,data),response(chat()));assert.equal(await page.locator('#root').innerHTML(),'');assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Actual}).fixture.forbidden),0);assert.equal(await page.locator('[data-guest-alerts]').count(),0);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
