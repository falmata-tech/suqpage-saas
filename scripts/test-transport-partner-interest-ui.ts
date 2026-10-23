import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {createUiText} from '../lib/i18n/core';

// Actual source components, controlled React hooks/renderers, request and crypto
// ports. No browser, database, email, native keyboard or native-layout claim.
type Node={type:string;props:Record<string,unknown>&{children?:unknown}};
type Payload=Record<string,string>;
type Call={body:Payload;signal:AbortSignal};
const require=createRequire(import.meta.url),fields=['Company name','Contact name','Email','Phone (optional)','About your company'];
const empty={companyName:'',contactName:'',email:'',phone:'',message:''};
const values=['Fixture Logistics','Fixture Contact','fixture@example.test','+12025550123','Local controlled test only'];
const bundles=new Map<string,Promise<string>>();
function bundle(platform:'web'|'native'){
 if(!bundles.has(platform))bundles.set(platform,build({entryPoints:[platform==='web'?'components/TransportPartnerInterest.tsx':'apps/mobile/app/transport-partners.tsx'],bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',plugins:[{name:'interest-ui-ports',setup(b){
  b.onResolve({filter:/^(react(?:\/.*)?|next-intl|expo-crypto|expo-router|@\/lib\/i18n\/ui|\.\.\/src\/(?:runtime|ui))$/},a=>({path:a.path,namespace:'fixture'}));
  b.onResolve({filter:/\.module\.css$/},()=>({path:'css',namespace:'fixture'}));
  b.onLoad({filter:/.*/,namespace:'fixture'},a=>({loader:'js',contents:a.path.startsWith('react')?'export const useState=fixture.useState,useRef=fixture.useRef,useEffect=fixture.useEffect,jsx=fixture.jsx,jsxs=fixture.jsx,Fragment="Fragment";export default {createElement:fixture.createElement};':a.path==='next-intl'?'export const useLocale=()=>fixture.locale;':a.path==='expo-crypto'?'export const randomUUID=()=>fixture.crypto.randomUUID();':a.path==='expo-router'?'export const router={navigate:()=>{}};':a.path==='@/lib/i18n/ui'?'export const useUiText=()=>fixture.t;':a.path==='../src/runtime'?'export const useApp=()=>({t:fixture.t,locale:fixture.locale}),request=(path,options)=>fixture.request(path,options);':a.path==='../src/ui'?'export const Screen="Screen",Copy="Copy",Field="Field",Button="Button",Status="Status";':'export default {form:"form",pair:"pair",receipt:"receipt"};'}));
 }}]}).then(r=>r.outputFiles[0].text));
 return bundles.get(platform)!;
}
async function harness(platform:'web'|'native',locale='en',cryptoMode:'standard'|'fallback'|'failed'='standard'){
 const states:unknown[]=[],refs:Array<{current:unknown}>=[],cleanups:Array<()=>void>=[],calls:Call[]=[],deferred:Array<{resolve:(value:{reference:string})=>void;reject:(error:Error)=>void}>=[];
 let stateIndex=0,refIndex=0,effectIndex=0,effects=0,mounted=true,lateWrites=0,keyCount=0,entropyCount=0;
 const t=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
 const crypto={randomUUID:cryptoMode==='fallback'?undefined:()=>{if(cryptoMode==='failed')throw Error('Secure random unavailable');return `00000000-0000-4000-8000-${String(++keyCount).padStart(12,'0')}`;},getRandomValues:(bytes:Uint8Array)=>{if(cryptoMode==='failed')throw Error('Secure random unavailable');bytes.forEach((_,i)=>bytes[i]=(i+ ++entropyCount)%256);return bytes;}};
 const fixture={locale,t,crypto,jsx:(type:string,props:Node['props'])=>({type,props}),createElement:(type:string,props:Node['props'],...children:unknown[])=>({type,props:{...props,children}}),useState(initial:unknown){const i=stateIndex++;if(!(i in states))states[i]=initial;return[states[i],(next:unknown)=>{if(!mounted)lateWrites++;states[i]=typeof next==='function'?(next as (old:unknown)=>unknown)(states[i]):next;}];},useRef(initial:unknown){const i=refIndex++;return refs[i]??(refs[i]={current:initial});},useEffect(effect:()=>void|(()=>void)){if(effectIndex++>=effects){effects++;const cleanup=effect();if(cleanup)cleanups.push(cleanup);}},request(path:string,options:{body:Payload;signal:AbortSignal}){assert.equal(path,'transport-partners');calls.push({body:options.body,signal:options.signal});return new Promise<{reference:string}>((resolve,reject)=>deferred.push({resolve,reject}));}};
 const module={exports:{} as {default:()=>Node}};
 vm.runInNewContext(await bundle(platform),{module,exports:module.exports,require,fixture,crypto,Uint8Array,Error,AbortController,AbortSignal,fetch:async(path:string,options:{body:string;signal:AbortSignal})=>{assert.equal(path,'/api/transport-partners');const result=await fixture.request('transport-partners',{body:JSON.parse(options.body),signal:options.signal});return{ok:true,json:async()=>result};}});
 const render=()=>{stateIndex=0;refIndex=0;effectIndex=0;return module.exports.default();};
 const nodes=(value:unknown):Node[]=>Array.isArray(value)?value.flatMap(nodes):value&&typeof value==='object'&&'props'in value?[value as Node,...nodes((value as Node).props.children)]:[];
 const getFields=()=>nodes(render()).filter(n=>n.type===(platform==='web'?'input':'Field')||n.type==='textarea');
 const fill=(index:number,value:string)=>{const field=getFields()[index];assert.ok(field);if(platform==='web')(field.props.onChange as (e:unknown)=>void)({target:{value}});else(field.props.onChangeText as (v:string)=>void)(value);};
 const submit=()=>{const all=nodes(render());if(platform==='web')return(all.find(n=>n.type==='form')!.props.onSubmit as(e:unknown)=>Promise<void>)({preventDefault(){}});const action=all.find(n=>n.type==='Button'&&(n.props.label===t('Send request')||n.props.label===t('Sending…')));assert.ok(action,'Submit action must be selected by its label, not position');(action.props.onPress as()=>void)();};
 const settle=async()=>{await new Promise<void>(resolve=>setImmediate(resolve));};
 render();return{platform,t,render,nodes,getFields,fill,submit,settle,calls,deferred,states,unmount(){mounted=false;cleanups.forEach(f=>f());},lateWrites:()=>lateWrites,fillAll(){values.forEach((v,i)=>fill(i,v));}};
}
for(const platform of ['web','native'] as const)for(const locale of ['en','am','om'])test(`FE-076 ${platform}/${locale}: fields, guarded retry identity and private success reset`,async()=>{
 const h=await harness(platform,locale);h.fillAll();let tree=h.nodes(h.render());
 for(const label of fields){if(platform==='native')assert.ok(tree.some(n=>n.type==='Field'&&n.props.label===h.t(label)));else assert.ok(tree.some(n=>n.type==='label'&&Array.isArray(n.props.children)&&n.props.children[0]===h.t(label)));}
 assert.deepEqual(h.getFields().map(f=>f.props.value),values);
 const first=h.submit();h.submit();assert.equal(h.calls.length,1,'Busy guard covers two calls before React rerender');
 assert.equal(h.calls[0].body.locale,locale);assert.equal(h.calls[0].body.email,values[2]);
 assert.match(h.calls[0].body.idempotencyKey,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
 assert.ok(h.getFields().every(f=>platform==='web'?f.props.disabled===true:f.props.editable===false));
 h.deferred[0].reject(Error('We could not receive your request. Please try again later.'));await first;await h.settle();
 assert.deepEqual(h.getFields().map(f=>f.props.value),values,'Failure retains private draft for correction');
 const second=h.submit();assert.equal(h.calls[1].body.idempotencyKey,h.calls[0].body.idempotencyKey,'Same failed payload reuses idempotency identity');h.deferred[1].reject(Error('Retry fixture'));await second;await h.settle();
 h.fill(4,'Changed controlled message');const third=h.submit();assert.notEqual(h.calls[2].body.idempotencyKey,h.calls[1].body.idempotencyKey,'Edited payload rotates key');
 h.deferred[2].resolve({reference:'PI-ABCDEF123456'});await third;await h.settle();tree=h.nodes(h.render());
 assert.equal(h.getFields().length,0,'Success no longer renders private form fields');assert.deepEqual(JSON.parse(JSON.stringify(h.states[0])),empty,'Private draft state is cleared, not merely hidden');
 assert.ok(tree.some(n=>n.props.children===h.t('Request received. We’ll contact you about the next steps.')));h.unmount();
});
for(const platform of ['web','native'] as const)test(`FE-076 ${platform}: leaving aborts request and ignores late successful completion`,async()=>{
 const h=await harness(platform);h.fillAll();const completion=h.submit();assert.equal(h.calls.length,1);h.unmount();assert.equal(h.calls[0].signal.aborted,true);h.deferred[0].resolve({reference:'PI-ABCDEF123456'});await completion;await h.settle();assert.equal(h.lateWrites(),0);assert.equal(h.states[1],'','A late response cannot publish a receipt');assert.deepEqual(JSON.parse(JSON.stringify(h.states[0])),Object.fromEntries(Object.keys(empty).map((key,i)=>[key,values[i]])),'No late state mutation after leaving');
});
test('FE-076 web: missing randomUUID still uses secure UUIDv4 entropy',async()=>{
 const h=await harness('web','en','fallback');h.fillAll();const completion=h.submit();assert.equal(h.calls.length,1);assert.match(h.calls[0].body.idempotencyKey,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);h.deferred[0].resolve({reference:'PI-ABCDEF123456'});await completion;h.unmount();
});

test('FE-076 web: unavailable secure entropy is caught and leaves the form retryable',async()=>{
 const h=await harness('web','en','failed');h.fillAll();await h.submit();await h.settle();assert.equal(h.calls.length,0);assert.ok(h.getFields().every(f=>f.props.disabled===false));assert.deepEqual(h.getFields().map(f=>f.props.value),values);assert.ok(h.nodes(h.render()).some(n=>n.props.role==='alert'));h.unmount();
});
