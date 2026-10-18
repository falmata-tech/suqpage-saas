import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
import type {TransportPlan} from '../lib/transport-plan-contract';
import type {OwnerTransportConversation} from '../lib/owner-transport-contract';

type Element={type:string|((props:Record<string,unknown>)=>unknown);key?:string;props:Record<string,unknown>&{children?:unknown}};
type Effect={deps:unknown[];cleanup?:()=>void};
type Request={url:string;init:RequestInit};
const capability='a'.repeat(64);
const plan=(version=1):TransportPlan=>({version,legs:['air','truck','van','car','motorcycle'].map((method,index)=>({id:`00000000-0000-4000-8000-${String(index+1).padStart(12,'0')}`,providerName:`Literal provider ${index+1}`,origin:`Place ${index}`,destination:`Place ${index+1}`,method:method as TransportPlan['legs'][number]['method']}))});
const chat=(patch:Partial<OwnerTransportConversation>={}):OwnerTransportConversation=>({id:71,publicRef:'SUP-PLAN-71',subject:'Public route',category:'shipment_observation',status:'open',assignedUserName:null,agentJoined:false,resolvedAt:null,messages:[{id:2,sender:'staff',senderName:'Agent',body:'A public response',createdAt:1}],transportPlan:plan(),...patch});
const bundle=build({entryPoints:['apps/mobile/app/buying.tsx','apps/mobile/app/transport-plan.tsx','apps/mobile/src/TransportPlanView.tsx'],outdir:'/tmp/suqpage-transport-plan-native',bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'native-plan-lifecycle-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|expo-crypto|(?:\.\/|\.\.\/src\/)(?:runtime|ui|ChatReadSentinel|AttentionAlerts))$/},a=>({path:a.path.startsWith('../src/')?'./'+a.path.split('/').at(-1):a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
  a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],value=>{fixture.updates++;fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value;}];},useRef=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]={current:initial};return fixture.states[i];},useCallback=(fn,deps)=>{const i=fixture.cursor++,old=fixture.states[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))fixture.states[i]={deps,fn};return fixture.states[i].fn;},useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))fixture.pending.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});};export default {};`
  :a.path==='react/jsx-runtime'?`export const jsx=(type,props,key)=>({type,props,key}),jsxs=jsx,Fragment='Fragment';`
  :a.path==='react-native'?`export const Platform={OS:'web'},View='View',StyleSheet={create:value=>value},AppState={get currentState(){return fixture.active;},addEventListener:(_,fn)=>{fixture.listeners.set('app',fn);return{remove:()=>fixture.listeners.delete('app')};}};`
  :a.path==='expo-router'?`export const useFocusEffect=fn=>{fixture.focus=fn;},useLocalSearchParams=()=>fixture.params,Redirect='Redirect',router={push:path=>fixture.navigation.push(path),replace:()=>{throw Error('Unexpected navigation');}};`
  :a.path==='expo-crypto'?`export const randomUUID=()=> 'controlled-key';`
  :a.path==='./runtime'?`export const API='https://api.example.test',useApp=()=>({t:(key,values={})=>key.replace(/\\{(\\w+)\\}/g,(_,name)=>String(values[name]??'')),locale:'en',session:{user:{id:fixture.owner}},ownerRequest:async(path,body)=>{fixture.ownerCalls.push({path,body});if(body)throw Error('Unexpected chat command');return{conversation:fixture.chat,defaults:{name:'PRIVATE OWNER',phone:'PRIVATE PHONE'}};}});export class ApiFailure extends Error{};export const request=()=>{throw Error('Unexpected guest API');},secure={getItem:()=>{throw Error('Unexpected guest storage');},setItem:()=>{throw Error('Unexpected guest storage');},removeItem:()=>{throw Error('Unexpected guest storage');}};`
  :a.path==='./ui'?`export const Screen='Screen',Copy='Copy',Card='Card',Field='Field',Button='Button',Status='Status',colors={line:'#ddd',soft:'#eee'};`
  :a.path==='./AttentionAlerts'?`export const TransportAlerts='TransportAlerts';`
  :`export const ChatReadTranscript='ChatReadTranscript';export default 'ChatReadSentinel';`
 }));
}}]});
function flatten(value:unknown):Element[]{if(Array.isArray(value))return value.flatMap(flatten);if(!value||typeof value!=='object')return[];const node=value as Element;if(typeof node.type==='function')return flatten(node.type(node.props));return[node,...flatten(node.props.children)];}
function text(value:unknown):string{if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'||typeof value==='number'?String(value):'';}
const getButton=(tree:Element[],label:string)=>{const value=tree.find(node=>node.type==='Button'&&node.props.label===label);assert.ok(value,label);return value;};
const press=(button:Element)=>(button.props.onPress as()=>void)();
async function settle(){for(let i=0;i<3;i++)await new Promise<void>(resolve=>setImmediate(resolve));}
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(yes=>{resolve=yes;});return{promise,resolve};}
async function harness(entry:string){
 const fixture={states:[] as unknown[],cursor:0,effectCursor:0,effects:[] as Effect[],pending:[] as Array<()=>void>,updates:0,navigation:[] as string[],owner:'owner-A',chat:chat(),params:{key:capability},focus:undefined as undefined|(()=>undefined|(()=>void)),active:'active',hidden:false,windowFocused:true,listeners:new Map<string,()=>void>(),ownerCalls:[] as Array<{path:string;body:unknown}>,requests:[] as Request[],responses:[] as Array<Promise<Response>>};
 let timerId=0;const timers=new Map<number,{ms:number;fn:()=>void}>();
 const module={exports:{} as {default:(props:Record<string,unknown>)=>Element;TransportPlanSummary:(props:Record<string,unknown>)=>Element}};
 const listen=(key:string,fn:()=>void)=>fixture.listeners.set(key,fn),remove=(key:string,fn:()=>void)=>{if(fixture.listeners.get(key)===fn)fixture.listeners.delete(key);};
 const output=(await bundle).outputFiles.find(file=>file.path.endsWith('/'+entry+'.js'));assert.ok(output);
 vm.runInNewContext(output.text,{module,exports:module.exports,fixture,AbortController,URL,URLSearchParams,Response,fetch:(url:string,init:RequestInit)=>{fixture.requests.push({url,init});const result=fixture.responses.shift();assert.ok(result,'Expected controlled plan response');return result;},setTimeout:(fn:()=>void,ms:number)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout:(id:number)=>timers.delete(id),window:{location:{hash:''},addEventListener:listen,removeEventListener:remove},document:{get hidden(){return fixture.hidden;},hasFocus:()=>fixture.windowFocused,addEventListener:listen,removeEventListener:remove}});
 let component=module.exports.default;
 const render=(props:Record<string,unknown>={})=>{fixture.cursor=fixture.effectCursor=0;const output=component(props),tree=flatten(output);fixture.pending.splice(0).forEach(run=>run());return tree;};
 const publicChild=()=>{fixture.cursor=fixture.effectCursor=0;const child=component({});fixture.pending.splice(0).forEach(run=>run());assert.equal(typeof child.type,'function');fixture.effects.forEach(effect=>effect.cleanup?.());fixture.states=[];fixture.effects=[];component=child.type as typeof component;return child.props;};
 return{fixture,module,timers,render,publicChild,unmount:()=>fixture.effects.forEach(effect=>effect.cleanup?.()),tick:(ms:number)=>{const found=[...timers].find(([,timer])=>timer.ms===ms);assert.ok(found,`A ${ms}ms timer exists`);timers.delete(found[0]);found[1].fn();}};
}

test('FE-068 native renderer shows every ordered literal stage and all five methods without private/progress fields',async()=>{
 const h=await harness('TransportPlanView'),tree=h.render({plan:plan()}),content=text(tree);
 const rows=tree.filter(node=>String(node.props.testID||'').startsWith('transport-plan-leg-'));
 assert.equal(rows.length,5);assert.deepEqual(rows.map(row=>text(row.props.children).match(/Literal provider \d/)?.[0]),['Literal provider 1','Literal provider 2','Literal provider 3','Literal provider 4','Literal provider 5']);
 for(const method of ['Air','Truck','Van','Car','Motorcycle'])assert.ok(content.includes(method));
 assert.doesNotMatch(content,/PRIVATE|ETA|Completed|Current provider|Scan|2026|Date/);assert.ok(content.includes('5 transport stages'));
 const summary=flatten(h.module.exports.TransportPlanSummary({plan:{...plan(),legs:plan().legs.slice(0,1)},onPress(){}}));assert.ok(text(summary).includes('1 transport stage'));assert.ok(!summary.some(node=>String(node.props.testID||'').startsWith('transport-plan-leg-')));assert.ok(getButton(summary,'View transport plan'));
});

test('FE-069 native legacy plan route drops all capability input without making a read',async()=>{
 const h=await harness('transport-plan'),tree=h.render();assert.equal(tree.length,1);assert.equal(tree[0].type,'Redirect');assert.equal(tree[0].props.href,'/tracking');assert.equal(h.fixture.requests.length,0);assert.equal(h.fixture.ownerCalls.length,0);h.unmount();
});

test('FE-069 native participant exposes independent Tracking and ignores legacy plan authority',async()=>{
 const h=await harness('buying');h.render({owner:true});await settle();let tree=h.render({owner:true});h.fixture.focus!();await settle();tree=h.render({owner:true});
 assert.ok(getButton(tree,'Back to account'));assert.ok(getButton(tree,'Chat history'));assert.ok(getButton(tree,'Tracking'));assert.equal(tree.filter(node=>node.type==='ChatReadTranscript').length,1);
 assert.equal(tree.filter(node=>String(node.props.testID||'').startsWith('transport-plan-leg-')).length,0);assert.ok(!tree.some(node=>node.type==='Button'&&node.props.label==='View transport plan'),'Legacy DTO data never opens a publication bypass');
 press(getButton(tree,'Tracking'));assert.deepEqual(h.fixture.navigation,['/tracking']);assert.equal(h.fixture.ownerCalls.filter(call=>call.body).length,0);assert.equal(h.fixture.requests.length,0);
 h.fixture.chat=chat({status:'closed'});h.tick(5000);await settle();tree=h.render({owner:true});assert.ok(getButton(tree,'Tracking'));assert.ok(!tree.some(node=>node.type==='Button'&&node.props.label==='View transport plan'));h.unmount();
});
