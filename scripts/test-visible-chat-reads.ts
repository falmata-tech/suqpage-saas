import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {chromium,type Page} from 'playwright';

const require=createRequire(import.meta.url);
type Harness={reads:number[];timers:Map<number,()=>void>;measurements:Array<{node:HTMLElement;done:(x:number,y:number,w:number,h:number)=>void}>;mount:(mode:string,identity?:string,active?:boolean)=>void;tick:()=>void;complete:(positions:number[])=>void;state:(value:string)=>void;overlay:()=>void;platform:string;hidden:boolean;focused:boolean;fail:boolean;hold:boolean;release:()=>void;geometry:()=>Record<string,boolean>};
const bundle=build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
 import React,{useRef}from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';
 import NativeFooter,{ChatReadTranscript}from'./apps/mobile/src/ChatReadSentinel';
 import{peerFooterVisible,useVisibleChatRead}from'./components/ChatReadObserver';
 import{registerOverlay}from'./apps/mobile/src/overlay-visibility';
 const h=window.fixture,root=createRoot(document.getElementById('root'));
 function ack(id){h.reads.push(id);return h.hold?new Promise(resolve=>{h.release=resolve;}):h.fail?Promise.reject(Error('controlled unavailable')):Promise.resolve();}
 function Native({identity,active}){return <ChatReadTranscript identity={identity} active={active} onRead={ack}>{[10,20,30].map(id=><NativeFooter key={id} messageId={id}/>)}</ChatReadTranscript>;}
 function Web({identity,active}){const ref=useRef(null);useVisibleChatRead(ref,active,ack,identity);return <section ref={ref} style={{height:300,overflow:'auto',marginTop:100}}>{[10,20,30].map(id=><div key={id} data-read-message-id={id} style={{height:2,marginBottom:220}}/>)}</section>;}
 h.mount=(mode,identity='case:assignment-1',active=true)=>flushSync(()=>root.render(mode==='native'?<Native identity={identity} active={active}/>:mode==='web'?<Web identity={identity} active={active}/>:null));
 h.overlay=()=>{const release=registerOverlay();release();};
 h.geometry=()=>{
  const previous=window.visualViewport;Object.defineProperty(window,'visualViewport',{configurable:true,value:{offsetTop:90,height:410,offsetLeft:0,width:800}});
  const parent=document.createElement('div'),footer=document.createElement('div');document.body.append(parent);parent.append(footer);
  footer.getBoundingClientRect=()=>({top:450,bottom:452,left:5,right:105,width:100,height:2});
  const offset=peerFooterVisible(footer);parent.style.overflow='hidden';parent.getBoundingClientRect=()=>({top:100,bottom:400,left:0,right:200,width:200,height:300});Object.defineProperties(parent,{clientHeight:{value:300},clientWidth:{value:200}});
  const clipped=!peerFooterVisible(footer);parent.remove();Object.defineProperty(window,'visualViewport',{configurable:true,value:previous});return{offset,clipped};
 };
`},bundle:true,write:false,format:'iife',platform:'browser',plugins:[{name:'visible-read-device-ports',setup(b){
 b.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},a=>({path:require.resolve(a.path)}));
 b.onResolve({filter:/^(react-native|expo-router|react-native-safe-area-context)$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'jsx',contents:a.path==='react-native'?`
  import React,{forwardRef,useImperativeHandle,useRef}from'react';
  export const AppState={get currentState(){return window.fixture.appState;},addEventListener:(name,fn)=>{window.fixture.appListeners.add(fn);return{remove:()=>window.fixture.appListeners.delete(fn)};}};
  export const Keyboard={addListener:()=>({remove(){}})},Platform={get OS(){return window.fixture.platform;}},useWindowDimensions=()=>({height:844});
  export const View=forwardRef((props,ref)=>{const node=useRef(null);useImperativeHandle(ref,()=>({measureInWindow:done=>window.fixture.measurements.push({node:node.current,done})}));return <div ref={node} data-footer/>;});
 `:a.path==='expo-router'?`import{useEffect}from'react';export const useFocusEffect=callback=>useEffect(callback,[callback]);`:`export const useSafeAreaInsets=()=>({top:0,bottom:0});` }));
}}]});
async function boot(page:Page){
 await page.route('http://localhost:45683/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));await page.goto('http://localhost:45683');
 await page.addScriptTag({content:'window.__name=value=>value;'});
 await page.evaluate(()=>{
  const h={reads:[] as number[],timers:new Map<number,()=>void>(),measurements:[] as Array<{node:HTMLElement;done:(x:number,y:number,w:number,h:number)=>void}>,appState:'active',appListeners:new Set<()=>void>(),platform:'android',hidden:false,focused:true,fail:false,hold:false,release:()=>{},serial:0};
  Object.defineProperties(document,{hidden:{configurable:true,get:()=>h.hidden},hasFocus:{configurable:true,value:()=>h.focused}});
  window.setInterval=((callback:()=>void)=>{const id=++h.serial;h.timers.set(id,callback);return id;}) as typeof window.setInterval;
  window.clearInterval=((id:unknown)=>{if(typeof id==='number')h.timers.delete(id);}) as typeof window.clearInterval;
  Object.assign(h,{tick:()=>{for(const fn of h.timers.values())fn();},complete:(positions:number[])=>{const nodes=[...document.querySelectorAll('[data-footer]')];for(const item of h.measurements.splice(0)){item.done(0,positions[nodes.indexOf(item.node)],300,2);}},state:(value:string)=>{h.appState=value;for(const fn of h.appListeners)fn();}});
  (window as unknown as{fixture:unknown}).fixture=h;
 });
 await page.addScriptTag({content:(await bundle).outputFiles[0].text});
}
async function fixture(page:Page,fn:(h:Harness)=>void){await page.evaluate(fn=>{const h=(window as unknown as{fixture:Harness}).fixture;(0,eval)('('+fn+')')(h);},fn.toString());}
async function count(page:Page,n:number){await page.waitForFunction(n=>(window as unknown as{fixture:Harness}).fixture.reads.length===n,n);}

test('FE-062 actual web observation respects viewport/clipping, older visible replies, focus and saved assignment epochs',{timeout:35_000},async()=>{
 const browser=await chromium.launch({headless:true,timeout:20_000}),errors:string[]=[];
 try{const page=await browser.newPage({viewport:{width:800,height:844}});page.on('pageerror',e=>errors.push(e.message));await boot(page);
  assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.geometry()),{offset:true,clipped:true});
  await fixture(page,h=>{h.hidden=true;h.mount('web');});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),0);
  await fixture(page,h=>{h.hidden=false;h.focused=false;h.tick();});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),0);
  await fixture(page,h=>{h.focused=true;h.tick();});await count(page,1);assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads),[20]);
  await fixture(page,h=>h.tick());assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),1);
  await fixture(page,h=>h.mount('web','case:assignment-2'));await count(page,2);assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads),[20,20]);
  await fixture(page,h=>h.mount('web','case:assignment-2',false));await fixture(page,h=>h.tick());assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),2);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});

test('FE-053 actual native transcript batches every footer and fences async background, browser focus, overlay and identity',{timeout:35_000},async()=>{
 const browser=await chromium.launch({headless:true,timeout:20_000}),errors:string[]=[];
 try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await boot(page);await fixture(page,h=>h.mount('native'));
  assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.timers.size),1,'One timer covers all incoming footers');
  await fixture(page,h=>{h.tick();h.state('background');h.complete([100,250,900]);});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),0);
  await fixture(page,h=>{h.state('active');h.tick();h.state('background');h.state('active');h.complete([100,250,900]);});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),0,'Focus round trip invalidates delayed native measurements');
  await fixture(page,h=>{h.tick();h.overlay();h.complete([100,250,900]);});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),0,'An overlay open/close round trip invalidates delayed measurement');
  await fixture(page,h=>{h.mount('none');h.platform='web';h.mount('native');h.tick();h.hidden=true;document.dispatchEvent(new Event('visibilitychange'));h.hidden=false;h.complete([100,250,900]);});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),0,'A web hidden/visible round trip invalidates delayed measurement');
  await fixture(page,h=>{h.tick();h.complete([100,250,900]);});await count(page,1);assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads),[20],'Older visible footer is admitted without newest offscreen reply');
  await fixture(page,h=>{h.tick();h.complete([100,250,900]);});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),1);
  await fixture(page,h=>{h.tick();const old=h.measurements.splice(0);h.mount('native','new-case');for(const item of old)item.done(0,100,300,2);});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),1,'Old identity measurement cannot acknowledge a replacement case before its fresh batch completes');
  await fixture(page,h=>{h.fail=true;h.tick();h.complete([100,250,300]);});await count(page,2);
  await fixture(page,h=>{h.fail=false;h.tick();h.complete([100,250,300]);});await count(page,3);assert.deepEqual(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads),[20,30,30],'Failed read retries the highest visible ID');
  await fixture(page,h=>{h.mount('native','third-case');h.tick();h.mount('none');h.complete([100,250,300]);});assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.reads.length),3);assert.equal(await page.evaluate(()=>(window as unknown as{fixture:Harness}).fixture.timers.size),0);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
