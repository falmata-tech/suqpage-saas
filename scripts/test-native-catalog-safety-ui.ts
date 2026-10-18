import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
import {listingReportCommand,type BlockedBusiness} from '../lib/catalog-safety';
type Node={type:string;props:Record<string,unknown>&{children?:unknown}};
type ReportBody={businessId:number;productId:number|null;reason:string;details:string;idempotencyKey:string};
// Actual safety component. Native presentation, async HTTP/device preferences,
// canonical inquiry-store clearing and router are explicit controlled ports.
// This is not API/database/browser/device or real reporting/delivery evidence.
const bundle=build({entryPoints:['apps/mobile/src/CatalogSafety.tsx'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'native-safety-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|expo-crypto|\.\/(?:runtime|ui|chrome|blocked-businesses|use-business-inquiry))$/},a=>({path:a.path,namespace:'port'}));
 b.onLoad({filter:/.*/,namespace:'port'},a=>({loader:'js',contents:
 a.path==='react'?`export const useState=initial=>{const i=f.cursor++;if(!(i in f.slots))f.slots[i]=typeof initial==='function'?initial():initial;return[f.slots[i],next=>f.slots[i]=typeof next==='function'?next(f.slots[i]):next];},useRef=initial=>{const i=f.cursor++;return f.slots[i]||(f.slots[i]={current:initial});};export default {};`
 :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
 :a.path==='react-native'?`export const View='View',Text='Text',Pressable='Pressable';`
 :a.path==='expo-router'?`export const router={push:path=>f.routes.push(path)};`
 :a.path==='expo-crypto'?`export const randomUUID=()=> 'fixture_safety_key_'+String(++f.keys).padStart(20,'0');`
 :a.path==='./runtime'?`export const useApp=()=>({t:key=>key,basket:f.basket,setBasket:value=>{f.basket=value;f.basketWrites++;}}),request=(path,options)=>f.request(path,options.body);`
 :a.path==='./blocked-businesses'?`export const useBlockedBusinesses=()=>({ready:f.ready,list:f.list,save:items=>f.save(items)});`
 :a.path==='./use-business-inquiry'?`export const businessInquiries={clear:id=>f.clear(id)};`
 :a.path==='./chrome'?`export const Sheet='Sheet';`
 :`export const Button='Button',Copy='Copy',Field='Field',Status='Status',Chip='Chip',s={wrap:{}},colors={muted:'#667',ink:'#223',line:'#ddd'};`
 }));
}}]});
const nodes=(value:unknown):Node[]=>Array.isArray(value)?value.flatMap(nodes):!value||typeof value!=='object'?[]:[value as Node,...nodes((value as Node).props.children)];
const business:BlockedBusiness={id:7,handle:'fixture-business',name:'Literal business'};
const other:BlockedBusiness={id:8,handle:'other-business',name:'Other business'};
const style=(node:Node)=>Object.assign({},...[node.props.style].flat().filter(Boolean))as Record<string,unknown>;
const press=(node:Node)=>{assert.ok(node);(node.props.onPress as()=>void)();};
const button=(tree:Node[],name:string)=>{const result=tree.find(n=>n.props.label===name||n.props.accessibilityLabel===name);assert.ok(result,name);return result;};
const plain=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
const flush=async()=>{await new Promise<void>(resolve=>setImmediate(resolve));};
function deferred(){let resolve!:()=>void,reject!:(error:Error)=>void;const promise=new Promise<void>((done,fail)=>{resolve=done;reject=fail;});return{promise,resolve,reject};}
async function setup(productId?:number){
 const f={cursor:0,slots:[]as unknown[],ready:true,list:[]as BlockedBusiness[],keys:0,basket:{shop:{id:7}}as{shop:{id:number}}|null,basketWrites:0,routes:[]as string[],saved:[]as BlockedBusiness[][],cleared:[]as number[],requests:[]as Array<{path:string;body:ReportBody}>,saveGate:null as ReturnType<typeof deferred>|null,reportGate:null as ReturnType<typeof deferred>|null,failClear:false,
 async save(items:BlockedBusiness[]){this.saved.push(plain(items));if(this.saveGate)await this.saveGate.promise;this.list=plain(items);},async clear(id:number){this.cleared.push(id);if(this.failClear)throw Error('Device write unavailable');},async request(path:string,body:ReportBody){this.requests.push({path,body:plain(body)});if(this.reportGate)await this.reportGate.promise;return{receipt:'fixture-only'};}};
 const module={exports:{}as{CatalogSafety:(props:Record<string,unknown>)=>Node}};vm.runInNewContext((await bundle).outputFiles[0].text,{module,exports:module.exports,f,Error});
 return{f,render:()=>{f.cursor=0;return nodes(module.exports.CatalogSafety({business,productId,children:{type:'Listing',props:{}}}));}};
}

test('FE-063 S134 native safety shows one48px entry and one Sheet through options/report/Back/Cancel without writes',async()=>{
 const app=await setup(31);let tree=app.render();assert.equal(tree.filter(n=>n.type==='Pressable').length,1);const entry=button(tree,'Listing options');assert.ok(Number(style(entry).minHeight)>=48&&Number(style(entry).minWidth)>=48);assert.ok(!tree.some(n=>n.props.label==='Report product'||n.props.label==='Block business'));
 press(entry);tree=app.render();assert.equal(tree.filter(n=>n.type==='Sheet').length,1);assert.equal(tree.find(n=>n.type==='Sheet')!.props.title,'Listing options');press(button(tree,'Report product'));tree=app.render();assert.equal(tree.filter(n=>n.type==='Sheet').length,1);assert.equal(tree.find(n=>n.type==='Sheet')!.props.title,'Report product');assert.ok(tree.filter(n=>n.type==='Chip').every(n=>n.props.minHeight===48));const retainedSend=button(tree,'Send report');
 press(button(tree,'Back'));tree=app.render();assert.equal(tree.find(n=>n.type==='Sheet')!.props.title,'Listing options');press(button(tree,'Cancel'));tree=app.render();assert.equal(tree.find(n=>n.type==='Sheet')!.props.visible,false);press(retainedSend);await flush();assert.deepEqual(app.f.requests,[]);assert.deepEqual(app.f.saved,[]);assert.deepEqual(app.f.cleared,[]);
 press(button(tree,'Listing options'));tree=app.render();press(button(tree,'Blocked businesses'));tree=app.render();assert.deepEqual(app.f.routes,['/blocked-businesses']);assert.equal(tree.find(n=>n.type==='Sheet')!.props.visible,false,'Close the owned overlay before routing to management');
});

test('FE-063 S134 native block failures are retryable, busy commands deduplicate and Unblock restores only its target',async()=>{
 const app=await setup();app.f.list=[other];app.f.saveGate=deferred();let tree=app.render();press(button(tree,'Listing options'));tree=app.render();const block=button(tree,'Block business');press(block);press(block);tree=app.render();assert.equal(app.f.saved.length,1);assert.ok(tree.some(n=>n.type==='Status'&&n.props.loading===true));assert.equal(button(tree,'Cancel').props.disabled,true);assert.equal(button(tree,'Block business').props.disabled,true);
 app.f.saveGate.reject(Error('Storage unavailable'));await flush();tree=app.render();const failure=tree.find(n=>n.type==='Status'&&n.props.error==='Could not save blocked businesses. Try again.');assert.ok(failure);assert.deepEqual(app.f.list,[other]);assert.ok(tree.some(n=>n.type==='Listing'));assert.equal(app.f.basketWrites,0);
 app.f.saveGate=null;(failure.props.retry as()=>void)();await flush();tree=app.render();assert.deepEqual(app.f.list.map(v=>v.id),[8,7]);assert.ok(!tree.some(n=>n.type==='Listing'));assert.equal(app.f.basket,null);assert.deepEqual(app.f.cleared,[7]);assert.equal(tree.find(n=>n.type==='Sheet')!.props.visible,false);
 press(button(tree,'Listing options'));tree=app.render();assert.ok(!tree.some(n=>n.props.label==='Report business'));press(button(tree,'Unblock business'));await flush();tree=app.render();assert.deepEqual(app.f.list,[other]);assert.ok(tree.some(n=>n.type==='Listing'));assert.deepEqual(app.f.cleared,[7],'Unblock does not erase another saved inquiry');assert.deepEqual(app.f.requests,[]);
});

test('FE-063 S134 partial inquiry-clear recovery retains the requested block and fresh unrelated preferences',async()=>{
 const app=await setup();app.f.failClear=true;let tree=app.render();press(button(tree,'Listing options'));tree=app.render();press(button(tree,'Block business'));await flush();tree=app.render();assert.deepEqual(app.f.list.map(v=>v.id),[7]);assert.equal(app.f.basket,null);const failure=tree.find(n=>n.type==='Status'&&n.props.error);assert.ok(failure);
 app.f.list.push(other);app.f.failClear=false;tree=app.render();(failure.props.retry as()=>void)();await flush();tree=app.render();assert.deepEqual(app.f.list.map(v=>v.id).sort(),[7,8],'Retry replays block=true, not a toggle that could silently unblock');assert.deepEqual(app.f.cleared,[7,7]);assert.ok(!tree.some(n=>n.type==='Listing'));assert.ok(!tree.some(n=>n.type==='Status'&&n.props.error));
});

test('FE-063 S134 report failure preserves draft/replay key and a successful retry never changes preferences',async()=>{
 const app=await setup(31);app.f.reportGate=deferred();let tree=app.render();press(button(tree,'Listing options'));tree=app.render();press(button(tree,'Report product'));tree=app.render();(button(tree,'Details (optional)').props.onChangeText as(value:string)=>void)('Literal report detail');tree=app.render();const send=button(tree,'Send report');press(send);press(send);tree=app.render();assert.equal(app.f.requests.length,1);assert.equal(button(tree,'Details (optional)').props.editable,false);assert.equal(button(tree,'Sending…').props.disabled,true);assert.equal(button(tree,'Cancel').props.disabled,true);const first=plain(app.f.requests[0]);assert.equal(first.path,'reports');assert.deepEqual(listingReportCommand(first.body),first.body);
 app.f.reportGate.reject(Error('Unable to connect'));await flush();tree=app.render();assert.equal(button(tree,'Details (optional)').props.value,'Literal report detail');const failure=tree.find(n=>n.type==='Status'&&n.props.error==='Unable to connect');assert.ok(failure);app.f.reportGate=null;(failure.props.retry as()=>void)();await flush();tree=app.render();assert.deepEqual(app.f.requests[1],first);assert.equal(tree.find(n=>n.type==='Sheet')!.props.visible,false);assert.ok(tree.some(n=>n.type==='Copy'&&n.props.children==='Report received.'));assert.deepEqual(app.f.saved,[]);assert.deepEqual(app.f.cleared,[]);assert.equal(app.f.basketWrites,0);
});

test('FE-063 S134 editing a failed report creates a fresh command key and clears obsolete retry feedback',async()=>{
 const app=await setup();app.f.reportGate=deferred();let tree=app.render();press(button(tree,'Listing options'));tree=app.render();press(button(tree,'Report business'));tree=app.render();press(button(tree,'Send report'));app.f.reportGate.reject(Error('Unable to connect'));await flush();tree=app.render();const first=app.f.requests[0];(button(tree,'Details (optional)').props.onChangeText as(value:string)=>void)('A different report draft');tree=app.render();assert.ok(!tree.some(n=>n.type==='Status'&&n.props.error));app.f.reportGate=null;press(button(tree,'Send report'));await flush();assert.equal(app.f.requests[1].body.details,'A different report draft');assert.notEqual(app.f.requests[1].body.idempotencyKey,first.body.idempotencyKey);assert.equal(app.f.requests[1].body.productId,null);assert.deepEqual(app.f.saved,[]);
});
